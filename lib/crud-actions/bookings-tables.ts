'use server';

import { and, desc, eq, gte, lte, or } from "drizzle-orm";
import { db } from "../db";
import { schema } from "../drizzle-schema";// Use alias to avoid conflict if 'schema' is general
import { BookingsTablesInterface } from "../definations";



// === Drizzle table schemas ===
const bookingsTable = schema.bookingsTables;
const users = schema.users;
const restaurantTables = schema.restaurantTables;


// === Constants ===
type BookingStatus = 'scheduled' | 'booked' | 'completed' | 'expired' | 'processing' | 'cancelled';



/**
 * === Fetch All Bookings with Related User and Table Info ===
 *
 * - Uses LEFT JOIN on `users` and `restaurantTables` via Drizzle ORM.
 * - Returns bookings enriched with user name/email and table number.
 * - Handles null/undefined fields gracefully.
 * 
 * @returns {Promise<BookingsTablesInterface[]>} List of booking records with joined user and table details.
 */
export const getAllBookingsTables = async (): Promise<BookingsTablesInterface[]> => {

  // === Query: Join bookings with users and restaurant tables ===
  const bookings = await db
    .select()
    .from(bookingsTable)
    .leftJoin(users, eq(bookingsTable.bookedByUserId, users.id))
    .leftJoin(restaurantTables, eq(bookingsTable.tableId, restaurantTables.id));

  // === Map and format result with normalize the values ===
  const finalData = bookings.map((data) => ({
    id: data.bookings_tables.id,
    tableId: String(data.bookings_tables.tableId),
    tableName: data.restaurant_tables?.table_number || null,
    customerName: data.bookings_tables.customerName,
    advancePaid: data.bookings_tables.advancePaid,
    status: data.bookings_tables.status,
    bookedByUserId: data.bookings_tables?.bookedByUserId,
    bookedByUserName: data.users?.name || null,
    bookedByUserEmail: data.users?.email || null,
    reservationStart: data.bookings_tables.reservationStart,
    reservationEnd: data.bookings_tables.reservationEnd,
    bookingDate: data.bookings_tables.bookingDate,
  }));

  // === Return normalized bookings array ===
  return finalData;
};



/**
 * === Synchronize Booking and Table Statuses ===
 *
 * Iterates over all bookings joined with their associated tables,
 * updating booking and table statuses based on time-based rules and business logic.
 * 
 * Key behaviors:
 * - Respects manual states like 'cancelled' and 'completed'.
 * - Handles grace periods for no-shows.
 * - Automatically promotes bookings through statuses: scheduled → booked → processing.
 * - Frees up tables when bookings expire or are cancelled.
 *
 * Status sync logic covers:
 * - CASE 00: Far future → set to 'scheduled'
 * - CASE 01: Starts within 30 mins → mark as 'booked'
 * - CASE 02: Now active → mark as 'booked'
 * - CASE 03: No-show grace period
 * - CASE 04: Completed/cancelled
 * - CASE 05: Processing override
 * - CASE 06: Upgrade to 'processing' if occupied
 * - CASE 07: Expired → mark as expired
 * 
 * @returns {Promise<void>} Resolves when all bookings and tables are synchronized.
 */
export async function syncBookingAndTableStatuses(): Promise<void> {
  const now = new Date();

  // === Fetch all bookings with related table info ===
  const bookings = await db
    .select()
    .from(bookingsTable)
    .leftJoin(restaurantTables, eq(bookingsTable.tableId, restaurantTables.id));

  // === Iterate over each booking record to apply sync logic ===
  for (const bookingData of bookings) {
    const booking = bookingData.bookings_tables;
    const table = bookingData.restaurant_tables;

    // === Skip if either booking or table is missing ===
    if (!booking || !table) continue;

    // === Parse dates and statuses ===
    const reservationStart = new Date(booking.reservationStart);
    const reservationEnd = new Date(booking.reservationEnd);
    const tableStatus = table.status;
    const bookingStatus = booking.status as BookingStatus;

    // === Define time thresholds ===
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
    const gracePeriodEnd = new Date(reservationEnd.getTime() + 2 * 60 * 60 * 1000);

    // === CASE 04: Skip finished or cancelled bookings, free table if cancelled ===
    if (bookingStatus === 'cancelled' || bookingStatus === 'completed') {
      if (bookingStatus === 'cancelled' && tableStatus !== 'available') {
        await db
          .update(restaurantTables)
          .set({ status: 'available' })
          .where(eq(restaurantTables.id, table.id));
      }
      continue;
    }

    // === CASE 05: Respect manual processing state if table is occupied ===
    if (table.status === 'occupied' && booking.status === 'processing') {
      continue; // Do nothing — respect manual state
    }

    // === CASE 06: Upgrade booking to 'processing' if table is occupied and booking is booked or scheduled ===
    if (
      table.status === 'occupied' &&
      (booking.status === 'booked' || booking.status === 'scheduled') &&
      reservationStart <= now &&
      reservationEnd >= now
    ) {
      await db
        .update(bookingsTable)
        .set({ status: 'processing' })
        .where(eq(bookingsTable.id, booking.id));

      continue; // Don't auto-change table status
    }

    // === CASE 03: Handle grace period for no-show bookings ===
    if (bookingStatus === 'booked' && tableStatus === 'booked') {
      if (now > reservationEnd && now <= gracePeriodEnd) {
        // Within grace period — keep statuses as-is
        continue;
      }
      if (now > gracePeriodEnd) {
        // Grace period expired — expire booking & free table
        await db
          .update(bookingsTable)
          .set({ status: 'expired' })
          .where(eq(bookingsTable.id, booking.id));

        await db
          .update(restaurantTables)
          .set({ status: 'available' })
          .where(eq(restaurantTables.id, table.id));

        continue;
      }
    }

    // === CASE 00: Booking far in future (>30 min) → keep or reset to 'scheduled' ===
    if (reservationStart > thirtyMinutesFromNow && bookingStatus !== 'scheduled') {
      await db
        .update(bookingsTable)
        .set({ status: 'scheduled' })
        .where(eq(bookingsTable.id, booking.id));

      continue;
    }

    // === CASE 01: Booking starts within 30 minutes and table is available → mark as 'booked' ===
    if (
      reservationStart > now &&
      reservationStart <= thirtyMinutesFromNow &&
      tableStatus === 'available'
    ) {
      if (bookingStatus !== 'booked') {
        await db
          .update(bookingsTable)
          .set({ status: 'booked' })
          .where(eq(bookingsTable.id, booking.id));
      }

      await db
        .update(restaurantTables)
        .set({ status: 'booked' })
        .where(eq(restaurantTables.id, table.id));

      continue;
    }

    // === CASE 02: Booking active now, table available → mark booking 'booked' and table 'booked' ===
    if (
      reservationStart <= now &&
      reservationEnd >= now &&
      tableStatus === 'available'
    ) {
      // Only update table status to 'booked'
      if (table.status !== 'booked') {
        await db
          .update(restaurantTables)
          .set({ status: 'booked' })
          .where(eq(restaurantTables.id, table.id));
      }

      // Booking stays 'booked', not 'processing' — wait for manual 'occupied'
      if (bookingStatus !== 'booked') {
        await db
          .update(bookingsTable)
          .set({ status: 'booked' })
          .where(eq(bookingsTable.id, booking.id));
      }

      continue;
    }

    // === CASE 07: Booking ended but not expired yet → mark expired and free table ===
    if (now > reservationEnd && bookingStatus !== 'expired') {
      await db
        .update(bookingsTable)
        .set({ status: 'expired' })
        .where(eq(bookingsTable.id, booking.id));

      if (tableStatus !== 'available') {
        await db
          .update(restaurantTables)
          .set({ status: 'available' })
          .where(eq(restaurantTables.id, table.id));
      }
    }
  }
}



/**
 * === Manually Check-In or Check-Out a Table & Associated Booking ===
 *
 * - On **check-in**:
 *   - Finds the nearest eligible booking for the table (status: 'booked' or 'scheduled').
 *   - Marks the booking as 'processing' if found.
 *   - Always updates the table status to 'occupied'.
 *
 * - On **check-out**:
 *   - Finds the current 'processing' booking for the table.
 *   - Marks the booking as 'completed'.
 *   - Always updates the table status to 'available'.
 *
 * @param tableId - The ID of the table being checked in/out.
 * @param mode - Either `'check-in'` or `'check-out'`.
 * @returns {Promise<void>} Resolves after status updates are applied.
 */
export async function updateTableAndBookingStatus(tableId: number, mode: 'check-in' | 'check-out') {

  // === Validate input ===
  if (!tableId) {
    console.error("Table ID is required to perform check-in/check-out.");
    return;
  }

  const now = new Date();

  // === CHECK-IN MODE ===
  if (mode === 'check-in') {
    // === Find valid upcoming or just-started booking ===
    const activeBookingResult = await db
      .select()
      .from(bookingsTable)
      .where(
        and(
          eq(bookingsTable.tableId, tableId),
          or(
            eq(bookingsTable.status, 'booked'),
            eq(bookingsTable.status, 'scheduled')
          ),
          lte(bookingsTable.reservationStart, new Date(now.getTime() + 30 * 60 * 1000)), // <- Allow check-in up to 30 min early
          gte(bookingsTable.reservationEnd, new Date(now.getTime() - 2 * 60 * 60 * 1000)) // <- Allow check-in up to 2 hours after reservation end
        )
      )
      .orderBy(desc(bookingsTable.reservationStart))
      .limit(1);

    const booking = activeBookingResult[0];

    // === Mark booking as 'processing' if found ===
    if (booking) {
      const result = await db
        .update(bookingsTable)
        .set({ status: 'processing' })
        .where(eq(bookingsTable.id, booking.id));

      if (result?.[0]?.affectedRows === 0) {
        console.warn(`Booking ID ${booking.id} was not updated to 'processing'.`);
      }
    }

    // === Always mark table as 'occupied' ===
    const tableUpdate = await db
      .update(restaurantTables)
      .set({ status: 'occupied' })
      .where(eq(restaurantTables.id, tableId));

    if (tableUpdate[0]?.affectedRows === 0) {
      console.warn(`No table found with ID ${tableId} to mark as 'occupied'.`);
    }

    // === CHECK-OUT MODE ===
  } else if (mode === 'check-out') {

    // === Find current processing booking ===
    const processingBookingResult = await db
      .select()
      .from(bookingsTable)
      .where(
        and(
          eq(bookingsTable.tableId, tableId),
          eq(bookingsTable.status, 'processing')
        )
      )
      .orderBy(desc(bookingsTable.reservationStart))
      .limit(1);

    const booking = processingBookingResult[0];

    // === Mark booking as 'completed' ===
    if (booking) {
      const result = await db
        .update(bookingsTable)
        .set({ status: 'completed' })
        .where(eq(bookingsTable.id, booking.id));

      if (result?.[0]?.affectedRows === 0) {
        console.warn(`Booking ID ${booking.id} was not updated to 'completed'.`);
      }
    }

    // === Always mark table as 'available' ===
    const tableUpdate = await db
      .update(restaurantTables)
      .set({ status: 'available' })
      .where(eq(restaurantTables.id, tableId));

    if (tableUpdate[0]?.affectedRows === 0) {
      console.warn(`No table found with ID ${tableId} to mark as 'available'.`);
    }
  }
}
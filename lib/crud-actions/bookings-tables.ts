// use server';

import { and, desc, eq, gte, lte, or } from "drizzle-orm";
import { db } from "../db";
import { schema } from "../drizzle-schema";// Use alias to avoid conflict if 'schema' is general
import { BookingsTablesInterface } from "../definations";

const bookingsTable = schema.bookingsTables;
const users = schema.users;
const restaurantTables = schema.restaurantTables;

export const getAllBookingsTables = async (): Promise<BookingsTablesInterface[]> => {
  const bookings = await db
    .select()
    .from(bookingsTable)
    .leftJoin(users, eq(bookingsTable.bookedByUserId, users.id))
    .leftJoin(restaurantTables, eq(bookingsTable.tableId, restaurantTables.id));

  const finalData = bookings.map((data) => {

    return {
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
    };
  });

  return finalData;
};

type BookingStatus = 'scheduled' | 'booked' | 'completed' | 'expired' | 'processing' | 'cancelled';

export async function syncBookingAndTableStatuses() {
  const now = new Date();

  const bookings = await db
    .select()
    .from(bookingsTable)
    .leftJoin(restaurantTables, eq(bookingsTable.tableId, restaurantTables.id));

  for (const bookingData of bookings) {
    const booking = bookingData.bookings_tables;
    const table = bookingData.restaurant_tables;

    if (!booking || !table) continue;

    const reservationStart = new Date(booking.reservationStart);
    const reservationEnd = new Date(booking.reservationEnd);
    const tableStatus = table.status;
    const bookingStatus = booking.status as BookingStatus;

    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
    const gracePeriodEnd = new Date(reservationEnd.getTime() + 2 * 60 * 60 * 1000);

    // === CASE 04: Skip manual/finished bookings ===
    if (bookingStatus === 'cancelled' || bookingStatus === 'completed') {
      // Optional: free table if cancelled
      if (bookingStatus === 'cancelled' && tableStatus !== 'available') {
        await db
          .update(restaurantTables)
          .set({ status: 'available' })
          .where(eq(restaurantTables.id, table.id));
      }
      continue;
    }

    // === CASE 02: Table is OCCUPIED ===
    if (table.status === 'occupied' && booking.status === 'processing') {
      continue; // Do nothing — respect manual state
    }

    // CASE: If table is 'occupied' and booking is 'booked' or 'scheduled', upgrade booking to 'processing'
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

    // --- CASE 02: Handle grace period for no-show ---
    if (bookingStatus === 'booked' && tableStatus === 'booked') {
      if (now > reservationEnd && now <= gracePeriodEnd) {
        // Within grace period — do nothing, keep statuses
        continue;
      }
      if (now > gracePeriodEnd) {
        // Grace period expired — mark booking expired & free table
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

    // === CASE 00: Booking is far in future (> 30 min) → keep it 'scheduled' ===
    if (
      reservationStart > thirtyMinutesFromNow &&
      bookingStatus !== 'scheduled'
    ) {
      await db
        .update(bookingsTable)
        .set({ status: 'scheduled' })
        .where(eq(bookingsTable.id, booking.id));
      continue;
    }

    // === CASE 01: Booking starts in 30 min and table is available → mark 'booked' ===
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

    // === CASE: Booking is currently active and table is still available → mark 'processing' and table 'booked' ===
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

    // === CASE: Booking time has ended and still not completed → mark expired + free table ===
    if (
      now > reservationEnd &&
      bookingStatus !== 'expired'
    ) {
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

export async function updateTableAndBookingStatus(tableId: number, mode: 'check-in' | 'check-out') {
  if (!tableId) {
    console.error("Table ID is required.");
    return;
  }

  const now = new Date();

  if (mode === 'check-in') {
    // === CASE: Check-in → find upcoming or just-started booking within buffer ===
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
          // Allow check-in 30 minutes early
          lte(bookingsTable.reservationStart, new Date(now.getTime() + 30 * 60 * 1000)),
          // Allow 2-hour grace period after reservation end
          gte(bookingsTable.reservationEnd, new Date(now.getTime() - 2 * 60 * 60 * 1000))
        )
      )
      .orderBy(desc(bookingsTable.reservationStart))
      .limit(1);

    const booking = activeBookingResult[0];

    // === CASE: Valid booking found → mark it as 'processing' ===
    if (booking) {
      const result = await db
        .update(bookingsTable)
        .set({ status: 'processing' })
        .where(eq(bookingsTable.id, booking.id));

      if (result?.[0]?.affectedRows === 0) {
        console.warn(`⚠️ Booking ID ${booking.id} was not updated to 'processing'.`);
      }
    }

    // === CASE: Always mark table as 'occupied' ===
    const tableUpdate = await db
      .update(restaurantTables)
      .set({ status: 'occupied' })
      .where(eq(restaurantTables.id, tableId));

    if (tableUpdate[0]?.affectedRows === 0) {
      console.warn(`⚠️ No table found with ID ${tableId} to mark as 'occupied'.`);
    }

  } else if (mode === 'check-out') {
    // === CASE: Check-out → find current 'processing' booking for the table ===
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

    // === CASE: Valid processing booking found → mark as 'completed' ===
    if (booking) {
      const result = await db
        .update(bookingsTable)
        .set({ status: 'completed' })
        .where(eq(bookingsTable.id, booking.id));

      if (result?.[0]?.affectedRows === 0) {
        console.warn(`⚠️ Booking ID ${booking.id} was not updated to 'completed'.`);
      }
    }

    // === CASE: Always mark table as 'available' ===
    const tableUpdate = await db
      .update(restaurantTables)
      .set({ status: 'available' })
      .where(eq(restaurantTables.id, tableId));

    if (tableUpdate[0]?.affectedRows === 0) {
      console.warn(`⚠️ No table found with ID ${tableId} to mark as 'available'.`);
    }
  }
}






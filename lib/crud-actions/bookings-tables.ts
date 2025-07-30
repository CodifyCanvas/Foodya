// use server';

import { eq } from "drizzle-orm";
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
      bookedByUserEmail: data.users?.email  || null,
      reservationStart: data.bookings_tables.reservationStart,
      reservationEnd: data.bookings_tables.reservationEnd,
      bookingDate: data.bookings_tables.bookingDate,
    };
  });

  return finalData;
};


export async function syncBookingAndTableStatuses() {
  const now = new Date();

  // Fetch all bookings with their tables
  const bookings = await db
    .select()
    .from(bookingsTable)
    .leftJoin(restaurantTables, eq(bookingsTable.tableId, restaurantTables.id));

  for (const bookingData of bookings) {
    const reservationStart = bookingData.bookings_tables.reservationStart;
    const reservationEnd = bookingData.bookings_tables.reservationEnd;

    const { bookingStatus, tableStatus } = getStatusUpdate(reservationStart, reservationEnd, now);

    if (bookingData.bookings_tables.status !== bookingStatus) {
      await db
        .update(bookingsTable)
        .set({ status: bookingStatus })
        .where(eq(bookingsTable.id, bookingData.bookings_tables.id));
    }

    if (bookingData.restaurant_tables?.status !== tableStatus) {
      await db
        .update(restaurantTables)
        .set({ status: tableStatus })
        .where(eq(restaurantTables.id, bookingData.bookings_tables.tableId));
    }
  }
}

// Reuse the same getStatusUpdate function here:
function getStatusUpdate(reservationStart: Date, reservationEnd: Date, now = new Date()) {
  const halfHourFromNow = new Date(now.getTime() + 30 * 60 * 1000);

  if (reservationEnd < now) {
    return { bookingStatus: 'expired', tableStatus: 'available' };
  } else if (reservationStart <= now && reservationEnd >= now) {
    return { bookingStatus: 'completed', tableStatus: 'occupied' };
  } else if (reservationStart > now && reservationStart <= halfHourFromNow) {
    return { bookingStatus: 'booked', tableStatus: 'booked' };
  } else {
    return { bookingStatus: 'scheduled', tableStatus: 'available' };
  }
}
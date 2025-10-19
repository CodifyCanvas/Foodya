"use server";

import { schema } from "@/lib/drizzle-schema";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { RestaurantTablesInterface } from '@/lib/definations'



// === Drizzle table schemas ===
const Table = schema.restaurantTables;
const Booking = schema.bookingsTables;



/**
 * === Fetch All Users with Their Roles ===
 *
 * - Uses LEFT JOIN on `roles` via Drizzle ORM.
 * - Normalizes null fields (e.g., name, is_active, role_name, created_at).
 * 
 * @returns {Promise<RestaurantTablesInterface[]>} List of users with role info.
 */
export const getAllActiveTable = async (): Promise<RestaurantTablesInterface[]> => {

  // === Query: Fetch Resturant Table That is Active (not deleted) ===
  const result = await db
    .select({
      id: Table.id,
      table_number: Table.table_number,
      status: Table.status,
    })
    .from(Table)
    .where(eq(Table.isDeleted, false));

  // === Always return an array (never undefined/null) ===
  return result;
};



/**
 * === Soft Delete a Restaurant Table ===
 *
 * Rules:
 * - If there are bookings with status:
 *   - "scheduled", "booked" → Block deletion
 *   - "processing" → Block deletion
 *   - "completed", "expired", "cancelled" → Allow soft delete
 */
export const deleteRestaurantTable = async (id: number): Promise<{
  success: boolean;
  message: string;
}> => {
  try {

    // === Fetch all Bookings that match the tableId ===
    const relatedBookings = await db
      .select({
        id: Booking.id,
        status: Booking.status,
      })
      .from(Booking)
      .where(eq(Booking.tableId, id));

    // === Check bookings it is any use ===
    const blockingBooking = relatedBookings.find((booking) =>
      ["scheduled", "booked", "processing"].includes(booking.status)
    );

    // === return accoriding to check ===
    if (blockingBooking) {

      // === Booking is in "Scheduled" or "Booked" ===
      if (["scheduled", "booked"].includes(blockingBooking.status)) {
        return {
          success: false,
          message: "This table has an active booking. Please cancel the booking first.",
        };
      }

      // === Booking is in "Processing" ===
      if (blockingBooking.status === "processing") {
        return {
          success: false,
          message: "This table is currently in use. Please complete the booking before deleting.",
        };
      }
    }

    // === Perform soft delete ===
    await db
      .update(Table)
      .set({ isDeleted: true })
      .where(eq(Table.id, id));

    return {
      success: true,
      message: "Table deleted successfully!",
    };
  } catch (error) {
    console.error("Failed to soft delete restaurant table:", error);
    return {
      success: false,
      message: "An error occurred while trying to delete the table.",
    };
  }
};
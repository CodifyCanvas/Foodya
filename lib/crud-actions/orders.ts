'use server';

import { db } from "@/lib/db";
import { eq, desc, and } from "drizzle-orm";
import { schema } from "../drizzle-schema";



// === Drizzle table schemas ===
const orders = schema.ordersTable
const invoices = schema.InvoicesTable
const order_items = schema.orderItemsTable;
const bookings = schema.bookingsTables;
const restaurant_tables = schema.restaurantTables;



/**
 * Get the latest unpaid order for a specific table, along with its items and active booking.
 *
 * @param tableId - The ID of the table.
 * @returns Order data or empty array if no unpaid order found.
 */
export async function getAllOrdersByTable(tableId: number) {
  if (!tableId) return [];

  // === Step 1: Fetch latest order for the given table ===
  const [latestOrder] = await db
    .select()
    .from(orders)
    .where(eq(orders.tableId, tableId))
    .orderBy(desc(orders.createdAt))
    .limit(1);

  if (!latestOrder) return [];

  // === Step 2: Check for paid invoice on that order ===
  const [invoice] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.orderId, latestOrder.id));

  if (invoice && invoice.isPaid) {
    return [];
  }

  // === Step 3: Fetch associated order items (snapshots) ===
  const orderItems = await db
    .select({
      id: order_items.id,
      menuItemImage: order_items.menuItemImage,
      menuItemId: order_items.menuItemId,
      menuItemName: order_items.menuItemName,
      menuItemOptionId: order_items.menuItemOptionId,
      menuItemOptionName: order_items.menuItemOptionName,
      quantity: order_items.quantity,
      price: order_items.price,
    })
    .from(order_items)
    .where(eq(order_items.orderId, latestOrder.id));

  // === Step 4: Fetch active booking (if table is occupied & booking is processing) ===
  const [booking] = await db
    .select({
      customerName: bookings.customerName,
      advancePaid: bookings.advancePaid,
    })
    .from(bookings)
    .innerJoin(restaurant_tables, eq(bookings.tableId, restaurant_tables.id))
    .where(
      and(
        eq(bookings.tableId, tableId),
        eq(restaurant_tables.status, 'occupied'),
        eq(bookings.status, 'processing')
      )
    )
    .orderBy(desc(bookings.bookingDate))
    .limit(1);

  // === Step 5: Return compiled result ===
  return {
    order: latestOrder,
    items: orderItems,
    booking: booking ?? null,
  };
}
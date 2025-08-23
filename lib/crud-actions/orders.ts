import { db } from "@/lib/db"; // your drizzle config
import { eq, desc, and } from "drizzle-orm";
import { schema } from "../drizzle-schema";

const orders = schema.ordersTable
const invoices = schema.InvoicesTable
const order_items = schema.orderItemsTable;
const bookings = schema.bookingsTables;
const restaurant_tables = schema.restaurantTables;

export async function getAllOrdersByTable(tableId: number) {
  if (!tableId) return [];

  // Step 1: Get the latest order for the table
  const [latestOrder] = await db
    .select()
    .from(orders)
    .where(eq(orders.tableId, tableId))
    .orderBy(desc(orders.createdAt))
    .limit(1);

  if (!latestOrder) return [];

  // Step 2: Check if there's a paid invoice for this order
  const [invoice] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.orderId, latestOrder.id));

  if (invoice && invoice.isPaid) {
    return [];
  }

 // 3. Get order items (from snapshot fields only)
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

  // Step 4: Check for ongoing booking for the table

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

  return {
    order: latestOrder,
    items: orderItems,
    booking: booking ?? null,
  };
}



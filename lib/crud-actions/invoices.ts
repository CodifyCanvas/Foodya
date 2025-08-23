'use server';

import { eq } from 'drizzle-orm';
import { db } from '../db';
import { schema } from '../drizzle-schema';

const invoices = schema.InvoicesTable;
const orders = schema.ordersTable;
const orderItems = schema.orderItemsTable;
const users = schema.users;

export const fetchInvoice = async (invoiceId: number) => {
  if (!invoiceId) return null;

  // 1. Fetch the invoice
  const invoiceData = await db
    .select()
    .from(invoices)
    .where(eq(invoices.id, invoiceId));

  const invoice = invoiceData[0];
  if (!invoice) return null;

  // 2. Fetch order related to this invoice
  const orderData = await db
    .select()
    .from(orders)
    .where(eq(orders.id, invoice.orderId));

  const order = orderData[0];
  if (!order) return null;

  // 3. Fetch order items
  const orderItemsData = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));

  // 4. Fetch user who generated the invoice
  const userData = await db
    .select({ id: users.id, name: users.name, email : users.email })
    .from(users)
    .where(eq(users.id, invoice.generatedByUserId));

  const user = userData[0];

  // 5. Combine and return all the data
  return {
    invoice,
    order,
    items: orderItemsData,
    generatedBy: user,
  };
};

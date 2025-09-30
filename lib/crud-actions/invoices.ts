'use server';

import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { schema } from '../drizzle-schema';
import { deleteData, insertData, updateData } from './general-actions';
import { CartItem } from '@/hooks/use-order-cart';
import { InvoiceOrderItem } from '@/app/restaurant/(restaurant)/invoices/form';

const invoices = schema.InvoicesTable;
const orders = schema.ordersTable;
const orderItems = schema.orderItemsTable;
const users = schema.users;
const roles = schema.roles;
const transactionsTable = schema.transactionsTable;

// Get Specific Invoice (invoice + order + order items) where invoiceId
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
  const raworderItemsData = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));

  // 4. Fetch user who generated the invoice
  const userData = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, invoice.generatedByUserId));

  const user = userData[0];

  const formattedOrder = {
    ...order,
    tableId: order.tableId !== null ? String(order.tableId) : "",
    waiterId: order.waiterId !== null ? String(order.waiterId) : "",
  };

  const orderItemsData = raworderItemsData.map((item) => (
    {
      ...item,
      menuItemId: String(item.menuItemId),
      menuItemOptionId: (item.menuItemOptionId !== null) ? String(item.menuItemOptionId) : null,
    }
  ))

  // 5. Combine and return all the data
  return {
    invoice,
    order: formattedOrder,
    items: orderItemsData,
    generatedBy: user,
  };
};

// Get All Users where role === roleName (that is given when the function calls)
export const getAllWaiters = async (roleName: string) => {
  // === Validate Input ===
  if (!roleName) return null;

  // === Query Users by Role Name (Join users + roles) ===
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      isActive: users.is_active,
      role: roles.role,
    })
    .from(users)
    .leftJoin(roles, eq(roles.id, users.role_id))
    .where(eq(roles.role, roleName));

  // === Return Matched Users ===
  return result;
};

// Handles full invoice creation within a transaction
export async function upsertInvoiceOrderItemsTx(parsed: any, userId: number, mode: 'insert' | 'update') {
  if (!parsed) throw new Error("Data Fields is not provided");
  if (!userId) throw new Error("Please Provide The UserId");

  if (mode === 'insert') {
    return await db.transaction(async (tx) => {

      // === Insert into ordersTable ===
      const orderResult = await insertData("ordersTable", {
        tableId: parsed.tableId ? Number(parsed.tableId) : null,
        waiterId: parsed.waiterId ? Number(parsed.waiterId) : null,
        orderType: parsed.orderType.trim(),
        status: 'completed',
        createdAt: parsed.orderCreatedAt,
      }, tx);

      const newOrderId = orderResult.insertId;

      // === Defensive check: Make sure order insert succeeded ===
      if (!newOrderId) throw new Error("Order creation failed");

      // === Insert associated order items (if any) ===
      if (parsed.orderItems?.length) {
        const insertPromises = parsed.orderItems.map((item: any) =>
          insertData("orderItemsTable", {
            orderId: newOrderId,
            menuItemImage: item.menuItemImage || null,
            menuItemId: Number(item.menuItemId),
            menuItemName: item.menuItemName,
            menuItemOptionId: item.menuItemOptionId !== null ? Number(item.menuItemOptionId) : null,
            menuItemOptionName: item.menuItemOptionName || null,
            quantity: item.quantity,
            price: item.price,
          }, tx)
        );
        await Promise.all(insertPromises);
      }

      // === Insert final invoice entry ===
      const invoiceId = await insertData("InvoicesTable", {
        orderId: newOrderId,
        generatedByUserId: Number(userId),
        customerName: typeof parsed.customerName === "string" && parsed.customerName.trim() ? parsed.customerName.trim() : undefined,
        subTotalAmount: parsed.subTotalAmount,
        discount: parsed.discount ?? "0.00",
        totalAmount: parsed.totalAmount,
        advancePaid: parsed.advancePaid ?? "0.00",
        grandTotal: parseFloat(parsed.grandTotal) < 0 ? "0.00" : parseFloat(parsed.grandTotal).toFixed(2),
        isPaid: parsed.isPaid,
        paymentMethod: parsed.paymentMethod,
      }, tx);

      // === Insert final invoice Transaction entry ===
      if (parsed.isPaid) {
        await insertData("transactionsTable", {
          categoryId: 2,
          title: 'Customer Invoice',
          amount: parseFloat(parsed.grandTotal) < 0 ? "0.00" : parseFloat(parsed.grandTotal).toFixed(2),
          type: 'credit',
          sourceType: 'invoice',
          sourceId: invoiceId.insertId
        }, tx)
      }

      // === Return Invoice ID to route ===
      return invoiceId.insertId;
    });
  } else if (mode === 'update') {
    if (!parsed.orderId || !parsed.invoiceId) {
      throw new Error("Missing orderId or invoiceId for update mode");
    }
    return await db.transaction(async (tx) => {

      // === Update into ordersTable ===
      await updateData("ordersTable", 'id', parsed.orderId, {
        tableId: parsed.tableId ? Number(parsed.tableId) : null,
        waiterId: parsed.waiterId ? Number(parsed.waiterId) : null,
        orderType: parsed.orderType.trim(),
        createdAt: parsed.orderCreatedAt,
      }, tx);

      // ✅ Delete existing options
      await deleteData("orderItemsTable", "orderId", parsed.orderId, tx);

      // === Insert associated order items (if any) ===
      if (parsed.orderItems?.length > 0) {
        const insertPromises = parsed.orderItems.map((item: any) =>
          insertData("orderItemsTable", {
            orderId: parsed.orderId,
            menuItemImage: item.menuItemImage || null,
            menuItemId: Number(item.menuItemId),
            menuItemName: item.menuItemName,
            menuItemOptionId: item.menuItemOptionId != null ? Number(item.menuItemOptionId) : null,
            menuItemOptionName: item.menuItemOptionName ?? null,
            quantity: item.quantity,
            price: item.price,
          }, tx)
        );
        await Promise.all(insertPromises);
      }

      // === Update final invoice entry ===
      await updateData("InvoicesTable", "id", parsed.invoiceId, {
        customerName: typeof parsed.customerName === "string" && parsed.customerName.trim() ? parsed.customerName.trim() : undefined,
        subTotalAmount: parsed.subTotalAmount,
        discount: parsed.discount ?? "0.00",
        totalAmount: parsed.totalAmount,
        advancePaid: parsed.advancePaid ?? "0.00",
        grandTotal: parseFloat(parsed.grandTotal) < 0 ? "0.00" : parseFloat(parsed.grandTotal).toFixed(2),
        isPaid: parsed.isPaid,
        paymentMethod: parsed.paymentMethod,
      }, tx);

      // === Handle transaction based on isPaid
      if (parsed.isPaid) {
        const amount = parseFloat(parsed.grandTotal) < 0 ? "0.00" : parseFloat(parsed.grandTotal).toFixed(2);

        // CASE 01: check if transaction exists
        const existingTransaction = await tx.select()
          .from(transactionsTable)
          .where(and(eq(transactionsTable.sourceType, 'invoice'),eq(transactionsTable.sourceId, parsed.invoiceId)))
          .then(rows => rows[0]);

        // CASE 02: check if transaction exists is true then update it
        if (existingTransaction) {
          await tx.update(transactionsTable).set({
            amount,
          }).where(and(eq(transactionsTable.sourceType, 'invoice'), eq(transactionsTable.sourceId, parsed.invoiceId)));

        } else {
          // CASE 03: check if transaction is not exists then insert
          await insertData("transactionsTable", {
            categoryId: 2,
            title: 'Customer Invoice',
            amount,
            type: 'credit',
            sourceType: 'invoice',
            sourceId: parsed.invoiceId
          }, tx);
        }
      } else {
        // CASE 04: if isPaid is false then delete the existing transaction
        await tx.delete(transactionsTable).where(and(eq(transactionsTable.sourceType, 'invoice'), eq(transactionsTable.sourceId, parsed.invoiceId)));
      }

      // === Return invoice ID to route ===
      return { invoiceId: parsed.invoiceId };
    });
  } else {
    throw new Error("Mode is Not Provided or valid");
  }
}


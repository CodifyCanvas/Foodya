import { auth } from "@/auth";
import { CartItem } from "@/hooks/use-order-cart";
import { updateTableAndBookingStatus } from "@/lib/crud-actions/bookings-tables";
import {  checkDuplicate, deleteData, getAllData, insertData } from "@/lib/crud-actions/general-actions"
import { fetchInvoice, getAllWaiters, upsertInvoiceOrderItemsTx } from "@/lib/crud-actions/invoices";
import { getAllMenuItems } from "@/lib/crud-actions/menu-items";
import { mapToLabelValue } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server"

/* ======================================
  === [GET] Fetch All Invoices from DB ===
========================================= */
const path = '/api/invoices'
export async function GET() {
  try {
    const session = await auth()
    const userId = session?.user.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const invoices = await getAllData("InvoicesTable");

    // Fetch menu items
    const menuItems = await getAllMenuItems();

    const rawTables = await getAllData("restaurantTables")
    const tables = mapToLabelValue(rawTables, { label: 'table_number', value: 'id' })

    // Fetch all users with the role 'waiter'
    const rawWaiter = await getAllWaiters('waiter')

    // Map waiter users to label-value-role objects for select Input
    const waiters = (rawWaiter ?? []).map((user) => ({
    label: user.name ?? "Unknown",
    value: String(user.id),
    role: user.role ?? null,
  }))

    return NextResponse.json({invoices, menuItems, tables, waiters}, { status: 200 })
  } catch (error) {
    console.error(`[GET ${path}] Failed to fetch order and its items:`, error)

    return NextResponse.json(
      { error: "Failed to fetch order and items. Please try again later." },
      { status: 500 }
    )
  }
}

/* ========================================
=== [POST] Create a New Invoice Entry ===
========================================= */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const dineInInvoice = body?.invoice;
    const orderItems = body?.items;

    // ✅ DINE-IN
    if (dineInInvoice?.orderType === "dine_in") {
      // Prevent duplicate invoice
      const isDuplicate = await checkDuplicate("InvoicesTable", "orderId", dineInInvoice.orderId);
      if (isDuplicate) {
        return NextResponse.json(
          { message: "This order invoice already exists." },
          { status: 409 }
        );
      }

      if (!dineInInvoice?.orderId) {
        return NextResponse.json({ message: "Order ID is required for dine-in" }, { status: 400 });
      }

      // Merge into a single payload
      const parsed = {
        ...dineInInvoice,
        orderItems,
      };

      // 🔁 Use the transactional function
      await upsertInvoiceOrderItemsTx(parsed, Number(userId), "update");

      // ✅ Update table status
      await updateTableAndBookingStatus(Number(dineInInvoice.tableId), "check-out");

      return NextResponse.json({ message: "Invoice created successfully." }, { status: 201 });
    }

    // ✅ TAKEAWAY / DRIVE-THRU
    const quickOrder = body?.order;
    if (quickOrder?.orderType === "takeaway" || quickOrder?.orderType === "drive_thru") {
      const parsed = {
        ...quickOrder,
        orderItems,
      };

      const result = await upsertInvoiceOrderItemsTx(parsed, Number(userId), "insert");

      return NextResponse.json(
        { message: "Invoice created successfully.", invoiceId: result},
        { status: 201 }
      );
    }

    return NextResponse.json({ message: "Order Type is wrong or missing." }, { status: 400 });
  } catch (error) {
    console.error(`[POST /api/invoices] Invoice creation failed:`, error);
    return NextResponse.json(
      { error: "An unexpected error occurred while creating the order & invoice. Please try again later." },
      { status: 500 }
    );
  }
}
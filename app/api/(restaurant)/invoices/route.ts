import { auth } from "@/auth";
import { updateTableAndBookingStatus } from "@/lib/crud-actions/bookings-tables";
import { checkDuplicate, getAllData } from "@/lib/crud-actions/general-actions";
import { getAllWaiters, upsertInvoiceOrderItemsTx } from "@/lib/crud-actions/invoices";
import { getAllMenuItems } from "@/lib/crud-actions/menu-items";
import { getAllActiveTable } from "@/lib/crud-actions/restaurant-tables";
import { mapToLabelValue } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";



const path = '/api/invoices';



/* ===============================================
=== [GET] Fetch All Invoices with Related Data ===
=============================================== */
export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user.id

    // === Authenticate User ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Fetch invoices and related data ===
    const invoices = await getAllData("InvoicesTable");
    const menuItems = await getAllMenuItems();
    const rawTables = await getAllActiveTable();
    const rawWaiter = await getAllWaiters('waiter');

    const tables = mapToLabelValue(rawTables, {
      label: 'table_number',
      value: 'id'
    });

    const waiters = (rawWaiter ?? []).map((user) => ({
      label: user.name ?? "Unknown",
      value: String(user.id),
      role: user.role ?? null,
    }));

    return NextResponse.json({ invoices, menuItems, tables, waiters }, { status: 200 });
  } catch (error) {
    console.error(`[GET ${path}] Failed to fetch invoices and related data:`, error);

    return NextResponse.json(
      { error: "Failed to fetch invoices. Please try again later." },
      { status: 500 }
    );
  }
}



/* ====================================================
=== [POST] Create a New Invoice Based on Order Type ===
==================================================== */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user.id;

    // === Authenticate User ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const dineInInvoice = body?.invoice;
    const orderItems = body?.items;

    console.log(body);

    // === DINE-IN Order Invoice ===
    if (dineInInvoice?.orderType === "dine_in") {

      if (!dineInInvoice?.orderId) {
        return NextResponse.json({ error: "Order ID is required for dine-in." }, { status: 400 });
      }

      // === Prevent duplicate invoice ===
      const isDuplicate = await checkDuplicate("InvoicesTable", "orderId", dineInInvoice.orderId);
      if (isDuplicate) {
        return NextResponse.json(
          { error: "This order invoice already exists." },
          { status: 409 }
        );
      }

      // === Merge into a single payload ===
      const parsed = {
        ...dineInInvoice,
        orderItems,
      };

      await upsertInvoiceOrderItemsTx(parsed, Number(userId), "insert");

      // Set table and booking status to "check-out"
      await updateTableAndBookingStatus(Number(dineInInvoice.tableId), "check-out");

      return NextResponse.json({ message: "Invoice created successfully." }, { status: 201 });
    }

    // === TAKEAWAY / DRIVE-THRU Orders ===
    const quickOrder = body?.order;
    if (quickOrder?.orderType === "takeaway" || quickOrder?.orderType === "drive_thru") {
      const parsed = {
        ...quickOrder,
        orderItems,
      };

      const invoiceId = await upsertInvoiceOrderItemsTx(parsed, Number(userId), "insert");

      return NextResponse.json(
        { message: "Invoice created successfully.", invoiceId },
        { status: 201 }
      );
    }

    return NextResponse.json({ error: "Invalid or missing order type." }, { status: 400 });
  } catch (error) {
    console.error(`[POST ${path}] Invoice creation failed:`, error);

    return NextResponse.json(
      { error: "An unexpected error occurred while creating the invoice. Please try again later." },
      { status: 500 }
    );
  }
}
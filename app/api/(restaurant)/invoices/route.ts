import { auth } from "@/auth";
import { CartItem } from "@/hooks/use-order-cart";
import { updateTableAndBookingStatus } from "@/lib/crud-actions/bookings-tables";
import {  checkDuplicate, deleteData, insertData } from "@/lib/crud-actions/general-actions"
import { fetchInvoice } from "@/lib/crud-actions/invoices";
import { NextRequest, NextResponse } from "next/server"

/* ======================================
  === [GET] Fetch All Menu and Its items from DB ===
========================================= */
const path = '/api/invoices'
export async function GET() {
  try {
    const session = await auth()
    const userId = session?.user.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const orders = await fetchInvoice(7);

    return NextResponse.json( orders, { status: 200 })
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
    // === Authenticate the user session ===
    const session = await auth();
    const userId = session?.user.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Parse request body ===
    const body = await req.json();
    const dineInInvoice = body?.invoice;
    const orderItems = body?.items;

    // === Case: Dine-In Invoice Creation ===
    if (dineInInvoice?.orderType === "dine_in") {

      // === Prevent duplicate invoice for the same order ===
      const isDuplicate = await checkDuplicate("InvoicesTable", "orderId", dineInInvoice.orderId);

      if (isDuplicate) {
        return NextResponse.json(
          { message: "This order invoice already exists." },
          { status: 409 }
        );
      }

      // === Validate required fields ===
      if (!dineInInvoice?.orderId) {
        return NextResponse.json(
          { message: "Order ID is required for dine-in" },
          { status: 400 }
        );
      }

      // === Delete previous items for this order (if any) ===
      await deleteData("orderItemsTable", "orderId", dineInInvoice.orderId);

      // === Insert new order items ===
      if (orderItems?.length > 0) {
        const itemInserts = orderItems.map((item: CartItem) =>
          insertData("orderItemsTable", {
            orderId: dineInInvoice.orderId,
            menuItemImage: item.menuItemImage,
            menuItemId: item.menuItemId,
            menuItemName: item.menuItemName,
            menuItemOptionId: item.menuItemOptionId,
            menuItemOptionName: item.menuItemOptionName,
            quantity: item.quantity,
            price: item.price.toFixed(2),
          })
        );

        await Promise.all(itemInserts);
      }

      // === Insert invoice entry ===
      await insertData("InvoicesTable", {
        orderId: dineInInvoice.orderId,
        customerName: typeof dineInInvoice.customerName === "string" && dineInInvoice.customerName.trim() ? dineInInvoice.customerName.trim() : undefined,
        subTotalAmount: dineInInvoice.subTotalAmount,
        discount: dineInInvoice.discount,
        totalAmount: dineInInvoice.totalAmount,
        advancePaid: dineInInvoice.advancePaid ?? "0.00",
        grandTotal: parseFloat(dineInInvoice.grandTotal) < 0 ? "0.00" : parseFloat(dineInInvoice.grandTotal).toFixed(2),
        isPaid: true,
        generatedByUserId: Number(userId),
        paymentMethod: dineInInvoice.paymentMethod,
      });

      // === Update table and booking status ===
      await updateTableAndBookingStatus(Number(dineInInvoice.tableId), "check-out");

      return NextResponse.json(
        { message: "Invoice created successfully." },
        { status: 201 }
      );
    }

    // === Case: Takeaway or Drive-Thru Invoice Creation ===
    const quickOrder = body?.order;

    if (quickOrder?.orderType === "takeaway" || quickOrder?.orderType === "drive_thru") {

      // === Create order first ===
      const orderResult = await insertData("ordersTable", {
        tableId: null,
        waiterId: Number(userId),
        orderType: quickOrder.orderType.trim(),
      });

      const newOrderId = orderResult.insertId;

      if (!newOrderId) {
        return NextResponse.json({ error: "Failed to create order." }, { status: 500 });
      }

      // === Insert associated order items ===
      if (orderItems?.length > 0) {
        const orderItemInserts = orderItems.map((item: CartItem) =>
          insertData("orderItemsTable", {
            orderId: newOrderId,
            menuItemImage: item.menuItemImage || null,
            menuItemId: item.menuItemId,
            menuItemName: item.menuItemName,
            menuItemOptionId: item.menuItemOptionId,
            menuItemOptionName: item.menuItemOptionName || null,
            quantity: item.quantity,
            price: item.price.toFixed(2),
          })
        );

        await Promise.all(orderItemInserts);
      }

      // === Insert invoice for quick order ===
      const invoiceResult = await insertData("InvoicesTable", {
        orderId: newOrderId,
        customerName: typeof quickOrder.customerName === "string" && quickOrder.customerName.trim() ? quickOrder.customerName.trim() : undefined,
        subTotalAmount: quickOrder.subTotalAmount,
        discount: quickOrder.discount,
        totalAmount: quickOrder.totalAmount,
        advancePaid: "0.00",
        grandTotal: parseFloat(quickOrder.grandTotal) < 0 ? "0.00" : parseFloat(quickOrder.grandTotal).toFixed(2),
        isPaid: true,
        generatedByUserId: Number(userId),
        paymentMethod: quickOrder.paymentMethod,
      });

      return NextResponse.json(
        { message: "Invoice created successfully.", invoiceId: invoiceResult.insertId },
        { status: 201 }
      );
    }

    // === Invalid or missing order type ===
    return NextResponse.json(
      { message: "Order Type is wrong or missing." },
      { status: 400 }
    );
  } catch (error) {
    console.error(`[POST /api/invoices] Invoice creation failed:`, error);
    return NextResponse.json(
      { error: "An unexpected error occurred while creating the order & invoice. Please try again later.", }, 
      { status: 500 }
    );
  }
}



/* =======================================================
=== [PUT] Update an Existing Menu Item and Its Options ===
======================================================= */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Parse request body ===
    const body = await req.json();

    // === Validate request body using Zod schema ===
    const { items, orderDetail } = body;

    if (!orderDetail || items.length === 0) {
      return NextResponse.json({ error: "Missing Order Details OR at least one item are required." }, { status: 400 });
    }

    // === Delete all existing options for the Order items ===
    await deleteData('orderItemsTable', 'orderId', orderDetail.id);

    // === Insert options if provided ===
    if (items && items.length > 0 && orderDetail.id) {
      const optionInsertPromises = items.map((item : CartItem) =>
        insertData("orderItemsTable", {
          orderId: orderDetail.id,
          menuItemImage: item.menuItemImage,
          menuItemId: item.menuItemId,
          menuItemName: item.menuItemName,
          menuItemOptionId: item.menuItemOptionId,
          menuItemOptionName: item.menuItemOptionName,
          quantity: item.quantity,
          price: item.price.toFixed(2),
        })
      );

      // Await all inserts
      await Promise.all(optionInsertPromises);
    }

    return NextResponse.json({ message: 'Order updated successfully.' }, { status: 202 });
  } catch (error) {
    console.error(`[PUT ${path}] order item update failed:`, error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while updating the order item.' },
      { status: 500 }
    );
  }
}




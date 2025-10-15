import { auth } from "@/auth";
import { CartItem } from "@/hooks/use-order-cart";
import { updateTableAndBookingStatus } from "@/lib/crud-actions/bookings-tables";
import { deleteData, insertData } from "@/lib/crud-actions/general-actions";
import { getAllOrdersByTable } from "@/lib/crud-actions/orders";
import { NextRequest, NextResponse } from "next/server";



const path = '/api/orders';



/* ===============================================
=== [GET] Fetch All Orders & Items by Table ID ===
=============================================== */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user.id;

    // === Authenticate User ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Extract Table Query Parameter ===
    const tableParam = req.nextUrl.searchParams.get("table");
    const tableId = Number(tableParam);
    if (isNaN(tableId)) {
      return NextResponse.json({ error: "Invalid table ID provided." }, { status: 400 });
    }

    // === Fetch Orders for the Given Table ===
    const orders = await getAllOrdersByTable(tableId);

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error(`[GET ${path}] Failed to fetch orders:`, error);

    return NextResponse.json(
      { error: "Something went wrong while retrieving orders. Please try again." },
      { status: 500 }
    );
  }
}



/* ==============================================
=== [POST] Create a New Order and Order Items ===
============================================== */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user.id;

    // === Authenticate User ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Parse Request Body ===
    const body = await req.json();
    const { tableId, items, orderType } = body;

    // === Validate Required Data ===
    if (!tableId || !orderType || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Please provide a valid table ID, order type, and at least one item." },
        { status: 400 }
      );
    }

    // === Insert Order Details ===
    const result = await insertData("ordersTable", {
      tableId: tableId.trim(),
      waiterId: Number(userId),
      orderType: orderType.trim(),
    });

    const orderId = result.insertId;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order creation failed. Please try again." },
        { status: 400 }
      );
    }

    // === Insert All Order Items (in Parallel) ===
    const insertOrderItems = items.map((item: CartItem) => {
      return insertData("orderItemsTable", {
        orderId,
        menuItemImage: item.menuItemImage || null,
        menuItemId: item.menuItemId,
        menuItemName: item.menuItemName,
        menuItemOptionId: item.menuItemOptionId,
        menuItemOptionName: item.menuItemOptionName || '',
        quantity: item.quantity,
        price: item.price.toFixed(2),
      });
    });

    await Promise.all(insertOrderItems);

    // === Update table status to 'occupied' and also check if booking exist so also update the booking status to 'processing' ===
    await updateTableAndBookingStatus(Number(tableId), 'check-in');

    return NextResponse.json(
      { message: "Order placed successfully!" },
      { status: 201 }
    );
  } catch (error) {
    console.error(`[POST ${path}] Failed to create order:`, error);

    return NextResponse.json(
      { error: "Something went wrong while placing your order. Please try again shortly." },
      { status: 500 }
    );
  }
}



/* ========================================================
=== [PUT] Update Existing Order and Replace Order Items ===
======================================================== */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user.id;

    // === Authenticate User ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Parse Request Body ===
    const body = await req.json();
    const { items, orderDetail } = body;

    // === Validate Required Data ===
    if (!orderDetail?.id || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Order ID and at least one item are required to update the order." },
        { status: 400 }
      );
    }

    // === Delete All Existing Order Items ===
    await deleteData('orderItemsTable', 'orderId', orderDetail.id);

    // === Insert New Order Items ===
    if (items && items.length > 0 && orderDetail.id) {
      const optionInsertPromises = items.map((item: CartItem) =>
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

      // === Await all inserts ===
      await Promise.all(optionInsertPromises);
    }

    return NextResponse.json({ message: 'Order updated successfully.' }, { status: 202 });
  } catch (error) {
    console.error(`[PUT ${path}] Failed to update order:`, error);
    return NextResponse.json(
      { error: 'Something went wrong while updating the order. Please try again later.' },
      { status: 500 }
    );
  }
}
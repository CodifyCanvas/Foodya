import { auth } from "@/auth";
import { CartItem } from "@/hooks/use-order-cart";
import { updateTableAndBookingStatus } from "@/lib/crud-actions/bookings-tables";
import {  deleteData, insertData } from "@/lib/crud-actions/general-actions"
import { getAllOrdersByTable } from "@/lib/crud-actions/orders";
import { NextRequest, NextResponse } from "next/server"

/* ======================================
  === [GET] Fetch All Menu and Its items from DB ===
========================================= */
const path = '/api/orders'
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // Query parameters
    const tableParam = req.nextUrl.searchParams.get("table");

    const orders = await getAllOrdersByTable(Number(tableParam));

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
=== [POST] Create a New Menu Item Entry ===
========================================= */
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();

    // === Validate request body using Zod schema ===
    const { tableId, items, orderType } = body;

    if (!tableId || !orderType || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Table ID, order type, and at least one item are required." },{ status: 400 });
    }

    // === Insert new Order item into DB ===
    const result = await insertData("ordersTable", {
      tableId: tableId.trim(),
      waiterId: Number(userId),
      orderType: orderType.trim(),
    });

    const orderId = result.insertId;

    if (!orderId) {
      return NextResponse.json(
        { error: "Failed to create order." },
        { status: 500 }
      );
    }

    // === Insert all order items in parallel ===
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
      { message: "Order created successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error(`[POST ${path}] Order & items creation failed:`, error);

    return NextResponse.json(
      { error: "An unexpected error occurred while creating the order & items. Please try again later." },
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




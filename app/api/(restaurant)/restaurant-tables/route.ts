import { auth } from "@/auth";
import { syncBookingAndTableStatuses } from "@/lib/crud-actions/bookings-tables";
import { checkDuplicate, insertData, updateData } from "@/lib/crud-actions/general-actions";
import { deleteRestaurantTable, getAllActiveTable } from "@/lib/crud-actions/restaurant-tables";
import { restaurantTablesFormSchema } from "@/lib/zod-schema/restaurant.zod";
import { NextRequest, NextResponse } from "next/server";



const path = '/api/restaurant-tables';



/* ===========================================================
=== [GET] Fetch All Restaurant Tables (with Synced Status) ===
=========================================================== */
export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user.id;

    // === Authenticate User ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Sync Booking & Table Statuses First ===
    await syncBookingAndTableStatuses();

    // === Fetch all restaurant tables ===
    const data = await getAllActiveTable();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(`[GET ${path}] Failed to fetch tables:`, error);

    return NextResponse.json(
      { error: "We couldn't load the tables at the moment. Please try again shortly." },
      { status: 500 }
    );
  }
}



/* =============================================== 
=== [POST] Create a New Restaurant Table Entry ===
=============================================== */
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

    // === Validate Body with Zod ===
    const parsed = restaurantTablesFormSchema.parse(body);
    const { table_number, status } = parsed;

    // === Check for Duplicate Table ===
    const duplicate = await checkDuplicate("restaurantTables", "table_number", table_number);

    if (duplicate) {
      return NextResponse.json(
        { error: "Table name already in use. Please pick another." },
        { status: 409 }
      );
    }

    // === Insert New Table Record ===
    await insertData("restaurantTables", {
      table_number: table_number.trim(),
      status: status?.trim() as "booked" | "occupied" | "available"
    });

    return NextResponse.json(
      { message: "Table created successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error(`[POST ${path}] Failed to create table:`, error);

    return NextResponse.json(
      { error: "Something went wrong while creating the table. Please try again shortly." },
      { status: 500 }
    );
  }
}



/* ====================================================
=== [PUT] Update an Existing Restaurant Table Entry ===
==================================================== */
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

    // === Validate Body with Zod ===
    const parsed = restaurantTablesFormSchema.parse(body);
    const { id, table_number, status } = parsed;

    // === Update Existing Table Record ===
    await updateData("restaurantTables", "id", id!, {
      table_number: table_number.trim(),
      status: status?.trim() as "booked" | "occupied" | "available"
    });

    return NextResponse.json(
      { message: "Table updated successfully." },
      { status: 202 }
    );
  } catch (error) {
    console.error(`[PUT ${path}] Failed to update table:`, error);

    return NextResponse.json(
      { error: "Something went wrong while updating the table. Please try again later." },
      { status: 500 }
    );
  }
}



/* ==========================================
=== [Delete] Soft Delete Restaurant Table ===
========================================== */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user.id;

    // === Authenticate User ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Parse Request Body ===
    const body = await req.json();

    // === Validate ===
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: "Missing table ID" }, { status: 400 });
    }

    // === Perform Soft Delete ===
    const result = await deleteRestaurantTable(id);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    // === Return Success Response ===
    return NextResponse.json({ message: result.message }, { status: 200 });

  } catch (error) {
    console.error("Failed to delete restaurant table: ", error);

    return NextResponse.json(
      { error: "Something went wrong while deleting the table." },
      { status: 500 }
    );
  }
}
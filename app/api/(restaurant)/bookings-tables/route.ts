'use server';

import { auth } from "@/auth"
import { getAllBookingsTables, syncBookingAndTableStatuses } from "@/lib/crud-actions/bookings-tables"
import { getAllData, insertData, updateData } from "@/lib/crud-actions/general-actions"
import { mapToLabelValue } from "@/lib/utils"
import { bookingsTablesFormSchema } from "@/lib/zod-schema/restaurant.zod"
import { NextRequest, NextResponse } from "next/server"

const path = '/api/bookings-tables'

/* ======================================
  === [GET] Fetch All Reservations from DB ===
========================================= */
export async function GET() {
  try {
    const session = await auth()
    const userId = session?.user.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    await syncBookingAndTableStatuses()
    const data = await getAllBookingsTables()
    const rawTables = await getAllData("restaurantTables")

    const tables = mapToLabelValue(rawTables, { label: 'table_number', value: 'id' })

    return NextResponse.json({ tables: tables, bookings: data }, { status: 200 })
  } catch (error) {
    console.error(`[GET ${path}] Failed to fetch tables:`, error)

    return NextResponse.json(
      { error: "Failed to fetch bookings. Please try again later." },
      { status: 500 }
    )
  }
}

/* ================================================= 
  === [POST] Create a New Reservation Table Entry ===
================================================= */
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const rawBody = await req.json()
    const body = {
      ...rawBody,
      reservationStart: new Date(rawBody.reservationStart),
      reservationEnd: new Date(rawBody.reservationEnd),
    }

    // Validate request body using Zod schema
    const parsed = bookingsTablesFormSchema.parse(body)
    const { tableId, customerName, reservationStart, reservationEnd, advancePaid } = parsed

    // === Insert New Restaurant Table into DB ===
    await insertData("bookingsTables", {
      bookedByUserId: Number(userId),
      tableId: Number(tableId.trim()),
      customerName: customerName.trim(),
      reservationStart: new Date(reservationStart),
      reservationEnd: new Date(reservationEnd),
      advancePaid: advancePaid,
    })

    return NextResponse.json(
      { message: "Table created successfully." },
      { status: 201 }
    )
  } catch (error) {
    console.error(`[POST ${path}] reservation creation failed:`, error)

    return NextResponse.json(
      { error: "An unexpected error occurred while creating the reservation. Please try again later." },
      { status: 500 }
    )
  }
} 

/* ================================================
  === [PUT] Update an Existing Reservation Table ===
================================================ */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const rawBody = await req.json()
    const body = {
      ...rawBody,
      reservationStart: new Date(rawBody.reservationStart),
      reservationEnd: new Date(rawBody.reservationEnd),
    }

    // === Validate Input ===
    const parsed = bookingsTablesFormSchema.parse(body)
    const { id, tableId, customerName, reservationStart, reservationEnd, advancePaid } = parsed

    // === Update Table by ID ===
    await updateData("bookingsTables", "id", id!, {
      bookedByUserId: Number(userId),
      tableId: Number(tableId.trim()),
      customerName: customerName.trim(),
      reservationStart: new Date(reservationStart),
      reservationEnd: new Date(reservationEnd),
      advancePaid: advancePaid,
    })

    return NextResponse.json(
      { message: "Reservation updated successfully." },
      { status: 202 }
    )
  } catch (error) {
    console.error(`[PUT ${path}] Reservation update failed:`, error)

    return NextResponse.json(
      { error: "An unexpected error occurred while updating the Reservation. Please try again later." },
      { status: 500 }
    )
  }
}

/* =============================================
  === [PATCH] Update Status of Booking Table ===
============================================= */
export async function PATCH(req: NextRequest) {
  try {
    /* === Session & Authorization === */
    const session = await auth();
    const userId = session?.user.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    /* === Parse & Validate Body === */
    const body = await req.json();
    const { status, id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Reservation ID is missing." },
        { status: 400 }
      );
    }

    /* === Update Reservation Status === */
    await updateData("bookingsTables", "id", id, { status });

    return NextResponse.json(
      { message: "Marked as Cancelled successfully." },
      { status: 202 }
    );
  } catch (error) {
    console.error(`[PATCH ${path}] Reservation update failed:`, error);

    return NextResponse.json(
      {
        error:
          "An unexpected error occurred while updating the reservation. Please try again later.",
      },
      { status: 500 }
    );
  }
}


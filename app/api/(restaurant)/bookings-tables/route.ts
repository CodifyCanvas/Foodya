'use server';

import { auth } from "@/auth"
import { getAllBookingsTables, syncBookingAndTableStatuses } from "@/lib/crud-actions/bookings-tables"
import { getAllData, insertData, updateData } from "@/lib/crud-actions/general-actions"
import { mapToLabelValue } from "@/lib/utils"
import { bookingsTablesFormSchema } from "@/lib/zod-schema/restaurant.zod"
import { NextRequest, NextResponse } from "next/server"



const path = '/api/bookings-tables'



/* ======================================================
  === [GET] Fetch All Reservations and Tables from DB ===
====================================================== */
export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user.id

    // === Check Authentication ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Sync Table Statuses Before Fetching ===
    await syncBookingAndTableStatuses();

    const bookings = await getAllBookingsTables();
    const rawTables = await getAllData("restaurantTables");

    const tables = mapToLabelValue(rawTables, { label: 'table_number', value: 'id' });

    // === Return Tables and Bookings ===
    return NextResponse.json({ tables: tables, bookings }, { status: 200 });

  } catch (error) {
    console.error(`[GET ${path}] Failed to fetch data:`, error);

    return NextResponse.json(
      { error: "We couldn't load the bookings right now. Please try again later." },
      { status: 500 }
    );
  }
}



/* ======================================================== 
  === [POST] Create a New Reservation in Bookings Table ===
======================================================== */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user.id

    // === Check Authentication ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Parse and Prepare Body ===
    const rawBody = await req.json();
    const body = {
      ...rawBody,
      reservationStart: new Date(rawBody.reservationStart),
      reservationEnd: new Date(rawBody.reservationEnd),
    }

    // === Validate Body with Zod Schema ===
    const parsed = bookingsTablesFormSchema.parse(body);
    const { tableId, customerName, reservationStart, reservationEnd, advancePaid } = parsed

    // === Insert Reservation Into DB ===
    await insertData("bookingsTables", {
      bookedByUserId: Number(userId),
      tableId: Number(tableId.trim()),
      customerName: customerName.trim(),
      reservationStart: new Date(reservationStart),
      reservationEnd: new Date(reservationEnd),
      advancePaid: advancePaid,
    });

    return NextResponse.json(
      { message: "Reservation created successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error(`[POST ${path}] Failed to create reservation:`, error);

    return NextResponse.json(
      { error: "Something went wrong while saving the reservation. Please check your input and try again." },
      { status: 500 }
    );
  }
}



/* =============================================================
  === [PUT] Update an Existing Reservation by Reservation ID ===
============================================================= */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user.id

    // === Check Authentication ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Parse and Prepare Body ===
    const rawBody = await req.json();
    const body = {
      ...rawBody,
      reservationStart: new Date(rawBody.reservationStart),
      reservationEnd: new Date(rawBody.reservationEnd),
    }

    // === Validate Input ===
    const parsed = bookingsTablesFormSchema.parse(body);
    const { id, tableId, customerName, reservationStart, reservationEnd, advancePaid } = parsed

    // === Update Reservation ===
    await updateData("bookingsTables", "id", id!, {
      bookedByUserId: Number(userId),
      tableId: Number(tableId.trim()),
      customerName: customerName.trim(),
      reservationStart,
      reservationEnd,
      advancePaid,
    });

    return NextResponse.json(
      { message: "Reservation updated successfully." },
      { status: 202 }
    );
  } catch (error) {
    console.error(`[PUT ${path}] Failed to update reservation:`, error);

    return NextResponse.json(
      { error: "Unable to update the reservation. Please try again or contact support if the issue persists." },
      { status: 500 }
    );
  }
}



/* ===================================================
  === [PATCH] Update the Status of a Booking Table ===
=================================================== */
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user.id;

    // === Check Authentication ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    /* === Parse & Validate Body === */
    const body = await req.json();
    const { status, id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing reservation ID." },
        { status: 400 }
      );
    }

    /* === Update Reservation Status === */
    await updateData("bookingsTables", "id", id, { status });

    return NextResponse.json(
      { message: "Reservation status updated successfully." },
      { status: 202 }
    );

  } catch (error) {
    console.error(`[PATCH ${path}] Failed to update status:`, error);

    return NextResponse.json(
      { error: "We couldn't update the reservation status. Please try again in a few moments." },
      { status: 500 }
    );
  }
}
import { auth } from "@/auth"
import { syncBookingAndTableStatuses } from "@/lib/crud-actions/bookings-tables"
import { checkDuplicate, getAllData, insertData, updateData } from "@/lib/crud-actions/general-actions"
import { restaurantTablesFormSchema } from "@/lib/zod-schema/restaurant.zod"
import { NextRequest, NextResponse } from "next/server"

const path = '/api/restaurant-tables'

/* ================================================
  === [GET] Fetch All Restaurant Tables from DB ===
================================================ */
export async function GET() {
  try {
    const session = await auth()
    const userId = session?.user.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Synchronize booking and table statuses before fetching ===
    await syncBookingAndTableStatuses()

    // === Fetch all restaurant tables ===
    const data = await getAllData("restaurantTables")

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error(`[GET ${path}] Failed to fetch tables:`, error)

    return NextResponse.json(
      { error: "Failed to fetch module. Please try again later." },
      { status: 500 }
    )
  }
}

/* ================================================= 
  === [POST] Create a New Restaurant Table Entry ===
================================================= */
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json()

    // === Validate request body using Zod schema ===
    const parsed = restaurantTablesFormSchema.parse(body)
    const { table_number, status } = parsed

    // === Check for duplicate table number ===
    const duplicate = await checkDuplicate("restaurantTables", "table_number", table_number)

    if (duplicate) {
      return NextResponse.json(
        { message: "This Table Name is already in use." },
        { status: 409 }
      )
    }

    // === Insert new restaurant table into DB ===
    await insertData("restaurantTables", { 
      table_number: table_number.trim(), 
      status: status?.trim().toLowerCase() ?? "available"
    })

    return NextResponse.json(
      { message: "Table created successfully." },
      { status: 201 }
    )
  } catch (error) {
    console.error(`[POST ${path}] restaurant table creation failed:`, error)

    return NextResponse.json(
      { error: "An unexpected error occurred while creating the restaurant table. Please try again later." },
      { status: 500 }
    )
  }
}

/* ================================================
  === [PUT] Update an Existing Restaurant Table ===
================================================ */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json()

    // === Validate input data using Zod schema ===
    const parsed = restaurantTablesFormSchema.parse(body)
    const { id, table_number, status } = parsed

    // === Update restaurant table record by ID ===
    await updateData("restaurantTables", "id", id!, {
      table_number: table_number.trim(),
      status: status?.trim()
    })

    return NextResponse.json(
      { message: "Table updated successfully." },
      { status: 202 }
    )
  } catch (error) {
    console.error(`[PUT ${path}] restaurant table update failed:`, error)

    return NextResponse.json(
      { error: "An unexpected error occurred while updating the restaurant table. Please try again later." },
      { status: 500 }
    )
  }
}

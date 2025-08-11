import { auth } from "@/auth"
import { checkDuplicate, getAllData, insertData, updateData } from "@/lib/crud-actions/general-actions"
import { moduleFormSchema } from "@/lib/zod-schema"
import { NextRequest, NextResponse } from "next/server"

const path = '/api/module'

/* ======================================
  === [GET] Fetch All Module from DB ===
========================================= */
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user.id) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const data = await getAllData("modules")

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error(`[GET ${path}] Failed to fetch module:`, error)

    return NextResponse.json(
      { error: "Failed to fetch module. Please try again later." },
      { status: 500 }
    )
  }
}

/* ======================================
  === [POST] Create a New Module Entry ===
========================================= */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate request body using Zod schema
    const parsed = moduleFormSchema.parse(body)
    const { name, label } = parsed

    // === Check for Duplicates in Modules Table ===
    const duplicate = await checkDuplicate("modules", "name", name)

    if (duplicate) {
      return NextResponse.json(
        { message: "This Module is already in use." },
        { status: 409 }
      )
    }

    // === Insert New Module into DB ===
    await insertData("modules", { 
      name: name.trim().toLowerCase(), 
      label: label?.trim() ?? ""
    })

    return NextResponse.json(
      { message: "Module created successfully." },
      { status: 201 }
    )
  } catch (error) {
    console.error(`[POST ${path}] Module creation failed:`, error)

    return NextResponse.json(
      { error: "An unexpected error occurred while creating the module. Please try again later." },
      { status: 500 }
    )
  }
}

/* ======================================
  === [PUT] Update an Existing Module ===
========================================= */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()

    // === Validate Input ===
    const parsed = moduleFormSchema.parse(body)
    const { id, name, label } = parsed

    // === Update Module by ID ===
    await updateData("modules", "id", id!, {
       name: name.trim().toLowerCase(),
       label: label?.trim() 
      })

    return NextResponse.json(
      { message: "Module updated successfully." },
      { status: 202 }
    )
  } catch (error) {
    console.error(`[PUT ${path}] Module update failed:`, error)

    return NextResponse.json(
      { error: "An unexpected error occurred while updating the module. Please try again later." },
      { status: 500 }
    )
  }
}

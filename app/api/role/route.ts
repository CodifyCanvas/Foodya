import { auth } from "@/auth";
import { checkDuplicate, getAllData, insertData, updateData } from "@/lib/crud-actions/general-actions"
import { roleFormSchema } from "@/lib/zod-schema"
import { NextRequest, NextResponse } from "next/server"

/* ======================================
  === [GET] Fetch All Roles from DB ===
========================================= */
export async function GET() {
  try {
    const session = await auth()
    const userId = session?.user.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const roles = await getAllData("roles")

    return NextResponse.json(roles, { status: 200 })
  } catch (error) {
    console.error("[GET /api/role] Failed to fetch roles:", error)

    return NextResponse.json(
      { error: "Failed to fetch roles. Please try again later." },
      { status: 500 }
    )
  }
}

/* ======================================
  === [POST] Create a New Role Entry ===
========================================= */
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json()

    // Validate request body using Zod schema
    const parsed = roleFormSchema.parse(body)
    const { role } = parsed

    // === Check for Duplicates in Users Table ===
    const duplicate = await checkDuplicate("roles", "role", role)

    if (duplicate) {
      return NextResponse.json(
        { message: "This Role is already in use." },
        { status: 409 }
      )
    }

    // === Insert New Role into DB ===
    await insertData("roles", { role: role?.trim()?.toLowerCase() })

    return NextResponse.json(
      { message: "Role created successfully." },
      { status: 201 }
    )
  } catch (error) {
    console.error("[POST /api/role] Role creation failed:", error)

    return NextResponse.json(
      { error: "An unexpected error occurred while creating the role. Please try again later." },
      { status: 500 }
    )
  }
}

/* ======================================
  === [PUT] Update an Existing Role ===
========================================= */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json()

    // === Validate Input ===
    const parsed = roleFormSchema.parse(body)
    const { id, role } = parsed

    // === Extract and Normalize Previous Role ===
    const { previousRole } = body

    // === Define Protected System Roles ===
    const protectedRoles = ["waiter"];

    // === Block Update if Role is Protected ===
    if (protectedRoles.includes(previousRole?.toLowerCase())) {
      return NextResponse.json(
        { message: `The '${previousRole}' role is protected and cannot be modified.` },
        { status: 403 }
      )
    }

    // === Update Role by ID ===
    await updateData("roles", "id", id!, { role: role.trim() })

    return NextResponse.json(
      { message: "Role updated successfully." },
      { status: 202 }
    )
  } catch (error) {
    console.error("[PUT /api/role] Role update failed:", error)

    return NextResponse.json(
      { error: "An unexpected error occurred while updating the role. Please try again later." },
      { status: 500 }
    )
  }
}

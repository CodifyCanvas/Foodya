import { auth } from "@/auth";
import { checkDuplicate, getAllData, insertData, updateData } from "@/lib/crud-actions/general-actions"
import { menuCategoriesFormSchema } from "@/lib/zod-schema/restaurant.zod";
import { NextRequest, NextResponse } from "next/server"

const path = '/api/menu-categories'

/* ======================================
  === [GET] Fetch All Menu Categories from DB ===
========================================= */
export async function GET() {
  try {
    const session = await auth()
    const userId = session?.user.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const data = await getAllData("menuCategories")

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error(`[GET ${path}] Failed to fetch categories:`, error)

    return NextResponse.json(
      { error: "Failed to fetch categories. Please try again later." },
      { status: 500 }
    )
  }
}

/* =========================================
  === [POST] Create a New Menu Category ===
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
    const parsed = menuCategoriesFormSchema.parse(body)
    const { name, description } = parsed

    // === Check for Duplicates in Menu Categories Table ===
    const duplicate = await checkDuplicate("menuCategories", "name", name)

    if (duplicate) {
      return NextResponse.json(
        { message: "This Category is already in use." },
        { status: 409 }
      )
    }

    // === Insert New Menu Category into DB ===
    await insertData("menuCategories", { name: name.trim(), description: description?.trim() })


    return NextResponse.json(
      { message: "Category created successfully." },
      { status: 201 }
    )
  } catch (error) {
    console.error(`[POST ${path}] category creation failed:`, error)

    return NextResponse.json(
      { error: "An unexpected error occurred while creating the category. Please try again later." },
      { status: 500 }
    )
  }
}

/* =============================================
  === [PUT] Update an Existing Menu Category ===
============================================= */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json()

    // === Validate Input ===
    const parsed = menuCategoriesFormSchema.parse(body)
    const { id, name, description } = parsed

    if (!id) {
      return NextResponse.json(
        { message: "Id is not present" },
        { status: 404 }
      )
    }

    // === Update Menu Category by ID ===
    await updateData("menuCategories", "id", id!, { name: name.trim(), description: description?.trim() })

    return NextResponse.json(
      { message: "Category updated successfully." },
      { status: 202 }
    )
  } catch (error) {
    console.error(`[PUT ${path}] category update failed:`, error)

    return NextResponse.json(
      { error: "An unexpected error occurred while updating the category. Please try again later." },
      { status: 500 }
    )
  }
}

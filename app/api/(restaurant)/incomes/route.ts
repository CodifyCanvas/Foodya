import { auth } from "@/auth"
import { checkDuplicate, getAllData, insertData, updateData } from "@/lib/crud-actions/general-actions"
import { getAllIncomesWithDetails } from "@/lib/crud-actions/transactions"
import { TransactionCategoriesFormSchema } from "@/lib/zod-schema/restaurant.zod"
import { NextRequest, NextResponse } from "next/server"

const path = '/api/incomes'

/* ==================================================
  === [GET] Fetch All Income Transactions from DB ===
================================================== */
export async function GET() {
  try {
    const session = await auth()
    const userId = session?.user.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Fetch all Transaction Categories ===
    const data = await getAllIncomesWithDetails()

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error(`[GET ${path}] Failed to fetch transaction categories:`, error)

    return NextResponse.json(
      { error: "Failed to fetch transaction categories. Please try again later." },
      { status: 500 }
    )
  }
}

/* ===================================================== 
  === [POST] Create a New Transaction Category Entry ===
===================================================== */
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json()

    // === Validate request body using Zod schema ===
    const parsed = TransactionCategoriesFormSchema.parse(body)
    const { category, description } = parsed

    // === Check for duplicate Category Name ===
    const duplicate = await checkDuplicate("transactionCategoriesTable", "category", category)

    if (duplicate) {
      return NextResponse.json(
        { error: "This Category Name is already in use." },
        { status: 409 }
      )
    }

    // === Insert new Transaction Category into DB ===
    await insertData("transactionCategoriesTable", {
      category: category.trim().toLowerCase(),
      description: description?.trim(),
    })

    return NextResponse.json(
      { message: "Category created successfully." },
      { status: 201 }
    )
  } catch (error) {
    console.error(`[POST ${path}] Transaction Category creation failed:`, error)

    return NextResponse.json(
      { error: "An unexpected error occurred while creating the transaction category. Please try again later." },
      { status: 500 }
    )
  }
}

/* ====================================================
  === [PUT] Update an Existing Transaction Category ===
==================================================== */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json()

    // === Validate input data using Zod schema ===
    const parsed = TransactionCategoriesFormSchema.parse(body)
    const { id, category, description } = parsed

    // === Update Transaction Category record by ID ===
    await updateData("transactionCategoriesTable", "id", id!, {
      category: category.trim().toLowerCase(),
      description: description?.trim(),
    })

    return NextResponse.json(
      { message: "Category updated successfully." },
      { status: 202 }
    )
  } catch (error) {
    console.error(`[PUT ${path}] transaction category update failed:`, error)

    return NextResponse.json(
      { error: "An unexpected error occurred while updating the transaction category. Please try again later." },
      { status: 500 }
    )
  }
}

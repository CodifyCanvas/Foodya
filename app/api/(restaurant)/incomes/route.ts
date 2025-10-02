import { auth } from "@/auth"
import { getAllData, insertData, updateData } from "@/lib/crud-actions/general-actions"
import { getAllIncomesWithDetails } from "@/lib/crud-actions/transactions"
import { mapToLabelValue } from "@/lib/utils"
import { TransactionFormSchema } from "@/lib/zod-schema/restaurant.zod"
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

    // === Fetch all Transactions & Categories ===
    const data = await getAllIncomesWithDetails()
    const rawCategories = await getAllData("transactionCategoriesTable")

    const categories = mapToLabelValue(rawCategories, { label: 'category', value: 'id' })

    return NextResponse.json({ transactions: data, categories }, { status: 200 })
  } catch (error) {
    console.error(`[GET ${path}] Failed to fetch transaction categories:`, error)

    return NextResponse.json(
      { error: "Failed to fetch transaction categories. Please try again later." },
      { status: 500 }
    )
  }
}

/* =================================================== 
  === [POST] Create a New Income Transaction Entry ===
=================================================== */
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json()

    // === Validate request body using Zod schema ===
    const parsed = TransactionFormSchema.parse(body)
    const { title, category, amount, description } = parsed

    // === Insert new Income Transaction into DB ===
    await insertData("transactionsTable", {
      title: title?.trim(),
      categoryId: Number(category?.trim()),
      amount: amount?.toString().trim(),
      type: 'credit',
      sourceType: 'manual',
      description: description?.trim() ?? null,
    })

    return NextResponse.json(
      { message: "Income added successfully." },
      { status: 201 }
    )
  } catch (error) {
    console.error(`[POST ${path}] transaction income creation failed:`, error)

    return NextResponse.json(
      { error: "An unexpected error occurred while creating the income transaction. Please try again later." },
      { status: 500 }
    )
  }
}

/* ==================================================
  === [PUT] Update an Existing Transaction Income ===
================================================== */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json()

    // === Validate input data using Zod schema ===
    const parsed = TransactionFormSchema.parse(body)
    const { id, title, category, amount, description } = parsed

    // === Update Income Transaction record by ID ===
    await updateData("transactionsTable", "id", id!, {
      title: title?.trim(),
      categoryId: Number(category?.trim()),
      amount: amount?.toString().trim(),
      description: description?.trim() ?? null,
    })

    return NextResponse.json(
      { message: "Income updated successfully." },
      { status: 202 }
    )
  } catch (error) {
    console.error(`[PUT ${path}] transaction income update failed:`, error)

    return NextResponse.json(
      { error: "An unexpected error occurred while updating the income transaction. Please try again later." },
      { status: 500 }
    )
  }
}

import { auth } from "@/auth";
import { deleteData, getAllData, insertData, updateData } from "@/lib/crud-actions/general-actions";
import { getAllTransactionsWithDetails } from "@/lib/crud-actions/transactions";
import { mapToLabelValue } from "@/lib/utils";
import { TransactionFormSchema } from "@/lib/zod-schema/restaurant.zod";
import { NextRequest, NextResponse } from "next/server";



const path = '/api/expenses';



/* =========================================================
=== [GET] Fetch All Expense Transactions with Categories ===
========================================================= */
export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user.id

    // === Authenticate User ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Fetch all Transactions & Categories ===
    const transactions = await getAllTransactionsWithDetails('debit');
    const rawCategories = await getAllData("transactionCategoriesTable");

    const categories = mapToLabelValue(rawCategories, { label: 'category', value: 'id' });

    return NextResponse.json({ transactions, categories }, { status: 200 });
  } catch (error) {
    console.error(`[GET ${path}] Failed to fetch expenses:`, error);

    return NextResponse.json(
      { error: "Unable to fetch expense transactions at the moment. Please try again later." },
      { status: 500 }
    );
  }
}



/* =========================================================== 
  === [POST] Create a New Manual Expense Transaction Entry ===
=========================================================== */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user.id

    // === Authenticate User ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();

    // === Validate request body using Zod schema ===
    const parsed = TransactionFormSchema.parse(body);
    const { title, category, amount, description } = parsed;

    // === Insert new Expense Transaction ===
    await insertData("transactionsTable", {
      title: title?.trim(),
      categoryId: Number(category?.trim()),
      amount: amount?.toString().trim(),
      type: "debit",
      sourceType: "manual",
      description: description?.trim() ?? null,
    });

    return NextResponse.json(
      { message: "Expense transaction added successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error(`[POST ${path}] Failed to create expense transaction:`, error);

    return NextResponse.json(
      { error: "Something went wrong while adding the expense. Please try again." },
      { status: 500 }
    );
  }
}



/* ========================================================
=== [PUT] Update an Existing Manual Expense Transaction ===
======================================================== */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user.id

    // === Authenticate User ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();

    // === Validate input data using Zod schema ===
    const parsed = TransactionFormSchema.parse(body);
    const { id, title, category, amount, description } = parsed;

    // === Update Existing Expense Record ===
    await updateData("transactionsTable", "id", id!, {
      title: title?.trim(),
      categoryId: Number(category?.trim()),
      amount: amount?.toString().trim(),
      description: description?.trim() ?? null,
    });

    return NextResponse.json(
      { message: "Expense transaction updated successfully." },
      { status: 202 }
    );
  } catch (error) {
    console.error(`[PUT ${path}] Failed to update expense transaction:`, error);

    return NextResponse.json(
      { error: "Unable to update the expense at this time. Please try again later." },
      { status: 500 }
    );
  }
}



/* ========================================
=== [Delete] Delete Expense Transaction ===
======================================== */
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
      return NextResponse.json({ error: "Missing Transaction ID." }, { status: 400 });
    }

    // === Perform Delete Action ===
    await deleteData("transactionsTable", 'id', id);

    // === Return Success Response ===
    return NextResponse.json({ message: "Expense Transaction deleted successfully." }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete expense transaction: ", error);

    return NextResponse.json(
      { error: "Failed to delete transaction. Please try again." },
      { status: 500 }
    );
  }
}
import { auth } from "@/auth";
import { checkDuplicate, deleteData, getAllData, insertData, updateData } from "@/lib/crud-actions/general-actions";
import { deleteTheTransactionCategory } from "@/lib/crud-actions/transaction-categories";
import { TransactionCategoriesFormSchema } from "@/lib/zod-schema/restaurant.zod";
import { NextRequest, NextResponse } from "next/server";



const path = '/api/transaction-categories';



/* =======================================================
=== [GET] Fetch All Transaction Categories from the DB ===
======================================================= */
export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user.id;

    // === Authenticate User ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Fetch all Transaction Categories ===
    const data = await getAllData("transactionCategoriesTable");

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(`[GET ${path}] Failed to fetch transaction categories:`, error);

    return NextResponse.json(
      { error: "Unable to fetch transaction categories. Please try again later." },
      { status: 500 }
    );
  }
}



/* =================================================== 
=== [POST] Create a New Transaction Category Entry ===
=================================================== */
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
    const parsed = TransactionCategoriesFormSchema.parse(body);
    const { category, description } = parsed;

    // === Check for Duplicate Category ===
    const duplicate = await checkDuplicate("transactionCategoriesTable", "category", category);

    if (duplicate) {
      return NextResponse.json(
        { error: "This Category Name is already in use." },
        { status: 409 }
      );
    }

    // === Insert new Transaction Category ===
    await insertData("transactionCategoriesTable", {
      category: category.trim().toLowerCase(),
      description: description?.trim(),
    });

    return NextResponse.json(
      { message: "Category created successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error(`[POST ${path}] Failed to create transaction category:`, error);

    return NextResponse.json(
      { error: "Something went wrong while creating the category. Please try again." },
      { status: 500 }
    );
  }
}



/* ==================================================
=== [PUT] Update an Existing Transaction Category ===
================================================== */
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
    const parsed = TransactionCategoriesFormSchema.parse(body);
    const { id, category, description } = parsed;

    // === Update Transaction Category ===
    await updateData("transactionCategoriesTable", "id", id!, {
      category: category.trim().toLowerCase(),
      description: description?.trim(),
    });

    return NextResponse.json(
      { message: "Category updated successfully." },
      { status: 202 }
    );

  } catch (error) {
    console.error(`[PUT ${path}] Failed to update transaction category:`, error);

    return NextResponse.json(
      { error: "Oops! We had trouble updating the category. Please try again." },
      { status: 500 }
    );
  }
}



/* =========================================
=== [Delete] Delete Transaction Category ===
========================================= */
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
    const { id, category } = body;
    if (!id || !category) {
      return NextResponse.json({ error: "Category ID and name are required." }, { status: 400 });
    }

    const protectedCategories = ["salary", "invoice", "others"];
    if (protectedCategories.includes(category.trim().toLowerCase())) {
      return NextResponse.json(
        { error: `"${category}" is a protected category and cannot be deleted.` },
        { status: 403 }
      );
    }

    // === Perform Delete Action ===
    const success = await deleteTheTransactionCategory(id);

    if (!success) {
      return NextResponse.json({ error: "Could not delete the category. Try again." }, { status: 400 });
    }

    // === Return Success Response ===
    return NextResponse.json({ message: "Category deleted. Transactions moved to 'Others'." }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete transaction category: ", error);

    const errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again.";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
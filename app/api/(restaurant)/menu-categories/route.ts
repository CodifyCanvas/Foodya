import { auth } from "@/auth";
import { checkDuplicate, deleteData, getAllData, insertData, updateData } from "@/lib/crud-actions/general-actions";
import { db } from "@/lib/db";
import { menuCategoriesFormSchema } from "@/lib/zod-schema/restaurant.zod";
import { NextRequest, NextResponse } from "next/server";



const path = '/api/menu-categories';



/* ============================================
=== [GET] Fetch All Menu Categories from DB ===
============================================ */
export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user.id

    // === Authenticate User ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const data = await getAllData("menuCategories");

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(`[GET ${path}] Failed to fetch categories:`, error);

    return NextResponse.json(
      { error: "Failed to fetch categories. Please try again later." },
      { status: 500 }
    );
  }
}



/* ======================================
=== [POST] Create a New Menu Category ===
====================================== */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user.id

    // === Authenticate User ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();

    // Validate request body using Zod schema
    const parsed = menuCategoriesFormSchema.parse(body);
    const { name, description } = parsed;

    // === Check for duplicate category name ===
    const duplicate = await checkDuplicate("menuCategories", "name", name);
    if (duplicate) {
      return NextResponse.json(
        { error: "This category name is already in use." },
        { status: 409 }
      );
    }

    // === Insert new category ===
    await insertData("menuCategories", { name: name.trim(), description: description?.trim() });

    return NextResponse.json(
      { message: "Category created successfully." },
      { status: 201 }
    );

  } catch (error) {
    console.error(`[POST ${path}] Category creation failed:`, error);

    return NextResponse.json(
      { error: "An unexpected error occurred while creating the category. Please try again later." },
      { status: 500 }
    );
  }
}



/* ===========================================
=== [PUT] Update an Existing Menu Category ===
=========================================== */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user.id

    // === Authenticate User ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();

    // === Validate Input ===
    const parsed = menuCategoriesFormSchema.parse(body);
    const { id, name, description } = parsed;

    if (!id) {
      return NextResponse.json(
        { error: "Missing category ID." },
        { status: 400 }
      );
    }

    // === Update Menu Category by ID ===
    await updateData("menuCategories", "id", id!, { name: name.trim(), description: description?.trim() });

    return NextResponse.json(
      { message: "Category updated successfully." },
      { status: 202 }
    );

  } catch (error) {
    console.error(`[PUT ${path}] Category update failed:`, error);

    return NextResponse.json(
      { error: "An unexpected error occurred while updating the category. Please try again later." },
      { status: 500 }
    );
  }
}



/* ==================================
=== [Delete] Delete Menu Category ===
================================== */
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
      return NextResponse.json({ error: "Missing Category ID" }, { status: 400 });
    }

    await db.transaction(async (tx) => {

      // === Nullify category_id in all related menu items ===
      await updateData("menuItems", 'category_id', id, {
        category_id: null,
      }, tx)

      // === Perform Delete Action ===
      await deleteData('menuCategories', "id", id, tx);

    })

    // === Return Success Response ===
    return NextResponse.json({ message: "Category deleted and linked menu items updated." }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete category: ", error);

    return NextResponse.json(
      { error: "Something went wrong while deleting the category." },
      { status: 500 }
    );
  }
}
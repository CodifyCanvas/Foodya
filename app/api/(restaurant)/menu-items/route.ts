import { auth } from "@/auth";
import { checkDuplicate, deleteData, getAllData, insertData, updateData } from "@/lib/crud-actions/general-actions"
import { getAllMenuItems } from "@/lib/crud-actions/menu-items";
import { mapToLabelValue } from "@/lib/utils";
import { menuItemFormSchema } from "@/lib/zod-schema/restaurant.zod";
import { NextRequest, NextResponse } from "next/server"

/* ======================================
  === [GET] Fetch All Menu and Its items from DB ===
========================================= */
const path = '/api/menu-items'
export async function GET() {
  try {
    const session = await auth()
    const userId = session?.user.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Fetch all menu categories ===
    const menuCategories = await getAllData("menuCategories")

    // === Fetch all menu items with their details ===
    const data = await getAllMenuItems()

    // === Map categories to label/value pairs for frontend usage ===
    const categories = mapToLabelValue(menuCategories, { value: 'id', label: 'name' })

    return NextResponse.json({ menuItems: data, categories: categories }, { status: 200 })
  } catch (error) {
    console.error(`[GET ${path}] Failed to fetch menu items:`, error)

    return NextResponse.json(
      { error: "Failed to fetch menu items. Please try again later." },
      { status: 500 }
    )
  }
}

/* ========================================
=== [POST] Create a New Menu Item Entry ===
========================================= */
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();

    // === Validate request body using Zod schema ===
    const parsed = menuItemFormSchema.parse(body);
    const { item, description, category_id, is_available, price, options } = parsed;

    // === Check for duplicate menu item by name ===
    const duplicate = await checkDuplicate("menuItems", "name", name);
    if (duplicate) {
      return NextResponse.json(
        { message: "This item is already in use." },
        { status: 409 }
      );
    }

    // === Insert new menu item into DB ===
    const result = await insertData("menuItems", {
      name: item.trim(),
      description: description?.trim(),
      category_id: Number(category_id),
      is_available,
      price: price.toFixed(2),
    });

    const itemId = result.insertId;

    // === Insert options if provided ===
    if (options && options.length > 0 && itemId) {
      const optionInsertPromises = options.map((item) =>
        insertData("menuItemOptions", {
          menu_item_id: itemId,
          option_name: item.option_name,
          price: item.price.toFixed(2),
        })
      );

      // Await all inserts
      await Promise.all(optionInsertPromises);
    }

    return NextResponse.json(
      { message: "Menu item created successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error(`[POST ${path}] menu item creation failed:`, error);

    return NextResponse.json(
      { error: "An unexpected error occurred while creating the item. Please try again later." },
      { status: 500 }
    );
  }
}


/* =======================================================
=== [PUT] Update an Existing Menu Item and Its Options ===
======================================================= */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();

    // === Validate input data ===
    const parsed = menuItemFormSchema.parse(body);
    const { id, item, description, category_id, is_available, price, options } = parsed;

    if (!id) {
      return NextResponse.json({ message: 'Item ID is required.' }, { status: 400 });
    }

    // === Update base menu item details by ID ===
    await updateData('menuItems', 'id', id, {
      name: item.trim(),
      description: description?.trim(),
      category_id: Number(category_id),
      is_available,
      price: price.toFixed(2),
    });

    // === Delete all existing options for the menu item ===
    await deleteData('menuItemOptions', 'menu_item_id', id);

    // === Insert updated options if any ===
    if (options && options.length > 0) {
      const optionInsertPromises = options.map((item) =>
        insertData('menuItemOptions', {
          menu_item_id: Number(id),
          option_name: item.option_name,
          price: item.price.toFixed(2),
        })
      );
      await Promise.all(optionInsertPromises);
    }

    return NextResponse.json({ message: 'Menu item updated successfully.' }, { status: 202 });
  } catch (error) {
    console.error(`[PUT ${path}] menu item update failed:`, error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while updating the menu item.' },
      { status: 500 }
    );
  }
}


import { auth } from "@/auth";
import { checkDuplicate, deleteData, getAllData, insertData, updateData } from "@/lib/crud-actions/general-actions"
import { getAllMenuItems } from "@/lib/crud-actions/menu-items";
import { deslugify, mapToLabelValue } from "@/lib/utils";
import { menuItemFormSchema } from "@/lib/zod-schema/restaurant.zod";
import { NextRequest, NextResponse } from "next/server"

import path from 'path';
import fs from 'fs/promises';
import { uploadImage } from "@/lib/server/helpers/imageUpload";

/* ======================================
  === [GET] Fetch All Menu and Its items from DB ===
========================================= */
const apipath = '/api/menu-items'
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // Query parameters
    const categoryParam = req.nextUrl.searchParams.get("category");
    const fetchCategoriesParam = req.nextUrl.searchParams.get("fetch_categories");
    const onlyAvailableParam = req.nextUrl.searchParams.get("only_available");

    // Default: onlyAvailable = false unless explicitly set to "true"
    const onlyAvailable = onlyAvailableParam === "true";

    // Default: fetchCategories = true unless explicitly set to "false"
    const fetchCategories = fetchCategoriesParam !== "false";

    const categoryName = categoryParam ? deslugify(categoryParam) : undefined;

    // Fetch menu items
    const menuItems = await getAllMenuItems(categoryName, onlyAvailable);

    if (!fetchCategories) {
      return NextResponse.json(menuItems, { status: 200 });
    }

    // Fetch and map categories
    const rawCategories = await getAllData("menuCategories");
    const categories = mapToLabelValue(rawCategories, {
      value: "id",
      label: "name",
    });

    return NextResponse.json({ menuItems, categories }, { status: 200 });

  } catch (error) {
    console.error(`[GET ${apipath}] Failed to fetch:`, error);

    return NextResponse.json(
      { error: "Failed to fetch menu items. Please try again later." },
      { status: 500 }
    );
  }
}


/* ========================================
=== [POST] Create a New Menu Item Entry ===
========================================= */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // ✅ Parse multipart form
    const formData = await req.formData();
    const jsonData = formData.get("data");
    const image = formData.get("image") as File | null;

    if (typeof jsonData !== "string") {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    // ✅ Parse and validate Zod data
    let parsed;
    try {
      parsed = menuItemFormSchema.parse(JSON.parse(jsonData));
    } catch (err) {
      return NextResponse.json({ error: "Validation failed", details: err }, { status: 400 });
    }

    const { item, description, category_id, is_available, price, options } = parsed;

    // ✅ Upload image using helper
    let imagePath: string | null = null;
    if (image && image instanceof File) {
      imagePath = await uploadImage(image, "menu_items"); // 👈 Use helper
    }

    // ✅ Check for duplicates
    const duplicate = await checkDuplicate("menuItems", "name", item);
    if (duplicate) {
      return NextResponse.json({ message: "This item is already in use." }, { status: 409 });
    }

    // ✅ Insert menu item
    const result = await insertData("menuItems", {
      name: item.trim(),
      image: imagePath,
      description: description?.trim(),
      category_id: Number(category_id),
      is_available,
      price: price.toFixed(2),
    });

    const itemId = result.insertId;

    // ✅ Insert options
    if (options && options.length > 0 && itemId) {
      const optionInsertPromises = options.map((opt) =>
        insertData("menuItemOptions", {
          menu_item_id: itemId,
          option_name: opt.option_name,
          price: opt.price.toFixed(2),
        })
      );
      await Promise.all(optionInsertPromises);
    }

    return NextResponse.json({ message: "Menu item created successfully." }, { status: 201 });

  } catch (error) {
    console.error("Menu item creation failed:", error);
    return NextResponse.json(
      { error: "Unexpected error while creating menu item." },
      { status: 500 }
    );
  }
}



/* =======================================================
=== [PUT] Update an Existing Menu Item and Its Options ===
======================================================= */

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const formData = await req.formData();

    const jsonData = formData.get("data");
    const file = formData.get("image") as File | null;

    if (!jsonData || typeof jsonData !== "string") {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    // Parse and validate using Zod
    let parsed;
    try {
      parsed = menuItemFormSchema.parse(JSON.parse(jsonData));
    } catch (err) {
      return NextResponse.json({ error: "Validation failed", details: err }, { status: 400 });
    }

    const { id, item, description, category_id, is_available, price, options } = parsed;

    if (!id) {
      return NextResponse.json({ message: "Item ID is required." }, { status: 400 });
    }

    // ✅ Upload image if new one provided
    let imagePath: string | undefined = undefined;
    if (file && file instanceof File) {
      try {
        imagePath = await uploadImage(file, "menu_items");
      } catch (err) {
        console.error("Image upload failed:", err);
        return NextResponse.json({ error: "Image upload failed." }, { status: 500 });
      }
    }

    // ✅ Update base menu item details
    await updateData("menuItems", "id", id, {
      name: item.trim(),
      description: description?.trim(),
      category_id: Number(category_id),
      is_available,
      price: price.toFixed(2),
      ...(imagePath && { image: imagePath }), // Only update image if new one is provided
    });

    // ✅ Delete existing options
    await deleteData("menuItemOptions", "menu_item_id", id);

    // ✅ Insert new options if any
    if (options && options.length > 0) {
      const optionInsertPromises = options.map((item) =>
        insertData("menuItemOptions", {
          menu_item_id: Number(id),
          option_name: item.option_name,
          price: item.price.toFixed(2),
        })
      );
      await Promise.all(optionInsertPromises);
    }

    return NextResponse.json({ message: "Menu item updated successfully." }, { status: 202 });
  } catch (error) {
    console.error(`[PUT /api/menu-items] menu item update failed:`, error);
    return NextResponse.json(
      { error: "An unexpected error occurred while updating the menu item." },
      { status: 500 }
    );
  }
}



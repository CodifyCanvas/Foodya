import { auth } from "@/auth";
import { checkDuplicate, deleteData, getAllData, insertData, updateData } from "@/lib/crud-actions/general-actions"
import { getAllMenuItems } from "@/lib/crud-actions/menu-items";
import { deslugify, mapToLabelValue } from "@/lib/utils";
import { menuItemFormSchema } from "@/lib/zod-schema/restaurant.zod";
import { NextRequest, NextResponse } from "next/server"
import { uploadImage } from "@/lib/server/helpers/imageUpload";



const path = '/api/menu-items';



/*==================================================
=== [GET] Fetch Menu Items (Optionally Filtered) ===
================================================= */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user.id;

    // === Authenticate User ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Extract Query Parameters ===
    const categoryParam = req.nextUrl.searchParams.get("category");
    const fetchCategoriesParam = req.nextUrl.searchParams.get("fetch_categories");
    const onlyAvailableParam = req.nextUrl.searchParams.get("only_available");

    const onlyAvailable = onlyAvailableParam === "true";
    const fetchCategories = fetchCategoriesParam !== "false";
    const categoryName = categoryParam ? deslugify(categoryParam) : undefined;

    // === Fetch Menu Items ===
    const menuItems = await getAllMenuItems(categoryName, onlyAvailable);

    if (!fetchCategories) {
      return NextResponse.json(menuItems, { status: 200 });
    }

    // === Fetch Categories if Required ===
    const rawCategories = await getAllData("menuCategories");
    const categories = mapToLabelValue(rawCategories, {
      value: "id",
      label: "name",
    });

    return NextResponse.json({ menuItems, categories }, { status: 200 });

  } catch (error) {
    console.error(`[GET ${path}] Failed to fetch Menu Items:`, error);

    return NextResponse.json(
      { error: "Something went wrong while fetching menu items. Please try again." },
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

    // === Authenticate User ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Parse Form Data ===
    const formData = await req.formData();
    const jsonData = formData.get("data");
    const image = formData.get("image") as File | null;

    if (typeof jsonData !== "string") {
      return NextResponse.json({ error: "Invalid form submission. Please try again." }, { status: 400 });
    }

    // === Validate Data using Zod ===
    let parsed;
    try {
      parsed = menuItemFormSchema.parse(JSON.parse(jsonData));
    } catch (err) {
      console.error(`[POST ${path}] Validation failed:`, err);
      return NextResponse.json({ error: "Form validation failed. Please check all fields.", details: err }, { status: 400 });
    }

    const { item, description, category_id, is_available, price, options } = parsed;

    // === Upload Profile Image (If Any) ===
    let imagePath: string | null = null;
    if (image && image instanceof File) {
      try {
        imagePath = await uploadImage(image, "menu_items"); // <- use helper
      } catch (err) {
        console.error(`[POST ${path}] Image upload failed:`, err);
        return NextResponse.json({ error: "We couldn't upload the image. Please try again." }, { status: 500 });
      }
    }

    // === Check for Duplicate Item ===
    const duplicate = await checkDuplicate("menuItems", "name", item);
    if (duplicate) {
      return NextResponse.json({ error: "This item name is already taken." }, { status: 409 });
    }

    // === Insert Menu Item ===
    const result = await insertData("menuItems", {
      name: item.trim(),
      image: imagePath,
      description: description?.trim(),
      category_id: Number(category_id),
      is_available,
      price: price.toFixed(2),
    });

    const itemId = result.insertId;

    // === Insert Item Options if Any ===
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

    return NextResponse.json({ message: "Menu item created successfully!" }, { status: 201 });

  } catch (error) {
    console.error(`[POST ${path}] Menu Item Creation Failed:`, error);

    return NextResponse.json(
      { error: "Something went wrong while creating the menu item. Please try again later." },
      { status: 500 }
    );
  }
}



/* ====================================================
=== [PUT] Update Existing Menu Item and Its Options ===
==================================================== */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user.id;

    // === Authenticate User ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Parse Form Data ===
    const formData = await req.formData();
    const jsonData = formData.get("data");
    const file = formData.get("image") as File | null;

    if (!jsonData || typeof jsonData !== "string") {
      return NextResponse.json({ error: "Invalid form submission. Please try again." }, { status: 400 });
    }

    // === Validate with Zod ===
    let parsed;
    try {
      parsed = menuItemFormSchema.parse(JSON.parse(jsonData));
    } catch (err) {
      console.error(`[PUT ${path}] Validation failed:`, err);
      return NextResponse.json({ error: "Form validation failed. Please check all fields.", details: err }, { status: 400 });
    }

    const { id, item, description, category_id, is_available, price, options } = parsed;

    if (!id) {
      return NextResponse.json({ error: "Missing menu item ID." }, { status: 400 });
    }

    // === Upload Profile Image (If Any) ===
    let imagePath: string | undefined = undefined;
    if (file && file instanceof File) {
      try {
        imagePath = await uploadImage(file, "menu_items"); // <- use helper
      } catch (err) {
        console.error(`[PUT ${path}] Image upload failed:`, err);
        return NextResponse.json({ error: "We couldn't upload the image. Please try again." }, { status: 500 });
      }
    }

    // === Update Menu Item ===
    await updateData("menuItems", "id", id, {
      name: item.trim(),
      description: description?.trim(),
      category_id: Number(category_id),
      is_available,
      price: price.toFixed(2),
      ...(imagePath && { image: imagePath }), // Only update image if new one is provided
    });

    // === Replace Item Options ===
    await deleteData("menuItemOptions", "menu_item_id", id);
    if (options?.length) {
      await Promise.all(
        options.map(opt =>
          insertData("menuItemOptions", {
            menu_item_id: Number(id),
            option_name: opt.option_name,
            price: opt.price.toFixed(2),
          })
        )
      );
    }

    return NextResponse.json({ message: "Menu item updated successfully." }, { status: 202 });

  } catch (error) {
    console.error(`[PUT ${path}] menu item update failed:`, error);

    return NextResponse.json(
      { error: "Something went wrong while updating the item. Please try again later." },
      { status: 500 }
    );
  }
}



/* ====================================
=== [Delete] Soft Delete Menu Items ===
==================================== */
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
      return NextResponse.json({ error: "Missing menu item ID. Please try again." }, { status: 400 });
    }

    // === Perform Soft Delete Action ===
    await updateData('menuItems', "id", id, {
      isDeleted: true,
      is_available: false,
    });

    // === Return Success Response ===
    return NextResponse.json({ message: "Menu item deleted successfully." }, { status: 200 });
  } catch (error) {
    console.error("Error while soft deleting menu item: ", error);

    return NextResponse.json(
      { error: "Something went wrong while deleting the menu item." },
      { status: 500 }
    );
  }
}
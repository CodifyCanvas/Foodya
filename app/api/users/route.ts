import { auth } from "@/auth";
import { checkDuplicate, deleteData, getAllData, insertData, updateData } from "@/lib/crud-actions/general-actions";
import { getAllUserWithRole } from "@/lib/crud-actions/users";
import { uploadImage } from "@/lib/server/helpers/imageUpload";
import { mapToLabelValue } from "@/lib/utils";
import { userFormSchema } from "@/lib/zod-schema";
import { NextRequest, NextResponse } from "next/server";



const path = '/api/users';



/* =============================================================
=== [GET] Fetch All Users Along With Their Roles from the DB ===
============================================================= */
export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user.id;

    // === Authenticate User ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Fetch all users with their roles ===
    const users = await getAllUserWithRole();

    // === Fetch all roles ===
    const roles = await getAllData("roles");

    // === Map roles for frontend (label/value) ===
    const formattedRoles = mapToLabelValue(roles, { label: "role", value: "id" });

    return NextResponse.json({ users, roles: formattedRoles }, { status: 200 });

  } catch (error) {
    console.error(`[GET ${path}] Failed to fetch users:`, error);

    return NextResponse.json(
      { error: "Failed to fetch users. Please try again later." },
      { status: 500 }
    );
  }
}

/* ===================================
=== [POST] Create a New User Entry ===
=================================== */
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
    const parsed = userFormSchema.safeParse(JSON.parse(jsonData));

    if (!parsed.success) {
      console.error(`[POST ${path}] Validation failed:`, parsed.error);
      return NextResponse.json(
        { error: "Form validation failed.", details: parsed.error },
        { status: 400 }
      );
    }

    const { name, email, password, is_active, role_id } = parsed.data;

    // === Check for duplicate email ===
    const duplicate = await checkDuplicate("users", "email", email);
    if (duplicate) {
      return NextResponse.json(
        { message: "Email already exists. Please use another." },
        { status: 409 }
      );
    }

    // === Upload Profile Image (If Any) ===
    let imagePath: string | null = null;
    if (image && image instanceof File) {
      try {
        imagePath = await uploadImage(image, "users"); // <- use helper
      } catch (err) {
        console.error(`[POST ${path}] Image upload failed:`, err);
        return NextResponse.json({ error: "Image upload failed. Please try again." }, { status: 500 });
      }
    }

    // === Insert new user into DB ===
    await insertData("users", {
      image: imagePath,
      name: name.trim(),
      email,
      password,
      is_active,
      role_id: Number(role_id),
    });

    return NextResponse.json(
      { message: "User created successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error(`[POST ${path}] User creation failed:`, error);

    return NextResponse.json(
      { error: "Oops! Something went wrong while creating the user. Please try again." },
      { status: 500 }
    );
  }
}



/* ==================================
=== [PUT] Update an Existing User ===
================================== */
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
    const image = formData.get("image") as File | null;

    if (typeof jsonData !== "string") {
      return NextResponse.json({ error: "Invalid form submission. Please try again." }, { status: 400 });
    }

    // === Validate Data using Zod ===
    const parsed = userFormSchema.safeParse(JSON.parse(jsonData));

    if (!parsed.success) {
      console.error(`[POST ${path}] Validation failed:`, parsed.error);
      return NextResponse.json(
        { error: "Form validation failed.", details: parsed.error },
        { status: 400 }
      );
    }

    const { id, name, email, password, is_active, role_id } = parsed.data;

    if (!id) {
      return NextResponse.json(
        { error: "User ID is missing. Cannot perform update." },
        { status: 400 }
      );
    }

    /* ====================================================
        === Handle Image Cases ===
        - Case 01: No image in formData → keep existing
        - Case 02: Image removed → file is string ''
        - Case 03: New image uploaded → file is File instance
        ===================================================== */

    // === Case 02 ===
    if (typeof image === "string" && image !== null) {
      await updateData("users", "id", id, { image: null })
    }

    // === Upload Profile Image (If Any) ===
    let imagePath: string | undefined = undefined;
    if (image && image instanceof File) {
      try {
        imagePath = await uploadImage(image, "users"); // <- use helper
      } catch (err) {
        console.error(`[PUT ${path}] Image upload failed:`, err);
        return NextResponse.json({ error: "We couldn't upload the image. Please try again." }, { status: 500 });
      }
    }

    // === Update user ===
    await updateData("users", "id", id, {
      name: name.trim(),
      email,
      password,
      is_active,
      role_id: Number(role_id),
      ...(imagePath && { image: imagePath })
    });

    return NextResponse.json(
      { message: "User updated successfully." },
      { status: 202 }
    );

  } catch (error) {
    console.error(`[PUT ${path}] User update failed:`, error);
    return NextResponse.json(
      { error: "Oops! Something went wrong while updating the user. Please try again." },
      { status: 500 }
    );
  }
}



/* ==========================
=== [DELETE] Delete Users ===
========================== */
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
    if (!id || isNaN(id)) {
      return NextResponse.json({ error: "Invalid or missing user ID." }, { status: 400 });
    }

    // === Perform Delete Action ===
    await deleteData("users", "id", id)

    // === Return Success Response ===
    return NextResponse.json({ message: "User successfully deleted." }, { status: 200 });
  } catch (error) {
    console.error(`[DELETE ${path}] Failed to delete user: `, error);

    return NextResponse.json(
      { error: "Failed to delete employee. Please try again." },
      { status: 500 }
    );
  }
}
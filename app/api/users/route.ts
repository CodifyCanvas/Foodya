import { auth } from "@/auth";
import { checkDuplicate, getAllData, insertData, updateData } from "@/lib/crud-actions/general-actions";
import { getAllUserWithRole } from "@/lib/crud-actions/users";
import { mapToLabelValue } from "@/lib/utils";
import { userFormSchema } from "@/lib/zod-schema";
import { NextRequest, NextResponse } from "next/server";

const path = '/api/users'

/* ==============================================
  === [GET] Fetch All Users and Roles from DB ===
============================================== */
export async function GET() {
  try {
    const session = await auth()
    const userId = session?.user.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Fetch all users with their roles ===
    const users = await getAllUserWithRole();

    // === Fetch all roles ===
    const roles = await getAllData("roles");

    // === Map roles to label/value pairs for frontend combobox usage ===
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

/* ======================================
  === [POST] Create a New User Entry ===
========================================= */
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();

    // === Validate request body with Zod schema ===
    const parsed = userFormSchema.parse(body);
    const { name, email, password, is_active, role_id } = parsed;

    // === Check for duplicate email in users table ===
    const duplicate = await checkDuplicate("users", "email", email);
    if (duplicate) {
      return NextResponse.json(
        { message: "The email address is already in use." },
        { status: 409 }
      );
    }

    // === Insert new user into DB ===
    await insertData("users", {
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
      { error: "An unexpected error occurred while creating the User. Please try again later." },
      { status: 500 }
    );
  }
}

/* ======================================
  === [PUT] Update an Existing User ===
========================================= */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();

    // === Validate input data with Zod schema ===
    const parsed = userFormSchema.parse(body);
    const { id, name, email, password, is_active, role_id } = parsed;

    if (!id) {
      return NextResponse.json(
        { message: "User id is missing so it can't be updated." },
        { status: 404 }
      );
    }

    // === Update user data in DB by ID ===
    await updateData("users", "id", id, {
      name: name.trim(),
      email,
      password,
      is_active,
      role_id: Number(role_id),
    });

    return NextResponse.json(
      { message: "User updated successfully." },
      { status: 202 }
    );
  } catch (error) {
    console.error(`[PUT ${path}] User update failed:`, error);
    return NextResponse.json(
      { error: "An unexpected error occurred while updating the User. Please try again later." },
      { status: 500 }
    );
  }
}

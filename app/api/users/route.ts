import { auth } from "@/auth";
import { checkDuplicate, getAllData, insertData, updateData } from "@/lib/crud-actions/general-actions";
import { getAllUserWithRole } from "@/lib/crud-actions/users";
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

    // === Parse and validate request body ===
    const body = await req.json();
    const { name, email, password, is_active, role_id } = userFormSchema.parse(body);

    // === Check for duplicate email ===
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

    // === Parse and validate request body ===
    const body = await req.json();
    const { id, name, email, password, is_active, role_id } = userFormSchema.parse(body);

    if (!id) {
      return NextResponse.json(
        { message: "User ID is missing; update cannot proceed." },
        { status: 400 }
      );
    }

    // === Update user ===
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
      { error: "Oops! Something went wrong while updating the user. Please try again." },
      { status: 500 }
    );
  }
}

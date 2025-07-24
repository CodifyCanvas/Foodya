import { checkDuplicate, getAllData, insertData, updateData } from "@/lib/crud-actions/general-actions";
import { getAllUserWithRole } from "@/lib/crud-actions/users";
import { mapToLabelValue } from "@/lib/utils";
import { userFormSchema } from "@/lib/zod-schema";
import { NextRequest, NextResponse } from "next/server";

const path = '/api/permission'

/* ======================================
  === [GET] Fetch All Permissions from DB ===
========================================= */
export async function GET() {
  try {
    const user = await getAllUserWithRole();
    const role = await getAllData("roles");

    // Convert roles into label/value format for the combobox
    const formattedRoles = mapToLabelValue(role, { label: "role", value: "id" });

    return NextResponse.json({ users: user, roles: formattedRoles }, { status: 200 });
  } catch (error) {
    console.error(`[GET ${path}] Failed to fetch permissions:`, error);
    return NextResponse.json(
      { error: "Failed to fetch permissions. Please try again later." },
      { status: 500 }
    );
  }
}

/* ======================================
  === [POST] Create a New Permissions Entry ===
========================================= */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request body using Zod
    const parsed = userFormSchema.parse(body);
    const { name, email, password, is_active, role_id } = parsed;

    // Check for duplicate email
    const duplicate = await checkDuplicate("users", "email", email);
    if (duplicate) {
      return NextResponse.json(
        { message: "The email address is already in use." },
        { status: 409 }
      );
    }

    // Insert user into DB
    await insertData("users", {
      name: name.trim(),
      email,
      password,
      is_active,
      role_id: Number(role_id),
    });

    return NextResponse.json({ message: "Permission created successfully." }, { status: 201 });
  } catch (error) {
    console.error(`[POST ${path}] permission creation failed:`, error);
    return NextResponse.json(
      { error: "An unexpected error occurred while creating the permission. Please try again later." },
      { status: 500 }
    );
  }
}

/* ======================================
  === [PUT] Update an Existing Role ===
========================================= */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input with Zod
    const parsed = userFormSchema.parse(body);
    const { id, name, email, password, is_active, role_id } = parsed;

    if (!id) {
      return NextResponse.json(
        { message: "User id is missing so it can't be updated." },
        { status: 404 }
      );
    }

    // Update user in DB
    await updateData("users", "id", id, {
      name: name.trim(),
      email,
      password,
      is_active,
      role_id: Number(role_id),
    });

    return NextResponse.json({ message: "Permission updated successfully." }, { status: 202 });
  } catch (error) {
    console.error(`[PUT ${path}] permission update failed:`, error);
    return NextResponse.json(
      { error: "An unexpected error occurred while updating the permission. Please try again later." },
      { status: 500 }
    );
  }
}

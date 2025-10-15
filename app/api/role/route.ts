import { auth } from "@/auth";
import { checkDuplicate, getAllData, insertData, updateData } from "@/lib/crud-actions/general-actions";
import { roleFormSchema } from "@/lib/zod-schema";
import { NextRequest, NextResponse } from "next/server";



const path = '/api/role';



/* ==================================
=== [GET] Fetch All Roles from DB ===
================================== */
export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user.id;

    // === Authenticate User ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Retrieve All Roles ===
    const roles = await getAllData("roles");

    return NextResponse.json(roles, { status: 200 });

  } catch (error) {
    console.error(`[GET ${path}] Failed to fetch roles:`, error);

    return NextResponse.json(
      { error: "Something went wrong while loading the roles. Please try again shortly." },
      { status: 500 }
    );
  }
}



/* ==========================================
=== [POST] Create a New Role in Database  ===
========================================== */
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
    const parsed = roleFormSchema.parse(body);
    const { role } = parsed;

    // === Check if Role Already Exists ===
    const duplicate = await checkDuplicate("roles", "role", role);

    if (duplicate) {
      return NextResponse.json(
        { error: `The role "${role}" already exists.` },
        { status: 409 }
      );
    }

    // === Insert New Role ===
    await insertData("roles", { role: role?.trim()?.toLowerCase() });

    return NextResponse.json(
      { message: `Role "${role}" has been added successfully.` },
      { status: 201 }
    );

  } catch (error) {
    console.error(`[POST ${path}] Failed to create role:`, error);

    return NextResponse.json(
      { error: "We couldn't create the role due to an internal error. Please try again in a moment." },
      { status: 500 }
    );
  }
}



/* ==============================================
=== [PUT] Update an Existing Role in Database ===
============================================== */
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
    const parsed = roleFormSchema.parse(body);
    const { id, role } = parsed;

    // === Extract and Normalize Previous Role ===
    const { previousRole } = body;

    // === Define Protected System Roles ===
    const protectedRoles = ["waiter"];

    // === Block Update if Role is Protected ===
    if (protectedRoles.includes(previousRole?.toLowerCase())) {
      return NextResponse.json(
        { error: `The '${previousRole}' role is protected and cannot be modified.` },
        { status: 403 }
      );
    }

    // === Update Role in Database ===
    await updateData("roles", "id", id!, { role: role.trim() });

    return NextResponse.json(
      { message: `Role has been updated to "${role}".` },
      { status: 202 }
    );

  } catch (error) {
    console.error(`[PUT ${path}] Failed to update role:`, error);

    return NextResponse.json(
      { error: "Something went wrong while updating the role. Please try again later." },
      { status: 500 }
    );
  }
}
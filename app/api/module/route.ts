import { auth } from "@/auth";
import { checkDuplicate, getAllData, insertData, updateData } from "@/lib/crud-actions/general-actions";
import { moduleFormSchema } from "@/lib/zod-schema";
import { NextRequest, NextResponse } from "next/server";



const path = '/api/module';



/* ===================================
=== [GET] Fetch All Module from DB ===
=================================== */
export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user.id;

    // === Authenticate User ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Retrieve all modules from the database ===
    const modules = await getAllData("modules");

    return NextResponse.json(modules, { status: 200 });
  } catch (error) {
    console.error(`[GET ${path}] Failed to fetch modules:`, error);

    return NextResponse.json(
      { error: "Failed to fetch module. Please try again later." },
      { status: 500 }
    );
  }
}



/* ============================================
=== [POST] Create a New Module (Page) Entry ===
============================================ */
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
    const parsed = moduleFormSchema.parse(body);
    const { name, label } = parsed;

    // === Check for duplicate module name ===
    const duplicate = await checkDuplicate("modules", "name", name);

    if (duplicate) {
      return NextResponse.json(
        { error: "This Module is already in use." },
        { status: 409 }
      );
    }

    // === Insert new module record ===
    await insertData("modules", {
      name: name.trim().toLowerCase(),
      label: label?.trim() ?? ""
    });

    return NextResponse.json(
      { message: "Module created successfully." },
      { status: 201 }
    );

  } catch (error) {
    console.error(`[POST ${path}] Module creation failed:`, error);

    return NextResponse.json(
      { error: "Something went wrong while creating the module. Please try again." },
      { status: 500 }
    );
  }
}

/* ====================================
=== [PUT] Update an Existing Module ===
==================================== */
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
    const parsed = moduleFormSchema.parse(body);
    const { id, name, label } = parsed;

    // === Update the module ===
    await updateData("modules", "id", id!, {
      name: name.trim().toLowerCase(),
      label: label?.trim()
    });

    return NextResponse.json(
      { message: "Module updated successfully." },
      { status: 202 }
    );

  } catch (error) {
    console.error(`[PUT ${path}] Module update failed:`, error);

    return NextResponse.json(
      { error: "Something went wrong while creating the module. Please try again." },
      { status: 500 }
    );
  }
}
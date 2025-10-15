import { auth } from "@/auth";
import { getAllData, insertData, updateData } from "@/lib/crud-actions/general-actions";
import { getPermissionsViaRoleId } from "@/lib/crud-actions/permission";
import { permissionsFormSchema } from "@/lib/zod-schema";
import { NextRequest, NextResponse } from "next/server";



const path = "/api/permission";



/* =====================================================
=== [GET] Return All Roles (Used in Permission View) ===
===================================================== */
export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user.id;

    // === Authenticate User ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Fetch all roles from the database ===
    const roles = await getAllData("roles");

    return NextResponse.json(roles, { status: 200 });
  } catch (error) {
    console.error(`[GET ${path}] Failed to fetch roles:`, error);

    return NextResponse.json(
      { error: "We couldn't load the roles right now. Please try again in a moment." },
      { status: 500 }
    );
  }
}



/* =============================================================
=== [POST] Fetch permissions for a role (used on modal open) ===
============================================================= */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user.id;

    // === Authenticate User ===
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // === Parse Request Body ===
    const { id } = await req.json();

    // === Validate input ===
    if (!id) {
      return NextResponse.json(
        { error: "Oops! We couldn't find the role. Please try again." },
        { status: 404 }
      );
    }

    // === Fetch current permissions for the selected role ===
    const existingPermissions = await getPermissionsViaRoleId(Number(id));

    // === Fetch all modules ===
    const allModules = await getAllData("modules");

    // === Create a map of existing permissions for quick lookup ===
    const permissionMap = new Map<number, typeof existingPermissions[0]>();
    existingPermissions.forEach((perm) => permissionMap.set(perm.module_id, perm));

    // === Combine permissions with module list ===
    const combined = allModules.map((mod) => {
      return permissionMap.get(mod.id) || {
        id: 0, // <- Unsaved permission have id '0'
        role_id: Number(id),
        role_name: "",
        module_id: mod.id,
        module_name: mod.name,
        can_view: false,
        can_create: false,
        can_edit: false,
        can_delete: false,
      };
    });

    return NextResponse.json(combined, { status: 202 });
  } catch (error) {
    console.error(`[POST ${path}] Permissions fetch failed:`, error);

    return NextResponse.json(
      { error: "Something went wrong while loading permissions. Please try again." },
      { status: 500 }
    );
  }
}



/* ==================================================
=== [PUT] Update or Insert Permissions for a Role ===
================================================== */
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
    const parsed = permissionsFormSchema.parse(body);

    // === Insert or Update permissions accordingly ===
    await Promise.all(
      parsed.map((item) => {
        const basePayload = {
          role_id: Number(item.role_id),
          module_id: Number(item.module_id),
          label: item.label ?? "",
          can_view: item.can_view,
          can_create: item.can_create,
          can_edit: item.can_edit,
          can_delete: item.can_delete,
        };

        // === Update existing permission if `id` is present (means it is greater then 0) ===
        if (item.id) {
          return updateData("permissions", "id", item.id, basePayload);
        }

        // === Insert new permission if any checkbox is true ===
        if (
          item.can_view ||
          item.can_create ||
          item.can_edit ||
          item.can_delete
        ) {
          return insertData("permissions", basePayload);
        }

        // === Skip inserting if all are false ===
        return Promise.resolve();
      })
    );

    return NextResponse.json(
      { message: "Permissions updated successfully!" },
      { status: 202 }
    );
  } catch (error) {
    console.error(`[PUT ${path}] Permissions update failed:`, error);

    return NextResponse.json(
      { error: "Something went wrong while updating permissions. Please try again." },
      { status: 500 }
    );
  }
}
import { auth } from "@/auth";
import { getAllData, insertData, updateData } from "@/lib/crud-actions/general-actions";
import { getPermissionsViaRoleId } from "@/lib/crud-actions/permission";
import { permissionsFormSchema } from "@/lib/zod-schema";
import { NextRequest, NextResponse } from "next/server";

const path = "/api/permission";

/* =======================================================
  [GET] Return all roles (used as part of permissions view)
========================================================== */
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user.id) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const roles = await getAllData("roles");

    return NextResponse.json(roles, { status: 200 });
  } catch (error) {
    console.error(`[GET ${path}] Failed to fetch roles:`, error);

    return NextResponse.json(
      { error: "Failed to fetch roles. Please try again later." },
      { status: 500 }
    );
  }
}

/* =======================================================
  [POST] Fetch permissions for a role (used on modal open)
========================================================== */
export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();

    // === Validate input ===
    if (!id) {
      return NextResponse.json(
        { message: "Role id is missing; cannot fetch permissions." },
        { status: 404 }
      );
    }

    // === Fetch role's current permissions ===
    const existingPermissions = await getPermissionsViaRoleId(Number(id));

    // === Fetch all modules in the system ===
    const allModules = await getAllData("modules");

    // === Create a map of existing permissions for quick lookup ===
    const permissionMap = new Map<number, typeof existingPermissions[0]>();
    existingPermissions.forEach((perm) => permissionMap.set(perm.module_id, perm));

    // === Combine modules with their permissions (or defaults) ===
    const combined = allModules.map((mod) => {
      // If permission exists for this module, use it
      if (permissionMap.has(mod.id)) {
        return permissionMap.get(mod.id);
      }

      // Otherwise, return default permission structure
      return {
        id: 0, // Means not saved yet
        role_id: Number(id),
        role_name: "", // Not required in this context
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
    console.error(`[POST ${path}] Permission fetch failed:`, error);

    return NextResponse.json(
      { error: "An unexpected error occurred while fetching permissions." },
      { status: 500 }
    );
  }
}

/* =======================================================
  [PUT] Update or insert permissions for a role
========================================================== */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    // === Validate incoming data using Zod schema ===
    const parsed = permissionsFormSchema.parse(body);

    // === Perform updates and inserts in parallel ===
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

        // === Update existing permission if `id` is present ===
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

        // === If all permissions are false, skip insert ===
        return Promise.resolve();
      })
    );

    return NextResponse.json(
      { message: "Permission updated successfully." },
      { status: 202 }
    );
  } catch (error) {
    console.error(`[PUT ${path}] Permission update failed:`, error);

    return NextResponse.json(
      { error: "An unexpected error occurred while updating permissions." },
      { status: 500 }
    );
  }
}

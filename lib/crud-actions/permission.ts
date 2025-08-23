"use server";

import { schema } from "@/lib/drizzle-schema";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { Permissions as PermissionType } from "../definations";

// === Tables ===
const modules = schema.modules;
const roles = schema.roles;
const permissions = schema.permissions;

// === Get permissions assigned to a specific role ID ===
export const getPermissionsViaRoleId = async (id: number): Promise<PermissionType[]> => {
  const result = await db
    .select({
      id: permissions.id,
      role_id: permissions.role_id,
      role_name: roles.role,
      module_id: permissions.module_id,
      module_name: modules.name,
      can_view: permissions.can_view,
      can_create: permissions.can_create,
      can_edit: permissions.can_edit,
      can_delete: permissions.can_delete,
    })
    .from(permissions)
    .where(eq(permissions.role_id, id))
    .innerJoin(roles, eq(permissions.role_id, roles.id))
    .innerJoin(modules, eq(permissions.module_id, modules.id));

  // === Normalize result and ensure fallback values ===
  return result.map((row) => ({
    id: row.id,
    role_id: row.role_id ?? 0,
    role_name: row.role_name,
    module_id: row.module_id ?? 0,
    module_name: row.module_name,
    can_view: row.can_view ?? false,
    can_create: row.can_create ?? false,
    can_edit: row.can_edit ?? false,
    can_delete: row.can_delete ?? false,
  }));
};

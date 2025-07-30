"use server";

import { schema } from "@/lib/drizzle-schema";
import { db } from "../db";
import { eq } from "drizzle-orm";

const modules = schema.modules
const roles = schema.roles
const permissions = schema.permissions

type PermissionDetails = {
  id: number;
  role_id: number;
  role_name: string;
  module_id: number;
  module_name: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
};

export const getPermissionsViaRoleId = async (id: number): Promise<PermissionDetails[]> => {
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

  return result;
};

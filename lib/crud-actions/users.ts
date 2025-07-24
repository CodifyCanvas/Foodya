"use server";

import { roles, users } from "@/lib/drizzle-schema/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { User } from "@/app/restaurant/users/columns";

export const getAllUserWithRole = async () => {
    const result = await db
        .select()
        .from(users)
        .leftJoin(roles, eq(roles.id, users.role_id));

    const formattedResult: User[] = result.map((row) => ({
        id: row.users.id,
        name: row.users.name ?? "", // fallback
        password: row.users.password ,
        email: row.users.email,
        is_active: row.users.is_active ?? false, // fallback
        role_id: String(row.users.role_id) ?? "", // fallback
        role_name: row.roles?.role ?? "",
        created_at: row.users.created_at ?? new Date(),
    }));

    return formattedResult ?? [];
}
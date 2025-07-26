"use server";

import { roles, users } from "@/lib/drizzle-schema/schema";
import { db } from "../db";
import { and, eq } from "drizzle-orm";
import { User } from '@/lib/definations'

export const getAllUserWithRole = async () => {
    const result = await db
        .select()
        .from(users)
        .leftJoin(roles, eq(roles.id, users.role_id));

    const formattedResult: User[] = result.map((row) => ({
        id: row.users.id,
        name: row.users.name ?? "", // fallback
        password: row.users.password,
        email: row.users.email,
        is_active: row.users.is_active ?? false, // fallback
        role_id: String(row.users.role_id) ?? "", // fallback
        role_name: row.roles?.role ?? "",
        created_at: row.users.created_at ?? new Date(),
    }));

    return formattedResult ?? [];
}

export const getUserWithRole = async (id: number) => {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .leftJoin(roles, eq(roles.id, users.role_id));

  if (!result || result.length === 0) {
    throw new Error('User not found');
  }

  const row = result[0];

  return {
    id: row.users.id,
    name: row.users.name ?? '',
    password: row.users.password,
    email: row.users.email,
    is_active: row.users.is_active ?? false,
    role_id: String(row.users.role_id) ?? '',
    role_name: row.roles?.role ?? '',
    created_at: row.users.created_at ?? new Date(),
  };
};

export const getUserForSignin = async (email: string, password: string) => {
  try {
    const result = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), eq(users.password, password)))
      .leftJoin(roles, eq(users.role_id, roles.id))
      .limit(1);

    const row = result[0];

    if (!row) {
      return null;
    }

    return {
      id: String(row.users.id),
      name: row.users.name ?? "",
      email: row.users.email,
      is_active: row.users.is_active ?? false,
      role_id: String(row.users.role_id) ?? "",
      role_name: row.roles?.role ?? "",
      created_at: row.users.created_at ?? new Date(),
    };
  } catch (error) {
    console.error("Signin error:", error);
    throw new Error("Unable to sign in");
  }
};
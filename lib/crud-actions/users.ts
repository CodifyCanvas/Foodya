"use server";

import { schema } from "@/lib/drizzle-schema";
import { db } from "../db";
import { and, eq } from "drizzle-orm";
import { User } from '@/lib/definations'



// === Drizzle table schemas ===
const users = schema.users;
const roles = schema.roles;



/**
 * === Fetch All Users with Their Roles ===
 *
 * - Uses LEFT JOIN on `roles` via Drizzle ORM.
 * - Normalizes null fields (e.g., name, is_active, role_name, created_at).
 * 
 * @returns {Promise<User[]>} List of users with role info.
 */
export const getAllUserWithRole = async (): Promise<User[]> => {

  // === Query: Join users with their roles ===
  const result = await db
    .select()
    .from(users)
    .leftJoin(roles, eq(roles.id, users.role_id));

  // === Format and normalize the result ===
  const formattedResult: User[] = result.map((row) => ({
    id: row.users.id,
    name: row.users.name ?? "",
    image: row.users.image ?? null,
    password: row.users.password,
    email: row.users.email,
    is_active: row.users.is_active ?? false,
    role_id: String(row.users.role_id) ?? "",
    role_name: row.roles?.role ?? "", // fallback
    created_at: row.users.created_at ?? new Date(),
  }));

  // === Always return an array (never undefined/null) ===
  return formattedResult;
};



/**
 * === Fetch a Specific User with Role Info ===
 *
 * - Uses LEFT JOIN on `roles` via Drizzle ORM.
 * - Fetches a single user by ID and includes their role name.
 * - Normalizes null fields (e.g., name, is_active, role_name, created_at).
 * 
 * @param id - The user ID to look up.
 * @returns {Promise<User>} A single user object with role info.
 * @throws If no user is found with the given ID.
 */
export const getUserWithRole = async (id: number): Promise<User> => {

  // === Query: Fetch user by ID and join their role ===
  const [result] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .leftJoin(roles, eq(roles.id, users.role_id));

  // === Handle case: No user found ===
  if (!result) {
    throw new Error('User not found');
  }

  // === Format and normalize the user data ===
  return {
    id: result.users.id,
    image: result.users.image ?? null,
    name: result.users.name ?? '',
    password: result.users.password,
    email: result.users.email,
    is_active: result.users.is_active ?? false,
    role_id: String(result.users.role_id) ?? '',
    role_name: result.roles?.role ?? '',
    created_at: result.users.created_at ?? new Date(),
  } as User;
};



/**
 * === Fetch User for Sign-In ===
 *
 * - Checks credentials by matching email and password.
 * - Uses LEFT JOIN on `roles` to attach role name.
 * - Normalizes null fields (e.g., name, is_active, role_name, created_at).
 *
 * @param email - The email address used to log in.
 * @param password - The raw password (ideally already hashed).
 * @returns A user object with role info, or null if no match.
 * @throws If a database error occurs during sign-in.
 */
export const getUserForSignin = async (email: string, password: string) => {
  try {
    // === Query: Match user by email and password ===
    const [row] = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), eq(users.password, password)))
      .leftJoin(roles, eq(users.role_id, roles.id))
      .limit(1);

    // === If no match found, return null ===
    if (!row) {
      return null;
    }

    // === Format and normalize user data ===
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
    throw new Error("Something went wrong while trying to sign in. Please try again.");
  }
};
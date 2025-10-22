import { boolean, int, mysqlTable, text, timestamp, varchar } from 'drizzle-orm/mysql-core';



/**
 * === ROLES TABLE ===
 * Defines user roles like admin, operator, etc.
 */
export const roles = mysqlTable('roles', {
  id: int().autoincrement().primaryKey(),
  role: varchar({ length: 255 }).notNull().unique(),
});



/**
 * === MODULES TABLE ===
 * Represents application modules or pages, such as User Management, Roles, etc.
 */
export const modules = mysqlTable('modules', {
  id: int().autoincrement().primaryKey(),
  name: varchar({ length: 255 }).notNull().unique(),
  label: varchar({ length: 255 }),
});



/**
 * === USERS TABLE ===
 * Stores user accounts and links each user to a role.
 */
export const users = mysqlTable('users', {
  id: int().autoincrement().primaryKey(),
  image: text(),
  name: varchar({ length: 255 }),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 50 }).notNull(),
  is_active: boolean().default(false),
  role_id: int().references(() => roles.id, { onDelete: 'cascade' }),
  created_at: timestamp().defaultNow(),
});



/**
 * === PERMISSIONS TABLE ===
 * Defines access rights per role per module.
 */
export const permissions = mysqlTable('permissions', {
  id: int().autoincrement().primaryKey(),
  role_id: int().references(() => roles.id, { onDelete: 'cascade' }),
  module_id: int().references(() => modules.id, { onDelete: 'cascade' }),
  label: varchar({ length: 255 }),
  can_view: boolean().default(false),
  can_edit: boolean().default(false),
  can_create: boolean().default(false),
  can_delete: boolean().default(false),
});



// === Schema Export ===
export const adminSchema = {
  users,
  roles,
  modules,
  permissions
};

export type AdminSchema = typeof adminSchema;
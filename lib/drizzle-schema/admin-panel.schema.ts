import { boolean, int, mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core';


/**
 * USERS TABLE
 * Stores user accounts and links each user to a role.
 */
const users = mysqlTable('users', {
  id: int().autoincrement().primaryKey(),                      // Primary key
  name: varchar({ length: 255 }),                              // User's full name (optional)
  email: varchar({ length: 255 }).notNull().unique(),          // Unique email address (required)
  password: varchar({ length: 50 }).notNull(),                 // User's hashed password (required)
  is_active: boolean().default(false),                         // Account active status
  role_id: int().references(() => roles.id),                   // Foreign key to roles
  created_at: timestamp().defaultNow(),                        // Timestamp of account creation
});


/**
 * ROLES TABLE
 * Defines user roles like admin, operator, etc.
 */
const roles = mysqlTable('roles', {
  id: int().autoincrement().primaryKey(),                      // Primary key
  role: varchar({ length: 255 }).notNull().unique(),           // Role name (e.g., "admin", "user")
});

/**
 * MODULES TABLE
 * Represents application modules or pages, such as User Management, Roles, etc.
 */
const modules = mysqlTable('modules', {
  id: int().autoincrement().primaryKey(),                      // Primary key
  name: varchar({ length: 255 }).notNull().unique(),           // Technical name of the module (e.g., "users", "roles")
  label: varchar({ length: 255 }),                             // Human-readable name (e.g., "User Management")
});

/**
 * PERMISSIONS TABLE
 * Defines access rights per role per module.
 */
const permissions = mysqlTable('permissions', {
  id: int().autoincrement().primaryKey(),                      // Primary key
  role_id: int().references(() => roles.id),                   // Foreign key to roles
  module_id: int().references(() => modules.id),               // Foreign key to modules
  label: varchar({ length: 255 }),                             // Permission label (optional UI-friendly name)
  can_view: boolean().default(false),                          // Can view the module
  can_edit: boolean().default(false),                          // Can edit items in the module
  can_create: boolean().default(false),                        // Can create items in the module
  can_delete: boolean().default(false),                        // Can delete items in the module
});

export const adminSchema = {
  users,
  roles,
  modules,
  permissions
};

export type AdminSchema = typeof adminSchema;
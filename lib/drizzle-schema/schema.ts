import { boolean, int, mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core';


export const users = mysqlTable('users', {
  id: int().autoincrement().primaryKey(),
  name: varchar({ length: 255 }),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 50 }).notNull(),
  is_active: boolean().default(false),
  role_id: int().references(() => roles.id),
  created_at: timestamp().defaultNow(),
});

export const roles = mysqlTable('roles', {
  id: int().autoincrement().primaryKey(),
  role: varchar({ length: 255 }).notNull().unique(),
});

export const modules = mysqlTable('modules', {
  id: int().autoincrement().primaryKey(),
  name: varchar({ length: 255 }).notNull().unique(), // page name (like: user, role)
  label: varchar({ length: 255 }), // label that show in the datatable (like: User Managment)
});

export const permissions = mysqlTable('permissions', {
  id: int().autoincrement().primaryKey(),
  roleId: int().references(() => roles.id), // role id (like: operator, admin)
  moduleId: int().references(() => modules.id), // page id (like: user, role)
  label: varchar({ length: 255 }), // label that show in the datatable
  can_view: boolean().default(false),
  can_edit: boolean().default(false),
  can_create: boolean().default(false),
  can_delete: boolean().default(false),
});

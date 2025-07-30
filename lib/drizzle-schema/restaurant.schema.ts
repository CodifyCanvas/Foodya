import { mysqlTable, varchar, int, decimal, boolean, timestamp, datetime, mysqlEnum } from 'drizzle-orm/mysql-core';
import { adminSchema } from './admin-panel.schema'

// Menu Categories Table
const menuCategories = mysqlTable('menu_categories', {
  id: int().autoincrement().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }),
});

// Menu Items Table
const menuItems = mysqlTable('menu_items', {
  id: int().autoincrement().primaryKey(),
  category_id: int().notNull().references(() => menuCategories.id),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }),
  price: decimal({ precision: 10, scale: 2 }).notNull(),
  is_available: boolean().default(true),
});

// Menu Item Options Table
const menuItemOptions = mysqlTable('menu_item_options', {
  id: int().autoincrement().primaryKey(),
  menu_item_id: int().notNull().references(() => menuItems.id),
  option_name: varchar({ length: 255 }),
  price: decimal({ precision: 10, scale: 2 }).notNull(),
});

// Table Management Table
const restaurantTables = mysqlTable('restaurant_tables', {
  id: int().autoincrement().primaryKey(),
  table_number: varchar({ length: 50 }).notNull(),
  status: varchar({ length: 50 }),
});

// Bookings Table
const bookingsTables = mysqlTable('bookings_tables', {
  id: int('id').autoincrement().primaryKey(),
  tableId: int('table_id').notNull().references(() => restaurantTables.id),
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  advancePaid: decimal('advance_paid', { precision: 10, scale: 2 }).default('0.00'),
  bookedByUserId: int('booked_by_user_id').notNull().references(() => adminSchema.users.id),
  status: varchar({ length: 50 }).default('Scheduled').notNull(),
  reservationStart: datetime('reservation_start').notNull(),
  reservationEnd: datetime('reservation_end').notNull(),
  bookingDate: timestamp('booking_date').defaultNow().notNull(),
});

// Export Db Table Schema -> index.ts -> export to app
export const restaurantSchema = {
  menuCategories,
  menuItems,
  menuItemOptions,
  restaurantTables,
  bookingsTables
};

export type RestaurantSchema = typeof restaurantSchema;

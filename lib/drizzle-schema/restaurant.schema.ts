import { mysqlTable, varchar, int, decimal, boolean, timestamp, datetime, mysqlEnum, text } from 'drizzle-orm/mysql-core';
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
  image: text(),
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
  status: mysqlEnum(['booked', 'occupied', 'available']).notNull().default('available'),
});

// Bookings Table
const bookingsTables = mysqlTable('bookings_tables', {
  id: int('id').autoincrement().primaryKey(),
  tableId: int('table_id').notNull().references(() => restaurantTables.id),
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  advancePaid: decimal('advance_paid', { precision: 10, scale: 2 }).default('0.00'),
  bookedByUserId: int('booked_by_user_id').notNull().references(() => adminSchema.users.id),
  status: mysqlEnum(['scheduled', 'booked', 'completed', 'expired', 'processing', 'cancelled']).notNull().default('scheduled'),
  reservationStart: datetime('reservation_start').notNull(),
  reservationEnd: datetime('reservation_end').notNull(),
  bookingDate: timestamp('booking_date').defaultNow().notNull(),
});

// Orders Table
const ordersTable = mysqlTable('orders_table', {
  id: int('id').autoincrement().primaryKey(),
  tableId: int('table_id').references(() => restaurantTables.id),
  waiterId: int('waiter_id').references(() => adminSchema.users.id),
  orderType: mysqlEnum('order_type', ['dine_in', 'drive_thru', 'takeaway']).notNull(),
  status: mysqlEnum(['pending', 'in_progress', 'completed']).default('pending').notNull(),
  description: varchar('description', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Order Items Table
const orderItemsTable = mysqlTable('order_items_table', {
  id: int('id').autoincrement().primaryKey(),
  menuItemImage: text('menu_item_image'),
  orderId: int('order_id').references(() => ordersTable.id).notNull(),
  menuItemId: int('menu_item_id').references(() => menuItems.id),
  menuItemName: varchar('menu_item_name', { length: 255 }).notNull(),
  menuItemOptionId: int('menu_item_option_id').references(() => menuItemOptions.id),
  menuItemOptionName: varchar('menu_item_option_name', { length: 255 }),
  quantity: int('quantity').notNull().default(1),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
});

// Invoices Table
const InvoicesTable = mysqlTable('invoices_table', {
  id: int('id').autoincrement().primaryKey(),
  orderId: int('order_id').references(() => ordersTable.id).notNull(),
  generatedByUserId: int('generated_by_user_id').references(() => adminSchema.users.id).notNull(),
  customerName: varchar('customer_name', { length: 255 }).default('random').notNull(),
  subTotalAmount: decimal('sub_total_amount', { precision: 10, scale: 2 }).notNull(),
  discount: decimal('discount_percentage', { precision: 10, scale: 2 }).default('0.00').notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  advancePaid: decimal('advance_paid', { precision: 10, scale: 2 }).default('0.00'),
  grandTotal: decimal('grand_total',{ precision: 10, scale: 2 }).default('0.00').notNull(),
  paymentMethod: mysqlEnum('payment_method' ,['cash', 'card', 'online']),
  isPaid: boolean('is_paid').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Export Db Table Schema -> index.ts -> export to app
export const restaurantSchema = {
  menuCategories,
  menuItems,
  menuItemOptions,
  restaurantTables,
  bookingsTables,
  ordersTable,
  orderItemsTable,
  InvoicesTable,
};

export type RestaurantSchema = typeof restaurantSchema;

import { mysqlTable, varchar, int, decimal, boolean, timestamp, datetime, mysqlEnum, text } from 'drizzle-orm/mysql-core';
import { adminSchema } from './admin-panel.schema'



/* ===========================
=== Menu Management Tables ===
=========================== */

/**
 * Menu Categories
 * Groups menu items under a named category.
 */
export const menuCategories = mysqlTable('menu_categories', {
  id: int().autoincrement().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }),
});



/**
 * Menu Items
 * Represents individual food/drink items available to order.
 */
export const menuItems = mysqlTable('menu_items', {
  id: int().autoincrement().primaryKey(),
  image: text(),
  category_id: int().references(() => menuCategories.id),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }),
  price: decimal({ precision: 10, scale: 2 }).notNull(),
  is_available: boolean().default(true),
  isDeleted: boolean('is_deleted').default(false).notNull(),
});



/**
 * Menu Item Options
 * Customizations or size variations for a menu item.
 */
export const menuItemOptions = mysqlTable('menu_item_options', {
  id: int().autoincrement().primaryKey(),
  menu_item_id: int().notNull().references(() => menuItems.id, { onDelete: 'cascade' }),
  option_name: varchar({ length: 255 }),
  price: decimal({ precision: 10, scale: 2 }).notNull(),
});



/* ===============================
=== Table & Booking Management ===
=============================== */

/**
 * Restaurant Tables
 * Physical tables available for dining in the restaurant.
 */
export const restaurantTables = mysqlTable('restaurant_tables', {
  id: int().autoincrement().primaryKey(),
  table_number: varchar({ length: 50 }).notNull(),
  status: mysqlEnum(['booked', 'occupied', 'available']).notNull().default('available'),
  isDeleted: boolean('is_deleted').default(false).notNull(),
});



/**
 * Bookings Table
 * Stores reservation records for restaurant tables.
 */
export const bookingsTables = mysqlTable('bookings_tables', {
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



/* ====================
=== Order & Billing ===
==================== */

/**
 * Orders Table
 * Represents a single order tied to a table.
 */
export const ordersTable = mysqlTable('orders_table', {
  id: int('id').autoincrement().primaryKey(),
  tableId: int('table_id').references(() => restaurantTables.id),
  waiterId: int('waiter_id').references(() => adminSchema.users.id, { onDelete: 'set null' }),
  orderType: mysqlEnum('order_type', ['dine_in', 'drive_thru', 'takeaway']).notNull(),
  status: mysqlEnum(['pending', 'in_progress', 'completed']).default('pending').notNull(),
  description: varchar('description', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});



/**
 * Order Items Table
 * Line items associated with an order.
 */
export const orderItemsTable = mysqlTable('order_items_table', {
  id: int('id').autoincrement().primaryKey(),
  menuItemImage: text('menu_item_image'),
  orderId: int('order_id').references(() => ordersTable.id, { onDelete: 'cascade' }).notNull(),
  menuItemId: int('menu_item_id').references(() => menuItems.id, { onDelete: 'set null' }),
  menuItemName: varchar('menu_item_name', { length: 255 }).notNull(),
  menuItemOptionId: int('menu_item_option_id').references(() => menuItemOptions.id),
  menuItemOptionName: varchar('menu_item_option_name', { length: 255 }),
  quantity: int('quantity').notNull().default(1),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
});



/**
 * Invoices Table
 * Final billing summary for an order, including discounts and payment method.
 */
export const InvoicesTable = mysqlTable('invoices_table', {
  id: int('id').autoincrement().primaryKey(),
  orderId: int('order_id').references(() => ordersTable.id, { onDelete: 'cascade' }).notNull(),
  generatedByUserId: int('generated_by_user_id').references(() => adminSchema.users.id, { onDelete: 'set null' }),
  customerName: varchar('customer_name', { length: 255 }).default('random').notNull(),
  subTotalAmount: decimal('sub_total_amount', { precision: 10, scale: 2 }).notNull(),
  discount: decimal('discount_percentage', { precision: 10, scale: 2 }).default('0.00').notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  advancePaid: decimal('advance_paid', { precision: 10, scale: 2 }).default('0.00'),
  grandTotal: decimal('grand_total', { precision: 10, scale: 2 }).default('0.00').notNull(),
  paymentMethod: mysqlEnum('payment_method', ['cash', 'card', 'online']),
  isPaid: boolean('is_paid').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});



/* ========================
=== Employee Management ===
======================== */

/**
 * Employees Table
 * Stores all employee records for the restaurant.
 */
export const employeesTable = mysqlTable('employees', {
  id: int('id').autoincrement().primaryKey(),
  image: text(),
  name: varchar('name', { length: 50 }).notNull(),
  CNIC: varchar('cnic', { length: 15 }).notNull(),
  fatherName: varchar('father_name', { length: 50 }).notNull(),
  salary: decimal('salary', { precision: 10, scale: 2 }).default('0.00'),
  email: varchar('email', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 15 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});



/**
 * Employment Records
 * Tracks employment history (status changes, rejoining, etc.).
 */
export const employmentRecordsTable = mysqlTable('employment_records', {
  id: int('id').autoincrement().primaryKey(),
  employeeId: int('employee_id').references(() => employeesTable.id).notNull(),
  designation: varchar('designation', { length: 100 }).notNull(),
  shift: varchar('shift', { length: 100 }).notNull(),
  status: mysqlEnum('status', ['active', 'resigned', 'terminated', 'rejoined']).default('active').notNull(),
  joinedAt: datetime('joined_at').notNull(),
  resignedAt: datetime('resigned_at'),
  changeType: mysqlEnum('change_type', ['valid', 'correction']).default('valid').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});



/**
 * Salary Changes Table
 * Logs changes to an employee’s salary over time.
 */
export const salaryChangesTable = mysqlTable('salary_changes', {
  id: int('id').autoincrement().primaryKey(),
  employeeId: int('employee_id').references(() => employeesTable.id).notNull(),
  previousSalary: decimal('previous_salary', { precision: 10, scale: 2 }),
  newSalary: decimal('new_salary', { precision: 10, scale: 2 }).notNull(),
  reason: text('reason'),
  changeType: mysqlEnum('change_type', ['initial', 'raise', 'promotion', 'adjustment', 'correction']).default('initial').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});



/* ===========================
=== Payroll & Transactions ===
=========================== */

/**
 * Payrolls Table
 * Stores salary payment records per employee per month.
 */
export const payrollsTable = mysqlTable('payrolls', {
  id: int('id').autoincrement().primaryKey(),
  employeeId: int('employee_id').references(() => employeesTable.id).notNull(),
  description: text('description'),
  basicPay: decimal('basic_pay', { precision: 10, scale: 2 }).notNull(),
  bonus: decimal('bonus', { precision: 10, scale: 2 }).default('0.00'),
  penalty: decimal('penalty', { precision: 10, scale: 2 }).default('0.00'),
  totalPay: decimal('total_pay', { precision: 10, scale: 2 }).notNull(),

  month: varchar('month', { length: 15 }).notNull(),
  status: mysqlEnum('status', ['pending', 'paid']).default('pending').notNull(),
  paidAt: timestamp('paid_at'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});



/* ==========================================
=== Transaction Categories & Transactions ===
========================================== */

/**
 * Transaction Categories Table
 * Categorizes financial transactions, e.g., rent, salary, utilities.
 */
export const transactionCategoriesTable = mysqlTable('transaction_categories', {
  id: int('id').autoincrement().primaryKey(),
  category: varchar('category', { length: 255 }).notNull(),
  description: text('description'),
  locked: boolean('locked').default(false),
});



/**
 * Transactions Table
 * Records individual financial transactions with references to categories and source.
 */
export const transactionsTable = mysqlTable('transactions', {
  id: int('id').autoincrement().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  categoryId: int('category_id').references(() => transactionCategoriesTable.id).notNull(),
  type: mysqlEnum('type', ['debit', 'credit']).notNull(),

  sourceType: mysqlEnum('source_type', ['invoice', 'payroll', 'manual', 'other']).default('other').notNull(),
  sourceId: int('source_id'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});



// === Schema Export ===
export const restaurantSchema = {
  menuCategories,
  menuItems,
  menuItemOptions,
  restaurantTables,
  bookingsTables,
  ordersTable,
  orderItemsTable,
  InvoicesTable,
  employeesTable,
  employmentRecordsTable,
  salaryChangesTable,
  payrollsTable,
  transactionCategoriesTable,
  transactionsTable
};

export type RestaurantSchema = typeof restaurantSchema;
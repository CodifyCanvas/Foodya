// ========================
// === GENERIC / OTHERS ===
// ========================



/**
 * Interface for role objects used in dropdowns or UI selects.
 */
export interface RoleSelectInput {
  label: string;
  value: string;
}



/**
 * Interface for categories used in dropdowns or display.
 */
export interface CategoriesSelectInput {
  label: string;
  value: string;
}



/**
 * Interface for tables used in dropdowns or display.
 */
export interface TablesSelectInput {
  label: string;
  value: string;
}



/**
 * Interface for waiter dropdown options.
 */
export interface WaiterSelectInput {
  label: string;
  value: string;
  role: string | null;
}



/**
 * Generic user interface definition.
 */
export interface User {
  id?: number;
  image?: null | string;
  name: string;
  password: string;
  email: string;
  is_active: boolean;
  role_id: string;
  role_name: string;
  created_at: Date;
}



/**
 * Role Interface Definition
 */
export interface Role {
  id?: number;
  role: string;
}



/**
 * Module Interface Definition
 */
export interface ModuleInterface {
  id?: number;
  name: string;
  label: string;
}



/**
 * Permissions flags assigned to a role for a specific module (RBAC).
 */
export interface ModulePermission {
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}



/**
 * Permissions assigned to a role for a specific module, including role and module info.
 */
export interface Permissions extends ModulePermission {
  id: number;
  role_id: number;
  role_name: string;
  module_id: number;
  module_name: string;
}



// =========================
// === MENU / RESTAURANT ===
// =========================

/**
 * Menu Categories Interface Definition
 */
export interface MenuCategories {
  id?: number;
  name: string;
  description: string;
}



/**
 * Menu Item Options Interface
 */
export interface MenuItemOptions {
  option_id: number;
  option_name: string;
  price: string;
}



/**
 * Menu Item with Options Interface Definition
 */
export interface ItemWithOptions {
  id: number;
  image?: string | null;
  item: string;
  description: string;
  price: number;
  is_available: boolean;
  category: string;
  category_id: string;
  options: MenuItemOptions[];
}



/**
 * Restaurant Tables Interface Definition
 */
export interface RestaurantTablesInterface {
  id?: number;
  table_number: string;
  status: 'booked' | 'occupied' | 'available';
}



// ===============================
// === BOOKINGS / RESERVATIONS ===
// ===============================

/**
 * Booking Tables Interface Definition
 */
export interface BookingsTablesInterface {
  id: number;
  tableId: string;
  tableName: string | null;
  customerName: string;
  advancePaid: string | null;
  status: 'scheduled' | 'booked' | 'completed' | 'processing' | 'expired' | 'cancelled';
  bookedByUserId: number;
  bookedByUserName: string | null;
  bookedByUserEmail: string | null;
  reservationStart: Date;
  reservationEnd: Date;
  bookingDate: Date;
}



/**
 * Booking with Tables Interface for fetching combined booking and table data.
 */
export interface BookingsWithTablesInterface {
  bookings: BookingsTablesInterface[];
  tables: TablesSelectInput[];
}


// =======================
// === ORDER / INVOICE ===
// =======================

/**
 * Order Item Interface
 */
export interface OrderItem {
  id: number;
  menuItemImage: string | null;
  menuItemId: number | string;
  menuItemName: string;
  menuItemOptionId: number | string | null;
  menuItemOptionName: string | null;
  quantity: number;
  price: string;
}



/**
 * Booking Info included with Order
 */
export interface OrderBookingInfo {
  customerName: string;
  advancePaid: string;
}



/**
 * Order Details Interface
 */
export interface OrderDetail {
  id: number;
  tableId: string | null;
  waiterId: string | null;
  orderType: 'dine_in' | 'drive_thru' | 'takeaway';
  status: 'pending' | 'in_progress' | 'completed';
  description: string | null;
  createdAt: string;
}



/**
 * Order Response From the API (Order Page)
 */
export interface OrderResponse {
  order?: OrderDetail;
  items: OrderItem[];
  booking?: OrderBookingInfo | null;
}



/**
 * Invoice Detail Interface
 */
export interface InvoiceDetail {
  id: number;
  orderId: number;
  generatedByUserId: number | null;
  customerName: string;
  subTotalAmount: string;
  discount: string;
  totalAmount: string;
  advancePaid: string | null;
  grandTotal: string;
  paymentMethod: 'cash' | 'card' | 'online' | 'unpaid';
  isPaid: boolean;
  createdAt: string;
}



/**
 * Invoice Page Response Interface - detailed invoice with order, items, and user info
 */
export interface InvoiceResponse {
  invoice: InvoiceDetail;
  order: OrderDetail;
  items: OrderItem[];
  generatedBy: GeneratedBy | null;
}



/**
 * Invoice with Menu-Items and Tables Response Interface
 */
export interface InvoiceWithMenuItemsAndTablesInterface {
  invoices: InvoiceDetail[];
  menuItems: ItemWithOptions[];
  tables: TablesSelectInput[];
}



/**
 * Invoice Generated By User Info Interface
 */
export interface GeneratedBy {
  id: number;
  name: string;
  email: string;
}



// ====================
// === EMPLOYEE / HR MANAGEMENT ===
// ====================

/**
 * Basic Employee Info for DataTable
 */
export interface EmployeeWithLatestRecord {
  id: number;
  image: string | undefined | null;
  name: string;
  CNIC: string;
  fatherName: string;
  email: string;
  phone: string;
  designation: string | null;
  shift: string | null;
  status: 'active' | 'resigned' | 'terminated' | 'rejoined' | null;
  joinedAt: string | null; // ISO string or null if no record
}



/**
 * Personal Info Form Interface
 */
export interface EmployeePersonalInfoInterface {
  id: number | null;
  image: string | null;
  name: string;
  CNIC: string;
  fatherName: string;
  salary: string;
  email: string;
  phone: string;
  createdAt: string;
}



/**
 * Employment Record Interface
 */
export interface EmploymentRecordInterface {
  id: number | null;
  designation: string;
  shift: string;
  status: 'active' | 'resigned' | 'terminated' | 'rejoined';
  joinedAt: string;
  resignedAt: string | null;
  changeType: 'valid' | 'correction';
  createdAt?: string | Date;
}



/**
 * Salary Change Interface
 */
export interface SalaryChangeInterface {
  id: number | null;
  previousSalary: number | null;
  newSalary: number;
  reason: string | null;
  changeType: 'initial' | 'raise' | 'promotion' | 'adjustment' | 'correction';
  createdAt?: string | Date;
}



/**
 * Combined Full Employee Details for View/Edit
 */
export interface EmployeeWithFullDetails {
  personalInfo: EmployeePersonalInfoInterface;
  employmentRecord: EmploymentRecordInterface[];
  salaryChanges: SalaryChangeInterface[];
}



/**
 * Summary of payroll information for an employee.
 */
export interface PayrollSummary {
  totalAmountPaid: string;
  totalAmountPending: string;
  totalPaidMonths: string;
  totalUnpaidMonths: string;
}



/**
 * Props for payroll table actions component, including payroll summary,
 * employee details, and salary records.
 */
export interface PayrollTableActionsProps {
  data: {
    payrollSummary: PayrollSummary;
    employee: EmployeeCompleteDetailsInterface;
    salaries: PayrollDialogSalaryRow[];
  };
}



/**
 * Complete Employee Details Interface (flat)
 */
export interface EmployeeCompleteDetailsInterface {
  id: number;
  image: string | null;
  name: string;
  CNIC: string;
  fatherName: string;
  email: string;
  phone: string;
  salary: string; // e.g., "7000.00"
  createdAt: string; // ISO date string
  employmentRecord: EmploymentRecordInterface[];
  salaryChanges: SalaryChangeInterface[];
}



// ===================================
// === PAYROLL / SALARY MANAGEMENT ===
// ===================================

/**
 * Payroll details for datatable summary
 */
export interface EmployeesSalaryGeneralDetails {
  id: number;
  employeeId: number;
  employee: string;
  designation: string;
  unpaidMonths: string[]; // e.g., ["2025-09", "2025-08"]
  currentSalary: string;  // stored as string, e.g., "60000.00"
  prevBalance: number;
  thisMonth: number;
  status: "pending" | "paid";
}



/**
 * Payroll record with employee details
 */
export interface PayrollWithEmployeeDetails {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeDesignation: string | null;
  description: string | null;
  basicPay: string;
  bonus: string;
  penalty: string;
  totalPay: string;
  month: string; // "YYYY-MM"
  status: 'pending' | 'paid';
  paidAt: string | null; // ISO timestamp or null
  createdAt: string; // ISO timestamp
}



/**
 * Payroll Dialog Salary Row Interface
 */
export interface PayrollDialogSalaryRow {
  id: number | string;
  description: string | null;
  basicPay: string;
  bonus: string;
  penalty: string;
  totalPay: string;
  month: string;
  paidAt?: string | null;
  selected?: boolean;
}



// =================================
// === TRANSACTIONS / FINANCIALS ===
// =================================

/**
 * Transaction Categories Tables Interface
 */
export interface TransactionCategoriesTablesInterface {
  id: number;
  category: string;
  description: string;
  locked: boolean;
}



/**
 * Transactions Tables Interface
 */
export interface TransactionsTablesInterface {
  id: number;
  title: string;
  description: string | null;
  amount: string;
  categoryId: number;
  category: string | null;
  categoryDescription: string | null;
  type: 'credit' | 'debit';
  sourceType: string;
  sourceId: number | null;
  createdAt: string;
}



/**
 * Employee Payroll Interface (per month)
 */
export interface EmployeePayrollInterface {
  id: number;
  employeeImage: string | null;
  employeeId: number | null;
  employeeName: string;
  employeeCNIC: string;
  employeeEmail: string;
  basicPay: string;
  bonus: string;
  penalty: string;
  totalPay: string;
  description: string;
  month: string;
  status: 'paid' | 'pending';
  paidAt: string;
}



// ====================
// === REPORTS PAGE ===
// ====================

/**
 * Metric Card Interface used in the reports page (e.g., dashboard summary).
 */
export interface ReportsMetricCard {
  title: string;
  value: string;
  change?: string;
  currency?: boolean;
  trend?: string;
  description: string;
}



/**
 * Represents one entry in the financial chart
 * Can be per-day (month view) or per-month (year view).
 */
export interface FinancialChartDataEntry {
  date: string;
  income: string;           // Income amount for that date
  expense: string;          // Expense amount for that date
}



/**
 * Summary totals for the chart (bottom section)
 */
export interface FinancialChartSummary {
  incomes: string;
  expense: string;
  revenue: string;          // <- (Incomes - Expenses)
}



/**
 * Final response object from API for financial reports chart
 */
export interface FinancialChartResponse {
  data: FinancialChartDataEntry[];  // <- Chart data entries
  summary: FinancialChartSummary;   // <- Totals summary
}



/**
 * Transaction Reports Response Type For Transaction Table
 */
export interface TransactionsReportResult {
  query: string | null;
  totalRecords: number;
  page: number;
  totalPages: number;
  pageSize: number;
  transactions: TransactionsTablesInterface[];
}



// =========================
// === WEBSITE MENU PAGE ===
// =========================

/**
 * Filter Category Bar.
 */
export interface MenuCategoryWithItemCount {
  id: number;
  category: string;
  description: string | null;
  total_items: number;
}



/**
 * Menu Response Come From Api
 */
export interface MenuResponse {
  query: string | null;
  totalRecords: number;
  page: number;
  totalPages: number;
  pageSize: number;
  menuItems: ItemWithOptions[];
}
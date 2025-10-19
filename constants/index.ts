// @/constants/index.ts

import { Banknote, LayoutDashboard, ShieldCheck, Store, Users, Utensils } from "lucide-react"



/**
 * === Logo Paths ===
 * Stores all app logos used throughout the UI.
 */
export const logo = {
  main: '/Foodya-logo-transparent.png'
}



/**
 * === Navigation Sidebar Links ===
 * Defines the sidebar structure, including headings, groups, icons, and child routes.
 */
export const navLink = [
  // --- Dashboard Section ---
  { heading: "Dashboard" },
  {
    title: "Dashboard",
    url: "#",
    icon: LayoutDashboard,
    items: [
      { title: 'Dashboard', url: '/restaurant/dashboard' },
    ],
  },

  // --- Admin Section ---
  { heading: "Admin" },
  {
    title: "Admin Panel",
    url: "#",
    icon: ShieldCheck,
    isActive: true,
    items: [
      { title: "Users", url: "/restaurant/users" },
      { title: 'Roles', url: '/restaurant/roles' },
      { title: 'Permissions', url: '/restaurant/permissions' },
      { title: 'Modules', url: '/restaurant/modules' },
    ],
  },

  // --- Restaurant Section ---
  { heading: "Restaurant" },
  {
    title: "Menu Management",
    url: "#",
    icon: Utensils,
    items: [
      { title: 'Menu Categories', url: '/restaurant/menu-categories' },
      { title: 'Menu Items', url: '/restaurant/menu-items' },
    ],
  },
  {
    title: "Restaurant Management",
    url: "#",
    icon: Store,
    items: [
      { title: 'Tables', url: '/restaurant/tables' },
      { title: 'Bookings', url: '/restaurant/bookings' },
      { title: 'Orders', url: '/restaurant/orders' },
      { title: 'Invoices', url: '/restaurant/invoices' },
    ],
  },
  {
    title: "Staff & Payroll",
    url: "#",
    icon: Users,
    items: [
      { title: 'Employees', url: '/restaurant/employees' },
      { title: 'Salaries', url: '/restaurant/salaries' },
    ],
  },

  // --- Finance Section ---
  { heading: "Finance" },
  {
    title: "Finance",
    url: "#",
    icon: Banknote,
    items: [
      { title: 'Transaction Categories', url: '/restaurant/transaction-categories' },
      { title: 'Expenses', url: '/restaurant/expenses' },
      { title: 'Incomes', url: '/restaurant/incomes' },
      { title: 'Reports', url: '/restaurant/reports' },
    ],
  },
]



/**
 * === Icon Paths ===
 * 
 * Maps UI-friendly names to local icon image paths.
 * Used in various parts of the UI like header menus, buttons, etc.
 */
export const Icons = {
  gmail: '/icons/gmail.png',
  whatsapp: '/icons/whatsapp.png',
  github: '/icons/github.png',
  google: '/icons/google.png',
  copy: '/icons/copy.png',
  csv: '/icons/csv-file.png',
  dashboard: '/icons/dashboard.png',
  employees: '/icons/employees.png',
  expenses: '/icons/expenses.png',
  incomes: '/icons/incomes.png',
  invoices: '/icons/invoices.png',
  menu: '/icons/menu.png',
  orders: '/icons/orders.png',
  pdf: '/icons/pdf-file.png',
  printer: '/icons/printer.png',
  reports: '/icons/reports.png',
  tables: '/icons/tables.png',
  users: '/icons/users.png',
  xls: '/icons/xls-file.png',
};



/**
 * === Header Menu Quick-Access Cards ===
 * 
 * Used in header dropdowns or landing menus for fast access to key pages.
 */
export const HeaderMenuCards = [
  { title: "Dashboard", icon: Icons.dashboard, href: "/restaurant/dashboard", description: "Charts & Overview" },
  { title: "Users", icon: Icons.users, href: "/restaurant/users", description: "Manage Users" },
  { title: "Employees", icon: Icons.employees, href: "/restaurant/employees", description: "Staff & Payroll" },
  { title: "Menu Items", icon: Icons.menu, href: "/restaurant/menu-items", description: "Manage Food Menu" },
  { title: "Tables", icon: Icons.tables, href: "/restaurant/tables", description: "Dining Setup" },
  { title: "Orders", icon: Icons.orders, href: "/restaurant/orders", description: "Order Tracking" },
  { title: "Invoices", icon: Icons.invoices, href: "/restaurant/invoices", description: "Sales & Purchases" },
  { title: "Expenses", icon: Icons.expenses, href: "/restaurant/expenses", description: "Track Spending" },
  { title: "Incomes", icon: Icons.incomes, href: "/restaurant/incomes", description: "View Earnings" },
  { title: "Reports", icon: Icons.reports, href: "/restaurant/reports", description: "Insights & Stats" },
];
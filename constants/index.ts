// @/constants/index.ts

import { Banknote, LayoutDashboard, ShieldCheck, Store, Users, Utensils } from "lucide-react"



/**
 * === Logo Paths ===
 * Stores all app logos used throughout the UI.
 */
export const logo = {
  favicon: '/Foodya-favicon-transparent.png',
  main: '/Foodya-logo.png'
}



export const appConfigurations = {
  loginURL: '/restaurant/dashboard',  // <- redirect here after successful login
  logoutURL: '/login',                  // <- redirect here after logout
  SideBarIconURL: '/restaurant/dashboard'                  // <- redirect here after click on sidebar main logo
};



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
      { title: 'Dashboard', url: '/restaurant/dashboard', shortcuts: ['Alt', 'D'] },
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
      { title: "Users", url: "/restaurant/users", shortcuts: ['Alt', 'U'] },
      { title: 'Roles', url: '/restaurant/roles', shortcuts: ['Alt', 'R'] },
      { title: 'Permissions', url: '/restaurant/permissions', shortcuts: ['Alt', 'P'] },
      { title: 'Modules', url: '/restaurant/modules', shortcuts: ['Alt', 'M'] },
    ],
  },

  // --- Restaurant Section ---
  { heading: "Restaurant" },
  {
    title: "Menu Management",
    url: "#",
    icon: Utensils,
    items: [
      { title: 'Menu Categories', url: '/restaurant/menu-categories', shortcuts: ['Alt', 'C'] },
      { title: 'Menu Items', url: '/restaurant/menu-items', shortcuts: ['Alt', 'I'] },
    ],
  },
  {
    title: "Restaurant Management",
    url: "#",
    icon: Store,
    items: [
      { title: 'Tables', url: '/restaurant/tables', shortcuts: ['Alt', 'T'] },
      { title: 'Bookings', url: '/restaurant/bookings', shortcuts: ['Alt', 'B'] },
      { title: 'Orders', url: '/restaurant/orders', shortcuts: ['Alt', 'O'] },
      { title: 'Invoices', url: '/restaurant/invoices', shortcuts: ['Alt', 'N'] },
    ],
  },
  {
    title: "Staff & Payroll",
    url: "#",
    icon: Users,
    items: [
      { title: 'Employees', url: '/restaurant/employees', shortcuts: ['Alt', 'E'] },
      { title: 'Salaries', url: '/restaurant/salaries', shortcuts: ['Alt', 'S'] },
    ],
  },

  // --- Finance Section ---
  { heading: "Finance" },
  {
    title: "Finance",
    url: "#",
    icon: Banknote,
    items: [
      { title: 'Transaction Categories', url: '/restaurant/transaction-categories', shortcuts: ['Alt', 'X'] },
      { title: 'Expenses', url: '/restaurant/expenses', shortcuts: ['Alt', 'Q'] },
      { title: 'Incomes', url: '/restaurant/incomes', shortcuts: ['Alt', 'Z'] },
      { title: 'Reports', url: '/restaurant/reports', shortcuts: ['Alt', 'L'] },
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



/**
 * === Help Links ===
 * 
 * Used in header dropdowns (help) or login page contact us.
 */
export const HelpLinks = [
  { title: "Gmail", icon: Icons.gmail, href: "https://mail.google.com/mail/?view=cm&fs=1&to=shahzaibawan1357@gmail.com" },
  { title: "Whatsapp", icon: Icons.whatsapp, href: "https://web.whatsapp.com/send?phone=+923118480102" },
  { title: "Github", icon: Icons.github, href: "https://github.com/CodifyCanvas" },
];
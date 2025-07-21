import { Banknote, LayoutDashboard, ShieldCheck, Store, Users, Utensils } from "lucide-react"

export const logo ={
    main: '/Foodya-logo-transparent.png'
}

export const navLink = [
  // --- Dashboard (Most important) ---
  { heading: "Dashboard" },
  {
    title: "Dashboard",
    url: "#",
    icon: LayoutDashboard, // Dashboard overview
    items: [
      { title: 'Dashboard', module: 'Dashboard', url: '/restaurant/dashboard' },
    ],
  },

  // --- Admin Panel ---
  { heading: "Admin" },
  {
    title: "Admin Panel",
    url: "#",
    icon: ShieldCheck, // Security/admin symbol
    isActive: true,
    items: [
      { title: "Users", module: "Users", url: "/restaurant/users" },
      { title: 'Roles', module: 'Roles', url: '/restaurant/roles' },
      { title: 'Permissions', module: 'Permissions', url: '/restaurant/permissions' },
      { title: 'Pages', module: 'Pages', url: '/restaurant/pages' },
    ],
  },

  // --- Restaurant Management ---
  { heading: "Restaurant" },
  {
    title: "Staff & Payroll",
    url: "#",
    icon: Users, // Group/staff symbol
    items: [
      { title: 'Employees', module: 'Employees', url: '/restaurant/employees' },
      { title: 'Salaries', module: 'Salaries', url: '/restaurant/salaries' },
    ],
  },
  {
    title: "Menu Management",
    url: "#",
    icon: Utensils, // Food/menu icon
    items: [
      { title: 'Menu Categories', module: 'MenuCategories', url: '/restaurant/menu-categories' },
      { title: 'Menu Items', module: 'MenuItems', url: '/restaurant/menu-items' },
      { title: 'Item Options', module: 'MenuItemOptions', url: '/restaurant/menu-item-options' },
    ],
  },
  {
    title: "Restaurant Management",
    url: "#",
    icon: Store, // Restaurant/building icon
    items: [
      { title: 'Tables', module: 'Tables', url: '/restaurant/tables' },
      { title: 'Bookings', module: 'Bookings', url: '/restaurant/bookings' },
      { title: 'Orders', module: 'Orders', url: '/restaurant/orders' },
      { title: 'Invoices', module: 'Invoices', url: '/restaurant/invoices' },
    ],
  },

  // --- Finance ---
  { heading: "Finance" },
  {
    title: "Finance",
    url: "#",
    icon: Banknote, // Money/finance icon
    items: [
      { title: 'Expenses', module: 'Expenses', url: '/restaurant/expenses' },
      { title: 'Incomes', module: 'Incomes', url: '/restaurant/incomes' },
      { title: 'Reports', module: 'Reports', url: '/restaurant/reports' },
    ],
  },
]

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

export const HeaderMenuCards = [
  { title: "Dashboard", icon: Icons.dashboard , href: "/restaurant/dashboard", description: "Charts & Overview" },
  { title: "Users", icon: Icons.users , href: "/restaurant/users", description: "Manage Users" },
  { title: "Employees", icon: Icons.employees , href: "/restaurant/employees", description: "Staff & Payroll" },
  { title: "Menu Items", icon: Icons.menu , href: "/restaurant/menu-items", description: "Manage Food Menu" },
  { title: "Tables", icon: Icons.tables , href: "/restaurant/tables", description: "Dining Setup" },
  { title: "Orders", icon: Icons.orders , href: "/restaurant/orders", description: "Order Tracking" },
  { title: "Invoices", icon: Icons.invoices , href: "/restaurant/invoices", description: "Sales & Purchases" },
  { title: "Expenses", icon: Icons.expenses , href: "/restaurant/expenses", description: "Track Spending" },
  { title: "Incomes", icon: Icons.incomes , href: "/restaurant/incomes", description: "View Earnings" },
  { title: "Reports", icon: Icons.reports , href: "/restaurant/reports", description: "Insights & Stats" },
];

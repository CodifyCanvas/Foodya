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
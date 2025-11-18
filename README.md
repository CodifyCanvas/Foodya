<h1 align="center" style="font-size: 3em; margin-bottom: 0;">
  <img src="./public/Foodya-logo.png" width="60" height="60" style="border-radius: 8px;" />
  <br>Foodya POS
</h1>

<br>

<div align="center">

[![React](https://img.shields.io/badge/React-18-blue?logo=react&logoColor=white)](https://reactjs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-blue?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4-blue?logo=tailwind-css&logoColor=blue)](https://tailwindcss.com/)
[![npm](https://img.shields.io/badge/npm-10.9.4-red)](https://www.npmjs.com/)
[![ShadCN UI](https://img.shields.io/badge/ShadCN-UI-purple?logo=tailwindcss&logoColor=white)](https://ui.shadcn.com/)
[![SWR](https://img.shields.io/badge/SWR-1.3-blue?logo=javascript&logoColor=yellow)](https://swr.vercel.app/)
[![MySQL](https://img.shields.io/badge/MySQL-8-orange?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.44-darkGray)](https://orm.drizzle.team/)
[![Auth.js](https://img.shields.io/badge/Auth.js-5-purple)](https://authjs.dev/)
[![Chart.js](https://img.shields.io/badge/Chart.js-4-orange?logo=chart.js&logoColor=white)](https://www.chartjs.org/)
[![GSAP](https://img.shields.io/badge/GSAP-3-green?logo=greensock&logoColor=white)](https://greensock.com/gsap/)
[![License](https://img.shields.io/badge/License-Free-brightgreen)](#)

</div>

<h3 align="center">
  Foodya is a full-featured <b>Restaurant POS (Point of Sale) system</b> coupled with a simple website. It is designed to help restaurants manage their day-to-day operations efficiently, including orders, tables, menu items, bookings, employees, transactions, and reports. The system includes <b>Role-Based Access Control (RBAC)</b> per page to manage permissions for different users.
</h3>

<p align="center">
    <a href="#"> Documentation </a>·
    <a href="https://mail.google.com/mail/?view=cm&fs=1&to=shahzaibawan1357@gmail.com"> Request Feature </a>·
    <a href="https://www.linkedin.com/in/shahzaib-awan-dev/">Connect on Linkedin</a>
</p>

---

## 🚀 Features

### User & Access Management

- Manage users: add, update, deactivate/activate.
- Manage roles: create multiple roles with specific permissions.
- Manage modules/pages: control access to each page in the app.
- Assign permissions: customize access per role for different pages.

### Menu & Orders

- Menu Categories: create, update, delete multiple categories.
- Menu Items: manage items with variants and sizes.
- Orders: handle Dine-in, Take-away, and Drive-thru orders.
  - Dine-in orders: select tables, place/reselect orders, fetch existing orders.
- Bookings: manage table bookings with optional advance payment.
- Invoices: view, print, and track past invoices and order details.

### Employee & Salary Management

- Employee management: add employees, manage designations and promotions.
- Salary management:
  - Update salaries, track changes over time.
  - Generate monthly salaries with one click.
  - Track payment status: Pending, Paid.
  - Include bonus, penalties, and custom reasons.
  - Print salary statements and history.

### Transactions & Finances

- Manage transaction categories (salaries, invoices, others).
- Add manual income and expenses.
- Reports:
  - Summary cards: monthly income, expense, active employees, total employees.
  - Charts: visualize monthly/yearly profit and expense trends.
  - Hover cards: view transaction details on hover.

### Analytics & Visualizations

- Charts for financial analysis using **Chart.js** and **Recharts**.
- Animated website elements with **GSAP** for smooth user experience.

---

## 🛠 Tech Stack

### 🎨 Frontend

- **Next.js 15 (App Router)** – React framework for server-side rendering and routing.
- **React Hook Form** – Efficient form handling.
- **ShadCN UI & Cult UI** – Prebuilt, customizable UI components.
- **Tailwind CSS** – Utility-first styling.
- **GSAP** – Animations for website interactions.
- **useSWR** – Data fetching with caching and revalidation.

### 🗄️ Backend & Database

- **TypeScript** – Strongly typed codebase.
- **Drizzle ORM** – Type-safe ORM for MySQL.
- **MySQL** – Relational database for structured data.
- **Auth.js (Credentials-based)** – Secure authentication.
- **Zod** – Input validation and schema enforcement.

### 🧰 Utilities & Libraries

- **Chart.js & Recharts** – Data visualization.
- **React Hot Toast** – Notifications.
- **ExcelJS & jsPDF** – Export data to Excel or PDF.
- **SWR** – Data fetching and caching.
- **Radix UI Components** – Accessible UI elements.
- **clsx & tailwind-merge** – Dynamic class management.

---

## 📁 Folder Structure (Highlights)

```bash
foodya/
├── app/                                # Next.js App Router
│   ├── globals.css                     # Global styles
│   ├── layout.tsx                      # Root layout
│   ├── not-found.tsx                   # 404 page
│   │
│   ├── (website)/                      # Public website routes
│   │   ├── page.tsx                    # Homepage
│   │   ├── about/                      # About page
│   │   └── menu/                       # Public menu display
│   │
│   ├── login/                          # Authentication
│   │   └── page.tsx                    # Login page
│   │
│   ├── errors/                         # Error pages
│   │   ├── 403/                        # Forbidden access
│   │   └── database/                   # Database error page
│   │
│   ├── restaurant/                     # Protected POS routes
│   │   ├── layout.tsx                  # Dashboard layout with sidebar
│   │   ├── page.tsx                    # Dashboard redirect
│   │   │
│   │   ├── (admin-panel)/              # RBAC Management
│   │   │   ├── modules/                # App modules/pages management
│   │   │   ├── permissions/            # Permission assignments
│   │   │   ├── roles/                  # Role management
│   │   │   └── users/                  # User management
│   │   │
│   │   └── (restaurant)/               # Restaurant Operations
│   │       ├── dashboard/              # Main dashboard with quick actions
│   │       ├── menu-categories/        # Menu category management
│   │       ├── menu-items/             # Menu items with variants
│   │       ├── tables/                 # Table management
│   │       ├── bookings/               # Reservation system
│   │       ├── orders/                 # Order processing (dine-in, takeaway, drive-thru)
│   │       ├── invoices/               # Invoice generation and management
│   │       ├── employees/              # Employee records with designations
│   │       ├── salaries/               # Payroll management
│   │       ├── transaction-categories/ # Financial categories
│   │       ├── incomes/                # Income tracking
│   │       ├── expenses/               # Expense management
│   │       └── reports/                # Financial reports and analytics
│   │
│   └── api/                            # API Routes
│       ├── auth/[...nextauth]/         # Auth.js API handler
│       ├── (restaurant)/               # Restaurant API endpoints
│       │   ├── menu-categories/        # Menu category CRUD
│       │   ├── menu-items/             # Menu items CRUD
│       │   ├── restaurant-tables/      # Tables CRUD
│       │   ├── bookings-tables/        # Bookings CRUD
│       │   ├── orders/                 # Order processing
│       │   ├── invoices/               # Invoice operations
│       │   ├── employees/              # Employee management
│       │   ├── payrolls/               # Salary generation and tracking
│       │   ├── transaction-categories/ # Category management
│       │   ├── incomes/                # Income CRUD
│       │   ├── expenses/               # Expense CRUD
│       │   └── reports/                # Financial reporting data
│       ├── (website)/                  # Public API endpoints
│       │   ├── categories/             # Public menu categories
│       │   └── menu/                   # Public menu items
│       ├── module/                     # Module management API
│       ├── permission/                 # Permission management API
│       ├── role/                       # Role management API
│       ├── user/                       # User management API
│       └── db-health/                  # Database health check
│
├── components/                         # React Components
│   ├── ui/                             # ShadCN UI Components
│   ├── DataTable/                      # Reusable data table components
│   ├── custom/                         # Custom components
│   └── fallbacks/                      # Loading and skeleton components
│
├── lib/                                # Utility Libraries
│   ├── utils.ts                        # Helper functions
│   ├── date-fns.ts                     # Date utilities
│   ├── definations.ts                  # Type definitions
│   │
│   ├── db/                             # Database
│   │   └── index.ts                    # Database connection
│   │
│   ├── drizzle-schema/                 # Database schemas
│   │   ├── admin-panel.schema.ts       # RBAC tables
│   │   ├── restaurant.schema.ts        # Restaurant operations tables
│   │   └── index.ts                    # Schema exports
│   │
│   ├── zod-schema/                     # Validation schemas
│   │   ├── index.ts                    # Common schemas
│   │   └── restaurant.zod.ts           # Restaurant-specific schemas
│   │
│   ├── crud-actions/                   # Server actions
│   │   ├── users.ts                    # User operations
│   │   ├── permission.ts               # Permission operations
│   │   ├── employees.ts                # Employee operations
│   │   └── ...                         # Other CRUD operations
│   │
│   ├── seeds/                          # Database seeders
│   │   └── seed.ts                     # Initial data seeding
│   │
│   ├── swr/                            # SWR configuration
│   │   └── index.ts                    # SWR hooks and config
│   │
│   └── server/helpers/                 # Server utilities
│       └── imageUpload.ts              # Image upload handler
│
├── hooks/                              # Custom React Hooks
│   ├── use-mobile.ts                   # Mobile detection
│   ├── use-order-cart.ts               # Order cart management
│   ├── useDbStatus.ts                  # Database health monitoring
│   ├── useModulePermission.ts          # Permission checking
│   ├── usePermissionNavigation.tsx     # Permission-based navigation
│   ├── useShortcuts.ts                 # Keyboard shortcuts
│   └── context/                        # React Context providers
│       ├── OrderCartContext.tsx        # Order cart state
│       └── useUserContext.tsx          # User session state
│
├── types/                              # TypeScript Definitions
│   ├── columns.data-table.ts           # Table column types
│   ├── next-auth.d.ts                  # Auth.js type extensions
│   └── file-saver.d.ts                 # File saver types
│
├── constants/                          # Application Constants
│   └── index.ts                        # Shared constants
│
├── public/                             # Static Assets
│    ├── icons/                          # Icon files
│    ├── images/                         # Image assets
│    └── profile/                        # User profile images
│
├── README.md
├── auth.config.ts                      # Auth.js configuration
├── auth.ts                             # Authentication setup
├── middleware.ts                       # Next.js middleware for route protection
├── drizzle.config.ts                   # Drizzle ORM configuration
├── next.config.ts                      # Next.js configuration
├── package.json                        # Dependencies and scripts
```

---

## 📦 Installation

```bash
# 1. Clone the repo
git clone https://github.com/CodifyCanvas/foodya.git
cd foodya

# 2. Install dependencies
npm install

# 3. Set up .env file
cp .env
# Fill in your DATABASE_URL, AUTH_SECRET, etc.

# 4. Run Drizzle migrations
npx drizzle-kit push

# 5. Run dev server
npm run dev

# 6. Build for Production
npm run build

# 7. Start Server
npm start
```

---

## 🌐 Environment Variables (.env)

```bash
# Database Connection Parameters
DATABASE_NAME=
DATABASE_USER=
DATABASE_HOST=
DATABASE_PORT=
DATABASE_PASSWORD=
DATABASE_MAX_CONNECTION=

# Auth.js
AUTH_SECRET=
```

---

## ✨ Keyboard Shortcuts

| Shortcut | Action                            | Path                               |
| -------- | --------------------------------- | ---------------------------------- |
| Alt + D  | Go to Dashboard                   | /restaurant/dashboard              |
| Alt + U  | Go to Users Page                  | /restaurant/users                  |
| Alt + R  | Go to Roles Page                  | /restaurant/roles                  |
| Alt + P  | Go to Permissions Page            | /restaurant/permissions            |
| Alt + M  | Go to Modules Page                | /restaurant/modules                |
| Alt + C  | Go to Menu Categories Page        | /restaurant/menu-categories        |
| Alt + I  | Go to Menu Items Page             | /restaurant/menu-items             |
| Alt + T  | Go to Tables Page                 | /restaurant/tables                 |
| Alt + B  | Go to Bookings Page               | /restaurant/bookings               |
| Alt + O  | Go to Orders Page                 | /restaurant/orders                 |
| Alt + N  | Go to Invoices Page               | /restaurant/invoices               |
| Alt + E  | Go to Employees Page              | /restaurant/employees              |
| Alt + S  | Go to Salaries Page               | /restaurant/salaries               |
| Alt + X  | Go to Transaction Categories Page | /restaurant/transaction-categories |
| Alt + Q  | Go to Expenses Page               | /restaurant/expenses               |
| Alt + Z  | Go to Incomes Page                | /restaurant/incomes                |
| Alt + L  | Go to Reports Page                | /restaurant/reports                |

---

## 🔐 Authentication

Credentials-based login <br>
Secure sessions using Auth.js <br>
Middleware protected routes <br>
RBAC Per Page <br>

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License & Usage

This project is **100% free** for personal or educational use.  
MIT-style open freedom — no restrictions.

---

## 💬 Credits

Built with ❤️ using Next.js 15 by Shahzaib Awan

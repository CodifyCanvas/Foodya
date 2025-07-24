"use client"

import { DataTableColumnHeader } from "@/components/DataTable/data-table-column-header"
import { RowActions } from "./table-actions"
import { ExtendedColumnDef } from "@/types/columns.data-table"
import { Badge } from "@/components/ui/badge"

// ================================
// Type Definitions
// ================================

// Role object used in dropdowns or display
export interface Role {
  label: string;
  value: string;
}

// User object returned from API
export interface User {
  id: number;
  name: string;
  password: string; // Consider omitting this for security in real UI
  email: string;
  is_active: boolean;
  role_id: string;
  role_name: string;
  created_at: string; // Format: ISO 8601
}

// API response structure
export interface UsersWithRolesResponse {
  users: User[];
  roles: Role[];
}

// ================================
// Column Definitions
// ================================

export const columns = (props: { roles: Role[] }): ExtendedColumnDef<User>[] => [
  // === Index Column ===
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader className="ml-2 md:ml-5" column={column} title="#" search />
    ),
    cell: ({ row }) => (
      <div className="pl-3 md:pl-5">{row.index + 1}</div> // Show row index starting at 1
    ),
  },

  // === Name Column ===
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => <div>{row.original.name}</div>,
  },

  // === Email Column ===
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => <div>{row.original.email}</div>,
  },

  // === Role Column ===
  {
    accessorKey: "role_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" filter={props.roles} />
    ),
    cell: ({ row }) => <div>{row.original.role_name}</div>,
  },

  // === Status Column (Active/Inactive) ===
  {
    accessorKey: "is_active",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Active" />
    ),
    cell: ({ row }) => {
      const isActive = row.original.is_active;

      return (
        <div className="font-rubik-400">
          {isActive ? (
            <Badge className="rounded-full font-rubik-400 border-none bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400 focus-visible:ring-green-600/20 dark:focus-visible:ring-green-400/40 focus-visible:outline-none [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5">
              <span className="size-1.5 rounded-full bg-green-600 dark:bg-green-400" aria-hidden="true" />
              online
            </Badge>
          ) : (
            <Badge className="rounded-full font-rubik-400 border-none bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 focus-visible:outline-none [a&]:hover:bg-destructive/5">
              <span className="size-1.5 rounded-full bg-destructive" aria-hidden="true" />
              offline
            </Badge>
          )}
        </div>
      );
    },
  },

  // === Actions Column ===
  {
    id: "actions",
    header: () => (
      <div className="text-right text-xs font-rubik-500 uppercase pr-10 md:pr-14">Actions</div>
    ),
    cell: ({ row }) => (
      <RowActions
        data={row.original}
        props={{ roles: props.roles }}
        className="pr-3 md:pr-5"
      />
    ),
  },
];

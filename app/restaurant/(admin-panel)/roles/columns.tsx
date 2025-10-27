"use client"

import { DataTableColumnHeader } from "@/components/DataTable/data-table-column-header"
import { RowActions } from "./table-actions"
import { ExtendedColumnDef } from "@/types/columns.data-table"
import { Role } from "@/lib/definations"

/* === Table Columns for Roles === */
export const columns = (): ExtendedColumnDef<Role>[] => [

  // === Index / ID Column ===
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="#"
        className="ml-2 justify-start"
        search
      />
    ),
    cell: ({ row }) => (
      <div className="pl-3 md:pl-5">{row.index + 1}</div>
    ),
  },

  // === Role Name Column ===
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="role"
        className="justify-start"
      />
    ),
    cell: ({ row }) => (
      <div className="capitalize text-left">{row.original.role}</div>
    ),
  },

  // === Actions Column ===
  {
    id: "actions",
    header: () => (
      <div className="text-right text-xs font-rubik-500 uppercase pr-10 md:pr-14">
        Actions
      </div>
    ),
    cell: ({ row }) => (
      <RowActions
        data={row.original}
        className="pr-3 md:pr-5"
      />
    ),
  },
]
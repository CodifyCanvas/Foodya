"use client"

import { DataTableColumnHeader } from "@/components/DataTable/data-table-column-header"
import { RowActions } from "./table-actions"
import { ExtendedColumnDef } from "@/types/columns.data-table"
import { ModuleInterface } from "@/lib/definations"

/* === Table Columns for Roles === */
export const columns = (): ExtendedColumnDef<ModuleInterface>[] => [
  
  // === Id Column ===
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="#"
        className="ml-2 md:ml-5"
        search
      />
    ),
    cell: ({ row }) => (
      <div className="pl-3 md:pl-5">{row.index + 1}</div>
    ),
  },

  // === Role Column ===
  {
    accessorKey: "label",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Label"
      />
    ),
    cell: ({ row }) => (
      <div>{row.original.label}</div>
    ),
  },
  
  // === Role Column ===
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="page"
      />
    ),
    cell: ({ row }) => (
      <div className="capitalize">{row.original.name}</div>
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

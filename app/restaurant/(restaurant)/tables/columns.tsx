"use client"

import { DataTableColumnHeader } from "@/components/DataTable/data-table-column-header"
import { RowActions } from "./table-actions"
import { ExtendedColumnDef } from "@/types/columns.data-table"
import { RestaurantTablesInterface } from "@/lib/definations"
import { Badge } from "@/components/ui/badge"

/* === Table Columns for Tables === */
export const columns = (): ExtendedColumnDef<RestaurantTablesInterface>[] => [
  
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

  // === Table Label Column ===
  {
    accessorKey: "table_number",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Table"
      />
    ),
    cell: ({ row }) => (
      <div>{row.original.table_number}</div>
    ),
  },
  
  // === Table Status Column ===
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="status"
        filter={["available", "occupied", "booked"]}
      />
    ),
    cell: ({ row }) => {
      const status = row.original.status.toLowerCase()

      return <div className="font-rubik-400 w-24 flex flex-row justify-center">
          {status === 'occupied' ? <Badge className="rounded-full capitalize font-rubik-400 border-none bg-red-600/10 min-w-16 text-red-600 dark:bg-red-400/10 dark:text-red-400 focus-visible:ring-red-600/20 dark:focus-visible:ring-red-400/40 focus-visible:outline-none [a&]:hover:bg-red-600/5 dark:[a&]:hover:bg-red-400/5">
              <span className="size-1.5 rounded-full bg-red-600 dark:bg-red-400" aria-hidden="true" />
              {status}
            </Badge> : status === 'booked' ? <Badge className="rounded-full capitalize font-rubik-400 border-none bg-yellow-600/10 min-w-16 text-yellow-600 dark:bg-yellow-400/10 dark:text-yellow-400 focus-visible:ring-yellow-600/20 dark:focus-visible:ring-yellow-400/40 focus-visible:outline-none [a&]:hover:bg-yellow-600/5 dark:[a&]:hover:bg-yellow-400/5">
              <span className="size-1.5 rounded-full bg-yellow-600 dark:bg-yellow-400" aria-hidden="true" />
              {status}
            </Badge> : <Badge className="rounded-full capitalize font-rubik-400 border-none bg-blue-600/10 min-w-16 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400 focus-visible:ring-blue-600/20 dark:focus-visible:ring-blue-400/40 focus-visible:outline-none [a&]:hover:bg-blue-600/5 dark:[a&]:hover:bg-blue-400/5">
              <span className="size-1.5 rounded-full bg-blue-600 dark:bg-blue-400" aria-hidden="true" />
              {status}
            </Badge>}
        </div>
  },
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

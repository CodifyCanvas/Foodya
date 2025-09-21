"use client"

import { DataTableColumnHeader } from "@/components/DataTable/data-table-column-header"
import { RowActions } from "./table-actions"
import { ExtendedColumnDef } from "@/types/columns.data-table"
import { EmployeeWithLatestRecord } from "@/lib/definations"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// === Status Styles for Badge and Dots ===
const statusStyles: Record<string, string> = {
  rejoined: "bg-sky-100 text-sky-800 dark:bg-sky-400/10 dark:text-sky-400",
  active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-400",
  terminated: "bg-neutral-200 text-neutral-700 dark:bg-neutral-400/10 dark:text-neutral-400",
  resigned: "bg-pink-200 text-pink-700 dark:bg-pink-400/10 dark:text-pink-400",
  unknown: "bg-gray-200 text-gray-600 dark:bg-gray-400/10 dark:text-gray-400",
}

const dotColors: Record<string, string> = {
  rejoined: "bg-sky-600 dark:bg-sky-400",
  active: "bg-emerald-600 dark:bg-emerald-400",
  terminated: "bg-neutral-600 dark:bg-neutral-400",
  resigned: "bg-pink-600 dark:bg-pink-400",
  unknown: "bg-gray-600 dark:bg-gray-400",
}

/* === Table Columns for Employees === */
export const columns = (): ExtendedColumnDef<EmployeeWithLatestRecord>[] => [

  // === Serial Number Column ===
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

  // === Employee Name Column ===
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const { name, image } = row.original
      return (
        <div className="flex flex-row gap-2 items-center">
          <Avatar>
            <AvatarImage src={image} />
            <AvatarFallback className="bg-indigo-500/35 text-indigo-600">
              {name?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="capitalize">{name}</span>
        </div>
      )
    },
  },

  // === Employee CNIC Column ===
  {
    accessorKey: "CNIC",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="CNIC" />
    ),
    cell: ({ row }) => (
      <span className="capitalize">{row.original.CNIC}</span>
    ),
  },

  // === Employee Status Column ===
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Status"
        filter={["active", "resigned", "terminated", "rejoined"]}
      />
    ),
    cell: ({ row }) => {
      const rawStatus = row.original.status
      const status = rawStatus?.toLowerCase() || "unknown"

      return (
        <Badge
          className={`rounded-full capitalize font-rubik-400 border-none min-w-16 focus-visible:outline-none focus-visible:ring-2 flex items-center justify-center focus-visible:ring-opacity-20 ${statusStyles[status]}`}
        >
          <span
            className={`size-1.5 rounded-full inline-block ${dotColors[status]}`}
            aria-hidden="true"
          />
          {status}
        </Badge>
      )
    },
  },

  // === Employee Designation Column ===
  {
    accessorKey: "designation",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Designation" />
    ),
    cell: ({ row }) => (
      <span className="capitalize">{row.original.designation}</span>
    ),
  },

  // === Employee Shift Column ===
  {
    accessorKey: "shift",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Shift" />
    ),
    cell: ({ row }) => (
      <span className="capitalize">{row.original.shift}</span>
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
        data={{ employeeId: row.original.id }}
        className="pr-3 md:pr-5"
      />
    ),
  },
]

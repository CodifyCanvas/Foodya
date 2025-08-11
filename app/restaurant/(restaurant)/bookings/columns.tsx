"use client"

import { DataTableColumnHeader } from "@/components/DataTable/data-table-column-header"
import { RowActions } from "./table-actions"
import { ExtendedColumnDef } from "@/types/columns.data-table"
import { BookingsTablesInterface, TablesSelectInput } from "@/lib/definations"
import { Badge } from "@/components/ui/badge"
import { formatDateWithFns } from "@/lib/date-fns"

export interface BookingsWithTablesInterface {
  bookings: BookingsTablesInterface[]
  tables: TablesSelectInput[]
}

/* === Table Columns for Tables === */
export const columns = (props: { tables: TablesSelectInput[] }): ExtendedColumnDef<BookingsTablesInterface>[] => [

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

  // === Customer Name Column ===
  {
    accessorKey: "customerName",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Customer"
      />
    ),
    cell: ({ row }) => (
      <div>{row.original.customerName}</div>
    ),
    meta: {
      title: "Customer"
    }
  },

  // === Table Name Column ===
  {
    accessorKey: "tableName",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Table"
      />
    ),
    cell: ({ row }) => {
      const status = row.original.tableName

      return <div className="font-rubik-400 w-24 flex flex-row justify-center">
        <Badge className="rounded-full capitalize font-rubik-400 border-none bg-purple-600/10 min-w-16 text-purple-600 dark:bg-purple-400/10 dark:text-purple-400 focus-visible:ring-purple-600/20 dark:focus-visible:ring-purple-400/40 focus-visible:outline-none [a&]:hover:bg-purple-600/5 dark:[a&]:hover:bg-purple-400/5">
          <span className="size-1.5 rounded-full bg-purple-600 dark:bg-purple-400" aria-hidden="true" />
          {status}
        </Badge>
      </div>
    },
    meta: {
      title: "table"
    }
  },

  // === Booking Status Column ===
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" filter={['scheduled', 'booked', 'cancelled', 'expired', 'completed', 'processing']} />
    ),
    cell: ({ row }) => {
      const status = row.original.status.toLowerCase();

      const statusStyles: Record<string, string> = {
        scheduled: "bg-sky-100 text-sky-800 dark:bg-sky-400/10 dark:text-sky-400",
        booked: "bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-400",
        completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-400",
        expired: "bg-neutral-200 text-neutral-700 dark:bg-neutral-400/10 dark:text-neutral-400",
        processing: "bg-pink-200 text-pink-700 dark:bg-pink-400/10 dark:text-pink-400",
      };

      const dotColors: Record<string, string> = {
        scheduled: "bg-sky-600 dark:bg-sky-400",
        booked: "bg-amber-600 dark:bg-amber-400",
        completed: "bg-emerald-600 dark:bg-emerald-400",
        expired: "bg-neutral-600 dark:bg-neutral-400",
        processing: "bg-pink-600 dark:bg-pink-400",
      };

      const badgeClass = `rounded-full capitalize font-rubik-400 border-none min-w-16 focus-visible:outline-none
      focus-visible:ring-2 flex flex-row justify-center items-center focus-visible:ring-opacity-20
      ${statusStyles[status] || statusStyles.expired}
      [a&]:hover:bg-opacity-20 dark:[a&]:hover:bg-opacity-20`;

      return (
        <Badge className={badgeClass}>
          <span
            className={`size-1.5 rounded-full inline-block ${dotColors[status] || dotColors.expired}`}
            aria-hidden="true"
          />
          {status}
        </Badge>
      );
    },
  },

  // === Table Reservation Start Column ===
  {
    accessorKey: "reservationStart",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Res Start"
      />
    ),
    cell: ({ row }) => (
      <div>{formatDateWithFns(row.original.reservationStart, { showTime: true, yearFormat: 'short' })}</div>
    ),
    meta: {
      title: "Res Start"
    }
  },

  // === Table Reservation End Column ===
  {
    accessorKey: "reservationEnd",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Res End"
      />
    ),
    cell: ({ row }) => (
      <div>{formatDateWithFns(row.original.reservationEnd, { showTime: true, yearFormat: 'short' })}</div>
    ),
    meta: {
      title: "Res End"
    }
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
        props={{ tables: props.tables }}
        className="pr-3 md:pr-5"
      />
    ),
  },
]

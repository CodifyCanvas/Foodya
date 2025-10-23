"use client"

import { DataTableColumnHeader } from "@/components/DataTable/data-table-column-header"
import { RowActions } from "./table-actions"
import { ExtendedColumnDef } from "@/types/columns.data-table"
import { TransactionCategoriesTablesInterface } from "@/lib/definations"
import { truncateText } from "@/lib/utils"

/* === Columns for Transaction Categories === */
export const columns = (): ExtendedColumnDef<TransactionCategoriesTablesInterface>[] => [

  // === Id Column ===
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

  // === Category Name Column ===
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Category"
        className="justify-start"
        search
      />
    ),
    cell: ({ row }) => (
      <div className="capitalize text-left">{row.original.category}</div>
    ),
  },

  // === Category Description Column ===
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Description"
        className="justify-center"
      />
    ),
    cell: ({ row }) => (
      <div className="capitalize text-center" title={row.original.description}>{truncateText(row.original.description)}</div>
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
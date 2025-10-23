"use client"

import { DataTableColumnHeader } from "@/components/DataTable/data-table-column-header"
import { RowActions } from "./table-actions"
import { ExtendedColumnDef } from "@/types/columns.data-table"
import { TablesSelectInput, TransactionsTablesInterface } from "@/lib/definations"
import { formatDateWithFns } from "@/lib/date-fns"
import TransactionTitleCell from "@/components/custom/dialogs/transaction-title-cell"

/* === Columns for Income Transactions === */
export const columns = (props: { categories: TablesSelectInput[] }): ExtendedColumnDef<TransactionsTablesInterface>[] => [

  // === Id Column ===
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="TID"
        className="ml-2 justify-start"
        search
      />
    ),
    cell: ({ row }) => (
      <div className="pl-3 md:pl-5">{row.original.id}</div>
    ),
  },

  // === Transaction Title Column ===
  {
    accessorKey: "title",
    header: ({ column }) => (

      <DataTableColumnHeader
        column={column}
        title="Title"
        className="justify-start"
        search
      />
    ),
    cell: ({ row }) => <TransactionTitleCell row={row.original} />,
  },

  // === Transaction Category Name Column ===
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Category"
        filter={props.categories}
        className="justify-center"
      />
    ),
    cell: ({ row }) => (
      <div className="capitalize text-center">{row.original.category}</div>
    ),
  },

  // === Transaction Amount Column ===
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Amount"
        className="justify-end"
      />
    ),
    cell: ({ row }) => (
      <div className="capitalize text-right">{row.original.amount} PKR</div>
    ),
  },

  // === Transaction Date Column ===
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Date"
        className="justify-center"
      />
    ),
    cell: ({ row }) => (
      <div className="capitalize text-center">{formatDateWithFns(row.original.createdAt, { showTime: true })}</div>
    ),
    meta: {
      title: 'Date'
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
        props={{ categories: props.categories }}
        className="pr-3 md:pr-5"
      />
    ),
  },
]
"use client"

import { DataTableColumnHeader } from "@/components/DataTable/data-table-column-header"
import { RowActions } from "./table-actions"
import { ExtendedColumnDef } from "@/types/columns.data-table"
import { InvoiceDetail, ItemWithOptions, TablesSelectInput } from "@/lib/definations"
import { Badge } from "@/components/ui/badge"

/* === Table Columns for Invoices === */
export const columns = (props: { menuItems: ItemWithOptions[], tables: TablesSelectInput[] }): ExtendedColumnDef<InvoiceDetail>[] => [

  // === Invoice Id Column ===
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
    meta: {
      title: 'Invoice ID'
    },
    cell: ({ row }) => (
      <div className="pl-3 md:pl-5">{row.original.id}</div>
    ),
  },

  // === Customer Name Column ===
  {
    accessorKey: "customerName",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Customer Name"
      />
    ),
    meta: {
      title: 'Customer Name'
    },
    cell: ({ row }) => {
      const customerName = row.original.customerName;
      const truncated = customerName.length > 30
        ? `${customerName.slice(0, 30)}...`
        : customerName;
      return <div className="capitalize">{truncated}</div>
    },
  },

  // === Order Id Column ===
  {
    accessorKey: "orderId",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Order Id"
        className="ml-2 md:ml-5"
        search
      />
    ),
    defaultVisible: false,
    meta: {
      title: 'Order ID'
    },
    cell: ({ row }) => (
      <div className="pl-3 md:pl-5">{String(row.original.orderId).padStart(4, '0')}</div>
    ),
  },

  // === Payment Method Column ===
  {
    accessorKey: "paymentMethod",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payment" filter={['cash', 'card', 'online', 'unpaid']} />
    ),
    meta: {
      title: 'Payment Method'
    },
    cell: ({ row }) => {
      const status = row.original.paymentMethod ? row.original.paymentMethod.toLowerCase() : 'unkown';

      const statusStyles: Record<string, string> = {
        card: "bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-400",
        cash: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-400",
        online: "bg-sky-200 text-sky-700 dark:bg-sky-400/10 dark:text-sky-400",
        unpaid: "bg-red-200 text-red-700 dark:bg-red-400/10 dark:text-red-400",
      };

      const dotColors: Record<string, string> = {
        card: "bg-amber-600 dark:bg-amber-400",
        cash: "bg-emerald-600 dark:bg-emerald-400",
        online: "bg-sky-600 dark:bg-sky-400",
        unpaid: "bg-red-600 dark:bg-red-400",
      };

      const badgeClass = `rounded-full capitalize font-rubik-400 border-none min-w-16 focus-visible:outline-none
      focus-visible:ring-2 flex flex-row justify-center items-center focus-visible:ring-opacity-20
      ${statusStyles[status]}
      [a&]:hover:bg-opacity-20 dark:[a&]:hover:bg-opacity-20`;

      return (
        <Badge className={badgeClass}>
          <span
            className={`size-1.5 rounded-full inline-block ${dotColors[status]}`}
            aria-hidden="true"
          />
          {status}
        </Badge>
      );
    },
  },

  // === Total Amount Column ===
  {
    accessorKey: "totalAmount",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Total Amount"
        className="ml-2 md:ml-5"
        search
      />
    ),
    meta: {
      title: 'Total amount'
    },
    cell: ({ row }) => (
      <div className="pl-3 md:pl-5">{row.original.totalAmount}</div>
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
        data={{ invoiceId: row.original.id }}
        props={{ menuItems: props.menuItems, tables: props.tables }}
        className="pr-3 md:pr-5"
      />
    ),
  },
]
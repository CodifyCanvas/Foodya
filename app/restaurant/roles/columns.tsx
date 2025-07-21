"use client"

import { DataTableColumnHeader } from "@/components/DataTable/data-table-column-header"
import { RowActions } from "./table-actions"
import { ExtendedColumnDef } from "@/types/columns.data-table"

export type Role = {
  id?: number
  role: string
}

export const columns: ExtendedColumnDef<Role>[] = [
  {
    accessorKey: "id",
    header: ({column}) => (
    <DataTableColumnHeader className="ml-2 md:ml-5" column={column} title="#" search/>
    ),
    cell: ({ row }) => (
      <div className="pl-3 md:pl-5">{row.index + 1}</div>
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="role" />
    ),
    cell: ({ row }) => (
      <div>{row.original.role}</div>
    ),
  },
  {
    id: "actions",
    header: () => (
      <div className="text-right text-xs font-rubik-500 uppercase pr-10 md:pr-14">Actions</div>
    ),
    cell: ({ row }) => <RowActions data={row.original} className="pr-3 md:pr-5"/>,
  },
]

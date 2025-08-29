"use client"

import { DataTableColumnHeader } from "@/components/DataTable/data-table-column-header"
import { RowActions } from "./table-actions"
import { ExtendedColumnDef } from "@/types/columns.data-table"
import { MenuCategories } from "@/lib/definations"

/* === Table Columns for Menu Categories === */
export const columns = (): ExtendedColumnDef<MenuCategories>[] => [
  
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

  // === Category Column ===
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Category"
      />
    ),
    cell: ({ row }) => (
      <div>{row.original.name}</div>
    ),
  },

  // === category description Column ===
  {
    accessorKey: "description",
    header: () => (
      <div>Description</div>
    ),
    cell: ({ row }) => {
  const description = row.original.description;
  const truncated = description.length > 30 
    ? `${description.slice(0, 30)}...` 
    : description;
  return <div>{truncated}</div>;
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

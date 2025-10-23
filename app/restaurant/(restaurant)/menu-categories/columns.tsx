"use client"

import { DataTableColumnHeader } from "@/components/DataTable/data-table-column-header"
import { RowActions } from "./table-actions"
import { ExtendedColumnDef } from "@/types/columns.data-table"
import { MenuCategories } from "@/lib/definations"
import { truncateText } from "@/lib/utils"

/* === Table Columns for Menu Categories === */
export const columns = (): ExtendedColumnDef<MenuCategories>[] => [

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
      <div className="pl-3 md:pl-5 justify-start">{row.index + 1}</div>
    ),
  },

  // === Category Column ===
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Category"
        className="justify-start"
      />
    ),
    cell: ({ row }) => (
      <div className="capitalize justify-start">{row.original.name}</div>
    ),
  },

  // === category description Column ===
  {
    accessorKey: "description",
    header: () => (
      <div className="w-full text-left">Description</div>
    ),
    cell: ({ row }) => {
      const description = row.original.description;
      return <div title={description} className="w-full text-start">{truncateText(description, 30)}</div>;
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

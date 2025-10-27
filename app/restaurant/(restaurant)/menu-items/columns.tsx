"use client"

import { DataTableColumnHeader } from "@/components/DataTable/data-table-column-header"
import { RowActions } from "./table-actions"
import { ExtendedColumnDef } from "@/types/columns.data-table"
import { CategoriesSelectInput, ItemWithOptions } from "@/lib/definations"
import { Badge } from "@/components/ui/badge"
import { truncateText } from "@/lib/utils"

// Api Response Structure
export interface menuItemsFromRoute {
  menuItems: ItemWithOptions[]
  categories: CategoriesSelectInput[]
}

/* === Table Columns for Menu Items === */
export const columns = (props: { categories: CategoriesSelectInput[] }): ExtendedColumnDef<ItemWithOptions>[] => [

  // === Index / Id Column ===
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
      <div className="pl-3 md:pl-5 text-start">{row.index + 1}</div>
    ),
  },

  // === Item Name Column ===
  {
    accessorKey: "item",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Item"
        className="justify-start"
      />
    ),
    cell: ({ row }) => {
      const item = row.original.item;
      return <div title={item} className="w-full text-start">{truncateText(item)}</div>;
    },
  },

  // === Item Category Column ===
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="category"
        className="justify-center"
      />
    ),
    cell: ({ row }) => {
      const category = row.original.category;

      return (
        <div className="font-rubik-400 text-center">

          <Badge className="rounded-full font-rubik-400 border-none bg-blue-600/10 min-w-16 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400 focus-visible:ring-blue-600/20 dark:focus-visible:ring-blue-400/40 focus-visible:outline-none [a&]:hover:bg-blue-600/5 dark:[a&]:hover:bg-blue-400/5">
            <span className="size-1.5 rounded-full bg-blue-600 dark:bg-blue-400" aria-hidden="true" />
            {category}
          </Badge>
        </div>
      );
    },
  },

  // === Item General Price Column ===
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="price"
        className="justify-end"
      />
    ),
    cell: ({ row }) => (
      <div className="w-full text-center">{row.original.price}</div>
    ),
  },

  // === Is Available Column ===
  {
    accessorKey: "is_available",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Available"
        className="justify-center"
      />
    ),
    cell: ({ row }) => {
      const isActive = row.original.is_available;

      return (
        <div className="font-rubik-400 text-center">
          {isActive ? (
            <Badge className="rounded-full font-rubik-400 border-none bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400 focus-visible:ring-green-600/20 dark:focus-visible:ring-green-400/40 focus-visible:outline-none [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5">
              <span className="size-1.5 rounded-full bg-green-600 dark:bg-green-400" aria-hidden="true" />
              Yes
            </Badge>
          ) : (
            <Badge className="rounded-full font-rubik-400 border-none bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 focus-visible:outline-none [a&]:hover:bg-destructive/5">
              <span className="size-1.5 rounded-full bg-destructive" aria-hidden="true" />
              No
            </Badge>
          )}
        </div>
      );
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
        props={{ categories: props.categories }}
      />
    ),
  },
]
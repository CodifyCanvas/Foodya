'use client';

import { DataTableColumnHeader } from "@/components/DataTable/data-table-column-header";
import { RowActions } from "./table-actions";
import { ExtendedColumnDef } from "@/types/columns.data-table";
import { ModuleInterface } from "@/lib/definations";

/* === Table Columns for Modules === */
export const columns = (): ExtendedColumnDef<ModuleInterface>[] => [

  // === Index / ID Column ===
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

  // === Label Column ===
  {
    accessorKey: "label",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Label"
        className="justify-start"
      />
    ),
    cell: ({ row }) => (
      <div className="capitalize text-left">{row.original.label}</div>
    ),
  },

  // === Page / Name Column ===
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Page"
        className="justify-center"
      />
    ),
    cell: ({ row }) => (
      <div className="capitalize text-center">{row.original.name}</div>
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
];

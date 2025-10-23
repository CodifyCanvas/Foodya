"use client"

import { ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, Row, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DataTablePagination } from "./data-table-pagination"
import React, { ReactNode, useState } from "react"
import { Input } from "../ui/input"
import { DataTableViewOptions } from "./data-table-view-options"
import { Search } from "lucide-react"
import { DataTableExport } from "./data-table-export"
import { ExtendedColumnDef } from "@/types/columns.data-table"
import { ScrollArea, ScrollBar } from "../ui/scroll-area"
import { useSidebar } from "../ui/sidebar"

interface DataTableProps<TData, TValue> {
  columns: ExtendedColumnDef<TData, TValue>[]
  data: TData[]
  filterColumns?: string[] // optional list of columns to filter on
  createComponent?: ReactNode;
  loading?: boolean;
}



/**
 * Generic, reusable, and fully-featured data table with TanStack Table v8 and Foodya UI.
 *
 * Features:
 * - Sorting
 * - Pagination
 * - Column visibility toggles
 * - Global search (optional via `filterColumns`)
 * - Export options (CSV, Excel, PDF, Print)
 * - Custom header component (e.g., "Add New" button)
 *
 * @template TData - Type of each data row
 * @template TValue - Type of each cell value
 *
 * @param columns - Table column definitions
 * @param data - Table row data
 * @param filterColumns - Columns included in global search (optional)
 * @param createComponent - Optional header component (e.g., "Add New" button)
 * @param loading - Loading state to show skeletons
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  filterColumns,
  createComponent,
  loading = false,
}: DataTableProps<TData, TValue>) {

  // === Local States ===
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")

  // Set default column visibility based on `defaultVisible` (true unless explicitly false)
  const defaultVisibility = Object.fromEntries(
    columns.map((col) => [
      col.accessorKey ?? col.id,
      col.defaultVisible !== false, // <- if not explicitly false, it's visible
    ])
  );

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(defaultVisibility);
  const { open } = useSidebar();

  // Determine which columns to apply global filtering, except "actions" column
  const effectiveFilterColumns =
    filterColumns && filterColumns.length > 0
      ? filterColumns
      : columns
        .map((col) =>
          "accessorKey" in col && typeof col.accessorKey === "string"
            ? col.accessorKey
            : undefined
        )
        .filter(
          (key): key is string => !!key && key.toLowerCase() !== "actions"
        )


  // Global filter: checks if `filterValue` exists in any of the specified columns for a row
  function multiColumnFilter<TData>(
    row: Row<TData>,
    _columnId: string,
    filterValue: string
  ) {
    return effectiveFilterColumns.some((colId) => {
      const value = row.getValue(colId)
      return String(value).toLowerCase().includes(filterValue.toLowerCase())
    })
  }

  // Initialize the table instance with all features and controlled state
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: multiColumnFilter,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
  })


  return (
    <div>
      {/* Toolbar: Search + Actions */}
      <div className="flex justify-between items-center py-5 px-2 sm:px-5">

        {/* Search input */}
        {effectiveFilterColumns.length > 0 && (
          <div className='relative w-full max-w-xs mr-2'>
            <div className='text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50'>
              <Search className='size-4 text-black' />
              <span className='sr-only'>Search</span>
            </div>
            <Input type='text' variant="minimal" placeholder={filterColumns && filterColumns.length > 0 ? `Search ${effectiveFilterColumns.slice(0, 3).join(", ")}...` : "Search..."} className='peer w-full capitalize border-b ps-9' value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} />
          </div>
        )}

        {/* Actions: Export, Column Options, Create */}
        <div className="flex flex-row items-center gap-2">
          <DataTableExport table={table} />

          <DataTableViewOptions table={table} />

          {createComponent && <>{createComponent}</>}
        </div>
      </div>

      {/* Table */}
      <div className="border-y overflow-x-auto" id="table-to-print">
        <ScrollArea className={`w-[calc(100vw-1rem)] ${open ? 'md:w-[calc(100vw-19rem)]' : 'md:w-[calc(100vw-6rem)]'} overflow-x-auto`}>
          <Table className="min-w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-gray-500 text-xs font-rubik-500 uppercase">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 8 }).map((_, rowIndex) => (
                  <TableRow key={`skeleton-row-${rowIndex}`} className="animate-pulse h-10">
                    {columns.map((_, colIndex) => (
                      <TableCell key={`skeleton-cell-${colIndex}`} className="px-3">
                        <div className="h-4 rounded-lg bg-gray-200 dark:bg-gray-700 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="font-rubik-400 text-sm text-gray-900"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center font-rubik-400">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Pagination */}
      <DataTablePagination table={table} />
    </div>
  )
}
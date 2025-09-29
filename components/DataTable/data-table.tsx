"use client"

import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "./data-table-pagination"
import React, { ReactNode, useState } from "react"
import { Input } from "../ui/input"
import { DataTableViewOptions } from "./data-table-view-options"
import { Search } from "lucide-react"
import { DataTableExport } from "./data-table-export"
import { ExtendedColumnDef } from "@/types/columns.data-table"
import { ScrollArea, ScrollBar } from "../ui/scroll-area"

interface DataTableProps<TData, TValue> {
  columns: ExtendedColumnDef<TData, TValue>[]
  data: TData[]
  filterColumns?: string[] // optional list of columns to filter on
  createComponent?: ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterColumns,
  createComponent
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")

   // Calculate default visibility based on column.defaultVisible
const defaultVisibility = Object.fromEntries(
  columns.map((col) => [
    col.accessorKey ?? col.id,
    col.defaultVisible !== false, // agar explicitly false nahi hai toh true hai
  ])
);
  
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(defaultVisibility)
  // Determine actual columns to filter (fallback to all except "actions")
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

 

  // Global filter function
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
      <div className="flex justify-between items-center py-5 px-2 sm:px-5">
        {effectiveFilterColumns.length > 0 && (
        <div className='relative w-full max-w-xs mr-2'>
        <div className='text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50'>
          <Search className='size-4 text-black' />
          <span className='sr-only'>User</span>
        </div>
        <Input type='text' variant="minimal" placeholder={ filterColumns && filterColumns.length > 0 ? `Search ${effectiveFilterColumns.slice(0, 3).join(", ")}...` : "Search..." } className='peer w-full capitalize border-b ps-9' value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} />
      </div>
        )}
        <div className="flex flex-row items-center gap-2">
          <DataTableExport table={table} />

          <DataTableViewOptions table={table} />

          {createComponent && <div>{createComponent}</div>}
        </div>
      </div>

      <div className="border-y overflow-x-auto" id="table-to-print">
        <ScrollArea className="w-[calc(100vw-1rem)] md:w-[calc(100vw-18rem)] overflow-x-auto">
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
            {table.getRowModel().rows.length ? (
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

      <DataTablePagination table={table} />
    </div>
  )
}

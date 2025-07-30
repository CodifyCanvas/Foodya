"use client"

import { Table } from "@tanstack/react-table"
import { Columns3Cog, RefreshCcwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function DataTableViewOptions<TData>({
  table,
}: {
  table: Table<TData>
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="ml-auto font-rubik-400 gap-2 hidden md:flex"
        >
          <Columns3Cog className="h-4 w-4" />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px] font-rubik-400">
        <DropdownMenuLabel className="text-xs">Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
  .getAllColumns()
  .filter((column) => column.getCanHide())
  .map((column) => {
    const label = column.columnDef.meta?.title ?? column.id

    return (
      <DropdownMenuCheckboxItem
        key={column.id}
        className="capitalize"
        checked={column.getIsVisible()}
        onCheckedChange={(value) => column.toggleVisibility(!!value)}
      >
        {label}
      </DropdownMenuCheckboxItem>
    )
  })}


        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => table.resetColumnVisibility()}>
          <RefreshCcwIcon className="mr-2 h-4 w-4" />
          Reset
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

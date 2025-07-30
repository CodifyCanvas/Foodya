"use client"

import { useState } from "react"
import { Column } from "@tanstack/react-table"
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  EyeOff,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
  search?: boolean
  // filter?: string[]
  filter?: (string | { label: string; value: string })[]

}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  search = false,
  filter,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const [inputValue, setInputValue] = useState("")
  const [selectValue, setSelectValue] = useState("")

  const sorted = column.getIsSorted()

  const handleInputChange = (value: string) => {
    setInputValue(value)
    column.setFilterValue(value)
  }

  const handleSelectChange = (value: string) => {
    setSelectValue(value)
    column.setFilterValue(value)
  }

  const clearFilter = () => {
    setInputValue("")
    setSelectValue("")
    column.setFilterValue(undefined)
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="data-[state=open]:bg-accent -ml-3 h-8"
          >
            <span className="text-[12px] font-rubik-500 uppercase">{title}</span>
            {sorted === "desc" ? (
              <ArrowDown className="ml-1 h-4 w-4" />
            ) : sorted === "asc" ? (
              <ArrowUp className="ml-1 h-4 w-4" />
            ) : (
              <ChevronsUpDown className="ml-1 h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-56 p-2 space-y-1 font-rubik-400">

          {/* 🔍 Text Search Input */}
          {!filter?.length && search && column.getCanFilter() ? (
            <Input
              placeholder={`Search ${title.charAt(0).toUpperCase() + title.slice(1)}...`}
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              className="h-8"
            />
          ) : null}

          {/* Filter Dropdown menu */}
          {filter?.length ? (
            <Select value={selectValue} onValueChange={handleSelectChange}>
              <SelectTrigger className="h-8 w-full capitalize">
                <SelectValue placeholder={`Filter ${title}`} />
              </SelectTrigger>
              <SelectContent className="font-rubik-400 capitalize">
                {filter.map((item) =>
                  typeof item === "string" ? (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ) : (
                    <SelectItem key={item.value} value={item.label}>
                      {item.label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          ) : null}


          {/* ❌ reset columns Visibilty */}
          {(inputValue || selectValue) && (
            <DropdownMenuItem
              // variant="ghost"
              className="px-2 text-xs font-medium"
              onClick={clearFilter}
            >
              <X className="mr-2 size-4" />
              Clear Filter
            </DropdownMenuItem>
          )}

          {(search || filter?.length) && <DropdownMenuSeparator className="my-1" />}

          <DropdownMenuItem onClick={() => column.toggleSorting(false)} className="text-xs">
            <ArrowUp className="mr-2 size-4" />
            Sort Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)} className="text-xs">
            <ArrowDown className="mr-2 size-4" />
            Sort Desc
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => column.toggleVisibility(false)} className="text-xs">
            <EyeOff className="mr-2 size-4" />
            Hide Column
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

"use client"

import { useState } from "react"
import { ChevronDown, PencilLine } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { RoleForm } from "./form"
import { Role } from "./columns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

/* === Edit/Delete Form Props Interface === */
interface editFormMultiProps {
  props?: Record<string, any>
  data: Role
  className?: string
}

/* === Row Actions (Edit/Delete) === */
export function RowActions({ data, props, className }: editFormMultiProps) {
  const [openEdit, setOpenEdit] = useState(false)

  return (
    <div className={cn("w-full flex flex-row justify-end items-center", className)}>

      {/* === Dropdown Menu Button === */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" className="h-8 w-fit p-0 font-rubik-400">
            Actions
            <ChevronDown className="size-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>

        {/* === Menu Options === */}
        <DropdownMenuContent align="end" className="font-rubik-400 text-xs">
          <DropdownMenuItem onClick={() => setOpenEdit(true)}>
            <PencilLine className="mr-2 size-4" /> Edit
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* === Edit Dialog === */}
      {openEdit && (
        <RoleForm open={openEdit} onOpenChange={setOpenEdit} data={data} {...props} /> )}
    </div>
  )
}


"use client"

import { useState } from "react"
import { ChevronDown, PencilLine, Plus, Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { RoleForm } from "./form"
import { Role } from "./columns"
import DeleteConfirmationDialog from "@/components/custom/dialogs/delete-confirmation-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

/* === Create Form Props Interface === */
interface createFormMultiProps {
  props?: Record<string, any> // Optional external props (e.g. role list, permissions)
}

/* === Edit/Delete Form Props Interface === */
interface editFormMultiProps {
  props?: Record<string, any>
  data: Role
  className?: string
}

/* === Row Actions (Edit/Delete) === */
export function RowActions({ data, props, className }: editFormMultiProps) {
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

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
          <DropdownMenuItem variant="destructive" onClick={() => setOpenDelete(true)}>
            <Trash2 className="mr-2 size-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* === Edit Dialog === */}
      {openEdit && (
        <RoleForm open={openEdit} onOpenChange={setOpenEdit} data={data} {...props} /> )}

      {/* === Delete Confirmation Dialog === */}
      {openDelete && (
        <DeleteConfirmationDialog<Role> open={openDelete} onOpenChange={setOpenDelete} data={data} dbTable="roles" tableName="Role" /> )}
    </div>
  )
}

/* === Create New Role Button + Form === */
export function CreateForm({ props }: createFormMultiProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="green">
        <Plus className="mr-2" />
        <span className="md:block hidden">Add</span>
      </Button>

      {/* === Create Form Dialog === */}
      <RoleForm open={open} onOpenChange={setOpen} data={null} {...props} />
    </>
  )
}

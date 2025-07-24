"use client"

import { useState } from "react"
import { ChevronDown, PencilLine, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FormDialog } from "./form"
import DeleteConfirmationDialog from "@/components/custom/dialogs/delete-confirmation-dialog"
import { User } from "./columns"
import { cn } from "@/lib/utils"

/* === Types for Create and Edit Actions === */
interface createFormMultiProps {
  props?: Record<string, any>;
}

interface editFormMultiProps {
  props?: Record<string, any>;
  data: User;
  className?: string;
}

/* === Row Actions Component (Edit/Delete) === */
export function RowActions({ data, props, className }: editFormMultiProps) {
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  return (
    <div className={cn("w-full flex flex-row justify-end items-center", className)}>
      
      {/* === Action Dropdown Menu === */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" className="h-8 w-fit p-0 font-rubik-400">
            Actions
            <ChevronDown className="size-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="font-rubik-400 text-xs">
          <DropdownMenuItem onClick={() => setOpenEdit(true)}>
            <PencilLine className="mr-2 size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => setOpenDelete(true)}>
            <Trash2 className="mr-2 size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* === Edit User Dialog === */}
      {openEdit && (
        <FormDialog open={openEdit} onOpenChange={setOpenEdit} data={data} {...props} /> )}

      {/* === Delete Confirmation Dialog === */}
      {openDelete && (
        <DeleteConfirmationDialog<User> open={openDelete} onOpenChange={setOpenDelete} data={data} dbTable="roles" tableName="Role" /> )}
    </div>
  )
}

/* === Create New User Button === */
export function CreateForm({ props }: createFormMultiProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* === Create Button === */}
      <Button onClick={() => setOpen(true)} variant="green">
        <Plus className="mr-1" />
        <span className="hidden md:inline">Add</span>
      </Button>

      {/* === Create Form Dialog === */}
      <FormDialog open={open} onOpenChange={setOpen} data={null} {...props} />
    </>
  )
}

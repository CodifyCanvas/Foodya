"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown, PencilLine, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { RoleForm } from "./role-form"
import { Role } from "./columns"
import { cn } from "@/lib/utils"
import DeleteConfirmationDialog from "@/components/custom/dialogs/delete-confirmation-dialog"

export function RowActions({ data, className }: { data: Role; className?: string }) {
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  return (
    <div className={cn(`w-full flex flex-row justify-end items-center`, className)}>
      <DropdownMenu >
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" className="h-8 w-fit p-0 font-rubik-400">
            Actions
            <ChevronDown className="size-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="font-rubik-400 text-xs">
          <DropdownMenuItem onClick={() => setOpenEdit(true)}> <PencilLine /> Edit</DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => setOpenDelete(true)}><Trash2 /> Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {openEdit && <RoleForm open={openEdit} onOpenChange={setOpenEdit} data={data} />}
      {openDelete && <DeleteConfirmationDialog<Role> open={openDelete} onOpenChange={setOpenDelete} data={data} dbTable="roles" tableName="Role" />}
    </div>
  )
}


export function CreateForm() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="green"><Plus /> <span className="md:block hidden">Add</span></Button>
      <RoleForm open={open} onOpenChange={setOpen} data={null} />
    </>
  )
}

export function DeleteDialog() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="green"><Plus /> <span className="md:block hidden">Add</span></Button>
    </>
  )
}


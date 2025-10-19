'use client';

import { useState, useCallback } from 'react';
import { ChevronDown, PencilLine, Plus, Trash2, TriangleAlert, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RoleForm } from './form';
import DeleteConfirmationDialog from '@/components/custom/dialogs/delete-confirmation-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useModulePermission } from '@/hooks/useModulePermission';
import { BookingsTablesInterface } from '@/lib/definations';
import CancelBookingDialog from './cancel-booking-dialog';

interface CreateFormMultiProps {
  props?: Record<string, any>;
}

interface EditFormMultiProps {
  props?: Record<string, any>;
  data: BookingsTablesInterface;
  className?: string;
}

/* === Toast for Permission Denied === */
const showPermissionToast = () => {
  return toast.custom(
    <div className="flex items-center gap-3 bg-red-500 text-white px-5 py-3 rounded-lg shadow-lg">
      <TriangleAlert className="w-5 h-5 text-white" />
      <span>You don&apos;t have permission.</span>
    </div>,
    {
      position: 'top-right',
      duration: 4000,
    }
  )
};



/* === Row Actions (Edit / Cancel / Delete) === */
export function RowActions({ data, props = {}, className }: EditFormMultiProps) {

  const status = data.status?.toLowerCase().trim();

  const isCancellable = !["expired", "cancelled", "completed", "processing"].includes(status);
  const isEditable = !["expired", "completed", "processing"].includes(status);

  const [openCancel, setOpenCancel] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);



  const { canEdit, canDelete } = useModulePermission();

  /* === Action Handlers === */
  const handleCancelClick = () => {
    if (canEdit) {
      setOpenCancel(true);
    }
    else {
      showPermissionToast();
    }
  }

  const handleEditClick = () => {
    if (canEdit) {
      setOpenEdit(true)
    }
    else {
      showPermissionToast();
    }
  }

  const handleDeleteClick = () => {
    if (canDelete) {
      setOpenDelete(true);
    } else {
      showPermissionToast();
    }
  };

  return (
    <div className={cn('w-full flex flex-row justify-end items-center', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" className="h-8 w-fit p-0 font-rubik-400">
            Actions
            <ChevronDown className="size-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="font-rubik-400 text-xs">
          {/* === Show Cancel if status is not cancelled or expired === */}
          {isCancellable && (
            <DropdownMenuItem onClick={handleCancelClick}>
              <X className="mr-2 size-4" />
              Cancel
            </DropdownMenuItem>
          )}

          {/* === Show Edit if status is not cancelled or expired === */}
          {isEditable && (
            <DropdownMenuItem onClick={handleEditClick}>
              <PencilLine className="mr-2 size-4" />
              Edit
            </DropdownMenuItem>
          )}

          <DropdownMenuItem variant="destructive" onClick={handleDeleteClick}>
            <Trash2 className="mr-2 size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* === Dialogs for each action === */}
      {openCancel && (
        <CancelBookingDialog<BookingsTablesInterface>
          open={openCancel}
          onOpenChange={setOpenCancel}
          data={data}
          {...props}
        />
      )}

      {openEdit && (
        <RoleForm
          open={openEdit}
          onOpenChange={setOpenEdit}
          data={data}
          {...props}
        />
      )}

      {openDelete &&
        <DeleteConfirmationDialog
          isOpen={openDelete}
          title="Delete Booking?"
          confirmMessage="This will permanently remove the booking and cannot be undone."
          setIsOpen={setOpenDelete}
          deletePayload={{ id: data.id, status: data.status }}
          deleteEndpoint="/api/bookings-tables"
        />}
    </div>
  );
}



/* === Create New Record Button + Form === */
export function CreateForm({ props = {} }: CreateFormMultiProps) {
  const [open, setOpen] = useState(false);
  const { canCreate } = useModulePermission();

  /* === Create Button Click Handler === */
  const handleCreateClick = () => {
    if (canCreate) {
      setOpen(true)
    }
    else {
      showPermissionToast();
    }
  }

  return (
    <>
      <Button onClick={handleCreateClick} variant="green">
        <Plus />
        <span className="md:block hidden">Add</span>
      </Button>

      <RoleForm open={open} onOpenChange={setOpen} data={null} {...props} />
    </>
  );
}

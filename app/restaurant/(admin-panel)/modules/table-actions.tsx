'use client';

import { useState } from 'react';
import { ChevronDown, PencilLine, Plus, Trash2, TriangleAlert } from 'lucide-react';
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
import { ModuleInterface } from '@/lib/definations';

interface CreateFormMultiProps {
  props?: Record<string, any>;
}

interface EditFormMultiProps {
  props?: Record<string, any>;
  data: ModuleInterface;
  className?: string;
}

/* === Toast for Permission Denied === */
const showPermissionToast = () =>
  toast.custom(
    <div className="flex items-center gap-3 bg-red-500 text-white px-5 py-3 rounded-lg shadow-lg">
      <TriangleAlert className="w-5 h-5 text-white" />
      <span>You don&apos;t have permission.</span>
    </div>,
    {
      position: 'top-right',
      duration: 4000,
    }
  );

/* === Row Actions (Edit/Delete) === */
export function RowActions({ data, props, className }: EditFormMultiProps) {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const { canEdit, canDelete } = useModulePermission();

  const handleEditClick = () => {
    if (canEdit) {
      setOpenEdit(true);
    } else {
      showPermissionToast();
    }
  };

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
          <DropdownMenuItem onClick={handleEditClick}>
            <PencilLine className="mr-2 size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={handleDeleteClick}>
            <Trash2 className="mr-2 size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {openEdit && <RoleForm open={openEdit} onOpenChange={setOpenEdit} data={data} {...props} />}
      {openDelete &&
        <DeleteConfirmationDialog
          isOpen={openDelete}
          title="Are you sure you want to delete this module?"
          confirmMessage="Deleting this module will remove all permissions and settings linked to it. This action is irreversible."
          setIsOpen={setOpenDelete} deletePayload={{ id: data.id }}
          deleteEndpoint="/api/module"
        />}
    </div>
  );
}

/* === Create New Role Button + Form === */
export function CreateForm({ props }: CreateFormMultiProps) {
  const [open, setOpen] = useState(false);
  const { canCreate } = useModulePermission();

  const handleCreateClick = () => {
    if (canCreate) {
      setOpen(true);
    } else {
      showPermissionToast();
    }
  };

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

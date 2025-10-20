'use client';

import { useState } from 'react';
import { ChevronDown, PencilLine, Plus, SquareMenu, Trash2, TriangleAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import DeleteConfirmationDialog from '@/components/custom/dialogs/delete-confirmation-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useModulePermission } from '@/hooks/useModulePermission';
import { CreateEmployeeForm } from './(forms)/create-employee-form';
import { EditEmployeeForm } from './(forms)/edit-employee-form';
import { usePathname, useRouter } from 'next/navigation';

interface CreateFormMultiProps {
  props?: Record<string, any>;
}

interface EditFormMultiProps {
  props?: Record<string, any>;
  data: { employeeId: number };
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
  const path = usePathname();
  const router = useRouter()

  const { canView, canEdit, canDelete } = useModulePermission();

  const handleViewClick = () => {
    if (canView) {
      router.push(`${path}/${data.employeeId}`)
    } else {
      showPermissionToast();
    }
  };

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
          <DropdownMenuItem onClick={handleViewClick}>
            <SquareMenu className="mr-2 size-4" />
            View
          </DropdownMenuItem>
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

      {openEdit && <EditEmployeeForm open={openEdit} onOpenChange={setOpenEdit} data={data} {...props} />}
      {openDelete &&
        <DeleteConfirmationDialog
          isOpen={openDelete}
          setIsOpen={setOpenDelete}
          title='Are you Sure?'
          confirmMessage='it will delete the employee with its records and the salary + transaction history'
          deletePayload={{ id: data.employeeId }}
          deleteEndpoint={`/api/employees/${data.employeeId}`}
          revalidateEndpoint='/api/employees/all'
        />
      }

    </div>
  );
}

/* === Create New Data Button with Permission Check === */
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

      <CreateEmployeeForm open={open} onOpenChange={setOpen} data={null} {...props} />
    </>
  );
}

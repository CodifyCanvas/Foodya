'use client';

import { useState } from 'react';
import { ChevronDown, PencilLine, Plus, SquareMenu, Trash2, TriangleAlert } from 'lucide-react';
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
import GenerateInvoiceDialog from '../orders/generate-invoice-dialog';

/* === Types === */
interface CreateFormMultiProps {
  props?: Record<string, any>;
}

interface EditFormMultiProps {
  props?: Record<string, any>;
  data: { invoiceId: string | number };
  className?: string;
}

/* === Permission Denied Toast === */
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

/* === Row Actions (Edit/Delete) Component with Permission Check === */
export function RowActions({ data, props, className }: EditFormMultiProps) {
  const [openEdit, setOpenEdit] = useState(false);
  const [openInvoiceView, setOpenInvoiceView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const { canView, canEdit, canDelete } = useModulePermission();

  const handleViewClick = () => {
    if (canView) {
      setOpenInvoiceView(true);
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

      {openInvoiceView && (
        <GenerateInvoiceDialog
          isOpen={openInvoiceView}
          setIsOpen={setOpenInvoiceView}
          mode="view"
          data={{
            invoiceId: data.invoiceId
          }}
        />
      )}

      {openEdit && (
        <RoleForm open={openEdit} onOpenChange={setOpenEdit} data={data} {...props} />
      )}

      {openDelete && (
        <DeleteConfirmationDialog
          isOpen={openDelete}
          title={`Delete Invoice #${data.invoiceId}`}
          confirmMessage="Are you sure you want to delete this invoice? This action cannot be undone and will also permanently remove the associated transaction."
          setIsOpen={setOpenDelete}
          deletePayload={{ id: data.invoiceId }}
          deleteEndpoint={`/api/invoices/${data.invoiceId}`}
          revalidateEndpoint='/api/invoices'
        />
      )}
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

      <RoleForm open={open} onOpenChange={setOpen} data={null} {...props} />
    </>
  );
}

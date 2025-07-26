'use client';

import { useState } from 'react';
import { ChevronDown, PencilLine, TriangleAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RoleForm } from './form';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useModulePermission } from '@/hooks/useModulePermission';
import { Role } from '@/lib/definations';

interface EditFormMultiProps {
  props?: Record<string, any>;
  data: Role;
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

export function RowActions({ data, props, className }: EditFormMultiProps) {
  const [openEdit, setOpenEdit] = useState(false);

  const { canEdit } = useModulePermission();

  const handleEditClick = () => {
    if (canEdit) {
      setOpenEdit(true);
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
        </DropdownMenuContent>
      </DropdownMenu>

      {openEdit && <RoleForm open={openEdit} onOpenChange={setOpenEdit} data={data} {...props} />}
    </div>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronDown, PencilLine, RefreshCcw, SquareMenu, TriangleAlert } from 'lucide-react';
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
import { refreshData } from '@/lib/swr';

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

  const { canView, canEdit } = useModulePermission();

  const handleEditClick = () => {
    if (canEdit) {
      setOpenEdit(true);
    } else {
      showPermissionToast();
    }
  };

  const handleViewClick = () => {
    if (canView) {
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
          <DropdownMenuItem onClick={handleViewClick}>
            <SquareMenu className="mr-2 size-4" />
            View
          </DropdownMenuItem>
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

/* === Create Form (Refresh Payroll Button) === */
export function CreateForm({ props }: CreateFormMultiProps) {
  const [loading, setLoading] = useState(false);
  const [hideButton, setHideButton] = useState(false);
  const { canCreate } = useModulePermission();

  const STORAGE_KEY = "payrollRefreshTimestamp";

  /* === Check LocalStorage to Hide Button if Recently Refreshed === */
  useEffect(() => {
    const timestampStr = localStorage.getItem(STORAGE_KEY);
    if (!timestampStr) return;

    const timestamp = Number(timestampStr);
    const now = Date.now();

    // Difference in milliseconds
    const minutesPassed = (now - timestamp) / (1000 * 60);

    if (minutesPassed < 1440) {
      setHideButton(true);
    } else {
      localStorage.removeItem(STORAGE_KEY); // Cleanup expired timestamp
    }
  }, []);

  /* === Refresh Handler === */
  const handleRefreshPayrolls = useCallback(async () => {
    try {
      setLoading(true);

      toast.loading("Payroll refresh in progress...", {
        id: "refreshing-payrolls-toast",
      });

      const response = await fetch('/api/payrolls/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to refresh payrolls at the moment.");
      }

      toast.success(result.message ?? "Payrolls updated successfully!");

      // Store timestamp in localStorage to hide button
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
      setHideButton(true);

      refreshData('/api/payrolls')
    } catch (error) {
      console.error("Payroll refresh error:", error);
      toast.error("Oops! Could not refresh payrolls. Please try again.");
    } finally {
      toast.dismiss("refreshing-payrolls-toast");
      setLoading(false);
    }
  }, []);

  /* === Permission Gate === */
  const handleRefreshClick = () => {
    if (canCreate) {
      handleRefreshPayrolls();
    } else {
      showPermissionToast();
    }
  };

  if (hideButton) return null;

  return (
    <>
      <Button onClick={handleRefreshClick} disabled={loading} variant="green">
        <RefreshCcw />
        <span className="md:block hidden">Refresh</span>
      </Button>
    </>
  );
}


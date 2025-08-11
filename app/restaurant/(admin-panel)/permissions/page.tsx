'use client';

import useSWR from 'swr';
import { Loader } from 'lucide-react';

import { DataTable } from '@/components/DataTable/data-table';
import { columns } from './columns';
import { useModulePermission } from '@/hooks/useModulePermission';
import AccessDenied from '@/app/errors/access-control-view/access-denied';
import { Role } from '@/lib/definations';
import { useUserContext } from '@/hooks/context/useUserContext';

/* === Data Fetcher === */
const fetcher = (url: string) => fetch(url).then(res => res.json());

const PermissionsPage = () => {
  // Use the permission hook
  const { canView, loading: permLoading } = useModulePermission();
  const { refetchPermissions } = useUserContext();


  // Fetch permissions data
  const {
    data: permissions,
    error,
    isLoading: dataLoading,
  } = useSWR<Role[]>('/api/permission', fetcher);

  const isLoading = permLoading || dataLoading;

  if (isLoading) {
    return (
      <div className="flex-1 h-full w-full bg-white flex justify-center items-center">
        <Loader className="animate-spin size-7 text-gray-500" />
      </div>
    );
  }

  if (!canView) {
    return <AccessDenied />;
  }

  return (
    <div className="bg-white rounded-lg min-h-[50vh] flex flex-col">
      {/* Page Header */}
      <h3 className="text-3xl font-medium text-start px-4 pt-3 text-emerald-600">
        Permissions
      </h3>

      {/* Error or Data Table */}
      {error ? (
        <div className="text-center text-destructive py-4 font-medium">
          Failed to load data
        </div>
      ) : (
        <DataTable
          columns={columns({ refetchPermissions })}
          data={permissions ?? []}
          filterColumns={['role']}
        />
      )}
    </div>
  );
};

export default PermissionsPage;

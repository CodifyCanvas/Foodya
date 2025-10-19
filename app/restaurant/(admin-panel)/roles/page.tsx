'use client';

import useSWR from 'swr';
import { Loader } from 'lucide-react';

import { DataTable } from '@/components/DataTable/data-table';
import { columns } from './columns';
import { CreateForm } from './table-actions';
import { useModulePermission } from '@/hooks/useModulePermission';
import AccessDenied from '@/app/errors/access-control-view/access-denied';
import { Role } from '@/lib/definations';
import ServiceUnavailable from '@/app/errors/service-unavailable';

/* === Fetcher Function === */
const fetcher = (url: string) => fetch(url).then(res => res.json());

const RolesPage = () => {
  // Use permission hook
  const { canView, loading: permLoading } = useModulePermission();

  // Fetch roles data from API
  const {
    data: roles,
    error,
    isLoading: rolesLoading,
  } = useSWR<Role[]>('/api/role', fetcher);

  const isLoading = permLoading || rolesLoading;

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

  if (error) {
    console.error(error);
    return <ServiceUnavailable title='Service Unavailable' description='Please try again later or check your connection.' />;
  }

  return (
    <div className="bg-white rounded-lg min-h-[50vh] flex flex-col">
      <h3 className="text-3xl font-medium text-start px-4 pt-3 text-emerald-600">Roles</h3>

      <DataTable
        columns={columns()}
        data={roles ?? []}
        filterColumns={['role']}
        createComponent={<CreateForm />}
        loading={isLoading}
      />

    </div>
  );
};

export default RolesPage;

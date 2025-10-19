'use client';

import useSWR from 'swr';
import { Loader } from 'lucide-react';

import { DataTable } from '@/components/DataTable/data-table';
import { columns, UsersWithRolesResponse } from './columns';
import { CreateForm } from './table-actions';
import { useModulePermission } from '@/hooks/useModulePermission';
import AccessDenied from '@/app/errors/access-control-view/access-denied';
import ServiceUnavailable from '@/app/errors/service-unavailable';

/* === SWR Fetcher === */
const fetcher = (url: string) => fetch(url).then(res => res.json());

const UsersPage = () => {
  const { canView, loading: permLoading } = useModulePermission();

  const {
    data,
    error,
    isLoading: dataLoading,
  } = useSWR<UsersWithRolesResponse>('/api/users', fetcher);

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

  if (error) {
    console.error(error);
    return <ServiceUnavailable title='Service Unavailable' description='Please try again later or check your connection.' />;
  }

  return (
    <div className="bg-white rounded-lg min-h-[50vh] flex flex-col">
      {/* Page Header */}
      <h3 className="text-3xl font-medium text-start px-4 pt-3 text-emerald-600">
        Users
      </h3>

      <DataTable
        columns={columns({ roles: data?.roles ?? [] })}
        data={data?.users ?? []}
        filterColumns={['email', 'name']}
        createComponent={
          <CreateForm props={{ roles: data?.roles ?? [] }} />
        }
        loading={isLoading}
      />

    </div>
  );
};

export default UsersPage;

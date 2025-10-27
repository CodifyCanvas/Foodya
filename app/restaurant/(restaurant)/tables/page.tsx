'use client';

import useSWR from 'swr';
import { Loader } from 'lucide-react';

import { DataTable } from '@/components/DataTable/data-table';
import { columns } from './columns';
import { CreateForm } from './table-actions';
import { useModulePermission } from '@/hooks/useModulePermission';
import AccessDenied from '@/app/errors/403/page';
import { RestaurantTablesInterface } from '@/lib/definations';
import ServiceUnavailable from '@/app/errors/service-unavailable';
import { swrFetcher } from '@/lib/swr';



const TablesPage = () => {
  // === Permission Hook ===
  const { canView, loading: permLoading } = useModulePermission();

  // === Fetch Restaurant Tables ===
  const { data: tables, error, isLoading: dataLoading } = useSWR<RestaurantTablesInterface[]>('/api/restaurant-tables', swrFetcher);

  // === Combined Loading State ===
  const isLoading = permLoading || dataLoading;

  // === Loading Fallback ===
  if (isLoading) {
    return (
      <div className="flex-1 h-full w-full bg-white flex justify-center items-center">
        <Loader className="animate-spin size-7 text-gray-500" />
      </div>
    );
  }

  // === Access Denied ===
  if (!canView) {
    return <AccessDenied />;
  }

  // === Error Handling ===
  if (error) {
    console.error(error);
    return (
      <ServiceUnavailable
        title="Service Unavailable"
        description="Please try again later or check your connection."
      />
    );
  }

  return (
    <div className="bg-white rounded-lg min-h-[50vh] flex flex-col">
      {/* === Page Header === */}
      <h3 className="text-3xl font-medium text-start px-4 pt-3 text-emerald-600">
        Restaurant Tables
      </h3>

      {/* === Data Table === */}
      <DataTable
        columns={columns()}
        data={tables ?? []}
        filterColumns={[]}
        createComponent={<CreateForm />}
        loading={isLoading}
      />
    </div>
  );
};

export default TablesPage;

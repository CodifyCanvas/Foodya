'use client';

import useSWR from 'swr';
import { Loader } from 'lucide-react';

import { DataTable } from '@/components/DataTable/data-table';
import { BookingsWithTablesInterface, columns } from './columns';
import { CreateForm } from './table-actions';
import { useModulePermission } from '@/hooks/useModulePermission';
import AccessDenied from '@/app/errors/access-control-view/access-denied';
import { BookingsTablesInterface } from '@/lib/definations';

/* === Data Fetcher === */
const fetcher = (url: string) => fetch(url).then(res => res.json());

const ModulesPage = () => {
  // Use the custom permission hook
  const { canView, loading: permLoading } = useModulePermission();

  // Fetch Restaurant Table data
  const { data, error, isLoading: dataLoading } = useSWR<BookingsWithTablesInterface>('/api/bookings-tables', fetcher);

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
        Bookings
      </h3>

      {/* Data or Error */}
      {error ? (
        <div className="text-center text-destructive py-4 font-medium">
          Failed to load data
        </div>
      ) : (
        <DataTable
          columns={columns({ tables: data?.tables ?? []})}
          data={data?.bookings ?? []}
          filterColumns={[]}
          createComponent={<CreateForm props={{ tables: data?.tables }} />}
        />
      )}
    </div>
  );
};

export default ModulesPage;

'use client';

import useSWR from 'swr';
import { Loader } from 'lucide-react';

import { DataTable } from '@/components/DataTable/data-table';
import { columns } from './columns';
import { CreateForm } from './table-actions';
import { useModulePermission } from '@/hooks/useModulePermission';
import AccessDenied from '@/app/errors/403/page';
import { TransactionsTablesInterface, TablesSelectInput } from '@/lib/definations';
import ServiceUnavailable from '@/app/errors/service-unavailable';

/* === Data Fetcher === */
const fetcher = (url: string) => fetch(url).then(res => res.json());

interface TransactionsResponseInterface {
  transactions: TransactionsTablesInterface[]
  categories: TablesSelectInput[]
}

const ExpensePage = () => {
  // Use the custom permission hook
  const { canView, loading: permLoading } = useModulePermission();

  // Fetch Transaction Categories data
  const { data, error, isLoading: dataLoading } = useSWR<TransactionsResponseInterface>('/api/expenses', fetcher);

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
        Expenses
      </h3>

      <DataTable
        columns={columns({ categories: data?.categories ?? [] })}
        data={data?.transactions ?? []}
        filterColumns={[]}
        createComponent={<CreateForm props={{ categories: data?.categories ?? [] }} />}
        loading={isLoading}
      />
    </div>
  );
};

export default ExpensePage;
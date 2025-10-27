'use client';

import useSWR from 'swr';
import { Loader } from 'lucide-react';

import { DataTable } from '@/components/DataTable/data-table';
import { columns } from './columns';
import { CreateForm } from './table-actions';
import { useModulePermission } from '@/hooks/useModulePermission';
import AccessDenied from '@/app/errors/403/page';
import ServiceUnavailable from '@/app/errors/service-unavailable';
import { InvoiceWithMenuItemsAndTablesInterface } from '@/lib/definations';
import { swrFetcher } from '@/lib/swr';



const InvoicePage = () => {
  // === Module Permission Hook ===
  const { canView, loading: permLoading } = useModulePermission();

  // === Fetch Invoices Data ===
  const { data, error, isLoading: dataLoading } = useSWR<InvoiceWithMenuItemsAndTablesInterface>(
    '/api/invoices',
    swrFetcher
  );

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

  // === Access Denied Fallback ===
  if (!canView) {
    return <AccessDenied />;
  }

  // === Error Fallback ===
  if (error) {
    console.error('SWR Error:', error);
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
      <header className="px-4 pt-3">
        <h3 className="text-3xl font-medium text-emerald-600 text-start">
          Manage Invoices
        </h3>
      </header>

      {/* === Invoices Data Table === */}
      <DataTable
        columns={columns({ menuItems: data?.menuItems ?? [], tables: data?.tables ?? [] })}
        data={data?.invoices ?? []}
        createComponent={
          <CreateForm props={{ menuItems: data?.menuItems ?? [], tables: data?.tables ?? [] }} />
        }
        loading={isLoading}
      />

    </div>
  );
};

export default InvoicePage;
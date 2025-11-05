'use client';

import useSWR from 'swr';

import { DataTable } from '@/components/DataTable/data-table';
import { columns } from './columns';
import { CreateForm } from './table-actions';
import { useModulePermission } from '@/hooks/useModulePermission';
import AccessDenied from '@/app/errors/403/page';
import ServiceUnavailable from '@/app/errors/service-unavailable';
import { TransactionsTablesInterface, TablesSelectInput } from '@/lib/definations';
import { swrFetcher } from '@/lib/swr';
import { PageLoadingScreen, PageLoadingTableScreen } from '@/components/fallbacks/loadings';

/** === Response Interface === */
interface TransactionsResponseInterface {
  transactions: TransactionsTablesInterface[];
  categories: TablesSelectInput[];
}

const ExpensePage = () => {

  /** === Module Permission Hook === */
  const { canView, loading: permLoading } = useModulePermission();

  /** === Conditional SWR Fetching === */
  const shouldFetch = !permLoading && canView;
  const { data, error, isLoading: dataLoading } = useSWR<TransactionsResponseInterface>(
    shouldFetch ? '/api/expenses' : null,
    swrFetcher
  );

  /** === Loading & Permission Fallbacks === */
  if (permLoading) return <PageLoadingScreen />;
  if (!canView) return <AccessDenied />;

  /** === Error Fallback === */
  if (error) {
    console.error('[ExpensePage] SWR Error:', error);
    return (
      <ServiceUnavailable
        title="Service Unavailable"
        description="Please try again later or check your connection."
      />
    );
  }

  return (
    <div className="bg-card outline outline-accent rounded-lg min-h-[50vh] flex flex-col">

      {/* === Page Header === */}
      <header className="px-4 pt-3">
        <h3 className="text-3xl font-medium text-primary text-start">
          Expenses
        </h3>
      </header>

      {/* === Expenses Data Table === */}
      {dataLoading
        ? <PageLoadingTableScreen buttonCount={2} columns={6} />
        : <DataTable
          columns={columns({ categories: data?.categories ?? [] })}
          data={data?.transactions ?? []}
          filterColumns={[]}
          createComponent={<CreateForm props={{ categories: data?.categories ?? [] }} />}
        />
      }

    </div>
  );
};

export default ExpensePage;

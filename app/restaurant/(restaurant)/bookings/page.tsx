'use client'

import useSWR from 'swr';

import { DataTable } from '@/components/DataTable/data-table';
import { columns } from './columns';
import { CreateForm } from './table-actions';
import { useModulePermission } from '@/hooks/useModulePermission';
import AccessDenied from '@/app/errors/403/page';
import ServiceUnavailable from '@/app/errors/service-unavailable';
import { BookingsWithTablesInterface } from '@/lib/definations';
import { swrFetcher } from '@/lib/swr';
import { PageLoadingScreen, PageLoadingTableScreen } from '@/components/fallbacks/loadings';



const BookingsPage = () => {

  // === Module Permission Hook ===
  const { canView, loading: permLoading } = useModulePermission();

  // === SWR: Fetch bookings & tables only when allowed ===
  const shouldFetch = !permLoading && canView;
  const { data, error, isLoading: dataLoading } = useSWR<BookingsWithTablesInterface>(
    shouldFetch ? '/api/bookings-tables' : null,
    swrFetcher
  );

  /** === Fallbacks === */
  if (permLoading) return <PageLoadingScreen />;
  if (!canView) return <AccessDenied />;


  // === Error Fallback ===
  if (error) {
    console.error('[BookingsPage] SWR Error:', error);
    return (
      <ServiceUnavailable
        title="Service Unavailable"
        description="Please try again later or check your connection."
      />
    );
  }

  return (
    <div className="bg-card outline outline-accent rounded-lg min-h-[50vh] flex flex-col">

      {/* === Header === */}
      <header className="px-4 pt-3">
        <h3 className="text-3xl font-medium text-primary text-start">
          Bookings
        </h3>
      </header>

      {/* === Bookings Data Table === */}
      {dataLoading
        ? <PageLoadingTableScreen buttonCount={2} columns={7} />
        : <DataTable
          columns={columns({ tables: data?.tables ?? [] })}
          data={data?.bookings ?? []}
          filterColumns={[]}
          createComponent={<CreateForm props={{ tables: data?.tables }} />}
        />
      }

    </div>
  );
};

export default BookingsPage;
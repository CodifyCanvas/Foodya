'use client';

import useSWR from 'swr';

import { DataTable } from '@/components/DataTable/data-table';
import { columns } from './columns';
import { CreateForm } from './table-actions';
import { useModulePermission } from '@/hooks/useModulePermission';
import AccessDenied from '@/app/errors/403/page';
import ServiceUnavailable from '@/app/errors/service-unavailable';
import { EmployeeWithLatestRecord } from '@/lib/definations';
import { swrFetcher } from '@/lib/swr';
import { PageLoadingScreen, PageLoadingTableScreen } from '@/components/fallbacks/loadings';



const EmployeesPage = () => {

  /** === Module Permission Hook === */
  const { canView, loading: permLoading } = useModulePermission();

  /** === SWR: Fetch employee data only when allowed === */
  const shouldFetch = !permLoading && canView;
  const { data, error, isLoading: dataLoading } = useSWR<EmployeeWithLatestRecord[]>(
    shouldFetch ? '/api/employees/all' : null,
    swrFetcher
  );

  /** === Fallbacks === */
  if (permLoading) return <PageLoadingScreen />;
  if (!canView) return <AccessDenied />;

  if (error) {
    console.error('[EmployeesPage] SWR Error:', error);
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
          Employees Management
        </h3>
      </header>

      {/* === Employees Data Table === */}
      {dataLoading
        ? <PageLoadingTableScreen buttonCount={2} columns={7} />
        : <DataTable
          columns={columns()}
          data={data ?? []}
          filterColumns={[]}
          createComponent={<CreateForm />}
        />
      }

    </div>
  );
};

export default EmployeesPage;

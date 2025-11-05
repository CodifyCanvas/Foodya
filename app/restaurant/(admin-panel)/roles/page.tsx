'use client';

import useSWR from 'swr';

import { DataTable } from '@/components/DataTable/data-table';
import { columns } from './columns';
import { CreateForm } from './table-actions';
import { useModulePermission } from '@/hooks/useModulePermission';
import AccessDenied from '@/app/errors/403/page';
import ServiceUnavailable from '@/app/errors/service-unavailable';
import { Role } from '@/lib/definations';
import { swrFetcher } from '@/lib/swr';
import { PageLoadingScreen, PageLoadingTableScreen } from '@/components/fallbacks/loadings';



const RolesPage = () => {

  /** === Module Permission Hook === */
  const { canView, loading: permLoading } = useModulePermission();

  /** === Conditional SWR Fetching === */
  const shouldFetch = !permLoading && canView;
  const { data, error, isLoading: dataLoading } = useSWR<Role[]>(
    shouldFetch ? '/api/role' : null,
    swrFetcher
  );

  /** === Loading & Permission Fallbacks === */
  if (permLoading) return <PageLoadingScreen />;
  if (!canView) return <AccessDenied />;

  /** === Error Fallback === */
  if (error) {
    console.error('[RolesPage] SWR Error:', error);
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
        <h3 className="text-3xl font-medium text-emerald-600 text-start">
          Roles
        </h3>
      </header>

      {/* === Roles Data Table === */}
      {dataLoading
        ? <PageLoadingTableScreen buttonCount={2} />
        : <DataTable
          columns={columns()}
          data={data ?? []}
          filterColumns={['role']}
          createComponent={<CreateForm />}
        />
      }
    </div>
  );
};

export default RolesPage;
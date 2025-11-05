'use client';

import useSWR from 'swr';

import { DataTable } from '@/components/DataTable/data-table';
import { columns } from './columns';
import { CreateForm } from './table-actions';
import { useModulePermission } from '@/hooks/useModulePermission';
import AccessDenied from '@/app/errors/403/page';
import ServiceUnavailable from '@/app/errors/service-unavailable';
import { MenuCategories } from '@/lib/definations';
import { swrFetcher } from '@/lib/swr';
import { PageLoadingScreen, PageLoadingTableScreen } from '@/components/fallbacks/loadings';

const MenuCategoriesPage = () => {

  /** === Module Permission Hook === */
  const { canView, loading: permLoading } = useModulePermission();

  /** === Conditional SWR Fetching === */
  const shouldFetch = !permLoading && canView;
  const { data, error, isLoading: dataLoading } = useSWR<MenuCategories[]>(
    shouldFetch ? '/api/menu-categories' : null,
    swrFetcher
  );

  /** === Fallbacks === */
  if (permLoading) return <PageLoadingScreen />;
  if (!canView) return <AccessDenied />;

  if (error) {
    console.error('[MenuCategoriesPage] SWR Error:', error);
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
          Menu Categories
        </h3>
      </header>

      {/* === Menu Categories Data Table === */}
      {dataLoading
        ? <PageLoadingTableScreen buttonCount={2} columns={4} />
        : <DataTable
          columns={columns()}
          data={data ?? []}
          filterColumns={['name']}
          createComponent={<CreateForm />}
        />
      }
    </div>
  );
};

export default MenuCategoriesPage;

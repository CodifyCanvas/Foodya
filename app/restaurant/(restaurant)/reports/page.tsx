'use client';

import useSWR from 'swr';
import { Loader } from 'lucide-react';

import { useModulePermission } from '@/hooks/useModulePermission';
import AccessDenied from '@/app/errors/access-control-view/access-denied';
import { RestaurantTablesInterface } from '@/lib/definations';
import ServiceUnavailable from '@/app/errors/service-unavailable';
import { HeaderSectionCards } from './(components)/header-section-cards';
import { ChartBarStacked } from './(components)/transaction-chart';

/* === Data Fetcher === */
const fetcher = (url: string) => fetch(url).then(res => res.json());

const ReportsPage = () => {
  
  // Use the custom permission hook
  const { canView, loading: permLoading } = useModulePermission();

  // Fetch Restaurant Table data
  const { data, error, isLoading: dataLoading } = useSWR<RestaurantTablesInterface[]>('/api/reports?fetch=header', fetcher);

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
    <div className="w-full h-full p-3 lg:px-6 bg-white rounded-lg min-h-[50vh] flex gap-3 flex-col">

      {/* Page Header */}
      <h3 className="text-3xl font-medium pt-3 text-emerald-600 text-start">
        Reports
      </h3>

      {/* Header Cards - summary metrics */}
      <HeaderSectionCards />

      {/* Income & Expense Chart */}
      <ChartBarStacked />

    </div>
  );
};

export default ReportsPage;

'use client';

import { Loader } from 'lucide-react';

import { useModulePermission } from '@/hooks/useModulePermission';
import AccessDenied from '@/app/errors/403/page';
import { HeaderSectionCards } from './(components)/header-section-cards';
import { ChartBarStacked } from './(components)/transaction-chart';
import { TransactionTable } from './(components)/transactions-table';



const ReportsPage = () => {

  // === Custom Permission Hook ===
  const { canView, loading: permLoading } = useModulePermission();

  if (permLoading) {
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
    <div className="w-full h-full p-3 lg:px-6 bg-white rounded-lg min-h-[50vh] flex gap-3 flex-col">

      {/* Page Header */}
      <h3 className="text-3xl font-medium pt-3 text-emerald-600 text-start">
        Reports
      </h3>

      {/* Header Cards - summary metrics */}
      <HeaderSectionCards />

      {/* Income & Expense Chart */}
      <ChartBarStacked />

      {/* Income & Expense Transactions Table */}
      <TransactionTable />

    </div>
  );
};

export default ReportsPage;
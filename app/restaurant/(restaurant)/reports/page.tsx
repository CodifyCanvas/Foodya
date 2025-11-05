'use client';

import { useModulePermission } from '@/hooks/useModulePermission';
import AccessDenied from '@/app/errors/403/page';
import { HeaderSectionCards } from './(components)/header-section-cards';
import { ChartBarStacked } from './(components)/transaction-chart';
import { TransactionTable } from './(components)/transactions-table';
import { PageLoadingScreen } from '@/components/fallbacks/loadings';

const ReportsPage = () => {
  /** === Module Permission Hook === */
  const { canView, loading: permLoading } = useModulePermission();

  /** === Loading State === */
  if (permLoading) return <PageLoadingScreen />;
  if (!canView) return <AccessDenied />;

  /** === Render Reports Page === */
  return (
    <div className="w-full h-full p-3 lg:px-6 bg-card outline outline-accent rounded-lg min-h-[50vh] flex flex-col gap-3">

      {/* === Page Header === */}
      <h3 className="text-3xl font-medium pt-3 text-primary text-start">
        Reports
      </h3>

      {/* === Header Cards: Summary Metrics === */}
      <HeaderSectionCards />

      {/* === Income & Expense Chart === */}
      <ChartBarStacked />

      {/* === Income & Expense Transactions Table === */}
      <TransactionTable />

    </div>
  );
};

export default ReportsPage;

'use client';

import { useEffect } from 'react';
import useSWR from 'swr';

import { useModulePermission } from '@/hooks/useModulePermission';
import AccessDenied from '@/app/errors/403/page';
import { MenuCategories, RestaurantTablesInterface } from '@/lib/definations';
import { useSidebar } from '@/components/ui/sidebar';
import MenuCardsContainer from './order-menu-cards-container';
import OrderItemsContainer from './order-items-container';
import OrderCategoryTags from './order-category-tags';
import { OrderCartProvider } from '@/hooks/context/OrderCartContext';
import { swrFetcher } from '@/lib/swr';
import { PageLoadingScreen } from '@/components/fallbacks/loadings';



const OrdersPage = () => {

  // === Module Permission Hook ===
  const { canView, loading: permLoading } = useModulePermission();

  // === Fetch Restaurant Tables and Menu Categories ===
  const { data: tables, error: tablesError, isLoading: tablesLoading } =
    useSWR<RestaurantTablesInterface[]>('/api/restaurant-tables', swrFetcher);

  const { data: categories, error: categoriesError, isLoading: categoriesLoading } =
    useSWR<MenuCategories[]>('/api/menu-categories', swrFetcher);

  // === Sidebar Control ===
  const { setOpen } = useSidebar();
  useEffect(() => setOpen(false), []);

  // === Combined Loading & Error States ===
  const isLoading = permLoading || tablesLoading || categoriesLoading;
  const hasError = tablesError || categoriesError;

  // === Fallbacks ===
  if (isLoading) return <PageLoadingScreen />;
  if (!canView) return <AccessDenied />;

  /** === Error Fallback === */
  if (hasError) {
    console.error('[OrdersPage] SWR Error:', tablesError || categoriesError);
    return (
      <div className="flex-1 h-full w-full flex justify-center items-center text-red-600">
        Failed to load order page data. Please try again later.
      </div>
    );
  }

  return (
    <OrderCartProvider>
      <div className="bg-transparent rounded-lg min-h-[50vh] flex w-full flex-1 flex-col gap-2">

        {/* === Category Tags === */}
        <div className="bg-card w-full h-16 rounded-lg flex items-center justify-center md:justify-end gap-2 px-2">
          <OrderCategoryTags categories={categories ?? []} />
        </div>

        {/* === Menu Cards & Order Items === */}
        <div className="w-full min-h-full flex flex-1 flex-col-reverse lg:flex-row gap-2">
          <div className="w-full min-h-96 rounded-lg p-1">
            <MenuCardsContainer />
          </div>
          <div className="w-full lg:max-w-96 2xl:max-w-xl min-h-96 h-fit rounded-lg bg-card p-1">
            <OrderItemsContainer restaurantTables={tables ?? []} />
          </div>
        </div>

      </div>
    </OrderCartProvider>
  );
};

export default OrdersPage;
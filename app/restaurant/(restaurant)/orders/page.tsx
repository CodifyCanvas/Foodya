'use client';

import { useEffect } from 'react';
import useSWR from 'swr';
import { Loader } from 'lucide-react';

import { useModulePermission } from '@/hooks/useModulePermission';
import AccessDenied from '@/app/errors/403/page';
import { MenuCategories, RestaurantTablesInterface } from '@/lib/definations';
import { useSidebar } from '@/components/ui/sidebar';
import MenuCardsContainer from './order-menu-cards-container';
import OrderItemsContainer from './order-items-container';
import OrderCategoryTags from './order-category-tags';
import { OrderCartProvider } from '@/hooks/context/OrderCartContext';
import { swrFetcher } from '@/lib/swr';



const OrdersPage = () => {
  // === Module Permission Hook ===
  const { canView, loading: permLoading } = useModulePermission();

  // === Fetch Restaurant Tables and Menu Categories ===
  const { data: tables, error: tablesError, isLoading: tablesLoading } =
    useSWR<RestaurantTablesInterface[]>('/api/restaurant-tables', swrFetcher);
  const { data: categories, error: categoriesError, isLoading: categoriesLoading } =
    useSWR<MenuCategories[]>('/api/menu-categories', swrFetcher);

  const { setOpen } = useSidebar();

  // Close sidebar on mount
  useEffect(() => {
    setOpen(false);
  }, []);

  // Combined loading state
  const isLoading = permLoading || tablesLoading || categoriesLoading;

  // === Loading State ===
  if (isLoading) {
    return (
      <div className="flex-1 h-full w-full bg-white flex justify-center items-center">
        <Loader className="animate-spin size-7 text-gray-500" />
      </div>
    );
  }

  // === Access Denied ===
  if (!canView) {
    return <AccessDenied />;
  }

  // === Optional: handle fetch errors (if needed) ===
  if (tablesError || categoriesError) {
    console.error('SWR Error:', tablesError || categoriesError);
    return (
      <div className="flex-1 h-full w-full flex justify-center items-center text-red-600">
        Failed to load order data. Please try again later.
      </div>
    );
  }

  return (
    <OrderCartProvider>
      <div className="bg-transparent rounded-lg min-h-[50vh] flex w-full flex-1 flex-col gap-2">

        {/* === Category Tags === */}
        <div className="flex flex-col md:flex-row gap-2">
          <div className="bg-white w-full h-16 rounded-lg flex items-center justify-center md:justify-end gap-2 px-2">
            <OrderCategoryTags categories={categories ?? []} />
          </div>
        </div>

        {/* === Menu Cards & Order Items === */}
        <div className="w-full min-h-full flex flex-1 flex-col-reverse lg:flex-row gap-2">
          <div className="w-full lg:w-2/3 min-h-96 rounded-lg p-1">
            <MenuCardsContainer />
          </div>
          <div className="w-full lg:w-1/3 min-w-80 min-h-96 h-fit rounded-lg bg-white p-1">
            <OrderItemsContainer restaurantTables={tables ?? []} />
          </div>
        </div>

      </div>
    </OrderCartProvider>
  );
};

export default OrdersPage;
'use client';

import useSWR from 'swr';
import { Loader } from 'lucide-react';
import { useModulePermission } from '@/hooks/useModulePermission';
import AccessDenied from '@/app/errors/403/page';
import { MenuCategories, RestaurantTablesInterface } from '@/lib/definations';
import { useEffect } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import MenuCardsContainer from './order-menu-cards-container';
import OrderItemsContainer from './order-items-container';
import OrderCategoryTags from './order-category-tags';
import { OrderCartProvider } from '@/hooks/context/OrderCartContext';

/* === Data Fetcher === */
const fetcher = (url: string) => fetch(url).then(res => res.json());

const OrdersPage = () => {
  // Use the custom permission hook
  const { canView, loading: permLoading } = useModulePermission();

  // Fetch Restaurant Table data
  const { data: tables, error, isLoading: dataLoading } = useSWR<RestaurantTablesInterface[]>('/api/restaurant-tables', fetcher);
  const { data: categories, error: categoriesError, isLoading: categoriesLoading } = useSWR<MenuCategories[]>('/api/menu-categories', fetcher);

  const { setOpen } = useSidebar()

  useEffect(() => {
    setOpen(false)
  }, [])

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

  return (
    <OrderCartProvider>
      <div className="bg-transparent rounded-lg min-h-[50vh] flex w-full flex-1 flex-col gap-2">
        <div className='flex flex-col md:flex-row gap-2'>

          <div className='bg-white w-full h-16 rounded-lg flex items-center justify-center md:justify-end gap-2 px-2'>
            <OrderCategoryTags categories={categories ?? []} />
          </div>
        </div>

        <div className='w-full min-h-full flex flex-1 flex-col-reverse lg:flex-row gap-2'>
          <div className='w-full lg:w-2/3 min-h-96 rounded-lg p-1'><MenuCardsContainer /></div>
          <div className='w-full lg:w-1/3 min-w-80 min-h-96 h-fit rounded-lg bg-white p-1'><OrderItemsContainer restaurantTables={tables ?? []} /></div>
        </div>

      </div>
    </OrderCartProvider>
  );
};

export default OrdersPage;
'use client';

import useSWR from 'swr';
import { Plus, Loader } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardDescription, CardTitle, CardFooter } from '@/components/ui/card';
import ModernRadioButton from '@/components/custom/modern-radio-button';
import { useSearchParams } from 'next/navigation';
import { ItemWithOptions } from '@/lib/definations';
import { useOrderCartContext } from '@/hooks/context/OrderCartContext';
import { useState } from 'react';
import { useSidebar } from '@/components/ui/sidebar';

/* === Fetcher === */
const fetcher = (url: string) => fetch(url).then(res => res.json());

const MenuCardsContainer = () => {
  const searchParams = useSearchParams();
  const { addItem } = useOrderCartContext();
  const { open: sidebarIsOpen } = useSidebar()

  const currentCategory = searchParams.get('category');

  const baseUrl = '/api/menu-items?fetch_categories=false&only_available=true';
  const fetchUrl = currentCategory
    ? `${baseUrl}&category=${encodeURIComponent(currentCategory)}`
    : baseUrl;

  const { data, error, isLoading } = useSWR<ItemWithOptions[]>(fetchUrl, fetcher);

  // Track selected options per item
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number | null>>({});

  const handleOptionChange = (menuItemId: number, optionId: number | null) => {
    setSelectedOptions(prev => ({ ...prev, [menuItemId]: optionId }));
  };

  const handleAddToCart = (item: ItemWithOptions) => {
    const selectedOptionId = selectedOptions[item.id!] ?? null;
    const selectedOption = item.options.find(opt => opt.option_id === selectedOptionId);

    const cartItem = {
      menuItemImage: item.image || null,
      menuItemId: item.id || 0,
      menuItemName: item.item,
      menuItemOptionId: selectedOption ? selectedOption.option_id : null,
      menuItemOptionName: selectedOption?.option_name ?? '',
      price: selectedOption ? parseFloat(selectedOption.price) : item.price,
    };

    addItem(cartItem);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[35vh] w-full">
        <Loader className="animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-destructive py-4 font-medium">
        Failed to load menu items.
      </div>
    );
  }

  return (
    <div className={`grid gap-3 grid-cols-2 sm:grid-cols-3  ${sidebarIsOpen ? 'md:grid-cols-3 lg:grid-cols-2' : 'lg:grid-cols-3'} xl:grid-cols-4 [grid-auto-rows:minmax(0,auto)]`}>
      {data?.map((item) => (
        <Card key={item.id} className="bg-white justify-between p-2 gap-3">
          <CardContent className="p-0">
            <div className="relative aspect-square w-full">
              <Image
                src={item.image || "/images/placeholder-image.jpg"}
                alt={"Image not found"}
                className="rounded-t-xl object-cover"
                fill
              />
            </div>
          </CardContent>
          <CardHeader className="p-0 mt-2">
            <CardTitle className="text-base font-rubik-500">{item.item}</CardTitle>
            <CardDescription className="text-sm">
              Price <span className="text-orange-600 text-base">{item.price}</span>
            </CardDescription>
          </CardHeader>
          <CardFooter className="gap-3 p-0 max-sm:flex-col max-sm:items-stretch justify-between items-end">
            <div className="flex flex-col text-xs text-gray-600 w-full">
              {item.options.length > 0 ? (
                <ModernRadioButton
                  options={item.options.map((opt) => ({
                    value: String(opt.option_id),
                    label: opt.option_name,
                    price: parseFloat(opt.price),
                  }))}
                  onValueChange={(v) => {
                    if (!v) {
                      handleOptionChange(item.id || 0, null);
                    } else {
                      handleOptionChange(item.id || 0, parseInt(v));
                    }
                  }}
                />
              ) : (
                <span className="text-gray-400 text-sm sr-only">No options</span>
              )}
            </div>
            <Button onClick={() => handleAddToCart(item)} className="bg-orange-500 hover:bg-orange-600">
              <Plus /> <span className="sm:hidden block">Add</span>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default MenuCardsContainer;

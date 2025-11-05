'use client';

import useSWR from 'swr';
import { Plus, Loader } from 'lucide-react';
import Image from 'next/image';
import React, { useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardDescription, CardTitle, CardFooter } from '@/components/ui/card';
import ModernRadioButton from '@/components/custom/modern-radio-button';
import { useSearchParams } from 'next/navigation';
import { ItemWithOptions } from '@/lib/definations';
import { useOrderCartContext } from '@/hooks/context/OrderCartContext';
import { useState } from 'react';
import { swrFetcher } from '@/lib/swr';

const MenuCardsContainer = () => {

  /* === Get query params for filtering === */
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');

  /* === Context to manage cart actions === */
  const { addItem } = useOrderCartContext();

  /* === Build the API URL dynamically based on category === */
  const baseUrl = '/api/menu-items?fetch_categories=false&only_available=true';
  const fetchUrl = currentCategory
    ? `${baseUrl}&category=${encodeURIComponent(currentCategory)}`
    : baseUrl;

  /* === Fetch data using SWR === */
  const { data = [], error, isLoading } = useSWR<ItemWithOptions[]>(fetchUrl, swrFetcher);

  /* === Track selected options for each menu item === */
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number | null>>({});

  /* === Memoized handler to update selected option === */
  const handleOptionChange = useCallback((menuItemId: number, optionId: number | null) => {
    setSelectedOptions(prev => ({ ...prev, [menuItemId]: optionId }));
  }, []);

  /* === Add item to cart with selected option and price === */
  const handleAddToCart = useCallback((item: ItemWithOptions) => {
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
  }, [selectedOptions, addItem]);

  /* === Show loading state === */
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[35vh] w-full">
        <Loader className="animate-spin text-emerald-500" />
      </div>
    );
  }

  /* === Show error state === */
  if (error) {
    return (
      <div className="text-center text-destructive py-4 font-medium">
        Failed to load Menu Items.
      </div>
    );
  }

  /* === Main render of menu cards === */
  return (
    <>
      {data.length > 0 ?
        <div className="grid gap-3 auto-rows-fr 
                [grid-template-columns:repeat(auto-fit,minmax(6rem,10rem))] 
                sm:[grid-template-columns:repeat(auto-fit,minmax(10rem,15rem))] 
                justify-center transition-all duration-300">
          {data?.map((item) => (
            <Card key={item.id} className="bg-card rounded-lg justify-between p-2 gap-3">

              {/* === Card Image === */}
              <CardContent className="p-0">
                <div className="relative aspect-square w-full">
                  <Image
                    src={item.image || "/images/placeholder-image.jpg"}
                    alt={"Image not found"}
                    className="rounded-t-md object-cover"
                    fill
                    loading='lazy'
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
              </CardContent>

              {/* === Card Header with Title & Price === */}
              <CardHeader className="p-0 mt-2">
                <CardTitle className="text-sm  sm:text-base font-rubik-500">{item.item}</CardTitle>
                <CardDescription className="text-muted-foreground text-xs sm:text-sm">
                  Price <span className="text-orange-500 text-sm">{item.price}</span>
                </CardDescription>
              </CardHeader>

              {/* === Card Footer with Options and Add to Cart Button === */}
              <CardFooter className="gap-3 p-0 max-sm:flex-col max-sm:items-stretch justify-between items-end">
                <div className="flex flex-col text-xs xl:text-sm text-foreground w-full">
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
                    <span className="text-muted-foreground text-sm sr-only">No options</span>
                  )}
                </div>
                <Button onClick={() => handleAddToCart(item)} className="bg-orange-500 hover:bg-orange-600">
                  <Plus /> <span className="sm:hidden block">Add</span>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div> : <p className='w-full text-center'>No Item Found</p>
      }
    </>
  );
};

export default MenuCardsContainer;
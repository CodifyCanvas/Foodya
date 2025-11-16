'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ComboboxInput } from '@/components/ui/combobox-input';
import InputWithPlusMinusButtons from '@/components/custom/input-with-plus-minus-buttons';
import GenerateInvoiceDialog from './generate-invoice-dialog';

import { useOrderCartContext } from '@/hooks/context/OrderCartContext';
import { CartItem } from '@/hooks/use-order-cart';
import { RestaurantTablesInterface } from '@/lib/definations';
import { OrderResponse } from '@/lib/definations';
import { refreshData } from '@/lib/swr';

interface OrderItemsContainerProps {
  restaurantTables: RestaurantTablesInterface[];
}

const OrderItemsContainer: React.FC<OrderItemsContainerProps> = ({ restaurantTables }) => {
  /* === States === */
  const [table, setTable] = useState<string>('');
  const [orderedMenu, setOrderedMenu] = useState<OrderResponse>();
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [invoiceDialogIsOpen, setInvoiceDialogIsOpen] = useState<boolean>(false);

  /* === Cart Context === */
  const { cart, updateQuantity, removeItem, clearCart, addItem } = useOrderCartContext();

  /* === Fetch Order By Table === */
  const handleTableChange = useCallback(async () => {
    if (!table) return;

    try {
      const request = await fetch(`/api/orders?table=${table}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const response: OrderResponse = await request.json();
      if (!request.ok) throw new Error(response?.order?.id?.toString() || 'Failed to fetch order data');

      setOrderedMenu(response || undefined);
      clearCart();

      if (response?.order && response.items?.length > 0) {
        response.items.forEach((item) => {
          const cartItem: CartItem = {
            menuItemImage: item.menuItemImage || null,
            menuItemId: Number(item.menuItemId),
            menuItemName: item.menuItemName,
            menuItemOptionId: Number(item.menuItemOptionId),
            menuItemOptionName: item.menuItemOptionName || '',
            price: parseFloat(item.price),
            quantity: item.quantity,
          };

          addItem(cartItem);
        });
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to fetch order details.');
    }
  }, [table, addItem, clearCart]);

  /* === Place Order Handler === */
  const handlePlaceOrder = async () => {
    if (!table || cart.length === 0) {
      toast.error('Please select a table and add at least one item to the order.');
      return;
    }

    const API_URL = "/api/orders";
    const isEditing = !!(orderedMenu?.order && orderedMenu.order.id);
    const payload = isEditing
      ? {
        orderDetail: orderedMenu.order,
        items: cart,
      }
      : {
        tableId: table,
        orderType: 'dine_In',
        items: cart,
      };

    const requestOptions = {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }

    try {
      const response = await fetch(API_URL, requestOptions)


      const result = await response.json();

      if (!response.ok) {
        toast.error(result?.error ?? (isEditing
          ? "Order can't be updated. Please try again."
          : "Order can't be created. Please try again."))
        return
      }

      toast.success(result?.message ?? (isEditing
        ? "Order updated successfully."
        : "New Order created successfully."))

      if (!isEditing) {
        refreshData('/api/restaurant-tables')
        handleTableChange()
      }

    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Unexpected error occurred.');
    }
  };

  // === Subtotal & Total Calculation ===
  const advancePaid = parseFloat(orderedMenu?.booking?.advancePaid ?? '0') || 0;
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Calculate discount amount
  const discountAmount = (discountValue / 100) * subtotal;

  // Final total after advance and discount
  const total = subtotal - discountAmount;

  const grandTotal = total - advancePaid;

  /* === Trigger on table change === */
  useEffect(() => {
    handleTableChange();
  }, [table]);

  return (
    <div className="px-2 w-full">
      {/* === Order Header === */}
      <p className="flex justify-between items-center py-2">
        <span className="text-lg font-medium">Order</span>
        <span className="text-muted-foreground text-base">
          {orderedMenu?.order?.id
            ? `#${String(orderedMenu.order.id).padStart(4, '0')}`
            : 'Fresh'}
        </span>
      </p>

      {/* === Table Selector === */}
      <ComboboxInput
        value={table}
        onSelect={(value) => setTable(value)}
        options={restaurantTables.map((table) => ({
          value: table.id?.toString() || '',
          label: table.table_number,
          badge: table.status,
        }))}
        placeholder="Select a table"
        className="font-rubik-400 cursor-pointer"
      />

      {/* === Order Items Title === */}
      <div className="flex justify-between items-center py-2">
        <p className="text-base">Order Items</p>
        {cart.length > 0 && (<div className='flex flex-row-reverse items-center gap-2'>
          <Button variant={'ghost'} onClick={clearCart} title="Empty Cart" className='p-2 text-red-400 hover:text-red-500 cursor-pointer' size={'sm'}><Trash2 /></Button>
          <p className="text-muted-foreground text-sm">{cart.length}</p>
        </div>
        )}
      </div>

      {/* === Order Items List === */}
      <div className="grid gap-3 border-y-2 border-dashed py-2">
        {cart.length > 0 ? (
          cart.map((item) => (
            <Card
              key={`${item.menuItemId}-${item.menuItemOptionId ?? 'noopt'}`}
              className="bg-card dark:bg-secondary flex justify-between flex-row items-center px-2 py-2 gap-3"
            >
              <CardContent className="p-0 min-w-16">
                <div className="relative w-16 h-16 aspect-square">
                  <Image
                    src={item.menuItemImage || '/images/placeholder-image.jpg'}
                    alt="Menu Item"
                    className="rounded-lg object-cover"
                    fill
                    sizes="64px"
                  />
                </div>
              </CardContent>

              <div className="flex flex-row lg:flex-col xl:flex-row w-full">
                <CardHeader className="p-0 mt-2 w-full">
                  <CardTitle className="text-sm sm:text-base font-rubik-500 capitalize">
                    {item.menuItemName}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {item.menuItemOptionName && (
                      <p className="text-xs capitalize">{item.menuItemOptionName}</p>
                    )}
                    <div className="flex items-end gap-2">
                      <p className="text-xs">
                        Price:{' '}
                        <span className="text-orange-600 dark:text-orange-400">{item.price}</span>
                      </p>
                      <p className="text-xs">
                        Total:{' '}
                        <span className="text-orange-600 dark:text-orange-400 sm:text-sm">
                          {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </p>
                    </div>
                  </CardDescription>
                </CardHeader>

                <CardFooter className="gap-1 p-0 flex flex-col justify-between items-end lg:flex-row lg:mt-2 xl:flex-col">
                  <InputWithPlusMinusButtons
                    className="w-32"
                    quantity={item.quantity}
                    onChange={(newQty) =>
                      updateQuantity(item.menuItemId!, item.menuItemOptionId, newQty)
                    }
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() =>
                      removeItem(item.menuItemId!, item.menuItemOptionId || null)
                    }
                  >
                    <Trash2 />
                  </Button>
                </CardFooter>
              </div>
            </Card>
          ))
        ) : (
          <div className="w-full min-h-24 flex justify-center items-center text-neutral-500">
            <p>No items</p>
          </div>
        )}
      </div>

      {/* === Summary & Actions === */}
      <div className="my-2 flex flex-col items-end w-full">
        <div className="flex flex-col items-start gap-2 text-base w-full px-5 my-4">
          <p className="flex justify-between w-full">
            <span>Subtotal</span>
            <span>{subtotal.toFixed(2)} PKR</span>
          </p>

          <div className="flex justify-between items-center w-full">
            <span>Discount %</span>
            <Input
              type="number"
              className="w-16"
              min={0}
              value={discountValue}
              onChange={(e) => setDiscountValue(Math.max(0, Number(e.target.value)))}
            />
          </div>

          <p className="flex justify-between w-full">
            <span>total</span>
            <span>{total.toFixed(2)} PKR</span>
          </p>

          {advancePaid > 0 && (<p className="flex justify-between w-full">
            <span>Arrear</span>
            <span>{advancePaid} PKR</span>
          </p>)}

          <p className="flex justify-between w-full font-medium mt-2">
            <span>Grand Total</span>
            <span className="text-orange-600 dark:text-orange-400">
              {Math.round(Number(grandTotal.toFixed(2)))} PKR
            </span>
          </p>

          {advancePaid > subtotal && (
            <p className="text-orange-500 dark:text-orange-400 text-sm">
              You&apos;ve overpaid by {(advancePaid - subtotal).toFixed(2)} PKR.
            </p>
          )}
        </div>

        {/* === Action Buttons === */}
        <div className="flex gap-2 w-full px-2 justify-center">

          {/* === Generate Invoice Buttons === */}
          <Button
            className="min-w-1/3"
            disabled={!cart.length}
            variant="secondary"
            onClick={() => setInvoiceDialogIsOpen(true)}
          >
            Generate Invoice
          </Button>

          {/* === Generate Invoice Dialog === */}
          <GenerateInvoiceDialog
            isOpen={invoiceDialogIsOpen}
            setIsOpen={setInvoiceDialogIsOpen}
            mode="create"
            data={{ cart: cart, footer: { subtotal, discount: discountValue, total, advancePaid, grandTotal }, order: orderedMenu?.order, booking: orderedMenu?.booking, }}
          />

          {/* === Place OR Update a order Button === */}
          <Button
            className="min-w-1/3"
            disabled={!table || cart.length === 0}
            variant="green"
            onClick={handlePlaceOrder}
          >
            {orderedMenu?.order?.id ? 'Update Order' : 'Place Order'}
          </Button>

          {/* === Reset the complete Container Button === */}
          <Button
            variant="destructive"
            size="icon"
            onClick={() => {
              clearCart();
              setTable('');
              setOrderedMenu(undefined);
            }}
          >
            <Trash2 />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderItemsContainer;
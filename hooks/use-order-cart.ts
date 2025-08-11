// hooks/useOrderCart.ts
import { useState } from 'react';

export type CartItem = {
  menuItemImage?: string | null;
  menuItemId: number | null;
  menuItemName: string;
  menuItemOptionId: number | null;
  menuItemOptionName: string;
  price: number;
  quantity: number;
};

export const useOrderCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addItem = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
  setCart(prev => {
    const existing = prev.find(
      i =>
        i.menuItemId === item.menuItemId &&
        i.menuItemOptionId === item.menuItemOptionId
    );

    const quantityToAdd = item.quantity ?? 1;

    if (existing) {
      return prev.map(i =>
        i.menuItemId === item.menuItemId &&
        i.menuItemOptionId === item.menuItemOptionId
          ? { ...i, quantity: i.quantity + quantityToAdd }
          : i
      );
    }

    return [...prev, { ...item, quantity: quantityToAdd }];
  });
};


  const updateQuantity = (
  menuItemId: number,
  menuItemOptionId: number | null,
  qty: number
) => {
  setCart(prev =>
    prev.map(item =>
      item.menuItemId === menuItemId &&
      item.menuItemOptionId === menuItemOptionId
        ? { ...item, quantity: qty }
        : item
    )
  );
};

  const removeItem = (menuItemId: number, menuItemOptionId: number | null) => {
  setCart(prev =>
    prev.filter(item =>
      !(item.menuItemId === menuItemId && item.menuItemOptionId === menuItemOptionId)
    )
  );
};

  const clearCart = () => setCart([]);

  return {
    cart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };
};

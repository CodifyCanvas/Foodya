// hooks/useOrderCart.ts
import { useState } from 'react';



/**
 * === Represents a single item in the order cart. ===
 */
export type CartItem = {
  menuItemImage?: string | null;
  menuItemId: number | null;
  menuItemName: string;
  menuItemOptionId: number | null;
  menuItemOptionName: string | null;
  price: number;
  quantity: number;
};



/**
 * === React hook for managing a shopping/order cart. ===
 *
 * - Allows adding, updating, removing items and clearing the cart.
 * - Prevents duplicate items with the same ID/option by merging quantities.
 * 
 * @returns - Cart state and manipulation functions.
 */
export const useOrderCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);



  /**
  * === Adds an item to the cart. ===
  * 
  * - If the item already exists (based on ID + option ID), it increases the quantity.
  * - Otherwise, it adds the item as a new entry.
  *
  * @param {Omit<CartItem, 'quantity'> & { quantity?: number }} item - The item to add to the cart.
  */
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



  /**
   * === Updates the quantity of a specific item in the cart. ===
   *
   * @param {number} menuItemId - The unique ID of the menu item.
   * @param {number | null} menuItemOptionId - The specific option ID for the item.
   * @param {number} qty - The new quantity to set.
   */
  const updateQuantity = (menuItemId: number, menuItemOptionId: number | null, qty: number) => {
    setCart(prev =>
      prev.map(item =>
        item.menuItemId === menuItemId &&
          item.menuItemOptionId === menuItemOptionId
          ? { ...item, quantity: qty }
          : item
      )
    );
  };



  /**
   * === Removes a specific item from the cart. ===
   *
   * @param {number} menuItemId - The ID of the item to remove.
   * @param {number | null} menuItemOptionId - The option ID of the item to remove.
   */
  const removeItem = (menuItemId: number, menuItemOptionId: number | null) => {
    setCart(prev =>
      prev.filter(item =>
        !(item.menuItemId === menuItemId && item.menuItemOptionId === menuItemOptionId)
      )
    );
  };



  /**
   * === Clears all items from the cart. ===
   */
  const clearCart = () => setCart([]);

  return {
    cart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };
};
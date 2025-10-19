// @/hooks/context/OrderCartContext.tsx

import React, { createContext, PropsWithChildren, useContext } from 'react';
import { useOrderCart } from '../use-order-cart';



/**
 * === OrderCartContext ===
 *
 * React context for managing the order cart state across the application.
 * It shares the state and actions returned by the useOrderCart hook.
 */
const OrderCartContext = createContext<ReturnType<typeof useOrderCart> | null>(null);



/**
 * === OrderCartProvider ===
 * 
 * Context provider that wraps the app (or part of it) with order cart state and functionality.
 * 
 * @param {React.ReactNode} children - The nested components that need access to cart state.
 * 
 * @returns React context provider for the order cart.
 */
export const OrderCartProvider = ({ children }: PropsWithChildren) => {
  const value = useOrderCart();

  return (
    <OrderCartContext.Provider value={value}>
      {children}
    </OrderCartContext.Provider>
  );
};



/**
 * === useOrderCartContext ===
 * 
 * Custom hook to access the OrderCart context from within components.
 * Must be used within a component wrapped by <OrderCartProvider>.
 * 
 * @returns {ReturnType<typeof useOrderCart>} - The current cart context.
 *
 * @throws {Error} - If used outside of OrderCartProvider.
 */
export const useOrderCartContext = (): ReturnType<typeof useOrderCart> => {
  const context = useContext(OrderCartContext);

  if (!context) {
    throw new Error("Oops! Looks like you're using useOrderCartContext outside of the OrderCartProvider. Please wrap your component with <OrderCartProvider>.");
  }

  return context;
};
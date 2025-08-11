// context/OrderCartContext.tsx
import React, { createContext, useContext } from 'react';
import { useOrderCart } from '../use-order-cart';

const OrderCartContext = createContext<ReturnType<typeof useOrderCart> | null>(null);

export const OrderCartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useOrderCart();
  return (
    <OrderCartContext.Provider value={value}>
      {children}
    </OrderCartContext.Provider>
  );
};

export const useOrderCartContext = () => {
  const context = useContext(OrderCartContext);
  if (!context) {
    throw new Error('useOrderCartContext must be used within OrderCartProvider');
  }
  return context;
};

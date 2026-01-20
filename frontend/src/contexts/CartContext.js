import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  const addItem = (item) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeItem = (itemId) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const updateQty = (itemId, qty) => {
    if (qty <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, qty } : i))
    );
  };

  const incrementQty = (itemId) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, qty: i.qty + 1 } : i))
    );
  };

  const decrementQty = (itemId) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === itemId);
      if (item && item.qty <= 1) {
        return prev.filter((i) => i.id !== itemId);
      }
      return prev.map((i) =>
        i.id === itemId ? { ...i, qty: i.qty - 1 } : i
      );
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQty,
        incrementQty,
        decrementQty,
        clearCart,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

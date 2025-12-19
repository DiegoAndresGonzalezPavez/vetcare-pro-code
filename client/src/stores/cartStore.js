import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      total: 0,

      addItem: (product) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.id === product.id);
          let newItems;

          if (existingItem) {
            newItems = state.items.map((item) =>
              item.id === product.id
                ? { ...item, cantidad: item.cantidad + 1 }
                : item
            );
          } else {
            newItems = [...state.items, { ...product, cantidad: 1 }];
          }

          const newTotal = newItems.reduce(
            (sum, item) => sum + item.precio * item.cantidad,
            0
          );

          return { items: newItems, total: newTotal };
        });
      },

      removeItem: (productId) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== productId);
          const newTotal = newItems.reduce(
            (sum, item) => sum + item.precio * item.cantidad,
            0
          );
          return { items: newItems, total: newTotal };
        });
      },

      updateQuantity: (productId, cantidad) => {
        set((state) => {
          const newItems = state.items.map((item) =>
            item.id === productId ? { ...item, cantidad: Math.max(1, cantidad) } : item
          );
          const newTotal = newItems.reduce(
            (sum, item) => sum + item.precio * item.cantidad,
            0
          );
          return { items: newItems, total: newTotal };
        });
      },

      clearCart: () => {
        set({ items: [], total: 0 });
      },

      getCartCount: () => {
        return get().items.reduce((sum, item) => sum + item.cantidad, 0);
      },
    }),
    {
      name: 'cart-store',
    }
  )
);

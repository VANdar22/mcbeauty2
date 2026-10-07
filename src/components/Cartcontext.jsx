import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "cart:v1";

function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/*
  Item shape: { id, name, price, currency, category, image, qty }
  TODO: if you keep carts in your database, sync inside addItem / removeItem / updateQty.

  addedIds = ids added while the drawer is open (or that opened it), in order.
  The drawer shows ALL of them, so adding a second product no longer replaces the first.
*/
export function CartProvider({ children }) {
  const [items, setItems] = useState(loadItems);
  const [addedIds, setAddedIds] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerOpenRef = useRef(false);

  const setOpen = useCallback((open) => {
    drawerOpenRef.current = open;
    setDrawerOpen(open);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable — cart still works for this session */
    }
  }, [items]);

  const addItem = useCallback(
    (product) => {
      setItems((prev) => {
        const found = prev.find((i) => i.id === product.id);
        if (found) return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
        const { id, name, price, currency, category, image } = product;
        return [...prev, { id, name, price, currency, category, image, qty: 1 }];
      });

      // Drawer already open: keep earlier items and put the new one on top.
      // Drawer closed: start a fresh list with just this item.
      setAddedIds((prev) =>
        drawerOpenRef.current ? [product.id, ...prev.filter((id) => id !== product.id)] : [product.id]
      );
      setOpen(true);
    },
    [setOpen]
  );

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setAddedIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const updateQty = useCallback((id, qty) => {
    setItems((prev) =>
      qty < 1 ? prev.filter((i) => i.id !== id) : prev.map((i) => (i.id === id ? { ...i, qty } : i))
    );
    if (qty < 1) setAddedIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setAddedIds([]);
  }, []);

  const value = useMemo(
    () => ({
      items,
      cartCount: items.reduce((n, i) => n + i.qty, 0),
      subtotal: items.reduce((n, i) => n + i.price * i.qty, 0),
      addItem,
      removeItem,
      updateQty,
      clearCart,
      addedIds,
      drawerOpen,
      // Opening manually (e.g. from a bag icon) shows no "just added" list.
      openDrawer: () => {
        setAddedIds([]);
        setOpen(true);
      },
      closeDrawer: () => setOpen(false),
    }),
    [items, addedIds, drawerOpen, addItem, removeItem, updateQty, clearCart, setOpen]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
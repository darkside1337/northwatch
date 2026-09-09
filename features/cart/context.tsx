"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useTransition,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  getCartAction,
  addToBagAction,
  updateQuantityAction,
  removeFromBagAction,
  applyPromoAction,
  removePromoAction,
  clearCartAction,
} from "./actions";
import type {
  CartState,
  CartItem,
  RemovedCartItem,
  CartTotals,
  PromoResult,
} from "./schemas";

const DEFAULT_TOTALS: CartTotals = {
  subtotalCents: 0,
  discountCents: 0,
  shippingEstimateCents: 0,
  totalCents: 0,
  itemCount: 0,
};

const DEFAULT_CART: CartState = {
  items: [],
  removedItems: [],
  totals: DEFAULT_TOTALS,
  promo: null,
  isPending: false,
};

interface CartContextValue {
  items: CartItem[];
  removedItems: RemovedCartItem[];
  totals: CartTotals;
  promo: PromoResult | null;
  itemCount: number;
  isOpen: boolean;
  isPending: boolean;
  isHydrated: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  applyPromo: (code: string) => Promise<{ success: boolean; message?: string }>;
  removePromo: () => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

// React 19 canonical hydration listener: zero cascading renders, zero SSR mismatch
const emptySubscribe = () => () => {};

export function useIsHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

interface CartProviderProps {
  children: ReactNode;
  initialCart?: CartState;
}

export function CartProvider({ children, initialCart }: CartProviderProps) {
  const router = useRouter();
  const [cart, setCart] = useState<CartState>(initialCart ?? DEFAULT_CART);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isHydrated = useIsHydrated();

  // If no initialCart was passed during SSR, load once mounted
  useEffect(() => {
    if (!initialCart) {
      let isMounted = true;
      startTransition(async () => {
        try {
          const fresh = await getCartAction();
          if (isMounted) {
            setCart(fresh);
          }
        } catch {
          // Graceful fallback to default cart on network failure
        }
      });
      return () => {
        isMounted = false;
      };
    }
  }, [initialCart]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addItem = async (variantId: string, quantity = 1) => {
    startTransition(async () => {
      try {
        const fresh = await addToBagAction({ variantId, quantity });
        setCart(fresh);
        setIsOpen(true);
        router.refresh();
      } catch (err) {
        console.error("Failed to add item to bag:", err);
      }
    });
  };

  const updateQuantity = async (variantId: string, quantity: number) => {
    startTransition(async () => {
      try {
        const fresh = await updateQuantityAction({ variantId, quantity });
        setCart(fresh);
        router.refresh();
      } catch (err) {
        console.error("Failed to update item quantity:", err);
      }
    });
  };

  const removeItem = async (variantId: string) => {
    startTransition(async () => {
      try {
        const fresh = await removeFromBagAction({ variantId });
        setCart(fresh);
        router.refresh();
      } catch (err) {
        console.error("Failed to remove item from bag:", err);
      }
    });
  };

  const applyPromo = async (
    code: string
  ): Promise<{ success: boolean; message?: string }> => {
    return new Promise((resolve) => {
      startTransition(async () => {
        try {
          const fresh = await applyPromoAction({ code });
          setCart(fresh);
          router.refresh();

          if (fresh.promo?.isValid) {
            resolve({ success: true, message: fresh.promo.description });
          } else {
            resolve({
              success: false,
              message: fresh.promo?.failureReason || "Invalid promotion code.",
            });
          }
        } catch {
          resolve({ success: false, message: "Could not apply promotion code." });
        }
      });
    });
  };

  const removePromo = async () => {
    startTransition(async () => {
      try {
        const fresh = await removePromoAction();
        setCart(fresh);
        router.refresh();
      } catch (err) {
        console.error("Failed to remove promotion code:", err);
      }
    });
  };

  const clearCart = async () => {
    startTransition(async () => {
      try {
        const fresh = await clearCartAction();
        setCart(fresh);
        setIsOpen(false);
        router.refresh();
      } catch (err) {
        console.error("Failed to clear cart:", err);
      }
    });
  };

  return (
    <CartContext.Provider
      value={{
        items: cart.items,
        removedItems: cart.removedItems,
        totals: cart.totals,
        promo: cart.promo ?? null,
        itemCount: cart.totals.itemCount,
        isOpen,
        isPending,
        isHydrated,
        openCart,
        closeCart,
        addItem,
        updateQuantity,
        removeItem,
        applyPromo,
        removePromo,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a <CartProvider>");
  }
  return context;
}

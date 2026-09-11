// Context & Hooks
export { CartProvider, useCart, useIsHydrated } from "./context";

// UI Components
export { CartDrawer } from "./components/CartDrawer";
export { CartReviewView } from "./components/CartReviewView";
export { LineItem } from "./components/LineItem";
export { PromoInput } from "./components/PromoInput";
export { CartNavHeader } from "./components/CartNavHeader";

// Server Actions (Client-safe RPC stubs in Next.js App Router)
export {
  getCartAction,
  addToBagAction,
  updateQuantityAction,
  removeFromBagAction,
  applyPromoAction,
  removePromoAction,
  clearCartAction,
} from "./actions";

// Domain Math Engine
export {
  calculateCartCalculation,
  calculateCartTotals,
  calculateSubtotal,
  calculateItemCount,
  clampQuantity,
  evaluatePromo,
} from "./math";

// Schemas & Types
export {
  ThinCartItemSchema,
  ThinCartSchema,
  CartItemSchema,
  CartTotalsSchema,
  CartStateSchema,
  RemovedCartItemSchema,
  PromoResultSchema,
  StockAdjustmentReasonEnum,
  AddToCartInputSchema,
  UpdateQuantityInputSchema,
  RemoveFromCartInputSchema,
  ApplyPromoInputSchema,
  type ThinCartItem,
  type ThinCart,
  type CartItem,
  type StockAdjustmentReason,
  type CartTotals,
  type CartState,
  type RemovedCartItem,
  type RemovedCartItemReason,
  type PromoResult,
  type AddToCartInput,
  type UpdateQuantityInput,
  type RemoveFromCartInput,
  type ApplyPromoInput,
} from "./schemas";

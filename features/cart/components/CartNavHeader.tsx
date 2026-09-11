"use client";

import { useCart, useIsHydrated } from "@/features/cart/context";
import { NavigationHeader } from "@/components/navigation-header";

/**
 * Domain-connected navigation header for the shop layout.
 * Connects the presentation-only NavigationHeader to live cart state.
 */
export function CartNavHeader({ className }: { className?: string }) {
  const { openCart, itemCount } = useCart();
  const isHydrated = useIsHydrated();
  const displayCount = isHydrated ? itemCount : 0;

  return (
    <NavigationHeader
      cartItemCount={displayCount}
      onOpenCart={openCart}
      className={className}
    />
  );
}

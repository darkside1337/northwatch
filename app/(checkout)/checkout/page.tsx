import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { requireAuth } from "@/lib/auth/session";
import { getThinCartCookie } from "@/features/cart/cookie";
import { rehydrateCart } from "@/features/cart/queries";
import { getActiveCheckoutDraft } from "@/features/checkout/queries";
import { CheckoutWizard } from "@/features/checkout/components/CheckoutWizard";
import { calculateCheckoutTotals } from "@/features/checkout/math";

export const instant = false;

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  // Authoritative server-side session resolution
  await requireAuth("/checkout");

  // Read active draft & PaymentIntent state
  const draftResult = await getActiveCheckoutDraft();
  if (draftResult.type === "redirect") {
    redirect(draftResult.redirectTo);
  }

  const initialDraft = draftResult.type === "draft" ? draftResult.draft : null;

  // Rehydrate live cart
  const thinCart = await getThinCartCookie();
  const cartState = await rehydrateCart(thinCart);

  // If cart is completely empty and there is no active draft, prompt to browse
  if (cartState.items.length === 0 && !initialDraft) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-6">
        <div className="w-12 h-12 mx-auto border border-outline-variant/60 flex items-center justify-center text-on-surface-variant">
          <ShoppingBag className="w-5 h-5" />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-normal text-foreground">
            Your Acquisition Bag is Empty
          </h1>
          <p className="text-xs font-mono text-on-surface-variant leading-relaxed">
            Please select an archived reference from our collection before proceeding to encrypted checkout.
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-foreground text-background text-xs font-mono font-semibold uppercase tracking-[0.16em] px-6 py-3 hover:bg-foreground/90 transition-colors"
        >
          <span>Explore Atelier Collection</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  // Pre-calculate initial totals if no draft exists
  const initialTotals = initialDraft
    ? {
        subtotalCents: initialDraft.subtotalCents,
        discountCents: initialDraft.discountCents,
        shippingCents: initialDraft.shippingCents,
        taxCents: initialDraft.taxCents,
        totalCents: initialDraft.totalCents,
      }
    : calculateCheckoutTotals({
        items: cartState.items,
        shippingTierId: "standard",
        stateCode: "CA",
        promoCode: thinCart.promoCode,
      });

  return (
    <CheckoutWizard
      initialDraft={initialDraft}
      initialStep={
        (await searchParams).step === "payment" && initialDraft?.clientSecret
          ? "payment"
          : "shipping"
      }
      items={cartState.items}
      subtotalCents={initialTotals.subtotalCents}
      discountCents={initialTotals.discountCents}
      promoCode={thinCart.promoCode}
      shippingCents={initialTotals.shippingCents}
      taxCents={initialTotals.taxCents}
      totalCents={initialTotals.totalCents}
    />
  );
}

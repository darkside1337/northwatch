import { NavigationHeader } from "@/components/navigation-header";
import { Footer } from "@/components/footer";
import { CartProvider, CartDrawer } from "@/features/cart";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-surface text-on-surface">
        <NavigationHeader />
        <main className="flex-1 w-full pt-16 bg-surface">{children}</main>
        <Footer />
        <CartDrawer />
      </div>
    </CartProvider>
  );
}

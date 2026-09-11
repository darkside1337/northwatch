"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { clearCartAction } from "@/features/cart/actions";

interface OrderSettlementPollerProps {
  isPaid: boolean;
}

export function OrderSettlementPoller({ isPaid }: OrderSettlementPollerProps) {
  const router = useRouter();
  const clearedRef = useRef(false);

  useEffect(() => {
    if (!clearedRef.current) {
      clearedRef.current = true;
      clearCartAction().catch((err) => {
        console.warn("Could not clear cart after order confirmation:", err);
      });
    }
  }, []);

  useEffect(() => {
    if (isPaid) return;

    const interval = setInterval(() => {
      router.refresh();
    }, 1500);

    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 30000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isPaid, router]);

  return null;
}

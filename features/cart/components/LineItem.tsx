"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/config/site";
import { useCart } from "../context";
import type { CartItem } from "../schemas";

interface LineItemProps {
  item: CartItem;
  onItemClick?: () => void;
}

export function LineItem({ item, onItemClick }: LineItemProps) {
  const { updateQuantity, removeItem, isPending } = useCart();
  const [imgSrc, setImgSrc] = React.useState(
    item.image || "/images/watch-placeholder.svg"
  );

  const canIncrement = item.quantity < Math.min(10, item.maxStock);
  const canDecrement = item.quantity > 1;

  // Build variant description string: "38mm / Basalt Black / Horween Calf"
  const variantDetails = [
    item.caseDiameter,
    item.dialColor,
    item.strapMaterial,
  ]
    .filter(Boolean)
    .join(" / ");

  const handleDecrement = async () => {
    if (!canDecrement || isPending) return;
    await updateQuantity(item.variantId, item.quantity - 1);
  };

  const handleIncrement = async () => {
    if (!canIncrement || isPending) return;
    await updateQuantity(item.variantId, item.quantity + 1);
  };

  const handleRemove = async () => {
    if (isPending) return;
    await removeItem(item.variantId);
  };

  return (
    <article className="flex gap-4 py-4 group">
      {/* 1. Thumbnail Container (Boxed with hairline border) */}
      <div className="w-20 h-24 sm:w-24 sm:h-24 flex-shrink-0 bg-surface-container-lowest border border-outline flex items-center justify-center p-2 relative overflow-hidden">
        <Link
          href={`/products/${item.slug}`}
          onClick={onItemClick}
          className="relative w-full h-full block focus:outline-none"
          tabIndex={-1}
        >
          <Image
            src={imgSrc}
            alt={`${item.title} - ${item.variantName}`}
            fill
            sizes="(max-width: 640px) 80px, 96px"
            className="object-contain transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgSrc("/images/watch-placeholder.svg")}
          />
        </Link>
        {item.caseDiameter && (
          <span className="absolute top-1 left-1 text-[9px] font-mono text-on-surface-variant/80 uppercase pointer-events-none">
            {item.caseDiameter}
          </span>
        )}
      </div>

      {/* 2. Details & Controls */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex justify-between items-start gap-2">
            <Link
              href={`/products/${item.slug}`}
              onClick={onItemClick}
              className="focus:outline-none hover:text-accent transition-colors"
            >
              <h3 className="font-serif text-base sm:text-lg font-normal text-on-surface leading-snug tracking-wide truncate">
                {item.title}
              </h3>
            </Link>
            <span className="font-mono text-sm font-medium text-on-surface tabular-nums whitespace-nowrap">
              {formatPrice(item.priceCents * item.quantity)}
            </span>
          </div>

          {variantDetails && (
            <p className="text-xs text-on-surface-variant mt-0.5 tracking-tight truncate">
              {variantDetails}
            </p>
          )}

          <p className="text-[10px] font-mono text-on-surface-variant/80 mt-0.5 uppercase tracking-wider">
            REF. {item.sku}
          </p>

          {/* Stock Adjustment Callout */}
          {item.stockAdjustmentNote && (
            <div className="mt-2 p-1.5 bg-accent-olive/10 border border-accent-olive/20 text-accent-olive text-[10px] font-mono leading-tight">
              {item.stockAdjustmentNote}
            </div>
          )}
        </div>

        {/* 3. Stepper & Remove Row */}
        <div className="flex items-center justify-between pt-3">
          {/* Hairline-bordered stepper (0px radius) */}
          <div className="inline-flex items-center border border-outline bg-surface h-7 select-none">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={!canDecrement || isPending}
              className="w-7 h-full flex items-center justify-center text-on-surface text-xs hover:bg-surface-container-low transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed focus:outline-none"
              aria-label={`Decrease quantity of ${item.title}`}
            >
              −
            </button>
            <span className="w-8 text-center text-xs font-mono text-on-surface font-medium tabular-nums">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrement}
              disabled={!canIncrement || isPending}
              className="w-7 h-full flex items-center justify-center text-on-surface text-xs hover:bg-surface-container-low transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed focus:outline-none"
              aria-label={`Increase quantity of ${item.title}`}
            >
              +
            </button>
          </div>

          {/* Unit price indicator if multi-item */}
          {item.quantity > 1 && (
            <span className="hidden sm:inline font-mono text-[10px] text-on-surface-variant/70 tabular-nums">
              ({formatPrice(item.priceCents)} ea)
            </span>
          )}

          {/* Discrete Remove Action */}
          <button
            type="button"
            onClick={handleRemove}
            disabled={isPending}
            className="text-[11px] text-on-surface-variant hover:text-on-surface uppercase tracking-[0.08em] underline underline-offset-4 decoration-outline hover:decoration-on-surface transition-all focus:outline-none disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}

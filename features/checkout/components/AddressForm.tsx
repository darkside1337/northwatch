"use client";

import { useState } from "react";
import { siteConfig, type ShippingTierId } from "@/config/site";
import { ShippingAddressSchema, type ShippingAddress } from "../schemas";

interface AddressFormProps {
  initialAddress?: ShippingAddress | null;
  initialTierId?: ShippingTierId;
  subtotalCents: number;
  isLoading?: boolean;
  onSubmit: (data: {
    shippingAddress: ShippingAddress;
    shippingTierId: ShippingTierId;
  }) => Promise<void>;
}

export function AddressForm({
  initialAddress,
  initialTierId = "standard",
  subtotalCents,
  isLoading = false,
  onSubmit,
}: AddressFormProps) {
  const [formData, setFormData] = useState<ShippingAddress>({
    firstName: initialAddress?.firstName ?? "",
    lastName: initialAddress?.lastName ?? "",
    street: initialAddress?.street ?? "",
    apartment: initialAddress?.apartment ?? "",
    city: initialAddress?.city ?? "",
    state: initialAddress?.state ?? "CA",
    postalCode: initialAddress?.postalCode ?? "",
    country: initialAddress?.country ?? "US",
    phone: initialAddress?.phone ?? "",
  });

  const [selectedTier, setSelectedTier] = useState<ShippingTierId>(initialTierId);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = ShippingAddressSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    await onSubmit({
      shippingAddress: result.data,
      shippingTierId: selectedTier,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      {/* 1. Recipient Coordinates */}
      <div className="space-y-4">
        <div className="flex items-baseline justify-between border-b border-outline-variant/40 pb-3">
          <h2 className="font-serif text-xl sm:text-2xl font-normal tracking-tight text-foreground">
            1. Shipping Destination
          </h2>
          <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
            Dispatched from Geneva
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <label
              htmlFor="firstName"
              className="block text-[11px] font-mono uppercase tracking-[0.12em] text-on-surface-variant mb-1.5"
            >
              First Name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full bg-surface-container-lowest border px-3.5 py-2.5 text-sm text-foreground rounded-none transition-colors focus:border-foreground focus:outline-none ${
                errors.firstName ? "border-error text-error" : "border-outline-variant/80"
              }`}
              placeholder="e.g. Erik"
            />
            {errors.firstName && (
              <p className="mt-1 text-[11px] font-mono text-error">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label
              htmlFor="lastName"
              className="block text-[11px] font-mono uppercase tracking-[0.12em] text-on-surface-variant mb-1.5"
            >
              Last Name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full bg-surface-container-lowest border px-3.5 py-2.5 text-sm text-foreground rounded-none transition-colors focus:border-foreground focus:outline-none ${
                errors.lastName ? "border-error text-error" : "border-outline-variant/80"
              }`}
              placeholder="e.g. Lindqvist"
            />
            {errors.lastName && (
              <p className="mt-1 text-[11px] font-mono text-error">{errors.lastName}</p>
            )}
          </div>

          {/* Street Address */}
          <div className="sm:col-span-2">
            <label
              htmlFor="street"
              className="block text-[11px] font-mono uppercase tracking-[0.12em] text-on-surface-variant mb-1.5"
            >
              Street Address
            </label>
            <input
              id="street"
              name="street"
              type="text"
              required
              value={formData.street}
              onChange={handleChange}
              className={`w-full bg-surface-container-lowest border px-3.5 py-2.5 text-sm text-foreground rounded-none transition-colors focus:border-foreground focus:outline-none ${
                errors.street ? "border-error text-error" : "border-outline-variant/80"
              }`}
              placeholder="e.g. 742 Evergreen Terrace"
            />
            {errors.street && (
              <p className="mt-1 text-[11px] font-mono text-error">{errors.street}</p>
            )}
          </div>

          {/* Apartment / Suite */}
          <div className="sm:col-span-2">
            <label
              htmlFor="apartment"
              className="block text-[11px] font-mono uppercase tracking-[0.12em] text-on-surface-variant mb-1.5"
            >
              Apartment, Suite, Unit <span className="text-on-surface-variant/60">(Optional)</span>
            </label>
            <input
              id="apartment"
              name="apartment"
              type="text"
              value={formData.apartment}
              onChange={handleChange}
              className="w-full bg-surface-container-lowest border border-outline-variant/80 px-3.5 py-2.5 text-sm text-foreground rounded-none transition-colors focus:border-foreground focus:outline-none"
              placeholder="e.g. Apt 4B"
            />
          </div>

          {/* City */}
          <div>
            <label
              htmlFor="city"
              className="block text-[11px] font-mono uppercase tracking-[0.12em] text-on-surface-variant mb-1.5"
            >
              City
            </label>
            <input
              id="city"
              name="city"
              type="text"
              required
              value={formData.city}
              onChange={handleChange}
              className={`w-full bg-surface-container-lowest border px-3.5 py-2.5 text-sm text-foreground rounded-none transition-colors focus:border-foreground focus:outline-none ${
                errors.city ? "border-error text-error" : "border-outline-variant/80"
              }`}
              placeholder="e.g. San Francisco"
            />
            {errors.city && (
              <p className="mt-1 text-[11px] font-mono text-error">{errors.city}</p>
            )}
          </div>

          {/* State / Province */}
          <div>
            <label
              htmlFor="state"
              className="block text-[11px] font-mono uppercase tracking-[0.12em] text-on-surface-variant mb-1.5"
            >
              State / Province
            </label>
            <input
              id="state"
              name="state"
              type="text"
              required
              value={formData.state}
              onChange={handleChange}
              className={`w-full bg-surface-container-lowest border px-3.5 py-2.5 text-sm text-foreground rounded-none transition-colors focus:border-foreground focus:outline-none ${
                errors.state ? "border-error text-error" : "border-outline-variant/80"
              }`}
              placeholder="e.g. CA or New York"
            />
            {errors.state && (
              <p className="mt-1 text-[11px] font-mono text-error">{errors.state}</p>
            )}
          </div>

          {/* Postal Code */}
          <div>
            <label
              htmlFor="postalCode"
              className="block text-[11px] font-mono uppercase tracking-[0.12em] text-on-surface-variant mb-1.5"
            >
              Postal / ZIP Code
            </label>
            <input
              id="postalCode"
              name="postalCode"
              type="text"
              required
              value={formData.postalCode}
              onChange={handleChange}
              className={`w-full bg-surface-container-lowest border px-3.5 py-2.5 text-sm font-mono text-foreground rounded-none transition-colors focus:border-foreground focus:outline-none ${
                errors.postalCode ? "border-error text-error" : "border-outline-variant/80"
              }`}
              placeholder="e.g. 94107"
            />
            {errors.postalCode && (
              <p className="mt-1 text-[11px] font-mono text-error">{errors.postalCode}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="block text-[11px] font-mono uppercase tracking-[0.12em] text-on-surface-variant mb-1.5"
            >
              Courier Contact Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleChange}
              className={`w-full bg-surface-container-lowest border px-3.5 py-2.5 text-sm font-mono text-foreground rounded-none transition-colors focus:border-foreground focus:outline-none ${
                errors.phone ? "border-error text-error" : "border-outline-variant/80"
              }`}
              placeholder="e.g. +1 (555) 019-2834"
            />
            {errors.phone && (
              <p className="mt-1 text-[11px] font-mono text-error">{errors.phone}</p>
            )}
          </div>
        </div>
      </div>

      {/* 2. Courier Tier Selection */}
      <div className="space-y-4 pt-4 border-t border-outline-variant/40">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-xl sm:text-2xl font-normal tracking-tight text-foreground">
            2. Insured Transit Method
          </h2>
          <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
            Armored Signature Delivery
          </span>
        </div>

        <div className="space-y-3">
          {/* Standard Tier */}
          <label
            className={`flex items-start justify-between p-4 border rounded-none cursor-pointer transition-colors ${
              selectedTier === "standard"
                ? "border-foreground bg-surface-container-lowest"
                : "border-outline-variant/60 bg-surface-container-lowest/50 hover:border-outline"
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="shippingTier"
                value="standard"
                checked={selectedTier === "standard"}
                onChange={() => setSelectedTier("standard")}
                className="mt-1 accent-foreground"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {siteConfig.shipping.tiers.standard.name}
                  </span>
                  {subtotalCents >= (siteConfig.shipping.tiers.standard.freeThreshold ?? 50000) && (
                    <span className="px-1.5 py-0.2 bg-secondary/15 text-secondary border border-secondary/30 text-[10px] font-mono uppercase tracking-wider">
                      Complimentary
                    </span>
                  )}
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {siteConfig.shipping.tiers.standard.description} ({siteConfig.shipping.tiers.standard.estimatedDays})
                </p>
              </div>
            </div>
            <div className="font-mono text-xs font-semibold text-foreground pl-4 shrink-0">
              {subtotalCents >= (siteConfig.shipping.tiers.standard.freeThreshold ?? 50000)
                ? "FREE"
                : `$${(siteConfig.shipping.tiers.standard.amount / 100).toFixed(2)}`}
            </div>
          </label>

          {/* Express Tier */}
          <label
            className={`flex items-start justify-between p-4 border rounded-none cursor-pointer transition-colors ${
              selectedTier === "express"
                ? "border-foreground bg-surface-container-lowest"
                : "border-outline-variant/60 bg-surface-container-lowest/50 hover:border-outline"
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="shippingTier"
                value="express"
                checked={selectedTier === "express"}
                onChange={() => setSelectedTier("express")}
                className="mt-1 accent-foreground"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {siteConfig.shipping.tiers.express.name}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {siteConfig.shipping.tiers.express.description} ({siteConfig.shipping.tiers.express.estimatedDays})
                </p>
              </div>
            </div>
            <div className="font-mono text-xs font-semibold text-foreground pl-4 shrink-0">
              ${(siteConfig.shipping.tiers.express.amount / 100).toFixed(2)}
            </div>
          </label>

          {/* Priority Tier */}
          <label
            className={`flex items-start justify-between p-4 border rounded-none cursor-pointer transition-colors ${
              selectedTier === "priority"
                ? "border-foreground bg-surface-container-lowest"
                : "border-outline-variant/60 bg-surface-container-lowest/50 hover:border-outline"
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="shippingTier"
                value="priority"
                checked={selectedTier === "priority"}
                onChange={() => setSelectedTier("priority")}
                className="mt-1 accent-foreground"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {siteConfig.shipping.tiers.priority.name}
                  </span>
                  <span className="px-1.5 py-0.2 bg-surface border border-outline-variant text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">
                    Armored Escrow
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {siteConfig.shipping.tiers.priority.description} ({siteConfig.shipping.tiers.priority.estimatedDays})
                </p>
              </div>
            </div>
            <div className="font-mono text-xs font-semibold text-foreground pl-4 shrink-0">
              ${(siteConfig.shipping.tiers.priority.amount / 100).toFixed(2)}
            </div>
          </label>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-foreground text-background py-4 px-8 text-xs font-mono font-semibold uppercase tracking-[0.18em] hover:bg-foreground/90 active:bg-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-none flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <span>Securing Vault Session...</span>
          ) : (
            <span>Continue to Vault Payment →</span>
          )}
        </button>
      </div>
    </form>
  );
}

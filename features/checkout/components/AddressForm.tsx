"use client";

import { useState } from "react";
import type { ShippingTierId } from "@/config/site";
import { ShippingAddressSchema, type ShippingAddress } from "../schemas";
import { AddressFields } from "./AddressFields";
import { ShippingTierSelector } from "./ShippingTierSelector";

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
      <AddressFields
        formData={formData}
        errors={errors}
        onChange={handleChange}
      />

      <ShippingTierSelector
        selectedTier={selectedTier}
        onSelectTier={setSelectedTier}
        subtotalCents={subtotalCents}
      />

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

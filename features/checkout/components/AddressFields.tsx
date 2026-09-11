"use client";

import type { ShippingAddress } from "../schemas";

interface AddressFieldsProps {
  formData: ShippingAddress;
  errors: Record<string, string>;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
}

export function AddressFields({
  formData,
  errors,
  onChange,
}: AddressFieldsProps) {
  return (
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
            onChange={onChange}
            className={`w-full bg-surface-container-lowest border px-3.5 py-2.5 text-sm text-foreground rounded-none transition-colors focus:border-foreground focus:outline-none ${
              errors.firstName
                ? "border-error text-error"
                : "border-outline-variant/80"
            }`}
            placeholder="e.g. Erik"
          />
          {errors.firstName && (
            <p className="mt-1 text-[11px] font-mono text-error">
              {errors.firstName}
            </p>
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
            onChange={onChange}
            className={`w-full bg-surface-container-lowest border px-3.5 py-2.5 text-sm text-foreground rounded-none transition-colors focus:border-foreground focus:outline-none ${
              errors.lastName
                ? "border-error text-error"
                : "border-outline-variant/80"
            }`}
            placeholder="e.g. Lindqvist"
          />
          {errors.lastName && (
            <p className="mt-1 text-[11px] font-mono text-error">
              {errors.lastName}
            </p>
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
            onChange={onChange}
            className={`w-full bg-surface-container-lowest border px-3.5 py-2.5 text-sm text-foreground rounded-none transition-colors focus:border-foreground focus:outline-none ${
              errors.street
                ? "border-error text-error"
                : "border-outline-variant/80"
            }`}
            placeholder="e.g. 742 Evergreen Terrace"
          />
          {errors.street && (
            <p className="mt-1 text-[11px] font-mono text-error">
              {errors.street}
            </p>
          )}
        </div>

        {/* Apartment / Suite */}
        <div className="sm:col-span-2">
          <label
            htmlFor="apartment"
            className="block text-[11px] font-mono uppercase tracking-[0.12em] text-on-surface-variant mb-1.5"
          >
            Apartment, Suite, Unit{" "}
            <span className="text-on-surface-variant/60">(Optional)</span>
          </label>
          <input
            id="apartment"
            name="apartment"
            type="text"
            value={formData.apartment}
            onChange={onChange}
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
            onChange={onChange}
            className={`w-full bg-surface-container-lowest border px-3.5 py-2.5 text-sm text-foreground rounded-none transition-colors focus:border-foreground focus:outline-none ${
              errors.city
                ? "border-error text-error"
                : "border-outline-variant/80"
            }`}
            placeholder="e.g. San Francisco"
          />
          {errors.city && (
            <p className="mt-1 text-[11px] font-mono text-error">
              {errors.city}
            </p>
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
            onChange={onChange}
            className={`w-full bg-surface-container-lowest border px-3.5 py-2.5 text-sm text-foreground rounded-none transition-colors focus:border-foreground focus:outline-none ${
              errors.state
                ? "border-error text-error"
                : "border-outline-variant/80"
            }`}
            placeholder="e.g. CA or New York"
          />
          {errors.state && (
            <p className="mt-1 text-[11px] font-mono text-error">
              {errors.state}
            </p>
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
            onChange={onChange}
            className={`w-full bg-surface-container-lowest border px-3.5 py-2.5 text-sm font-mono text-foreground rounded-none transition-colors focus:border-foreground focus:outline-none ${
              errors.postalCode
                ? "border-error text-error"
                : "border-outline-variant/80"
            }`}
            placeholder="e.g. 94107"
          />
          {errors.postalCode && (
            <p className="mt-1 text-[11px] font-mono text-error">
              {errors.postalCode}
            </p>
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
            onChange={onChange}
            className={`w-full bg-surface-container-lowest border px-3.5 py-2.5 text-sm font-mono text-foreground rounded-none transition-colors focus:border-foreground focus:outline-none ${
              errors.phone
                ? "border-error text-error"
                : "border-outline-variant/80"
            }`}
            placeholder="e.g. +1 (555) 019-2834"
          />
          {errors.phone && (
            <p className="mt-1 text-[11px] font-mono text-error">
              {errors.phone}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

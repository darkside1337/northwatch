"use client";

import * as React from "react";
import { newsletterSubscriptionSchema } from "../schemas";

export function JournalDispatchSubscribe() {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "error" | "success">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = newsletterSubscriptionSchema.safeParse({ email });

    if (!result.success) {
      setStatus("error");
      setErrorMessage(
        result.error.issues[0]?.message || "Invalid email address."
      );
      return;
    }

    setStatus("success");
    setErrorMessage("");
    setEmail("");
  };

  return (
    <section className="w-full bg-primary text-on-primary border-b border-outline">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-accent-olive inline-block" />
              <span className="font-mono text-xs uppercase tracking-widest text-surface-container-high">
                DISPATCH SERVICE // NO PROMOTIONS
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-on-primary tracking-tight mb-3">
              Keep Good Time.
            </h2>
            <p className="font-sans text-xs sm:text-sm text-surface-container max-w-xl leading-relaxed">
              We publish four monographs per calendar year. Receive technical
              bulletins, metallurgy monographs, and direct atelier invitations
              prior to public release.
            </p>
          </div>

          <div className="lg:col-span-5">
            <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
              <div className="flex w-full">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="TECHNICAL CORRESPONDENT EMAIL"
                  required
                  className="flex-1 bg-surface-container-low text-on-surface border border-outline px-4 py-2.5 font-mono text-xs placeholder:text-on-surface-variant focus:outline-none focus:border-on-primary rounded-none"
                />
                <button
                  type="submit"
                  className="bg-surface text-primary px-6 py-2.5 font-sans text-xs uppercase tracking-wider font-semibold hover:bg-surface-container transition-colors rounded-none whitespace-nowrap"
                >
                  Inscribe
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-surface-container">
                  ENCRYPTED DISPATCH // BIANNUAL
                </span>
                {status === "success" && (
                  <span className="text-emerald-300 font-medium">
                    CORRESPONDENCE REGISTERED ✓
                  </span>
                )}
                {status === "error" && (
                  <span className="text-red-400 font-medium">
                    {errorMessage}
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

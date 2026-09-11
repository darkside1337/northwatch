"use client";

import { useState, useTransition } from "react";
import { devSignInAction } from "../dev-actions";

interface DevSignInButtonProps {
  redirectTo: string;
}

/**
 * Isolated development-only sign-in trigger.
 * This component is only rendered when process.env.NODE_ENV !== "production".
 */
export function DevSignInButton({ redirectTo }: DevSignInButtonProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDevSignIn() {
    setErrorMessage(null);
    startTransition(async () => {
      try {
        const res = await devSignInAction(redirectTo);
        if (res?.destination) {
          window.location.href = res.destination;
        }
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "Dev sign-in failed."
        );
      }
    });
  }

  return (
    <div className="w-full max-w-[400px] mt-4">
      {errorMessage && (
        <div className="mb-2 p-2 border border-[#9E2A2B] bg-[#9E2A2B]/5 text-[#9E2A2B] text-[10px] font-mono">
          {errorMessage}
        </div>
      )}
      <button
        type="button"
        onClick={handleDevSignIn}
        disabled={isPending}
        className="w-full py-2 px-3 bg-transparent border border-dashed border-[#DCD8D0] hover:border-[#141413] text-[#595854] hover:text-[#141413] text-[10px] font-mono uppercase tracking-[0.12em] transition-colors flex items-center justify-center gap-2 rounded-none cursor-pointer disabled:opacity-50"
      >
        <span className="w-1.5 h-1.5 rounded-none bg-[#3B4436]" />
        <span>
          {isPending
            ? "AUTHENTICATING TEST COLLECTOR..."
            : "QUICK DEV SIGN-IN (TEST COLLECTOR)"}
        </span>
      </button>
    </div>
  );
}

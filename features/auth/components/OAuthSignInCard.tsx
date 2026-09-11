"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { sanitizeRedirectPath } from "../schemas";

interface OAuthSignInCardProps {
  redirectTo?: string;
}

export function OAuthSignInCard({ redirectTo }: OAuthSignInCardProps) {
  const [loadingProvider, setLoadingProvider] = useState<"google" | "github" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const safeRedirect = sanitizeRedirectPath(redirectTo, "/account");

  async function handleOAuthSignIn(provider: "google" | "github") {
    try {
      setErrorMessage(null);
      setLoadingProvider(provider);
      await authClient.signIn.social({
        provider,
        callbackURL: safeRedirect,
      });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to initiate sign in. Please try again.");
      setLoadingProvider(null);
    }
  }

  return (
    <div className="w-full max-w-[400px] bg-[#FFFFFF] border border-[#DCD8D0] p-10 relative">
      {/* Corner Precision Crosshair Coordinates */}
      <div className="absolute -top-[5px] -left-[5px] w-[9px] h-[9px] pointer-events-none">
        <div className="absolute top-[4px] left-0 right-0 h-[1px] bg-[#DCD8D0]" />
        <div className="absolute left-[4px] top-0 bottom-0 w-[1px] bg-[#DCD8D0]" />
      </div>
      <div className="absolute -top-[5px] -right-[5px] w-[9px] h-[9px] pointer-events-none">
        <div className="absolute top-[4px] left-0 right-0 h-[1px] bg-[#DCD8D0]" />
        <div className="absolute left-[4px] top-0 bottom-0 w-[1px] bg-[#DCD8D0]" />
      </div>
      <div className="absolute -bottom-[5px] -left-[5px] w-[9px] h-[9px] pointer-events-none">
        <div className="absolute top-[4px] left-0 right-0 h-[1px] bg-[#DCD8D0]" />
        <div className="absolute left-[4px] top-0 bottom-0 w-[1px] bg-[#DCD8D0]" />
      </div>
      <div className="absolute -bottom-[5px] -right-[5px] w-[9px] h-[9px] pointer-events-none">
        <div className="absolute top-[4px] left-0 right-0 h-[1px] bg-[#DCD8D0]" />
        <div className="absolute left-[4px] top-0 bottom-0 w-[1px] bg-[#DCD8D0]" />
      </div>

      {/* 1. Brand Identification */}
      <div className="flex items-center justify-center gap-1.5 mb-8">
        <span className="font-serif text-[24px] font-medium tracking-[0.28em] text-[#141413] uppercase leading-none pl-1">
          NORTHWATCH
        </span>
        <span className="w-[4px] h-[4px] rounded-full bg-[#3B4436] inline-block mb-0.5" />
      </div>

      {/* 2. Calibration Eyebrow */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#595854]">
          ACCESS PROTOCOL // SECURE ENTRY
        </span>
      </div>

      {/* 3. Headline & Description */}
      <div className="text-center mb-8">
        <h1 className="font-serif text-[30px] font-normal text-[#141413] leading-[1.15] mb-2.5">
          Collector Sign In
        </h1>
        <p className="text-[13px] font-sans text-[#595854] leading-[1.5] max-w-[310px] mx-auto">
          Connect with your identity provider to access your registered timepieces, orders, and express checkout.
        </p>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="mb-6 p-3 border border-[#9E2A2B] bg-[#9E2A2B]/5 text-[#9E2A2B] text-[11px] font-mono">
          ERROR: {errorMessage}
        </div>
      )}

      {/* 4. OAuth Actions */}
      <div className="space-y-3 mb-6">
        {/* Button A: Continue with Google */}
        <button
          type="button"
          onClick={() => handleOAuthSignIn("google")}
          disabled={loadingProvider !== null}
          className="group w-full h-[48px] px-4 bg-[#FFFFFF] border border-[#141413] text-[#141413] hover:bg-[#F4F3F0] transition-colors duration-150 flex items-center justify-between text-left rounded-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-3">
            <svg className="w-4 h-4 text-[#141413] shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="currentColor"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="currentColor"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="currentColor"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="currentColor"
              />
            </svg>
            <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.12em] text-[#141413]">
              {loadingProvider === "google" ? "CONNECTING..." : "CONTINUE WITH GOOGLE"}
            </span>
          </div>
          <span className="text-[13px] font-sans text-[#141413] transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </button>

        {/* Button B: Continue with GitHub */}
        <button
          type="button"
          onClick={() => handleOAuthSignIn("github")}
          disabled={loadingProvider !== null}
          className="group w-full h-[48px] px-4 bg-[#141413] border border-[#141413] text-[#FFFFFF] hover:bg-[#2A2A28] transition-colors duration-150 flex items-center justify-between text-left rounded-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-3">
            <svg className="w-4 h-4 text-[#FFFFFF] fill-current shrink-0" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.12em] text-[#FFFFFF]">
              {loadingProvider === "github" ? "CONNECTING..." : "CONTINUE WITH GITHUB"}
            </span>
          </div>
          <span className="text-[13px] font-sans text-[#FFFFFF] transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </button>
      </div>

      {/* 6. Footer & Security Readout */}
      <div className="pt-5 border-t border-[#E8E5DF] text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="w-[5px] h-[5px] rounded-full bg-[#3B4436]" />
          <p className="text-[9px] font-mono uppercase tracking-[0.14em] text-[#595854]">
            AUTHENTICATED VIA BETTER AUTH // 256-BIT ENCRYPTION
          </p>
        </div>
        <p className="text-[9px] font-sans text-[#595854]/80 mt-2 tracking-[0.02em]">
          By signing in you acknowledge the Northwatch{" "}
          <span className="underline cursor-default">Privacy Policy</span> &{" "}
          <span className="underline cursor-default">Terms</span>.
        </p>
      </div>
    </div>
  );
}

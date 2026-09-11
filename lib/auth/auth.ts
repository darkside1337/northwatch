import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db/client";
import * as schema from "@/lib/db/schema";
import { env } from "@/config/env";

const configuredHost = (() => {
  try {
    return new URL(env.BETTER_AUTH_URL).host;
  } catch {
    return "localhost:3000";
  }
})();

const allowedHosts = Array.from(
  new Set([
    "localhost:3000",
    "localhost:3001",
    "localhost:3333",
    "127.0.0.1:3000",
    "127.0.0.1:3001",
    "127.0.0.1:3333",
    configuredHost,
  ].filter(Boolean))
);

const trustedOrigins = Array.from(
  new Set(
    [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3333",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
      "http://127.0.0.1:3333",
      env.BETTER_AUTH_URL,
      env.NEXT_PUBLIC_APP_URL,
    ].filter((origin): origin is string => Boolean(origin))
  )
);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  baseURL: {
    allowedHosts,
    protocol: "auto",
    fallback: env.BETTER_AUTH_URL,
  },
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins,
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID || "",
      clientSecret: env.GOOGLE_CLIENT_SECRET || "",
    },
    github: {
      clientId: env.GITHUB_CLIENT_ID || "",
      clientSecret: env.GITHUB_CLIENT_SECRET || "",
    },
  },
  plugins: [nextCookies()],
});


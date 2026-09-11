# Better Auth Testing & Security Fixtures

Architecture, constraints, and conventions for establishing authenticated sessions and verifying route protection.

---

## 1. The Signed Session Cookie Requirement
- Better Auth cryptographically signs session cookies using HMAC-SHA256 keyed to `BETTER_AUTH_SECRET`.
- When requests hit `proxy.ts` edge checks, API route handlers, or Server Components calling `requireAuth()`, Better Auth strictly verifies the cookie signature against the secret.
- **Forbidden Shortcut**: Writing raw UUIDs into an `auth_session` cookie will fail cryptographic verification and trigger silent bounces to `/login`.

---

## 2. The `testUtils` Plugin
To generate authoritatively signed session cookies without mimicking library internals, Northwatch configures Better Auth's official `testUtils` plugin.

### Test Auth Configuration (`lib/auth/test-auth.ts`)
```ts
import { betterAuth } from "better-auth";
import { testUtils } from "better-auth/plugins";
import { authConfig } from "./auth-config";

export const testAuth = betterAuth({
  ...authConfig,
  baseURL: "http://localhost:3333",
  plugins: [testUtils()],
});
```

### Playwright Fixture Usage (`e2e/auth-helper.ts`)
```ts
export async function loginAsTestCollector(context: BrowserContext) {
  const email = "collector@northwatch.ch";
  // 1. Resolve or create user in database
  let existingUser = await db.query.user.findFirst({ where: eq(user.email, email) });
  if (!existingUser) {
    [existingUser] = await db.insert(user).values({ ... }).returning();
  }

  // 2. Delegate directly to Better Auth's official testing engine
  const ctx = await testAuth.$context;
  const { cookies } = await ctx.test.login({ userId: existingUser.id });

  // 3. Mount signed cookies into Playwright context
  await context.addCookies(cookies.map(c => ({
    name: c.name,
    value: c.value,
    domain: "localhost",
    path: c.path || "/",
    httpOnly: c.httpOnly ?? true,
    secure: c.secure ?? false,
    sameSite: "Lax",
  })));

  return existingUser;
}
```

---

## 3. The Subordination Contract for Helpers
- **Strict Delegation**: Project helpers (such as `loginAsTestCollector()`) are **only permitted** when they delegate 100% of session and cookie generation to Better Auth's official `testAuth.$context.test.login()` API.
- **No Helper Laundering**: Never write custom signing logic, decode/recode tokens, or hand-craft cookie values inside `e2e/auth-helper.ts`. Helpers must treat Better Auth as the sole black-box authority.

---

## 4. Dual-Plane Session Persistence
Establishing an authenticated session via `test.login()` operates on two planes simultaneously:
1. **Database Plane**: Inserts a real, valid session row into the `session` table in Postgres linked to `userId`.
2. **Client Plane**: Produces cryptographically signed HMAC cookies formatted for the browser.

*Test Isolation Consequence*: Calling `context.clearCookies()` resets the browser client plane, but leaves the database session row intact. When designing destructive or user-specific test scenarios, account for both planes.

---

## 5. Allowed Hosts & Trusted Origins
When running automated suites against a dedicated test port (e.g. `http://localhost:3333`), ensure `lib/auth/auth.ts` lists the port in `allowedHosts` and `trustedOrigins`:
```ts
trustedOrigins: [
  "http://localhost:3000",
  "http://localhost:3333",
  "http://127.0.0.1:3333",
],
```

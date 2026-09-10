import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { proxy, config } from "@/proxy";

describe("proxy edge auth gate", () => {
  it("defines the expected route matchers", () => {
    expect(config.matcher).toContain("/account/:path*");
    expect(config.matcher).toContain("/checkout/:path*");
  });

  it("redirects unauthenticated requests to /login with encoded redirectTo query", () => {
    const request = new NextRequest("http://localhost:3000/account/orders?status=active");
    const response = proxy(request);

    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("/login?redirectTo=%2Faccount%2Forders%3Fstatus%3Dactive");
  });

  it("passes requests through when standard session token cookie is present", () => {
    const request = new NextRequest("http://localhost:3000/account/orders", {
      headers: {
        cookie: "better-auth.session_token=test_valid_token",
      },
    });
    const response = proxy(request);

    // Passed through (not redirected)
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("passes requests through when secure session token cookie is present", () => {
    const request = new NextRequest("http://localhost:3000/checkout/shipping", {
      headers: {
        cookie: "__Secure-better-auth.session_token=test_secure_token",
      },
    });
    const response = proxy(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });
});

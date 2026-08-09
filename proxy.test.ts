import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

import { protectPrivateRoutes } from "./proxy";

describe("private application routes", () => {
  it("asks Clerk to protect onboarding before private content can render", async () => {
    const protect = vi.fn(async () => new Response());
    const auth = Object.assign(vi.fn(async () => ({ userId: null })), { protect });

    await protectPrivateRoutes(
      auth,
      new NextRequest("http://localhost/onboarding"),
    );

    expect(protect).toHaveBeenCalledOnce();
  });

  it("does not send public sign-in routes through the private guard", async () => {
    const protect = vi.fn(async () => new Response());
    const auth = Object.assign(vi.fn(async () => ({ userId: null })), { protect });

    await protectPrivateRoutes(
      auth,
      new NextRequest("http://localhost/sign-in"),
    );

    expect(protect).not.toHaveBeenCalled();
  });

  it.each(["sign-in", "sign-up"])("sends an authenticated visitor away from %s and into the dashboard", async (route) => {
    const protect = vi.fn(async () => new Response());
    const auth = Object.assign(vi.fn(async () => ({ userId: "user_123" })), { protect });

    const response = await protectPrivateRoutes(
      auth,
      new NextRequest(`http://localhost/${route}`),
    );

    expect(response?.headers.get("location")).toBe("http://localhost/dashboard");
    expect(protect).not.toHaveBeenCalled();
  });
});

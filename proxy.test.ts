import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

import { protectPrivateRoutes } from "./proxy";

describe("private application routes", () => {
  it("asks Clerk to protect onboarding before private content can render", async () => {
    const protect = vi.fn(async () => new Response());

    await protectPrivateRoutes(
      { protect },
      new NextRequest("http://localhost/onboarding"),
    );

    expect(protect).toHaveBeenCalledOnce();
  });

  it("does not send public sign-in routes through the private guard", async () => {
    const protect = vi.fn(async () => new Response());

    await protectPrivateRoutes(
      { protect },
      new NextRequest("http://localhost/sign-in"),
    );

    expect(protect).not.toHaveBeenCalled();
  });
});

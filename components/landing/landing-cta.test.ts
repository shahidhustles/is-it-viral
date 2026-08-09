import { describe, expect, it } from "vitest";

import { advisoryDisclosure, getLandingCta } from "./landing-cta";

describe("landing page primary action", () => {
  it("sends a signed-out visitor to sign in before Account DNA onboarding", () => {
    expect(getLandingCta({ isAuthLoaded: true, isSignedIn: false, accountDnaState: "missing" })).toMatchObject({
      href: "/sign-in?redirect_url=/onboarding",
      label: "Check my next reel",
    });
  });

  it("sends a signed-in owner without Account DNA to onboarding", () => {
    expect(getLandingCta({ isAuthLoaded: true, isSignedIn: true, accountDnaState: "missing" })).toMatchObject({
      href: "/onboarding",
      label: "Set up my audience",
    });
  });

  it("lets an owner with Account DNA continue to reel analysis", () => {
    expect(getLandingCta({ isAuthLoaded: true, isSignedIn: true, accountDnaState: "present" })).toMatchObject({
      href: "/analyze",
      label: "Review my next reel",
    });
  });

  it("does not route an owner while authentication or Account DNA is still loading", () => {
    expect(getLandingCta({ isAuthLoaded: false, isSignedIn: false, accountDnaState: "loading" })).toMatchObject({
      href: null,
      isLoading: true,
      label: "Checking your workspace…",
    });
    expect(getLandingCta({ isAuthLoaded: true, isSignedIn: true, accountDnaState: "loading" })).toMatchObject({
      href: null,
      isLoading: true,
    });
  });

  it("keeps the advisory boundary in user-visible landing copy", () => {
    expect(advisoryDisclosure).toContain("simulated second opinion");
    expect(advisoryDisclosure).toContain("not a promise of performance");
    expect(advisoryDisclosure).toContain("does not use or predict Instagram’s private ranking system");
    expect(advisoryDisclosure).toContain("You decide what to make and whether to post it");
  });
});

export type LandingCta = {
  href: string | null;
  isLoading: boolean;
  label: string;
  note: string;
};

type LandingCtaInput = {
  accountDnaState: "loading" | "missing" | "present";
  isAuthLoaded: boolean;
  isSignedIn: boolean;
};

export function getLandingCta({ accountDnaState, isAuthLoaded, isSignedIn }: LandingCtaInput): LandingCta {
  if (!isAuthLoaded || (isSignedIn && accountDnaState === "loading")) {
    return {
      href: null,
      isLoading: true,
      label: "Checking your workspace…",
      note: "Finding your saved audience details.",
    };
  }

  if (!isSignedIn) {
    return {
      href: "/sign-in?redirect_url=/onboarding",
      isLoading: false,
      label: "Check my next reel",
      note: "Start by telling us who you want to reach.",
    };
  }

  if (accountDnaState === "missing") {
    return {
      href: "/onboarding",
      isLoading: false,
      label: "Set up my audience",
      note: "A quick one-time setup makes every review more relevant.",
    };
  }

  return {
    href: "/analyze",
    isLoading: false,
    label: "Review my next reel",
    note: "Upload a draft and get a clearer edit list before you post.",
  };
}

export const advisoryDisclosure =
  "It’s a private second opinion for your reel. It cannot promise results or predict Instagram’s ranking system. You decide what to make and whether to post it.";

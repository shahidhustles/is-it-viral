"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { api } from "@/convex/_generated/api";

export function PostSignInRedirect() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const accountDna = useQuery(
    api.accountDna.getForCurrentOwner,
    isAuthenticated ? {} : "skip",
  );
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !isAuthenticated || accountDna === undefined) {
      return;
    }

    router.replace(accountDna ? "/dashboard" : "/onboarding");
  }, [accountDna, isAuthenticated, isLoading, router]);

  return <main className="grid min-h-screen place-items-center bg-background p-5 text-muted-foreground">Opening your workspace…</main>;
}

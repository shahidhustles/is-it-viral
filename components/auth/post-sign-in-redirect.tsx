"use client";

import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { api } from "@/convex/_generated/api";

export function PostSignInRedirect() {
  const accountDna = useQuery(api.accountDna.getForCurrentOwner);
  const router = useRouter();

  useEffect(() => {
    if (accountDna === undefined) {
      return;
    }

    router.replace(accountDna ? "/dashboard" : "/onboarding");
  }, [accountDna, router]);

  return <main className="grid min-h-screen place-items-center bg-background p-5 text-muted-foreground">Opening your workspace…</main>;
}

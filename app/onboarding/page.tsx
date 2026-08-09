import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AccountDnaOnboarding } from "@/components/onboarding/account-dna-onboarding";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/onboarding");
  }

  return <AccountDnaOnboarding />;
}

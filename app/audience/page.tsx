import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AccountDnaOnboarding } from "@/components/onboarding/account-dna-onboarding";
import { DashboardShell } from "@/components/dashboard/dashboard-home";

export default async function AudiencePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/audience");
  return (
    <DashboardShell>
      <AccountDnaOnboarding withinDashboard />
    </DashboardShell>
  );
}

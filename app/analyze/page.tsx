import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-home";
import { ReelAnalysisWorkspace } from "@/components/analysis/reel-analysis-workspace";

export default async function AnalyzePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/analyze");
  return <DashboardShell><ReelAnalysisWorkspace /></DashboardShell>;
}

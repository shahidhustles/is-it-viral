import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-home";

export default async function ReportsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/reports");
  return <DashboardShell><section className="max-w-2xl space-y-4"><h1 className="text-4xl font-semibold tracking-tight">Reports</h1><p className="text-lg leading-8 text-muted-foreground">Your completed reel analyses will appear here. Each report will retain the simulated cohort used for its outcome.</p></section></DashboardShell>;
}

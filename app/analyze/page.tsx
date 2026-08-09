import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-home";

export default async function AnalyzePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/analyze");
  return <DashboardShell><section className="max-w-2xl space-y-4"><h1 className="text-4xl font-semibold tracking-tight">Analyze a reel</h1><p className="text-lg leading-8 text-muted-foreground">Reel upload and Video DNA analysis are the next product milestone. Return to Home to check that your audience cohort is ready.</p></section></DashboardShell>;
}

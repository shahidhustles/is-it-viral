import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-home";
import { ReportList } from "@/components/analysis/report-list";

export default async function ReportsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/reports");
  return (
    <DashboardShell>
      <section className="space-y-8">
        <header className="max-w-2xl space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight">Reports</h1>
          <p className="text-lg leading-8 text-muted-foreground">
            Your completed reel analyses, each retaining the simulated cohort used for its outcome.
          </p>
        </header>
        <ReportList />
      </section>
    </DashboardShell>
  );
}

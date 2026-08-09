import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AnalysisReport } from "@/components/analysis/analysis-report";
import { DashboardShell } from "@/components/dashboard/dashboard-home";
import type { Id } from "@/convex/_generated/dataModel";

type AnalysisPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AnalysisPage({ params }: AnalysisPageProps) {
  const { userId } = await auth();
  const { id } = await params;
  if (!userId) redirect(`/sign-in?redirect_url=/analyses/${id}`);

  return (
    <DashboardShell>
      <AnalysisReport reportId={id as Id<"analysisReports">} />
    </DashboardShell>
  );
}

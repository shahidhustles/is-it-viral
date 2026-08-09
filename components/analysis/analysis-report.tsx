"use client";

import { useQuery } from "convex/react";
import { ArrowRight, FileQuestion, RotateCcw } from "lucide-react";
import Link from "next/link";

import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AnalysisReportProps = {
  reportId: Id<"analysisReports">;
};

export function AnalysisReport({ reportId }: AnalysisReportProps) {
  const report = useQuery(api.analysisReports.getForCurrentOwner, { reportId });

  if (report === undefined) return <AnalysisReportLoading />;
  if (report === null) return <AnalysisReportUnavailable />;

  const metrics = [
    { label: "Simulated reach", value: report.metrics.totalReach, detail: "cohort members exposed" },
    { label: "In target", value: report.metrics.inTargetReach, detail: "within your intended audience" },
    { label: "Adjacent reach", value: report.metrics.outOfTargetReach, detail: "outside the intended audience" },
    { label: "Simulated share rate", value: formatPercent(report.metrics.simulatedShareRate), detail: "exposed members who shared" },
    { label: "Cascade depth", value: `${report.metrics.cascadeDepth} rounds`, detail: "of a six-round maximum" },
  ];
  const sharedEvents = report.events.filter((event) => event.type === "shared").length;

  return (
    <div className="space-y-14">
      <header className="grid gap-8 border-b border-foreground pb-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{report.verdict}</h1>
          <p className="font-serif text-3xl leading-tight tracking-tight italic">{verdictInterpretation(report.verdict)}</p>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
            This is a simulated cohort outcome based on your saved Account DNA and Video DNA. It does not reproduce or predict Instagram’s private ranking system.
          </p>
        </div>
        <Link className={cn(buttonVariants({ size: "lg" }), "w-full lg:w-auto")} href="/analyze">
          Analyze another reel
          <ArrowRight aria-hidden="true" />
        </Link>
      </header>

      <section aria-labelledby="simulation-metrics" className="space-y-5">
        <div className="max-w-2xl space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight" id="simulation-metrics">Cohort outcome</h2>
          <p className="text-muted-foreground">A saved, deterministic pass through this cohort. Re-running the same cohort, Video DNA, and seed produces this report again.</p>
        </div>
        <dl className="grid gap-px border border-foreground bg-foreground sm:grid-cols-2 lg:grid-cols-5">
          {metrics.map((metric) => (
            <div className="min-h-40 bg-background p-6" key={metric.label}>
              <dt className="text-sm font-medium text-muted-foreground">{metric.label}</dt>
              <dd className="mt-6 text-3xl font-semibold tracking-tight">{metric.value}</dd>
              <p className="mt-2 text-sm text-muted-foreground">{metric.detail}</p>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="simulation-record" className="grid gap-8 border-y border-border py-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="max-w-2xl space-y-3">
          <h2 className="text-2xl font-semibold tracking-tight" id="simulation-record">Saved simulation record</h2>
          <p className="text-muted-foreground">
            {report.events.length} ordered exposure and action events were saved across {report.metrics.cascadeDepth} rounds. {sharedEvents} of those actions were simulated shares.
          </p>
          <Link className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-fit")} href="/reports">View all reports</Link>
        </div>
        <div className="space-y-3 border border-[var(--verified-edge)] bg-[var(--verified-wash)] p-5">
          <p className="text-sm font-medium">Saved {formatReportDate(report.createdAt)}</p>
          <p className="text-sm leading-6 text-muted-foreground">Cohort revision {report.cohortRevision} keeps this report tied to its original audience model.</p>
          <p className="text-sm leading-6 text-muted-foreground">Stop reason: {formatStopReason(report.stopReason)}.</p>
          <p className="text-sm leading-6 text-muted-foreground">Stable seed: {report.seed}</p>
        </div>
      </section>
    </div>
  );
}

function AnalysisReportLoading() {
  return (
    <section aria-busy="true" aria-label="Loading simulated cohort report" className="max-w-3xl space-y-6">
      <div className="h-12 w-3/4 animate-pulse bg-card" />
      <div className="h-24 animate-pulse bg-card" />
      <div className="grid gap-4 sm:grid-cols-2"><div className="h-40 animate-pulse bg-card" /><div className="h-40 animate-pulse bg-card" /></div>
    </section>
  );
}

function AnalysisReportUnavailable() {
  return (
    <section className="max-w-2xl space-y-5">
      <FileQuestion aria-hidden="true" className="size-8" />
      <h1 className="text-4xl font-semibold tracking-tight">This report is unavailable.</h1>
      <p className="text-lg leading-8 text-muted-foreground">It may not exist, may belong to another account, or its saved cohort outcome is no longer available. Return to your workspace to start a new analysis.</p>
      <Link className={buttonVariants({ size: "lg" })} href="/dashboard"><RotateCcw aria-hidden="true" />Return to workspace</Link>
    </section>
  );
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatStopReason(stopReason: "fewerThanTwoNewExposures" | "maximumRoundsReached") {
  return stopReason === "fewerThanTwoNewExposures"
    ? "fewer than two new cohort members were exposed"
    : "the six-round limit was reached";
}

function verdictInterpretation(verdict: "Breakout potential" | "Strong in target" | "Mixed signal" | "Stops early") {
  switch (verdict) {
    case "Breakout potential":
      return "A broad portion of this simulated cohort carried the signal beyond the initial viewers.";
    case "Strong in target":
      return "The simulated response stayed concentrated in the audience you defined.";
    case "Mixed signal":
      return "The simulated response was uneven, making this a cue to review before publishing.";
    case "Stops early":
      return "This cohort did not find enough next viewers to sustain the first pass.";
  }
}

function formatReportDate(createdAt: number) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(createdAt);
}

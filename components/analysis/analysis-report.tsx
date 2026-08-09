"use client";

import { useQuery } from "convex/react";
import { FileQuestion, RotateCcw } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { buttonVariants } from "@/components/ui/button";

type AnalysisReportProps = {
  reportId: Id<"analysisReports">;
};

const ContagionReplay = dynamic(
  () => import("@/components/analysis/contagion-replay").then((module) => module.ContagionReplay),
  { ssr: false, loading: () => <div aria-busy="true" className="h-120 animate-pulse border border-border bg-card" /> },
);

export function AnalysisReport({ reportId }: AnalysisReportProps) {
  const report = useQuery(api.analysisReports.getForCurrentOwner, { reportId });

  if (report === undefined) return <AnalysisReportLoading />;
  if (report === null) return <AnalysisReportUnavailable />;

  const metrics = [
    { label: "Overall takeaway", value: formatVerdict(report.verdict), detail: "how your reel may land" },
    { label: "Audience interest", value: report.metrics.totalReach, detail: "people likely to notice it" },
    { label: "Core audience", value: report.metrics.inTargetReach, detail: "people you most want to reach" },
    { label: "New viewers", value: report.metrics.outOfTargetReach, detail: "people who may discover it" },
    { label: "Share interest", value: formatPercent(report.metrics.simulatedShareRate), detail: "how likely it is to be shared" },
    { label: "How far it travels", value: `${report.metrics.cascadeDepth} steps`, detail: "how the response may spread" },
  ];
  return (
    <div className="space-y-14">
      <header className="border-b border-foreground pb-6">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Results of the reel</h1>
      </header>

      <ContagionReplay
        cascadeDepth={report.metrics.cascadeDepth}
        connections={report.connections}
        events={report.events}
        personas={report.personas}
      />

      <section aria-labelledby="simulation-metrics" className="space-y-5">
        <div className="max-w-2xl space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight" id="simulation-metrics">Your audience feedback</h2>
          <p className="text-muted-foreground">Use this feedback to choose your next edit. It cannot predict how Instagram will rank your reel.</p>
        </div>
        <dl className="grid gap-px border border-foreground bg-foreground sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((metric) => (
            <div className="min-h-40 bg-background p-6" key={metric.label}>
              <dt className="text-sm font-medium text-muted-foreground">{metric.label}</dt>
              <dd className="mt-6 text-2xl font-semibold tracking-tight">{metric.value}</dd>
              <p className="mt-2 text-sm text-muted-foreground">{metric.detail}</p>
            </div>
          ))}
        </dl>
      </section>

      {report.improvements ? (
        <section aria-labelledby="improvements-heading" className="space-y-5">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight" id="improvements-heading">Three edits to test first</h2>
            <p className="text-muted-foreground">These are practical changes to try with your audience. Results will always depend on the real post.</p>
          </div>
          <ol className="border-y border-border">
            {report.improvements.map((improvement) => (
              <li className="grid gap-5 border-b border-border py-6 last:border-b-0 md:grid-cols-[7rem_minmax(0,1fr)_minmax(0,1fr)]" key={`${improvement.timestampSeconds}-${improvement.suggestedEdit}`}>
                <p className="text-sm font-medium text-muted-foreground">{formatTimestamp(improvement.timestampSeconds)}</p>
                <div className="space-y-2"><h3 className="font-semibold">{improvement.opportunity}</h3><p className="leading-7 text-muted-foreground">{improvement.suggestedEdit}</p></div>
                <div className="space-y-2"><p className="text-sm font-medium">Why try it</p><p className="leading-7 text-muted-foreground">{improvement.expectedAudienceEffect}</p></div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {report.videoDnaExplanations ? <VideoDnaRecord videoDna={report.videoDna} explanations={report.videoDnaExplanations} /> : null}
    </div>
  );
}

function VideoDnaRecord({ videoDna, explanations }: { videoDna: { hook: number; clarity: number; pacing: number; credibility: number; audienceRelevance: number; shareTrigger: number }; explanations: { hook: string; clarity: string; pacing: string; credibility: string; audienceRelevance: string; shareTrigger: string; visualThemes: string[]; spokenThemes: string[] } }) {
  const signals = Object.entries(videoDna).map(([signal, score]) => ({ signal, score, explanation: explanations[signal as keyof typeof videoDna] }));
  return <section aria-labelledby="video-dna-heading" className="space-y-5"><div className="max-w-2xl space-y-2"><h2 className="text-2xl font-semibold tracking-tight" id="video-dna-heading">What we found in your reel</h2><p className="text-muted-foreground">The parts of your reel that shaped the feedback.</p></div><dl className="grid gap-px border border-border bg-border md:grid-cols-2">{signals.map(({ signal, score, explanation }) => <div className="bg-background p-5" key={signal}><dt className="flex justify-between gap-4 font-medium capitalize"><span>{signal.replace(/([A-Z])/g, " $1")}</span><span>{Math.round(score * 100)}%</span></dt><dd className="mt-2 leading-7 text-muted-foreground">{explanation}</dd></div>)}</dl><p className="text-sm leading-6 text-muted-foreground">What people see: {explanations.visualThemes.join(", ")}. What they hear: {explanations.spokenThemes.join(", ")}.</p></section>;
}

function AnalysisReportLoading() {
  return (
    <section aria-busy="true" aria-label="Loading reel feedback" className="max-w-3xl space-y-6">
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
      <p className="text-lg leading-8 text-muted-foreground">It may not exist, may belong to another account, or is no longer available. Return to your workspace to start a new review.</p>
      <Link className={buttonVariants({ size: "lg" })} href="/dashboard"><RotateCcw aria-hidden="true" />Return to workspace</Link>
    </section>
  );
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatVerdict(verdict: string) {
  if (verdict === "Breakout potential") return "Strong response";
  if (verdict === "Strong in target") return "Strong audience fit";
  if (verdict === "Mixed signal") return "Worth refining";
  if (verdict === "Stops early") return "Needs a stronger opening";
  return verdict;
}

function formatTimestamp(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

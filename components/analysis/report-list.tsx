"use client";

import { useQuery } from "convex/react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";

type ReportListProps = {
  limit?: number;
};

export function ReportList({ limit }: ReportListProps) {
  const reports = useQuery(api.analysisReports.listForCurrentOwner);

  if (reports === undefined) return <ReportListLoading />;

  const visibleReports = limit === undefined ? reports : reports.slice(0, limit);

  if (visibleReports.length === 0) {
    return (
      <div className="border-y border-border py-10 text-center">
        <p className="font-medium">No reel analyses yet.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          When your cohort is ready, analyze a draft to create the first report.
        </p>
      </div>
    );
  }

  return (
    <ul className="border-y border-border">
      {visibleReports.map((report) => (
        <li
          className="grid gap-4 border-b border-border py-5 last:border-b-0 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
          key={report._id}
        >
          <div className="grid gap-4 sm:grid-cols-4 sm:items-center">
            <div>
              <p className="font-semibold">Reel analysis</p>
              <p className="mt-1 text-sm text-muted-foreground">{formatDate(report.createdAt)}</p>
            </div>
            <ReportValue label="Verdict" value={report.verdict} />
            <ReportValue label="Simulated reach" value={String(report.metrics.totalReach)} />
            <ReportValue label="Share rate" value={formatPercent(report.metrics.simulatedShareRate)} />
          </div>
          <Link className={buttonVariants({ variant: "outline", size: "sm" })} href={`/analyses/${report._id}`}>
            View report
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ReportValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function ReportListLoading() {
  return (
    <div aria-busy="true" aria-label="Loading analyses" className="space-y-px border-y border-border">
      <div className="h-24 animate-pulse bg-card" />
      <div className="h-24 animate-pulse bg-card" />
    </div>
  );
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(timestamp);
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

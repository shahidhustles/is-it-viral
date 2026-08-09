"use client";

import { useMutation, useQuery } from "convex/react";
import { BarChart3, Fingerprint, Home, Settings, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button, buttonVariants } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/analyze", label: "Analyze a reel", icon: Sparkles },
  { href: "/audience", label: "Audience", icon: Users },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Account/settings", icon: Settings },
] as const;

export function DashboardHome() {
  const account = useQuery(api.accountDna.getForCurrentOwner);
  const retry = useMutation(api.accountDna.retryCohortGeneration);

  if (account === undefined) return <DashboardShell><DashboardSkeleton /></DashboardShell>;
  if (!account) return <DashboardShell><EmptyAccountState /></DashboardShell>;

  const { generation } = account;
  const canAnalyze = generation.status === "ready";
  const statusCopy = generation.status === "ready"
    ? "Your 100-person simulated cohort is ready for a reel."
    : generation.status === "failed"
      ? "We couldn’t finish building this audience cohort. Your Account DNA is still saved."
      : "We’re turning your Account DNA into a stable simulated cohort. This usually takes a moment.";

  return (
    <DashboardShell>
      <div className="space-y-10">
        <header className="max-w-3xl space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Decide what to test next.</h1>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">Use a saved audience model to examine a draft reel. The result is simulated guidance; your publishing decision remains yours.</p>
        </header>

        <section aria-labelledby="cohort-status-heading" className="grid gap-6 border border-foreground bg-card p-6 shadow-[var(--shadow-action)] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="space-y-3">
            <p className="text-sm font-medium">Audience cohort</p>
            <h2 className="text-2xl font-semibold tracking-tight" id="cohort-status-heading">{account.niche}</h2>
            <p className="max-w-2xl leading-7 text-muted-foreground">{statusCopy}</p>
            <CohortStatus account={account} />
          </div>
          {generation.status === "failed" ? (
            <Button onClick={() => void retry()} size="lg">Retry generation</Button>
          ) : canAnalyze ? (
            <Link className={buttonVariants({ size: "lg" })} href="/analyze">Analyze a reel</Link>
          ) : (
            <Button aria-describedby="analyze-unavailable" disabled size="lg">Analyze a reel</Button>
          )}
        </section>
        {!canAnalyze ? <p className="-mt-6 text-sm text-muted-foreground" id="analyze-unavailable">Analysis becomes available after this cohort is ready.</p> : null}

        <section aria-labelledby="recent-analyses-heading" className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-2"><h2 className="text-2xl font-semibold tracking-tight" id="recent-analyses-heading">Recent analyses</h2><p className="text-muted-foreground">Each report keeps the simulated cohort context it was created with.</p></div>
            <Link className={cn(buttonVariants({ variant: "outline", size: "sm" }), "hidden sm:inline-flex")} href="/reports">All reports</Link>
          </div>
          <div className="border-y border-border py-10 text-center"><p className="font-medium">No reel analyses yet.</p><p className="mt-2 text-sm text-muted-foreground">When your cohort is ready, analyze a draft to create the first report.</p></div>
        </section>
      </div>
    </DashboardShell>
  );
}

function CohortStatus({ account }: { account: { generation: { status: "pending" | "ready" | "failed"; error: string | null }; cohort: { inTargetCount: number; adjacentCount: number } } }) {
  const { generation, cohort } = account;
  if (generation.status === "ready") return <p className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--verified-edge)] bg-[var(--verified-wash)] px-3 py-1.5 text-sm font-medium">Ready · {cohort.inTargetCount} in target, {cohort.adjacentCount} adjacent</p>;
  if (generation.status === "failed") return <p className="text-sm font-medium text-destructive">Generation failed. {generation.error}</p>;
  return <p className="text-sm font-medium">Generating cohort…</p>;
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-background lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="border-b border-border bg-card lg:min-h-screen lg:border-r lg:border-b-0">
        <div className="flex h-full flex-col p-5">
          <Link className="flex items-center gap-3 font-semibold tracking-tight" href="/dashboard">
            <span className="flex size-8 items-center justify-center rounded-[var(--radius-control)] border border-foreground bg-primary">
              <Fingerprint aria-hidden="true" className="size-4" />
            </span>
            Is It Viral
          </Link>
          <nav aria-label="Application" className="mt-8 flex gap-1 overflow-x-auto lg:flex-col">
            {navigation.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;

              return (
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 shrink-0 items-center gap-3 rounded-[var(--radius-control)] px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
                    isActive
                      ? "border border-foreground bg-primary text-foreground shadow-[var(--shadow-action)]"
                      : "border border-transparent hover:bg-background",
                  )}
                  href={href}
                  key={href}
                >
                  <Icon aria-hidden="true" className="size-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
      <div className="px-5 py-10 sm:px-8 md:py-14">
        <div className="mx-auto max-w-[var(--page-max-width)]">{children}</div>
      </div>
    </main>
  );
}

function DashboardSkeleton() { return <div className="max-w-3xl space-y-6" aria-label="Loading creator home"><div className="h-12 w-3/4 animate-pulse bg-card" /><div className="h-52 animate-pulse border border-border bg-card" /></div>; }
function EmptyAccountState() { return <section className="max-w-2xl space-y-5"><h1 className="text-4xl font-semibold tracking-tight">Start with your audience record.</h1><p className="text-lg leading-8 text-muted-foreground">Account DNA gives each simulation a stable context. You can update it later when your audience focus changes.</p><Link className={buttonVariants({ size: "lg" })} href="/onboarding">Create Account DNA</Link></section>; }

"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { BarChart3, ChevronUp, Home, LogOut, Sparkles, Users, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button, buttonVariants } from "@/components/ui/button";
import { ReportList } from "@/components/analysis/report-list";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/analyze", label: "Analyze a reel", icon: Sparkles },
  { href: "/audience", label: "Audience", icon: Users },
  { href: "/reports", label: "Reports", icon: BarChart3 },
] as const;

const activeNavigationClass = "border border-foreground shadow-[var(--shadow-action)] data-active:!bg-primary data-active:!text-foreground data-active:hover:!bg-primary data-active:hover:!text-foreground";

export function DashboardHome() {
  const account = useQuery(api.accountDna.getForCurrentOwner);
  const retry = useMutation(api.accountDna.retryCohortGeneration);

  if (account === undefined) return <DashboardShell><DashboardSkeleton /></DashboardShell>;
  if (!account) return <DashboardShell><EmptyAccountState /></DashboardShell>;

  const { generation } = account;
  const canAnalyze = generation.status === "ready";
  const statusCopy = generation.status === "ready"
    ? "Your audience profile is ready for a reel."
    : generation.status === "failed"
      ? "We couldn’t finish setting up your audience profile. Your details are still saved."
      : "We’re getting your audience profile ready. This usually takes a moment.";

  return (
    <DashboardShell>
      <div className="space-y-10">
        <header className="max-w-3xl space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Decide what to test next.</h1>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">Review a draft reel with your saved audience details and get clear ideas for your next edit.</p>
        </header>

        <section aria-labelledby="cohort-status-heading" className="grid gap-6 border border-foreground bg-card p-6 shadow-[var(--shadow-action)] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="space-y-3">
            <p className="text-sm font-medium">Your audience</p>
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
        {!canAnalyze ? <p className="-mt-6 text-sm text-muted-foreground" id="analyze-unavailable">You can review a reel once your audience profile is ready.</p> : null}

        <section aria-labelledby="recent-analyses-heading" className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-2"><h2 className="text-2xl font-semibold tracking-tight" id="recent-analyses-heading">Recent reviews</h2><p className="text-muted-foreground">Each report keeps the audience details used for that review.</p></div>
            <Link className={cn(buttonVariants({ variant: "outline", size: "sm" }), "hidden sm:inline-flex")} href="/reports">All reports</Link>
          </div>
          <ReportList limit={5} />
        </section>
      </div>
    </DashboardShell>
  );
}

function CohortStatus({ account }: { account: { generation: { status: "pending" | "ready" | "failed"; error: string | null }; cohort: { inTargetCount: number; adjacentCount: number } } }) {
  const { generation } = account;
  if (generation.status === "ready") return <p className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--verified-edge)] bg-[var(--verified-wash)] px-3 py-1.5 text-sm font-medium">Ready to review</p>;
  if (generation.status === "failed") return <p className="text-sm font-medium text-destructive">Setup needs another try.</p>;
  return <p className="text-sm font-medium">Getting your audience profile ready…</p>;
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { user } = useUser();
  const userName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Your account";
  const initials = userName
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <SidebarProvider>
      <Sidebar className="border-border bg-card" collapsible="offcanvas">
        <SidebarHeader className="p-5">
          <Link className="flex items-center gap-3 font-semibold tracking-tight" href="/dashboard">
            <span className="flex size-8 items-center justify-center rounded-[var(--radius-control)] border border-foreground bg-primary">
              <Zap aria-hidden="true" className="size-4" />
            </span>
            Is It Viral
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu aria-label="Application">
            {navigation.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;

              return (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    isActive={isActive}
                    render={<Link href={href} />}
                    className={cn(
                      "h-11 rounded-[var(--radius-control)]",
                      isActive && activeNavigationClass,
                    )}
                  >
                    <Icon aria-hidden="true" />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-5 pt-0">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger render={<SidebarMenuButton size="lg" className="h-12 rounded-[var(--radius-control)] data-open:bg-background" />}>
                  <Avatar>
                    <AvatarImage alt={userName} src={user?.imageUrl} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <span>{userName}</span>
                  <ChevronUp aria-hidden="true" className="ml-auto" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="right" sideOffset={8}>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>{userName}</DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => void signOut({ redirectUrl: "/" })}>
                      <LogOut aria-hidden="true" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center border-b border-border px-5 md:hidden">
          <SidebarTrigger />
          <span className="ml-3 font-semibold tracking-tight">Is It Viral</span>
        </header>
        <div className="px-5 py-10 sm:px-8 md:py-14">
          <div className="mx-auto max-w-[var(--page-max-width)]">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function DashboardSkeleton() { return <div className="max-w-3xl space-y-6" aria-label="Loading creator home"><div className="h-12 w-3/4 animate-pulse bg-card" /><div className="h-52 animate-pulse border border-border bg-card" /></div>; }
function EmptyAccountState() { return <section className="max-w-2xl space-y-5"><h1 className="text-4xl font-semibold tracking-tight">Start with your audience.</h1><p className="text-lg leading-8 text-muted-foreground">Tell us who you want to reach so every reel review feels relevant. You can update it whenever your focus changes.</p><Link className={buttonVariants({ size: "lg" })} href="/onboarding">Set up my audience</Link></section>; }

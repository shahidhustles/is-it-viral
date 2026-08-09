import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-home";
import { buttonVariants } from "@/components/ui/button";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/settings");
  return <DashboardShell><section className="max-w-2xl space-y-4"><h1 className="text-4xl font-semibold tracking-tight">Account/settings</h1><p className="text-lg leading-8 text-muted-foreground">Audience context belongs in its own workspace, so it stays easy to review before you replace a cohort.</p><Link className={buttonVariants({ variant: "outline" })} href="/audience">Open Audience</Link></section></DashboardShell>;
}

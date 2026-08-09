import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-home";
import { buttonVariants } from "@/components/ui/button";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/settings");
  return <DashboardShell><section className="max-w-2xl space-y-4"><h1 className="text-4xl font-semibold tracking-tight">Your audience</h1><p className="text-lg leading-8 text-muted-foreground">Review or update the details that keep your reel feedback relevant.</p><Link className={buttonVariants({ variant: "outline" })} href="/audience">Manage my audience</Link></section></DashboardShell>;
}

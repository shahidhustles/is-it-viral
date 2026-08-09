import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { DashboardHome } from "@/components/dashboard/dashboard-home";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/dashboard");
  }

  return <DashboardHome />;
}

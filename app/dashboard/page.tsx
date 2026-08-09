import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/dashboard");
  }

  return (
    <main className="min-h-screen bg-background px-5 py-12 sm:px-8 md:py-20">
      <section className="mx-auto max-w-2xl space-y-6">
        <p className="text-sm font-medium">Account DNA saved</p>
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Your audience record is ready for the next reel.</h1>
        <p className="max-w-xl text-lg leading-8 text-muted-foreground">
          Future assessments will use this stable simulated cohort as advisory context. Your publishing decision remains yours.
        </p>
        <Link className={buttonVariants({ size: "lg" })} href="/analyze">
          Analyze a reel
        </Link>
      </section>
    </main>
  );
}

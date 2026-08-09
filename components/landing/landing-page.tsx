"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import {
  ArrowRight,
  CirclePlay,
  Fingerprint,
  Network,
  ScanLine,
  Sparkles,
  Waypoints,
} from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { BrandMark } from "@/components/brand-mark";
import { TextAnimate } from "@/components/ui/text-animate";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

import { FeatureCarousel, type FeatureCarouselItem } from "./feature-carousel";
import { advisoryDisclosure, getLandingCta, type LandingCta } from "./landing-cta";


const demoVideoUrl = "https://www.youtube.com/watch?v=mp1UWvE5WUk";

const landingNavigation = [
  { href: "#first-audience", label: "First audience" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#your-call", label: "Your call" },
] as const;

const processSteps = [
  {
    icon: Fingerprint,
    title: "Tell us who you want to reach",
    description:
      "Describe your content and the people you want it to reach. Set this up once, then use it for every draft.",
    detail: "Your first audience",
  },
  {
    icon: ScanLine,
    title: "Give your reel a first audience",
    description:
      "Your draft gets a private test audience based on the people you want to reach, before you share it for real.",
    detail: "See the first reaction",
  },
  {
    icon: Waypoints,
    title: "Edit before the real post goes live",
    description:
      "See what grabs attention, where the message gets muddy, and what to change before you hit publish.",
    detail: "Know what to edit next",
  },
] as const;

const evidencePanels: readonly FeatureCarouselItem[] = [
  {
    icon: Network,
    label: "Set your audience",
    title: "Start with the people you want to reach.",
    body: "Your topic, audience, language, and region give every reel review the right context.",
    accent: "Built around your content and audience",
    preview: "cohort",
  },
  {
    icon: ScanLine,
    label: "Read the reel",
    title: "We review what people see and hear.",
    body: "We look at your visuals and spoken words to find what is clear, what grabs attention, and what needs work.",
    accent: "Your opening, message, pace, and audience fit",
    preview: "video-dna",
  },
  {
    icon: CirclePlay,
    label: "Test the reaction",
    title: "See how your reel could land.",
    body: "Get a private preview of how the right people may respond, then use it to sharpen your next edit.",
    accent: "Helpful guidance, not a promise of results",
    preview: "replay",
  },
] as const;

export function LandingPage() {
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const accountDna = useQuery(api.accountDna.getForCurrentOwner);
  const cta = getLandingCta({
    accountDnaState: accountDna === undefined ? "loading" : accountDna ? "present" : "missing",
    isAuthLoaded,
    isSignedIn: Boolean(isSignedIn),
  });

  return (
    <main className="overflow-x-hidden bg-background" id="top">
      <LandingNavigation cta={cta} />

      <section className="relative isolate overflow-hidden border-b border-foreground bg-[radial-gradient(circle_at_84%_22%,rgba(163,230,53,0.2),transparent_32rem)]" aria-labelledby="landing-heading">
        <CohortField />
        <div className="mx-auto grid max-w-[var(--page-max-width)] gap-12 px-5 py-14 sm:px-8 md:py-20 lg:grid-cols-[minmax(0,0.98fr)_minmax(28rem,0.82fr)] lg:items-center lg:gap-16 lg:py-24">
          <div className="max-w-2xl">
            <h1 className="max-w-[11ch] text-balance text-5xl font-semibold tracking-[-0.035em] sm:text-6xl lg:text-7xl" id="landing-heading">
              See how your audience could <em className="font-[family-name:var(--font-interpretation)] font-medium italic tracking-[-0.04em]"><TextAnimate text="react" type="calmInUp" /></em> before you post.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
              Get a private preview of how your audience may respond, then decide what to tighten before you post.
            </p>
            <div className="mt-9 max-w-md space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <LandingAction className="w-full" cta={cta} size="lg" />
                <DemoVideoAction className="w-full" />
              </div>
              <p className="text-sm leading-6 text-muted-foreground">{cta.note}</p>
            </div>
          </div>

          <SimulationPreview />
        </div>
      </section>

      <section className="scroll-mt-20 border-b border-border bg-card" id="first-audience" aria-labelledby="process-heading">
        <div className="mx-auto max-w-[var(--page-max-width)] px-5 py-16 sm:px-8 md:py-24">
          <div className="max-w-2xl">
            <h2 className="text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-4xl" id="process-heading">
              Give every reel a first audience.
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-8 text-muted-foreground">
              See how the people you want to reach may react before you publish.
            </p>
          </div>

          <ol className="mt-12 grid divide-y divide-border border-y border-border lg:grid-cols-3 lg:divide-x lg:divide-y-0">
            {processSteps.map((step) => {
              const Icon = step.icon;
              return (
                <li className="px-0 py-8 first:pt-8 lg:px-8 lg:first:pl-0 lg:last:pr-0" key={step.title}>
                  <Icon aria-hidden="true" className="size-5" strokeWidth={1.75} />
                  <h3 className="mt-8 text-2xl font-semibold tracking-[-0.025em]">{step.title}</h3>
                  <p className="mt-3 max-w-sm leading-7 text-muted-foreground">{step.description}</p>
                  <p className="mt-6 text-sm font-medium">{step.detail}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="scroll-mt-20 border-b border-border" id="how-it-works" aria-labelledby="evidence-heading">
        <div className="mx-auto max-w-[var(--page-max-width)] px-5 py-16 sm:px-8 md:py-24">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-20">
            <div>
              <h2 className="text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-4xl" id="evidence-heading">
                How it works.
              </h2>
              <p className="mt-5 max-w-md text-lg leading-8 text-muted-foreground">
                Turn a draft reel into clear feedback you can use before you post.
              </p>
              <div className="mt-8 border-l border-foreground pl-5">
                <p className="font-medium">You’re still the creative director.</p>
                <p className="mt-2 leading-7 text-muted-foreground">Keep what sounds like you. Use the feedback to make the edit you believe in.</p>
              </div>
            </div>

            <FeatureCarousel features={evidencePanels} />
          </div>
        </div>
      </section>

      <section className="scroll-mt-20 bg-foreground text-background" id="your-call" aria-labelledby="advisory-heading">
        <div className="mx-auto grid max-w-[var(--page-max-width)] gap-10 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
          <div>
            <Sparkles aria-hidden="true" className="size-6" strokeWidth={1.75} />
            <h2 className="mt-8 max-w-md text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-4xl" id="advisory-heading">
              Post with a plan, not a hunch.
            </h2>
          </div>
          <div>
            <p className="max-w-2xl text-xl leading-8 text-white/78">{advisoryDisclosure}</p>
            <p className="mt-5 text-sm leading-6 text-white/78">Tell us who you want to reach, upload a short draft, and get an edit list.</p>
            <LandingAction className="mt-8 bg-primary hover:bg-primary" cta={cta} size="lg" />
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-[var(--page-max-width)] flex-col gap-4 px-5 py-7 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>Is It Viral · Clearer reel feedback before you post.</p>
          <FooterAction cta={cta} />
        </div>
      </footer>
    </main>
  );
}

function LandingNavigation({ cta }: { cta: LandingCta }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <nav aria-label="Main navigation" className="mx-auto flex max-w-[var(--page-max-width)] items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link className="flex items-center gap-3 font-semibold tracking-tight" href="#top">
          <BrandMark className="size-8 rounded-[var(--radius-control)]" />
          Is It Viral
        </Link>
        <div className="hidden items-center gap-1 lg:flex">
          {landingNavigation.map((item) => (
            <Link className="rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
        <LandingAction cta={cta} size="sm" />
      </nav>
    </header>
  );
}

function SimulationPreview() {
  return (
    <figure aria-labelledby="simulation-preview-title" className="relative border border-foreground bg-[var(--analysis-paper)] p-4 shadow-[var(--shadow-action)] sm:p-5">
      <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
        <div>
          <p className="text-sm font-medium" id="simulation-preview-title">A first audience for your draft.</p>
          <p className="mt-1 text-sm text-muted-foreground">Get a private preview before you share the real post.</p>
        </div>
        <span className="shrink-0 rounded-full border border-foreground px-3 py-1 text-xs font-medium">Before you post</span>
      </div>

      <div className="relative mt-5 aspect-[1.12] overflow-hidden border border-border bg-background" aria-label="Illustrative depiction of a draft review">
        <svg aria-hidden="true" className="absolute inset-x-0 top-0 h-[72%] w-full" fill="none" viewBox="0 0 440 260">
          <path d="M70 150L185 88L296 138L372 69" stroke="var(--border)" strokeWidth="2" />
          <path d="M70 150L185 88L296 138" stroke="var(--graphite)" strokeWidth="3" />
          <path d="M296 138L372 69" stroke="var(--graphite)" strokeDasharray="4 7" strokeWidth="3" />
          <LandingGraphNode cx={70} cy={150} state="filled" />
          <LandingGraphNode cx={185} cy={88} state="filled" />
          <LandingGraphNode cx={296} cy={138} state="mint" />
          <LandingGraphNode cx={372} cy={69} state="open" />
        </svg>
        <div className="absolute bottom-3 left-3 right-3 grid grid-cols-3 gap-2 border border-border bg-background p-3 text-xs">
          <Metric label="First look" value="Your opening" />
          <Metric label="Their reaction" value="Your message" />
          <Metric label="Your next edit" value="What to fix" />
        </div>
      </div>

      <figcaption className="mt-4 text-xs leading-5 text-muted-foreground">You get a short edit list you can act on.</figcaption>
    </figure>
  );
}

function LandingGraphNode({ cx, cy, state }: { cx: number; cy: number; state: "filled" | "mint" | "open" }) {
  const fill = { filled: "var(--graphite)", mint: "var(--verified-edge)", open: "var(--studio-white)" }[state];
  return <circle cx={cx} cy={cy} fill={fill} r={state === "filled" ? 10 : 8} stroke={state === "open" ? "var(--border)" : "var(--graphite)"} strokeWidth="2" />;
}

function LandingAction({ className, cta, size }: { className?: string; cta: LandingCta; size: "sm" | "lg" }) {
  const actionClassName = cn(buttonVariants({ size }), className);
  if (cta.isLoading || !cta.href) {
    return <span aria-disabled="true" className={cn(actionClassName, "cursor-wait opacity-70")}>{cta.label}</span>;
  }

  return <Link className={actionClassName} href={cta.href}>{cta.label}<ArrowRight aria-hidden="true" /></Link>;
}

function DemoVideoAction({ className }: { className?: string }) {
  const actionClassName = buttonVariants({ className, size: "lg", variant: "outline" });

  if (!demoVideoUrl) {
    return <button aria-disabled="true" className={actionClassName} disabled title="Demo video coming soon" type="button"><CirclePlay aria-hidden="true" />Watch Live demo</button>;
  }

  return <a className={actionClassName} href={demoVideoUrl} rel="noreferrer" target="_blank"><CirclePlay aria-hidden="true" />Watch demo</a>;
}

function FooterAction({ cta }: { cta: LandingCta }) {
  if (cta.isLoading || !cta.href) {
    return <span aria-disabled="true" className="w-fit font-medium text-muted-foreground">{cta.label}</span>;
  }

  return <Link className="w-fit font-medium text-foreground underline underline-offset-4" href={cta.href}>{cta.label}</Link>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><p className="text-muted-foreground">{label}</p><p className="mt-1 text-sm font-semibold text-foreground">{value}</p></div>;
}

function CohortField() {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden h-full w-[62%] text-foreground/10 lg:block" fill="none" viewBox="0 0 760 620">
      <path d="M54 146L184 87L291 156L395 66L524 133L680 52M184 87L126 286L291 156L448 311L524 133M126 286L276 435L448 311L605 479M54 446L126 286M276 435L178 571M448 311L539 563M605 479L714 589" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="54" cy="146" fill="currentColor" r="6" /><circle cx="184" cy="87" fill="currentColor" r="6" /><circle cx="291" cy="156" fill="currentColor" r="6" /><circle cx="395" cy="66" fill="currentColor" r="6" /><circle cx="524" cy="133" fill="currentColor" r="6" /><circle cx="680" cy="52" fill="currentColor" r="6" /><circle cx="126" cy="286" fill="currentColor" r="6" /><circle cx="448" cy="311" fill="currentColor" r="6" /><circle cx="276" cy="435" fill="currentColor" r="6" /><circle cx="605" cy="479" fill="currentColor" r="6" />
    </svg>
  );
}

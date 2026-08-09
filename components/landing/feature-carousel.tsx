"use client";

import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type FeatureCarouselItem = {
  accent: string;
  body: string;
  icon: LucideIcon;
  label: string;
  preview: "cohort" | "video-dna" | "replay";
  title: string;
};

type FeatureCarouselProps = {
  features: readonly FeatureCarouselItem[];
};

/**
 * An image-free adaptation of Cult UI's documented Feature Carousel behavior.
 * The product has no approved customer imagery, so each slide renders an
 * explicitly illustrative, code-native product concept instead.
 */
export function FeatureCarousel({ features }: FeatureCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselId = useId();
  const shouldReduceMotion = useReducedMotion();
  const activeFeature = features[activeIndex];
  const Icon = activeFeature.icon;

  const moveTo = (index: number) => {
    setActiveIndex((index + features.length) % features.length);
  };

  return (
    <section aria-label="How Is It Viral helps" className="border-y border-border">
      <div className="grid gap-7 py-7 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div>
          <p aria-live="polite" className="text-sm font-medium">{activeFeature.label} · {activeIndex + 1} of {features.length}</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.025em]">{activeFeature.title}</h3>
          <p className="mt-3 max-w-xl leading-7 text-muted-foreground">{activeFeature.body}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button aria-label="Show previous way this helps" onClick={() => moveTo(activeIndex - 1)} size="icon-sm" variant="outline">
            <ChevronLeft aria-hidden="true" />
          </Button>
          <Button aria-label="Show next way this helps" onClick={() => moveTo(activeIndex + 1)} size="icon-sm" variant="outline">
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden border border-foreground bg-card p-4 shadow-[var(--shadow-action)] sm:p-6">
        <div className="flex items-center justify-between border-b border-border pb-4 text-sm">
          <span className="inline-flex items-center gap-2 font-medium"><Icon aria-hidden="true" className="size-4" /> A clearer way to review a draft</span>
          <span className="text-muted-foreground">Built around your reel</span>
        </div>
        <div aria-labelledby={`${carouselId}-tab-${activeIndex}`} className="relative mt-5 min-h-72" id={`${carouselId}-panel`} role="tabpanel">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              animate={{ filter: "blur(0px)", opacity: 1, x: 0 }}
              className="absolute inset-0"
              exit={shouldReduceMotion ? undefined : { filter: "blur(3px)", opacity: 0, x: -18 }}
              initial={shouldReduceMotion ? false : { filter: "blur(3px)", opacity: 0, x: 18 }}
              key={activeFeature.preview}
              transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
            >
              <FeaturePreview type={activeFeature.preview} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div aria-label="Choose how Is It Viral helps" className="mt-5 flex flex-wrap gap-2" role="tablist">
        {features.map((feature, index) => (
          <button
            aria-controls={`${carouselId}-panel`}
            aria-selected={index === activeIndex}
            className={cn(
              "min-h-10 rounded-[var(--radius-control)] border px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
              index === activeIndex ? "border-foreground bg-primary text-foreground" : "border-border bg-background hover:border-foreground",
            )}
            key={feature.label}
            onClick={() => moveTo(index)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") {
                event.preventDefault();
                moveTo(index + 1);
              }
              if (event.key === "ArrowLeft") {
                event.preventDefault();
                moveTo(index - 1);
              }
              if (event.key === "Home") {
                event.preventDefault();
                moveTo(0);
              }
              if (event.key === "End") {
                event.preventDefault();
                moveTo(features.length - 1);
              }
            }}
            role="tab"
            id={`${carouselId}-tab-${index}`}
            tabIndex={index === activeIndex ? 0 : -1}
            type="button"
          >
            {feature.label}
          </button>
        ))}
      </div>
      <p className="mt-4 border-l border-border pl-4 text-sm leading-6 text-muted-foreground">{activeFeature.accent}</p>
    </section>
  );
}

function FeaturePreview({ type }: { type: FeatureCarouselItem["preview"] }) {
  if (type === "cohort") return <CohortPreview />;
  if (type === "video-dna") return <VideoDnaPreview />;
  return <ReplayPreview />;
}

function CohortPreview() {
  return (
    <div className="grid h-full gap-6 md:grid-cols-[minmax(0,1fr)_11rem]">
      <div className="relative min-h-56 border border-border bg-background">
        <svg aria-hidden="true" className="absolute inset-0 size-full" fill="none" viewBox="0 0 500 260">
          <path d="M52 121L141 66L242 120L348 62L444 111M52 121L133 207L242 120L346 211L444 111M141 66L133 207M348 62L346 211" stroke="var(--border)" strokeWidth="1.5" />
          <CarouselGraphNode cx={52} cy={121} state="mint" />
          <CarouselGraphNode cx={141} cy={66} state="mint" />
          <CarouselGraphNode cx={242} cy={120} state="mint" />
          <CarouselGraphNode cx={348} cy={62} state="mint" />
          <CarouselGraphNode cx={444} cy={111} state="mint" />
          <CarouselGraphNode cx={133} cy={207} state="cream" />
          <CarouselGraphNode cx={346} cy={211} state="cream" />
        </svg>
        <p className="absolute bottom-3 left-3 bg-background px-2 py-1 text-xs text-muted-foreground">Feedback that stays relevant</p>
      </div>
      <dl className="divide-y divide-border border-y border-border">
        <DataRow label="Your focus" value="Set once" />
        <DataRow label="Your people" value="Saved context" />
        <DataRow label="Each draft" value="Same lens" />
        <DataRow label="Your goal" value="Stay consistent" />
      </dl>
    </div>
  );
}

function VideoDnaPreview() {
  const signals = [
    ["Opening", "Does it make people want to keep watching?"],
    ["Message", "Is the point easy to follow?"],
    ["Pace", "Does the edit drag or rush?"],
    ["Fit", "Does this feel made for your people?"],
  ] as const;

  return (
    <div className="grid h-full gap-6 md:grid-cols-[11rem_minmax(0,1fr)]">
      <div className="relative min-h-56 overflow-hidden border border-foreground bg-foreground p-4 text-background">
        <div className="absolute inset-x-4 top-4 h-px bg-white/30" />
        <p className="mt-5 text-xs text-white/65">00:00–00:03</p>
        <p className="mt-8 text-xl font-semibold leading-7">“Try this before your next reel.”</p>
        <span className="absolute bottom-4 left-4 rounded-full border border-white/40 px-2 py-1 text-xs">Draft frame</span>
      </div>
      <div className="space-y-3">
        {signals.map(([label, detail]) => (
          <div className="grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-3 border-b border-border pb-3" key={label}>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-sm text-muted-foreground">{detail}</p>
          </div>
        ))}
        <p className="pt-2 text-sm leading-6 text-muted-foreground">You get the useful parts, in plain English.</p>
      </div>
    </div>
  );
}

function ReplayPreview() {
  return (
    <div className="grid h-full gap-6 md:grid-cols-[minmax(0,1fr)_11rem]">
      <div className="relative min-h-56 border border-border bg-background">
        <svg aria-hidden="true" className="absolute inset-0 size-full" fill="none" viewBox="0 0 500 260">
          <path d="M51 130H153L234 61L325 131L445 84M153 130L233 201L325 131L407 201" stroke="var(--border)" strokeWidth="1.5" />
          <path d="M51 130H153L234 61L325 131" stroke="var(--graphite)" strokeWidth="2.5" />
          <path d="M153 130L233 201L325 131L407 201" stroke="var(--graphite)" strokeDasharray="3 5" strokeWidth="2.5" />
          <CarouselGraphNode cx={51} cy={130} state="filled" />
          <CarouselGraphNode cx={153} cy={130} state="filled" />
          <CarouselGraphNode cx={234} cy={61} state="filled" />
          <CarouselGraphNode cx={325} cy={131} state="filled" />
          <CarouselGraphNode cx={445} cy={84} state="open" />
          <CarouselGraphNode cx={233} cy={201} state="open" />
          <CarouselGraphNode cx={407} cy={201} state="open" />
        </svg>
        <p className="absolute bottom-3 left-3 bg-background px-2 py-1 text-xs text-muted-foreground">What happens next</p>
      </div>
      <ol className="space-y-3 border-l border-border pl-4 text-sm">
        <li><span className="font-medium">See the verdict</span><p className="mt-1 text-muted-foreground">A clear read, not a mystery score</p></li>
        <li><span className="font-medium">Get the why</span><p className="mt-1 text-muted-foreground">Understand what helped or hurt</p></li>
        <li><span className="font-medium">Make your edit</span><p className="mt-1 text-muted-foreground">Start where the change matters most</p></li>
      </ol>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between py-3 text-sm"><dt className="text-muted-foreground">{label}</dt><dd className="font-semibold">{value}</dd></div>;
}

function CarouselGraphNode({ cx, cy, state }: { cx: number; cy: number; state: "filled" | "mint" | "cream" | "open" }) {
  const fill = { filled: "var(--graphite)", mint: "var(--verified-edge)", cream: "var(--analysis-paper)", open: "var(--studio-white)" }[state];
  return <circle cx={cx} cy={cy} fill={fill} r="9" stroke={state === "open" ? "var(--border)" : "var(--graphite)"} strokeWidth="2" />;
}

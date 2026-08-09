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
    <section aria-label="How Is It Viral works" className="border-y border-border">
      <div className="grid gap-7 py-7 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div>
          <p aria-live="polite" className="text-sm font-medium">{activeFeature.label} · {activeIndex + 1} of {features.length}</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.025em]">{activeFeature.title}</h3>
          <p className="mt-3 max-w-xl leading-7 text-muted-foreground">{activeFeature.body}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button aria-label="Show previous step" onClick={() => moveTo(activeIndex - 1)} size="icon-sm" variant="outline">
            <ChevronLeft aria-hidden="true" />
          </Button>
          <Button aria-label="Show next step" onClick={() => moveTo(activeIndex + 1)} size="icon-sm" variant="outline">
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden border border-foreground bg-card p-4 shadow-[var(--shadow-action)] sm:p-6">
        <div className="flex items-center justify-between border-b border-border pb-4 text-sm">
          <span className="inline-flex items-center gap-2 font-medium"><Icon aria-hidden="true" className="size-4" /> How your verdict is built</span>
          <span className="text-muted-foreground">Illustrative walkthrough</span>
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

      <div aria-label="Choose a walkthrough step" className="mt-5 flex flex-wrap gap-2" role="tablist">
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
        <p className="absolute bottom-3 left-3 bg-background px-2 py-1 text-xs text-muted-foreground">A private, simulated first audience</p>
      </div>
      <dl className="divide-y divide-border border-y border-border">
        <DataRow label="Your niche" value="Your topic" />
        <DataRow label="Your audience" value="Your people" />
        <DataRow label="Language + region" value="Your context" />
        <DataRow label="First audience" value="100 people" />
      </dl>
    </div>
  );
}

function VideoDnaPreview() {
  const signals = [
    ["Every second", "A visual frame is sampled"],
    ["What’s said", "The audio is transcribed"],
    ["Your language", "Read in the context you set"],
    ["The review", "Hook, clarity, pace, and fit"],
  ] as const;

  return (
    <div className="grid h-full gap-6 md:grid-cols-[11rem_minmax(0,1fr)]">
      <div className="relative min-h-56 overflow-hidden border border-foreground bg-foreground p-4 text-background">
        <p className="text-xs text-white/65">Your draft, sampled every second</p>
        <div className="mt-5 grid grid-cols-4 gap-2" aria-hidden="true">
          {["00:00", "00:01", "00:02", "00:03"].map((second, index) => (
            <div className="h-16 border border-white/35 p-1.5" key={second}>
              <div className={cn("h-full", index === 1 ? "bg-primary" : "bg-white/20")} />
              <p className="mt-1 text-xs text-white/65">{second}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 border-t border-white/30 pt-3">
          <p className="text-xs text-white/65">Spoken words</p>
          <p className="mt-2 text-sm font-medium leading-6">“Try this before your next reel.”</p>
        </div>
        <span className="absolute bottom-4 left-4 rounded-full border border-white/40 px-2 py-1 text-xs">Video + audio</span>
      </div>
      <div className="space-y-3">
        {signals.map(([label, detail]) => (
          <div className="grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-3 border-b border-border pb-3" key={label}>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-sm text-muted-foreground">{detail}</p>
          </div>
        ))}
        <p className="pt-2 text-sm leading-6 text-muted-foreground">The verdict uses every sampled visual and the full transcript.</p>
      </div>
    </div>
  );
}

function ReplayPreview() {
  return (
    <div className="grid h-full gap-6 md:grid-cols-[minmax(0,1fr)_11rem]">
      <div className="relative min-h-56 border border-border bg-background">
        <svg aria-hidden="true" className="absolute inset-0 size-full" fill="none" viewBox="0 0 500 260">
          <path d="M92 130H194L294 72L405 122M194 130L294 188L405 122" stroke="var(--border)" strokeWidth="1.5" />
          <path d="M92 130H194L294 72L405 122" stroke="var(--graphite)" strokeWidth="2.5" />
          <path d="M194 130L294 188L405 122" stroke="var(--graphite)" strokeDasharray="3 5" strokeWidth="2.5" />
          {[74, 88, 102, 116, 130, 144, 158, 172, 186, 200].map((cy, index) => (
            <circle cx="64" cy={cy} fill={index < 4 ? "var(--graphite)" : "var(--studio-white)"} key={cy} r="5" stroke="var(--graphite)" strokeWidth="1.5" />
          ))}
          <CarouselGraphNode cx={194} cy={130} state="filled" />
          <CarouselGraphNode cx={294} cy={72} state="mint" />
          <CarouselGraphNode cx={294} cy={188} state="open" />
          <CarouselGraphNode cx={405} cy={122} state="mint" />
        </svg>
        <p className="absolute bottom-3 left-3 bg-background px-2 py-1 text-xs text-muted-foreground">First 10 viewers → next people → simulated verdict</p>
      </div>
      <ol className="space-y-3 border-l border-border pl-4 text-sm">
        <li><span className="font-medium">First pass</span><p className="mt-1 text-muted-foreground">10 simulated people get the first look</p></li>
        <li><span className="font-medium">Next pass</span><p className="mt-1 text-muted-foreground">Their simulated engagement decides what moves on</p></li>
        <li><span className="font-medium">Verdict</span><p className="mt-1 text-muted-foreground">Up to six rounds produce your simulated result</p></li>
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

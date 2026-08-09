"use client";

import { Check, Circle } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

export type LoadingState = {
  text: string;
  detail: string;
};

type MultiStepLoaderProps = {
  loading: boolean;
  loadingStates: LoadingState[];
  value: number;
  title: string;
};

export function MultiStepLoader({ loading, loadingStates, value, title }: MultiStepLoaderProps) {
  const prefersReducedMotion = useReducedMotion();
  const activeIndex = Math.min(Math.max(value, 0), loadingStates.length - 1);

  return (
    <AnimatePresence>
      {loading ? (
        <motion.section
          animate={{ opacity: 1 }}
          aria-busy="true"
          aria-live="polite"
          aria-labelledby="analysis-progress-title"
          aria-modal="true"
          className="fixed inset-0 z-[100] grid place-items-center bg-background/95 px-5 py-10"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          role="dialog"
          transition={{ duration: prefersReducedMotion ? 0 : 0.22 }}
        >
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl border border-foreground bg-[var(--analysis-paper)] p-6 shadow-[var(--shadow-action)] sm:p-8"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            transition={{ delay: prefersReducedMotion ? 0 : 0.08, duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="border-b border-border pb-6">
              <h2 className="text-2xl font-semibold tracking-tight" id="analysis-progress-title">{title}</h2>
              <p className="mt-2 max-w-md leading-7 text-muted-foreground">Keep this page open while we prepare the saved simulation. Your publishing decision remains yours.</p>
            </div>

            <ol className="mt-6 space-y-1" aria-label="Analysis progress">
              {loadingStates.map((state, index) => {
                const isComplete = index < activeIndex;
                const isActive = index === activeIndex;
                const isUpcoming = index > activeIndex;

                return (
                  <motion.li
                    animate={{ opacity: isUpcoming ? 0.42 : 1, x: isActive ? 4 : 0 }}
                    className={cn("grid grid-cols-[2.75rem_minmax(0,1fr)] gap-3 py-3", isActive && "bg-background px-3 -mx-3")}
                    key={state.text}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                  >
                    <span className={cn("relative mt-0.5 grid size-7 place-items-center rounded-full border", isComplete && "border-[var(--verified-edge)] bg-[var(--verified-wash)]", isActive && "size-10 border-foreground bg-primary", isUpcoming && "border-muted-foreground/60 bg-background")}>
                      {isComplete ? <Check aria-hidden="true" className="size-4" strokeWidth={2.5} /> : isActive ? <><motion.span aria-hidden="true" animate={prefersReducedMotion ? undefined : { opacity: [0.8, 0], scale: [1, 1.55] }} className="absolute inset-0 rounded-full border-2 border-foreground" transition={{ duration: 1.1, ease: "easeOut", repeat: Infinity }} /><span aria-hidden="true" className="relative size-3.5 rounded-full bg-foreground" /></> : <Circle aria-hidden="true" className="size-3 text-muted-foreground" strokeWidth={1.5} />}
                    </span>
                    <span className="min-w-0">
                      <span className={cn("block font-medium", isActive && "text-foreground")}>{state.text}</span>
                      {isActive ? <span className="mt-1 block text-sm leading-6 text-muted-foreground">{state.detail}</span> : null}
                    </span>
                  </motion.li>
                );
              })}
            </ol>
          </motion.div>
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}

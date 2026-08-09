import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

type StepIndicatorProps = {
  currentStep: number;
  steps: readonly string[];
};

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <ol aria-label="Account DNA setup progress" className="grid gap-3 sm:grid-cols-3">
      {steps.map((step, index) => {
        const isCurrent = index === currentStep;
        const isComplete = index < currentStep;

        return (
          <li
            className={cn(
              "flex items-center gap-3 border-t pt-3 text-sm",
              isCurrent || isComplete
                ? "border-foreground text-foreground"
                : "border-border text-muted-foreground",
            )}
            key={step}
          >
            <span
              aria-hidden="true"
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                isCurrent
                  ? "border-foreground bg-primary text-primary-foreground"
                  : isComplete
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background",
              )}
            >
              {isComplete ? <Check className="size-3.5" strokeWidth={2.5} /> : index + 1}
            </span>
            <span className="font-medium">{step}</span>
          </li>
        );
      })}
    </ol>
  );
}

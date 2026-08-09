import { Check, ChevronDown, Users } from "lucide-react";
import Link from "next/link";

import { AccountDnaRecord } from "@/components/audience/account-dna-record";
import { Button, buttonVariants } from "@/components/ui/button";

type AudienceSegment = "inTarget" | "adjacent";

type Archetype = {
  archetypeIndex: number;
  name: string;
  audienceSegment: AudienceSegment;
  interests: string[];
  ocean: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  personas: Array<{
    personaIndex: number;
    ocean: {
      openness: number;
      conscientiousness: number;
      extraversion: number;
      agreeableness: number;
      neuroticism: number;
    };
    connectionCount: number;
  }>;
};

type AudienceLedgerProps = {
  account: {
    niche: string;
    intendedAudience: string;
    primaryLanguage: string;
    region: string;
    cohort: {
      archetypeCount: number;
      personaCount: number;
      inTargetCount: number;
      adjacentCount: number;
      networkConnectionCount: number;
    };
    generation: {
      status: "pending" | "ready" | "failed";
      error: string | null;
    };
    archetypes: Archetype[];
  };
  isRetrying: boolean;
  retryError: string | null;
  onEdit: () => void;
  onRetry: () => void;
};

export function AudienceLedger({ account, isRetrying, retryError, onEdit, onRetry }: AudienceLedgerProps) {
  if (account.generation.status === "pending") {
    return <CohortBuildingState account={account} onEdit={onEdit} />;
  }

  if (account.generation.status === "failed") {
    return (
      <CohortFailureState
        account={account}
        isRetrying={isRetrying}
        retryError={retryError}
        onEdit={onEdit}
        onRetry={onRetry}
      />
    );
  }

  return <ReadyAudienceLedger account={account} onEdit={onEdit} />;
}

function ReadyAudienceLedger({ account, onEdit }: Pick<AudienceLedgerProps, "account" | "onEdit">) {
  return (
    <section aria-labelledby="audience-heading" className="space-y-10">
      <header className="max-w-3xl space-y-3">
        <p className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Check aria-hidden="true" className="size-4" />
          Audience profile ready
        </p>
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl" id="audience-heading">
          Your audience is ready.
        </h1>
        <p className="text-lg leading-8 text-muted-foreground">
          Your saved details are ready to guide your reel reviews. They help you make better edits, not predict reach.
        </p>
        <Link className={buttonVariants({ size: "lg" })} href="/analyze">Analyze a reel</Link>
      </header>

      <CohortComposition />

      <section aria-labelledby="archetypes-heading" className="space-y-5">
        <div className="max-w-3xl space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight" id="archetypes-heading">A closer look at your audience.</h2>
          <p className="text-muted-foreground">Open a group to see the interests and traits that shape the feedback.</p>
        </div>
        <div className="grid items-start gap-4 lg:grid-cols-2">
          {account.archetypes.map((archetype) => (
            <ArchetypeDisclosure archetype={archetype} key={archetype.archetypeIndex} />
          ))}
        </div>
      </section>

      <AccountDnaRecord account={account} onEdit={onEdit} />
    </section>
  );
}

function CohortComposition() {
  return (
    <section aria-labelledby="cohort-composition-heading" className="border border-foreground bg-card p-6 shadow-[var(--shadow-action)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight" id="cohort-composition-heading">Your feedback is built around the people you want to reach.</h2>
          <p className="leading-7 text-muted-foreground">It considers your core audience and people who may discover your content through shared interests.</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--verified-edge)] bg-[var(--verified-wash)] px-3 py-1.5 text-sm font-medium">
          <Users aria-hidden="true" className="size-4" />
          Ready to review
        </span>
      </div>
      <dl className="mt-6 grid divide-y divide-border border-y border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <CompositionMeasure label="Core audience" value="People you want to reach" />
        <CompositionMeasure label="Wider interest" value="People likely to discover it" />
        <CompositionMeasure label="Audience view" value="Built for your content" />
      </dl>
    </section>
  );
}

function CompositionMeasure({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 py-4 sm:px-5 sm:first:pl-0 sm:last:pr-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function ArchetypeDisclosure({ archetype }: { archetype: Archetype }) {
  const segmentLabel = archetype.audienceSegment === "inTarget" ? "Core audience" : "Wider interest";

  return (
    <details className="group border border-border bg-card open:border-foreground">
      <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 p-5 focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden">
        <span className="space-y-1">
          <span className="block font-semibold tracking-tight">{archetype.name}</span>
          <span className="block text-sm text-muted-foreground">Audience group</span>
          <span className="block max-w-72 truncate text-sm text-muted-foreground">{archetype.interests.join(" · ")}</span>
        </span>
        <span className="flex items-center gap-3">
          <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium">{segmentLabel}</span>
          <ChevronDown aria-hidden="true" className="size-4 transition-transform group-open:rotate-180" />
        </span>
      </summary>
      <div className="space-y-6 border-t border-border p-5">
        <div className="space-y-2">
          <h3 className="font-medium">Shared interests</h3>
          <p className="text-sm leading-6 text-muted-foreground">{archetype.interests.join(" · ")}</p>
        </div>
      </div>
    </details>
  );
}

function CohortBuildingState({ account, onEdit }: Pick<AudienceLedgerProps, "account" | "onEdit">) {
  return (
    <section aria-labelledby="audience-heading" className="max-w-3xl space-y-8">
      <div className="space-y-3">
        <p className="font-medium">Preparing your audience</p>
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl" id="audience-heading">Your audience details are saved.</h1>
        <p className="text-lg leading-8 text-muted-foreground">We’re getting your audience profile ready for reel reviews. You can still review or update your details.</p>
      </div>
      <AccountDnaRecord account={account} onEdit={onEdit} />
    </section>
  );
}

function CohortFailureState({ account, isRetrying, retryError, onEdit, onRetry }: Pick<AudienceLedgerProps, "account" | "isRetrying" | "retryError" | "onEdit" | "onRetry">) {
  return (
    <section aria-labelledby="audience-heading" className="max-w-3xl space-y-8">
      <div className="space-y-3">
        <p className="font-medium text-destructive">Your audience needs another try</p>
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl" id="audience-heading">Your audience details are still saved.</h1>
        <p className="text-lg leading-8 text-muted-foreground">We could not finish preparing your audience profile. Try again or update your details.</p>
      </div>
      <div className="border border-destructive bg-destructive/10 p-5" role="alert">
        <p className="font-medium">Your audience profile is not ready yet.</p>
        <p className="mt-1 text-sm leading-6">Please try again.</p>
        {retryError ? <p className="mt-3 text-sm leading-6">{retryError}</p> : null}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button disabled={isRetrying} onClick={onRetry} size="lg">{isRetrying ? "Trying again…" : "Try again"}</Button>
        <Button disabled={isRetrying} onClick={onEdit} size="lg" variant="outline">Edit audience details</Button>
      </div>
      <AccountDnaRecord account={account} onEdit={onEdit} />
    </section>
  );
}

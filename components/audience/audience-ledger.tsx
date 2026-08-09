import { Check, ChevronDown, Users } from "lucide-react";

import { AccountDnaRecord } from "@/components/audience/account-dna-record";
import { Button } from "@/components/ui/button";

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

const traitLabels = [
  ["Open", "openness"],
  ["Conscientious", "conscientiousness"],
  ["Extraverted", "extraversion"],
  ["Agreeable", "agreeableness"],
  ["Sensitive", "neuroticism"],
] as const;

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
          Audience cohort ready
        </p>
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl" id="audience-heading">
          Your simulated audience, on record.
        </h1>
        <p className="text-lg leading-8 text-muted-foreground">
          These 100 personas are a stable model built from your Account DNA. They help assess audience fit; they are not real followers or a prediction of platform reach.
        </p>
      </header>

      <CohortComposition account={account} />

      <section aria-labelledby="archetypes-heading" className="space-y-5">
        <div className="max-w-3xl space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight" id="archetypes-heading">The people represented in this cohort.</h2>
          <p className="text-muted-foreground">Open an archetype to inspect the ten simulated personas it represents.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {account.archetypes.map((archetype) => (
            <ArchetypeDisclosure archetype={archetype} key={archetype.archetypeIndex} />
          ))}
        </div>
      </section>

      <AccountDnaRecord account={account} onEdit={onEdit} />
    </section>
  );
}

function CohortComposition({ account }: Pick<AudienceLedgerProps, "account">) {
  return (
    <section aria-labelledby="cohort-composition-heading" className="border border-foreground bg-card p-6 shadow-[var(--shadow-action)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight" id="cohort-composition-heading">{account.cohort.personaCount} simulated personas, built from your Account DNA.</h2>
          <p className="leading-7 text-muted-foreground">Seven in-target archetypes anchor the cohort. Three adjacent archetypes make room for nearby interest and discovery.</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--verified-edge)] bg-[var(--verified-wash)] px-3 py-1.5 text-sm font-medium">
          <Users aria-hidden="true" className="size-4" />
          Stable cohort
        </span>
      </div>
      <dl className="mt-6 grid divide-y divide-border border-y border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <CompositionMeasure label="In target" value="7 archetypes · 70 personas" />
        <CompositionMeasure label="Adjacent" value="3 archetypes · 30 personas" />
        <CompositionMeasure label="Archetypes" value={`${account.cohort.archetypeCount} profiles`} />
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
  const segmentLabel = archetype.audienceSegment === "inTarget" ? "In target" : "Adjacent";

  return (
    <details className="group border border-border bg-card open:border-foreground">
      <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 p-5 focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden">
        <span className="space-y-1">
          <span className="block font-semibold tracking-tight">{archetype.name}</span>
          <span className="block text-sm text-muted-foreground">10 simulated personas</span>
          <span className="block max-w-72 truncate text-sm text-muted-foreground">{archetype.interests.join(" · ")}</span>
          <TraitFingerprint ocean={archetype.ocean} />
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
        <div className="space-y-3">
          <h3 className="font-medium">Trait profile</h3>
          <TraitProfile ocean={archetype.ocean} />
        </div>
        <TraitRanges personas={archetype.personas} />
        <PersonaList personas={archetype.personas} />
      </div>
    </details>
  );
}

function TraitProfile({ ocean }: { ocean: Archetype["ocean"] }) {
  return (
    <dl className="grid grid-cols-5 gap-2">
      {traitLabels.map(([label, trait]) => <TraitMeasure key={trait} label={label} value={ocean[trait]} />)}
    </dl>
  );
}

function TraitFingerprint({ ocean }: { ocean: Archetype["ocean"] }) {
  const profile = traitLabels
    .map(([label, trait]) => `${label} ${Math.round(ocean[trait] * 100)}`)
    .join(" · ");

  return (
    <span aria-label={`Trait profile: ${profile}`} className="block text-xs text-muted-foreground">
      {profile}
    </span>
  );
}

function TraitRanges({ personas }: { personas: Archetype["personas"] }) {
  return (
    <div className="space-y-3">
      <h3 className="font-medium">Variation across the ten personas</h3>
      <dl className="grid grid-cols-5 gap-2">
        {traitLabels.map(([label, trait]) => {
          const values = personas.map((persona) => persona.ocean[trait]);
          const range = values.length === 0
            ? "—"
            : `${Math.round(Math.min(...values) * 100)}–${Math.round(Math.max(...values) * 100)}`;

          return <TraitMeasure key={trait} label={label} value={range} />;
        })}
      </dl>
    </div>
  );
}

function PersonaList({ personas }: { personas: Archetype["personas"] }) {
  return (
    <div className="space-y-3 border-t border-border pt-4">
      <h3 className="font-medium">The ten personas represented</h3>
      <ol className="grid gap-2 sm:grid-cols-2">
        {personas.map((persona) => (
          <li className="flex items-center justify-between gap-3 border border-border bg-background px-3 py-2 text-sm" key={persona.personaIndex}>
            <span>Persona {String(persona.personaIndex + 1).padStart(2, "0")}</span>
            <span className="text-muted-foreground">{persona.connectionCount} local links</span>
          </li>
        ))}
      </ol>
      <p className="text-sm leading-6 text-muted-foreground">Each variation is connected to nearby personas in the cohort. Those links are used when a reel simulation runs.</p>
    </div>
  );
}

function TraitMeasure({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs leading-4 text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{typeof value === "number" ? Math.round(value * 100) : value}</dd>
    </div>
  );
}

function CohortBuildingState({ account, onEdit }: Pick<AudienceLedgerProps, "account" | "onEdit">) {
  return (
    <section aria-labelledby="audience-heading" className="max-w-3xl space-y-8">
      <div className="space-y-3">
        <p className="font-medium">Building your audience cohort</p>
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl" id="audience-heading">Your Account DNA is saved.</h1>
        <p className="text-lg leading-8 text-muted-foreground">We’re creating the ten archetypes and 100 connected simulated personas for this audience. You can review the saved record while it is prepared.</p>
      </div>
      <AccountDnaRecord account={account} onEdit={onEdit} />
    </section>
  );
}

function CohortFailureState({ account, isRetrying, retryError, onEdit, onRetry }: Pick<AudienceLedgerProps, "account" | "isRetrying" | "retryError" | "onEdit" | "onRetry">) {
  return (
    <section aria-labelledby="audience-heading" className="max-w-3xl space-y-8">
      <div className="space-y-3">
        <p className="font-medium text-destructive">Cohort generation needs another try</p>
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl" id="audience-heading">Your Account DNA is still saved.</h1>
        <p className="text-lg leading-8 text-muted-foreground">We could not finish building its audience cohort. Retry the generation or update the record before trying again.</p>
      </div>
      <div className="border border-destructive bg-destructive/10 p-5" role="alert">
        <p className="font-medium">The cohort was not generated.</p>
        <p className="mt-1 text-sm leading-6">{account.generation.error ?? "Please try generation again."}</p>
        {retryError ? <p className="mt-3 text-sm leading-6">{retryError}</p> : null}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button disabled={isRetrying} onClick={onRetry} size="lg">{isRetrying ? "Retrying generation…" : "Retry generation"}</Button>
        <Button disabled={isRetrying} onClick={onEdit} size="lg" variant="outline">Edit Account DNA</Button>
      </div>
      <AccountDnaRecord account={account} onEdit={onEdit} />
    </section>
  );
}

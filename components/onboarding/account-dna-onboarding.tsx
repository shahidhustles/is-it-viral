"use client";

import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, ArrowRight, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";

import { StepIndicator } from "@/components/onboarding/step-indicator";
import { AccountDnaRecordRow } from "@/components/audience/account-dna-record";
import { AudienceLedger } from "@/components/audience/audience-ledger";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";

const steps = ["Account focus", "Audience context", "Review and save"] as const;
const languages = ["English", "Hindi", "Spanish", "Portuguese", "French", "Arabic"];

type AccountDnaForm = {
  niche: string;
  intendedAudience: string;
  primaryLanguage: string;
  region: string;
};

type FieldName = keyof AccountDnaForm;
type FieldErrors = Partial<Record<FieldName, string>>;

const emptyForm: AccountDnaForm = {
  niche: "",
  intendedAudience: "",
  primaryLanguage: "",
  region: "",
};

const demoForm: AccountDnaForm = {
  niche: "Developer hack club hosting hackathons and workshops",
  intendedAudience:
    "Developers, students, and aspiring builders in San Francisco who want to join hackathons and hands-on workshops.",
  primaryLanguage: "English",
  region: "San Francisco",
};

export function AccountDnaOnboarding({ withinDashboard = false }: { withinDashboard?: boolean }) {
  const router = useRouter();
  const savedAccountDna = useQuery(api.accountDna.getForCurrentOwner);
  const audienceLedger = useQuery(api.accountDna.getAudienceLedgerForCurrentOwner);
  const saveAccountDna = useMutation(api.accountDna.saveAccountDna);
  const retryCohortGeneration = useMutation(api.accountDna.retryCohortGeneration);
  const [form, setForm] = useState<AccountDnaForm>(emptyForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [step, setStep] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isReplaceDialogOpen, setIsReplaceDialogOpen] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  if (savedAccountDna === undefined) {
    return <OnboardingLoadingState />;
  }

  if (savedAccountDna && !isEditing) {
    if (audienceLedger === undefined || !audienceLedger) {
      return <OnboardingLoadingState />;
    }

    return (
      <OnboardingFrame currentStep={2} showSteps={false} withinDashboard={withinDashboard}>
        <AudienceLedger
          account={audienceLedger}
          isRetrying={isRetrying}
          retryError={retryError}
          onEdit={() => beginEditing(savedAccountDna)}
          onRetry={() => void retryGeneration()}
        />
      </OnboardingFrame>
    );
  }

  function beginEditing(account: NonNullable<typeof savedAccountDna>) {
    setForm({
      niche: account.niche,
      intendedAudience: account.intendedAudience,
      primaryLanguage: account.primaryLanguage,
      region: account.region,
    });
    setErrors({});
    setSaveError(null);
    setStep(0);
    setIsEditing(true);
  }

  async function retryGeneration() {
    setIsRetrying(true);
    setRetryError(null);
    try {
      await retryCohortGeneration();
    } catch (error) {
      setRetryError(error instanceof Error ? error.message : "We could not restart cohort generation. Please try again.");
    } finally {
      setIsRetrying(false);
    }
  }

  const updateField = (field: FieldName, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSaveError(null);
  };

  const useDemoSetup = () => {
    setForm(demoForm);
    setErrors({});
    setSaveError(null);
  };

  const continueToNextStep = () => {
    const nextErrors = validateStep(form, step);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      setStep((current) => Math.min(current + 1, steps.length - 1));
    }
  };

  const requestSave = () => {
    const nextErrors = validateStep(form, 1);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setStep(nextErrors.niche ? 0 : 1);
      return;
    }

    if (savedAccountDna) {
      setIsReplaceDialogOpen(true);
      return;
    }

    void persistAccountDna(false);
  };

  const persistAccountDna = async (replace: boolean) => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await saveAccountDna({ ...form, replace });
      router.replace("/dashboard");
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "We could not save your Account DNA. Please try again.",
      );
      setIsReplaceDialogOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <OnboardingFrame currentStep={step} withinDashboard={withinDashboard}>
      <section aria-labelledby="account-dna-heading" className="space-y-8">
        <div className="space-y-3">
          <h1 id="account-dna-heading" className="text-4xl font-semibold tracking-tight md:text-5xl">
            {step === 0
              ? "Describe your account focus."
              : step === 1
                ? "Add the audience context."
                : "Review your Account DNA."}
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
            {step === 0
              ? "Start with the subject area that anchors the content you want to evaluate."
              : step === 1
                ? "This context makes the synthetic cohort a better representation of the audience you intend to reach."
                : "You remain in control of how to use this simulated audience record."}
          </p>
          {step === 0 ? (
            <Button disabled={isSaving} onClick={useDemoSetup} variant="outline">
              Use demo setup
            </Button>
          ) : null}
        </div>

        <div
          aria-live="polite"
          className="sr-only"
        >
          Step {step + 1} of {steps.length}: {steps[step]}
        </div>

        <div
          className="min-h-72 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-200"
          key={step}
        >
          {step === 0 ? (
            <AccountFocusStep
              disabled={isSaving}
              error={errors.niche}
              niche={form.niche}
              onChange={(value) => updateField("niche", value)}
            />
          ) : step === 1 ? (
            <AudienceContextStep
              disabled={isSaving}
              errors={errors}
              form={form}
              onChange={updateField}
            />
          ) : (
            <ReviewStep form={form} />
          )}
        </div>

        {saveError ? (
          <div aria-live="assertive" className="border border-destructive bg-destructive/10 p-4 text-sm text-foreground" role="alert">
            <p className="font-medium">Your Account DNA was not saved.</p>
            <p className="mt-1">{saveError}</p>
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
          {step > 0 ? (
            <Button
              disabled={isSaving}
              onClick={() => setStep((current) => current - 1)}
              variant="outline"
            >
              <ArrowLeft aria-hidden="true" />
              Back
            </Button>
          ) : (
            <span />
          )}

          {step < steps.length - 1 ? (
            <Button disabled={isSaving} onClick={continueToNextStep}>
              Continue
              <ArrowRight aria-hidden="true" />
            </Button>
          ) : (
            <Button disabled={isSaving} onClick={requestSave}>
              {isSaving ? "Saving Account DNA…" : "Create Account DNA"}
            </Button>
          )}
        </div>
      </section>

      <AlertDialog onOpenChange={setIsReplaceDialogOpen} open={isReplaceDialogOpen}>
        <AlertDialogContent className="rounded-[var(--radius-container)] border border-foreground bg-background shadow-[var(--shadow-action)]">
          <AlertDialogHeader>
            <AlertDialogTitle>Replace the saved audience cohort?</AlertDialogTitle>
            <AlertDialogDescription>
              Saving these edits creates a new Account DNA cohort. Past analyses keep their saved results, but future assessments use the replacement cohort.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="rounded-b-[var(--radius-container)] bg-card">
            <AlertDialogCancel disabled={isSaving}>Keep current cohort</AlertDialogCancel>
            <AlertDialogAction disabled={isSaving} onClick={() => void persistAccountDna(true)}>
              {isSaving ? "Replacing cohort…" : "Replace cohort"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </OnboardingFrame>
  );
}

function OnboardingFrame({ children, currentStep, showSteps = true, withinDashboard }: { children: ReactNode; currentStep: number; showSteps?: boolean; withinDashboard: boolean }) {
  const content = showSteps ? (
    <div className="mx-auto grid max-w-[var(--page-max-width)] gap-12 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-20">
      <div className="space-y-10">
        <StepIndicator currentStep={currentStep} steps={steps} />
        {children}
      </div>
      <LedgerNote />
    </div>
  ) : (
    <div className="mx-auto max-w-[var(--page-max-width)]">{children}</div>
  );

  if (withinDashboard) {
    return content;
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-[var(--page-max-width)] items-center gap-3 px-5 sm:px-8">
          <span className="flex size-8 items-center justify-center rounded-[var(--radius-control)] border border-foreground bg-primary">
            <Zap aria-hidden="true" className="size-4" />
          </span>
          <span className="font-semibold tracking-tight">Is It Viral</span>
          <span className="text-sm text-muted-foreground">Account DNA</span>
        </div>
      </header>

      <div className="px-5 py-12 sm:px-8 md:py-20">{content}</div>
    </main>
  );
}

function AccountFocusStep({ disabled, error, niche, onChange }: {
  disabled: boolean;
  error?: string;
  niche: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="max-w-2xl space-y-3">
      <Label htmlFor="niche">What is your account’s niche?</Label>
      <Input
        aria-describedby={error ? "niche-error" : "niche-description"}
        aria-invalid={Boolean(error)}
        disabled={disabled}
        id="niche"
        maxLength={100}
        onChange={(event) => onChange(event.target.value)}
        placeholder="e.g. Evidence-based strength training"
        value={niche}
      />
      <p className="text-sm leading-6 text-muted-foreground" id="niche-description">
        Use the topic that best describes the content strategy you want to assess.
      </p>
      <FieldError id="niche-error" message={error} />
    </div>
  );
}

function AudienceContextStep({ disabled, errors, form, onChange }: {
  disabled: boolean;
  errors: FieldErrors;
  form: AccountDnaForm;
  onChange: (field: FieldName, value: string) => void;
}) {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-3">
        <Label htmlFor="intended-audience">Who are you trying to reach?</Label>
        <Textarea
          aria-describedby={errors.intendedAudience ? "intended-audience-error" : "intended-audience-description"}
          aria-invalid={Boolean(errors.intendedAudience)}
          disabled={disabled}
          id="intended-audience"
          maxLength={1000}
          onChange={(event) => onChange("intendedAudience", event.target.value)}
          placeholder="Describe the people this content should be useful or compelling to."
          rows={5}
          value={form.intendedAudience}
        />
        <p className="text-sm leading-6 text-muted-foreground" id="intended-audience-description">
          Include the needs, circumstances, or point of view that define your intended audience.
        </p>
        <FieldError id="intended-audience-error" message={errors.intendedAudience} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-3">
          <Label htmlFor="primary-language">Primary language</Label>
          <Select
            disabled={disabled}
            onValueChange={(value) => onChange("primaryLanguage", value ?? "")}
            value={form.primaryLanguage || null}
          >
            <SelectTrigger aria-describedby={errors.primaryLanguage ? "primary-language-error" : undefined} aria-invalid={Boolean(errors.primaryLanguage)} className="h-11 w-full rounded-[var(--radius-control)]" id="primary-language">
              <SelectValue placeholder="Choose a language" />
            </SelectTrigger>
            <SelectContent className="rounded-[var(--radius-container)] border border-foreground bg-background shadow-[var(--shadow-action)]">
              {languages.map((language) => (
                <SelectItem key={language} value={language}>{language}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError id="primary-language-error" message={errors.primaryLanguage} />
        </div>

        <div className="space-y-3">
          <Label htmlFor="region">Region</Label>
          <Input
            aria-describedby={errors.region ? "region-error" : "region-description"}
            aria-invalid={Boolean(errors.region)}
            disabled={disabled}
            id="region"
            maxLength={120}
            onChange={(event) => onChange("region", event.target.value)}
            placeholder="e.g. India or global"
            value={form.region}
          />
          <p className="text-sm leading-6 text-muted-foreground" id="region-description">
            A country, market, or “global” is enough.
          </p>
          <FieldError id="region-error" message={errors.region} />
        </div>
      </div>
    </div>
  );
}

function ReviewStep({ form }: { form: AccountDnaForm }) {
  return (
    <div className="max-w-2xl space-y-6">
      <dl className="divide-y divide-border border-y border-border">
        <AccountDnaRecordRow label="Account focus" value={form.niche} />
        <AccountDnaRecordRow label="Intended audience" value={form.intendedAudience} />
        <AccountDnaRecordRow label="Primary language" value={form.primaryLanguage} />
        <AccountDnaRecordRow label="Region" value={form.region} />
      </dl>
      <div className="border border-border bg-card p-6">
        <p className="font-medium">A record for guidance, not a promise.</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Account DNA creates a stable synthetic audience for simulated reel assessments. It does not access Instagram’s private ranking systems or guarantee reach, growth, or performance.
        </p>
      </div>
    </div>
  );
}

function LedgerNote() {
  return (
    <aside className="h-fit border border-border bg-card p-6 lg:mt-12" aria-label="How Account DNA is used">
      <h2 className="text-xl font-semibold tracking-tight">A durable audience record.</h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Your answers define the strategy context. The system then saves one stable synthetic cohort for future assessments.
      </p>
      <ul className="mt-6 space-y-3 border-t border-border pt-5 text-sm leading-6 text-muted-foreground">
        <li>One saved audience cohort per account</li>
        <li>70 intended-audience and 30 adjacent personas</li>
        <li>Edits deliberately replace future-cohort context</li>
      </ul>
    </aside>
  );
}


function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm font-medium text-destructive" id={id} role="alert">{message}</p>;
}

function OnboardingLoadingState() {
  return (
    <main aria-busy="true" className="min-h-screen bg-background">
      <div className="mx-auto max-w-[var(--page-max-width)] px-5 py-12 sm:px-8 md:py-20">
        <div className="h-6 w-40 animate-pulse bg-muted" />
        <div className="mt-12 h-12 max-w-xl animate-pulse bg-muted" />
        <div className="mt-8 h-48 max-w-2xl animate-pulse bg-muted" />
      </div>
    </main>
  );
}

function validateStep(form: AccountDnaForm, step: number): FieldErrors {
  const errors: FieldErrors = {};

  if (step === 0 || step === 1) {
    if (!form.niche.trim()) {
      errors.niche = "Enter the topic that defines your account focus.";
    }
  }

  if (step === 1) {
    if (!form.intendedAudience.trim()) {
      errors.intendedAudience = "Describe the audience you intend to reach.";
    }
    if (!form.primaryLanguage) {
      errors.primaryLanguage = "Choose a primary language.";
    }
    if (!form.region.trim()) {
      errors.region = "Enter a country, market, or “global.”";
    }
  }

  return errors;
}

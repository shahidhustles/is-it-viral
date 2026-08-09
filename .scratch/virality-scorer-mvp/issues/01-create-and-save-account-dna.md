# 01 — Create and save Account DNA

**What to build:** An account owner can sign in, complete the first-run Account DNA onboarding, and return to a saved synthetic audience cohort that represents their account strategy.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

**UI-bearing:** Yes — onboarding surface (`/onboarding`).

- [ ] An authenticated owner can enter and save their niche, intended audience, primary language, and region; unauthenticated users cannot access the private flow.
- [ ] Saving Account DNA creates one stable, persisted cohort for the owner: 10 OCEAN-informed archetypes, 100 personas, a 70 in-target / 30 adjacent split, stable graph placement, and follower-network connections.
- [ ] Returning to the product reuses the saved Account DNA and cohort rather than generating a different audience; the owner can edit Account DNA and intentionally replace the cohort.
- [ ] The onboarding flow follows the established editorial visual language and communicates that the product provides advisory, not guaranteed, performance guidance.
- [ ] Tests cover the observable saved-cohort contract and authenticated onboarding flow without coupling to model-generated wording.

## UI Brief

### Job and audience

Authenticated social-account owners arrive first-run to create a durable Account DNA record. This is an **Operate** flow: concise, private, and evidence-led—not a quiz or a promise of growth.

### Outcome and proof

Collect a niche, a free-text intended-audience description, primary language, and region. Save one stable cohort configuration, then redirect to the future home/dashboard, where past analyses live and `/analyze` is the primary next action. Onboarding does not show generated personas or cohort details.

### Selected direction

Use the established **Signal Ledger** system as a three-step field record:

1. **Account focus** — niche.
2. **Audience context** — intended audience, language, and region.
3. **Review and save** — a plain-language summary and advisory caveat before **Create Account DNA**.

Use a minimal private-app header rather than the future dashboard sidebar; the creator should complete the record without unrelated navigation. Step changes may use restrained Cult UI motion; reduced-motion users receive an immediate state change.

### Component plan

- Use shadcn/ui as the accessible form foundation: `Field`/form validation, `Input`, `Textarea`, `Select` (and a searchable region combobox if the option set needs it), `Button`, and `AlertDialog` for intentional cohort replacement.
- Copy Cult UI's composable `Onboarding` root, `Step`, and `StepIndicator` block into the project for controlled step state and progression. Its styling remains subordinate to `DESIGN.md`; use custom Signal Ledger headings and shadcn buttons rather than its default serif presentation.

### States and boundaries

- Required or incomplete fields show an inline error and block progression; never rely on color alone.
- Saving locks navigation, retains entered values, and states that the Account DNA is being saved.
- Save failure preserves values and offers a retry action in the same step.
- After a successful save, redirect to the dashboard. The dashboard—not onboarding—confirms the saved record and presents `/analyze`.
- A returning owner sees their saved Account DNA at `/onboarding` with an explicit **Edit** action. Saving edits requires confirmation because it intentionally replaces the persisted cohort.
- Unauthenticated visitors are redirected before private onboarding content appears.
- The future dashboard/sidebar, persona previews, and cohort graph are out of scope for this ticket.

### Layout and accessibility

Desktop uses one focused form column with a quiet right-hand ledger note. Mobile collapses to one ordered stream. Keep Back/Continue at the form's end, keyboard reachable, with visible focus and announced step progress.

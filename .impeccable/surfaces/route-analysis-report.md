---
version: 1
slug: "route-analysis-report"
primary_target: "route:/analyses/[id]"
related_targets: ["components/analysis/analysis-report.tsx"]
---

## Scope and visitor mode

`/analyses/[id]` is an **Operate** surface for an authenticated creator who has just completed a reel analysis.

## Audience, job, and action

The creator needs to understand an honest, deterministic simulated-cohort verdict before deciding what to do with their reel. The primary action is to understand the verdict; the safe next action is to analyze another reel.

## Content and constraints

The completed report opens with a concise title, then the saved contagion replay, cohort outcome, prioritized edits, and saved Video DNA. The verdict belongs within the cohort outcome rather than the page header. It also covers loading, missing, unauthorized, and unavailable states.

## Chosen direction and memorable moment

**The Signal Ledger:** an inspectable progression from the saved contagion replay to outcomes, practical edits, and the underlying Video DNA. Lime only marks a creator action, never a result.

## Boundaries

Preserve the dashboard shell. Ticket 04 may add detailed graph and event replay without changing this report's primary reading sequence.

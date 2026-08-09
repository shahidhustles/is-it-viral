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

The completed report leads with the verdict, five simulated metrics, the saved cohort context, and a concise plain-language explanation that this does not reproduce or predict Instagram's private ranking system. It also covers loading, missing, unauthorized, and unavailable states.

## Chosen direction and memorable moment

**The Signal Ledger:** a decisive report headline followed by a compact metric ledger, with a quieter evidence rail that makes the simulation method inspectable without making it necessary to understand the result. Lime only marks a creator action, never a result.

## Boundaries

Preserve the dashboard shell. Ticket 04 may add detailed graph and event replay without changing this report's primary reading sequence.

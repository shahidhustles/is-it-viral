---
name: Is It Viral
description: Evidence-led audience-fit guidance for social creators.
colors:
  signal-lime: "#a3e635"
  studio-white: "#ffffff"
  analysis-paper: "#fcfff7"
  graphite: "#262626"
  graphite-black: "#000000"
  charcoal: "#303030"
  hairline: "#e5e5e5"
  quiet-copy: "#525252"
  metadata: "#737373"
  verified-edge: "#7ee2b8"
  verified-wash: "#dcfff1"
typography:
  display:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "56px"
    fontWeight: 600
    lineHeight: 1.16
    letterSpacing: "-0.28px"
  headline:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "48px"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.96px"
  title:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: 1.14
    letterSpacing: "-0.56px"
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.14
  interpretation:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "36px"
    fontWeight: 500
    lineHeight: 1.14
    letterSpacing: "-0.36px"
rounded:
  control: "4px"
  container: "8px"
  pill: "9999px"
spacing:
  4: "4px"
  8: "8px"
  12: "12px"
  16: "16px"
  20: "20px"
  24: "24px"
  32: "32px"
  40: "40px"
  56: "56px"
  80: "80px"
  120: "120px"
---

<!-- SEED: established with the user before implementation; re-run $impeccable document once there's code to capture the actual tokens and components. -->

# Design System: Is It Viral

## Overview

**Creative North Star: "The Signal Ledger"**

Is It Viral is a creator's working desk for separating a strong audience signal from a hunch. It uses a bright paper ground, decisive ink structure, and a single electric signal-lime action color to make an uncertain evaluation feel legible and owned by the creator. The system is editorial in its clarity, not in imitation: every visual decision should help a creator read evidence, enter context, or decide what to revise.

The first expression is an operating surface: Account DNA onboarding. It should feel like completing a compact, well-made field record—not completing a gamified quiz or accepting a black-box score. Later reports, recommendations, and contagion graphs inherit the same evidence-first posture, with charts and status states explained in text and never overstated as a prediction of platform behavior.

**Key Characteristics:**

- Paper-workbench calm with crisp, accountable structure.
- A single high-visibility action signal, used only when the creator can move work forward.
- Dense evidence can coexist with generous reading space.
- Human judgment is visibly preserved beside system guidance.

## Colors

The initial palette is deliberately restrained: graphite makes information durable, paper makes the workspace breathable, lime advances a creator's work, and mint verifies a completed or saved state.

### Primary

- **Signal Lime**: Use for the one primary progression action in a view, selected workflow moments, and the small active edge of an evidence state. It never stands in for a performance verdict.

### Secondary

- **Verified Mint**: Use its wash and edge together for persisted, confirmed, or complete states—not generic success decoration and never as the only state indicator.

### Neutral

- **Studio White**: The default canvas for focused work and quiet reading.
- **Analysis Paper**: The warm off-white surface for grouped evidence, account context, and secondary work areas.
- **Graphite**: Structural text, borders, icon strokes, and hard interaction offsets.
- **Charcoal**: The rare dark control or high-contrast focused region; avoid using it as a dashboard background.
- **Hairline**: Low-emphasis dividers and container boundaries.
- **Quiet Copy and Metadata**: Supporting explanation and timestamps; preserve readable contrast in implementation.

**The Evidence-Not-Outcome Rule.** Lime and mint communicate an available action or a verified system state. They must never make simulated reach, audience fit, or a recommendation look guaranteed.

## Typography

**Display Font:** Geist (with system sans fallback)
**Body Font:** Geist (with system sans fallback)
**Interpretation Font:** Fraunces italic (with Georgia fallback)

**Character:** Geist carries the interface like a well-kept research log: compact, readable, and direct. Fraunces is a rare human annotation for a short interpretive thought or a creator-facing reflection; it is not an all-purpose editorial flourish, body face, or headline gimmick.

### Hierarchy

- **Display** (600, 56px, 1.16): Reserved for a public product statement or a decisive empty-state moment.
- **Headline** (600, 48px, 1.08): Major page and report headings; reduce fluidly before a narrow viewport crowds the task.
- **Title** (600, 28px, 1.14): Workflow steps, result groups, and card titles.
- **Body** (400, 18px, 1.55): Explanations, recommendations, and advisory caveats; constrain long reading to a comfortable measure.
- **Label** (500, 14px, 1.14): Field labels, metric names, step markers, and metadata. Uppercase tracking is reserved for short system labels only.
- **Interpretation** (Fraunces italic 500, 36px, 1.14): One short, attributable interpretive phrase at a time—such as a section's creator-facing takeaway.

**The Plain-Language Rule.** Interface type explains the simulation and its uncertainty in direct sentences. Decorative emphasis must never make an advisory assessment feel more certain than it is.

## Layout

The initial spatial grammar uses a 1200px maximum work area, a 4px base unit, an 8px local element gap, 24px card padding, and an 80px section rhythm. Operating pages favour one clear decision column with a quieter evidence rail or summary edge where the task benefits from it; narrow screens collapse that relationship into a single ordered stream, keeping the action and its explanation together.

Onboarding is paced as a short record: context first, audience intent second, confirmation last. Analysis and replay surfaces should let the creator keep the verdict, the explanation, and the next edit within one navigable reading path rather than scattering them across ornamental dashboards.

**The Next-Action-First Rule.** At every width, the creator should be able to find the current task, its status, and its safe next action without scanning a secondary panel.

## Elevation & Depth

Depth is structural, not atmospheric. Paper surfaces separate through tonal contrast and one-pixel rules; the only shadow vocabulary is a crisp graphite offset on interactive controls and focused product artifacts. No blurred shadow, glass treatment, or glowing card is part of this system. Motion, when implemented, should mark a save, a simulation round, or a changed comparison state—not decorate idle chrome.

**The Proof Has Weight Rule.** A hard offset may indicate that an action can be taken or an artifact can be inspected. Static evidence remains flat and readable.

## Shapes

Controls are gently squared (4px) and containers are compactly rounded (8px), creating a precise tool-like feel without sterility. Full pills belong only to compact state, taxonomy, and filter labels; primary actions and input fields are never pills. Borders use graphite when the boundary conveys structure and hairline when the boundary only groups information.

## Do's and Don'ts

### Do:

- **Do** use the supplied initial token values consistently until implementation establishes a revised, tested scale.
- **Do** pair every simulated metric or recommendation with plain-language context about what it represents.
- **Do** make data states distinguishable with labels, stroke, fill, pattern, and text—not color alone.
- **Do** use Signal Lime sparingly for a creator's primary forward action or the current workflow state.
- **Do** make saved, loading, unavailable, and error states feel equally intentional and legible.

### Don't:

- **Don't** reuse the reference product's name, logo, customer-proof patterns, topographic artwork, or headline formula.
- **Don't** present a simulated cohort result as a prediction of Instagram's private ranking system.
- **Don't** use lime or mint as generic decoration, unlabelled chart meaning, or a proxy for "viral."
- **Don't** introduce soft blurred shadows, glass panels, or a dark dashboard shell.
- **Don't** turn onboarding into a quiz, a streak, or a game mechanic.

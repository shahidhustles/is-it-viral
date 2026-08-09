# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js; Vercel AI SDK v7; React Flow for selected features; Clerk for authentication; Convex for the database.

## Users

Instagram reel creators and account owners who want to assess a draft before publishing it. They use the product to understand how a reel may perform with a simulated version of their intended audience.

## Product Purpose

Is It Viral helps account owners build a saved model of their intended audience, evaluate an uploaded Instagram reel against that simulated cohort, and receive practical, timestamped recommendations for improving it. The account owner retains the final publishing decision.

## Positioning

The product is a simulation-backed advisory tool for Instagram reels. It shows how an uploaded reel propagates through a synthetic audience cohort; it does not claim to predict or reproduce Instagram’s private ranking systems.

## Operating Context

Users first create Account DNA from their niche, intended audience, primary language, and region. They then upload a short Instagram-style reel and evaluate its Video DNA against the same saved audience cohort over time.

## Capabilities and Constraints

- MVP scope is Instagram-style reel uploads only; posts and other social platforms are out of scope.
- Owners provide their Account DNA through authenticated onboarding. The MVP never scrapes, imports, downloads, or connects to Instagram.
- Account DNA persists an editable audience definition and one stable cohort: 10 OCEAN-informed archetypes instantiated as 100 personas, including 70 in-target and 30 adjacent personas plus a follower/network graph.
- Each uploaded reel is capped at 30 seconds. The product samples one frame per second, transcribes the audio, and produces structured Video DNA for hook, clarity, pacing, credibility, audience relevance, and share trigger.
- A deterministic contagion simulation begins with 10 seed viewers and propagates through direct shares and recommendation-based exposure. It runs for at most six rounds and stops early when fewer than two new personas are exposed.
- The product reports simulated reach, in-target/out-of-target reach, simulated share rate, cascade depth, and one rule-based verdict: Breakout potential, Strong in target, Mixed signal, or Stops early.
- The result includes an animated, interactive React Flow graph and three prioritized timestamped recommendations. Persona engagement metrics and rationales are computed, not generated through an LLM role-play per round.
- Recommendations and verdicts are guidance, not guarantees; the owner makes the final publishing decision.
- Clerk authenticates owners and Convex persists Account DNA, cohort, uploads, and analysis reports. Exact data-retention policy remains to be defined.

## Brand Commitments

The product name is “Is It Viral.” It must not imply or promise virality, growth, reach, or performance outcomes. Every outcome must be framed as a simulated cohort result, with uncertainty and creator control made explicit.

## Evidence on Hand

No real account data, testimonials, case studies, performance benchmarks, or approved claims have been provided. Prepared strong and weak demo reels are planned but have not yet been supplied; any future demo clip must be reusable or authorised. Future work must not fabricate evidence or hard-code a reel’s outcome.

## Product Principles

1. Keep the creator in control of the final decision.
2. Give actionable, content-specific guidance instead of performance guarantees.
3. Ground evaluation in Account DNA, Video DNA, and audience-demographic fit.
4. Make the simulated contagion mechanism inspectable through metrics, replay, and persona-level evidence.
5. Communicate uncertainty honestly and avoid claims of guaranteed outcomes.

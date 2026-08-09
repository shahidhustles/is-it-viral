---
target: landing page
total_score: 27
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 3
timestamp: 2026-08-09T10-41-50Z
slug: components-landing-landing-page-tsx
---
Method: dual-agent (A: /root/landing_design_review · B: /root/landing_evidence_review)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---:|---|
| 1 | Visibility of System Status | 3 | The state-aware CTA exists, but its Account DNA state is unresolved while the query loads. |
| 2 | Match System / Real World | 4 | Creator vocabulary—draft, audience, reel, publish—is direct and credible. |
| 3 | User Control and Freedom | 3 | The carousel is manual and the copy preserves agency; the entry action lacks a concrete first-step preview. |
| 4 | Consistency and Standards | 3 | Paper/ink/cream grammar is strong, but the hero contour watermark conflicts with the stated anti-reference. |
| 5 | Error Prevention | 2 | The unresolved Account DNA query can briefly route a returning owner to onboarding. |
| 6 | Recognition Rather Than Recall | 4 | The process row and carousel make the same three-stage model visible. |
| 7 | Flexibility and Efficiency | n/a | Persuade surface; no repeat task to optimize. |
| 8 | Aesthetic and Minimalist Design | 3 | The hero combines proposition, animated type, graph, metrics, legend, and disclosure before the vocabulary is established. |
| 9 | Error Recovery | 2 | There is no intentional loading or unknown CTA state. |
| 10 | Help and Documentation | n/a | Persuade surface; it appropriately explains rather than documents. |
| **Total** |  | **27/32** | **Strong foundation; conversion-state and focal hierarchy work remain.** |

## Design Specificity Verdict

The landing page is authored for Is It Viral: its Account DNA → Video DNA → cohort-simulation sequence, explicit illustrative labels, and creator-control copy avoid generic AI-growth-page claims. The deterministic scan found no issues.

The contour-line/lime-halo treatment is the exception. It is editorial but not product-native, and conflicts with DESIGN.md’s stated prohibition on reusing reference topographic artwork. The product’s distinctive visual material should come from propagation paths and audience clusters instead.

## Overall Impression

This is a credible, unusually honest landing page with a compelling inspectability story. Its biggest opportunity is to simplify the first viewport so the hero teaches one mental model, then let the carousel carry the detailed proof.

## What’s Working

- Product truth is protected: the hero names a simulated cohort and the graph declares itself illustrative and not live account data.
- The structure mirrors the actual workflow instead of inventing testimonials, benchmarks, integrations, or score marketing.
- The carousel is progressive disclosure with keyboard, ARIA, and reduced-motion support; it makes technical evidence tangible without fabricated customer imagery.

## Priority Issues

### P1 — CTA state can route a returning owner incorrectly during Account DNA loading

`Boolean(accountDna)` treats Convex’s unresolved query as no Account DNA. A signed-in returning owner can briefly see the onboarding CTA. Model `undefined` as a deliberate loading/neutral CTA and select onboarding or analysis only after resolution. Suggested command: `$impeccable harden`.

### P1 — The hero preview competes with the proposition before the visitor has vocabulary

The first view combines three metrics, three legend definitions, line styles, five node states, a round label, disclosure, CTA, and animated headline. Reduce the plate to seed → shares → audience fit and one plain-language explanation; retain detailed state grammar in the carousel. Suggested command: `$impeccable distill`.

### P1 — The contour watermark is reference-shaped rather than product-shaped

The contour SVG conflicts with DESIGN.md’s anti-reference boundary on topographic artwork. Replace it with a cohort-field pattern derived from graph paths and clusters, or explicitly amend the system to own the motif. Suggested command: `$impeccable delight`.

### P2 — The final CTA explains uncertainty but not the immediate commitment

Near the dark close, add a factual expectation: “Sign in → define your audience once → upload a ≤30s draft.” This answers the visitor’s last practical question without promotional claims. Suggested command: `$impeccable clarify`.

### P2 — The hero’s animated qualifying word can momentarily obscure core meaning

Reduced-motion support is sound, but the core adjective is initially absent for motion-enabled visitors. Keep the headline coherent at every animation frame, or animate a secondary marker rather than the core word. Suggested command: `$impeccable animate`.

## Persona Red Flags

- **Creator first-timer:** Account DNA, Video DNA, cohort, and “considered first audience” arrive densely. The action should say what happens first.
- **Returning owner:** Account DNA query ambiguity breaks continuity by briefly suggesting onboarding.
- **Keyboard/screen-reader visitor:** Carousel roles, labelled controls, roving tab stop, and reduced-motion handling are present; validate the real spoken announcement sequence because live status and panel changes happen together.

## Minor Observations

- The footer’s fixed “Sign in” route is inconsistent with the state-aware CTA for signed-in visitors.
- Mint node fills and the mint-wash shared node have more states than the legend explains.
- Literal SVG hex values should be moved to CSS variables or currentColor-based styling to fully inherit the design-token system.
- Browser visual inspection and the human detector overlay were unavailable in this session; source review and a clean CLI detector were used as fallback evidence.

## Questions to Consider

- Should the hero’s one takeaway be “test a draft” or “inspect a simulated audience”? It currently tries to prove both.
- What first artifact should the CTA promise so the commitment feels concrete before sign-in?
- Can the page’s memorable texture be generated by the cohort mechanism itself rather than editorial terrain?

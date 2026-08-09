# Is It Viral — simulation-backed reel evaluation MVP

Status: ready-for-agent

## Problem Statement

An Instagram account owner has no practical way to assess a reel against the audience they are trying to reach before publishing it. Generic “viral” advice is not tied to the account’s audience, does not explain why a specific reel may fail, and gives no visible model of how interest could spread.

The owner needs an advisory tool that creates a reusable representation of their audience, evaluates a short uploaded reel against it, and makes the simulated result understandable enough to guide an editing decision. The tool must provide guidance rather than promise Instagram reach, growth, or virality.

## Solution

Is It Viral is an authenticated web application that saves an account owner’s **Account DNA** during onboarding. Account DNA represents the account niche, intended audience, language/region, and a stable synthetic audience cohort.

An owner uploads an Instagram-style reel of up to 30 seconds. The application extracts **Video DNA** from one sampled frame per second and a full audio transcript, then runs a deterministic contagion simulation against the saved cohort. The simulation begins with 10 seed viewers and propagates by direct sharing and algorithmic recommendation until it stalls or completes six rounds.

The owner receives an animated, interactive 100-person graph, simulation metrics, a rule-based verdict, and three timestamped editing recommendations. The product presents the result as a simulation-backed assessment of audience fit and sharing potential, never a guarantee of real Instagram performance.

## User Stories

1. As an account owner, I want to create an account and sign in, so that my Account DNA and past analyses belong to me.
2. As an account owner, I want to describe my account niche during onboarding, so that the evaluator has context for my content.
3. As an account owner, I want to describe my intended audience once, so that I do not need to repeat demographic information for every reel.
4. As an account owner, I want to provide my primary language and region, so that my simulated cohort reflects the audience I am trying to reach.
5. As an account owner, I want Account DNA to be saved, so that separate uploads are judged against the same audience.
6. As an account owner, I want the application to create a stable synthetic audience cohort, so that results from multiple reels are comparable.
7. As an account owner, I want the cohort to contain distinct archetypes, so that the simulation does not treat every viewer alike.
8. As an account owner, I want the cohort to include both target and adjacent personas, so that I can see whether a reel remains niche or travels beyond its intended audience.
9. As an account owner, I want to edit my Account DNA, so that a changed account strategy can be represented by a new audience definition.
10. As an account owner, I want to upload a reel file without connecting Instagram, so that I can evaluate a draft safely and without scraping.
11. As an account owner, I want the application to reject unsupported or over-30-second files clearly, so that I know how to prepare a valid upload.
12. As an account owner, I want to see that video analysis is in progress, so that a multi-stage analysis does not appear stuck.
13. As an account owner, I want the application to identify the reel’s hook, clarity, pacing, credibility, audience relevance, and share trigger, so that the result reflects the content I uploaded.
14. As an account owner, I want spoken audio to inform the analysis, so that the message of a talking-head or narrated reel is not ignored.
15. As an account owner, I want the simulation to begin with a small seed audience, so that exposure is not falsely represented as every persona seeing the reel immediately.
16. As an account owner, I want exposures to progress in rounds, so that I can understand whether interest sustains or dies out.
17. As an account owner, I want direct shares to travel through persona network connections, so that peer-to-peer propagation is visible.
18. As an account owner, I want algorithmic recommendations to select unexposed personas by content-persona similarity, so that the simulation represents audience fit rather than random reach.
19. As an account owner, I want each persona to have a different sharing threshold, so that a single action does not imply every viewer behaves the same way.
20. As an account owner, I want likes and comments to be recorded even when they do not directly propagate the reel, so that the graph shows meaningful engagement states.
21. As an account owner, I want the same Account DNA and Video DNA to yield the same simulation result, so that I can trust comparisons between edits.
22. As an account owner, I want to see total simulated reach, so that I can understand how much of the cohort saw the reel.
23. As an account owner, I want to see in-target and out-of-target reach, so that I can judge the audience fit of the reel.
24. As an account owner, I want to see simulated share rate and cascade depth, so that I can distinguish a short-lived reaction from sustained propagation.
25. As an account owner, I want a plain-language verdict, so that I can make a quick publishing or editing decision.
26. As an account owner, I want the verdict to be based on explicit simulation rules, so that it is not an arbitrary AI assertion.
27. As an account owner, I want an animated graph replay, so that I can watch the cascade form round by round.
28. As an account owner, I want all 100 personas plotted in the graph, so that unexposed and out-of-target viewers remain visible context.
29. As an account owner, I want graph styling to distinguish direct shares from algorithmic exposure, so that I can understand how each path spread.
30. As an account owner, I want to click a persona node, so that I can inspect its traits, interests, exposure source, watch behavior, action, and rationale.
31. As an account owner, I want personas that commented to show concise comment text, so that the simulation feels concrete without requiring a long agent transcript.
32. As an account owner, I want three prioritized, timestamped editing recommendations, so that I know exactly what to change in the reel.
33. As an account owner, I want each recommendation to explain its expected audience effect, so that I can decide whether the suggested edit fits my creative intent.
34. As a hackathon judge, I want to run prepared strong and weak sample reels through the same workflow, so that I can see a credible contrast in outcome.
35. As a hackathon judge, I want the product to state that it is advisory and simulation-backed, so that I am not misled into believing it has access to Instagram’s private ranking systems.

## Implementation Decisions

- The MVP is a Next.js web application using Clerk for authentication, Convex for persistence and media storage, React Flow for the graph interaction, and Vercel AI SDK 7 through Vercel AI Gateway.
- The product is Instagram-reel focused for this MVP. It accepts video file uploads only; it does not scrape, fetch, download, or connect to Instagram content or account data.
- An authenticated account owner has one editable Account DNA profile. The profile stores the user-supplied niche, intended-audience description, primary language, and region.
- Account DNA generation creates and persists a stable cohort, rather than regenerating viewers for each upload. It comprises 10 OCEAN-informed archetypes instantiated as 100 personas, their affinity vectors, behavioral thresholds, stable node positions, and follower/network edges.
- Every cohort contains 70 in-target personas generated from the Account DNA and 30 adjacent personas with partial or low audience overlap. “In / out of target” metrics refer to these persisted cohort classifications.
- Persona identity is generated at onboarding. Individual persona engagement values and rationales are computed during simulation. The system may produce a concise AI-written comment only when a persona takes a comment action; it does not role-play an LLM for every persona or every round.
- Uploads are capped at 30 seconds. The analysis pipeline samples one visual frame per second and transcribes the full audio track before producing Video DNA.
- Video DNA is a validated structured result containing scored and explanatory signals for hook, clarity, pacing, credibility, audience relevance, share trigger, visual themes, spoken themes, and timestamped improvement opportunities.
- AI SDK 7 routes model requests through Vercel AI Gateway. Gemini 3.5 Flash performs the batched visual and structured-text analysis. GPT-4o mini Transcribe performs audio transcription. Account DNA/archetype generation uses the same gateway-backed text capability.
- The simulation is a pure deterministic domain operation. It accepts Video DNA, a saved cohort, and a saved seed and produces an ordered exposure/action event log plus aggregate metrics. Model calls do not decide each individual viewer action.
- Simulation round 1 exposes exactly 10 high-fit seed personas. In each later round, new exposure can arrive through direct shares along network edges or recommendation scoring among previously unexposed high-fit personas.
- Persona reaction decisions use Video DNA affinity, persona interests, OCEAN-derived behavior, sharing threshold, exposure source, and prior social proof. Supported outcomes are no engagement, watched, liked, commented, and shared.
- The cascade runs for at most six rounds. It ends early when a round yields fewer than two newly exposed personas. The final report records the round and stop reason.
- A stable simulation seed is retained with the analysis so replaying the result does not alter reach, actions, or graph geometry.
- Verdicts are deterministic classifications of aggregate simulation results: Breakout potential, Strong in target, Mixed signal, and Stops early. The classification uses simulated reach, share rate, and cascade depth; generative AI may explain but does not select the verdict.
- An analysis record persists its source upload reference, Video DNA, simulation output, final metrics, verdict, and recommendations. This separates repeatable simulation data from display state.
- The results experience presents total simulated reach, in/out-of-target results, share rate, cascade depth, verdict, and three timestamped recommendations before or alongside the graph.
- The React Flow graph displays all personas. It distinguishes target state, exposed state, direct-share paths, recommendation paths, engagement actions, and unexposed personas. The replay animates the persisted event log round by round and finishes in an interactive final state.
- Selecting a graph node opens a persona detail panel with its profile, OCEAN traits, interests, exposure round and source, watch/engagement metrics, selected action, and computed rationale.
- The experience follows the repository’s established light editorial visual language: paper and cream surfaces, ink borders, restrained lime action accents, hard offset interactive shadows, and Geist/Fraunces typography. It must not fabricate social proof, performance benchmarks, or claims of guaranteed growth.
- The product includes prepared, reusable/authorised strong and weak sample reels for the hackathon presentation. Both must pass through the same upload, analysis, simulation, and report workflow as a user upload.

## Testing Decisions

- The primary test seam is the deterministic simulation contract: given valid Video DNA, a persisted cohort, and a stable seed, it produces the same ordered event log, metrics, verdict, and stop reason every time. Tests assert this observable result, not intermediate implementation steps or random-number calls.
- Simulation tests cover: the 10-person initial seed; no mass exposure of all personas; target/adjacent classification; direct-share propagation only over network edges; recommendation exposure only of unexposed personas; no more than six rounds; early termination below two new viewers; action aggregation; and verdict classification boundaries.
- The analysis workflow is tested at its boundary by substituting validated Video DNA and transcript responses for external model calls. Tests verify that a valid upload progresses to a saved analysis/report and that malformed model output, transcription failure, invalid media, unauthenticated access, and over-limit duration surface clear user-visible errors.
- Cohort-generation tests verify the externally visible saved cohort contract: 10 archetypes, 100 personas, a 70/30 target split, persisted network data, and stable reuse across analyses for the same Account DNA.
- UI tests verify externally visible user flows: onboarding saves Account DNA; an authenticated owner can start an upload; the analysis state is communicated; final metrics and the three timestamped recommendations render; replay advances through persisted rounds; and selecting a node exposes the expected persona details.
- Graph tests assert semantic node and edge status data rather than React Flow implementation internals or pixel positions. Animation timing itself is not a business-rule assertion.
- There is no existing application test suite to imitate. New tests should establish the above high-level contracts and avoid coupling to vendor APIs, generated prose, or visual-library internals.

## Out of Scope

- Scraping, importing, downloading, or authenticating against Instagram.
- Real Instagram account history, follower data, engagement data, platform ranking data, or a claim that the simulation reproduces Instagram’s private algorithm.
- Guaranteed performance, reach, growth, or virality claims.
- Automatically generating, editing, or posting a replacement reel.
- Multiple saved audiences per account, team workspaces, billing, public sharing, production analytics, or historical benchmarking.
- Unlimited video duration, production-scale media processing, and real-time streaming analysis.
- LLM-driven agent conversations or per-persona/per-round LLM decisions.
- A generated force layout at replay time; graph placement is stable, persisted cohort data.

## Further Notes

- The primary hackathon demonstration compares a deliberately strong sample reel with a deliberately weak sample reel. The contrast must be caused by the same Video DNA and simulation rules used for normal uploads, not hard-coded outcome screens.
- The evaluation is best presented as “how this reel performs with your simulated audience cohort.” The wording should foreground uncertainty and keep the creator in control of the publishing decision.
- The pure simulation contract is the architectural boundary that enables model, storage, and graph presentation work to evolve without changing the contagion rules.

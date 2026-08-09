# Is It Viral

**A private first audience for your Instagram reel.**

Most creators post a reel, wait, and hope the opening lands with the people they wanted to reach. By then, the edit is already public.

Is It Viral lets you test a short draft against a saved, simulated audience before publishing. It reads what the viewer sees and hears, models how the reel may travel through that audience, and gives you a short list of timestamped edits to try. You still decide what to change and whether to post.

This is useful for a dev-club owner too. Set up an audience such as students learning web development in your city, upload a draft event announcement or tutorial reel, and see whether the hook is clear enough for that audience to pass along. It is a way to review content before the club account has spent its one shot at a timely post.

> The result is guidance from a synthetic cohort, not a prediction of Instagram’s private ranking system. Is It Viral does not connect to Instagram, scrape accounts, or promise reach, growth, or virality.

## What it does

1. You describe your niche, intended audience, language, and region once. The app saves this as **Account DNA**.
2. It creates a stable cohort of 100 personas: 70 in the target audience and 30 adjacent to it. The same cohort stays in place, so you can compare one edit with the next.
3. You upload an Instagram-style reel up to 30 seconds long. The app samples frames, transcribes the audio, and produces **Video DNA** for the hook, clarity, pacing, credibility, audience relevance, and share trigger.
4. A deterministic simulation starts with 10 seed viewers and runs for up to six rounds. Exposure can spread through persona connections or recommendation-based fit.
5. The report shows simulated reach, core-audience reach, new-viewer reach, share interest, cascade depth, a rule-based takeaway, and three timestamped edits.
6. You can replay the spread across the 100-person graph and inspect each persona’s traits, interests, exposure path, engagement, and rationale.

## Run it locally

### Prerequisites

- Node.js 20 or later
- [pnpm](https://pnpm.io/)
- A [Clerk](https://clerk.com/) application
- A [Convex](https://www.convex.dev/) project
- Access to the Vercel AI Gateway configured for the Convex deployment

### Setup

```bash
pnpm install
```

Create `.env.local` with the values for your Clerk and Convex projects:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_CONVEX_SITE_URL=
```

Configure `CLERK_JWT_ISSUER_DOMAIN` and `AI_GATEWAY_API_KEY` in the Convex deployment. The latter lets the server-side analysis use Vercel AI Gateway. Then start Convex development in one terminal:

```bash
pnpm exec convex dev
```

In another terminal, run the app:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Create an account, set up your audience, and upload a reel of 30 seconds or less.

## Useful commands

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

## How the project is built

| Concern | Choice |
| --- | --- |
| Web app | Next.js 16 and React 19 |
| Authentication | Clerk |
| Data, files, and server functions | Convex |
| Video analysis | Vercel AI SDK through Vercel AI Gateway, with transcription and structured Video DNA |
| Audience simulation | A seeded, deterministic TypeScript domain model |
| Graph replay | React Flow |
| UI | Tailwind CSS and Base UI |

The AI analyses the reel’s frames and transcript. Saved cohort data, explicit thresholds, and a persisted seed drive the spread and persona reactions, so reopening a report produces the same graph and result.

## Project map

```text
app/          Routes for the landing page, onboarding, dashboard, analysis, and reports
components/   The creator workflow, reports, graph replay, and UI primitives
convex/       Schema, account DNA, upload pipeline, video analysis, and simulation rules
```

## Boundaries

This MVP focuses on draft Instagram-style reels. It deliberately leaves out Instagram account imports, follower data, publishing, real performance analytics, billing, and team workspaces. The final publishing decision remains with the creator.

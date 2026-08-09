## Agent skills

### Issue tracker

Issues live as local Markdown under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Uses the default five canonical triage labels. See `docs/agents/triage-labels.md`.

### Domain docs

Uses a single-context layout: root `CONTEXT.md` and `docs/adr/`. See `docs/agents/domain.md`.

# Engineering standards

Write code that is readable, cohesive, and easy to change. Match existing project conventions unless this file gives a stronger rule.

## Architecture

- Prefer small, deep modules: keep related behaviour local behind a simple interface.
- Extract a function or component when it has a clear name, independent responsibility, or meaningful reuse. Do not create abstractions or wrapper components without a real use.
- Name code after domain concepts, not vague technical terms such as `utils`, `helpers`, or `manager`.
- Keep comments for intent, trade-offs, and non-obvious constraints—not a narration of the code.
- Validate untrusted input at system boundaries. Keep external data typed and avoid `any`; use `unknown` and validate it when necessary.

## Next.js and React

When writing, reviewing, or refactoring React/Next.js code, use the [vercel-react-best-practices](.agents/skills/vercel-react-best-practices/SKILL.md) skill.

- Default to Server Components. Add `"use client"` only for interactivity, browser APIs, or client-side state.
- Read server-side data directly in Server Components or server modules.
- Prefer Server Actions for mutations initiated by this app’s UI. Authenticate and validate every Server Action.
- Use Route Handlers/API endpoints when another client needs the endpoint: webhooks, third-party services, public APIs, mobile clients, or streaming endpoints.
- Keep `page.tsx` focused on route composition, data boundaries, and layout. Move meaningful UI sections, interaction logic, and domain behaviour into clearly named components/modules.
- Do not define React components inside other components.
- Keep client-component props small and serializable; do not pass unnecessary server data to the browser.

## Clerk
When writing, reviewing, or refactoring clerk + Next.js code, use the [clerk-nextjs-patterns](.agents/skills/clerk-nextjs-patterns) skill.


### Use pnpm instead of npm.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
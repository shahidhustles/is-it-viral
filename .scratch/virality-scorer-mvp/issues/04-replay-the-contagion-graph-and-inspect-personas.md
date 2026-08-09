# 04 — Replay the contagion graph and inspect personas

**What to build:** An owner can watch the saved cohort simulation propagate through an interactive graph and inspect why individual personas reacted.

**Blocked by:** 02 — Run a deterministic cohort simulation.

**Status:** ready-for-agent

**UI-bearing:** Yes — contagion graph and persona-detail surfaces within `/analyses/[id]`.

- [ ] The report plots all 100 saved personas with stable positions and renders the persisted simulation event log using React Flow.
- [ ] Replay visibly advances one simulation round at a time, ending at an interactive final state without changing the saved outcome.
- [ ] Graph styling distinguishes in-target, adjacent, unexposed, exposed, and engagement states, plus direct-share paths and algorithmic-recommendation paths.
- [ ] Selecting a persona opens its profile and records: traits, interests, exposure round and source, watch/engagement metrics, selected action, and computed rationale; a comment is shown only when the persona commented.
- [ ] Tests assert graph semantic data and user-visible inspection/replay behaviour, not React Flow internals, pixel layout, or animation timing.

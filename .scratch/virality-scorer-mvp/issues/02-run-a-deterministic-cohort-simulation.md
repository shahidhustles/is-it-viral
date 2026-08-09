# 02 — Run a deterministic cohort simulation

**What to build:** An owner with saved Account DNA can receive a simulation-backed report from valid Video DNA, making the core virality assessment verifiable before external media analysis is connected.

**Blocked by:** 01 — Create and save Account DNA.

**Status:** ready-for-agent

**UI-bearing:** Yes — initial analysis-report surface (`/analyses/[id]`).

- [ ] Given a saved cohort, valid Video DNA, and a stable seed, the product saves an ordered round-by-round exposure/action event log and produces the same report on replay.
- [ ] The simulation starts with exactly 10 seed personas, exposes additional personas only through saved network shares or deterministic recommendation scoring, runs at most six rounds, and records an early-stop reason below two newly exposed personas.
- [ ] The report visibly provides total simulated reach, in/out-of-target reach, simulated share rate, cascade depth, and a deterministic verdict: Breakout potential, Strong in target, Mixed signal, or Stops early.
- [ ] The report is clearly described as a simulated cohort outcome, not a reproduction or prediction of Instagram’s private ranking system.
- [ ] Tests exercise the public simulation contract, including propagation rules, stop rules, metrics, and verdict boundaries, without asserting internal random-number or rendering implementation details.

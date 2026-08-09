import { describe, expect, it } from "vitest";

import { runSimulation } from "./simulation";

const videoDna = {
  hook: 0.9,
  clarity: 0.85,
  pacing: 0.8,
  credibility: 0.75,
  audienceRelevance: 0.9,
  shareTrigger: 0.95,
};

const cohort = {
  personas: Array.from({ length: 12 }, (_, personaIndex) => ({
    id: `persona-${personaIndex}`,
    personaIndex,
    audienceSegment: personaIndex < 9 ? ("inTarget" as const) : ("adjacent" as const),
    ocean: { openness: 0.8, conscientiousness: 0.7, extraversion: 0.8, agreeableness: 0.7, neuroticism: 0.3 },
    affinityVector: [0.9, 0.8, 0.9, 0.8, 0.9],
    interests: ["reel strategy"],
    sharingThreshold: 0.2,
  })),
  connections: Array.from({ length: 12 }, (_, index) => ({
    fromPersonaId: `persona-${index}`,
    toPersonaId: `persona-${(index + 1) % 12}`,
  })),
};

describe("runSimulation", () => {
  it("replays the same ordered exposure and action log for a stable cohort, Video DNA, and seed", () => {
    const first = runSimulation(cohort, videoDna, "replayable-seed");
    const replay = runSimulation(cohort, videoDna, "replayable-seed");

    expect(replay).toEqual(first);
    expect(first.events.filter((event) => event.type === "exposed" && event.round === 1)).toHaveLength(10);
    expect(first.metrics.totalReach).toBeGreaterThanOrEqual(10);
    expect(first.metrics.cascadeDepth).toBeLessThanOrEqual(6);
    expect(first.events.every((event) => event.type !== "exposed" || event.source === "seed" || event.source === "share" || event.source === "recommendation")).toBe(true);
  });

  it("records an early stop when fewer than two new personas can be exposed", () => {
    const result = runSimulation(
      { personas: cohort.personas.slice(0, 10), connections: [] },
      { ...videoDna, shareTrigger: 0.1 },
      "early-stop-seed",
    );

    expect(result.stopReason).toBe("fewerThanTwoNewExposures");
    expect(result.verdict).toBe("Stops early");
    expect(result.metrics.totalReach).toBe(10);
    expect(result.metrics).toMatchObject({ inTargetReach: 9, outOfTargetReach: 1, simulatedShareRate: 1, cascadeDepth: 1 });
  });

  it("records both saved-network shares and deterministic recommendations as the only follow-on exposure paths", () => {
    const shared = runSimulation(
      { personas: createCohort(12, 0.2, false).personas, connections: [{ fromPersonaId: "fixture-0", toPersonaId: "fixture-10" }, { fromPersonaId: "fixture-1", toPersonaId: "fixture-11" }] },
      videoDna,
      "saved-network-seed",
    );
    const recommended = runSimulation(createCohort(15, 1, false), videoDna, "recommendation-seed");

    expect(shared.events).toEqual(expect.arrayContaining([
      expect.objectContaining({ round: 2, type: "exposed", source: "share", sourcePersonaId: "fixture-0" }),
    ]));
    expect(recommended.events).toEqual(expect.arrayContaining([
      expect.objectContaining({ round: 2, type: "exposed", source: "recommendation", sourcePersonaId: null }),
    ]));
  });

  it("uses the rule-based verdict boundaries for broad, in-target, and mixed outcomes", () => {
    const broadCohort = createCohort(100, 0.2, true);
    const targetedCohort = createCohort(100, 0.2, false);
    const mixedCohort = createCohort(100, 1, false);

    expect(runSimulation(broadCohort, videoDna, "breakout-seed").verdict).toBe("Breakout potential");
    expect(runSimulation(targetedCohort, videoDna, "targeted-seed").verdict).toBe("Strong in target");
    expect(runSimulation(mixedCohort, videoDna, "mixed-seed").verdict).toBe("Mixed signal");
  });
});

function createCohort(personaCount: number, sharingThreshold: number, connectInChains: boolean) {
  const personas = Array.from({ length: personaCount }, (_, personaIndex) => ({
    id: `fixture-${personaIndex}`,
    personaIndex,
    audienceSegment: "inTarget" as const,
    ocean: { openness: 0.8, conscientiousness: 0.7, extraversion: 0.8, agreeableness: 0.7, neuroticism: 0.3 },
    affinityVector: [0.9, 0.8, 0.9, 0.8, 0.9],
    interests: ["reel strategy"],
    sharingThreshold,
  }));
  return {
    personas,
    connections: connectInChains
      ? Array.from({ length: personaCount - 10 }, (_, index) => ({
          fromPersonaId: `fixture-${index}`,
          toPersonaId: `fixture-${index + 10}`,
        }))
      : [],
  };
}

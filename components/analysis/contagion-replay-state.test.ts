import { describe, expect, it } from "vitest";

import { getIndexedPersonaReplayState, getPersonaAction, getPersonaReplayState, getVisibleExposureEvents, indexReplayEvents, type GraphEvent } from "./contagion-replay-state";

const events: GraphEvent[] = [
  { order: 0, round: 1, type: "exposed", personaId: "persona-1", source: "seed", sourcePersonaId: null, score: null },
  { order: 1, round: 1, type: "shared", personaId: "persona-1", source: null, sourcePersonaId: null, score: 0.9, action: "shared", watchCompletion: 0.97, rationale: "Strong fit.", comment: null },
  { order: 2, round: 2, type: "exposed", personaId: "persona-2", source: "share", sourcePersonaId: "persona-1", score: null },
  { order: 3, round: 2, type: "didNotShare", personaId: "persona-2", source: null, sourcePersonaId: null, score: 0.75, action: "commented", watchCompletion: 0.82, rationale: "Relevant.", comment: "Worth trying." },
];

describe("contagion replay state", () => {
  it("only activates the pass currently being replayed while retaining prior exposure", () => {
    expect(getPersonaReplayState(events, "persona-1", 1)).toMatchObject({ isActive: true, exposure: { round: 1 } });
    expect(getPersonaReplayState(events, "persona-1", 2)).toMatchObject({ isActive: false, exposure: { round: 1 } });
    expect(getPersonaReplayState(events, "persona-2", 1)).toEqual({ exposure: null, reaction: null, isActive: false });
    expect(getPersonaReplayState(events, "persona-2", 2)).toMatchObject({ isActive: true, reaction: { action: "commented" } });
  });

  it("exposes graph semantics from saved events rather than graph-library state", () => {
    expect(getVisibleExposureEvents(events, 1)).toHaveLength(1);
    expect(getVisibleExposureEvents(events, 2)).toHaveLength(2);
    expect(getPersonaAction(getPersonaReplayState(events, "persona-2", 2).reaction)).toBe("commented");
    expect(getIndexedPersonaReplayState(indexReplayEvents(events), "persona-2", 2)).toMatchObject({ isActive: true });
  });
});

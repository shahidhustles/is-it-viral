import { describe, expect, it } from "vitest";

import { analyzeVideoDna } from "./videoAnalysis";

const validAnalysis = {
  videoDna: { hook: 0.8, clarity: 0.7, pacing: 0.6, credibility: 0.75, audienceRelevance: 0.9, shareTrigger: 0.65 },
  explanations: { hook: "Opens with the result.", clarity: "The steps are understandable.", pacing: "Transitions move steadily.", credibility: "A shown example supports the claim.", audienceRelevance: "The topic fits home cooks.", shareTrigger: "The result is useful to pass on.", visualThemes: ["weeknight cooking"], spokenThemes: ["quick dinner"] },
  improvements: [
    { timestampSeconds: 0, opportunity: "The opening is generic.", suggestedEdit: "Lead with the result.", expectedAudienceEffect: "Faster relevance recognition." },
    { timestampSeconds: 8, opportunity: "The example arrives late.", suggestedEdit: "Bring it forward.", expectedAudienceEffect: "More sustained attention." },
    { timestampSeconds: 19, opportunity: "The ending lacks a takeaway.", suggestedEdit: "Add a concise summary.", expectedAudienceEffect: "A clearer reason to share." },
  ],
};

describe("Video DNA model boundary", () => {
  it("accepts a validated model response without contacting a vendor", async () => {
    await expect(analyzeVideoDna({ transcript: "Try this quick dinner.", frames: [{ second: 0, data: new Uint8Array([1, 2, 3]) }] }, async () => validAnalysis)).resolves.toEqual(validAnalysis);
  });

  it("rejects malformed model data before it can reach the saved simulation", async () => {
    await expect(analyzeVideoDna({ transcript: "Try this quick dinner.", frames: [] }, async () => ({ ...validAnalysis, improvements: validAnalysis.improvements.slice(0, 2) }))).rejects.toThrow();
  });
});

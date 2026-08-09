import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import { api, internal } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.*s");

const videoDna = {
  hook: 0.9,
  clarity: 0.85,
  pacing: 0.8,
  credibility: 0.75,
  audienceRelevance: 0.9,
  shareTrigger: 0.95,
};

describe("analysis report simulation", () => {
  it("saves a replayable report and only returns it to its owner", async () => {
    const t = convexTest(schema, modules);
    const owner = t.withIdentity({ tokenIdentifier: "https://clerk.example|owner", subject: "owner" });
    const other = t.withIdentity({ tokenIdentifier: "https://clerk.example|other", subject: "other" });
    const saved = await owner.mutation(api.accountDna.saveAccountDna, {
      niche: "Recipe videos",
      intendedAudience: "Home cooks looking for weeknight ideas.",
      primaryLanguage: "English",
      region: "India",
      replace: false,
    });

    await t.mutation(internal.accountDna.completeCohortGeneration, {
      accountDnaId: saved.accountDnaId,
      revision: 1,
      archetypes: archetypeFixture,
      modelId: "test-model",
      reasoningEffort: "medium",
      promptVersion: "test-prompt-v1",
      schemaVersion: "test-schema-v1",
    });

    const created = await owner.mutation(api.analysisReports.createForCurrentOwner, {
      seed: "report-replay-seed",
      videoDna,
    });
    const report = await owner.query(api.analysisReports.getForCurrentOwner, { reportId: created.reportId });

    expect(report).toMatchObject({
      seed: "report-replay-seed",
      videoDna,
      metrics: { totalReach: expect.any(Number), cascadeDepth: expect.any(Number) },
    });
    expect(report?.events).toEqual(expect.arrayContaining([
      expect.objectContaining({ round: 1, type: "exposed", source: "seed" }),
    ]));
    await expect(other.query(api.analysisReports.getForCurrentOwner, { reportId: created.reportId })).resolves.toBeNull();
  });
});

const archetypeFixture = Array.from({ length: 10 }, (_, index) => ({
  name: `Archetype ${index + 1}`,
  audienceSegment: index < 7 ? ("inTarget" as const) : ("adjacent" as const),
  ocean: { openness: 0.7, conscientiousness: 0.6, extraversion: 0.7, agreeableness: 0.6, neuroticism: 0.3 },
  interests: ["cooking", "useful advice"],
}));

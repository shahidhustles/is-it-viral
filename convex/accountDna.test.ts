import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import { api, internal } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.*s");

describe("Account DNA onboarding", () => {
  it("requires an owner and persists a fixture-backed stable audience cohort", async () => {
    const t = convexTest(schema, modules);
    const input = {
      niche: "Independent fitness coaching",
      intendedAudience: "Busy professionals rebuilding a consistent training habit.",
      primaryLanguage: "English",
      region: "India",
      replace: false,
    };

    await expect(t.query(api.accountDna.getForCurrentOwner)).resolves.toBeNull();

    await expect(t.mutation(api.accountDna.saveAccountDna, input)).rejects.toThrow(
      "Sign in to save your Account DNA.",
    );

    const owner = t.withIdentity({
      tokenIdentifier: "https://clerk.example|user_123",
      subject: "user_123",
    });

    const savedMutation = await owner.mutation(api.accountDna.saveAccountDna, input);

    const pending = await owner.query(api.accountDna.getForCurrentOwner);
    expect(pending).toMatchObject({
      niche: input.niche,
      intendedAudience: input.intendedAudience,
      primaryLanguage: input.primaryLanguage,
      region: input.region,
      cohort: {
        archetypeCount: 0,
      },
      generation: { status: "pending" },
    });

    await t.mutation(internal.accountDna.completeCohortGeneration, {
      accountDnaId: savedMutation.accountDnaId,
      revision: 1,
      archetypes: archetypeFixture,
      modelId: "test-model",
      reasoningEffort: "medium",
      promptVersion: "test-prompt-v1",
      schemaVersion: "test-schema-v1",
    });

    const saved = await owner.query(api.accountDna.getForCurrentOwner);
    expect(saved).toMatchObject({
      niche: input.niche,
      intendedAudience: input.intendedAudience,
      primaryLanguage: input.primaryLanguage,
      region: input.region,
      cohort: { archetypeCount: 10, personaCount: 100, inTargetCount: 70, adjacentCount: 30 },
      generation: { status: "ready", provenance: { modelId: "test-model", reasoningEffort: "medium" } },
    });
    expect(saved?.cohort.networkConnectionCount).toBeGreaterThan(0);
    const audienceLedger = await owner.query(api.accountDna.getAudienceLedgerForCurrentOwner);
    expect(audienceLedger?.archetypes).toHaveLength(10);
    expect(audienceLedger?.archetypes[0]).toMatchObject({
      name: "Curious cook",
      audienceSegment: "inTarget",
      interests: ["cooking", "useful advice"],
    });
    expect(audienceLedger?.archetypes[0].personas).toHaveLength(10);
    expect(audienceLedger?.archetypes[0].personas[0].connectionCount).toBeGreaterThan(0);

    const persistedCohort = await t.run(async (ctx) => {
      const account = await ctx.db
        .query("accountDnas")
        .withIndex("by_ownerTokenIdentifier", (q) =>
          q.eq("ownerTokenIdentifier", "https://clerk.example|user_123"),
        )
        .unique();

      if (!account) {
        throw new Error("Expected Account DNA to be persisted.");
      }

      const [archetypes, personas, connections, provenance] = await Promise.all([
        ctx.db
          .query("cohortArchetypes")
          .withIndex("by_accountDnaId", (q) => q.eq("accountDnaId", account._id))
          .take(10),
        ctx.db
          .query("cohortPersonas")
          .withIndex("by_accountDnaId", (q) => q.eq("accountDnaId", account._id))
          .take(100),
        ctx.db
          .query("cohortConnections")
          .withIndex("by_accountDnaId", (q) => q.eq("accountDnaId", account._id))
          .take(300),
        ctx.db
          .query("cohortProvenance")
          .withIndex("by_accountDnaId_and_revision", (q) =>
            q.eq("accountDnaId", account._id).eq("revision", 1),
          )
          .unique(),
      ]);

      return { archetypes, personas, connections, provenance };
    });

    expect(persistedCohort.archetypes).toHaveLength(10);
    expect(persistedCohort.personas).toHaveLength(100);
    expect(
      persistedCohort.personas.filter(
        (persona) => persona.audienceSegment === "inTarget",
      ),
    ).toHaveLength(70);
    expect(persistedCohort.connections.length).toBeGreaterThan(0);
    expect(persistedCohort.provenance).toMatchObject({
      status: "ready",
      modelId: "test-model",
      promptVersion: "test-prompt-v1",
      schemaVersion: "test-schema-v1",
    });

    const reopened = await owner.query(api.accountDna.getForCurrentOwner);
    expect(reopened).toEqual(saved);

    await expect(owner.mutation(api.accountDna.saveAccountDna, input)).rejects.toThrow(
      "Confirm replacement to save changes.",
    );

    await owner.mutation(api.accountDna.saveAccountDna, {
      ...input,
      niche: "Strength training for new parents",
      replace: true,
    });

    const replacement = await owner.query(api.accountDna.getForCurrentOwner);
    expect(replacement).toMatchObject({
      niche: "Strength training for new parents",
      revision: 2,
      cohort: {
        archetypeCount: 0,
      },
      generation: { status: "pending" },
    });
  });

  it("keeps Account DNA after a failed generation and only lets its owner retry", async () => {
    const t = convexTest(schema, modules);
    const owner = t.withIdentity({ tokenIdentifier: "https://clerk.example|owner", subject: "owner" });
    const other = t.withIdentity({ tokenIdentifier: "https://clerk.example|other", subject: "other" });
    const saved = await owner.mutation(api.accountDna.saveAccountDna, { niche: "Recipe videos", intendedAudience: "Home cooks looking for weeknight ideas.", primaryLanguage: "English", region: "India", replace: false });

    await t.mutation(internal.accountDna.failCohortGeneration, { accountDnaId: saved.accountDnaId, revision: 1, message: "Gateway unavailable" });
    expect((await owner.query(api.accountDna.getForCurrentOwner))?.generation).toMatchObject({ status: "failed", error: "Gateway unavailable" });
    await expect(other.mutation(api.accountDna.retryCohortGeneration)).rejects.toThrow("Create Account DNA");
    await expect(t.mutation(api.accountDna.retryCohortGeneration)).rejects.toThrow("Sign in");
    await owner.mutation(api.accountDna.retryCohortGeneration);
    expect((await owner.query(api.accountDna.getForCurrentOwner))?.generation.status).toBe("pending");
  });
});

const archetypeFixture = [
  ["Curious cook", "inTarget"], ["Methodical planner", "inTarget"], ["Practical parent", "inTarget"], ["Quick learner", "inTarget"], ["Budget experimenter", "inTarget"], ["Reliable regular", "inTarget"], ["Social sharer", "inTarget"], ["Casual browser", "adjacent"], ["Trend watcher", "adjacent"], ["Broad-interest viewer", "adjacent"],
].map(([name, audienceSegment], index) => ({
  name,
  audienceSegment: audienceSegment as "inTarget" | "adjacent",
  ocean: { openness: 0.4 + index * 0.02, conscientiousness: 0.5, extraversion: 0.6, agreeableness: 0.7, neuroticism: 0.3 },
  interests: ["cooking", "useful advice"],
}));

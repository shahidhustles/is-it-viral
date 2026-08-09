import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.*s");

describe("Account DNA onboarding", () => {
  it("requires an owner and persists one complete, stable audience cohort", async () => {
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

    await owner.mutation(api.accountDna.saveAccountDna, input);

    const saved = await owner.query(api.accountDna.getForCurrentOwner);
    expect(saved).toMatchObject({
      niche: input.niche,
      intendedAudience: input.intendedAudience,
      primaryLanguage: input.primaryLanguage,
      region: input.region,
      cohort: {
        archetypeCount: 10,
        personaCount: 100,
        inTargetCount: 70,
        adjacentCount: 30,
      },
    });
    expect(saved?.cohort.networkConnectionCount).toBeGreaterThan(0);

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

      const [archetypes, personas, connections] = await Promise.all([
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
      ]);

      return { archetypes, personas, connections };
    });

    expect(persistedCohort.archetypes).toHaveLength(10);
    expect(persistedCohort.personas).toHaveLength(100);
    expect(
      persistedCohort.personas.filter(
        (persona) => persona.audienceSegment === "inTarget",
      ),
    ).toHaveLength(70);
    expect(persistedCohort.connections.length).toBeGreaterThan(0);

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
        archetypeCount: 10,
        personaCount: 100,
        inTargetCount: 70,
        adjacentCount: 30,
      },
    });
  });
});

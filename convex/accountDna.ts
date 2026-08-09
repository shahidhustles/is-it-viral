import { v } from "convex/values";

import { cohortSeedFor, generateCohort } from "./cohort";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";

const MAX_ARCHETYPES = 10;
const MAX_PERSONAS = 100;
const MAX_CONNECTIONS = 300;

const cohortSummary = v.object({
  archetypeCount: v.number(),
  personaCount: v.number(),
  inTargetCount: v.number(),
  adjacentCount: v.number(),
  networkConnectionCount: v.number(),
});

const accountDnaResult = v.object({
  _id: v.id("accountDnas"),
  niche: v.string(),
  intendedAudience: v.string(),
  primaryLanguage: v.string(),
  region: v.string(),
  revision: v.number(),
  cohort: cohortSummary,
});

export const getForCurrentOwner = query({
  args: {},
  returns: v.union(v.null(), accountDnaResult),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Sign in to access your Account DNA.");
    }

    const account = await ctx.db
      .query("accountDnas")
      .withIndex("by_ownerTokenIdentifier", (q) =>
        q.eq("ownerTokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!account) {
      return null;
    }

    return {
      _id: account._id,
      niche: account.niche,
      intendedAudience: account.intendedAudience,
      primaryLanguage: account.primaryLanguage,
      region: account.region,
      revision: account.revision,
      cohort: {
        archetypeCount: account.archetypeCount,
        personaCount: account.personaCount,
        inTargetCount: account.inTargetCount,
        adjacentCount: account.adjacentCount,
        networkConnectionCount: account.networkConnectionCount,
      },
    };
  },
});

export const saveAccountDna = mutation({
  args: {
    niche: v.string(),
    intendedAudience: v.string(),
    primaryLanguage: v.string(),
    region: v.string(),
    replace: v.boolean(),
  },
  returns: v.object({
    accountDnaId: v.id("accountDnas"),
    wasReplaced: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Sign in to save your Account DNA.");
    }

    const input = normalizeInput(args);
    const existing = await ctx.db
      .query("accountDnas")
      .withIndex("by_ownerTokenIdentifier", (q) =>
        q.eq("ownerTokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (existing && !args.replace) {
      throw new Error("Your Account DNA already exists. Confirm replacement to save changes.");
    }

    const revision = existing ? existing.revision + 1 : 1;
    const cohortSeed = cohortSeedFor(input, revision);
    const cohort = generateCohort(input, cohortSeed);
    const now = Date.now();
    const cohortSummary = {
      archetypeCount: cohort.archetypes.length,
      personaCount: cohort.personas.length,
      inTargetCount: cohort.personas.filter(
        (persona) => persona.audienceSegment === "inTarget",
      ).length,
      adjacentCount: cohort.personas.filter(
        (persona) => persona.audienceSegment === "adjacent",
      ).length,
      networkConnectionCount: cohort.connections.length,
    };
    const accountFields = {
      ownerTokenIdentifier: identity.tokenIdentifier,
      ...input,
      cohortSeed,
      revision,
      ...cohortSummary,
      updatedAt: now,
    };

    const accountDnaId = existing
      ? existing._id
      : await ctx.db.insert("accountDnas", accountFields);

    if (existing) {
      await deleteCohort(ctx, existing._id);
      await ctx.db.patch(existing._id, accountFields);
    }

    const archetypeIds = new Map<number, Id<"cohortArchetypes">>();
    for (const archetype of cohort.archetypes) {
      const archetypeId = await ctx.db.insert("cohortArchetypes", {
        accountDnaId,
        archetypeIndex: archetype.archetypeIndex,
        name: archetype.name,
        audienceSegment: archetype.audienceSegment,
        ocean: archetype.ocean,
      });
      archetypeIds.set(archetype.archetypeIndex, archetypeId);
    }

    const personaIds = new Map<number, Id<"cohortPersonas">>();
    for (const persona of cohort.personas) {
      const archetypeId = archetypeIds.get(persona.archetypeIndex);
      if (!archetypeId) {
        throw new Error("The generated cohort is missing an archetype.");
      }

      const personaId = await ctx.db.insert("cohortPersonas", {
        accountDnaId,
        archetypeId,
        personaIndex: persona.personaIndex,
        audienceSegment: persona.audienceSegment,
        ocean: persona.ocean,
        affinityVector: persona.affinityVector,
        interests: persona.interests,
        sharingThreshold: persona.sharingThreshold,
        position: persona.position,
      });
      personaIds.set(persona.personaIndex, personaId);
    }

    for (const connection of cohort.connections) {
      const fromPersonaId = personaIds.get(connection.fromPersonaIndex);
      const toPersonaId = personaIds.get(connection.toPersonaIndex);
      if (!fromPersonaId || !toPersonaId) {
        throw new Error("The generated cohort is missing a network persona.");
      }

      await ctx.db.insert("cohortConnections", {
        accountDnaId,
        fromPersonaId,
        toPersonaId,
      });
    }

    return { accountDnaId, wasReplaced: Boolean(existing) };
  },
});

async function deleteCohort(
  ctx: MutationCtx,
  accountDnaId: Id<"accountDnas">,
) {
  const [connections, personas, archetypes] = await Promise.all([
    ctx.db
      .query("cohortConnections")
      .withIndex("by_accountDnaId", (q) => q.eq("accountDnaId", accountDnaId))
      .take(MAX_CONNECTIONS),
    ctx.db
      .query("cohortPersonas")
      .withIndex("by_accountDnaId", (q) => q.eq("accountDnaId", accountDnaId))
      .take(MAX_PERSONAS),
    ctx.db
      .query("cohortArchetypes")
      .withIndex("by_accountDnaId", (q) => q.eq("accountDnaId", accountDnaId))
      .take(MAX_ARCHETYPES),
  ]);

  for (const connection of connections) {
    await ctx.db.delete(connection._id);
  }
  for (const persona of personas) {
    await ctx.db.delete(persona._id);
  }
  for (const archetype of archetypes) {
    await ctx.db.delete(archetype._id);
  }
}

function normalizeInput(input: {
  niche: string;
  intendedAudience: string;
  primaryLanguage: string;
  region: string;
}) {
  const normalized = {
    niche: input.niche.trim(),
    intendedAudience: input.intendedAudience.trim(),
    primaryLanguage: input.primaryLanguage.trim(),
    region: input.region.trim(),
  };

  const fields: Array<[keyof typeof normalized, number]> = [
    ["niche", 100],
    ["intendedAudience", 1_000],
    ["primaryLanguage", 80],
    ["region", 120],
  ];

  for (const [field, maxLength] of fields) {
    if (!normalized[field]) {
      throw new Error(`${field} is required.`);
    }
    if (normalized[field].length > maxLength) {
      throw new Error(`${field} must be ${maxLength} characters or fewer.`);
    }
  }

  return normalized;
}

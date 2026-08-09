import { v } from "convex/values";

import { cohortSeedFor, generateCohort, validateArchetypes } from "./cohort";
import type { Id } from "./_generated/dataModel";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

const cohortSummary = v.object({
  archetypeCount: v.number(),
  personaCount: v.number(),
  inTargetCount: v.number(),
  adjacentCount: v.number(),
  networkConnectionCount: v.number(),
});

const archetypeInput = v.object({
  name: v.string(),
  audienceSegment: v.union(v.literal("inTarget"), v.literal("adjacent")),
  ocean: v.object({
    openness: v.number(),
    conscientiousness: v.number(),
    extraversion: v.number(),
    agreeableness: v.number(),
    neuroticism: v.number(),
  }),
  interests: v.array(v.string()),
});

const cohortLifecycle = v.object({
  status: v.union(v.literal("pending"), v.literal("ready"), v.literal("failed")),
  error: v.union(v.null(), v.string()),
  generatedAt: v.union(v.null(), v.number()),
  provenance: v.union(v.null(), v.object({
    modelId: v.string(),
    reasoningEffort: v.string(),
    promptVersion: v.string(),
    schemaVersion: v.string(),
  })),
});

const accountDnaResult = v.object({
  _id: v.id("accountDnas"),
  niche: v.string(),
  intendedAudience: v.string(),
  primaryLanguage: v.string(),
  region: v.string(),
  revision: v.number(),
  cohort: cohortSummary,
  generation: cohortLifecycle,
});

export const getForCurrentOwner = query({
  args: {},
  returns: v.union(v.null(), accountDnaResult),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
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
      generation: {
        status: account.cohortStatus ?? "ready",
        error: account.cohortError ?? null,
        generatedAt: account.cohortGeneratedAt ?? null,
        provenance: account.cohortModelId
          ? {
              modelId: account.cohortModelId,
              reasoningEffort: account.cohortReasoningEffort ?? "medium",
              promptVersion: account.cohortPromptVersion ?? "legacy",
              schemaVersion: account.cohortSchemaVersion ?? "legacy",
            }
          : null,
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
    const now = Date.now();
    const cohortSummary = {
      archetypeCount: 0,
      personaCount: 0,
      inTargetCount: 0,
      adjacentCount: 0,
      networkConnectionCount: 0,
    };
    const accountFields = {
      ownerTokenIdentifier: identity.tokenIdentifier,
      ...input,
      cohortSeed,
      revision,
      ...cohortSummary,
      updatedAt: now,
      cohortStatus: "pending" as const,
      cohortError: undefined,
      cohortGeneratedAt: undefined,
      cohortModelId: undefined,
      cohortReasoningEffort: undefined,
      cohortPromptVersion: undefined,
      cohortSchemaVersion: undefined,
    };

    const accountDnaId = existing
      ? existing._id
      : await ctx.db.insert("accountDnas", accountFields);

    if (existing) {
      await ctx.db.patch(existing._id, accountFields);
    }

    await ctx.db.insert("cohortProvenance", {
      accountDnaId,
      revision,
      status: "pending",
    });

    await ctx.scheduler.runAfter(0, internal.cohortGeneration.generateForAccountDna, {
      accountDnaId,
      revision,
    });

    return { accountDnaId, wasReplaced: Boolean(existing) };
  },
});

export const retryCohortGeneration = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Sign in to retry cohort generation.");
    const account = await ctx.db.query("accountDnas")
      .withIndex("by_ownerTokenIdentifier", (q) => q.eq("ownerTokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!account) throw new Error("Create Account DNA before generating a cohort.");
    if ((account.cohortStatus ?? "ready") !== "failed") throw new Error("Only a failed cohort generation can be retried.");
    const provenance = await ctx.db.query("cohortProvenance")
      .withIndex("by_accountDnaId_and_revision", (q) => q.eq("accountDnaId", account._id).eq("revision", account.revision))
      .unique();
    if (!provenance) throw new Error("The saved cohort provenance is missing.");
    await ctx.db.patch(account._id, { cohortStatus: "pending", cohortError: undefined, updatedAt: Date.now() });
    await ctx.db.patch(provenance._id, { status: "pending", error: undefined });
    await ctx.scheduler.runAfter(0, internal.cohortGeneration.generateForAccountDna, { accountDnaId: account._id, revision: account.revision });
    return null;
  },
});

export const getGenerationInput = internalQuery({
  args: { accountDnaId: v.id("accountDnas"), revision: v.number() },
  returns: v.union(v.null(), v.object({
    accountDnaId: v.id("accountDnas"), revision: v.number(), cohortSeed: v.string(),
    niche: v.string(), intendedAudience: v.string(), primaryLanguage: v.string(), region: v.string(),
  })),
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountDnaId);
    if (!account || account.revision !== args.revision || account.cohortStatus !== "pending") return null;
    const provenance = await ctx.db.query("cohortProvenance")
      .withIndex("by_accountDnaId_and_revision", (q) => q.eq("accountDnaId", account._id).eq("revision", account.revision))
      .unique();
    if (!provenance) throw new Error("The saved cohort provenance is missing.");
    return { accountDnaId: account._id, revision: account.revision, cohortSeed: account.cohortSeed, niche: account.niche, intendedAudience: account.intendedAudience, primaryLanguage: account.primaryLanguage, region: account.region };
  },
});

export const completeCohortGeneration = internalMutation({
  args: { accountDnaId: v.id("accountDnas"), revision: v.number(), archetypes: v.array(archetypeInput), modelId: v.string(), reasoningEffort: v.string(), promptVersion: v.string(), schemaVersion: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountDnaId);
    if (!account || account.revision !== args.revision || account.cohortStatus !== "pending") return null;
    const provenance = await ctx.db.query("cohortProvenance")
      .withIndex("by_accountDnaId_and_revision", (q) => q.eq("accountDnaId", account._id).eq("revision", account.revision))
      .unique();
    if (!provenance) throw new Error("The saved cohort provenance is missing.");
    const archetypes = validateArchetypes(args.archetypes);
    const cohort = generateCohort(account, account.cohortSeed, archetypes);
    const summary = { archetypeCount: cohort.archetypes.length, personaCount: cohort.personas.length, inTargetCount: 70, adjacentCount: 30, networkConnectionCount: cohort.connections.length };
    const archetypeIds = new Map<number, Id<"cohortArchetypes">>();
    for (const archetype of cohort.archetypes) {
      const archetypeId = await ctx.db.insert("cohortArchetypes", { accountDnaId: account._id, cohortRevision: account.revision, archetypeIndex: archetype.archetypeIndex, name: archetype.name, audienceSegment: archetype.audienceSegment, ocean: archetype.ocean, interests: archetype.interests });
      archetypeIds.set(archetype.archetypeIndex, archetypeId);
    }
    const personaIds = new Map<number, Id<"cohortPersonas">>();
    for (const persona of cohort.personas) {
      const archetypeId = archetypeIds.get(persona.archetypeIndex);
      if (!archetypeId) throw new Error("The generated cohort is missing an archetype.");
      const personaId = await ctx.db.insert("cohortPersonas", { accountDnaId: account._id, cohortRevision: account.revision, archetypeId, personaIndex: persona.personaIndex, audienceSegment: persona.audienceSegment, ocean: persona.ocean, affinityVector: persona.affinityVector, interests: persona.interests, sharingThreshold: persona.sharingThreshold, position: persona.position });
      personaIds.set(persona.personaIndex, personaId);
    }
    for (const connection of cohort.connections) {
      const fromPersonaId = personaIds.get(connection.fromPersonaIndex); const toPersonaId = personaIds.get(connection.toPersonaIndex);
      if (!fromPersonaId || !toPersonaId) throw new Error("The generated cohort is missing a network persona.");
      await ctx.db.insert("cohortConnections", { accountDnaId: account._id, cohortRevision: account.revision, fromPersonaId, toPersonaId });
    }
    await ctx.db.patch(account._id, { ...summary, cohortStatus: "ready", cohortGeneratedAt: Date.now(), cohortModelId: args.modelId, cohortReasoningEffort: args.reasoningEffort, cohortPromptVersion: args.promptVersion, cohortSchemaVersion: args.schemaVersion, cohortError: undefined, updatedAt: Date.now() });
    await ctx.db.patch(provenance._id, { status: "ready", generatedAt: Date.now(), modelId: args.modelId, reasoningEffort: args.reasoningEffort, promptVersion: args.promptVersion, schemaVersion: args.schemaVersion, error: undefined });
    return null;
  },
});

export const failCohortGeneration = internalMutation({
  args: { accountDnaId: v.id("accountDnas"), revision: v.number(), message: v.string() }, returns: v.null(),
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountDnaId);
    if (account && account.revision === args.revision && account.cohortStatus === "pending") {
      const message = args.message.slice(0, 300);
      const provenance = await ctx.db.query("cohortProvenance")
        .withIndex("by_accountDnaId_and_revision", (q) => q.eq("accountDnaId", account._id).eq("revision", account.revision))
        .unique();
      await ctx.db.patch(account._id, { cohortStatus: "failed", cohortError: message, updatedAt: Date.now() });
      if (provenance) await ctx.db.patch(provenance._id, { status: "failed", error: message });
    }
    return null;
  },
});

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

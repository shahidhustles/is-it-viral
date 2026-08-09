import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const oceanTraits = v.object({
  openness: v.number(),
  conscientiousness: v.number(),
  extraversion: v.number(),
  agreeableness: v.number(),
  neuroticism: v.number(),
});

const cohortStatus = v.union(
  v.literal("pending"),
  v.literal("ready"),
  v.literal("failed"),
);

export default defineSchema({
  accountDnas: defineTable({
    ownerTokenIdentifier: v.string(),
    niche: v.string(),
    intendedAudience: v.string(),
    primaryLanguage: v.string(),
    region: v.string(),
    cohortSeed: v.string(),
    revision: v.number(),
    archetypeCount: v.number(),
    personaCount: v.number(),
    inTargetCount: v.number(),
    adjacentCount: v.number(),
    networkConnectionCount: v.number(),
    updatedAt: v.number(),
    cohortStatus: v.optional(cohortStatus),
    cohortError: v.optional(v.string()),
    cohortGeneratedAt: v.optional(v.number()),
    cohortModelId: v.optional(v.string()),
    cohortReasoningEffort: v.optional(v.string()),
    cohortPromptVersion: v.optional(v.string()),
    cohortSchemaVersion: v.optional(v.string()),
  }).index("by_ownerTokenIdentifier", ["ownerTokenIdentifier"]),

  cohortProvenance: defineTable({
    accountDnaId: v.id("accountDnas"),
    revision: v.number(),
    status: cohortStatus,
    error: v.optional(v.string()),
    generatedAt: v.optional(v.number()),
    modelId: v.optional(v.string()),
    reasoningEffort: v.optional(v.string()),
    promptVersion: v.optional(v.string()),
    schemaVersion: v.optional(v.string()),
  })
    .index("by_accountDnaId", ["accountDnaId"])
    .index("by_accountDnaId_and_revision", ["accountDnaId", "revision"]),

  cohortArchetypes: defineTable({
    accountDnaId: v.id("accountDnas"),
    cohortRevision: v.optional(v.number()),
    archetypeIndex: v.number(),
    name: v.string(),
    audienceSegment: v.union(v.literal("inTarget"), v.literal("adjacent")),
    ocean: oceanTraits,
    interests: v.array(v.string()),
  })
    .index("by_accountDnaId", ["accountDnaId"])
    .index("by_accountDnaId_and_archetypeIndex", [
      "accountDnaId",
      "archetypeIndex",
    ]),

  cohortPersonas: defineTable({
    accountDnaId: v.id("accountDnas"),
    cohortRevision: v.optional(v.number()),
    archetypeId: v.id("cohortArchetypes"),
    personaIndex: v.number(),
    audienceSegment: v.union(v.literal("inTarget"), v.literal("adjacent")),
    ocean: oceanTraits,
    affinityVector: v.array(v.number()),
    interests: v.array(v.string()),
    sharingThreshold: v.number(),
    position: v.object({ x: v.number(), y: v.number() }),
  })
    .index("by_accountDnaId", ["accountDnaId"])
    .index("by_accountDnaId_and_personaIndex", [
      "accountDnaId",
      "personaIndex",
    ]),

  cohortConnections: defineTable({
    accountDnaId: v.id("accountDnas"),
    cohortRevision: v.optional(v.number()),
    fromPersonaId: v.id("cohortPersonas"),
    toPersonaId: v.id("cohortPersonas"),
  })
    .index("by_accountDnaId", ["accountDnaId"])
    .index("by_accountDnaId_and_fromPersonaId", [
      "accountDnaId",
      "fromPersonaId",
    ]),
});

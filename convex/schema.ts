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
    .index("by_accountDnaId_and_cohortRevision", [
      "accountDnaId",
      "cohortRevision",
    ])
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
    .index("by_accountDnaId_and_cohortRevision_and_personaIndex", [
      "accountDnaId",
      "cohortRevision",
      "personaIndex",
    ])
    .index("by_accountDnaId_and_personaIndex", ["accountDnaId", "personaIndex"]),

  cohortConnections: defineTable({
    accountDnaId: v.id("accountDnas"),
    cohortRevision: v.optional(v.number()),
    fromPersonaId: v.id("cohortPersonas"),
    toPersonaId: v.id("cohortPersonas"),
  })
    .index("by_accountDnaId", ["accountDnaId"])
    .index("by_accountDnaId_and_cohortRevision", ["accountDnaId", "cohortRevision"])
    .index("by_accountDnaId_and_fromPersonaId", [
      "accountDnaId",
      "fromPersonaId",
    ]),

  analysisReports: defineTable({
    ownerTokenIdentifier: v.string(),
    accountDnaId: v.id("accountDnas"),
    cohortRevision: v.number(),
    seed: v.string(),
    videoDna: v.object({
      hook: v.number(),
      clarity: v.number(),
      pacing: v.number(),
      credibility: v.number(),
      audienceRelevance: v.number(),
      shareTrigger: v.number(),
    }),
    metrics: v.object({
      totalReach: v.number(),
      inTargetReach: v.number(),
      outOfTargetReach: v.number(),
      simulatedShareRate: v.number(),
      cascadeDepth: v.number(),
    }),
    verdict: v.union(
      v.literal("Breakout potential"),
      v.literal("Strong in target"),
      v.literal("Mixed signal"),
      v.literal("Stops early"),
    ),
    stopReason: v.union(v.literal("fewerThanTwoNewExposures"), v.literal("maximumRoundsReached")),
    eventCount: v.number(),
    createdAt: v.number(),
    sourceUploadId: v.optional(v.id("reelUploads")),
    transcript: v.optional(v.string()),
    videoDnaExplanations: v.optional(v.object({
      hook: v.string(), clarity: v.string(), pacing: v.string(), credibility: v.string(), audienceRelevance: v.string(), shareTrigger: v.string(),
      visualThemes: v.array(v.string()), spokenThemes: v.array(v.string()),
    })),
    improvements: v.optional(v.array(v.object({
      timestampSeconds: v.number(),
      opportunity: v.string(),
      suggestedEdit: v.string(),
      expectedAudienceEffect: v.string(),
    }))),
  })
    .index("by_ownerTokenIdentifier", ["ownerTokenIdentifier"])
    .index("by_accountDnaId", ["accountDnaId"]),

  reelUploads: defineTable({
    ownerTokenIdentifier: v.string(),
    reelStorageId: v.id("_storage"),
    audioStorageId: v.id("_storage"),
    frameStorageIds: v.array(v.object({ second: v.number(), storageId: v.id("_storage") })),
    fileName: v.string(),
    contentType: v.string(),
    durationSeconds: v.number(),
    status: v.union(
      v.literal("queued"),
      v.literal("transcribing"),
      v.literal("analyzing"),
      v.literal("complete"),
      v.literal("failed"),
    ),
    error: v.optional(v.string()),
    reportId: v.optional(v.id("analysisReports")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_ownerTokenIdentifier", ["ownerTokenIdentifier"])
    .index("by_ownerTokenIdentifier_and_createdAt", ["ownerTokenIdentifier", "createdAt"]),

  reelUploadTickets: defineTable({
    ownerTokenIdentifier: v.string(),
    kind: v.union(v.literal("reel"), v.literal("audio"), v.literal("frame")),
    status: v.union(v.literal("issued"), v.literal("claimed")),
    storageId: v.optional(v.id("_storage")),
    createdAt: v.number(),
  })
    .index("by_ownerTokenIdentifier_and_storageId", ["ownerTokenIdentifier", "storageId"])
    .index("by_ownerTokenIdentifier_and_status", ["ownerTokenIdentifier", "status"]),

  analysisReportEvents: defineTable({
    analysisReportId: v.id("analysisReports"),
    order: v.number(),
    round: v.number(),
    type: v.union(v.literal("exposed"), v.literal("shared"), v.literal("didNotShare")),
    personaId: v.id("cohortPersonas"),
    source: v.union(v.null(), v.literal("seed"), v.literal("share"), v.literal("recommendation")),
    sourcePersonaId: v.union(v.null(), v.id("cohortPersonas")),
    score: v.union(v.null(), v.number()),
  })
    .index("by_analysisReportId_and_order", ["analysisReportId", "order"]),
});

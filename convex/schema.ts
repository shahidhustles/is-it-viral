import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const oceanTraits = v.object({
  openness: v.number(),
  conscientiousness: v.number(),
  extraversion: v.number(),
  agreeableness: v.number(),
  neuroticism: v.number(),
});

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
  }).index("by_ownerTokenIdentifier", ["ownerTokenIdentifier"]),

  cohortArchetypes: defineTable({
    accountDnaId: v.id("accountDnas"),
    archetypeIndex: v.number(),
    name: v.string(),
    audienceSegment: v.union(v.literal("inTarget"), v.literal("adjacent")),
    ocean: oceanTraits,
  })
    .index("by_accountDnaId", ["accountDnaId"])
    .index("by_accountDnaId_and_archetypeIndex", [
      "accountDnaId",
      "archetypeIndex",
    ]),

  cohortPersonas: defineTable({
    accountDnaId: v.id("accountDnas"),
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
    fromPersonaId: v.id("cohortPersonas"),
    toPersonaId: v.id("cohortPersonas"),
  })
    .index("by_accountDnaId", ["accountDnaId"])
    .index("by_accountDnaId_and_fromPersonaId", [
      "accountDnaId",
      "fromPersonaId",
    ]),
});

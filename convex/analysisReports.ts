import { v } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import { internalMutation, mutation, query, type MutationCtx } from "./_generated/server";
import { runSimulation, type VideoDna } from "./simulation";

const videoDnaValidator = v.object({
  hook: v.number(),
  clarity: v.number(),
  pacing: v.number(),
  credibility: v.number(),
  audienceRelevance: v.number(),
  shareTrigger: v.number(),
});

const improvementValidator = v.object({
  timestampSeconds: v.number(),
  opportunity: v.string(),
  suggestedEdit: v.string(),
  expectedAudienceEffect: v.string(),
});

const metricsValidator = v.object({
  totalReach: v.number(),
  inTargetReach: v.number(),
  outOfTargetReach: v.number(),
  simulatedShareRate: v.number(),
  cascadeDepth: v.number(),
});

const verdictValidator = v.union(
  v.literal("Breakout potential"),
  v.literal("Strong in target"),
  v.literal("Mixed signal"),
  v.literal("Stops early"),
);

const stopReasonValidator = v.union(
  v.literal("fewerThanTwoNewExposures"),
  v.literal("maximumRoundsReached"),
);

const eventValidator = v.object({
  order: v.number(),
  round: v.number(),
  type: v.union(v.literal("exposed"), v.literal("shared"), v.literal("didNotShare")),
  personaId: v.id("cohortPersonas"),
  source: v.union(v.null(), v.literal("seed"), v.literal("share"), v.literal("recommendation")),
  sourcePersonaId: v.union(v.null(), v.id("cohortPersonas")),
  score: v.union(v.null(), v.number()),
  action: v.optional(v.union(v.literal("noEngagement"), v.literal("watched"), v.literal("liked"), v.literal("commented"), v.literal("shared"))),
  watchCompletion: v.optional(v.number()),
  rationale: v.optional(v.string()),
  comment: v.optional(v.union(v.null(), v.string())),
});

const personaValidator = v.object({
  _id: v.id("cohortPersonas"),
  personaIndex: v.number(),
  audienceSegment: v.union(v.literal("inTarget"), v.literal("adjacent")),
  ocean: v.object({ openness: v.number(), conscientiousness: v.number(), extraversion: v.number(), agreeableness: v.number(), neuroticism: v.number() }),
  interests: v.array(v.string()),
  position: v.object({ x: v.number(), y: v.number() }),
});

const connectionValidator = v.object({
  fromPersonaId: v.id("cohortPersonas"),
  toPersonaId: v.id("cohortPersonas"),
});

const reportValidator = v.object({
  _id: v.id("analysisReports"),
  seed: v.string(),
  cohortRevision: v.number(),
  videoDna: videoDnaValidator,
  metrics: metricsValidator,
  verdict: verdictValidator,
  stopReason: stopReasonValidator,
  createdAt: v.number(),
  events: v.array(eventValidator),
  personas: v.array(personaValidator),
  connections: v.array(connectionValidator),
  sourceUploadId: v.optional(v.id("reelUploads")),
  transcript: v.optional(v.string()),
  videoDnaExplanations: v.optional(v.object({ hook: v.string(), clarity: v.string(), pacing: v.string(), credibility: v.string(), audienceRelevance: v.string(), shareTrigger: v.string(), visualThemes: v.array(v.string()), spokenThemes: v.array(v.string()) })),
  improvements: v.optional(v.array(improvementValidator)),
});

const reportSummaryValidator = v.object({
  _id: v.id("analysisReports"),
  verdict: verdictValidator,
  metrics: metricsValidator,
  createdAt: v.number(),
});

const mediaAnalysisValidator = v.object({
  uploadId: v.id("reelUploads"),
  transcript: v.string(),
  videoDna: videoDnaValidator,
  explanations: v.object({
    hook: v.string(), clarity: v.string(), pacing: v.string(), credibility: v.string(), audienceRelevance: v.string(), shareTrigger: v.string(), visualThemes: v.array(v.string()), spokenThemes: v.array(v.string()),
  }),
  improvements: v.array(improvementValidator),
});

export const createForCurrentOwner = mutation({
  args: { seed: v.string(), videoDna: videoDnaValidator },
  returns: v.object({ reportId: v.id("analysisReports") }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Sign in to run a cohort simulation.");

    const account = await ctx.db
      .query("accountDnas")
      .withIndex("by_ownerTokenIdentifier", (q) => q.eq("ownerTokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!account || account.cohortStatus !== "ready") {
      throw new Error("A ready Account DNA cohort is required before running a simulation.");
    }

    return await saveSimulationReport(ctx, account, identity.tokenIdentifier, args.seed.trim(), args.videoDna);
  },
});

export const createFromMediaAnalysis = internalMutation({
  args: mediaAnalysisValidator,
  returns: v.object({ reportId: v.id("analysisReports") }),
  handler: async (ctx, args) => {
    const upload = await ctx.db.get(args.uploadId);
    if (!upload) throw new Error("The uploaded reel is unavailable.");
    const account = await ctx.db
      .query("accountDnas")
      .withIndex("by_ownerTokenIdentifier", (q) => q.eq("ownerTokenIdentifier", upload.ownerTokenIdentifier))
      .unique();
    if (!account || account.cohortStatus !== "ready") {
      throw new Error("The saved audience cohort is no longer ready.");
    }
    if (args.improvements.length !== 3) {
      throw new Error("Video DNA must include exactly three improvement opportunities.");
    }
    const saved = await saveSimulationReport(
      ctx,
      account,
      upload.ownerTokenIdentifier,
      `reel-${args.uploadId}`,
      args.videoDna,
      { uploadId: args.uploadId, transcript: args.transcript, explanations: args.explanations, improvements: args.improvements },
    );
    await ctx.db.patch(upload._id, { status: "complete", reportId: saved.reportId, error: undefined, updatedAt: Date.now() });
    return saved;
  },
});

async function saveSimulationReport(
  ctx: MutationCtx,
  account: Doc<"accountDnas">,
  ownerTokenIdentifier: string,
  seed: string,
  videoDna: VideoDna,
  media?: { uploadId: Id<"reelUploads">; transcript: string; explanations: { hook: string; clarity: string; pacing: string; credibility: string; audienceRelevance: string; shareTrigger: string; visualThemes: string[]; spokenThemes: string[] }; improvements: Array<{ timestampSeconds: number; opportunity: string; suggestedEdit: string; expectedAudienceEffect: string }> },
) {
  const [personas, connections] = await Promise.all([
    ctx.db.query("cohortPersonas").withIndex("by_accountDnaId_and_cohortRevision_and_personaIndex", (q) => q.eq("accountDnaId", account._id).eq("cohortRevision", account.revision)).take(100),
    ctx.db.query("cohortConnections").withIndex("by_accountDnaId_and_cohortRevision", (q) => q.eq("accountDnaId", account._id).eq("cohortRevision", account.revision)).take(300),
  ]);
  if (personas.length < 10) throw new Error("The saved cohort is incomplete. Generate it again before running a simulation.");
  const simulation = runSimulation({ personas: personas.map((persona) => ({ id: persona._id, personaIndex: persona.personaIndex, audienceSegment: persona.audienceSegment, ocean: persona.ocean, affinityVector: persona.affinityVector, interests: persona.interests, sharingThreshold: persona.sharingThreshold })), connections: connections.map((connection) => ({ fromPersonaId: connection.fromPersonaId, toPersonaId: connection.toPersonaId })) }, videoDna, seed);
  const reportId = await ctx.db.insert("analysisReports", { ownerTokenIdentifier, accountDnaId: account._id, cohortRevision: account.revision, seed, videoDna, metrics: simulation.metrics, verdict: simulation.verdict, stopReason: simulation.stopReason, eventCount: simulation.events.length, createdAt: Date.now(), ...(media ? { sourceUploadId: media.uploadId, transcript: media.transcript, videoDnaExplanations: media.explanations, improvements: media.improvements } : {}) });
  for (const event of simulation.events) await ctx.db.insert("analysisReportEvents", { analysisReportId: reportId, ...event });
  return { reportId };
}

export const getForCurrentOwner = query({
  args: { reportId: v.id("analysisReports") },
  returns: v.union(v.null(), reportValidator),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const report = await ctx.db.get(args.reportId);
    if (!report || report.ownerTokenIdentifier !== identity.tokenIdentifier) return null;

    const events = await ctx.db
      .query("analysisReportEvents")
      .withIndex("by_analysisReportId_and_order", (q) => q.eq("analysisReportId", report._id))
      .take(500);
    const [personas, connections] = await Promise.all([
      ctx.db
        .query("cohortPersonas")
        .withIndex("by_accountDnaId_and_cohortRevision_and_personaIndex", (q) => q.eq("accountDnaId", report.accountDnaId).eq("cohortRevision", report.cohortRevision))
        .take(100),
      ctx.db
        .query("cohortConnections")
        .withIndex("by_accountDnaId_and_cohortRevision", (q) => q.eq("accountDnaId", report.accountDnaId).eq("cohortRevision", report.cohortRevision))
        .take(300),
    ]);
    return {
      _id: report._id,
      seed: report.seed,
      cohortRevision: report.cohortRevision,
      videoDna: report.videoDna,
      metrics: report.metrics,
      verdict: report.verdict,
      stopReason: report.stopReason,
      createdAt: report.createdAt,
      ...(report.sourceUploadId ? { sourceUploadId: report.sourceUploadId } : {}),
      ...(report.transcript ? { transcript: report.transcript } : {}),
      ...(report.videoDnaExplanations ? { videoDnaExplanations: report.videoDnaExplanations } : {}),
      ...(report.improvements ? { improvements: report.improvements } : {}),
      events: events.map((event) => ({
        order: event.order,
        round: event.round,
        type: event.type,
        personaId: event.personaId,
        source: event.source,
        sourcePersonaId: event.sourcePersonaId,
        score: event.score,
        ...(event.action ? { action: event.action } : {}),
        ...(event.watchCompletion !== undefined ? { watchCompletion: event.watchCompletion } : {}),
        ...(event.rationale ? { rationale: event.rationale } : {}),
        ...(event.comment !== undefined ? { comment: event.comment } : {}),
      })),
      personas: personas.map((persona) => ({
        _id: persona._id,
        personaIndex: persona.personaIndex,
        audienceSegment: persona.audienceSegment,
        ocean: persona.ocean,
        interests: persona.interests,
        position: persona.position,
      })),
      connections: connections.map((connection) => ({
        fromPersonaId: connection.fromPersonaId,
        toPersonaId: connection.toPersonaId,
      })),
    };
  },
});

export const listForCurrentOwner = query({
  args: {},
  returns: v.array(reportSummaryValidator),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const reports = await ctx.db
      .query("analysisReports")
      .withIndex("by_ownerTokenIdentifier", (q) =>
        q.eq("ownerTokenIdentifier", identity.tokenIdentifier),
      )
      .order("desc")
      .take(25);

    return reports.map((report) => ({
      _id: report._id,
      verdict: report.verdict,
      metrics: report.metrics,
      createdAt: report.createdAt,
    }));
  },
});

export type AnalysisVideoDna = VideoDna;

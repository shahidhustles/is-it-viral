import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { runSimulation, type VideoDna } from "./simulation";

const videoDnaValidator = v.object({
  hook: v.number(),
  clarity: v.number(),
  pacing: v.number(),
  credibility: v.number(),
  audienceRelevance: v.number(),
  shareTrigger: v.number(),
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

    const [personas, connections] = await Promise.all([
      ctx.db
        .query("cohortPersonas")
        .withIndex("by_accountDnaId_and_cohortRevision_and_personaIndex", (q) =>
          q.eq("accountDnaId", account._id).eq("cohortRevision", account.revision),
        )
        .take(100),
      ctx.db
        .query("cohortConnections")
        .withIndex("by_accountDnaId_and_cohortRevision", (q) =>
          q.eq("accountDnaId", account._id).eq("cohortRevision", account.revision),
        )
        .take(300),
    ]);
    if (personas.length < 10) throw new Error("The saved cohort is incomplete. Generate it again before running a simulation.");

    const simulation = runSimulation({
      personas: personas.map((persona) => ({
        id: persona._id,
        personaIndex: persona.personaIndex,
        audienceSegment: persona.audienceSegment,
        ocean: persona.ocean,
        affinityVector: persona.affinityVector,
        interests: persona.interests,
        sharingThreshold: persona.sharingThreshold,
      })),
      connections: connections.map((connection) => ({
        fromPersonaId: connection.fromPersonaId,
        toPersonaId: connection.toPersonaId,
      })),
    }, args.videoDna, args.seed.trim());

    const reportId = await ctx.db.insert("analysisReports", {
      ownerTokenIdentifier: identity.tokenIdentifier,
      accountDnaId: account._id,
      cohortRevision: account.revision,
      seed: args.seed.trim(),
      videoDna: args.videoDna,
      metrics: simulation.metrics,
      verdict: simulation.verdict,
      stopReason: simulation.stopReason,
      eventCount: simulation.events.length,
      createdAt: Date.now(),
    });
    for (const event of simulation.events) {
      await ctx.db.insert("analysisReportEvents", {
        analysisReportId: reportId,
        ...event,
        personaId: event.personaId,
        sourcePersonaId: event.sourcePersonaId,
      });
    }

    return { reportId };
  },
});

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
    return {
      _id: report._id,
      seed: report.seed,
      cohortRevision: report.cohortRevision,
      videoDna: report.videoDna,
      metrics: report.metrics,
      verdict: report.verdict,
      stopReason: report.stopReason,
      createdAt: report.createdAt,
      events: events.map((event) => ({
        order: event.order,
        round: event.round,
        type: event.type,
        personaId: event.personaId,
        source: event.source,
        sourcePersonaId: event.sourcePersonaId,
        score: event.score,
      })),
    };
  },
});

export type AnalysisVideoDna = VideoDna;

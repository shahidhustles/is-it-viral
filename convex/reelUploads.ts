import { v } from "convex/values";

import { internal } from "./_generated/api";
import { internalMutation, mutation, query } from "./_generated/server";

const frameValidator = v.object({ second: v.number(), storageId: v.id("_storage") });
const uploadStatus = v.union(v.literal("queued"), v.literal("transcribing"), v.literal("analyzing"), v.literal("complete"), v.literal("failed"));
const assetKind = v.union(v.literal("reel"), v.literal("audio"), v.literal("frame"));

export const generateUploadUrl = mutation({
  args: { kind: assetKind },
  returns: v.object({ uploadUrl: v.string(), ticketId: v.id("reelUploadTickets") }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Sign in before uploading a reel.");
    const pendingTickets = await ctx.db.query("reelUploadTickets").withIndex("by_ownerTokenIdentifier_and_status", (q) => q.eq("ownerTokenIdentifier", identity.tokenIdentifier).eq("status", "issued")).take(35);
    if (pendingTickets.length >= 35) throw new Error("Too many unfinished uploads are in progress. Refresh the page and try again.");
    const ticketId = await ctx.db.insert("reelUploadTickets", { ownerTokenIdentifier: identity.tokenIdentifier, kind: args.kind, status: "issued", createdAt: Date.now() });
    return { uploadUrl: await ctx.storage.generateUploadUrl(), ticketId };
  },
});

export const claimUploadedAsset = mutation({
  args: { ticketId: v.id("reelUploadTickets"), storageId: v.id("_storage") },
  returns: v.id("_storage"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Sign in before uploading a reel.");
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket || ticket.ownerTokenIdentifier !== identity.tokenIdentifier || ticket.status !== "issued") throw new Error("This upload authorization has expired. Please try again.");
    const metadata = await ctx.db.system.get("_storage", args.storageId);
    if (!metadata) throw new Error("The uploaded file is unavailable. Please try again.");
    const isExpectedAsset = ticket.kind === "reel"
      ? metadata.contentType?.startsWith("video/") && metadata.size <= 100 * 1024 * 1024
      : ticket.kind === "audio"
        ? metadata.contentType?.startsWith("audio/") && metadata.size <= 20 * 1024 * 1024
        : metadata.contentType === "image/jpeg" && metadata.size <= 3 * 1024 * 1024;
    if (!isExpectedAsset) {
      await ctx.storage.delete(args.storageId);
      throw new Error(ticket.kind === "reel" ? "Choose a supported video up to 100 MB." : "We could not verify a required reel sample. Please try again.");
    }
    await ctx.db.patch(ticket._id, { status: "claimed", storageId: args.storageId });
    return args.storageId;
  },
});

export const startForCurrentOwner = mutation({
  args: { reelStorageId: v.id("_storage"), audioStorageId: v.id("_storage"), frames: v.array(frameValidator), fileName: v.string(), contentType: v.string(), durationSeconds: v.number() },
  returns: v.object({ uploadId: v.id("reelUploads") }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Sign in before analyzing a reel.");
    if (!args.contentType.startsWith("video/")) throw new Error("Choose a supported video file.");
    if (!Number.isFinite(args.durationSeconds) || args.durationSeconds <= 0 || args.durationSeconds > 30) throw new Error("Choose a reel that is 30 seconds or less.");
    if (args.frames.length !== Math.ceil(args.durationSeconds) || args.frames.length > 30) throw new Error("We could not sample this reel once per second. Please try another video.");
    const account = await ctx.db.query("accountDnas").withIndex("by_ownerTokenIdentifier", (q) => q.eq("ownerTokenIdentifier", identity.tokenIdentifier)).unique();
    if (!account || account.cohortStatus !== "ready") throw new Error("A ready Account DNA cohort is required before analysis.");
    const assets = await Promise.all([args.reelStorageId, args.audioStorageId, ...args.frames.map((frame) => frame.storageId)].map(async (storageId) => await ctx.db.query("reelUploadTickets").withIndex("by_ownerTokenIdentifier_and_storageId", (q) => q.eq("ownerTokenIdentifier", identity.tokenIdentifier).eq("storageId", storageId)).unique()));
    if (assets.some((asset) => !asset || asset.status !== "claimed") || assets[0]?.kind !== "reel" || assets[1]?.kind !== "audio" || assets.slice(2).some((asset) => asset?.kind !== "frame")) throw new Error("We could not verify this upload. Please select the reel again.");
    const now = Date.now();
    const uploadId = await ctx.db.insert("reelUploads", { ownerTokenIdentifier: identity.tokenIdentifier, reelStorageId: args.reelStorageId, audioStorageId: args.audioStorageId, frameStorageIds: args.frames, fileName: args.fileName.slice(0, 200), contentType: args.contentType, durationSeconds: args.durationSeconds, status: "queued", createdAt: now, updatedAt: now });
    await ctx.scheduler.runAfter(0, internal.videoAnalysis.analyzeUpload, { uploadId });
    return { uploadId };
  },
});

export const getForCurrentOwner = query({
  args: { uploadId: v.id("reelUploads") },
  returns: v.union(v.null(), v.object({ _id: v.id("reelUploads"), fileName: v.string(), durationSeconds: v.number(), status: uploadStatus, error: v.optional(v.string()), reportId: v.optional(v.id("analysisReports")) })),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const upload = await ctx.db.get(args.uploadId);
    if (!upload || upload.ownerTokenIdentifier !== identity.tokenIdentifier) return null;
    return { _id: upload._id, fileName: upload.fileName, durationSeconds: upload.durationSeconds, status: upload.status, ...(upload.error ? { error: upload.error } : {}), ...(upload.reportId ? { reportId: upload.reportId } : {}) };
  },
});

export const setStatus = internalMutation({
  args: { uploadId: v.id("reelUploads"), status: uploadStatus, error: v.optional(v.string()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const upload = await ctx.db.get(args.uploadId);
    if (!upload) return null;
    await ctx.db.patch(upload._id, { status: args.status, ...(args.error ? { error: args.error } : { error: undefined }), updatedAt: Date.now() });
    return null;
  },
});

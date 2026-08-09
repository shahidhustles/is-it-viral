"use node";

import { gateway } from "@ai-sdk/gateway";
import { generateText, Output, transcribe } from "ai";
import { z } from "zod";
import { v } from "convex/values";

import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";

const VISUAL_MODEL = "meta/muse-spark-1.1";
const TRANSCRIPTION_MODEL = "openai/gpt-4o-mini-transcribe";

export const videoDnaSchema = z.object({
  hook: z.number().min(0).max(1),
  clarity: z.number().min(0).max(1),
  pacing: z.number().min(0).max(1),
  credibility: z.number().min(0).max(1),
  audienceRelevance: z.number().min(0).max(1),
  shareTrigger: z.number().min(0).max(1),
});

export const videoAnalysisSchema = z.object({
  videoDna: videoDnaSchema,
  explanations: z.object({
    hook: z.string().min(1).max(280), clarity: z.string().min(1).max(280), pacing: z.string().min(1).max(280), credibility: z.string().min(1).max(280), audienceRelevance: z.string().min(1).max(280), shareTrigger: z.string().min(1).max(280),
    visualThemes: z.array(z.string().min(1).max(80)).min(1).max(8),
    spokenThemes: z.array(z.string().min(1).max(80)).min(1).max(8),
  }),
  improvements: z.array(z.object({
    timestampSeconds: z.number().min(0).max(30),
    opportunity: z.string().min(1).max(280),
    suggestedEdit: z.string().min(1).max(280),
    expectedAudienceEffect: z.string().min(1).max(280),
  })).length(3),
});

export type VideoAnalysis = z.infer<typeof videoAnalysisSchema>;
type VisualAnalysisBoundary = (input: { transcript: string; frames: Array<{ second: number; data: Uint8Array }> }) => Promise<unknown>;

export const analyzeUpload = internalAction({
  args: { uploadId: v.id("reelUploads") },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      await ctx.runMutation(internal.reelUploads.setStatus, { uploadId: args.uploadId, status: "transcribing" });
      const input = await ctx.runQuery(internal.videoAnalysisInput.getForAnalysis, args);
      if (!input) return null;
      const audio = await ctx.storage.get(input.audioStorageId);
      if (!audio) throw new Error("The uploaded audio could not be read.");
      const transcription = await transcribe({ model: gateway.transcription(TRANSCRIPTION_MODEL), audio: new Uint8Array(await audio.arrayBuffer()) });
      if (!transcription.text.trim()) throw new Error("We could not find spoken audio in this reel.");
      await ctx.runMutation(internal.reelUploads.setStatus, { uploadId: args.uploadId, status: "analyzing" });
      const frames = await Promise.all(input.frameStorageIds.map(async (frame) => {
        const blob = await ctx.storage.get(frame.storageId);
        if (!blob) throw new Error("A sampled frame is unavailable.");
        return { second: frame.second, data: new Uint8Array(await blob.arrayBuffer()) };
      }));
      const analysis = await analyzeVideoDna({ transcript: transcription.text, frames });
      await ctx.runMutation(internal.analysisReports.createFromMediaAnalysis, { uploadId: args.uploadId, transcript: transcription.text, ...analysis });
    } catch (error) {
      console.error("Video analysis failed", error);
      await ctx.runMutation(internal.reelUploads.setStatus, { uploadId: args.uploadId, status: "failed", error: friendlyAnalysisError(error) });
    }
    return null;
  },
});

export async function analyzeVideoDna(input: { transcript: string; frames: Array<{ second: number; data: Uint8Array }> }, requestAnalysis: VisualAnalysisBoundary = requestVisualAnalysis): Promise<VideoAnalysis> {
  return videoAnalysisSchema.parse(await requestAnalysis(input));
}

async function requestVisualAnalysis(input: { transcript: string; frames: Array<{ second: number; data: Uint8Array }> }) {
  const result = await generateText({
    model: gateway(VISUAL_MODEL),
    output: Output.object({ schema: videoAnalysisSchema, name: "video_dna" }),
    messages: [{ role: "user", content: [
      { type: "text", text: `Assess this short Instagram-style reel for a synthetic audience simulation. The frames are sampled exactly once per second and arrive in chronological order. Use both the frames and transcript. Score each signal from 0 to 1. Give exactly three prioritized, timestamped edits; each must state the observed opportunity, a concrete edit, and the expected audience effect. Do not promise platform performance.\n\nTranscript:\n${input.transcript}` },
      ...input.frames.map((frame) => ({ type: "file" as const, data: frame.data, mediaType: "image/jpeg", filename: `frame-${frame.second}s.jpg` })),
    ] }],
  });
  return result.output;
}

function friendlyAnalysisError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown analysis error";
  if (message.includes("transcrib") || message.includes("audio")) return "We could not transcribe this reel’s audio. Try a reel with a clear audio track.";
  if (message.includes("video_dna") || message.includes("schema")) return "We received an incomplete Video DNA result. Please try the analysis again.";
  return "We could not analyze this reel right now. Your upload is saved; please try again.";
}

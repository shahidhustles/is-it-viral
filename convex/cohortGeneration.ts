"use node";

import { gateway } from "@ai-sdk/gateway";
import { generateText, Output } from "ai";
import { z } from "zod";

import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { v } from "convex/values";

const MODEL_ID = "meta/muse-spark-1.1";
const REASONING_EFFORT = "medium";
const PROMPT_VERSION = "cohort-archetypes-v1";
const SCHEMA_VERSION = "cohort-archetypes-v1";

const archetypeSchema = z.object({
  name: z.string().min(1).max(80),
  audienceSegment: z.enum(["inTarget", "adjacent"]),
  ocean: z.object({
    openness: z.number().min(0).max(1),
    conscientiousness: z.number().min(0).max(1),
    extraversion: z.number().min(0).max(1),
    agreeableness: z.number().min(0).max(1),
    neuroticism: z.number().min(0).max(1),
  }),
  interests: z.array(z.string().min(1).max(80)).min(2).max(5),
});

const outputSchema = z.object({
  archetypes: z.array(archetypeSchema).length(10).superRefine((archetypes, context) => {
    const inTarget = archetypes.filter((archetype) => archetype.audienceSegment === "inTarget").length;
    if (inTarget !== 7) context.addIssue({ code: "custom", message: "Return exactly 7 in-target archetypes." });
  }),
});

export const generateForAccountDna = internalAction({
  args: { accountDnaId: v.id("accountDnas"), revision: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const account = await ctx.runQuery(internal.accountDna.getGenerationInput, args);
    if (!account) return null;

    try {
      const result = await generateText({
        model: gateway(MODEL_ID),
        output: Output.object({ schema: outputSchema, name: "cohort_archetypes" }),
        providerOptions: { openai: { reasoningEffort: REASONING_EFFORT } },
        prompt: `Create a synthetic audience cohort for an Instagram reel creator. Return no identity, contact, or personal data.\n\nAccount DNA:\n- Niche: ${account.niche}\n- Intended audience: ${account.intendedAudience}\n- Primary language: ${account.primaryLanguage}\n- Region: ${account.region}\n\nCreate exactly 10 distinct, respectful OCEAN-informed archetypes: 7 inTarget and 3 adjacent. Each needs a concise name, five OCEAN scores, and 2–5 interests. These are inputs to a deterministic simulation, not real people.`,
      });
      await ctx.runMutation(internal.accountDna.completeCohortGeneration, {
        ...args,
        archetypes: result.output.archetypes,
        modelId: MODEL_ID,
        reasoningEffort: REASONING_EFFORT,
        promptVersion: PROMPT_VERSION,
        schemaVersion: SCHEMA_VERSION,
      });
    } catch (error) {
      await ctx.runMutation(internal.accountDna.failCohortGeneration, {
        ...args,
        message: "We could not generate your audience cohort. Please retry generation.",
      });
      console.error("Cohort generation failed", error);
    }
    return null;
  },
});

import { v } from "convex/values";

import { internalQuery } from "./_generated/server";

export const getForAnalysis = internalQuery({
  args: { uploadId: v.id("reelUploads") },
  returns: v.union(v.null(), v.object({ audioStorageId: v.id("_storage"), frameStorageIds: v.array(v.object({ second: v.number(), storageId: v.id("_storage") })) })),
  handler: async (ctx, args) => {
    const upload = await ctx.db.get(args.uploadId);
    if (!upload || upload.status === "complete") return null;
    return { audioStorageId: upload.audioStorageId, frameStorageIds: upload.frameStorageIds };
  },
});

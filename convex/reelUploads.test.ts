import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";

import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.*s");
const ownerIdentity = { tokenIdentifier: "https://clerk.example|owner", subject: "owner" };

describe("reel upload boundary", () => {
  it("refuses unauthenticated upload authorizations", async () => {
    const t = convexTest(schema, modules);
    await expect(t.mutation(api.reelUploads.generateUploadUrl, { kind: "reel" })).rejects.toThrow("Sign in");
  });

  it("surfaces invalid media and over-limit duration before it can schedule analysis", async () => {
    const t = convexTest(schema, modules);
    const owner = t.withIdentity(ownerIdentity);
    const reelStorageId = await t.run(async (ctx) => await ctx.storage.store(new Blob(["reel"], { type: "video/mp4" })));
    const audioStorageId = await t.run(async (ctx) => await ctx.storage.store(new Blob(["audio"], { type: "audio/webm" })));
    const args = { reelStorageId, audioStorageId, frames: [], fileName: "draft.mp4" };
    await expect(owner.mutation(api.reelUploads.startForCurrentOwner, { ...args, contentType: "image/png", durationSeconds: 12 })).rejects.toThrow("supported video");
    await expect(owner.mutation(api.reelUploads.startForCurrentOwner, { ...args, contentType: "video/mp4", durationSeconds: 31 })).rejects.toThrow("30 seconds");
  });
});

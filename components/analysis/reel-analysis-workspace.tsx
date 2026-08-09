"use client";

import { useMutation, useQuery } from "convex/react";
import { AlertCircle, FileVideo, LoaderCircle, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const MAX_DURATION_SECONDS = 30;

type UploadPhase = "idle" | "preparing" | "uploading" | "queued";

export function ReelAnalysisWorkspace() {
  const inputId = useId();
  const router = useRouter();
  const createUploadUrl = useMutation(api.reelUploads.generateUploadUrl);
  const claimUploadedAsset = useMutation(api.reelUploads.claimUploadedAsset);
  const startAnalysis = useMutation(api.reelUploads.startForCurrentOwner);
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [uploadId, setUploadId] = useState<Id<"reelUploads"> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const upload = useQuery(api.reelUploads.getForCurrentOwner, uploadId ? { uploadId } : "skip");

  useEffect(() => {
    if (upload?.reportId) router.replace(`/analyses/${upload.reportId}`);
  }, [router, upload?.reportId]);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("video/")) {
      setError("Choose an MP4, MOV, or another supported video file.");
      return;
    }
    try {
      setPhase("preparing");
      const prepared = await prepareReel(file);
      if (prepared.durationSeconds > MAX_DURATION_SECONDS) {
        setError("This reel is over 30 seconds. Trim it, then upload it again.");
        setPhase("idle");
        return;
      }
      setPhase("uploading");
      const reelStorageId = await uploadToConvex(file, file.type, "reel", createUploadUrl, claimUploadedAsset);
      const audioStorageId = await uploadToConvex(prepared.audio, prepared.audio.type, "audio", createUploadUrl, claimUploadedAsset);
      const frames = await Promise.all(prepared.frames.map(async (frame) => ({
        second: frame.second,
        storageId: await uploadToConvex(frame.blob, "image/jpeg", "frame", createUploadUrl, claimUploadedAsset),
      })));
      const started = await startAnalysis({ reelStorageId, audioStorageId, frames, fileName: file.name, contentType: file.type, durationSeconds: prepared.durationSeconds });
      setUploadId(started.uploadId);
      setPhase("queued");
    } catch (caught) {
      setPhase("idle");
      setError(readableUploadError(caught));
    }
  }

  return (
    <div className="max-w-4xl space-y-10">
      <header className="max-w-2xl space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Analyze a reel</h1>
        <p className="text-lg leading-8 text-muted-foreground">Upload a draft of 30 seconds or less. We’ll sample each second, transcribe the audio, and test its Video DNA against your saved audience cohort.</p>
      </header>

      {phase === "idle" ? (
        <label className="group block cursor-pointer border border-foreground bg-card p-8 transition-colors hover:bg-[var(--analysis-paper)] focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2" htmlFor={inputId}>
          <input accept="video/*" className="sr-only" id={inputId} onChange={(event) => void handleFile(event.target.files?.[0])} type="file" />
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4"><span className="grid size-12 place-items-center border border-foreground bg-background"><FileVideo aria-hidden="true" className="size-6" /></span><div className="space-y-1"><p className="text-lg font-semibold">Choose your reel</p><p className="max-w-xl leading-7 text-muted-foreground">MP4, MOV, or another browser-supported video. Keep it at 30 seconds or less.</p></div></div>
            <span className="inline-flex min-h-11 items-center justify-center gap-2 bg-primary px-4 text-sm font-medium text-primary-foreground group-hover:bg-primary/90"><Upload aria-hidden="true" className="size-4" />Select reel</span>
          </div>
        </label>
      ) : (
        <AnalysisProgress phase={phase} upload={upload} />
      )}

      {error ? <AnalysisNotice message={error} /> : null}
      <section aria-labelledby="analysis-method" className="grid gap-6 border-y border-border py-8 md:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-2"><h2 className="text-2xl font-semibold tracking-tight" id="analysis-method">What the assessment uses</h2><p className="max-w-2xl leading-7 text-muted-foreground">Visual frames, spoken audio, and your saved cohort all inform this report. The outcome is simulated guidance, not a prediction of Instagram’s private ranking system.</p></div>
        <ul className="space-y-2 text-sm leading-6 text-muted-foreground"><li>One visual sample per second</li><li>Full audio transcript</li><li>Saved deterministic cohort</li></ul>
      </section>
    </div>
  );
}

type ReelUploadState = {
  status: "queued" | "transcribing" | "analyzing" | "complete" | "failed";
  error?: string;
} | null | undefined;

function AnalysisProgress({ phase, upload }: { phase: UploadPhase; upload: ReelUploadState }) {
  const status = upload?.status;
  const label = phase === "preparing" ? "Preparing your reel" : phase === "uploading" ? "Saving the reel and its samples" : status === "transcribing" ? "Transcribing the audio" : status === "analyzing" ? "Building Video DNA" : status === "failed" ? "Analysis needs attention" : "Starting the assessment";
  return <section aria-busy={status !== "failed"} aria-live="polite" className="border border-foreground bg-card p-8"><div className="flex items-start gap-4"><span className="grid size-12 place-items-center border border-foreground bg-background">{status === "failed" ? <AlertCircle aria-hidden="true" className="size-6 text-destructive" /> : <LoaderCircle aria-hidden="true" className="size-6 animate-spin" />}</span><div className="space-y-2"><h2 className="text-xl font-semibold tracking-tight">{label}</h2><p className="leading-7 text-muted-foreground">{status === "failed" ? upload?.error : "This can take a moment. Keep this page open while we save the analysis."}</p>{status === "failed" ? <Button className="mt-3" onClick={() => window.location.reload()} variant="outline">Try another reel</Button> : null}</div></div></section>;
}

function AnalysisNotice({ message }: { message: string }) {
  return <div className="flex gap-3 border border-destructive bg-destructive/5 p-4 text-sm leading-6" role="alert"><AlertCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-destructive" /><p>{message}</p></div>;
}

async function prepareReel(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = url;
    await once(video, "loadedmetadata");
    if (!Number.isFinite(video.duration) || video.duration <= 0) throw new Error("We couldn’t read this video’s duration.");
    const durationSeconds = Math.ceil(video.duration);
    if (durationSeconds > MAX_DURATION_SECONDS) return { durationSeconds, frames: [], audio: new Blob() };
    video.muted = true;
    video.playsInline = true;
    const frames = await sampleFrames(video, durationSeconds);
    const audio = await extractAudio(video);
    return { durationSeconds, frames, audio };
  } finally { URL.revokeObjectURL(url); }
}

async function sampleFrames(video: HTMLVideoElement, durationSeconds: number) {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext("2d");
  if (!context || !canvas.width || !canvas.height) throw new Error("We couldn’t sample this reel’s visuals.");
  const frames: Array<{ second: number; blob: Blob }> = [];
  for (let second = 0; second < durationSeconds; second += 1) {
    video.currentTime = Math.min(second, Math.max(video.duration - 0.01, 0));
    await once(video, "seeked");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
    if (!blob) throw new Error("We couldn’t sample this reel’s visuals.");
    frames.push({ second, blob });
  }
  return frames;
}

async function extractAudio(video: HTMLVideoElement) {
  const capture = (video as HTMLVideoElement & { captureStream?: () => MediaStream }).captureStream;
  if (!capture || typeof MediaRecorder === "undefined") throw new Error("Your browser can’t extract this reel’s audio. Please try a current Chromium browser.");
  const stream = new MediaStream(capture.call(video).getAudioTracks());
  if (!stream.getAudioTracks().length) throw new Error("This reel has no audio track. Add spoken or recorded audio, then try again.");
  const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
  const chunks: BlobPart[] = [];
  recorder.addEventListener("dataavailable", (event) => chunks.push(event.data));
  const recorded = new Promise<Blob>((resolve, reject) => { recorder.addEventListener("stop", () => resolve(new Blob(chunks, { type: "audio/webm" })), { once: true }); recorder.addEventListener("error", () => reject(new Error("We couldn’t extract this reel’s audio.")), { once: true }); });
  video.currentTime = 0;
  recorder.start();
  await video.play();
  await once(video, "ended");
  recorder.stop();
  return await recorded;
}

async function uploadToConvex(
  blob: Blob,
  contentType: string,
  kind: "reel" | "audio" | "frame",
  createUploadUrl: (args: { kind: "reel" | "audio" | "frame" }) => Promise<{ uploadUrl: string; ticketId: Id<"reelUploadTickets"> }>,
  claimUploadedAsset: (args: { ticketId: Id<"reelUploadTickets">; storageId: Id<"_storage"> }) => Promise<Id<"_storage">>,
) {
  const { uploadUrl, ticketId } = await createUploadUrl({ kind });
  const response = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": contentType }, body: blob });
  if (!response.ok) throw new Error("We couldn’t save your reel securely. Please try again.");
  const body: unknown = await response.json();
  if (!body || typeof body !== "object" || !("storageId" in body) || typeof body.storageId !== "string") throw new Error("The upload service returned an invalid response.");
  return await claimUploadedAsset({ ticketId, storageId: body.storageId as Id<"_storage"> });
}

function once(target: EventTarget, event: string) { return new Promise<void>((resolve, reject) => { target.addEventListener(event, () => resolve(), { once: true }); target.addEventListener("error", () => reject(new Error("We couldn’t read this reel.")), { once: true }); }); }
function readableUploadError(error: unknown) { return error instanceof Error ? error.message : "We couldn’t prepare this reel. Please try again."; }

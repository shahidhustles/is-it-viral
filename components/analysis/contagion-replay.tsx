"use client";

import { Background, Controls, Handle, MarkerType, Position, ReactFlow, type Edge, type Node, type NodeProps } from "@xyflow/react";
import { Pause, Play, RotateCcw, StepBack, StepForward } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { getIndexedPersonaReplayState, getPersonaAction, getPersonaReplayState, getVisibleExposureEvents, indexReplayEvents, type GraphConnection, type GraphEvent, type GraphPersona } from "./contagion-replay-state";

type ContagionReplayProps = {
  personas: GraphPersona[];
  connections: GraphConnection[];
  events: GraphEvent[];
  cascadeDepth: number;
};

type PersonaNodeData = {
  persona: GraphPersona;
  state: ReturnType<typeof getPersonaReplayState>;
  selected: boolean;
};

type RecommendationNodeData = { round: number };

const nodeTypes = { persona: PersonaNode, recommendation: RecommendationNode };

export function ContagionReplay({ personas, connections, events, cascadeDepth }: ContagionReplayProps) {
  const totalRounds = Math.max(1, cascadeDepth);
  const [round, setRound] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);

  useEffect(() => {
    setRound((current) => Math.min(current, totalRounds));
  }, [totalRounds]);

  useEffect(() => {
    if (!isPlaying || round >= totalRounds) return;
    const timer = window.setInterval(() => setRound((current) => Math.min(current + 1, totalRounds)), 1500);
    return () => window.clearInterval(timer);
  }, [isPlaying, round, totalRounds]);

  const eventsByPersonaId = useMemo(() => indexReplayEvents(events), [events]);
  const replayStates = useMemo(
    () => new Map(personas.map((persona) => [persona._id, getIndexedPersonaReplayState(eventsByPersonaId, persona._id, round)])),
    [eventsByPersonaId, personas, round],
  );
  const nodes = useMemo<Node[]>(() => [
    ...personas.map((persona) => ({
      id: persona._id,
      type: "persona",
      position: persona.position,
      data: { persona, state: replayStates.get(persona._id)!, selected: persona._id === selectedPersonaId },
      selectable: true,
      draggable: false,
    })),
    {
      id: "recommendation-route",
      type: "recommendation",
      position: { x: 455, y: 10 },
      data: { round },
      selectable: false,
      draggable: false,
    },
  ], [personas, replayStates, round, selectedPersonaId]);
  const edges = useMemo<Edge[]>(() => {
    const visibleExposures = getVisibleExposureEvents(events, round);
    const directShareKeys = new Set(visibleExposures
      .filter((event) => event.source === "share" && event.sourcePersonaId)
      .map((event) => `${event.sourcePersonaId}-${event.personaId}`));
    const visiblePersonaIds = new Set(visibleExposures.map((event) => event.personaId));
    const savedNetworkEdges = connections
      .filter((connection) => visiblePersonaIds.has(connection.fromPersonaId) && visiblePersonaIds.has(connection.toPersonaId) && !directShareKeys.has(`${connection.fromPersonaId}-${connection.toPersonaId}`))
      .map((connection) => ({ id: `network-${connection.fromPersonaId}-${connection.toPersonaId}`, source: connection.fromPersonaId, target: connection.toPersonaId, selectable: false, style: { stroke: "#e5e5e5", strokeWidth: 1 } }));
    const exposureEdges = visibleExposures.flatMap((event) => {
      if (event.source === "seed") return [];
      const isDirectShare = event.source === "share" && event.sourcePersonaId !== null;
      const sourceId: string = event.source === "share" && event.sourcePersonaId !== null
        ? event.sourcePersonaId
        : "recommendation-route";
      return [{
        id: `exposure-${event.order}`,
        source: sourceId,
        target: event.personaId,
        label: isDirectShare ? "Direct share" : "Fit-based recommendation",
        animated: event.round === round,
        markerEnd: { type: MarkerType.ArrowClosed, color: "#262626", width: 12, height: 12 },
        style: isDirectShare
          ? { stroke: "#262626", strokeWidth: 1.5 }
          : { stroke: "#525252", strokeWidth: 1.5, strokeDasharray: "5 5" },
        labelStyle: { fill: "#262626", fontSize: 11, fontWeight: 600 },
        labelBgStyle: { fill: "#fcfff7", fillOpacity: 0.95 },
        labelBgPadding: [4, 3] as [number, number],
      }];
    });
    return [...savedNetworkEdges, ...exposureEdges];
  }, [connections, events, round]);
  const selectedPersona = personas.find((persona) => persona._id === selectedPersonaId) ?? null;
  const selectedState = selectedPersona ? replayStates.get(selectedPersona._id) ?? null : null;

  const moveToRound = (nextRound: number) => {
    setIsPlaying(false);
    setRound(Math.max(1, Math.min(nextRound, totalRounds)));
  };

  return (
    <section aria-labelledby="contagion-replay-heading" className="space-y-5 border-y border-border py-8">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
        <div className="max-w-2xl space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight" id="contagion-replay-heading">See how interest may spread</h2>
          <p className="text-muted-foreground">Follow the path from first view to possible shares and new viewers. This is a private preview, not Instagram ranking data.</p>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">Select a point to see what may have shaped the response.</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="overflow-hidden border border-foreground bg-[var(--analysis-paper)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-foreground bg-background px-4 py-3">
            <p aria-live="polite" className="text-sm font-medium">View {round} of {totalRounds}{round === totalRounds ? " · complete" : " · in progress"}</p>
            <div className="flex items-center gap-2">
              <Button aria-label="Restart replay" onClick={() => { setRound(1); setIsPlaying(true); }} size="icon-sm" variant="outline"><RotateCcw aria-hidden="true" /></Button>
              <Button aria-label="Previous pass" disabled={round === 1} onClick={() => moveToRound(round - 1)} size="icon-sm" variant="outline"><StepBack aria-hidden="true" /></Button>
              <Button aria-label={isPlaying ? "Pause replay" : "Play replay"} onClick={() => setIsPlaying((current) => !current)} size="sm" variant="outline">{isPlaying ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}{isPlaying ? "Pause" : "Play"}</Button>
              <Button aria-label="Next view" disabled={round === totalRounds} onClick={() => moveToRound(round + 1)} size="icon-sm" variant="outline"><StepForward aria-hidden="true" /></Button>
            </div>
          </div>
          <div className="h-[34rem] min-h-100 sm:h-[38rem]">
            <ReactFlow
              edges={edges}
              elementsSelectable
              fitView
              fitViewOptions={{ padding: 0.16 }}
              nodes={nodes}
              nodesConnectable={false}
              nodesDraggable={false}
              nodesFocusable
              nodeTypes={nodeTypes}
              onNodeClick={(_, node) => { if (node.type === "persona") setSelectedPersonaId(node.id); }}
              panOnDrag
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#e5e5e5" gap={28} size={1} />
              <Controls showInteractive={false} />
            </ReactFlow>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-border bg-background px-4 py-3 text-xs text-muted-foreground">
            <LegendItem className="border-foreground bg-background" label="Unexposed" />
            <LegendItem className="border-foreground bg-[var(--verified-wash)]" label="Exposed" />
            <LegendItem className="border-foreground bg-[var(--signal-lime)]" label="Active pass" />
            <LegendItem className="border-foreground bg-background" label="Watched" />
            <LegendItem className="border-foreground bg-[var(--verified-wash)]" label="Liked" />
            <LegendItem className="border-2 border-foreground bg-card" label="Commented" />
            <LegendItem className="border-foreground bg-[var(--signal-lime)]" label="Shared" />
            <LegendItem className="border-dashed border-muted-foreground bg-background" label="New viewers" />
          </div>
        </div>
        <PersonaDetail persona={selectedPersona} state={selectedState} />
      </div>
    </section>
  );
}

function PersonaNode({ data }: NodeProps<Node<PersonaNodeData>>) {
  const { persona, state, selected } = data;
  const action = getPersonaAction(state.reaction);
  return (
    <>
      <Handle className="!pointer-events-none !h-px !w-px !border-0 !opacity-0" position={Position.Top} type="target" />
      <div
        aria-label={`Audience member, ${persona.audienceSegment === "inTarget" ? "core audience" : "new viewer"}${state.exposure ? ", viewed" : ", not reached"}${action ? `, ${action}` : ""}`}
        className={cn(
          "flex size-10 items-center justify-center rounded-full border bg-background text-xs font-semibold tabular-nums transition-[transform,background-color,box-shadow] motion-reduce:transition-none",
          persona.audienceSegment === "adjacent" && "border-dashed border-muted-foreground",
          persona.audienceSegment === "inTarget" && "border-foreground",
          state.exposure && "bg-[var(--verified-wash)]",
          action === "noEngagement" && !state.isActive && "bg-[var(--analysis-paper)]",
          action === "watched" && !state.isActive && "bg-background",
          action === "liked" && !state.isActive && "bg-[var(--verified-wash)]",
          action === "commented" && !state.isActive && "border-2 bg-card",
          state.isActive && "scale-125 bg-[var(--signal-lime)] shadow-[var(--shadow-action)] motion-safe:animate-pulse",
          selected && "ring-2 ring-foreground ring-offset-2",
          action === "shared" && !state.isActive && "bg-[var(--signal-lime)]",
        )}
        title="Audience member"
      >
        {String(persona.personaIndex + 1).padStart(2, "0")}
      </div>
      <Handle className="!pointer-events-none !h-px !w-px !border-0 !opacity-0" position={Position.Bottom} type="source" />
    </>
  );
}

function RecommendationNode({ data }: NodeProps<Node<RecommendationNodeData>>) {
  return <div className="max-w-32 border border-dashed border-muted-foreground bg-background px-2 py-1 text-center text-xs leading-3 text-muted-foreground">Possible discovery<br />view {data.round}</div>;
}

function PersonaDetail({ persona, state }: { persona: GraphPersona | null; state: ReturnType<typeof getPersonaReplayState> | null }) {
  if (!persona || !state) {
    return <aside aria-label="Audience details" className="border border-border bg-background p-5"><h3 className="font-semibold">Audience details</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Select a point to see the interests and response behind this preview.</p></aside>;
  }

  const action = getPersonaAction(state.reaction);
  return (
    <aside aria-label="Audience member details" className="border border-foreground bg-background p-5">
      <p className="text-sm font-medium text-muted-foreground">{persona.audienceSegment === "inTarget" ? "Core audience" : "New viewer"}</p>
      <h3 className="mt-2 text-xl font-semibold tracking-tight">Audience details</h3>
      <dl className="mt-5 space-y-4 text-sm">
        <DetailRow label="Interests" value={persona.interests.slice(0, 3).join(", ")} />
        <DetailRow label="How they found it" value={state.exposure ? formatSource(state.exposure.source) : "Not reached in this preview"} />
        <DetailRow label="Response" value={action ? formatAction(action) : "No response recorded"} />
        <DetailRow label="Watched" value={state.reaction?.watchCompletion !== undefined ? `${Math.round(state.reaction.watchCompletion * 100)}% watched` : "No watch data"} />
      </dl>
      <div className="mt-5 border-t border-border pt-4"><p className="text-sm font-medium">Why this may happen</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{state.reaction?.rationale ?? "No extra detail is available for this saved result."}</p></div>
      {state.reaction?.action === "commented" && state.reaction.comment ? <div className="mt-4 border border-border bg-card p-3"><p className="text-xs font-medium text-muted-foreground">Possible comment</p><p className="mt-1 text-sm leading-6">“{state.reaction.comment}”</p></div> : null}
    </aside>
  );
}

function LegendItem({ className, label }: { className: string; label: string }) {
  return <span className="flex items-center gap-2"><span aria-hidden="true" className={cn("size-3 rounded-full border", className)} />{label}</span>;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-muted-foreground">{label}</dt><dd className="mt-1 leading-5">{value}</dd></div>;
}

function formatSource(source: GraphEvent["source"]) {
  if (source === "seed") return "first look";
  if (source === "share") return "direct share";
  if (source === "recommendation") return "possible discovery";
  return "not recorded";
}

function formatAction(action: NonNullable<ReturnType<typeof getPersonaAction>>) {
  return action === "noEngagement" ? "No engagement" : action[0].toUpperCase() + action.slice(1);
}

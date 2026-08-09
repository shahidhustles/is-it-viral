export type GraphPersona = {
  _id: string;
  personaIndex: number;
  audienceSegment: "inTarget" | "adjacent";
  ocean: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  interests: string[];
  position: { x: number; y: number };
};

export type GraphConnection = {
  fromPersonaId: string;
  toPersonaId: string;
};

export type GraphEvent = {
  order: number;
  round: number;
  type: "exposed" | "shared" | "didNotShare";
  personaId: string;
  source: "seed" | "share" | "recommendation" | null;
  sourcePersonaId: string | null;
  score: number | null;
  action?: "noEngagement" | "watched" | "liked" | "commented" | "shared";
  watchCompletion?: number;
  rationale?: string;
  comment?: string | null;
};

export type PersonaReplayState = {
  exposure: GraphEvent | null;
  reaction: GraphEvent | null;
  isActive: boolean;
};

export function getPersonaReplayState(events: GraphEvent[], personaId: string, round: number): PersonaReplayState {
  return getIndexedPersonaReplayState(indexReplayEvents(events), personaId, round);
}

export function indexReplayEvents(events: GraphEvent[]) {
  const eventsByPersonaId = new Map<string, GraphEvent[]>();
  for (const event of events) {
    const personaEvents = eventsByPersonaId.get(event.personaId) ?? [];
    personaEvents.push(event);
    eventsByPersonaId.set(event.personaId, personaEvents);
  }
  return eventsByPersonaId;
}

export function getIndexedPersonaReplayState(eventsByPersonaId: Map<string, GraphEvent[]>, personaId: string, round: number): PersonaReplayState {
  const visibleEvents = (eventsByPersonaId.get(personaId) ?? []).filter((event) => event.round <= round);
  const exposure = visibleEvents.find((event) => event.type === "exposed") ?? null;
  const reaction = visibleEvents.find((event) => event.type === "shared" || event.type === "didNotShare") ?? null;

  return {
    exposure,
    reaction,
    isActive: exposure?.round === round,
  };
}

export function getVisibleExposureEvents(events: GraphEvent[], round: number) {
  return events.filter((event) => event.type === "exposed" && event.round <= round);
}

export function getPersonaAction(reaction: GraphEvent | null) {
  if (!reaction) return null;
  return reaction.action ?? (reaction.type === "shared" ? "shared" : null);
}

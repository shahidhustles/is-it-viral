export type AudienceSegment = "inTarget" | "adjacent";

export type VideoDna = {
  hook: number;
  clarity: number;
  pacing: number;
  credibility: number;
  audienceRelevance: number;
  shareTrigger: number;
};

export type SimulationPersona<PersonaId extends string = string> = {
  id: PersonaId;
  personaIndex: number;
  audienceSegment: AudienceSegment;
  ocean: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  affinityVector: number[];
  interests: string[];
  sharingThreshold: number;
};

export type SimulationConnection<PersonaId extends string = string> = {
  fromPersonaId: PersonaId;
  toPersonaId: PersonaId;
};

export type SimulationCohort<PersonaId extends string = string> = {
  personas: SimulationPersona<PersonaId>[];
  connections: SimulationConnection<PersonaId>[];
};

export type SimulationEvent<PersonaId extends string = string> = {
  order: number;
  round: number;
  type: "exposed" | "shared" | "didNotShare";
  personaId: PersonaId;
  source: "seed" | "share" | "recommendation" | null;
  sourcePersonaId: PersonaId | null;
  score: number | null;
  action?: "noEngagement" | "watched" | "liked" | "commented" | "shared";
  watchCompletion?: number;
  rationale?: string;
  comment?: string | null;
};

export type SimulationMetrics = {
  totalReach: number;
  inTargetReach: number;
  outOfTargetReach: number;
  simulatedShareRate: number;
  cascadeDepth: number;
};

export type SimulationVerdict =
  | "Breakout potential"
  | "Strong in target"
  | "Mixed signal"
  | "Stops early";

export type SimulationResult<PersonaId extends string = string> = {
  events: SimulationEvent<PersonaId>[];
  metrics: SimulationMetrics;
  verdict: SimulationVerdict;
  stopReason: "fewerThanTwoNewExposures" | "maximumRoundsReached";
};

type QueuedExposure<PersonaId extends string = string> = {
  personaId: PersonaId;
  source: "seed" | "share" | "recommendation";
  sourcePersonaId: PersonaId | null;
};

const MAX_ROUNDS = 6;
const SEED_PERSONA_COUNT = 10;

export function runSimulation<PersonaId extends string>(
  cohort: SimulationCohort<PersonaId>,
  videoDna: VideoDna,
  seed: string,
): SimulationResult<PersonaId> {
  validateSimulationInput(cohort, videoDna, seed);

  const random = seededRandom(seed);
  const personas = [...cohort.personas].sort((left, right) => left.personaIndex - right.personaIndex);
  const personasById = new Map<PersonaId, SimulationPersona<PersonaId>>(personas.map((persona) => [persona.id, persona]));
  const connectionsByPersonaId = groupConnections(cohort.connections);
  const events: SimulationEvent<PersonaId>[] = [];
  const exposedPersonaIds = new Set<PersonaId>();
  let currentRound: QueuedExposure<PersonaId>[] = personas.slice(0, SEED_PERSONA_COUNT).map((persona) => ({
    personaId: persona.id,
    source: "seed" as const,
    sourcePersonaId: null,
  }));
  let cascadeDepth = 0;
  let shares = 0;
  const sharedScores = new Map<PersonaId, number>();
  let stopReason: SimulationResult<PersonaId>["stopReason"] = "maximumRoundsReached";

  for (let round = 1; round <= MAX_ROUNDS && currentRound.length > 0; round += 1) {
    cascadeDepth = round;
    const sharers: Array<{ personaId: PersonaId; score: number }> = [];

    for (const exposure of currentRound) {
      const persona = personasById.get(exposure.personaId);
      if (!persona || exposedPersonaIds.has(persona.id)) continue;

      exposedPersonaIds.add(persona.id);
      events.push({
        order: events.length,
        round,
        type: "exposed",
        personaId: persona.id,
        source: exposure.source,
        sourcePersonaId: exposure.sourcePersonaId,
        score: null,
      });

      const engagementScore = calculateEngagementScore(
        persona,
        videoDna,
        random(),
        exposure.source,
        exposure.sourcePersonaId ? sharedScores.get(exposure.sourcePersonaId) : undefined,
      );
      const reaction = derivePersonaReaction(persona, engagementScore);
      const type = reaction.action === "shared" ? "shared" : "didNotShare";
      events.push({
        order: events.length,
        round,
        type,
        personaId: persona.id,
        source: null,
        sourcePersonaId: null,
        score: engagementScore,
        ...reaction,
      });

      if (type === "shared") {
        shares += 1;
        sharedScores.set(persona.id, engagementScore);
        sharers.push({ personaId: persona.id, score: engagementScore });
      }
    }

    if (round === MAX_ROUNDS) break;

    const nextRound = selectNextExposures({
      sharers,
      personas,
      connectionsByPersonaId,
      exposedPersonaIds,
      videoDna,
      random,
    });

    if (nextRound.length < 2) {
      stopReason = "fewerThanTwoNewExposures";
      break;
    }

    currentRound = nextRound;
  }

  const metrics = calculateMetrics(personasById, exposedPersonaIds, shares, cascadeDepth);
  return {
    events,
    metrics,
    verdict: deriveVerdict(metrics, stopReason),
    stopReason,
  };
}

function derivePersonaReaction(persona: SimulationPersona, score: number) {
  const action = score >= persona.sharingThreshold
    ? "shared"
    : score >= 0.78
      ? "commented"
        : score >= 0.58
          ? "liked"
          : score >= 0.38
            ? "watched"
            : "noEngagement";
  const watchCompletion = round(clamp(0.28 + score * 0.7 + persona.ocean.conscientiousness * 0.06));
  const primaryInterest = persona.interests[0] ?? "this topic";
  const rationale = action === "shared"
    ? `The fit score cleared this persona's sharing threshold, reinforced by interest in ${primaryInterest}.`
    : action === "commented"
      ? `The fit score prompted a response around ${primaryInterest}, but did not clear the sharing threshold.`
      : action === "liked"
      ? `The fit score showed interest in ${primaryInterest}, without enough momentum to share.`
        : action === "watched"
          ? `The fit score supported viewing, but not a stronger engagement action for ${primaryInterest}.`
          : `The fit score did not create a recorded engagement action around ${primaryInterest}.`;

  return {
    action,
    watchCompletion,
    rationale,
    comment: action === "commented" ? `Worth considering for ${primaryInterest}.` : null,
  } as const;
}

function selectNextExposures<PersonaId extends string>({
  sharers,
  personas,
  connectionsByPersonaId,
  exposedPersonaIds,
  videoDna,
  random,
}: {
  sharers: Array<{ personaId: PersonaId; score: number }>;
  personas: SimulationPersona<PersonaId>[];
  connectionsByPersonaId: Map<PersonaId, PersonaId[]>;
  exposedPersonaIds: Set<PersonaId>;
  videoDna: VideoDna;
  random: () => number;
}): QueuedExposure<PersonaId>[] {
  const selections = new Map<PersonaId, { personaId: PersonaId; source: "share" | "recommendation"; sourcePersonaId: PersonaId | null; score: number }>();

  for (const sharer of sharers) {
    for (const personaId of connectionsByPersonaId.get(sharer.personaId) ?? []) {
      if (exposedPersonaIds.has(personaId) || selections.has(personaId)) continue;
      selections.set(personaId, { personaId, source: "share", sourcePersonaId: sharer.personaId, score: sharer.score });
    }
  }

  const recommendations = personas
    .filter((persona) => !exposedPersonaIds.has(persona.id) && !selections.has(persona.id))
    .map((persona) => ({
      persona,
      score: recommendationScore(persona, videoDna, random()),
    }))
    .filter(({ score }) => score >= 0.66)
    .sort((left, right) => right.score - left.score || left.persona.personaIndex - right.persona.personaIndex)
    .slice(0, 3);

  for (const { persona, score } of recommendations) {
    selections.set(persona.id, { personaId: persona.id, source: "recommendation", sourcePersonaId: null, score });
  }

  return [...selections.values()]
    .sort((left, right) => right.score - left.score || left.personaId.localeCompare(right.personaId))
    .map(({ personaId, source, sourcePersonaId }) => ({ personaId, source, sourcePersonaId }));
}

function calculateEngagementScore(
  persona: SimulationPersona,
  videoDna: VideoDna,
  noise: number,
  source: "seed" | "share" | "recommendation",
  priorShareScore: number | undefined,
) {
  const videoQuality = (
    videoDna.hook * 0.2 +
    videoDna.clarity * 0.16 +
    videoDna.pacing * 0.12 +
    videoDna.credibility * 0.14 +
    videoDna.audienceRelevance * 0.2 +
    videoDna.shareTrigger * 0.18
  );
  const personaAffinity = average(persona.affinityVector);
  const socialDrive = persona.ocean.extraversion * 0.12 + persona.ocean.openness * 0.08;
  const segmentFit = persona.audienceSegment === "inTarget" ? 0.08 : -0.03;
  const exposureLift = source === "share" ? 0.03 : source === "recommendation" ? 0.015 : 0;
  const socialProof = priorShareScore ? priorShareScore * 0.04 : 0;
  return round(clamp(videoQuality * 0.58 + personaAffinity * 0.2 + socialDrive + segmentFit + exposureLift + socialProof + (noise - 0.5) * 0.08));
}

function recommendationScore(persona: SimulationPersona, videoDna: VideoDna, noise: number) {
  return round(clamp(
    average(persona.affinityVector) * 0.45 +
    videoDna.audienceRelevance * (persona.audienceSegment === "inTarget" ? 0.33 : 0.18) +
    videoDna.hook * 0.12 +
    persona.ocean.openness * 0.06 +
    (noise - 0.5) * 0.04,
  ));
}

function calculateMetrics<PersonaId extends string>(
  personasById: Map<PersonaId, SimulationPersona<PersonaId>>,
  exposedPersonaIds: Set<PersonaId>,
  shares: number,
  cascadeDepth: number,
): SimulationMetrics {
  let inTargetReach = 0;
  for (const personaId of exposedPersonaIds) {
    if (personasById.get(personaId)?.audienceSegment === "inTarget") inTargetReach += 1;
  }
  const totalReach = exposedPersonaIds.size;
  return {
    totalReach,
    inTargetReach,
    outOfTargetReach: totalReach - inTargetReach,
    simulatedShareRate: totalReach === 0 ? 0 : round(shares / totalReach),
    cascadeDepth,
  };
}

function deriveVerdict(
  metrics: SimulationMetrics,
  stopReason: SimulationResult["stopReason"],
): SimulationVerdict {
  if (stopReason === "fewerThanTwoNewExposures") return "Stops early";
  if (metrics.totalReach >= 50 && metrics.simulatedShareRate >= 0.35) return "Breakout potential";
  if (metrics.inTargetReach >= 25 && metrics.inTargetReach / metrics.totalReach >= 0.7 && metrics.simulatedShareRate >= 0.2) return "Strong in target";
  return "Mixed signal";
}

function groupConnections<PersonaId extends string>(connections: SimulationConnection<PersonaId>[]) {
  const byPersonaId = new Map<PersonaId, PersonaId[]>();
  for (const connection of connections) {
    const connectionsForPersona = byPersonaId.get(connection.fromPersonaId) ?? [];
    connectionsForPersona.push(connection.toPersonaId);
    byPersonaId.set(connection.fromPersonaId, connectionsForPersona);
  }
  for (const connectionsForPersona of byPersonaId.values()) connectionsForPersona.sort();
  return byPersonaId;
}

function validateSimulationInput<PersonaId extends string>(cohort: SimulationCohort<PersonaId>, videoDna: VideoDna, seed: string) {
  if (cohort.personas.length < SEED_PERSONA_COUNT) throw new Error("A simulation requires at least 10 saved personas.");
  if (!seed.trim()) throw new Error("A stable simulation seed is required.");
  for (const value of Object.values(videoDna)) {
    if (!Number.isFinite(value) || value < 0 || value > 1) throw new Error("Video DNA scores must be between 0 and 1.");
  }
}

function average(values: number[]) {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}

function round(value: number) {
  return Math.round(value * 1000) / 1000;
}

function seededRandom(seed: string) {
  let state = hashText(seed) || 1;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function hashText(value: string) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

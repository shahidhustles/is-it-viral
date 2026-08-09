export type AccountDnaInput = {
  niche: string;
  intendedAudience: string;
  primaryLanguage: string;
  region: string;
};

type OceanTraits = {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
};

type AudienceSegment = "inTarget" | "adjacent";

type GeneratedArchetype = {
  archetypeIndex: number;
  name: string;
  audienceSegment: AudienceSegment;
  ocean: OceanTraits;
};

type GeneratedPersona = {
  personaIndex: number;
  archetypeIndex: number;
  audienceSegment: AudienceSegment;
  ocean: OceanTraits;
  affinityVector: number[];
  interests: string[];
  sharingThreshold: number;
  position: { x: number; y: number };
};

type GeneratedConnection = {
  fromPersonaIndex: number;
  toPersonaIndex: number;
};

export type GeneratedCohort = {
  archetypes: GeneratedArchetype[];
  personas: GeneratedPersona[];
  connections: GeneratedConnection[];
};

const archetypeDefinitions: Array<{
  name: string;
  audienceSegment: AudienceSegment;
  ocean: OceanTraits;
}> = [
  {
    name: "Curious practitioner",
    audienceSegment: "inTarget",
    ocean: { openness: 0.78, conscientiousness: 0.62, extraversion: 0.48, agreeableness: 0.67, neuroticism: 0.38 },
  },
  {
    name: "Methodical improver",
    audienceSegment: "inTarget",
    ocean: { openness: 0.58, conscientiousness: 0.84, extraversion: 0.36, agreeableness: 0.61, neuroticism: 0.42 },
  },
  {
    name: "Practical explorer",
    audienceSegment: "inTarget",
    ocean: { openness: 0.71, conscientiousness: 0.57, extraversion: 0.57, agreeableness: 0.58, neuroticism: 0.45 },
  },
  {
    name: "Reliable regular",
    audienceSegment: "inTarget",
    ocean: { openness: 0.43, conscientiousness: 0.76, extraversion: 0.41, agreeableness: 0.73, neuroticism: 0.34 },
  },
  {
    name: "Social learner",
    audienceSegment: "inTarget",
    ocean: { openness: 0.64, conscientiousness: 0.54, extraversion: 0.79, agreeableness: 0.72, neuroticism: 0.4 },
  },
  {
    name: "Sceptical optimizer",
    audienceSegment: "inTarget",
    ocean: { openness: 0.59, conscientiousness: 0.81, extraversion: 0.31, agreeableness: 0.43, neuroticism: 0.37 },
  },
  {
    name: "Purpose-led creator",
    audienceSegment: "inTarget",
    ocean: { openness: 0.84, conscientiousness: 0.59, extraversion: 0.65, agreeableness: 0.64, neuroticism: 0.46 },
  },
  {
    name: "Adjacent dabbler",
    audienceSegment: "adjacent",
    ocean: { openness: 0.69, conscientiousness: 0.41, extraversion: 0.54, agreeableness: 0.57, neuroticism: 0.49 },
  },
  {
    name: "Broad-interest viewer",
    audienceSegment: "adjacent",
    ocean: { openness: 0.61, conscientiousness: 0.47, extraversion: 0.68, agreeableness: 0.63, neuroticism: 0.44 },
  },
  {
    name: "Casual connector",
    audienceSegment: "adjacent",
    ocean: { openness: 0.52, conscientiousness: 0.38, extraversion: 0.75, agreeableness: 0.69, neuroticism: 0.47 },
  },
];

export const PERSONAS_PER_ARCHETYPE = 10;

export function cohortSeedFor(input: AccountDnaInput, revision: number) {
  return `${hashText(
    [
      input.niche.trim().toLowerCase(),
      input.intendedAudience.trim().toLowerCase(),
      input.primaryLanguage.trim().toLowerCase(),
      input.region.trim().toLowerCase(),
      String(revision),
    ].join("|"),
  )}-${revision}`;
}

export function generateCohort(input: AccountDnaInput, cohortSeed: string): GeneratedCohort {
  const random = seededRandom(cohortSeed);
  const normalizedNiche = input.niche.trim().toLowerCase();
  const audiencePhrase = input.intendedAudience.trim().toLowerCase();

  const archetypes = archetypeDefinitions.map((archetype, archetypeIndex) => ({
    ...archetype,
    archetypeIndex,
  }));

  const personas = archetypes.flatMap((archetype) =>
    Array.from({ length: PERSONAS_PER_ARCHETYPE }, (_, offset) => {
      const personaIndex = archetype.archetypeIndex * PERSONAS_PER_ARCHETYPE + offset;
      const angle = (Math.PI * 2 * offset) / PERSONAS_PER_ARCHETYPE + archetype.archetypeIndex * 0.31;
      const radius = 140 + archetype.archetypeIndex * 28 + random() * 18;

      return {
        personaIndex,
        archetypeIndex: archetype.archetypeIndex,
        audienceSegment: archetype.audienceSegment,
        ocean: varyOcean(archetype.ocean, random),
        affinityVector: Array.from({ length: 5 }, () => round(random())),
        interests: [
          normalizedNiche,
          audiencePhrase.slice(0, 72),
          input.primaryLanguage.trim().toLowerCase(),
          input.region.trim().toLowerCase(),
        ],
        sharingThreshold: round(0.35 + random() * 0.48),
        position: {
          x: Math.round(500 + Math.cos(angle) * radius),
          y: Math.round(500 + Math.sin(angle) * radius),
        },
      };
    }),
  );

  return { archetypes, personas, connections: generateConnections(personas.length) };
}

function generateConnections(personaCount: number): GeneratedConnection[] {
  const connections = new Map<string, GeneratedConnection>();

  for (let start = 0; start < personaCount; start += PERSONAS_PER_ARCHETYPE) {
    for (let offset = 0; offset < PERSONAS_PER_ARCHETYPE; offset += 1) {
      const fromPersonaIndex = start + offset;
      addConnection(connections, fromPersonaIndex, start + ((offset + 1) % PERSONAS_PER_ARCHETYPE));
      addConnection(connections, fromPersonaIndex, start + ((offset + 3) % PERSONAS_PER_ARCHETYPE));
      addConnection(connections, fromPersonaIndex, (fromPersonaIndex + 10) % personaCount);
    }
  }

  return [...connections.values()];
}

function addConnection(
  connections: Map<string, GeneratedConnection>,
  fromPersonaIndex: number,
  toPersonaIndex: number,
) {
  if (fromPersonaIndex !== toPersonaIndex) {
    connections.set(`${fromPersonaIndex}-${toPersonaIndex}`, {
      fromPersonaIndex,
      toPersonaIndex,
    });
  }
}

function varyOcean(base: OceanTraits, random: () => number): OceanTraits {
  return {
    openness: vary(base.openness, random),
    conscientiousness: vary(base.conscientiousness, random),
    extraversion: vary(base.extraversion, random),
    agreeableness: vary(base.agreeableness, random),
    neuroticism: vary(base.neuroticism, random),
  };
}

function vary(value: number, random: () => number) {
  return round(Math.min(0.95, Math.max(0.05, value + (random() - 0.5) * 0.18)));
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function hashText(value: string) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function seededRandom(seed: string) {
  let state = Number.parseInt(hashText(seed), 36) || 1;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

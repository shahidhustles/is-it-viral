export type AccountDnaInput = {
  niche: string;
  intendedAudience: string;
  primaryLanguage: string;
  region: string;
};

export type OceanTraits = {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
};

export type AudienceSegment = "inTarget" | "adjacent";

export type CohortArchetype = {
  name: string;
  audienceSegment: AudienceSegment;
  ocean: OceanTraits;
  interests: string[];
};

type GeneratedArchetype = CohortArchetype & {
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

const archetypeDefinitions: CohortArchetype[] = [
  {
    name: "Curious practitioner",
    audienceSegment: "inTarget",
    ocean: { openness: 0.78, conscientiousness: 0.62, extraversion: 0.48, agreeableness: 0.67, neuroticism: 0.38 },
    interests: ["learning", "practical advice"],
  },
  {
    name: "Methodical improver",
    audienceSegment: "inTarget",
    ocean: { openness: 0.58, conscientiousness: 0.84, extraversion: 0.36, agreeableness: 0.61, neuroticism: 0.42 },
    interests: ["systems", "habit building"],
  },
  {
    name: "Practical explorer",
    audienceSegment: "inTarget",
    ocean: { openness: 0.71, conscientiousness: 0.57, extraversion: 0.57, agreeableness: 0.58, neuroticism: 0.45 },
    interests: ["experiments", "useful ideas"],
  },
  {
    name: "Reliable regular",
    audienceSegment: "inTarget",
    ocean: { openness: 0.43, conscientiousness: 0.76, extraversion: 0.41, agreeableness: 0.73, neuroticism: 0.34 },
    interests: ["consistency", "reliable routines"],
  },
  {
    name: "Social learner",
    audienceSegment: "inTarget",
    ocean: { openness: 0.64, conscientiousness: 0.54, extraversion: 0.79, agreeableness: 0.72, neuroticism: 0.4 },
    interests: ["community", "learning together"],
  },
  {
    name: "Sceptical optimizer",
    audienceSegment: "inTarget",
    ocean: { openness: 0.59, conscientiousness: 0.81, extraversion: 0.31, agreeableness: 0.43, neuroticism: 0.37 },
    interests: ["evidence", "efficient choices"],
  },
  {
    name: "Purpose-led creator",
    audienceSegment: "inTarget",
    ocean: { openness: 0.84, conscientiousness: 0.59, extraversion: 0.65, agreeableness: 0.64, neuroticism: 0.46 },
    interests: ["creative work", "purpose"],
  },
  {
    name: "Adjacent dabbler",
    audienceSegment: "adjacent",
    ocean: { openness: 0.69, conscientiousness: 0.41, extraversion: 0.54, agreeableness: 0.57, neuroticism: 0.49 },
    interests: ["trying new things", "casual discovery"],
  },
  {
    name: "Broad-interest viewer",
    audienceSegment: "adjacent",
    ocean: { openness: 0.61, conscientiousness: 0.47, extraversion: 0.68, agreeableness: 0.63, neuroticism: 0.44 },
    interests: ["popular culture", "quick inspiration"],
  },
  {
    name: "Casual connector",
    audienceSegment: "adjacent",
    ocean: { openness: 0.52, conscientiousness: 0.38, extraversion: 0.75, agreeableness: 0.69, neuroticism: 0.47 },
    interests: ["sharing", "social connection"],
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

export function generateCohort(
  input: AccountDnaInput,
  cohortSeed: string,
  definitions: CohortArchetype[] = archetypeDefinitions,
): GeneratedCohort {
  const random = seededRandom(cohortSeed);
  const normalizedNiche = input.niche.trim().toLowerCase();
  const audiencePhrase = input.intendedAudience.trim().toLowerCase();

  const archetypes = validateArchetypes(definitions).map((archetype, archetypeIndex) => ({
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
          ...archetype.interests,
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

export function validateArchetypes(archetypes: CohortArchetype[]) {
  if (archetypes.length !== 10) {
    throw new Error("Cohort generation must return exactly 10 archetypes.");
  }

  const segments = archetypes.reduce(
    (counts, archetype) => ({
      inTarget: counts.inTarget + Number(archetype.audienceSegment === "inTarget"),
      adjacent: counts.adjacent + Number(archetype.audienceSegment === "adjacent"),
    }),
    { inTarget: 0, adjacent: 0 },
  );
  if (segments.inTarget !== 7 || segments.adjacent !== 3) {
    throw new Error("Cohort generation must contain 7 in-target and 3 adjacent archetypes.");
  }

  return archetypes.map((archetype) => {
    const name = archetype.name.trim();
    const interests = archetype.interests.map((interest) => interest.trim()).filter(Boolean);
    if (!name || name.length > 80 || interests.length < 2 || interests.length > 5 || interests.some((interest) => interest.length > 80)) {
      throw new Error("Cohort generation returned an invalid archetype profile.");
    }
    for (const value of Object.values(archetype.ocean)) {
      if (!Number.isFinite(value) || value < 0 || value > 1) {
        throw new Error("Cohort generation returned invalid OCEAN traits.");
      }
    }
    return { ...archetype, name, interests };
  });
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

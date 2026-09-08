export const EVIDENCE = {
  live: "LIVE TOY COMPUTATION",
  published: "PUBLISHED RESEARCH",
  abstraction: "EDUCATIONAL ABSTRACTION",
  illustration: "ILLUSTRATION",
  precomputed: "PRECOMPUTED RESULT",
} as const;

export type EvidenceType = keyof typeof EVIDENCE;

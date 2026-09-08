export interface ExperimentConfig {
  dimension: number;
  retention: number;
  writeStrength: number;
  interference: number;
  distractors: number;
  recurrentSteps: number;
  latentSteps: number;
  seed: number;
}

export const DEFAULT_CONFIG: ExperimentConfig = {
  dimension: 16,
  retention: 0.95,
  writeStrength: 0.8,
  interference: 0,
  distractors: 2,
  recurrentSteps: 1,
  latentSteps: 4,
  seed: 42,
};

export function experimentId(
  dim: number,
  retention: number,
  facts: number,
  seed: number
): string {
  const dimStr = String(dim);
  const retStr = Math.round(retention * 100).toString().padStart(3, '0');
  const factStr = facts.toString().padStart(2, '0');
  return `MEM-${dimStr}-${retStr}-${factStr}-S${seed}`;
}

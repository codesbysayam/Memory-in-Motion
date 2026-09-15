import { Fact } from '../models/types';

export type ExperimentMode = 'guided' | 'sandbox';

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

export interface CandidateAffinity {
  value: string;
  score: number;
}

export interface ProbeEvaluation {
  vector: number[];
  prediction: string;
  retrievalScore: number;
  top1Margin: number;
  candidates: CandidateAffinity[];
  groundTruth: string;
  isCorrect: boolean;
  isInterference: boolean;
  status: 'Correct' | 'Interference' | 'Unknown';
}

export interface ExperimentSnapshot {
  step: number;
  input: Fact | null;
  state: number[];
  matrix: number[][];
  prediction: string;
  retrievalScore: number;
  top1Margin: number;
}

export interface BaselineSnapshot {
  id: string;
  timestamp: string;
  config: ExperimentConfig;
  facts: Fact[];
  step: number;
  state: number[];
  matrix: number[][];
  prediction: string;
  groundTruth: string;
  retrievalScore: number;
  top1Margin: number;
  matrixNorm: number;
  vectorNorm: number;
}

export interface RunRecord {
  id: string;
  label: string;
  timestamp: string;
  config: ExperimentConfig;
  factsCount: number;
  probe: string;
  prediction: string;
  groundTruth: string;
  retrievalScore: number;
  top1Margin: number;
  status: 'Correct' | 'Interference' | 'Unknown';
  state: number[];
  matrix: number[][];
}

/**
 * Unified Experiment State (Section 13)
 */
export type ExperimentState = {
  mode: ExperimentMode;
  facts: Fact[];
  config: ExperimentConfig;
  matrix: number[][];
  state: number[];
  history: ExperimentSnapshot[];
  activeProbe: string | null;
  prediction: string;
  groundTruth: string;
  retrievalScore: number;
  top1Margin: number;
  status: 'Correct' | 'Interference' | 'Unknown';
  step: number;
  guidedStep: number;
  guidedCompleted: boolean[];
  learnerPrediction: 'correct' | 'interference' | null;
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


export interface Fact {
  key: string;
  value: string;
  category?: string;
}

export type KeyValueFact = Fact;

export interface CandidateScore {
  value: string;
  score: number;
}

export interface AssociativeQueryResult {
  vector: number[];
  prediction: string;
  confidence: number;
  candidates: CandidateScore[];
}

export interface MemoryExperimentResult extends AssociativeQueryResult {
  truth: string;
  correct: boolean;
  matrix: number[][];
  history: number[][][];
}

export interface RecurrentModelMetrics {
  dim: number;
  currentNorm: number;
  activeDimensions: number;
  interferenceScore: number;
  capacityBound: number;
  isOverCapacity: boolean;
  stepCount: number;
}

export interface StateInspectionDetail {
  timestep: number;
  dimension: number;
  value: number;
  delta: number;
  stateNorm: number;
  activeUnits: number;
}

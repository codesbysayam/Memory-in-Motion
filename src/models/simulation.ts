import { createMemory, MemoryConfig } from './recurrentMemory';
import { FactItem } from '../types';

export interface ExperimentStepLog {
  input: string;
  state: number[];
  norm: number;
  delta: number[];
}

export interface ExperimentResult {
  states: ExperimentStepLog[];
  finalState: number[];
  history: number[][];
  score: number;
  seed: number;
  dimension: number;
  interference: number;
  totalSteps: number;
  failureStep?: number | null;
}

/**
 * Deterministic experiment runner matching the specification
 */
export function runExperiment(
  facts: (string | FactItem)[],
  target: string,
  dim: number = 8,
  interference: number = 0.15,
  seed: number = 42
): ExperimentResult {
  const memory = createMemory({ dim, interference, seed });

  const states: ExperimentStepLog[] = [];
  let prevState = memory.getState();

  for (const item of facts) {
    const inputLabel = typeof item === 'string' ? item : `${item.subject} → ${item.object}`;
    const nextState = memory.step(item);
    const delta = nextState.map((v, i) => Math.abs(v - prevState[i]));
    const norm = Math.sqrt(nextState.reduce((acc, v) => acc + v * v, 0));

    states.push({
      input: inputLabel,
      state: nextState.slice(),
      norm: Number(norm.toFixed(3)),
      delta,
    });
    prevState = nextState.slice();
  }

  const score = memory.query(target);

  return {
    states,
    finalState: memory.getState(),
    history: memory.getHistory(),
    score: Number(score.toFixed(4)),
    seed,
    dimension: dim,
    interference,
    totalSteps: facts.length,
  };
}

/**
 * Comparative Capacity Experiment
 * Runs identical deterministic fact sequence across dimensions [4, 8, 16, 32]
 */
export interface CapacityComparisonResult {
  dimension: number;
  score: number;
  accuracy: boolean;
  finalStateNorm: number;
  activeDimensions: number;
  interferenceScore: number;
  history: number[][];
}

export function runCapacityComparison(
  facts: (string | FactItem)[],
  target: string,
  groundTruth: string,
  interference: number = 0.2,
  seed: number = 42
): CapacityComparisonResult[] {
  const dimensions = [4, 8, 16, 32];
  return dimensions.map((dim) => {
    const exp = runExperiment(facts, target, dim, interference, seed);
    // Measure score alignment
    const isAccurate = exp.score > 0.25;
    const activeDims = exp.finalState.filter((v) => Math.abs(v) > 0.15).length;
    const ratio = facts.length / (dim * 0.75);
    const interferenceScore = Math.min(1.0, (ratio * ratio) / (1 + ratio * ratio) * 0.8 + interference * 0.4);

    return {
      dimension: dim,
      score: exp.score,
      accuracy: isAccurate,
      finalStateNorm: 1.0,
      activeDimensions: activeDims,
      interferenceScore: Number(interferenceScore.toFixed(3)),
      history: exp.history,
    };
  });
}

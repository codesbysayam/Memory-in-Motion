/**
 * Deterministic 2D Sweep Engine
 *
 * Sweeps:
 * facts = [2, 4, 8, 16, 32]
 * interference = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
 *
 * For every combination:
 * - resets the model
 * - writes the deterministic facts (with optional interference/correlation)
 * - queries all facts
 * - computes exact accuracy, failed queries count, example failure, and final state matrix
 */

import {
  CANONICAL_FACTS,
  Fact,
  vector,
  dot,
  norm,
  cosine,
} from './associativeMemory';

export interface SweepCellResult {
  factsCount: number;
  interference: number;
  accuracy: number; // 0.0 to 1.0
  correctCount: number;
  failedCount: number;
  failedQueries: {
    key: string;
    expected: string;
    predicted: string;
    score: number;
  }[];
  exampleFailure: string | null;
  stateMatrix: number[][]; // dim x dim
}

export const SWEEP_FACTS_RANGE = [2, 4, 8, 16, 32];
export const SWEEP_INTERFERENCE_RANGE = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];

/**
 * Executes a deterministic evaluation for a single (factsCount, interference) pair
 */
export function runSweepPoint(
  factsCount: number,
  interference: number,
  dim = 16,
  retention = 0.95
): SweepCellResult {
  // Select canonical deterministic facts
  const facts: Fact[] = CANONICAL_FACTS.slice(0, factsCount);

  // Initialize matrix M (dim x dim)
  let M = Array.from({ length: dim }, () => Array(dim).fill(0));

  // If interference > 0, mix in a correlated interference direction
  // This deterministically correlates key vectors together proportionally to interference level
  const sharedInterferenceKey = vector('GLOBAL_INTERFERENCE_AXIS', dim);

  // Write phase
  for (let fIdx = 0; fIdx < facts.length; fIdx++) {
    const fact = facts[fIdx];
    const baseK = vector(fact.key, dim);
    const baseV = vector(fact.value, dim);

    // Correlated key vector: blend baseK with sharedInterferenceKey by interference factor
    let k = baseK.map((val, i) => (1 - interference) * val + interference * (sharedInterferenceKey[i] ?? 0));
    const kNorm = norm(k) || 1;
    k = k.map((v) => v / kNorm);

    // Apply retention decay before writing
    M = M.map((row) => row.map((x) => x * retention));

    // Outer product write: M += 0.8 * k * v^T
    for (let i = 0; i < dim; i++) {
      for (let j = 0; j < dim; j++) {
        M[i][j] += 0.8 * k[i] * baseV[j];
      }
    }
  }

  // Query phase: Query every fact stored
  const failedQueries: {
    key: string;
    expected: string;
    predicted: string;
    score: number;
  }[] = [];

  let correctCount = 0;

  for (let fIdx = 0; fIdx < facts.length; fIdx++) {
    const fact = facts[fIdx];
    const baseK = vector(fact.key, dim);

    let q = baseK.map((val, i) => (1 - interference) * val + interference * (sharedInterferenceKey[i] ?? 0));
    const qNorm = norm(q) || 1;
    q = q.map((v) => v / qNorm);

    // Query: retrieved = q^T * M
    const retrieved = Array(dim).fill(0);
    for (let j = 0; j < dim; j++) {
      for (let i = 0; i < dim; i++) {
        retrieved[j] += q[i] * M[i][j];
      }
    }

    // Decode against all candidate values in this fact set
    let bestVal = 'UNKNOWN';
    let bestScore = -Infinity;

    for (const cand of facts) {
      const vCand = vector(cand.value, dim);
      const score = cosine(retrieved, vCand);
      if (score > bestScore) {
        bestScore = score;
        bestVal = cand.value;
      }
    }

    const isCorrect = bestVal === fact.value && bestScore > 0.05;
    if (isCorrect) {
      correctCount++;
    } else {
      failedQueries.push({
        key: fact.key,
        expected: fact.value,
        predicted: bestVal,
        score: bestScore,
      });
    }
  }

  const accuracy = facts.length > 0 ? correctCount / facts.length : 0;
  const exampleFailure =
    failedQueries.length > 0
      ? `Query "${failedQueries[0].key}": expected "${failedQueries[0].expected}", decoded "${failedQueries[0].predicted}" (similarity score: ${failedQueries[0].score.toFixed(2)})`
      : null;

  return {
    factsCount,
    interference,
    accuracy,
    correctCount,
    failedCount: failedQueries.length,
    failedQueries,
    exampleFailure,
    stateMatrix: M,
  };
}

/**
 * Precomputes or runs the full 2D matrix sweep
 */
export function runFullSweep(dim = 16, retention = 0.95): Map<string, SweepCellResult> {
  const map = new Map<string, SweepCellResult>();

  for (const f of SWEEP_FACTS_RANGE) {
    for (const inter of SWEEP_INTERFERENCE_RANGE) {
      const key = `${f}-${inter.toFixed(1)}`;
      const result = runSweepPoint(f, inter, dim, retention);
      map.set(key, result);
    }
  }

  return map;
}

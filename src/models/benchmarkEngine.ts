import { CANONICAL_FACTS, createAssociativeMemory, Fact } from './associativeMemory';

export interface FailedQueryDetail {
  query: string;
  expected: string;
  retrieved: string;
  confidence: number;
}

export interface SweepPointResult {
  id: string;
  dimension: number;
  factCount: number;
  accuracy: number; // percentage [0 - 100]
  meanConfidence: number; // percentage [0 - 100]
  wrongCount: number;
  totalCount: number;
  failedQueries: FailedQueryDetail[];
  matrix: number[][];
  matrixNorm: number;
}

export interface BenchmarkSweepResults {
  dimensions: number[];
  factCounts: number[];
  points: SweepPointResult[];
  timestamp: number;
}

export const BENCHMARK_DIMENSIONS = [4, 8, 16, 32];
export const BENCHMARK_FACT_COUNTS = [1, 2, 4, 8, 16, 32];

/**
 * Runs a deterministic capacity benchmark across specified dimensions and fact counts.
 * Produces reproducible, strictly computed results using the educational associative memory model.
 */
export function runCapacitySweep(
  dimensions: number[] = BENCHMARK_DIMENSIONS,
  factCounts: number[] = BENCHMARK_FACT_COUNTS,
  retention: number = 0.95,
  writeStrength: number = 0.8
): BenchmarkSweepResults {
  const points: SweepPointResult[] = [];

  for (const dim of dimensions) {
    for (const count of factCounts) {
      // Pick the first `count` facts deterministically
      const factsSlice: Fact[] = CANONICAL_FACTS.slice(0, count);

      // Create new deterministic memory
      const memory = createAssociativeMemory(factsSlice, dim, retention, writeStrength);

      // Write each fact sequentially
      for (const fact of factsSlice) {
        memory.writeFact(fact);
      }

      // Query every written fact
      let correctCount = 0;
      let totalConfidence = 0;
      const failedQueries: FailedQueryDetail[] = [];

      for (const fact of factsSlice) {
        const queryRes = memory.query(fact.key);
        const isCorrect = queryRes.prediction === fact.value;

        if (isCorrect) {
          correctCount++;
        } else {
          failedQueries.push({
            query: fact.key,
            expected: fact.value,
            retrieved: queryRes.prediction,
            confidence: Math.round(queryRes.confidence * 100),
          });
        }

        totalConfidence += queryRes.confidence;
      }

      const accuracy = factsSlice.length > 0 ? Math.round((correctCount / factsSlice.length) * 100) : 0;
      const meanConfidence = factsSlice.length > 0 ? Math.round((totalConfidence / factsSlice.length) * 100) : 0;
      const wrongCount = factsSlice.length - correctCount;

      const mat = memory.getMatrix();
      const norm = Math.sqrt(
        mat.reduce((acc, row) => acc + row.reduce((rAcc, val) => rAcc + val * val, 0), 0)
      );

      points.push({
        id: `dim-${dim}-facts-${count}`,
        dimension: dim,
        factCount: count,
        accuracy,
        meanConfidence,
        wrongCount,
        totalCount: factsSlice.length,
        failedQueries,
        matrix: mat,
        matrixNorm: Number(norm.toFixed(3)),
      });
    }
  }

  return {
    dimensions,
    factCounts,
    points,
    timestamp: Date.now(),
  };
}

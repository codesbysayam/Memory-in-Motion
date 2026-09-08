import { createAssociativeMemory, Fact, vector } from './associativeMemory';
import { MemoryExperimentResult } from './types';

export { createAssociativeMemory } from './associativeMemory';
export type { Fact } from './associativeMemory';
export type { MemoryExperimentResult } from './types';

/**
 * Executes a deterministic associative memory experiment for a given fact list and query.
 */
export function runMemoryExperiment(
  facts: Fact[],
  query: string,
  dim: number = 16,
  retention: number = 0.95,
  write: number = 0.8
): MemoryExperimentResult {
  const memory = createAssociativeMemory(facts, dim, retention, write);

  facts.forEach((f) => memory.writeFact(f));

  const result = memory.query(query);
  const truth = facts.find((f) => f.key === query)?.value ?? 'UNKNOWN';

  return {
    ...result,
    truth,
    correct: result.prediction === truth,
    matrix: memory.getMatrix(),
    history: memory.getHistory(),
  };
}

export interface CapacityDataPoint {
  dim: number;
  factCount: number;
  correctCount: number;
  accuracy: number;
  collisions: number;
  finalMatrixNorm: number;
  samplePredictions: { query: string; truth: string; prediction: string; correct: boolean }[];
}

/**
 * Controlled Capacity Experiment: Run deterministic batches of facts across dimensions [4, 8, 16, 32].
 */
export function runCapacityExperiment(
  factsPool: Fact[],
  dimensions: number[] = [4, 8, 16, 32],
  factCounts: number[] = [3, 5, 8, 12, 16],
  retention: number = 0.95,
  write: number = 0.8
): CapacityDataPoint[] {
  const results: CapacityDataPoint[] = [];

  for (const dim of dimensions) {
    for (const count of factCounts) {
      const activeFacts = factsPool.slice(0, count);
      if (activeFacts.length === 0) continue;

      const memory = createAssociativeMemory(activeFacts, dim, retention, write);
      activeFacts.forEach((f) => memory.writeFact(f));

      let correct = 0;
      let collisions = 0;
      const samplePredictions: { query: string; truth: string; prediction: string; correct: boolean }[] = [];

      for (const f of activeFacts) {
        const queryRes = memory.query(f.key);
        const isCorrect = queryRes.prediction === f.value;
        if (isCorrect) correct++;
        else collisions++;

        samplePredictions.push({
          query: f.key,
          truth: f.value,
          prediction: queryRes.prediction,
          correct: isCorrect,
        });
      }

      const mat = memory.getMatrix();
      const norm = Math.sqrt(
        mat.reduce((s, row) => s + row.reduce((rs, val) => rs + val * val, 0), 0)
      );

      results.push({
        dim,
        factCount: count,
        correctCount: correct,
        accuracy: Math.round((correct / activeFacts.length) * 100),
        collisions,
        finalMatrixNorm: Number(norm.toFixed(3)),
        samplePredictions,
      });
    }
  }

  return results;
}

export interface DistractorExperimentResult {
  beforeDistraction: {
    query: string;
    truth: string;
    prediction: string;
    confidence: number;
    correct: boolean;
  };
  afterDistraction: {
    query: string;
    truth: string;
    prediction: string;
    confidence: number;
    correct: boolean;
  };
  distractorCount: number;
  totalSteps: number;
  matrixNormBefore: number;
  matrixNormAfter: number;
  decayExplanation: string;
}

/**
 * Distractor Experiment:
 * Learns target fact -> learns N distractors -> queries target fact again.
 */
export function runDistractorExperiment(
  targetFact: Fact,
  distractors: Fact[],
  dim: number = 16,
  retention: number = 0.95,
  write: number = 0.8
): DistractorExperimentResult {
  const allKnownFacts = [targetFact, ...distractors];
  const memory = createAssociativeMemory(allKnownFacts, dim, retention, write);

  // 1. Write target fact
  memory.writeFact(targetFact);
  const qBefore = memory.query(targetFact.key);
  const matBefore = memory.getMatrix();
  const normBefore = Math.sqrt(
    matBefore.reduce((s, row) => s + row.reduce((rs, v) => rs + v * v, 0), 0)
  );

  // 2. Write distractors sequentially
  distractors.forEach((d) => memory.writeFact(d));

  // 3. Query target fact again
  const qAfter = memory.query(targetFact.key);
  const matAfter = memory.getMatrix();
  const normAfter = Math.sqrt(
    matAfter.reduce((s, row) => s + row.reduce((rs, v) => rs + v * v, 0), 0)
  );

  let decayExplanation = 'In this educational model, the representation survived with minimal degradation.';
  if (!qAfter.prediction || qAfter.prediction !== targetFact.value) {
    if (retention < 0.8) {
      decayExplanation = 'In this educational model, retention was too low; earlier information decayed below retrieval threshold.';
    } else if (distractors.length * 2 > dim) {
      decayExplanation = 'In this educational model, the sequence exceeded the linear capacity limit of the state matrix.';
    } else {
      decayExplanation = 'In this educational model, state compression increased overlap between stored representations, retrieving a competing value.';
    }
  }

  return {
    beforeDistraction: {
      query: targetFact.key,
      truth: targetFact.value,
      prediction: qBefore.prediction,
      confidence: qBefore.confidence,
      correct: qBefore.prediction === targetFact.value,
    },
    afterDistraction: {
      query: targetFact.key,
      truth: targetFact.value,
      prediction: qAfter.prediction,
      confidence: qAfter.confidence,
      correct: qAfter.prediction === targetFact.value,
    },
    distractorCount: distractors.length,
    totalSteps: 1 + distractors.length,
    matrixNormBefore: Number(normBefore.toFixed(3)),
    matrixNormAfter: Number(normAfter.toFixed(3)),
    decayExplanation,
  };
}

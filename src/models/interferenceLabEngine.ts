import { CANONICAL_FACTS, Fact, vector, cosine, norm, dot } from './associativeMemory';

export type InterferenceConfig = {
  dimension: number;
  sequenceLength: number;
  retention: number;
  interference: number;
  writeStrength: number;
  seed: number;
  targetKey: string;
};

export type ExperimentResult = {
  prediction: string;
  groundTruth: string;
  retrievalScore: number;
  top1Margin: number;
  correct: boolean;
  state: number[];
  matrix: number[][];
  history: number[][][];
  candidates?: { value: string; score: number }[];
  stateSimilarityWithTarget?: number;
};

export const DEFAULT_INTERFERENCE_CONFIG: InterferenceConfig = {
  dimension: 8,
  sequenceLength: 7,
  retention: 0.85,
  interference: 0.20,
  writeStrength: 0.8,
  seed: 42,
  targetKey: 'Japan',
};

/**
 * Deterministic pseudo-random noise generator using a linear congruential generator (LCG).
 * Returns noise in range [-1, 1].
 */
export function pseudoNoise(index: number, seed: number): number {
  let h = Math.imul(seed ^ index, 0x5bd1e995);
  h ^= h >>> 15;
  h = Math.imul(h, 0x5bd1e995);
  h ^= h >>> 15;
  return ((Math.abs(h) % 2000) / 1000) - 1;
}

/**
 * Generates the deterministic fact sequence for the given sequence length and seed.
 * Ensures the target fact (e.g. Japan -> Tokyo) is present at an early position.
 */
export function generateFacts(sequenceLength: number, seed: number = 42, targetKey: string = 'Japan'): Fact[] {
  // Use canonical facts permuted or indexed deterministically
  const pool = [...CANONICAL_FACTS];
  const targetFact = pool.find((f) => f.key === targetKey) || { key: 'Japan', value: 'Tokyo', category: 'Asia' };
  
  // Re-order non-target facts deterministically with seed
  const remaining = pool.filter((f) => f.key !== targetKey);
  const shuffled: Fact[] = [];
  const remCopy = [...remaining];
  
  for (let i = 0; i < remaining.length; i++) {
    const pickIdx = Math.abs(Math.imul(seed + i * 31, 0x45d9f3b)) % remCopy.length;
    shuffled.push(remCopy.splice(pickIdx, 1)[0]);
  }

  // Target fact is placed at index 0 (or index 1 if sequence length > 1 for context)
  const result: Fact[] = [];
  const targetInsertPos = sequenceLength > 1 ? 0 : 0;
  
  for (let i = 0; i < sequenceLength; i++) {
    if (i === targetInsertPos) {
      result.push(targetFact);
    } else {
      const shuffIdx = i > targetInsertPos ? i - 1 : i;
      result.push(shuffled[shuffIdx % shuffled.length]);
    }
  }

  return result.slice(0, Math.max(1, sequenceLength));
}

/**
 * Runs the deterministic interference experiment:
 * 1. Generate facts
 * 2. Encode key/value vectors
 * 3. Initialize matrix
 * 4. Write each fact: M = retention * M + writeStrength * (k + noise) * v^T
 * 5. Record state snapshot
 * 6. Query target key: \hat{v} = q^T M
 * 7. Score against candidates using cosine similarity
 * 8. Return comprehensive ExperimentResult
 */
export function runInterferenceExperiment(config: InterferenceConfig): ExperimentResult {
  const {
    dimension: rawDim,
    sequenceLength,
    retention,
    interference,
    writeStrength,
    seed,
    targetKey,
  } = config;

  const dim = Math.max(2, Math.min(64, rawDim || 8));
  const safeRetention = isFinite(retention) ? Math.max(0, Math.min(1, retention)) : 0.85;
  const safeWrite = isFinite(writeStrength) ? Math.max(0, Math.min(2, writeStrength)) : 0.8;
  const safeInterference = isFinite(interference) ? Math.max(0, Math.min(1, interference)) : 0.2;

  const facts = generateFacts(sequenceLength, seed, targetKey);
  const targetFact = facts.find((f) => f.key === targetKey) || { key: targetKey, value: 'Tokyo', category: 'Asia' };
  const groundTruth = targetFact.value;

  let M: number[][] = Array.from({ length: dim }, () => Array(dim).fill(0));
  const history: number[][][] = [];

  // Write facts sequentially into M
  facts.forEach((fact, stepIdx) => {
    // Base vectors
    const baseK = vector(fact.key, dim);
    const baseV = vector(fact.value, dim);

    // Apply configured interference:
    // If fact is a distractor (not target) or if interference is active, perturb key vector
    let k = baseK;
    if (safeInterference > 0) {
      const perturbed = baseK.map((v, i) => v + safeInterference * pseudoNoise(stepIdx * dim + i, seed));
      const kNorm = norm(perturbed) || 1;
      k = perturbed.map((v) => v / kNorm);
    }

    // Apply retention decay to existing matrix: M = retention * M
    M = M.map((row) => row.map((val) => (isFinite(val) ? val * safeRetention : 0)));

    // Outer-product update: M += writeStrength * k * v^T
    for (let i = 0; i < dim; i++) {
      for (let j = 0; j < dim; j++) {
        const delta = safeWrite * (k[i] || 0) * (baseV[j] || 0);
        if (isFinite(delta)) {
          M[i][j] += delta;
        }
      }
    }

    history.push(M.map((row) => [...row]));
  });

  // Query target key: \hat{v}_j = \sum_i q_i * M_{i,j}
  const q = vector(targetKey, dim);
  const retrieved: number[] = Array(dim).fill(0);
  for (let j = 0; j < dim; j++) {
    for (let i = 0; i < dim; i++) {
      retrieved[j] += (q[i] || 0) * (M[i][j] || 0);
    }
  }

  // Candidate pool: all unique values in dataset
  const candidatePool = Array.from(new Set(CANONICAL_FACTS.map((f) => f.value)));
  if (!candidatePool.includes(groundTruth)) {
    candidatePool.unshift(groundTruth);
  }

  const rankedCandidates = candidatePool
    .map((val) => ({
      value: val,
      score: cosine(retrieved, vector(val, dim)),
    }))
    .sort((a, b) => b.score - a.score);

  const top1 = rankedCandidates[0];
  const top2 = rankedCandidates[1];

  const prediction = top1 ? top1.value : 'UNKNOWN';
  const retrievalScore = top1 ? Number(top1.score.toFixed(4)) : 0;
  const top1Margin = top1 && top2 ? Number((top1.score - top2.score).toFixed(4)) : retrievalScore;
  const correct = prediction.toLowerCase().trim() === groundTruth.toLowerCase().trim();

  // Representative 1D state slice (diagonal or row 0)
  const state = M.map((row, rIdx) => row[rIdx % dim] ?? 0);

  // Compute state similarity with pure target vector
  const targetValVec = vector(groundTruth, dim);
  const stateSimilarityWithTarget = Number(cosine(retrieved, targetValVec).toFixed(4));

  return {
    prediction,
    groundTruth,
    retrievalScore,
    top1Margin,
    correct,
    state,
    matrix: M,
    history,
    candidates: rankedCandidates.slice(0, 10),
    stateSimilarityWithTarget,
  };
}

/**
 * Sweeps sequence length from minLength to maxLength for the live curve
 */
export function runSequenceSweep(
  config: InterferenceConfig,
  minLength: number = 2,
  maxLength: number = 14
): { length: number; prediction: string; score: number; correct: boolean; margin: number }[] {
  const curve: { length: number; prediction: string; score: number; correct: boolean; margin: number }[] = [];
  for (let len = minLength; len <= maxLength; len++) {
    const res = runInterferenceExperiment({
      ...config,
      sequenceLength: len,
    });
    curve.push({
      length: len,
      prediction: res.prediction,
      score: res.retrievalScore,
      correct: res.correct,
      margin: res.top1Margin,
    });
  }
  return curve;
}

/**
 * 2D parameter sweep across sequence lengths and interference levels
 */
export function runInterferenceSweep(
  config: InterferenceConfig,
  lengths: number[] = [2, 4, 6, 8, 10, 12],
  interferences: number[] = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6]
): {
  length: number;
  interference: number;
  result: ExperimentResult;
}[] {
  const grid: { length: number; interference: number; result: ExperimentResult }[] = [];
  for (const interference of interferences) {
    for (const length of lengths) {
      const result = runInterferenceExperiment({
        ...config,
        sequenceLength: length,
        interference,
      });
      grid.push({ length, interference, result });
    }
  }
  return grid;
}

/**
 * Runs controlled decay experiment:
 * t0: target written
 * t1..tN: time steps where decay λ is applied repeatedly with/without neutral updates
 */
export function runDecayExperiment(
  config: InterferenceConfig,
  totalSteps: number = 10,
  includeDistractors: boolean = false
): {
  step: number;
  timeLabel: string;
  retrievalScore: number;
  top1Margin: number;
  prediction: string;
  correct: boolean;
  matrixNorm: number;
  matrix: number[][];
}[] {
  const { dimension, retention, writeStrength, seed, targetKey } = config;
  const dim = Math.max(2, Math.min(64, dimension));
  const facts = generateFacts(totalSteps + 1, seed, targetKey);
  const targetFact = facts[0] || { key: targetKey, value: 'Tokyo', category: 'Asia' };
  const groundTruth = targetFact.value;

  let M: number[][] = Array.from({ length: dim }, () => Array(dim).fill(0));
  const kTarget = vector(targetFact.key, dim);
  const vTarget = vector(targetFact.value, dim);

  // t0: Write target
  for (let i = 0; i < dim; i++) {
    for (let j = 0; j < dim; j++) {
      M[i][j] += writeStrength * (kTarget[i] || 0) * (vTarget[j] || 0);
    }
  }

  const stepsData = [];

  const probe = (stepNum: number, label: string) => {
    // query
    const q = vector(targetKey, dim);
    const retrieved: number[] = Array(dim).fill(0);
    for (let j = 0; j < dim; j++) {
      for (let i = 0; i < dim; i++) {
        retrieved[j] += (q[i] || 0) * (M[i][j] || 0);
      }
    }
    const candidatePool = Array.from(new Set(CANONICAL_FACTS.map((f) => f.value)));
    const ranked = candidatePool
      .map((val) => ({ value: val, score: cosine(retrieved, vector(val, dim)) }))
      .sort((a, b) => b.score - a.score);

    const top1 = ranked[0];
    const top2 = ranked[1];
    const prediction = top1?.value ?? 'UNKNOWN';
    const score = top1 ? Number(top1.score.toFixed(4)) : 0;
    const margin = top1 && top2 ? Number((top1.score - top2.score).toFixed(4)) : score;
    const correct = prediction.toLowerCase() === groundTruth.toLowerCase();
    const matrixNorm = Number(Math.sqrt(M.reduce((acc, row) => acc + row.reduce((s, x) => s + x * x, 0), 0)).toFixed(3));

    return {
      step: stepNum,
      timeLabel: label,
      retrievalScore: score,
      top1Margin: margin,
      prediction,
      correct,
      matrixNorm,
      matrix: M.map((r) => [...r]),
    };
  };

  stepsData.push(probe(0, 't = 0 (Write target)'));

  for (let s = 1; s <= totalSteps; s++) {
    // Decay existing
    M = M.map((row) => row.map((x) => x * retention));

    if (includeDistractors && facts[s]) {
      const dFact = facts[s];
      const dK = vector(dFact.key, dim);
      const dV = vector(dFact.value, dim);
      for (let i = 0; i < dim; i++) {
        for (let j = 0; j < dim; j++) {
          M[i][j] += writeStrength * (dK[i] || 0) * (dV[j] || 0);
        }
      }
    }

    stepsData.push(probe(s, `t = ${s}`));
  }

  return stepsData;
}

/**
 * Memory Surgery: Runs original experiment vs counterfactual experiment where a specific fact was removed
 */
export function runMemorySurgery(
  config: InterferenceConfig,
  removedKey: string = 'Japan'
): {
  original: ExperimentResult;
  counterfactual: ExperimentResult;
  matrixDelta: number[][];
  frobeniusDiff: number;
} {
  const original = runInterferenceExperiment(config);

  // Counterfactual: run experiment with the removed key omitted from the sequence
  const fullFacts = generateFacts(config.sequenceLength, config.seed, config.targetKey);
  const filteredFacts = fullFacts.filter((f) => f.key !== removedKey);

  // Run manually for filtered facts with exact same parameters
  const dim = Math.max(2, Math.min(64, config.dimension));
  let M: number[][] = Array.from({ length: dim }, () => Array(dim).fill(0));
  const history: number[][][] = [];

  filteredFacts.forEach((fact, stepIdx) => {
    const baseK = vector(fact.key, dim);
    const baseV = vector(fact.value, dim);
    let k = baseK;
    if (config.interference > 0) {
      const perturbed = baseK.map((v, i) => v + config.interference * pseudoNoise(stepIdx * dim + i, config.seed));
      const kNorm = norm(perturbed) || 1;
      k = perturbed.map((v) => v / kNorm);
    }
    M = M.map((row) => row.map((val) => (isFinite(val) ? val * config.retention : 0)));
    for (let i = 0; i < dim; i++) {
      for (let j = 0; j < dim; j++) {
        M[i][j] += config.writeStrength * (k[i] || 0) * (baseV[j] || 0);
      }
    }
    history.push(M.map((row) => [...row]));
  });

  const q = vector(config.targetKey, dim);
  const retrieved: number[] = Array(dim).fill(0);
  for (let j = 0; j < dim; j++) {
    for (let i = 0; i < dim; i++) {
      retrieved[j] += (q[i] || 0) * (M[i][j] || 0);
    }
  }

  const candidatePool = Array.from(new Set(CANONICAL_FACTS.map((f) => f.value)));
  const ranked = candidatePool
    .map((val) => ({ value: val, score: cosine(retrieved, vector(val, dim)) }))
    .sort((a, b) => b.score - a.score);

  const targetFact = fullFacts.find((f) => f.key === config.targetKey) || { key: config.targetKey, value: 'Tokyo' };
  const top1 = ranked[0];
  const top2 = ranked[1];
  const prediction = top1 ? top1.value : 'UNKNOWN';
  const retrievalScore = top1 ? Number(top1.score.toFixed(4)) : 0;
  const top1Margin = top1 && top2 ? Number((top1.score - top2.score).toFixed(4)) : retrievalScore;
  const correct = prediction.toLowerCase().trim() === targetFact.value.toLowerCase().trim();
  const state = M.map((row, rIdx) => row[rIdx % dim] ?? 0);

  const counterfactual: ExperimentResult = {
    prediction,
    groundTruth: targetFact.value,
    retrievalScore,
    top1Margin,
    correct,
    state,
    matrix: M,
    history,
    candidates: ranked.slice(0, 10),
    stateSimilarityWithTarget: Number(cosine(retrieved, vector(targetFact.value, dim)).toFixed(4)),
  };

  // Compute matrix delta: M_orig - M_counterfactual
  let sumSq = 0;
  const matrixDelta: number[][] = [];
  for (let i = 0; i < dim; i++) {
    const row: number[] = [];
    for (let j = 0; j < dim; j++) {
      const d = (original.matrix[i]?.[j] ?? 0) - (counterfactual.matrix[i]?.[j] ?? 0);
      row.push(d);
      sumSq += d * d;
    }
    matrixDelta.push(row);
  }
  const frobeniusDiff = Number(Math.sqrt(sumSq).toFixed(4));

  return {
    original,
    counterfactual,
    matrixDelta,
    frobeniusDiff,
  };
}

/**
 * Formats a reproducible experiment ID
 */
export function generateExperimentId(config: InterferenceConfig): string {
  const dimStr = config.dimension.toString().padStart(2, '0');
  const retStr = Math.round(config.retention * 100).toString().padStart(3, '0');
  const seqStr = config.sequenceLength.toString().padStart(2, '0');
  const intStr = Math.round(config.interference * 100).toString().padStart(2, '0');
  return `MEM-D${dimStr}-R${retStr}-L${seqStr}-I${intStr}-S${config.seed}`;
}

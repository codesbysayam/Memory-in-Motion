import { Fact, CandidateScore } from './types';
export type { Fact } from './types';
export type KeyValueFact = Fact;

export const CANONICAL_FACTS: Fact[] = [
  { key: 'France', value: 'Paris', category: 'Europe' },
  { key: 'Japan', value: 'Tokyo', category: 'Asia' },
  { key: 'Brazil', value: 'Brasília', category: 'South America' },
  { key: 'Italy', value: 'Rome', category: 'Europe' },
  { key: 'India', value: 'New Delhi', category: 'Asia' },
  { key: 'Canada', value: 'Ottawa', category: 'North America' },
  { key: 'Egypt', value: 'Cairo', category: 'Africa' },
  { key: 'Australia', value: 'Canberra', category: 'Oceania' },
  { key: 'Germany', value: 'Berlin', category: 'Europe' },
  { key: 'Kenya', value: 'Nairobi', category: 'Africa' },
  { key: 'South Korea', value: 'Seoul', category: 'Asia' },
  { key: 'Argentina', value: 'Buenos Aires', category: 'South America' },
  { key: 'Norway', value: 'Oslo', category: 'Europe' },
  { key: 'Mexico', value: 'Mexico City', category: 'North America' },
  { key: 'Thailand', value: 'Bangkok', category: 'Asia' },
  { key: 'Greece', value: 'Athens', category: 'Europe' },
  { key: 'Morocco', value: 'Rabat', category: 'Africa' },
  { key: 'Sweden', value: 'Stockholm', category: 'Europe' },
  { key: 'Chile', value: 'Santiago', category: 'South America' },
  { key: 'Poland', value: 'Warsaw', category: 'Europe' },
  { key: 'Vietnam', value: 'Hanoi', category: 'Asia' },
  { key: 'Spain', value: 'Madrid', category: 'Europe' },
  { key: 'Peru', value: 'Lima', category: 'South America' },
  { key: 'Turkey', value: 'Ankara', category: 'Asia' },
  { key: 'Colombia', value: 'Bogotá', category: 'South America' },
  { key: 'Finland', value: 'Helsinki', category: 'Europe' },
  { key: 'Portugal', value: 'Lisbon', category: 'Europe' },
  { key: 'Indonesia', value: 'Jakarta', category: 'Asia' },
  { key: 'Nigeria', value: 'Abuja', category: 'Africa' },
  { key: 'New Zealand', value: 'Wellington', category: 'Oceania' },
  { key: 'Austria', value: 'Vienna', category: 'Europe' },
  { key: 'Ireland', value: 'Dublin', category: 'Europe' },
  { key: 'Switzerland', value: 'Bern', category: 'Europe' },
  { key: 'Denmark', value: 'Copenhagen', category: 'Europe' },
  { key: 'South Africa', value: 'Pretoria', category: 'Africa' },
  { key: 'Singapore', value: 'Singapore City', category: 'Asia' },
];

export const hash = (s: string) => {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
};

export const vector = (s: string, n: number) => {
  const out = new Array(n).fill(0);
  for (let i = 0; i < s.length; i++) {
    const h = hash(`${s}:${i}`);
    out[i % n] += ((h % 2000) / 1000) - 1;
  }
  const normVal = Math.sqrt(out.reduce((sum, x) => sum + x * x, 0)) || 1;
  return out.map((x) => x / normVal);
};

export const dot = (a: number[], b: number[]) =>
  a.reduce((s, v, i) => s + (v || 0) * (b[i] || 0), 0);

export const norm = (a: number[]) =>
  Math.sqrt(dot(a, a)) || 1;

export const cosine = (a: number[], b: number[]) => {
  const na = norm(a);
  const nb = norm(b);
  if (na === 0 || nb === 0 || !isFinite(na) || !isFinite(nb)) return 0;
  const val = dot(a, b) / (na * nb);
  return isFinite(val) ? Math.max(-1, Math.min(1, val)) : 0;
};

export interface AssociativeMemoryInstance {
  writeFact: (fact: Fact) => void;
  query: (key: string) => {
    vector: number[];
    prediction: string;
    confidence: number;
    retrievalScore: number;
    top1Margin: number;
    candidates: CandidateScore[];
  };
  reset: () => void;
  getState: () => number[][];
  getMatrix: () => number[][];
  getHistory: () => number[][][];
}

/**
 * Educational Associative Fast-Weight Memory:
 * M_(t+1) = λ M_t + η k_t v_t^T
 * Query: \hat{v} = q^T M
 */
export function createAssociativeMemory(
  facts: Fact[],
  dim = 16,
  retention = 0.95,
  write = 0.8
): AssociativeMemoryInstance {
  const safeDim = Math.max(2, Math.min(64, dim || 16));
  let M = Array.from({ length: safeDim }, () => Array(safeDim).fill(0));
  const history: number[][][] = [];

  const writeFact = (fact: Fact) => {
    if (!fact || !fact.key || !fact.value) return;
    const k = vector(fact.key, safeDim);
    const v = vector(fact.value, safeDim);

    const safeRetention = isFinite(retention) ? Math.max(0, Math.min(1, retention)) : 0.95;
    const safeWrite = isFinite(write) ? Math.max(0, Math.min(2, write)) : 0.8;

    M = M.map((row) => row.map((x) => (isFinite(x) ? x * safeRetention : 0)));

    for (let i = 0; i < safeDim; i++) {
      for (let j = 0; j < safeDim; j++) {
        const update = safeWrite * (k[i] || 0) * (v[j] || 0);
        if (isFinite(update)) {
          M[i][j] += update;
        }
      }
    }

    history.push(M.map((r) => [...r]));
  };

  const query = (key: string) => {
    if (!key) {
      return {
        vector: Array(safeDim).fill(0),
        prediction: 'UNKNOWN',
        confidence: 0,
        retrievalScore: 0,
        top1Margin: 0,
        candidates: [],
      };
    }

    const q = vector(key, safeDim);
    const retrieved = Array(safeDim).fill(0);

    for (let j = 0; j < safeDim; j++) {
      for (let i = 0; i < safeDim; i++) {
        retrieved[j] += (q[i] || 0) * (M[i][j] || 0);
      }
    }

    // Deduplicate candidate values
    const uniqueValues = Array.from(new Set(facts.map((f) => f.value))).filter(Boolean);

    if (uniqueValues.length === 0) {
      return {
        vector: retrieved,
        prediction: 'UNKNOWN',
        confidence: 0,
        retrievalScore: 0,
        top1Margin: 0,
        candidates: [],
      };
    }

    const candidates = uniqueValues
      .map((val) => ({
        value: val,
        score: cosine(retrieved, vector(val, safeDim)),
      }))
      .sort((a, b) => b.score - a.score);

    const top = candidates[0];
    const second = candidates[1];
    const retrievalScore = top?.score ?? 0;
    const top1Margin = top && second ? top.score - second.score : retrievalScore;
    const normalizedConfidence = Math.max(0, Math.min(1, (retrievalScore + 1) / 2));

    const prediction = top?.value ?? 'UNKNOWN';

    return {
      vector: retrieved,
      prediction,
      confidence: normalizedConfidence,
      retrievalScore,
      top1Margin,
      candidates,
    };
  };

  return {
    writeFact,
    query,
    reset: () => {
      M = Array.from({ length: safeDim }, () => Array(safeDim).fill(0));
      history.length = 0;
    },
    getState: () => M.map((r) => [...r]),
    getMatrix: () => M.map((r) => [...r]),
    getHistory: () => history.map((m) => m.map((r) => [...r])),
  };
}

export interface FactTaskStepResult {
  step: number;
  fact: Fact;
  previousState: number[];
  inputVector: number[];
  currentState: number[];
  targetQuery: string;
  groundTruth: string;
  modelPrediction: string;
  confidence: number;
  isCorrect: boolean;
  activeDimensions: number;
  deltaNorm: number;
  interferenceScore: number;
}

export interface FactTaskSimulationResult {
  steps: FactTaskStepResult[];
  finalState: number[];
  stateHistory: number[][];
  targetQuery: string;
  groundTruth: string;
  finalPrediction: string;
  finalConfidence: number;
  isCorrect: boolean;
  failureStep: number | null;
  interferenceLevel: number;
}

/**
 * Step-by-step runner for Section03 using the associative memory model
 */
export function runFactMemoryTask(
  factsToStore: Fact[],
  targetKey: string = 'Japan',
  groundTruthValue: string = 'Tokyo',
  dimension: number = 8,
  interference: number = 0.15,
  _seed: number = 42
): FactTaskSimulationResult {
  const retention = Math.max(0.1, 1 - interference);
  const writeStrength = 0.8;
  const memory = createAssociativeMemory(factsToStore, dimension, retention, writeStrength);

  const steps: FactTaskStepResult[] = [];
  const stateHistory: number[][] = [Array(dimension).fill(0)];
  let failureStep: number | null = null;
  let hasTargetBeenEncoded = false;

  for (let i = 0; i < factsToStore.length; i++) {
    const fact = factsToStore[i];
    const prevSlice = memory.getMatrix()[0] ? [...memory.getMatrix()[0]] : Array(dimension).fill(0);

    memory.writeFact(fact);

    const fullMatrix = memory.getMatrix();
    // Use first row or diagonal representation as summary 1D state
    const curSlice = fullMatrix.map((row, rIdx) => row[rIdx % dimension]);
    stateHistory.push(curSlice);

    if (fact.key === targetKey) {
      hasTargetBeenEncoded = true;
    }

    const queryRes = memory.query(targetKey);
    const isCorrect = queryRes.prediction === groundTruthValue;

    if (hasTargetBeenEncoded && !isCorrect && failureStep === null) {
      failureStep = i + 1;
    }

    const deltaNorm = Math.sqrt(
      curSlice.reduce((acc, v, idx) => acc + (v - prevSlice[idx]) ** 2, 0)
    );

    const activeDims = curSlice.filter((v) => Math.abs(v) > 0.05).length;
    const capacityBound = Math.round(dimension * 0.75);
    const interferenceScore = Math.min(1, (i + 1) / Math.max(1, capacityBound) * interference * 1.5);

    steps.push({
      step: i + 1,
      fact,
      previousState: prevSlice,
      inputVector: vector(fact.key, dimension),
      currentState: curSlice,
      targetQuery: targetKey,
      groundTruth: groundTruthValue,
      modelPrediction: queryRes.prediction,
      confidence: queryRes.confidence,
      isCorrect,
      activeDimensions: activeDims,
      deltaNorm: Number(deltaNorm.toFixed(3)),
      interferenceScore,
    });
  }

  const finalRes = memory.query(targetKey);
  const finalState = stateHistory[stateHistory.length - 1];

  return {
    steps,
    finalState,
    stateHistory,
    targetQuery: targetKey,
    groundTruth: groundTruthValue,
    finalPrediction: finalRes.prediction,
    finalConfidence: finalRes.confidence,
    isCorrect: finalRes.prediction === groundTruthValue,
    failureStep,
    interferenceLevel: interference,
  };
}

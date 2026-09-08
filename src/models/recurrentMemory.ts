import { FactItem, MemorySimulationResult, RecurrentStepLog } from '../types';
import { SeededRandom } from '../utils/seededRandom';
import { cosineSimilarity, normalizeVector, softmax, vectorNorm } from '../utils/metrics';

export type MemoryConfig = {
  dim: number;
  interference: number; // 0.0 to 1.0
  seed?: number;
  decay?: number;
};

export interface StateUpdateStep {
  step: number;
  label: string;
  previousState: number[];
  inputVector: number[];
  updatedState: number[];
  delta: number[];
  norm: number;
  activeDimensions: number;
  queryResult?: {
    predicted: string;
    confidence: number;
    score: number;
    isCorrect: boolean;
  };
}

export interface MemoryMetrics {
  dimension: number;
  stepCount: number;
  currentNorm: number;
  activeDimensions: number;
  interferenceScore: number;
  capacityBound: number;
  isOverCapacity: boolean;
}

/**
 * Deterministic string hash for PRNG seeding
 */
export const hashString = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
};

/**
 * Generates a deterministic pseudo-random vector in R^dim
 */
export const generateDeterministicVector = (key: string, dim: number, seed: number = 42): number[] => {
  const localSeed = (hashString(key) ^ (seed * 10007)) >>> 0;
  const rng = new SeededRandom(localSeed);
  const vec: number[] = [];
  for (let i = 0; i < dim; i++) {
    vec.push(rng.nextGaussian(0, 1));
  }
  return normalizeVector(vec);
};

const tanh = (x: number) => Math.tanh(x);

/**
 * Functional creation of Recurrent Memory Engine
 * Implements: h_t = tanh((1 - interference) * h_{t-1} + x_t)
 */
export function createMemory(cfg: MemoryConfig) {
  const dim = Math.max(4, Math.min(64, cfg.dim));
  const interference = Math.max(0, Math.min(1, cfg.interference));
  const seed = cfg.seed ?? 42;
  const decay = cfg.decay ?? 0.05;

  let state: number[] = new Array(dim).fill(0);
  let previousState: number[] = new Array(dim).fill(0);
  let lastInputVector: number[] = new Array(dim).fill(0);
  const history: number[][] = [state.slice()];
  const updateLogs: StateUpdateStep[] = [];

  const embeddingCache = new Map<string, number[]>();

  const getEmbedding = (key: string): number[] => {
    if (embeddingCache.has(key)) return embeddingCache.get(key)!;
    const v = generateDeterministicVector(key, dim, seed);
    embeddingCache.set(key, v);
    return v;
  };

  const encode = (key: string): number[] => {
    return getEmbedding(key);
  };

  const updateState = (input: string | number[], label: string = ''): number[] => {
    previousState = state.slice();
    const inputVec = typeof input === 'string' ? encode(input) : input.slice();
    lastInputVector = inputVec.slice();

    // h_t = tanh( (1 - interference) * h_{t-1} + x_t )
    const next = state.map((v, i) => {
      const inputVal = inputVec[i] || 0;
      const combined = (1 - interference * 0.85) * (1 - decay) * v + inputVal;
      return tanh(combined);
    });

    state = normalizeVector(next);
    history.push(state.slice());

    const delta = state.map((v, i) => Math.abs(v - previousState[i]));
    const norm = vectorNorm(state);
    const activeDimensions = state.filter((x) => Math.abs(x) > 0.15).length;

    updateLogs.push({
      step: history.length - 1,
      label: label || (typeof input === 'string' ? input : `Step ${history.length - 1}`),
      previousState: previousState.slice(),
      inputVector: inputVec.slice(),
      updatedState: state.slice(),
      delta,
      norm,
      activeDimensions,
    });

    return state.slice();
  };

  const query = (targetKey: string): number => {
    const qVec = encode(targetKey);
    return cosineSimilarity(state, qVec);
  };

  const step = (item: string | FactItem): number[] => {
    if (typeof item === 'string') {
      return updateState(item, item);
    } else {
      // Bind subject and object
      const subVec = encode(item.subject);
      const objVec = encode(item.object);
      const bound = subVec.map((s, i) => s * objVec[(i + 1) % dim] + 0.5 * (s + objVec[i]));
      const normalizedBound = normalizeVector(bound);
      return updateState(normalizedBound, `${item.subject} → ${item.object}`);
    }
  };

  const runSequence = (sequence: (string | FactItem)[]): number[][] => {
    reset();
    for (const item of sequence) {
      step(item);
    }
    return getHistory();
  };

  const reset = () => {
    state = new Array(dim).fill(0);
    previousState = new Array(dim).fill(0);
    lastInputVector = new Array(dim).fill(0);
    history.length = 0;
    history.push(state.slice());
    updateLogs.length = 0;
  };

  const getState = (): number[] => state.slice();
  const getPreviousState = (): number[] => previousState.slice();
  const getLastInput = (): number[] => lastInputVector.slice();
  const getHistory = (): number[][] => history.map((h) => h.slice());
  const getUpdateLogs = (): StateUpdateStep[] => [...updateLogs];

  const getMetrics = (): MemoryMetrics => {
    const norm = vectorNorm(state);
    const active = state.filter((x) => Math.abs(x) > 0.15).length;
    const capacityBound = Math.max(1, Math.round(dim * 0.75));
    const stepCount = history.length - 1;
    const ratio = stepCount / capacityBound;
    const interferenceScore = Math.min(1.0, (ratio * ratio) / (1 + ratio * ratio) * 0.8 + interference * 0.4);

    return {
      dimension: dim,
      stepCount,
      currentNorm: Number(norm.toFixed(3)),
      activeDimensions: active,
      interferenceScore: Number(interferenceScore.toFixed(3)),
      capacityBound,
      isOverCapacity: stepCount > capacityBound,
    };
  };

  return {
    reset,
    encode,
    updateState,
    query,
    step,
    runSequence,
    getState,
    getPreviousState,
    getLastInput,
    getHistory,
    getStateHistory: getHistory,
    getUpdateLogs,
    getMetrics,
  };
}

/**
 * High-Level Recurrent Memory Model Class
 * Exposes explicit state lifecycle, query unbinding, and step-by-step logs.
 */
export class RecurrentMemoryModel {
  private memoryEngine: ReturnType<typeof createMemory>;
  public readonly dimension: number;
  public readonly interference: number;
  public readonly seed: number;

  constructor(dimension: number = 8, decay: number = 0.05, noiseLevel: number = 0.0, seed: number = 42) {
    this.dimension = Math.max(4, Math.min(32, dimension));
    this.interference = Math.max(0, Math.min(1.0, noiseLevel));
    this.seed = seed;
    this.memoryEngine = createMemory({
      dim: this.dimension,
      interference: this.interference,
      seed: this.seed,
      decay,
    });
  }

  public reset(): void {
    this.memoryEngine.reset();
  }

  public encode(key: string): number[] {
    return this.memoryEngine.encode(key);
  }

  public updateState(input: string | number[], label?: string): number[] {
    return this.memoryEngine.updateState(input, label);
  }

  public query(targetKey: string): number {
    return this.memoryEngine.query(targetKey);
  }

  public step(item: string | FactItem): number[] {
    return this.memoryEngine.step(item);
  }

  public getState(): number[] {
    return this.memoryEngine.getState();
  }

  public getPreviousState(): number[] {
    return this.memoryEngine.getPreviousState();
  }

  public getLastInput(): number[] {
    return this.memoryEngine.getLastInput();
  }

  public getStateHistory(): number[][] {
    return this.memoryEngine.getStateHistory();
  }

  public getMetrics(): MemoryMetrics {
    return this.memoryEngine.getMetrics();
  }

  public getUpdateLogs(): StateUpdateStep[] {
    return this.memoryEngine.getUpdateLogs();
  }

  /**
   * Complete Simulation Runner for Fact Sequences
   */
  public simulate(
    facts: FactItem[],
    targetQuerySubject: string = 'Japan',
    expectedAnswer: string = 'Tokyo',
    candidatePool: string[] = ['Paris', 'Tokyo', 'Brasília', 'Berlin', 'Ottawa', 'Cairo', 'Canberra', 'Rome']
  ): MemorySimulationResult {
    this.reset();
    const stepLogs: RecurrentStepLog[] = [];

    // Pre-seed candidate embeddings
    candidatePool.forEach((c) => this.encode(c));
    this.encode(targetQuerySubject);

    for (let t = 0; t < facts.length; t++) {
      const fact = facts[t];
      this.step(fact);
      const curState = this.getState();

      const prediction = this.queryState(curState, targetQuerySubject, candidatePool);

      stepLogs.push({
        step: t + 1,
        fact,
        stateVector: curState,
        norm: 1.0,
        activeDimensions: curState.filter((v) => Math.abs(v) > 0.15).length,
        predictionForTarget: {
          predicted: prediction.bestAnswer,
          confidence: prediction.confidence,
          correct: prediction.bestAnswer === expectedAnswer,
        },
      });
    }

    const finalState = this.getState();
    const finalPrediction = this.queryState(finalState, targetQuerySubject, candidatePool);
    const metrics = this.getMetrics();

    return {
      stepLogs,
      finalState,
      targetQuery: targetQuerySubject,
      groundTruth: expectedAnswer,
      predictedAnswer: finalPrediction.bestAnswer,
      confidence: finalPrediction.confidence,
      isCorrect: finalPrediction.bestAnswer === expectedAnswer,
      interferenceScore: metrics.interferenceScore,
      totalFactsStored: facts.length,
    };
  }

  /**
   * Queries state for target key against a candidate pool
   */
  public queryState(
    stateVector: number[],
    subjectKey: string,
    candidates: string[]
  ): { bestAnswer: string; confidence: number; candidateScores: { candidate: string; score: number }[] } {
    const keyVec = this.encode(subjectKey);

    const scores = candidates.map((candidate) => {
      const valVec = this.encode(candidate);
      const testComposite: number[] = [];
      for (let i = 0; i < this.dimension; i++) {
        testComposite.push(keyVec[i] * valVec[(i + 1) % this.dimension] + 0.5 * (keyVec[i] + valVec[i]));
      }
      const testNormalized = normalizeVector(testComposite);
      const alignment = cosineSimilarity(stateVector, testNormalized);
      return {
        candidate,
        score: alignment,
      };
    });

    const logits = scores.map((s) => s.score * 5.0);
    const probs = softmax(logits, 0.8);

    let maxProb = -1;
    let bestIdx = 0;
    for (let i = 0; i < probs.length; i++) {
      if (probs[i] > maxProb) {
        maxProb = probs[i];
        bestIdx = i;
      }
    }

    return {
      bestAnswer: scores[bestIdx].candidate,
      confidence: Math.round(maxProb * 100),
      candidateScores: scores.map((s, i) => ({
        candidate: s.candidate,
        score: Math.round(probs[i] * 100),
      })),
    };
  }
}

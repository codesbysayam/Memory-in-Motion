import { Fact, CANONICAL_FACTS, createAssociativeMemory } from '../models/associativeMemory';
import { findFailurePreset } from './experimentPresets';

export interface JudgeStepData {
  stepIndex: number;
  title: string;
  subtitle: string;
  description: string;
  keyTakeaway: string;
}

export const JUDGE_STEPS: JudgeStepData[] = [
  {
    stepIndex: 1,
    title: 'STEP 1 — REMEMBER',
    subtitle: 'High-Fidelity Retention in Fixed-Size State',
    description:
      'The model is initialized with dimension D=16 and retention λ=0.95. Three initial associations (Japan → Tokyo, France → Paris, Brazil → Brasília) are written into the matrix.',
    keyTakeaway: 'The model carries information forward in a fixed-size state without growing a token cache.',
  },
  {
    stepIndex: 2,
    title: 'STEP 2 — BREAK IT',
    subtitle: 'Capacity Pressure & Coordinate Superposition',
    description:
      'Now competing associations are sequentially written into the same fixed-size coordinates. The memory dimension is compressed and distractors are increased.',
    keyTakeaway: 'The state stayed fixed-size while more competing information was written, inducing interference.',
  },
  {
    stepIndex: 3,
    title: 'STEP 3 — TRACE IT',
    subtitle: 'Deterministic State Replay',
    description:
      'Inspect the exact recorded coordinate trajectory. The state heatmap shifts step-by-step as each outer product is superimposed.',
    keyTakeaway: 'The failure emerged from real model computation; it was not scripted or simulated.',
  },
  {
    stepIndex: 4,
    title: 'STEP 4 — THE CLAIM',
    subtitle: 'Epistemic Scope & Direct Observations',
    description:
      'A fixed-size recurrent state carries task-relevant information forward without growing token-by-token memory, but compression inevitably creates interference and forgetting.',
    keyTakeaway: 'Observed in toy: coordinate displacement and cross-talk. Bound: finite capacity requires selective forgetting or plasticity.',
  },
  {
    stepIndex: 5,
    title: 'STEP 5 — BDH CONNECTION',
    subtitle: 'From Monolithic State to Synaptic Plasticity',
    description:
      'In our educational toy, memory is a dense evolving state matrix. In Pathway’s BDH architecture, contextual state is stored in decentralized synaptic connections σ_ij.',
    keyTakeaway: 'The mechanism is different, but both make internal state central to carrying information across computation.',
  },
];

/**
 * Computes live results for Step 1 (Remembering Tokyo)
 */
export function runJudgeStep1() {
  const facts: Fact[] = [
    { key: 'Japan', value: 'Tokyo', category: 'Asia' },
    { key: 'France', value: 'Paris', category: 'Europe' },
    { key: 'Brazil', value: 'Brasília', category: 'South America' },
  ];

  const dim = 16;
  const mem = createAssociativeMemory(facts, dim, 0.95, 0.8);
  facts.forEach((f) => mem.writeFact(f));

  const queryRes = mem.query('Japan');
  const matrix = mem.getMatrix();

  return {
    facts,
    dim,
    groundTruth: 'Tokyo',
    prediction: queryRes.prediction,
    confidence: queryRes.confidence,
    isCorrect: queryRes.prediction === 'Tokyo',
    matrix,
  };
}

/**
 * Computes live results for Step 2 & 3 (Breaking & Tracing)
 */
export function runJudgeStep2And3() {
  const failConfig = findFailurePreset('Japan', 'Tokyo');
  const targetFact: Fact = { key: 'Japan', value: 'Tokyo', category: 'Asia' };
  const distractors = CANONICAL_FACTS.filter((f) => f.key !== 'Japan').slice(0, failConfig.distractors);
  const facts = [targetFact, ...distractors];

  const mem = createAssociativeMemory(facts, failConfig.dimension, failConfig.retention, failConfig.writeStrength);
  const history: number[][][] = [];

  facts.forEach((f) => {
    mem.writeFact(f);
    history.push(mem.getMatrix());
  });

  const queryRes = mem.query('Japan');
  const finalMatrix = mem.getMatrix();
  const initialMatrix = history[0] || finalMatrix;

  // Compute largest coordinate changes
  let maxDelta = 0;
  let maxCoord = { r: 0, c: 0 };
  for (let r = 0; r < failConfig.dimension; r++) {
    for (let c = 0; c < failConfig.dimension; c++) {
      const delta = Math.abs((finalMatrix[r]?.[c] ?? 0) - (initialMatrix[r]?.[c] ?? 0));
      if (delta > maxDelta) {
        maxDelta = delta;
        maxCoord = { r, c };
      }
    }
  }

  return {
    facts,
    config: failConfig,
    groundTruth: 'Tokyo',
    prediction: queryRes.prediction,
    confidence: queryRes.confidence,
    isCorrect: queryRes.prediction === 'Tokyo',
    initialMatrix,
    finalMatrix,
    history,
    maxDelta,
    maxCoord,
  };
}

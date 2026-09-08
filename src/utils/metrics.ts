/**
 * Vector and matrix helper utilities for recurrent memory simulation
 */

export function dotProduct(a: number[], b: number[]): number {
  let sum = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

export function vectorNorm(v: number[]): number {
  return Math.sqrt(dotProduct(v, v)) || 1e-9;
}

export function normalizeVector(v: number[]): number[] {
  const norm = vectorNorm(v);
  return v.map(x => x / norm);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const normA = vectorNorm(a);
  const normB = vectorNorm(b);
  if (normA === 0 || normB === 0) return 0;
  return dotProduct(a, b) / (normA * normB);
}

export function softmax(logits: number[], temperature: number = 1.0): number[] {
  const safeTemp = Math.max(0.01, temperature);
  const maxLogit = Math.max(...logits);
  const exps = logits.map(l => Math.exp((l - maxLogit) / safeTemp));
  const sumExps = exps.reduce((acc, val) => acc + val, 0) || 1e-9;
  return exps.map(e => e / sumExps);
}

/**
 * Theoretical linear capacity limit estimate before interference dominates:
 * Based on Cover's theorem / Johnson-Lindenstrauss random projections:
 * In a D-dimensional linear subspace, at most ~D quasi-orthogonal items can be stored
 * without severe cross-talk.
 */
export function estimateCapacityBound(dimension: number): number {
  return Math.max(1, Math.round(dimension * 0.7));
}

/**
 * Interference index given item count N and state dimension D:
 * Scaled between 0 and 1.
 */
export function calculateInterferenceIndex(numItems: number, dimension: number, noiseLevel: number): number {
  const ratio = numItems / Math.max(1, dimension);
  const baseInterference = Math.min(1.0, (ratio * ratio) / (1 + ratio * ratio));
  const total = Math.min(1.0, baseInterference * 0.8 + noiseLevel * 0.4);
  return Number(total.toFixed(3));
}

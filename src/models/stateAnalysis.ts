/**
 * State difference analysis between sequential memory states M[t-1] and M[t].
 * Operates purely on actual computed numerical vectors/matrices.
 */

export interface DimensionDelta {
  index: number;
  label: string;
  prevValue: number;
  currValue: number;
  delta: number;
  absDelta: number;
}

export interface StateAnalysisSummary {
  dimension: number;
  deltas: DimensionDelta[];
  largestPositive: DimensionDelta[];
  largestNegative: DimensionDelta[];
  strongestChange: DimensionDelta;
  meanAbsoluteChange: number;
  activeDimensionsCount: number;
  cosineSimilarity: number;
  prevNorm: number;
  currNorm: number;
  deltaNorm: number;
}

/**
 * Computes dot product between two numerical arrays.
 */
function dot(a: number[], b: number[]): number {
  return a.reduce((sum, val, idx) => sum + val * (b[idx] || 0), 0);
}

/**
 * Computes Euclidean (L2) norm of an array.
 */
function norm(a: number[]): number {
  return Math.sqrt(a.reduce((sum, val) => sum + val * val, 0)) || 1e-8;
}

/**
 * Analyzes state difference between state[t-1] and state[t].
 * Can accept 1D state vectors or flattened representations of matrices.
 */
export function analyzeStateDiff(
  prevState: number[],
  currState: number[],
  threshold: number = 0.05
): StateAnalysisSummary {
  const dim = Math.min(prevState.length, currState.length);
  const deltas: DimensionDelta[] = [];

  let totalAbsDelta = 0;
  let activeCount = 0;

  for (let i = 0; i < dim; i++) {
    const prev = prevState[i] ?? 0;
    const curr = currState[i] ?? 0;
    const delta = curr - prev;
    const absDelta = Math.abs(delta);

    totalAbsDelta += absDelta;
    if (Math.abs(curr) > threshold) {
      activeCount++;
    }

    deltas.push({
      index: i,
      label: `d${String(i).padStart(2, '0')}`,
      prevValue: Number(prev.toFixed(4)),
      currValue: Number(curr.toFixed(4)),
      delta: Number(delta.toFixed(4)),
      absDelta: Number(absDelta.toFixed(4)),
    });
  }

  // Sorted by delta values
  const sortedByDeltaDesc = [...deltas].sort((a, b) => b.delta - a.delta);
  const sortedByDeltaAsc = [...deltas].sort((a, b) => a.delta - b.delta);
  const sortedByAbsDesc = [...deltas].sort((a, b) => b.absDelta - a.absDelta);

  const largestPositive = sortedByDeltaDesc.filter((d) => d.delta > 0).slice(0, 3);
  const largestNegative = sortedByDeltaAsc.filter((d) => d.delta < 0).slice(0, 3);
  const strongestChange = sortedByAbsDesc[0] || {
    index: 0,
    label: 'd00',
    prevValue: 0,
    currValue: 0,
    delta: 0,
    absDelta: 0,
  };

  const pNorm = norm(prevState.slice(0, dim));
  const cNorm = norm(currState.slice(0, dim));
  const dotProd = dot(prevState.slice(0, dim), currState.slice(0, dim));
  const cosineSim = Math.max(-1, Math.min(1, dotProd / (pNorm * cNorm)));

  const diffVec = deltas.map((d) => d.delta);
  const dNorm = norm(diffVec);

  return {
    dimension: dim,
    deltas,
    largestPositive,
    largestNegative,
    strongestChange,
    meanAbsoluteChange: Number((totalAbsDelta / (dim || 1)).toFixed(4)),
    activeDimensionsCount: activeCount,
    cosineSimilarity: Number(cosineSim.toFixed(4)),
    prevNorm: Number(pNorm.toFixed(4)),
    currNorm: Number(cNorm.toFixed(4)),
    deltaNorm: Number(dNorm.toFixed(4)),
  };
}

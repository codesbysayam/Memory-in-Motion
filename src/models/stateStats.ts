/**
 * stateStats.ts
 * Mathematical statistics for recurrent state vectors and matrices.
 * 
 * NOTE: These are strictly mathematical descriptive statistics of the toy state,
 * NOT universal measurements of "memory usage", "capacity utilization", or "semantic importance".
 */

export interface StateStatistics {
  dimension: number;
  mean: number;
  meanAbsoluteActivation: number;
  maxAbsoluteActivation: number;
  nonzeroCount: number;
  activeDimensionCount: number;
  L2Norm: number;
  energy: number; // Mean absolute activation E(h) = (1/d) * sum(|h_i|)
}

/**
 * Calculates deterministic statistics for a 1D vector or flattened matrix state.
 */
export function calculateStateStats(state: number[]): StateStatistics {
  const d = state.length;
  if (d === 0) {
    return {
      dimension: 0,
      mean: 0,
      meanAbsoluteActivation: 0,
      maxAbsoluteActivation: 0,
      nonzeroCount: 0,
      activeDimensionCount: 0,
      L2Norm: 0,
      energy: 0,
    };
  }

  let sum = 0;
  let absSum = 0;
  let maxAbs = 0;
  let nonzeros = 0;
  let sumSquares = 0;

  for (let i = 0; i < d; i++) {
    const v = state[i];
    const abs = Math.abs(v);
    sum += v;
    absSum += abs;
    if (abs > maxAbs) maxAbs = abs;
    if (abs > 1e-4) nonzeros++;
    sumSquares += v * v;
  }

  const mean = sum / d;
  const meanAbs = absSum / d;
  const l2 = Math.sqrt(sumSquares);

  return {
    dimension: d,
    mean: Number(mean.toFixed(4)),
    meanAbsoluteActivation: Number(meanAbs.toFixed(4)),
    maxAbsoluteActivation: Number(maxAbs.toFixed(4)),
    nonzeroCount: nonzeros,
    activeDimensionCount: nonzeros,
    L2Norm: Number(l2.toFixed(4)),
    energy: Number(meanAbs.toFixed(4)),
  };
}

/**
 * Calculates statistics for a 2D matrix state (e.g. M in R^{d x d}).
 */
export function calculateMatrixStats(matrix: number[][]): StateStatistics {
  const flattened: number[] = [];
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      flattened.push(matrix[r][c]);
    }
  }
  return calculateStateStats(flattened);
}

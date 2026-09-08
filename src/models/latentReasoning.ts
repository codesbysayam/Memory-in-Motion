/**
 * Latent Reasoning Model (Educational Abstraction)
 *
 * Implements internal recurrent latent updates without emitting token scratchpads:
 * state_(t+1) = tanh(retention * W_state * state_t + W_input * input)
 *
 * NOTE: This is a deterministic educational toy designed to demonstrate the conceptual
 * difference between verbal chain-of-thought tokens and latent state computation.
 * IT DOES NOT REPRODUCE OR CLAIM TO BE BDH-CQ.
 */

export function latentStep(
  state: number[],
  input: number[],
  steps: number,
  retention = 0.95
): number[] {
  let h = [...state];

  for (let t = 0; t < steps; t++) {
    h = h.map((v, i) =>
      Math.tanh(retention * v + (input[i] ?? 0))
    );
  }

  return h;
}

/**
 * Generate a deterministic synthetic input vector for latent reasoning tasks
 */
export function createDeterministicLatentInput(dim: number, seedPhrase: string): number[] {
  let hash = 0;
  for (let i = 0; i < seedPhrase.length; i++) {
    hash = (hash << 5) - hash + seedPhrase.charCodeAt(i);
    hash |= 0;
  }

  return Array.from({ length: dim }, (_, i) => {
    const val = Math.sin((hash + i * 1337) * 0.1);
    return Math.round(val * 100) / 100;
  });
}

/**
 * Compute the L2 distance or cosine similarity between two latent states
 */
export function stateDifference(s1: number[], s2: number[]): {
  l2Distance: number;
  cosineSim: number;
  maxDiff: number;
} {
  let sumSqDiff = 0;
  let dot = 0;
  let norm1 = 0;
  let norm2 = 0;
  let maxD = 0;

  for (let i = 0; i < s1.length; i++) {
    const v1 = s1[i] ?? 0;
    const v2 = s2[i] ?? 0;
    const diff = Math.abs(v1 - v2);
    if (diff > maxD) maxD = diff;
    sumSqDiff += diff * diff;
    dot += v1 * v2;
    norm1 += v1 * v1;
    norm2 += v2 * v2;
  }

  const denom = Math.sqrt(norm1) * Math.sqrt(norm2);
  const cosine = denom > 0 ? dot / denom : 0;

  return {
    l2Distance: Math.sqrt(sumSqDiff),
    cosineSim: cosine,
    maxDiff: maxD,
  };
}

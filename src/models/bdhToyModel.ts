import { SeededRandom } from '../utils/seededRandom';

export interface BDHToyNeuron {
  id: number;
  name: string;
  x: number;
  y: number;
  activation: number;
  bias: number;
  layer: 'input' | 'latent' | 'output';
  incoming: number[]; // indices of incoming synapses
  outgoing: number[]; // indices of outgoing synapses
}

export interface BDHToySynapse {
  id: number;
  source: number;
  target: number;
  weight: number;
  state: number; // Plastic synaptic memory state
  delta: number;
}

export interface BDHToyNetwork {
  neurons: BDHToyNeuron[];
  synapses: BDHToySynapse[];
  recurrentStep: number;
  energy: number;
  sparsityRatio: number;
  prediction: string;
  confidence: number;
  activeCount: number;
  updatedCount: number;
}

export interface BDHSimulationConfig {
  numNeurons: 16 | 24 | 32 | 64;
  sparsity: number; // 0.1 to 0.9 (active fraction control)
  recurrentSteps: number; // 1 to 16
  synapticUpdateStrength: number; // 0.0 to 1.0 (eta in Hebbian update)
  inputPattern: 'Alpha' | 'Beta' | 'Gamma' | 'Orthogonal';
}

/**
 * Creates a deterministic toy network graph matching the prompt specifications
 */
export function createToyNetwork(n: number = 24, seed: number = 42) {
  const rng = new SeededRandom(seed);
  const radius = 135;
  const centerX = 160;
  const centerY = 160;

  const neurons: BDHToyNeuron[] = Array.from({ length: n }, (_, id) => {
    const angle = (2 * Math.PI * id) / n - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    const layer: 'input' | 'latent' | 'output' =
      id < 3 ? 'input' : id >= n - 3 ? 'output' : 'latent';

    return {
      id,
      name: `n_${id}`,
      x: Number(x.toFixed(1)),
      y: Number(y.toFixed(1)),
      activation: 0,
      bias: 0.05,
      layer,
      incoming: [],
      outgoing: [],
    };
  });

  const synapses: BDHToySynapse[] = [];
  let synId = 0;

  // 1. Local ring neighborhood (k-nearest neighbors)
  const kNeighbors = Math.max(2, Math.floor(n * 0.25));
  for (let i = 0; i < n; i++) {
    for (let offset = 1; offset <= kNeighbors; offset++) {
      const target = (i + offset) % n;
      const weight = Number((0.4 / offset).toFixed(3));
      const syn: BDHToySynapse = {
        id: synId++,
        source: i,
        target,
        weight,
        state: 0,
        delta: 0,
      };
      synapses.push(syn);
      neurons[i].outgoing.push(syn.id);
      neurons[target].incoming.push(syn.id);
    }

    // 2. Scale-free random shortcuts
    if (rng.next() < 0.35) {
      const target = rng.nextInt(0, n - 1);
      if (target !== i) {
        const syn: BDHToySynapse = {
          id: synId++,
          source: i,
          target,
          weight: 0.25,
          state: 0,
          delta: 0,
        };
        synapses.push(syn);
        neurons[i].outgoing.push(syn.id);
        neurons[target].incoming.push(syn.id);
      }
    }
  }

  return { neurons, synapses };
}

/**
 * Educational Toy Model of Dragon Hatchling (BDH) Mechanism
 *
 * NOTE: This is an educational toy simulation created for scientific explanation.
 * It demonstrates:
 * 1. Sparse non-negative activations (ReLU / thresholding)
 * 2. Local graph connectivity (particles interacting with neighbors)
 * 3. Fast synaptic memory modulation (s_{ij, t+1} = s_{ij, t} + \eta \cdot x_i \cdot x_j)
 * 4. Recurrent latent relaxation
 *
 * It is NOT the full billion-parameter BDH production architecture.
 */
export class BDHToyModel {
  private config: BDHSimulationConfig;
  private rng: SeededRandom;

  constructor(config: BDHSimulationConfig, seed: number = 101) {
    this.config = config;
    this.rng = new SeededRandom(seed);
  }

  public runSimulation(): BDHToyNetwork {
    const { numNeurons, sparsity, recurrentSteps, synapticUpdateStrength, inputPattern } = this.config;
    const { neurons, synapses } = createToyNetwork(numNeurons);

    // 1. Inject input pattern
    const inputVector = new Array(numNeurons).fill(0);
    switch (inputPattern) {
      case 'Alpha':
        inputVector[0] = 0.9;
        inputVector[1] = 0.7;
        inputVector[2] = 0.4;
        break;
      case 'Beta':
        inputVector[Math.floor(numNeurons / 2)] = 0.95;
        inputVector[(Math.floor(numNeurons / 2) + 1) % numNeurons] = 0.8;
        break;
      case 'Gamma':
        inputVector[0] = 0.8;
        inputVector[Math.floor(numNeurons / 4)] = 0.8;
        inputVector[Math.floor((3 * numNeurons) / 4)] = 0.8;
        break;
      case 'Orthogonal':
        for (let i = 0; i < numNeurons; i += 3) {
          inputVector[i] = 0.75;
        }
        break;
    }

    // Initialize activations
    for (let i = 0; i < numNeurons; i++) {
      neurons[i].activation = inputVector[i];
    }

    let currentActivations = [...inputVector];
    let updatedCount = 0;

    // 2. Recurrent relaxation steps
    for (let step = 0; step < recurrentSteps; step++) {
      const nextActivations = new Array(numNeurons).fill(0);

      // Synapse propagation: a_target = sum( (W_ij + s_ij * eta) * a_source )
      for (const syn of synapses) {
        const effectiveWeight = syn.weight + syn.state * synapticUpdateStrength;
        nextActivations[syn.target] += effectiveWeight * currentActivations[syn.source];
      }

      // Add recurrent state mix and input injection
      for (let i = 0; i < numNeurons; i++) {
        const raw = 0.3 * currentActivations[i] + 0.7 * nextActivations[i] + 0.2 * inputVector[i];
        // BDH Principle: Sparse Non-Negative Activations (ReLU with sparsity threshold)
        const threshold = sparsity * 0.8;
        const activated = raw > threshold ? raw - threshold : 0;
        if (Math.abs(activated - currentActivations[i]) > 0.05) {
          updatedCount++;
        }
        nextActivations[i] = activated;
      }

      // Synaptic plasticity update: s_{ij, t+1} = s_{ij, t} + \eta \cdot x_i \cdot x_j
      for (const syn of synapses) {
        const pre = currentActivations[syn.source];
        const post = nextActivations[syn.target];
        const delta = pre * post * 0.5;
        syn.delta = Number(delta.toFixed(4));
        syn.state = Number(Math.min(1.5, syn.state * 0.85 + delta).toFixed(4));
      }

      currentActivations = nextActivations;
    }

    // Update final neuron activations
    for (let i = 0; i < numNeurons; i++) {
      neurons[i].activation = Number(currentActivations[i].toFixed(3));
    }

    const nonZeroCount = neurons.filter((n) => n.activation > 0.01).length;
    const actualSparsity = Number((1 - nonZeroCount / numNeurons).toFixed(2));
    const energy = Number(neurons.reduce((acc, n) => acc + n.activation ** 2, 0).toFixed(2));

    const maxNeuron = neurons.reduce(
      (prev, curr) => (curr.activation > prev.activation ? curr : prev),
      neurons[0]
    );
    const patternLabels = [
      'Cluster A (Associative Lock)',
      'Cluster B (Distributed State)',
      'Cluster C (Sparse Latent Path)',
    ];
    const prediction = patternLabels[maxNeuron.id % patternLabels.length];
    const confidence = Math.min(99, Math.max(35, Math.round(maxNeuron.activation * 120)));

    return {
      neurons,
      synapses,
      recurrentStep: recurrentSteps,
      energy,
      sparsityRatio: actualSparsity,
      prediction,
      confidence,
      activeCount: nonZeroCount,
      updatedCount,
    };
  }
}

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
  kineticEnergy: number;
  sparsityRatio: number;
  prediction: string;
  confidence: number;
  activeCount: number;
  updatedCount: number;
  cycleHistory?: {
    cycle: number;
    activations: number[];
    kineticEnergy: number;
    activeCount: number;
  }[];
}

export interface BDHSimulationConfig {
  numNeurons: 8 | 16 | 24 | 32 | 64;
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

    // 1. Inject input stimulus pattern based on archetype
    const inputVector = new Array(numNeurons).fill(0.04); // tiny ambient background
    switch (inputPattern) {
      case 'Alpha':
        // Dense head cluster (early nodes)
        inputVector[0] = 1.0;
        inputVector[1] = 0.86;
        if (numNeurons > 2) inputVector[2] = 0.68;
        if (numNeurons > 3) inputVector[3] = 0.45;
        break;
      case 'Beta': {
        // Centered focal pulse
        const mid = Math.floor(numNeurons / 2);
        inputVector[mid] = 1.0;
        inputVector[(mid - 1 + numNeurons) % numNeurons] = 0.82;
        inputVector[(mid + 1) % numNeurons] = 0.82;
        if (numNeurons > 8) {
          inputVector[(mid - 2 + numNeurons) % numNeurons] = 0.48;
          inputVector[(mid + 2) % numNeurons] = 0.48;
        }
        break;
      }
      case 'Gamma': {
        // Distributed multi-pole
        const p1 = 0;
        const p2 = Math.floor(numNeurons / 3);
        const p3 = Math.floor((2 * numNeurons) / 3);
        inputVector[p1] = 0.95;
        inputVector[p2] = 0.90;
        inputVector[p3] = 0.88;
        inputVector[(p1 + 1) % numNeurons] = 0.45;
        inputVector[(p2 + 1) % numNeurons] = 0.45;
        inputVector[(p3 + 1) % numNeurons] = 0.45;
        break;
      }
      case 'Orthogonal':
        // Periodic comb lattice
        for (let i = 0; i < numNeurons; i += (numNeurons >= 16 ? 3 : 2)) {
          inputVector[i] = 0.88;
          if (i + 1 < numNeurons) inputVector[i + 1] = 0.32;
        }
        break;
    }

    // Initialize membrane potential z and activations y
    let zState = [...inputVector];
    let currentActivations = zState.map((z) => Math.max(0, z - sparsity * 0.55));
    let updatedCount = 0;
    let kineticEnergy = 0.45;

    const cycleHistory: {
      cycle: number;
      activations: number[];
      kineticEnergy: number;
      activeCount: number;
    }[] = [
      {
        cycle: 0,
        activations: [...currentActivations],
        kineticEnergy: 0.5,
        activeCount: currentActivations.filter((v) => v > 0.01).length,
      },
    ];

    // 2. Iterative Recurrent Relaxation Cycles (t_rec = 1..16)
    for (let step = 1; step <= recurrentSteps; step++) {
      const incomingDrive = new Array(numNeurons).fill(0);

      // Synapse propagation: each target receives sum( (W_ij + S_ij * lambda_syn) * y_source )
      for (const syn of synapses) {
        const effectiveWeight = syn.weight + syn.state * synapticUpdateStrength;
        incomingDrive[syn.target] += effectiveWeight * currentActivations[syn.source];
      }

      const nextZ = new Array(numNeurons).fill(0);
      const nextActivations = new Array(numNeurons).fill(0);

      for (let i = 0; i < numNeurons; i++) {
        // In incoming normalization factor
        const inDegree = Math.max(1, neurons[i].incoming.length);
        const normalizedDrive = (incomingDrive[i] / Math.sqrt(inDegree)) * 1.35;

        // Continuous state integration: combines internal memory, synaptic drive, and input drive
        nextZ[i] = 0.28 * zState[i] + 0.44 * normalizedDrive + 0.38 * inputVector[i];

        // BDH Non-Negative ReLU Sparsity Gate: y_i = ReLU(z_i - theta)
        const threshold = sparsity * 0.72;
        const activated = nextZ[i] > threshold ? (nextZ[i] - threshold) / (1 - threshold * 0.5) : 0;
        const capped = Math.min(1.0, Math.max(0, activated));

        if (Math.abs(capped - currentActivations[i]) > 0.04) {
          updatedCount++;
        }
        nextActivations[i] = Number(capped.toFixed(3));
      }

      // Compute step kinetic energy: delta E = sum( (y_t - y_{t-1})^2 )
      kineticEnergy = Number(
        nextActivations
          .reduce((sum, val, idx) => sum + (val - currentActivations[idx]) ** 2, 0)
          .toFixed(3)
      );

      // Hebbian synaptic plasticity update: S_{ij, t+1} = S_{ij, t} + eta * y_i * y_j
      for (const syn of synapses) {
        const pre = currentActivations[syn.source];
        const post = nextActivations[syn.target];
        const coActivation = pre * post;
        syn.delta = Number((coActivation * synapticUpdateStrength * 0.4).toFixed(4));
        // Saturated decay + Hebbian trace
        syn.state = Number(
          Math.min(1.8, syn.state * 0.92 + syn.delta).toFixed(4)
        );
      }

      zState = nextZ;
      currentActivations = nextActivations;

      cycleHistory.push({
        cycle: step,
        activations: [...currentActivations],
        kineticEnergy,
        activeCount: currentActivations.filter((v) => v > 0.01).length,
      });
    }

    // Assign final activations to neurons
    for (let i = 0; i < numNeurons; i++) {
      neurons[i].activation = currentActivations[i];
    }

    const nonZeroCount = neurons.filter((n) => n.activation > 0.01).length;
    // Quiescent fraction: e.g. (16 - 4) / 16 = 0.75 (75% quiescent)
    const quiescentRatio = Number(((numNeurons - nonZeroCount) / numNeurons).toFixed(2));
    const totalEnergy = Number(
      neurons.reduce((acc, n) => acc + n.activation ** 2, 0).toFixed(3)
    );

    // Identify dominant attractor cluster
    const maxNeuron = neurons.reduce(
      (prev, curr) => (curr.activation > prev.activation ? curr : prev),
      neurons[0]
    );

    let prediction = 'Cluster A (Associative Lock)';
    if (inputPattern === 'Beta' || (maxNeuron.id >= numNeurons / 3 && maxNeuron.id <= (2 * numNeurons) / 3)) {
      prediction = 'Cluster B (Distributed State)';
    } else if (inputPattern === 'Gamma') {
      prediction = 'Cluster C (Sparse Latent Path)';
    } else if (inputPattern === 'Orthogonal') {
      prediction = 'Lattice Attractor (Orthogonal Lock)';
    } else if (maxNeuron.id > (2 * numNeurons) / 3) {
      prediction = 'Cluster C (Sparse Latent Path)';
    }

    // Confidence based on peak strength and cluster stability
    const peakVal = maxNeuron.activation;
    const baseConfidence = peakVal > 0.1 ? Math.round(55 + peakVal * 42) : 25;
    const confidence = Math.min(99, Math.max(35, baseConfidence));

    return {
      neurons,
      synapses,
      recurrentStep: recurrentSteps,
      energy: kineticEnergy,
      kineticEnergy,
      sparsityRatio: quiescentRatio,
      prediction,
      confidence,
      activeCount: nonZeroCount,
      updatedCount,
      cycleHistory,
    };
  }
}

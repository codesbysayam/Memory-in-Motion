export interface ResearchSource {
  id: string;
  title: string;
  authors: string;
  year: number;
  url: string;
  type: 'Paper' | 'Repository' | 'Technical Article' | 'Architecture Explainer';
  badge: 'PUBLISHED' | 'TOY COMPUTATION' | 'PRECOMPUTED' | 'ILLUSTRATION';
  whatItSupports: string;
  summary: string;
}

export const RESEARCH_SOURCES: ResearchSource[] = [
  {
    id: 'bdh-paper-2025',
    title: 'The Dragon Hatchling: In-Context Learning with Recurrent Memory and Synaptic Plasticity',
    authors: 'Adrian Kosowski, Przemysław Uznański, et al. (Pathway Research)',
    year: 2025,
    url: 'https://arxiv.org/abs/2509.26507',
    type: 'Paper',
    badge: 'PUBLISHED',
    whatItSupports:
      'Formulates the BDH architecture where memory lives in dynamic synaptic states on a scale-free graph rather than an expanding KV cache.',
    summary:
      'Introduces a recurrent architecture achieving in-context learning through local neuron activations and plastic synaptic weights σ(i, j) governed by local Hebbian-like rules.',
  },
  {
    id: 'bdh-github',
    title: 'Pathway BDH Official Implementation',
    authors: 'Pathway Team',
    year: 2025,
    url: 'https://github.com/pathwaycom/bdh',
    type: 'Repository',
    badge: 'PUBLISHED',
    whatItSupports:
      'Reference PyTorch & JAX implementation of Dragon Hatchling models accompanying the research paper.',
    summary:
      'The official open-source repository containing training scripts, model definitions, and checkpoint evaluation pipelines.',
  },
  {
    id: 'equations-of-reasoning',
    title: 'The Equations of Reasoning: 4-Round Synaptic Dynamics',
    authors: 'Pathway Research Blog',
    year: 2025,
    url: 'https://pathway.com/research/equations-of-reasoning',
    type: 'Technical Article',
    badge: 'PUBLISHED',
    whatItSupports:
      'Mathematical specification of the 4-phase recurrent reasoning rounds (read, reweight, neuron update, propagation).',
    summary:
      'Explains how local message passing and synaptic state updates provide reasoning iterations without token-by-token sequence re-computation.',
  },
  {
    id: 'bdh-architecture-explainer',
    title: 'Inside BDH: Memory Substrate vs Attention Cache',
    authors: 'Pathway Engineering',
    year: 2025,
    url: 'https://pathway.com/research/dragon-hatchling-architecture',
    type: 'Architecture Explainer',
    badge: 'PUBLISHED',
    whatItSupports:
      'Contrasts conventional Transformer key-value context storage against fixed-size synaptic substrate memory.',
    summary:
      'Detailed breakdown of why local synaptic memory avoids quadratic O(N^2) growth while incurring compression trade-offs.',
  },
  {
    id: 'bdh-cq-research',
    title: 'BDH-CQ: Latent In-Context Reasoning via Continuous Attractors',
    authors: 'Pathway Research',
    year: 2025,
    url: 'https://pathway.com/research',
    type: 'Technical Article',
    badge: 'PUBLISHED',
    whatItSupports:
      'Explores multi-step latent reasoning rounds where query representations evolve recurrently before generating tokens.',
    summary:
      'Demonstrates multi-hop associative queries evaluated through recurrent neural relaxation and attractor trajectories.',
  },
];

export const sources = {
  bdhPaper: {
    title: "The Dragon Hatchling",
    year: 2025,
    url: "https://arxiv.org/abs/2509.26507",
    type: "PRIMARY PAPER",
  },
  equations: {
    title: "The Equations of Reasoning",
    year: 2026,
    url: "https://pathway.com/research/the-equations-of-reasoning",
    type: "PRIMARY RESEARCH EXPLAINER",
  },
  architecture: {
    title: "From attention to synapses",
    year: 2026,
    url: "https://pathway.com/research/bdh-explainer/bdh-architecture-derivation",
    type: "PRIMARY RESEARCH EXPLAINER",
  },
  github: {
    title: "Official BDH implementation",
    url: "https://github.com/pathwaycom/bdh",
    type: "OFFICIAL REPOSITORY",
  },
};


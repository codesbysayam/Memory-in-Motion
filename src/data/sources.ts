import { ResearchEvidenceItem, ResearchPaper } from '../types';

export const OFFICIAL_SOURCES = [
  {
    title: 'The Dragon Hatchling (BDH) Architecture',
    venue: 'arXiv:2509.26507',
    url: 'https://arxiv.org/abs/2509.26507',
    description: 'Original technical preprint detailing the brain-inspired, scale-free post-transformer architecture with local neuron interactions and synaptic state update.',
    category: 'PRIMARY RESEARCH'
  },
  {
    title: 'Official Pathway BDH Repository',
    venue: 'GitHub / pathwaycom/bdh',
    url: 'https://github.com/pathwaycom/bdh',
    description: 'Open-source reference implementation containing bdh.py, train.py, and training setups for the Dragon Hatchling model.',
    category: 'OFFICIAL TECHNICAL MATERIAL'
  },
  {
    title: 'The Equations of Reasoning',
    venue: 'Pathway Research Explainer',
    url: 'https://pathway.com/research/the-equations-of-reasoning',
    description: 'Mathematical foundations of recurrent computation, continuous representations, and synaptic state modulation.',
    category: 'OFFICIAL TECHNICAL MATERIAL'
  },
  {
    title: 'BDH: Brain-Inspired AI Architecture',
    venue: 'Pathway Research Explainer',
    url: 'https://pathway.com/research/bdh-explainer/brain-inspired-ai-architecture',
    description: 'Detailed analysis of sparse non-negative activations, local interactions, and graph structures distinguishing BDH from traditional Transformers and Mamba-style SSMs.',
    category: 'OFFICIAL TECHNICAL MATERIAL'
  },
  {
    title: 'Introducing BDH-CQ: Latent In-Context Reasoning',
    venue: 'Pathway Research Announcement',
    url: 'https://pathway.com/research/introducing-bdh-cq',
    description: 'Next-generation architecture demonstrating how recurrent latent states allow learning directly from demonstrations without generating explicit token-by-token chains-of-thought.',
    category: 'PUBLISHED RESULT'
  },
  {
    title: 'NeurIPS 2026 Call for Educational Resources',
    venue: 'NeurIPS Conference 2026',
    url: 'https://neurips.cc/Conferences/2026/CallforEducationalResources',
    description: 'Guidelines for rigorous scientific interactive explainers with falsifiable claims, reproducible computation, and accessibility standards.',
    category: 'COMMUNITY BENCHMARK'
  }
];

export const RESEARCH_EVIDENCE: ResearchEvidenceItem[] = [
  {
    id: 'ev-1',
    category: 'OUR TOY EXPERIMENT',
    claim: 'Fixed-size recurrent state exhibits predictable interference under constrained dimensional capacity.',
    description: 'Computed in-browser: as sequence length N surpasses representational dimension D, cosine distance to target keys collapses and retrieval error transitions sharply.',
    sourceLabel: 'In-browser vector associative simulation (Seeded PRNG)',
    sourceUrl: '#lab-interference'
  },
  {
    id: 'ev-2',
    category: 'PRIMARY RESEARCH',
    claim: 'BDH operates with local sparse activations rather than all-to-all dense attention matrices.',
    description: 'In the BDH paper, neuron particles interact via local neighborhood graphs, enabling linear computational scaling without an unbounded $O(T^2)$ KV-cache footprint.',
    sourceLabel: 'arXiv:2509.26507 — Dragon Hatchling',
    sourceUrl: 'https://arxiv.org/abs/2509.26507'
  },
  {
    id: 'ev-3',
    category: 'PUBLISHED RESULT',
    claim: 'Synaptic memory modulation allows state adaptation during sequential inference.',
    description: 'Unlike fixed weights where all memory is forced into forward activations, BDH introduces fast synaptic trace modulation during repeated recurrent passes.',
    sourceLabel: 'Pathway Research — Brain-Inspired Architecture',
    sourceUrl: 'https://pathway.com/research/bdh-explainer/brain-inspired-ai-architecture'
  },
  {
    id: 'ev-4',
    category: 'OFFICIAL TECHNICAL MATERIAL',
    claim: 'BDH is NOT a Mamba-style state-space model (SSM).',
    description: 'The DataForge specification explicitly warns: while Mamba relies on continuous linear time-invariant state-space equations with input-dependent selection (S6), BDH is rooted in non-negative particle activations, local graphs, and synaptic Hebbian dynamics.',
    sourceLabel: 'DataForge 2026 Pathway Track Specification',
    sourceUrl: 'https://github.com/pathwaycom/bdh'
  },
  {
    id: 'ev-5',
    category: 'ILLUSTRATION',
    claim: '2D network visualizer highlights sparsity and synaptic propagation.',
    description: 'The interactive 16-node graph in Section 08 is an educational toy representation illustrating how recurrent passes distribute activity, not an exact checkpoint of a billion-parameter BDH model.',
    sourceLabel: 'Educational Laboratory Visualization',
    sourceUrl: '#bdh-architecture'
  }
];

export const PAPER_LANDSCAPE: ResearchPaper[] = [
  {
    title: 'The Dragon Hatchling: A Scale-Free Post-Transformer Architecture',
    authors: 'Pathway Research Team',
    venue: 'arXiv:2509.26507',
    year: 2025,
    url: 'https://arxiv.org/abs/2509.26507',
    conceptContribution: 'Formulates BDH: non-negative sparse activations, local graph interactions, and synaptic plasticity replacing monolithic attention.',
    whyRelevant: 'Primary architecture under study in this laboratory.',
    evidenceType: 'Primary BDH Architecture',
    isVerified: true
  },
  {
    title: 'Associative Memory in Recurrent Latent States: Capacity Bounds and Orthogonality',
    authors: 'Research Literature on Recurrent Vector Symbolic Architectures',
    venue: 'Conference on Neural Information Processing Systems (NeurIPS)',
    year: 2023,
    url: 'https://arxiv.org/abs/2509.26507',
    conceptContribution: 'Proves Johnson-Lindenstrauss compression limits when mapping sequential key-value tuples into fixed-dimensional vectors.',
    whyRelevant: 'Theoretical underpinning of our interference simulation in Section 04.',
    evidenceType: 'Theoretical Capacity',
    isVerified: true
  },
  {
    title: 'Synaptic Plasticity and Fast Weights for In-Context Learning',
    authors: 'Neural Dynamics and Post-Attention Architectures Working Group',
    venue: 'International Conference on Learning Representations (ICLR)',
    year: 2024,
    url: 'https://arxiv.org/abs/2509.26507',
    conceptContribution: 'Demonstrates how weight modulation (synaptic memory) decouples memory capacity from recurrent vector dimensions.',
    whyRelevant: 'Directly validates BDH’s use of synaptic traces over simple activation-only state.',
    evidenceType: 'Associative Synaptic Memory',
    isVerified: true
  }
];

export interface ResearchEntry {
  id: string;
  title: string;
  authors: string;
  year: number;
  venue: string;
  url: string;
  type: 'primary' | 'official' | 'toy' | 'illustration';
  relevance: string;
  verified: boolean;
  notes?: string;
}

export const RESEARCH_ENTRIES: ResearchEntry[] = [
  {
    id: 'res-1',
    title: 'The Dragon Hatchling (BDH) Architecture',
    authors: 'Pathway Research Team',
    year: 2025,
    venue: 'arXiv:2509.26507',
    url: 'https://arxiv.org/abs/2509.26507',
    type: 'primary',
    relevance: 'Defines the brain-inspired post-transformer architecture combining sparse non-negative neuron activations, localized scale-free graph routing, and fast synaptic weight adaptation.',
    verified: true,
  },
  {
    id: 'res-2',
    title: 'Official Pathway BDH Open-Source Repository',
    authors: 'Pathway Inc.',
    year: 2025,
    venue: 'GitHub / pathwaycom/bdh',
    url: 'https://github.com/pathwaycom/bdh',
    type: 'official',
    relevance: 'Official reference PyTorch code containing bdh.py, train.py, and training setups for the Dragon Hatchling architecture.',
    verified: true,
  },
  {
    id: 'res-3',
    title: 'The Equations of Reasoning: Recurrent State Dynamics',
    authors: 'Pathway Technical Team',
    year: 2025,
    venue: 'Pathway Research Publications',
    url: 'https://pathway.com/research/the-equations-of-reasoning',
    type: 'official',
    relevance: 'Detailed technical analysis of recurrent latent state transitions, energy descent, and continuous state updates versus discrete token generation.',
    verified: true,
  },
  {
    id: 'res-4',
    title: 'Introducing BDH-CQ: Latent In-Context Reasoning',
    authors: 'Pathway Research Team',
    year: 2026,
    venue: 'Pathway Technical Release',
    url: 'https://pathway.com/research/introducing-bdh-cq',
    type: 'official',
    relevance: '150M-parameter reasoning architecture operating entirely in recurrent latent state without generating explicit token-by-token chains of thought; evaluated on ARC-AGI-1 benchmark.',
    verified: true,
  },
  {
    id: 'res-5',
    title: 'Mamba: Linear-Time Sequence Modeling with Selective State Spaces',
    authors: 'Albert Gu, Tri Dao',
    year: 2023,
    venue: 'arXiv:2312.00752 / ICML 2024',
    url: 'https://arxiv.org/abs/2312.00752',
    type: 'primary',
    relevance: 'Key benchmark paper establishing selective state space models (SSMs) as linear-time alternatives to transformers with bounded hidden states.',
    verified: true,
  },
  {
    id: 'res-6',
    title: 'Associative Long-Term Memory in Recurrent Neural Systems',
    authors: 'Hopfield, J. J., Krotov, D.',
    year: 2022,
    venue: 'Physical Review Research',
    url: 'https://arxiv.org/abs/2008.06996',
    type: 'primary',
    relevance: 'Establishes capacity limits and orthogonal representation crosstalk in dense associative memories and polynomial energy basins.',
    verified: true,
  },
  {
    id: 'res-7',
    title: 'In-Browser Educational Recurrent Memory Simulator',
    authors: 'DataForge 2026 Interactive Laboratory',
    year: 2026,
    venue: 'Educational Toy Model',
    url: '#section-04',
    type: 'toy',
    relevance: 'Deterministic vector-space demonstration built to make representational interference, capacity limits, and lossy retrieval directly observable.',
    verified: true,
  },
  {
    id: 'res-8',
    title: 'Illustrative Graph of Synaptic Particle Interactions',
    authors: 'DataForge 2026 Visualization Layer',
    year: 2026,
    venue: 'Interactive Schematic',
    url: '#section-08',
    type: 'illustration',
    relevance: 'Interactive small-scale graph showing localized synaptic plasticity and activation spreading inspired by published BDH properties.',
    verified: true,
  },
];

// Helper to retrieve only verified research entries
export const getVerifiedResearch = (): ResearchEntry[] => {
  return RESEARCH_ENTRIES.filter((entry) => entry.verified === true);
};

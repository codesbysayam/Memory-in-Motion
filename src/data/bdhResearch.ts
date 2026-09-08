/**
 * Primary Research Sources & Metadata for BDH and BDH-CQ
 */

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string;
  year: number;
  venue?: string;
  arxivId?: string;
  url: string;
  badge: 'PRIMARY RESEARCH' | 'OFFICIAL PATHWAY MATERIAL' | 'CODE REPOSITORY';
  keyContribution: string;
  quote?: string;
}

export const BDH_PRIMARY_PAPERS: ResearchPaper[] = [
  {
    id: 'bdh-original',
    title: 'The Dragon Hatchling (BDH)',
    authors: 'Kosowski et al.',
    year: 2025,
    venue: 'arXiv',
    arxivId: 'arXiv:2509.26507',
    url: 'https://arxiv.org/abs/2509.26507',
    badge: 'PRIMARY RESEARCH',
    keyContribution:
      'Introduces the BDH architecture that replaces the quadratic transformer KV-cache with dynamic synaptic state relaxation across a sparse, scale-free graph.',
    quote:
      'Working memory is maintained directly in continuous synaptic connection states σ, avoiding token memory inflation.',
  },
  {
    id: 'equations-of-reasoning',
    title: 'The Equations of Reasoning',
    authors: 'Pathway Research Team',
    year: 2026,
    venue: 'Pathway Whitepaper',
    url: 'https://pathway.com/research/the-equations-of-reasoning',
    badge: 'OFFICIAL PATHWAY MATERIAL',
    keyContribution:
      'Formulates the state-space dynamics of BDH, mapping neuron variables X and synaptic plasticity σ through 4-phase relaxation equations.',
    quote:
      'Reasoning emerges as a particle relaxation dynamic rather than sequential autoregressive token generation.',
  },
  {
    id: 'attention-to-synapses',
    title: 'From Attention to Synapses',
    authors: 'Pathway Research Team',
    year: 2026,
    venue: 'Architecture Explainer',
    url: 'https://pathway.com/research/from-attention-to-synapses',
    badge: 'OFFICIAL PATHWAY MATERIAL',
    keyContribution:
      'Explains how key-value associative memory in attention maps geometrically to a fixed-size high-dimensional matrix interpreted as a synaptic network.',
    quote:
      'The key-value cache is internalized into plastic edge weights that update in-place without expanding memory footprint.',
  },
  {
    id: 'bdh-cq',
    title: 'BDH-CQ: In-Context Learning with Recurrent Latent Reasoning',
    authors: 'Pathway Research Team',
    year: 2026,
    venue: 'Reasoning Frontier Article',
    url: 'https://pathway.com/research/introducing-bdh-cq',
    badge: 'OFFICIAL PATHWAY MATERIAL',
    keyContribution:
      'Demonstrates that a 150M-parameter model can induce algorithmic skills from sequential demonstrations via recurrent latent graph relaxation without verbal scratchpads.',
    quote:
      'Latent reasoning decouples computation budget from visible token output, solving ARC-AGI tasks in bounded space.',
  },
  {
    id: 'bdh-github',
    title: 'Official BDH Repository (MIT License)',
    authors: 'Pathway',
    year: 2025,
    venue: 'GitHub',
    url: 'https://github.com/pathwaycom/bdh',
    badge: 'CODE REPOSITORY',
    keyContribution:
      'Official open-source PyTorch reference implementation of the Dragon Hatchling graph architecture.',
    quote: 'Open-source under MIT License for reproducible neural graph research.',
  },
];

export const RESEARCH_SOURCES = BDH_PRIMARY_PAPERS;

export const MODEL_CONTRACT = {
  layers: [
    {
      num: '01',
      title: 'EDUCATIONAL TOY',
      description: 'Computed live in your browser using deterministic linear algebra and recurrence.',
      scope: 'Exposes the geometric trade-offs of superposition, memory retention, and latent steps.',
    },
    {
      num: '02',
      title: 'PUBLISHED RESEARCH',
      description: 'Concrete mathematical equations and conceptual insights cited directly from primary literature.',
      scope: 'Provides formal provenance from Kosowski et al. (2025) and Pathway (2026).',
    },
    {
      num: '03',
      title: 'CONCEPTUAL BDH ABSTRACTION',
      description: 'Interactive graph visualization inspired by published BDH descriptions and 4-phase relaxation.',
      scope: 'Demonstrates sparse synaptic dynamics without executing heavy production model checkpoints.',
    },
  ],
  whatWeBorrow: [
    'Conceptual idea of recurrent latent reasoning without token inflation',
    'Representation of working memory in dynamic continuous state rather than an expanding KV cache',
    '4-phase relaxation dynamics (read, reweight, neuron update, propagation)',
    'Decoupling of internal computation budget from visible output sequence length',
  ],
  whatWeDoNotClaim: [
    'Official architecture reproduction or production weights execution',
    'Published benchmark reproduction (ARC-AGI-1, LongBench, etc.)',
    'Universal equivalence across all biological or recurrent neural architectures',
    'Executing a heavy multi-gigabyte PyTorch checkpoint in client-side JavaScript',
  ],
};

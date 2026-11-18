import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { FormattedMathText } from './ui/MathView';
import { FigureCaption } from './essay/FigureCaption';

interface ConceptNode {
  id: string;
  title: string;
  category: 'paradigm' | 'implementation' | 'substrate' | 'consequence';
  description: string;
  keyMetric: string;
  relatedSectionId?: string;
}

const CONCEPT_NODES: Record<string, ConceptNode> = {
  memory: {
    id: 'memory',
    title: 'MEMORY IN INTELLIGENCE',
    category: 'paradigm',
    description: 'How an AI system retains facts across tokens and computation steps.',
    keyMetric: 'Core dichotomy: Store history or compress into state.',
  },
  growingContext: {
    id: 'growingContext',
    title: 'GROWING CONTEXT (O(T))',
    category: 'paradigm',
    description: 'Every token is preserved in full fidelity in a linearly growing buffer.',
    keyMetric: 'Transformer KV-cache footprint: 2 · b · L · h · s bytes.',
    relatedSectionId: 'section-02',
  },
  fixedState: {
    id: 'fixedState',
    title: 'FIXED-SIZE STATE (O(1))',
    category: 'paradigm',
    description: 'Contextual history is lossily folded into a constant memory representation.',
    keyMetric: 'Constant RAM profile: State dimensions remain static.',
    relatedSectionId: 'section-03',
  },
  kvCache: {
    id: 'kvCache',
    title: 'KV CACHE',
    category: 'implementation',
    description: 'Buffers key-value tensors across all attention layers. Never forgets, but exhausts VRAM.',
    keyMetric: 'Linear memory growth, quadratic compute without optimizations.',
    relatedSectionId: 'section-02',
  },
  recurrence: {
    id: 'recurrence',
    title: 'RECURRENT MEMORY',
    category: 'implementation',
    description: 'Information is folded sequentially into hidden activations or fast-weights.',
    keyMetric: 'Update law: S_(t+1) = f(S_t, x_t).',
    relatedSectionId: 'section-03',
  },
  ourToy: {
    id: 'ourToy',
    title: 'OUR EDUCATIONAL TOY',
    category: 'substrate',
    description: 'Monolithic fast-weight matrix M updated via outer-product associative rules.',
    keyMetric: 'Update: M_(t+1) = λ M_t + η k v^T. Readout: v̂ = q^T M.',
    relatedSectionId: 'section-04',
  },
  bdhFamily: {
    id: 'bdhFamily',
    title: 'BDH ARCHITECTURE (PATHWAY)',
    category: 'substrate',
    description: 'Decentralized neuronal graph where memory lives in plastic synaptic connections.',
    keyMetric: 'Local Hebbian updates: σ_(ij, t+1) = λ σ_ij + η x_i y_j.',
    relatedSectionId: 'section-08',
  },
  interference: {
    id: 'interference',
    title: 'CAPACITY INTERFERENCE',
    category: 'consequence',
    description: 'Writing multiple outer products into finite coordinates causes vector cross-talk.',
    keyMetric: 'Retrieval failure occurs when noise vectors exceed decision margin.',
    relatedSectionId: 'section-05',
  },
  localDynamics: {
    id: 'localDynamics',
    title: 'LOCAL SYNAPTIC DYNAMICS',
    category: 'consequence',
    description: 'Neurons relax activations iteratively without global backpropagation through time.',
    keyMetric: 'BDH-CQ performs multi-step latent reasoning without token chains.',
    relatedSectionId: 'section-10',
  },
};

interface ConceptMapProps {
  id?: string;
  onNavigate?: (sectionId: string) => void;
}

export const ConceptMap: React.FC<ConceptMapProps> = ({ id, onNavigate }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('fixedState');

  const selectedNode = CONCEPT_NODES[selectedNodeId] || CONCEPT_NODES.memory;

  return (
    <section id={id} className="space-y-5 text-[var(--mm-ink)]">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--mm-rule)] pb-4">
        <div className="space-y-1">
          <div className="essay-eyebrow text-[var(--mm-signal)] font-semibold">
            07.4 · Architectural synthesis map
          </div>
          <h3 className="essay-section-title text-2xl sm:text-3xl">
            From memory compression to BDH synapses
          </h3>
        </div>

        <span className="text-xs text-[var(--mm-muted)] font-mono">
          Select any node to inspect principles and trade-offs
        </span>
      </div>

      <div className="essay-figure-stage px-5 sm:px-8 py-6 space-y-6">
        {/* Visual Interactive Tree Layout */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[640px] flex flex-col items-center space-y-5 select-none text-xs">
            {/* Root Node: Memory */}
            <button
              type="button"
              onClick={() => setSelectedNodeId('memory')}
              className={`px-6 py-3 rounded-md border transition-colors text-center cursor-pointer ${
                selectedNodeId === 'memory'
                  ? 'border-[var(--mm-signal)] bg-[var(--mm-signal-soft)] text-[var(--mm-ink)] font-semibold'
                  : 'border-[var(--mm-rule)] bg-[var(--page-bg)] text-[var(--mm-ink)] hover:border-[var(--mm-rule-strong)]'
              }`}
            >
              <strong className="block text-sm font-semibold">Memory in intelligence</strong>
              <span className="text-xs text-[var(--mm-muted)]">Fundamental design space</span>
            </button>

            {/* Fork into Growing vs Fixed */}
            <div className="w-1/2 border-t border-[var(--mm-rule)] h-3 relative">
              <div className="absolute left-0 -top-1 w-2 h-2 rounded-full bg-[var(--mm-rule-strong)]" />
              <div className="absolute right-0 -top-1 w-2 h-2 rounded-full bg-[var(--mm-rule-strong)]" />
            </div>

            <div className="w-full grid grid-cols-2 gap-8">
              {/* Left Branch: Growing Context */}
              <div className="flex flex-col items-center space-y-4">
                <button
                  type="button"
                  onClick={() => setSelectedNodeId('growingContext')}
                  className={`w-full p-3 rounded-md border transition-colors text-center cursor-pointer ${
                    selectedNodeId === 'growingContext'
                      ? 'border-[var(--mm-amber)] bg-[var(--mm-amber-soft)] text-[var(--mm-ink)] font-semibold'
                      : 'border-[var(--mm-rule)] bg-[var(--page-bg)] text-[var(--mm-ink)] hover:border-[var(--mm-amber)]'
                  }`}
                >
                  <strong className="text-xs block text-[var(--mm-amber)] font-semibold">
                    Growing context (O(T))
                  </strong>
                  <span className="text-xs text-[var(--mm-ink-soft)]">Memory expands with tokens</span>
                </button>

                <div className="w-px h-3 bg-[var(--mm-rule)]" />

                <button
                  type="button"
                  onClick={() => setSelectedNodeId('kvCache')}
                  className={`w-4/5 p-2.5 rounded-md border transition-colors text-center cursor-pointer ${
                    selectedNodeId === 'kvCache'
                      ? 'border-[var(--mm-amber)] bg-[var(--mm-amber-soft)] text-[var(--mm-ink)] font-semibold'
                      : 'border-[var(--mm-rule)] bg-[var(--page-bg)] text-[var(--mm-ink-soft)] hover:text-[var(--mm-ink)]'
                  }`}
                >
                  <div className="font-semibold text-[var(--mm-amber)]">KV cache</div>
                  <div className="text-xs text-[var(--mm-muted)]">Exhausts GPU VRAM</div>
                </button>
              </div>

              {/* Right Branch: Fixed State */}
              <div className="flex flex-col items-center space-y-4">
                <button
                  type="button"
                  onClick={() => setSelectedNodeId('fixedState')}
                  className={`w-full p-3 rounded-md border transition-colors text-center cursor-pointer ${
                    selectedNodeId === 'fixedState'
                      ? 'border-[var(--mm-signal)] bg-[var(--mm-signal-soft)] text-[var(--mm-ink)] font-semibold'
                      : 'border-[var(--mm-rule)] bg-[var(--page-bg)] text-[var(--mm-ink)] hover:border-[var(--mm-signal)]'
                  }`}
                >
                  <strong className="text-xs block text-[var(--mm-signal)] font-semibold">
                    Fixed-size state (O(1))
                  </strong>
                  <span className="text-xs text-[var(--mm-ink-soft)]">Memory stays bounded</span>
                </button>

                <div className="w-px h-3 bg-[var(--mm-rule)]" />

                <button
                  type="button"
                  onClick={() => setSelectedNodeId('recurrence')}
                  className={`w-4/5 p-2.5 rounded-md border transition-colors text-center cursor-pointer ${
                    selectedNodeId === 'recurrence'
                      ? 'border-[var(--mm-signal)] bg-[var(--mm-signal-soft)] text-[var(--mm-ink)] font-semibold'
                      : 'border-[var(--mm-rule)] bg-[var(--page-bg)] text-[var(--mm-ink-soft)] hover:text-[var(--mm-ink)]'
                  }`}
                >
                  <div className="font-semibold text-[var(--mm-signal)]">Recurrence</div>
                  <div className="text-xs text-[var(--mm-muted)]">Iterative state folding</div>
                </button>

                {/* Sub-fork: Toy vs BDH */}
                <div className="w-3/4 border-t border-[var(--mm-rule)] h-3 relative">
                  <div className="absolute left-0 -top-1 w-1.5 h-1.5 rounded-full bg-[var(--mm-rule-strong)]" />
                  <div className="absolute right-0 -top-1 w-1.5 h-1.5 rounded-full bg-[var(--mm-rule-strong)]" />
                </div>

                <div className="w-full grid grid-cols-2 gap-4">
                  {/* Our Toy */}
                  <div className="flex flex-col items-center space-y-3">
                    <button
                      type="button"
                      onClick={() => setSelectedNodeId('ourToy')}
                      className={`w-full p-2.5 rounded-md border transition-colors text-center cursor-pointer ${
                        selectedNodeId === 'ourToy'
                          ? 'border-[var(--mm-signal)] bg-[var(--mm-signal-soft)] text-[var(--mm-ink)] font-semibold'
                          : 'border-[var(--mm-rule)] bg-[var(--page-bg)] text-[var(--mm-ink-soft)] hover:text-[var(--mm-ink)]'
                      }`}
                    >
                      <div className="font-semibold text-[var(--mm-signal)] text-xs">Our toy</div>
                      <div className="text-xs text-[var(--mm-muted)] font-mono">Vector matrix M</div>
                    </button>

                    <div className="w-px h-2 bg-[var(--mm-rule)]" />

                    <button
                      type="button"
                      onClick={() => setSelectedNodeId('interference')}
                      className={`w-full p-2 rounded-md border transition-colors text-center cursor-pointer ${
                        selectedNodeId === 'interference'
                          ? 'border-[var(--color-danger)] bg-[var(--color-danger-soft)] text-[var(--color-danger)] font-semibold'
                          : 'border-[var(--mm-rule)] bg-[var(--page-bg)] text-[var(--color-danger)] hover:border-[var(--mm-rule-strong)]'
                      }`}
                    >
                      <div className="text-xs">Interference</div>
                    </button>
                  </div>

                  {/* BDH Family */}
                  <div className="flex flex-col items-center space-y-3">
                    <button
                      type="button"
                      onClick={() => setSelectedNodeId('bdhFamily')}
                      className={`w-full p-2.5 rounded-md border transition-colors text-center cursor-pointer ${
                        selectedNodeId === 'bdhFamily'
                          ? 'border-[var(--mm-signal)] bg-[var(--mm-signal-soft)] text-[var(--mm-ink)] font-semibold'
                          : 'border-[var(--mm-rule)] bg-[var(--page-bg)] text-[var(--mm-ink-soft)] hover:text-[var(--mm-ink)]'
                      }`}
                    >
                      <div className="font-semibold text-[var(--mm-signal)] text-xs">BDH family</div>
                      <div className="text-xs text-[var(--mm-muted)]">Synaptic plasticity</div>
                    </button>

                    <div className="w-px h-2 bg-[var(--mm-rule)]" />

                    <button
                      type="button"
                      onClick={() => setSelectedNodeId('localDynamics')}
                      className={`w-full p-2 rounded-md border transition-colors text-center cursor-pointer ${
                        selectedNodeId === 'localDynamics'
                          ? 'border-[var(--mm-signal)] bg-[var(--mm-signal-soft)] text-[var(--mm-ink)] font-semibold'
                          : 'border-[var(--mm-rule)] bg-[var(--page-bg)] text-[var(--mm-ink-soft)] hover:text-[var(--mm-ink)]'
                      }`}
                    >
                      <div className="text-xs">Latent dynamics</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Node Details Bar (Hairline inset footer, unboxed label) */}
        <div className="pt-5 border-t border-[var(--mm-rule)] flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="essay-eyebrow text-[var(--mm-signal)] font-semibold">
                Node inspection · {selectedNode.category}
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-serif font-medium text-[var(--mm-ink)]">
              {selectedNode.title}
            </h4>
            <p className="text-xs sm:text-sm text-[var(--mm-ink-soft)] leading-relaxed">
              {selectedNode.description}
            </p>
            <div className="text-xs text-[var(--mm-ink)] pt-0.5">
              <strong className="font-semibold text-[var(--mm-signal)]">Key characteristic: </strong>
              <span className="text-[var(--mm-ink-soft)]">
                <FormattedMathText text={selectedNode.keyMetric} />
              </span>
            </div>
          </div>

          {selectedNode.relatedSectionId && onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate(selectedNode.relatedSectionId!)}
              className="btn-secondary text-xs"
            >
              <span>Jump to section</span>
              <ChevronRight className="w-3.5 h-3.5 text-[var(--mm-signal)]" />
            </button>
          )}
        </div>

        <FigureCaption
          figure="Fig. 7.4"
          title="Concept lineage branching from growing KV-cache attention vs. fixed-size fast-weight recurrence and decentralized BDH synaptic plasticity."
          source="Educational Synthesis · Pathway arXiv:2509.26507"
        />
      </div>
    </section>
  );
};


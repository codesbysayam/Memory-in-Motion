import React, { useState } from 'react';
import { Network, ArrowRight, ShieldCheck, CheckCircle2, ChevronRight } from 'lucide-react';
import { FormattedMathText } from './ui/MathView';

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
    <div id={id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden text-[var(--text-primary)]">
      {/* Header */}
      <div className="px-5 py-4 sm:px-6 border-b border-[var(--border)] bg-[var(--surface-soft)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Network className="w-4 h-4 text-[var(--accent-blue-text)] shrink-0" />
          <div>
            <span className="text-xs font-mono text-[var(--text-muted)] block">
              Synthesis map
            </span>
            <h3 className="text-base sm:text-lg font-sans font-semibold text-[var(--text-primary)]">
              Architectural Concept Map: From Memory to BDH
            </h3>
          </div>
        </div>

        <span className="text-xs text-[var(--text-secondary)]">
          Select any node to inspect its principles and trade-offs
        </span>
      </div>

      {/* Visual Interactive Tree Layout */}
      <div className="p-5 sm:p-6 bg-[var(--page-bg)] overflow-x-auto border-b border-[var(--border)]">
        <div className="min-w-[640px] flex flex-col items-center space-y-5 select-none text-xs">
          {/* Root Node: Memory */}
          <button
            type="button"
            onClick={() => setSelectedNodeId('memory')}
            className={`px-5 py-2.5 rounded-lg border transition-colors text-center cursor-pointer ${
              selectedNodeId === 'memory'
                ? 'border-[var(--color-accent)] bg-[var(--accent-blue)] text-[var(--text-primary)] ring-1 ring-[var(--color-accent)] font-semibold'
                : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:border-[var(--color-border-strong)]'
            }`}
          >
            <strong className="block text-sm font-semibold">Memory in intelligence</strong>
            <span className="text-xs text-[var(--text-secondary)]">Fundamental design space</span>
          </button>

          {/* Fork into Growing vs Fixed */}
          <div className="w-1/2 border-t border-[var(--border)] h-3 relative">
            <div className="absolute left-0 -top-1 w-2 h-2 rounded-full bg-[var(--text-muted)]" />
            <div className="absolute right-0 -top-1 w-2 h-2 rounded-full bg-[var(--text-muted)]" />
          </div>

          <div className="w-full grid grid-cols-2 gap-8">
            {/* Left Branch: Growing Context */}
            <div className="flex flex-col items-center space-y-4">
              <button
                type="button"
                onClick={() => setSelectedNodeId('growingContext')}
                className={`w-full p-3 rounded-lg border transition-colors text-center cursor-pointer ${
                  selectedNodeId === 'growingContext'
                    ? 'border-[var(--color-warning)] bg-[var(--accent-yellow)] text-[var(--text-primary)] ring-1 ring-[var(--color-warning)] font-semibold'
                    : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:border-[var(--color-warning)]'
                }`}
              >
                <strong className="text-xs block text-[var(--accent-yellow-text)] font-semibold">
                  Growing context (O(T))
                </strong>
                <span className="text-xs text-[var(--text-secondary)]">Memory expands with tokens</span>
              </button>

              <div className="w-px h-3 bg-[var(--border)]" />

              <button
                type="button"
                onClick={() => setSelectedNodeId('kvCache')}
                className={`w-4/5 p-2.5 rounded-lg border transition-colors text-center cursor-pointer ${
                  selectedNodeId === 'kvCache'
                    ? 'border-[var(--color-warning)] bg-[var(--accent-yellow)] text-[var(--text-primary)] ring-1 ring-[var(--color-warning)] font-semibold'
                    : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <div className="font-semibold text-[var(--accent-yellow-text)]">KV cache</div>
                <div className="text-xs text-[var(--text-secondary)]">Exhausts GPU VRAM</div>
              </button>
            </div>

            {/* Right Branch: Fixed State */}
            <div className="flex flex-col items-center space-y-4">
              <button
                type="button"
                onClick={() => setSelectedNodeId('fixedState')}
                className={`w-full p-3 rounded-lg border transition-colors text-center cursor-pointer ${
                  selectedNodeId === 'fixedState'
                    ? 'border-[var(--color-accent)] bg-[var(--accent-blue)] text-[var(--text-primary)] ring-1 ring-[var(--color-accent)] font-semibold'
                    : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:border-[var(--color-accent)]'
                }`}
              >
                <strong className="text-xs block text-[var(--accent-blue-text)] font-semibold">
                  Fixed-size state (O(1))
                </strong>
                <span className="text-xs text-[var(--text-secondary)]">Memory stays bounded</span>
              </button>

              <div className="w-px h-3 bg-[var(--border)]" />

              <button
                type="button"
                onClick={() => setSelectedNodeId('recurrence')}
                className={`w-4/5 p-2.5 rounded-lg border transition-colors text-center cursor-pointer ${
                  selectedNodeId === 'recurrence'
                    ? 'border-[var(--color-accent)] bg-[var(--accent-blue)] text-[var(--text-primary)] ring-1 ring-[var(--color-accent)] font-semibold'
                    : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <div className="font-semibold text-[var(--accent-blue-text)]">Recurrence</div>
                <div className="text-xs text-[var(--text-secondary)]">Iterative state folding</div>
              </button>

              {/* Sub-fork: Toy vs BDH */}
              <div className="w-3/4 border-t border-[var(--border)] h-3 relative">
                <div className="absolute left-0 -top-1 w-1.5 h-1.5 rounded-full bg-[var(--text-muted)]" />
                <div className="absolute right-0 -top-1 w-1.5 h-1.5 rounded-full bg-[var(--text-muted)]" />
              </div>

              <div className="w-full grid grid-cols-2 gap-4">
                {/* Our Toy */}
                <div className="flex flex-col items-center space-y-3">
                  <button
                    type="button"
                    onClick={() => setSelectedNodeId('ourToy')}
                    className={`w-full p-2.5 rounded-lg border transition-colors text-center cursor-pointer ${
                      selectedNodeId === 'ourToy'
                        ? 'border-[var(--color-accent)] bg-[var(--accent-blue)] text-[var(--text-primary)] ring-1 ring-[var(--color-accent)] font-semibold'
                        : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <div className="font-semibold text-[var(--accent-blue-text)] text-xs">Our toy</div>
                    <div className="text-xs text-[var(--text-secondary)] font-mono">Vector matrix M</div>
                  </button>

                  <div className="w-px h-2 bg-[var(--border)]" />

                  <button
                    type="button"
                    onClick={() => setSelectedNodeId('interference')}
                    className={`w-full p-2 rounded-lg border transition-colors text-center cursor-pointer ${
                      selectedNodeId === 'interference'
                        ? 'border-[var(--color-danger)] bg-[var(--accent-pink)] text-[var(--accent-pink-text)] ring-1 ring-[var(--color-danger)] font-semibold'
                        : 'border-[var(--border)] bg-[var(--surface)] text-[var(--accent-pink-text)] hover:bg-[var(--surface-soft)]'
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
                    className={`w-full p-2.5 rounded-lg border transition-colors text-center cursor-pointer ${
                      selectedNodeId === 'bdhFamily'
                        ? 'border-[var(--color-accent)] bg-[var(--accent-blue)] text-[var(--text-primary)] ring-1 ring-[var(--color-accent)] font-semibold'
                        : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <div className="font-semibold text-[var(--accent-blue-text)] text-xs">BDH family</div>
                    <div className="text-xs text-[var(--text-secondary)]">Synaptic plasticity</div>
                  </button>

                  <div className="w-px h-2 bg-[var(--border)]" />

                  <button
                    type="button"
                    onClick={() => setSelectedNodeId('localDynamics')}
                    className={`w-full p-2 rounded-lg border transition-colors text-center cursor-pointer ${
                      selectedNodeId === 'localDynamics'
                        ? 'border-[var(--color-accent)] bg-[var(--accent-blue)] text-[var(--text-primary)] ring-1 ring-[var(--color-accent)] font-semibold'
                        : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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

      {/* Selected Node Details Bar */}
      <div className="p-5 sm:p-6 bg-[var(--surface)] flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[var(--accent-blue-text)] bg-[var(--accent-blue)] border border-[var(--border)] px-2 py-0.5 rounded">
              Node inspection
            </span>
            <h4 className="text-sm sm:text-base font-sans font-semibold text-[var(--text-primary)]">
              {selectedNode.title}
            </h4>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            {selectedNode.description}
          </p>
          <div className="text-xs text-[var(--text-primary)] pt-0.5">
            <strong className="font-semibold text-[var(--accent-blue-text)]">Key characteristic: </strong>
            <span className="text-[var(--text-secondary)]">
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
            <ChevronRight className="w-3.5 h-3.5 text-[var(--accent-blue-text)]" />
          </button>
        )}
      </div>
    </div>
  );
};

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
    <div id={id} className="rounded-xl border border-[#D8DCD8] bg-[#FFFFFF] p-5 sm:p-7 text-[#252525] shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6DF] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#E7F2FA] border border-[#D8DCD8] text-[#31566E]">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-[#5F625F] font-semibold block">
              Synthesis map
            </span>
            <h3 className="text-lg font-serif font-bold text-[#252525] mt-0.5">
              Architectural Concept Map: From Memory to BDH
            </h3>
          </div>
        </div>

        <span className="text-xs text-[#5F625F]">
          Click any node to inspect its principles and trade-offs
        </span>
      </div>

      {/* Visual Interactive Tree Layout */}
      <div className="p-4 sm:p-6 rounded-xl bg-[#F7F5EF] border border-[#D8DCD8] overflow-x-auto">
        <div className="min-w-[640px] flex flex-col items-center space-y-5 select-none text-xs">
          {/* Root Node: Memory */}
          <button
            onClick={() => setSelectedNodeId('memory')}
            className={`px-5 py-2.5 rounded-lg border transition-all text-center cursor-pointer ${
              selectedNodeId === 'memory'
                ? 'border-[#31566E] bg-[#E7F2FA] text-[#1E3A52] ring-1 ring-[#31566E] shadow-xs font-semibold'
                : 'border-[#D8DCD8] bg-[#FFFFFF] text-[#252525] hover:border-[#5F625F]'
            }`}
          >
            <strong className="block text-sm">Memory in intelligence</strong>
            <span className="text-xs text-[#5F625F]">Fundamental design space</span>
          </button>

          {/* Fork into Growing vs Fixed */}
          <div className="w-1/2 border-t border-[#D8DCD8] h-3 relative">
            <div className="absolute left-0 -top-1 w-2 h-2 rounded-full bg-[#5F625F]" />
            <div className="absolute right-0 -top-1 w-2 h-2 rounded-full bg-[#5F625F]" />
          </div>

          <div className="w-full grid grid-cols-2 gap-8">
            {/* Left Branch: Growing Context */}
            <div className="flex flex-col items-center space-y-4">
              <button
                onClick={() => setSelectedNodeId('growingContext')}
                className={`w-full p-3 rounded-lg border transition-all text-center cursor-pointer ${
                  selectedNodeId === 'growingContext'
                    ? 'border-[#A46622] bg-[#FFF5D8] text-[#6E4211] ring-1 ring-[#A46622] shadow-xs font-semibold'
                    : 'border-[#D8DCD8] bg-[#FFFFFF] text-[#252525] hover:border-[#A46622]/60'
                }`}
              >
                <strong className="text-xs block text-[#A46622]">Growing context (O(T))</strong>
                <span className="text-xs text-[#5F625F]">Memory expands with tokens</span>
              </button>

              <div className="w-px h-3 bg-[#D8DCD8]" />

              <button
                onClick={() => setSelectedNodeId('kvCache')}
                className={`w-4/5 p-2.5 rounded-lg border transition-all text-center cursor-pointer ${
                  selectedNodeId === 'kvCache'
                    ? 'border-[#A46622] bg-[#FFF5D8] text-[#6E4211] ring-1 ring-[#A46622] shadow-xs font-semibold'
                    : 'border-[#D8DCD8] bg-[#FFFFFF] text-[#5F625F] hover:text-[#252525]'
                }`}
              >
                <div className="font-semibold text-[#A46622]">KV cache</div>
                <div className="text-xs text-[#5F625F]">Exhausts GPU VRAM</div>
              </button>
            </div>

            {/* Right Branch: Fixed State */}
            <div className="flex flex-col items-center space-y-4">
              <button
                onClick={() => setSelectedNodeId('fixedState')}
                className={`w-full p-3 rounded-lg border transition-all text-center cursor-pointer ${
                  selectedNodeId === 'fixedState'
                    ? 'border-[#31566E] bg-[#E7F2FA] text-[#1E3A52] ring-1 ring-[#31566E] shadow-xs font-semibold'
                    : 'border-[#D8DCD8] bg-[#FFFFFF] text-[#252525] hover:border-[#31566E]/60'
                }`}
              >
                <strong className="text-xs block text-[#31566E]">Fixed-size state (O(1))</strong>
                <span className="text-xs text-[#5F625F]">Memory stays bounded</span>
              </button>

              <div className="w-px h-3 bg-[#D8DCD8]" />

              <button
                onClick={() => setSelectedNodeId('recurrence')}
                className={`w-4/5 p-2.5 rounded-lg border transition-all text-center cursor-pointer ${
                  selectedNodeId === 'recurrence'
                    ? 'border-[#31566E] bg-[#E7F2FA] text-[#1E3A52] ring-1 ring-[#31566E] shadow-xs font-semibold'
                    : 'border-[#D8DCD8] bg-[#FFFFFF] text-[#5F625F] hover:text-[#252525]'
                }`}
              >
                <div className="font-semibold text-[#31566E]">Recurrence</div>
                <div className="text-xs text-[#5F625F]">Iterative state folding</div>
              </button>

              {/* Sub-fork: Toy vs BDH */}
              <div className="w-3/4 border-t border-[#D8DCD8] h-3 relative">
                <div className="absolute left-0 -top-1 w-1.5 h-1.5 rounded-full bg-[#5F625F]" />
                <div className="absolute right-0 -top-1 w-1.5 h-1.5 rounded-full bg-[#5F625F]" />
              </div>

              <div className="w-full grid grid-cols-2 gap-4">
                {/* Our Toy */}
                <div className="flex flex-col items-center space-y-3">
                  <button
                    onClick={() => setSelectedNodeId('ourToy')}
                    className={`w-full p-2.5 rounded-lg border transition-all text-center cursor-pointer ${
                      selectedNodeId === 'ourToy'
                        ? 'border-[#31566E] bg-[#E7F2FA] text-[#1E3A52] ring-1 ring-[#31566E] shadow-xs font-semibold'
                        : 'border-[#D8DCD8] bg-[#FFFFFF] text-[#5F625F] hover:text-[#252525]'
                    }`}
                  >
                    <div className="font-semibold text-[#31566E] text-xs">Our toy</div>
                    <div className="text-xs text-[#5F625F] font-mono">Vector matrix M</div>
                  </button>

                  <div className="w-px h-2 bg-[#D8DCD8]" />

                  <button
                    onClick={() => setSelectedNodeId('interference')}
                    className={`w-full p-2 rounded-lg border transition-all text-center cursor-pointer ${
                      selectedNodeId === 'interference'
                        ? 'border-[#B64235] bg-[#F9E9ED] text-[#B64235] ring-1 ring-[#B64235] font-semibold'
                        : 'border-[#D8DCD8] bg-[#FFFFFF] text-[#B64235]/80 hover:text-[#B64235]'
                    }`}
                  >
                    <div className="text-xs">Interference</div>
                  </button>
                </div>

                {/* BDH Family */}
                <div className="flex flex-col items-center space-y-3">
                  <button
                    onClick={() => setSelectedNodeId('bdhFamily')}
                    className={`w-full p-2.5 rounded-lg border transition-all text-center cursor-pointer ${
                      selectedNodeId === 'bdhFamily'
                        ? 'border-[#31566E] bg-[#E7F2FA] text-[#1E3A52] ring-1 ring-[#31566E] shadow-xs font-semibold'
                        : 'border-[#D8DCD8] bg-[#FFFFFF] text-[#5F625F] hover:text-[#252525]'
                    }`}
                  >
                    <div className="font-semibold text-[#31566E] text-xs">BDH family</div>
                    <div className="text-xs text-[#5F625F]">Synaptic plasticity</div>
                  </button>

                  <div className="w-px h-2 bg-[#D8DCD8]" />

                  <button
                    onClick={() => setSelectedNodeId('localDynamics')}
                    className={`w-full p-2 rounded-lg border transition-all text-center cursor-pointer ${
                      selectedNodeId === 'localDynamics'
                        ? 'border-[#31566E] bg-[#E7F2FA] text-[#1E3A52] ring-1 ring-[#31566E] font-semibold'
                        : 'border-[#D8DCD8] bg-[#FFFFFF] text-[#5F625F] hover:text-[#252525]'
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

      {/* Selected Node Details Card */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#F7F5EF] border border-[#D8DCD8] flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-semibold text-[#31566E] bg-[#E7F2FA] border border-[#D8DCD8] px-2 py-0.5 rounded">
              Node inspection
            </span>
            <h4 className="text-sm font-bold text-[#252525]">{selectedNode.title}</h4>
          </div>
          <p className="text-xs text-[#5F625F] leading-relaxed">
            {selectedNode.description}
          </p>
          <div className="text-xs text-[#252525] pt-1">
            <strong className="font-semibold text-[#31566E]">Key characteristic: </strong>
            <span className="text-[#5F625F]">
              <FormattedMathText text={selectedNode.keyMetric} />
            </span>
          </div>
        </div>

        {selectedNode.relatedSectionId && onNavigate && (
          <button
            onClick={() => onNavigate(selectedNode.relatedSectionId!)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FFFFFF] hover:bg-[#F7F5EF] text-[#252525] border border-[#D8DCD8] text-xs font-medium transition cursor-pointer shadow-xs"
          >
            <span>Jump to section</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#31566E]" />
          </button>
        )}
      </div>
    </div>
  );
};

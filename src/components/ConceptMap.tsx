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
  onNavigate?: (sectionId: string) => void;
}

export const ConceptMap: React.FC<ConceptMapProps> = ({ onNavigate }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('fixedState');

  const selectedNode = CONCEPT_NODES[selectedNodeId] || CONCEPT_NODES.memory;

  return (
    <div className="rounded-2xl border border-[#222B3D] bg-[#090C16] p-5 sm:p-7 text-slate-100 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2536] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-800 text-purple-300">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold block">
              SYNTHESIS MAP
            </span>
            <h3 className="text-lg font-bold font-mono text-white mt-0.5">
              Architectural Concept Map: From Memory to BDH
            </h3>
          </div>
        </div>

        <span className="text-xs font-mono text-slate-400">
          Click any node to inspect its principles and trade-offs
        </span>
      </div>

      {/* Visual Interactive Tree Layout */}
      <div className="p-4 sm:p-6 rounded-xl bg-[#06080F] border border-[#1C2336] overflow-x-auto">
        <div className="min-w-[640px] flex flex-col items-center space-y-5 select-none font-mono text-xs">
          {/* Root Node: Memory */}
          <button
            onClick={() => setSelectedNodeId('memory')}
            className={`px-5 py-2.5 rounded-xl border transition-all ${
              selectedNodeId === 'memory'
                ? 'border-white bg-[#1B2236] text-white ring-2 ring-[#22D3EE]/50 shadow-lg'
                : 'border-[#2B354C] bg-[#101524] text-slate-300 hover:border-slate-400'
            }`}
          >
            <strong className="block text-sm">MEMORY IN INTELLIGENCE</strong>
            <span className="text-[10px] text-slate-400">Fundamental Design Space</span>
          </button>

          {/* Fork into Growing vs Fixed */}
          <div className="w-1/2 border-t border-slate-700 h-3 relative">
            <div className="absolute left-0 -top-1 w-2 h-2 rounded-full bg-slate-500" />
            <div className="absolute right-0 -top-1 w-2 h-2 rounded-full bg-slate-500" />
          </div>

          <div className="w-full grid grid-cols-2 gap-8">
            {/* Left Branch: Growing Context */}
            <div className="flex flex-col items-center space-y-4">
              <button
                onClick={() => setSelectedNodeId('growingContext')}
                className={`w-full p-3 rounded-xl border transition-all text-center ${
                  selectedNodeId === 'growingContext'
                    ? 'border-amber-400 bg-amber-950/60 text-amber-200 ring-2 ring-amber-400/50 shadow-lg'
                    : 'border-[#2B354C] bg-[#111624] text-slate-300 hover:border-amber-500/50'
                }`}
              >
                <strong className="text-xs block text-amber-400">GROWING CONTEXT</strong>
                <span className="text-[10px] text-slate-400">Memory expands O(T) with tokens</span>
              </button>

              <div className="w-px h-3 bg-slate-700" />

              <button
                onClick={() => setSelectedNodeId('kvCache')}
                className={`w-4/5 p-2.5 rounded-lg border transition-all text-center ${
                  selectedNodeId === 'kvCache'
                    ? 'border-amber-400 bg-amber-950/80 text-white ring-2 ring-amber-400/50 shadow-lg'
                    : 'border-[#222B3D] bg-[#0D121F] text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-bold text-amber-300">KV CACHE</div>
                <div className="text-[9px] text-slate-500">Exhausts GPU VRAM</div>
              </button>
            </div>

            {/* Right Branch: Fixed State */}
            <div className="flex flex-col items-center space-y-4">
              <button
                onClick={() => setSelectedNodeId('fixedState')}
                className={`w-full p-3 rounded-xl border transition-all text-center ${
                  selectedNodeId === 'fixedState'
                    ? 'border-[#22D3EE] bg-cyan-950/60 text-cyan-200 ring-2 ring-[#22D3EE]/50 shadow-lg'
                    : 'border-[#2B354C] bg-[#111624] text-slate-300 hover:border-cyan-500/50'
                }`}
              >
                <strong className="text-xs block text-[#22D3EE]">FIXED-SIZE STATE</strong>
                <span className="text-[10px] text-slate-400">Memory stays bounded O(1)</span>
              </button>

              <div className="w-px h-3 bg-slate-700" />

              <button
                onClick={() => setSelectedNodeId('recurrence')}
                className={`w-4/5 p-2.5 rounded-lg border transition-all text-center ${
                  selectedNodeId === 'recurrence'
                    ? 'border-[#22D3EE] bg-cyan-950/80 text-white ring-2 ring-[#22D3EE]/50 shadow-lg'
                    : 'border-[#222B3D] bg-[#0D121F] text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-bold text-cyan-300">RECURRENCE</div>
                <div className="text-[9px] text-slate-500">Iterative State Folding</div>
              </button>

              {/* Sub-fork: Toy vs BDH */}
              <div className="w-3/4 border-t border-slate-700 h-3 relative">
                <div className="absolute left-0 -top-1 w-1.5 h-1.5 rounded-full bg-slate-500" />
                <div className="absolute right-0 -top-1 w-1.5 h-1.5 rounded-full bg-slate-500" />
              </div>

              <div className="w-full grid grid-cols-2 gap-4">
                {/* Our Toy */}
                <div className="flex flex-col items-center space-y-3">
                  <button
                    onClick={() => setSelectedNodeId('ourToy')}
                    className={`w-full p-2.5 rounded-lg border transition-all text-center ${
                      selectedNodeId === 'ourToy'
                        ? 'border-[#22D3EE] bg-cyan-950/90 text-white ring-2 ring-[#22D3EE]/50 shadow-md'
                        : 'border-[#222B3D] bg-[#0D121F] text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-cyan-300 text-[11px]">OUR TOY</div>
                    <div className="text-[9px] text-slate-500">Vector Matrix M</div>
                  </button>

                  <div className="w-px h-2 bg-slate-700" />

                  <button
                    onClick={() => setSelectedNodeId('interference')}
                    className={`w-full p-2 rounded border transition-all text-center ${
                      selectedNodeId === 'interference'
                        ? 'border-rose-500 bg-rose-950/80 text-rose-300 ring-1 ring-rose-500 font-bold'
                        : 'border-[#222B3D] bg-[#0A0D16] text-rose-400/70 hover:text-rose-300'
                    }`}
                  >
                    <div className="text-[10px]">Interference</div>
                  </button>
                </div>

                {/* BDH Family */}
                <div className="flex flex-col items-center space-y-3">
                  <button
                    onClick={() => setSelectedNodeId('bdhFamily')}
                    className={`w-full p-2.5 rounded-lg border transition-all text-center ${
                      selectedNodeId === 'bdhFamily'
                        ? 'border-purple-400 bg-purple-950/90 text-white ring-2 ring-purple-400/50 shadow-md'
                        : 'border-[#222B3D] bg-[#0D121F] text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-purple-300 text-[11px]">BDH FAMILY</div>
                    <div className="text-[9px] text-slate-500">Synaptic Plasticity σ_ij</div>
                  </button>

                  <div className="w-px h-2 bg-slate-700" />

                  <button
                    onClick={() => setSelectedNodeId('localDynamics')}
                    className={`w-full p-2 rounded border transition-all text-center ${
                      selectedNodeId === 'localDynamics'
                        ? 'border-purple-400 bg-purple-950/80 text-purple-300 ring-1 ring-purple-400 font-bold'
                        : 'border-[#222B3D] bg-[#0A0D16] text-purple-400/70 hover:text-purple-300'
                    }`}
                  >
                    <div className="text-[10px]">Latent Dynamics</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Node Details Card */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#0D121F] border border-[#20293D] flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl font-mono">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-[#22D3EE] bg-cyan-950/70 border border-cyan-800/60 px-2 py-0.5 rounded">
              NODE INSPECTION
            </span>
            <h4 className="text-sm font-bold text-white">{selectedNode.title}</h4>
          </div>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            {selectedNode.description}
          </p>
          <div className="text-xs text-[#22D3EE] pt-1">
            <strong>Key Characteristic: </strong>
            <span className="text-slate-300">
              <FormattedMathText text={selectedNode.keyMetric} />
            </span>
          </div>
        </div>

        {selectedNode.relatedSectionId && onNavigate && (
          <button
            onClick={() => onNavigate(selectedNode.relatedSectionId!)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#161D2E] hover:bg-[#202A42] text-white border border-[#2B3650] font-mono text-xs font-semibold transition"
          >
            <span>Jump to Section</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#22D3EE]" />
          </button>
        )}
      </div>
    </div>
  );
};

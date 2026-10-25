import React, { useState } from 'react';
import {
  Network,
  Share2,
  Info,
  BookOpen,
  Sparkles,
  Layers,
  ArrowRight,
  Database,
  Cpu,
  Zap,
} from 'lucide-react';
import { InlineMath, BlockMath } from '../ui/MathView';

export const Page05BDHInteractions: React.FC = () => {
  // 1. Interactive Architecture Diagram Node Selection
  const [selectedNode, setSelectedNode] = useState<'input' | 'neuron' | 'synapse' | 'memory' | 'update'>('neuron');

  // 2. Architecture Comparison Selection
  const [selectedArch, setSelectedArch] = useState<'rnn' | 'lstm' | 'transformer' | 'bdh'>('bdh');

  // 3. Synaptic Update Inspector
  const [selectedSynapse, setSelectedSynapse] = useState<{ i: number; j: number }>({ i: 2, j: 5 });

  // 4. Toy vs Published Research Toggle
  const [mode, setMode] = useState<'toy' | 'research'>('toy');

  // Deterministic toy synaptic state calculation
  const synapseData = {
    source: `Neuron #${selectedSynapse.i} (Sensory/Feature projection)`,
    target: `Neuron #${selectedSynapse.j} (Associative latent hub)`,
    prevWeight: 0.428,
    hebbianUpdate: 0.185,
    nextWeight: 0.591, // with decay 0.95: 0.428 * 0.95 + 0.185 = 0.5916
  };

  const ARCH_DETAILS = {
    rnn: {
      name: 'Standard Recurrent Neural Network (Elman RNN)',
      memoryRep: 'Dense vector activation h_t in R^d',
      stateBehavior: 'Updated via single matrix multiplication and non-linearity: h_{t+1} = tanh(W h_t + U x_t)',
      seqDep: 'Strong recency bias, severe gradient vanishing over long sequences',
      scaling: 'Constant memory O(1), linear compute O(T)',
      evidenceType: 'Historical architecture baseline (Rumelhart et al., 1986)',
    },
    lstm: {
      name: 'Long Short-Term Memory (LSTM / GRU)',
      memoryRep: 'Dual state: hidden activation h_t and cell carousel c_t with additive flow',
      stateBehavior: 'Gated linear updates: input, forget, and output gating prevent gradient collapse',
      seqDep: 'Significantly longer memory retention than standard RNN, but still bounded fixed capacity',
      scaling: 'Constant memory O(1), linear compute O(T)',
      evidenceType: 'Established sequential baseline (Hochreiter & Schmidhuber, 1997)',
    },
    transformer: {
      name: 'Standard Transformer Self-Attention',
      memoryRep: 'Full historical token buffer in Key-Value cache tensors (K, V)',
      stateBehavior: 'No compression during sequence ingestion: each token attends to all prior tokens verbatim',
      seqDep: 'Unbounded sequence context fidelity without forgetting',
      scaling: 'Linear memory growth O(T) RAM, quadratic attention compute O(T^2) without KV caching optimizations',
      evidenceType: 'Dominant modern paradigm (Vaswani et al., 2017)',
    },
    bdh: {
      name: 'Biological Dragon Hatchling (BDH)',
      memoryRep: 'Decentralized sparse particle graph with plastic synaptic weights sigma_ij',
      stateBehavior: 'Local Hebbian co-activation updates and continuous latent relaxation loops',
      seqDep: 'Iterative synaptic consolidation without growing a monolithic token cache',
      scaling: 'Sub-linear active memory, scale-free connectivity topology',
      evidenceType: 'Published frontier research (Pathway, 2024)',
    },
  };

  const currentArch = ARCH_DETAILS[selectedArch];

  return (
    <div className="space-y-8 mt-6">
      {/* 4. TOY VS PUBLISHED RESEARCH MODE BANNER */}
      <div className="rounded-xl border border-[#D8DCD8] bg-[#F7F5EF] p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase text-[#5F625F]">Perspective Mode:</span>
          <div className="flex items-center gap-1 bg-[#FFFFFF] p-1 rounded-lg border border-[#D8DCD8]">
            <button
              onClick={() => setMode('toy')}
              className={`px-3 py-1 rounded text-xs font-medium transition cursor-pointer ${
                mode === 'toy' ? 'bg-[#31566E] text-white font-bold' : 'text-[#5F625F] hover:text-[#252525]'
              }`}
            >
              Educational Toy Model
            </button>
            <button
              onClick={() => setMode('research')}
              className={`px-3 py-1 rounded text-xs font-medium transition cursor-pointer ${
                mode === 'research' ? 'bg-[#31566E] text-white font-bold' : 'text-[#5F625F] hover:text-[#252525]'
              }`}
            >
              Published Research
            </button>
          </div>
        </div>

        <span className="text-xs italic text-[#5F625F]">
          {mode === 'toy'
            ? 'Educational toy: simplified mathematical demonstration, not the official BDH codebase.'
            : 'Published research context: grounded in Pathway technical publications and peer benchmarks.'}
        </span>
      </div>

      {/* 1. INTERACTIVE ARCHITECTURE DIAGRAM */}
      <div className="rounded-xl border border-[#D8DCD8] bg-[#FFFFFF] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#EAE6DF] pb-3">
          <div className="p-1.5 rounded-lg bg-[#E7F2FA] text-[#31566E]">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-[#252525]">
              1. Interactive Architecture Nodes
            </h3>
            <p className="text-xs text-[#5F625F]">
              Click on any structural element of the BDH graph topology to inspect its role.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { id: 'input', label: '1. Input Stream', desc: 'Token sequence projected into sparse spatial activation pulses.' },
            { id: 'neuron', label: '2. Neuron State', desc: 'Continuous latent firing threshold and membrane relaxation potential.' },
            { id: 'synapse', label: '3. Plastic Synapse', desc: 'Dynamic weight sigma_ij modulated via localized Hebbian co-activation.' },
            { id: 'memory', label: '4. Synaptic Memory', desc: 'Decentralized connectivity matrix storing associative relations.' },
            { id: 'update', label: '5. Recurrent Loop', desc: 'Iterative latent thought passes before discrete token projection.' },
          ].map((node) => (
            <button
              key={node.id}
              onClick={() => setSelectedNode(node.id as any)}
              className={`p-3 rounded-xl border text-left transition cursor-pointer space-y-1 ${
                selectedNode === node.id
                  ? 'border-[#31566E] bg-[#E7F2FA] text-[#31566E] ring-1 ring-[#31566E] font-bold shadow-xs'
                  : 'border-[#D8DCD8] bg-[#F7F5EF] text-[#5F625F] hover:text-[#252525] hover:border-[#5F625F]'
              }`}
            >
              <div className="text-xs font-semibold">{node.label}</div>
              <p className="text-[11px] leading-relaxed line-clamp-2 text-[#5F625F]">
                {node.desc}
              </p>
            </button>
          ))}
        </div>

        {/* Selected Node Detailed Explanation */}
        <div className="p-4 rounded-xl bg-[#F7F5EF] border border-[#D8DCD8] text-xs space-y-1.5">
          <span className="font-semibold text-[#31566E] uppercase text-[11px] block">
            Node Inspection: {selectedNode.toUpperCase()}
          </span>
          <p className="text-xs text-[#252525] leading-relaxed">
            {selectedNode === 'input' &&
              'In BDH, incoming sequence data does not simply sit in an expanding matrix buffer. It activates specific topological entry neurons in the sparse graph, emitting signal waves across plastic connections.'}
            {selectedNode === 'neuron' &&
              'Each neuron retains a local activation potential. Rather than forcing all computation into a feedforward layer, neurons interact continuously via recurrent relaxation loops.'}
            {selectedNode === 'synapse' &&
              'Synapses between neurons obey local plasticity: when neuron i and neuron j fire simultaneously, their connecting synaptic weight sigma_ij strengthens according to Hebbian learning rules.'}
            {selectedNode === 'memory' &&
              'Memory is not a standalone storage module. It resides intrinsically within the collective synaptic weights across the scale-free network.'}
            {selectedNode === 'update' &&
              'Recurrent update law: sigma_ij(t+1) = lambda sigma_ij(t) + eta x_i(t) y_j(t). Allows memory retention to unfold continuously.'}
          </p>
        </div>
      </div>

      {/* 2. RNN VS TRANSFORMER VS BDH ARCHITECTURE COMPARISON */}
      <div className="rounded-xl border border-[#D8DCD8] bg-[#FFFFFF] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6DF] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#FFF5D8] text-[#A46622]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#252525]">
                2. Architectural Paradigm Comparison
              </h3>
              <p className="text-xs text-[#5F625F]">
                Select an architecture to inspect how memory representation, scaling, and sequence dependence fundamentally diverge.
              </p>
            </div>
          </div>
          <span className="text-xs italic text-[#5F625F]">
            Educational comparison, not a cherry-picked benchmark claim.
          </span>
        </div>

        {/* Architecture Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(['rnn', 'lstm', 'transformer', 'bdh'] as const).map((archKey) => (
            <button
              key={archKey}
              onClick={() => setSelectedArch(archKey)}
              className={`p-2.5 rounded-xl border text-xs font-medium transition cursor-pointer text-center ${
                selectedArch === archKey
                  ? 'border-[#31566E] bg-[#E7F2FA] text-[#31566E] font-bold shadow-xs'
                  : 'border-[#D8DCD8] bg-[#F7F5EF] text-[#5F625F] hover:text-[#252525]'
              }`}
            >
              {archKey.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Selected Architecture Detailed Telemetry */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#F7F5EF] border border-[#D8DCD8] space-y-1">
            <span className="text-[#5F625F] uppercase font-semibold text-[11px] block">Architecture</span>
            <strong className="text-[#252525] text-sm block">{currentArch.name}</strong>
            <span className="text-[#5F625F] block pt-1">
              <strong>Memory Representation: </strong>{currentArch.memoryRep}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F7F5EF] border border-[#D8DCD8] space-y-1">
            <span className="text-[#5F625F] uppercase font-semibold text-[11px] block">State Dynamics Law</span>
            <p className="text-[#252525] leading-relaxed">{currentArch.stateBehavior}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F7F5EF] border border-[#D8DCD8] space-y-1">
            <span className="text-[#5F625F] uppercase font-semibold text-[11px] block">Computational Scaling</span>
            <p className="font-mono text-[#31566E] font-bold">{currentArch.scaling}</p>
            <p className="text-[#5F625F] text-[11px] pt-1">{currentArch.seqDep}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#E7F2FA] border border-[#D8DCD8] text-[#31566E] space-y-1">
            <span className="uppercase font-semibold text-[11px] block">Evidence Context</span>
            <p className="text-[11px] leading-relaxed">{currentArch.evidenceType}</p>
          </div>
        </div>
      </div>

      {/* 3. SYNAPTIC UPDATE INSPECTOR */}
      <div className="rounded-xl border border-[#D8DCD8] bg-[#FFFFFF] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#EAE6DF] pb-3">
          <div className="p-1.5 rounded-lg bg-[#DCEFE2] text-[#247A4B]">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-[#252525]">
              3. Synaptic Update Inspector (Hebb's Rule)
            </h3>
            <p className="text-xs text-[#5F625F]">
              Select a synapse between neuron pair <InlineMath math="(i, j)" /> to view its weight modification under local co-activation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#F7F5EF] border border-[#D8DCD8] space-y-1">
            <span className="text-[#5F625F] uppercase font-semibold text-[11px] block">Synapse Selection</span>
            <div className="flex items-center gap-2 pt-1">
              <label className="text-[#5F625F]">Source i:</label>
              <select
                value={selectedSynapse.i}
                onChange={(e) => setSelectedSynapse((prev) => ({ ...prev, i: parseInt(e.target.value, 10) }))}
                className="p-1 rounded border border-[#D8DCD8] bg-[#FFFFFF] cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>Neuron {n}</option>
                ))}
              </select>

              <label className="text-[#5F625F]">Target j:</label>
              <select
                value={selectedSynapse.j}
                onChange={(e) => setSelectedSynapse((prev) => ({ ...prev, j: parseInt(e.target.value, 10) }))}
                className="p-1 rounded border border-[#D8DCD8] bg-[#FFFFFF] cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>Neuron {n}</option>
                ))}
              </select>
            </div>
            <span className="text-[11px] text-[#5F625F] block pt-1">{synapseData.source} → {synapseData.target}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F7F5EF] border border-[#D8DCD8] space-y-1">
            <span className="text-[#5F625F] uppercase font-semibold text-[11px] block">Previous Weight <InlineMath math="\sigma_{ij}(t)" /></span>
            <div className="text-base font-mono font-bold text-[#252525]">{synapseData.prevWeight.toFixed(4)}</div>
            <span className="text-[11px] text-[#5F625F]">Prior synaptic conductance</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F7F5EF] border border-[#D8DCD8] space-y-1">
            <span className="text-[#5F625F] uppercase font-semibold text-[11px] block">Hebbian Delta <InlineMath math="\eta x_i y_j" /></span>
            <div className="text-base font-mono font-bold text-[#247A4B]">+{synapseData.hebbianUpdate.toFixed(4)}</div>
            <span className="text-[11px] text-[#5F625F]">Concurrent firing update</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#E7F2FA] border border-[#D8DCD8] text-[#31566E] space-y-1">
            <span className="uppercase font-semibold text-[11px] block">New Weight <InlineMath math="\sigma_{ij}(t+1)" /></span>
            <div className="text-base font-mono font-bold">{synapseData.nextWeight.toFixed(4)}</div>
            <span className="text-[11px]">Updated synaptic strength</span>
          </div>
        </div>
      </div>
    </div>
  );
};

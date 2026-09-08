import React, { useState } from 'react';
import { sources } from '../data/researchSources';
import { SourceBadge } from './ui/SourceBadge';
import {
  Brain,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  HelpCircle,
  Activity,
  ArrowRight,
  Info,
} from 'lucide-react';

interface MemoryBridgeProps {
  id?: string;
}

export const MemoryBridge: React.FC<MemoryBridgeProps> = ({
  id = 'memory-bridge-bdh',
}) => {
  // Interactive Question State
  const [selectedToyLocation, setSelectedToyLocation] = useState<string | null>(null);
  const [selectedBdhLocation, setSelectedBdhLocation] = useState<string | null>(null);
  const [reasoningRounds, setReasoningRounds] = useState<number>(3);

  // Selected Inspector State for microscopic drill-down
  const [selectedItem, setSelectedItem] = useState<{
    type: 'neuron' | 'synapse' | 'round';
    id: string;
    details: Record<string, string | number | boolean>;
  }>({
    type: 'neuron',
    id: 'N17',
    details: {
      activation: 0.82,
      status: 'ACTIVE',
      connectedSynapses: 6,
      layer: 'Scale-Free Cluster 2',
    },
  });

  // Simulated educational BDH nodes & synapses for microscopic inspection
  const sampleNeurons = [
    { id: 'N04', activation: 0.68, status: 'ACTIVE', synapses: 5 },
    { id: 'N11', activation: 0.24, status: 'QUIESCENT', synapses: 3 },
    { id: 'N17', activation: 0.82, status: 'ACTIVE', synapses: 6 },
    { id: 'N23', activation: 0.75, status: 'ACTIVE', synapses: 7 },
  ];

  const sampleSynapses = [
    { from: 'N17', to: 'N04', weight: 0.61, state: 0.74 },
    { from: 'N17', to: 'N23', weight: 0.45, state: 0.59 },
    { from: 'N04', to: 'N11', weight: 0.32, state: 0.18 },
  ];

  const roundDetails: Record<number, { read: boolean; reweight: boolean; neuronUpdate: boolean; propagation: boolean }> = {
    1: { read: true, reweight: true, neuronUpdate: true, propagation: true },
    2: { read: true, reweight: true, neuronUpdate: true, propagation: true },
    3: { read: true, reweight: true, neuronUpdate: true, propagation: true },
    4: { read: true, reweight: true, neuronUpdate: true, propagation: true },
  };

  return (
    <div id={id} className="rounded-2xl border border-[#232B3C] bg-[#0A0E17] p-5 sm:p-7 text-slate-100 shadow-xl space-y-7">
      {/* Title & Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1C2436] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-purple-400 bg-purple-950/60 border border-purple-800/60 px-2 py-0.5 rounded font-semibold">
              CONCEPTUAL ARCHITECTURE BRIDGE
            </span>
            <span className="text-xs font-mono text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded font-semibold">
              EDUCATIONAL BDH ABSTRACTION
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
            WHERE DOES MEMORY LIVE?
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl font-sans">
            Comparing the recurrent state matrix of our associative toy model with the plastic synaptic substrate of the published Dragon Hatchling (BDH) architecture.
          </p>
        </div>
      </div>

      {/* Side-by-Side Architectural Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT: Our Educational Memory Model */}
        <div className="rounded-xl border border-blue-900/50 bg-[#0C121F] p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#1C2538] pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                <h4 className="text-sm font-bold font-mono text-blue-300">
                  OUR EDUCATIONAL MEMORY MODEL
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-blue-950/50 px-2 py-0.5 rounded border border-blue-800/50">
                FAST-WEIGHT MATRIX
              </span>
            </div>

            {/* Pipeline Flow */}
            <div className="space-y-2 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-[#111728] border border-[#202B42] flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-blue-600/30 text-blue-300 flex items-center justify-center font-bold text-[10px]">1</span>
                <span><strong>Input:</strong> Sequential key-value pairs (France → Paris)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#111728] border border-[#202B42] flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-blue-600/30 text-blue-300 flex items-center justify-center font-bold text-[10px]">2</span>
                <span><strong>State:</strong> Fixed D×D numerical matrix representation M[t]</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#111728] border border-[#202B42] flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-blue-600/30 text-blue-300 flex items-center justify-center font-bold text-[10px]">3</span>
                <span><strong>Memory Update:</strong> M[t] = λ·M[t-1] + η·(k ⊗ v)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#111728] border border-[#202B42] flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-blue-600/30 text-blue-300 flex items-center justify-center font-bold text-[10px]">4</span>
                <span><strong>Query:</strong> Input probe vector q</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#111728] border border-[#202B42] flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-blue-600/30 text-blue-300 flex items-center justify-center font-bold text-[10px]">5</span>
                <span><strong>Retrieval:</strong> Matrix projection v̂ = qᵀ · M[t]</span>
              </div>
            </div>

            {/* Interactive Question: Left */}
            <div className="pt-3 border-t border-[#1C2538]">
              <div className="text-xs font-mono text-slate-300 font-semibold mb-2">
                Where does memory live in this toy?
              </div>
              <div className="flex flex-wrap gap-2">
                {['STATE / MEMORY MATRIX', 'ATTENTION CACHE', 'PROMPT TOKENS'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedToyLocation(opt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition border ${
                      selectedToyLocation === opt
                        ? opt === 'STATE / MEMORY MATRIX'
                          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                          : 'bg-rose-950/80 border-rose-500 text-rose-300'
                        : 'bg-[#141A28] border-[#222C40] text-slate-300 hover:bg-[#1A2336]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {selectedToyLocation && (
                <div className="mt-2 text-xs font-sans text-slate-300 leading-relaxed p-2.5 rounded bg-blue-950/30 border border-blue-900/40">
                  {selectedToyLocation === 'STATE / MEMORY MATRIX' ? (
                    <span className="text-emerald-300">
                      ✓ Exactly right! Memory is stored entirely inside the evolving coordinates of the fixed-size matrix M.
                    </span>
                  ) : (
                    <span className="text-rose-300">
                      ✕ Not here. Our toy does not maintain a KV-cache or raw tokens; all history is compressed into the fixed state.
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Published BDH Concept */}
        <div className="rounded-xl border border-purple-900/50 bg-[#100C1F] p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#2A1D40] pb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <h4 className="text-sm font-bold font-mono text-purple-300">
                  PUBLISHED BDH CONCEPT
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-purple-950/50 px-2 py-0.5 rounded border border-purple-800/50">
                SYNAPTIC SUBSTRATE
              </span>
            </div>

            {/* Pipeline Flow */}
            <div className="space-y-2 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-[#18112C] border border-[#2D1F4D] flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-purple-600/30 text-purple-300 flex items-center justify-center font-bold text-[10px]">1</span>
                <span><strong>Input:</strong> Token representations projected onto graph nodes</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#18112C] border border-[#2D1F4D] flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-purple-600/30 text-purple-300 flex items-center justify-center font-bold text-[10px]">2</span>
                <span><strong>Neuron Activity:</strong> Sparse activation spikes across scale-free graph</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#18112C] border border-[#2D1F4D] flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-purple-600/30 text-purple-300 flex items-center justify-center font-bold text-[10px]">3</span>
                <span><strong>Synaptic State:</strong> Plastic weights σ(i, j) updated via local Hebbian flow</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#18112C] border border-[#2D1F4D] flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-purple-600/30 text-purple-300 flex items-center justify-center font-bold text-[10px]">4</span>
                <span><strong>Local Interaction:</strong> Communication through edge neighborhood</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#18112C] border border-[#2D1F4D] flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-purple-600/30 text-purple-300 flex items-center justify-center font-bold text-[10px]">5</span>
                <span><strong>Next Reasoning Round:</strong> 4-phase relaxation without full sequence re-eval</span>
              </div>
            </div>

            {/* Interactive Question: Right */}
            <div className="pt-3 border-t border-[#2A1D40]">
              <div className="text-xs font-mono text-slate-300 font-semibold mb-2">
                Where does contextual memory live in BDH?
              </div>
              <div className="flex flex-wrap gap-2">
                {['SYNAPTIC STATE', 'KV CACHE', 'GPU RAM CONCATENATION'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedBdhLocation(opt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition border ${
                      selectedBdhLocation === opt
                        ? opt === 'SYNAPTIC STATE'
                          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                          : 'bg-rose-950/80 border-rose-500 text-rose-300'
                        : 'bg-[#1B142F] border-[#2F214E] text-slate-300 hover:bg-[#251B40]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {selectedBdhLocation && (
                <div className="mt-2 text-xs font-sans text-slate-300 leading-relaxed p-2.5 rounded bg-purple-950/30 border border-purple-900/40">
                  {selectedBdhLocation === 'SYNAPTIC STATE' ? (
                    <span className="text-emerald-300">
                      ✓ Correct! In BDH, working memory lives directly on the plastic connection states σ(i, j) connecting graph neurons.
                    </span>
                  ) : (
                    <span className="text-rose-300">
                      ✕ BDH explicitly replaces the growing KV-cache with a dynamic synaptic state updated locally in-place.
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reasoning Rounds Slider & Microscopic Inspection */}
      <div className="rounded-xl border border-[#222B3D] bg-[#0D121F] p-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1C2538] pb-4">
          <div>
            <h4 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              INTERACTIVE REASONING ROUNDS & ELEMENT INSPECTOR
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any neuron, synapse, or reasoning round to inspect its state telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">NUMBER OF REASONING ROUNDS:</span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setReasoningRounds(r);
                    setSelectedItem({
                      type: 'round',
                      id: `ROUND ${r}`,
                      details: {
                        roundNumber: r,
                        memoryRead: true,
                        synapticUpdate: true,
                        neuronUpdate: true,
                        recurrentPropagation: true,
                      },
                    });
                  }}
                  className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition border ${
                    reasoningRounds === r
                      ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-500/20'
                      : 'bg-[#151D2C] border-[#222D42] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Element Picker: Neurons, Synapses, Rounds */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pickable Neurons */}
          <div className="space-y-2">
            <div className="text-xs font-mono text-slate-400 uppercase">Click Neuron:</div>
            <div className="grid grid-cols-2 gap-2">
              {sampleNeurons.map((n) => (
                <button
                  key={n.id}
                  onClick={() =>
                    setSelectedItem({
                      type: 'neuron',
                      id: n.id,
                      details: {
                        activation: n.activation,
                        status: n.status,
                        connectedSynapses: n.synapses,
                      },
                    })
                  }
                  className={`p-2.5 rounded-lg border text-left font-mono text-xs transition ${
                    selectedItem.id === n.id
                      ? 'border-blue-500 bg-blue-950/60 text-blue-200 ring-1 ring-blue-400'
                      : 'border-[#1C2538] bg-[#121726] text-slate-300 hover:bg-[#182033]'
                  }`}
                >
                  <div className="font-bold text-white">{n.id}</div>
                  <div className="text-[11px] text-slate-400">Act: {n.activation}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Pickable Synapses */}
          <div className="space-y-2">
            <div className="text-xs font-mono text-slate-400 uppercase">Click Synapse:</div>
            <div className="space-y-1.5">
              {sampleSynapses.map((s) => {
                const sId = `${s.from} → ${s.to}`;
                return (
                  <button
                    key={sId}
                    onClick={() =>
                      setSelectedItem({
                        type: 'synapse',
                        id: sId,
                        details: {
                          from: s.from,
                          to: s.to,
                          weight: s.weight,
                          synapticState: s.state,
                          role: 'Memory-bearing connection',
                        },
                      })
                    }
                    className={`w-full p-2 rounded-lg border text-left font-mono text-xs transition flex items-center justify-between ${
                      selectedItem.id === sId
                        ? 'border-purple-500 bg-purple-950/60 text-purple-200 ring-1 ring-purple-400'
                        : 'border-[#1C2538] bg-[#121726] text-slate-300 hover:bg-[#182033]'
                    }`}
                  >
                    <span className="font-semibold text-white">{sId}</span>
                    <span className="text-purple-300 text-[11px]">σ = {s.state}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Telemetry Readout Card */}
          <div className="p-3.5 rounded-lg bg-[#080C14] border border-[#1A2234] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#1A2234] pb-2 mb-2">
                <span className="text-[11px] font-mono uppercase text-amber-400 font-bold">
                  {selectedItem.type.toUpperCase()} TELEMETRY
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                  {selectedItem.id}
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                {Object.entries(selectedItem.details).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                    <span className="font-semibold text-white">
                      {typeof v === 'boolean' ? (v ? '✓' : '✕') : String(v)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 mt-2 border-t border-[#1A2234] text-[10px] font-mono text-amber-400/90 flex items-center gap-1">
              <Info className="w-3 h-3" />
              <span>EDUCATIONAL ABSTRACTION GROUNDED IN PUBLISHED EQUATIONS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Honesty Disclosure: What this does show vs What it does not show */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        <div className="p-4 rounded-xl bg-[#0F1420] border border-blue-900/40">
          <div className="font-bold text-blue-300 uppercase mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            WHAT IT DOES SHOW
          </div>
          <ul className="space-y-1.5 text-slate-300 font-sans">
            <li>• Conceptual memory location: plastic synaptic state vs. matrix coordinates</li>
            <li>• Local activity and dynamic synaptic reweighting during reasoning</li>
            <li>• 4-phase reasoning cycle (read, reweight, neuron update, propagation)</li>
            <li>• Recurrent multi-hop inference without quadratic context expansion</li>
          </ul>
        </div>

        <div className="p-4 rounded-xl bg-[#140F1D] border border-rose-900/40">
          <div className="font-bold text-rose-300 uppercase mb-2 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-rose-400" />
            WHAT THIS DOES NOT SHOW
          </div>
          <ul className="space-y-1.5 text-slate-300 font-sans">
            <li>• Official production BDH inference pipeline or full distributed graph</li>
            <li>• Official benchmark performance or task-specific metrics</li>
            <li>• Learned weights from a published production checkpoint</li>
            <li>• Arbitrary claim of universal equivalence across all neural memory models</li>
          </ul>
        </div>
      </div>

      {/* Direct Research Citations with URLs */}
      <div className="p-4 rounded-xl bg-[#080B12] border border-[#1C2538] text-xs font-mono flex flex-wrap items-center justify-between gap-3">
        <span className="text-slate-400">Primary Literature & Codebases:</span>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={sources.bdhPaper.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 underline"
          >
            <span>{sources.bdhPaper.title} (2025)</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <span className="text-slate-600">·</span>
          <a
            href={sources.equations.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-purple-400 hover:text-purple-300 underline"
          >
            <span>The Equations of Reasoning (2026)</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <span className="text-slate-600">·</span>
          <a
            href={sources.github.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 underline"
          >
            <span>Official BDH GitHub (MIT)</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

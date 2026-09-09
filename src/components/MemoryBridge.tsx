import React, { useState } from 'react';
import { sources } from '../data/researchSources';
import {
  Brain,
  Cpu,
  ExternalLink,
  CheckCircle2,
  Activity,
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

  return (
    <div id={id} className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-6 sm:p-8 text-[#151515] shadow-xs space-y-8">
      {/* Title & Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6DF] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono uppercase tracking-wider text-[#6842C2] bg-[#F3EFFF] border border-[#E2D8FA] px-2.5 py-0.5 rounded font-bold">
              CONCEPTUAL ARCHITECTURE BRIDGE
            </span>
            <span className="text-xs font-mono text-[#167C80] bg-[#EDF7F7] border border-[#CFE8E8] px-2.5 py-0.5 rounded font-bold">
              EDUCATIONAL BDH ABSTRACTION
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#151515] tracking-tight">
            Where does memory live?
          </h3>
          <p className="text-xs sm:text-sm text-[#52504A] mt-1 max-w-2xl font-sans">
            Comparing the recurrent state matrix of our associative toy model with the plastic synaptic substrate of the published Dragon Hatchling (BDH) architecture.
          </p>
        </div>
      </div>

      {/* Side-by-Side Architectural Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT: Our Educational Memory Model */}
        <div className="rounded-2xl border border-[#CFE8E8] bg-[#FAFDFD] p-6 flex flex-col justify-between shadow-xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#E0F0F0] pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#167C80]" />
                <h4 className="text-sm font-serif font-bold text-[#167C80]">
                  Our educational memory model
                </h4>
              </div>
              <span className="text-[10px] font-mono text-[#167C80] bg-[#EDF7F7] px-2 py-0.5 rounded border border-[#CFE8E8] font-bold">
                FAST-WEIGHT MATRIX
              </span>
            </div>

            {/* Pipeline Flow */}
            <div className="space-y-2 font-mono text-xs">
              <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#E5E0D8] flex items-center gap-2.5 text-[#151515]">
                <span className="w-5 h-5 rounded bg-[#EDF7F7] text-[#167C80] flex items-center justify-center font-bold text-[10px]">1</span>
                <span><strong>Input:</strong> Sequential key-value pairs (France → Paris)</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#E5E0D8] flex items-center gap-2.5 text-[#151515]">
                <span className="w-5 h-5 rounded bg-[#EDF7F7] text-[#167C80] flex items-center justify-center font-bold text-[10px]">2</span>
                <span><strong>State:</strong> Fixed D×D numerical matrix representation M[t]</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#E5E0D8] flex items-center gap-2.5 text-[#151515]">
                <span className="w-5 h-5 rounded bg-[#EDF7F7] text-[#167C80] flex items-center justify-center font-bold text-[10px]">3</span>
                <span><strong>Memory Update:</strong> M[t] = λ·M[t-1] + η·(k ⊗ v)</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#E5E0D8] flex items-center gap-2.5 text-[#151515]">
                <span className="w-5 h-5 rounded bg-[#EDF7F7] text-[#167C80] flex items-center justify-center font-bold text-[10px]">4</span>
                <span><strong>Query:</strong> Input probe vector q</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#E5E0D8] flex items-center gap-2.5 text-[#151515]">
                <span className="w-5 h-5 rounded bg-[#EDF7F7] text-[#167C80] flex items-center justify-center font-bold text-[10px]">5</span>
                <span><strong>Retrieval:</strong> Matrix projection v̂ = qᵀ · M[t]</span>
              </div>
            </div>

            {/* Interactive Question: Left */}
            <div className="pt-4 border-t border-[#E0F0F0]">
              <div className="text-xs font-mono text-[#151515] font-semibold mb-2">
                Where does memory live in this toy?
              </div>
              <div className="flex flex-wrap gap-2">
                {['STATE / MEMORY MATRIX', 'ATTENTION CACHE', 'PROMPT TOKENS'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedToyLocation(opt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition border cursor-pointer ${
                      selectedToyLocation === opt
                        ? opt === 'STATE / MEMORY MATRIX'
                          ? 'bg-[#EDF8F2] border-[#CDEEDB] text-[#247A4B] font-bold'
                          : 'bg-[#FFF0F0] border-[#FBD5D5] text-[#C53030]'
                        : 'bg-[#FFFFFF] border-[#E5E0D8] text-[#52504A] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {selectedToyLocation && (
                <div className="mt-3 text-xs font-sans leading-relaxed p-3 rounded-xl bg-[#FFFFFF] border border-[#E5E0D8]">
                  {selectedToyLocation === 'STATE / MEMORY MATRIX' ? (
                    <span className="text-[#247A4B] font-semibold">
                      ✓ Exactly right! Memory is stored entirely inside the evolving coordinates of the fixed-size matrix M.
                    </span>
                  ) : (
                    <span className="text-[#C53030] font-semibold">
                      ✕ Not here. Our toy does not maintain a KV-cache or raw tokens; all history is compressed into the fixed state.
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Published BDH Concept */}
        <div className="rounded-2xl border border-[#E2D8FA] bg-[#FAF8FD] p-6 flex flex-col justify-between shadow-xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE2FB] pb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#6842C2]" />
                <h4 className="text-sm font-serif font-bold text-[#6842C2]">
                  Published BDH concept
                </h4>
              </div>
              <span className="text-[10px] font-mono text-[#6842C2] bg-[#F3EFFF] px-2 py-0.5 rounded border border-[#E2D8FA] font-bold">
                SYNAPTIC SUBSTRATE
              </span>
            </div>

            {/* Pipeline Flow */}
            <div className="space-y-2 font-mono text-xs">
              <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#E5E0D8] flex items-center gap-2.5 text-[#151515]">
                <span className="w-5 h-5 rounded bg-[#F3EFFF] text-[#6842C2] flex items-center justify-center font-bold text-[10px]">1</span>
                <span><strong>Input:</strong> Token representations projected onto graph nodes</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#E5E0D8] flex items-center gap-2.5 text-[#151515]">
                <span className="w-5 h-5 rounded bg-[#F3EFFF] text-[#6842C2] flex items-center justify-center font-bold text-[10px]">2</span>
                <span><strong>Neuron Activity:</strong> Sparse activation spikes across scale-free graph</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#E5E0D8] flex items-center gap-2.5 text-[#151515]">
                <span className="w-5 h-5 rounded bg-[#F3EFFF] text-[#6842C2] flex items-center justify-center font-bold text-[10px]">3</span>
                <span><strong>Synaptic State:</strong> Plastic weights σ(i, j) updated via local Hebbian flow</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#E5E0D8] flex items-center gap-2.5 text-[#151515]">
                <span className="w-5 h-5 rounded bg-[#F3EFFF] text-[#6842C2] flex items-center justify-center font-bold text-[10px]">4</span>
                <span><strong>Local Interaction:</strong> Communication through edge neighborhood</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#E5E0D8] flex items-center gap-2.5 text-[#151515]">
                <span className="w-5 h-5 rounded bg-[#F3EFFF] text-[#6842C2] flex items-center justify-center font-bold text-[10px]">5</span>
                <span><strong>Next Reasoning Round:</strong> 4-phase relaxation without full sequence re-eval</span>
              </div>
            </div>

            {/* Interactive Question: Right */}
            <div className="pt-4 border-t border-[#EAE2FB]">
              <div className="text-xs font-mono text-[#151515] font-semibold mb-2">
                Where does contextual memory live in BDH?
              </div>
              <div className="flex flex-wrap gap-2">
                {['SYNAPTIC STATE', 'KV CACHE', 'GPU RAM CONCATENATION'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedBdhLocation(opt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition border cursor-pointer ${
                      selectedBdhLocation === opt
                        ? opt === 'SYNAPTIC STATE'
                          ? 'bg-[#EDF8F2] border-[#CDEEDB] text-[#247A4B] font-bold'
                          : 'bg-[#FFF0F0] border-[#FBD5D5] text-[#C53030]'
                        : 'bg-[#FFFFFF] border-[#E5E0D8] text-[#52504A] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {selectedBdhLocation && (
                <div className="mt-3 text-xs font-sans leading-relaxed p-3 rounded-xl bg-[#FFFFFF] border border-[#E5E0D8]">
                  {selectedBdhLocation === 'SYNAPTIC STATE' ? (
                    <span className="text-[#247A4B] font-semibold">
                      ✓ Correct! In BDH, working memory lives directly on the plastic connection states σ(i, j) connecting graph neurons.
                    </span>
                  ) : (
                    <span className="text-[#C53030] font-semibold">
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
      <div className="rounded-2xl border border-[#E5E0D8] bg-[#FAF8F5] p-6 space-y-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EAE6DF] pb-4">
          <div>
            <h4 className="text-sm font-serif font-bold text-[#151515] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#167C80]" />
              <span>Interactive reasoning rounds & element inspector</span>
            </h4>
            <p className="text-xs text-[#716F68] mt-0.5">
              Click any neuron, synapse, or reasoning round to inspect its state telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#716F68]">NUMBER OF REASONING ROUNDS:</span>
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
                  className={`w-8 h-8 rounded-xl text-xs font-mono font-bold transition border cursor-pointer ${
                    reasoningRounds === r
                      ? 'bg-[#6842C2] text-white border-[#6842C2] shadow-xs'
                      : 'bg-[#FFFFFF] border-[#E5E0D8] text-[#716F68] hover:text-[#151515]'
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
            <div className="text-xs font-mono text-[#716F68] uppercase font-semibold">Click Neuron:</div>
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
                  className={`p-3 rounded-xl border text-left font-mono text-xs transition cursor-pointer ${
                    selectedItem.id === n.id
                      ? 'border-[#167C80] bg-[#EDF7F7] text-[#167C80] font-bold'
                      : 'border-[#E5E0D8] bg-[#FFFFFF] text-[#52504A] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="font-bold text-[#151515]">{n.id}</div>
                  <div className="text-[11px] text-[#716F68]">Act: {n.activation}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Pickable Synapses */}
          <div className="space-y-2">
            <div className="text-xs font-mono text-[#716F68] uppercase font-semibold">Click Synapse:</div>
            <div className="space-y-2">
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
                    className={`w-full p-2.5 rounded-xl border text-left font-mono text-xs transition flex items-center justify-between cursor-pointer ${
                      selectedItem.id === sId
                        ? 'border-[#6842C2] bg-[#F3EFFF] text-[#6842C2] font-bold'
                        : 'border-[#E5E0D8] bg-[#FFFFFF] text-[#52504A] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <span className="font-semibold text-[#151515]">{sId}</span>
                    <span className="text-[#6842C2] text-[11px]">σ = {s.state}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Telemetry Readout Card */}
          <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E5E0D8] flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-2 mb-3">
                <span className="text-[11px] font-mono uppercase text-[#A46622] font-bold">
                  {selectedItem.type.toUpperCase()} TELEMETRY
                </span>
                <span className="text-[10px] font-mono text-[#716F68] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E5E0D8]">
                  {selectedItem.id}
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                {Object.entries(selectedItem.details).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between text-[#52504A]">
                    <span className="text-[#716F68] capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                    <span className="font-semibold text-[#151515]">
                      {typeof v === 'boolean' ? (v ? '✓' : '✕') : String(v)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-[#EAE6DF] text-[10px] font-mono text-[#A46622] flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>EDUCATIONAL ABSTRACTION GROUNDED IN PUBLISHED EQUATIONS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Honesty Disclosure: What this does show vs What it does not show */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        <div className="p-5 rounded-2xl bg-[#EDF8F2] border border-[#CDEEDB]">
          <div className="font-bold text-[#247A4B] uppercase mb-2.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#247A4B]" />
            <span>WHAT IT DOES SHOW</span>
          </div>
          <ul className="space-y-1.5 text-[#2A2926] font-sans">
            <li>• Conceptual memory location: plastic synaptic state vs. matrix coordinates</li>
            <li>• Local activity and dynamic synaptic reweighting during reasoning</li>
            <li>• 4-phase reasoning cycle (read, reweight, neuron update, propagation)</li>
            <li>• Recurrent multi-hop inference without quadratic context expansion</li>
          </ul>
        </div>

        <div className="p-5 rounded-2xl bg-[#FFF8EE] border border-[#F5E2C4]">
          <div className="font-bold text-[#A46622] uppercase mb-2.5 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-[#A46622]" />
            <span>WHAT THIS DOES NOT SHOW</span>
          </div>
          <ul className="space-y-1.5 text-[#2A2926] font-sans">
            <li>• Official production BDH inference pipeline or full distributed graph</li>
            <li>• Official benchmark performance or task-specific metrics</li>
            <li>• Learned weights from a published production checkpoint</li>
            <li>• Arbitrary claim of universal equivalence across all neural memory models</li>
          </ul>
        </div>
      </div>

      {/* Direct Research Citations with URLs */}
      <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] text-xs font-mono flex flex-wrap items-center justify-between gap-3">
        <span className="text-[#716F68]">Primary Literature & Codebases:</span>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={sources.bdhPaper.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[#167C80] hover:underline font-semibold"
          >
            <span>{sources.bdhPaper.title} (2025)</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <span className="text-[#D8D4CB]">·</span>
          <a
            href={sources.equations.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[#6842C2] hover:underline font-semibold"
          >
            <span>The Equations of Reasoning (2026)</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <span className="text-[#D8D4CB]">·</span>
          <a
            href={sources.github.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[#247A4B] hover:underline font-semibold"
          >
            <span>Official BDH GitHub (MIT)</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

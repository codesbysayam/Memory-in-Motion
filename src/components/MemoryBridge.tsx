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
    <div id={id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 text-[var(--text-primary)] shadow-xs space-y-8">
      {/* Title & Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs font-mono tracking-wider text-[var(--accent-blue-text)] bg-[var(--accent-blue)] border border-[var(--border)] px-2.5 py-0.5 rounded font-bold">
              Conceptual architecture bridge
            </span>
            <span className="text-xs font-mono text-[var(--accent-green-text)] bg-[var(--accent-green)] border border-[var(--color-success-border)] px-2.5 py-0.5 rounded font-bold">
              Educational BDH abstraction
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-sans font-semibold text-[var(--text-primary)] tracking-tight">
            Where does memory live?
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl font-sans">
            Comparing the recurrent state matrix of our associative toy model with the plastic synaptic substrate of the published Dragon Hatchling (BDH) architecture.
          </p>
        </div>
      </div>

      {/* Side-by-Side Architectural Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT: Our Educational Memory Model */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-6 flex flex-col justify-between shadow-xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[var(--accent-blue-text)]" />
                <h4 className="text-sm font-sans font-semibold text-[var(--accent-blue-text)]">
                  Our educational memory model
                </h4>
              </div>
              <span className="text-xs font-mono text-[var(--accent-blue-text)] bg-[var(--accent-blue)] px-2 py-0.5 rounded border border-[var(--border)] font-bold">
                Fast-weight matrix
              </span>
            </div>

            {/* Pipeline Flow */}
            <div className="space-y-2 font-mono text-xs">
              <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center gap-2.5 text-[var(--text-primary)]">
                <span className="w-5 h-5 rounded bg-[var(--accent-blue)] text-[var(--accent-blue-text)] flex items-center justify-center font-bold text-xs shrink-0">1</span>
                <span><strong>Input:</strong> Sequential key-value pairs (France → Paris)</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center gap-2.5 text-[var(--text-primary)]">
                <span className="w-5 h-5 rounded bg-[var(--accent-blue)] text-[var(--accent-blue-text)] flex items-center justify-center font-bold text-xs shrink-0">2</span>
                <span><strong>State:</strong> Fixed D×D numerical matrix representation M[t]</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center gap-2.5 text-[var(--text-primary)]">
                <span className="w-5 h-5 rounded bg-[var(--accent-blue)] text-[var(--accent-blue-text)] flex items-center justify-center font-bold text-xs shrink-0">3</span>
                <span><strong>Memory Update:</strong> M[t] = λ·M[t-1] + η·(k ⊗ v)</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center gap-2.5 text-[var(--text-primary)]">
                <span className="w-5 h-5 rounded bg-[var(--accent-blue)] text-[var(--accent-blue-text)] flex items-center justify-center font-bold text-xs shrink-0">4</span>
                <span><strong>Query:</strong> Input probe vector q</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center gap-2.5 text-[var(--text-primary)]">
                <span className="w-5 h-5 rounded bg-[var(--accent-blue)] text-[var(--accent-blue-text)] flex items-center justify-center font-bold text-xs shrink-0">5</span>
                <span><strong>Retrieval:</strong> Matrix projection v̂ = qᵀ · M[t]</span>
              </div>
            </div>

            {/* Interactive Question: Left */}
            <div className="pt-4 border-t border-[var(--border)]">
              <div className="text-xs font-mono text-[var(--text-primary)] font-semibold mb-2">
                Where does memory live in this toy?
              </div>
              <div className="flex flex-wrap gap-2">
                {['State / Memory Matrix', 'Attention Cache', 'Prompt Tokens'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedToyLocation(opt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition border cursor-pointer ${
                      selectedToyLocation === opt
                        ? opt === 'State / Memory Matrix'
                          ? 'bg-[var(--accent-green)] border-[var(--color-success-border)] text-[var(--accent-green-text)] font-bold'
                          : 'bg-[var(--accent-pink)] border-[var(--color-danger-border)] text-[var(--accent-pink-text)]'
                        : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--color-surface-muted)]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {selectedToyLocation && (
                <div className="mt-3 text-xs font-sans leading-relaxed p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                  {selectedToyLocation === 'State / Memory Matrix' ? (
                    <span className="text-[var(--accent-green-text)] font-semibold">
                      ✓ Exactly right! Memory is stored entirely inside the evolving coordinates of the fixed-size matrix M.
                    </span>
                  ) : (
                    <span className="text-[var(--accent-pink-text)] font-semibold">
                      ✕ Not here. Our toy does not maintain a KV-cache or raw tokens; all history is compressed into the fixed state.
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Published BDH Concept */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-6 flex flex-col justify-between shadow-xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-[var(--accent-blue-text)]" />
                <h4 className="text-sm font-sans font-semibold text-[var(--accent-blue-text)]">
                  Published BDH concept
                </h4>
              </div>
              <span className="text-xs font-mono text-[var(--accent-blue-text)] bg-[var(--accent-blue)] px-2 py-0.5 rounded border border-[var(--border)] font-bold">
                Synaptic substrate
              </span>
            </div>

            {/* Pipeline Flow */}
            <div className="space-y-2 font-mono text-xs">
              <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center gap-2.5 text-[var(--text-primary)]">
                <span className="w-5 h-5 rounded bg-[var(--accent-blue)] text-[var(--accent-blue-text)] flex items-center justify-center font-bold text-xs shrink-0">1</span>
                <span><strong>Input:</strong> Token representations projected onto graph nodes</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center gap-2.5 text-[var(--text-primary)]">
                <span className="w-5 h-5 rounded bg-[var(--accent-blue)] text-[var(--accent-blue-text)] flex items-center justify-center font-bold text-xs shrink-0">2</span>
                <span><strong>Neuron Activity:</strong> Sparse activation spikes across scale-free graph</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center gap-2.5 text-[var(--text-primary)]">
                <span className="w-5 h-5 rounded bg-[var(--accent-blue)] text-[var(--accent-blue-text)] flex items-center justify-center font-bold text-xs shrink-0">3</span>
                <span><strong>Synaptic State:</strong> Plastic weights σ(i, j) updated via local Hebbian flow</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center gap-2.5 text-[var(--text-primary)]">
                <span className="w-5 h-5 rounded bg-[var(--accent-blue)] text-[var(--accent-blue-text)] flex items-center justify-center font-bold text-xs shrink-0">4</span>
                <span><strong>Local Interaction:</strong> Communication through edge neighborhood</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center gap-2.5 text-[var(--text-primary)]">
                <span className="w-5 h-5 rounded bg-[var(--accent-blue)] text-[var(--accent-blue-text)] flex items-center justify-center font-bold text-xs shrink-0">5</span>
                <span><strong>Next Reasoning Round:</strong> 4-phase relaxation without full sequence re-eval</span>
              </div>
            </div>

            {/* Interactive Question: Right */}
            <div className="pt-4 border-t border-[var(--border)]">
              <div className="text-xs font-mono text-[var(--text-primary)] font-semibold mb-2">
                Where does contextual memory live in BDH?
              </div>
              <div className="flex flex-wrap gap-2">
                {['Synaptic State', 'KV Cache', 'GPU RAM Concatenation'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedBdhLocation(opt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition border cursor-pointer ${
                      selectedBdhLocation === opt
                        ? opt === 'Synaptic State'
                          ? 'bg-[var(--accent-green)] border-[var(--color-success-border)] text-[var(--accent-green-text)] font-bold'
                          : 'bg-[var(--accent-pink)] border-[var(--color-danger-border)] text-[var(--accent-pink-text)]'
                        : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--color-surface-muted)]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {selectedBdhLocation && (
                <div className="mt-3 text-xs font-sans leading-relaxed p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                  {selectedBdhLocation === 'Synaptic State' ? (
                    <span className="text-[var(--accent-green-text)] font-semibold">
                      ✓ Correct! In BDH, working memory lives directly on the plastic connection states σ(i, j) connecting graph neurons.
                    </span>
                  ) : (
                    <span className="text-[var(--accent-pink-text)] font-semibold">
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
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-6 space-y-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
          <div>
            <h4 className="text-sm font-sans font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[var(--accent-blue-text)]" />
              <span>Interactive reasoning rounds &amp; element inspector</span>
            </h4>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Click any neuron, synapse, or reasoning round to inspect its state telemetry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-mono text-[var(--text-muted)]">Reasoning rounds:</span>
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
                      ? 'bg-[var(--color-accent)] text-[var(--surface)] border-[var(--color-accent)] shadow-xs'
                      : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
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
            <div className="text-xs font-mono text-[var(--text-muted)] font-semibold">Click neuron:</div>
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
                      ? 'border-[var(--color-accent)] bg-[var(--accent-blue)] text-[var(--accent-blue-text)] font-bold'
                      : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--color-surface-muted)]'
                  }`}
                >
                  <div className="font-bold text-[var(--text-primary)]">{n.id}</div>
                  <div className="text-xs text-[var(--text-muted)]">Act: {n.activation}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Pickable Synapses */}
          <div className="space-y-2">
            <div className="text-xs font-mono text-[var(--text-muted)] font-semibold">Click synapse:</div>
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
                        ? 'border-[var(--color-accent)] bg-[var(--accent-blue)] text-[var(--accent-blue-text)] font-bold'
                        : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--color-surface-muted)]'
                    }`}
                  >
                    <span className="font-semibold text-[var(--text-primary)]">{sId}</span>
                    <span className="text-[var(--accent-blue-text)] text-xs">σ = {s.state}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Telemetry Readout Card */}
          <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 mb-3">
                <span className="text-xs font-mono capitalize text-[var(--accent-yellow-text)] font-bold">
                  {selectedItem.type} telemetry
                </span>
                <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--surface-soft)] px-2 py-0.5 rounded border border-[var(--border)]">
                  {selectedItem.id}
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                {Object.entries(selectedItem.details).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between text-[var(--text-secondary)]">
                    <span className="text-[var(--text-muted)] capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                    <span className="font-semibold text-[var(--text-primary)] tabular-nums">
                      {typeof v === 'boolean' ? (v ? '✓' : '✕') : String(v)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-[var(--border)] text-xs font-mono text-[var(--accent-yellow-text)] flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>Educational abstraction grounded in published equations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Honesty Disclosure: What this does show vs What it does not show */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        <div className="p-5 rounded-2xl bg-[var(--accent-green)] border border-[var(--color-success-border)]">
          <div className="font-bold text-[var(--accent-green-text)] mb-2.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[var(--accent-green-text)]" />
            <span>What it does show</span>
          </div>
          <ul className="space-y-1.5 text-[var(--text-primary)] font-sans">
            <li>• Conceptual memory location: plastic synaptic state vs. matrix coordinates</li>
            <li>• Local activity and dynamic synaptic reweighting during reasoning</li>
            <li>• 4-phase reasoning cycle (read, reweight, neuron update, propagation)</li>
            <li>• Recurrent multi-hop inference without quadratic context expansion</li>
          </ul>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--accent-yellow)] border border-[var(--color-warning-border)]">
          <div className="font-bold text-[var(--accent-yellow-text)] mb-2.5 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-[var(--accent-yellow-text)]" />
            <span>What this does not show</span>
          </div>
          <ul className="space-y-1.5 text-[var(--text-primary)] font-sans">
            <li>• Official production BDH inference pipeline or full distributed graph</li>
            <li>• Official benchmark performance or task-specific metrics</li>
            <li>• Learned weights from a published production checkpoint</li>
            <li>• Arbitrary claim of universal equivalence across all neural memory models</li>
          </ul>
        </div>
      </div>

      {/* Direct Research Citations with URLs */}
      <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] text-xs font-mono flex flex-wrap items-center justify-between gap-3">
        <span className="text-[var(--text-muted)]">Primary Literature &amp; Codebases:</span>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={sources.bdhPaper.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[var(--accent-blue-text)] hover:underline font-semibold"
          >
            <span>{sources.bdhPaper.title} (2025)</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <span className="text-[var(--color-border-strong)]">·</span>
          <a
            href={sources.equations.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[var(--accent-blue-text)] hover:underline font-semibold"
          >
            <span>The Equations of Reasoning (2026)</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <span className="text-[var(--color-border-strong)]">·</span>
          <a
            href={sources.github.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[var(--accent-green-text)] hover:underline font-semibold"
          >
            <span>Official BDH GitHub (MIT)</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

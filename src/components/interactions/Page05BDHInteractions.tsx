import React, { useState } from 'react';
import { InlineMath } from '../ui/MathView';

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
    source: `Neuron #${selectedSynapse.i} (Feature projection)`,
    target: `Neuron #${selectedSynapse.j} (Latent hub)`,
    prevWeight: 0.428,
    hebbianUpdate: 0.185,
    nextWeight: 0.591,
  };

  const ARCH_DETAILS = {
    rnn: {
      name: 'Standard Recurrent Neural Network (Elman RNN)',
      memoryRep: 'Dense vector activation h_t in R^d',
      stateBehavior: 'Single matrix transformation + tanh nonlinearity: h_{t+1} = tanh(W h_t + U x_t)',
      seqDep: 'Strong recency bias and gradient vanishing across long spans',
      scaling: 'Constant memory O(1), linear compute O(T)',
      evidenceType: 'Historical baseline (Rumelhart et al., 1986)',
    },
    lstm: {
      name: 'Long Short-Term Memory (LSTM / GRU)',
      memoryRep: 'Dual vector state: hidden h_t and gated cell memory c_t',
      stateBehavior: 'Multiplicative input, forget, and output gates modulate additive carry',
      seqDep: 'Improved retention over plain RNNs, still constrained by fixed vector width',
      scaling: 'Constant memory O(1), linear compute O(T)',
      evidenceType: 'Established sequential baseline (Hochreiter & Schmidhuber, 1997)',
    },
    transformer: {
      name: 'Standard Transformer Self-Attention',
      memoryRep: 'Growing token Key-Value cache tensors (K, V)',
      stateBehavior: 'Zero lossy compression: every token attends directly to prior cached keys/values',
      seqDep: 'Unbounded verbatim context up to the memory/context cap',
      scaling: 'Linear cache RAM growth O(T), quadratic full attention compute O(T^2)',
      evidenceType: 'Standard modern baseline (Vaswani et al., 2017)',
    },
    bdh: {
      name: 'Biological Dragon Hatchling (BDH)',
      memoryRep: 'Sparse particle graph with plastic synaptic edge weights σ_ij',
      stateBehavior: 'Local Hebbian updates paired with internal relaxation sweeps per step',
      seqDep: 'Associative consolidation without storing an expanding raw token log',
      scaling: 'Sparse sub-linear activation load on scale-free graph hubs',
      evidenceType: 'Published frontier architecture (Pathway, arXiv:2509.26507)',
    },
  };

  const currentArch = ARCH_DETAILS[selectedArch];

  return (
    <div className="space-y-8 mt-8 text-[var(--text-primary)]">
      {/* Perspective Underline Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--mm-rule)] pb-2">
        <div className="flex items-center gap-1">
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--mm-muted)] pr-3">Perspective:</span>
          <button
            type="button"
            onClick={() => setMode('toy')}
            className={`px-3 pb-1.5 text-xs font-medium transition-colors cursor-pointer border-b-2 -mb-[9px] ${
              mode === 'toy'
                ? 'border-[var(--mm-signal)] text-[var(--mm-ink)] font-semibold'
                : 'border-transparent text-[var(--mm-muted)] hover:text-[var(--mm-ink)]'
            }`}
          >
            Educational Toy Model
          </button>
          <button
            type="button"
            onClick={() => setMode('research')}
            className={`px-3 pb-1.5 text-xs font-medium transition-colors cursor-pointer border-b-2 -mb-[9px] ${
              mode === 'research'
                ? 'border-[var(--mm-signal)] text-[var(--mm-ink)] font-semibold'
                : 'border-transparent text-[var(--mm-muted)] hover:text-[var(--mm-ink)]'
            }`}
          >
            Published Research Context
          </button>
        </div>

        <span className="text-xs text-[var(--mm-muted)]">
          {mode === 'toy'
            ? 'Simplified math abstraction running locally—not the production BDH binary.'
            : 'Grounded in Pathway architectural specification (arXiv:2509.26507).'}
        </span>
      </div>

      {/* 1. INTERACTIVE ARCHITECTURE ELEMENTS */}
      <div className="essay-figure-stage p-5 sm:p-6 space-y-5">
        <div className="border-b border-[var(--mm-rule)] pb-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--mm-signal)] font-semibold block mb-1">
            05.1 · Structural graph elements
          </span>
          <h3 className="font-serif text-lg sm:text-xl font-normal text-[var(--mm-ink)]">
            Inspect how memory flows through the BDH graph
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-[var(--mm-rule)] border border-[var(--mm-rule)] bg-[var(--mm-paper-bright)] rounded-md overflow-hidden">
          {[
            { id: 'input', label: '1. Input Stream', desc: 'Sparse spatial activation pulses.' },
            { id: 'neuron', label: '2. Neuron State', desc: 'Non-negative firing potential.' },
            { id: 'synapse', label: '3. Plastic Synapse', desc: 'Co-activation weight σ_ij.' },
            { id: 'memory', label: '4. Synaptic Memory', desc: 'Distributed edge associations.' },
            { id: 'update', label: '5. Recurrent Loop', desc: 'Multi-hop latent relaxation.' },
          ].map((node) => (
            <button
              key={node.id}
              type="button"
              onClick={() => setSelectedNode(node.id as any)}
              className={`p-3 text-left transition cursor-pointer space-y-1 ${
                selectedNode === node.id
                  ? 'bg-[var(--mm-signal-soft)] text-[var(--mm-ink)]'
                  : 'text-[var(--mm-muted)] hover:bg-[var(--mm-paper-inset)]'
              }`}
            >
              <div className={`text-xs font-semibold ${selectedNode === node.id ? 'text-[var(--mm-signal)]' : 'text-[var(--mm-ink)]'}`}>
                {node.label}
              </div>
              <p className="text-[11px] leading-relaxed text-[var(--mm-muted)]">
                {node.desc}
              </p>
            </button>
          ))}
        </div>

        <div className="pt-2 text-xs space-y-1">
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--mm-signal)] font-semibold block">
            Selected element: {selectedNode}
          </span>
          <p className="text-xs sm:text-sm text-[var(--mm-ink-soft)] leading-relaxed">
            {selectedNode === 'input' &&
              'In BDH, incoming tokens activate sparse entry neurons in the scale-free graph instead of appending into an expanding key-value list.'}
            {selectedNode === 'neuron' &&
              'Each neuron particle maintains a non-negative firing level (y ≥ 0) and exchanges signals exclusively with its local neighborhood.'}
            {selectedNode === 'synapse' &&
              'Synapses follow local Hebbian plasticity: whenever pre-synaptic neuron i and post-synaptic neuron j co-fire, edge weight σ_ij strengthens.'}
            {selectedNode === 'memory' &&
              'Memory is distributed across millions of sparse plastic synapses rather than jammed inside one fixed dense vector.'}
            {selectedNode === 'update' &&
              'Recurrent law: σ_ij(t+1) = λ σ_ij(t) + η x_i(t) y_j(t), letting associations reinforce and decay selectively across local circuits.'}
          </p>
        </div>
      </div>

      {/* 2. ARCHITECTURE COMPARISON */}
      <div className="essay-figure-stage p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[var(--mm-rule)] pb-3">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--mm-amber)] font-semibold block mb-1">
              05.2 · Paradigm comparison
            </span>
            <h3 className="font-serif text-lg sm:text-xl font-normal text-[var(--mm-ink)]">
              Contrast how four architectures represent sequence state
            </h3>
          </div>
          <span className="text-xs text-[var(--mm-muted)]">
            Conceptual reference (not a benchmark ranking)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1 border-b border-[var(--mm-rule)]">
          {(['rnn', 'lstm', 'transformer', 'bdh'] as const).map((archKey) => (
            <button
              key={archKey}
              type="button"
              onClick={() => setSelectedArch(archKey)}
              className={`px-4 pb-2 font-mono text-xs transition cursor-pointer border-b-2 -mb-[1px] ${
                selectedArch === archKey
                  ? 'border-[var(--mm-signal)] text-[var(--mm-ink)] font-semibold'
                  : 'border-transparent text-[var(--mm-muted)] hover:text-[var(--mm-ink)]'
              }`}
            >
              {archKey.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[var(--mm-rule)] border border-[var(--mm-rule)] bg-[var(--mm-paper-bright)] rounded-md text-xs">
          <div className="p-4 space-y-3">
            <div>
              <span className="text-[var(--mm-muted)] font-mono text-[11px] uppercase block">Architecture</span>
              <strong className="text-[var(--mm-ink)] text-sm block mt-0.5">{currentArch.name}</strong>
              <span className="text-[var(--mm-ink-soft)] block pt-1">
                <strong className="text-[var(--mm-ink)]">Memory state: </strong>{currentArch.memoryRep}
              </span>
            </div>
            <div className="pt-2 border-t border-[var(--mm-rule)]">
              <span className="text-[var(--mm-muted)] font-mono text-[11px] uppercase block">Update dynamics</span>
              <p className="text-[var(--mm-ink-soft)] leading-relaxed mt-0.5">{currentArch.stateBehavior}</p>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div>
              <span className="text-[var(--mm-muted)] font-mono text-[11px] uppercase block">Complexity &amp; scaling</span>
              <p className="font-mono text-[var(--mm-signal)] font-semibold mt-0.5">{currentArch.scaling}</p>
              <p className="text-[var(--mm-ink-soft)] text-xs pt-1">{currentArch.seqDep}</p>
            </div>
            <div className="pt-2 border-t border-[var(--mm-rule)]">
              <span className="text-[var(--mm-muted)] font-mono text-[11px] uppercase block">Primary reference</span>
              <p className="text-xs text-[var(--mm-ink)] mt-0.5">{currentArch.evidenceType}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SYNAPTIC UPDATE INSPECTOR */}
      <div className="essay-figure-stage p-5 sm:p-6 space-y-4">
        <div className="border-b border-[var(--mm-rule)] pb-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--mm-signal)] font-semibold block mb-1">
            05.3 · Local synapse rule
          </span>
          <h3 className="font-serif text-lg sm:text-xl font-normal text-[var(--mm-ink)]">
            Inspect Hebbian weight change across edge <InlineMath math="(i, j)" />
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--mm-rule)] border border-[var(--mm-rule)] bg-[var(--mm-paper-bright)] rounded-md text-xs tabular-nums">
          <div className="p-3.5 space-y-1.5">
            <span className="text-[var(--mm-muted)] font-semibold text-xs block">Pair selection</span>
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <select
                value={selectedSynapse.i}
                onChange={(e) => setSelectedSynapse((prev) => ({ ...prev, i: parseInt(e.target.value, 10) }))}
                aria-label="Source neuron i"
                className="p-1 rounded border border-[var(--mm-rule)] bg-[var(--mm-paper)] text-[var(--mm-ink)] cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>Pre #{n}</option>
                ))}
              </select>

              <select
                value={selectedSynapse.j}
                onChange={(e) => setSelectedSynapse((prev) => ({ ...prev, j: parseInt(e.target.value, 10) }))}
                aria-label="Target neuron j"
                className="p-1 rounded border border-[var(--mm-rule)] bg-[var(--mm-paper)] text-[var(--mm-ink)] cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>Post #{n}</option>
                ))}
              </select>
            </div>
            <span className="text-[11px] text-[var(--mm-muted)] block">{synapseData.source} → {synapseData.target}</span>
          </div>

          <div className="p-3.5 space-y-1">
            <span className="text-[var(--mm-muted)] font-semibold text-xs block">Prior <InlineMath math="\sigma_{ij}(t)" /></span>
            <div className="text-base font-mono font-semibold text-[var(--mm-ink)]">{synapseData.prevWeight.toFixed(4)}</div>
            <span className="text-[11px] text-[var(--mm-muted)]">Initial conductance</span>
          </div>

          <div className="p-3.5 space-y-1">
            <span className="text-[var(--mm-muted)] font-semibold text-xs block">Delta <InlineMath math="\eta x_i y_j" /></span>
            <div className="text-base font-mono font-semibold text-[var(--color-success)]">+{synapseData.hebbianUpdate.toFixed(4)}</div>
            <span className="text-[11px] text-[var(--mm-muted)]">Co-firing pulse</span>
          </div>

          <div className="p-3.5 space-y-1">
            <span className="text-[var(--mm-signal)] font-semibold text-xs block">Next <InlineMath math="\sigma_{ij}(t+1)" /></span>
            <div className="text-base font-mono font-semibold text-[var(--mm-ink)]">{synapseData.nextWeight.toFixed(4)}</div>
            <span className="text-[11px] text-[var(--mm-muted)]">Updated synapse (λ=0.95)</span>
          </div>
        </div>
      </div>
    </div>
  );
};


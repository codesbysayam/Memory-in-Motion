import React, { useState, useMemo } from 'react';
import { ArrowRight, Sliders } from 'lucide-react';
import { BDHToyModel } from '../models/bdhToyModel';
import { SectionHeader } from './ui/SectionHeader';
import { ControlSlider } from './ui/ControlSlider';
import { EquationCard } from './ui/EquationCard';
import { SourceBadge } from './ui/SourceBadge';
import { BDHExplorer } from './BDHExplorer';
import { SynapticHeatmap } from './synaptic/SynapticHeatmap';
import { SynapticWeightHeatmap } from './synaptic/SynapticWeightHeatmap';
import { ClaimEvidenceLimitation } from './ClaimEvidenceLimitation';

export const Section08BDHArchitecture: React.FC = () => {
  const [numNeurons, setNumNeurons] = useState<16 | 24 | 32 | 64>(24);
  const [selectedNeuronId, setSelectedNeuronId] = useState<number>(2);
  const [selectedSynapseId, setSelectedSynapseId] = useState<number | null>(null);
  const [activeFraction, setActiveFraction] = useState<number>(0.35); // Sparsity threshold
  const [recurrentSteps, setRecurrentSteps] = useState<number>(4);
  const [synapticStrength, setSynapticStrength] = useState<number>(0.5);
  const [inputPattern, setInputPattern] = useState<'Alpha' | 'Beta' | 'Gamma' | 'Orthogonal'>('Alpha');
  const [showPublishedEquation, setShowPublishedEquation] = useState<boolean>(false);

  // Run the deterministic BDH toy model
  const bdhNetwork = useMemo(() => {
    const model = new BDHToyModel({
      numNeurons,
      sparsity: activeFraction,
      recurrentSteps,
      synapticUpdateStrength: synapticStrength,
      inputPattern,
    });
    return model.runSimulation();
  }, [numNeurons, activeFraction, recurrentSteps, synapticStrength, inputPattern]);

  const selectedNeuron = bdhNetwork.neurons.find((n) => n.id === selectedNeuronId) || bdhNetwork.neurons[0];
  const selectedSynapse = selectedSynapseId !== null ? bdhNetwork.synapses.find((s) => s.id === selectedSynapseId) : null;

  const incomingSynapses = bdhNetwork.synapses.filter((s) => s.target === selectedNeuron.id);
  const outgoingSynapses = bdhNetwork.synapses.filter((s) => s.source === selectedNeuron.id);

  // Total synaptic input calculation
  const totalInputFromNeighbors = incomingSynapses.reduce((sum, syn) => {
    const sNode = bdhNetwork.neurons.find((n) => n.id === syn.source);
    const sourceAct = sNode ? sNode.activation : 0;
    return sum + (syn.weight + syn.state * synapticStrength) * sourceAct;
  }, 0);

  return (
    <section id="section-08" className="w-full scroll-mt-20 border-b border-[var(--border)] bg-[var(--page-bg)] py-16 sm:py-20 text-[var(--text-primary)]">
      <div className="space-y-10">
        <SectionHeader
          number="08"
          category="BDH Architecture & Graph Particles"
          title="Where does BDH store memory? Inside the synapses"
          subtitle="In BDH, memory is associated with synaptic connection state rather than simply being an ever-growing token history or a single dense state vector."
          discovery="Synaptic plasticity W_ij(t) allows the computational fabric itself to store associations without blowing up inference memory."
        />

        {/* 12-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Equations, Pipeline & Plasticity Slider */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center justify-between">
              <SourceBadge type="illustration" />
              <span className="text-xs font-mono text-[var(--text-muted)]">Illustrative graph model</span>
            </div>

            {/* Inference Data Flow */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3">
              <span className="font-sans text-xs font-semibold text-[var(--text-muted)] block">
                BDH inference data flow
              </span>

              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="bg-[var(--surface-soft)] text-[var(--accent-blue-text)] border border-[var(--border)] px-2.5 py-1 rounded-md font-medium">
                  Input Pattern
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span className="bg-[var(--surface-soft)] text-[var(--text-primary)] border border-[var(--border)] px-2.5 py-1 rounded-md font-medium">
                  Neuron Particles
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span className="bg-[var(--color-accent-soft)] text-[var(--color-accent-ink)] border border-[var(--color-border-strong)] px-2.5 py-1 rounded-md font-semibold">
                  Synaptic Update
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span className="bg-[var(--color-success-soft)] text-[var(--color-success)] border border-[var(--color-success-border)] px-2.5 py-1 rounded-md font-medium">
                  Output State
                </span>
              </div>
            </div>

            {/* Published BDH Formalism vs Simplified Update */}
            <div id="section-bdh-plasticity" className="space-y-2 scroll-mt-24">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans font-semibold text-[var(--text-muted)]">
                  Synaptic update formalism
                </span>
                <button
                  type="button"
                  onClick={() => setShowPublishedEquation(!showPublishedEquation)}
                  className="text-xs font-sans font-medium text-[var(--accent-blue-text)] hover:underline transition cursor-pointer"
                >
                  {showPublishedEquation ? 'Show Educational Equation' : 'Show Published Equation'}
                </button>
              </div>

              {!showPublishedEquation ? (
                <EquationCard
                  label="Simplified Synaptic Update (Educational Abstraction)"
                  formula="\sigma' = \text{decay} \cdot \sigma + \eta x y^T"
                  plainEnglish="Educational abstraction — not the complete published BDH update. When pre-synaptic activation x and post-synaptic activation y coincide, synaptic weight matrix σ updates via outer product scaled by learning rate η and decayed over time."
                  systemImpact="Notice: This simplified form is an educational approximation for computational intuition."
                />
              ) : (
                <EquationCard
                  label="Published BDH Formalism · Equations of Reasoning"
                  formula="S_{t+1} = \lambda S_t + \eta \cdot \text{norm}(k_t) \cdot \text{norm}(v_t)^T"
                  plainEnglish="Formal recurrent synaptic fast-weight evolution from Pathway Research (2025/2026). Synaptic state S preserves linear inference complexity O(1) memory bound without softmax attention matrices."
                  systemImpact="Source: Pathway Research · Dragon Hatchling Architecture Technical Report."
                />
              )}
            </div>

            {/* Hyperparameter Controls */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-5">
              <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
                <Sliders className="w-4 h-4 text-[var(--accent-blue-text)]" />
                <h4 className="font-sans text-sm font-semibold text-[var(--text-primary)]">
                  Graph Dynamics &amp; Plasticity Controls
                </h4>
              </div>

              {/* Input Pattern Selector */}
              <div className="space-y-2">
                <label className="text-xs font-sans font-medium text-[var(--text-secondary)] block">
                  1. Input Seed Pattern
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Alpha', 'Beta', 'Gamma', 'Orthogonal'] as const).map((pat) => (
                    <button
                      key={pat}
                      type="button"
                      onClick={() => setInputPattern(pat)}
                      className={`py-1.5 px-2.5 rounded-lg font-mono text-xs transition cursor-pointer border ${
                        inputPattern === pat
                          ? 'border-[var(--color-border-strong)] bg-[var(--color-accent-soft)] text-[var(--color-accent-ink)] font-semibold'
                          : 'border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {pat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of Graph Neurons */}
              <div className="space-y-2">
                <label className="text-xs font-sans font-medium text-[var(--text-secondary)] block">
                  2. Graph Size (Particle Count)
                </label>
                <div className="flex gap-2">
                  {([16, 24, 32, 64] as const).map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setNumNeurons(cnt)}
                      className={`flex-1 py-1.5 rounded-lg font-mono tabular-nums text-xs transition cursor-pointer border ${
                        numNeurons === cnt
                          ? 'border-[var(--color-border-strong)] bg-[var(--accent-blue)] text-[var(--accent-blue-text)] font-semibold'
                          : 'border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {cnt} N
                    </button>
                  ))}
                </div>
              </div>

              {/* Synaptic Strength (η) */}
              <ControlSlider
                label="Synaptic Plasticity Rate (η)"
                value={synapticStrength}
                min={0.1}
                max={1.0}
                step={0.05}
                onChange={setSynapticStrength}
                hint="Controls how much weight is added to connection state σ_ij during coincident firing."
              />

              {/* Recurrent Steps */}
              <ControlSlider
                label="Recurrent Relaxation Steps (L)"
                value={recurrentSteps}
                min={1}
                max={8}
                step={1}
                onChange={setRecurrentSteps}
                hint="Internal multi-hop relaxation cycles per inference token step."
              />

              {/* Active Fraction (Sparsity) */}
              <ControlSlider
                label="Neuron Sparsity Fraction (Top-K)"
                value={activeFraction}
                min={0.1}
                max={0.7}
                step={0.05}
                onChange={setActiveFraction}
                hint="Only top-k fraction of neurons fire positive signals; others stay zero."
              />
            </div>
          </div>

          {/* Right Column: Scale-Free Graph Visualizer & Inspector */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
                <h3 className="text-base font-sans font-semibold text-[var(--text-primary)]">
                  Scale-free particle graph &amp; synaptic flow
                </h3>
                <span className="text-xs font-mono tabular-nums text-[var(--text-muted)]">
                  Step {recurrentSteps} / {recurrentSteps} completed
                </span>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-3 gap-3 text-center font-mono text-xs tabular-nums">
                <div className="p-3 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)]">
                  <span className="text-[var(--text-muted)] block text-[11px] font-sans">Active neurons</span>
                  <span className="text-[var(--accent-blue-text)] font-bold">
                    {bdhNetwork.activeCount} / {numNeurons} ({(100 - bdhNetwork.sparsityRatio * 100).toFixed(0)}%)
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)]">
                  <span className="text-[var(--text-muted)] block text-[11px] font-sans">Inactive (sparse)</span>
                  <span className="text-[var(--text-secondary)] font-bold">
                    {numNeurons - bdhNetwork.activeCount} units
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)]">
                  <span className="text-[var(--text-muted)] block text-[11px] font-sans">Relaxation updates</span>
                  <span className="text-[var(--color-success)] font-bold">{bdhNetwork.updatedCount} events</span>
                </div>
              </div>

              {/* SVG Graph Visualizer */}
              <div className="flex items-center justify-center p-6 bg-[var(--surface-soft)] rounded-xl border border-[var(--border)] relative overflow-x-auto">
                <svg width="340" height="340" className="overflow-visible select-none">
                  {/* Synapse Lines */}
                  {bdhNetwork.synapses.map((syn) => {
                    const sNode = bdhNetwork.neurons.find((n) => n.id === syn.source);
                    const tNode = bdhNetwork.neurons.find((n) => n.id === syn.target);
                    if (!sNode || !tNode) return null;

                    const isConnected = sNode.id === selectedNeuronId || tNode.id === selectedNeuronId;
                    const isSynSelected = selectedSynapseId === syn.id;
                    const effectiveWeight = syn.weight + syn.state * synapticStrength;

                    let strokeColor = 'var(--color-border-strong)';
                    if (isSynSelected) strokeColor = 'var(--color-warning)';
                    else if (isConnected) {
                      strokeColor = sNode.id === selectedNeuronId ? 'var(--color-accent-ink)' : 'var(--color-accent)';
                    }

                    const strokeWidth = isSynSelected ? 3 : isConnected ? Math.max(1.5, effectiveWeight * 3) : 1;
                    const strokeOpacity = isSynSelected ? 1.0 : isConnected ? 0.9 : 0.45;

                    return (
                      <line
                        key={syn.id}
                        onClick={() => setSelectedSynapseId(syn.id)}
                        x1={sNode.x}
                        y1={sNode.y}
                        x2={tNode.x}
                        y2={tNode.y}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeOpacity={strokeOpacity}
                        className="cursor-pointer transition-all"
                      />
                    );
                  })}

                  {/* Neuron Nodes */}
                  {bdhNetwork.neurons.map((neuron) => {
                    const isSelected = neuron.id === selectedNeuronId;
                    const radius = isSelected ? 12 : 8;
                    const isActive = neuron.activation > 0.05;
                    const fillOpacity = Math.max(0.3, Math.min(1.0, neuron.activation));
                    const isInput = neuron.layer === 'input';
                    const isOutput = neuron.layer === 'output';

                    let fillColor = 'var(--color-accent)';
                    if (isInput) fillColor = 'var(--accent-blue-text)';
                    if (isOutput) fillColor = 'var(--color-success)';

                    return (
                      <g
                        key={neuron.id}
                        onClick={() => {
                          setSelectedNeuronId(neuron.id);
                          setSelectedSynapseId(null);
                        }}
                        className="cursor-pointer"
                      >
                        {isSelected && (
                          <circle
                            cx={neuron.x}
                            cy={neuron.y}
                            r={radius + 4}
                            fill="none"
                            stroke="var(--color-accent)"
                            strokeWidth="2"
                            strokeDasharray="3 3"
                          />
                        )}

                        <circle
                          cx={neuron.x}
                          cy={neuron.y}
                          r={radius}
                          fill={fillColor}
                          fillOpacity={isActive ? fillOpacity : 0.2}
                          stroke={isSelected ? 'var(--text-primary)' : isActive ? fillColor : 'var(--text-muted)'}
                          strokeWidth={isSelected ? 2 : 1}
                        />

                        {numNeurons <= 32 && (
                          <text
                            x={neuron.x}
                            y={neuron.y + 3}
                            textAnchor="middle"
                            fontSize="8"
                            fontWeight="bold"
                            fill={isActive ? 'var(--surface)' : 'var(--text-secondary)'}
                            className="font-mono pointer-events-none"
                          >
                            {neuron.id}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Synapse Inspector Box (if selected) */}
              {selectedSynapse && (
                <div className="rounded-lg bg-[var(--color-warning-soft)] border border-[var(--color-warning-border)] p-4 text-xs font-mono space-y-2">
                  <div className="flex items-center justify-between text-[var(--color-warning)] font-semibold">
                    <span>Inspecting synapse n_{selectedSynapse.source} → n_{selectedSynapse.target}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedSynapseId(null)}
                      className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      Close ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1 tabular-nums">
                    <div>
                      <span className="text-[var(--text-muted)] text-[10px] block font-sans">Static weight</span>
                      <span className="text-[var(--text-primary)] font-bold">{selectedSynapse.weight.toFixed(3)}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] text-[10px] block font-sans">Plastic state (s_ij)</span>
                      <span className="text-[var(--color-warning)] font-bold">{selectedSynapse.state.toFixed(4)}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] text-[10px] block font-sans">Recent delta (Δ)</span>
                      <span className="text-[var(--color-success)] font-bold">+{selectedSynapse.delta.toFixed(4)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Selected Neuron Inspector Box */}
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-xs space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                  <span className="text-[var(--text-primary)] font-semibold">
                    Neuron n_{selectedNeuron.id} telemetry &amp; local neighborhood
                  </span>
                  <span className="text-[11px] text-[var(--accent-blue-text)] bg-[var(--accent-blue)] px-2 py-0.5 rounded border border-[var(--border)] font-semibold">
                    Layer: {selectedNeuron.layer}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs tabular-nums">
                  <div className="bg-[var(--surface)] p-2.5 rounded-lg border border-[var(--border)]">
                    <span className="text-[var(--text-muted)] block text-[10px] font-sans">Activation (z_i)</span>
                    <span className="text-[var(--accent-blue-text)] font-bold">{selectedNeuron.activation.toFixed(3)}</span>
                  </div>
                  <div className="bg-[var(--surface)] p-2.5 rounded-lg border border-[var(--border)]">
                    <span className="text-[var(--text-muted)] block text-[10px] font-sans">Incoming synapses</span>
                    <span className="text-[var(--text-primary)] font-bold">{incomingSynapses.length} links</span>
                  </div>
                  <div className="bg-[var(--surface)] p-2.5 rounded-lg border border-[var(--border)]">
                    <span className="text-[var(--text-muted)] block text-[10px] font-sans">Outgoing synapses</span>
                    <span className="text-[var(--text-primary)] font-bold">{outgoingSynapses.length} links</span>
                  </div>
                  <div className="bg-[var(--surface)] p-2.5 rounded-lg border border-[var(--border)]">
                    <span className="text-[var(--text-muted)] block text-[10px] font-sans">Local input sum</span>
                    <span className="text-[var(--color-success)] font-bold">{totalInputFromNeighbors.toFixed(3)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dedicated BDH Educational Microscope */}
        <div className="mt-8">
          <BDHExplorer id="bdh-microscope-explorer" />
        </div>

        {/* Recharts Synaptic Heatmap & Step-Progress Indicator During Memory Retrieval (t0 to tN) */}
        <div className="mt-8" id="bdh-synaptic-heatmap">
          <SynapticHeatmap
            numNeurons={numNeurons}
            inputPattern={inputPattern}
            synapticStrength={synapticStrength}
            recurrentSteps={recurrentSteps}
          />
        </div>

        {/* Detailed Synaptic Tensor & Interactive Hebbian Inspection Matrix */}
        <div className="mt-8">
          <SynapticWeightHeatmap
            numNeurons={numNeurons}
            inputPattern={inputPattern}
            synapticStrength={synapticStrength}
            recurrentSteps={recurrentSteps}
          />
        </div>

        {/* Epistemic Boundary */}
        <div className="mt-8">
          <ClaimEvidenceLimitation
            claim="BDH uses evolving synaptic state during recurrent computation."
            evidence="Published BDH equations, sparse activation maps, and architectural specifications."
            limitation="The browser visualization is a pedagogical, deterministic simulator—not a pre-trained multi-billion parameter checkpoint."
          />
        </div>
      </div>
    </section>
  );
};

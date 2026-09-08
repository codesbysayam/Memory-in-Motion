import React, { useState, useMemo } from 'react';
import { Network, MousePointerClick, Info, ArrowRight, Sparkles, Sliders } from 'lucide-react';
import { BDHToyModel, BDHToyNeuron, BDHToySynapse } from '../models/bdhToyModel';
import { SectionHeader } from './ui/SectionHeader';
import { ControlSlider } from './ui/ControlSlider';
import { EquationCard } from './ui/EquationCard';
import { SourceBadge } from './ui/SourceBadge';
import { BDHExplorer } from './BDHExplorer';
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
    <section id="section-08" className="scroll-mt-20 border-b border-[#252A35] bg-[#07080B] py-14">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <SectionHeader
          number="08"
          category="BDH ARCHITECTURE & GRAPH PARTICLES"
          title="Where Does BDH Store Memory? Inside the Synapses"
          subtitle="In BDH, memory is associated with synaptic connection state rather than simply being an ever-growing token history or a single dense state vector."
          discovery="Synaptic plasticity W_ij(t) allows the computational fabric itself to store associations without blowing up inference memory."
        />

        {/* 12-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Equations, Pipeline & Plasticity Slider */}
          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-center justify-between">
              <SourceBadge type="illustration" />
              <span className="text-[10px] font-mono text-[#8F96A3]">ILLUSTRATIVE GRAPH MODEL</span>
            </div>

            {/* Inference Data Flow */}
            <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-4 space-y-2.5">
              <span className="font-mono text-xs uppercase tracking-widest text-[#8F96A3] block">
                BDH INFERENCE DATA FLOW
              </span>

              <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                <span className="bg-[#151922] text-[#22D3EE] border border-[#252A35] px-2 py-1 rounded">
                  Input Pattern
                </span>
                <ArrowRight className="w-3 h-3 text-[#8F96A3]" />
                <span className="bg-[#151922] text-white border border-[#252A35] px-2 py-1 rounded">
                  Neuron Particles
                </span>
                <ArrowRight className="w-3 h-3 text-[#8F96A3]" />
                <span className="bg-violet-950/40 text-violet-300 border border-violet-500/40 px-2 py-1 rounded font-semibold">
                  Synaptic Update
                </span>
                <ArrowRight className="w-3 h-3 text-[#8F96A3]" />
                <span className="bg-emerald-950/40 text-emerald-300 border border-emerald-500/40 px-2 py-1 rounded">
                  Output State
                </span>
              </div>
            </div>

            {/* Published BDH Formalism vs Simplified Update */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                  SYNAPTIC UPDATE FORMALISM
                </span>
                <button
                  onClick={() => setShowPublishedEquation(!showPublishedEquation)}
                  className="text-[10px] font-mono text-cyan-300 hover:text-white underline transition cursor-pointer"
                >
                  {showPublishedEquation ? 'Show Educational Equation' : 'Show Published Equation'}
                </button>
              </div>

              {!showPublishedEquation ? (
                <EquationCard
                  label="SIMPLIFIED SYNAPTIC UPDATE (EDUCATIONAL ABSTRACTION)"
                  formula="\sigma' = \text{decay} \cdot \sigma + \eta x y^T"
                  plainEnglish="Educational abstraction — not the complete published BDH update. When pre-synaptic activation x and post-synaptic activation y coincide, synaptic weight matrix σ updates via outer product scaled by learning rate η and decayed over time."
                  systemImpact="Notice: This simplified form is an educational approximation for computational intuition."
                />
              ) : (
                <EquationCard
                  label="PUBLISHED BDH FORMALISM · EQUATIONS OF REASONING"
                  formula="S_{t+1} = \lambda S_t + \eta \cdot \text{norm}(k_t) \cdot \text{norm}(v_t)^T"
                  plainEnglish="Formal recurrent synaptic fast-weight evolution from Pathway Research (2025/2026). Synaptic state S preserves linear inference complexity O(1) memory bound without softmax attention matrices."
                  systemImpact="Source: Pathway Research · Dragon Hatchling Architecture Technical Report."
                />
              )}
            </div>

            {/* Controls Panel */}
            <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#252A35] pb-2">
                <span className="text-xs font-mono uppercase tracking-widest text-[#22D3EE] font-semibold flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  GRAPH CONTROLS
                </span>
                <span className="text-[10px] font-mono text-[#8F96A3]">INTERACTIVE TOY</span>
              </div>

              {/* Neuron Count Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-white flex items-center justify-between">
                  <span>Neuron Population:</span>
                  <span className="text-[#22D3EE] font-bold">{numNeurons} units</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5 font-mono text-xs">
                  {([16, 24, 32, 64] as const).map((n) => (
                    <button
                      key={n}
                      onClick={() => {
                        setNumNeurons(n);
                        setSelectedNeuronId(0);
                      }}
                      className={`py-1 rounded-lg border transition-all ${
                        numNeurons === n
                          ? 'border-[#22D3EE] bg-cyan-950/60 text-[#22D3EE] font-bold'
                          : 'border-[#252A35] bg-[#151922] text-[#8F96A3] hover:text-white'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Pattern Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-white flex items-center justify-between">
                  <span>Input Pattern Injection:</span>
                  <span className="text-violet-400 font-bold">{inputPattern}</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5 font-mono text-[11px]">
                  {(['Alpha', 'Beta', 'Gamma', 'Orthogonal'] as const).map((pat) => (
                    <button
                      key={pat}
                      onClick={() => setInputPattern(pat)}
                      className={`py-1 px-1 rounded-lg border transition-all ${
                        inputPattern === pat
                          ? 'border-violet-500 bg-violet-950/60 text-violet-300 font-bold'
                          : 'border-[#252A35] bg-[#151922] text-[#8F96A3] hover:text-white'
                      }`}
                    >
                      {pat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider 1: Sparsity / Active fraction */}
              <ControlSlider
                label="Sparsity Threshold"
                value={Math.round(activeFraction * 100)}
                min={10}
                max={80}
                step={5}
                unit="%"
                description="Higher threshold suppresses lower activations, enforcing cortical sparsity."
                onChange={(val) => setActiveFraction(val / 100)}
              />

              {/* Slider 2: Recurrent Steps */}
              <ControlSlider
                label="Recurrent Relaxation Steps"
                value={recurrentSteps}
                min={1}
                max={8}
                step={1}
                unit="steps"
                description="Number of multi-hop interaction cycles across the graph per token."
                onChange={(val) => setRecurrentSteps(val)}
              />

              {/* Slider 3: Synaptic Strength */}
              <ControlSlider
                label="Plastic Synaptic Strength (η)"
                value={Math.round(synapticStrength * 100)}
                min={0}
                max={100}
                step={10}
                unit="%"
                description="Modulates how strongly co-activated neurons strengthen their connection state."
                onChange={(val) => setSynapticStrength(val / 100)}
              />
            </div>
          </div>

          {/* Right Column: Interactive Particle Graph SVG & Telemetry */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4 text-violet-400" />
                  <span className="font-mono text-xs uppercase tracking-wider text-white font-semibold">
                    {numNeurons}-NEURON PARTICLE GRAPH
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-[#8F96A3]">
                  <span className="flex items-center gap-1">
                    <MousePointerClick className="w-3.5 h-3.5 text-[#22D3EE]" /> Click node or edge
                  </span>
                </div>
              </div>

              {/* Sparse Activity Bar */}
              <div className="grid grid-cols-3 gap-2 p-2 rounded-lg bg-[#151922] border border-[#252A35] font-mono text-[11px] text-center">
                <div>
                  <span className="text-[#8F96A3] block text-[10px]">ACTIVE NEURONS</span>
                  <span className="text-[#22D3EE] font-bold">
                    {bdhNetwork.activeCount} / {numNeurons} ({(100 - bdhNetwork.sparsityRatio * 100).toFixed(0)}%)
                  </span>
                </div>
                <div>
                  <span className="text-[#8F96A3] block text-[10px]">INACTIVE (SPARSE)</span>
                  <span className="text-zinc-400 font-bold">
                    {numNeurons - bdhNetwork.activeCount} units
                  </span>
                </div>
                <div>
                  <span className="text-[#8F96A3] block text-[10px]">RELAXATION UPDATES</span>
                  <span className="text-emerald-400 font-bold">{bdhNetwork.updatedCount} events</span>
                </div>
              </div>

              {/* SVG Graph Visualizer */}
              <div className="flex items-center justify-center p-4 bg-[#07080B] rounded-xl border border-[#252A35] relative">
                <svg width="340" height="340" className="overflow-visible select-none">
                  {/* Synapse Lines */}
                  {bdhNetwork.synapses.map((syn) => {
                    const sNode = bdhNetwork.neurons.find((n) => n.id === syn.source);
                    const tNode = bdhNetwork.neurons.find((n) => n.id === syn.target);
                    if (!sNode || !tNode) return null;

                    const isConnected = sNode.id === selectedNeuronId || tNode.id === selectedNeuronId;
                    const isSynSelected = selectedSynapseId === syn.id;
                    const effectiveWeight = syn.weight + syn.state * synapticStrength;

                    let strokeColor = '#252A35';
                    if (isSynSelected) strokeColor = '#F59E0B'; // Amber
                    else if (isConnected) {
                      strokeColor = sNode.id === selectedNeuronId ? '#8B5CF6' : '#22D3EE';
                    }

                    const strokeWidth = isSynSelected ? 3 : isConnected ? Math.max(1.5, effectiveWeight * 3) : 1;
                    const strokeOpacity = isSynSelected ? 1.0 : isConnected ? 0.85 : 0.2;

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
                        className="cursor-pointer hover:stroke-amber-400 transition-all"
                      />
                    );
                  })}

                  {/* Neuron Nodes */}
                  {bdhNetwork.neurons.map((neuron) => {
                    const isSelected = neuron.id === selectedNeuronId;
                    const radius = isSelected ? 12 : 8;
                    const isActive = neuron.activation > 0.05;
                    const fillOpacity = Math.max(0.2, Math.min(1.0, neuron.activation));
                    const isInput = neuron.layer === 'input';
                    const isOutput = neuron.layer === 'output';

                    let fillColor = '#7c3aed';
                    if (isInput) fillColor = '#0284c7';
                    if (isOutput) fillColor = '#10b981';

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
                            stroke="#22D3EE"
                            strokeWidth="2"
                            strokeDasharray="3 3"
                          />
                        )}

                        <circle
                          cx={neuron.x}
                          cy={neuron.y}
                          r={radius}
                          fill={fillColor}
                          fillOpacity={isActive ? fillOpacity : 0.15}
                          stroke={isSelected ? '#ffffff' : isActive ? '#22D3EE' : '#3f3f46'}
                          strokeWidth={isSelected ? 2 : 1}
                        />

                        {numNeurons <= 32 && (
                          <text
                            x={neuron.x}
                            y={neuron.y + 3}
                            textAnchor="middle"
                            fontSize="8"
                            fontWeight="bold"
                            fill={isActive ? '#ffffff' : '#8F96A3'}
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
                <div className="rounded-lg bg-amber-950/20 border border-amber-500/40 p-3 text-xs font-mono space-y-1">
                  <div className="flex items-center justify-between text-amber-300 font-semibold">
                    <span>INSPECTING SYNAPSE n_{selectedSynapse.source} → n_{selectedSynapse.target}</span>
                    <button
                      onClick={() => setSelectedSynapseId(null)}
                      className="text-[#8F96A3] hover:text-white"
                    >
                      Close ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div>
                      <span className="text-[#8F96A3] text-[10px] block">STATIC WEIGHT</span>
                      <span className="text-white font-bold">{selectedSynapse.weight.toFixed(3)}</span>
                    </div>
                    <div>
                      <span className="text-[#8F96A3] text-[10px] block">PLASTIC STATE (s_ij)</span>
                      <span className="text-amber-400 font-bold">{selectedSynapse.state.toFixed(4)}</span>
                    </div>
                    <div>
                      <span className="text-[#8F96A3] text-[10px] block">RECENT DELTA (Δ)</span>
                      <span className="text-emerald-400 font-bold">+{selectedSynapse.delta.toFixed(4)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Selected Neuron Inspector Box */}
              <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-4 text-xs space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-[#252A35] pb-2">
                  <span className="text-white font-semibold">
                    NEURON n_{selectedNeuron.id} TELEMETRY & LOCAL NEIGHBORHOOD
                  </span>
                  <span className="text-[10px] text-[#22D3EE] bg-cyan-950/40 px-2 py-0.5 rounded border border-[#22D3EE]/30">
                    LAYER: {selectedNeuron.layer.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="bg-[#151922] p-2 rounded border border-[#252A35]">
                    <span className="text-[#8F96A3] block text-[10px]">ACTIVATION (z_i)</span>
                    <span className="text-[#22D3EE] font-bold">{selectedNeuron.activation.toFixed(3)}</span>
                  </div>
                  <div className="bg-[#151922] p-2 rounded border border-[#252A35]">
                    <span className="text-[#8F96A3] block text-[10px]">INCOMING SYNAPSES</span>
                    <span className="text-white font-bold">{incomingSynapses.length} links</span>
                  </div>
                  <div className="bg-[#151922] p-2 rounded border border-[#252A35]">
                    <span className="text-[#8F96A3] block text-[10px]">OUTGOING SYNAPSES</span>
                    <span className="text-white font-bold">{outgoingSynapses.length} links</span>
                  </div>
                  <div className="bg-[#151922] p-2 rounded border border-[#252A35]">
                    <span className="text-[#8F96A3] block text-[10px]">LOCAL INPUT SUM</span>
                    <span className="text-emerald-400 font-bold">{totalInputFromNeighbors.toFixed(3)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dedicated BDH Educational Microscope */}
        <div className="mt-10">
          <BDHExplorer id="bdh-microscope-explorer" />
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

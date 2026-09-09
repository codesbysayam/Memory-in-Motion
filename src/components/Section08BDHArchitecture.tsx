import React, { useState, useMemo } from 'react';
import { ArrowRight, Sliders } from 'lucide-react';
import { BDHToyModel } from '../models/bdhToyModel';
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
    <section id="section-08" className="scroll-mt-20 border-b border-[#E5E0D8] bg-[#FBF9F5] py-20 text-[#151515]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 space-y-12">
        <SectionHeader
          number="08"
          category="BDH ARCHITECTURE & GRAPH PARTICLES"
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
              <span className="text-[10px] font-mono text-[#716F68]">ILLUSTRATIVE GRAPH MODEL</span>
            </div>

            {/* Inference Data Flow */}
            <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-5 space-y-3 shadow-xs">
              <span className="font-mono text-xs uppercase tracking-widest text-[#716F68] block">
                BDH INFERENCE DATA FLOW
              </span>

              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="bg-[#FAF8F5] text-[#167C80] border border-[#E5E0D8] px-2.5 py-1 rounded-lg font-medium">
                  Input Pattern
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#A8A29E]" />
                <span className="bg-[#FAF8F5] text-[#151515] border border-[#E5E0D8] px-2.5 py-1 rounded-lg font-medium">
                  Neuron Particles
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#A8A29E]" />
                <span className="bg-[#F3EFFF] text-[#6842C2] border border-[#E2D8FA] px-2.5 py-1 rounded-lg font-semibold">
                  Synaptic Update
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#A8A29E]" />
                <span className="bg-[#EDF8F2] text-[#247A4B] border border-[#CDEEDB] px-2.5 py-1 rounded-lg font-medium">
                  Output State
                </span>
              </div>
            </div>

            {/* Published BDH Formalism vs Simplified Update */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-[#716F68] font-bold">
                  SYNAPTIC UPDATE FORMALISM
                </span>
                <button
                  onClick={() => setShowPublishedEquation(!showPublishedEquation)}
                  className="text-[10px] font-mono text-[#167C80] hover:text-[#6842C2] underline transition cursor-pointer"
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

            {/* Hyperparameter Controls */}
            <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-6 space-y-5 shadow-xs">
              <div className="flex items-center gap-2 border-b border-[#EAE6DF] pb-3">
                <Sliders className="w-4 h-4 text-[#6842C2]" />
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#151515]">
                  Graph Dynamics & Plasticity Controls
                </h4>
              </div>

              {/* Input Pattern Selector */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-[#716F68] block">
                  1. Input Seed Pattern:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Alpha', 'Beta', 'Gamma', 'Orthogonal'] as const).map((pat) => (
                    <button
                      key={pat}
                      onClick={() => setInputPattern(pat)}
                      className={`py-1.5 px-2.5 rounded-xl font-mono text-xs transition cursor-pointer border ${
                        inputPattern === pat
                          ? 'border-[#6842C2] bg-[#F3EFFF] text-[#6842C2] font-bold'
                          : 'border-[#E5E0D8] bg-[#FFFFFF] text-[#52504A] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      {pat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of Graph Neurons */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-[#716F68] block">
                  2. Graph Size (Particle Count):
                </label>
                <div className="flex gap-2">
                  {([16, 24, 32, 64] as const).map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() => setNumNeurons(cnt)}
                      className={`flex-1 py-1.5 rounded-xl font-mono text-xs transition cursor-pointer border ${
                        numNeurons === cnt
                          ? 'border-[#167C80] bg-[#EDF7F7] text-[#167C80] font-bold'
                          : 'border-[#E5E0D8] bg-[#FFFFFF] text-[#52504A] hover:bg-[#FAF8F5]'
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
            <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-6 space-y-6 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EAE6DF] pb-3">
                <h3 className="text-sm font-serif font-bold text-[#151515]">
                  Scale-free particle graph & synaptic flow
                </h3>
                <span className="text-xs font-mono text-[#716F68]">
                  Step {recurrentSteps} / {recurrentSteps} completed
                </span>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-3 gap-3 text-center font-mono text-xs">
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF]">
                  <span className="text-[#716F68] block text-[10px]">ACTIVE NEURONS</span>
                  <span className="text-[#167C80] font-bold">
                    {bdhNetwork.activeCount} / {numNeurons} ({(100 - bdhNetwork.sparsityRatio * 100).toFixed(0)}%)
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF]">
                  <span className="text-[#716F68] block text-[10px]">INACTIVE (SPARSE)</span>
                  <span className="text-[#716F68] font-bold">
                    {numNeurons - bdhNetwork.activeCount} units
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF]">
                  <span className="text-[#716F68] block text-[10px]">RELAXATION UPDATES</span>
                  <span className="text-[#247A4B] font-bold">{bdhNetwork.updatedCount} events</span>
                </div>
              </div>

              {/* SVG Graph Visualizer */}
              <div className="flex items-center justify-center p-6 bg-[#FAF8F5] rounded-2xl border border-[#E5E0D8] relative">
                <svg width="340" height="340" className="overflow-visible select-none">
                  {/* Synapse Lines */}
                  {bdhNetwork.synapses.map((syn) => {
                    const sNode = bdhNetwork.neurons.find((n) => n.id === syn.source);
                    const tNode = bdhNetwork.neurons.find((n) => n.id === syn.target);
                    if (!sNode || !tNode) return null;

                    const isConnected = sNode.id === selectedNeuronId || tNode.id === selectedNeuronId;
                    const isSynSelected = selectedSynapseId === syn.id;
                    const effectiveWeight = syn.weight + syn.state * synapticStrength;

                    let strokeColor = '#D8D4CB';
                    if (isSynSelected) strokeColor = '#A46622'; // Amber
                    else if (isConnected) {
                      strokeColor = sNode.id === selectedNeuronId ? '#6842C2' : '#167C80';
                    }

                    const strokeWidth = isSynSelected ? 3 : isConnected ? Math.max(1.5, effectiveWeight * 3) : 1;
                    const strokeOpacity = isSynSelected ? 1.0 : isConnected ? 0.9 : 0.4;

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
                        className="cursor-pointer hover:stroke-[#A46622] transition-all"
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

                    let fillColor = '#6842C2';
                    if (isInput) fillColor = '#167C80';
                    if (isOutput) fillColor = '#247A4B';

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
                            stroke="#6842C2"
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
                          stroke={isSelected ? '#151515' : isActive ? fillColor : '#A8A29E'}
                          strokeWidth={isSelected ? 2 : 1}
                        />

                        {numNeurons <= 32 && (
                          <text
                            x={neuron.x}
                            y={neuron.y + 3}
                            textAnchor="middle"
                            fontSize="8"
                            fontWeight="bold"
                            fill={isActive ? '#FFFFFF' : '#716F68'}
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
                <div className="rounded-xl bg-[#FFFDF8] border border-[#F5E2C4] p-4 text-xs font-mono space-y-2">
                  <div className="flex items-center justify-between text-[#A46622] font-semibold">
                    <span>INSPECTING SYNAPSE n_{selectedSynapse.source} → n_{selectedSynapse.target}</span>
                    <button
                      onClick={() => setSelectedSynapseId(null)}
                      className="text-[#716F68] hover:text-[#151515] cursor-pointer"
                    >
                      Close ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div>
                      <span className="text-[#716F68] text-[10px] block">STATIC WEIGHT</span>
                      <span className="text-[#151515] font-bold">{selectedSynapse.weight.toFixed(3)}</span>
                    </div>
                    <div>
                      <span className="text-[#716F68] text-[10px] block">PLASTIC STATE (s_ij)</span>
                      <span className="text-[#A46622] font-bold">{selectedSynapse.state.toFixed(4)}</span>
                    </div>
                    <div>
                      <span className="text-[#716F68] text-[10px] block">RECENT DELTA (Δ)</span>
                      <span className="text-[#247A4B] font-bold">+{selectedSynapse.delta.toFixed(4)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Selected Neuron Inspector Box */}
              <div className="rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] p-4 text-xs space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-2">
                  <span className="text-[#151515] font-semibold">
                    NEURON n_{selectedNeuron.id} TELEMETRY & LOCAL NEIGHBORHOOD
                  </span>
                  <span className="text-[10px] text-[#167C80] bg-[#EDF7F7] px-2 py-0.5 rounded border border-[#CFE8E8] font-bold">
                    LAYER: {selectedNeuron.layer.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="bg-[#FFFFFF] p-2.5 rounded-lg border border-[#E5E0D8]">
                    <span className="text-[#716F68] block text-[10px]">ACTIVATION (z_i)</span>
                    <span className="text-[#167C80] font-bold">{selectedNeuron.activation.toFixed(3)}</span>
                  </div>
                  <div className="bg-[#FFFFFF] p-2.5 rounded-lg border border-[#E5E0D8]">
                    <span className="text-[#716F68] block text-[10px]">INCOMING SYNAPSES</span>
                    <span className="text-[#151515] font-bold">{incomingSynapses.length} links</span>
                  </div>
                  <div className="bg-[#FFFFFF] p-2.5 rounded-lg border border-[#E5E0D8]">
                    <span className="text-[#716F68] block text-[10px]">OUTGOING SYNAPSES</span>
                    <span className="text-[#151515] font-bold">{outgoingSynapses.length} links</span>
                  </div>
                  <div className="bg-[#FFFFFF] p-2.5 rounded-lg border border-[#E5E0D8]">
                    <span className="text-[#716F68] block text-[10px]">LOCAL INPUT SUM</span>
                    <span className="text-[#247A4B] font-bold">{totalInputFromNeighbors.toFixed(3)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dedicated BDH Educational Microscope */}
        <div className="mt-12">
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

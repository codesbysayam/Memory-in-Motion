import React, { useState, useMemo } from 'react';
import {
  Layers,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { createToyNetwork, BDHToyNeuron, BDHToySynapse } from '../models/bdhToyModel';
import { ScientificHonestyPanel } from './ScientificHonestyPanel';

interface BDHExplorerProps {
  id?: string;
}

export const BDHExplorer: React.FC<BDHExplorerProps> = ({ id = 'bdh-explorer' }) => {
  const [activeInput, setActiveInput] = useState<'Alpha' | 'Beta' | 'Gamma'>('Alpha');
  const [reasoningRound, setReasoningRound] = useState<number>(2);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [topKThreshold, setTopKThreshold] = useState<number>(0.2);
  const [selectedNeuron, setSelectedNeuron] = useState<BDHToyNeuron | null>(null);
  const [selectedSynapse, setSelectedSynapse] = useState<BDHToySynapse | null>(null);
  const [mathOpen, setMathOpen] = useState<boolean>(false);
  const [comparisonOpen, setComparisonOpen] = useState<boolean>(true);

  // Compute the 28-neuron graph and deterministic states
  const { neurons, synapses, activePipelineStage } = useMemo(() => {
    const n = 28;
    const net = createToyNetwork(n, 101);

    // Set input activations based on pattern
    net.neurons.forEach((nr, idx) => {
      let initAct = 0;
      if (activeInput === 'Alpha' && (idx === 0 || idx === 1 || idx === 2)) {
        initAct = 0.9 - idx * 0.25;
      } else if (activeInput === 'Beta' && (idx === 13 || idx === 14)) {
        initAct = 0.85;
      } else if (activeInput === 'Gamma' && idx % 7 === 0) {
        initAct = 0.8;
      }
      nr.activation = initAct;
    });

    // Run deterministic rounds of simplified synaptic plasticity & message passing
    // Round 4l: Read, 4l+1: Synaptic update, 4l+2: Neuron update, 4l+3: Recurrent propagation
    for (let r = 0; r < reasoningRound; r++) {
      const stage = r % 4;

      if (stage === 1) {
        // Synaptic state update: sigma_new = 0.85 * sigma_old + 0.4 * x_i * y_j
        net.synapses.forEach((syn) => {
          const pre = net.neurons[syn.source].activation;
          const post = net.neurons[syn.target].activation;
          const delta = Number((pre * post * 0.45).toFixed(4));
          syn.delta = delta;
          syn.state = Number(Math.min(1.8, syn.state * 0.88 + delta).toFixed(4));
        });
      } else if (stage === 2 || stage === 3) {
        // Neuron update with top-k thresholding
        const nextActs = net.neurons.map((nr) => {
          const incomingSignal = nr.incoming.reduce((sum, synIdx) => {
            const s = net.synapses[synIdx];
            const effWeight = s.weight + s.state * 0.5;
            return sum + effWeight * net.neurons[s.source].activation;
          }, 0);
          // ReLU activation with threshold
          const raw = Math.max(0, incomingSignal * 0.7 - topKThreshold);
          return Math.min(1.0, raw);
        });

        // Apply non-negative activations back
        net.neurons.forEach((nr, idx) => {
          nr.activation = Number(nextActs[idx].toFixed(3));
        });
      }
    }

    const stageNames = [
      'Round 4l: Memory Read (σ · x)',
      'Round 4l+1: Synaptic Update (Plasticity σ)',
      'Round 4l+2: Neuron Update (ReLU / Sparsity)',
      'Round 4l+3: Recurrent Graph Propagation',
    ];

    return {
      neurons: net.neurons,
      synapses: net.synapses,
      activePipelineStage: stageNames[reasoningRound % 4],
    };
  }, [activeInput, reasoningRound, topKThreshold]);

  return (
    <div id={id} className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-6 sm:p-8 space-y-7 shadow-xs text-[#151515]">
      {/* Title & Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6DF] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-[#6842C2] bg-[#F3EFFF] border border-[#E2D8FA] px-2.5 py-0.5 rounded font-bold">
              EDUCATIONAL MICROSCOPE
            </span>
            <span className="text-xs font-mono text-[#167C80] bg-[#EDF7F7] border border-[#CFE8E8] px-2.5 py-0.5 rounded font-bold">
              PATHWAY BDH ABSTRACTION
            </span>
          </div>
          <h3 className="text-xl font-serif font-bold text-[#151515] tracking-tight">
            Microscopic BDH graph explorer
          </h3>
          <p className="text-xs text-[#716F68] mt-1 font-sans max-w-2xl">
            Inspect the internal synaptic substrate of a scale-free particle graph during 4-phase reasoning relaxation rounds.
          </p>
        </div>
      </div>

      {/* 6-Step Educational Reasoning Pipeline Bar */}
      <div className="rounded-2xl border border-[#E5E0D8] bg-[#FAF8F5] p-4 space-y-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <span className="text-[#716F68] uppercase font-bold">
            EDUCATIONAL REASONING PIPELINE (ROUND {reasoningRound})
          </span>
          <span className="text-[#167C80] font-bold">{activePipelineStage}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-[10px] font-mono">
          {[
            { label: '1. INPUT', desc: 'Active Pattern' },
            { label: '2. NEURONS', desc: 'Sparse Activations' },
            { label: '3. READ', desc: 'Round 4l' },
            { label: '4. SYNAPSE σ', desc: 'Round 4l+1' },
            { label: '5. UPDATE', desc: 'Round 4l+2' },
            { label: '6. NEXT ROUND', desc: 'Round 4l+3' },
          ].map((step, sIdx) => (
            <button
              key={step.label}
              onClick={() => {
                setSelectedRound(sIdx + 1);
                setSelectedNeuron(null);
                setSelectedSynapse(null);
              }}
              className={`p-2.5 rounded-xl border transition-colors text-left cursor-pointer ${
                selectedRound === sIdx + 1 || ((reasoningRound % 4) + 2 === sIdx && !selectedRound && !selectedNeuron && !selectedSynapse)
                  ? 'border-[#167C80] bg-[#EDF7F7] text-[#167C80] font-bold ring-1 ring-[#167C80]'
                  : 'border-[#E5E0D8] bg-[#FFFFFF] text-[#716F68] hover:text-[#151515] hover:bg-[#FAF8F5]'
              }`}
            >
              <div className="text-[#151515] font-semibold">{step.label}</div>
              <div className="text-[9px] opacity-70 mt-0.5">{step.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Graph Canvas + Inspector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left (7 cols): Interactive Graph SVG */}
        <div className="lg:col-span-7 rounded-2xl border border-[#E5E0D8] bg-[#FAF8F5] p-5 flex flex-col items-center justify-center relative shadow-xs">
          <div className="w-full flex items-center justify-between text-[11px] font-mono text-[#716F68] mb-3">
            <span>Scale-free graph (28 neurons, {synapses.length} synapses)</span>
            <span>Click any node or link to inspect</span>
          </div>

          <svg viewBox="0 0 320 320" className="w-full max-w-[360px] h-auto select-none">
            {/* Draw Synapses */}
            {synapses.map((syn) => {
              const src = neurons[syn.source];
              const tgt = neurons[syn.target];
              const isSelected = selectedSynapse?.id === syn.id;
              const hasPlasticity = syn.state > 0.05;
              const strokeColor = isSelected
                ? '#167C80'
                : hasPlasticity
                ? `rgba(104, 66, 194, ${Math.min(1, Math.max(0.3, syn.state * 1.2))})`
                : 'rgba(216, 212, 203, 0.6)';
              const strokeWidth = isSelected ? 3 : hasPlasticity ? 2 : 1;

              return (
                <line
                  key={syn.id}
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  onClick={() => {
                    setSelectedSynapse(syn);
                    setSelectedNeuron(null);
                  }}
                  className="cursor-pointer hover:stroke-[#167C80] transition-colors"
                />
              );
            })}

            {/* Draw Neurons */}
            {neurons.map((nr) => {
              const isSelected = selectedNeuron?.id === nr.id;
              const isActive = nr.activation > 0.05;
              const radius = isSelected ? 9 : isActive ? 7.5 : 5.5;
              const fillColor = isSelected
                ? '#167C80'
                : isActive
                ? `rgba(22, 124, 128, ${Math.min(1, Math.max(0.4, nr.activation * 1.3))})`
                : '#E5E0D8';

              return (
                <g
                  key={nr.id}
                  onClick={() => {
                    setSelectedNeuron(nr);
                    setSelectedSynapse(null);
                  }}
                  className="cursor-pointer"
                >
                  <circle
                    cx={nr.x}
                    cy={nr.y}
                    r={radius}
                    fill={fillColor}
                    stroke={isSelected ? '#151515' : '#D8D4CB'}
                    strokeWidth={isSelected ? 2 : 1}
                    className="transition-all hover:r-8 hover:stroke-[#151515]"
                  />
                  <text
                    x={nr.x}
                    y={nr.y + 3}
                    textAnchor="middle"
                    fontSize="7"
                    fontFamily="monospace"
                    fill={isActive || isSelected ? '#FFFFFF' : '#716F68'}
                    fontWeight="bold"
                    pointerEvents="none"
                  >
                    {nr.id}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Graph Legend */}
          <div className="w-full flex items-center justify-between text-[10px] font-mono text-[#716F68] mt-3 pt-3 border-t border-[#EAE6DF]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#167C80] inline-block" /> Active Neuron
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-[#6842C2] inline-block" /> Plastic Synapse σ
              </span>
            </div>
            <span>Selected: {selectedNeuron ? `Neuron #${selectedNeuron.id}` : selectedSynapse ? `Synapse #${selectedSynapse.id}` : 'None'}</span>
          </div>
        </div>

        {/* Right (5 cols): Controls & Inspector Details */}
        <div className="lg:col-span-5 space-y-4 font-mono text-xs">
          {/* Controls Panel */}
          <div className="rounded-2xl border border-[#E5E0D8] bg-[#FAF8F5] p-5 space-y-4 shadow-xs">
            <span className="text-[#151515] font-semibold text-xs uppercase tracking-wider block">
              Simulation Controls
            </span>

            {/* Input Pattern Selector */}
            <div className="space-y-1.5">
              <label className="text-[#716F68] text-[11px] block">Input Pattern:</label>
              <div className="flex gap-2">
                {(['Alpha', 'Beta', 'Gamma'] as const).map((pat) => (
                  <button
                    key={pat}
                    onClick={() => setActiveInput(pat)}
                    className={`flex-1 py-1.5 px-2.5 rounded-xl border transition-colors cursor-pointer ${
                      activeInput === pat
                        ? 'border-[#167C80] bg-[#EDF7F7] text-[#167C80] font-bold'
                        : 'border-[#E5E0D8] bg-[#FFFFFF] text-[#716F68] hover:text-[#151515]'
                    }`}
                  >
                    {pat}
                  </button>
                ))}
              </div>
            </div>

            {/* Reasoning Rounds */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-[#716F68]">Reasoning Rounds:</span>
                <span className="text-[#167C80] font-bold">{reasoningRound}</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                step="1"
                value={reasoningRound}
                onChange={(e) => setReasoningRound(Number(e.target.value))}
                className="w-full accent-[#167C80] bg-[#EAE6DF] h-1.5 rounded cursor-pointer"
              />
            </div>

            {/* Sparsity Threshold */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-[#716F68]">Top-K Sparsity Cutoff:</span>
                <span className="text-[#151515] font-semibold">{topKThreshold.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.5"
                step="0.05"
                value={topKThreshold}
                onChange={(e) => setTopKThreshold(Number(e.target.value))}
                className="w-full accent-[#6842C2] bg-[#EAE6DF] h-1.5 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Inspector Card (Neuron or Synapse) */}
          <div className="rounded-2xl border border-[#E5E0D8] bg-[#FAF8F5] p-5 space-y-3 shadow-xs">
            <span className="text-[#167C80] font-semibold text-xs uppercase tracking-wider block">
              MICROSCOPE TELEMETRY
            </span>

            {selectedNeuron ? (
              <div className="space-y-2 text-[#52504A] text-[11px]">
                <div className="flex justify-between border-b border-[#EAE6DF] pb-1.5">
                  <span className="text-[#716F68]">NEURON:</span>
                  <strong className="text-[#151515]">N{String(selectedNeuron.id).padStart(2, '0')}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#716F68]">Activation:</span>
                  <strong className="text-[#247A4B]">{selectedNeuron.activation.toFixed(2)}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#716F68]">Status:</span>
                  <span className={`font-bold ${selectedNeuron.activation > 0.05 ? 'text-[#167C80]' : 'text-[#A8A29E]'}`}>
                    {selectedNeuron.activation > 0.05 ? 'ACTIVE' : 'QUIESCENT'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#716F68]">Connected synapses:</span>
                  <span className="text-[#151515]">
                    {selectedNeuron.incoming.length + selectedNeuron.outgoing.length}
                  </span>
                </div>
                <div className="pt-2 text-[10px] text-[#A46622] bg-[#FFF8EE] p-2.5 rounded-xl border border-[#F5E2C4] flex justify-between items-center">
                  <span>ROLE: Graph Activation Node</span>
                  <span className="font-bold text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#FAF0DC]">EDUCATIONAL ABSTRACTION</span>
                </div>
              </div>
            ) : selectedSynapse ? (
              <div className="space-y-2 text-[#52504A] text-[11px]">
                <div className="flex justify-between border-b border-[#EAE6DF] pb-1.5">
                  <span className="text-[#716F68]">SYNAPSE:</span>
                  <strong className="text-[#151515]">
                    N{String(selectedSynapse.source).padStart(2, '0')} → N{String(selectedSynapse.target).padStart(2, '0')}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#716F68]">Weight:</span>
                  <span className="text-[#151515]">{selectedSynapse.weight.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#716F68]">Synaptic state:</span>
                  <strong className="text-[#6842C2]">{selectedSynapse.state.toFixed(2)}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#716F68]">Memory-bearing connection</span>
                  <span className="text-[#167C80] text-[10px]">Δ = +{selectedSynapse.delta.toFixed(2)}</span>
                </div>
                <div className="pt-2 text-[10px] text-[#A46622] bg-[#FFF8EE] p-2.5 rounded-xl border border-[#F5E2C4] flex justify-between items-center">
                  <span>PLASTIC CONNECTION</span>
                  <span className="font-bold text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#FAF0DC]">EDUCATIONAL ABSTRACTION</span>
                </div>
              </div>
            ) : selectedRound ? (
              <div className="space-y-2 text-[#52504A] text-[11px]">
                <div className="flex justify-between border-b border-[#EAE6DF] pb-1.5">
                  <span className="text-[#716F68]">INSPECTED ROUND:</span>
                  <strong className="text-[#151515]">ROUND {selectedRound}</strong>
                </div>
                <div className="space-y-1 font-mono text-xs">
                  <div className="flex items-center justify-between text-[#52504A]">
                    <span>Memory read</span>
                    <span className="text-[#247A4B] font-bold">✓</span>
                  </div>
                  <div className="flex items-center justify-between text-[#52504A]">
                    <span>Synaptic update</span>
                    <span className="text-[#247A4B] font-bold">✓</span>
                  </div>
                  <div className="flex items-center justify-between text-[#52504A]">
                    <span>Neuron update</span>
                    <span className="text-[#247A4B] font-bold">✓</span>
                  </div>
                  <div className="flex items-center justify-between text-[#52504A]">
                    <span>Recurrent propagation</span>
                    <span className="text-[#247A4B] font-bold">✓</span>
                  </div>
                </div>
                <div className="pt-2 text-[10px] text-[#A46622] bg-[#FFF8EE] p-2.5 rounded-xl border border-[#F5E2C4] flex justify-between items-center">
                  <span>4-PHASE RELAXATION</span>
                  <span className="font-bold text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#FAF0DC]">EDUCATIONAL ABSTRACTION</span>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-[#716F68]">
                Click on any neuron node, connecting synapse, or reasoning round to inspect localized weights, plasticity states, and activation values.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* "Open the Mathematics" Accordion */}
      <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] overflow-hidden shadow-xs">
        <button
          onClick={() => setMathOpen(!mathOpen)}
          className="w-full flex items-center justify-between p-5 text-left font-mono text-xs font-semibold text-[#151515] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#167C80]" />
            <span>OPEN THE MATHEMATICS: 4-ROUND REASONING FORMULATION</span>
            <span className="text-[10px] text-[#716F68] font-normal">[PUBLISHED BDH CONCEPT]</span>
          </span>
          {mathOpen ? <ChevronUp className="w-4 h-4 text-[#716F68]" /> : <ChevronDown className="w-4 h-4 text-[#716F68]" />}
        </button>

        {mathOpen && (
          <div className="p-5 border-t border-[#EAE6DF] space-y-4 font-mono text-xs text-[#52504A] bg-[#FAF8F5]">
            <p className="text-[#716F68] text-xs">
              Pathway&apos;s &ldquo;The Equations of Reasoning&rdquo; describes BDH&apos;s recurrent dynamics in quadruplets of rounds (4l..4l+3). Below is the beginner-friendly conceptual structure:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border border-[#CDEEDB] bg-[#EDF8F2] space-y-1.5">
                <span className="text-[#247A4B] font-bold block">ROUND 4l: MEMORY READ</span>
                <code className="text-[#151515] text-[11px] block font-bold">read = σ_old ⊙ x_t</code>
                <p className="text-[11px] text-[#52504A] font-sans">
                  Plastic states stored on connections are queried by incoming activation signals, reading associative context.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-[#E2D8FA] bg-[#FAF8FD] space-y-1.5">
                <span className="text-[#6842C2] font-bold block">ROUND 4l+1: SYNAPTIC REWEIGHTING</span>
                <code className="text-[#151515] text-[11px] block font-bold">σ_new = λ σ_old + η (x_i · y_j)</code>
                <p className="text-[11px] text-[#52504A] font-sans">
                  Synapses dynamically adjust their state based on correlated pre- and post-synaptic activity (local plasticity).
                </p>
              </div>

              <div className="p-4 rounded-xl border border-[#CFE8E8] bg-[#EDF7F7] space-y-1.5">
                <span className="text-[#167C80] font-bold block">ROUND 4l+2: NEURON UPDATE</span>
                <code className="text-[#151515] text-[11px] block font-bold">x_new = ReLU(W · x + bias - θ)</code>
                <p className="text-[11px] text-[#52504A] font-sans">
                  Neuron states update non-linearly with competitive thresholding (top-k sparsity) to retain sharp representations.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-[#F5E2C4] bg-[#FFF8EE] space-y-1.5">
                <span className="text-[#A46622] font-bold block">ROUND 4l+3: RECURRENT PROPAGATION</span>
                <code className="text-[#151515] text-[11px] block font-bold">h_(l+1) = propagate(x_new, graph)</code>
                <p className="text-[11px] text-[#52504A] font-sans">
                  Signals diffuse through the scale-free topology to next neighbor hops for the subsequent reasoning cycle.
                </p>
              </div>
            </div>

            <div className="text-[10px] text-[#716F68] pt-3 border-t border-[#EAE6DF] flex items-center justify-between">
              <span>Citations: Kosowski et al. (2025), Pathway &ldquo;Equations of Reasoning&rdquo;</span>
              <a
                href="https://pathway.com/research/equations-of-reasoning"
                target="_blank"
                rel="noreferrer"
                className="text-[#167C80] hover:underline flex items-center gap-1 font-semibold"
              >
                Read Official Pathway Documentation <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* "Same Problem, Different Memory Substrate" Comparison Table */}
      <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] overflow-hidden shadow-xs">
        <button
          onClick={() => setComparisonOpen(!comparisonOpen)}
          className="w-full flex items-center justify-between p-5 text-left font-mono text-xs font-semibold text-[#151515] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#6842C2]" />
            <span>SAME PROBLEM, DIFFERENT MEMORY SUBSTRATE: RECURRENT TOY VS BDH</span>
            <span className="text-[10px] text-[#716F68] font-normal">[ARCHITECTURE COMPARISON]</span>
          </span>
          {comparisonOpen ? <ChevronUp className="w-4 h-4 text-[#716F68]" /> : <ChevronDown className="w-4 h-4 text-[#716F68]" />}
        </button>

        {comparisonOpen && (
          <div className="p-5 border-t border-[#EAE6DF] overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-[#EAE6DF] text-[#716F68] text-[11px]">
                  <th className="pb-3 font-semibold">DIMENSION / PROPERTY</th>
                  <th className="pb-3 font-semibold text-[#167C80]">OUR RECURRENT TOY MODEL</th>
                  <th className="pb-3 font-semibold text-[#6842C2]">PUBLISHED BDH (PATHWAY)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE6DF] text-[#52504A]">
                <tr>
                  <td className="py-3 font-medium text-[#151515]">State Location</td>
                  <td className="py-3 text-[#52504A]">Fixed-size state vector h_t / matrix M</td>
                  <td className="py-3 text-[#52504A]">Neuron activations + synaptic states σ(i,j)</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-[#151515]">Update Mechanism</td>
                  <td className="py-3 text-[#52504A]">Global mathematical outer-product / tanh</td>
                  <td className="py-3 text-[#52504A]">Local neuron/synapse interactions on graph</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-[#151515]">Memory Form</td>
                  <td className="py-3 text-[#52504A]">Continuous coordinate superposition</td>
                  <td className="py-3 text-[#52504A]">Plastic synaptic connection weights</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-[#151515]">Computation</td>
                  <td className="py-3 text-[#52504A]">Step-by-step vector linear algebra in browser</td>
                  <td className="py-3 text-[#52504A]">Scale-free local relaxation on accelerators</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-[#151515]">Interpretability</td>
                  <td className="py-3 text-[#52504A]">Direct matrix heatmap & cosine decoding</td>
                  <td className="py-3 text-[#52504A]">Sparse activation patterns & localized attractors</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-[#151515]">Failure Mode</td>
                  <td className="py-3 text-[#52504A]">Coordinate overlap & cosine interference</td>
                  <td className="py-3 text-[#52504A]">Synaptic saturation & attractor crosstalk</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-[#151515]">Purpose</td>
                  <td className="py-3 text-[#167C80] font-semibold">Educational visual demonstration of compression</td>
                  <td className="py-3 text-[#6842C2] font-semibold">Production recurrent in-context learning architecture</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Scientific Honesty & Evidence Discipline Panel */}
      <div className="pt-2">
        <ScientificHonestyPanel />
      </div>
    </div>
  );
};

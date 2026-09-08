import React, { useState, useMemo } from 'react';
import {
  Network,
  Cpu,
  Layers,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { createToyNetwork, BDHToyNeuron, BDHToySynapse } from '../models/bdhToyModel';
import { ScientificHonestyPanel } from './ScientificHonestyPanel';

interface BDHExplorerProps {
  id?: string;
}

export const BDHExplorer: React.FC<BDHExplorerProps> = ({ id = 'bdh-explorer' }) => {
  const [numNeurons, setNumNeurons] = useState<24 | 32>(28 as 24 | 32);
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

          const raw = 0.4 * nr.activation + 0.6 * incomingSignal;
          return raw > topKThreshold ? raw - topKThreshold : 0;
        });

        net.neurons.forEach((nr, i) => {
          nr.activation = Number(nextActs[i].toFixed(3));
        });
      }
    }

    const stageNames = [
      'Round 4l: Memory Read',
      'Round 4l+1: Synaptic Reweighting',
      'Round 4l+2: Neuron Update',
      'Round 4l+3: Recurrent Propagation',
    ];

    return {
      neurons: net.neurons,
      synapses: net.synapses,
      activePipelineStage: stageNames[reasoningRound % 4],
    };
  }, [activeInput, reasoningRound, topKThreshold]);

  return (
    <div id={id} className="rounded-2xl border border-[#252A35] bg-[#0E1117] p-6 space-y-6">
      {/* Prominent Educational Notice Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#252A35] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-[#22D3EE]" />
            <h3 className="font-mono text-base font-bold text-white uppercase tracking-wider">
              BDH Microscope: Synaptic Working Memory
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300">
              SIMPLIFIED EDUCATIONAL TOY — NOT THE OFFICIAL BDH IMPLEMENTATION
            </span>
          </div>
          <p className="text-xs text-[#8F96A3] mt-1">
            Explore how memory can live in plastic connection weights σ(i,j) rather than an expanding KV cache.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded bg-violet-950/40 border border-violet-500/30 text-violet-300 text-[11px] font-mono">
            [EDUCATIONAL TOY]
          </span>
          <span className="px-2 py-1 rounded bg-cyan-950/40 border border-[#22D3EE]/30 text-[#22D3EE] text-[11px] font-mono">
            [PUBLISHED CONCEPT]
          </span>
        </div>
      </div>

      {/* 4-Step BDH Reasoning Pipeline Indicator */}
      <div className="rounded-xl border border-[#252A35] bg-[#151922] p-4 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-white font-semibold flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-violet-400" />
            EDUCATIONAL REASONING PIPELINE (ROUND {reasoningRound})
          </span>
          <span className="text-[#22D3EE] font-bold">{activePipelineStage}</span>
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
              className={`p-2 rounded border transition-colors text-left cursor-pointer ${
                selectedRound === sIdx + 1 || ((reasoningRound % 4) + 2 === sIdx && !selectedRound && !selectedNeuron && !selectedSynapse)
                  ? 'border-[#22D3EE] bg-cyan-950/50 text-white font-bold ring-1 ring-[#22D3EE]'
                  : 'border-[#252A35] bg-[#11141A] text-[#8F96A3] hover:text-white hover:bg-[#161C26]'
              }`}
            >
              <div className="text-white font-semibold">{step.label}</div>
              <div className="text-[9px] opacity-70 mt-0.5">{step.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Graph Canvas + Inspector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left (7 cols): Interactive Graph SVG */}
        <div className="lg:col-span-7 rounded-xl border border-[#252A35] bg-[#07080B] p-4 flex flex-col items-center justify-center relative">
          <div className="w-full flex items-center justify-between text-[11px] font-mono text-[#8F96A3] mb-2">
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
                ? '#22D3EE'
                : hasPlasticity
                ? `rgba(168, 85, 247, ${Math.min(1, Math.max(0.2, syn.state * 1.2))})`
                : 'rgba(55, 65, 81, 0.4)';
              const strokeWidth = isSelected ? 3 : hasPlasticity ? 1.8 : 0.8;

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
                  className="cursor-pointer hover:stroke-cyan-300 transition-colors"
                />
              );
            })}

            {/* Draw Neurons */}
            {neurons.map((nr) => {
              const isSelected = selectedNeuron?.id === nr.id;
              const isActive = nr.activation > 0.05;
              const radius = isSelected ? 9 : isActive ? 7.5 : 5.5;
              const fillColor = isSelected
                ? '#22D3EE'
                : isActive
                ? `rgba(34, 211, 238, ${Math.min(1, Math.max(0.4, nr.activation * 1.3))})`
                : '#1F2937';

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
                    stroke={isSelected ? '#FFFFFF' : '#374151'}
                    strokeWidth={isSelected ? 2 : 1}
                    className="transition-all hover:r-8 hover:stroke-white"
                  />
                  <text
                    x={nr.x}
                    y={nr.y + 3}
                    textAnchor="middle"
                    fontSize="7"
                    fontFamily="monospace"
                    fill={isActive || isSelected ? '#07080B' : '#9CA3AF'}
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
          <div className="w-full flex items-center justify-between text-[10px] font-mono text-[#8F96A3] mt-2 pt-2 border-t border-[#252A35]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#22D3EE] inline-block" /> Active Neuron
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-violet-400 inline-block" /> Plastic Synapse σ
              </span>
            </div>
            <span>Selected: {selectedNeuron ? `Neuron #${selectedNeuron.id}` : selectedSynapse ? `Synapse #${selectedSynapse.id}` : 'None'}</span>
          </div>
        </div>

        {/* Right (5 cols): Controls & Inspector Details */}
        <div className="lg:col-span-5 space-y-4 font-mono text-xs">
          {/* Controls Panel */}
          <div className="rounded-xl border border-[#252A35] bg-[#151922] p-4 space-y-3">
            <span className="text-white font-semibold text-xs uppercase tracking-wider block">
              Simulation Controls
            </span>

            {/* Input Pattern Selector */}
            <div className="space-y-1">
              <label className="text-[#8F96A3] text-[11px] block">Input Pattern:</label>
              <div className="flex gap-2">
                {(['Alpha', 'Beta', 'Gamma'] as const).map((pat) => (
                  <button
                    key={pat}
                    onClick={() => setActiveInput(pat)}
                    className={`flex-1 py-1 px-2 rounded border transition-colors ${
                      activeInput === pat
                        ? 'border-[#22D3EE] bg-cyan-950/60 text-[#22D3EE] font-bold'
                        : 'border-[#252A35] bg-[#11141A] text-[#8F96A3] hover:text-white'
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
                <span className="text-[#8F96A3]">Reasoning Rounds:</span>
                <span className="text-[#22D3EE] font-bold">{reasoningRound}</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                step="1"
                value={reasoningRound}
                onChange={(e) => setReasoningRound(Number(e.target.value))}
                className="w-full accent-[#22D3EE] bg-zinc-700 h-1.5 rounded cursor-pointer"
              />
            </div>

            {/* Sparsity Threshold */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-[#8F96A3]">Top-K Sparsity Cutoff:</span>
                <span className="text-white">{topKThreshold.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.5"
                step="0.05"
                value={topKThreshold}
                onChange={(e) => setTopKThreshold(Number(e.target.value))}
                className="w-full accent-violet-400 bg-zinc-700 h-1.5 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Inspector Card (Neuron or Synapse) */}
          <div className="rounded-xl border border-[#252A35] bg-[#151922] p-4 space-y-2">
            <span className="text-[#22D3EE] font-semibold text-xs uppercase tracking-wider block">
              MICROSCOPE TELEMETRY
            </span>

            {selectedNeuron ? (
              <div className="space-y-2 text-zinc-300 text-[11px]">
                <div className="flex justify-between border-b border-[#252A35] pb-1">
                  <span className="text-[#8F96A3]">NEURON:</span>
                  <strong className="text-white">N{String(selectedNeuron.id).padStart(2, '0')}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8F96A3]">Activation:</span>
                  <strong className="text-emerald-300">{selectedNeuron.activation.toFixed(2)}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8F96A3]">Status:</span>
                  <span className={`font-bold ${selectedNeuron.activation > 0.05 ? 'text-[#22D3EE]' : 'text-slate-500'}`}>
                    {selectedNeuron.activation > 0.05 ? 'ACTIVE' : 'QUIESCENT'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8F96A3]">Connected synapses:</span>
                  <span className="text-zinc-200">
                    {selectedNeuron.incoming.length + selectedNeuron.outgoing.length}
                  </span>
                </div>
                <div className="pt-1 text-[10px] text-amber-300/90 bg-amber-950/20 p-2 rounded border border-amber-500/20 flex justify-between items-center">
                  <span>ROLE: Graph Activation Node</span>
                  <span className="font-bold text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-900/40">EDUCATIONAL ABSTRACTION</span>
                </div>
              </div>
            ) : selectedSynapse ? (
              <div className="space-y-2 text-zinc-300 text-[11px]">
                <div className="flex justify-between border-b border-[#252A35] pb-1">
                  <span className="text-[#8F96A3]">SYNAPSE:</span>
                  <strong className="text-white">
                    N{String(selectedSynapse.source).padStart(2, '0')} → N{String(selectedSynapse.target).padStart(2, '0')}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8F96A3]">Weight:</span>
                  <span className="text-white">{selectedSynapse.weight.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8F96A3]">Synaptic state:</span>
                  <strong className="text-violet-300">{selectedSynapse.state.toFixed(2)}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8F96A3]">Memory-bearing connection</span>
                  <span className="text-cyan-300 text-[10px]">Δ = +{selectedSynapse.delta.toFixed(2)}</span>
                </div>
                <div className="pt-1 text-[10px] text-amber-300/90 bg-amber-950/20 p-2 rounded border border-amber-500/20 flex justify-between items-center">
                  <span>PLASTIC CONNECTION</span>
                  <span className="font-bold text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-900/40">EDUCATIONAL ABSTRACTION</span>
                </div>
              </div>
            ) : selectedRound ? (
              <div className="space-y-2 text-zinc-300 text-[11px]">
                <div className="flex justify-between border-b border-[#252A35] pb-1">
                  <span className="text-[#8F96A3]">INSPECTED ROUND:</span>
                  <strong className="text-white">ROUND {selectedRound}</strong>
                </div>
                <div className="space-y-1 font-mono text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Memory read</span>
                    <span className="text-emerald-400 font-bold">✓</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Synaptic update</span>
                    <span className="text-emerald-400 font-bold">✓</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Neuron update</span>
                    <span className="text-emerald-400 font-bold">✓</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Recurrent propagation</span>
                    <span className="text-emerald-400 font-bold">✓</span>
                  </div>
                </div>
                <div className="pt-1 text-[10px] text-amber-300/90 bg-amber-950/20 p-2 rounded border border-amber-500/20 flex justify-between items-center">
                  <span>4-PHASE RELAXATION</span>
                  <span className="font-bold text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-900/40">EDUCATIONAL ABSTRACTION</span>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-[#8F96A3]">
                Click on any neuron node, connecting synapse, or reasoning round to inspect localized weights, plasticity states, and activation values.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* "Open the Mathematics" Accordion */}
      <div className="rounded-xl border border-[#252A35] bg-[#11141A] overflow-hidden">
        <button
          onClick={() => setMathOpen(!mathOpen)}
          className="w-full flex items-center justify-between p-4 text-left font-mono text-xs font-semibold text-white hover:bg-[#151922] transition-colors"
        >
          <span className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#22D3EE]" />
            OPEN THE MATHEMATICS: 4-ROUND REASONING FORMULATION
            <span className="text-[10px] text-zinc-400 font-normal">[PUBLISHED BDH CONCEPT]</span>
          </span>
          {mathOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {mathOpen && (
          <div className="p-4 border-t border-[#252A35] space-y-4 font-mono text-xs text-zinc-300 bg-[#0E1117]">
            <p className="text-[#8F96A3] text-xs">
              Pathway's "The Equations of Reasoning" describes BDH's recurrent dynamics in quadruplets of rounds (4l..4l+3). Below is the beginner-friendly conceptual structure:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-[#252A35] bg-[#151922] space-y-1">
                <span className="text-emerald-400 font-bold block">ROUND 4l: MEMORY READ</span>
                <code className="text-white text-[11px] block">read = σ_old ⊙ x_t</code>
                <p className="text-[11px] text-[#8F96A3]">
                  Plastic states stored on connections are queried by incoming activation signals, reading associative context.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-[#252A35] bg-[#151922] space-y-1">
                <span className="text-violet-400 font-bold block">ROUND 4l+1: SYNAPTIC REWEIGHTING</span>
                <code className="text-white text-[11px] block">σ_new = λ σ_old + η (x_i · y_j)</code>
                <p className="text-[11px] text-[#8F96A3]">
                  Synapses dynamically adjust their state based on correlated pre- and post-synaptic activity (local plasticity).
                </p>
              </div>

              <div className="p-3 rounded-lg border border-[#252A35] bg-[#151922] space-y-1">
                <span className="text-cyan-400 font-bold block">ROUND 4l+2: NEURON UPDATE</span>
                <code className="text-white text-[11px] block">x_new = ReLU(W · x + bias - θ)</code>
                <p className="text-[11px] text-[#8F96A3]">
                  Neuron states update non-linearly with competitive thresholding (top-k sparsity) to retain sharp representations.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-[#252A35] bg-[#151922] space-y-1">
                <span className="text-amber-400 font-bold block">ROUND 4l+3: RECURRENT PROPAGATION</span>
                <code className="text-white text-[11px] block">h_(l+1) = propagate(x_new, graph)</code>
                <p className="text-[11px] text-[#8F96A3]">
                  Signals diffuse through the scale-free topology to next neighbor hops for the subsequent reasoning cycle.
                </p>
              </div>
            </div>

            <div className="text-[10px] text-[#8F96A3] pt-2 border-t border-[#252A35] flex items-center justify-between">
              <span>Citations: Kosowski et al. (2025), Pathway "Equations of Reasoning"</span>
              <a
                href="https://pathway.com/research/equations-of-reasoning"
                target="_blank"
                rel="noreferrer"
                className="text-[#22D3EE] hover:underline flex items-center gap-1"
              >
                Read Official Pathway Documentation <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* "Same Problem, Different Memory Substrate" Comparison Table */}
      <div className="rounded-xl border border-[#252A35] bg-[#11141A] overflow-hidden">
        <button
          onClick={() => setComparisonOpen(!comparisonOpen)}
          className="w-full flex items-center justify-between p-4 text-left font-mono text-xs font-semibold text-white hover:bg-[#151922] transition-colors"
        >
          <span className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-violet-400" />
            SAME PROBLEM, DIFFERENT MEMORY SUBSTRATE: RECURRENT TOY VS BDH
            <span className="text-[10px] text-zinc-400 font-normal">[ARCHITECTURE COMPARISON]</span>
          </span>
          {comparisonOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {comparisonOpen && (
          <div className="p-4 border-t border-[#252A35] overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-[#252A35] text-[#8F96A3] text-[11px]">
                  <th className="pb-2.5 font-semibold">DIMENSION / PROPERTY</th>
                  <th className="pb-2.5 font-semibold text-[#22D3EE]">OUR RECURRENT TOY MODEL</th>
                  <th className="pb-2.5 font-semibold text-violet-400">PUBLISHED BDH (PATHWAY)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252A35]/60 text-zinc-300">
                <tr>
                  <td className="py-2.5 font-medium text-white">State Location</td>
                  <td className="py-2.5 text-zinc-300">Fixed-size state vector h_t / matrix M</td>
                  <td className="py-2.5 text-zinc-300">Neuron activations + synaptic states σ(i,j)</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium text-white">Update Mechanism</td>
                  <td className="py-2.5 text-zinc-300">Global mathematical outer-product / tanh</td>
                  <td className="py-2.5 text-zinc-300">Local neuron/synapse interactions on graph</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium text-white">Memory Form</td>
                  <td className="py-2.5 text-zinc-300">Continuous coordinate superposition</td>
                  <td className="py-2.5 text-zinc-300">Plastic synaptic connection weights</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium text-white">Computation</td>
                  <td className="py-2.5 text-zinc-300">Step-by-step vector linear algebra in browser</td>
                  <td className="py-2.5 text-zinc-300">Scale-free local relaxation on accelerators</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium text-white">Interpretability</td>
                  <td className="py-2.5 text-zinc-300">Direct matrix heatmap & cosine decoding</td>
                  <td className="py-2.5 text-zinc-300">Sparse activation patterns & localized attractors</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium text-white">Failure Mode</td>
                  <td className="py-2.5 text-zinc-300">Coordinate overlap & cosine interference</td>
                  <td className="py-2.5 text-zinc-300">Synaptic saturation & attractor crosstalk</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium text-white">Purpose</td>
                  <td className="py-2.5 text-[#22D3EE]">Educational visual demonstration of compression</td>
                  <td className="py-2.5 text-violet-300">Production recurrent in-context learning architecture</td>
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

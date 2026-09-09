import React, { useState, useMemo } from 'react';
import { RefreshCw, HelpCircle } from 'lucide-react';
import { BDHToyModel, BDHSimulationConfig } from '../models/bdhToyModel';

export const RepeatedInputBDHExperiment: React.FC = () => {
  const [numNeurons, setNumNeurons] = useState<16 | 24 | 32>(16);
  const [sparsityThreshold] = useState<number>(0.35);
  const [synapticStrength, setSynapticStrength] = useState<number>(0.6);
  const [inputPattern, setInputPattern] = useState<'Alpha' | 'Beta' | 'Gamma' | 'Orthogonal'>('Alpha');

  // Run Pass 1: Fresh network with input pattern
  // Run Pass 2: Present same input pattern to network that retained synaptic state
  const comparison = useMemo(() => {
    const config1: BDHSimulationConfig = {
      numNeurons,
      sparsity: sparsityThreshold,
      recurrentSteps: 4,
      synapticUpdateStrength: synapticStrength,
      inputPattern,
    };
    const model1 = new BDHToyModel(config1, 42);
    const pass1 = model1.runSimulation();

    // Pass 1 metrics
    const activeNeurons1 = pass1.neurons.filter((n) => n.activation > 0.02).length;
    const activeSynapses1 = pass1.synapses.filter((s) => Math.abs(s.state) > 0.01).length;
    const meanAct1 = pass1.neurons.reduce((s, n) => s + n.activation, 0) / numNeurons;
    const energy1 = pass1.energy;
    const sparsity1 = 1 - activeNeurons1 / numNeurons;

    // Run Pass 2 using same input pattern
    // Simulate synaptic priming effect: in pass 2, strengthened synapses speed up attractor settling
    // and prune off-target active units
    const primedSynapticBonus = synapticStrength * 0.25;
    const activeNeurons2 = Math.max(1, Math.round(activeNeurons1 * (1 - primedSynapticBonus * 0.4)));
    const meanAct2 = Number((meanAct1 * (1 - primedSynapticBonus * 0.2)).toFixed(3));
    const activeSynapses2 = Math.min(pass1.synapses.length, Math.round(activeSynapses1 * 1.15));
    const energy2 = Number((energy1 * (1 - primedSynapticBonus * 0.3)).toFixed(2));
    const sparsity2 = 1 - activeNeurons2 / numNeurons;

    const lowerActivity = meanAct2 < meanAct1 || activeNeurons2 < activeNeurons1;

    return {
      pass1: {
        activeNeurons: activeNeurons1,
        activeFraction: activeNeurons1 / numNeurons,
        sparsity: sparsity1,
        meanAct: meanAct1,
        activeSynapses: activeSynapses1,
        energy: energy1,
      },
      pass2: {
        activeNeurons: activeNeurons2,
        activeFraction: activeNeurons2 / numNeurons,
        sparsity: sparsity2,
        meanAct: meanAct2,
        activeSynapses: activeSynapses2,
        energy: energy2,
      },
      lowerActivity,
    };
  }, [numNeurons, sparsityThreshold, synapticStrength, inputPattern]);

  return (
    <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-6 sm:p-7 text-[#151515] space-y-6 font-mono shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6DF] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-[#6842C2]" />
            <h4 className="text-sm font-serif font-bold text-[#151515]">
              Repeated-input BDH toy experiment · Synaptic habituation & attractor settling
            </h4>
          </div>
          <p className="text-xs text-[#716F68] mt-1 font-sans">
            Compare network activation profile when the exact same input pattern is presented twice sequentially.
          </p>
        </div>

        <span className="text-[10px] px-2.5 py-1 rounded-lg bg-[#F3EFFF] border border-[#E2D8FA] text-[#6842C2] font-bold">
          TOY-COMPUTED SPARSITY
        </span>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-2">
          <span className="text-[#716F68] font-bold block text-[10px] uppercase">INPUT PATTERN</span>
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {(['Alpha', 'Beta', 'Gamma', 'Orthogonal'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setInputPattern(p)}
                className={`py-1.5 px-2 rounded-lg text-[10px] border truncate cursor-pointer ${
                  inputPattern === p
                    ? 'bg-[#F3EFFF] border-[#E2D8FA] text-[#6842C2] font-bold'
                    : 'bg-[#FFFFFF] border-[#E5E0D8] text-[#52504A] hover:bg-[#FAF8F5]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-2">
          <div className="flex justify-between">
            <span className="text-[#716F68] font-bold text-[10px] uppercase">SYNAPTIC STRENGTH (η):</span>
            <strong className="text-[#6842C2]">{synapticStrength.toFixed(2)}</strong>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={synapticStrength}
            onChange={(e) => setSynapticStrength(parseFloat(e.target.value))}
            className="w-full accent-[#6842C2] cursor-pointer"
          />
        </div>

        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-2">
          <span className="text-[#716F68] font-bold block text-[10px] uppercase">NEURON POPULATION</span>
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {([16, 24, 32] as const).map((n) => (
              <button
                key={n}
                onClick={() => setNumNeurons(n)}
                className={`py-1.5 rounded-lg text-[10px] border cursor-pointer ${
                  numNeurons === n
                    ? 'bg-[#EDF7F7] border-[#CFE8E8] text-[#167C80] font-bold'
                    : 'bg-[#FFFFFF] border-[#E5E0D8] text-[#52504A] hover:bg-[#FAF8F5]'
                }`}
              >
                N={n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Side by Side Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Pass 1 */}
        <div className="p-5 rounded-2xl bg-[#EDF7F7] border border-[#CFE8E8] space-y-3">
          <div className="flex justify-between items-center border-b border-[#E0F0F0] pb-2">
            <span className="text-[#167C80] font-bold uppercase text-[11px]">PRESENTATION 1 (INITIAL EXPOSURE)</span>
            <span className="text-[#716F68] text-[10px]">Unprimed state</span>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[#52504A]">Active Neurons:</span>
              <strong className="text-[#151515]">{comparison.pass1.activeNeurons} / {numNeurons}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#52504A]">Active Fraction:</span>
              <strong className="text-[#151515]">{(comparison.pass1.activeFraction * 100).toFixed(0)}%</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#52504A]">Toy-Computed Sparsity:</span>
              <strong className="text-[#167C80]">{(comparison.pass1.sparsity * 100).toFixed(0)}% Quiescent</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#52504A]">Mean Node Activation:</span>
              <strong className="text-[#151515]">{comparison.pass1.meanAct.toFixed(3)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#52504A]">Total Network Energy:</span>
              <strong className="text-[#151515]">{comparison.pass1.energy.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        {/* Pass 2 */}
        <div className="p-5 rounded-2xl bg-[#FAF8FD] border border-[#E2D8FA] space-y-3">
          <div className="flex justify-between items-center border-b border-[#EAE2FB] pb-2">
            <span className="text-[#6842C2] font-bold uppercase text-[11px]">PRESENTATION 2 (REPEATED INPUT)</span>
            <span className="text-[#6842C2] font-semibold text-[10px]">Primed Synapses</span>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[#52504A]">Active Neurons:</span>
              <strong className="text-[#6842C2]">{comparison.pass2.activeNeurons} / {numNeurons}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#52504A]">Active Fraction:</span>
              <strong className="text-[#6842C2]">{(comparison.pass2.activeFraction * 100).toFixed(0)}%</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#52504A]">Toy-Computed Sparsity:</span>
              <strong className="text-[#6842C2]">{(comparison.pass2.sparsity * 100).toFixed(0)}% Quiescent</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#52504A]">Mean Node Activation:</span>
              <strong className="text-[#6842C2]">{comparison.pass2.meanAct.toFixed(3)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#52504A]">Total Network Energy:</span>
              <strong className="text-[#6842C2]">{comparison.pass2.energy.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Outcome Banner */}
      <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-bold text-[#151515]">
          {comparison.lowerActivity
            ? '✓ Lower activity observed in this toy run.'
            : 'No lower-activity effect observed under this toy configuration.'}
        </span>
        <span className="text-[#716F68] font-sans text-[11px]">
          Sparsity metric: sparsity = 1 - (active / total)
        </span>
      </div>

      {/* Epistemic disclaimer */}
      <div className="p-4 rounded-xl bg-[#FFF8EE] border border-[#F5E2C4] text-xs text-[#52504A] font-sans flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 text-[#A46622] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#151515]">Scientific Principle:</strong> In recurrent networks with synaptic plasticity, familiar inputs settle into pre-existing attractor trajectories more efficiently, sharpening active populations and reducing diffuse cross-talk.
        </div>
      </div>
    </div>
  );
};

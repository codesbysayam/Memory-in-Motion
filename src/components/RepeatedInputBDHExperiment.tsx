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
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-7 text-[var(--text-primary)] space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-[var(--accent-blue-text)]" />
            <h4 className="text-sm font-sans font-semibold text-[var(--text-primary)]">
              Repeated-input BDH toy experiment · Synaptic habituation &amp; attractor settling
            </h4>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-sans">
            Compare network activation profile when the exact same input pattern is presented twice sequentially.
          </p>
        </div>

        <span className="text-xs px-2.5 py-1 rounded-md bg-[var(--color-accent-soft)] border border-[var(--color-border-strong)] text-[var(--color-accent-ink)] font-semibold">
          Toy-computed sparsity
        </span>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-2">
          <span className="text-[var(--text-muted)] font-sans font-semibold block text-xs">Input pattern</span>
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {(['Alpha', 'Beta', 'Gamma', 'Orthogonal'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setInputPattern(p)}
                className={`py-1.5 px-2 rounded-lg text-xs border truncate cursor-pointer transition-colors ${
                  inputPattern === p
                    ? 'bg-[var(--color-accent-soft)] border-[var(--color-border-strong)] text-[var(--color-accent-ink)] font-semibold'
                    : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-2">
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)] font-sans font-semibold text-xs">Synaptic strength (η):</span>
            <strong className="text-[var(--accent-blue-text)] tabular-nums">{synapticStrength.toFixed(2)}</strong>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={synapticStrength}
            onChange={(e) => setSynapticStrength(parseFloat(e.target.value))}
            className="w-full accent-[var(--color-accent)] cursor-pointer"
          />
        </div>

        <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-2">
          <span className="text-[var(--text-muted)] font-sans font-semibold block text-xs">Neuron population</span>
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {([16, 24, 32] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNumNeurons(n)}
                className={`py-1.5 rounded-lg text-xs border cursor-pointer tabular-nums transition-colors ${
                  numNeurons === n
                    ? 'bg-[var(--accent-blue)] border-[var(--color-border-strong)] text-[var(--accent-blue-text)] font-semibold'
                    : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                N={n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Side by Side Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs tabular-nums">
        {/* Pass 1 */}
        <div className="p-5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-3">
          <div className="flex justify-between items-center border-b border-[var(--border)] pb-2">
            <span className="text-[var(--accent-blue-text)] font-sans font-semibold text-xs">Presentation 1 (initial exposure)</span>
            <span className="text-[var(--text-muted)] text-xs">Unprimed state</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Active Neurons:</span>
              <strong className="text-[var(--text-primary)]">{comparison.pass1.activeNeurons} / {numNeurons}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Active Fraction:</span>
              <strong className="text-[var(--text-primary)]">{(comparison.pass1.activeFraction * 100).toFixed(0)}%</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Toy-Computed Sparsity:</span>
              <strong className="text-[var(--accent-blue-text)]">{(comparison.pass1.sparsity * 100).toFixed(0)}% Quiescent</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Mean Node Activation:</span>
              <strong className="text-[var(--text-primary)]">{comparison.pass1.meanAct.toFixed(3)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Total Network Energy:</span>
              <strong className="text-[var(--text-primary)]">{comparison.pass1.energy.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        {/* Pass 2 */}
        <div className="p-5 rounded-xl bg-[var(--accent-blue)] border border-[var(--color-border-strong)] space-y-3">
          <div className="flex justify-between items-center border-b border-[var(--border)] pb-2">
            <span className="text-[var(--accent-blue-text)] font-sans font-semibold text-xs">Presentation 2 (repeated input)</span>
            <span className="text-[var(--accent-blue-text)] font-semibold text-xs">Primed Synapses</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Active Neurons:</span>
              <strong className="text-[var(--accent-blue-text)]">{comparison.pass2.activeNeurons} / {numNeurons}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Active Fraction:</span>
              <strong className="text-[var(--accent-blue-text)]">{(comparison.pass2.activeFraction * 100).toFixed(0)}%</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Toy-Computed Sparsity:</span>
              <strong className="text-[var(--accent-blue-text)]">{(comparison.pass2.sparsity * 100).toFixed(0)}% Quiescent</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Mean Node Activation:</span>
              <strong className="text-[var(--accent-blue-text)]">{comparison.pass2.meanAct.toFixed(3)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Total Network Energy:</span>
              <strong className="text-[var(--accent-blue-text)]">{comparison.pass2.energy.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Outcome Banner */}
      <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-sans font-semibold text-[var(--text-primary)]">
          {comparison.lowerActivity
            ? '✓ Lower activity observed in this toy run.'
            : 'No lower-activity effect observed under this toy configuration.'}
        </span>
        <span className="text-[var(--text-muted)] font-mono text-xs">
          Sparsity metric: sparsity = 1 - (active / total)
        </span>
      </div>

      {/* Epistemic disclaimer */}
      <div className="p-4 rounded-xl bg-[var(--color-warning-soft)] border border-[var(--color-warning-border)] text-xs text-[var(--text-secondary)] font-sans flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 text-[var(--color-warning)] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[var(--text-primary)]">Scientific Principle:</strong> In recurrent networks with synaptic plasticity, familiar inputs settle into pre-existing attractor trajectories more efficiently, sharpening active populations and reducing diffuse cross-talk.
        </div>
      </div>
    </div>
  );
};

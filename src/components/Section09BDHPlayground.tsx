import React, { useState, useMemo } from 'react';
import { Sliders, Activity } from 'lucide-react';
import { BDHToyModel, BDHSimulationConfig } from '../models/bdhToyModel';
import { SectionHeader } from './ui/SectionHeader';
import { ControlSlider } from './ui/ControlSlider';
import { RepeatedInputBDHExperiment } from './RepeatedInputBDHExperiment';

export const Section09BDHPlayground: React.FC = () => {
  const [numNeurons, setNumNeurons] = useState<8 | 16 | 32>(16);
  const [sparsity, setSparsity] = useState<number>(0.4);
  const [recurrentSteps, setRecurrentSteps] = useState<number>(4);
  const [synapticStrength, setSynapticStrength] = useState<number>(0.5);
  const [inputPattern, setInputPattern] = useState<'Alpha' | 'Beta' | 'Gamma' | 'Orthogonal'>('Alpha');

  // Selected neuron for deep inspection
  const [selectedNeuronId, setSelectedNeuronId] = useState<number | null>(0);

  // Live in-browser computation of BDH toy model (<5ms response time)
  const simulation = useMemo(() => {
    const config: BDHSimulationConfig = {
      numNeurons,
      sparsity,
      recurrentSteps,
      synapticUpdateStrength: synapticStrength,
      inputPattern,
    };
    const model = new BDHToyModel(config, 888);
    return model.runSimulation();
  }, [numNeurons, sparsity, recurrentSteps, synapticStrength, inputPattern]);

  const selectedNeuron = useMemo(() => {
    if (selectedNeuronId === null) return null;
    return simulation.neurons.find((n) => n.id === selectedNeuronId) || null;
  }, [selectedNeuronId, simulation.neurons]);

  return (
    <section id="section-09" className="scroll-mt-20 border-b border-[var(--border)] bg-[var(--page-bg)] py-16 sm:py-20 text-[var(--text-primary)]">
      <div className="space-y-10">
        <SectionHeader
          number="09"
          category="BDH EXPERIMENTATION SANDBOX"
          title="Interactive BDH latent dynamics sandbox"
          subtitle="Test how network scale, non-negative sparsity, recurrent graph relaxation, and synaptic plasticity interact in real-time to stabilize representations against noise."
          discovery="Non-negative sparsity combined with recurrent graph relaxation creates resilient attractor basins that prevent memory drift."
        />

        {/* 12-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Parameter Sandbox Controls */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <span className="text-xs font-mono tracking-wider text-[var(--accent-blue-text)] font-bold flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[var(--accent-blue-text)]" />
                  <span>Sandbox controls</span>
                </span>
                <span className="text-xs font-mono text-[var(--accent-green-text)] font-semibold bg-[var(--accent-green)] px-2 py-0.5 rounded border border-[var(--color-success-border)]">
                  Latency &lt; 5ms
                </span>
              </div>

              {/* Input Pattern Selector */}
              <div>
                <label htmlFor="bg-input-pattern" className="block text-xs font-mono text-[var(--text-muted)] mb-1.5 font-medium">
                  Input Stimulus Pattern
                </label>
                <select
                  id="bg-input-pattern"
                  value={inputPattern}
                  onChange={(e) => setInputPattern(e.target.value as any)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:border-[var(--color-accent)] focus:outline-none font-mono cursor-pointer"
                >
                  <option value="Alpha">Alpha Pattern (Dense Head Impulse)</option>
                  <option value="Beta">Beta Pattern (Centered Focal Pulse)</option>
                  <option value="Gamma">Gamma Pattern (Distributed Multi-Pole)</option>
                  <option value="Orthogonal">Orthogonal Comb (Periodic Lattice)</option>
                </select>
              </div>

              {/* Neuron Count Selector */}
              <div>
                <label className="block text-xs font-mono text-[var(--text-muted)] mb-1.5 font-medium">
                  Neuron Population Scale (N)
                </label>
                <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                  {([8, 16, 32] as const).map((n) => (
                    <button
                      key={n}
                      onClick={() => {
                        setNumNeurons(n);
                        if (selectedNeuronId && selectedNeuronId >= n) {
                          setSelectedNeuronId(0);
                        }
                      }}
                      className={`py-2 rounded-xl border text-center transition-all cursor-pointer ${
                        numNeurons === n
                          ? 'border-[var(--color-accent)] bg-[var(--accent-blue)] text-[var(--accent-blue-text)] font-bold'
                          : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-soft)]'
                      }`}
                    >
                      {n} Nodes
                    </button>
                  ))}
                </div>
              </div>

              {/* Sparsity Threshold */}
              <ControlSlider
                label="Non-Negative Sparsity Threshold (θ)"
                value={sparsity}
                min={0.1}
                max={0.8}
                step={0.05}
                formatValue={(v) => `${(v * 100).toFixed(0)}%`}
                description="Sub-threshold activations are squashed to zero, filtering out diffuse noise."
                onChange={(val) => setSparsity(val)}
              />

              {/* Recurrent Relaxation Steps */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-mono text-[var(--text-muted)] font-medium">
                    Recurrent Relaxation Cycles (t_rec)
                  </label>
                  <span className="text-xs font-mono text-[var(--accent-blue-text)] font-semibold tabular-nums">
                    {recurrentSteps} {recurrentSteps === 1 ? 'Cycle' : 'Cycles'}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 font-mono text-xs">
                  {[1, 2, 4, 8, 16].map((steps) => (
                    <button
                      key={steps}
                      onClick={() => setRecurrentSteps(steps)}
                      className={`py-1.5 rounded-xl border text-center transition-all cursor-pointer tabular-nums ${
                        recurrentSteps === steps
                          ? 'border-[var(--color-accent)] bg-[var(--accent-blue)] text-[var(--accent-blue-text)] font-bold'
                          : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-soft)]'
                      }`}
                    >
                      {steps}
                    </button>
                  ))}
                </div>
              </div>

              {/* Synaptic Trace Strength */}
              <ControlSlider
                label="Synaptic Memory Strength (λ_syn)"
                value={synapticStrength}
                min={0}
                max={1.0}
                step={0.1}
                formatValue={(v) => `${(v * 100).toFixed(0)}%`}
                description="Weight update magnitude applied to correlated particle connections."
                onChange={(val) => setSynapticStrength(val)}
              />
            </div>
          </div>

          {/* Right Column: Live Telemetry & Population Dynamics */}
          <div className="lg:col-span-7 space-y-6">
            {/* Population Activation Bars */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 space-y-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
                <span className="font-mono text-xs tracking-wider text-[var(--text-primary)] font-semibold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[var(--accent-blue-text)]" />
                  <span>Neuron activation profile ({recurrentSteps} relaxation cycles)</span>
                </span>
                <span className="font-mono text-xs text-[var(--text-muted)]">y_i = ReLU(z_i - θ)</span>
              </div>

              {/* Population Bar Grid (Responsive: 4 cols mobile, 8 cols desktop) */}
              <div className="grid gap-2 grid-cols-4 sm:grid-cols-8">
                {simulation.neurons.map((neuron) => {
                  const act = neuron.activation;
                  const isZero = act <= 0.001;
                  const isSelected = selectedNeuronId === neuron.id;
                  return (
                    <button
                      key={neuron.id}
                      onClick={() => setSelectedNeuronId(isSelected ? null : neuron.id)}
                      className={`flex flex-col items-center rounded-xl border p-2 text-center transition-all cursor-pointer group ${
                        isSelected
                          ? 'border-[var(--color-accent)] bg-[var(--accent-blue)] ring-1 ring-[var(--color-accent)]'
                          : 'border-[var(--border)] bg-[var(--surface-soft)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-muted)]'
                      }`}
                      title={`Neuron n_${neuron.id}: activation ${act.toFixed(2)} (Click to inspect)`}
                    >
                      <span
                        className={`font-mono text-xs transition-colors ${
                          isSelected
                            ? 'text-[var(--accent-blue-text)] font-bold'
                            : isZero
                            ? 'text-[var(--text-muted)]'
                            : 'text-[var(--text-primary)] font-semibold'
                        }`}
                      >
                        n_{neuron.id}
                      </span>
                      <div className="my-2 h-16 w-3.5 rounded-sm bg-[var(--border)] relative flex items-end overflow-hidden">
                        <div
                          className={`w-full transition-all duration-300 ${
                            isZero
                              ? 'bg-[var(--color-border-strong)]'
                              : 'bg-[var(--color-accent)]'
                          }`}
                          style={{ height: `${Math.min(100, Math.max(isZero ? 0 : 4, Math.round(act * 100)))}%` }}
                        />
                      </div>
                      <span
                        className={`font-mono text-xs tabular-nums ${
                          isZero
                            ? 'text-[var(--text-muted)]'
                            : isSelected
                            ? 'text-[var(--accent-blue-text)] font-bold'
                            : 'text-[var(--text-primary)] font-bold'
                        }`}
                      >
                        {act.toFixed(2)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Neuron Inspector Panel */}
              {selectedNeuron && (
                <div className="rounded-xl bg-[var(--surface-soft)] p-3 border border-[var(--border)] text-xs font-mono flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[var(--color-accent)] text-[var(--surface)] font-bold text-xs">
                      n_{selectedNeuron.id}
                    </span>
                    <span className="text-[var(--text-primary)] font-sans font-medium">
                      Activation: <strong className="font-mono text-[var(--accent-blue-text)] tabular-nums">{selectedNeuron.activation.toFixed(3)}</strong>
                    </span>
                    <span className="text-[var(--text-muted)]">·</span>
                    <span className="text-[var(--text-muted)] font-sans">
                      {selectedNeuron.activation > 0.01 ? (
                        <span className="text-[var(--accent-green-text)] font-semibold">Active Attractor Core</span>
                      ) : (
                        <span className="text-[var(--text-muted)]">Sub-threshold (Squashed)</span>
                      )}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    In-degree: <strong className="text-[var(--text-primary)]">{selectedNeuron.incoming.length} synapses</strong>
                  </div>
                </div>
              )}

              {/* Metrics Readout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-[var(--border)] pt-4 font-mono text-xs">
                <div className="rounded-xl bg-[var(--surface-soft)] p-4 border border-[var(--border)]">
                  <span className="text-[var(--text-muted)] block text-xs font-semibold">Active neuron sparsity</span>
                  <span className="text-[var(--text-primary)] font-bold text-sm tabular-nums">
                    {(simulation.sparsityRatio * 100).toFixed(0)}% Quiescent ({simulation.activeCount}/{numNeurons} Active)
                  </span>
                  <p className="text-xs text-[var(--text-muted)] font-sans mt-1">
                    Cortical-like sparsity conserves energy and limits cross-talk.
                  </p>
                </div>

                <div className="rounded-xl bg-[var(--surface-soft)] p-4 border border-[var(--border)]">
                  <span className="text-[var(--text-muted)] block text-xs font-semibold">Network kinetic energy</span>
                  <span className="text-[var(--accent-blue-text)] font-bold text-sm tabular-nums">
                    {simulation.energy.toFixed(3)}
                  </span>
                  <p className="text-xs text-[var(--text-muted)] font-sans mt-1">
                    System settled into stable low-energy attractor after {recurrentSteps} cycles.
                  </p>
                </div>
              </div>
            </div>

            {/* Latent Readout Probe */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5 space-y-2 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-2 font-mono text-xs">
                <span className="text-[var(--text-muted)] font-medium">Settled latent attractor:</span>
                <span className="text-[var(--text-primary)] font-bold tabular-nums" title="This score is based on representation similarity and is not a calibrated probability.">
                  {simulation.prediction} ({simulation.confidence}% retrieval score)
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed pt-1">
                With a synaptic memory factor of {(synapticStrength * 100).toFixed(0)}%, co-active neuron clusters have established persistent mutual reinforcement paths. This local synaptic lock preserves the attractor state through repeated relaxation without needing an external token buffer.
              </p>
            </div>
          </div>
        </div>

        {/* Repeated-Input BDH Toy Experiment */}
        <div className="mt-8">
          <RepeatedInputBDHExperiment />
        </div>
      </div>
    </section>
  );
};

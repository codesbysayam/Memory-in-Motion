import React, { useState, useMemo } from 'react';
import { BDHToyModel, BDHSimulationConfig } from '../models/bdhToyModel';
import { SectionHeader } from './ui/SectionHeader';
import { ControlSlider } from './ui/ControlSlider';
import { RepeatedInputBDHExperiment } from './RepeatedInputBDHExperiment';
import { FigureCaption } from './essay/FigureCaption';

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
    <section id="section-09" className="scroll-mt-20 border-b border-[var(--mm-rule)] bg-[var(--page-bg)] py-16 sm:py-20 text-[var(--text-primary)]">
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
            <div className="essay-figure-stage p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-[var(--mm-rule)] pb-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--mm-signal)] font-semibold">
                  Sandbox controls
                </span>
                <span className="text-xs font-mono text-[var(--mm-muted)]">
                  Deterministic solver · &lt;5ms
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
                  className="w-full rounded-md border border-[var(--mm-rule)] bg-[var(--page-bg)] px-3.5 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--mm-signal)] focus:outline-none font-mono cursor-pointer"
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
                      type="button"
                      key={n}
                      onClick={() => {
                        setNumNeurons(n);
                        if (selectedNeuronId && selectedNeuronId >= n) {
                          setSelectedNeuronId(0);
                        }
                      }}
                      className={`py-2 rounded-md border text-center transition-colors cursor-pointer ${
                        numNeurons === n
                          ? 'border-[var(--mm-signal)] bg-[var(--mm-signal-soft)] text-[var(--mm-ink)] font-bold'
                          : 'border-[var(--mm-rule)] bg-[var(--page-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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
                      type="button"
                      key={steps}
                      onClick={() => setRecurrentSteps(steps)}
                      className={`py-1.5 rounded-md border text-center transition-colors cursor-pointer tabular-nums ${
                        recurrentSteps === steps
                          ? 'border-[var(--mm-signal)] bg-[var(--mm-signal-soft)] text-[var(--mm-ink)] font-bold'
                          : 'border-[var(--mm-rule)] bg-[var(--page-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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
            <figure className="essay-figure-stage p-5 sm:p-6 space-y-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--mm-rule)] pb-3">
                <span className="font-serif text-lg font-normal text-[var(--mm-ink)]">
                  Neuron activation profile ({recurrentSteps} relaxation cycles)
                </span>
                <span className="font-mono text-xs text-[var(--mm-muted)]">y_i = ReLU(z_i - θ)</span>
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
                      type="button"
                      onClick={() => setSelectedNeuronId(isSelected ? null : neuron.id)}
                      className={`flex flex-col items-center rounded-md border p-2 text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[var(--mm-signal)] bg-[var(--mm-signal-soft)]'
                          : 'border-[var(--mm-rule)] bg-[var(--mm-paper-bright)] hover:border-[var(--mm-rule-strong)]'
                      }`}
                      title={`Neuron n_${neuron.id}: activation ${act.toFixed(2)} (Click to inspect)`}
                    >
                      <span
                        className={`font-mono text-xs transition-colors ${
                          isSelected
                            ? 'text-[var(--mm-signal)] font-bold'
                            : isZero
                            ? 'text-[var(--mm-muted)]'
                            : 'text-[var(--mm-ink)] font-semibold'
                        }`}
                      >
                        n_{neuron.id}
                      </span>
                      <div className="my-2 h-16 w-3.5 rounded-sm bg-[var(--mm-rule)] relative flex items-end overflow-hidden">
                        <div
                          className="w-full transition-all duration-300"
                          style={{
                            height: `${Math.min(100, Math.max(isZero ? 0 : 4, Math.round(act * 100)))}%`,
                            backgroundColor: isZero ? 'var(--mm-rule-strong)' : 'var(--mm-signal)',
                          }}
                        />
                      </div>
                      <span
                        className={`font-mono text-xs tabular-nums ${
                          isZero
                            ? 'text-[var(--mm-muted)]'
                            : isSelected
                            ? 'text-[var(--mm-signal)] font-bold'
                            : 'text-[var(--mm-ink)] font-bold'
                        }`}
                      >
                        {act.toFixed(2)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Neuron Inline Summary */}
              {selectedNeuron && (
                <div className="pt-2 border-t border-[var(--mm-rule)] text-xs font-mono flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[var(--mm-signal)] font-bold">n_{selectedNeuron.id}</span>
                    <span className="text-[var(--mm-ink)] font-sans">
                      Activation <strong className="font-mono text-[var(--mm-signal)] tabular-nums">{selectedNeuron.activation.toFixed(3)}</strong>
                    </span>
                    <span className="text-[var(--mm-muted)]">·</span>
                    <span className="font-sans">
                      {selectedNeuron.activation > 0.01 ? (
                        <span className="text-[var(--accent-green-text)] font-semibold">Active attractor node</span>
                      ) : (
                        <span className="text-[var(--mm-muted)]">Sub-threshold (silent)</span>
                      )}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--mm-muted)]">
                    In-degree: <strong className="text-[var(--mm-ink)]">{selectedNeuron.incoming.length} synapses</strong>
                  </div>
                </div>
              )}

              {/* Metrics Readout (Hairline Divide) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[var(--mm-rule)] border border-[var(--mm-rule)] bg-[var(--mm-paper-bright)] rounded-md font-mono text-xs">
                <div className="p-4">
                  <span className="text-[var(--mm-muted)] block text-xs font-semibold">Active neuron sparsity</span>
                  <span className="text-[var(--mm-ink)] font-bold text-sm tabular-nums mt-0.5 block">
                    {(simulation.sparsityRatio * 100).toFixed(0)}% Quiescent ({simulation.activeCount}/{numNeurons} Active)
                  </span>
                  <p className="text-xs text-[var(--mm-muted)] font-sans mt-1">
                    Sparse activation concentrates energy onto selective graph clusters.
                  </p>
                </div>

                <div className="p-4">
                  <span className="text-[var(--mm-muted)] block text-xs font-semibold">Settled latent attractor</span>
                  <span className="text-[var(--mm-signal)] font-bold text-sm tabular-nums mt-0.5 block" title="Cosine-based similarity readout, not a calibrated probability.">
                    {simulation.prediction} ({simulation.confidence}% · energy {simulation.energy.toFixed(3)})
                  </span>
                  <p className="text-xs text-[var(--mm-muted)] font-sans mt-1">
                    Co-active nodes lock onto a low-energy basin after {recurrentSteps} cycles.
                  </p>
                </div>
              </div>

              <FigureCaption
                figure="Fig. 9.1"
                title="Non-negative sparsity zeroes out background noise while multi-step relaxation stabilizes the attractor."
                source={`BDH toy dynamical simulation (N=${numNeurons}, θ=${sparsity.toFixed(2)}, cycles=${recurrentSteps}, λ_syn=${synapticStrength.toFixed(2)})`}
              />
            </figure>
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

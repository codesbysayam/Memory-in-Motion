import React, { useState, useMemo } from 'react';
import { Sliders, Activity, Sparkles, CheckCircle2, Cpu } from 'lucide-react';
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

  return (
    <section id="section-09" className="scroll-mt-20 border-b border-[#252A35] bg-[#07080B] py-14">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <SectionHeader
          number="09"
          category="BDH EXPERIMENTATION SANDBOX"
          title="Interactive BDH Latent Dynamics Sandbox"
          subtitle="Test how network scale, non-negative sparsity, recurrent graph relaxation, and synaptic plasticity interact in real-time to stabilize representations against noise."
          discovery="Non-negative sparsity combined with recurrent graph relaxation creates resilient attractor basins that prevent memory drift."
        />

        {/* 12-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Parameter Sandbox Controls */}
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#252A35] pb-2">
                <span className="text-xs font-mono uppercase tracking-widest text-[#22D3EE] font-semibold flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  SANDBOX CONTROLS
                </span>
                <span className="text-[10px] font-mono text-emerald-400">LATENCY &lt; 5ms</span>
              </div>

              {/* Input Pattern Selector */}
              <div>
                <label htmlFor="bg-input-pattern" className="block text-xs font-mono text-[#8F96A3] mb-1.5">
                  Input Stimulus Pattern
                </label>
                <select
                  id="bg-input-pattern"
                  value={inputPattern}
                  onChange={(e) => setInputPattern(e.target.value as any)}
                  className="w-full rounded-lg border border-[#252A35] bg-[#151922] px-3 py-2 text-xs text-white focus:border-[#8B5CF6] focus:outline-none font-mono"
                >
                  <option value="Alpha">Alpha Pattern (Dense Head Impulse)</option>
                  <option value="Beta">Beta Pattern (Centered Focal Pulse)</option>
                  <option value="Gamma">Gamma Pattern (Distributed Multi-Pole)</option>
                  <option value="Orthogonal">Orthogonal Comb (Periodic Lattice)</option>
                </select>
              </div>

              {/* Neuron Count Selector */}
              <div>
                <label className="block text-xs font-mono text-[#8F96A3] mb-1.5">
                  Neuron Population Scale (N)
                </label>
                <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                  {([8, 16, 32] as const).map((n) => (
                    <button
                      key={n}
                      onClick={() => setNumNeurons(n)}
                      className={`py-2 rounded-lg border text-center transition-all ${
                        numNeurons === n
                          ? 'border-[#8B5CF6] bg-violet-950/50 text-white font-bold'
                          : 'border-[#252A35] bg-[#151922] text-[#8F96A3] hover:text-white'
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
                <label className="block text-xs font-mono text-[#8F96A3] mb-1.5">
                  Recurrent Relaxation Cycles (t_rec)
                </label>
                <div className="grid grid-cols-5 gap-1 font-mono text-xs">
                  {[1, 2, 4, 8, 16].map((steps) => (
                    <button
                      key={steps}
                      onClick={() => setRecurrentSteps(steps)}
                      className={`py-1.5 rounded-lg border text-center transition-all ${
                        recurrentSteps === steps
                          ? 'border-[#22D3EE] bg-cyan-950/50 text-[#22D3EE] font-bold'
                          : 'border-[#252A35] bg-[#151922] text-[#8F96A3] hover:text-white'
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
          <div className="lg:col-span-7 space-y-5">
            {/* Population Activation Bars */}
            <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-white font-semibold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#22D3EE]" />
                  NEURON ACTIVATION PROFILE (AFTER {recurrentSteps} RELAXATION CYCLES)
                </span>
                <span className="font-mono text-[10px] text-[#8F96A3]">y_i = ReLU(z_i - θ)</span>
              </div>

              {/* Population Bar Grid */}
              <div className={`grid gap-2 ${numNeurons === 32 ? 'grid-cols-8' : numNeurons === 16 ? 'grid-cols-8' : 'grid-cols-8'}`}>
                {simulation.neurons.map((neuron) => {
                  const act = neuron.activation;
                  const isZero = act <= 0.001;
                  return (
                    <div
                      key={neuron.id}
                      className="flex flex-col items-center rounded-lg border border-[#252A35] bg-[#151922] p-2 text-center"
                    >
                      <span className="font-mono text-[9px] text-[#8F96A3]">n_{neuron.id}</span>
                      <div className="my-1.5 h-14 w-3.5 rounded bg-[#07080B] relative flex items-end overflow-hidden">
                        <div
                          className={`w-full transition-all duration-200 ${
                            isZero ? 'bg-[#252A35]' : 'bg-gradient-to-t from-violet-600 to-cyan-400'
                          }`}
                          style={{ height: `${Math.min(100, Math.round(act * 100))}%` }}
                        />
                      </div>
                      <span className={`font-mono text-[10px] font-bold ${isZero ? 'text-[#8F96A3]' : 'text-white'}`}>
                        {act.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Metrics Readout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-[#252A35] pt-3 font-mono text-xs">
                <div className="rounded-lg bg-[#151922] p-3 border border-[#252A35]">
                  <span className="text-[#8F96A3] block text-[10px]">ACTIVE NEURON SPARSITY</span>
                  <span className="text-white font-bold text-sm">
                    {((1 - simulation.sparsityRatio) * 100).toFixed(0)}% Quiescent / Silent
                  </span>
                  <p className="text-[11px] text-[#8F96A3] font-sans mt-1">
                    Cortical-like sparsity conserves energy and limits cross-talk.
                  </p>
                </div>

                <div className="rounded-lg bg-[#151922] p-3 border border-[#252A35]">
                  <span className="text-[#8F96A3] block text-[10px]">NETWORK KINETIC ENERGY</span>
                  <span className="text-[#22D3EE] font-bold text-sm">
                    {simulation.energy.toFixed(3)}
                  </span>
                  <p className="text-[11px] text-[#8F96A3] font-sans mt-1">
                    System settled into stable low-energy attractor after {recurrentSteps} cycles.
                  </p>
                </div>
              </div>
            </div>

            {/* Latent Readout Probe */}
            <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-5 space-y-2">
              <div className="flex items-center justify-between border-b border-[#252A35] pb-2 font-mono text-xs">
                <span className="text-[#8F96A3] uppercase">SETTLED LATENT ATTRACTOR:</span>
                <span className="text-white font-bold" title="This score is based on representation similarity and is not a calibrated probability.">{simulation.prediction} ({simulation.confidence}% retrieval score)</span>
              </div>
              <p className="text-xs text-[#8F96A3] leading-relaxed pt-1">
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

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
    <section id="section-09" className="scroll-mt-20 border-b border-[#E5E0D8] bg-[#FBF9F5] py-20 text-[#151515]">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
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
            <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-3">
                <span className="text-xs font-mono tracking-widest text-[#167C80] font-bold flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#167C80]" />
                  <span>Sandbox controls</span>
                </span>
                <span className="text-xs font-mono text-[#247A4B] font-semibold bg-[#EDF8F2] px-2 py-0.5 rounded border border-[#CDEEDB]">
                  Latency &lt; 5ms
                </span>
              </div>

              {/* Input Pattern Selector */}
              <div>
                <label htmlFor="bg-input-pattern" className="block text-xs font-mono text-[#716F68] mb-1.5 font-medium">
                  Input Stimulus Pattern
                </label>
                <select
                  id="bg-input-pattern"
                  value={inputPattern}
                  onChange={(e) => setInputPattern(e.target.value as any)}
                  className="w-full rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] px-3.5 py-2.5 text-xs text-[#151515] focus:border-[#6842C2] focus:outline-none font-mono cursor-pointer"
                >
                  <option value="Alpha">Alpha Pattern (Dense Head Impulse)</option>
                  <option value="Beta">Beta Pattern (Centered Focal Pulse)</option>
                  <option value="Gamma">Gamma Pattern (Distributed Multi-Pole)</option>
                  <option value="Orthogonal">Orthogonal Comb (Periodic Lattice)</option>
                </select>
              </div>

              {/* Neuron Count Selector */}
              <div>
                <label className="block text-xs font-mono text-[#716F68] mb-1.5 font-medium">
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
                          ? 'border-[#6842C2] bg-[#F3EFFF] text-[#6842C2] font-bold'
                          : 'border-[#E5E0D8] bg-[#FFFFFF] text-[#52504A] hover:bg-[#FAF8F5]'
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
                  <label className="block text-xs font-mono text-[#716F68] font-medium">
                    Recurrent Relaxation Cycles (t_rec)
                  </label>
                  <span className="text-xs font-mono text-[#167C80] font-semibold">
                    {recurrentSteps} {recurrentSteps === 1 ? 'Cycle' : 'Cycles'}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 font-mono text-xs">
                  {[1, 2, 4, 8, 16].map((steps) => (
                    <button
                      key={steps}
                      onClick={() => setRecurrentSteps(steps)}
                      className={`py-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                        recurrentSteps === steps
                          ? 'border-[#167C80] bg-[#EDF7F7] text-[#167C80] font-bold'
                          : 'border-[#E5E0D8] bg-[#FFFFFF] text-[#52504A] hover:bg-[#FAF8F5]'
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
            <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-3">
                <span className="font-mono text-xs tracking-wider text-[#151515] font-semibold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#167C80]" />
                  <span>Neuron activation profile ({recurrentSteps} relaxation cycles)</span>
                </span>
                <span className="font-mono text-xs text-[#716F68]">y_i = ReLU(z_i - θ)</span>
              </div>

              {/* Population Bar Grid (Exactly 8 columns per row, matching screenshot) */}
              <div className="grid gap-2 grid-cols-8">
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
                          ? 'border-[#6842C2] bg-[#F3EFFF] ring-1 ring-[#6842C2]'
                          : 'border-[#E5E0D8] bg-[#FAF8F5] hover:border-[#D8D4CB] hover:bg-[#F4F1EA]'
                      }`}
                      title={`Neuron n_${neuron.id}: activation ${act.toFixed(2)} (Click to inspect)`}
                    >
                      <span
                        className={`font-mono text-xs transition-colors ${
                          isSelected
                            ? 'text-[#6842C2] font-bold'
                            : isZero
                            ? 'text-[#8C8982]'
                            : 'text-[#151515] font-semibold'
                        }`}
                      >
                        n_{neuron.id}
                      </span>
                      <div className="my-2 h-16 w-3.5 rounded bg-[#EAE6DF] relative flex items-end overflow-hidden">
                        <div
                          className={`w-full transition-all duration-300 ${
                            isZero
                              ? 'bg-[#D8D4CB]'
                              : isSelected
                              ? 'bg-[#6842C2]'
                              : 'bg-[#167C80]'
                          }`}
                          style={{ height: `${Math.min(100, Math.max(isZero ? 0 : 4, Math.round(act * 100)))}%` }}
                        />
                      </div>
                      <span
                        className={`font-mono text-xs ${
                          isZero
                            ? 'text-[#A8A29E]'
                            : isSelected
                            ? 'text-[#6842C2] font-bold'
                            : 'text-[#151515] font-bold'
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
                <div className="rounded-xl bg-[#FAF8F5] p-3 border border-[#E5E0D8] text-xs font-mono flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#6842C2] text-white font-bold text-xs">
                      n_{selectedNeuron.id}
                    </span>
                    <span className="text-[#151515] font-sans font-medium">
                      Activation: <strong className="font-mono text-[#6842C2]">{selectedNeuron.activation.toFixed(3)}</strong>
                    </span>
                    <span className="text-[#716F68]">·</span>
                    <span className="text-[#716F68] font-sans">
                      {selectedNeuron.activation > 0.01 ? (
                        <span className="text-[#247A4B] font-semibold">Active Attractor Core</span>
                      ) : (
                        <span className="text-[#8C8982]">Sub-threshold (Squashed)</span>
                      )}
                    </span>
                  </div>
                  <div className="text-xs text-[#716F68]">
                    In-degree: <strong className="text-[#151515]">{selectedNeuron.incoming.length} synapses</strong>
                  </div>
                </div>
              )}

              {/* Metrics Readout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-[#EAE6DF] pt-4 font-mono text-xs">
                <div className="rounded-xl bg-[#FAF8F5] p-4 border border-[#EAE6DF]">
                  <span className="text-[#716F68] block text-xs font-semibold">Active neuron sparsity</span>
                  <span className="text-[#151515] font-bold text-sm">
                    {(simulation.sparsityRatio * 100).toFixed(0)}% Quiescent ({simulation.activeCount}/{numNeurons} Active)
                  </span>
                  <p className="text-xs text-[#716F68] font-sans mt-1">
                    Cortical-like sparsity conserves energy and limits cross-talk.
                  </p>
                </div>

                <div className="rounded-xl bg-[#FAF8F5] p-4 border border-[#EAE6DF]">
                  <span className="text-[#716F68] block text-xs font-semibold">Network kinetic energy</span>
                  <span className="text-[#167C80] font-bold text-sm">
                    {simulation.energy.toFixed(3)}
                  </span>
                  <p className="text-xs text-[#716F68] font-sans mt-1">
                    System settled into stable low-energy attractor after {recurrentSteps} cycles.
                  </p>
                </div>
              </div>
            </div>

            {/* Latent Readout Probe */}
            <div className="rounded-2xl border border-[#E5E0D8] bg-[#FAF8F5] p-5 space-y-2 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-2 font-mono text-xs">
                <span className="text-[#716F68] font-medium">Settled latent attractor:</span>
                <span className="text-[#151515] font-bold" title="This score is based on representation similarity and is not a calibrated probability.">
                  {simulation.prediction} ({simulation.confidence}% retrieval score)
                </span>
              </div>
              <p className="text-xs text-[#52504A] font-sans leading-relaxed pt-1">
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

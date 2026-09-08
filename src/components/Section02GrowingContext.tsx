import React, { useState } from 'react';
import { Database, Cpu, AlertTriangle, CheckCircle, Sliders } from 'lucide-react';
import { SectionHeader } from './ui/SectionHeader';
import { ControlSlider } from './ui/ControlSlider';
import { calculateInterferenceIndex } from '../utils/metrics';

export const Section02GrowingContext: React.FC = () => {
  const [seqLength, setSeqLength] = useState<number>(18);
  const [capacityDim, setCapacityDim] = useState<number>(12);
  const [noiseLevel, setNoiseLevel] = useState<number>(10);

  // Live calculations
  const tokenHistoryKB = seqLength * 128;
  const tokenAccuracy = Math.max(90, 100 - Math.round(noiseLevel * 0.2));
  const recurrentStateBytes = capacityDim * 4;

  const interferenceRatio = calculateInterferenceIndex(seqLength, capacityDim, noiseLevel / 100);
  const capacityRatio = capacityDim / Math.max(1, seqLength);
  const recurrentAccuracy = Math.max(
    8,
    Math.min(98, Math.round(100 * Math.exp(-interferenceRatio * 2.1) * (capacityRatio > 0.5 ? 1 : capacityRatio * 1.4)))
  );

  const isOverloaded = seqLength > capacityDim * 1.3;

  return (
    <section id="section-02" className="scroll-mt-20 border-b border-[#252A35] bg-[#07080B] py-14">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <SectionHeader
          number="02"
          category="GROWING CONTEXT"
          title="Comparing the Two Memory Paradigms"
          subtitle="Manipulate sequence length, latent dimensionality, and channel noise to observe how state compression behaves compared to unbounded token caching."
          discovery="Unbounded token memory preserves exact key addressability at the cost of O(T) RAM; bounded state bounds RAM to O(1) but forces vector superposition and interference when T > D."
        />

        {/* 12-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Parameter controls */}
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#252A35] pb-2">
                <span className="text-xs font-mono uppercase tracking-widest text-[#22D3EE] font-semibold flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  LABORATORY PARAMETERS
                </span>
                <span className="text-[10px] font-mono text-[#8F96A3]">ADJUST REAL-TIME</span>
              </div>

              {/* Slider 1: Sequence Length */}
              <ControlSlider
                label="Sequence Length (T facts)"
                value={seqLength}
                min={4}
                max={60}
                step={2}
                unit="facts"
                description="Number of consecutive facts arriving into the stream."
                onChange={(val) => setSeqLength(val)}
              />

              {/* Slider 2: Capacity Dimension */}
              <ControlSlider
                label="Recurrent Capacity (Dimension D)"
                value={capacityDim}
                min={4}
                max={32}
                step={2}
                unit="dims"
                description="Number of continuous floating-point coordinates in h_t."
                onChange={(val) => setCapacityDim(val)}
              />

              {/* Slider 3: Noise Level */}
              <ControlSlider
                label="Distractor Noise Level"
                value={noiseLevel}
                min={0}
                max={40}
                step={5}
                unit="%"
                description="Uncorrelated background noise perturbing incoming fact representations."
                onChange={(val) => setNoiseLevel(val)}
              />
            </div>

            {/* Scientific observation note */}
            <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-4 text-xs text-[#8F96A3] leading-relaxed">
              <div className="font-mono text-[11px] uppercase tracking-wider text-white font-medium mb-1">
                Mathematical Rule of Orthogonality
              </div>
              In ℝ^{capacityDim}, at most <strong className="text-white">{capacityDim}</strong> mutually orthogonal vectors can coexist. Once the stream contains <strong className="text-white">{seqLength}</strong> facts, vectors must superpose into quasi-orthogonal angles, reducing retrieval margins.
            </div>
          </div>

          {/* Right Column: Comparative Analysis Matrix */}
          <div className="lg:col-span-7 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Growing Token History */}
              <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-amber-400" />
                    <span className="font-mono text-xs uppercase tracking-wider text-white font-semibold">
                      Growing Token History
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-950/20 px-2 py-0.5 rounded border border-amber-500/30">
                    O(T) KV-CACHE
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between border-b border-[#252A35] pb-1.5">
                    <span className="text-[#8F96A3]">Memory Footprint:</span>
                    <span className="font-mono font-bold text-amber-400">
                      {tokenHistoryKB >= 1024 ? `${(tokenHistoryKB / 1024).toFixed(2)} MB` : `${tokenHistoryKB} KB`}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#252A35] pb-1.5">
                    <span className="text-[#8F96A3]">Retained Facts:</span>
                    <span className="font-mono text-white">{seqLength} / {seqLength} intact</span>
                  </div>
                  <div className="flex justify-between border-b border-[#252A35] pb-1.5">
                    <span className="text-[#8F96A3]">Query Accuracy:</span>
                    <span className="font-mono font-bold text-emerald-400">{tokenAccuracy}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8F96A3]">Addressability:</span>
                    <span className="font-mono text-[#22D3EE]">Exact key index</span>
                  </div>
                </div>

                <div className="rounded-lg bg-[#151922] p-2.5 border border-[#252A35] text-[11px] text-[#8F96A3] leading-relaxed">
                  <span className="text-amber-400 font-semibold block mb-0.5">Physical Barrier:</span>
                  Hardware VRAM runs out on long conversations. Cannot operate in streaming robotics without eviction.
                </div>
              </div>

              {/* Card 2: Fixed Recurrent State */}
              <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#8B5CF6]" />
                    <span className="font-mono text-xs uppercase tracking-wider text-white font-semibold">
                      Recurrent State Vector
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#8B5CF6] bg-violet-950/20 px-2 py-0.5 rounded border border-violet-500/30">
                    O(1) CONSTANT
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between border-b border-[#252A35] pb-1.5">
                    <span className="text-[#8F96A3]">Memory Footprint:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {recurrentStateBytes} Bytes (Fixed)
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#252A35] pb-1.5">
                    <span className="text-[#8F96A3]">Input Load Ratio (T/D):</span>
                    <span className={`font-mono font-bold ${isOverloaded ? 'text-rose-400' : 'text-[#22D3EE]'}`}>
                      {(seqLength / capacityDim).toFixed(2)}x
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#252A35] pb-1.5">
                    <span className="text-[#8F96A3]">Query Accuracy:</span>
                    <span
                      className={`font-mono font-bold ${
                        recurrentAccuracy > 70
                          ? 'text-emerald-400'
                          : recurrentAccuracy > 40
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {recurrentAccuracy}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8F96A3]">Interference Level:</span>
                    <span className="font-mono text-violet-400">
                      {Math.round(interferenceRatio * 100)}%
                    </span>
                  </div>
                </div>

                <div
                  className={`rounded-lg p-2.5 border text-[11px] leading-relaxed ${
                    isOverloaded
                      ? 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                      : 'bg-[#151922] border-[#252A35] text-[#8F96A3]'
                  }`}
                >
                  {isOverloaded ? (
                    <span>
                      <strong className="text-rose-400">Interference Mode Active:</strong> Stream length ({seqLength}) exceeds dimension capacity ({capacityDim}). Superposition is decaying older traces.
                    </span>
                  ) : (
                    <span>
                      <strong className="text-emerald-400">Stable Compression:</strong> Stream length is within dimensional capacity ({capacityDim}); representations remain separable.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Capacity vs Interference Gauge */}
            <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#8F96A3] uppercase">State Saturation Index</span>
                <span className={isOverloaded ? 'text-rose-400 font-bold' : 'text-[#22D3EE]'}>
                  {Math.min(100, Math.round((seqLength / capacityDim) * 70))}% Saturation
                </span>
              </div>
              <div className="h-2 w-full bg-[#151922] rounded-full overflow-hidden border border-[#252A35]">
                <div
                  className={`h-full transition-all duration-300 ${
                    isOverloaded ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-gradient-to-r from-violet-500 to-cyan-400'
                  }`}
                  style={{ width: `${Math.min(100, (seqLength / capacityDim) * 70)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

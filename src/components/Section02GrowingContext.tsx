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
    <section id="section-02" className="scroll-mt-20 border-b border-[#E5E0D8] bg-[#FBF9F5] py-16">
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
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-3">
                <span className="text-xs font-mono uppercase tracking-widest text-[#167C80] font-bold flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  Laboratory parameters
                </span>
                <span className="text-[10px] font-mono text-[#716F68]">Adjust in real time</span>
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
                description="Uncorrelated background noise perturbing incoming representations."
                onChange={(val) => setNoiseLevel(val)}
              />
            </div>

            {/* Scientific observation note */}
            <div className="rounded-2xl border border-[#E5E0D8] bg-[#FAF8F5] p-5 text-xs text-[#52504A] font-sans leading-relaxed">
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#6842C2] font-bold mb-1.5">
                Mathematical Rule of Orthogonality
              </div>
              In ℝ^{capacityDim}, at most <strong className="text-[#151515]">{capacityDim}</strong> mutually orthogonal vectors can coexist. Once the stream contains <strong className="text-[#151515]">{seqLength}</strong> facts, vectors must superpose into quasi-orthogonal angles, reducing retrieval margins.
            </div>
          </div>

          {/* Right Column: Comparative Analysis Matrix */}
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Growing Token History */}
              <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#A46622]" />
                    <span className="font-serif text-sm font-bold text-[#151515]">
                      Growing Token History
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#A46622] bg-[#FDF8EE] px-2 py-0.5 rounded-full border border-[#F5E2C4] font-bold">
                    O(T) KV-CACHE
                  </span>
                </div>

                <div className="space-y-2.5 text-xs font-sans">
                  <div className="flex justify-between border-b border-[#EAE6DF] pb-2">
                    <span className="text-[#716F68]">Memory Footprint:</span>
                    <span className="font-mono font-bold text-[#A46622]">
                      {tokenHistoryKB >= 1024 ? `${(tokenHistoryKB / 1024).toFixed(2)} MB` : `${tokenHistoryKB} KB`}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#EAE6DF] pb-2">
                    <span className="text-[#716F68]">Retained Facts:</span>
                    <span className="font-mono text-[#151515] font-semibold">{seqLength} / {seqLength} intact</span>
                  </div>
                  <div className="flex justify-between border-b border-[#EAE6DF] pb-2">
                    <span className="text-[#716F68]">Query Accuracy:</span>
                    <span className="font-mono font-bold text-[#247A4B]">{tokenAccuracy}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#716F68]">Addressability:</span>
                    <span className="font-mono text-[#167C80] font-semibold">Exact key index</span>
                  </div>
                </div>

                <div className="rounded-xl bg-[#FAF8F5] p-3 border border-[#EAE6DF] text-[11px] text-[#52504A] font-sans leading-relaxed">
                  <span className="text-[#A46622] font-bold block mb-0.5">Physical barrier:</span>
                  Hardware VRAM runs out on long conversations. Cannot operate in streaming robotics without eviction.
                </div>
              </div>

              {/* Card 2: Fixed Recurrent State */}
              <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#6842C2]" />
                    <span className="font-serif text-sm font-bold text-[#151515]">
                      Recurrent State Vector
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#6842C2] bg-[#F3EFFF] px-2 py-0.5 rounded-full border border-[#E2D8FA] font-bold">
                    O(1) CONSTANT
                  </span>
                </div>

                <div className="space-y-2.5 text-xs font-sans">
                  <div className="flex justify-between border-b border-[#EAE6DF] pb-2">
                    <span className="text-[#716F68]">Memory Footprint:</span>
                    <span className="font-mono font-bold text-[#247A4B]">
                      {recurrentStateBytes} Bytes (Fixed)
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#EAE6DF] pb-2">
                    <span className="text-[#716F68]">Input Load Ratio (T/D):</span>
                    <span className={`font-mono font-bold ${isOverloaded ? 'text-[#B64235]' : 'text-[#167C80]'}`}>
                      {(seqLength / capacityDim).toFixed(2)}x
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#EAE6DF] pb-2">
                    <span className="text-[#716F68]">Query Accuracy:</span>
                    <span
                      className={`font-mono font-bold ${
                        recurrentAccuracy > 70
                          ? 'text-[#247A4B]'
                          : recurrentAccuracy > 40
                          ? 'text-[#A46622]'
                          : 'text-[#B64235]'
                      }`}
                    >
                      {recurrentAccuracy}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#716F68]">Interference Level:</span>
                    <span className="font-mono text-[#6842C2] font-bold">
                      {Math.round(interferenceRatio * 100)}%
                    </span>
                  </div>
                </div>

                <div
                  className={`rounded-xl p-3 border text-[11px] font-sans leading-relaxed ${
                    isOverloaded
                      ? 'bg-[#FDF2F0] border-[#F7D3CF] text-[#B64235]'
                      : 'bg-[#FAF8F5] border-[#EAE6DF] text-[#52504A]'
                  }`}
                >
                  {isOverloaded ? (
                    <span>
                      <strong className="text-[#B64235]">Interference mode active:</strong> Stream length ({seqLength}) exceeds dimension capacity ({capacityDim}). Superposition is decaying older traces.
                    </span>
                  ) : (
                    <span>
                      <strong className="text-[#247A4B]">Stable compression:</strong> Stream length is within dimensional capacity ({capacityDim}); representations remain separable.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Capacity vs Interference Gauge */}
            <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-5 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#716F68] uppercase font-bold">State Saturation Index</span>
                <span className={isOverloaded ? 'text-[#B64235] font-bold' : 'text-[#167C80] font-bold'}>
                  {Math.min(100, Math.round((seqLength / capacityDim) * 70))}% Saturation
                </span>
              </div>
              <div className="h-2 w-full bg-[#EFECE6] rounded-full overflow-hidden border border-[#E5E0D8]">
                <div
                  className={`h-full transition-all duration-300 ${
                    isOverloaded ? 'bg-[#B64235]' : 'bg-[#6842C2]'
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

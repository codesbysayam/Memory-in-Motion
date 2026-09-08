import React, { useState } from 'react';
import { Database, HardDrive, ArrowRight, Layers, Sparkles } from 'lucide-react';
import { SectionHeader } from './ui/SectionHeader';
import { ControlSlider } from './ui/ControlSlider';
import { Tooltip } from './ui/Tooltip';

export const Section01MemoryProblem: React.FC = () => {
  const [tokenCount, setTokenCount] = useState<number>(12);

  // Memory footprint calculations:
  // KV Cache: 2 * layers * heads * dim * tokens * precision
  // Assume a 7B model footprint ~ 0.5 MB per token in active inference
  const kvMemoryPerTokenKB = 512; // 0.5 MB
  const totalKVMemoryMB = ((tokenCount * kvMemoryPerTokenKB) / 1024).toFixed(1);
  const fixedRecurrentSizeKB = 64; // Constant 64 KB state

  const tokens = [
    'The', 'capital', 'of', 'France', 'is', 'Paris.',
    'The', 'capital', 'of', 'Japan', 'is', 'Tokyo.',
    'The', 'capital', 'of', 'Brazil', 'is', 'Brasília.',
    'The', 'capital', 'of', 'Canada', 'is', 'Ottawa.',
    'The', 'capital', 'of', 'Egypt', 'is', 'Cairo.',
    'The', 'capital', 'of', 'Germany', 'is', 'Berlin.',
    'The', 'capital', 'of', 'India', 'is', 'New Delhi.',
    'The', 'capital', 'of', 'Kenya', 'is', 'Nairobi.',
  ].slice(0, tokenCount);

  return (
    <section id="section-01" className="scroll-mt-20 border-b border-[#252A35] bg-[#07080B] py-14">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <SectionHeader
          number="01"
          category="THE MEMORY PROBLEM"
          title="Why does memory become a systems problem?"
          subtitle="Standard Transformer models remember past dialogue by storing every single token in an expanding Key-Value cache. As sequences grow, memory consumption scales uncontrollably."
          discovery="Verbatim token retention scales linearly O(T) with context length, whereas recurrent memory compresses information into a constant O(1) state footprint."
        />

        {/* 12-Column Responsive Layout: 5 Cols Left, 7 Cols Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Context, Sliders & Core Scientific Question */}
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-5 space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#22D3EE] font-semibold">
                SYSTEM INTERFACE DYNAMICS
              </h3>
              
              <p className="text-sm text-[#8F96A3] leading-relaxed">
                In standard self-attention architectures, every incoming word token must attend to all previous tokens. To avoid recalculating representations, models maintain a{' '}
                <Tooltip
                  term="KV Cache"
                  definition="Key-Value Cache: Pre-computed attention matrices (K and V projections) stored in GPU RAM for all past tokens in a conversation."
                >
                  KV Cache
                </Tooltip>
                . Each additional token consumes permanent memory until the GPU runs out of VRAM.
              </p>

              {/* Slider for Sequence Length */}
              <div className="pt-2 border-t border-[#252A35]">
                <ControlSlider
                  label="Sequence Length (T tokens)"
                  value={tokenCount}
                  min={4}
                  max={48}
                  step={2}
                  unit="tokens"
                  description="Slide to simulate a longer conversation context and watch the storage footprint diverge."
                  onChange={(val) => setTokenCount(val)}
                />
              </div>

              {/* Dual Telemetry Cards */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-lg border border-[#252A35] bg-[#151922] p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#8F96A3] uppercase">
                    <Database className="w-3 h-3 text-amber-400" />
                    <span>KV Cache RAM</span>
                  </div>
                  <div className="font-mono text-base font-bold text-amber-400">
                    {totalKVMemoryMB} MB
                  </div>
                  <div className="text-[10px] font-mono text-amber-400/80">O(T) linear growth</div>
                </div>

                <div className="rounded-lg border border-[#252A35] bg-[#151922] p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#8F96A3] uppercase">
                    <HardDrive className="w-3 h-3 text-emerald-400" />
                    <span>Recurrent State</span>
                  </div>
                  <div className="font-mono text-base font-bold text-emerald-400">
                    {fixedRecurrentSizeKB} KB
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400/80">O(1) strictly constant</div>
                </div>
              </div>
            </div>

            {/* Scientific Question Callout */}
            <div className="rounded-xl border border-violet-500/30 bg-violet-950/20 p-5 space-y-2">
              <div className="flex items-center gap-2 text-violet-300 font-mono text-xs uppercase tracking-wider font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" />
                <span>The Core Scientific Dilemma</span>
              </div>
              <p className="text-sm text-[#F4F5F7] font-medium leading-snug">
                "Can we retain the task-relevant knowledge of past tokens without paying the unbounded memory cost of storing them verbatim?"
              </p>
              <p className="text-xs text-[#8F96A3] leading-relaxed">
                Biological brains do not record continuous sensory feeds like a video tape. They continuously compress impressions into evolving synaptic states and latent recurrent activations.
              </p>
            </div>
          </div>

          {/* Right Column: Visualizer of Token Chain vs State Vector */}
          <div className="lg:col-span-7 space-y-5">
            {/* Visual Token Stream */}
            <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-widest text-[#8F96A3]">
                  1. TRANSFORMER TOKEN ACCUMULATION (KV CACHE)
                </span>
                <span className="font-mono text-xs text-amber-400 bg-amber-950/20 px-2 py-0.5 rounded border border-amber-500/30">
                  {tokenCount} TOKENS RETAINED
                </span>
              </div>

              <div className="p-3.5 rounded-lg border border-[#252A35] bg-[#151922] max-h-[160px] overflow-y-auto space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {tokens.map((token, i) => (
                    <div
                      key={i}
                      className="inline-flex items-center gap-1 rounded bg-[#07080B] border border-[#252A35] px-2 py-1 font-mono text-xs text-zinc-300"
                    >
                      <span className="text-[10px] text-zinc-500">{i + 1}</span>
                      <span>{token}</span>
                      {i < tokens.length - 1 && <ArrowRight className="w-2.5 h-2.5 text-[#8F96A3]" />}
                    </div>
                  ))}
                  <span className="font-mono text-xs text-[#8B5CF6] self-center animate-pulse px-1">...</span>
                </div>
              </div>
              <p className="text-xs text-[#8F96A3] font-mono">
                Notice: Every token appends new rows to Key and Value tensors. Doubling conversation length doubles memory cost.
              </p>
            </div>

            {/* Recurrent State Comparison */}
            <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-widest text-[#8F96A3]">
                  2. RECURRENT COMPACT STATE (FIXED VECTOR h_t)
                </span>
                <span className="font-mono text-xs text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-500/30">
                  FIXED ℝ⁸ VECTOR
                </span>
              </div>

              <div className="p-3.5 rounded-lg border border-[#252A35] bg-[#151922]">
                <div className="flex items-center justify-between text-xs font-mono text-[#8F96A3] mb-2">
                  <span>LATENT COORDINATES (h_0 .. h_7)</span>
                  <span className="text-emerald-400">CONSTANT SIZE AT ALL T</span>
                </div>

                <div className="grid grid-cols-8 gap-1.5">
                  {Array.from({ length: 8 }).map((_, i) => {
                    const sampleVal = Math.sin((i + 1) * tokenCount * 0.4);
                    return (
                      <div
                        key={i}
                        className="rounded border border-[#252A35] bg-[#07080B] p-2 text-center flex flex-col items-center justify-center font-mono"
                      >
                        <span className="text-[9px] text-[#8F96A3]">h_{i}</span>
                        <span className="text-xs font-semibold text-white mt-0.5">
                          {sampleVal.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-xs text-[#8F96A3] leading-relaxed border-t border-[#252A35] pt-3">
                <strong className="text-white">The Trade-off:</strong> While recurrent state bounds memory to O(1), folding {tokenCount} tokens into the same 8 numbers inevitably forces representations to overlap. This brings us to Section 02 and 03.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

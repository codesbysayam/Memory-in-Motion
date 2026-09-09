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
    <section id="section-01" className="scroll-mt-20 border-b border-[#E5E0D8] bg-[#FBF9F5] py-16">
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
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-6 space-y-5 shadow-xs">
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#167C80] font-bold">
                System interface dynamics
              </h3>
              
              <p className="text-sm text-[#52504A] font-sans leading-relaxed">
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
              <div className="pt-3 border-t border-[#EAE6DF]">
                <ControlSlider
                  label="Sequence Length (T tokens)"
                  value={tokenCount}
                  min={4}
                  max={48}
                  step={2}
                  unit="tokens"
                  description="Try changing this. Slide to simulate a longer conversation context and watch the storage footprint diverge."
                  onChange={(val) => setTokenCount(val)}
                />
              </div>

              {/* Dual Telemetry Cards */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-xl border border-[#F5E2C4] bg-[#FDF8EE] p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#A46622] uppercase font-bold">
                    <Database className="w-3 h-3 text-[#A46622]" />
                    <span>KV Cache RAM</span>
                  </div>
                  <div className="font-serif text-lg font-bold text-[#A46622]">
                    {totalKVMemoryMB} MB
                  </div>
                  <div className="text-[10px] font-mono text-[#A46622]/90 font-medium">O(T) linear growth</div>
                </div>

                <div className="rounded-xl border border-[#CDEEDB] bg-[#EDF8F2] p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#247A4B] uppercase font-bold">
                    <HardDrive className="w-3 h-3 text-[#247A4B]" />
                    <span>Recurrent State</span>
                  </div>
                  <div className="font-serif text-lg font-bold text-[#247A4B]">
                    {fixedRecurrentSizeKB} KB
                  </div>
                  <div className="text-[10px] font-mono text-[#247A4B]/90 font-medium">O(1) strictly constant</div>
                </div>
              </div>
            </div>

            {/* Scientific Question Callout */}
            <div className="rounded-2xl border border-[#E2D8FA] bg-[#F3EFFF] p-6 space-y-2.5">
              <div className="flex items-center gap-2 text-[#6842C2] font-mono text-xs uppercase tracking-wider font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#6842C2]" />
                <span>The Core Scientific Dilemma</span>
              </div>
              <p className="text-sm font-serif italic text-[#151515] leading-relaxed">
                "Can we retain the task-relevant knowledge of past tokens without paying the unbounded memory cost of storing them verbatim?"
              </p>
              <p className="text-xs text-[#52504A] font-sans leading-relaxed">
                Biological brains do not record continuous sensory feeds like a tape recorder. They continuously compress impressions into evolving synaptic states and latent recurrent activations.
              </p>
            </div>
          </div>

          {/* Right Column: Visualizer of Token Chain vs State Vector */}
          <div className="lg:col-span-7 space-y-6">
            {/* Visual Token Stream */}
            <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-widest text-[#716F68] font-bold">
                  1. Transformer token accumulation (KV cache)
                </span>
                <span className="font-mono text-xs text-[#A46622] bg-[#FDF8EE] px-2.5 py-0.5 rounded-full border border-[#F5E2C4] font-bold">
                  {tokenCount} TOKENS RETAINED
                </span>
              </div>

              <div className="p-4 rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] max-h-[160px] overflow-y-auto space-y-2 custom-scrollbar">
                <div className="flex flex-wrap gap-1.5">
                  {tokens.map((token, i) => (
                    <div
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded-md bg-[#FFFFFF] border border-[#E5E0D8] px-2 py-1 font-mono text-xs text-[#151515] shadow-xs"
                    >
                      <span className="text-[10px] text-[#716F68]">{i + 1}</span>
                      <span>{token}</span>
                      {i < tokens.length - 1 && <ArrowRight className="w-2.5 h-2.5 text-[#BDB7AB]" />}
                    </div>
                  ))}
                  <span className="font-mono text-xs text-[#6842C2] self-center animate-pulse px-1">...</span>
                </div>
              </div>
              <p className="text-xs text-[#716F68] font-sans leading-relaxed">
                Notice: Every token appends new rows to Key and Value tensors. Doubling conversation length doubles memory cost.
              </p>
            </div>

            {/* Recurrent State Comparison */}
            <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-widest text-[#716F68] font-bold">
                  2. Recurrent compact state (Fixed vector h_t)
                </span>
                <span className="font-mono text-xs text-[#247A4B] bg-[#EDF8F2] px-2.5 py-0.5 rounded-full border border-[#CDEEDB] font-bold">
                  FIXED ℝ⁸ VECTOR
                </span>
              </div>

              <div className="p-4 rounded-xl border border-[#EAE6DF] bg-[#FAF8F5]">
                <div className="flex items-center justify-between text-xs font-mono text-[#716F68] mb-3">
                  <span>LATENT COORDINATES (h_0 .. h_7)</span>
                  <span className="text-[#247A4B] font-bold">CONSTANT SIZE AT ALL T</span>
                </div>

                <div className="grid grid-cols-8 gap-1.5">
                  {Array.from({ length: 8 }).map((_, i) => {
                    const sampleVal = Math.sin((i + 1) * tokenCount * 0.4);
                    return (
                      <div
                        key={i}
                        className="rounded-lg border border-[#E5E0D8] bg-[#FFFFFF] p-2 text-center flex flex-col items-center justify-center font-mono shadow-xs"
                      >
                        <span className="text-[9px] text-[#716F68]">h_{i}</span>
                        <span className="text-xs font-bold text-[#151515] mt-0.5">
                          {sampleVal.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-xs text-[#52504A] font-sans leading-relaxed border-t border-[#EAE6DF] pt-3">
                <strong className="text-[#151515]">The fundamental trade-off:</strong> While recurrent state bounds memory to O(1), folding {tokenCount} tokens into the same 8 numbers inevitably forces representations to overlap. Look closely as we inspect this in Section 02 and 03.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

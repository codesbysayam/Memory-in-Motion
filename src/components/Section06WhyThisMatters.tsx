import React, { useState } from 'react';
import { Scale, Check, X, ArrowRight, Sparkles, Cpu, Layers } from 'lucide-react';
import { SectionHeader } from './ui/SectionHeader';

export const Section06WhyThisMatters: React.FC = () => {
  const [selectedWorkload, setSelectedWorkload] = useState<'streaming' | 'document' | 'dialogue'>('streaming');

  const workloadScenarios = {
    streaming: {
      name: 'Real-Time Edge Robotics',
      constraint: 'Strict 128MB RAM limit, 24/7 continuous sensor streams without rebooting.',
      recommendation: 'Fixed Recurrent / Synaptic Memory (BDH)',
      reasoning: 'A transformer KV-cache will crash out-of-memory within minutes; recurrent states run infinitely with O(1) memory.',
    },
    document: {
      name: 'Legal Contract Cross-Examination',
      constraint: 'Must verify verbatim clause quotes with 100% exact key retrieval.',
      recommendation: 'Full KV Cache Transformer',
      reasoning: 'Even minor vector superposition crosstalk is unacceptable when exact quotation and token indices are required.',
    },
    dialogue: {
      name: 'Lifelong Companion Assistant',
      constraint: 'Years of conversations requiring high-level associative memory without storing billions of raw tokens.',
      recommendation: 'Hybrid / Sparse Synaptic Memory (BDH)',
      reasoning: 'Combines bounded footprint with sparse topological routing to minimize catastrophic interference.',
    },
  };

  const activeWorkload = workloadScenarios[selectedWorkload];

  return (
    <section id="section-06" className="scroll-mt-20 border-b border-[#252A35] bg-[#07080B] py-14">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <SectionHeader
          number="06"
          category="THE FOUNDATIONAL TRADE-OFF"
          title="Why This Matters: No Free Lunch in Memory"
          subtitle="Neither growing token context nor fixed-size recurrent state is universally superior. They occupy opposite poles of an information-theoretic trade-off between bounded hardware physical cost and exact addressability."
          discovery="Memory design is fundamentally a Pareto frontier: you can bound RAM to O(1) or guarantee exact lossless token retrieval, but classical vector superposition cannot achieve both simultaneously."
        />

        {/* 12-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Workload Analysis Simulator */}
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#252A35] pb-2">
                <span className="text-xs font-mono uppercase tracking-widest text-[#22D3EE] font-semibold">
                  SYSTEM SCENARIO SELECTOR
                </span>
                <span className="text-[10px] font-mono text-[#8F96A3]">PARETO EVALUATION</span>
              </div>

              <p className="text-xs text-[#8F96A3] leading-relaxed">
                Select an architectural deployment environment to examine which side of the trade-off dominates:
              </p>

              <div className="grid grid-cols-1 gap-2">
                {(['streaming', 'document', 'dialogue'] as const).map((key) => (
                  <button
                    key={key}
                    onClick={() => setSelectedWorkload(key)}
                    className={`p-3 rounded-lg border text-left font-mono text-xs transition-all ${
                      selectedWorkload === key
                        ? 'bg-[#151922] border-[#8B5CF6] text-white shadow-sm'
                        : 'bg-[#07080B] border-[#252A35] text-[#8F96A3] hover:text-white hover:border-[#3A4150]'
                    }`}
                  >
                    <div className="font-semibold">{workloadScenarios[key].name}</div>
                    <div className="text-[11px] text-[#8F96A3] mt-0.5">{workloadScenarios[key].constraint}</div>
                  </button>
                ))}
              </div>

              {/* Workload evaluation card */}
              <div className="rounded-lg border border-[#252A35] bg-[#151922] p-3 text-xs space-y-2">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-[10px] text-[#8F96A3] uppercase">ARCHITECTURAL CHOICE:</span>
                  <span className="text-[#22D3EE] font-semibold">{activeWorkload.recommendation}</span>
                </div>
                <p className="text-[#8F96A3] text-[11px] leading-relaxed">
                  {activeWorkload.reasoning}
                </p>
              </div>
            </div>

            {/* Gateway Callout to BDH (Part II) */}
            <div className="rounded-xl border border-violet-500/30 bg-violet-950/20 p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-violet-300 font-mono text-xs uppercase tracking-wider font-semibold">
                <Sparkles className="w-4 h-4 text-[#22D3EE]" />
                <span>The Gateway to Part II</span>
              </div>
              <p className="text-sm font-medium text-white leading-snug">
                "If dense vectors suffer from interference, can memory live inside a sparse graph of synaptic weights?"
              </p>
              <p className="text-xs text-[#8F96A3] leading-relaxed">
                In the next sections, we leave simple vector arithmetic and enter the <strong>Dragon Hatchling (BDH)</strong> architecture: sparse recurrent graph connectivity with Hebbian synaptic memory.
              </p>
            </div>
          </div>

          {/* Right Column: Side-by-Side Trade-off Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Growing Token History */}
            <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-5 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#252A35] pb-2.5">
                  <span className="font-mono text-xs font-semibold uppercase text-amber-400">
                    Growing Token History
                  </span>
                  <span className="text-[10px] font-mono text-[#8F96A3]">KV Cache</span>
                </div>

                <div className="space-y-3 pt-3 text-xs">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-[#F4F5F7]">
                      <strong className="text-white">Zero Loss:</strong> Perfect preservation of past verbatim tokens without compression artifacts.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-[#F4F5F7]">
                      <strong className="text-white">Direct Attention:</strong> Every token pair can form direct query-key affinities at any distance.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span className="text-[#8F96A3]">
                      <strong className="text-rose-400">O(T) RAM Footprint:</strong> Unbounded linear growth inevitably overflows GPU VRAM.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span className="text-[#8F96A3]">
                      <strong className="text-rose-400">Throughput Bottleneck:</strong> Memory bandwidth transfer of massive KV caches limits inference speed.
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-[#151922] p-2.5 border border-[#252A35] text-[10px] font-mono text-[#8F96A3]">
                Core domain: Large context document analysis, short-session generation.
              </div>
            </div>

            {/* Card 2: Fixed-Size Recurrent State */}
            <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-5 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#252A35] pb-2.5">
                  <span className="font-mono text-xs font-semibold uppercase text-cyan-400">
                    Fixed Recurrent State
                  </span>
                  <span className="text-[10px] font-mono text-[#8F96A3]">RNN / SSM</span>
                </div>

                <div className="space-y-3 pt-3 text-xs">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-[#F4F5F7]">
                      <strong className="text-white">Constant O(1) RAM:</strong> State remains strictly fixed regardless of running for 10 or 10,000,000 steps.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-[#F4F5F7]">
                      <strong className="text-white">Constant Step Time:</strong> Fixed latency per token update; ideal for streaming robotics and real-time audio.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span className="text-[#8F96A3]">
                      <strong className="text-rose-400">Lossy Superposition:</strong> All facts must be squashed into bounded geometric dimensions.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span className="text-[#8F96A3]">
                      <strong className="text-rose-400">Interference & Forgetting:</strong> Unrelated inputs rotate state coordinates, corrupting earlier traces.
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-[#151922] p-2.5 border border-[#252A35] text-[10px] font-mono text-[#8F96A3]">
                Core domain: Continuous edge robotics, lifelong sensory streaming.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

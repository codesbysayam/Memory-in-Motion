import React, { useState } from 'react';
import { Check, X, Sparkles } from 'lucide-react';
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
    <section id="section-06" className="scroll-mt-20 border-b border-[#E5E0D8] bg-[#FBF9F5] py-20 text-[#151515]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 space-y-12">
        <SectionHeader
          number="06"
          category="THE FOUNDATIONAL TRADE-OFF"
          title="Why this matters: No free lunch in memory"
          subtitle="Neither growing token context nor fixed-size recurrent state is universally superior. They occupy opposite poles of an information-theoretic trade-off between bounded hardware physical cost and exact addressability."
          discovery="Memory design is fundamentally a Pareto frontier: you can bound RAM to O(1) or guarantee exact lossless token retrieval, but classical vector superposition cannot achieve both simultaneously."
        />

        {/* 12-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Workload Analysis Simulator */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-3">
                <span className="text-xs font-mono uppercase tracking-widest text-[#167C80] font-bold">
                  SYSTEM SCENARIO SELECTOR
                </span>
                <span className="text-[10px] font-mono text-[#716F68] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E5E0D8]">
                  PARETO EVALUATION
                </span>
              </div>

              <p className="text-xs text-[#52504A] font-sans leading-relaxed">
                Select an architectural deployment environment to examine which side of the trade-off dominates:
              </p>

              <div className="grid grid-cols-1 gap-2.5">
                {(['streaming', 'document', 'dialogue'] as const).map((key) => (
                  <button
                    key={key}
                    onClick={() => setSelectedWorkload(key)}
                    className={`p-3.5 rounded-xl border text-left font-mono text-xs transition-all cursor-pointer ${
                      selectedWorkload === key
                        ? 'bg-[#F3EFFF] border-[#E2D8FA] text-[#151515] shadow-xs'
                        : 'bg-[#FAF8F5] border-[#E5E0D8] text-[#716F68] hover:text-[#151515] hover:bg-[#FFFFFF]'
                    }`}
                  >
                    <div className="font-bold text-[#151515]">{workloadScenarios[key].name}</div>
                    <div className="text-[11px] text-[#716F68] mt-0.5">{workloadScenarios[key].constraint}</div>
                  </button>
                ))}
              </div>

              {/* Workload evaluation card */}
              <div className="rounded-xl border border-[#CFE8E8] bg-[#FAFDFD] p-4 text-xs space-y-2">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-[10px] text-[#716F68] uppercase font-bold">ARCHITECTURAL CHOICE:</span>
                  <span className="text-[#167C80] font-bold">{activeWorkload.recommendation}</span>
                </div>
                <p className="text-[#52504A] text-[11px] font-sans leading-relaxed">
                  {activeWorkload.reasoning}
                </p>
              </div>
            </div>

            {/* Gateway Callout to BDH (Part II) */}
            <div className="rounded-2xl border border-[#E2D8FA] bg-[#FAF8FD] p-6 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-[#6842C2] font-mono text-xs uppercase tracking-wider font-bold">
                <Sparkles className="w-4 h-4 text-[#6842C2]" />
                <span>The Gateway to Part II</span>
              </div>
              <p className="text-sm font-serif font-bold text-[#151515] leading-snug">
                &ldquo;If dense vectors suffer from interference, can memory live inside a sparse graph of synaptic weights?&rdquo;
              </p>
              <p className="text-xs text-[#52504A] font-sans leading-relaxed">
                In the next sections, we leave simple vector arithmetic and enter the <strong>Dragon Hatchling (BDH)</strong> architecture: sparse recurrent graph connectivity with Hebbian synaptic memory.
              </p>
            </div>
          </div>

          {/* Right Column: Side-by-Side Trade-off Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Growing Token History */}
            <div className="rounded-2xl border border-[#F5E2C4] bg-[#FFFDF8] p-6 space-y-5 flex flex-col justify-between shadow-xs">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#F5E2C4] pb-3">
                  <span className="font-mono text-xs font-bold uppercase text-[#A46622]">
                    Growing Token History
                  </span>
                  <span className="text-[10px] font-mono text-[#A46622] bg-[#FFF8EE] px-2 py-0.5 rounded border border-[#F5E2C4] font-semibold">
                    KV Cache
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#247A4B] shrink-0 mt-0.5" />
                    <span className="text-[#2A2926] font-sans">
                      <strong className="text-[#151515]">Zero Loss:</strong> Perfect preservation of past verbatim tokens without compression artifacts.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#247A4B] shrink-0 mt-0.5" />
                    <span className="text-[#2A2926] font-sans">
                      <strong className="text-[#151515]">Direct Attention:</strong> Every token pair can form direct query-key affinities at any distance.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <X className="w-4 h-4 text-[#C53030] shrink-0 mt-0.5" />
                    <span className="text-[#52504A] font-sans">
                      <strong className="text-[#C53030]">O(T) RAM Footprint:</strong> Unbounded linear growth inevitably overflows GPU VRAM.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <X className="w-4 h-4 text-[#C53030] shrink-0 mt-0.5" />
                    <span className="text-[#52504A] font-sans">
                      <strong className="text-[#C53030]">Throughput Bottleneck:</strong> Memory bandwidth transfer of massive KV caches limits inference speed.
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-[#FAF8F5] p-3 border border-[#EAE6DF] text-[10px] font-mono text-[#716F68]">
                Core domain: Large context document analysis, short-session generation.
              </div>
            </div>

            {/* Card 2: Fixed-Size Recurrent State */}
            <div className="rounded-2xl border border-[#CFE8E8] bg-[#FAFDFD] p-6 space-y-5 flex flex-col justify-between shadow-xs">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E0F0F0] pb-3">
                  <span className="font-mono text-xs font-bold uppercase text-[#167C80]">
                    Fixed Recurrent State
                  </span>
                  <span className="text-[10px] font-mono text-[#167C80] bg-[#EDF7F7] px-2 py-0.5 rounded border border-[#CFE8E8] font-semibold">
                    RNN / SSM
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#247A4B] shrink-0 mt-0.5" />
                    <span className="text-[#2A2926] font-sans">
                      <strong className="text-[#151515]">Constant O(1) RAM:</strong> State remains strictly fixed regardless of running for 10 or 10,000,000 steps.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#247A4B] shrink-0 mt-0.5" />
                    <span className="text-[#2A2926] font-sans">
                      <strong className="text-[#151515]">Constant Step Time:</strong> Fixed latency per token update; ideal for streaming robotics and real-time audio.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <X className="w-4 h-4 text-[#C53030] shrink-0 mt-0.5" />
                    <span className="text-[#52504A] font-sans">
                      <strong className="text-[#C53030]">Lossy Superposition:</strong> All facts must be squashed into bounded geometric dimensions.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <X className="w-4 h-4 text-[#C53030] shrink-0 mt-0.5" />
                    <span className="text-[#52504A] font-sans">
                      <strong className="text-[#C53030]">Interference & Forgetting:</strong> Unrelated inputs rotate state coordinates, corrupting earlier traces.
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-[#FAF8F5] p-3 border border-[#EAE6DF] text-[10px] font-mono text-[#716F68]">
                Core domain: Continuous edge robotics, lifelong sensory streaming.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

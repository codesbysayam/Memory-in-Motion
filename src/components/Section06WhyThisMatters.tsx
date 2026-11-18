import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
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
    <section id="section-06" className="scroll-mt-20 border-b border-[var(--mm-rule)] bg-[var(--page-bg)] py-16 sm:py-20 text-[var(--text-primary)]">
      <div className="space-y-10">
        <SectionHeader
          number="06"
          category="The Foundational Trade-off"
          title="Why this matters: No free lunch in memory"
          subtitle="Neither growing token context nor fixed-size recurrent state is universally superior. They occupy opposite poles of an information-theoretic trade-off between bounded hardware cost and exact verbatim recall."
          discovery="Memory design is a Pareto frontier: you can bound RAM to O(1) or guarantee exact token retrieval, but dense vector superposition cannot achieve both simultaneously."
        />

        {/* 12-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Workload Analysis Selector */}
          <div className="lg:col-span-5 space-y-6">
            <div className="essay-figure-stage p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-[var(--mm-rule)] pb-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] font-semibold text-[var(--mm-signal)]">
                  Deployment scenario
                </span>
                <span className="text-[11px] font-mono text-[var(--mm-muted)]">
                  Pareto evaluation
                </span>
              </div>

              <p className="text-sm text-[var(--mm-ink-soft)] font-sans leading-relaxed">
                Select a deployment constraint to inspect which side of the memory trade-off dominates:
              </p>

              <div className="divide-y divide-[var(--mm-rule)] border border-[var(--mm-rule)] bg-[var(--mm-paper-bright)] rounded-md overflow-hidden">
                {(['streaming', 'document', 'dialogue'] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedWorkload(key)}
                    className={`w-full p-3.5 text-left transition-colors cursor-pointer ${
                      selectedWorkload === key
                        ? 'bg-[var(--mm-signal-soft)] text-[var(--mm-ink)]'
                        : 'hover:bg-[var(--mm-paper-inset)] text-[var(--mm-muted)]'
                    }`}
                  >
                    <div className="font-sans font-semibold text-sm text-[var(--mm-ink)]">{workloadScenarios[key].name}</div>
                    <div className="text-xs text-[var(--mm-muted)] mt-0.5 leading-relaxed">{workloadScenarios[key].constraint}</div>
                  </button>
                ))}
              </div>

              {/* Workload evaluation */}
              <div className="pt-3 border-t border-[var(--mm-rule)] text-xs space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--mm-muted)]">Recommended bias</span>
                  <span className="text-xs font-mono font-semibold text-[var(--mm-signal)]">{activeWorkload.recommendation}</span>
                </div>
                <p className="text-[var(--mm-ink-soft)] text-xs font-sans leading-relaxed">
                  {activeWorkload.reasoning}
                </p>
              </div>
            </div>

            {/* Transition to Part II */}
            <div className="pt-4 border-t border-[var(--mm-rule)] space-y-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--mm-signal)] font-semibold block">
                Transition to Part II · Architectural shift
              </span>
              <p className="text-base font-serif text-[var(--mm-ink)] leading-snug">
                &ldquo;If dense vectors collide under interference, can memory live across the edges of a sparse graph instead?&rdquo;
              </p>
              <p className="text-xs sm:text-sm text-[var(--mm-muted)] font-sans leading-relaxed">
                Next, we move from simple 1D/2D vector matrix arithmetic to Pathway&apos;s <strong className="text-[var(--mm-ink)]">Dragon Hatchling (BDH)</strong>: sparse recurrent particle connectivity with Hebbian synaptic weights.
              </p>
            </div>
          </div>

          {/* Right Column: Unified 2-Column Hairline Comparison Stage */}
          <div className="lg:col-span-7 essay-figure-stage overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--mm-rule)]">
              {/* Column 1: Growing Token History */}
              <div className="p-6 space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--mm-rule)] pb-3">
                    <span className="font-serif text-base font-normal text-[var(--mm-ink)]">
                      Growing Token History
                    </span>
                    <span className="text-[11px] font-mono text-[var(--mm-amber)] font-semibold">
                      KV Cache · O(T)
                    </span>
                  </div>

                  <div className="space-y-3 text-xs sm:text-sm">
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[var(--color-success)] shrink-0 mt-0.5" />
                      <span className="text-[var(--mm-ink-soft)] font-sans">
                        <strong className="text-[var(--mm-ink)]">Zero Loss:</strong> Perfect preservation of past verbatim tokens without compression artifacts.
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[var(--color-success)] shrink-0 mt-0.5" />
                      <span className="text-[var(--mm-ink-soft)] font-sans">
                        <strong className="text-[var(--mm-ink)]">Direct Attention:</strong> Every token pair forms direct query-key affinities at any distance.
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <X className="w-4 h-4 text-[var(--mm-coral)] shrink-0 mt-0.5" />
                      <span className="text-[var(--mm-ink-soft)] font-sans">
                        <strong className="text-[var(--mm-coral)]">O(T) RAM Footprint:</strong> Unbounded linear growth exhausts memory bandwidth over long streams.
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <X className="w-4 h-4 text-[var(--mm-coral)] shrink-0 mt-0.5" />
                      <span className="text-[var(--mm-ink-soft)] font-sans">
                        <strong className="text-[var(--mm-coral)]">Bandwidth Bottleneck:</strong> Moving massive KV caches slows per-token decoding throughput.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--mm-rule)] text-xs font-mono text-[var(--mm-muted)]">
                  Best for: short-session synthesis, verbatim legal retrieval
                </div>
              </div>

              {/* Column 2: Fixed-Size Recurrent State */}
              <div className="p-6 space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--mm-rule)] pb-3">
                    <span className="font-serif text-base font-normal text-[var(--mm-ink)]">
                      Fixed Recurrent State
                    </span>
                    <span className="text-[11px] font-mono text-[var(--mm-signal)] font-semibold">
                      RNN / BDH · O(1)
                    </span>
                  </div>

                  <div className="space-y-3 text-xs sm:text-sm">
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[var(--color-success)] shrink-0 mt-0.5" />
                      <span className="text-[var(--mm-ink-soft)] font-sans">
                        <strong className="text-[var(--mm-ink)]">Constant O(1) RAM:</strong> State remains fixed in size across 10 steps or 10 million steps.
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[var(--color-success)] shrink-0 mt-0.5" />
                      <span className="text-[var(--mm-ink-soft)] font-sans">
                        <strong className="text-[var(--mm-ink)]">Constant Step Latency:</strong> Predictable compute per incoming token for streaming robotics.
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <X className="w-4 h-4 text-[var(--mm-coral)] shrink-0 mt-0.5" />
                      <span className="text-[var(--mm-ink-soft)] font-sans">
                        <strong className="text-[var(--mm-coral)]">Lossy Superposition:</strong> Compressing history into fixed dimensions introduces overlap.
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <X className="w-4 h-4 text-[var(--mm-coral)] shrink-0 mt-0.5" />
                      <span className="text-[var(--mm-ink-soft)] font-sans">
                        <strong className="text-[var(--mm-coral)]">Interference &amp; Decay:</strong> Unrelated updates compete for shared coordinates unless structured sparsely.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--mm-rule)] text-xs font-mono text-[var(--mm-muted)]">
                  Best for: lifelong sensory streams, edge agents
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


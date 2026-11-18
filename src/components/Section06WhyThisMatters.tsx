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
    <section id="section-06" className="scroll-mt-20 border-b border-[var(--border)] bg-[var(--page-bg)] py-16 sm:py-20 text-[var(--text-primary)]">
      <div className="space-y-10">
        <SectionHeader
          number="06"
          category="The Foundational Trade-off"
          title="Why this matters: No free lunch in memory"
          subtitle="Neither growing token context nor fixed-size recurrent state is universally superior. They occupy opposite poles of an information-theoretic trade-off between bounded hardware physical cost and exact addressability."
          discovery="Memory design is fundamentally a Pareto frontier: you can bound RAM to O(1) or guarantee exact lossless token retrieval, but classical vector superposition cannot achieve both simultaneously."
        />

        {/* 12-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Workload Analysis Simulator */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <span className="text-xs font-sans font-semibold text-[var(--accent-blue-text)]">
                  System scenario selector
                </span>
                <span className="text-[11px] font-mono text-[var(--text-muted)]">
                  Pareto evaluation
                </span>
              </div>

              <p className="text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
                Select an architectural deployment environment to examine which side of the trade-off dominates:
              </p>

              <div className="grid grid-cols-1 gap-2.5">
                {(['streaming', 'document', 'dialogue'] as const).map((key) => (
                  <button
                    key={key}
                    onClick={() => setSelectedWorkload(key)}
                    className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                      selectedWorkload === key
                        ? 'bg-[var(--color-accent-soft)] border-[var(--color-border-strong)] text-[var(--text-primary)]'
                        : 'bg-[var(--surface-soft)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]'
                    }`}
                  >
                    <div className="font-sans font-semibold text-sm text-[var(--text-primary)]">{workloadScenarios[key].name}</div>
                    <div className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">{workloadScenarios[key].constraint}</div>
                  </button>
                ))}
              </div>

              {/* Workload evaluation card */}
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-xs space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-sans font-medium text-[var(--text-muted)]">Architectural choice</span>
                  <span className="text-xs font-mono font-semibold text-[var(--accent-blue-text)]">{activeWorkload.recommendation}</span>
                </div>
                <p className="text-[var(--text-secondary)] text-xs font-sans leading-relaxed">
                  {activeWorkload.reasoning}
                </p>
              </div>
            </div>

            {/* Gateway Callout to BDH (Part II) */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-6 space-y-2.5">
              <div className="flex items-center gap-2 text-[var(--accent-blue-text)] font-sans text-xs font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>The Gateway to Part II</span>
              </div>
              <p className="text-base font-sans font-semibold text-[var(--text-primary)] leading-snug">
                &ldquo;If dense vectors suffer from interference, can memory live inside a sparse graph of synaptic weights?&rdquo;
              </p>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
                In the next sections, we leave simple vector arithmetic and enter the <strong className="text-[var(--text-primary)]">Dragon Hatchling (BDH)</strong> architecture: sparse recurrent graph connectivity with Hebbian synaptic memory.
              </p>
            </div>
          </div>

          {/* Right Column: Side-by-Side Trade-off Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Growing Token History */}
            <div className="rounded-xl border border-[var(--color-warning-border)] bg-[var(--surface)] p-6 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                  <span className="font-sans text-sm font-semibold text-[var(--color-warning)]">
                    Growing Token History
                  </span>
                  <span className="text-[11px] font-mono text-[var(--color-warning)]">
                    KV Cache
                  </span>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[var(--color-success)] shrink-0 mt-0.5" />
                    <span className="text-[var(--text-secondary)] font-sans">
                      <strong className="text-[var(--text-primary)]">Zero Loss:</strong> Perfect preservation of past verbatim tokens without compression artifacts.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[var(--color-success)] shrink-0 mt-0.5" />
                    <span className="text-[var(--text-secondary)] font-sans">
                      <strong className="text-[var(--text-primary)]">Direct Attention:</strong> Every token pair can form direct query-key affinities at any distance.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <X className="w-4 h-4 text-[var(--color-danger)] shrink-0 mt-0.5" />
                    <span className="text-[var(--text-secondary)] font-sans">
                      <strong className="text-[var(--color-danger)]">O(T) RAM Footprint:</strong> Unbounded linear growth inevitably overflows GPU VRAM.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <X className="w-4 h-4 text-[var(--color-danger)] shrink-0 mt-0.5" />
                    <span className="text-[var(--text-secondary)] font-sans">
                      <strong className="text-[var(--color-danger)]">Throughput Bottleneck:</strong> Memory bandwidth transfer of massive KV caches limits inference speed.
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-[var(--surface-soft)] p-3 border border-[var(--border)] text-xs font-sans text-[var(--text-muted)]">
                Core domain: Large context document analysis, short-session generation.
              </div>
            </div>

            {/* Card 2: Fixed-Size Recurrent State */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                  <span className="font-sans text-sm font-semibold text-[var(--accent-blue-text)]">
                    Fixed Recurrent State
                  </span>
                  <span className="text-[11px] font-mono text-[var(--accent-blue-text)]">
                    RNN / SSM
                  </span>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[var(--color-success)] shrink-0 mt-0.5" />
                    <span className="text-[var(--text-secondary)] font-sans">
                      <strong className="text-[var(--text-primary)]">Constant O(1) RAM:</strong> State remains strictly fixed regardless of running for 10 or 10,000,000 steps.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[var(--color-success)] shrink-0 mt-0.5" />
                    <span className="text-[var(--text-secondary)] font-sans">
                      <strong className="text-[var(--text-primary)]">Constant Step Time:</strong> Fixed latency per token update; ideal for streaming robotics and real-time audio.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <X className="w-4 h-4 text-[var(--color-danger)] shrink-0 mt-0.5" />
                    <span className="text-[var(--text-secondary)] font-sans">
                      <strong className="text-[var(--color-danger)]">Lossy Superposition:</strong> All facts must be squashed into bounded geometric dimensions.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <X className="w-4 h-4 text-[var(--color-danger)] shrink-0 mt-0.5" />
                    <span className="text-[var(--text-secondary)] font-sans">
                      <strong className="text-[var(--color-danger)]">Interference & Forgetting:</strong> Unrelated inputs rotate state coordinates, corrupting earlier traces.
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-[var(--surface-soft)] p-3 border border-[var(--border)] text-xs font-sans text-[var(--text-muted)]">
                Core domain: Continuous edge robotics, lifelong sensory streaming.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

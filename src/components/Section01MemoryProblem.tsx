import React, { useState } from 'react';
import { Database, HardDrive, ArrowRight, Layers, Sparkles } from 'lucide-react';
import { SectionHeader } from './ui/SectionHeader';
import { ControlSlider } from './ui/ControlSlider';
import { Tooltip } from './ui/Tooltip';
import { InlineMath, FormattedMathText } from './ui/MathView';
import { GlossaryTerm } from './GlossaryTerm';

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
    <section id="section-01" className="scroll-mt-20 border-b border-[var(--border)] bg-[var(--page-bg)] py-12">
      <div className="w-full">
        <SectionHeader
          number="01"
          category="The memory problem"
          title="Why does memory become a systems problem?"
          subtitle="Standard Transformer models remember past dialogue by storing every single token in an expanding Key-Value cache. As sequences grow, memory consumption scales linearly."
          discovery={
            <span>
              Verbatim token retention scales linearly <InlineMath math="\mathcal{O}(T)" /> with context length, whereas recurrent memory compresses information into a constant <InlineMath math="\mathcal{O}(1)" /> state footprint.
            </span>
          }
        />

        {/* 12-Column Responsive Layout: 5 Cols Left, 7 Cols Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Context, Sliders & Core Scientific Question */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-5">
              <h3 className="text-xs font-mono font-semibold text-[var(--accent-blue-text)]">
                System interface dynamics
              </h3>

              <p className="text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
                In standard self-attention architectures, every incoming word token must attend to all previous tokens. To avoid recalculating representations, models maintain a{' '}
                <Tooltip
                  term="KV Cache"
                  definition="Key-Value Cache: Pre-computed attention matrices (K and V projections) stored in GPU RAM for all past tokens in a conversation."
                >
                  KV Cache
                </Tooltip>
                . Each additional token consumes permanent memory until GPU VRAM saturates.
              </p>

              {/* Slider for Sequence Length */}
              <div className="pt-3 border-t border-[var(--border)]">
                <ControlSlider
                  id="section01-token-slider"
                  label={
                    <span className="flex items-center gap-1">
                      <span>Sequence length</span>
                      <InlineMath math="(T \text{ tokens})" />
                    </span>
                  }
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
                <div className="rounded-xl border border-[var(--color-warning-border)] bg-[var(--accent-yellow)] p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--accent-yellow-text)] font-semibold">
                    <Database className="w-3.5 h-3.5 shrink-0" />
                    <span>KV Cache RAM</span>
                  </div>
                  <div className="font-serif text-lg font-semibold tabular-nums text-[var(--accent-yellow-text)]">
                    {totalKVMemoryMB} MB
                  </div>
                  <div className="text-xs font-mono text-[var(--accent-yellow-text)]">
                    <InlineMath math="\mathcal{O}(T)" /> linear growth
                  </div>
                </div>

                <div className="rounded-xl border border-[var(--color-success-border)] bg-[var(--accent-green)] p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--accent-green-text)] font-semibold">
                    <HardDrive className="w-3.5 h-3.5 shrink-0" />
                    <span>Recurrent state</span>
                  </div>
                  <div className="font-serif text-lg font-semibold tabular-nums text-[var(--accent-green-text)]">
                    {fixedRecurrentSizeKB} KB
                  </div>
                  <div className="text-xs font-mono text-[var(--accent-green-text)]">
                    <InlineMath math="\mathcal{O}(1)" /> strictly constant
                  </div>
                </div>
              </div>
            </div>

            {/* Scientific Question Callout */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--accent-blue)] p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-[var(--accent-blue-text)] font-mono text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>The core scientific dilemma</span>
              </div>
              <p className="text-sm font-serif italic text-[var(--text-primary)] leading-relaxed">
                &ldquo;Can we retain the task-relevant knowledge of past tokens without paying the unbounded memory cost of storing them verbatim?&rdquo;
              </p>
              <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
                Biological brains do not record continuous sensory feeds like a tape recorder. They continuously compress impressions into evolving synaptic states and latent recurrent activations.
              </p>
            </div>
          </div>

          {/* Right Column: Visualizer of Token Chain vs State Vector */}
          <div className="lg:col-span-7 space-y-6">
            {/* Visual Token Stream */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold text-[var(--text-secondary)]">
                  1. Transformer token accumulation (KV cache)
                </span>
                <span className="font-mono text-xs tabular-nums text-[var(--accent-yellow-text)] bg-[var(--accent-yellow)] px-2 py-0.5 rounded-md border border-[var(--color-warning-border)] font-semibold">
                  {tokenCount} tokens retained
                </span>
              </div>

              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] max-h-[160px] overflow-y-auto space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {tokens.map((token, i) => (
                    <div
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded-md bg-[var(--surface)] border border-[var(--border)] px-2 py-1 font-mono text-xs tabular-nums text-[var(--text-primary)]"
                    >
                      <span className="text-xs text-[var(--text-muted)]">{i + 1}</span>
                      <span>{token}</span>
                      {i < tokens.length - 1 && <ArrowRight className="w-2.5 h-2.5 text-[var(--text-muted)]" />}
                    </div>
                  ))}
                  <span className="font-mono text-xs text-[var(--accent-blue-text)] self-center px-1">…</span>
                </div>
              </div>
              <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
                Every token appends new rows to Key and Value tensors. Doubling conversation length doubles memory cost.
              </p>
            </div>

            {/* Recurrent State Comparison */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                  <span>2. Recurrent compact state</span>
                  <span>(Fixed vector <InlineMath math="h_t" />)</span>
                </span>
                <span className="font-mono text-xs text-[var(--accent-green-text)] bg-[var(--accent-green)] px-2 py-0.5 rounded-md border border-[var(--color-success-border)] font-semibold">
                  <InlineMath math="\text{Fixed } \mathbb{R}^8 \text{ vector}" />
                </span>
              </div>

              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[var(--text-secondary)] mb-3">
                  <span>Latent coordinates (<InlineMath math="h_0 \dots h_7" />)</span>
                  <span className="text-[var(--accent-green-text)] font-semibold flex items-center gap-1">
                    <span>Constant size at all</span>
                    <InlineMath math="T" />
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                  {Array.from({ length: 8 }).map((_, i) => {
                    const sampleVal = Math.sin((i + 1) * tokenCount * 0.4);
                    return (
                      <div
                        key={i}
                        className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 text-center flex flex-col items-center justify-center font-mono tabular-nums"
                      >
                        <span className="text-xs text-[var(--text-muted)]">
                          <InlineMath math={`h_{${i}}`} />
                        </span>
                        <span className="text-xs font-semibold text-[var(--text-primary)] mt-0.5">
                          {sampleVal.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans leading-relaxed border-t border-[var(--border)] pt-3">
                <strong className="text-[var(--text-primary)]">The fundamental trade-off:</strong> While a <GlossaryTerm term="recurrent state">recurrent state</GlossaryTerm> bounds memory to <InlineMath math="\mathcal{O}(1)" />, folding <span className="tabular-nums">{tokenCount}</span> tokens into the same 8 numbers forces representations to overlap. Look closely as we inspect this in Sections 02 and 03.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { SectionHeader } from './ui/SectionHeader';
import { ControlSlider } from './ui/ControlSlider';
import { InlineMath } from './ui/MathView';
import { GlossaryTerm } from './GlossaryTerm';
import { StickyScrollySection, ScrollyStep } from './essay/StickyScrollySection';
import { FigureCaption } from './essay/FigureCaption';

export const Section01MemoryProblem: React.FC = () => {
  const [tokenCount, setTokenCount] = useState<number>(16);
  const [activeStep, setActiveStep] = useState<number>(0);

  // Memory footprint calculations:
  // KV Cache: 2 * layers * heads * dim * tokens * precision (~0.5 MB per token)
  const kvMemoryPerTokenKB = 512;
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

  const steps: ScrollyStep[] = [
    {
      id: 'kv-arrival',
      label: 'Step 01 · Verbatim Retention',
      title: 'Standard Transformers keep every past token.',
      body: (
        <span>
          In self-attention, every new word attends back to all earlier words. To avoid recomputing representations, the model appends each token’s Key and Value tensors into a growing{' '}
          <GlossaryTerm term="kv-cache">KV Cache</GlossaryTerm>.
        </span>
      ),
    },
    {
      id: 'kv-linear',
      label: 'Step 02 · Linear Footprint',
      title: 'Memory consumption grows linearly with sequence length.',
      body: (
        <span>
          With {tokenCount} tokens active in our estimate, the KV cache consumes{' '}
          <strong className="font-mono text-[var(--text-primary)]">{totalKVMemoryMB} MB</strong>. Double the dialogue and the hardware cache doubles in <InlineMath math="\mathcal{O}(T)" /> space.
        </span>
      ),
    },
    {
      id: 'recurrent-constant',
      label: 'Step 03 · Fixed-Size State',
      title: 'Recurrent memory folds inputs into constant coordinates.',
      body: (
        <span>
          Instead of saving past tokens, a <GlossaryTerm term="recurrent state">recurrent state</GlossaryTerm> updates a fixed vector or matrix <InlineMath math="h_t \in \mathbb{R}^8" /> in place—holding hardware cost constant at <InlineMath math="\mathcal{O}(1)" /> ({fixedRecurrentSizeKB} KB).
        </span>
      ),
    },
    {
      id: 'compression-tension',
      label: 'Step 04 · The Core Dilemma',
      title: 'Constant memory forces every fact to share the same coordinates.',
      body: (
        <span>
          Compressing <span className="tabular-nums font-mono">{tokenCount}</span> tokens into fixed dimensions avoids unbounded VRAM growth, but forces distinct impressions to overlap—creating the exact interference we measure next.
        </span>
      ),
    },
  ];

  // Visual bar heights normalized for SVG
  const kvRatio = Math.min(1, tokenCount / 48);
  const recurrentRatio = 0.08;

  return (
    <section id="section-01" className="scroll-mt-20 border-b border-[var(--mm-rule)] bg-[var(--page-bg)] py-14 sm:py-16">
      <div className="w-full space-y-10">
        <SectionHeader
          number="01"
          category="The memory problem"
          title="Why does memory become a systems problem?"
          subtitle="Standard Transformer models remember past dialogue by storing every single token in an expanding Key-Value cache. Recurrent architectures replace that growing archive with a constant-size state."
          discovery={
            <span>
              Verbatim token retention scales linearly <InlineMath math="\mathcal{O}(T)" /> with context length, whereas recurrent memory compresses information into a constant <InlineMath math="\mathcal{O}(1)" /> state footprint.
            </span>
          }
        />

        <StickyScrollySection
          steps={steps}
          activeStep={activeStep}
          onStepChange={(idx) => {
            setActiveStep(idx);
            if (idx === 1 && tokenCount < 24) setTokenCount(28);
            if (idx === 0 && tokenCount > 20) setTokenCount(12);
          }}
          figure={
            <div data-editorial-reveal="scale" className="p-5 sm:p-7 space-y-6">
              {/* Interactive Parameter Control Strip */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[var(--mm-rule)]">
                <div className="flex-1 max-w-md">
                  <ControlSlider
                    id="section01-token-slider"
                    label={
                      <span className="flex items-center gap-1.5">
                        <span>Context sequence length</span>
                        <InlineMath math="(T \text{ tokens})" />
                      </span>
                    }
                    value={tokenCount}
                    min={4}
                    max={48}
                    step={2}
                    unit="tokens"
                    onChange={(val) => setTokenCount(val)}
                  />
                </div>

                {/* Tabular Footprint Readout */}
                <div className="flex items-center gap-6 font-mono tabular-nums text-xs shrink-0">
                  <div>
                    <div className="text-[var(--text-muted)]">KV Cache O(T)</div>
                    <div className="text-lg font-semibold text-[var(--mm-amber)]">{totalKVMemoryMB} MB</div>
                  </div>
                  <div className="h-8 w-px bg-[var(--mm-rule)]" aria-hidden="true" />
                  <div>
                    <div className="text-[var(--text-muted)]">Recurrent O(1)</div>
                    <div className="text-lg font-semibold text-[var(--mm-teal)]">{fixedRecurrentSizeKB} KB</div>
                  </div>
                </div>
              </div>

              {/* Bespoke SVG Narrative Illustration: Expanding Token Cache vs Fixed Latent State */}
              <svg
                viewBox="0 0 640 270"
                className="w-full h-auto block select-none"
                role="img"
                aria-label="Comparison between growing token KV cache and fixed-size recurrent coordinates"
              >
                {/* Top Track: KV Cache Token Chain */}
                <g opacity={activeStep === 2 ? 0.45 : 1}>
                  <text x="12" y="20" fontSize="11" fontFamily="var(--font-mono)" fontWeight="600" fill="var(--mm-amber)">
                    1. TRANSFORMER KV CACHE · O(T) LINEAR EXPANSION
                  </text>
                  <text x="628" y="20" textAnchor="end" fontSize="11" fontFamily="var(--font-mono)" fill="var(--text-secondary)">
                    {tokenCount} / 48 tokens ({totalKVMemoryMB} MB)
                  </text>

                  {/* Growing footprint bar */}
                  <rect x="12" y="30" width="616" height="10" rx="2" fill="var(--surface-soft)" />
                  <rect
                    x="12"
                    y="30"
                    width={Math.max(18, 616 * kvRatio)}
                    height="10"
                    rx="2"
                    fill="var(--mm-amber)"
                    style={{ transition: 'width 320ms cubic-bezier(0.22, 1, 0.36, 1)' }}
                  />

                  {/* Token cells rendered cleanly */}
                  {tokens.slice(0, 18).map((tok, i) => {
                    const row = Math.floor(i / 6);
                    const col = i % 6;
                    const x = 12 + col * 102;
                    const y = 52 + row * 28;
                    return (
                      <g key={`${tok}-${i}`}>
                        <rect
                          x={x}
                          y={y}
                          width="96"
                          height="22"
                          rx="3"
                          fill="var(--surface)"
                          stroke="var(--mm-rule-strong)"
                          strokeWidth="1"
                        />
                        <text
                          x={x + 10}
                          y={y + 15}
                          fontSize="9.5"
                          fontFamily="var(--font-mono)"
                          fill="var(--text-muted)"
                        >
                          {i + 1}
                        </text>
                        <text
                          x={x + 28}
                          y={y + 15}
                          fontSize="10.5"
                          fontFamily="var(--font-sans)"
                          fill="var(--text-primary)"
                        >
                          {tok.slice(0, 9)}
                        </text>
                      </g>
                    );
                  })}
                  {tokenCount > 18 && (
                    <text x="12" y="148" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--mm-amber)">
                      + {tokenCount - 18} additional token entries appended to VRAM...
                    </text>
                  )}
                </g>

                {/* Divider */}
                <line x1="12" y1="164" x2="628" y2="164" stroke="var(--mm-rule)" strokeWidth="1" strokeDasharray="3 3" />

                {/* Bottom Track: Fixed Recurrent Coordinates */}
                <g opacity={activeStep === 0 || activeStep === 1 ? 0.5 : 1}>
                  <text x="12" y="186" fontSize="11" fontFamily="var(--font-mono)" fontWeight="600" fill="var(--mm-teal)">
                    2. FIXED RECURRENT STATE · O(1) CONSTANT FOOTPRINT
                  </text>
                  <text x="628" y="186" textAnchor="end" fontSize="11" fontFamily="var(--font-mono)" fill="var(--text-secondary)">
                    8 coordinates always ({fixedRecurrentSizeKB} KB)
                  </text>

                  {/* Fixed footprint bar */}
                  <rect x="12" y="196" width="616" height="10" rx="2" fill="var(--surface-soft)" />
                  <rect
                    x="12"
                    y="196"
                    width={616 * recurrentRatio}
                    height="10"
                    rx="2"
                    fill="var(--mm-teal)"
                  />

                  {/* Fixed 8 coordinates */}
                  {Array.from({ length: 8 }).map((_, i) => {
                    const val = Math.sin((i + 1) * tokenCount * 0.4);
                    const x = 12 + i * 77.5;
                    const barHeight = Math.abs(val) * 20;
                    const isPos = val >= 0;
                    return (
                      <g key={i}>
                        <rect
                          x={x}
                          y="214"
                          width="72"
                          height="44"
                          rx="3"
                          fill="var(--surface)"
                          stroke={activeStep === 3 ? 'var(--mm-signal)' : 'var(--mm-rule-strong)'}
                          strokeWidth={activeStep === 3 ? 1.5 : 1}
                        />
                        <text
                          x={x + 8}
                          y="228"
                          fontSize="9.5"
                          fontFamily="var(--font-mono)"
                          fill="var(--text-muted)"
                        >
                          h{i}
                        </text>
                        <rect
                          x={x + 56}
                          y={236 - barHeight / 2}
                          width="8"
                          height={Math.max(3, barHeight)}
                          rx="1"
                          fill={isPos ? 'var(--mm-signal)' : 'var(--mm-coral)'}
                          style={{
                            transition:
                              'height 320ms cubic-bezier(0.22, 1, 0.36, 1), y 320ms cubic-bezier(0.22, 1, 0.36, 1), fill 240ms ease',
                          }}
                        />
                        <text
                          x={x + 8}
                          y="249"
                          fontSize="11"
                          fontWeight="600"
                          fontFamily="var(--font-mono)"
                          fill="var(--text-primary)"
                        >
                          {val.toFixed(2)}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>

              <FigureCaption
                number="FIG. 1.1"
                title="Linear token cache expansion vs. constant recurrent state coordinates."
                description="KV cache estimate assumes ~0.5 MB per token in 7B-class active inference; coordinate values visualize fixed-size superposition."
                legend={[
                  { label: 'KV Cache O(T)', color: 'var(--mm-amber)' },
                  { label: 'Recurrent O(1)', color: 'var(--mm-teal)' },
                  { label: 'Positive / Negative coordinate', color: 'var(--mm-signal)' },
                ]}
                source="Educational scaling illustration"
              />
            </div>
          }
        />
      </div>
    </section>
  );
};

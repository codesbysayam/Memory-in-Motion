import React from 'react';
import { GitFork, ArrowUpRight } from 'lucide-react';
import { SectionHeader } from './ui/SectionHeader';
import { EvidenceBadge } from './ui/EvidenceBadge';
import { MemoryBridge } from './MemoryBridge';
import { GlossaryTerm } from './GlossaryTerm';
import { FigureCaption } from './essay/FigureCaption';

const BDH_PILLARS = [
  {
    num: '01',
    title: 'Local Graph Interactions',
    tag: 'O(k) Sparse Edges',
    desc: 'Neurons pass signals only across sparse local neighbors, replacing the quadratic O(T²) all-to-all attention matrix of Transformers.',
  },
  {
    num: '02',
    title: 'Non-Negative Activations',
    tag: 'y ≥ 0 (ReLU / Cortical)',
    desc: 'Neurons emit non-negative firing rates or stay silent, encouraging natural selectivity rather than destructive cancellation.',
  },
  {
    num: '03',
    title: 'Scale-Free Fractal Topology',
    tag: 'Hub & Community Nodes',
    desc: 'Connectivity follows heavy-tailed power laws: specialized hub neurons route global signals across localized clusters.',
  },
  {
    num: '04',
    title: 'Synaptic Memory Weights',
    tag: 'Plasticity W_ij(t)',
    desc: 'Information lives inside the plastic weights connecting particles, rather than overloading one monolithic transient vector.',
  },
  {
    num: '05',
    title: 'Recurrent Graph Relaxation',
    tag: 'Latent Multi-Hop Steps',
    desc: 'Before predicting the next token, the graph performs internal relaxation passes that stabilize distributed concepts.',
  },
];

export const Section07MeetBDH: React.FC = () => {
  return (
    <section id="section-07" className="scroll-mt-20 border-b border-[var(--mm-rule)] bg-[var(--page-bg)] py-16 sm:py-20 relative text-[var(--text-primary)]">
      <div className="space-y-10">
        <SectionHeader
          number="07"
          category="Part II · Post-transformer frontier"
          title="Now meet Dragon Hatchling (BDH)"
          subtitle="A brain-inspired post-transformer architecture introduced by Pathway that relocates memory from a growing token list or dense hidden vector into the plastic edges of a sparse particle graph."
          discovery={
            <span>
              <GlossaryTerm term="bdh-architecture">BDH</GlossaryTerm> replaces dense 1D vector superposition with a scale-free particle graph featuring non-negative sparse activations and <GlossaryTerm term="Hebbian plasticity">Hebbian synaptic memory</GlossaryTerm>.
            </span>
          }
        />

        {/* Custom Side-by-Side SVG: Dense Vector Matrix vs Sparse Synaptic Particle Graph */}
        <figure className="essay-figure-stage p-5 sm:p-7 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--mm-rule)] gap-6 md:gap-0">
            {/* Left SVG: Monolithic Dense Matrix */}
            <div className="md:pr-6 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-[var(--mm-coral)]">Monolithic Dense Matrix (M ∈ ℝ^D×D)</span>
                <span className="text-[var(--mm-muted)]">Stages 01–04</span>
              </div>
              <svg viewBox="0 0 280 120" className="w-full h-auto" aria-label="Dense overlapping outer product matrix">
                <rect x="75" y="14" width="130" height="92" rx="4" fill="var(--mm-paper-bright)" stroke="var(--mm-rule-strong)" strokeWidth="1" />
                {Array.from({ length: 5 }).map((_, r) =>
                  Array.from({ length: 6 }).map((__, c) => (
                    <rect
                      key={`${r}-${c}`}
                      x={85 + c * 19}
                      y={22 + r * 16}
                      width="15"
                      height="12"
                      rx="2"
                      fill={(r + c) % 2 === 0 ? 'var(--mm-coral)' : 'var(--mm-signal)'}
                      fillOpacity={0.22 + ((r * 3 + c) % 5) * 0.14}
                    />
                  ))
                )}
                <text x="140" y="116" textAnchor="middle" fill="var(--mm-muted)" fontSize="9.5" fontFamily="var(--font-mono)">
                  All facts overwrite every cell simultaneously
                </text>
              </svg>
            </div>

            {/* Right SVG: Sparse Scale-Free Synaptic Graph */}
            <div className="md:pl-6 pt-5 md:pt-0 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-[var(--mm-signal)]">Sparse Scale-Free Graph (BDH)</span>
                <span className="text-[var(--mm-muted)]">arXiv:2509.26507</span>
              </div>
              <svg viewBox="0 0 280 120" className="w-full h-auto" aria-label="Sparse scale-free synaptic particle graph">
                {[
                  [65, 58, 125, 36, true],
                  [65, 58, 130, 82, false],
                  [125, 36, 185, 52, true],
                  [130, 82, 185, 52, false],
                  [185, 52, 232, 34, true],
                  [185, 52, 230, 86, false],
                  [65, 58, 42, 30, false],
                ].map(([x1, y1, x2, y2, active], idx) => (
                  <line
                    key={idx}
                    x1={Number(x1)}
                    y1={Number(y1)}
                    x2={Number(x2)}
                    y2={Number(y2)}
                    stroke={active ? 'var(--mm-signal)' : 'var(--mm-rule-strong)'}
                    strokeWidth={active ? 2.2 : 1}
                    strokeOpacity={active ? 0.9 : 0.65}
                  />
                ))}
                {[
                  { x: 42, y: 30, r: 4, on: false },
                  { x: 65, y: 58, r: 6.5, on: true },
                  { x: 125, y: 36, r: 5.5, on: true },
                  { x: 130, y: 82, r: 4.5, on: false },
                  { x: 185, y: 52, r: 8, on: true },
                  { x: 232, y: 34, r: 5.5, on: true },
                  { x: 230, y: 86, r: 4, on: false },
                ].map((n, idx) => (
                  <circle
                    key={idx}
                    cx={n.x}
                    cy={n.y}
                    r={n.r}
                    fill={n.on ? 'var(--mm-signal)' : 'var(--mm-paper-bright)'}
                    stroke={n.on ? 'var(--mm-signal)' : 'var(--mm-rule-strong)'}
                    strokeWidth="1.5"
                  />
                ))}
                <text x="140" y="116" textAnchor="middle" fill="var(--mm-muted)" fontSize="9.5" fontFamily="var(--font-mono)">
                  Only co-active hub synapses update along sparse paths
                </text>
              </svg>
            </div>
          </div>

          <FigureCaption
            figure="Fig. 7.1"
            title="Dense superposition updates every cell; BDH routes local plasticity across sparse active edges."
            source="Architectural diagram synthesizing Pathway BDH specification (arXiv:2509.26507)"
          />
        </figure>

        {/* Responsive Grid: Epistemic Boundary & Numbered Architectural Pillars */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Epistemic Boundary & SSM Distinction */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-5 border-t border-b border-[var(--mm-rule)] bg-[var(--mm-paper-bright)] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--mm-signal)] font-semibold">
                  Epistemic boundary · Toy vs. published architecture
                </span>
                <EvidenceBadge category="PRIMARY SOURCE" />
              </div>
              <p className="text-sm text-[var(--mm-ink-soft)] font-sans leading-relaxed">
                Sections 01–04 ran deterministic toy vector computations in your browser to expose superposition mechanics. <strong className="text-[var(--mm-ink)]">BDH is a published architecture from Pathway</strong>. The graph explorers below illustrate conceptual principles and local Hebbian updates—they are not weights from a multi-billion parameter pre-trained checkpoint.
              </p>
            </div>

            <div className="space-y-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--mm-amber)] font-semibold block">
                Specification rule · Why BDH is not a classical SSM
              </span>
              <p className="text-xs sm:text-sm text-[var(--mm-ink-soft)] font-sans leading-relaxed">
                Non-transformer models are often lumped together as &ldquo;State Space Models.&rdquo; Pathway distinguishes BDH geometrically and biologically:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[var(--mm-rule)] border border-[var(--mm-rule)] bg-[var(--mm-paper-bright)] rounded-md text-xs">
                <div className="p-4 space-y-1">
                  <span className="font-mono text-[11px] text-[var(--mm-muted)] block">Mamba / Classical SSM</span>
                  <div className="font-mono text-[var(--mm-amber)] font-semibold">Continuous Linear ODE</div>
                  <p className="text-xs text-[var(--mm-ink-soft)] leading-relaxed pt-1">
                    Discretized 1D recurrences tracking hidden states along a single sequential axis.
                  </p>
                </div>
                <div className="p-4 space-y-1">
                  <span className="font-mono text-[11px] text-[var(--mm-muted)] block">Dragon Hatchling (BDH)</span>
                  <div className="font-mono text-[var(--mm-signal)] font-semibold">Scale-Free Particle Graph</div>
                  <p className="text-xs text-[var(--mm-ink-soft)] leading-relaxed pt-1">
                    Discrete neuron particles with non-negative firing and sparse Hebbian synaptic state.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Numbered 01–05 Hairline List */}
          <div className="lg:col-span-6 space-y-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--mm-muted)] block">
              Five architectural mechanisms in BDH
            </span>

            <ol className="divide-y divide-[var(--mm-rule)] border-t border-b border-[var(--mm-rule)]">
              {BDH_PILLARS.map((p) => (
                <li key={p.num} className="py-3.5 space-y-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="flex items-baseline gap-2.5">
                      <span className="font-mono text-xs font-semibold text-[var(--mm-signal)]">{p.num}</span>
                      <span className="font-serif text-base text-[var(--mm-ink)]">{p.title}</span>
                    </div>
                    <span className="font-mono text-[11px] text-[var(--mm-muted)]">{p.tag}</span>
                  </div>
                  <p className="text-xs text-[var(--mm-ink-soft)] font-sans leading-relaxed pl-6">
                    {p.desc}
                  </p>
                </li>
              ))}
            </ol>

            {/* Paper & Official Codebase Reference Line */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div>
                <span className="text-[var(--mm-ink)] font-semibold">arXiv:2509.26507</span>
                <span className="text-[var(--mm-muted)] ml-2">&ldquo;The Dragon Hatchling&rdquo; (Pathway)</span>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com/pathwaycom/bdh"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[var(--mm-signal)] hover:underline font-semibold"
                >
                  <GitFork className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
                <a
                  href="https://arxiv.org/abs/2509.26507"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[var(--mm-signal)] hover:underline font-semibold"
                >
                  <span>Paper</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Conceptual Architecture Bridge */}
        <div className="pt-4">
          <MemoryBridge />
        </div>
      </div>
    </section>
  );
};


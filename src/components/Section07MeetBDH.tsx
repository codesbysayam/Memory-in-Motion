import React from 'react';
import { ShieldAlert, BookOpen, GitFork, ArrowUpRight, Sparkles } from 'lucide-react';
import { SectionHeader } from './ui/SectionHeader';
import { EvidenceBadge } from './ui/EvidenceBadge';
import { MemoryBridge } from './MemoryBridge';
import { GlossaryTerm } from './GlossaryTerm';

export const Section07MeetBDH: React.FC = () => {
  return (
    <section id="section-07" className="scroll-mt-20 border-b border-[var(--border)] bg-[var(--page-bg)] py-20 relative text-[var(--text-primary)]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 space-y-12">
        {/* Visual Milestone Banner for Part II */}
        <div className="inline-flex flex-wrap items-center gap-2 rounded-xl bg-[#F3EFFF] border border-[#E2D8FA] px-3.5 py-1.5 font-mono text-xs text-[#6842C2] max-w-full">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#6842C2] shrink-0" />
            <span className="font-bold uppercase tracking-widest whitespace-nowrap">PART II: THE DRAGON HATCHLING (BDH)</span>
          </div>
          <span className="text-[#D8D4CB] hidden sm:inline">·</span>
          <span className="text-[#2A2926] text-xs sm:text-sm">From Toy Vectors to Synaptic Graphs</span>
        </div>

        <SectionHeader
          number="07"
          category="POST-TRANSFORMER FRONTIER"
          title="Now meet Dragon Hatchling (BDH)"
          subtitle="A brain-inspired post-transformer architecture introduced by Pathway that changes where memory and computation reside: moving from dense vector superpositions to sparse synaptic graph networks."
          discovery={
            <span>
              <GlossaryTerm term="bdh-architecture">BDH</GlossaryTerm> abandons dense 1D vector states in favor of a scale-free particle graph with non-negative sparse activations and <GlossaryTerm term="Hebbian plasticity">Hebbian synaptic memory</GlossaryTerm>.
            </span>
          }
        />

        {/* Responsive Grid Layout for Content & Visuals */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Epistemic Boundary & The Core Distinction */}
          <div className="md:col-span-1 lg:col-span-6 space-y-6">
            {/* Epistemic Boundary Notice */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 space-y-3 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs uppercase tracking-wider text-[var(--accent-blue-text)] font-bold flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[var(--accent-blue-text)] shrink-0" />
                  <span>MANDATORY EPISTEMIC BOUNDARY</span>
                </span>
                <EvidenceBadge category="PRIMARY SOURCE" />
              </div>
              <p className="text-sm text-[var(--text-primary)] font-sans leading-relaxed">
                &ldquo;Everything in Sections 01–06 was our educational toy model designed to isolate the fundamental physics of vector interference. <strong>BDH is a real, published research architecture from Pathway</strong>. Our toy models illustrate related conceptual principles; they are not an execution of the full production BDH engine.&rdquo;
              </p>
            </div>

            {/* Critical Distinction: Why BDH is NOT an SSM / Mamba */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[var(--accent-yellow-text)] shrink-0" />
                <h3 className="font-mono text-xs font-bold uppercase text-[var(--accent-yellow-text)] tracking-wider">
                  Specification Rule: BDH is NOT an SSM / Mamba
                </h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
                Popular machine learning narratives often conflate all non-transformer recurrent models as &ldquo;State Space Models&rdquo; (SSMs). Pathway&apos;s formal specification emphasizes that BDH is biologically distinct:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs font-mono">
                <div className="rounded-xl bg-[var(--surface-soft)] p-4 border border-[var(--border)] space-y-1">
                  <span className="text-xs text-[var(--text-muted)] block font-semibold">Mamba / Classical SSM</span>
                  <div className="text-[var(--accent-yellow-text)] font-semibold">Continuous Linear ODE</div>
                  <p className="text-xs text-[var(--text-secondary)] leading-normal pt-1 font-sans">
                    Discretized 1D Kalman-style filters tracking tokens along a single temporal axis.
                  </p>
                </div>

                <div className="rounded-xl bg-[var(--surface-soft)] p-4 border border-[var(--border)] space-y-1">
                  <span className="text-xs text-[var(--text-muted)] block font-semibold">Dragon Hatchling (BDH)</span>
                  <div className="text-[var(--accent-blue-text)] font-semibold">Scale-Free Particle Graph</div>
                  <p className="text-xs text-[var(--text-secondary)] leading-normal pt-1 font-sans">
                    Discrete neuron particles communicating across a sparse graph, with non-negative activations and Hebbian synaptic updates.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: The 5 Foundational Pillars of BDH */}
          <div className="md:col-span-1 lg:col-span-6 space-y-3">
            <span className="font-mono text-xs tracking-widest text-[var(--text-muted)] block">
              The Five Foundational Pillars of BDH:
            </span>

            <div className="space-y-3">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-1.5 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <span className="font-mono text-xs font-bold text-[var(--accent-blue-text)]">01. Local Graph Interactions</span>
                  <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--surface-soft)] px-1.5 py-0.5 rounded border border-[var(--border)]">O(k) Sparse Edges</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
                  Neurons only pass signals across neighbors on a sparse graph, eliminating the quadratic O(T²) all-to-all attention matrix of Transformers.
                </p>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-1.5 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <span className="font-mono text-xs font-bold text-[var(--accent-green-text)]">02. Non-Negative Activations</span>
                  <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--surface-soft)] px-1.5 py-0.5 rounded border border-[var(--border)]">y ≥ 0 (ReLU / Cortical)</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
                  Neurons fire only positive signals or zero. Non-negativity enforces natural competition and prevents runaway negative feedback loops.
                </p>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-1.5 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <span className="font-mono text-xs font-bold text-[var(--accent-green-text)]">03. Scale-Free Fractal Topology</span>
                  <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--surface-soft)] px-1.5 py-0.5 rounded border border-[var(--border)]">Hub & Community Nodes</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
                  Degree distributions follow a power law: most neurons have few connections, while specialized hub neurons rapidly route global signals.
                </p>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-1.5 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <span className="font-mono text-xs font-bold text-[var(--accent-blue-text)]">04. Synaptic Memory Weights</span>
                  <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--surface-soft)] px-1.5 py-0.5 rounded border border-[var(--border)]">Plasticity W_ij(t)</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
                  Information is stored in the connections (synaptic weights) between neurons, not purely inside a single transient state vector.
                </p>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-1.5 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <span className="font-mono text-xs font-bold text-[var(--accent-yellow-text)]">05. Recurrent Graph Relaxation</span>
                  <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--surface-soft)] px-1.5 py-0.5 rounded border border-[var(--border)]">Latent Multi-Hop Steps</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
                  Before outputting a token, the network can perform multiple internal relaxation cycles, enabling deep reasoning per token.
                </p>
              </div>
            </div>

            {/* Academic Paper & Official GitHub Reference Footer */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
              <div className="min-w-0">
                <span className="text-[var(--text-primary)] font-semibold">arXiv:2509.26507</span>
                <span className="text-[var(--text-muted)] ml-2 block sm:inline">&ldquo;The Dragon Hatchling&rdquo; (Pathway)</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <a
                  href="https://github.com/pathwaycom/bdh"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] hover:text-[var(--accent-blue-text)] hover:border-[var(--accent-blue-text)] transition-colors whitespace-nowrap"
                >
                  <GitFork className="w-3.5 h-3.5 text-[var(--accent-blue-text)] shrink-0" />
                  <span>Read implementation</span>
                  <ArrowUpRight className="w-3 h-3 shrink-0" />
                </a>
                <a
                  href="https://arxiv.org/abs/2509.26507"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[var(--accent-blue-text)] hover:underline font-semibold whitespace-nowrap"
                >
                  <span>Paper</span>
                  <ArrowUpRight className="w-3 h-3 shrink-0" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Conceptual Architecture Bridge: Where Does Memory Live? */}
        <div className="mt-12">
          <MemoryBridge />
        </div>
      </div>
    </section>
  );
};

import React from 'react';
import { ShieldAlert, BookOpen, Cpu, ArrowUpRight, Sparkles, Network, GitFork } from 'lucide-react';
import { SectionHeader } from './ui/SectionHeader';
import { EvidenceBadge } from './ui/EvidenceBadge';
import { Tooltip } from './ui/Tooltip';
import { MemoryBridge } from './MemoryBridge';

export const Section07MeetBDH: React.FC = () => {
  return (
    <section id="section-07" className="scroll-mt-20 border-b border-[#252A35] bg-[#07080B] py-14 relative">
      {/* Decorative subtle ambient marker for Part II transition */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Visual Milestone Banner for Part II */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-lg bg-violet-950/40 border border-violet-500/40 px-3 py-1.5 font-mono text-xs text-violet-300">
          <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" />
          <span className="font-semibold uppercase tracking-widest">PART II: THE DRAGON HATCHLING (BDH)</span>
          <span className="text-[#8F96A3]">·</span>
          <span className="text-[#F4F5F7]">From Toy Vectors to Synaptic Graphs</span>
        </div>

        <SectionHeader
          number="07"
          category="POST-TRANSFORMER FRONTIER"
          title="Now Meet Dragon Hatchling (BDH)"
          subtitle="A brain-inspired post-transformer architecture introduced by Pathway that changes where memory and computation reside: moving from dense vector superpositions to sparse synaptic graph networks."
          discovery="BDH abandons dense 1D vector states in favor of a scale-free particle graph with non-negative sparse activations and Hebbian synaptic memory."
        />

        {/* 12-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Epistemic Boundary & The Core Distinction */}
          <div className="lg:col-span-6 space-y-5">
            {/* Epistemic Boundary Notice */}
            <div className="rounded-xl border border-violet-500/40 bg-[#11141A] p-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-violet-300 font-semibold flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#22D3EE]" />
                  MANDATORY EPISTEMIC BOUNDARY
                </span>
                <EvidenceBadge category="PRIMARY SOURCE" />
              </div>
              <p className="text-sm text-[#F4F5F7] leading-relaxed">
                "Everything in Sections 01–06 was our educational toy model designed to isolate the fundamental physics of vector interference. <strong>BDH is a real, published research architecture from Pathway</strong>. Our toy models illustrate related conceptual principles; they are not an execution of the full production BDH engine."
              </p>
            </div>

            {/* Critical Distinction: Why BDH is NOT an SSM / Mamba */}
            <div className="rounded-xl border border-amber-500/40 bg-[#11141A] p-5 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <h3 className="font-mono text-xs font-bold uppercase text-amber-300 tracking-wider">
                  Specification Rule: BDH is NOT an SSM / Mamba
                </h3>
              </div>
              <p className="text-xs text-[#8F96A3] leading-relaxed">
                Popular machine learning narratives often conflate all non-transformer recurrent models as "State Space Models" (SSMs). Pathway's formal specification emphasizes that BDH is biologically distinct:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs font-mono">
                <div className="rounded-lg bg-[#151922] p-3 border border-[#252A35] space-y-1">
                  <span className="text-[10px] text-zinc-400 block uppercase">Mamba / Classical SSM</span>
                  <div className="text-amber-400 font-semibold">Continuous Linear ODE</div>
                  <p className="text-[11px] text-[#8F96A3] leading-normal pt-1 font-sans">
                    Discretized 1D Kalman-style filters (h'(t) = Ah + Bx) tracking tokens along a single temporal axis.
                  </p>
                </div>

                <div className="rounded-lg bg-[#151922] p-3 border border-violet-500/30 space-y-1">
                  <span className="text-[10px] text-violet-300 block uppercase">Dragon Hatchling (BDH)</span>
                  <div className="text-violet-300 font-semibold">Scale-Free Particle Graph</div>
                  <p className="text-[11px] text-[#8F96A3] leading-normal pt-1 font-sans">
                    Discrete neuron particles communicating across a sparse graph, with non-negative activations and Hebbian synaptic updates.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: The 5 Foundational Pillars of BDH */}
          <div className="lg:col-span-6 space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-[#8F96A3] block">
              The Five Foundational Pillars of BDH:
            </span>

            <div className="space-y-2.5">
              <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-violet-400">01. Local Graph Interactions</span>
                  <span className="text-[10px] font-mono text-[#8F96A3]">O(k) Sparse Edges</span>
                </div>
                <p className="text-xs text-[#8F96A3] leading-relaxed">
                  Neurons only pass signals across neighbors on a sparse graph, eliminating the quadratic O(T²) all-to-all attention matrix of Transformers.
                </p>
              </div>

              <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#22D3EE]">02. Non-Negative Activations</span>
                  <span className="text-[10px] font-mono text-[#8F96A3]">y ≥ 0 (ReLU / Cortical)</span>
                </div>
                <p className="text-xs text-[#8F96A3] leading-relaxed">
                  Neurons fire only positive signals or zero. Non-negativity enforces natural competition and prevents runaway negative feedback loops.
                </p>
              </div>

              <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-400">03. Scale-Free Fractal Topology</span>
                  <span className="text-[10px] font-mono text-[#8F96A3]">Hub & Community Nodes</span>
                </div>
                <p className="text-xs text-[#8F96A3] leading-relaxed">
                  Degree distributions follow a power law: most neurons have few connections, while specialized hub neurons rapidly route global signals.
                </p>
              </div>

              <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-purple-400">04. Synaptic Memory Weights</span>
                  <span className="text-[10px] font-mono text-[#8F96A3]">Plasticity W_ij(t)</span>
                </div>
                <p className="text-xs text-[#8F96A3] leading-relaxed">
                  Information is stored in the connections (synaptic weights) between neurons, not purely inside a single transient state vector.
                </p>
              </div>

              <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-400">05. Recurrent Graph Relaxation</span>
                  <span className="text-[10px] font-mono text-[#8F96A3]">Latent Multi-Hop Steps</span>
                </div>
                <p className="text-xs text-[#8F96A3] leading-relaxed">
                  Before outputting a token, the network can perform multiple internal relaxation cycles, enabling deep reasoning per token.
                </p>
              </div>
            </div>

            {/* Academic Paper & Official GitHub Reference Footer */}
            <div className="rounded-xl border border-[#252A35] bg-[#151922] p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div>
                <span className="text-white font-semibold">arXiv:2509.26507</span>
                <span className="text-[#8F96A3] ml-2">"The Dragon Hatchling" (Pathway)</span>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com/pathwaycom/bdh"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#11141A] border border-[#252A35] text-white hover:text-[#22D3EE] hover:border-[#22D3EE]/50 transition-colors"
                >
                  <GitFork className="w-3.5 h-3.5 text-violet-400" />
                  <span>Read the real implementation</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
                <a
                  href="https://arxiv.org/abs/2509.26507"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[#22D3EE] hover:underline"
                >
                  <span>Paper</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
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

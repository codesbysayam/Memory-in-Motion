import React from 'react';
import { ShieldAlert, BookOpen, GitFork, ArrowUpRight, Sparkles } from 'lucide-react';
import { SectionHeader } from './ui/SectionHeader';
import { EvidenceBadge } from './ui/EvidenceBadge';
import { MemoryBridge } from './MemoryBridge';

export const Section07MeetBDH: React.FC = () => {
  return (
    <section id="section-07" className="scroll-mt-20 border-b border-[#E5E0D8] bg-[#FBF9F5] py-20 relative text-[#151515]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 space-y-12">
        {/* Visual Milestone Banner for Part II */}
        <div className="inline-flex items-center gap-2 rounded-xl bg-[#F3EFFF] border border-[#E2D8FA] px-3.5 py-1.5 font-mono text-xs text-[#6842C2]">
          <Sparkles className="w-3.5 h-3.5 text-[#6842C2]" />
          <span className="font-bold uppercase tracking-widest">PART II: THE DRAGON HATCHLING (BDH)</span>
          <span className="text-[#D8D4CB]">·</span>
          <span className="text-[#2A2926]">From Toy Vectors to Synaptic Graphs</span>
        </div>

        <SectionHeader
          number="07"
          category="POST-TRANSFORMER FRONTIER"
          title="Now meet Dragon Hatchling (BDH)"
          subtitle="A brain-inspired post-transformer architecture introduced by Pathway that changes where memory and computation reside: moving from dense vector superpositions to sparse synaptic graph networks."
          discovery="BDH abandons dense 1D vector states in favor of a scale-free particle graph with non-negative sparse activations and Hebbian synaptic memory."
        />

        {/* 12-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Epistemic Boundary & The Core Distinction */}
          <div className="lg:col-span-6 space-y-6">
            {/* Epistemic Boundary Notice */}
            <div className="rounded-2xl border border-[#E2D8FA] bg-[#FFFFFF] p-6 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-[#6842C2] font-bold flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#6842C2]" />
                  MANDATORY EPISTEMIC BOUNDARY
                </span>
                <EvidenceBadge category="PRIMARY SOURCE" />
              </div>
              <p className="text-sm text-[#2A2926] font-sans leading-relaxed">
                &ldquo;Everything in Sections 01–06 was our educational toy model designed to isolate the fundamental physics of vector interference. <strong>BDH is a real, published research architecture from Pathway</strong>. Our toy models illustrate related conceptual principles; they are not an execution of the full production BDH engine.&rdquo;
              </p>
            </div>

            {/* Critical Distinction: Why BDH is NOT an SSM / Mamba */}
            <div className="rounded-2xl border border-[#F5E2C4] bg-[#FFFDF8] p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#A46622]" />
                <h3 className="font-mono text-xs font-bold uppercase text-[#A46622] tracking-wider">
                  Specification Rule: BDH is NOT an SSM / Mamba
                </h3>
              </div>
              <p className="text-xs text-[#52504A] font-sans leading-relaxed">
                Popular machine learning narratives often conflate all non-transformer recurrent models as &ldquo;State Space Models&rdquo; (SSMs). Pathway&apos;s formal specification emphasizes that BDH is biologically distinct:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs font-mono">
                <div className="rounded-xl bg-[#FAF8F5] p-4 border border-[#EAE6DF] space-y-1">
                  <span className="text-[10px] text-[#716F68] block uppercase">Mamba / Classical SSM</span>
                  <div className="text-[#A46622] font-semibold">Continuous Linear ODE</div>
                  <p className="text-[11px] text-[#716F68] leading-normal pt-1 font-sans">
                    Discretized 1D Kalman-style filters tracking tokens along a single temporal axis.
                  </p>
                </div>

                <div className="rounded-xl bg-[#F3EFFF] p-4 border border-[#E2D8FA] space-y-1">
                  <span className="text-[10px] text-[#6842C2] block uppercase">Dragon Hatchling (BDH)</span>
                  <div className="text-[#6842C2] font-semibold">Scale-Free Particle Graph</div>
                  <p className="text-[11px] text-[#716F68] leading-normal pt-1 font-sans">
                    Discrete neuron particles communicating across a sparse graph, with non-negative activations and Hebbian synaptic updates.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: The 5 Foundational Pillars of BDH */}
          <div className="lg:col-span-6 space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-[#716F68] block">
              The Five Foundational Pillars of BDH:
            </span>

            <div className="space-y-3">
              <div className="rounded-xl border border-[#E5E0D8] bg-[#FFFFFF] p-4 space-y-1 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#6842C2]">01. Local Graph Interactions</span>
                  <span className="text-[10px] font-mono text-[#716F68]">O(k) Sparse Edges</span>
                </div>
                <p className="text-xs text-[#52504A] font-sans leading-relaxed">
                  Neurons only pass signals across neighbors on a sparse graph, eliminating the quadratic O(T²) all-to-all attention matrix of Transformers.
                </p>
              </div>

              <div className="rounded-xl border border-[#E5E0D8] bg-[#FFFFFF] p-4 space-y-1 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#167C80]">02. Non-Negative Activations</span>
                  <span className="text-[10px] font-mono text-[#716F68]">y ≥ 0 (ReLU / Cortical)</span>
                </div>
                <p className="text-xs text-[#52504A] font-sans leading-relaxed">
                  Neurons fire only positive signals or zero. Non-negativity enforces natural competition and prevents runaway negative feedback loops.
                </p>
              </div>

              <div className="rounded-xl border border-[#E5E0D8] bg-[#FFFFFF] p-4 space-y-1 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#247A4B]">03. Scale-Free Fractal Topology</span>
                  <span className="text-[10px] font-mono text-[#716F68]">Hub & Community Nodes</span>
                </div>
                <p className="text-xs text-[#52504A] font-sans leading-relaxed">
                  Degree distributions follow a power law: most neurons have few connections, while specialized hub neurons rapidly route global signals.
                </p>
              </div>

              <div className="rounded-xl border border-[#E5E0D8] bg-[#FFFFFF] p-4 space-y-1 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#6842C2]">04. Synaptic Memory Weights</span>
                  <span className="text-[10px] font-mono text-[#716F68]">Plasticity W_ij(t)</span>
                </div>
                <p className="text-xs text-[#52504A] font-sans leading-relaxed">
                  Information is stored in the connections (synaptic weights) between neurons, not purely inside a single transient state vector.
                </p>
              </div>

              <div className="rounded-xl border border-[#E5E0D8] bg-[#FFFFFF] p-4 space-y-1 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#A46622]">05. Recurrent Graph Relaxation</span>
                  <span className="text-[10px] font-mono text-[#716F68]">Latent Multi-Hop Steps</span>
                </div>
                <p className="text-xs text-[#52504A] font-sans leading-relaxed">
                  Before outputting a token, the network can perform multiple internal relaxation cycles, enabling deep reasoning per token.
                </p>
              </div>
            </div>

            {/* Academic Paper & Official GitHub Reference Footer */}
            <div className="rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div>
                <span className="text-[#151515] font-semibold">arXiv:2509.26507</span>
                <span className="text-[#716F68] ml-2">&ldquo;The Dragon Hatchling&rdquo; (Pathway)</span>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com/pathwaycom/bdh"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FFFFFF] border border-[#E5E0D8] text-[#151515] hover:text-[#167C80] hover:border-[#167C80] transition-colors"
                >
                  <GitFork className="w-3.5 h-3.5 text-[#6842C2]" />
                  <span>Read the real implementation</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
                <a
                  href="https://arxiv.org/abs/2509.26507"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[#167C80] hover:underline font-semibold"
                >
                  <span>Paper</span>
                  <ArrowUpRight className="w-3 h-3" />
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

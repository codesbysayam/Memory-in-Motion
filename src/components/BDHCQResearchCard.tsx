import React from 'react';
import { Brain, ExternalLink, Award, TrendingUp, Cpu, CheckCircle2 } from 'lucide-react';

export const BDHCQResearchCard: React.FC = () => {
  return (
    <div className="rounded-2xl border border-[#252A35] bg-[#0C101A] p-6 text-slate-100 space-y-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1D2536] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-800 text-purple-300">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-purple-400 font-bold tracking-wider">
              OFFICIAL RESEARCH FINDINGS
            </div>
            <h4 className="text-base font-bold font-mono text-white">
              BDH-CQ: In-Context Learning with Recurrent Latent Reasoning
            </h4>
          </div>
        </div>

        <a
          href="https://pathway.com/research/introducing-bdh-cq"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-mono font-semibold transition"
        >
          <span>Pathway Article</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* 3 Core Published Findings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="p-4 rounded-xl bg-[#101524] border border-[#1E263C] space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
            <Award className="w-4 h-4 text-cyan-400" />
            <span>1. ARC-AGI-1 & GSM8k</span>
          </div>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            Demonstrates in-context skill acquisition from demonstration pairs on ARC-AGI-1 without fine-tuning weights, matching or exceeding prior recurrent baselines at 150M scale.
          </p>
          <div className="text-[10px] text-cyan-300 font-bold pt-1 border-t border-[#1C2438]">
            150M Parameter Benchmark
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#101524] border border-[#1E263C] space-y-2">
          <div className="flex items-center gap-2 text-purple-400 text-xs font-bold">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span>2. Latent Convergence</span>
          </div>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            Solves multi-hop reasoning by relaxing into synaptic attractor states over multiple internal rounds, eliminating the need to emit hundreds of verbal chain-of-thought tokens.
          </p>
          <div className="text-[10px] text-purple-300 font-bold pt-1 border-t border-[#1C2438]">
            Zero CoT Scratchpad Bloat
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#101524] border border-[#1E263C] space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>3. Memory Efficiency</span>
          </div>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            Maintains constant $O(1)$ inference memory overhead regardless of demonstration sequence length, escaping the $O(N)$ KV-cache explosion of standard transformers.
          </p>
          <div className="text-[10px] text-emerald-300 font-bold pt-1 border-t border-[#1C2438]">
            Constant Memory Footprint
          </div>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-[#070A12] border border-[#182030] text-[11px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <span>Citations: Kosowski et al. (2025) & Pathway Research Team (2026)</span>
        <span className="text-purple-400">ARC-AGI-1 Recurrent In-Context Evaluation</span>
      </div>
    </div>
  );
};

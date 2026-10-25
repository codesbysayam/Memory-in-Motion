import React from 'react';
import { Brain, ExternalLink, Award, TrendingUp, Cpu, CheckCircle2 } from 'lucide-react';

export const BDHCQResearchCard: React.FC = () => {
  return (
    <div className="rounded-xl border border-[#D8DCD8] bg-[#FFFFFF] p-6 text-[#252525] space-y-6 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6DF] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#E7F2FA] border border-[#CDE1F0] text-[#21445B]">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-sans text-[#21445B] font-semibold">
              Published research findings
            </div>
            <h4 className="text-lg font-serif font-bold text-[#252525] tracking-tight">
              BDH-CQ: In-Context Learning with Recurrent Latent Reasoning
            </h4>
          </div>
        </div>

        <a
          href="https://pathway.com/research/introducing-bdh-cq"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#F0EEEA] text-[#252525] border border-[#D8DCD8] text-xs font-sans font-semibold transition"
        >
          <span>Pathway research paper</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#5F625F]" />
        </a>
      </div>

      {/* 3 Core Published Findings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-2">
          <div className="flex items-center gap-2 text-[#21445B] text-xs font-sans font-bold">
            <Award className="w-4 h-4 text-[#21445B]" />
            <span>1. ARC-AGI-1 & GSM8k</span>
          </div>
          <p className="text-xs text-[#5F625F] font-sans leading-relaxed">
            Demonstrates in-context skill acquisition from demonstration pairs on ARC-AGI-1 without fine-tuning weights, matching or exceeding prior recurrent baselines at 150M scale.
          </p>
          <div className="text-xs text-[#21445B] font-sans font-semibold pt-1 border-t border-[#EAE6DF]">
            150M parameter benchmark
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-2">
          <div className="flex items-center gap-2 text-[#A46622] text-xs font-sans font-bold">
            <TrendingUp className="w-4 h-4 text-[#A46622]" />
            <span>2. Latent Convergence</span>
          </div>
          <p className="text-xs text-[#5F625F] font-sans leading-relaxed">
            Solves multi-hop reasoning by relaxing into synaptic attractor states over multiple internal rounds, eliminating the need to emit hundreds of verbal chain-of-thought tokens.
          </p>
          <div className="text-xs text-[#A46622] font-sans font-semibold pt-1 border-t border-[#EAE6DF]">
            Zero CoT scratchpad bloat
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-2">
          <div className="flex items-center gap-2 text-[#247A4B] text-xs font-sans font-bold">
            <Cpu className="w-4 h-4 text-[#247A4B]" />
            <span>3. Memory Efficiency</span>
          </div>
          <p className="text-xs text-[#5F625F] font-sans leading-relaxed">
            Maintains constant O(1) inference memory overhead regardless of demonstration sequence length, escaping the O(N) KV-cache explosion of standard transformers.
          </p>
          <div className="text-xs text-[#247A4B] font-sans font-semibold pt-1 border-t border-[#EAE6DF]">
            Constant memory footprint
          </div>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-[#F7F5EF] border border-[#EAE6DF] text-xs font-sans text-[#5F625F] flex flex-wrap items-center justify-between gap-2">
        <span>Citations: Kosowski et al. (2025) & Pathway Research Team (2026)</span>
        <span className="text-[#21445B] font-medium">ARC-AGI-1 Recurrent In-Context Evaluation</span>
      </div>
    </div>
  );
};

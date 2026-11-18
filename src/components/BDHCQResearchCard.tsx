import React from 'react';
import { Brain, ExternalLink, Award, TrendingUp, Cpu, CheckCircle2 } from 'lucide-react';

export const BDHCQResearchCard: React.FC = () => {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-[var(--text-primary)] space-y-6 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[var(--accent-blue)] border border-[var(--border)] text-[var(--accent-blue-text)]">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-sans text-[var(--accent-blue-text)] font-semibold">
              Published research findings
            </div>
            <h4 className="text-lg font-sans font-semibold text-[var(--text-primary)] tracking-tight">
              BDH-CQ: In-Context Learning with Recurrent Latent Reasoning
            </h4>
          </div>
        </div>

        <a
          href="https://pathway.com/research/introducing-bdh-cq"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-soft)] hover:bg-[var(--color-surface-muted)] text-[var(--text-primary)] border border-[var(--border)] text-xs font-sans font-semibold transition"
        >
          <span>Pathway research paper</span>
          <ExternalLink className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
        </a>
      </div>

      {/* 3 Core Published Findings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-2">
          <div className="flex items-center gap-2 text-[var(--accent-blue-text)] text-xs font-sans font-bold">
            <Award className="w-4 h-4 text-[var(--accent-blue-text)]" />
            <span>1. ARC-AGI-1 &amp; GSM8k</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
            Demonstrates in-context skill acquisition from demonstration pairs on ARC-AGI-1 without fine-tuning weights, matching or exceeding prior recurrent baselines at 150M scale.
          </p>
          <div className="text-xs text-[var(--accent-blue-text)] font-sans font-semibold pt-1 border-t border-[var(--border)]">
            150M parameter benchmark
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-2">
          <div className="flex items-center gap-2 text-[var(--accent-yellow-text)] text-xs font-sans font-bold">
            <TrendingUp className="w-4 h-4 text-[var(--accent-yellow-text)]" />
            <span>2. Latent Convergence</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
            Solves multi-hop reasoning by relaxing into synaptic attractor states over multiple internal rounds, eliminating the need to emit hundreds of verbal chain-of-thought tokens.
          </p>
          <div className="text-xs text-[var(--accent-yellow-text)] font-sans font-semibold pt-1 border-t border-[var(--border)]">
            Zero CoT scratchpad bloat
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-2">
          <div className="flex items-center gap-2 text-[var(--accent-green-text)] text-xs font-sans font-bold">
            <Cpu className="w-4 h-4 text-[var(--accent-green-text)]" />
            <span>3. Memory Efficiency</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
            Maintains constant O(1) inference memory overhead regardless of demonstration sequence length, escaping the O(N) KV-cache explosion of standard transformers.
          </p>
          <div className="text-xs text-[var(--accent-green-text)] font-sans font-semibold pt-1 border-t border-[var(--border)]">
            Constant memory footprint
          </div>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)] text-xs font-sans text-[var(--text-secondary)] flex flex-wrap items-center justify-between gap-2">
        <span>Citations: Kosowski et al. (2025) &amp; Pathway Research Team (2026)</span>
        <span className="text-[var(--accent-blue-text)] font-medium">ARC-AGI-1 Recurrent In-Context Evaluation</span>
      </div>
    </div>
  );
};

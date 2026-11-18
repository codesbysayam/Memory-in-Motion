import React from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export const FinalClaimCard: React.FC = () => {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden text-[var(--text-primary)]">
      <div className="px-5 py-4 sm:px-6 border-b border-[var(--border)] bg-[var(--surface-soft)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-[var(--accent-blue-text)] shrink-0" />
          <div>
            <span className="text-xs font-mono text-[var(--accent-blue-text)] block">
              Epistemic contract · Scientific integrity guarantee
            </span>
            <h3 className="text-base sm:text-lg font-sans font-semibold text-[var(--text-primary)]">
              What this site demonstrates
            </h3>
          </div>
        </div>
      </div>

      {/* 3 Honest Claims */}
      <div className="p-5 sm:p-6 space-y-4">
        <div className="text-xs font-mono text-[var(--text-secondary)]">
          Three verified claims (computed live in your browser):
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-[var(--page-bg)] border border-[var(--border)] space-y-2">
            <div className="flex items-center gap-2 text-[var(--accent-blue-text)] text-xs font-sans font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>1. Recall-Interference Trade-Off</span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
              We mathematically demonstrate why any fixed-size continuous memory state faces an inevitable trade-off between preservation fidelity and capacity limits as distractors accumulate.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[var(--page-bg)] border border-[var(--border)] space-y-2">
            <div className="flex items-center gap-2 text-[var(--accent-blue-text)] text-xs font-sans font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>2. Coordinate-by-Coordinate Inspection</span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
              We show how sequential associative updates can be fully inspected, visualized as coordinate superpositions, and probed with explicit cosine similarity decoding in real time.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[var(--page-bg)] border border-[var(--border)] space-y-2">
            <div className="flex items-center gap-2 text-[var(--accent-blue-text)] text-xs font-sans font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>3. Bridge to Synaptic Latent Reasoning</span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
              We directly connect these linear algebraic principles to Pathway&apos;s BDH architecture, where memory resides inside plastic synaptic connection weights and multi-step reasoning occurs in latent state space.
            </p>
          </div>
        </div>

        {/* 1 Honest Disclaimer */}
        <div className="p-4 rounded-lg bg-[var(--accent-yellow)] border border-[var(--color-warning-border)] text-xs sm:text-sm space-y-1.5">
          <div className="flex items-center gap-2 font-sans font-semibold text-[var(--accent-yellow-text)]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Explicit epistemic disclaimer</span>
          </div>
          <p className="font-sans leading-relaxed text-[var(--text-primary)]">
            This site is an educational conceptual model. It does not run the production BDH model or reproduce its benchmark results. The interactive laboratories help you understand the foundational mechanisms of recurrent fast weights and synaptic plasticity; they do not replace reading the primary peer-reviewed literature.
          </p>
        </div>
      </div>
    </div>
  );
};

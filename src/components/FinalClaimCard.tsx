import React from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export const FinalClaimCard: React.FC = () => {
  return (
    <div className="essay-figure-stage px-5 sm:px-8 py-6 space-y-6 text-[var(--mm-ink)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--mm-rule)] pb-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-[var(--mm-signal)] shrink-0" />
          <div>
            <span className="essay-eyebrow text-[var(--mm-signal)] font-semibold block">
              Epistemic contract · Scientific integrity guarantee
            </span>
            <h3 className="text-lg font-serif font-normal text-[var(--mm-ink)]">
              What this visual essay demonstrates
            </h3>
          </div>
        </div>
        <span className="text-xs font-mono text-[var(--mm-muted)]">
          Computed live in browser
        </span>
      </div>

      {/* 3 Honest Claims in Hairline Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 border-y border-[var(--mm-rule)] divide-y md:divide-y-0 md:divide-x divide-[var(--mm-rule)]">
        <div className="py-4 md:pr-6 space-y-2">
          <div className="flex items-center gap-2 text-[var(--mm-signal)] text-xs font-sans font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>1. Recall-Interference Trade-Off</span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--mm-ink-soft)] font-sans leading-relaxed">
            We mathematically demonstrate why any fixed-size continuous memory state faces an inevitable trade-off between preservation fidelity and capacity limits as distractors accumulate.
          </p>
        </div>

        <div className="py-4 md:px-6 space-y-2">
          <div className="flex items-center gap-2 text-[var(--mm-signal)] text-xs font-sans font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>2. Coordinate-by-Coordinate Inspection</span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--mm-ink-soft)] font-sans leading-relaxed">
            We show how sequential associative updates can be fully inspected, visualized as coordinate superpositions, and probed with explicit cosine similarity decoding in real time.
          </p>
        </div>

        <div className="py-4 md:pl-6 space-y-2">
          <div className="flex items-center gap-2 text-[var(--mm-signal)] text-xs font-sans font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>3. Bridge to Synaptic Latent Reasoning</span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--mm-ink-soft)] font-sans leading-relaxed">
            We directly connect these linear algebraic principles to Pathway&apos;s BDH architecture, where memory resides inside plastic synaptic connection weights and multi-step reasoning occurs in latent state space.
          </p>
        </div>
      </div>

      {/* 1 Honest Disclaimer (Border-left editorial strip) */}
      <div className="pl-4 border-l-2 border-[var(--mm-amber)] text-xs sm:text-sm space-y-1">
        <div className="flex items-center gap-2 font-sans font-semibold text-[var(--mm-amber)]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Explicit epistemic disclaimer</span>
        </div>
        <p className="font-sans leading-relaxed text-[var(--mm-ink-soft)]">
          This site is an educational conceptual model. It does not run the production BDH model or reproduce its benchmark results. The interactive laboratories help you understand the foundational mechanisms of recurrent fast weights and synaptic plasticity; they do not replace reading the primary peer-reviewed literature.
        </p>
      </div>
    </div>
  );
};


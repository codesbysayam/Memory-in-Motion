import React from 'react';
import {
  Brain,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { LatentReasoningDemo } from './LatentReasoningDemo';
import { MODEL_CONTRACT } from '../data/bdhResearch';

export const BDHCQBridge: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Interactive Toy Latent Reasoning Demo */}
      <LatentReasoningDemo />

      {/* Official BDH-CQ Research Card & Epistemic Boundaries */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-6 text-[var(--text-primary)] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[var(--accent-blue)] border border-[var(--border)] text-[var(--accent-blue-text)]">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-sans text-[var(--accent-blue-text)] font-semibold">
                Published research reference
              </div>
              <h4 className="text-lg font-sans font-semibold text-[var(--text-primary)] tracking-tight">
                BDH-CQ: &ldquo;In-Context Learning with Recurrent Latent Reasoning&rdquo;
              </h4>
            </div>
          </div>

          <a
            href="https://pathway.com/research/introducing-bdh-cq"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-soft)] hover:bg-[var(--color-surface-muted)] text-[var(--text-primary)] border border-[var(--border)] text-xs font-sans font-semibold transition"
          >
            <span>Official research article</span>
            <ExternalLink className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
          </a>
        </div>

        {/* What We Borrow vs What We Do Not Claim */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* What We Borrow */}
          <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--color-success-border)] space-y-3">
            <div className="flex items-center gap-2 text-xs font-sans font-bold text-[var(--accent-green-text)]">
              <CheckCircle2 className="w-4 h-4 text-[var(--accent-green-text)]" />
              <span>What this educational lab adapts</span>
            </div>
            <ul className="space-y-2 text-xs text-[var(--text-secondary)] font-sans">
              {MODEL_CONTRACT.whatWeBorrow.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[var(--accent-green-text)] font-bold mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What We Do Not Claim */}
          <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--color-warning-border)] space-y-3">
            <div className="flex items-center gap-2 text-xs font-sans font-bold text-[var(--accent-yellow-text)]">
              <XCircle className="w-4 h-4 text-[var(--accent-yellow-text)]" />
              <span>Epistemic limits (What we do not claim)</span>
            </div>
            <ul className="space-y-2 text-xs text-[var(--text-secondary)] font-sans">
              {MODEL_CONTRACT.whatWeDoNotClaim.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[var(--accent-yellow-text)] font-bold mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Epistemic Footer */}
        <div className="p-3 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)] text-xs font-sans text-[var(--text-secondary)] flex flex-wrap items-center justify-between gap-2">
          <span>Source provenance: Kosowski et al. (2025) &amp; Pathway (2026)</span>
          <span className="text-[var(--accent-blue-text)] font-medium">ARC-AGI-1 in-context evaluation</span>
        </div>
      </div>
    </div>
  );
};

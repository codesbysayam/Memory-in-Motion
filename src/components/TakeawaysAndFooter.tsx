import React, { useState } from 'react';
import { ShieldCheck, ArrowUpRight } from 'lucide-react';
import { FinalClaimCard } from './FinalClaimCard';
import { LegalModal } from './LegalModals';

interface TakeawaysAndFooterProps {
  onNavigateDocs?: () => void;
  onNavigatePrivacy?: () => void;
  onNavigateTerms?: () => void;
}

export const TakeawaysAndFooter: React.FC<TakeawaysAndFooterProps> = ({
  onNavigateDocs,
  onNavigatePrivacy,
  onNavigateTerms,
}) => {
  const [activeLegalModal, setActiveLegalModal] = useState<'privacy' | 'terms' | null>(null);

  const takeaways = [
    {
      num: '01',
      title: 'Recurrent Memory Mechanism',
      desc: 'Recurrent memory carries task-relevant information forward through continuous internal state coordinates rather than accumulating an unbounded token sequence.',
    },
    {
      num: '02',
      title: 'Bounded Resource Footprint',
      desc: 'Fixed-size states prevent out-of-memory crashes and enable continuous lifelong streaming with deterministic constant latency per step.',
    },
    {
      num: '03',
      title: 'The Compression Trade-off',
      desc: 'Compressing many items into finite vector dimensions creates inevitable geometric crosstalk, representational interference, and forgetting.',
    },
    {
      num: '04',
      title: 'BDH Synaptic Architecture',
      desc: 'Dragon Hatchling (BDH) shifts memory from 1D dense vectors to synaptic connection weights across a scale-free particle graph, distinct from Mamba/SSMs.',
    },
    {
      num: '05',
      title: 'Epistemic Honesty & Rigor',
      desc: 'In-browser toy models build direct physical intuition for interference; published papers define full production BDH properties.',
    },
  ];

  return (
    <footer id="takeaways" className="scroll-mt-20 border-t border-[var(--mm-rule)] bg-[var(--page-bg)] py-16 text-[var(--mm-ink)]">
      <div className="research-container space-y-12">
        {/* Five Takeaways */}
        <div className="space-y-6">
          <div className="essay-eyebrow flex items-center gap-2">
            <span className="font-semibold text-[var(--mm-signal)]">Synthesis</span>
            <span aria-hidden="true" className="text-[var(--mm-rule-strong)]">·</span>
            <span>What to carry forward</span>
          </div>

          <h2 className="essay-section-title">
            Five core scientific takeaways
          </h2>

          <div className="divide-y divide-[var(--mm-rule)] border-y border-[var(--mm-rule)]">
            {takeaways.map((t) => (
              <div
                key={t.num}
                className="py-4 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-2 md:gap-8 items-baseline"
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-xs font-semibold tabular-nums text-[var(--mm-signal)]">
                    {t.num}
                  </span>
                  <h4 className="text-base font-serif font-normal text-[var(--mm-ink)]">
                    {t.title}
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-[var(--mm-ink-soft)] leading-relaxed font-sans">
                  {t.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Final Claim & Disclaimer */}
        <FinalClaimCard />

        {/* Technical Honesty & AI Disclosure */}
        <div className="pl-4 border-l-2 border-[var(--color-success)] text-xs sm:text-sm text-[var(--mm-ink-soft)] leading-relaxed space-y-2 max-w-4xl">
          <div className="flex items-center gap-2 font-sans text-[var(--mm-ink)] font-semibold">
            <ShieldCheck className="w-4 h-4 text-[var(--color-success)] shrink-0" />
            <span>Technical Honesty &amp; AI Assistance Disclosure</span>
          </div>
          <p>
            This laboratory was created for <strong>DataForge 2026 — Pathway Track (&ldquo;Explain the Frontier&rdquo;)</strong>. All simulations execute deterministically in your browser using PRNG-seeded vector arithmetic and local graph updates. No benchmark numbers or experimental claims were fabricated.
          </p>
          <p className="font-mono text-xs text-[var(--mm-muted)]">
            &ldquo;This project uses AI-assisted development. The author is responsible for understanding, verifying, and defending every component.&rdquo;
          </p>
        </div>

        {/* Hackathon Footer Line */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-[var(--border)] pt-6 text-xs text-[var(--text-muted)] font-mono">
          <div>
            DataForge 2026 — Pathway Track · <span className="text-[var(--text-primary)] font-semibold">&ldquo;Explain the Frontier&rdquo;</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="/docs"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigateDocs) onNavigateDocs();
              }}
              className="text-[var(--text-secondary)] hover:text-[var(--accent-blue-text)] hover:underline cursor-pointer"
            >
              Documentation
            </a>
            <span className="text-[var(--border)]">·</span>
            <a
              href="/privacy"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigatePrivacy) {
                  onNavigatePrivacy();
                } else {
                  setActiveLegalModal('privacy');
                }
              }}
              className="text-[var(--text-secondary)] hover:text-[var(--accent-blue-text)] hover:underline cursor-pointer"
            >
              Privacy Policy
            </a>
            <span className="text-[var(--border)]">·</span>
            <a
              href="/terms"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigateTerms) {
                  onNavigateTerms();
                } else {
                  setActiveLegalModal('terms');
                }
              }}
              className="text-[var(--text-secondary)] hover:text-[var(--accent-blue-text)] hover:underline cursor-pointer"
            >
              Terms of Use
            </a>
            <span className="text-[var(--border)]">·</span>
            <a
              href="https://github.com/pathwaycom/bdh"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--accent-blue-text)] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Pathway BDH Repo</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
            <a
              href="https://arxiv.org/abs/2509.26507"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--accent-blue-text)] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>arXiv:2509.26507</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Legal Modals */}
      <LegalModal
        type={activeLegalModal}
        onClose={() => setActiveLegalModal(null)}
      />
    </footer>
  );
};

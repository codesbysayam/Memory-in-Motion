import React from 'react';
import {
  X,
  BookOpen,
  ExternalLink,
  ShieldCheck,
  Brain,
  FileText,
  Award,
  Layers,
  Sparkles,
} from 'lucide-react';
import { RESEARCH_SOURCES, MODEL_CONTRACT } from '../data/bdhResearch';

interface ResearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResearchDrawer: React.FC<ResearchDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-xs animate-in fade-in" onClick={onClose}>
      <div
        className="w-full max-w-xl bg-[var(--surface)] border-l border-[var(--border)] h-full overflow-y-auto p-6 sm:p-8 space-y-6 text-[var(--text-primary)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[var(--accent-blue)] border border-[var(--border)] text-[var(--color-accent-ink)]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono text-[var(--color-accent-ink)] font-medium">
                Primary citations &amp; contract
              </div>
              <h3 className="text-lg font-sans font-semibold text-[var(--text-primary)]">Research archive</h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close research drawer"
            className="p-1.5 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Epistemic Disclaimer Box */}
        <div className="p-4 rounded-xl bg-[var(--color-warning-soft)] border border-[var(--color-warning-border)] space-y-1.5 text-xs font-sans">
          <div className="flex items-center gap-2 font-semibold text-[var(--color-warning)]">
            <ShieldCheck className="w-4 h-4" />
            <span>Epistemic boundary</span>
          </div>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            This interactive publication is an educational model designed to explain principles of recurrent memory. It does not run a checkpoint of the BDH model or reproduce its exact internal representations.
          </p>
        </div>

        {/* Model Contract Summary */}
        <div className="space-y-3 text-xs">
          <div className="text-[var(--text-primary)] font-sans text-xs font-semibold flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--color-accent-ink)]" />
            <span>The three-layer model contract</span>
          </div>

          <div className="space-y-2">
            {MODEL_CONTRACT.layers.map((l) => (
              <div
                key={l.num}
                className="p-3.5 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)] space-y-1"
              >
                <div className="flex justify-between items-center text-xs text-[var(--text-secondary)]">
                  <span className="text-[var(--color-accent-ink)] font-semibold">{l.num} {l.title}</span>
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">{l.scope}</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-sans">{l.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Primary Citations */}
        <div className="space-y-3 text-xs">
          <div className="text-[var(--text-primary)] font-sans text-xs font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4 text-[var(--color-accent-ink)]" />
            <span>Primary sources &amp; benchmarks</span>
          </div>

          <div className="space-y-3">
            {RESEARCH_SOURCES.map((src) => (
              <div
                key={src.id}
                className="p-4 rounded-xl bg-[var(--page-bg)] border border-[var(--border)] space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-sans font-semibold text-[var(--text-primary)] text-sm">{src.title}</h4>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--color-accent-ink)] hover:opacity-80 transition shrink-0"
                    title="Open Source URL"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="text-xs text-[var(--text-muted)] font-sans">
                  <span className="text-[var(--color-accent-ink)] font-medium">{src.authors}</span> ({src.year}) •{' '}
                  <span>{src.venue}</span>
                </div>

                <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed border-t border-[var(--border)] pt-2">
                  {src.keyContribution}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ARC-AGI Benchmark Context */}
        <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-1.5 text-xs">
          <div className="flex items-center gap-2 text-[var(--color-accent-ink)] font-semibold">
            <Award className="w-4 h-4" />
            <span>ARC-AGI benchmark context</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
            BDH-CQ established competitive performance on the ARC-AGI-1 benchmark via pure in-context recurrent latent reasoning without external fine-tuning or tokenized test-time search generation.
          </p>
        </div>

        {/* Drawer Footer */}
        <div className="pt-2 border-t border-[var(--border)] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[var(--surface-soft)] hover:bg-[var(--page-bg)] border border-[var(--border)] text-xs font-medium text-[var(--text-primary)] transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

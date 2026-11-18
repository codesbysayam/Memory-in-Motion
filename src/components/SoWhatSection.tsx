import React from 'react';
import { SectionHeader } from './ui/SectionHeader';

export const SoWhatSection: React.FC = () => {
  return (
    <section id="section-so-what" className="scroll-mt-20 border-b border-[var(--mm-rule)] bg-[var(--page-bg)] py-16 sm:py-20 text-[var(--text-primary)]">
      <div className="space-y-10">
        <SectionHeader
          number="11"
          category="Synthesis & Architectural Horizon"
          title="So what? Why memory geometry decides what a model can do"
          subtitle="Moving beyond matrices and sparse graphs: how a neural system stores working memory separates passive look-up from real-time recurrent reasoning."
          discovery="Context buffers cannot expand indefinitely. Shifting working memory from external token caches into plastic state lets deliberation run in bounded RAM."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--mm-rule)] border-t border-b border-[var(--mm-rule)]">
          {/* Column 01: Evidence */}
          <div className="py-6 md:py-8 md:pr-8 space-y-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--mm-amber)] font-semibold block">
              01 · Evidence · Context Limits
            </span>
            <h3 className="text-xl font-serif font-normal text-[var(--mm-ink)]">
              Context windows cannot grow forever
            </h3>
            <p className="text-xs sm:text-sm text-[var(--mm-ink-soft)] font-sans leading-relaxed">
              Standard Transformers keep every prior token inside an expanding KV cache:
            </p>
            <ul className="space-y-2 text-xs text-[var(--mm-muted)] font-sans">
              <li><strong className="text-[var(--mm-ink)]">Hardware cost:</strong> Passive history consumes gigabytes of GPU memory and bandwidth.</li>
              <li><strong className="text-[var(--mm-ink)]">Attention cost:</strong> Every newly generated token scans millions of stored key-values.</li>
              <li><strong className="text-[var(--mm-ink)]">Middle dilution:</strong> Long contexts still exhibit lost-in-the-middle degradation.</li>
            </ul>
          </div>

          {/* Column 02: Interpretation */}
          <div className="py-6 md:py-8 md:px-8 space-y-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--mm-signal)] font-semibold block">
              02 · Interpretation · Compression Tension
            </span>
            <h3 className="text-xl font-serif font-normal text-[var(--mm-ink)]">
              Fixed states trade fidelity for O(1) cost
            </h3>
            <p className="text-xs sm:text-sm text-[var(--mm-ink-soft)] font-sans leading-relaxed">
              What our deterministic matrix experiments demonstrated directly:
            </p>
            <ul className="space-y-2 text-xs text-[var(--mm-muted)] font-sans">
              <li><strong className="text-[var(--mm-ink)]">Bounded footprint:</strong> State matrix dimensions remain O(1) regardless of stream length T.</li>
              <li><strong className="text-[var(--mm-ink)]">Geometric limit:</strong> Packing more items than orthogonal dimensions D introduces crosstalk.</li>
              <li><strong className="text-[var(--mm-ink)]">Online streaming:</strong> Information absorbs incrementally without re-reading raw transcripts.</li>
            </ul>
          </div>

          {/* Column 03: Boundaries */}
          <div className="py-6 md:py-8 md:pl-8 space-y-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--accent-green-text)] font-semibold block">
              03 · Boundaries · Synaptic State
            </span>
            <h3 className="text-xl font-serif font-normal text-[var(--mm-ink)]">
              Synapses separate storage from vectors
            </h3>
            <p className="text-xs sm:text-sm text-[var(--mm-ink-soft)] font-sans leading-relaxed">
              Where Pathway&apos;s BDH &amp; BDH-CQ research extends classical recurrence:
            </p>
            <ul className="space-y-2 text-xs text-[var(--mm-muted)] font-sans">
              <li><strong className="text-[var(--mm-ink)]">Plastic edges:</strong> Memory shifts into sparse Hebbian connections that update selectively.</li>
              <li><strong className="text-[var(--mm-ink)]">Latent deliberation:</strong> Multi-step graph relaxation refines states before token output.</li>
              <li><strong className="text-[var(--mm-ink)]">Epistemic humility:</strong> In-browser toy runs clarify mechanisms; full scale belongs to trained weights.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};


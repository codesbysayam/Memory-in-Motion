import React from 'react';
import { SectionHeader } from './ui/SectionHeader';

export const SoWhatSection: React.FC = () => {
  return (
    <section
      id="section-so-what"
      className="scroll-mt-20 border-b border-[var(--mm-rule)] bg-[var(--page-bg)] py-16 sm:py-20 text-[var(--text-primary)]"
    >
      <div className="essay-column space-y-10">
        <SectionHeader
          number="11"
          category="Synthesis & epistemic boundaries"
          title="So what? Why memory geometry decides what a model can do"
          subtitle="Stepping back from interactive plots: how a system stores working memory separates passive token lookup from bounded online recurrence."
        />

        <div className="space-y-8 text-sm sm:text-base text-[var(--text-secondary)] font-sans leading-relaxed">
          <div className="space-y-3 border-t border-[var(--mm-rule)] pt-6">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--mm-teal)] font-semibold block">
              What our deterministic runs established
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-medium text-[var(--text-primary)]">
              Constant memory space trades verbatim safety for superposition pressure
            </h3>
            <p>
              Standard Transformers avoid forgetting by keeping every past token inside an expanding Key–Value archive—requiring <span className="font-mono text-xs">O(T)</span> hardware memory. Fixed-size recurrent states hold footprint constant at <span className="font-mono text-xs">O(1)</span> regardless of sequence length, but compressing more keys than available quasi-orthogonal directions (<span className="font-mono text-xs">~O(D)</span>) inevitably causes coordinate overlap and readout flips.
            </p>
          </div>

          <div className="space-y-3 border-t border-[var(--mm-rule)] pt-6">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--mm-amber)] font-semibold block">
              What belongs to published research vs. educational abstraction
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-medium text-[var(--text-primary)]">
              Sparse synaptic graphs offer a path beyond monolithic matrices—with open questions
            </h3>
            <p>
              Pathway&apos;s Dragon Hatchling (BDH, <span className="font-mono text-xs">arXiv:2509.26507</span>) and BDH-CQ relocate working memory into sparse, non-negative, locally plastic synaptic edges and allow latent multi-step graph relaxation before token emission. The small-scale graphs in this essay clarify those local mechanics faithfully, while large-scale benchmark behavior belongs strictly to trained frontier weights.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

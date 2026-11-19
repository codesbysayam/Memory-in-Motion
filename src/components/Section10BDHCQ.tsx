import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { SectionHeader } from './ui/SectionHeader';
import { EvidenceBadge } from './ui/EvidenceBadge';
import { BDHCQBridge } from './BDHCQBridge';
import { TokenBudgetVisual } from './TokenBudgetVisual';
import { ResearchVsToySplit } from './ResearchVsToySplit';
import { BDHCQResearchCard } from './BDHCQResearchCard';
import { ExplainItChallenge } from './ExplainItChallenge';
import { FigureCaption } from './essay/FigureCaption';

export const Section10BDHCQ: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<'traditional' | 'bdhcq'>('bdhcq');

  return (
    <section id="section-10" className="scroll-mt-20 border-b border-[var(--mm-rule)] bg-[var(--page-bg)] py-16 sm:py-20 text-[var(--text-primary)]">
      <div className="space-y-10">
        <SectionHeader
          number="10"
          category="The Architectural Climax"
          title="If memory lives in synapses, can reasoning happen without generating tokens?"
          subtitle="Latent reasoning before token generation: a task arrives → internal synapses evolve across K relaxation rounds → a stable attractor settles → only the final answer emits tokens."
          discovery="Standard Chain-of-Thought reasons sequentially in verbal token space (inflating the KV cache). BDH-CQ reasons internally across synaptic state space with a bounded memory footprint."
        />

        {/* Side-by-Side Comparison Stage: Discrete CoT vs Continuous BDH-CQ */}
        <figure className="essay-figure-stage p-5 sm:p-7 space-y-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[var(--mm-rule)] pb-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--mm-signal)] font-semibold">
                  Fig. 10.1 · Pathway BDH-CQ (150M Params)
                </span>
                <EvidenceBadge category="OFFICIAL PATHWAY MATERIAL" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-normal text-[var(--mm-ink)]">
                Discrete Token Scratchpads vs. Continuous Latent Relaxation
              </h3>
            </div>

            <a
              href="https://pathway.com/research/introducing-bdh-cq"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-mono text-xs text-[var(--mm-signal)] hover:underline font-semibold"
            >
              <span>Introducing BDH-CQ (Pathway)</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <p className="text-sm text-[var(--mm-ink-soft)] font-sans leading-relaxed max-w-3xl">
            BDH-CQ is a <strong className="text-[var(--mm-ink)]">150M-parameter recurrent reasoning model</strong> evaluated on few-shot demonstration tasks (including <strong className="text-[var(--mm-ink)]">ARC-AGI-1</strong>). Rather than spending hundreds of output tokens thinking aloud, it relaxes recurrent synaptic weights across multi-step passes before reading out an answer.
          </p>

          {/* Hairline Focus Switcher */}
          <div className="flex items-center border-b border-[var(--mm-rule)]">
            <button
              type="button"
              onClick={() => setActiveTab('traditional')}
              className={`px-4 pb-2 text-xs font-sans transition-colors cursor-pointer border-b-2 -mb-[1px] ${
                activeTab === 'traditional'
                  ? 'border-[var(--mm-amber)] text-[var(--mm-ink)] font-semibold'
                  : 'border-transparent text-[var(--mm-muted)] hover:text-[var(--mm-ink)]'
              }`}
            >
              Discrete Token CoT (O(T) Cache)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bdhcq')}
              className={`px-4 pb-2 text-xs font-sans transition-colors cursor-pointer border-b-2 -mb-[1px] ${
                activeTab === 'bdhcq'
                  ? 'border-[var(--mm-signal)] text-[var(--mm-ink)] font-semibold'
                  : 'border-transparent text-[var(--mm-muted)] hover:text-[var(--mm-ink)]'
              }`}
            >
              Continuous BDH-CQ Relaxation (O(1) State)
            </button>
          </div>

          {/* Side-by-Side Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[var(--mm-rule)] border border-[var(--mm-rule)] bg-[var(--mm-paper-bright)] rounded-md overflow-hidden">
            {/* Left: Traditional Token CoT */}
            <motion.div
              animate={{ opacity: activeTab === 'traditional' ? 1 : 0.62 }}
              transition={{ duration: reducedMotion ? 0 : 0.25 }}
              className={`p-5 space-y-3 ${activeTab === 'traditional' ? 'bg-[var(--surface-soft)]/50' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-[var(--mm-amber)]">
                  01 · Standard Transformer CoT
                </span>
                <span className="font-mono text-[11px] text-[var(--mm-muted)]">O(T) growing KV cache</span>
              </div>
              <p className="text-xs text-[var(--mm-ink-soft)] leading-relaxed">
                Deliberation happens only by emitting intermediate text tokens (&ldquo;Step 1... Step 2...&rdquo;). Every thought token appends a new key/value pair into the external cache, enlarging memory overhead on long problems.
              </p>
              <div className="pt-2 border-t border-[var(--mm-rule)] font-mono text-xs text-[var(--mm-ink)]">
                Prompt → <span className="text-[var(--mm-amber)]">Token₁</span> → <span className="text-[var(--mm-amber)]">Token₂</span> → … → <span className="text-[var(--mm-amber)]">Token₂₅₀</span> → Answer
              </div>
            </motion.div>

            {/* Right: Continuous BDH-CQ */}
            <motion.div
              animate={{ opacity: activeTab === 'bdhcq' ? 1 : 0.62 }}
              transition={{ duration: reducedMotion ? 0 : 0.25 }}
              className={`p-5 space-y-3 ${activeTab === 'bdhcq' ? 'bg-[var(--mm-signal-soft)]/35' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-[var(--mm-signal)]">
                  02 · BDH-CQ Latent Reasoning
                </span>
                <span className="font-mono text-[11px] text-[var(--accent-green-text)]">O(1) bounded state</span>
              </div>
              <p className="text-xs text-[var(--mm-ink-soft)] leading-relaxed">
                1. Demonstration enters particle activations · 2. Synapses update across K internal relaxation rounds · 3. Stable attractor settles · 4. Answer emits with zero intermediate scratchpad tokens.
              </p>
              <div className="pt-2 border-t border-[var(--mm-rule)] font-mono text-xs text-[var(--mm-ink)] flex flex-wrap items-center gap-1.5">
                <span>Demonstration →</span>
                <motion.span
                  key={activeTab}
                  initial={reducedMotion ? false : { opacity: 0.6, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: reducedMotion ? 0 : 0.28 }}
                  className="text-[var(--mm-signal)] font-semibold"
                >
                  [Latent Synaptic Cycles t = 1..K]
                </motion.span>
                <span>→ Emitted Answer Token</span>
              </div>
            </motion.div>
          </div>

          {/* 4 BDH-CQ Key Capabilities (Hairline 4-col Row) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--mm-rule)] border-t border-[var(--mm-rule)] pt-4 text-xs">
            <div className="py-2 sm:pr-4">
              <span className="font-mono text-[11px] text-[var(--mm-signal)] font-semibold block mb-1">
                Demonstration learning
              </span>
              <p className="text-[var(--mm-muted)] leading-relaxed">
                Infers transformation rules directly from few-shot examples via state modulation.
              </p>
            </div>
            <div className="py-2 sm:px-4">
              <span className="font-mono text-[11px] text-[var(--mm-signal)] font-semibold block mb-1">
                Token-free thought
              </span>
              <p className="text-[var(--mm-muted)] leading-relaxed">
                Executes multi-step refinement internally without bloating context windows.
              </p>
            </div>
            <div className="py-2 sm:px-4">
              <span className="font-mono text-[11px] text-[var(--accent-green-text)] font-semibold block mb-1">
                Skill induction
              </span>
              <p className="text-[var(--mm-muted)] leading-relaxed">
                Forms reusable procedural attractors across sequential graph passes.
              </p>
            </div>
            <div className="py-2 sm:pl-4">
              <span className="font-mono text-[11px] text-[var(--mm-amber)] font-semibold block mb-1">
                Constant RAM profile
              </span>
              <p className="text-[var(--mm-muted)] leading-relaxed">
                State footprint stays constant regardless of latent reasoning depth K.
              </p>
            </div>
          </div>

          <FigureCaption
            figure="Fig. 10.1"
            title="Moving deliberation from external text tokens into recurrent synaptic relaxation decouples reasoning depth from context length."
            source="Pathway Research, Introducing BDH-CQ technical report"
          />
        </figure>

        {/* Token Budget Visual: Chain-of-Thought vs BDH Latent Reasoning */}
        <TokenBudgetVisual />

        {/* BDH-CQ Bridge: Interactive Latent Reasoning Demo & Model Contract */}
        <BDHCQBridge />

        {/* BDH-CQ Research Findings Card */}
        <BDHCQResearchCard />

        {/* Research vs Toy Split Screen (Epistemic Honesty) */}
        <ResearchVsToySplit />

        {/* Explain It Challenge: Deterministic concept check */}
        <ExplainItChallenge />
      </div>
    </section>
  );
};


import React, { useState } from 'react';
import { Brain, ArrowUpRight } from 'lucide-react';
import { SectionHeader } from './ui/SectionHeader';
import { EvidenceBadge } from './ui/EvidenceBadge';
import { BDHCQBridge } from './BDHCQBridge';
import { TokenBudgetVisual } from './TokenBudgetVisual';
import { ResearchVsToySplit } from './ResearchVsToySplit';
import { BDHCQResearchCard } from './BDHCQResearchCard';
import { ExplainItChallenge } from './ExplainItChallenge';

export const Section10BDHCQ: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'traditional' | 'bdhcq'>('bdhcq');

  return (
    <section id="section-10" className="scroll-mt-20 border-b border-[var(--border)] bg-[var(--page-bg)] py-16 sm:py-20 text-[var(--text-primary)]">
      <div className="space-y-10">
        {/* Natural Climax Framing: Latent Reasoning Before Token Generation */}
        <SectionHeader
          number="10"
          category="THE ARCHITECTURAL CLIMAX"
          title="If memory lives in synapses, can reasoning happen without generating tokens?"
          subtitle="Latent Reasoning Before Token Generation: Problem arrives → Synapses update internally across multiple reasoning rounds → Stable attractor forms → Output tokens generated only at the end."
          discovery="Chain-of-thought reasons in verbal token space (slow, context-heavy). BDH latent reasoning executes in synaptic state space (token-free during thought with constant memory)."
        />

        {/* 12-Column Responsive Layout: The Core Concept Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Conceptual Comparison & Tab Selector */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
                <span className="text-xs font-mono tracking-wider text-[var(--accent-blue-text)] font-bold flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5" />
                  REASONING PARADIGM (150M PARAMS)
                </span>
                <EvidenceBadge category="OFFICIAL PATHWAY MATERIAL" />
              </div>

              <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
                BDH-CQ is a <strong className="text-[var(--text-primary)]">150M-parameter reasoning architecture</strong> that demonstrates in-context skill acquisition on demanding benchmark tasks (such as <strong className="text-[var(--text-primary)]">ARC-AGI-1</strong>) by relaxing recurrent synaptic states rather than emitting linear scratchpads of tokens.
              </p>

              {/* Explicit 4-Step Pipeline Flow */}
              <div className="rounded-xl bg-[var(--surface-soft)] p-4 border border-[var(--border)] space-y-2.5 font-mono text-xs">
                <span className="text-[11px] text-[var(--text-muted)] font-bold block">
                  BDH latent reasoning lifecycle:
                </span>
                <div className="space-y-2 text-[11px]">
                  <div className="flex items-center gap-2.5 text-[var(--text-secondary)]">
                    <span className="w-5 h-5 rounded-md bg-[var(--accent-blue)] text-[var(--accent-blue-text)] border border-[var(--border)] flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                    <span>Problem input arrives into neuron activations</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[var(--text-secondary)]">
                    <span className="w-5 h-5 rounded-md bg-[var(--accent-blue)] text-[var(--accent-blue-text)] border border-[var(--border)] flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                    <span>Synapses update internally across reasoning rounds</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[var(--text-secondary)]">
                    <span className="w-5 h-5 rounded-md bg-[var(--accent-green)] text-[var(--accent-green-text)] border border-[var(--color-success-border)] flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                    <span>Stable answer attractor forms in connection topology</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[var(--text-secondary)]">
                    <span className="w-5 h-5 rounded-md bg-[var(--accent-yellow)] text-[var(--accent-yellow-text)] border border-[var(--color-warning-border)] flex items-center justify-center text-[10px] font-bold shrink-0">4</span>
                    <span>Output tokens generated only at the very end</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 font-mono text-xs">
                <button
                  onClick={() => setActiveTab('traditional')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    activeTab === 'traditional'
                      ? 'bg-[var(--accent-yellow)] border-[var(--color-warning-border)] text-[var(--text-primary)] shadow-xs'
                      : 'bg-[var(--surface-soft)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]'
                  }`}
                >
                  <div className="font-bold text-[var(--text-primary)]">Traditional Token Chain-of-Thought</div>
                  <div className="text-[11px] text-[var(--text-secondary)] mt-0.5 font-sans">
                    Linear scratchpad tokens inflating the KV-cache at each step.
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('bdhcq')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    activeTab === 'bdhcq'
                      ? 'bg-[var(--accent-blue)] border-[var(--color-accent)] text-[var(--text-primary)] shadow-xs'
                      : 'bg-[var(--surface-soft)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]'
                  }`}
                >
                  <div className="font-bold text-[var(--text-primary)]">BDH Latent Reasoning (Synaptic Space)</div>
                  <div className="text-[11px] text-[var(--text-secondary)] mt-0.5 font-sans">
                    Multi-step internal relaxation directly in recurrent synaptic weights.
                  </div>
                </button>
              </div>
            </div>

            {/* Official Pathway Publication Link */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-2 shadow-xs">
              <span className="font-mono text-[11px] text-[var(--text-muted)] font-bold block">
                Official Pathway publication
              </span>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-sans font-semibold text-sm text-[var(--text-primary)]">
                    &ldquo;Introducing BDH-CQ&rdquo;
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] font-sans">
                    Demonstration learning &amp; latent recurrent reasoning
                  </p>
                </div>
                <a
                  href="https://pathway.com/research/introducing-bdh-cq"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-xs text-[var(--accent-blue-text)] hover:underline font-bold"
                >
                  <span>Read Article</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Deep Comparison Visualization & Key Takeaways */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-7 space-y-6 shadow-xs">
              {activeTab === 'traditional' ? (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
                    <span className="font-mono text-xs font-bold text-[var(--accent-yellow-text)]">
                      Standard LLM: Generation of Explicit Intermediate Tokens
                    </span>
                    <span className="font-mono text-[11px] text-[var(--text-muted)] bg-[var(--surface-soft)] px-2 py-0.5 rounded border border-[var(--border)]">
                      O(T) Growing Cache
                    </span>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
                    Standard transformer models perform reasoning by generating dozens or hundreds of explicit text tokens into a scratchpad (&ldquo;Let&apos;s think step by step: Step 1..., Step 2...&rdquo;). Each generated token consumes additional GPU memory in the KV cache, quadratically or linearly inflating future attention costs.
                  </p>

                  <div className="rounded-xl border border-[var(--color-warning-border)] bg-[var(--accent-yellow)] p-4 font-mono text-xs text-[var(--text-secondary)] space-y-2">
                    <div className="text-[var(--text-primary)] font-semibold">
                      Prompt → <span className="text-[var(--accent-yellow-text)]">Token 1</span> → <span className="text-[var(--accent-yellow-text)]">Token 2</span> → ... → <span className="text-[var(--accent-yellow-text)]">Token 250</span> → Solution
                    </div>
                    <div className="text-[11px] text-[var(--accent-pink-text)] border-t border-[var(--color-warning-border)] pt-2">
                      Memory footprint: Expands proportionally with every step of deliberation.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
                    <span className="font-mono text-xs font-bold text-[var(--accent-blue-text)]">
                      BDH-CQ: Multi-Step Recurrent Latent Graph Relaxation
                    </span>
                    <span className="font-mono text-[11px] text-[var(--accent-green-text)] bg-[var(--accent-green)] px-2 py-0.5 rounded border border-[var(--color-success-border)] font-bold">
                      O(1) Bounded State
                    </span>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
                    BDH-CQ performs multiple internal relaxation cycles across its neuron particle graph and synaptic connection weights <em>before</em> outputting any answer. The deliberation takes place entirely in continuous latent state, solving complex demonstration tasks without filling the context window with intermediate scratchpad text.
                  </p>

                  <div className="rounded-xl border border-[var(--border)] bg-[var(--accent-blue)] p-4 font-mono text-xs text-[var(--text-secondary)] space-y-2">
                    <div className="text-[var(--text-primary)] font-semibold">
                      Demonstration → <span className="text-[var(--accent-blue-text)] font-bold">[Synaptic Graph Relaxation t=1..K]</span> → Direct Answer
                    </div>
                    <div className="text-[11px] text-[var(--accent-green-text)] border-t border-[var(--border)] pt-2 font-medium">
                      Memory footprint: Strictly constant O(1). Reasoning compute occurs in the recurrent dynamics.
                    </div>
                  </div>
                </div>
              )}

              {/* 4 Pillars of BDH-CQ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 font-mono">
                <div className="rounded-xl bg-[var(--surface-soft)] p-4 border border-[var(--border)]">
                  <span className="text-xs text-[var(--accent-blue-text)] font-bold block mb-1">
                    In-context demonstration learning
                  </span>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
                    Discovers algorithmic rules directly from few-shot input examples via state modulation.
                  </p>
                </div>

                <div className="rounded-xl bg-[var(--surface-soft)] p-4 border border-[var(--border)]">
                  <span className="text-xs text-[var(--accent-blue-text)] font-bold block mb-1">
                    Continuous latent memory
                  </span>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
                    Carries forward structured representations without growing a historical token buffer.
                  </p>
                </div>

                <div className="rounded-xl bg-[var(--surface-soft)] p-4 border border-[var(--border)]">
                  <span className="text-xs text-[var(--accent-green-text)] font-bold block mb-1">
                    Skill induction
                  </span>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
                    Synthesizes operational routines dynamically during sequential graph updates.
                  </p>
                </div>

                <div className="rounded-xl bg-[var(--surface-soft)] p-4 border border-[var(--border)]">
                  <span className="text-xs text-[var(--accent-yellow-text)] font-bold block mb-1">
                    Bounded hardware profile
                  </span>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
                    Retains constant RAM requirements regardless of reasoning problem complexity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

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

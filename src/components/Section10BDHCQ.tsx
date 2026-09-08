import React, { useState } from 'react';
import { Brain, ArrowUpRight, CheckCircle2, ChevronRight, Layers, Sparkles, Zap, Coins } from 'lucide-react';
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
    <section id="section-10" className="scroll-mt-20 border-b border-[#252A35] bg-[#07080B] py-14">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 space-y-12">
        {/* 12. Natural Climax Framing: Latent Reasoning Before Token Generation */}
        <SectionHeader
          number="10"
          category="THE ARCHITECTURAL CLIMAX"
          title="If Memory Lives in Synapses, Can Reasoning Happen Without Generating Tokens?"
          subtitle="Latent Reasoning Before Token Generation: Problem arrives → Synapses update internally across multiple reasoning rounds → Stable attractor forms → Output tokens generated only at the end."
          discovery="Chain-of-thought reasons in verbal token space (slow, context-heavy). BDH latent reasoning executes in synaptic state space (token-free during thought with constant memory)."
        />

        {/* 12-Column Responsive Layout: The Core Concept Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Conceptual Comparison & Tab Selector */}
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#252A35] pb-2">
                <span className="text-xs font-mono uppercase tracking-widest text-[#22D3EE] font-semibold flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5" />
                  REASONING PARADIGM (150M PARAMS)
                </span>
                <EvidenceBadge category="OFFICIAL PATHWAY MATERIAL" />
              </div>

              <p className="text-xs text-[#8F96A3] leading-relaxed">
                BDH-CQ is a <strong>150M-parameter reasoning architecture</strong> that demonstrates in-context skill acquisition on demanding benchmark tasks (such as <strong>ARC-AGI-1</strong>) by relaxing recurrent synaptic states rather than emitting linear scratchpads of tokens.
              </p>

              {/* Explicit 4-Step Pipeline Flow */}
              <div className="rounded-lg bg-[#151922] p-3 border border-[#252A35] space-y-2 font-mono text-xs">
                <span className="text-[10px] text-[#8F96A3] uppercase font-bold block">
                  BDH LATENT REASONING LIFECYCLE:
                </span>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="w-4 h-4 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center text-[10px] font-bold">1</span>
                    <span>Problem input arrives into neuron activations</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="w-4 h-4 rounded-full bg-violet-950 text-violet-400 border border-violet-800 flex items-center justify-center text-[10px] font-bold">2</span>
                    <span>Synapses update internally across reasoning rounds</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="w-4 h-4 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center text-[10px] font-bold">3</span>
                    <span>Stable answer attractor forms in connection topology</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="w-4 h-4 rounded-full bg-amber-950 text-amber-400 border border-amber-800 flex items-center justify-center text-[10px] font-bold">4</span>
                    <span>Output tokens generated only at the very end</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 font-mono text-xs">
                <button
                  onClick={() => setActiveTab('traditional')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    activeTab === 'traditional'
                      ? 'bg-[#151922] border-amber-500 text-amber-200 shadow-sm'
                      : 'bg-[#07080B] border-[#252A35] text-[#8F96A3] hover:text-white'
                  }`}
                >
                  <div className="font-semibold text-white">Traditional Token Chain-of-Thought</div>
                  <div className="text-[11px] text-[#8F96A3] mt-0.5">
                    Linear scratchpad tokens inflating the KV-cache at each step.
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('bdhcq')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    activeTab === 'bdhcq'
                      ? 'bg-[#151922] border-violet-500 text-violet-200 shadow-sm'
                      : 'bg-[#07080B] border-[#252A35] text-[#8F96A3] hover:text-white'
                  }`}
                >
                  <div className="font-semibold text-white">BDH Latent Reasoning (Synaptic Space)</div>
                  <div className="text-[11px] text-[#8F96A3] mt-0.5">
                    Multi-step internal relaxation directly in recurrent synaptic weights.
                  </div>
                </button>
              </div>
            </div>

            {/* Official Pathway Publication Link */}
            <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-4 space-y-2">
              <span className="font-mono text-[10px] text-[#8F96A3] uppercase block">
                Official Pathway Publication
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs font-bold text-white">
                    "Introducing BDH-CQ"
                  </div>
                  <p className="text-[11px] text-[#8F96A3]">
                    Demonstration learning & latent recurrent reasoning
                  </p>
                </div>
                <a
                  href="https://pathway.com/research/introducing-bdh-cq"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-xs text-[#22D3EE] hover:underline"
                >
                  <span>Read Article</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Deep Comparison Visualization & Key Takeaways */}
          <div className="lg:col-span-7 space-y-5">
            <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-6 space-y-5">
              {activeTab === 'traditional' ? (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-[#252A35] pb-3">
                    <span className="font-mono text-xs font-bold uppercase text-amber-300">
                      Standard LLM: Generation of Explicit Intermediate Tokens
                    </span>
                    <span className="font-mono text-[10px] text-[#8F96A3]">O(T) Growing Cache</span>
                  </div>

                  <p className="text-xs text-[#8F96A3] leading-relaxed">
                    Standard transformer models perform reasoning by generating dozens or hundreds of explicit text tokens into a scratchpad ("Let's think step by step: Step 1..., Step 2..."). Each generated token consumes additional GPU memory in the KV cache, quadratically or linearly inflating future attention costs.
                  </p>

                  <div className="rounded-lg border border-[#252A35] bg-[#07080B] p-4 font-mono text-xs text-[#8F96A3] space-y-2">
                    <div className="text-white">
                      Prompt → <span className="text-amber-400">Token 1</span> → <span className="text-amber-400">Token 2</span> → ... → <span className="text-amber-400">Token 250</span> → Solution
                    </div>
                    <div className="text-[11px] text-rose-400 border-t border-[#252A35] pt-2">
                      Memory footprint: Expands proportionally with every step of deliberation.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-[#252A35] pb-3">
                    <span className="font-mono text-xs font-bold uppercase text-violet-300">
                      BDH-CQ: Multi-Step Recurrent Latent Graph Relaxation
                    </span>
                    <span className="font-mono text-[10px] text-emerald-400">O(1) Bounded State</span>
                  </div>

                  <p className="text-xs text-[#8F96A3] leading-relaxed">
                    BDH-CQ performs multiple internal relaxation cycles across its neuron particle graph and synaptic connection weights <em>before</em> outputting any answer. The deliberation takes place entirely in continuous latent state, solving complex demonstration tasks without filling the context window with intermediate scratchpad text.
                  </p>

                  <div className="rounded-lg border border-violet-500/30 bg-violet-950/20 p-4 font-mono text-xs text-[#8F96A3] space-y-2">
                    <div className="text-white">
                      Demonstration → <span className="text-[#22D3EE] font-bold">[Synaptic Graph Relaxation t=1..K]</span> → Direct Answer
                    </div>
                    <div className="text-[11px] text-emerald-300 border-t border-violet-500/30 pt-2">
                      Memory footprint: Strictly constant O(1). Reasoning compute occurs in the recurrent dynamics.
                    </div>
                  </div>
                </div>
              )}

              {/* 4 Pillars of BDH-CQ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 font-mono">
                <div className="rounded-lg bg-[#151922] p-3 border border-[#252A35]">
                  <span className="text-[10px] text-[#22D3EE] uppercase font-bold block mb-1">
                    In-Context Demonstration Learning
                  </span>
                  <p className="text-xs text-[#8F96A3] leading-relaxed font-sans">
                    Discovers algorithmic rules directly from few-shot input examples via state modulation.
                  </p>
                </div>

                <div className="rounded-lg bg-[#151922] p-3 border border-[#252A35]">
                  <span className="text-[10px] text-violet-400 uppercase font-bold block mb-1">
                    Continuous Latent Memory
                  </span>
                  <p className="text-xs text-[#8F96A3] leading-relaxed font-sans">
                    Carries forward structured representations without growing a historical token buffer.
                  </p>
                </div>

                <div className="rounded-lg bg-[#151922] p-3 border border-[#252A35]">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold block mb-1">
                    Skill Induction
                  </span>
                  <p className="text-xs text-[#8F96A3] leading-relaxed font-sans">
                    Synthesizes operational routines dynamically during sequential graph updates.
                  </p>
                </div>

                <div className="rounded-lg bg-[#151922] p-3 border border-[#252A35]">
                  <span className="text-[10px] text-amber-400 uppercase font-bold block mb-1">
                    Bounded Hardware Profile
                  </span>
                  <p className="text-xs text-[#8F96A3] leading-relaxed font-sans">
                    Retains constant RAM requirements regardless of reasoning problem complexity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 13. Token Budget Visual: Chain-of-Thought vs BDH Latent Reasoning */}
        <TokenBudgetVisual />

        {/* BDH-CQ Bridge: Interactive Latent Reasoning Demo & Model Contract */}
        <BDHCQBridge />

        {/* 15. BDH-CQ Research Findings Card */}
        <BDHCQResearchCard />

        {/* 14. Research vs Toy Split Screen (Epistemic Honesty) */}
        <ResearchVsToySplit />

        {/* 2. Explain It Challenge: Deterministic concept check */}
        <ExplainItChallenge />
      </div>
    </section>
  );
};

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
    <section id="section-10" className="scroll-mt-20 border-b border-[#E5E0D8] bg-[#FBF9F5] py-20 text-[#151515]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 space-y-12">
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
            <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-3">
                <span className="text-xs font-mono uppercase tracking-widest text-[#167C80] font-bold flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5" />
                  REASONING PARADIGM (150M PARAMS)
                </span>
                <EvidenceBadge category="OFFICIAL PATHWAY MATERIAL" />
              </div>

              <p className="text-xs text-[#52504A] font-sans leading-relaxed">
                BDH-CQ is a <strong>150M-parameter reasoning architecture</strong> that demonstrates in-context skill acquisition on demanding benchmark tasks (such as <strong>ARC-AGI-1</strong>) by relaxing recurrent synaptic states rather than emitting linear scratchpads of tokens.
              </p>

              {/* Explicit 4-Step Pipeline Flow */}
              <div className="rounded-xl bg-[#FAF8F5] p-4 border border-[#EAE6DF] space-y-2.5 font-mono text-xs">
                <span className="text-[10px] text-[#716F68] uppercase font-bold block">
                  BDH LATENT REASONING LIFECYCLE:
                </span>
                <div className="space-y-2 text-[11px]">
                  <div className="flex items-center gap-2.5 text-[#52504A]">
                    <span className="w-4 h-4 rounded-full bg-[#EDF7F7] text-[#167C80] border border-[#CFE8E8] flex items-center justify-center text-[10px] font-bold">1</span>
                    <span>Problem input arrives into neuron activations</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[#52504A]">
                    <span className="w-4 h-4 rounded-full bg-[#F3EFFF] text-[#6842C2] border border-[#E2D8FA] flex items-center justify-center text-[10px] font-bold">2</span>
                    <span>Synapses update internally across reasoning rounds</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[#52504A]">
                    <span className="w-4 h-4 rounded-full bg-[#EDF8F2] text-[#247A4B] border border-[#CDEEDB] flex items-center justify-center text-[10px] font-bold">3</span>
                    <span>Stable answer attractor forms in connection topology</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[#52504A]">
                    <span className="w-4 h-4 rounded-full bg-[#FFF8EE] text-[#A46622] border border-[#F5E2C4] flex items-center justify-center text-[10px] font-bold">4</span>
                    <span>Output tokens generated only at the very end</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 font-mono text-xs">
                <button
                  onClick={() => setActiveTab('traditional')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    activeTab === 'traditional'
                      ? 'bg-[#FFF8EE] border-[#F5E2C4] text-[#151515] shadow-xs'
                      : 'bg-[#FAF8F5] border-[#E5E0D8] text-[#716F68] hover:text-[#151515] hover:bg-[#FFFFFF]'
                  }`}
                >
                  <div className="font-bold text-[#151515]">Traditional Token Chain-of-Thought</div>
                  <div className="text-[11px] text-[#716F68] mt-0.5">
                    Linear scratchpad tokens inflating the KV-cache at each step.
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('bdhcq')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    activeTab === 'bdhcq'
                      ? 'bg-[#F3EFFF] border-[#E2D8FA] text-[#151515] shadow-xs'
                      : 'bg-[#FAF8F5] border-[#E5E0D8] text-[#716F68] hover:text-[#151515] hover:bg-[#FFFFFF]'
                  }`}
                >
                  <div className="font-bold text-[#151515]">BDH Latent Reasoning (Synaptic Space)</div>
                  <div className="text-[11px] text-[#716F68] mt-0.5">
                    Multi-step internal relaxation directly in recurrent synaptic weights.
                  </div>
                </button>
              </div>
            </div>

            {/* Official Pathway Publication Link */}
            <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-5 space-y-2 shadow-xs">
              <span className="font-mono text-[10px] text-[#716F68] uppercase font-bold block">
                Official Pathway Publication
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-serif font-bold text-sm text-[#151515]">
                    &ldquo;Introducing BDH-CQ&rdquo;
                  </div>
                  <p className="text-[11px] text-[#716F68] font-sans">
                    Demonstration learning & latent recurrent reasoning
                  </p>
                </div>
                <a
                  href="https://pathway.com/research/introducing-bdh-cq"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-xs text-[#167C80] hover:underline font-bold"
                >
                  <span>Read Article</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Deep Comparison Visualization & Key Takeaways */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-6 sm:p-7 space-y-6 shadow-xs">
              {activeTab === 'traditional' ? (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-3">
                    <span className="font-mono text-xs font-bold uppercase text-[#A46622]">
                      Standard LLM: Generation of Explicit Intermediate Tokens
                    </span>
                    <span className="font-mono text-[10px] text-[#716F68] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E5E0D8]">
                      O(T) Growing Cache
                    </span>
                  </div>

                  <p className="text-xs text-[#52504A] font-sans leading-relaxed">
                    Standard transformer models perform reasoning by generating dozens or hundreds of explicit text tokens into a scratchpad (&ldquo;Let&apos;s think step by step: Step 1..., Step 2...&rdquo;). Each generated token consumes additional GPU memory in the KV cache, quadratically or linearly inflating future attention costs.
                  </p>

                  <div className="rounded-xl border border-[#F5E2C4] bg-[#FFF8EE] p-4 font-mono text-xs text-[#52504A] space-y-2">
                    <div className="text-[#151515] font-semibold">
                      Prompt → <span className="text-[#A46622]">Token 1</span> → <span className="text-[#A46622]">Token 2</span> → ... → <span className="text-[#A46622]">Token 250</span> → Solution
                    </div>
                    <div className="text-[11px] text-[#C53030] border-t border-[#F5E2C4] pt-2">
                      Memory footprint: Expands proportionally with every step of deliberation.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-3">
                    <span className="font-mono text-xs font-bold uppercase text-[#6842C2]">
                      BDH-CQ: Multi-Step Recurrent Latent Graph Relaxation
                    </span>
                    <span className="font-mono text-[10px] text-[#247A4B] bg-[#EDF8F2] px-2 py-0.5 rounded border border-[#CDEEDB] font-bold">
                      O(1) Bounded State
                    </span>
                  </div>

                  <p className="text-xs text-[#52504A] font-sans leading-relaxed">
                    BDH-CQ performs multiple internal relaxation cycles across its neuron particle graph and synaptic connection weights <em>before</em> outputting any answer. The deliberation takes place entirely in continuous latent state, solving complex demonstration tasks without filling the context window with intermediate scratchpad text.
                  </p>

                  <div className="rounded-xl border border-[#E2D8FA] bg-[#FAF8FD] p-4 font-mono text-xs text-[#52504A] space-y-2">
                    <div className="text-[#151515] font-semibold">
                      Demonstration → <span className="text-[#167C80] font-bold">[Synaptic Graph Relaxation t=1..K]</span> → Direct Answer
                    </div>
                    <div className="text-[11px] text-[#247A4B] border-t border-[#E2D8FA] pt-2 font-medium">
                      Memory footprint: Strictly constant O(1). Reasoning compute occurs in the recurrent dynamics.
                    </div>
                  </div>
                </div>
              )}

              {/* 4 Pillars of BDH-CQ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 font-mono">
                <div className="rounded-xl bg-[#FAF8F5] p-4 border border-[#EAE6DF]">
                  <span className="text-[10px] text-[#167C80] uppercase font-bold block mb-1">
                    In-Context Demonstration Learning
                  </span>
                  <p className="text-xs text-[#52504A] leading-relaxed font-sans">
                    Discovers algorithmic rules directly from few-shot input examples via state modulation.
                  </p>
                </div>

                <div className="rounded-xl bg-[#FAF8F5] p-4 border border-[#EAE6DF]">
                  <span className="text-[10px] text-[#6842C2] uppercase font-bold block mb-1">
                    Continuous Latent Memory
                  </span>
                  <p className="text-xs text-[#52504A] leading-relaxed font-sans">
                    Carries forward structured representations without growing a historical token buffer.
                  </p>
                </div>

                <div className="rounded-xl bg-[#FAF8F5] p-4 border border-[#EAE6DF]">
                  <span className="text-[10px] text-[#247A4B] uppercase font-bold block mb-1">
                    Skill Induction
                  </span>
                  <p className="text-xs text-[#52504A] leading-relaxed font-sans">
                    Synthesizes operational routines dynamically during sequential graph updates.
                  </p>
                </div>

                <div className="rounded-xl bg-[#FAF8F5] p-4 border border-[#EAE6DF]">
                  <span className="text-[10px] text-[#A46622] uppercase font-bold block mb-1">
                    Bounded Hardware Profile
                  </span>
                  <p className="text-xs text-[#52504A] leading-relaxed font-sans">
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

import React, { useState } from 'react';
import { Coins, Zap, HardDrive, Eye, Brain, ArrowRight, CheckCircle2 } from 'lucide-react';

export const TokenBudgetVisual: React.FC = () => {
  const [reasoningSteps, setReasoningSteps] = useState<number>(6);

  // Model calculations
  // CoT generates ~45 tokens per reasoning step
  const cotTokens = reasoningSteps * 45;
  // BDH generates 0 scratchpad tokens during reasoning, only ~5 final answer tokens
  const bdhTokens = 5;

  // KV Cache memory relative scale (bytes per token in float16)
  const cotMemoryMb = Number((0.8 + cotTokens * 0.012).toFixed(2));
  const bdhMemoryMb = 0.8; // Bounded constant state

  return (
    <div className="rounded-2xl border border-[#252A35] bg-[#0A0E18] p-5 sm:p-6 text-slate-100 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2536] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            <h3 className="font-mono text-base font-bold text-white uppercase tracking-wider">
              Token Budget & Memory Overhead
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare verbal Chain-of-Thought (text tokens) vs. BDH Latent Reasoning (synaptic state transitions).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400">Thinking Depth:</span>
          <div className="flex items-center gap-1 bg-[#121724] border border-[#232D42] p-1 rounded-lg font-mono text-xs">
            {[2, 4, 6, 8, 12].map((s) => (
              <button
                key={s}
                onClick={() => setReasoningSteps(s)}
                className={`px-2.5 py-1 rounded transition ${
                  reasoningSteps === s
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s} steps
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono">
        {/* Left: Chain-of-Thought */}
        <div className="rounded-xl border border-amber-500/30 bg-[#10141E] p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-[#222A3C] pb-2">
            <span className="text-xs font-bold text-amber-300 uppercase flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              CHAIN-OF-THOUGHT (CoT)
            </span>
            <span className="text-[10px] text-slate-400">Standard LLMs</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Token Generation:</span>
                <strong className="text-amber-400 font-bold">{cotTokens} tokens</strong>
              </div>
              <div className="w-full bg-[#1A2234] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (cotTokens / 540) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">High verbal footprint · Linear growth</span>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>KV Cache Overhead:</span>
                <strong className="text-rose-400 font-bold">{cotMemoryMb} MB (Growing)</strong>
              </div>
              <div className="w-full bg-[#1A2234] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-rose-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (cotMemoryMb / 7.2) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Accumulates with every reasoning token</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#0C1019] border border-[#1A2336] text-[11px] space-y-1">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <Eye className="w-3 h-3 text-amber-400" />
                <span>Thinking Visibility:</span>
              </div>
              <p className="text-slate-400 text-[10px] font-sans">
                Visible directly in emitted text ("Step 1: First we compute... Step 2: Next we verify...").
              </p>
            </div>
          </div>
        </div>

        {/* Right: BDH Latent Reasoning */}
        <div className="rounded-xl border border-cyan-500/30 bg-[#10141E] p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-[#222A3C] pb-2">
            <span className="text-xs font-bold text-[#22D3EE] uppercase flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-cyan-400" />
              BDH LATENT REASONING
            </span>
            <span className="text-[10px] text-cyan-400 font-semibold">BDH-CQ Concept</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Token Generation:</span>
                <strong className="text-cyan-400 font-bold">{bdhTokens} tokens</strong>
              </div>
              <div className="w-full bg-[#1A2234] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-cyan-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: '4%' }}
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Minimal · Final answer only</span>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>KV Cache Overhead:</span>
                <strong className="text-emerald-400 font-bold">{bdhMemoryMb} MB (Bounded)</strong>
              </div>
              <div className="w-full bg-[#1A2234] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: '12%' }}
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">O(1) state space · Constant memory limit</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#0C1019] border border-[#1A2336] text-[11px] space-y-1">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <Eye className="w-3 h-3 text-cyan-400" />
                <span>Thinking Visibility:</span>
              </div>
              <p className="text-slate-400 text-[10px] font-sans">
                Visible in the recurrent synaptic trajectory σ(t) across internal reasoning rounds.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Takeaway Banner */}
      <div className="p-3 rounded-xl bg-[#0F1422] border border-[#1F293D] flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-slate-300">
            For {reasoningSteps} reasoning steps: BDH avoids generating {cotTokens - bdhTokens} scratchpad tokens while bounding working memory.
          </span>
        </div>
        <span className="text-[10px] text-slate-500 hidden sm:inline">O(1) Memory Frontier</span>
      </div>
    </div>
  );
};

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
    <div className="rounded-xl border border-[#D8DCD8] bg-[#FFFFFF] p-5 sm:p-6 text-[#252525] space-y-6 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6DF] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-[#8C5D17]" />
            <h3 className="font-serif text-base font-bold text-[#252525]">
              Token budget & memory overhead
            </h3>
          </div>
          <p className="text-xs text-[#5F625F] mt-0.5">
            Compare verbal chain-of-thought (text tokens) vs. BDH latent reasoning (synaptic state transitions).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#5F625F]">Thinking depth:</span>
          <div className="flex items-center gap-1 bg-[#F7F5EF] border border-[#D8DCD8] p-1 rounded-lg text-xs">
            {[2, 4, 6, 8, 12].map((s) => (
              <button
                key={s}
                onClick={() => setReasoningSteps(s)}
                className={`px-2.5 py-1 rounded transition cursor-pointer ${
                  reasoningSteps === s
                    ? 'bg-[#E7F2FA] text-[#31566E] font-semibold border border-[#B8D7ED]'
                    : 'text-[#5F625F] hover:text-[#252525]'
                }`}
              >
                {s} steps
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left: Chain-of-Thought */}
        <div className="rounded-xl border border-[#EAE6DF] bg-[#F7F5EF] p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-2">
            <span className="text-xs font-semibold text-[#8C5D17] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#8C5D17]" />
              Chain-of-thought (CoT)
            </span>
            <span className="text-xs text-[#5F625F]">Standard autoregressive LLMs</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-[#252525] mb-1">
                <span>Token generation:</span>
                <strong className="font-mono text-[#8C5D17] font-bold">{cotTokens} tokens</strong>
              </div>
              <div className="w-full bg-[#EAE6DF] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#8C5D17] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (cotTokens / 540) * 100)}%` }}
                />
              </div>
              <span className="text-xs text-[#5F625F] mt-0.5 block">High verbal footprint · Linear growth</span>
            </div>

            <div>
              <div className="flex justify-between text-[#252525] mb-1">
                <span>KV cache overhead:</span>
                <strong className="font-mono text-[#B64235] font-bold">{cotMemoryMb} MB (Growing)</strong>
              </div>
              <div className="w-full bg-[#EAE6DF] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#B64235] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (cotMemoryMb / 7.2) * 100)}%` }}
                />
              </div>
              <span className="text-xs text-[#5F625F] mt-0.5 block">Accumulates with every reasoning token</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#D8DCD8] text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-[#252525] font-semibold">
                <Eye className="w-3 h-3 text-[#8C5D17]" />
                <span>Thinking visibility:</span>
              </div>
              <p className="text-[#5F625F] text-xs font-sans">
                Visible directly in emitted text ("Step 1: First we compute... Step 2: Next we verify...").
              </p>
            </div>
          </div>
        </div>

        {/* Right: BDH Latent Reasoning */}
        <div className="rounded-xl border border-[#B8D7ED] bg-[#E7F2FA] p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-[#B8D7ED] pb-2">
            <span className="text-xs font-semibold text-[#31566E] flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-[#31566E]" />
              BDH latent reasoning
            </span>
            <span className="text-xs text-[#31566E] font-medium">BDH-CQ Concept</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-[#252525] mb-1">
                <span>Token generation:</span>
                <strong className="font-mono text-[#31566E] font-bold">{bdhTokens} tokens</strong>
              </div>
              <div className="w-full bg-[#D1E5F5] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#31566E] h-2 rounded-full transition-all duration-300"
                  style={{ width: '4%' }}
                />
              </div>
              <span className="text-xs text-[#5F625F] mt-0.5 block">Minimal · Final answer only</span>
            </div>

            <div>
              <div className="flex justify-between text-[#252525] mb-1">
                <span>KV cache overhead:</span>
                <strong className="font-mono text-[#247A4B] font-bold">{bdhMemoryMb} MB (Bounded)</strong>
              </div>
              <div className="w-full bg-[#D1E5F5] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#247A4B] h-2 rounded-full transition-all duration-300"
                  style={{ width: '12%' }}
                />
              </div>
              <span className="text-xs text-[#5F625F] mt-0.5 block">O(1) state space · Constant memory limit</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#B8D7ED] text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-[#252525] font-semibold">
                <Eye className="w-3 h-3 text-[#31566E]" />
                <span>Thinking visibility:</span>
              </div>
              <p className="text-[#5F625F] text-xs font-sans">
                Visible in the recurrent synaptic trajectory σ(t) across internal reasoning rounds.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Takeaway Banner */}
      <div className="p-3.5 rounded-lg bg-[#DCEFE2] border border-[#BCE2C9] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-[#245B38]">
          <CheckCircle2 className="w-4 h-4 text-[#247A4B] shrink-0" />
          <span>
            For {reasoningSteps} reasoning steps: BDH avoids generating {cotTokens - bdhTokens} scratchpad tokens while bounding working memory.
          </span>
        </div>
        <span className="text-xs font-mono text-[#245B38] font-semibold hidden sm:inline">O(1) Memory Limit</span>
      </div>
    </div>
  );
};

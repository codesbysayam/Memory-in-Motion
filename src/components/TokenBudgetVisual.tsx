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
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 text-[var(--text-primary)] space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-[var(--color-warning)]" />
            <h3 className="font-sans text-base font-semibold text-[var(--text-primary)]">
              Token budget &amp; memory overhead
            </h3>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Compare verbal chain-of-thought (text tokens) vs. BDH latent reasoning (synaptic state transitions).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[var(--text-secondary)]">Thinking depth:</span>
          <div className="flex items-center gap-1 bg-[var(--surface-soft)] border border-[var(--border)] p-1 rounded-lg text-xs">
            {[2, 4, 6, 8, 12].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setReasoningSteps(s)}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer font-mono tabular-nums ${
                  reasoningSteps === s
                    ? 'bg-[var(--surface)] text-[var(--text-primary)] font-semibold border border-[var(--color-border-strong)] shadow-2xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
            <span className="text-xs font-semibold text-[var(--color-warning)] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[var(--color-warning)]" />
              Chain-of-thought (CoT)
            </span>
            <span className="text-xs text-[var(--text-muted)]">Standard autoregressive LLMs</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-[var(--text-primary)] mb-1">
                <span>Token generation:</span>
                <strong className="font-mono tabular-nums text-[var(--color-warning)] font-bold">{cotTokens} tokens</strong>
              </div>
              <div className="w-full bg-[var(--border)] rounded-sm h-2 overflow-hidden">
                <div
                  className="bg-[var(--color-warning)] h-2 rounded-sm transition-all duration-300"
                  style={{ width: `${Math.min(100, (cotTokens / 540) * 100)}%` }}
                />
              </div>
              <span className="text-xs text-[var(--text-secondary)] mt-0.5 block">High verbal footprint · Linear growth</span>
            </div>

            <div>
              <div className="flex justify-between text-[var(--text-primary)] mb-1">
                <span>KV cache overhead:</span>
                <strong className="font-mono tabular-nums text-[var(--color-danger)] font-bold">{cotMemoryMb} MB (Growing)</strong>
              </div>
              <div className="w-full bg-[var(--border)] rounded-sm h-2 overflow-hidden">
                <div
                  className="bg-[var(--color-danger)] h-2 rounded-sm transition-all duration-300"
                  style={{ width: `${Math.min(100, (cotMemoryMb / 7.2) * 100)}%` }}
                />
              </div>
              <span className="text-xs text-[var(--text-secondary)] mt-0.5 block">Accumulates with every reasoning token</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-[var(--text-primary)] font-semibold">
                <Eye className="w-3 h-3 text-[var(--color-warning)]" />
                <span>Thinking visibility:</span>
              </div>
              <p className="text-[var(--text-secondary)] text-xs font-sans">
                Visible directly in emitted text (&ldquo;Step 1: First we compute... Step 2: Next we verify...&rdquo;).
              </p>
            </div>
          </div>
        </div>

        {/* Right: BDH Latent Reasoning */}
        <div className="rounded-xl border border-[var(--color-border-strong)] bg-[var(--accent-blue)] p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
            <span className="text-xs font-semibold text-[var(--accent-blue-text)] flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-[var(--accent-blue-text)]" />
              BDH latent reasoning
            </span>
            <span className="text-xs text-[var(--accent-blue-text)] font-medium">BDH-CQ Concept</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-[var(--text-primary)] mb-1">
                <span>Token generation:</span>
                <strong className="font-mono tabular-nums text-[var(--accent-blue-text)] font-bold">{bdhTokens} tokens</strong>
              </div>
              <div className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-sm h-2 overflow-hidden">
                <div
                  className="bg-[var(--color-accent)] h-2 rounded-sm transition-all duration-300"
                  style={{ width: '4%' }}
                />
              </div>
              <span className="text-xs text-[var(--text-secondary)] mt-0.5 block">Minimal · Final answer only</span>
            </div>

            <div>
              <div className="flex justify-between text-[var(--text-primary)] mb-1">
                <span>KV cache overhead:</span>
                <strong className="font-mono tabular-nums text-[var(--color-success)] font-bold">{bdhMemoryMb} MB (Bounded)</strong>
              </div>
              <div className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-sm h-2 overflow-hidden">
                <div
                  className="bg-[var(--color-success)] h-2 rounded-sm transition-all duration-300"
                  style={{ width: '12%' }}
                />
              </div>
              <span className="text-xs text-[var(--text-secondary)] mt-0.5 block">O(1) state space · Constant memory limit</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-[var(--text-primary)] font-semibold">
                <Eye className="w-3 h-3 text-[var(--accent-blue-text)]" />
                <span>Thinking visibility:</span>
              </div>
              <p className="text-[var(--text-secondary)] text-xs font-sans">
                Visible in the recurrent synaptic trajectory σ(t) across internal reasoning rounds.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Takeaway Banner */}
      <div className="p-3.5 rounded-lg bg-[var(--color-success-soft)] border border-[var(--color-success-border)] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-[var(--color-success)] font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>
            For {reasoningSteps} reasoning steps: BDH avoids generating {cotTokens - bdhTokens} scratchpad tokens while bounding working memory.
          </span>
        </div>
        <span className="text-xs font-mono text-[var(--color-success)] font-semibold hidden sm:inline">O(1) Memory Limit</span>
      </div>
    </div>
  );
};

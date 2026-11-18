import React, { useMemo } from 'react';
import { Scale, ArrowLeftRight, HelpCircle } from 'lucide-react';

interface MemoryTensionProps {
  dimension: number;
  retention: number; // 0 to 1
  sequenceLength: number;
  interference?: number; // 0 to 1
  className?: string;
}

export const MemoryTension: React.FC<MemoryTensionProps> = ({
  dimension,
  retention,
  sequenceLength,
  interference = 0.1,
  className = '',
}) => {
  // Conceptual position calculation:
  // Higher dimension, lower sequence length, and lower interference tilt toward "Keep Everything / High Recall"
  // Lower dimension, higher sequence length, and higher compression tilt toward "Compress Everything / Bounded Efficiency"
  const balanceOffset = useMemo(() => {
    // Capacity factor = dimension / (sequenceLength * 2.5)
    // 1.0 means balanced. > 1.0 means plenty of capacity. < 1.0 means high compression pressure.
    const capacityRatio = dimension / Math.max(1, sequenceLength * 2);
    // Range from -1 (extreme compress) to +1 (extreme keep)
    const normalized = Math.max(-1, Math.min(1, (capacityRatio - 1) * 0.8 + (retention - 0.8) * 1.5 - interference));
    return normalized; // -1 to +1
  }, [dimension, sequenceLength, retention, interference]);

  // Convert to percentage (0% = Compress, 100% = Keep, 50% = Center)
  const indicatorPercent = useMemo(() => {
    const pct = 50 + balanceOffset * 38; // stays within 12% to 88%
    return Math.max(12, Math.min(88, pct));
  }, [balanceOffset]);

  const tensionStateDescription = useMemo(() => {
    if (balanceOffset > 0.3) {
      return {
        stance: 'High-fidelity regime',
        detail: 'Generous coordinates per fact. Recall is protected, but memory footprint per step is relatively elevated.',
        tagColor: 'text-[var(--accent-green-text)] bg-[var(--accent-green)] border-[var(--color-success-border)]',
      };
    }
    if (balanceOffset < -0.3) {
      return {
        stance: 'High-compression regime',
        detail: 'Extreme geometric packaging into bounded coordinates. Storage is bounded, but superposition crosstalk increases.',
        tagColor: 'text-[var(--accent-yellow-text)] bg-[var(--accent-yellow)] border-[var(--color-warning-border)]',
      };
    }
    return {
      stance: 'Critical boundary zone',
      detail: 'State capacity is balanced near the retrieval threshold. Small perturbations can trigger recall bifurcation.',
      tagColor: 'text-[var(--accent-blue-text)] bg-[var(--accent-blue)] border-[var(--border)]',
    };
  }, [balanceOffset]);

  return (
    <div className={`diagram-frame p-6 space-y-6 tabular-nums ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[var(--accent-blue)] text-[var(--accent-blue-text)] border border-[var(--border)]">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-semibold text-[var(--accent-blue-text)]">
                Conceptual design pressure
              </span>
              <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--surface-soft)] px-2 py-0.5 rounded-md border border-[var(--border)]">
                The two extremes
              </span>
            </div>
            <h3 className="text-lg font-serif font-bold text-[var(--text-primary)] mt-0.5">
              The fundamental memory tension
            </h3>
          </div>
        </div>

        <div className={`px-3 py-1 rounded-md text-xs font-mono font-semibold border ${tensionStateDescription.tagColor}`}>
          {tensionStateDescription.stance}
        </div>
      </div>

      {/* Conceptual Diagram & The Two Extremes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        {/* Left Column: KEEP EVERYTHING */}
        <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[var(--accent-blue-text)] text-xs">
              Keep everything
            </span>
            <span className="text-xs text-[var(--text-muted)]">Transformer KV cache</span>
          </div>
          <div className="space-y-1.5 text-[var(--text-secondary)] text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[var(--accent-blue-text)]">▼</span> Growing context window
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[var(--accent-blue-text)]">▼</span> Exact token retention / high recall
            </div>
            <div className="pt-2 border-t border-[var(--border)] flex flex-col gap-1 text-xs">
              <span className="text-[var(--accent-pink-text)] font-semibold">↑ O(N) storage expansion</span>
              <span className="text-[var(--accent-pink-text)] font-semibold">↑ O(N²) quadratic attention compute</span>
            </div>
          </div>
        </div>

        {/* Right Column: COMPRESS EVERYTHING */}
        <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[var(--accent-blue-text)] text-xs">
              Compress everything
            </span>
            <span className="text-xs text-[var(--text-muted)]">Recurrent state / BDH</span>
          </div>
          <div className="space-y-1.5 text-[var(--text-secondary)] text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[var(--accent-blue-text)]">▼</span> Fixed-size bounded internal state
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[var(--accent-blue-text)]">▼</span> O(1) constant generation cost
            </div>
            <div className="pt-2 border-t border-[var(--border)] flex flex-col gap-1 text-xs">
              <span className="text-[var(--accent-yellow-text)] font-semibold">↑ Coordinate interference</span>
              <span className="text-[var(--accent-yellow-text)] font-semibold">↑ Forgetting / crosstalk risk</span>
            </div>
          </div>
        </div>
      </div>

      {/* The Live Interactive Fulcrum */}
      <div className="p-5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <span className="text-[var(--text-muted)] flex items-center gap-1.5 font-medium">
            <ArrowLeftRight className="w-3.5 h-3.5 text-[var(--accent-blue-text)]" />
            Your experiment operating point:
          </span>
          <span className="text-xs text-[var(--accent-blue-text)] font-bold">
            d={dimension} · Seq={sequenceLength} · λ={retention.toFixed(2)}
          </span>
        </div>

        {/* Live Fulcrum Bar */}
        <div className="relative pt-7 pb-2">
          {/* Track Line */}
          <div className="h-2 w-full rounded-sm bg-[var(--border)]" />

          {/* Fulcrum labels on ends */}
          <div className="flex justify-between text-xs font-mono text-[var(--text-muted)] mt-2.5 gap-2">
            <div className="text-left">
              <span className="text-[var(--accent-blue-text)] font-bold block">Recall focus</span>
              <span>Generous coordinates</span>
            </div>
            <div className="text-center hidden sm:block">
              <span className="text-[var(--text-muted)]">Balanced design pivot</span>
            </div>
            <div className="text-right">
              <span className="text-[var(--accent-yellow-text)] font-bold block">Efficiency focus</span>
              <span>Bounded footprint</span>
            </div>
          </div>

          {/* Dynamic Pin Indicator */}
          <div
            className="absolute top-0 transition-all duration-300 -translate-x-1/2 flex flex-col items-center pointer-events-none"
            style={{ left: `${indicatorPercent}%` }}
          >
            <div className="px-2.5 py-0.5 rounded-md bg-[var(--text-primary)] text-[var(--page-bg)] text-[11px] font-mono font-semibold shadow-sm whitespace-nowrap">
              Operating point
            </div>
            <div className="w-0.5 h-6 bg-[var(--text-primary)] mt-0.5" />
            <div className="w-3 h-3 rounded-full bg-[var(--color-accent)] ring-2 ring-[var(--surface)]" />
          </div>
        </div>

        <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed pt-1">
          {tensionStateDescription.detail}
        </p>
      </div>

      {/* Pathway BDH Framing Note */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--accent-blue)]/50 p-4 text-xs font-mono text-[var(--text-secondary)] space-y-1.5">
        <div className="flex items-center gap-2 font-semibold text-[var(--accent-blue-text)]">
          <HelpCircle className="w-4 h-4 text-[var(--accent-blue-text)] shrink-0" />
          <span>Research connection · Pathway BDH explainer</span>
        </div>
        <p className="text-xs leading-relaxed text-[var(--text-secondary)] font-sans">
          &ldquo;Your experiment shows one concrete instance of this trade-off.&rdquo; This is consistent with Pathway&apos;s current BDH explainer, which contrasts growing Transformer KV-cache state with compact recurrent states and frames BDH as trying to balance long-context performance with token-generation complexity.
        </p>
      </div>
    </div>
  );
};

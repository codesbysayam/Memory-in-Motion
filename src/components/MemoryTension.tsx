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
        stance: 'High-Fidelity Regime',
        detail: 'Generous coordinates per fact. Recall is protected, but memory footprint per step is relatively elevated.',
        tagColor: 'text-[#167C80] bg-[#EDF7F7] border-[#CFE8E8]',
      };
    }
    if (balanceOffset < -0.3) {
      return {
        stance: 'High-Compression Regime',
        detail: 'Extreme geometric packaging into bounded coordinates. Storage is bounded, but superposition crosstalk increases.',
        tagColor: 'text-[#A46622] bg-[#FDF8EE] border-[#F5E2C4]',
      };
    }
    return {
      stance: 'Critical Boundary Zone',
      detail: 'State capacity is balanced near the retrieval threshold. Small perturbations can trigger recall bifurcation.',
      tagColor: 'text-[#6842C2] bg-[#F3EFFF] border-[#E2D8FA]',
    };
  }, [balanceOffset]);

  return (
    <div className={`rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-6 space-y-6 shadow-xs ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6DF] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#F3EFFF] text-[#6842C2] border border-[#E2D8FA]">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-widest text-[#6842C2] uppercase">
                CONCEPTUAL DESIGN PRESSURE
              </span>
              <span className="text-[10px] font-mono text-[#716F68] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#EAE6DF]">
                THE TWO EXTREMES
              </span>
            </div>
            <h3 className="text-lg font-serif font-bold text-[#151515] mt-0.5">
              The Fundamental Memory Tension
            </h3>
          </div>
        </div>

        <div className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${tensionStateDescription.tagColor}`}>
          {tensionStateDescription.stance}
        </div>
      </div>

      {/* Conceptual Diagram & The Two Extremes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        {/* Left Column: KEEP EVERYTHING */}
        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#167C80] uppercase tracking-wider text-[11px]">
              KEEP EVERYTHING
            </span>
            <span className="text-[10px] text-[#716F68]">Transformer KV Cache</span>
          </div>
          <div className="space-y-1.5 text-[#52504A] text-[11px]">
            <div className="flex items-center gap-2">
              <span className="text-[#167C80]">▼</span> Growing context window
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#167C80]">▼</span> Exact token retention / high recall
            </div>
            <div className="pt-2 border-t border-[#EAE6DF] flex flex-col gap-1 text-[10px]">
              <span className="text-[#B64235] font-semibold">↑ O(N) storage expansion</span>
              <span className="text-[#B64235] font-semibold">↑ O(N²) quadratic attention compute</span>
            </div>
          </div>
        </div>

        {/* Right Column: COMPRESS EVERYTHING */}
        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#6842C2] uppercase tracking-wider text-[11px]">
              COMPRESS EVERYTHING
            </span>
            <span className="text-[10px] text-[#716F68]">Recurrent State / BDH</span>
          </div>
          <div className="space-y-1.5 text-[#52504A] text-[11px]">
            <div className="flex items-center gap-2">
              <span className="text-[#6842C2]">▼</span> Fixed-size bounded internal state
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#6842C2]">▼</span> O(1) constant generation cost
            </div>
            <div className="pt-2 border-t border-[#EAE6DF] flex flex-col gap-1 text-[10px]">
              <span className="text-[#A46622] font-semibold">↑ Coordinate interference</span>
              <span className="text-[#A46622] font-semibold">↑ Forgetting / crosstalk risk</span>
            </div>
          </div>
        </div>
      </div>

      {/* The Live Interactive Fulcrum */}
      <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-4">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#716F68] flex items-center gap-1.5 font-medium">
            <ArrowLeftRight className="w-3.5 h-3.5 text-[#167C80]" />
            YOUR EXPERIMENT OPERATING POINT:
          </span>
          <span className="text-[11px] text-[#167C80] font-bold">
            D={dimension} · Seq={sequenceLength} · λ={retention.toFixed(2)}
          </span>
        </div>

        {/* Live Fulcrum Bar */}
        <div className="relative pt-6 pb-2">
          {/* Track Line */}
          <div className="h-2 w-full rounded-full bg-[#E5E0D8]" />

          {/* Fulcrum labels on ends */}
          <div className="flex justify-between text-[10px] font-mono text-[#716F68] mt-2">
            <div className="text-left">
              <span className="text-[#167C80] font-bold block">RECALL FOCUS</span>
              <span>Generous coordinates</span>
            </div>
            <div className="text-center">
              <span className="text-[#716F68]">Balanced Design Pivot</span>
            </div>
            <div className="text-right">
              <span className="text-[#6842C2] font-bold block">EFFICIENCY FOCUS</span>
              <span>Bounded footprint</span>
            </div>
          </div>

          {/* Dynamic Pin Indicator */}
          <div
            className="absolute top-0 transition-all duration-300 -translate-x-1/2 flex flex-col items-center pointer-events-none"
            style={{ left: `${indicatorPercent}%` }}
          >
            <div className="px-2.5 py-0.5 rounded-full bg-[#151515] text-[#FFFFFF] text-[10px] font-mono font-bold shadow-sm flex items-center gap-1">
              <span>OPERATING POINT</span>
            </div>
            <div className="w-0.5 h-6 bg-[#151515] mt-0.5" />
            <div className="w-3 h-3 rounded-full bg-[#151515] ring-4 ring-[#151515]/10 shadow-xs" />
          </div>
        </div>

        <p className="text-xs text-[#52504A] font-sans leading-relaxed pt-1">
          {tensionStateDescription.detail}
        </p>
      </div>

      {/* Pathway BDH Framing Note */}
      <div className="rounded-xl border border-[#E2D8FA] bg-[#F3EFFF] p-4 text-xs font-mono text-[#52504A] space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-[#6842C2]">
          <HelpCircle className="w-4 h-4 text-[#6842C2] shrink-0" />
          <span>RESEARCH CONNECTION · PATHWAY BDH EXPLAINER</span>
        </div>
        <p className="text-[11px] leading-relaxed text-[#52504A] font-sans">
          &ldquo;Your experiment shows one concrete instance of this trade-off.&rdquo; This is consistent with Pathway&apos;s current BDH explainer, which contrasts growing Transformer KV-cache state with compact recurrent states and frames BDH as trying to balance long-context performance with token-generation complexity.
        </p>
      </div>
    </div>
  );
};

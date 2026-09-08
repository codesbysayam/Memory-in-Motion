import React, { useMemo } from 'react';
import { Scale, ArrowLeftRight, HelpCircle, ShieldAlert } from 'lucide-react';

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
        tagColor: 'text-blue-400 bg-blue-950/60 border-blue-800',
      };
    }
    if (balanceOffset < -0.3) {
      return {
        stance: 'High-Compression Regime',
        detail: 'Extreme geometric packaging into bounded coordinates. Storage is bounded, but superposition crosstalk increases.',
        tagColor: 'text-amber-400 bg-amber-950/60 border-amber-800',
      };
    }
    return {
      stance: 'Critical Boundary Zone',
      detail: 'State capacity is balanced near the retrieval threshold. Small perturbations can trigger recall bifurcation.',
      tagColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-800',
    };
  }, [balanceOffset]);

  return (
    <div className={`rounded-2xl border border-[#252A35] bg-[#0E121A] p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2536] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-violet-950/60 text-violet-400 border border-violet-800/60">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-widest text-violet-300 uppercase">
                CONCEPTUAL DESIGN PRESSURE
              </span>
              <span className="text-[10px] font-mono text-slate-500 bg-[#151922] px-2 py-0.5 rounded border border-[#252A35]">
                THE TWO EXTREMES
              </span>
            </div>
            <h3 className="text-base font-semibold text-white">
              The Fundamental Memory Tension
            </h3>
          </div>
        </div>

        <div className={`px-3 py-1 rounded-full text-xs font-mono font-semibold border ${tensionStateDescription.tagColor}`}>
          {tensionStateDescription.stance}
        </div>
      </div>

      {/* Conceptual Diagram & The Two Extremes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        {/* Left Column: KEEP EVERYTHING */}
        <div className="p-4 rounded-xl bg-[#121622] border border-[#232B3C] space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="font-bold text-blue-400 uppercase tracking-wider text-[11px]">
              KEEP EVERYTHING
            </span>
            <span className="text-[10px] text-slate-500">Transformer KV Cache</span>
          </div>
          <div className="space-y-1.5 text-slate-300 text-[11px]">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-blue-400">▼</span> Growing context window
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-blue-400">▼</span> Exact token retention / high recall
            </div>
            <div className="pt-2 border-t border-[#1C2333] flex flex-col gap-1 text-[10px]">
              <span className="text-rose-400 font-semibold">↑ O(N) storage expansion</span>
              <span className="text-rose-400 font-semibold">↑ O(N²) quadratic attention compute</span>
            </div>
          </div>
        </div>

        {/* Right Column: COMPRESS EVERYTHING */}
        <div className="p-4 rounded-xl bg-[#121622] border border-[#232B3C] space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="font-bold text-purple-400 uppercase tracking-wider text-[11px]">
              COMPRESS EVERYTHING
            </span>
            <span className="text-[10px] text-slate-500">Recurrent State / BDH</span>
          </div>
          <div className="space-y-1.5 text-slate-300 text-[11px]">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-purple-400">▼</span> Fixed-size bounded internal state
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-purple-400">▼</span> O(1) constant generation cost
            </div>
            <div className="pt-2 border-t border-[#1C2333] flex flex-col gap-1 text-[10px]">
              <span className="text-amber-400 font-semibold">↑ Coordinate interference</span>
              <span className="text-amber-400 font-semibold">↑ Forgetting / crosstalk risk</span>
            </div>
          </div>
        </div>
      </div>

      {/* The Live Interactive Fulcrum */}
      <div className="p-5 rounded-xl bg-[#090C12] border border-[#1E2536] space-y-4">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 flex items-center gap-1.5">
            <ArrowLeftRight className="w-3.5 h-3.5 text-[#22D3EE]" />
            YOUR EXPERIMENT OPERATING POINT:
          </span>
          <span className="text-[11px] text-[#22D3EE] font-bold">
            D={dimension} · Seq={sequenceLength} · λ={retention.toFixed(2)}
          </span>
        </div>

        {/* Live Fulcrum Bar */}
        <div className="relative pt-6 pb-2">
          {/* Track Line */}
          <div className="h-2 w-full rounded-full bg-gradient-to-r from-blue-900/60 via-cyan-950 to-purple-900/60 border border-[#252A35]" />

          {/* Fulcrum labels on ends */}
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-2">
            <div className="text-left">
              <span className="text-blue-400 font-bold block">RECALL FOCUS</span>
              <span>Generous coordinates</span>
            </div>
            <div className="text-center">
              <span className="text-slate-500">Balanced Design Pivot</span>
            </div>
            <div className="text-right">
              <span className="text-purple-400 font-bold block">EFFICIENCY FOCUS</span>
              <span>Bounded footprint</span>
            </div>
          </div>

          {/* Dynamic Pin Indicator */}
          <div
            className="absolute top-0 transition-all duration-300 -translate-x-1/2 flex flex-col items-center pointer-events-none"
            style={{ left: `${indicatorPercent}%` }}
          >
            <div className="px-2 py-0.5 rounded bg-cyan-400 text-black text-[10px] font-mono font-bold shadow-lg flex items-center gap-1">
              <span>EXPERIMENT</span>
            </div>
            <div className="w-0.5 h-6 bg-cyan-400 mt-0.5 shadow-sm" />
            <div className="w-3 h-3 rounded-full bg-cyan-400 ring-4 ring-cyan-500/20 shadow-md" />
          </div>
        </div>

        <p className="text-xs text-slate-300 font-sans leading-relaxed pt-1">
          {tensionStateDescription.detail}
        </p>
      </div>

      {/* Pathway BDH Framing Note */}
      <div className="rounded-xl border border-violet-800/40 bg-violet-950/20 p-4 text-xs font-mono text-violet-200/90 space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-violet-300">
          <HelpCircle className="w-4 h-4 text-violet-400 shrink-0" />
          <span>RESEARCH CONNECTION · PATHWAY BDH EXPLAINER</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-300 font-sans">
          &ldquo;Your experiment shows one concrete instance of this trade-off.&rdquo; This is consistent with Pathway&apos;s current BDH explainer, which contrasts growing Transformer KV-cache state with compact recurrent states and frames BDH as trying to balance long-context performance with token-generation complexity.
        </p>
      </div>
    </div>
  );
};

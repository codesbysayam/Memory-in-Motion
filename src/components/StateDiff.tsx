import React, { useState } from 'react';
import { analyzeStateDiff } from '../models/stateAnalysis';
import { HelpCircle, ChevronDown, ChevronUp, Activity, ArrowRight } from 'lucide-react';

interface StateDiffProps {
  prevState: number[];
  currState: number[];
  stepIndex?: number;
  inputDescription?: string;
  selectedDim?: number | null;
  onSelectDim?: (dimIndex: number | null) => void;
  id?: string;
}

export const StateDiff: React.FC<StateDiffProps> = ({
  prevState,
  currState,
  stepIndex = 1,
  inputDescription = 'Recurrent Associative Write',
  selectedDim = null,
  onSelectDim,
  id = 'state-diff-inspector',
}) => {
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // If states are not provided or empty, fallback to zeros
  const safePrev = prevState.length > 0 ? prevState : Array(8).fill(0);
  const safeCurr = currState.length > 0 ? currState : Array(8).fill(0);

  const analysis = analyzeStateDiff(safePrev, safeCurr);

  const getHeatmapColor = (val: number) => {
    if (val > 0) {
      const alpha = Math.min(1, Math.max(0.15, val));
      return `rgba(59, 130, 246, ${alpha})`; // Blue
    } else if (val < 0) {
      const alpha = Math.min(1, Math.max(0.15, Math.abs(val)));
      return `rgba(239, 68, 68, ${alpha})`; // Red
    }
    return '#1E2430';
  };

  return (
    <div id={id} className="rounded-xl border border-[#2A3140] bg-[#0E131F] p-4 sm:p-5 text-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#222938] pb-3.5 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-blue-400 bg-blue-950/60 border border-blue-800/60 px-2 py-0.5 rounded">
              State Change Inspector
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Δ = state[t] − state[t-1]
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Input at step {stepIndex}: <strong className="text-slate-200 font-mono">{inputDescription}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg bg-[#182030] hover:bg-[#202B40] text-slate-300 border border-slate-700 transition"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            <span>Why did the state change?</span>
            {showExplanation ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Explanatory Collapsible Box */}
      {showExplanation && (
        <div className="mb-4 p-3.5 rounded-lg bg-blue-950/30 border border-blue-800/40 text-xs text-slate-300 space-y-2">
          <div className="font-semibold text-blue-300 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            Mechanistic Update Telemetry
          </div>
          <p className="leading-relaxed">
            The state changed because the educational model applied its recurrent associative update:
            <code className="mx-1 px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-200 font-mono">
              M[t] = λ · M[t-1] + η · (k[t] ⊗ v[t])
            </code>
            The incoming key-value representation injects outer-product energy directly into the coordinate space.
          </p>
          <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
            <strong className="text-amber-400">Scientific Honesty:</strong> These dimensions are <em>latent dimensions</em>.
            They do not have predefined human or linguistic meanings (e.g., dimension 03 does not represent a specific real-world country or concept).
            Rather, dimension {analysis.strongestChange.label} experienced the strongest numerical displacement during this update.
          </div>
        </div>
      )}

      {/* Summary KPI metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4 text-xs font-mono">
        <div className="bg-[#141A29] p-2.5 rounded-lg border border-[#222938]">
          <div className="text-slate-400 text-[11px]">Strongest Change</div>
          <div className="text-amber-300 font-bold text-sm mt-0.5">
            {analysis.strongestChange.label}: {analysis.strongestChange.delta > 0 ? `+${analysis.strongestChange.delta}` : analysis.strongestChange.delta}
          </div>
        </div>

        <div className="bg-[#141A29] p-2.5 rounded-lg border border-[#222938]">
          <div className="text-slate-400 text-[11px]">Mean Abs Change</div>
          <div className="text-blue-300 font-bold text-sm mt-0.5">
            {analysis.meanAbsoluteChange.toFixed(3)}
          </div>
        </div>

        <div className="bg-[#141A29] p-2.5 rounded-lg border border-[#222938]">
          <div className="text-slate-400 text-[11px]">Active Latent Dims</div>
          <div className="text-emerald-300 font-bold text-sm mt-0.5">
            {analysis.activeDimensionsCount} / {analysis.dimension}
          </div>
        </div>

        <div className="bg-[#141A29] p-2.5 rounded-lg border border-[#222938]">
          <div className="text-slate-400 text-[11px]">State Cosine Sim</div>
          <div className="text-purple-300 font-bold text-sm mt-0.5">
            {(analysis.cosineSimilarity * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Visual State Diff: Before vs After */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Before (t-1) vs After (t) Visual Heatmap strip */}
        <div className="bg-[#131826] p-3 rounded-lg border border-[#222A3A]">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
            <span>state[t-1]</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span>state[t]</span>
          </div>

          <div className="space-y-1.5">
            <div className="grid grid-cols-8 gap-1">
              {safePrev.map((val, idx) => (
                <div
                  key={`prev-${idx}`}
                  style={{ backgroundColor: getHeatmapColor(val) }}
                  className="h-6 rounded flex items-center justify-center text-[10px] font-mono font-medium text-white shadow-inner"
                  title={`d${String(idx).padStart(2, '0')} [t-1]: ${val.toFixed(2)}`}
                >
                  {val.toFixed(1)}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-8 gap-1">
              {safeCurr.map((val, idx) => {
                const isSelected = selectedDim === idx;
                const isStrongest = analysis.strongestChange.index === idx;
                return (
                  <button
                    key={`curr-${idx}`}
                    onClick={() => onSelectDim && onSelectDim(isSelected ? null : idx)}
                    style={{ backgroundColor: getHeatmapColor(val) }}
                    className={`h-6 rounded flex items-center justify-center text-[10px] font-mono font-medium text-white transition ${
                      isSelected
                        ? 'ring-2 ring-amber-400 scale-105'
                        : isStrongest
                        ? 'ring-1 ring-blue-400'
                        : 'hover:brightness-125'
                    }`}
                    title={`d${String(idx).padStart(2, '0')} [t]: ${val.toFixed(2)} (click to inspect)`}
                  >
                    {val.toFixed(1)}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-2">
            <span>||state[t-1]|| = {analysis.prevNorm.toFixed(2)}</span>
            <span>||state[t]|| = {analysis.currNorm.toFixed(2)}</span>
          </div>
        </div>

        {/* Top Delta Drivers List */}
        <div className="bg-[#131826] p-3 rounded-lg border border-[#222A3A]">
          <div className="text-xs text-slate-400 font-mono mb-2 flex items-center justify-between">
            <span>Dimension Deltas (Click to highlight)</span>
            <span className="text-[10px] text-slate-500">Sorted by |Δ|</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
            {[...analysis.deltas]
              .sort((a, b) => b.absDelta - a.absDelta)
              .slice(0, 8)
              .map((d) => {
                const isSelected = selectedDim === d.index;
                const isStrongest = analysis.strongestChange.index === d.index;
                const isPositive = d.delta >= 0;

                return (
                  <button
                    key={d.index}
                    onClick={() => onSelectDim && onSelectDim(isSelected ? null : d.index)}
                    className={`flex items-center justify-between px-2 py-1.5 rounded text-xs font-mono transition text-left ${
                      isSelected
                        ? 'bg-amber-950/70 border border-amber-500/80 text-amber-200'
                        : 'bg-[#182030] hover:bg-[#202B40] text-slate-300 border border-[#263248]'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <span className="font-semibold text-slate-300">{d.label}</span>
                      {isStrongest && <span className="text-[9px] text-amber-400">★</span>}
                    </span>
                    <span className={isPositive ? 'text-emerald-400' : 'text-rose-400'}>
                      {isPositive ? `+${d.delta.toFixed(2)}` : d.delta.toFixed(2)}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

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
      const alpha = Math.min(1, Math.max(0.2, val));
      return `rgba(22, 124, 128, ${alpha * 0.75})`;
    } else if (val < 0) {
      const alpha = Math.min(1, Math.max(0.2, Math.abs(val)));
      return `rgba(182, 66, 53, ${alpha * 0.75})`;
    }
    return '#EAE6DF';
  };

  return (
    <div id={id} className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-5 sm:p-6 text-[#151515] shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6DF] pb-3.5 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#6842C2] bg-[#F3EFFF] border border-[#E2D8FA] px-2.5 py-0.5 rounded-md">
              State Change Inspector
            </span>
            <span className="text-xs text-[#716F68] font-mono">
              Δ = state[t] − state[t-1]
            </span>
          </div>
          <p className="text-xs text-[#716F68] mt-1 font-sans">
            Input at step {stepIndex}: <strong className="text-[#151515] font-mono">{inputDescription}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F4F1EA] text-[#716F68] hover:text-[#151515] border border-[#D8D4CB] transition cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#167C80]" />
            <span>Why did the state change?</span>
            {showExplanation ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Explanatory Collapsible Box */}
      {showExplanation && (
        <div className="mb-4 p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs text-[#52504A] space-y-2.5">
          <div className="font-bold text-[#167C80] flex items-center gap-1.5 font-mono">
            <Activity className="w-3.5 h-3.5" />
            Mechanistic Update Telemetry
          </div>
          <p className="leading-relaxed font-sans">
            The state changed because the recurrent associative update was applied:
            <code className="mx-1 px-1.5 py-0.5 rounded bg-[#EDF7F7] text-[#167C80] font-mono font-bold">
              M[t] = λ · M[t-1] + η · (k[t] ⊗ v[t])
            </code>
            The incoming key-value representation injects outer-product energy directly into the coordinate space.
          </p>
          <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#E5E0D8] text-[11px] text-[#716F68]">
            <strong className="text-[#A46622] font-semibold">Scientific Honesty:</strong> These dimensions are <em>latent dimensions</em>.
            They do not have predefined human or linguistic meanings. Rather, dimension {analysis.strongestChange.label} experienced the strongest numerical displacement during this update.
          </div>
        </div>
      )}

      {/* Summary KPI metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-xs font-mono">
        <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#EAE6DF]">
          <div className="text-[#716F68] text-[10px] uppercase font-bold tracking-wider">Strongest Change</div>
          <div className="text-[#A46622] font-bold text-sm mt-1">
            {analysis.strongestChange.label}: {analysis.strongestChange.delta > 0 ? `+${analysis.strongestChange.delta}` : analysis.strongestChange.delta}
          </div>
        </div>

        <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#EAE6DF]">
          <div className="text-[#716F68] text-[10px] uppercase font-bold tracking-wider">Mean Abs Change</div>
          <div className="text-[#167C80] font-bold text-sm mt-1">
            {analysis.meanAbsoluteChange.toFixed(3)}
          </div>
        </div>

        <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#EAE6DF]">
          <div className="text-[#716F68] text-[10px] uppercase font-bold tracking-wider">Active Latent Dims</div>
          <div className="text-[#247A4B] font-bold text-sm mt-1">
            {analysis.activeDimensionsCount} / {analysis.dimension}
          </div>
        </div>

        <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#EAE6DF]">
          <div className="text-[#716F68] text-[10px] uppercase font-bold tracking-wider">State Cosine Sim</div>
          <div className="text-[#6842C2] font-bold text-sm mt-1">
            {(analysis.cosineSimilarity * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Visual State Diff: Before vs After */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
        {/* Before (t-1) vs After (t) Visual Heatmap strip */}
        <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#EAE6DF]">
          <div className="flex items-center justify-between text-xs text-[#716F68] font-mono mb-2.5">
            <span className="font-bold">state[t-1]</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#BDB7AB]" />
            <span className="font-bold">state[t]</span>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-8 gap-1">
              {safePrev.map((val, idx) => (
                <div
                  key={`prev-${idx}`}
                  style={{ backgroundColor: getHeatmapColor(val) }}
                  className="h-7 rounded flex items-center justify-center text-[10px] font-mono font-medium text-white shadow-xs"
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
                    className={`h-7 rounded flex items-center justify-center text-[10px] font-mono font-medium text-white transition cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-[#6842C2] scale-105 shadow-sm'
                        : isStrongest
                        ? 'ring-1 ring-[#167C80]'
                        : 'hover:brightness-95'
                    }`}
                    title={`d${String(idx).padStart(2, '0')} [t]: ${val.toFixed(2)} (click to inspect)`}
                  >
                    {val.toFixed(1)}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#716F68] font-mono mt-2.5">
            <span>||state[t-1]|| = {analysis.prevNorm.toFixed(2)}</span>
            <span>||state[t]|| = {analysis.currNorm.toFixed(2)}</span>
          </div>
        </div>

        {/* Top Delta Drivers List */}
        <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#EAE6DF]">
          <div className="text-xs text-[#716F68] font-mono mb-2.5 flex items-center justify-between">
            <span className="font-bold">Dimension Deltas</span>
            <span className="text-[10px] text-[#716F68]">Sorted by |Δ|</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
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
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono transition text-left cursor-pointer ${
                      isSelected
                        ? 'bg-[#F3EFFF] border border-[#6842C2] text-[#6842C2]'
                        : 'bg-[#FFFFFF] hover:bg-[#FAF8F5] text-[#151515] border border-[#E5E0D8]'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <span className="font-semibold text-[#151515]">{d.label}</span>
                      {isStrongest && <span className="text-[9px] text-[#A46622]">★</span>}
                    </span>
                    <span className={`font-bold ${isPositive ? 'text-[#247A4B]' : 'text-[#B64235]'}`}>
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

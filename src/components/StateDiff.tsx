import React, { useState } from 'react';
import { analyzeStateDiff } from '../models/stateAnalysis';
import { HelpCircle, ChevronDown, ChevronUp, Activity, ArrowRight, Search } from 'lucide-react';

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
      const alpha = Math.min(1, Math.max(0.24, val));
      return `rgba(76, 154, 255, ${alpha * 0.85})`;
    } else if (val < 0) {
      const alpha = Math.min(1, Math.max(0.24, Math.abs(val)));
      return `rgba(229, 98, 90, ${alpha * 0.85})`;
    }
    return 'var(--color-matrix-surface)';
  };

  return (
    <div id={id} className="diagram-frame p-5 sm:p-6 text-[var(--text-primary)] tabular-nums">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3.5 mb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-semibold text-[var(--accent-blue-text)] bg-[var(--accent-blue)] border border-[var(--border)] px-2.5 py-0.5 rounded-md">
              State change inspector
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono">
              Δ = state[t] − state[t-1]
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-sans">
            Input at step {stepIndex}: <strong className="text-[var(--text-primary)] font-mono">{inputDescription}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowExplanation(!showExplanation)}
            className="btn-secondary text-xs"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[var(--accent-blue-text)]" />
            <span>Why did the state change?</span>
            {showExplanation ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Explanatory Collapsible Box */}
      {showExplanation && (
        <div className="mb-4 p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] text-xs text-[var(--text-secondary)] space-y-2.5">
          <div className="font-semibold text-[var(--accent-blue-text)] flex items-center gap-1.5 font-mono">
            <Activity className="w-3.5 h-3.5" />
            Mechanistic update telemetry
          </div>
          <p className="leading-relaxed font-sans">
            The state changed because the recurrent associative update was applied:
            <code className="mx-1 px-1.5 py-0.5 rounded bg-[var(--accent-blue)] text-[var(--accent-blue-text)] font-mono font-bold">
              M[t] = λ · M[t-1] + η · (k[t] ⊗ v[t])
            </code>
            The incoming key-value representation injects outer-product energy directly into the coordinate space.
          </p>
          <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-secondary)]">
            <strong className="text-[var(--accent-yellow-text)] font-semibold">Scientific honesty:</strong> These dimensions are <em>latent dimensions</em>.
            They do not have predefined human or linguistic meanings. Rather, dimension {analysis.strongestChange.label} experienced the strongest numerical displacement during this update.
          </div>
        </div>
      )}

      {/* Summary KPI metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-xs font-mono">
        <div className="metric-panel">
          <div className="text-[var(--text-muted)] text-[11px] font-semibold">Strongest change</div>
          <div className="text-[var(--accent-yellow-text)] font-bold text-sm mt-1">
            {analysis.strongestChange.label}: {analysis.strongestChange.delta > 0 ? `+${analysis.strongestChange.delta}` : analysis.strongestChange.delta}
          </div>
        </div>

        <div className="metric-panel">
          <div className="text-[var(--text-muted)] text-[11px] font-semibold">Mean abs change</div>
          <div className="text-[var(--accent-blue-text)] font-bold text-sm mt-1">
            {analysis.meanAbsoluteChange.toFixed(3)}
          </div>
        </div>

        <div className="metric-panel">
          <div className="text-[var(--text-muted)] text-[11px] font-semibold">Active latent dims</div>
          <div className="text-[var(--accent-green-text)] font-bold text-sm mt-1">
            {analysis.activeDimensionsCount} / {analysis.dimension}
          </div>
        </div>

        <div className="metric-panel">
          <div className="text-[var(--text-muted)] text-[11px] font-semibold">State cosine sim</div>
          <div className="text-[var(--accent-blue-text)] font-bold text-sm mt-1">
            {(analysis.cosineSimilarity * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Visual State Diff: Before vs After */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
        {/* Before (t-1) vs After (t) Visual Heatmap strip */}
        <div className="bg-[var(--color-matrix-bg)] p-4 rounded-xl border border-[var(--color-matrix-border)]">
          <div className="flex items-center justify-between text-xs text-[var(--color-matrix-muted)] font-mono mb-2.5">
            <span className="font-bold">state[t-1]</span>
            <ArrowRight className="w-3.5 h-3.5 text-[var(--color-matrix-muted)]" />
            <span className="font-bold">state[t]</span>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-8 gap-1">
              {safePrev.map((val, idx) => (
                <div
                  key={`prev-${idx}`}
                  style={{ backgroundColor: getHeatmapColor(val) }}
                  className="h-7 rounded flex items-center justify-center text-[10px] font-mono font-medium text-[var(--color-matrix-ink)]"
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
                    type="button"
                    key={`curr-${idx}`}
                    onClick={() => onSelectDim && onSelectDim(isSelected ? null : idx)}
                    style={{ backgroundColor: getHeatmapColor(val) }}
                    className={`h-7 rounded flex items-center justify-center text-[10px] font-mono font-medium text-[var(--color-matrix-ink)] transition cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-[var(--color-accent)] scale-105'
                        : isStrongest
                        ? 'ring-1 ring-[var(--color-matrix-ink)]'
                        : 'hover:brightness-110'
                    }`}
                    title={`d${String(idx).padStart(2, '0')} [t]: ${val.toFixed(2)} (click to inspect)`}
                  >
                    {val.toFixed(1)}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[var(--color-matrix-muted)] font-mono mt-2.5">
            <span>||state[t-1]|| = {analysis.prevNorm.toFixed(2)}</span>
            <span>||state[t]|| = {analysis.currNorm.toFixed(2)}</span>
          </div>
        </div>

        {/* Top Delta Drivers List */}
        <div className="bg-[var(--surface-soft)] p-4 rounded-xl border border-[var(--border)]">
          <div className="text-xs text-[var(--text-muted)] font-sans mb-2.5 flex items-center justify-between">
            <span className="font-bold text-[var(--text-primary)]">Dimension deltas</span>
            <span className="text-[11px] text-[var(--text-muted)]">Click to inspect</span>
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
                    type="button"
                    onClick={() => onSelectDim && onSelectDim(isSelected ? null : d.index)}
                    className={`dimension-delta ${isSelected ? 'active' : ''}`}
                    title={`Inspect dimension ${d.label} in state vector`}
                  >
                    <span className="flex items-center gap-1.5 font-mono text-xs">
                      <Search className="w-3 h-3 text-[var(--text-muted)]" />
                      <span className="font-semibold text-[var(--text-primary)]">{d.label}</span>
                      {isStrongest && <span className="text-[10px] text-[var(--accent-yellow-text)]" title="Strongest delta">★</span>}
                    </span>
                    <span className={`font-mono text-xs font-bold ${isPositive ? 'text-[var(--accent-green-text)]' : 'text-[var(--accent-pink-text)]'}`}>
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

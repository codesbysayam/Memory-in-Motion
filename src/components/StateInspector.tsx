import React, { useState, useMemo } from 'react';
import { Activity, Layers, Info, HelpCircle } from 'lucide-react';
import { calculateStateStats } from '../models/stateStats';

interface StateInspectorProps {
  /** Matrix history: array of 2D matrices across timesteps [stepIndex][row][col] */
  history?: number[][][];
  /** Current state vector or active row/diagonal */
  currentState?: number[];
  /** Dimensions of state */
  dimension?: number;
  /** Current active timestep */
  currentStep?: number;
  /** Optional callback when a dimension is selected */
  onSelectDimension?: (dimIndex: number | null) => void;
  id?: string;
}

export const StateInspector: React.FC<StateInspectorProps> = ({
  history = [],
  currentState,
  dimension = 16,
  currentStep,
  onSelectDimension,
  id = 'state-inspector-component',
}) => {
  const [hoveredDim, setHoveredDim] = useState<number | null>(null);

  // Derive active vector representation from currentState or latest history matrix
  const activeVector = useMemo<number[]>(() => {
    if (currentState && currentState.length > 0) {
      return currentState;
    }
    if (history.length > 0) {
      const latestMat = history[history.length - 1];
      // Use diagonal or first row as representative 1D slice
      return latestMat.map((row, idx) => row[idx % row.length] ?? 0);
    }
    return Array(dimension).fill(0);
  }, [currentState, history, dimension]);

  // Derive previous vector for delta calculations on hover
  const previousVector = useMemo<number[]>(() => {
    if (history.length >= 2) {
      const prevMat = history[history.length - 2];
      return prevMat.map((row, idx) => row[idx % row.length] ?? 0);
    }
    return Array(activeVector.length).fill(0);
  }, [history, activeVector.length]);

  // Compute transparent mathematical statistics via stateStats model
  const stats = useMemo(() => {
    return calculateStateStats(activeVector);
  }, [activeVector]);

  const hoveredDelta = useMemo(() => {
    if (hoveredDim === null) return null;
    const curr = activeVector[hoveredDim] ?? 0;
    const prev = previousVector[hoveredDim] ?? 0;
    return {
      curr,
      prev,
      delta: curr - prev,
    };
  }, [hoveredDim, activeVector, previousVector]);

  // Color generator for heatmap cell
  const getCellColor = (val: number) => {
    const clamped = Math.max(-1, Math.min(1, val));
    if (clamped > 0) {
      const alpha = Math.min(1, Math.max(0.22, clamped * 0.9));
      return `rgba(76, 154, 255, ${alpha * 0.85})`;
    } else if (clamped < 0) {
      const alpha = Math.min(1, Math.max(0.22, Math.abs(clamped) * 0.9));
      return `rgba(229, 98, 90, ${alpha * 0.85})`;
    }
    return 'var(--color-matrix-surface)';
  };

  return (
    <div id={id} className="diagram-frame p-5 sm:p-6 text-[var(--text-primary)] tabular-nums">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3.5 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[var(--accent-blue)] border border-[var(--border)] text-[var(--accent-blue-text)]">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-sans font-semibold text-[var(--text-primary)] tracking-tight">
              Memory state vector heatmap
            </h4>
            <p className="text-xs text-[var(--text-muted)] font-mono">
              Dimension d = {activeVector.length} · Timestep t = {currentStep ?? history.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
            <span className="w-2.5 h-2.5 rounded-sm bg-[var(--color-accent)] inline-block" /> Positive (+)
          </span>
          <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
            <span className="w-2.5 h-2.5 rounded-sm bg-[var(--color-danger)] inline-block" /> Negative (−)
          </span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="mb-4 p-3 rounded-xl bg-[var(--color-matrix-bg)] border border-[var(--color-matrix-border)]">
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
          {activeVector.map((val, idx) => {
            const isHovered = hoveredDim === idx;
            return (
              <div
                key={idx}
                onMouseEnter={() => {
                  setHoveredDim(idx);
                  onSelectDimension?.(idx);
                }}
                onMouseLeave={() => {
                  setHoveredDim(null);
                  onSelectDimension?.(null);
                }}
                style={{ backgroundColor: getCellColor(val) }}
                className={`h-11 rounded-lg flex flex-col items-center justify-center p-1 cursor-pointer transition-all duration-150 border ${
                  isHovered
                    ? 'border-[var(--color-matrix-ink)] ring-2 ring-[var(--color-accent)] scale-105 z-10'
                    : 'border-[var(--color-matrix-border)] hover:border-[var(--color-accent)]'
                }`}
              >
                <span className="text-[11px] font-mono text-[var(--color-matrix-muted)]">
                  d{String(idx).padStart(2, '0')}
                </span>
                <span className="text-xs font-mono font-bold leading-none mt-0.5 text-[var(--color-matrix-ink)]">
                  {val.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Technical Detail Telemetry Panel */}
      <div className="space-y-2.5 pt-3.5 border-t border-[var(--border)] text-xs font-mono">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="metric-panel flex flex-col justify-between">
            <span className="text-[var(--text-muted)] text-[11px] font-semibold">Mean abs</span>
            <span className="text-[var(--accent-blue-text)] font-bold text-sm mt-1">{stats.meanAbsoluteActivation.toFixed(4)}</span>
          </div>

          <div className="metric-panel flex flex-col justify-between">
            <span className="text-[var(--text-muted)] text-[11px] font-semibold">Max abs</span>
            <span className="text-[var(--accent-blue-text)] font-bold text-sm mt-1">{stats.maxAbsoluteActivation.toFixed(4)}</span>
          </div>

          <div className="metric-panel flex flex-col justify-between">
            <span className="text-[var(--text-muted)] text-[11px] font-semibold">Active dimensions</span>
            <span className="text-[var(--accent-green-text)] font-bold text-sm mt-1">{stats.activeDimensionCount} / {stats.dimension}</span>
          </div>

          <div className="metric-panel flex flex-col justify-between">
            <span className="text-[var(--text-muted)] text-[11px] font-semibold">L2 state norm</span>
            <span className="text-[var(--text-primary)] font-bold text-sm mt-1">{stats.L2Norm.toFixed(4)}</span>
          </div>
        </div>

        {/* Epistemic Transparency Tooltip Note */}
        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] bg-[var(--surface-soft)] px-3 py-2 rounded-lg border border-[var(--border)] font-sans">
          <HelpCircle className="w-3.5 h-3.5 text-[var(--accent-blue-text)] shrink-0" />
          <span>These are mathematical statistics of the toy state vector, demonstrating coordinate dispersion.</span>
        </div>
      </div>

      {/* Hover Dimension Inspector Banner */}
      <div className="mt-3 p-3 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] flex items-center justify-between text-xs font-mono">
        {hoveredDim !== null && hoveredDelta ? (
          <div className="flex flex-wrap items-center gap-4 text-[var(--text-secondary)]">
            <span>
              Latent dimension: <strong className="text-[var(--accent-blue-text)]">d{String(hoveredDim).padStart(2, '0')}</strong>
            </span>
            <span>
              Value [t]: <strong className="text-[var(--text-primary)]">{hoveredDelta.curr.toFixed(3)}</strong>
            </span>
            <span>
              Value [t-1]: <span className="text-[var(--text-muted)]">{hoveredDelta.prev.toFixed(3)}</span>
            </span>
            <span>
              Δ change:{' '}
              <strong className={hoveredDelta.delta >= 0 ? 'text-[var(--accent-green-text)]' : 'text-[var(--accent-pink-text)]'}>
                {hoveredDelta.delta >= 0 ? `+${hoveredDelta.delta.toFixed(3)}` : hoveredDelta.delta.toFixed(3)}
              </strong>
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[var(--text-muted)] font-sans">
            <Info className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span>Hover over any latent dimension cell to view its value and step delta.</span>
          </div>
        )}
      </div>
    </div>
  );
};

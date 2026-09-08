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
      const alpha = Math.min(1, Math.max(0.12, clamped * 0.9));
      return `rgba(59, 130, 246, ${alpha})`;
    } else if (clamped < 0) {
      const alpha = Math.min(1, Math.max(0.12, Math.abs(clamped) * 0.9));
      return `rgba(239, 68, 68, ${alpha})`;
    }
    return '#1A2130';
  };

  return (
    <div id={id} className="rounded-xl border border-[#252C3D] bg-[#0B0F19] p-4 sm:p-5 text-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2638] pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-950/60 border border-blue-800/60 text-blue-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100 font-mono tracking-tight">
              Memory State Vector Heatmap
            </h4>
            <p className="text-xs text-slate-400 font-mono">
              Dimension D = {activeVector.length} · Timestep t = {currentStep ?? history.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" /> Positive (+)
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" /> Negative (−)
          </span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="mb-4">
        <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-16 gap-1.5">
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
                    ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105 z-10'
                    : 'border-[#263147] hover:border-blue-400'
                }`}
              >
                <span className="text-[9px] font-mono text-slate-300/80">
                  d{String(idx).padStart(2, '0')}
                </span>
                <span className="text-[11px] font-mono font-bold text-white leading-none mt-0.5">
                  {val.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Technical Detail Telemetry Panel */}
      <div className="space-y-2 pt-3 border-t border-[#1E2638] text-xs font-mono">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-[#111726] p-2.5 rounded-lg border border-[#20293D] flex flex-col justify-between">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">MEAN ABS</span>
            <span className="text-purple-300 font-bold text-sm mt-0.5">{stats.meanAbsoluteActivation.toFixed(4)}</span>
          </div>

          <div className="bg-[#111726] p-2.5 rounded-lg border border-[#20293D] flex flex-col justify-between">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">MAX ABS</span>
            <span className="text-cyan-300 font-bold text-sm mt-0.5">{stats.maxAbsoluteActivation.toFixed(4)}</span>
          </div>

          <div className="bg-[#111726] p-2.5 rounded-lg border border-[#20293D] flex flex-col justify-between">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">ACTIVE DIMENSIONS</span>
            <span className="text-emerald-300 font-bold text-sm mt-0.5">{stats.activeDimensionCount} / {stats.dimension}</span>
          </div>

          <div className="bg-[#111726] p-2.5 rounded-lg border border-[#20293D] flex flex-col justify-between">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">L2 STATE NORM</span>
            <span className="text-blue-300 font-bold text-sm mt-0.5">{stats.L2Norm.toFixed(4)}</span>
          </div>
        </div>

        {/* Epistemic Transparency Tooltip Note */}
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-[#0E131E] px-2.5 py-1 rounded border border-[#1A2234]">
          <HelpCircle className="w-3 h-3 text-cyan-400 shrink-0" />
          <span>These are mathematical statistics of the toy state, not measurements of information content.</span>
        </div>
      </div>

      {/* Hover Dimension Inspector Banner */}
      <div className="mt-3 p-2.5 rounded-lg bg-[#111726]/80 border border-[#20293D] flex items-center justify-between text-xs font-mono">
        {hoveredDim !== null && hoveredDelta ? (
          <div className="flex flex-wrap items-center gap-4 text-slate-300">
            <span>
              Latent Dimension: <strong className="text-amber-300">d{String(hoveredDim).padStart(2, '0')}</strong>
            </span>
            <span>
              Value [t]: <strong className="text-white">{hoveredDelta.curr.toFixed(3)}</strong>
            </span>
            <span>
              Value [t-1]: <span className="text-slate-400">{hoveredDelta.prev.toFixed(3)}</span>
            </span>
            <span>
              Δ Change:{' '}
              <strong className={hoveredDelta.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {hoveredDelta.delta >= 0 ? `+${hoveredDelta.delta.toFixed(3)}` : hoveredDelta.delta.toFixed(3)}
              </strong>
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-500">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span>Hover over any latent dimension cell to view its value and step delta.</span>
          </div>
        )}
      </div>
    </div>
  );
};

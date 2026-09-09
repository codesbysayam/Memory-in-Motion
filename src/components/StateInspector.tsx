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
      const alpha = Math.min(1, Math.max(0.15, clamped * 0.9));
      return `rgba(22, 124, 128, ${alpha * 0.75})`;
    } else if (clamped < 0) {
      const alpha = Math.min(1, Math.max(0.15, Math.abs(clamped) * 0.9));
      return `rgba(182, 66, 53, ${alpha * 0.75})`;
    }
    return '#FAF8F5';
  };

  return (
    <div id={id} className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-5 sm:p-6 text-[#151515] shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6DF] pb-3.5 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#EDF7F7] border border-[#CFE8E8] text-[#167C80]">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-serif font-bold text-[#151515] tracking-tight">
              Memory State Vector Heatmap
            </h4>
            <p className="text-xs text-[#716F68] font-mono">
              Dimension D = {activeVector.length} · Timestep t = {currentStep ?? history.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-[#716F68]">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#167C80] inline-block" /> Positive (+)
          </span>
          <span className="flex items-center gap-1.5 text-[#716F68]">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#B64235] inline-block" /> Negative (−)
          </span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="mb-4">
        <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-16 gap-1.5">
          {activeVector.map((val, idx) => {
            const isHovered = hoveredDim === idx;
            const hasStrongColor = Math.abs(val) > 0.4;
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
                    ? 'border-[#6842C2] ring-2 ring-[#6842C2]/40 scale-105 z-10'
                    : 'border-[#EAE6DF] hover:border-[#167C80]'
                }`}
              >
                <span className={`text-[9px] font-mono ${hasStrongColor ? 'text-white/80' : 'text-[#716F68]'}`}>
                  d{String(idx).padStart(2, '0')}
                </span>
                <span className={`text-[11px] font-mono font-bold leading-none mt-0.5 ${hasStrongColor ? 'text-white' : 'text-[#151515]'}`}>
                  {val.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Technical Detail Telemetry Panel */}
      <div className="space-y-2.5 pt-3.5 border-t border-[#EAE6DF] text-xs font-mono">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#EAE6DF] flex flex-col justify-between">
            <span className="text-[#716F68] text-[10px] uppercase font-bold tracking-wider">MEAN ABS</span>
            <span className="text-[#6842C2] font-bold text-sm mt-1">{stats.meanAbsoluteActivation.toFixed(4)}</span>
          </div>

          <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#EAE6DF] flex flex-col justify-between">
            <span className="text-[#716F68] text-[10px] uppercase font-bold tracking-wider">MAX ABS</span>
            <span className="text-[#167C80] font-bold text-sm mt-1">{stats.maxAbsoluteActivation.toFixed(4)}</span>
          </div>

          <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#EAE6DF] flex flex-col justify-between">
            <span className="text-[#716F68] text-[10px] uppercase font-bold tracking-wider">ACTIVE DIMENSIONS</span>
            <span className="text-[#247A4B] font-bold text-sm mt-1">{stats.activeDimensionCount} / {stats.dimension}</span>
          </div>

          <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#EAE6DF] flex flex-col justify-between">
            <span className="text-[#716F68] text-[10px] uppercase font-bold tracking-wider">L2 STATE NORM</span>
            <span className="text-[#151515] font-bold text-sm mt-1">{stats.L2Norm.toFixed(4)}</span>
          </div>
        </div>

        {/* Epistemic Transparency Tooltip Note */}
        <div className="flex items-center gap-2 text-[10px] text-[#716F68] bg-[#FAF8F5] px-3 py-1.5 rounded-lg border border-[#EAE6DF]">
          <HelpCircle className="w-3.5 h-3.5 text-[#167C80] shrink-0" />
          <span>These are mathematical statistics of the toy state vector, demonstrating coordinate dispersion.</span>
        </div>
      </div>

      {/* Hover Dimension Inspector Banner */}
      <div className="mt-3 p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] flex items-center justify-between text-xs font-mono">
        {hoveredDim !== null && hoveredDelta ? (
          <div className="flex flex-wrap items-center gap-4 text-[#52504A]">
            <span>
              Latent Dimension: <strong className="text-[#6842C2]">d{String(hoveredDim).padStart(2, '0')}</strong>
            </span>
            <span>
              Value [t]: <strong className="text-[#151515]">{hoveredDelta.curr.toFixed(3)}</strong>
            </span>
            <span>
              Value [t-1]: <span className="text-[#716F68]">{hoveredDelta.prev.toFixed(3)}</span>
            </span>
            <span>
              Δ Change:{' '}
              <strong className={hoveredDelta.delta >= 0 ? 'text-[#247A4B]' : 'text-[#B64235]'}>
                {hoveredDelta.delta >= 0 ? `+${hoveredDelta.delta.toFixed(3)}` : hoveredDelta.delta.toFixed(3)}
              </strong>
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[#716F68]">
            <Info className="w-3.5 h-3.5 text-[#716F68]" />
            <span>Hover over any latent dimension cell to view its value and step delta.</span>
          </div>
        )}
      </div>
    </div>
  );
};

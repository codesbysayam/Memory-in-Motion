import React, { useState } from 'react';
import { Activity, Layers } from 'lucide-react';

interface StateInspectorProps {
  stateVector: number[];
  prevStateVector?: number[];
  dimensions: number;
  step?: number;
  lastInputLabel?: string;
  unitPrefix?: string;
  id?: string;
}

export function StateInspector({
  stateVector,
  prevStateVector,
  dimensions,
  step = 0,
  lastInputLabel,
  unitPrefix = 'h',
  id,
}: StateInspectorProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // State calculations
  const stateNorm = Math.sqrt(stateVector.reduce((acc, v) => acc + v * v, 0));
  const activeCount = stateVector.filter((v) => Math.abs(v) > 0.05).length;

  const inspectedIdx = hoveredIdx !== null ? hoveredIdx : selectedIdx;

  return (
    <div
      id={id}
      className="rounded-xl border border-[var(--color-matrix-border)] bg-[var(--color-matrix-bg)] p-4 text-[var(--color-matrix-ink)] space-y-3"
    >
      <div className="flex items-center justify-between border-b border-[var(--color-matrix-border)] pb-2.5 gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-sky-300" />
          <span className="text-xs font-mono font-medium text-[var(--color-matrix-ink)]">
            Current internal state · Live toy model
          </span>
        </div>
        <span className="text-[11px] font-mono tabular-nums text-[var(--color-matrix-muted)] bg-[var(--color-matrix-surface)] px-2 py-0.5 rounded border border-[var(--color-matrix-border)] shrink-0">
          Step {step}
        </span>
      </div>

      {/* Grid of vector units */}
      <div className="space-y-1.5">
        <div className="text-xs text-[var(--color-matrix-muted)] flex items-center justify-between gap-2">
          <span>Hover or click any state coordinate to inspect numerical delta:</span>
          <span className="font-mono text-[11px] tabular-nums text-sky-300 shrink-0">{dimensions}-D vector</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
          {stateVector.map((val, idx) => {
            const absVal = Math.abs(val);
            const isPositive = val >= 0;
            const isInspected = inspectedIdx === idx;

            const bgOpacity = Math.min(Math.max(absVal, 0.1), 1);
            const style = {
              backgroundColor: isPositive
                ? `rgba(78, 134, 240, ${bgOpacity * 0.72})`
                : `rgba(220, 76, 76, ${bgOpacity * 0.65})`,
            };

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIdx(selectedIdx === idx ? null : idx)}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={style}
                className={`flex flex-col items-center justify-center p-2 rounded border transition-colors text-left cursor-pointer ${
                  isInspected
                    ? 'border-sky-300 ring-1 ring-sky-300 z-10'
                    : 'border-[var(--color-matrix-border)] hover:border-[var(--color-matrix-muted)]'
                }`}
                title={`Coordinate ${unitPrefix}[${idx}]: ${val.toFixed(3)}`}
              >
                <span className="text-[10px] font-mono tabular-nums text-[var(--color-matrix-muted)] leading-none">
                  {unitPrefix}[{idx}]
                </span>
                <span className="font-mono text-xs font-semibold tabular-nums text-[var(--color-matrix-ink)] mt-1">
                  {val.toFixed(2)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Technical detail panel */}
      <div className="rounded-lg bg-[var(--color-matrix-surface)] border border-[var(--color-matrix-border)] p-3 text-xs space-y-2.5 font-mono">
        <div className="flex items-center justify-between text-sky-300 text-[11px] font-semibold border-b border-[var(--color-matrix-border)] pb-1.5">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            Coordinate inspection
          </span>
          <span className="tabular-nums">
            {inspectedIdx !== null
              ? `${unitPrefix}[${inspectedIdx}]`
              : 'Hover a cell to inspect'}
          </span>
        </div>

        {inspectedIdx !== null ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs tabular-nums">
            <div>
              <span className="text-[var(--color-matrix-muted)] block text-[10px]">Current</span>
              <span className="font-semibold text-[var(--color-matrix-ink)]">
                {stateVector[inspectedIdx]?.toFixed(4)}
              </span>
            </div>
            <div>
              <span className="text-[var(--color-matrix-muted)] block text-[10px]">Previous</span>
              <span className="text-[var(--color-matrix-muted)]">
                {prevStateVector ? prevStateVector[inspectedIdx]?.toFixed(4) : '0.0000'}
              </span>
            </div>
            <div>
              <span className="text-[var(--color-matrix-muted)] block text-[10px]">Delta (Δ)</span>
              {prevStateVector ? (
                <span
                  className={
                    stateVector[inspectedIdx] - prevStateVector[inspectedIdx] >= 0
                      ? 'text-emerald-300 font-semibold'
                      : 'text-rose-300 font-semibold'
                  }
                >
                  {stateVector[inspectedIdx] - prevStateVector[inspectedIdx] >= 0 ? '+' : ''}
                  {(stateVector[inspectedIdx] - prevStateVector[inspectedIdx]).toFixed(4)}
                </span>
              ) : (
                <span className="text-[var(--color-matrix-muted)]">--</span>
              )}
            </div>
            <div>
              <span className="text-[var(--color-matrix-muted)] block text-[10px]">Activity</span>
              <span className={Math.abs(stateVector[inspectedIdx]) > 0.05 ? 'text-sky-300' : 'text-[var(--color-matrix-muted)]'}>
                {Math.abs(stateVector[inspectedIdx]) > 0.05 ? 'Active (>0.05)' : 'Sparse'}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-[var(--color-matrix-muted)] font-sans">
            Hover over any vector coordinate cell above to inspect its numerical delta Δ, previous value, and unit activity.
          </div>
        )}

        {/* Global vector stats */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--color-matrix-border)] text-xs tabular-nums">
          <div>
            <span className="text-[var(--color-matrix-muted)] text-[10px] block">State norm</span>
            <span className="font-semibold text-[var(--color-matrix-ink)]">||h|| = {stateNorm.toFixed(3)}</span>
          </div>
          <div>
            <span className="text-[var(--color-matrix-muted)] text-[10px] block">Active units</span>
            <span className="font-semibold text-sky-300">{activeCount} / {dimensions}</span>
          </div>
          <div>
            <span className="text-[var(--color-matrix-muted)] text-[10px] block">Last input</span>
            <span className="text-[var(--color-matrix-ink)] truncate block">{lastInputLabel || 'Initialization'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

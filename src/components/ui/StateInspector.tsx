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
      className="rounded-xl border border-[#252A35] bg-[#11141A] p-4 text-[#F4F5F7] space-y-3"
    >
      <div className="flex items-center justify-between border-b border-[#252A35] pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[#22D3EE]" />
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#8F96A3]">
            CURRENT INTERNAL STATE · LIVE TOY MODEL
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#8F96A3] bg-[#151922] px-2 py-0.5 rounded border border-[#252A35]">
          STEP {step}
        </span>
      </div>

      {/* Grid of vector units */}
      <div className="space-y-1.5">
        <div className="text-[11px] text-[#8F96A3] flex items-center justify-between">
          <span>Hover or click any state coordinate to inspect numerical delta:</span>
          <span className="font-mono text-[10px] text-[#22D3EE]">{dimensions}-D Vector</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
          {stateVector.map((val, idx) => {
            const absVal = Math.abs(val);
            const isPositive = val >= 0;
            const isInspected = inspectedIdx === idx;

            const bgOpacity = Math.min(Math.max(absVal, 0.08), 1);
            const style = {
              backgroundColor: isPositive
                ? `rgba(139, 92, 246, ${bgOpacity * 0.7})`
                : `rgba(239, 68, 68, ${bgOpacity * 0.6})`,
            };

            return (
              <button
                key={idx}
                onClick={() => setSelectedIdx(selectedIdx === idx ? null : idx)}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={style}
                className={`flex flex-col items-center justify-center p-2 rounded border transition-all text-left ${
                  isInspected
                    ? 'border-[#22D3EE] ring-1 ring-[#22D3EE] scale-105 z-10'
                    : 'border-[#252A35]/80 hover:border-[#8F96A3]'
                }`}
                title={`Coordinate ${unitPrefix}[${idx}]: ${val.toFixed(3)}`}
              >
                <span className="text-[9px] font-mono text-zinc-400 leading-none">
                  {unitPrefix}[{idx}]
                </span>
                <span className="font-mono text-xs font-semibold text-white mt-1">
                  {val.toFixed(2)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Technical detail panel */}
      <div className="rounded-lg bg-[#151922] border border-[#252A35] p-3 text-xs space-y-2 font-mono">
        <div className="flex items-center justify-between text-[#22D3EE] text-[11px] font-semibold border-b border-[#252A35] pb-1.5">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            TECHNICAL DETAIL PANEL
          </span>
          <span>
            {inspectedIdx !== null
              ? `COORDINATE ${unitPrefix}[${inspectedIdx}]`
              : 'HOVER A CELL TO INSPECT DELTA'}
          </span>
        </div>

        {inspectedIdx !== null ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div>
              <span className="text-[#8F96A3] block text-[10px]">CURRENT VALUE</span>
              <span className="font-semibold text-white">
                {stateVector[inspectedIdx]?.toFixed(4)}
              </span>
            </div>
            <div>
              <span className="text-[#8F96A3] block text-[10px]">PREVIOUS VALUE</span>
              <span className="text-[#8F96A3]">
                {prevStateVector ? prevStateVector[inspectedIdx]?.toFixed(4) : '0.0000'}
              </span>
            </div>
            <div>
              <span className="text-[#8F96A3] block text-[10px]">SPECIFIC DELTA (Δ)</span>
              {prevStateVector ? (
                <span
                  className={
                    stateVector[inspectedIdx] - prevStateVector[inspectedIdx] >= 0
                      ? 'text-emerald-400 font-bold'
                      : 'text-rose-400 font-bold'
                  }
                >
                  {stateVector[inspectedIdx] - prevStateVector[inspectedIdx] >= 0 ? '+' : ''}
                  {(stateVector[inspectedIdx] - prevStateVector[inspectedIdx]).toFixed(4)}
                </span>
              ) : (
                <span className="text-[#8F96A3]">--</span>
              )}
            </div>
            <div>
              <span className="text-[#8F96A3] block text-[10px]">ACTIVE UNIT STATUS</span>
              <span className={Math.abs(stateVector[inspectedIdx]) > 0.05 ? 'text-[#22D3EE]' : 'text-zinc-500'}>
                {Math.abs(stateVector[inspectedIdx]) > 0.05 ? 'ACTIVE (>0.05)' : 'SPARSE / QUIET'}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-[11px] text-[#8F96A3]">
            Hover over any vector coordinate cell above to see exact numerical delta Δ, previous value, and unit activity.
          </div>
        )}

        {/* Global vector stats */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#252A35]/60 text-[11px]">
          <div>
            <span className="text-[#8F96A3] text-[10px] block">CURRENT STATE NORM:</span>
            <span className="font-bold text-white">||h|| = {stateNorm.toFixed(3)}</span>
          </div>
          <div>
            <span className="text-[#8F96A3] text-[10px] block">ACTIVE UNITS:</span>
            <span className="font-bold text-[#22D3EE]">{activeCount} / {dimensions}</span>
          </div>
          <div>
            <span className="text-[#8F96A3] text-[10px] block">LAST INPUT:</span>
            <span className="text-zinc-300 truncate block">{lastInputLabel || 'Initialization'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

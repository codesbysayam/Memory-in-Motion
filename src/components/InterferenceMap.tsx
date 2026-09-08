import React, { useState, useMemo } from 'react';
import {
  Grid,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Maximize2,
  Layers,
} from 'lucide-react';
import {
  SWEEP_FACTS_RANGE,
  SWEEP_INTERFERENCE_RANGE,
  SweepCellResult,
  runFullSweep,
  runSweepPoint,
} from '../models/sweepEngine';

export const InterferenceMap: React.FC = () => {
  const [dim, setDim] = useState<number>(16);
  const [retention, setRetention] = useState<number>(0.95);
  const [selectedCellKey, setSelectedCellKey] = useState<string>('16-0.4');
  const [sweepRunCount, setSweepRunCount] = useState<number>(1);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Compute full sweep deterministically
  const sweepData = useMemo(() => {
    // dependency on sweepRunCount allows user to re-run or refresh
    return runFullSweep(dim, retention);
  }, [dim, retention, sweepRunCount]);

  // Selected cell data
  const activeResult: SweepCellResult = useMemo(() => {
    const found = sweepData.get(selectedCellKey);
    if (found) return found;

    // Fallback if key not found
    const [fStr, iStr] = selectedCellKey.split('-');
    return runSweepPoint(Number(fStr) || 16, Number(iStr) || 0.4, dim, retention);
  }, [sweepData, selectedCellKey, dim, retention]);

  const handleRunSweep = () => {
    setIsRunning(true);
    setTimeout(() => {
      setSweepRunCount((c) => c + 1);
      setIsRunning(false);
    }, 150);
  };

  // Helper for cell color based on accuracy (0 to 1)
  const getCellColor = (acc: number) => {
    if (acc >= 0.95) return 'bg-emerald-500 text-black';
    if (acc >= 0.8) return 'bg-emerald-600/90 text-white';
    if (acc >= 0.6) return 'bg-lime-600/80 text-white';
    if (acc >= 0.4) return 'bg-amber-600/80 text-white';
    if (acc >= 0.2) return 'bg-orange-700/80 text-white';
    return 'bg-rose-950 text-rose-300 border border-rose-800/60';
  };

  return (
    <div className="rounded-2xl border border-[#252A35] bg-[#0A0D16] p-5 sm:p-7 text-slate-100 shadow-2xl space-y-6">
      {/* Header & Badging */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2638] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-0.5 rounded-md font-bold flex items-center gap-1.5">
              <Grid className="w-3.5 h-3.5" />
              2D PHASE SPACE: FACTS VS. INTERFERENCE
            </span>
            <span className="text-xs font-mono uppercase tracking-wider text-amber-300 bg-amber-950/70 border border-amber-800/60 px-2.5 py-0.5 rounded-md font-bold">
              OBSERVED IN EDUCATIONAL MODEL
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
            THE 2D INTERFERENCE MAP
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-2xl">
            Sweep across <strong className="text-white">Facts Count</strong> (X-axis) and <strong className="text-white">Interference Correlation</strong> (Y-axis). Click any cell to inspect the exact memory state and failure traces.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunSweep}
            disabled={isRunning}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-cyan-600/30 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? 'SWEEPING...' : 'RUN SWEEP'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Y-axis (Interference descending) vs X-axis (Facts ascending) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Heatmap Area */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>INTERFERENCE CORRELATION (Y) ↑</span>
            <span className="text-slate-500">ACCURACY (0% - 100%)</span>
          </div>

          <div className="overflow-x-auto p-4 rounded-xl bg-[#080B13] border border-[#1C2438]">
            <div className="min-w-[420px]">
              {/* Y-axis reversed (from 1.0 down to 0.0) */}
              {[...SWEEP_INTERFERENCE_RANGE].reverse().map((inter) => {
                const interKey = inter.toFixed(1);
                return (
                  <div key={interKey} className="flex items-center gap-2 mb-1.5">
                    {/* Y-axis label */}
                    <div className="w-14 text-right font-mono text-[11px] text-slate-400 flex-shrink-0">
                      {(inter * 100).toFixed(0)}%
                    </div>

                    {/* Cells for each facts count */}
                    <div className="grid grid-cols-5 gap-2 flex-1">
                      {SWEEP_FACTS_RANGE.map((fCount) => {
                        const cellKey = `${fCount}-${interKey}`;
                        const cell = sweepData.get(cellKey);
                        const acc = cell?.accuracy ?? 0;
                        const isSelected = selectedCellKey === cellKey;

                        return (
                          <button
                            key={cellKey}
                            onClick={() => setSelectedCellKey(cellKey)}
                            className={`h-7 rounded text-[11px] font-mono font-bold flex items-center justify-center transition-all ${getCellColor(
                              acc
                            )} ${
                              isSelected
                                ? 'ring-2 ring-white scale-105 z-10 shadow-lg'
                                : 'hover:opacity-90 hover:scale-102'
                            }`}
                            title={`Facts: ${fCount}, Interference: ${interKey}, Accuracy: ${(
                              acc * 100
                            ).toFixed(0)}%`}
                          >
                            {(acc * 100).toFixed(0)}%
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* X-axis labels */}
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[#1C2538]">
                <div className="w-14 text-right font-mono text-[10px] text-slate-500 uppercase">
                  FACTS →
                </div>
                <div className="grid grid-cols-5 gap-2 flex-1 font-mono text-xs text-center text-slate-300 font-bold">
                  {SWEEP_FACTS_RANGE.map((f) => (
                    <div key={f} className="py-1">
                      {f} Facts
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Color Scale Legend */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-[#0C101A] border border-[#182132] text-[10px] font-mono">
            <span className="text-slate-400">LEGEND:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-emerald-500 inline-block" />
              <span className="text-slate-300">100%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-lime-600/80 inline-block" />
              <span className="text-slate-300">60-80%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-amber-600/80 inline-block" />
              <span className="text-slate-300">40-60%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-rose-950 border border-rose-800 inline-block" />
              <span className="text-slate-300">&lt; 20% (Collapse)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Selected Cell Deep Dive Inspector */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-[#0C101C] border border-[#1D2536] space-y-4">
          <div className="flex items-center justify-between border-b border-[#1A2234] pb-2 font-mono text-xs">
            <span className="text-slate-400">INSPECTED REGION:</span>
            <span className="text-cyan-300 font-bold">
              {activeResult.factsCount} FACTS @ {(activeResult.interference * 100).toFixed(0)}% INTERFERENCE
            </span>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 rounded-lg bg-[#111726] border border-[#1F2B42]">
              <div className="text-slate-400 text-[10px]">RETRIEVAL ACCURACY</div>
              <div
                className={`text-lg font-bold mt-0.5 ${
                  activeResult.accuracy >= 0.8
                    ? 'text-emerald-400'
                    : activeResult.accuracy >= 0.5
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {(activeResult.accuracy * 100).toFixed(1)}%
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#111726] border border-[#1F2B42]">
              <div className="text-slate-400 text-[10px]">SUCCESSFUL / FAILED</div>
              <div className="text-lg font-bold mt-0.5 text-white">
                <span className="text-emerald-400">{activeResult.correctCount}</span> /{' '}
                <span className="text-rose-400">{activeResult.failedCount}</span>
              </div>
            </div>
          </div>

          {/* Failure Trace Example */}
          <div className="p-3.5 rounded-lg bg-[#080B14] border border-[#192336] space-y-2 font-mono text-xs">
            <div className="text-slate-400 text-[11px] flex items-center justify-between">
              <span>FIRST FAILURE TRACE:</span>
              <span className="text-slate-500">Deterministic Key</span>
            </div>

            {activeResult.exampleFailure ? (
              <div className="text-rose-300 text-[11px] bg-rose-950/40 p-2.5 rounded border border-rose-800/40 leading-relaxed">
                {activeResult.exampleFailure}
              </div>
            ) : (
              <div className="text-emerald-300 text-[11px] bg-emerald-950/40 p-2.5 rounded border border-emerald-800/40 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero query failures in this cell. All facts resolved!</span>
              </div>
            )}
          </div>

          {/* Memory State Heatmap for this Cell */}
          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between items-center text-slate-400 text-[11px]">
              <span>FINAL STATE MATRIX M ({dim}x{dim}):</span>
              <span className="text-purple-300">Superposition Pattern</span>
            </div>

            <div className="grid grid-cols-16 gap-[1.5px] p-2 bg-[#05070D] rounded-lg border border-[#151C2C]">
              {activeResult.stateMatrix.flatMap((row, rIdx) =>
                row.map((val, cIdx) => {
                  const absVal = Math.min(Math.abs(val) * 1.5, 1);
                  const isPos = val >= 0;
                  return (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      title={`M[${rIdx}, ${cIdx}] = ${val.toFixed(3)}`}
                      className="w-full h-2 rounded-[1px]"
                      style={{
                        backgroundColor: isPos
                          ? `rgba(34, 211, 238, ${0.1 + absVal * 0.9})`
                          : `rgba(244, 63, 94, ${0.1 + absVal * 0.9})`,
                      }}
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Epistemic Guardrail Notice */}
      <div className="p-3 rounded-lg bg-[#0C101A] border border-[#1A2234] text-[11px] text-slate-400 font-sans leading-relaxed">
        <strong className="text-slate-200">Scientific Provenance:</strong> This 2D map illustrates the phase boundary in our educational associative matrix (M ∈ ℝ¹⁶ˣ¹⁶). Do not describe the resulting pattern as a universal law of all neural architectures.
      </div>
    </div>
  );
};

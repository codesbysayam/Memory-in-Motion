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

  // Helper for cell color based on accuracy (0 to 1) in editorial scientific palette
  const getCellColor = (acc: number) => {
    if (acc >= 0.95) return 'bg-[#DCEFE2] text-[#245B38] border border-[#C5DDCB]';
    if (acc >= 0.8) return 'bg-[#EAF5EF] text-[#245B38] border border-[#D2EADB]';
    if (acc >= 0.6) return 'bg-[#FFF5D8] text-[#705A1A] border border-[#E8DCB8]';
    if (acc >= 0.4) return 'bg-[#FCEAD8] text-[#8C4A15] border border-[#F0D5BE]';
    if (acc >= 0.2) return 'bg-[#F9E9ED] text-[#B64235] border border-[#ECD1D7]';
    return 'bg-[#F6D5DC] text-[#8A1F14] border border-[#EAAFB9]';
  };

  return (
    <div className="rounded-xl border border-[#D8DCD8] bg-[#FFFFFF] p-5 sm:p-7 text-[#252525] shadow-xs space-y-6">
      {/* Header & Badging */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6DF] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-sans text-[#21445B] bg-[#E7F2FA] border border-[#CDE1F0] px-2.5 py-0.5 rounded-md font-semibold flex items-center gap-1.5">
              <Grid className="w-3.5 h-3.5" />
              2D phase space: facts vs. interference
            </span>
            <span className="text-xs font-sans text-[#5F625F] bg-[#F1F2F0] border border-[#D8DCD8] px-2.5 py-0.5 rounded-md font-semibold">
              Observed in educational model
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#252525] tracking-tight">
            The 2D interference map
          </h3>
          <p className="text-xs sm:text-sm text-[#5F625F] font-sans max-w-2xl">
            Sweep across <strong className="text-[#252525]">Facts count</strong> (X-axis) and <strong className="text-[#252525]">Interference correlation</strong> (Y-axis). Click any cell to inspect the exact memory state and failure traces.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunSweep}
            disabled={isRunning}
            className="px-3.5 py-1.5 rounded-lg bg-[#DCEFE2] hover:bg-[#D0E8D7] text-[#245B38] border border-[#C5DDCB] text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? 'Sweeping...' : 'Run sweep'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Y-axis (Interference descending) vs X-axis (Facts ascending) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Heatmap Area */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs font-sans text-[#5F625F]">
            <span>Interference correlation (Y) ↑</span>
            <span className="text-[#7D817D]">Accuracy (0% - 100%)</span>
          </div>

          <div className="overflow-x-auto p-4 rounded-xl bg-[#FAF8F5] border border-[#D8DCD8]">
            <div className="min-w-[420px]">
              {/* Y-axis reversed (from 1.0 down to 0.0) */}
              {[...SWEEP_INTERFERENCE_RANGE].reverse().map((inter) => {
                const interKey = inter.toFixed(1);
                return (
                  <div key={interKey} className="flex items-center gap-2 mb-1.5">
                    {/* Y-axis label */}
                    <div className="w-14 text-right font-mono text-xs text-[#5F625F] flex-shrink-0">
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
                            className={`h-7 rounded text-xs font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${getCellColor(
                              acc
                            )} ${
                              isSelected
                                ? 'ring-2 ring-[#21445B] scale-105 z-10 shadow-sm'
                                : 'hover:opacity-90'
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
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[#EAE6DF]">
                <div className="w-14 text-right font-sans text-xs text-[#7D817D]">
                  Facts →
                </div>
                <div className="grid grid-cols-5 gap-2 flex-1 font-mono text-xs text-center text-[#252525] font-semibold">
                  {SWEEP_FACTS_RANGE.map((f) => (
                    <div key={f} className="py-1">
                      {f} facts
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Color Scale Legend */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-[#FAF8F5] border border-[#D8DCD8] text-xs font-sans">
            <span className="text-[#5F625F] font-semibold">Legend:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-[#DCEFE2] border border-[#C5DDCB] inline-block" />
              <span className="text-[#252525]">100%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-[#FFF5D8] border border-[#E8DCB8] inline-block" />
              <span className="text-[#252525]">60–80%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-[#FCEAD8] border border-[#F0D5BE] inline-block" />
              <span className="text-[#252525]">40–60%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-[#F9E9ED] border border-[#ECD1D7] inline-block" />
              <span className="text-[#252525]">&lt; 20% (Collapse)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Selected Cell Deep Dive Inspector */}
        <div className="lg:col-span-5 p-5 rounded-lg bg-[#FAF8F5] border border-[#D8DCD8] space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-2 font-sans text-xs">
            <span className="text-[#5F625F] font-semibold">Inspected region:</span>
            <span className="text-[#21445B] font-mono font-bold">
              {activeResult.factsCount} facts @ {(activeResult.interference * 100).toFixed(0)}% interference
            </span>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#D8DCD8]">
              <div className="text-[#5F625F] text-xs font-sans">Retrieval accuracy</div>
              <div
                className={`text-lg font-serif font-bold mt-0.5 ${
                  activeResult.accuracy >= 0.8
                    ? 'text-[#247A4B]'
                    : activeResult.accuracy >= 0.5
                    ? 'text-[#A46622]'
                    : 'text-[#B64235]'
                }`}
              >
                {(activeResult.accuracy * 100).toFixed(1)}%
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#D8DCD8]">
              <div className="text-[#5F625F] text-xs font-sans">Successful / failed</div>
              <div className="text-lg font-mono font-bold mt-0.5 text-[#252525]">
                <span className="text-[#247A4B]">{activeResult.correctCount}</span> /{' '}
                <span className="text-[#B64235]">{activeResult.failedCount}</span>
              </div>
            </div>
          </div>

          {/* Failure Trace Example */}
          <div className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#D8DCD8] space-y-2 font-sans text-xs">
            <div className="text-[#5F625F] text-xs flex items-center justify-between">
              <span className="font-semibold">First failure trace:</span>
              <span className="text-[#7D817D]">Deterministic key</span>
            </div>

            {activeResult.exampleFailure ? (
              <div className="text-[#B64235] text-xs bg-[#F9E9ED] p-2.5 rounded border border-[#ECD1D7] leading-relaxed font-sans">
                {activeResult.exampleFailure}
              </div>
            ) : (
              <div className="text-[#245B38] text-xs bg-[#DCEFE2] p-2.5 rounded border border-[#C5DDCB] flex items-center gap-1.5 font-sans">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#245B38]" />
                <span>Zero query failures in this cell. All facts resolved!</span>
              </div>
            )}
          </div>

          {/* Memory State Heatmap for this Cell */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-[#5F625F] text-xs font-sans">
              <span className="font-semibold">State matrix M ({dim}×{dim}):</span>
              <span className="text-[#31566E]">Superposition pattern</span>
            </div>

            <div className="grid grid-cols-16 gap-[1.5px] p-2 bg-[#FFFFFF] rounded-lg border border-[#D8DCD8]">
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
                          ? `rgba(49, 86, 110, ${0.15 + absVal * 0.85})`
                          : `rgba(182, 66, 53, ${0.15 + absVal * 0.85})`,
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
      <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#D8DCD8] text-xs text-[#5F625F] font-sans leading-relaxed">
        <strong className="text-[#252525]">Educational toy:</strong> This 2D map illustrates the phase boundary in an educational associative matrix (M ∈ ℝ¹⁶ˣ¹⁶). Educational toy — not the official BDH implementation.
      </div>
    </div>
  );
};

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

  // Helper for cell color based on accuracy (0 to 1) using semantic tokens
  const getCellColor = (acc: number) => {
    if (acc >= 0.8) return 'bg-[var(--accent-green)] text-[var(--accent-green-text)] border border-[var(--color-success-border)]';
    if (acc >= 0.4) return 'bg-[var(--accent-yellow)] text-[var(--accent-yellow-text)] border border-[var(--color-warning-border)]';
    return 'bg-[var(--accent-pink)] text-[var(--accent-pink-text)] border border-[var(--color-danger-border)]';
  };

  return (
    <div className="diagram-frame p-5 sm:p-7 text-[var(--text-primary)] space-y-6">
      {/* Header & Badging */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-sans text-[var(--accent-blue-text)] bg-[var(--accent-blue)] border border-[var(--border)] px-2.5 py-0.5 rounded-md font-semibold flex items-center gap-1.5">
              <Grid className="w-3.5 h-3.5" />
              2D phase space: facts vs. interference
            </span>
            <span className="text-xs font-sans text-[var(--text-secondary)] bg-[var(--surface-soft)] border border-[var(--border)] px-2.5 py-0.5 rounded-md font-semibold">
              Observed in educational model
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[var(--text-primary)] tracking-tight">
            The 2D interference map
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans max-w-2xl">
            Sweep across <strong className="text-[var(--text-primary)]">Facts count</strong> (X-axis) and <strong className="text-[var(--text-primary)]">Interference correlation</strong> (Y-axis). Click any cell to inspect the exact memory state and failure traces.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunSweep}
            disabled={isRunning}
            className="px-3.5 py-1.5 rounded-lg bg-[var(--accent-green)] hover:opacity-90 text-[var(--accent-green-text)] border border-[var(--color-success-border)] text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
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
          <div className="flex items-center justify-between text-xs font-sans text-[var(--text-secondary)]">
            <span>Interference correlation (Y) ↑</span>
            <span className="text-[var(--text-muted)]">Accuracy (0% - 100%)</span>
          </div>

          <div className="overflow-x-auto p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)]">
            <div className="min-w-[420px]">
              {/* Y-axis reversed (from 1.0 down to 0.0) */}
              {[...SWEEP_INTERFERENCE_RANGE].reverse().map((inter) => {
                const interKey = inter.toFixed(1);
                return (
                  <div key={interKey} className="flex items-center gap-2 mb-1.5">
                    {/* Y-axis label */}
                    <div className="w-14 text-right font-mono text-xs text-[var(--text-secondary)] flex-shrink-0 tabular-nums">
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
                            className={`h-7 rounded text-xs font-mono font-bold tabular-nums flex items-center justify-center transition-all cursor-pointer ${getCellColor(
                              acc
                            )} ${
                              isSelected
                                ? 'ring-2 ring-[var(--accent-blue-text)] scale-105 z-10'
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
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[var(--border)]">
                <div className="w-14 text-right font-sans text-xs text-[var(--text-muted)]">
                  Facts →
                </div>
                <div className="grid grid-cols-5 gap-2 flex-1 font-mono text-xs text-center text-[var(--text-primary)] font-semibold tabular-nums">
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
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)] text-xs font-sans">
            <span className="text-[var(--text-secondary)] font-semibold">Legend:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-[var(--accent-green)] border border-[var(--color-success-border)] inline-block" />
              <span className="text-[var(--text-primary)]">80–100%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-[var(--accent-yellow)] border border-[var(--color-warning-border)] inline-block" />
              <span className="text-[var(--text-primary)]">40–79%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-[var(--accent-pink)] border border-[var(--color-danger-border)] inline-block" />
              <span className="text-[var(--text-primary)]">&lt; 40% (Collapse)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Selected Cell Deep Dive Inspector */}
        <div className="lg:col-span-5 p-5 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)] space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 font-sans text-xs">
            <span className="text-[var(--text-secondary)] font-semibold">Inspected region:</span>
            <span className="text-[var(--accent-blue-text)] font-mono font-bold tabular-nums">
              {activeResult.factsCount} facts @ {(activeResult.interference * 100).toFixed(0)}% interference
            </span>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="metric-panel p-3">
              <div className="text-[var(--text-secondary)] text-xs font-sans">Retrieval accuracy</div>
              <div
                className={`text-lg font-serif font-bold mt-0.5 tabular-nums ${
                  activeResult.accuracy >= 0.8
                    ? 'text-[var(--accent-green-text)]'
                    : activeResult.accuracy >= 0.5
                    ? 'text-[var(--accent-yellow-text)]'
                    : 'text-[var(--accent-pink-text)]'
                }`}
              >
                {(activeResult.accuracy * 100).toFixed(1)}%
              </div>
            </div>

            <div className="metric-panel p-3">
              <div className="text-[var(--text-secondary)] text-xs font-sans">Successful / failed</div>
              <div className="text-lg font-mono font-bold mt-0.5 text-[var(--text-primary)] tabular-nums">
                <span className="text-[var(--accent-green-text)]">{activeResult.correctCount}</span> /{' '}
                <span className="text-[var(--accent-pink-text)]">{activeResult.failedCount}</span>
              </div>
            </div>
          </div>

          {/* Failure Trace Example */}
          <div className="p-3.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] space-y-2 font-sans text-xs">
            <div className="text-[var(--text-secondary)] text-xs flex items-center justify-between">
              <span className="font-semibold">First failure trace:</span>
              <span className="text-[var(--text-muted)]">Deterministic key</span>
            </div>

            {activeResult.exampleFailure ? (
              <div className="text-[var(--accent-pink-text)] text-xs bg-[var(--accent-pink)] p-2.5 rounded border border-[var(--color-danger-border)] leading-relaxed font-sans">
                {activeResult.exampleFailure}
              </div>
            ) : (
              <div className="text-[var(--accent-green-text)] text-xs bg-[var(--accent-green)] p-2.5 rounded border border-[var(--color-success-border)] flex items-center gap-1.5 font-sans">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-green-text)]" />
                <span>Zero query failures in this cell. All facts resolved!</span>
              </div>
            )}
          </div>

          {/* Memory State Heatmap for this Cell */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-[var(--text-secondary)] text-xs font-sans">
              <span className="font-semibold">State matrix M ({dim}×{dim}):</span>
              <span className="text-[var(--accent-blue-text)]">Superposition pattern</span>
            </div>

            <div className="grid grid-cols-16 gap-[1.5px] p-2 bg-[var(--color-matrix-bg)] rounded-lg border border-[var(--color-matrix-border)]">
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
                          ? `rgba(76, 154, 255, ${0.18 + absVal * 0.82})`
                          : `rgba(229, 98, 90, ${0.18 + absVal * 0.82})`,
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
      <div className="p-3 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)] text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
        <strong className="text-[var(--text-primary)]">Educational toy:</strong> This 2D map illustrates the phase boundary in an educational associative matrix (M ∈ ℝ¹⁶ˣ¹⁶). Educational toy — not the official BDH implementation.
      </div>
    </div>
  );
};

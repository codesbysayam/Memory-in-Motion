import React, { useMemo, useState } from 'react';
import { HelpCircle, Layers } from 'lucide-react';

interface MatrixDiffProps {
  matrixBefore: number[][];
  matrixAfter: number[][];
  dimension?: number;
}

export const MatrixDiff: React.FC<MatrixDiffProps> = ({
  matrixBefore,
  matrixAfter,
  dimension = 16,
}) => {
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);

  // Compute exact delta matrix and statistics
  const { deltaMatrix, meanAbsDelta, maxAbsDelta, changedCellsCount, totalCells } = useMemo(() => {
    const dim = Math.min(matrixBefore.length, matrixAfter.length, dimension);
    let sumAbs = 0;
    let maxAbs = 0;
    let changed = 0;
    const delta: number[][] = [];

    for (let i = 0; i < dim; i++) {
      const row: number[] = [];
      for (let j = 0; j < dim; j++) {
        const b = matrixBefore[i]?.[j] ?? 0;
        const a = matrixAfter[i]?.[j] ?? 0;
        const d = a - b;
        const absD = Math.abs(d);
        sumAbs += absD;
        if (absD > maxAbs) maxAbs = absD;
        if (absD > 1e-4) changed++;
        row.push(d);
      }
      delta.push(row);
    }

    const total = dim * dim;
    const meanAbs = total > 0 ? sumAbs / total : 0;

    return {
      deltaMatrix: delta,
      meanAbsDelta: meanAbs,
      maxAbsDelta: maxAbs,
      changedCellsCount: changed,
      totalCells: total,
    };
  }, [matrixBefore, matrixAfter, dimension]);

  // Display size: for dimension > 16, visual grid downsamples to 16x16 to avoid DOM overflow
  const displayDim = Math.min(16, deltaMatrix.length);

  return (
    <div className="diagram-frame p-5 text-[var(--text-primary)] space-y-4 font-mono">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[var(--accent-blue-text)]" />
          <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
            Memory matrix difference · ΔM = M_after − M_before
          </h4>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
          <span className="group relative cursor-help flex items-center gap-1 text-[var(--accent-blue-text)]">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Dimension info</span>
            <span className="pointer-events-none absolute right-0 top-6 z-50 hidden group-hover:block w-72 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2.5 text-[10px] text-[var(--text-secondary)] shadow-md font-sans">
              Matrix coordinates are computational dimensions; they do not have predefined human meanings.
            </span>
          </span>
        </div>
      </div>

      {/* Actual Computed Statistics */}
      <div className="grid grid-cols-3 gap-3 text-xs tabular-nums">
        <div className="metric-panel p-3 space-y-0.5">
          <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider">Mean |ΔM|</span>
          <div className="text-sm font-bold text-[var(--accent-blue-text)]">{meanAbsDelta.toFixed(4)}</div>
          <span className="text-[9px] text-[var(--text-muted)] font-sans">Average magnitude change</span>
        </div>

        <div className="metric-panel p-3 space-y-0.5">
          <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider">Max |ΔM|</span>
          <div className="text-sm font-bold text-[var(--accent-yellow-text)]">{maxAbsDelta.toFixed(4)}</div>
          <span className="text-[9px] text-[var(--text-muted)] font-sans">Peak localized update</span>
        </div>

        <div className="metric-panel p-3 space-y-0.5">
          <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider">Changed cells</span>
          <div className="text-sm font-bold text-[var(--accent-green-text)]">
            {changedCellsCount} / {totalCells}
          </div>
          <span className="text-[9px] text-[var(--text-muted)] font-sans">
            {totalCells > 0 ? ((changedCellsCount / totalCells) * 100).toFixed(0) : 0}% of coordinates
          </span>
        </div>
      </div>

      {/* 3-Column Heatmap Visual: Before -> After -> Delta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        {/* Before Matrix */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] font-bold uppercase tabular-nums">
            <span>Before write (M_before)</span>
            <span>{displayDim}×{displayDim}</span>
          </div>
          <div
            className="grid gap-[2px] p-2 bg-[var(--color-matrix-bg)] rounded-lg border border-[var(--color-matrix-border)]"
            style={{ gridTemplateColumns: `repeat(${displayDim}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: displayDim }).map((_, r) =>
              Array.from({ length: displayDim }).map((_, c) => {
                const val = matrixBefore[r]?.[c] ?? 0;
                const absV = Math.min(1, Math.abs(val));
                return (
                  <div
                    key={`b-${r}-${c}`}
                    onClick={() => setSelectedCell({ r, c })}
                    className="aspect-square rounded-[1px] cursor-pointer transition-opacity hover:opacity-100 hover:ring-1 hover:ring-[var(--color-matrix-ink)]"
                    style={{
                      backgroundColor:
                        val >= 0
                          ? `rgba(76, 154, 255, ${Math.max(0.1, absV * 0.85)})`
                          : `rgba(229, 98, 90, ${Math.max(0.1, absV * 0.85)})`,
                    }}
                    title={`M_before[${r}][${c}] = ${val.toFixed(4)}`}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* After Matrix */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] font-bold uppercase tabular-nums">
            <span>After write (M_after)</span>
            <span>{displayDim}×{displayDim}</span>
          </div>
          <div
            className="grid gap-[2px] p-2 bg-[var(--color-matrix-bg)] rounded-lg border border-[var(--color-matrix-border)]"
            style={{ gridTemplateColumns: `repeat(${displayDim}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: displayDim }).map((_, r) =>
              Array.from({ length: displayDim }).map((_, c) => {
                const val = matrixAfter[r]?.[c] ?? 0;
                const absV = Math.min(1, Math.abs(val));
                return (
                  <div
                    key={`a-${r}-${c}`}
                    onClick={() => setSelectedCell({ r, c })}
                    className="aspect-square rounded-[1px] cursor-pointer transition-opacity hover:opacity-100 hover:ring-1 hover:ring-[var(--color-matrix-ink)]"
                    style={{
                      backgroundColor:
                        val >= 0
                          ? `rgba(76, 154, 255, ${Math.max(0.1, absV * 0.85)})`
                          : `rgba(229, 98, 90, ${Math.max(0.1, absV * 0.85)})`,
                    }}
                    title={`M_after[${r}][${c}] = ${val.toFixed(4)}`}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* Delta Matrix ΔM */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px] text-[var(--accent-blue-text)] font-bold uppercase">
            <span>Actual delta (ΔM)</span>
            <span>Updates highlighted</span>
          </div>
          <div
            className="grid gap-[2px] p-2 bg-[var(--color-matrix-bg)] rounded-lg border border-[var(--color-matrix-border)]"
            style={{ gridTemplateColumns: `repeat(${displayDim}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: displayDim }).map((_, r) =>
              Array.from({ length: displayDim }).map((_, c) => {
                const val = deltaMatrix[r]?.[c] ?? 0;
                const absD = Math.abs(val);
                const isLargest = maxAbsDelta > 0 && absD >= maxAbsDelta * 0.7;
                const intensity = maxAbsDelta > 0 ? Math.min(1, absD / maxAbsDelta) : 0;
                return (
                  <div
                    key={`d-${r}-${c}`}
                    onClick={() => setSelectedCell({ r, c })}
                    className={`aspect-square rounded-[1px] cursor-pointer transition-transform ${
                      isLargest ? 'ring-1 ring-[var(--color-matrix-ink)] scale-105 z-10' : ''
                    } hover:opacity-100 hover:ring-1 hover:ring-[var(--color-matrix-ink)]`}
                    style={{
                      backgroundColor:
                        val >= 0
                          ? `rgba(76, 154, 255, ${Math.max(0.1, intensity * 0.85)})`
                          : `rgba(229, 98, 90, ${Math.max(0.1, intensity * 0.85)})`,
                    }}
                    title={`ΔM[${r}][${c}] = ${val.toFixed(4)} (before: ${(matrixBefore[r]?.[c] ?? 0).toFixed(4)}, after: ${(matrixAfter[r]?.[c] ?? 0).toFixed(4)})`}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Detail Inspector for Selected Cell */}
      {selectedCell && (
        <div className="p-3 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] text-xs flex flex-wrap items-center justify-between gap-2 tabular-nums">
          <span className="text-[var(--text-secondary)]">
            Selected coordinate: <strong className="text-[var(--text-primary)]">[{selectedCell.r}][{selectedCell.c}]</strong>
          </span>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Before: <strong className="text-[var(--text-primary)]">{(matrixBefore[selectedCell.r]?.[selectedCell.c] ?? 0).toFixed(4)}</strong></span>
            <span>After: <strong className="text-[var(--accent-blue-text)]">{(matrixAfter[selectedCell.r]?.[selectedCell.c] ?? 0).toFixed(4)}</strong></span>
            <span>ΔM: <strong className="text-[var(--accent-yellow-text)]">{(deltaMatrix[selectedCell.r]?.[selectedCell.c] ?? 0).toFixed(4)}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};

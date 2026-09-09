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
    <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-5 text-[#151515] space-y-4 font-mono shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6DF] pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#167C80]" />
          <h4 className="text-xs font-bold text-[#151515] uppercase tracking-wider">
            Memory Matrix Difference · ΔM = M_after - M_before
          </h4>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-[#716F68]">
          <span className="group relative cursor-help flex items-center gap-1 text-[#167C80]">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Dimension Tooltip</span>
            <span className="pointer-events-none absolute right-0 top-6 z-50 hidden w-72 rounded-lg border border-[#E5E0D8] bg-[#FFFFFF] p-2.5 text-[10px] text-[#52504A] shadow-md font-sans">
              Matrix coordinates are computational dimensions; they do not have predefined human meanings.
            </span>
          </span>
        </div>
      </div>

      {/* Actual Computed Statistics */}
      <div className="grid grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-0.5">
          <span className="text-[10px] text-[#716F68] uppercase font-bold tracking-wider">MEAN |ΔM|</span>
          <div className="text-sm font-bold text-[#167C80]">{meanAbsDelta.toFixed(4)}</div>
          <span className="text-[9px] text-[#716F68] font-sans">Average magnitude change</span>
        </div>

        <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-0.5">
          <span className="text-[10px] text-[#716F68] uppercase font-bold tracking-wider">MAX |ΔM|</span>
          <div className="text-sm font-bold text-[#A46622]">{maxAbsDelta.toFixed(4)}</div>
          <span className="text-[9px] text-[#716F68] font-sans">Peak localized update</span>
        </div>

        <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-0.5">
          <span className="text-[10px] text-[#716F68] uppercase font-bold tracking-wider">CHANGED CELLS</span>
          <div className="text-sm font-bold text-[#247A4B]">
            {changedCellsCount} / {totalCells}
          </div>
          <span className="text-[9px] text-[#716F68] font-sans">
            {totalCells > 0 ? ((changedCellsCount / totalCells) * 100).toFixed(0) : 0}% of coordinates
          </span>
        </div>
      </div>

      {/* 3-Column Heatmap Visual: Before -> After -> Delta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        {/* Before Matrix */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px] text-[#716F68] font-bold uppercase">
            <span>BEFORE WRITE (M_before)</span>
            <span>{displayDim}×{displayDim}</span>
          </div>
          <div
            className="grid gap-[2px] p-2 bg-[#FFFFFF] rounded-lg border border-[#E5E0D8]"
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
                    className="aspect-square rounded-[1px] cursor-pointer transition-opacity hover:opacity-100 hover:ring-1 hover:ring-[#167C80]"
                    style={{
                      backgroundColor:
                        val >= 0
                          ? `rgba(22, 124, 128, ${Math.max(0.08, absV * 0.75)})`
                          : `rgba(182, 66, 53, ${Math.max(0.08, absV * 0.75)})`,
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
          <div className="flex justify-between items-center text-[10px] text-[#716F68] font-bold uppercase">
            <span>AFTER WRITE (M_after)</span>
            <span>{displayDim}×{displayDim}</span>
          </div>
          <div
            className="grid gap-[2px] p-2 bg-[#FFFFFF] rounded-lg border border-[#E5E0D8]"
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
                    className="aspect-square rounded-[1px] cursor-pointer transition-opacity hover:opacity-100 hover:ring-1 hover:ring-[#167C80]"
                    style={{
                      backgroundColor:
                        val >= 0
                          ? `rgba(22, 124, 128, ${Math.max(0.08, absV * 0.75)})`
                          : `rgba(182, 66, 53, ${Math.max(0.08, absV * 0.75)})`,
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
          <div className="flex justify-between items-center text-[10px] text-[#6842C2] font-bold uppercase">
            <span>ACTUAL DELTA (ΔM)</span>
            <span>UPDATES HIGHLIGHTED</span>
          </div>
          <div
            className="grid gap-[2px] p-2 bg-[#FFFFFF] rounded-lg border border-[#E2D8FA]"
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
                      isLargest ? 'ring-1 ring-[#6842C2] scale-105 z-10' : ''
                    } hover:opacity-100 hover:ring-1 hover:ring-[#151515]`}
                    style={{
                      backgroundColor:
                        val >= 0
                          ? `rgba(104, 66, 194, ${Math.max(0.08, intensity * 0.75)})`
                          : `rgba(182, 66, 53, ${Math.max(0.08, intensity * 0.75)})`,
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
        <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs flex flex-wrap items-center justify-between gap-2">
          <span className="text-[#52504A]">
            Selected Coordinate: <strong className="text-[#151515]">[{selectedCell.r}][{selectedCell.c}]</strong>
          </span>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Before: <strong className="text-[#151515]">{(matrixBefore[selectedCell.r]?.[selectedCell.c] ?? 0).toFixed(4)}</strong></span>
            <span>After: <strong className="text-[#167C80]">{(matrixAfter[selectedCell.r]?.[selectedCell.c] ?? 0).toFixed(4)}</strong></span>
            <span>ΔM: <strong className="text-[#6842C2]">{(deltaMatrix[selectedCell.r]?.[selectedCell.c] ?? 0).toFixed(4)}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';

interface MemoryHeatmapProps {
  data: number[][]; // Rows: time steps, Columns: dimensions
  stepLabels?: string[];
  highlightStep?: number;
  onSelectStep?: (step: number) => void;
  title?: string;
  id?: string;
}

export const MemoryHeatmap: React.FC<MemoryHeatmapProps> = ({
  data,
  stepLabels = [],
  highlightStep,
  onSelectStep,
  title = 'STATE HISTORY HEATMAP (TIME × DIMENSION)',
  id,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{
    step: number;
    dim: number;
    val: number;
    prevVal?: number;
  } | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--color-matrix-border)] bg-[var(--color-matrix-bg)] p-4 text-center text-xs text-[var(--color-matrix-muted)]">
        No state history available.
      </div>
    );
  }

  const numDims = data[0].length;
  // Limit displayed steps to prevent overflow, but show latest steps or scroll
  const displaySteps = data.slice(0, 24);

  return (
    <div id={id} className="rounded-xl border border-[var(--color-matrix-border)] bg-[var(--color-matrix-bg)] p-4 text-[var(--color-matrix-ink)] space-y-3">
      <div className="flex items-center justify-between border-b border-[var(--color-matrix-border)] pb-2.5 gap-2">
        <span className="text-xs font-mono font-semibold text-[var(--color-matrix-ink)]">
          {title}
        </span>
        <span className="text-xs font-mono tabular-nums text-[var(--color-matrix-muted)] shrink-0">
          {data.length} steps × {numDims} dims
        </span>
      </div>

      <p className="text-xs text-[var(--color-matrix-muted)] leading-relaxed">
        Each row represents the fixed-size vector state <code className="text-lime-300 font-mono">h_t</code> after ingesting that step&apos;s information. Notice how new data superimposes and compresses into the same coordinates.
      </p>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[340px] space-y-1">
          {/* Header row: dimension indices */}
          <div className="flex items-center gap-1 text-[10px] font-mono tabular-nums text-[var(--color-matrix-muted)] pl-16">
            {Array.from({ length: numDims }, (_, d) => (
              <div key={d} className="flex-1 text-center truncate">
                d{d}
              </div>
            ))}
          </div>

          {/* Time step rows */}
          {displaySteps.map((stepVec, t) => {
            const isHighlighted = highlightStep !== undefined && highlightStep === t;
            const label = stepLabels[t] || (t === 0 ? 'h_0 (init)' : `t_${t}`);

            return (
              <div
                key={t}
                onClick={() => onSelectStep && onSelectStep(t)}
                className={`flex items-center gap-1 p-1 rounded transition-colors cursor-pointer ${
                  isHighlighted
                    ? 'bg-lime-950/60 ring-1 ring-lime-400'
                    : 'hover:bg-[var(--color-matrix-surface)]'
                }`}
              >
                {/* Step label */}
                <div
                  className="w-16 shrink-0 font-mono text-[11px] tabular-nums truncate text-[var(--color-matrix-muted)] text-left"
                  title={label}
                >
                  <span className={isHighlighted ? 'text-lime-300 font-semibold' : ''}>
                    {t === 0 ? 'init' : `t_${t}`}
                  </span>
                </div>

                {/* Vector dimension cells */}
                <div className="flex-1 flex items-center gap-1">
                  {stepVec.map((val, d) => {
                    const abs = Math.min(Math.abs(val), 1);
                    const isPos = val >= 0;
                    const prev = t > 0 ? data[t - 1][d] : undefined;

                    const bg = isPos
                      ? `rgba(184, 243, 68, ${Math.max(0.18, abs * 0.85)})`
                      : `rgba(244, 63, 94, ${Math.max(0.18, abs * 0.82)})`;

                    const isCellHovered =
                      hoveredCell?.step === t && hoveredCell?.dim === d;

                    return (
                      <div
                        key={d}
                        onMouseEnter={() =>
                          setHoveredCell({ step: t, dim: d, val, prevVal: prev })
                        }
                        onMouseLeave={() => setHoveredCell(null)}
                        style={{ backgroundColor: bg }}
                        className={`flex-1 h-6 rounded flex items-center justify-center font-mono text-[10px] tabular-nums transition-transform ${
                          isCellHovered
                            ? 'scale-115 z-20 ring-1 ring-[var(--color-matrix-ink)] font-semibold text-[var(--color-matrix-ink)]'
                            : 'text-[var(--color-matrix-ink)]/90'
                        }`}
                        title={`t=${t}, d=${d}: ${val.toFixed(3)}`}
                      >
                        {val >= 0 ? '+' : '-'}
                        {Math.abs(val).toFixed(1).replace('0.', '.')}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hover inspection tooltip / footer */}
      {hoveredCell ? (
        <div className="rounded-lg bg-[var(--color-matrix-surface)] border border-[var(--color-matrix-border)] p-2.5 font-mono text-xs tabular-nums flex flex-wrap items-center justify-between gap-2 text-[var(--color-matrix-muted)]">
          <div>
            <span className="text-sky-300 font-semibold">
              h_{hoveredCell.step}[d{hoveredCell.dim}]:
            </span>{' '}
            <span className="text-[var(--color-matrix-ink)] font-semibold">
              {hoveredCell.val.toFixed(4)}
            </span>
          </div>
          {hoveredCell.prevVal !== undefined && (
            <div>
              <span>Prior: {hoveredCell.prevVal.toFixed(4)}</span> ·{' '}
              <span
                className={
                  hoveredCell.val - hoveredCell.prevVal >= 0
                    ? 'text-emerald-300'
                    : 'text-rose-300'
                }
              >
                Δ: {(hoveredCell.val - hoveredCell.prevVal >= 0 ? '+' : '')}
                {(hoveredCell.val - hoveredCell.prevVal).toFixed(4)}
              </span>
            </div>
          )}
          <span className="text-[11px] text-[var(--color-matrix-muted)]">
            {stepLabels[hoveredCell.step] || `Step ${hoveredCell.step}`}
          </span>
        </div>
      ) : (
        <div className="text-[11px] font-mono text-[var(--color-matrix-muted)] flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--color-matrix-border)]">
          <span>Hover coordinates to view numerical Δ across transitions</span>
          <span className="text-indigo-300">Indigo: (+) · Rose: (-)</span>
        </div>
      )}
    </div>
  );
};

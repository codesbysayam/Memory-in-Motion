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
      <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-4 text-center text-xs text-[#8F96A3]">
        No state history available.
      </div>
    );
  }

  const numDims = data[0].length;
  // Limit displayed steps to prevent overflow, but show latest steps or scroll
  const displaySteps = data.slice(0, 24);

  return (
    <div id={id} className="rounded-xl border border-[#252A35] bg-[#11141A] p-4 text-[#F4F5F7] space-y-3">
      <div className="flex items-center justify-between border-b border-[#252A35] pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#22D3EE] animate-pulse" />
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#22D3EE] font-semibold">
            {title}
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#8F96A3]">
          {data.length} Steps × {numDims} Dimensions
        </span>
      </div>

      <p className="text-[11px] text-[#8F96A3] leading-relaxed">
        Each row represents the fixed-size vector state <code className="text-violet-400 font-mono">h_t</code> after ingesting that step's information. Notice how new data superimposes and compresses into the same coordinates.
      </p>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[340px] space-y-1">
          {/* Header row: dimension indices */}
          <div className="flex items-center gap-1 text-[9px] font-mono text-[#8F96A3] pl-16">
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
                className={`flex items-center gap-1 p-1 rounded transition-all cursor-pointer ${
                  isHighlighted
                    ? 'bg-violet-950/60 ring-1 ring-[#22D3EE]'
                    : 'hover:bg-[#151922]'
                }`}
              >
                {/* Step label */}
                <div
                  className="w-16 shrink-0 font-mono text-[10px] truncate text-[#8F96A3] text-left"
                  title={label}
                >
                  <span className={isHighlighted ? 'text-[#22D3EE] font-bold' : ''}>
                    {t === 0 ? 'init' : `t_${t}`}
                  </span>
                </div>

                {/* Vector dimension cells */}
                <div className="flex-1 flex items-center gap-1">
                  {stepVec.map((val, d) => {
                    const abs = Math.min(Math.abs(val), 1);
                    const isPos = val >= 0;
                    const prev = t > 0 ? data[t - 1][d] : undefined;

                    // Restrained color mapping:
                    // Positive: violet opacity
                    // Negative: rose/red opacity
                    const bg = isPos
                      ? `rgba(139, 92, 246, ${Math.max(0.12, abs * 0.85)})`
                      : `rgba(244, 63, 94, ${Math.max(0.12, abs * 0.75)})`;

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
                        className={`flex-1 h-6 rounded flex items-center justify-center font-mono text-[9px] transition-transform ${
                          isCellHovered
                            ? 'scale-125 z-20 ring-1 ring-white shadow-lg font-bold text-white'
                            : 'text-zinc-200/80 hover:brightness-125'
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
        <div className="rounded-lg bg-[#151922] border border-[#252A35] p-2.5 font-mono text-[11px] flex items-center justify-between text-[#8F96A3]">
          <div>
            <span className="text-[#22D3EE] font-bold">
              h_{hoveredCell.step}[d{hoveredCell.dim}]:
            </span>{' '}
            <span className="text-white font-semibold">
              {hoveredCell.val.toFixed(4)}
            </span>
          </div>
          {hoveredCell.prevVal !== undefined && (
            <div>
              <span>Prior: {hoveredCell.prevVal.toFixed(4)}</span> |{' '}
              <span
                className={
                  hoveredCell.val - hoveredCell.prevVal >= 0
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }
              >
                Δ: {(hoveredCell.val - hoveredCell.prevVal >= 0 ? '+' : '')}
                {(hoveredCell.val - hoveredCell.prevVal).toFixed(4)}
              </span>
            </div>
          )}
          <span className="text-[10px] text-zinc-500">
            {stepLabels[hoveredCell.step] || `Step ${hoveredCell.step}`}
          </span>
        </div>
      ) : (
        <div className="text-[10px] font-mono text-[#8F96A3] flex items-center justify-between pt-1 border-t border-[#252A35]">
          <span>Hover coordinates to view numerical Δ (delta) across transitions</span>
          <span className="text-violet-400">Purple: (+) / Rose: (-)</span>
        </div>
      )}
    </div>
  );
};

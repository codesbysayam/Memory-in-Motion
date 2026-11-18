import React, { useState, useMemo, useCallback } from 'react';
import { runCapacitySweep, SweepPointResult, BENCHMARK_DIMENSIONS, BENCHMARK_FACT_COUNTS } from '../models/benchmarkEngine';
import { Play, RotateCcw, CheckCircle2, XCircle, BarChart3, Info } from 'lucide-react';
import { SourceBadge } from './ui/SourceBadge';

interface CapacityExperimentProps {
  id?: string;
}

export const CapacityExperiment: React.FC<CapacityExperimentProps> = ({
  id = 'capacity-experiment-sweep',
}) => {
  const [retention] = useState<number>(0.95);
  const [writeStrength] = useState<number>(0.8);
  const [activeTab, setActiveTab] = useState<'accuracy' | 'confidence'>('accuracy');
  const [selectedPointId, setSelectedPointId] = useState<string>('dim-16-facts-4');
  const [runCounter, setRunCounter] = useState<number>(1);
  const [isSweeping, setIsSweeping] = useState<boolean>(false);

  // Run the reproducible sweep
  const benchmarkResults = useMemo(() => {
    // runCounter ensures clean re-triggering when "RUN SWEEP AGAIN" is clicked
    return runCapacitySweep(BENCHMARK_DIMENSIONS, BENCHMARK_FACT_COUNTS, retention, writeStrength);
  }, [runCounter, retention, writeStrength]);

  const handleRunSweepAgain = useCallback(() => {
    setIsSweeping(true);
    setTimeout(() => {
      setRunCounter((c) => c + 1);
      setIsSweeping(false);
    }, 250);
  }, []);

  const selectedPoint = useMemo<SweepPointResult | undefined>(() => {
    return (
      benchmarkResults.points.find((p) => p.id === selectedPointId) ||
      benchmarkResults.points[0]
    );
  }, [benchmarkResults, selectedPointId]);

  // SVG Chart Geometry
  const svgWidth = 640;
  const svgHeight = 240;
  const padding = { top: 20, right: 30, bottom: 40, left: 50 };
  const chartW = svgWidth - padding.left - padding.right;
  const chartH = svgHeight - padding.top - padding.bottom;

  // X scale: categorical positions for fact counts: 1, 2, 4, 8, 16, 32
  const xCoords = useMemo(() => {
    const coords: Record<number, number> = {};
    BENCHMARK_FACT_COUNTS.forEach((count, idx) => {
      coords[count] = padding.left + (idx / (BENCHMARK_FACT_COUNTS.length - 1)) * chartW;
    });
    return coords;
  }, [chartW, padding.left]);

  // Y scale: 0% to 100%
  const getYCoord = (pct: number) => {
    return padding.top + chartH - (pct / 100) * chartH;
  };

  const dimColors: Record<number, { stroke: string; fill: string; border: string }> = {
    4: { stroke: 'var(--color-danger)', fill: 'var(--color-danger-soft)', border: 'border-[var(--color-danger-border)]' },
    8: { stroke: 'var(--color-warning)', fill: 'var(--color-warning-soft)', border: 'border-[var(--color-warning-border)]' },
    16: { stroke: 'var(--color-accent)', fill: 'var(--color-accent-soft)', border: 'border-[var(--color-border-strong)]' },
    32: { stroke: 'var(--color-success)', fill: 'var(--color-success-soft)', border: 'border-[var(--color-success-border)]' },
  };

  return (
    <div id={id} className="diagram-frame p-5 sm:p-7 text-[var(--text-primary)] space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <SourceBadge type="TOY COMPUTATION" />
            <span className="text-xs font-sans text-[var(--text-secondary)]">
              Reproducible empirical capacity benchmark
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-sans font-semibold text-[var(--text-primary)] tracking-tight">
            Memory accuracy vs. capacity sweep
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl font-sans tabular-nums">
            Empirical stress test querying all written facts across 4 state dimensions (D ∈ &#123;4, 8, 16, 32&#125;) and fact counts (N ∈ &#123;1, 2, 4, 8, 16, 32&#125;).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRunSweepAgain}
            disabled={isSweeping}
            className="px-3.5 py-2 rounded-lg bg-[var(--accent-green)] hover:opacity-90 text-[var(--accent-green-text)] border border-[var(--color-success-border)] text-xs font-semibold disabled:opacity-50 flex items-center gap-2 cursor-pointer transition"
          >
            {isSweeping ? (
              <RotateCcw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>Run sweep again</span>
          </button>
        </div>
      </div>

      {/* Metric Mode Toggle & Scientific Honesty Callout */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center bg-[var(--surface-soft)] p-1 rounded-lg border border-[var(--border)]">
          <button
            type="button"
            onClick={() => setActiveTab('accuracy')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
              activeTab === 'accuracy'
                ? 'bg-[var(--surface)] text-[var(--text-primary)] font-semibold shadow-2xs border border-[var(--border)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Retrieval accuracy</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('confidence')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
              activeTab === 'confidence'
                ? 'bg-[var(--surface)] text-[var(--text-primary)] font-semibold shadow-2xs border border-[var(--border)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Mean retrieval score</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] bg-[var(--surface-soft)] px-3 py-1.5 rounded-lg border border-[var(--border)]">
          <Info className="w-3.5 h-3.5 text-[var(--accent-yellow-text)]" />
          <span>Observed in this educational model (not a universal scaling law).</span>
        </div>
      </div>

      {/* Main Interactive Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: SVG Curves */}
        <div className="lg:col-span-2 bg-[var(--surface-soft)] p-4 rounded-xl border border-[var(--border)] flex flex-col">
          <div className="flex items-center justify-between mb-2 text-xs font-mono text-[var(--text-secondary)]">
            <span>
              {activeTab === 'accuracy' ? 'RETRIEVAL ACCURACY (% CORRECT)' : 'MEAN RETRIEVAL SCORE (%)'}
            </span>
            <span className="text-[var(--text-secondary)]">Click any dot to inspect state</span>
          </div>

          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto select-none"
              style={{ minWidth: '480px' }}
            >
              {/* Y-axis grid lines */}
              {[0, 25, 50, 75, 100].map((val) => {
                const y = getYCoord(val);
                return (
                  <g key={val}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={svgWidth - padding.right}
                      y2={y}
                      stroke="var(--border)"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 4}
                      fill="var(--text-secondary)"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      {val}%
                    </text>
                  </g>
                );
              })}

              {/* X-axis labels */}
              {BENCHMARK_FACT_COUNTS.map((count) => {
                const x = xCoords[count];
                return (
                  <g key={count}>
                    <line
                      x1={x}
                      y1={padding.top}
                      x2={x}
                      y2={svgHeight - padding.bottom}
                      stroke="var(--border)"
                      strokeDasharray="2 2"
                    />
                    <text
                      x={x}
                      y={svgHeight - padding.bottom + 18}
                      fill="var(--text-secondary)"
                      fontSize="11"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {count}
                    </text>
                  </g>
                );
              })}

              {/* X-axis Title */}
              <text
                x={padding.left + chartW / 2}
                y={svgHeight - 6}
                fill="var(--text-muted)"
                fontSize="11"
                fontFamily="monospace"
                textAnchor="middle"
              >
                FACTS STORED IN MEMORY (N)
              </text>

              {/* Data Lines per Dimension */}
              {BENCHMARK_DIMENSIONS.map((dim) => {
                const dimPoints = benchmarkResults.points.filter((p) => p.dimension === dim);
                const pathD = dimPoints
                  .map((p, idx) => {
                    const x = xCoords[p.factCount];
                    const val = activeTab === 'accuracy' ? p.accuracy : p.meanConfidence;
                    const y = getYCoord(val);
                    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                  })
                  .join(' ');

                const col = dimColors[dim];

                return (
                  <g key={dim}>
                    <path
                      d={pathD}
                      fill="none"
                      stroke={col.stroke}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {dimPoints.map((p) => {
                      const x = xCoords[p.factCount];
                      const val = activeTab === 'accuracy' ? p.accuracy : p.meanConfidence;
                      const y = getYCoord(val);
                      const isSelected = selectedPointId === p.id;

                      return (
                        <circle
                          key={p.id}
                          cx={x}
                          cy={y}
                          r={isSelected ? 6.5 : 4}
                          fill={isSelected ? 'var(--surface)' : col.stroke}
                          stroke={col.stroke}
                          strokeWidth={isSelected ? 3 : 1.5}
                          className="cursor-pointer transition-all hover:scale-125"
                          onClick={() => setSelectedPointId(p.id)}
                        >
                          <title>
                            Dim D={p.dimension}, Facts={p.factCount}: Acc={p.accuracy}%, Conf={p.meanConfidence}%
                          </title>
                        </circle>
                      );
                    })}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Dimension Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-3 pt-3 border-t border-[var(--border)] text-xs">
            {BENCHMARK_DIMENSIONS.map((dim) => {
              const col = dimColors[dim];
              return (
                <div key={dim} className="flex items-center gap-1.5 font-mono tabular-nums">
                  <span
                    className="w-2.5 h-2.5 rounded-xs inline-block"
                    style={{ backgroundColor: col.stroke }}
                  />
                  <span className="text-[var(--text-secondary)]">Dimension D = {dim}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Selected Experiment Point Inspection Card */}
        {selectedPoint && (
          <div className="bg-[var(--surface)] p-5 rounded-xl border border-[var(--border)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-3">
                <span className="text-xs font-semibold text-[var(--accent-blue-text)]">
                  Point telemetry
                </span>
                <span className="text-xs font-mono text-[var(--text-secondary)] bg-[var(--surface-soft)] border border-[var(--border)] px-2 py-0.5 rounded tabular-nums">
                  D = {selectedPoint.dimension} · N = {selectedPoint.factCount}
                </span>
              </div>

              {/* KPI metrics */}
              <div className="grid grid-cols-2 gap-2.5 mb-4 text-xs tabular-nums">
                <div className="metric-panel">
                  <div className="text-[var(--text-secondary)] text-[11px]">Accuracy</div>
                  <div className="text-[var(--accent-green-text)] font-mono font-bold text-base mt-0.5">
                    {selectedPoint.accuracy}%
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] font-mono">
                    {selectedPoint.totalCount - selectedPoint.wrongCount}/{selectedPoint.totalCount} correct
                  </div>
                </div>

                <div className="metric-panel" title="Cosine similarity between retrieved representation and candidate. This is not a calibrated probability.">
                  <div className="text-[var(--text-secondary)] text-[11px]">Mean retrieval score</div>
                  <div className="text-[var(--accent-blue-text)] font-mono font-bold text-base mt-0.5">
                    {selectedPoint.meanConfidence}%
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] font-mono">
                    ||Matrix|| = {selectedPoint.matrixNorm}
                  </div>
                </div>
              </div>

              {/* Failed Queries Details */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-[var(--text-primary)] font-semibold tabular-nums">
                    Collisions / Failed queries ({selectedPoint.failedQueries.length})
                  </span>
                </div>

                {selectedPoint.failedQueries.length === 0 ? (
                  <div className="p-3 rounded-lg bg-[var(--accent-green)] border border-[var(--color-success-border)] text-xs text-[var(--accent-green-text)] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[var(--accent-green-text)] shrink-0" />
                    <span>Zero interference collisions. All {selectedPoint.factCount} facts retrieved cleanly.</span>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {selectedPoint.failedQueries.map((fail, fIdx) => (
                      <div
                        key={fIdx}
                        className="p-2 rounded bg-[var(--accent-pink)] border border-[var(--color-danger-border)] text-[11px] font-mono flex items-center justify-between gap-2 tabular-nums"
                      >
                        <div className="flex items-center gap-1.5">
                          <XCircle className="w-3.5 h-3.5 text-[var(--accent-pink-text)] shrink-0" />
                          <span className="text-[var(--text-primary)] font-semibold">{fail.query}:</span>
                          <span className="line-through text-[var(--text-secondary)]">{fail.expected}</span>
                          <span className="text-[var(--text-secondary)]">→</span>
                          <span className="text-[var(--accent-pink-text)] font-bold">{fail.retrieved}</span>
                        </div>
                        <span className="text-[var(--text-secondary)] shrink-0">{fail.confidence}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Matrix Micro Heatmap */}
              <div>
                <div className="text-xs text-[var(--text-secondary)] mb-1.5 flex items-center justify-between">
                  <span>Final matrix state (D={selectedPoint.dimension})</span>
                  <span className="text-[11px] font-mono text-[var(--text-secondary)] tabular-nums">
                    {selectedPoint.dimension}×{selectedPoint.dimension} coordinates
                  </span>
                </div>
                <div
                  className="grid gap-0.5 p-1.5 rounded bg-[var(--color-matrix-bg)] border border-[var(--color-matrix-border)] max-h-24 overflow-hidden"
                  style={{
                    gridTemplateColumns: `repeat(${Math.min(16, selectedPoint.dimension)}, minmax(0, 1fr))`,
                  }}
                >
                  {selectedPoint.matrix.slice(0, 16).map((row, rIdx) =>
                    row.slice(0, 16).map((val, cIdx) => {
                      const alpha = Math.min(1, Math.abs(val) * 0.8);
                      const bg =
                        val > 0
                          ? `rgba(76, 154, 255, ${alpha})`
                          : val < 0
                          ? `rgba(229, 98, 90, ${alpha})`
                          : 'var(--color-matrix-surface)';
                      return (
                        <div
                          key={`${rIdx}-${cIdx}`}
                          style={{ backgroundColor: bg }}
                          className="h-2 rounded-[1px]"
                          title={`M[${rIdx},${cIdx}] = ${val.toFixed(2)}`}
                        />
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-[var(--border)] text-[11px] text-[var(--text-secondary)] font-sans">
              Deterministic trial seeded with canonical facts pool. Repeated runs yield identical coordinates.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

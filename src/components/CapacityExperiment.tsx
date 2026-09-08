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
    4: { stroke: '#F43F5E', fill: 'rgba(244, 63, 94, 0.2)', border: 'border-rose-500/50' },
    8: { stroke: '#F59E0B', fill: 'rgba(245, 158, 11, 0.2)', border: 'border-amber-500/50' },
    16: { stroke: '#3B82F6', fill: 'rgba(59, 130, 246, 0.2)', border: 'border-blue-500/50' },
    32: { stroke: '#10B981', fill: 'rgba(16, 185, 129, 0.2)', border: 'border-emerald-500/50' },
  };

  return (
    <div id={id} className="rounded-2xl border border-[#252C3D] bg-[#0A0E17] p-5 sm:p-7 text-slate-100 shadow-xl">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1E2638] pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <SourceBadge type="TOY COMPUTATION" />
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Reproducible Empirical Capacity Benchmark
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
            Memory Accuracy vs. Capacity Sweep
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Empirical stress test querying all written facts across 4 state dimensions (D ∈ &#123;4, 8, 16, 32&#125;) and fact counts (N ∈ &#123;1, 2, 4, 8, 16, 32&#125;).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunSweepAgain}
            disabled={isSweeping}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-mono font-semibold shadow-lg shadow-blue-500/20 transition"
          >
            {isSweeping ? (
              <RotateCcw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>RUN SWEEP AGAIN</span>
          </button>
        </div>
      </div>

      {/* Metric Mode Toggle & Scientific Honesty Callout */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center bg-[#111726] p-1 rounded-xl border border-[#1E273A]">
          <button
            onClick={() => setActiveTab('accuracy')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
              activeTab === 'accuracy'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Retrieval Accuracy</span>
          </button>
          <button
            onClick={() => setActiveTab('confidence')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
              activeTab === 'confidence'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Mean Confidence</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
          <Info className="w-3.5 h-3.5 text-amber-400" />
          <span>Observed in this educational model (not a universal scaling law).</span>
        </div>
      </div>

      {/* Main Interactive Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: SVG Curves */}
        <div className="lg:col-span-2 bg-[#0E1321] p-4 rounded-xl border border-[#1C2436] flex flex-col">
          <div className="flex items-center justify-between mb-2 text-xs font-mono text-slate-400">
            <span>
              {activeTab === 'accuracy' ? 'RETRIEVAL ACCURACY (% CORRECT)' : 'MEAN QUERY CONFIDENCE (%)'}
            </span>
            <span className="text-slate-500">Click any dot to inspect state</span>
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
                      stroke="#1E273A"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 4}
                      fill="#64748B"
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
                      stroke="#1A2130"
                      strokeDasharray="2 2"
                    />
                    <text
                      x={x}
                      y={svgHeight - padding.bottom + 18}
                      fill="#94A3B8"
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
                fill="#64748B"
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
                          fill={isSelected ? '#FFFFFF' : col.stroke}
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
          <div className="flex flex-wrap items-center justify-center gap-4 mt-3 pt-3 border-t border-[#1C2436] text-xs font-mono">
            {BENCHMARK_DIMENSIONS.map((dim) => {
              const col = dimColors[dim];
              return (
                <div key={dim} className="flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-full inline-block"
                    style={{ backgroundColor: col.stroke }}
                  />
                  <span className="text-slate-300">Dimension D = {dim}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Selected Experiment Point Inspection Card */}
        {selectedPoint && (
          <div className="bg-[#0E1321] p-5 rounded-xl border border-[#1C2436] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#1C2436] pb-3 mb-3">
                <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
                  POINT TELEMETRY
                </span>
                <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                  D = {selectedPoint.dimension} · N = {selectedPoint.factCount}
                </span>
              </div>

              {/* KPI metrics */}
              <div className="grid grid-cols-2 gap-2.5 mb-4 text-xs font-mono">
                <div className="bg-[#141A29] p-2.5 rounded-lg border border-[#20293D]">
                  <div className="text-slate-400 text-[11px]">Accuracy</div>
                  <div className="text-emerald-400 font-bold text-base mt-0.5">
                    {selectedPoint.accuracy}%
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {selectedPoint.totalCount - selectedPoint.wrongCount}/{selectedPoint.totalCount} correct
                  </div>
                </div>

                <div className="bg-[#141A29] p-2.5 rounded-lg border border-[#20293D]" title="This score is based on representation similarity and is not a calibrated probability.">
                  <div className="text-slate-400 text-[11px]">Mean Retrieval Score</div>
                  <div className="text-purple-400 font-bold text-base mt-0.5">
                    {selectedPoint.meanConfidence}%
                  </div>
                  <div className="text-[10px] text-slate-500">
                    ||Matrix|| = {selectedPoint.matrixNorm}
                  </div>
                </div>
              </div>

              {/* Failed Queries Details */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-slate-300 font-semibold">
                    Collisions / Failed Queries ({selectedPoint.failedQueries.length})
                  </span>
                </div>

                {selectedPoint.failedQueries.length === 0 ? (
                  <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-xs font-mono text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Zero interference collisions. All {selectedPoint.factCount} facts retrieved cleanly.</span>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {selectedPoint.failedQueries.map((fail, fIdx) => (
                      <div
                        key={fIdx}
                        className="p-2 rounded bg-rose-950/30 border border-rose-800/40 text-[11px] font-mono flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-1.5">
                          <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span className="text-slate-200 font-semibold">{fail.query}:</span>
                          <span className="line-through text-slate-500">{fail.expected}</span>
                          <span className="text-slate-400">→</span>
                          <span className="text-rose-300 font-bold">{fail.retrieved}</span>
                        </div>
                        <span className="text-slate-500 shrink-0">{fail.confidence}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Matrix Micro Heatmap */}
              <div>
                <div className="text-xs font-mono text-slate-400 mb-1.5 flex items-center justify-between">
                  <span>Final Matrix State (D={selectedPoint.dimension})</span>
                  <span className="text-[10px] text-slate-500">
                    {selectedPoint.dimension}×{selectedPoint.dimension} coordinates
                  </span>
                </div>
                <div
                  className="grid gap-0.5 p-1 rounded bg-[#080B12] border border-[#1A2234] max-h-24 overflow-hidden"
                  style={{
                    gridTemplateColumns: `repeat(${Math.min(16, selectedPoint.dimension)}, minmax(0, 1fr))`,
                  }}
                >
                  {selectedPoint.matrix.slice(0, 16).map((row, rIdx) =>
                    row.slice(0, 16).map((val, cIdx) => {
                      const alpha = Math.min(1, Math.abs(val) * 0.8);
                      const bg =
                        val > 0
                          ? `rgba(59, 130, 246, ${alpha})`
                          : val < 0
                          ? `rgba(239, 68, 68, ${alpha})`
                          : '#111726';
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

            <div className="pt-3 mt-3 border-t border-[#1C2436] text-[11px] text-slate-500 font-mono">
              Deterministic trial seeded with canonical facts pool. Repeated runs yield identical coordinates.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

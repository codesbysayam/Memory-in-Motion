import React, { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp,
  PieChart as PieChartIcon,
  GitCommit,
  Layers,
  ArrowRight,
  Info,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Sparkles,
  ChevronRight,
  Activity,
  Maximize2
} from 'lucide-react';
import { Fact, CANONICAL_FACTS, createAssociativeMemory, cosine, vector } from '../models/associativeMemory';
import { MathView, FormattedMathText } from './ui/MathView';
import { markMilestoneCompleted } from '../utils/progressTracker';

export const SectionMeasure: React.FC = () => {
  const [activeView, setActiveView] = useState<'time' | 'outcome' | 'mechanism'>('time');
  const [metricMode, setMetricMode] = useState<'retrievalScore' | 'top1Margin' | 'stateSimilarity'>('retrievalScore');
  const [retention, setRetention] = useState<number>(0.92);
  const [writeStrength, setWriteStrength] = useState<number>(0.85);
  const [dimension, setDimension] = useState<number>(16);
  const [selectedOutcomeSegment, setSelectedOutcomeSegment] = useState<'all' | 'correct' | 'incorrect' | 'unresolved'>('all');
  const [activeMechanismStep, setActiveMechanismStep] = useState<number>(3);
  const [hoveredDataPoint, setHoveredDataPoint] = useState<any | null>(null);

  // Mark milestone on mount / interaction
  useEffect(() => {
    markMilestoneCompleted('inspect_state_diff');
  }, []);

  // Canonical facts sequence (6 facts)
  const factsSequence: Fact[] = useMemo(() => [
    { key: 'France', value: 'Paris', category: 'Europe' },
    { key: 'Japan', value: 'Tokyo', category: 'Asia' },
    { key: 'Brazil', value: 'Brasília', category: 'Americas' },
    { key: 'Egypt', value: 'Cairo', category: 'Africa' },
    { key: 'Germany', value: 'Berlin', category: 'Europe' },
    { key: 'Canada', value: 'Ottawa', category: 'Americas' },
  ], []);

  // Run sequential ingestion step-by-step and record live measurements
  const measurementData = useMemo(() => {
    const memory = createAssociativeMemory([], dimension, retention, writeStrength);
    const stepLogs: {
      step: number;
      factWritten: Fact;
      queryResults: {
        fact: Fact;
        retrievedVal: string;
        score: number;
        runnerUpScore: number;
        margin: number;
        isCorrect: boolean;
        stateSim: number;
      }[];
      matrixNorm: number;
      deltaCoords: number[];
      maxPosDelta: { index: number; val: number };
      maxNegDelta: { index: number; val: number };
      nearZeroCount: number;
    }[] = [];

    let prevMatrix = memory.getMatrix().map((row) => [...row]);

    factsSequence.forEach((fact, idx) => {
      memory.writeFact(fact);
      const currentMatrix = memory.getMatrix();

      // Calculate flat coordinates delta
      const flatDeltas: number[] = [];
      let maxPos = { index: 0, val: -1e9 };
      let maxNeg = { index: 0, val: 1e9 };
      let nearZero = 0;

      for (let r = 0; r < dimension; r++) {
        for (let c = 0; c < dimension; c++) {
          const delta = currentMatrix[r][c] - prevMatrix[r][c];
          flatDeltas.push(delta);
          const flatIdx = r * dimension + c;
          if (delta > maxPos.val) maxPos = { index: flatIdx, val: delta };
          if (delta < maxNeg.val) maxNeg = { index: flatIdx, val: delta };
          if (Math.abs(delta) < 0.005) nearZero++;
        }
      }

      // Query all facts seen so far to measure retention degradation
      const factsSoFar = factsSequence.slice(0, idx + 1);
      const queryResults = factsSoFar.map((qFact) => {
        // Query using current memory instance
        const queryOutcome = memory.query(qFact.key);

        // Candidate ranking against all sequence facts
        const candidates = factsSequence.map((f) => {
          const v = vector(f.value, dimension);
          return {
            value: f.value,
            score: cosine(queryOutcome.vector, v),
          };
        }).sort((a, b) => b.score - a.score);

        const top1 = candidates[0] || { value: 'None', score: 0 };
        const top2 = candidates[1] || { value: '', score: 0 };
        const isCorrect = top1.value === qFact.value;
        const margin = Math.max(0, top1.score - top2.score);

        return {
          fact: qFact,
          retrievedVal: top1.value,
          score: Math.max(0, top1.score),
          runnerUpScore: Math.max(0, top2.score),
          margin,
          isCorrect,
          stateSim: Math.max(0, top1.score),
        };
      });

      // Frobenius norm of current matrix
      const matrixNorm = Math.sqrt(
        currentMatrix.reduce((sum, row) => sum + row.reduce((rSum, v) => rSum + v * v, 0), 0)
      );

      stepLogs.push({
        step: idx + 1,
        factWritten: fact,
        queryResults,
        matrixNorm,
        deltaCoords: flatDeltas,
        maxPosDelta: maxPos,
        maxNegDelta: maxNeg,
        nearZeroCount: nearZero,
      });

      prevMatrix = currentMatrix.map((row) => [...row]);
    });

    return stepLogs;
  }, [factsSequence, dimension, retention, writeStrength]);

  // Outcomes summary at final step
  const finalStep = measurementData[measurementData.length - 1];
  const outcomeBreakdown = useMemo(() => {
    if (!finalStep) return { correct: [], incorrect: [], unresolved: [], total: 0 };
    const correct = finalStep.queryResults.filter((q) => q.isCorrect);
    const incorrect = finalStep.queryResults.filter((q) => !q.isCorrect && q.score > 0.15);
    const unresolved = finalStep.queryResults.filter((q) => !q.isCorrect && q.score <= 0.15);
    return {
      correct,
      incorrect,
      unresolved,
      total: finalStep.queryResults.length,
    };
  }, [finalStep]);

  // First fact ('France' -> 'Paris') trajectory over steps
  const firstFactTrajectory = useMemo(() => {
    return measurementData.map((stepData) => {
      const q = stepData.queryResults.find((qr) => qr.fact.key === 'France');
      return {
        step: stepData.step,
        factName: stepData.factWritten.key,
        score: q ? q.score : 0,
        margin: q ? q.margin : 0,
        stateSim: q ? q.stateSim : 0,
        isCorrect: q ? q.isCorrect : false,
        retrieved: q ? q.retrievedVal : 'None',
        target: 'Paris',
      };
    });
  }, [measurementData]);

  // SVG Chart dimensions
  const chartWidth = 620;
  const chartHeight = 240;
  const padding = { top: 25, right: 30, bottom: 40, left: 50 };
  const innerW = chartWidth - padding.left - padding.right;
  const innerH = chartHeight - padding.top - padding.bottom;

  // Chart min/max
  const maxVal = 1.0;
  const minVal = 0.0;

  const points = firstFactTrajectory.map((pt, i) => {
    const val =
      metricMode === 'retrievalScore'
        ? pt.score
        : metricMode === 'top1Margin'
        ? pt.margin
        : pt.stateSim;
    const clamped = Math.max(minVal, Math.min(maxVal, val));
    const x = padding.left + (i / (firstFactTrajectory.length - 1 || 1)) * innerW;
    const y = padding.top + innerH - ((clamped - minVal) / (maxVal - minVal)) * innerH;
    return { ...pt, x, y, displayVal: val };
  });

  const polylinePath = points.map((p) => `${p.x},${p.y}`).join(' ');

  // Mechanism Flowchart Steps
  const mechanismStages = [
    {
      id: 1,
      title: '1. INPUT PAIR',
      symbol: '(k_t, v_t)',
      desc: 'Fact arrives as symbolic pair (France → Paris).',
      math: '\\text{input} = (\\text{key}, \\text{value})',
      color: '#A78BFA',
    },
    {
      id: 2,
      title: '2. VECTOR ENCODE',
      symbol: 'k_t, v_t \\in \\mathbb{R}^D',
      desc: 'Embedding projections generate continuous coordinate vectors.',
      math: 'k_t = W_k x_t, \\quad v_t = W_v y_t',
      color: '#60A5FA',
    },
    {
      id: 3,
      title: '3. OUTER-PRODUCT WRITE',
      symbol: '\\Delta M_t = \\eta k_t v_t^T',
      desc: 'Dense D×D outer-product binds key coordinates directly to value coordinates.',
      math: '\\Delta M_t = \\eta \\cdot (k_t v_t^T)',
      color: '#22D3EE',
    },
    {
      id: 4,
      title: '4. STATE RECURRENCE',
      symbol: 'M_t = \\lambda M_{t-1} + \\Delta M_t',
      desc: 'Prior matrix decays by factor λ; new rank-1 matrix superposes on top.',
      math: 'M_t = \\lambda M_{t-1} + \\Delta M_t',
      color: '#34D399',
    },
    {
      id: 5,
      title: '5. SUPERPOSITION & DRIFT',
      symbol: '\\sum_i k_i v_i^T',
      desc: 'Multiple facts share the exact same D×D numbers, causing gradual interference.',
      math: 'M_T = \\sum_{\\tau=1}^T \\lambda^{T-\\tau} \\eta k_\\tau v_\\tau^T',
      color: '#FBBF24',
    },
    {
      id: 6,
      title: '6. QUERY PROBE',
      symbol: 'q^T M_t',
      desc: 'Query vector excites the associative matrix via linear vector-matrix multiplication.',
      math: '\\hat{v} = q^T M_t',
      color: '#F472B6',
    },
    {
      id: 7,
      title: '7. COSINE DECODE',
      symbol: '\\operatorname{argmax}_v \\cos(\\hat{v}, v)',
      desc: 'Decoded answer is selected by maximum similarity against known vocabularies.',
      math: '\\hat{y} = \\operatorname{argmax}_v \\operatorname{sim}(\\hat{v}, v)',
      color: '#38BDF8',
    },
  ];

  return (
    <section id="section-measure" className="scroll-mt-20 border-b border-[#252A35] bg-[#0A0C12] py-16 text-[#F4F5F7]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 space-y-10">
        {/* Editorial Section Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded bg-[#161C2A] text-[#22D3EE] border border-[#232F48] font-bold">
              04 / MEASURE
            </span>
            <span className="text-xs font-mono text-[#8F96A3]">
              STATE PERSISTENCE & ANALYTICS
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-serif tracking-tight text-white font-normal">
            WATCH MEMORY CHANGE.
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 font-sans max-w-3xl leading-relaxed">
            The state is fixed in size (<MathView math={`D \\times D = ${dimension} \\times ${dimension}`} /> coordinates). What changes is what survives inside it. Follow the empirical trajectory of retained memories as new facts arrive.
          </p>
        </div>

        {/* View Selection Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-2 rounded-xl bg-[#111622] border border-[#20293D]">
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="text-slate-400 px-2 py-1 text-[11px] uppercase tracking-wider hidden sm:inline-block">
              ONE EXPERIMENT — THREE VIEWS:
            </span>
            <button
              onClick={() => setActiveView('time')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeView === 'time'
                  ? 'bg-[#1C2538] text-[#22D3EE] border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-[#151C2C]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>View 01: Time (Line Graph)</span>
            </button>
            <button
              onClick={() => setActiveView('outcome')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeView === 'outcome'
                  ? 'bg-[#1C2538] text-[#22D3EE] border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-[#151C2C]'
              }`}
            >
              <PieChartIcon className="w-3.5 h-3.5" />
              <span>View 02: Outcome (Donut Chart)</span>
            </button>
            <button
              onClick={() => setActiveView('mechanism')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeView === 'mechanism'
                  ? 'bg-[#1C2538] text-[#22D3EE] border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-[#151C2C]'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>View 03: Mechanism (Flowchart)</span>
            </button>
          </div>

          {/* Interactive Parameters Quick Bar */}
          <div className="flex items-center gap-3 font-mono text-xs text-slate-300">
            <span className="text-[11px] text-slate-400">λ: {retention.toFixed(2)}</span>
            <input
              type="range"
              min="0.70"
              max="1.0"
              step="0.02"
              value={retention}
              onChange={(e) => {
                setRetention(parseFloat(e.target.value));
                markMilestoneCompleted('adjust_params');
              }}
              className="w-20 sm:w-28 accent-[#22D3EE] cursor-pointer"
              title="Retention attenuation factor λ"
            />
            <span className="text-[11px] text-slate-400">D: {dimension}</span>
          </div>
        </div>

        {/* VIEW 01: TIME (RETRIEVAL ACROSS SEQUENCE) */}
        {activeView === 'time' && (
          <div className="rounded-2xl border border-[#20293D] bg-[#0E131E] p-5 sm:p-7 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A2334] pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
                  <span>Retrieval Performance Across the Sequence</span>
                  <span className="text-xs font-mono font-normal text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                    Fact #1: France → Paris
                  </span>
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Track how Fact #1 ("France → Paris") decays and interferes as 5 subsequent facts are written.
                </p>
              </div>

              {/* Metric Selector */}
              <div className="flex items-center gap-1 bg-[#141A28] p-1 rounded-lg border border-[#222E44] text-xs font-mono">
                <button
                  onClick={() => setMetricMode('retrievalScore')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    metricMode === 'retrievalScore'
                      ? 'bg-cyan-900/70 text-cyan-200 border border-cyan-700/60 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Retrieval Score
                </button>
                <button
                  onClick={() => setMetricMode('top1Margin')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    metricMode === 'top1Margin'
                      ? 'bg-cyan-900/70 text-cyan-200 border border-cyan-700/60 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Top-1 Margin
                </button>
                <button
                  onClick={() => setMetricMode('stateSimilarity')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    metricMode === 'stateSimilarity'
                      ? 'bg-cyan-900/70 text-cyan-200 border border-cyan-700/60 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  State Similarity
                </button>
              </div>
            </div>

            {/* SVG Line Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2 overflow-x-auto">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-auto max-h-[300px] select-none"
                >
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#22D3EE" />
                      <stop offset="100%" stopColor="#818CF8" />
                    </linearGradient>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1.0].map((v) => {
                    const y = padding.top + innerH - (v / 1.0) * innerH;
                    return (
                      <g key={v}>
                        <line
                          x1={padding.left}
                          y1={y}
                          x2={chartWidth - padding.right}
                          y2={y}
                          stroke="#1A2436"
                          strokeDasharray="3 3"
                        />
                        <text
                          x={padding.left - 8}
                          y={y + 4}
                          textAnchor="end"
                          className="fill-slate-500 font-mono text-[10px]"
                        >
                          {v.toFixed(2)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Shaded Area Under Curve */}
                  {points.length > 0 && (
                    <polygon
                      points={`
                        ${points[0].x},${padding.top + innerH}
                        ${points.map((p) => `${p.x},${p.y}`).join(' ')}
                        ${points[points.length - 1].x},${padding.top + innerH}
                      `}
                      fill="url(#areaGrad)"
                    />
                  )}

                  {/* Main Line */}
                  <polyline
                    fill="none"
                    stroke="url(#lineGrad)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={polylinePath}
                  />

                  {/* Interactive Points */}
                  {points.map((p, i) => (
                    <g
                      key={i}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredDataPoint(p)}
                      onClick={() => setHoveredDataPoint(p)}
                    >
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={hoveredDataPoint?.step === p.step ? 7 : 4.5}
                        fill={p.isCorrect ? '#22D3EE' : '#F87171'}
                        stroke="#0E131E"
                        strokeWidth="2"
                        className="transition-all"
                      />
                      {/* X Axis Label */}
                      <text
                        x={p.x}
                        y={chartHeight - 14}
                        textAnchor="middle"
                        className="fill-slate-400 font-mono text-[10px]"
                      >
                        Step {p.step}
                      </text>
                      <text
                        x={p.x}
                        y={chartHeight - 2}
                        textAnchor="middle"
                        className="fill-slate-500 font-mono text-[8px]"
                      >
                        +{p.factName}
                      </text>
                    </g>
                  ))}
                </svg>

                {/* Honest Scientific Annotation */}
                <div className="mt-3 p-3 rounded-xl bg-[#080B12] border border-[#1C2538] text-xs font-sans text-slate-300 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-[#22D3EE] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white font-mono uppercase text-[11px] block mb-0.5">
                      Epistemic Interpretation:
                    </strong>
                    Retrieval score measures representation cosine similarity (<MathView math="\cos(\hat{v}, v_{\text{cand}})" />), not a calibrated softmax probability. Decay (<MathView math={`\\lambda = ${retention}`} />) continuously lowers representation energy unless refreshed.
                  </div>
                </div>
              </div>

              {/* Data Point Telemetry Card */}
              <div className="rounded-xl bg-[#121826] border border-[#212C42] p-4 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-[#1E273A] pb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">
                    STEP TELEMETRY
                  </span>
                  <span className="text-[10px] text-cyan-400 bg-cyan-950/70 border border-cyan-800/60 px-1.5 py-0.5 rounded">
                    {hoveredDataPoint ? `Step ${hoveredDataPoint.step}` : 'Hover a node'}
                  </span>
                </div>

                {hoveredDataPoint ? (
                  <div className="space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Probed Fact:</span>
                      <strong className="text-white">France → Paris</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Decoded Output:</span>
                      <span
                        className={`px-1.5 py-0.5 rounded font-bold ${
                          hoveredDataPoint.isCorrect
                            ? 'text-emerald-300 bg-emerald-950/60 border border-emerald-800/60'
                            : 'text-rose-300 bg-rose-950/60 border border-rose-800/60'
                        }`}
                      >
                        {hoveredDataPoint.retrieved}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Ground Truth:</span>
                      <span className="text-white">Paris</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cosine Score:</span>
                      <strong className="text-cyan-300">{hoveredDataPoint.score.toFixed(4)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Top-1 Margin:</span>
                      <strong className="text-purple-300">{hoveredDataPoint.margin.toFixed(4)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Fact Written:</span>
                      <span className="text-slate-200 font-bold">+{hoveredDataPoint.factName}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-400 py-6 text-center italic font-sans text-xs">
                    Hover over or click any point along the curve to inspect step-level cosine margin and output.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 02: OUTCOME (DONUT CHART & SURVIVAL BREAKDOWN) */}
        {activeView === 'outcome' && (
          <div className="rounded-2xl border border-[#20293D] bg-[#0E131E] p-5 sm:p-7 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A2334] pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-white">
                  What Survived in Memory? (Final Outcome)
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Empirical classification of all {outcomeBreakdown.total} facts after sequential ingestion into {dimension}×{dimension} state.
                </p>
              </div>

              {/* Segment Filter */}
              <div className="flex items-center gap-1 bg-[#141A28] p-1 rounded-lg border border-[#222E44] text-xs font-mono">
                <button
                  onClick={() => setSelectedOutcomeSegment('all')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    selectedOutcomeSegment === 'all'
                      ? 'bg-slate-700 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({outcomeBreakdown.total})
                </button>
                <button
                  onClick={() => setSelectedOutcomeSegment('correct')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    selectedOutcomeSegment === 'correct'
                      ? 'bg-emerald-900/80 text-emerald-200 font-bold border border-emerald-700/60'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Correct ({outcomeBreakdown.correct.length})
                </button>
                <button
                  onClick={() => setSelectedOutcomeSegment('incorrect')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    selectedOutcomeSegment === 'incorrect'
                      ? 'bg-rose-900/80 text-rose-200 font-bold border border-rose-700/60'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Incorrect ({outcomeBreakdown.incorrect.length})
                </button>
                <button
                  onClick={() => setSelectedOutcomeSegment('unresolved')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    selectedOutcomeSegment === 'unresolved'
                      ? 'bg-amber-900/80 text-amber-200 font-bold border border-amber-700/60'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Unresolved ({outcomeBreakdown.unresolved.length})
                </button>
              </div>
            </div>

            {/* Donut Chart & List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Custom SVG Donut Chart */}
              <div className="flex flex-col items-center justify-center p-4">
                <div className="relative w-48 h-48">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {(() => {
                      const total = outcomeBreakdown.total || 1;
                      const cPct = outcomeBreakdown.correct.length / total;
                      const iPct = outcomeBreakdown.incorrect.length / total;
                      const uPct = outcomeBreakdown.unresolved.length / total;

                      const circ = 2 * Math.PI * 38; // r=38
                      const cDash = cPct * circ;
                      const iDash = iPct * circ;
                      const uDash = uPct * circ;

                      return (
                        <>
                          {/* Correct Arc */}
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            fill="transparent"
                            stroke="#10B981"
                            strokeWidth="12"
                            strokeDasharray={`${cDash} ${circ - cDash}`}
                            strokeDashoffset="0"
                            className="cursor-pointer transition-all hover:stroke-width-14"
                            onClick={() => setSelectedOutcomeSegment('correct')}
                          />
                          {/* Incorrect Arc */}
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            fill="transparent"
                            stroke="#F43F5E"
                            strokeWidth="12"
                            strokeDasharray={`${iDash} ${circ - iDash}`}
                            strokeDashoffset={`${-cDash}`}
                            className="cursor-pointer transition-all hover:stroke-width-14"
                            onClick={() => setSelectedOutcomeSegment('incorrect')}
                          />
                          {/* Unresolved Arc */}
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            fill="transparent"
                            stroke="#F59E0B"
                            strokeWidth="12"
                            strokeDasharray={`${uDash} ${circ - uDash}`}
                            strokeDashoffset={`${-(cDash + iDash)}`}
                            className="cursor-pointer transition-all hover:stroke-width-14"
                            onClick={() => setSelectedOutcomeSegment('unresolved')}
                          />
                        </>
                      );
                    })()}
                  </svg>

                  {/* Centered Donut Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-mono font-bold text-white">
                      {outcomeBreakdown.total}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      TOTAL QUERIES
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-4 text-[11px] font-mono text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Correct ({Math.round((outcomeBreakdown.correct.length / (outcomeBreakdown.total || 1)) * 100)}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>Incorrect ({Math.round((outcomeBreakdown.incorrect.length / (outcomeBreakdown.total || 1)) * 100)}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>Unresolved ({Math.round((outcomeBreakdown.unresolved.length / (outcomeBreakdown.total || 1)) * 100)}%)</span>
                  </div>
                </div>
              </div>

              {/* Filtered Fact Cards */}
              <div className="md:col-span-2 space-y-2 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                {finalStep?.queryResults
                  .filter((qr) => {
                    if (selectedOutcomeSegment === 'correct') return qr.isCorrect;
                    if (selectedOutcomeSegment === 'incorrect') return !qr.isCorrect && qr.score > 0.15;
                    if (selectedOutcomeSegment === 'unresolved') return !qr.isCorrect && qr.score <= 0.15;
                    return true;
                  })
                  .map((qr, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs font-mono ${
                        qr.isCorrect
                          ? 'bg-[#0E1A18] border-emerald-800/40 text-emerald-200'
                          : qr.score > 0.15
                          ? 'bg-[#1D1115] border-rose-800/40 text-rose-200'
                          : 'bg-[#1B160E] border-amber-800/40 text-amber-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {qr.isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : qr.score > 0.15 ? (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        )}
                        <span className="text-white font-bold">{qr.fact.key}</span>
                        <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">
                          Expected: <strong className="text-white">{qr.fact.value}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">OUTPUT</span>
                          <span className="font-bold text-white">{qr.retrievedVal}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">SIM</span>
                          <span className="text-cyan-300 font-bold">{qr.score.toFixed(3)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Honest Annotation */}
            <div className="p-3 rounded-xl bg-[#080B12] border border-[#1C2538] text-xs font-sans text-slate-300 flex items-start gap-2">
              <Info className="w-4 h-4 text-[#22D3EE] shrink-0 mt-0.5" />
              <div>
                <strong>Scientific Grounding:</strong> Decoded via <MathView math="\operatorname{argmax}_v \operatorname{sim}(\hat{v}, v)" /> against candidate value representations. Collisions and cross-talk directly stem from finite coordinate dimension <MathView math={`D=${dimension}`} />.
              </div>
            </div>
          </div>
        )}

        {/* VIEW 03: MECHANISM (FLOWCHART OF HOW FACTS BECOME MEMORY) */}
        {activeView === 'mechanism' && (
          <div className="rounded-2xl border border-[#20293D] bg-[#0E131E] p-5 sm:p-7 space-y-6">
            <div className="border-b border-[#1A2334] pb-4">
              <h3 className="text-base sm:text-lg font-serif font-bold text-white">
                How Does One Fact Become Memory? (The Computational Graph)
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Step through each mathematical transformation from symbolic fact to associative matrix superposition and linear probe readout.
              </p>
            </div>

            {/* Horizontal / Responsive Interactive Flowchart */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5">
              {mechanismStages.map((stage) => {
                const isActive = activeMechanismStep === stage.id;
                return (
                  <button
                    key={stage.id}
                    onClick={() => setActiveMechanismStep(stage.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer ${
                      isActive
                        ? 'border-cyan-400 bg-cyan-950/70 ring-1 ring-cyan-500/50 text-white shadow-lg'
                        : 'border-[#1E273A] bg-[#111724] text-slate-400 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider block font-bold" style={{ color: stage.color }}>
                        {stage.title}
                      </span>
                      <div className="text-xs font-mono font-semibold text-white mt-1">
                        <MathView math={stage.symbol} />
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 self-end">
                      Stage {stage.id}/7
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Detailed Stage Deep Dive Card */}
            {(() => {
              const currentStage = mechanismStages.find((s) => s.id === activeMechanismStep) || mechanismStages[0];
              return (
                <div className="p-5 rounded-xl bg-[#090D16] border border-cyan-800/40 space-y-3 font-mono">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1C2538] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-cyan-400 uppercase">
                        ACTIVE STAGE {currentStage.id}:
                      </span>
                      <span className="text-sm font-bold text-white">
                        {currentStage.title}
                      </span>
                    </div>

                    <div className="text-xs text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded border border-cyan-700/60 font-bold">
                      <MathView math={currentStage.math} />
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {currentStage.desc}
                  </p>

                  <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
                    <button
                      disabled={activeMechanismStep <= 1}
                      onClick={() => setActiveMechanismStep((s) => Math.max(1, s - 1))}
                      className="px-3 py-1 rounded bg-[#131A28] hover:bg-[#1B2436] border border-[#232F46] disabled:opacity-40"
                    >
                      ← Previous Step
                    </button>
                    <span>Click nodes above to inspect transformation</span>
                    <button
                      disabled={activeMechanismStep >= 7}
                      onClick={() => setActiveMechanismStep((s) => Math.min(7, s + 1))}
                      className="px-3 py-1 rounded bg-[#131A28] hover:bg-[#1B2436] border border-[#232F46] text-cyan-400 disabled:opacity-40"
                    >
                      Next Step →
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* STATE CHANGE MINI-GRAPH: COORDINATE DELTAS ΔM_t */}
        <div className="p-5 sm:p-6 rounded-2xl border border-[#20293D] bg-[#0E131E] space-y-4 font-mono text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1A2334] pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white uppercase text-xs">
                State Coordinate Deltas (<MathView math="\Delta M_t = M_t - M_{t-1}" />)
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Final Ingestion Step: +{finalStep?.factWritten.key} → {finalStep?.factWritten.value}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-[#0A0E18] border border-[#1B2336] space-y-1">
              <span className="text-[10px] text-emerald-400 font-bold uppercase block">
                LARGEST POSITIVE SHIFT
              </span>
              <div className="text-sm font-bold text-emerald-300">
                +{finalStep?.maxPosDelta.val.toFixed(4)}
              </div>
              <div className="text-[10px] text-slate-400">
                Coordinate #{finalStep?.maxPosDelta.index} (Constructive binding)
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#0A0E18] border border-[#1B2336] space-y-1">
              <span className="text-[10px] text-rose-400 font-bold uppercase block">
                LARGEST NEGATIVE SHIFT
              </span>
              <div className="text-sm font-bold text-rose-300">
                {finalStep?.maxNegDelta.val.toFixed(4)}
              </div>
              <div className="text-[10px] text-slate-400">
                Coordinate #{finalStep?.maxNegDelta.index} (Destructive attenuation)
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#0A0E18] border border-[#1B2336] space-y-1">
              <span className="text-[10px] text-cyan-400 font-bold uppercase block">
                NEAR-ZERO COORDINATES
              </span>
              <div className="text-sm font-bold text-cyan-300">
                {finalStep?.nearZeroCount} / {dimension * dimension}
              </div>
              <div className="text-[10px] text-slate-400">
                Coordinates unaffected (|Δ| &lt; 0.005)
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-sans leading-relaxed pt-1">
            <strong>Scientific Note:</strong> Latent dimensions are continuous mathematical coordinates in <MathView math="\mathbb{R}^{D \times D}" /> without human-interpretable single-neuron labels. Interference happens because information is distributed across these superposed linear coordinates.
          </div>
        </div>
      </div>
    </section>
  );
};

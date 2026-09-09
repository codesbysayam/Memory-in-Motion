import React, { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp,
  PieChart as PieChartIcon,
  GitCommit,
  ArrowRight,
  Info,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Activity,
} from 'lucide-react';
import { Fact, CANONICAL_FACTS, createAssociativeMemory, cosine, vector } from '../models/associativeMemory';
import { MathView } from './ui/MathView';
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
      color: '#6842C2',
    },
    {
      id: 2,
      title: '2. VECTOR ENCODE',
      symbol: 'k_t, v_t \\in \\mathbb{R}^D',
      desc: 'Embedding projections generate continuous coordinate vectors.',
      math: 'k_t = W_k x_t, \\quad v_t = W_v y_t',
      color: '#2E689C',
    },
    {
      id: 3,
      title: '3. OUTER-PRODUCT WRITE',
      symbol: '\\Delta M_t = \\eta k_t v_t^T',
      desc: 'Dense D×D outer-product binds key coordinates directly to value coordinates.',
      math: '\\Delta M_t = \\eta \\cdot (k_t v_t^T)',
      color: '#167C80',
    },
    {
      id: 4,
      title: '4. STATE RECURRENCE',
      symbol: 'M_t = \\lambda M_{t-1} + \\Delta M_t',
      desc: 'Prior matrix decays by factor λ; new rank-1 matrix superposes on top.',
      math: 'M_t = \\lambda M_{t-1} + \\Delta M_t',
      color: '#247A4B',
    },
    {
      id: 5,
      title: '5. SUPERPOSITION & DRIFT',
      symbol: '\\sum_i k_i v_i^T',
      desc: 'Multiple facts share the exact same D×D numbers, causing gradual interference.',
      math: 'M_T = \\sum_{\\tau=1}^T \\lambda^{T-\\tau} \\eta k_\\tau v_\\tau^T',
      color: '#A46622',
    },
    {
      id: 6,
      title: '6. QUERY PROBE',
      symbol: 'q^T M_t',
      desc: 'Query vector excites the associative matrix via linear vector-matrix multiplication.',
      math: '\\hat{v} = q^T M_t',
      color: '#9B4174',
    },
    {
      id: 7,
      title: '7. COSINE DECODE',
      symbol: '\\operatorname{argmax}_v \\cos(\\hat{v}, v)',
      desc: 'Decoded answer is selected by maximum similarity against known vocabularies.',
      math: '\\hat{y} = \\operatorname{argmax}_v \\operatorname{sim}(\\hat{v}, v)',
      color: '#167C80',
    },
  ];

  return (
    <section id="section-measure" className="scroll-mt-20 border-b border-[#E5E0D8] bg-[#FBF9F5] py-16 text-[#151515]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 space-y-10">
        {/* Editorial Section Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded bg-[#F3EFFF] text-[#6842C2] border border-[#E2D8FA] font-bold">
              04 / MEASURE
            </span>
            <span className="text-xs font-mono text-[#716F68]">
              STATE PERSISTENCE & ANALYTICS
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-serif tracking-tight text-[#151515] font-normal">
            Watch memory change.
          </h2>

          <p className="text-sm sm:text-base text-[#52504A] font-sans max-w-3xl leading-relaxed">
            The state is fixed in size (<MathView math={`D \\times D = ${dimension} \\times ${dimension}`} /> coordinates). What changes is what survives inside it. Follow the empirical trajectory of retained memories as new facts arrive.
          </p>
        </div>

        {/* View Selection Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-2 rounded-2xl bg-[#FFFFFF] border border-[#E5E0D8] shadow-xs">
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="text-[#716F68] px-2 py-1 text-[11px] uppercase tracking-wider hidden sm:inline-block">
              ONE EXPERIMENT — THREE VIEWS:
            </span>
            <button
              onClick={() => setActiveView('time')}
              className={`px-3.5 py-1.5 rounded-xl font-medium transition-all flex items-center gap-2 cursor-pointer ${
                activeView === 'time'
                  ? 'bg-[#F3EFFF] text-[#6842C2] border border-[#E2D8FA] font-bold shadow-xs'
                  : 'text-[#716F68] hover:text-[#151515] hover:bg-[#FAF8F5]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>View 01: Time (Line Graph)</span>
            </button>
            <button
              onClick={() => setActiveView('outcome')}
              className={`px-3.5 py-1.5 rounded-xl font-medium transition-all flex items-center gap-2 cursor-pointer ${
                activeView === 'outcome'
                  ? 'bg-[#F3EFFF] text-[#6842C2] border border-[#E2D8FA] font-bold shadow-xs'
                  : 'text-[#716F68] hover:text-[#151515] hover:bg-[#FAF8F5]'
              }`}
            >
              <PieChartIcon className="w-3.5 h-3.5" />
              <span>View 02: Outcome (Donut Chart)</span>
            </button>
            <button
              onClick={() => setActiveView('mechanism')}
              className={`px-3.5 py-1.5 rounded-xl font-medium transition-all flex items-center gap-2 cursor-pointer ${
                activeView === 'mechanism'
                  ? 'bg-[#F3EFFF] text-[#6842C2] border border-[#E2D8FA] font-bold shadow-xs'
                  : 'text-[#716F68] hover:text-[#151515] hover:bg-[#FAF8F5]'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>View 03: Mechanism (Flowchart)</span>
            </button>
          </div>

          {/* Interactive Parameters Quick Bar */}
          <div className="flex items-center gap-3 font-mono text-xs text-[#52504A] px-2">
            <span className="text-[11px] text-[#716F68]">λ: {retention.toFixed(2)}</span>
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
              className="w-20 sm:w-28 accent-[#6842C2] cursor-pointer"
              title="Retention attenuation factor λ"
            />
            <span className="text-[11px] text-[#716F68]">D: {dimension}</span>
          </div>
        </div>

        {/* VIEW 01: TIME (RETRIEVAL ACROSS SEQUENCE) */}
        {activeView === 'time' && (
          <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-5 sm:p-7 space-y-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EAE6DF] pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-[#151515] flex items-center gap-2">
                  <span>Retrieval Performance Across the Sequence</span>
                  <span className="text-xs font-mono font-normal text-[#167C80] bg-[#EDF7F7] px-2.5 py-0.5 rounded border border-[#CFE8E8]">
                    Fact #1: France → Paris
                  </span>
                </h3>
                <p className="text-xs text-[#716F68] font-sans mt-0.5">
                  Track how Fact #1 (&ldquo;France → Paris&rdquo;) decays and interferes as 5 subsequent facts are written.
                </p>
              </div>

              {/* Metric Selector */}
              <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#EAE6DF] text-xs font-mono">
                <button
                  onClick={() => setMetricMode('retrievalScore')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    metricMode === 'retrievalScore'
                      ? 'bg-[#FFFFFF] text-[#151515] border border-[#D8D4CB] font-bold shadow-xs'
                      : 'text-[#716F68] hover:text-[#151515]'
                  }`}
                >
                  Retrieval Score
                </button>
                <button
                  onClick={() => setMetricMode('top1Margin')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    metricMode === 'top1Margin'
                      ? 'bg-[#FFFFFF] text-[#151515] border border-[#D8D4CB] font-bold shadow-xs'
                      : 'text-[#716F68] hover:text-[#151515]'
                  }`}
                >
                  Top-1 Margin
                </button>
                <button
                  onClick={() => setMetricMode('stateSimilarity')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    metricMode === 'stateSimilarity'
                      ? 'bg-[#FFFFFF] text-[#151515] border border-[#D8D4CB] font-bold shadow-xs'
                      : 'text-[#716F68] hover:text-[#151515]'
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
                      <stop offset="0%" stopColor="#167C80" />
                      <stop offset="100%" stopColor="#6842C2" />
                    </linearGradient>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#167C80" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#167C80" stopOpacity="0.0" />
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
                          stroke="#EAE6DF"
                          strokeDasharray="3 3"
                        />
                        <text
                          x={padding.left - 8}
                          y={y + 4}
                          textAnchor="end"
                          className="fill-[#716F68] font-mono text-[10px]"
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
                    strokeWidth="2.5"
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
                        r={hoveredDataPoint?.step === p.step ? 6.5 : 4.5}
                        fill={p.isCorrect ? '#167C80' : '#B64235'}
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        className="transition-all"
                      />
                      {/* X Axis Label */}
                      <text
                        x={p.x}
                        y={chartHeight - 14}
                        textAnchor="middle"
                        className="fill-[#716F68] font-mono text-[10px]"
                      >
                        Step {p.step}
                      </text>
                      <text
                        x={p.x}
                        y={chartHeight - 2}
                        textAnchor="middle"
                        className="fill-[#151515] font-mono text-[9px] font-semibold"
                      >
                        +{p.factName}
                      </text>
                    </g>
                  ))}
                </svg>

                {/* Honest Scientific Annotation */}
                <div className="mt-3 p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-sans text-[#52504A] flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-[#167C80] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#151515] font-mono uppercase text-[11px] block mb-0.5">
                      Epistemic Interpretation:
                    </strong>
                    Retrieval score measures representation cosine similarity (<MathView math="\cos(\hat{v}, v_{\text{cand}})" />), not a calibrated softmax probability. Decay (<MathView math={`\\lambda = ${retention}`} />) continuously lowers representation energy unless refreshed.
                  </div>
                </div>
              </div>

              {/* Data Point Telemetry Card */}
              <div className="rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] p-4 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-2">
                  <span className="text-[11px] font-bold text-[#716F68] uppercase tracking-wider">
                    STEP TELEMETRY
                  </span>
                  <span className="text-[10px] text-[#167C80] bg-[#EDF7F7] border border-[#CFE8E8] px-2 py-0.5 rounded font-bold">
                    {hoveredDataPoint ? `Step ${hoveredDataPoint.step}` : 'Hover a node'}
                  </span>
                </div>

                {hoveredDataPoint ? (
                  <div className="space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-[#716F68]">Probed Fact:</span>
                      <strong className="text-[#151515]">France → Paris</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#716F68]">Decoded Output:</span>
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-xs ${
                          hoveredDataPoint.isCorrect
                            ? 'text-[#247A4B] bg-[#EDF8F2] border border-[#CDEEDB]'
                            : 'text-[#B64235] bg-[#FDF2F0] border border-[#F7D3CF]'
                        }`}
                      >
                        {hoveredDataPoint.retrieved}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#716F68]">Ground Truth:</span>
                      <span className="text-[#151515] font-medium">Paris</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#716F68]">Cosine Score:</span>
                      <strong className="text-[#167C80]">{hoveredDataPoint.score.toFixed(4)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#716F68]">Top-1 Margin:</span>
                      <strong className="text-[#6842C2]">{hoveredDataPoint.margin.toFixed(4)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#716F68]">Fact Written:</span>
                      <span className="text-[#151515] font-bold">+{hoveredDataPoint.factName}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-[#716F68] py-8 text-center italic font-sans text-xs">
                    Hover over or click any point along the curve to inspect step-level cosine margin and output.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 02: OUTCOME (DONUT CHART & SURVIVAL BREAKDOWN) */}
        {activeView === 'outcome' && (
          <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-5 sm:p-7 space-y-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EAE6DF] pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-[#151515]">
                  What Survived in Memory? (Final Outcome)
                </h3>
                <p className="text-xs text-[#716F68] font-sans mt-0.5">
                  Empirical classification of all {outcomeBreakdown.total} facts after sequential ingestion into {dimension}×{dimension} state.
                </p>
              </div>

              {/* Segment Filter */}
              <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#EAE6DF] text-xs font-mono">
                <button
                  onClick={() => setSelectedOutcomeSegment('all')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    selectedOutcomeSegment === 'all'
                      ? 'bg-[#FFFFFF] text-[#151515] font-bold border border-[#D8D4CB] shadow-xs'
                      : 'text-[#716F68] hover:text-[#151515]'
                  }`}
                >
                  All ({outcomeBreakdown.total})
                </button>
                <button
                  onClick={() => setSelectedOutcomeSegment('correct')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    selectedOutcomeSegment === 'correct'
                      ? 'bg-[#EDF8F2] text-[#247A4B] font-bold border border-[#CDEEDB]'
                      : 'text-[#716F68] hover:text-[#151515]'
                  }`}
                >
                  Correct ({outcomeBreakdown.correct.length})
                </button>
                <button
                  onClick={() => setSelectedOutcomeSegment('incorrect')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    selectedOutcomeSegment === 'incorrect'
                      ? 'bg-[#FDF2F0] text-[#B64235] font-bold border border-[#F7D3CF]'
                      : 'text-[#716F68] hover:text-[#151515]'
                  }`}
                >
                  Incorrect ({outcomeBreakdown.incorrect.length})
                </button>
                <button
                  onClick={() => setSelectedOutcomeSegment('unresolved')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    selectedOutcomeSegment === 'unresolved'
                      ? 'bg-[#FDF8EE] text-[#A46622] font-bold border border-[#F5E2C4]'
                      : 'text-[#716F68] hover:text-[#151515]'
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
                            stroke="#247A4B"
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
                            stroke="#B64235"
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
                            stroke="#A46622"
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
                    <span className="text-3xl font-mono font-bold text-[#151515]">
                      {outcomeBreakdown.total}
                    </span>
                    <span className="text-[10px] font-mono text-[#716F68] uppercase tracking-wider font-bold">
                      TOTAL QUERIES
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-4 text-[11px] font-mono text-[#52504A]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#247A4B]" />
                    <span>Correct ({Math.round((outcomeBreakdown.correct.length / (outcomeBreakdown.total || 1)) * 100)}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#B64235]" />
                    <span>Incorrect ({Math.round((outcomeBreakdown.incorrect.length / (outcomeBreakdown.total || 1)) * 100)}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#A46622]" />
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
                          ? 'bg-[#EDF8F2] border-[#CDEEDB] text-[#247A4B]'
                          : qr.score > 0.15
                          ? 'bg-[#FDF2F0] border-[#F7D3CF] text-[#B64235]'
                          : 'bg-[#FDF8EE] border-[#F5E2C4] text-[#A46622]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {qr.isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-[#247A4B] shrink-0" />
                        ) : qr.score > 0.15 ? (
                          <XCircle className="w-4 h-4 text-[#B64235] shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-[#A46622] shrink-0" />
                        )}
                        <span className="text-[#151515] font-bold">{qr.fact.key}</span>
                        <ArrowRight className="w-3 h-3 text-[#716F68] shrink-0" />
                        <span className="truncate">
                          Expected: <strong className="text-[#151515]">{qr.fact.value}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-[10px] text-[#716F68] block">OUTPUT</span>
                          <span className="font-bold text-[#151515]">{qr.retrievedVal}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-[#716F68] block">SIM</span>
                          <span className="text-[#167C80] font-bold">{qr.score.toFixed(3)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Honest Annotation */}
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-sans text-[#52504A] flex items-start gap-2">
              <Info className="w-4 h-4 text-[#167C80] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#151515]">Scientific Grounding:</strong> Decoded via <MathView math="\operatorname{argmax}_v \operatorname{sim}(\hat{v}, v)" /> against candidate value representations. Collisions and cross-talk directly stem from finite coordinate dimension <MathView math={`D=${dimension}`} />.
              </div>
            </div>
          </div>
        )}

        {/* VIEW 03: MECHANISM (FLOWCHART OF HOW FACTS BECOME MEMORY) */}
        {activeView === 'mechanism' && (
          <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-5 sm:p-7 space-y-6 shadow-xs">
            <div className="border-b border-[#EAE6DF] pb-4">
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#151515]">
                How Does One Fact Become Memory? (The Computational Graph)
              </h3>
              <p className="text-xs text-[#716F68] font-sans mt-0.5">
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
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer ${
                      isActive
                        ? 'border-[#6842C2] bg-[#F3EFFF] ring-1 ring-[#6842C2]/40 text-[#151515] shadow-xs'
                        : 'border-[#EAE6DF] bg-[#FAF8F5] text-[#716F68] hover:text-[#151515] hover:border-[#D8D4CB]'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider block font-bold" style={{ color: stage.color }}>
                        {stage.title}
                      </span>
                      <div className="text-xs font-mono font-semibold text-[#151515] mt-1">
                        <MathView math={stage.symbol} />
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-[#716F68] self-end">
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
                <div className="p-5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-3 font-mono">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EAE6DF] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#6842C2] uppercase">
                        ACTIVE STAGE {currentStage.id}:
                      </span>
                      <span className="text-sm font-bold text-[#151515]">
                        {currentStage.title}
                      </span>
                    </div>

                    <div className="text-xs text-[#6842C2] bg-[#F3EFFF] px-3 py-1 rounded-lg border border-[#E2D8FA] font-bold">
                      <MathView math={currentStage.math} />
                    </div>
                  </div>

                  <p className="text-xs text-[#52504A] font-sans leading-relaxed">
                    {currentStage.desc}
                  </p>

                  <div className="flex items-center justify-between pt-2 text-xs text-[#716F68]">
                    <button
                      disabled={activeMechanismStep <= 1}
                      onClick={() => setActiveMechanismStep((s) => Math.max(1, s - 1))}
                      className="px-3 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#FAF8F5] border border-[#E5E0D8] text-[#151515] disabled:opacity-40 cursor-pointer"
                    >
                      ← Previous Step
                    </button>
                    <span>Click nodes above to inspect transformation</span>
                    <button
                      disabled={activeMechanismStep >= 7}
                      onClick={() => setActiveMechanismStep((s) => Math.min(7, s + 1))}
                      className="px-3 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#FAF8F5] border border-[#E5E0D8] text-[#6842C2] font-bold disabled:opacity-40 cursor-pointer"
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
        <div className="p-5 sm:p-6 rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] space-y-4 font-mono text-xs shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6DF] pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#167C80]" />
              <span className="font-bold text-[#151515] uppercase text-xs">
                State Coordinate Deltas (<MathView math="\Delta M_t = M_t - M_{t-1}" />)
              </span>
            </div>
            <span className="text-[11px] text-[#716F68]">
              Final Ingestion Step: +{finalStep?.factWritten.key} → {finalStep?.factWritten.value}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-[#EDF8F2] border border-[#CDEEDB] space-y-1">
              <span className="text-[10px] text-[#247A4B] font-bold uppercase tracking-wider block">
                LARGEST POSITIVE SHIFT
              </span>
              <div className="text-sm font-bold text-[#247A4B]">
                +{finalStep?.maxPosDelta.val.toFixed(4)}
              </div>
              <div className="text-[10px] text-[#52504A]">
                Coordinate #{finalStep?.maxPosDelta.index} (Constructive binding)
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FDF2F0] border border-[#F7D3CF] space-y-1">
              <span className="text-[10px] text-[#B64235] font-bold uppercase tracking-wider block">
                LARGEST NEGATIVE SHIFT
              </span>
              <div className="text-sm font-bold text-[#B64235]">
                {finalStep?.maxNegDelta.val.toFixed(4)}
              </div>
              <div className="text-[10px] text-[#52504A]">
                Coordinate #{finalStep?.maxNegDelta.index} (Destructive attenuation)
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-1">
              <span className="text-[10px] text-[#167C80] font-bold uppercase tracking-wider block">
                NEAR-ZERO COORDINATES
              </span>
              <div className="text-sm font-bold text-[#167C80]">
                {finalStep?.nearZeroCount} / {dimension * dimension}
              </div>
              <div className="text-[10px] text-[#52504A]">
                Coordinates unaffected (|Δ| &lt; 0.005)
              </div>
            </div>
          </div>

          <div className="text-[11px] text-[#716F68] font-sans leading-relaxed pt-1">
            <strong className="text-[#151515]">Scientific Note:</strong> Latent dimensions are continuous mathematical coordinates in <MathView math="\mathbb{R}^{D \times D}" /> without human-interpretable single-neuron labels. Interference happens because information is distributed across these superposed linear coordinates.
          </div>
        </div>
      </div>
    </section>
  );
};

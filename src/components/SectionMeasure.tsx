import React, { useState, useMemo, useEffect } from 'react';
import {
  Info,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { Fact, createAssociativeMemory, cosine, vector } from '../models/associativeMemory';
import { MathView } from './ui/MathView';
import { GlossaryTerm } from './GlossaryTerm';
import { markMilestoneCompleted } from '../utils/progressTracker';
import { FrobeniusDriftExperiment } from './FrobeniusDriftExperiment';
import { FigureCaption } from './essay/FigureCaption';
import { DataFallbackTable } from './essay/DataFallbackTable';

export const SectionMeasure: React.FC = () => {
  const [activeView, setActiveView] = useState<'time' | 'outcome' | 'mechanism' | 'frobenius'>('time');
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

  // Listen to hash changes for direct tab activation
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash.includes('frobenius')) {
        setActiveView('frobenius');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
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
      title: '1. Input pair',
      symbol: '(k_t, v_t)',
      desc: 'Fact arrives as symbolic pair (France → Paris).',
      math: '\\text{input} = (\\text{key}, \\text{value})',
      colorVar: 'var(--accent-blue-text)',
    },
    {
      id: 2,
      title: '2. Vector encode',
      symbol: 'k_t, v_t \\in \\mathbb{R}^D',
      desc: 'Embedding projections generate continuous coordinate vectors.',
      math: 'k_t = W_k x_t, \\quad v_t = W_v y_t',
      colorVar: 'var(--accent-blue-text)',
    },
    {
      id: 3,
      title: '3. Outer-product write',
      symbol: '\\Delta M_t = \\eta k_t v_t^T',
      desc: 'Dense D×D outer-product binds key coordinates directly to value coordinates.',
      math: '\\Delta M_t = \\eta \\cdot (k_t v_t^T)',
      colorVar: 'var(--accent-green-text)',
    },
    {
      id: 4,
      title: '4. State recurrence',
      symbol: 'M_t = \\lambda M_{t-1} + \\Delta M_t',
      desc: 'Prior matrix decays by factor λ; new rank-1 matrix superposes on top.',
      math: 'M_t = \\lambda M_{t-1} + \\Delta M_t',
      colorVar: 'var(--accent-green-text)',
    },
    {
      id: 5,
      title: '5. Superposition & drift',
      symbol: '\\sum_i k_i v_i^T',
      desc: 'Multiple facts share the exact same D×D numbers, causing gradual interference.',
      math: 'M_T = \\sum_{\\tau=1}^T \\lambda^{T-\\tau} \\eta k_\\tau v_\\tau^T',
      colorVar: 'var(--accent-yellow-text)',
    },
    {
      id: 6,
      title: '6. Query probe',
      symbol: 'q^T M_t',
      desc: 'Query vector excites the associative matrix via linear vector-matrix multiplication.',
      math: '\\hat{v} = q^T M_t',
      colorVar: 'var(--accent-pink-text)',
    },
    {
      id: 7,
      title: '7. Cosine decode',
      symbol: '\\operatorname{argmax}_v \\cos(\\hat{v}, v)',
      desc: 'Decoded answer is selected by maximum similarity against known vocabularies.',
      math: '\\hat{y} = \\operatorname{argmax}_v \\operatorname{sim}(\\hat{v}, v)',
      colorVar: 'var(--accent-blue-text)',
    },
  ];

  return (
    <section id="section-measure" className="scroll-mt-20 w-full space-y-8 text-[var(--text-primary)]">
      <div id="section-measure-curves" className="scroll-mt-24" />
      <div className="w-full space-y-8">
        {/* Editorial Section Header */}
        <div className="space-y-3">
          <div className="essay-eyebrow">
            <span>04 · Measure</span>
            <span aria-hidden="true">·</span>
            <span>State persistence &amp; empirical analytics</span>
          </div>

          <h2 className="essay-section-title">
            Watch a single memory fade as new facts arrive.
          </h2>

          <p className="essay-lead">
            The <GlossaryTerm term="recurrent state">recurrent state</GlossaryTerm> stays fixed at <MathView math={`D \\times D = ${dimension} \\times ${dimension}`} /> coordinates. What shifts is what survives inside it. Track how the first stored fact (&ldquo;France → Paris&rdquo;) degrades over five subsequent writes.
          </p>
        </div>

        {/* Hairline View Selection & Parameter Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--mm-rule)] pb-1">
          <div className="flex flex-wrap items-center gap-1 font-sans text-xs">
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--mm-muted)] pr-3 pb-2 hidden sm:inline-block">
              One trial, four views:
            </span>
            {([
              { key: 'time', label: '01: Time Trail' },
              { key: 'outcome', label: '02: Outcome Split' },
              { key: 'mechanism', label: '03: Matrix Flow' },
              { key: 'frobenius', label: '04: Frobenius Drift' },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveView(tab.key)}
                className={`px-3 pb-2 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap border-b-2 -mb-[5px] ${
                  activeView === tab.key
                    ? 'border-[var(--mm-signal)] text-[var(--mm-ink)] font-semibold'
                    : 'border-transparent text-[var(--mm-muted)] hover:text-[var(--mm-ink)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Inline Parameter Control */}
          <div className="flex items-center gap-3 font-mono text-xs text-[var(--mm-muted)] pb-2 tabular-nums">
            <label htmlFor="measure-retention-slider" className="text-xs">
              λ = <strong className="text-[var(--mm-ink)]">{retention.toFixed(2)}</strong>
            </label>
            <input
              id="measure-retention-slider"
              type="range"
              min="0.70"
              max="1.0"
              step="0.02"
              value={retention}
              onChange={(e) => {
                setRetention(parseFloat(e.target.value));
                markMilestoneCompleted('adjust_params');
              }}
              className="w-20 sm:w-28 accent-[var(--mm-signal)] cursor-pointer"
              title="Retention attenuation factor λ"
            />
            <span className="text-xs">D = {dimension}</span>
          </div>
        </div>

        {/* VIEW 01: TIME (RETRIEVAL ACROSS SEQUENCE) */}
        {activeView === 'time' && (
          <figure className="essay-figure-stage p-5 sm:p-7 space-y-6">
            <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[var(--mm-rule)] pb-4">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--mm-signal)] font-semibold block mb-1">
                  Fig. 4.1 · Probing Fact #1 (&ldquo;France → Paris&rdquo;)
                </span>
                <h3 className="text-lg sm:text-xl font-serif font-normal text-[var(--mm-ink)]">
                  Retrieval strength falls as new facts superpose onto the same coordinates
                </h3>
              </div>

              {/* Metric Selector */}
              <div className="flex items-center border-b border-[var(--mm-rule)] text-xs font-sans">
                {([
                  { key: 'retrievalScore', label: 'Retrieval score' },
                  { key: 'top1Margin', label: 'Top-1 margin' },
                  { key: 'stateSimilarity', label: 'State overlap' },
                ] as const).map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setMetricMode(m.key)}
                    className={`px-3 pb-1.5 transition-colors cursor-pointer whitespace-nowrap border-b-2 -mb-[1px] ${
                      metricMode === m.key
                        ? 'border-[var(--mm-signal)] text-[var(--mm-ink)] font-semibold'
                        : 'border-transparent text-[var(--mm-muted)] hover:text-[var(--mm-ink)]'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
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
                      <stop offset="0%" stopColor="var(--color-accent)" />
                      <stop offset="100%" stopColor="var(--color-success)" />
                    </linearGradient>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.0" />
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
                          stroke="var(--border)"
                          strokeDasharray="3 3"
                        />
                        <text
                          x={padding.left - 8}
                          y={y + 4}
                          textAnchor="end"
                          fill="var(--text-secondary)"
                          className="font-mono text-xs tabular-nums"
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
                        fill={p.isCorrect ? 'var(--color-success)' : 'var(--color-danger)'}
                        stroke="var(--surface)"
                        strokeWidth="2"
                        className="transition-all"
                      />
                      {/* X Axis Label */}
                      <text
                        x={p.x}
                        y={chartHeight - 16}
                        textAnchor="middle"
                        fill="var(--text-muted)"
                        className="font-mono text-xs tabular-nums"
                      >
                        Step {p.step}
                      </text>
                      <text
                        x={p.x}
                        y={chartHeight - 3}
                        textAnchor="middle"
                        fill="var(--text-primary)"
                        className="font-mono text-xs font-semibold"
                      >
                        +{p.factName}
                      </text>
                    </g>
                  ))}
                </svg>

                {/* Honest Scientific Annotation */}
                <div className="research-callout mt-3 text-xs font-sans text-[var(--text-secondary)] flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-[var(--accent-blue-text)] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[var(--text-primary)] font-semibold block mb-0.5">
                      Epistemic interpretation
                    </strong>
                    Retrieval score measures representation cosine similarity (<MathView math="\cos(\hat{v}, v_{\text{cand}})" />), not a calibrated softmax probability. Decay (<MathView math={`\\lambda = ${retention}`} />) continuously lowers representation energy unless refreshed.
                  </div>
                </div>
              </div>

                {/* Step telemetry */}
              <div className="border-t lg:border-t-0 lg:border-l border-[var(--mm-rule)] pt-4 lg:pt-0 lg:pl-6 space-y-3 font-mono text-xs tabular-nums">
                <div className="flex items-center justify-between border-b border-[var(--mm-rule)] pb-2">
                  <span className="font-sans text-xs font-semibold text-[var(--mm-muted)]">
                    Point inspection
                  </span>
                  <span className="text-xs text-[var(--mm-signal)] font-semibold">
                    {hoveredDataPoint ? `Step ${hoveredDataPoint.step}` : 'Hover or click node'}
                  </span>
                </div>

                {hoveredDataPoint ? (
                  <div className="space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-[var(--mm-muted)]">Probed fact:</span>
                      <strong className="text-[var(--mm-ink)]">France → Paris</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--mm-muted)]">Decoded output:</span>
                      <span className={`font-semibold ${hoveredDataPoint.isCorrect ? 'text-[var(--accent-green-text)]' : 'text-[var(--mm-coral)]'}`}>
                        {hoveredDataPoint.retrieved}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--mm-muted)]">Cosine score:</span>
                      <strong className="text-[var(--mm-signal)]">{hoveredDataPoint.score.toFixed(4)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--mm-muted)]">Top-1 margin:</span>
                      <strong className="text-[var(--accent-green-text)]">{hoveredDataPoint.margin.toFixed(4)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--mm-muted)]">Fact written:</span>
                      <span className="text-[var(--mm-ink)] font-semibold">+{hoveredDataPoint.factName}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-[var(--mm-rule)]">
                      <span className="text-[var(--mm-muted)]">
                        <GlossaryTerm term="Frobenius norm">||M||_F:</GlossaryTerm>
                      </span>
                      <strong className="text-[var(--mm-amber)] font-mono">
                        {measurementData.find((s) => s.step === hoveredDataPoint.step)?.matrixNorm.toFixed(4) || '—'}
                      </strong>
                    </div>
                  </div>
                ) : (
                  <div className="text-[var(--mm-muted)] py-6 font-sans text-xs leading-relaxed">
                    Hover or click any circle on the trajectory curve to inspect the exact cosine score, top-1 margin, and matrix norm at that timestep.
                  </div>
                )}
              </div>
            </div>

            <FigureCaption
              figure="Fig. 4.1"
              title="Attenuation (λ) exponentially lowers older write magnitudes while newer facts superpose across the matrix."
              source={`Live toy matrix simulation (D = ${dimension}, λ = ${retention.toFixed(2)}, η = ${writeStrength.toFixed(2)})`}
              note="Cosine similarity is unitless [-1, 1] and is not a calibrated softmax probability."
            />

            <DataFallbackTable
              caption="Step-by-step readout measurements for Fact #1 (France → Paris)"
              columns={[
                { key: 'step', label: 'Step', align: 'left' },
                { key: 'written', label: 'Written Fact', align: 'left' },
                { key: 'score', label: 'Cosine Score', align: 'right' },
                { key: 'margin', label: 'Top-1 Margin', align: 'right' },
                { key: 'norm', label: '||M||_F', align: 'right' },
                { key: 'decoded', label: 'Decoded Value', align: 'right' },
              ]}
              rows={firstFactTrajectory.map((pt) => {
                const mNorm = measurementData.find((s) => s.step === pt.step)?.matrixNorm || 0;
                return {
                  step: pt.step,
                  written: `+${pt.factName}`,
                  score: pt.score.toFixed(4),
                  margin: pt.margin.toFixed(4),
                  norm: mNorm.toFixed(4),
                  decoded: pt.retrieved,
                };
              })}
            />
          </figure>
        )}

        {/* VIEW 02: OUTCOME (DONUT CHART & SURVIVAL BREAKDOWN) */}
        {activeView === 'outcome' && (
          <figure className="essay-figure-stage p-5 sm:p-7 space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--mm-rule)] pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-serif font-medium text-[var(--text-primary)]">
                  What Survived in Memory? (Final Outcome)
                </h3>
                <p className="text-xs text-[var(--text-secondary)] font-sans mt-0.5 tabular-nums">
                  Empirical classification of all {outcomeBreakdown.total} facts after sequential ingestion into {dimension}×{dimension} state.
                </p>
              </div>

              {/* Hairline Underline Segment Filter */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-sans tabular-nums">
                <button
                  type="button"
                  onClick={() => setSelectedOutcomeSegment('all')}
                  className={`pb-1.5 -mb-3.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                    selectedOutcomeSegment === 'all'
                      ? 'border-[var(--mm-signal)] text-[var(--text-primary)] font-semibold'
                      : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  All ({outcomeBreakdown.total})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOutcomeSegment('correct')}
                  className={`pb-1.5 -mb-3.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                    selectedOutcomeSegment === 'correct'
                      ? 'border-[var(--color-success)] text-[var(--accent-green-text)] font-semibold'
                      : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Correct ({outcomeBreakdown.correct.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOutcomeSegment('incorrect')}
                  className={`pb-1.5 -mb-3.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                    selectedOutcomeSegment === 'incorrect'
                      ? 'border-[var(--color-danger)] text-[var(--accent-pink-text)] font-semibold'
                      : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Incorrect ({outcomeBreakdown.incorrect.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOutcomeSegment('unresolved')}
                  className={`pb-1.5 -mb-3.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                    selectedOutcomeSegment === 'unresolved'
                      ? 'border-[var(--color-warning)] text-[var(--accent-yellow-text)] font-semibold'
                      : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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
                            stroke="var(--color-success)"
                            strokeWidth="12"
                            strokeDasharray={`${cDash} ${circ - cDash}`}
                            strokeDashoffset="0"
                            className="cursor-pointer transition-opacity hover:opacity-85"
                            onClick={() => setSelectedOutcomeSegment('correct')}
                          />
                          {/* Incorrect Arc */}
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            fill="transparent"
                            stroke="var(--color-danger)"
                            strokeWidth="12"
                            strokeDasharray={`${iDash} ${circ - iDash}`}
                            strokeDashoffset={`${-cDash}`}
                            className="cursor-pointer transition-opacity hover:opacity-85"
                            onClick={() => setSelectedOutcomeSegment('incorrect')}
                          />
                          {/* Unresolved Arc */}
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            fill="transparent"
                            stroke="var(--color-warning)"
                            strokeWidth="12"
                            strokeDasharray={`${uDash} ${circ - uDash}`}
                            strokeDashoffset={`${-(cDash + iDash)}`}
                            className="cursor-pointer transition-opacity hover:opacity-85"
                            onClick={() => setSelectedOutcomeSegment('unresolved')}
                          />
                        </>
                      );
                    })()}
                  </svg>

                  {/* Centered Donut Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-mono font-bold text-[var(--text-primary)] tabular-nums">
                      {outcomeBreakdown.total}
                    </span>
                    <span className="text-xs font-sans text-[var(--text-secondary)] font-medium">
                      Total queries
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs font-mono text-[var(--text-secondary)] tabular-nums">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[var(--color-success)]" />
                    <span>Correct ({Math.round((outcomeBreakdown.correct.length / (outcomeBreakdown.total || 1)) * 100)}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[var(--color-danger)]" />
                    <span>Incorrect ({Math.round((outcomeBreakdown.incorrect.length / (outcomeBreakdown.total || 1)) * 100)}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[var(--color-warning)]" />
                    <span>Unresolved ({Math.round((outcomeBreakdown.unresolved.length / (outcomeBreakdown.total || 1)) * 100)}%)</span>
                  </div>
                </div>
              </div>

              {/* Filtered Fact Rows (Hairline Divided List) */}
              <div className="md:col-span-2 divide-y divide-[var(--mm-rule)] border-y border-[var(--mm-rule)] max-h-[320px] overflow-y-auto custom-scrollbar tabular-nums">
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
                      className="py-3 px-2 flex items-center justify-between gap-3 text-xs font-mono"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {qr.isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-[var(--accent-green-text)] shrink-0" />
                        ) : qr.score > 0.15 ? (
                          <XCircle className="w-4 h-4 text-[var(--accent-pink-text)] shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-[var(--accent-yellow-text)] shrink-0" />
                        )}
                        <span className="text-[var(--text-primary)] font-bold">{qr.fact.key}</span>
                        <ArrowRight className="w-3 h-3 text-[var(--text-secondary)] shrink-0" />
                        <span className="truncate text-[var(--text-secondary)]">
                          Expected: <strong className="text-[var(--text-primary)]">{qr.fact.value}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <span className="text-[11px] text-[var(--text-muted)] block">Output</span>
                          <span className={`font-bold ${qr.isCorrect ? 'text-[var(--accent-green-text)]' : 'text-[var(--accent-pink-text)]'}`}>
                            {qr.retrievedVal}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] text-[var(--text-muted)] block">Cosine</span>
                          <span className="text-[var(--mm-signal)] font-bold">{qr.score.toFixed(3)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Honest Annotation */}
            <div className="pt-3 border-t border-[var(--mm-rule)] text-xs font-sans text-[var(--text-secondary)] flex items-start gap-2">
              <Info className="w-4 h-4 text-[var(--mm-signal)] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[var(--text-primary)]">Scientific grounding:</strong> Decoded via <MathView math="\operatorname{argmax}_v \operatorname{sim}(\hat{v}, v)" /> against candidate value representations. Collisions and cross-talk directly stem from finite coordinate dimension <MathView math={`D=${dimension}`} />.
              </div>
            </div>

            <FigureCaption
              figure="Fig. 4.1b"
              title="Empirical survival breakdown across all 6 ingested country-capital bindings at the end of the sequence."
              source={`Live toy matrix simulation (D = ${dimension}, λ = ${retention.toFixed(2)}, η = ${writeStrength.toFixed(2)})`}
            />
          </figure>
        )}

        {/* VIEW 03: MECHANISM (FLOWCHART OF HOW FACTS BECOME MEMORY) */}
        {activeView === 'mechanism' && (
          <figure className="essay-figure-stage p-5 sm:p-7 space-y-6">
            <div className="border-b border-[var(--mm-rule)] pb-4">
              <h3 className="text-base sm:text-lg font-serif font-medium text-[var(--text-primary)]">
                How Does One Fact Become Memory? (Computational Graph)
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-sans mt-0.5">
                Step through each mathematical transformation from symbolic fact to associative matrix superposition and linear probe readout.
              </p>
            </div>

            {/* Horizontal / Responsive Interactive Flowchart */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2">
              {mechanismStages.map((stage) => {
                const isActive = activeMechanismStep === stage.id;
                return (
                  <button
                    type="button"
                    key={stage.id}
                    onClick={() => setActiveMechanismStep(stage.id)}
                    className={`p-3 rounded-md border text-left transition-colors flex flex-col justify-between space-y-2 cursor-pointer ${
                      isActive
                        ? 'border-[var(--mm-signal)] bg-[var(--accent-blue)] text-[var(--text-primary)]'
                        : 'border-[var(--mm-rule)] bg-[var(--surface-soft)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <div>
                      <span
                        className="text-[11px] font-mono block font-semibold"
                        style={{ color: stage.colorVar }}
                      >
                        {stage.title}
                      </span>
                      <div className="text-xs font-mono font-semibold text-[var(--text-primary)] mt-1.5">
                        <MathView math={stage.symbol} />
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-[var(--text-muted)] self-end tabular-nums">
                      Stage {stage.id}/7
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Detailed Stage Deep Dive (Hairline Top Rule) */}
            {(() => {
              const currentStage = mechanismStages.find((s) => s.id === activeMechanismStep) || mechanismStages[0];
              return (
                <div className="pt-5 border-t border-[var(--mm-rule)] space-y-3 font-mono">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[var(--mm-signal)]">
                        Active stage {currentStage.id}:
                      </span>
                      <span className="text-sm font-bold text-[var(--text-primary)] font-sans">
                        {currentStage.title}
                      </span>
                    </div>

                    <div className="text-xs text-[var(--mm-signal)] font-semibold tabular-nums">
                      <MathView math={currentStage.math} />
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
                    {currentStage.desc}
                  </p>

                  <div className="flex items-center justify-between pt-2 text-xs text-[var(--text-secondary)] font-sans">
                    <button
                      type="button"
                      disabled={activeMechanismStep <= 1}
                      onClick={() => setActiveMechanismStep((s) => Math.max(1, s - 1))}
                      className="btn-secondary text-xs disabled:opacity-40 cursor-pointer"
                    >
                      ← Previous step
                    </button>
                    <span className="hidden sm:inline text-xs text-[var(--text-muted)]">
                      Click nodes above to inspect each transformation
                    </span>
                    <button
                      type="button"
                      disabled={activeMechanismStep >= 7}
                      onClick={() => setActiveMechanismStep((s) => Math.min(7, s + 1))}
                      className="btn-secondary text-xs text-[var(--mm-signal)] disabled:opacity-40 cursor-pointer"
                    >
                      Next step →
                    </button>
                  </div>
                </div>
              );
            })()}

            <FigureCaption
              figure="Fig. 4.1c"
              title="Seven mathematical steps translating discrete symbol pairs into superposed recurrent weights and cosine probe readouts."
              source="Deterministic associative memory algebra (linear outer-product recurrence)"
            />
          </figure>
        )}

        {/* VIEW 04: FROBENIUS DRIFT (RECHARTS DYNAMIC PLOT) */}
        {activeView === 'frobenius' && (
          <div className="animate-in fade-in duration-300">
            <FrobeniusDriftExperiment
              id="section-frobenius-drift"
              defaultDimension={dimension as any}
              defaultRetention={retention}
              defaultWriteStrength={writeStrength}
            />
          </div>
        )}

        {/* STATE CHANGE MINI-GRAPH: COORDINATE DELTAS ΔM_t */}
        <div className="essay-figure-stage p-5 sm:p-6 space-y-4 font-mono text-xs tabular-nums">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--mm-rule)] pb-3">
            <span className="font-semibold text-[var(--mm-ink)] font-sans text-sm">
              State coordinate deltas (<MathView math="\Delta M_t = M_t - M_{t-1}" />)
            </span>
            <span className="text-xs text-[var(--mm-muted)] font-sans">
              Final step: +{finalStep?.factWritten.key} → {finalStep?.factWritten.value}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[var(--mm-rule)] border border-[var(--mm-rule)] bg-[var(--mm-paper-bright)] rounded-md">
            <div className="p-3.5 space-y-1">
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--accent-green-text)] font-semibold block">
                Largest positive shift
              </span>
              <div className="text-base font-semibold text-[var(--mm-ink)]">
                +{finalStep?.maxPosDelta.val.toFixed(4)}
              </div>
              <div className="text-xs font-sans text-[var(--mm-muted)]">
                Coordinate #{finalStep?.maxPosDelta.index} (constructive binding)
              </div>
            </div>

            <div className="p-3.5 space-y-1">
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--mm-coral)] font-semibold block">
                Largest negative shift
              </span>
              <div className="text-base font-semibold text-[var(--mm-coral)]">
                {finalStep?.maxNegDelta.val.toFixed(4)}
              </div>
              <div className="text-xs font-sans text-[var(--mm-muted)]">
                Coordinate #{finalStep?.maxNegDelta.index} (destructive attenuation)
              </div>
            </div>

            <div className="p-3.5 space-y-1">
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--mm-signal)] font-semibold block">
                Near-zero coordinates
              </span>
              <div className="text-base font-semibold text-[var(--mm-ink)]">
                {finalStep?.nearZeroCount} / {dimension * dimension}
              </div>
              <div className="text-xs font-sans text-[var(--mm-muted)]">
                Unaffected (|Δ| &lt; 0.005)
              </div>
            </div>
          </div>

          <div className="text-xs text-[var(--mm-muted)] font-sans leading-relaxed pt-1">
            <strong className="text-[var(--mm-ink)]">Scientific note:</strong> Latent dimensions are continuous mathematical coordinates in <MathView math="\mathbb{R}^{D \times D}" /> without human-interpretable single-neuron labels. Interference happens because information is distributed across these superposed linear coordinates.
          </div>
        </div>

        {/* SECTION 04.3: DEDICATED FROBENIUS NORM DRIFT (VISIBLE WHEN NOT ON VIEW 04 TAB) */}
        {activeView !== 'frobenius' && (
          <div className="pt-2">
            <FrobeniusDriftExperiment
              id="section-frobenius-drift"
              defaultDimension={dimension as any}
              defaultRetention={retention}
              defaultWriteStrength={writeStrength}
            />
          </div>
        )}
      </div>
    </section>
  );
};

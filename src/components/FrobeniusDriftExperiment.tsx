import React, { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Activity,
  Sliders,
  RotateCcw,
  Zap,
  ShieldAlert,
  Info,
  Layers,
  ArrowRight,
  Play,
  Pause,
  StepForward,
} from 'lucide-react';
import { GlossaryTerm } from './GlossaryTerm';

interface FrobeniusDriftExperimentProps {
  id?: string;
  defaultDimension?: 8 | 16 | 32 | 64;
  defaultRetention?: number;
  defaultWriteStrength?: number;
}

// Deterministic pseudo-random orthogonal vector generator
function createUnitVector(dim: number, seed: number): number[] {
  const vec = new Array(dim);
  let normSq = 0;
  for (let i = 0; i < dim; i++) {
    const val = Math.sin(seed * 997 + i * 37.1) * Math.cos(seed * 13.7 - i * 53.3);
    vec[i] = val;
    normSq += val * val;
  }
  const norm = Math.sqrt(normSq) || 1;
  return vec.map((v) => v / norm);
}

const DEFAULT_FACTS = [
  { key: 'France', value: 'Paris' },
  { key: 'Germany', value: 'Berlin' },
  { key: 'Japan', value: 'Tokyo' },
  { key: 'Canada', value: 'Ottawa' },
  { key: 'Brazil', value: 'Brasilia' },
  { key: 'Egypt', value: 'Cairo' },
  { key: 'Italy', value: 'Rome' },
  { key: 'Spain', value: 'Madrid' },
  { key: 'India', value: 'New Delhi' },
  { key: 'Australia', value: 'Canberra' },
  { key: 'Kenya', value: 'Nairobi' },
  { key: 'Sweden', value: 'Stockholm' },
];

export const FrobeniusDriftExperiment: React.FC<FrobeniusDriftExperimentProps> = ({
  id = 'section-frobenius-drift',
  defaultDimension = 16,
  defaultRetention = 0.92,
  defaultWriteStrength = 0.85,
}) => {
  const [dimension, setDimension] = useState<8 | 16 | 32 | 64>(defaultDimension);
  const [retention, setRetention] = useState<number>(defaultRetention);
  const [writeStrength, setWriteStrength] = useState<number>(defaultWriteStrength);
  const [factCount, setFactCount] = useState<number>(8);
  const [burstNoiseActive, setBurstNoiseActive] = useState<boolean>(false);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Playback timer for sequential fact ingestion experiment
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setFactCount((prev) => {
        if (prev >= 12) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 900);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePlaySimulation = () => {
    if (factCount >= 12) {
      setFactCount(2);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    setFactCount((prev) => Math.min(12, prev + 1));
  };

  // Custom animated dot renderers with crisp high-contrast scientific points
  const renderRetentionDot = (dotProps: any) => {
    const { cx, cy, index = 0, payload } = dotProps;
    if (cx == null || cy == null) return null;
    const isLatest = index === driftData.length - 1;
    const isHovered = hoveredStep === payload?.step;
    const delayMs = Math.min(index * 50, 400);

    return (
      <g
        key={`ret-dot-${index}-${payload?.step}`}
        style={{
          animation: `dataPointEntry 400ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms both`,
          transformOrigin: `${cx}px ${cy}px`,
        }}
      >
        {/* Subtle highlight ring on hover or latest */}
        {(isLatest || isHovered) && (
          <circle
            cx={cx}
            cy={cy}
            r={10}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={1.5}
            opacity={isHovered ? 0.6 : 0.35}
            className={isLatest ? 'data-point-pulse-ring' : ''}
          />
        )}
        {/* Clean, high-precision solid circle with crisp surface outline */}
        <circle
          cx={cx}
          cy={cy}
          r={isLatest || isHovered ? 5.5 : 4}
          fill="var(--color-accent)"
          stroke="var(--surface)"
          strokeWidth={2}
          className="transition-all duration-200"
        />
      </g>
    );
  };

  const renderNormDot = (dotProps: any) => {
    const { cx, cy, index = 0, payload } = dotProps;
    if (cx == null || cy == null) return null;
    const isLatest = index === driftData.length - 1;
    const isHovered = hoveredStep === payload?.step;
    const delayMs = Math.min(index * 50, 400);

    return (
      <g
        key={`norm-dot-${index}-${payload?.step}`}
        style={{
          animation: `dataPointEntry 400ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms both`,
          transformOrigin: `${cx}px ${cy}px`,
        }}
      >
        {(isLatest || isHovered) && (
          <circle
            cx={cx}
            cy={cy}
            r={9}
            fill="none"
            stroke="var(--color-warning)"
            strokeWidth={1.5}
            opacity={isHovered ? 0.6 : 0.35}
            className={isLatest ? 'data-point-pulse-ring' : ''}
          />
        )}
        <circle
          cx={cx}
          cy={cy}
          r={isLatest || isHovered ? 5 : 3.5}
          fill="var(--color-warning)"
          stroke="var(--surface)"
          strokeWidth={1.8}
          className="transition-all duration-200"
        />
      </g>
    );
  };

  // Compute step-by-step matrix evolution, Frobenius norm, and Fact #1 retention trace
  const driftData = useMemo(() => {
    // Current matrix initialized to zeros
    let matrix: number[][] = Array.from({ length: dimension }, () =>
      new Array(dimension).fill(0)
    );

    const steps = [];
    const activeFacts = DEFAULT_FACTS.slice(0, factCount);

    // Key/Value vectors for Fact #1 (France -> Paris)
    const k1 = createUnitVector(dimension, 101);
    const v1 = createUnitVector(dimension, 202);

    for (let t = 0; t < activeFacts.length; t++) {
      const fact = activeFacts[t];
      const kt = t === 0 ? k1 : createUnitVector(dimension, (t + 1) * 101 + (burstNoiseActive ? 777 : 0));
      const vt = t === 0 ? v1 : createUnitVector(dimension, (t + 1) * 202 + (burstNoiseActive ? 333 : 0));

      // Decay prior state: M = lambda * M
      for (let r = 0; r < dimension; r++) {
        for (let c = 0; c < dimension; c++) {
          matrix[r][c] = matrix[r][c] * retention;
        }
      }

      // Add outer-product write: M += eta * (k_t * v_t^T)
      const effectiveEta = burstNoiseActive && t > 1 ? writeStrength * 1.3 : writeStrength;
      for (let r = 0; r < dimension; r++) {
        for (let c = 0; c < dimension; c++) {
          matrix[r][c] += effectiveEta * kt[r] * vt[c];
        }
      }

      // Compute Matrix Frobenius Norm: ||M||_F = sqrt( sum( M_ij^2 ) )
      let sumSq = 0;
      for (let r = 0; r < dimension; r++) {
        for (let c = 0; c < dimension; c++) {
          sumSq += matrix[r][c] * matrix[r][c];
        }
      }
      const frobeniusNorm = Math.sqrt(sumSq);

      // Probe Fact #1: decoded_vector = M^T * k1
      const decoded = new Array(dimension).fill(0);
      for (let c = 0; c < dimension; c++) {
        let dot = 0;
        for (let r = 0; r < dimension; r++) {
          dot += matrix[r][c] * k1[r];
        }
        decoded[c] = dot;
      }

      // Cosine overlap with ground-truth v1
      let dotProd = 0;
      let decNormSq = 0;
      for (let i = 0; i < dimension; i++) {
        dotProd += decoded[i] * v1[i];
        decNormSq += decoded[i] * decoded[i];
      }
      const decNorm = Math.sqrt(decNormSq) || 1e-6;
      // Cosine score bounded between 0 and 1
      const rawCosine = dotProd / decNorm;
      const fact1Score = Math.max(0, Math.min(1.0, rawCosine));

      // Theoretical decay factor for pure memory trace without interference: lambda^t
      const analyticalDecay = Math.pow(retention, t);

      // Theoretical steady-state bound if retention < 1: eta / sqrt(1 - lambda^2)
      const steadyStateBound =
        retention < 0.999
          ? Number((effectiveEta / Math.sqrt(1 - retention * retention)).toFixed(3))
          : Number((effectiveEta * Math.sqrt(t + 1)).toFixed(3));

      steps.push({
        step: t + 1,
        factName: fact.key,
        targetVal: fact.value,
        frobeniusNorm: Number(frobeniusNorm.toFixed(3)),
        fact1Retention: Number((fact1Score * 100).toFixed(1)),
        rawScore: Number(fact1Score.toFixed(3)),
        analyticalDecay: Number((analyticalDecay * 100).toFixed(1)),
        steadyStateBound,
        matrixEnergy: Number(sumSq.toFixed(3)),
      });
    }

    return steps;
  }, [dimension, retention, writeStrength, factCount, burstNoiseActive]);

  // Current and summary telemetry
  const latestStep = driftData[driftData.length - 1];
  const initialStep = driftData[0];
  const totalNormDrift = latestStep && initialStep ? latestStep.frobeniusNorm - initialStep.frobeniusNorm : 0;
  const driftPercent = initialStep && initialStep.frobeniusNorm > 0 ? (totalNormDrift / initialStep.frobeniusNorm) * 100 : 0;

  // Theoretical saturation limit
  const asymptoticLimit =
    retention < 0.999
      ? (writeStrength / Math.sqrt(1 - retention * retention)).toFixed(2)
      : 'Unbounded (λ=1)';

  return (
    <div id={id} className="scroll-mt-24 diagram-frame p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-[var(--accent-yellow)] text-[var(--accent-yellow-text)] border border-[var(--color-warning-border)]">
              SECTION 04.5 · INTERACTIVE EVIDENCE
            </span>
            <span className="text-xs font-mono text-[var(--text-secondary)]">Dynamic drift plot</span>
          </div>
          <h3 className="text-lg sm:text-xl font-sans font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[var(--accent-blue-text)]" />
            <span>Frobenius Norm Drift &amp; Memory Trace Decay</span>
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans max-w-3xl leading-relaxed">
            Watch how continuous state magnitude <span className="font-mono font-bold text-[var(--accent-yellow-text)]">||M||_F</span> evolves as new facts interfere with the memory substrate, driving the first stored memory (&ldquo;France → Paris&rdquo;) to decay over time.
          </p>
        </div>

        {/* Standardized Playback Controls */}
        <div className="playback-controls">
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setRetention(0.92);
              setDimension(16);
              setWriteStrength(0.85);
              setFactCount(8);
              setBurstNoiseActive(false);
            }}
            className="btn btn-secondary text-xs"
            title="Reset parameters to baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={handleStepForward}
            disabled={factCount >= 12}
            className="btn btn-secondary text-xs"
            title="Step one fact forward"
          >
            <StepForward className="w-3.5 h-3.5" />
            <span>Step</span>
          </button>

          <button
            type="button"
            onClick={handlePlaySimulation}
            className={`btn ${isPlaying ? 'btn-primary' : 'btn-secondary'} text-xs`}
            title="Sequentially plot incoming facts to observe entry animation and drift"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : factCount >= 12 ? 'Replay' : 'Play'}</span>
          </button>

          <button
            type="button"
            onClick={() => setBurstNoiseActive((prev) => !prev)}
            className={`btn ${burstNoiseActive ? 'btn-primary' : 'btn-secondary'} text-xs`}
            title="Inject dense cross-talk interference to simulate congested vector space"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{burstNoiseActive ? 'Burst active' : 'Inject burst'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Sliders & Configuration Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)] text-xs font-sans tabular-nums">
        {/* Retention λ */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[var(--text-secondary)] font-medium">Retention (λ):</span>
            <span className="font-mono font-bold text-[var(--accent-blue-text)]">{retention.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.70"
            max="1.0"
            step="0.02"
            value={retention}
            onChange={(e) => setRetention(parseFloat(e.target.value))}
            className="w-full accent-[var(--color-accent)] cursor-pointer"
          />
          <div className="flex justify-between text-xs text-[var(--text-secondary)] mt-1">
            <span>0.70 (Rapid)</span>
            <span>0.92</span>
            <span>1.00 (No Decay)</span>
          </div>
        </div>

        {/* Sequence Length (Interfering Facts) */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[var(--text-secondary)] font-medium">Sequence Steps (T):</span>
            <span className="font-mono font-bold text-[var(--accent-green-text)]">{factCount} Facts</span>
          </div>
          <input
            type="range"
            min="4"
            max="12"
            step="1"
            value={factCount}
            onChange={(e) => setFactCount(parseInt(e.target.value, 10))}
            className="w-full accent-[var(--color-success)] cursor-pointer"
          />
          <div className="flex justify-between text-xs text-[var(--text-secondary)] mt-1">
            <span>4 Facts</span>
            <span>8 Facts</span>
            <span>12 Facts</span>
          </div>
        </div>

        {/* Dimension D */}
        <div>
          <span className="block text-[var(--text-secondary)] font-medium text-xs mb-2">Dimension (d):</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {([8, 16, 32, 64] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDimension(d)}
                className={`dimension-delta ${dimension === d ? 'active' : ''}`}
              >
                d = {d}
              </button>
            ))}
          </div>
        </div>

        {/* Write Strength η */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[var(--text-secondary)] font-medium">Write Strength (η):</span>
            <span className="font-mono font-bold text-[var(--accent-yellow-text)]">{writeStrength.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.4"
            max="1.0"
            step="0.05"
            value={writeStrength}
            onChange={(e) => setWriteStrength(parseFloat(e.target.value))}
            className="w-full accent-[var(--color-warning)] cursor-pointer"
          />
          <div className="flex justify-between text-xs text-[var(--text-secondary)] mt-1">
            <span>0.40 (Soft)</span>
            <span>0.85</span>
            <span>1.00 (Hard)</span>
          </div>
        </div>
      </div>

      {/* Main Dynamic Recharts Visualization */}
      <div className="space-y-3">
        {/* Academic Legend & Metric Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)] text-xs font-sans">
          <div className="flex flex-wrap items-center gap-4 text-[var(--text-secondary)]">
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-xs bg-[var(--color-warning)] border border-[var(--color-warning-border)] inline-block" />
              <span className="text-[var(--accent-yellow-text)] font-semibold">Frobenius Norm ‖M‖_F</span>
              <span className="text-xs text-[var(--text-muted)]">(Left Axis)</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-4 h-1 bg-[var(--color-accent)] rounded-xs inline-block" />
              <span className="text-[var(--accent-blue-text)] font-semibold">Fact #1 Retention %</span>
              <span className="text-xs text-[var(--text-muted)]">(Right Axis)</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-4 h-0.5 border-t-2 border-dashed border-[var(--color-danger)] inline-block" />
              <span className="text-[var(--accent-pink-text)] font-semibold">Critical Limit (30%)</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono bg-[var(--surface)] px-3 py-1 rounded-md border border-[var(--border)] tabular-nums">
            <span className="text-[var(--text-secondary)]">Equilibrium Bound:</span>
            <strong className="text-[var(--accent-yellow-text)] font-bold">‖M‖_∞ ≈ {asymptoticLimit}</strong>
          </div>
        </div>

        <div className="w-full h-[390px] sm:h-[430px] select-none bg-[var(--surface)] rounded-xl border border-[var(--border)] p-3 sm:p-5">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={driftData}
              margin={{ top: 25, right: 55, bottom: 35, left: 45 }}
              onMouseMove={(e: any) => {
                if (e?.activePayload && e.activePayload.length > 0) {
                  setHoveredStep(e.activePayload[0].payload.step);
                }
              }}
              onMouseLeave={() => setHoveredStep(null)}
            >
              <defs>
                <linearGradient id="frobeniusGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-warning)" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="var(--color-warning)" stopOpacity={0.01} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />

              {/* X Axis: Clean Two-Line Ticks (Step Number + Fact Name) */}
              <XAxis
                dataKey="step"
                tick={({ x, y, payload }) => {
                  const dataItem = driftData[payload.index];
                  if (!dataItem) return null;
                  const isHovered = hoveredStep === dataItem.step;
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text
                        x={0}
                        y={0}
                        dy={14}
                        textAnchor="middle"
                        fill={isHovered ? 'var(--accent-blue-text)' : 'var(--text-primary)'}
                        fontSize={11}
                        fontFamily="var(--font-mono)"
                        fontWeight={isHovered ? 700 : 600}
                      >
                        {`S${dataItem.step}`}
                      </text>
                      <text
                        x={0}
                        y={0}
                        dy={28}
                        textAnchor="middle"
                        fill={isHovered ? 'var(--accent-blue-text)' : 'var(--text-secondary)'}
                        fontSize={10}
                        fontFamily="var(--font-sans)"
                      >
                        {`+${dataItem.factName}`}
                      </text>
                    </g>
                  );
                }}
                stroke="var(--border)"
                tickLine={{ stroke: 'var(--border)' }}
                height={45}
              />

              {/* Y Axis Left: Frobenius Norm ‖M‖_F */}
              <YAxis
                yAxisId="left"
                domain={[0, (dataMax: number) => Math.max(3.5, Math.ceil(dataMax * 1.25 * 2) / 2)]}
                tick={{ fontSize: 11, fill: 'var(--accent-yellow-text)', fontFamily: 'var(--font-mono)' }}
                tickFormatter={(v) => Number(v).toFixed(1)}
                stroke="var(--border)"
                tickLine={{ stroke: 'var(--border)' }}
                label={{
                  value: 'Frobenius Norm ‖M‖_F',
                  angle: -90,
                  position: 'insideLeft',
                  fill: 'var(--accent-yellow-text)',
                  fontSize: 11,
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  offset: -32,
                  style: { textAnchor: 'middle' },
                }}
              />

              {/* Y Axis Right: Fact #1 Retention % */}
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 11, fill: 'var(--accent-blue-text)', fontFamily: 'var(--font-mono)' }}
                stroke="var(--border)"
                tickLine={{ stroke: 'var(--border)' }}
                label={{
                  value: 'Fact #1 Retention (%)',
                  angle: 90,
                  position: 'insideRight',
                  fill: 'var(--accent-blue-text)',
                  fontSize: 11,
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  offset: -38,
                  style: { textAnchor: 'middle' },
                }}
              />

              {/* Threshold Boundary: Below 30% retention is lost */}
              <ReferenceLine
                yAxisId="right"
                y={30}
                stroke="var(--color-danger)"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={(props: any) => {
                  const { viewBox } = props;
                  if (!viewBox) return null;
                  const { x, y, width } = viewBox;
                  return (
                    <g>
                      <rect
                        x={x + width - 175}
                        y={y - 18}
                        width={170}
                        height={18}
                        rx={4}
                        fill="var(--accent-pink)"
                        fillOpacity={0.95}
                        stroke="var(--color-danger-border)"
                        strokeWidth={1}
                      />
                      <text
                        x={x + width - 167}
                        y={y - 5}
                        fill="var(--accent-pink-text)"
                        fontSize={10}
                        fontFamily="var(--font-mono)"
                        fontWeight={600}
                      >
                        Critical Limit (30% Recall)
                      </text>
                    </g>
                  );
                }}
              />

              {/* Theoretical Steady-State Bound (if lambda < 1) */}
              {retention < 0.999 && (
                <ReferenceLine
                  yAxisId="left"
                  y={parseFloat(asymptoticLimit)}
                  stroke="var(--text-secondary)"
                  strokeDasharray="4 4"
                  strokeWidth={1.2}
                  label={(props: any) => {
                    const { viewBox } = props;
                    if (!viewBox) return null;
                    const { x, y } = viewBox;
                    return (
                      <g>
                        <rect
                          x={x + 12}
                          y={y - 18}
                          width={145}
                          height={18}
                          rx={4}
                          fill="var(--surface)"
                          fillOpacity={0.95}
                          stroke="var(--border)"
                          strokeWidth={1}
                        />
                        <text
                          x={x + 18}
                          y={y - 5}
                          fill="var(--text-secondary)"
                          fontSize={10}
                          fontFamily="var(--font-mono)"
                          fontWeight={600}
                        >
                          Limit ‖M‖_∞ = {asymptoticLimit}
                        </text>
                      </g>
                    );
                  }}
                />
              )}

              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const data = payload[0].payload;
                  const isDegraded = data.fact1Retention < 50;
                  const isForgotten = data.fact1Retention < 30;

                  return (
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 shadow-md text-xs font-mono space-y-2 min-w-[220px] tabular-nums">
                      <div className="flex items-center justify-between border-b border-[var(--border)] pb-1.5">
                        <span className="font-bold text-[var(--text-primary)]">
                          Step {data.step}: +{data.factName} → {data.targetVal}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                            isForgotten
                              ? 'bg-[var(--accent-pink)] text-[var(--accent-pink-text)]'
                              : isDegraded
                              ? 'bg-[var(--accent-yellow)] text-[var(--accent-yellow-text)]'
                              : 'bg-[var(--accent-green)] text-[var(--accent-green-text)]'
                          }`}
                        >
                          {isForgotten ? 'Forgotten' : isDegraded ? 'Interfered' : 'Intact'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[var(--text-secondary)]">State Norm ‖M‖_F:</span>
                          <strong className="text-[var(--accent-yellow-text)] font-bold">{data.frobeniusNorm}</strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[var(--text-secondary)]">Fact #1 Retention:</span>
                          <strong className="text-[var(--accent-blue-text)] font-bold">{data.fact1Retention}%</strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[var(--text-secondary)]">Cosine Score:</span>
                          <span className="text-[var(--text-primary)] font-semibold">{data.rawScore}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[var(--text-secondary)]">Decay Factor λᵗ:</span>
                          <span className="text-[var(--text-primary)]">{data.analyticalDecay}%</span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />

              {/* Area 1: Frobenius Norm Fill */}
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="frobeniusNorm"
                name="Frobenius Norm ‖M‖_F"
                stroke="var(--color-warning)"
                strokeWidth={2}
                fill="url(#frobeniusGrad)"
                dot={renderNormDot}
                activeDot={{ r: 5, fill: 'var(--color-warning)', stroke: 'var(--surface)', strokeWidth: 2 }}
                isAnimationActive={false}
              />

              {/* Line 2: Fact #1 Residual Retention Curve */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="fact1Retention"
                name="Fact #1 Retention %"
                stroke="var(--color-accent)"
                strokeWidth={2}
                dot={renderRetentionDot}
                activeDot={{ r: 5, fill: 'var(--color-accent)', stroke: 'var(--surface)', strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dynamic Diagnostic Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 border-t border-[var(--border)] pt-4 text-xs font-sans tabular-nums">
        {/* Metric 1: Current Frobenius Norm */}
        <div className="metric-panel space-y-1">
          <span className="text-xs text-[var(--text-secondary)] block uppercase tracking-wider font-semibold">
            Matrix Norm ‖M_T‖_F
          </span>
          <div className="text-base font-bold font-mono text-[var(--accent-yellow-text)] flex items-center gap-1.5">
            <span>{latestStep ? latestStep.frobeniusNorm.toFixed(3) : '—'}</span>
            <span
              className={`text-xs font-mono font-normal px-1.5 py-0.5 rounded ${
                totalNormDrift > 0 ? 'bg-[var(--accent-yellow)] text-[var(--accent-yellow-text)]' : 'bg-[var(--surface)] text-[var(--text-secondary)]'
              }`}
            >
              {totalNormDrift >= 0 ? `+${totalNormDrift.toFixed(2)}` : totalNormDrift.toFixed(2)} (
              {driftPercent.toFixed(0)}%)
            </span>
          </div>
          <div className="text-xs text-[var(--text-secondary)]">
            Associative energy accumulated in {dimension}×{dimension} state
          </div>
        </div>

        {/* Metric 2: Fact #1 Retention Score */}
        <div className="metric-panel space-y-1">
          <span className="text-xs text-[var(--text-secondary)] block uppercase tracking-wider font-semibold">
            Fact #1 Survival (France)
          </span>
          <div className="text-base font-bold font-mono text-[var(--accent-blue-text)] flex items-center gap-1.5">
            <span>{latestStep ? `${latestStep.fact1Retention}%` : '—'}</span>
            <span
              className={`text-xs font-sans font-medium px-1.5 py-0.5 rounded ${
                latestStep && latestStep.fact1Retention >= 50
                  ? 'bg-[var(--accent-green)] text-[var(--accent-green-text)]'
                  : latestStep && latestStep.fact1Retention >= 30
                  ? 'bg-[var(--accent-yellow)] text-[var(--accent-yellow-text)]'
                  : 'bg-[var(--accent-pink)] text-[var(--accent-pink-text)]'
              }`}
            >
              {latestStep && latestStep.fact1Retention >= 50
                ? 'Strong Recall'
                : latestStep && latestStep.fact1Retention >= 30
                ? 'Interfered'
                : 'Loss'}
            </span>
          </div>
          <div className="text-xs text-[var(--text-secondary)]">
            Residual cosine similarity between decoded state and &ldquo;Paris&rdquo;
          </div>
        </div>

        {/* Metric 3: Asymptotic Saturation Bound */}
        <div className="metric-panel space-y-1">
          <span className="text-xs text-[var(--text-secondary)] block uppercase tracking-wider font-semibold">
            Theoretical Bound ‖M‖_∞
          </span>
          <div className="text-base font-bold font-mono text-[var(--text-primary)]">
            {asymptoticLimit}
          </div>
          <div className="text-xs text-[var(--text-secondary)]">
            {retention >= 0.999
              ? 'Infinite growth: no decay leads to unbounded matrix congestion'
              : 'Steady-state limit where decay balances incoming writes'}
          </div>
        </div>

        {/* Metric 4: Signal-to-Interference Ratio */}
        <div className="metric-panel space-y-1">
          <span className="text-xs text-[var(--text-secondary)] block uppercase tracking-wider font-semibold">
            Drift Behavior Regime
          </span>
          <div className="text-base font-bold text-[var(--text-primary)]">
            {retention >= 0.99
              ? 'Unbounded Congestion'
              : retention <= 0.80
              ? 'Fast Amnesic Decay'
              : 'Asymptotic Saturation'}
          </div>
          <div className="text-xs text-[var(--text-secondary)]">
            {retention >= 0.99
              ? 'Eigenvalues grow with sequence length'
              : 'Exponential forgetting curve stabilizes the matrix norm'}
          </div>
        </div>
      </div>

      {/* Scientific Explanatory Footnote */}
      <div className="research-callout space-y-2">
        <div className="flex items-center gap-2 font-sans text-xs font-bold text-[var(--text-primary)]">
          <Info className="w-4 h-4 text-[var(--accent-blue-text)]" />
          <span>Why Frobenius Norm Drift Matters for Memory Persistence</span>
        </div>
        <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
          The <GlossaryTerm term="Frobenius norm">Frobenius norm</GlossaryTerm>{' '}
          <span className="font-mono font-semibold text-[var(--accent-yellow-text)]">‖M‖_F = √(∑ M_ij²)</span> measures the total Euclidean coordinate energy packed into the matrix. When retention attenuation <span className="font-mono">λ = 1.0</span>, every newly ingested fact injects fresh energy <span className="font-mono">η</span> without dissipating prior coordinates, causing <span className="font-mono">‖M‖_F</span> to scale as <span className="font-mono">O(√T)</span> and causing geometric crosstalk to overpower older memories. When <span className="font-mono">λ &lt; 1.0</span>, the norm asymptotically saturates at <span className="font-mono">η / √(1 - λ²)</span>, keeping coordinates numerically stable at the expense of exponential memory decay.
        </p>
      </div>
    </div>
  );
};

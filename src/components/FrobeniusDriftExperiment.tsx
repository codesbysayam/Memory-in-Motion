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

  // Custom animated dot renderers with entry pulse and fade-in
  const renderRetentionDot = (dotProps: any) => {
    const { cx, cy, index = 0, payload } = dotProps;
    if (cx == null || cy == null) return null;
    const isLatest = index === driftData.length - 1;
    const isHovered = hoveredStep === payload?.step;
    const delayMs = Math.min(index * 60, 600);

    return (
      <g
        key={`ret-dot-${index}-${payload?.step}`}
        style={{
          animation: `dataPointEntry 600ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms both`,
          transformOrigin: `${cx}px ${cy}px`,
        }}
      >
        {/* Subtle pulsing halo on latest point */}
        {isLatest && (
          <circle
            cx={cx}
            cy={cy}
            r={11}
            fill="none"
            stroke="#2B6282"
            strokeWidth={1.5}
            className="data-point-pulse-ring"
          />
        )}
        {/* Outer highlight ring on hover */}
        {isHovered && (
          <circle
            cx={cx}
            cy={cy}
            r={9}
            fill="none"
            stroke="#2B6282"
            strokeWidth={2}
            opacity={0.5}
          />
        )}
        {/* Outer white halo border */}
        <circle
          cx={cx}
          cy={cy}
          r={isLatest || isHovered ? 5.5 : 4}
          fill="#FFFFFF"
          stroke="#2B6282"
          strokeWidth={2}
          className="transition-all duration-200"
        />
        {/* Center core dot */}
        <circle
          cx={cx}
          cy={cy}
          r={isLatest || isHovered ? 2.5 : 1.8}
          fill="#2B6282"
        />
      </g>
    );
  };

  const renderNormDot = (dotProps: any) => {
    const { cx, cy, index = 0, payload } = dotProps;
    if (cx == null || cy == null) return null;
    const isLatest = index === driftData.length - 1;
    const isHovered = hoveredStep === payload?.step;
    const delayMs = Math.min(index * 60, 600);

    return (
      <g
        key={`norm-dot-${index}-${payload?.step}`}
        style={{
          animation: `dataPointEntry 600ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms both`,
          transformOrigin: `${cx}px ${cy}px`,
        }}
      >
        {isLatest && (
          <circle
            cx={cx}
            cy={cy}
            r={10}
            fill="none"
            stroke="#B86B1B"
            strokeWidth={1.5}
            className="data-point-pulse-ring"
          />
        )}
        <circle
          cx={cx}
          cy={cy}
          r={isLatest || isHovered ? 5 : 3.5}
          fill="#FFFFFF"
          stroke="#B86B1B"
          strokeWidth={1.8}
          className="transition-all duration-200"
        />
        <circle
          cx={cx}
          cy={cy}
          r={isLatest || isHovered ? 2.2 : 1.5}
          fill="#8F4D0B"
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
    <div id={id} className="scroll-mt-24 rounded-xl border border-[#D9DCD8] bg-[#FFFFFF] p-6 sm:p-8 space-y-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D9DCD8] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#FFF5D8] text-[#5A4716] border border-[#F0E3B8]">
              SECTION 04.5 · INTERACTIVE EVIDENCE
            </span>
            <span className="text-xs font-mono text-[#5F625F]">Recharts Dynamic Plot</span>
          </div>
          <h3 className="text-lg sm:text-xl font-serif font-bold text-[#252525] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#2B6282]" />
            <span>Frobenius Norm Drift & Memory Trace Decay</span>
          </h3>
          <p className="text-xs sm:text-sm text-[#5F625F] font-sans max-w-3xl leading-relaxed">
            Watch how continuous state magnitude <span className="font-mono font-bold text-[#8F4D0B]">||M||_F</span> evolves as new facts interfere with the memory substrate, driving the first stored memory (&ldquo;France → Paris&rdquo;) to decay over time.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-sans">
          <button
            onClick={handlePlaySimulation}
            className={`px-3 py-1.5 rounded-md border flex items-center gap-1.5 transition-all cursor-pointer font-semibold ${
              isPlaying
                ? 'bg-[#24452E] text-white border-[#24452E]'
                : 'bg-[#DCEFE2] border-[#C5DDCB] text-[#24452E] hover:bg-[#CFE8D6]'
            }`}
            title="Sequentially plot incoming facts to observe entry animation and drift"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause Sequence' : factCount >= 12 ? 'Replay Sequence' : 'Play Sequence'}</span>
          </button>

          <button
            onClick={handleStepForward}
            disabled={factCount >= 12}
            className="px-2.5 py-1.5 rounded-md border border-[#D9DCD8] bg-[#FFFFFF] hover:bg-[#F7F5EF] disabled:opacity-40 disabled:cursor-not-allowed text-[#252525] font-medium cursor-pointer transition-colors flex items-center gap-1"
            title="Step one fact forward"
          >
            <StepForward className="w-3.5 h-3.5 text-[#5F625F]" />
            <span>Step +1</span>
          </button>

          <button
            onClick={() => setBurstNoiseActive((prev) => !prev)}
            className={`px-3 py-1.5 rounded-md border flex items-center gap-1.5 transition-all cursor-pointer ${
              burstNoiseActive
                ? 'bg-[#F9E9ED] border-[#ECD1D7] text-[#6B2835] font-semibold'
                : 'bg-[#FFFFFF] border-[#D9DCD8] text-[#5F625F] hover:bg-[#F7F5EF]'
            }`}
            title="Inject dense cross-talk interference to simulate congested vector space"
          >
            <Zap className={`w-3.5 h-3.5 ${burstNoiseActive ? 'text-[#6B2835]' : 'text-[#8F4D0B]'}`} />
            <span>{burstNoiseActive ? 'Interference Active' : 'Inject Burst'}</span>
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setRetention(0.92);
              setDimension(16);
              setWriteStrength(0.85);
              setFactCount(8);
              setBurstNoiseActive(false);
            }}
            className="p-1.5 rounded-md border border-[#D9DCD8] bg-[#FFFFFF] hover:bg-[#F7F5EF] text-[#5F625F] hover:text-[#252525] cursor-pointer transition-colors"
            title="Reset parameters to biological baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Sliders & Configuration Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-lg bg-[#F7F5EF] border border-[#D9DCD8] text-xs font-sans">
        {/* Retention λ */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[#5F625F] font-medium">Retention (λ):</span>
            <span className="font-mono font-bold text-[#2B6282]">{retention.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.70"
            max="1.0"
            step="0.02"
            value={retention}
            onChange={(e) => setRetention(parseFloat(e.target.value))}
            className="w-full accent-[#2B6282] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#5F625F] mt-0.5">
            <span>0.70 (Rapid)</span>
            <span>0.92</span>
            <span>1.00 (No Decay)</span>
          </div>
        </div>

        {/* Sequence Length (Interfering Facts) */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[#5F625F] font-medium">Sequence Steps (T):</span>
            <span className="font-mono font-bold text-[#24452E]">{factCount} Facts</span>
          </div>
          <input
            type="range"
            min="4"
            max="12"
            step="1"
            value={factCount}
            onChange={(e) => setFactCount(parseInt(e.target.value, 10))}
            className="w-full accent-[#24452E] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#5F625F] mt-0.5">
            <span>4 Facts</span>
            <span>8 Facts</span>
            <span>12 Facts</span>
          </div>
        </div>

        {/* Dimension D */}
        <div>
          <span className="block text-[#5F625F] font-medium mb-1.5">Dimension (D):</span>
          <div className="grid grid-cols-4 gap-1 font-mono">
            {([8, 16, 32, 64] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDimension(d)}
                className={`py-1 rounded-md border text-center transition-all cursor-pointer text-xs ${
                  dimension === d
                    ? 'bg-[#E7F2FA] border-[#CDE1F0] text-[#21445B] font-bold'
                    : 'bg-[#FFFFFF] border-[#D9DCD8] text-[#5F625F] hover:text-[#252525]'
                }`}
              >
                D={d}
              </button>
            ))}
          </div>
        </div>

        {/* Write Strength η */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[#5F625F] font-medium">Write Strength (η):</span>
            <span className="font-mono font-bold text-[#8F4D0B]">{writeStrength.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.4"
            max="1.0"
            step="0.05"
            value={writeStrength}
            onChange={(e) => setWriteStrength(parseFloat(e.target.value))}
            className="w-full accent-[#B86B1B] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#5F625F] mt-0.5">
            <span>0.40 (Soft)</span>
            <span>0.85</span>
            <span>1.00 (Hard)</span>
          </div>
        </div>
      </div>

      {/* Main Dynamic Recharts Visualization */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-sans">
          <div className="flex items-center gap-4 text-[#5F625F]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#B86B1B] inline-block" />
              <span>Frobenius Norm ||M||_F (Left Axis)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#2B6282] inline-block" />
              <span>Fact #1 Retention % (Right Axis)</span>
            </span>
            <span className="flex items-center gap-1.5 text-[#5F625F]">
              <span className="w-3 h-0.5 border-t border-dashed border-[#A33B3B] inline-block" />
              <span>Critical Retrieval Limit (30%)</span>
            </span>
          </div>
          <span className="text-[11px] text-[#5F625F]">
            Theoretical Equilibrium ||M||_∞ ≈ <strong className="font-mono text-[#8F4D0B]">{asymptoticLimit}</strong>
          </span>
        </div>

        <div className="w-full h-72 sm:h-80 select-none bg-[#FFFFFF] rounded-lg border border-[#D9DCD8] p-2 sm:p-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={driftData}
              margin={{ top: 15, right: 25, bottom: 20, left: 10 }}
              onMouseMove={(e: any) => {
                if (e?.activePayload && e.activePayload.length > 0) {
                  setHoveredStep(e.activePayload[0].payload.step);
                }
              }}
              onMouseLeave={() => setHoveredStep(null)}
            >
              <defs>
                <linearGradient id="frobeniusGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#B86B1B" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#B86B1B" stopOpacity={0.01} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#D9DCD8" vertical={false} />

              {/* X Axis: Sequence Steps with Fact Names */}
              <XAxis
                dataKey="step"
                tickFormatter={(step, idx) => {
                  const fact = driftData[idx]?.factName;
                  return `S${step} (+${fact || ''})`;
                }}
                tick={{ fontSize: 11, fill: '#5F625F', fontFamily: 'monospace' }}
                stroke="#D9DCD8"
              />

              {/* Y Axis Left: Frobenius Norm ||M||_F */}
              <YAxis
                yAxisId="left"
                domain={[0, (dataMax: number) => Math.max(4, Math.ceil(dataMax * 1.2))]}
                tick={{ fontSize: 11, fill: '#8F4D0B', fontFamily: 'monospace' }}
                stroke="#D9DCD8"
                label={{
                  value: '||M||_F Matrix Norm',
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#8F4D0B',
                  fontSize: 10,
                  fontFamily: 'monospace',
                  offset: 0,
                }}
              />

              {/* Y Axis Right: Fact #1 Retention % */}
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 11, fill: '#2B6282', fontFamily: 'monospace' }}
                stroke="#D9DCD8"
                label={{
                  value: 'Fact #1 Retention %',
                  angle: 90,
                  position: 'insideRight',
                  fill: '#2B6282',
                  fontSize: 10,
                  fontFamily: 'monospace',
                  offset: 0,
                }}
              />

              {/* Threshold Boundary: Below 30% retention is lost */}
              <ReferenceLine
                yAxisId="right"
                y={30}
                stroke="#A33B3B"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: 'Forgetting Threshold',
                  fill: '#A33B3B',
                  fontSize: 10,
                  fontFamily: 'monospace',
                  position: 'insideBottomRight',
                }}
              />

              {/* Theoretical Steady-State Bound (if lambda < 1) */}
              {retention < 0.999 && (
                <ReferenceLine
                  yAxisId="left"
                  y={parseFloat(asymptoticLimit)}
                  stroke="#5F625F"
                  strokeDasharray="2 2"
                  strokeWidth={1.2}
                  label={{
                    value: `||M||_∞ = ${asymptoticLimit}`,
                    fill: '#5F625F',
                    fontSize: 10,
                    fontFamily: 'monospace',
                    position: 'insideTopLeft',
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
                    <div className="rounded-lg border border-[#D9DCD8] bg-[#FFFFFF] p-3 shadow-md text-xs font-mono space-y-2 min-w-[220px]">
                      <div className="flex items-center justify-between border-b border-[#D9DCD8] pb-1.5">
                        <span className="font-bold text-[#252525]">
                          Step {data.step}: +{data.factName} → {data.targetVal}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            isForgotten
                              ? 'bg-[#F9E9ED] text-[#6B2835]'
                              : isDegraded
                              ? 'bg-[#FFF5D8] text-[#5A4716]'
                              : 'bg-[#DCEFE2] text-[#24452E]'
                          }`}
                        >
                          {isForgotten ? 'Forgotten' : isDegraded ? 'Interfered' : 'Intact'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[#5F625F]">State Norm ||M||_F:</span>
                          <strong className="text-[#8F4D0B] font-bold">{data.frobeniusNorm}</strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#5F625F]">Fact #1 Retention:</span>
                          <strong className="text-[#2B6282] font-bold">{data.fact1Retention}%</strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#5F625F]">Cosine Score:</span>
                          <span className="text-[#252525] font-semibold">{data.rawScore}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#5F625F]">Decay Factor λ^t:</span>
                          <span className="text-[#252525]">{data.analyticalDecay}%</span>
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
                name="Frobenius Norm ||M||_F"
                stroke="#B86B1B"
                strokeWidth={2}
                fill="url(#frobeniusGrad)"
                dot={renderNormDot}
                activeDot={{ r: 5, fill: '#8F4D0B', stroke: '#FFF', strokeWidth: 2 }}
                isAnimationActive={false}
              />

              {/* Line 2: Fact #1 Residual Retention Curve */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="fact1Retention"
                name="Fact #1 Retention %"
                stroke="#2B6282"
                strokeWidth={2}
                dot={renderRetentionDot}
                activeDot={{ r: 5, fill: '#2B6282', stroke: '#FFF', strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dynamic Diagnostic Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 border-t border-[#D9DCD8] pt-4 text-xs font-sans">
        {/* Metric 1: Current Frobenius Norm */}
        <div className="p-3.5 rounded-lg bg-[#F7F5EF] border border-[#D9DCD8] space-y-1">
          <span className="text-[10px] text-[#5F625F] block uppercase tracking-wider font-medium">
            Matrix Norm ||M_T||_F
          </span>
          <div className="text-base font-bold font-mono text-[#8F4D0B] flex items-center gap-1.5">
            <span>{latestStep ? latestStep.frobeniusNorm.toFixed(3) : '—'}</span>
            <span
              className={`text-[10px] font-mono font-normal px-1.5 py-0.5 rounded ${
                totalNormDrift > 0 ? 'bg-[#FFF5D8] text-[#5A4716]' : 'bg-[#F0F1EF] text-[#5F625F]'
              }`}
            >
              {totalNormDrift >= 0 ? `+${totalNormDrift.toFixed(2)}` : totalNormDrift.toFixed(2)} (
              {driftPercent.toFixed(0)}%)
            </span>
          </div>
          <div className="text-[10px] text-[#5F625F]">
            Associative energy accumulated in {dimension}×{dimension} state
          </div>
        </div>

        {/* Metric 2: Fact #1 Retention Score */}
        <div className="p-3.5 rounded-lg bg-[#F7F5EF] border border-[#D9DCD8] space-y-1">
          <span className="text-[10px] text-[#5F625F] block uppercase tracking-wider font-medium">
            Fact #1 Survival (France)
          </span>
          <div className="text-base font-bold font-mono text-[#2B6282] flex items-center gap-1.5">
            <span>{latestStep ? `${latestStep.fact1Retention}%` : '—'}</span>
            <span
              className={`text-[10px] font-sans font-medium px-1.5 py-0.5 rounded ${
                latestStep && latestStep.fact1Retention >= 50
                  ? 'bg-[#DCEFE2] text-[#24452E]'
                  : latestStep && latestStep.fact1Retention >= 30
                  ? 'bg-[#FFF5D8] text-[#5A4716]'
                  : 'bg-[#F9E9ED] text-[#6B2835]'
              }`}
            >
              {latestStep && latestStep.fact1Retention >= 50
                ? 'Strong Recall'
                : latestStep && latestStep.fact1Retention >= 30
                ? 'Interfered'
                : 'Loss'}
            </span>
          </div>
          <div className="text-[10px] text-[#5F625F]">
            Residual cosine similarity between decoded state and &ldquo;Paris&rdquo;
          </div>
        </div>

        {/* Metric 3: Asymptotic Saturation Bound */}
        <div className="p-3.5 rounded-lg bg-[#F7F5EF] border border-[#D9DCD8] space-y-1">
          <span className="text-[10px] text-[#5F625F] block uppercase tracking-wider font-medium">
            Theoretical Bound ||M||_∞
          </span>
          <div className="text-base font-bold font-mono text-[#252525]">
            {asymptoticLimit}
          </div>
          <div className="text-[10px] text-[#5F625F]">
            {retention >= 0.999
              ? 'Infinite growth: no decay leads to unbounded matrix congestion'
              : `Steady-state limit where decay balances incoming writes`}
          </div>
        </div>

        {/* Metric 4: Signal-to-Interference Ratio */}
        <div className="p-3.5 rounded-lg bg-[#F7F5EF] border border-[#D9DCD8] space-y-1">
          <span className="text-[10px] text-[#5F625F] block uppercase tracking-wider font-medium">
            Drift Behavior Regime
          </span>
          <div className="text-base font-bold text-[#252525]">
            {retention >= 0.99
              ? 'Unbounded Congestion'
              : retention <= 0.80
              ? 'Fast Amnesic Decay'
              : 'Asymptotic Saturation'}
          </div>
          <div className="text-[10px] text-[#5F625F]">
            {retention >= 0.99
              ? 'Eigenvalues grow with sequence length'
              : 'Exponential forgetting curve stabilizes the matrix norm'}
          </div>
        </div>
      </div>

      {/* Scientific Explanatory Footnote */}
      <div className="rounded-lg bg-[#F7F5EF] p-4 border border-[#D9DCD8] space-y-2">
        <div className="flex items-center gap-2 font-sans text-xs font-bold text-[#252525]">
          <Info className="w-4 h-4 text-[#2B6282]" />
          <span>Why Frobenius Norm Drift Matters for Memory Persistence</span>
        </div>
        <p className="text-xs text-[#5F625F] font-sans leading-relaxed">
          The <GlossaryTerm term="Frobenius norm">Frobenius norm</GlossaryTerm>{' '}
          <span className="font-mono font-semibold text-[#8F4D0B]">||M||_F = √(∑ M_ij²)</span> measures the total Euclidean coordinate energy packed into the matrix. When retention attenuation <span className="font-mono">λ = 1.0</span>, every newly ingested fact injects fresh energy <span className="font-mono">η</span> without dissipating prior coordinates, causing <span className="font-mono">||M||_F</span> to scale as <span className="font-mono">O(√T)</span> and causing geometric crosstalk to overpower older memories. When <span className="font-mono">λ &lt; 1.0</span>, the norm asymptotically saturates at <span className="font-mono">η / √(1 - λ²)</span>, keeping coordinates numerically stable at the expense of exponential memory decay.
        </p>
      </div>
    </div>
  );
};

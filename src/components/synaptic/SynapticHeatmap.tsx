import React, { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import {
  Activity,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Layers,
  ChevronRight,
  Zap,
  Info,
} from 'lucide-react';
import { InlineMath } from '../ui/MathView';

export interface RetrievalSequenceState {
  step: number; // 0 to 5
  timeLabel: string; // t0, t1, t2, t3, t4, t5
  title: string;
  description: string;
  mathFormula: string;
  phase: 'injection' | 'read' | 'threshold' | 'hebbian' | 'attractor';
}

export const RETRIEVAL_SEQUENCE_STATES: RetrievalSequenceState[] = [
  {
    step: 0,
    timeLabel: 't0',
    title: 'Sparse Receptor Cue Injection',
    description: 'Input cue x(0) is applied to receptor units; latent synapses remain at quiescent baseline.',
    mathFormula: 'x_i(0) = \\text{Cue}_i, \\quad \\sigma_{ij}(0) = \\sigma_{\\text{base}}',
    phase: 'injection',
  },
  {
    step: 1,
    timeLabel: 't1',
    title: 'Plastic Synaptic Memory Readout',
    description: 'Incoming signals flow through connection tensor W_ij + σ_ij(t); associative channels conduct flux.',
    mathFormula: 'u_j(1) = \\sum_i (W_{ij} + \\sigma_{ij}) \\cdot x_i(0)',
    phase: 'read',
  },
  {
    step: 2,
    timeLabel: 't2',
    title: 'Recurrent Propagation & Top-K Sparsity',
    description: 'Non-negative ReLU thresholding eliminates background noise; true attractor cluster activates.',
    mathFormula: 'x_j(2) = \\text{ReLU}(u_j(1) - \\theta_{\\text{top-k}})',
    phase: 'threshold',
  },
  {
    step: 3,
    timeLabel: 't3',
    title: 'Hebbian Coincidence Reinforcement',
    description: 'Coincident active pairs trigger fast synaptic update Δσ_ij = η · x_i · x_j across weight dimensions.',
    mathFormula: '\\Delta\\sigma_{ij} = \\eta \\cdot x_i(2) \\cdot x_j(2), \\quad \\sigma_{ij} \\leftarrow \\sigma_{ij} + \\Delta\\sigma_{ij}',
    phase: 'hebbian',
  },
  {
    step: 4,
    timeLabel: 't4',
    title: 'Energy Minimization & Cluster Crystallization',
    description: 'Network dynamics converge along the Lyapunov synaptic landscape into a self-reinforcing memory basin.',
    mathFormula: 'E = -\\frac{1}{2} \\sum_{ij} (W_{ij} + \\sigma_{ij}) x_i x_j + \\sum_i \\theta_i x_i',
    phase: 'attractor',
  },
  {
    step: 5,
    timeLabel: 'tN',
    title: 'Converged Associative Recall (Attractor Fixpoint)',
    description: 'Full associative pattern reconstructed with strictly bounded O(1) state memory footprint.',
    mathFormula: 'x^* = \\text{Fixpoint}(W + \\sigma^*), \\quad \\|\\Delta x\\| < 10^{-4}',
    phase: 'attractor',
  },
];

interface SynapticHeatmapProps {
  numNeurons?: number;
  inputPattern?: 'Alpha' | 'Beta' | 'Gamma' | 'Orthogonal';
  synapticStrength?: number;
  recurrentSteps?: number;
  externalStep?: number;
  onStepChange?: (step: number) => void;
}

export const SynapticHeatmap: React.FC<SynapticHeatmapProps> = ({
  numNeurons = 16,
  inputPattern = 'Alpha',
  synapticStrength = 0.5,
  recurrentSteps = 4,
  externalStep,
  onStepChange,
}) => {
  // Dimension size for heatmap matrix: 8x8 to 14x14 grid
  const dimSize = Math.min(14, Math.max(8, numNeurons > 24 ? 12 : numNeurons));

  const [internalStep, setInternalStep] = useState<number>(1);
  const currentStep = externalStep !== undefined ? externalStep : internalStep;

  const setStep = (s: number) => {
    if (onStepChange) onStepChange(s);
    setInternalStep(s);
  };

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedCell, setSelectedCell] = useState<{
    i: number;
    j: number;
    weight: number;
    plasticState: number;
    intensity: number;
    dimension: string;
    isKeyCluster: boolean;
  } | null>(null);

  // Auto-play retrieval sequence
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setStep((currentStep + 1) % RETRIEVAL_SEQUENCE_STATES.length);
    }, 1600);
    return () => clearInterval(timer);
  }, [isPlaying, currentStep]);

  // Current state metadata
  const currentState = RETRIEVAL_SEQUENCE_STATES[currentStep] || RETRIEVAL_SEQUENCE_STATES[0];

  // Pattern-specific neuron cluster indices
  const clusterIndices = useMemo(() => {
    switch (inputPattern) {
      case 'Alpha':
        return [0, 1, 2, 4, 7];
      case 'Beta':
        return [2, 3, 5, 8, 10];
      case 'Gamma':
        return [1, 4, 6, 9, 11];
      case 'Orthogonal':
      default:
        return [0, 3, 6, 9, 12];
    }
  }, [inputPattern]);

  // 1. Generate Recharts Scatter Matrix Data
  // In Recharts, a 2D heatmap can be cleanly rendered via ScatterChart where x=dim_pre, y=dim_post, and cell fill color corresponds to intensity/weight
  const heatmapData = useMemo(() => {
    const data: {
      x: number;
      y: number;
      z: number;
      i: number;
      j: number;
      weight: number;
      plasticState: number;
      intensity: number;
      dimension: string;
      isKeyCluster: boolean;
    }[] = [];

    for (let i = 0; i < dimSize; i++) {
      for (let j = 0; j < dimSize; j++) {
        // Base topological weight decay
        const dist = Math.min(Math.abs(i - j), dimSize - Math.abs(i - j));
        const baseW = i === j ? 0 : Number((0.55 / (1 + dist * 0.75)).toFixed(3));

        const isPreIn = clusterIndices.includes(i % 8);
        const isPostIn = clusterIndices.includes(j % 8);
        const isCluster = isPreIn && isPostIn && i !== j;

        // Sequence evolution across t0 -> tN
        let plasticState = 0.04;
        let intensity = baseW;

        if (currentStep === 0) {
          // t0: Cue injected
          plasticState = 0.05 * synapticStrength;
          intensity = isCluster ? 0.35 : baseW * 0.7;
        } else if (currentStep === 1) {
          // t1: Synaptic read
          plasticState = (isCluster ? 0.42 : 0.08) * synapticStrength;
          intensity = isCluster ? 0.62 : baseW * 0.9;
        } else if (currentStep === 2) {
          // t2: Thresholding
          plasticState = (isCluster ? 0.65 : 0.04) * synapticStrength;
          intensity = isCluster ? 0.82 : baseW * 0.4;
        } else if (currentStep === 3) {
          // t3: Hebbian coincidence update
          plasticState = (isCluster ? 0.92 : 0.06) * synapticStrength;
          intensity = isCluster ? 1.0 : baseW * 0.35;
        } else if (currentStep === 4) {
          // t4: Energy basin
          plasticState = (isCluster ? 0.95 : 0.05) * synapticStrength;
          intensity = isCluster ? 0.94 : baseW * 0.3;
        } else {
          // tN: Settled fixpoint
          plasticState = (isCluster ? 0.98 : 0.04) * synapticStrength;
          intensity = isCluster ? 0.96 : baseW * 0.25;
        }

        const totalW = Number((baseW + plasticState).toFixed(3));

        data.push({
          x: j, // Column = Target neuron j
          y: dimSize - 1 - i, // Row = Source neuron i (inverted for visual top-to-bottom)
          z: totalW * 100, // Size in scatter
          i,
          j,
          weight: baseW,
          plasticState: Number(plasticState.toFixed(3)),
          intensity: Number(intensity.toFixed(3)),
          dimension: `W(${i}→${j})`,
          isKeyCluster: isCluster,
        });
      }
    }
    return data;
  }, [dimSize, clusterIndices, currentStep, synapticStrength]);

  // Color mapping function based on intensity & state using theme CSS variables
  const getColor = (intensity: number, isCluster: boolean) => {
    if (currentStep === 3 && isCluster) {
      return 'var(--color-warning)';
    }
    if (isCluster) {
      if (intensity > 0.8) return 'var(--color-accent)';
      if (intensity > 0.6) return 'color-mix(in srgb, var(--color-accent) 78%, var(--surface))';
      return 'color-mix(in srgb, var(--color-accent) 55%, var(--surface))';
    }
    if (intensity > 0.4) return 'color-mix(in srgb, var(--color-accent) 35%, var(--surface))';
    if (intensity > 0.2) return 'var(--accent-blue)';
    if (intensity > 0.08) return 'var(--color-surface-muted)';
    return 'var(--surface-soft)';
  };

  // 2. Bar chart data for aggregate weight dimension intensity profile across layers
  const dimensionProfileData = useMemo(() => {
    const buckets: { dim: string; staticW: number; plasticTrace: number; totalW: number }[] = [];
    for (let k = 0; k < dimSize; k++) {
      const rowCells = heatmapData.filter((d) => d.i === k);
      const avgStatic = rowCells.reduce((acc, c) => acc + c.weight, 0) / dimSize;
      const avgPlastic = rowCells.reduce((acc, c) => acc + c.plasticState, 0) / dimSize;
      buckets.push({
        dim: `N${k}`,
        staticW: Number(avgStatic.toFixed(3)),
        plasticTrace: Number(avgPlastic.toFixed(3)),
        totalW: Number((avgStatic + avgPlastic).toFixed(3)),
      });
    }
    return buckets;
  }, [heatmapData, dimSize]);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7 space-y-6 shadow-xs text-[var(--text-primary)]">
      {/* 1. Header with Title & Playback Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-[var(--accent-blue-text)] bg-[var(--accent-blue)] px-2.5 py-0.5 rounded border border-[var(--border)]">
              Recharts synaptic heatmap
            </span>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              {dimSize}×{dimSize} Synaptic Tensor W_ij(t)
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-sans font-semibold text-[var(--text-primary)] mt-1">
            Synaptic Weight Activity During Memory Retrieval (t0 → tN)
          </h3>
          <p className="text-xs font-sans text-[var(--text-secondary)] mt-1 max-w-2xl">
            Real-time visual heatmap using Recharts depicting synaptic weight intensity variations across all
            pre-synaptic (rows) and post-synaptic (columns) dimensions as memory is retrieved without a KV-cache.
          </p>
        </div>

        {/* Playback Button Group */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--surface)] text-xs font-sans font-semibold transition-all shadow-xs cursor-pointer"
            title={isPlaying ? 'Pause sequence' : 'Play sequence t0 → tN'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Pause Sequence' : 'Play Sequence'}</span>
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setStep(0);
            }}
            className="p-2 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-soft)] text-[var(--text-secondary)] border border-[var(--border)] transition-all cursor-pointer"
            title="Reset to t0 (Cue Injection)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. VISUAL STEP-PROGRESS INDICATOR (t0 to tN) */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[var(--text-muted)] px-1">
          <span>Retrieval sequence progression</span>
          <span className="text-[var(--accent-blue-text)] font-bold tabular-nums">
            State {currentStep + 1} of {RETRIEVAL_SEQUENCE_STATES.length} · {currentState.timeLabel}
          </span>
        </div>

        {/* Responsive Step Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {RETRIEVAL_SEQUENCE_STATES.map((st) => {
            const isCurrent = currentStep === st.step;
            const isCompleted = currentStep > st.step;

            return (
              <button
                key={st.step}
                onClick={() => {
                  setIsPlaying(false);
                  setStep(st.step);
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-[var(--accent-blue)] border-[var(--color-accent)] shadow-sm ring-1 ring-[var(--color-accent)]'
                    : isCompleted
                    ? 'bg-[var(--surface)] border-[var(--border)] hover:bg-[var(--surface-soft)]'
                    : 'bg-[var(--surface-soft)] border-[var(--border)] hover:bg-[var(--color-surface-muted)] opacity-80'
                }`}
              >
                {/* Top Badge & Time Label */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                      isCurrent
                        ? 'bg-[var(--color-accent)] text-[var(--surface)]'
                        : isCompleted
                        ? 'bg-[var(--accent-green)] text-[var(--accent-green-text)]'
                        : 'bg-[var(--color-surface-muted)] text-[var(--text-muted)]'
                    }`}
                  >
                    {st.timeLabel}
                  </span>
                </div>

                {/* State Title */}
                <div
                  className={`text-xs font-sans font-semibold leading-tight line-clamp-2 ${
                    isCurrent ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {st.title}
                </div>

                {/* Micro Step indicator bar */}
                <div className="w-full bg-[var(--border)] h-1 rounded-sm overflow-hidden mt-2">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isCurrent ? 'bg-[var(--color-accent)] w-full' : isCompleted ? 'bg-[var(--color-success)] w-full' : 'w-0'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Current State Formulation & Detail Card */}
      <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-[var(--accent-blue-text)] bg-[var(--surface)] px-2 py-0.5 rounded border border-[var(--border)]">
              {currentState.timeLabel.toUpperCase()}: {currentState.title}
            </span>
            <span className="text-xs text-[var(--text-muted)]">({currentState.phase} phase)</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--text-secondary)]">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-yellow-text)]" />
            <span>Target Pattern: {inputPattern}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center text-xs">
          <div className="md:col-span-8 text-[var(--text-secondary)] font-sans leading-relaxed">
            {currentState.description}
          </div>
          <div className="md:col-span-4 bg-[var(--surface)] p-2.5 rounded-lg border border-[var(--border)] text-xs text-[var(--accent-blue-text)] overflow-x-auto">
            <div className="text-[11px] text-[var(--text-muted)] font-sans mb-1">Active Tensor Law:</div>
            <div className="text-[var(--text-primary)]">
              <InlineMath math={currentState.mathFormula} />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Dual Visualization: Recharts 2D Synaptic Heatmap + Weight Dimension Intensity Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Visual: 2D Recharts Scatter Heatmap Matrix (7 cols) */}
        <div className="lg:col-span-7 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-muted)] font-mono">
            <span>2D Recharts weight tensor map</span>
            <span>Target Neuron (Columns 0..{dimSize - 1})</span>
          </div>

          <div className="w-full h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 12, right: 12, bottom: 20, left: 10 }}
              >
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Post-Synaptic Unit (j)"
                  domain={[-0.5, dimSize - 0.5]}
                  tickCount={dimSize}
                  tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'monospace' }}
                  tickFormatter={(val) => `N${val}`}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Pre-Synaptic Unit (i)"
                  domain={[-0.5, dimSize - 0.5]}
                  tickCount={dimSize}
                  tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'monospace' }}
                  tickFormatter={(val) => `N${dimSize - 1 - val}`}
                />
                <ZAxis type="number" dataKey="z" range={[180, 260]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3', stroke: 'var(--color-accent)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[var(--surface)] p-3 rounded-lg border border-[var(--border)] shadow-md font-sans text-xs space-y-1">
                          <div className="font-bold text-[var(--text-primary)] font-mono">
                            Synapse N_{data.i} → N_{data.j}
                          </div>
                          <div className="text-[var(--accent-blue-text)] font-mono text-[11px] tabular-nums">
                            Total W_eff: {(data.weight + data.plasticState).toFixed(3)}
                          </div>
                          <div className="text-[11px] text-[var(--text-secondary)] tabular-nums">
                            Static base: {data.weight} · Plastic σ: {data.plasticState}
                          </div>
                          <div className="text-[11px] font-semibold text-[var(--accent-yellow-text)]">
                            {data.isKeyCluster ? '★ Core Associated Memory Pair' : 'Background synapse'}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter
                  data={heatmapData}
                  shape="square"
                  onClick={(entry: any) => setSelectedCell(entry?.payload || (entry as any))}
                >
                  {heatmapData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getColor(entry.intensity, entry.isKeyCluster)}
                      stroke="var(--surface)"
                      strokeWidth={1.5}
                      className="cursor-pointer transition-all hover:opacity-80"
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Color Scale Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-[var(--text-secondary)] pt-2 border-t border-[var(--border)]">
            <div className="flex items-center gap-1.5">
              <span>0.0 (Dormant)</span>
              <div className="flex h-3 w-28 rounded-sm overflow-hidden border border-[var(--border)]">
                <div className="w-1/4 bg-[var(--surface-soft)]" />
                <div className="w-1/4 bg-[var(--accent-blue)]" />
                <div className="w-1/4 opacity-70 bg-[var(--color-accent)]" />
                <div className="w-1/4 bg-[var(--color-accent)]" />
              </div>
              <span>1.0+ (Saturated)</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[var(--color-warning)] border border-[var(--color-warning-border)]" />
                <span>Hebbian Ignition</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[var(--color-accent)]" />
                <span>Memory Attractor Cluster</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Visual: Dimension Profile Bar Chart + Cell Inspector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Recharts Bar Chart: Weight Dimension Intensity Profile */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
              <span>Dimension intensity profile</span>
              <span className="text-[var(--accent-blue-text)] font-bold">Static + Plastic σ</span>
            </div>

            <div className="w-full h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dimensionProfileData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                  <XAxis
                    dataKey="dim"
                    tick={{ fontSize: 9, fill: 'var(--text-muted)', fontFamily: 'monospace' }}
                  />
                  <YAxis
                    domain={[0, 0.8]}
                    tick={{ fontSize: 9, fill: 'var(--text-muted)', fontFamily: 'monospace' }}
                  />
                  <Tooltip
                    formatter={(val: number) => val.toFixed(3)}
                    contentStyle={{
                      backgroundColor: 'var(--surface)',
                      color: 'var(--text-primary)',
                      borderRadius: 8,
                      fontSize: 11,
                      border: '1px solid var(--border)',
                    }}
                  />
                  <Bar dataKey="staticW" stackId="a" fill="var(--color-border-strong)" name="Static Base Weight" />
                  <Bar
                    dataKey="plasticTrace"
                    stackId="a"
                    fill={currentStep === 3 ? 'var(--color-warning)' : 'var(--color-accent)'}
                    name="Plastic State σ_ij"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[11px] text-[var(--text-muted)] font-sans flex items-center justify-between">
              <span>Notice how plastic state σ expands selectively on active associative neurons.</span>
            </div>
          </div>

          {/* Synaptic Channel Inspector Card */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
              <span className="text-xs font-sans font-semibold text-[var(--text-primary)]">
                Synapse Dimension Inspector
              </span>
              <span className="text-[11px] font-mono text-[var(--accent-blue-text)] bg-[var(--accent-blue)] px-1.5 py-0.5 rounded">
                {selectedCell ? `${selectedCell.dimension}` : 'Click any matrix cell'}
              </span>
            </div>

            {selectedCell ? (
              <div className="space-y-2.5 text-xs font-sans">
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="bg-[var(--surface)] p-2 rounded-lg border border-[var(--border)]">
                    <span className="text-[var(--text-muted)] block text-[10px]">STATIC BASE W</span>
                    <span className="font-bold text-[var(--text-primary)] tabular-nums">{selectedCell.weight}</span>
                  </div>
                  <div className="bg-[var(--surface)] p-2 rounded-lg border border-[var(--border)]">
                    <span className="text-[var(--text-muted)] block text-[10px]">PLASTIC STATE σ(t)</span>
                    <span className="font-bold text-[var(--accent-blue-text)] tabular-nums">{selectedCell.plasticState}</span>
                  </div>
                  <div className="bg-[var(--surface)] p-2 rounded-lg border border-[var(--border)]">
                    <span className="text-[var(--text-muted)] block text-[10px]">EFFECTIVE WEIGHT</span>
                    <span className="font-bold text-[var(--accent-green-text)] tabular-nums">
                      {(selectedCell.weight + selectedCell.plasticState).toFixed(3)}
                    </span>
                  </div>
                  <div className="bg-[var(--surface)] p-2 rounded-lg border border-[var(--border)]">
                    <span className="text-[var(--text-muted)] block text-[10px]">CLUSTER PARTICIPANT</span>
                    <span className={`font-bold ${selectedCell.isKeyCluster ? 'text-[var(--accent-yellow-text)]' : 'text-[var(--text-muted)]'}`}>
                      {selectedCell.isKeyCluster ? 'Yes (Recall Core)' : 'Background'}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-[var(--text-secondary)] leading-snug">
                  {selectedCell.isKeyCluster
                    ? `Synapse (${selectedCell.i} → ${selectedCell.j}) is an activated associative link. During ${currentState.timeLabel}, Hebbian plasticity modifies its connection strength.`
                    : `Synapse (${selectedCell.i} → ${selectedCell.j}) connects quiescent units. Its plastic contribution remains at basal baseline.`}
                </p>
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-[var(--text-muted)]">
                <Activity className="w-5 h-5 mx-auto text-[var(--text-muted)] mb-1" />
                <span>Click any cell in the Recharts scatter matrix above to inspect its real-time weight decomposition.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

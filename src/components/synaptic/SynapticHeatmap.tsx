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

  // Color mapping function based on intensity & state
  const getColor = (intensity: number, isCluster: boolean) => {
    if (currentStep === 3 && isCluster) {
      // Flash amber/gold on Hebbian coincidence
      return '#F0C987';
    }
    if (isCluster) {
      if (intensity > 0.8) return '#21445B'; // Deep navy
      if (intensity > 0.6) return '#2B6282'; // BDH primary teal/blue
      return '#4B84A6';
    }
    // Background synaptic connections
    if (intensity > 0.4) return '#89B9D4';
    if (intensity > 0.2) return '#CDE1F0';
    if (intensity > 0.08) return '#E7F2FA';
    return '#F7F5EF'; // Quiescent
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
    <div className="rounded-2xl border border-[#D9DCD8] bg-[#FFFFFF] p-5 sm:p-7 space-y-6 shadow-xs">
      {/* 1. Header with Title & Playback Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EAE6DF] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#21445B] bg-[#E7F2FA] px-2.5 py-0.5 rounded border border-[#CDE1F0]">
              RECHARTS SYNAPTIC HEATMAP
            </span>
            <span className="text-xs font-mono text-[#716F68]">
              {dimSize}×{dimSize} Synaptic Tensor W_ij(t)
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-serif font-bold text-[#151515] mt-1">
            Synaptic Weight Activity During Memory Retrieval (t0 → tN)
          </h3>
          <p className="text-xs font-sans text-[#5F625F] mt-1 max-w-2xl">
            Real-time visual heatmap using Recharts depicting synaptic weight intensity variations across all
            pre-synaptic (rows) and post-synaptic (columns) dimensions as memory is retrieved without a KV-cache.
          </p>
        </div>

        {/* Playback Button Group */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#2B6282] hover:bg-[#214D66] text-[#FFFFFF] text-xs font-sans font-semibold transition-all shadow-xs cursor-pointer"
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
            className="p-2 rounded-lg bg-[#FFFFFF] hover:bg-[#F7F5EF] text-[#5F625F] border border-[#D9DCD8] transition-all cursor-pointer"
            title="Reset to t0 (Cue Injection)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. VISUAL STEP-PROGRESS INDICATOR (t0 to tN) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-[#716F68] px-1">
          <span>RETRIEVAL SEQUENCE PROGRESSION</span>
          <span className="text-[#21445B] font-bold">
            State {currentStep + 1} of {RETRIEVAL_SEQUENCE_STATES.length} · {currentState.timeLabel}
          </span>
        </div>

        {/* Responsive Step Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {RETRIEVAL_SEQUENCE_STATES.map((st, idx) => {
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
                    ? 'bg-[#E7F2FA] border-[#2B6282] shadow-sm ring-1 ring-[#2B6282]/30'
                    : isCompleted
                    ? 'bg-[#FFFFFF] border-[#D9DCD8] hover:bg-[#F7F5EF]'
                    : 'bg-[#FAF8F5] border-[#EAE6DF] hover:bg-[#F2EFE8] opacity-75'
                }`}
              >
                {/* Top Badge & Time Label */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                      isCurrent
                        ? 'bg-[#2B6282] text-[#FFFFFF]'
                        : isCompleted
                        ? 'bg-[#DCEFE2] text-[#245B38]'
                        : 'bg-[#F1F2F0] text-[#716F68]'
                    }`}
                  >
                    {st.timeLabel}
                  </span>
                  {isCurrent && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2B6282] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2B6282]" />
                    </span>
                  )}
                </div>

                {/* State Title */}
                <div
                  className={`text-xs font-sans font-semibold leading-tight line-clamp-2 ${
                    isCurrent ? 'text-[#151515]' : 'text-[#5F625F]'
                  }`}
                >
                  {st.title}
                </div>

                {/* Micro Step indicator pill */}
                <div className="w-full bg-[#E5E0D8]/60 h-1 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isCurrent ? 'bg-[#2B6282] w-full' : isCompleted ? 'bg-[#245B38] w-full' : 'w-0'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Current State Formulation & Detail Card */}
      <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE6DF] pb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#21445B] bg-[#FFFFFF] px-2 py-0.5 rounded border border-[#D9DCD8]">
              {currentState.timeLabel.toUpperCase()}: {currentState.title}
            </span>
            <span className="text-xs text-[#716F68]">({currentState.phase} phase)</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#5F625F]">
            <Sparkles className="w-3.5 h-3.5 text-[#B08928]" />
            <span>Target Pattern: {inputPattern}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center text-xs">
          <div className="md:col-span-8 text-[#4A4C48] font-sans leading-relaxed">
            {currentState.description}
          </div>
          <div className="md:col-span-4 bg-[#FFFFFF] p-2.5 rounded-lg border border-[#E5E0D8] font-mono text-[11px] text-[#21445B]">
            <div className="text-[9px] uppercase text-[#716F68] font-sans">Active Tensor Law:</div>
            <code className="block mt-0.5">{currentState.mathFormula}</code>
          </div>
        </div>
      </div>

      {/* 4. Dual Visualization: Recharts 2D Synaptic Heatmap + Weight Dimension Intensity Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Visual: 2D Recharts Scatter Heatmap Matrix (7 cols) */}
        <div className="lg:col-span-7 rounded-xl border border-[#D9DCD8] bg-[#FFFFFF] p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-[#716F68] font-mono">
            <span>2D RECHARTS WEIGHT TENSOR MAP</span>
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
                  tick={{ fontSize: 10, fill: '#716F68', fontFamily: 'monospace' }}
                  tickFormatter={(val) => `N${val}`}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Pre-Synaptic Unit (i)"
                  domain={[-0.5, dimSize - 0.5]}
                  tickCount={dimSize}
                  tick={{ fontSize: 10, fill: '#716F68', fontFamily: 'monospace' }}
                  tickFormatter={(val) => `N${dimSize - 1 - val}`}
                />
                <ZAxis type="number" dataKey="z" range={[180, 260]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3', stroke: '#2B6282' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#FFFFFF] p-3 rounded-lg border border-[#D9DCD8] shadow-md font-sans text-xs space-y-1">
                          <div className="font-bold text-[#151515] font-mono">
                            Synapse N_{data.i} → N_{data.j}
                          </div>
                          <div className="text-[#21445B] font-mono text-[11px]">
                            Total W_eff: {data.weight + data.plasticState}
                          </div>
                          <div className="text-[11px] text-[#5F625F]">
                            Static base: {data.weight} · Plastic σ: {data.plasticState}
                          </div>
                          <div className="text-[11px] font-semibold text-[#B08928]">
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
                      stroke="#FFFFFF"
                      strokeWidth={1.5}
                      className="cursor-pointer transition-all hover:opacity-80"
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Color Scale Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-[#5F625F] pt-2 border-t border-[#EAE6DF]">
            <div className="flex items-center gap-1.5">
              <span>0.0 (Dormant)</span>
              <div className="flex h-3 w-28 rounded overflow-hidden border border-[#D9DCD8]">
                <div className="w-1/4 bg-[#F7F5EF]" />
                <div className="w-1/4 bg-[#E7F2FA]" />
                <div className="w-1/4 bg-[#4B84A6]" />
                <div className="w-1/4 bg-[#21445B]" />
              </div>
              <span>1.0+ (Saturated)</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-[#F0C987] border border-[#D8A856]" />
                <span>Hebbian Ignition</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-[#21445B]" />
                <span>Memory Attractor Cluster</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Visual: Dimension Profile Bar Chart + Cell Inspector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Recharts Bar Chart: Weight Dimension Intensity Profile */}
          <div className="rounded-xl border border-[#D9DCD8] bg-[#FFFFFF] p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-[#716F68]">
              <span>DIMENSION INTENSITY PROFILE</span>
              <span className="text-[#21445B] font-bold">Static + Plastic σ</span>
            </div>

            <div className="w-full h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dimensionProfileData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                  <XAxis
                    dataKey="dim"
                    tick={{ fontSize: 9, fill: '#716F68', fontFamily: 'monospace' }}
                  />
                  <YAxis
                    domain={[0, 0.8]}
                    tick={{ fontSize: 9, fill: '#716F68', fontFamily: 'monospace' }}
                  />
                  <Tooltip
                    formatter={(val: number) => val.toFixed(3)}
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: 8, fontSize: 11, border: '1px solid #D9DCD8' }}
                  />
                  <Bar dataKey="staticW" stackId="a" fill="#CDE1F0" name="Static Base Weight" />
                  <Bar
                    dataKey="plasticTrace"
                    stackId="a"
                    fill={currentStep === 3 ? '#F0C987' : '#2B6282'}
                    name="Plastic State σ_ij"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[10px] text-[#716F68] font-sans flex items-center justify-between">
              <span>Notice how plastic state σ expands selectively on active associative neurons.</span>
            </div>
          </div>

          {/* Synaptic Channel Inspector Card */}
          <div className="rounded-xl border border-[#D9DCD8] bg-[#FAF8F5] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-2">
              <span className="text-xs font-serif font-bold text-[#151515]">
                Synapse Dimension Inspector
              </span>
              <span className="text-[11px] font-mono text-[#21445B] bg-[#E7F2FA] px-1.5 py-0.5 rounded">
                {selectedCell ? `${selectedCell.dimension}` : 'Click any matrix cell'}
              </span>
            </div>

            {selectedCell ? (
              <div className="space-y-2.5 text-xs font-sans">
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="bg-[#FFFFFF] p-2 rounded-lg border border-[#E5E0D8]">
                    <span className="text-[#716F68] block text-[9px]">STATIC BASE W</span>
                    <span className="font-bold text-[#151515]">{selectedCell.weight}</span>
                  </div>
                  <div className="bg-[#FFFFFF] p-2 rounded-lg border border-[#E5E0D8]">
                    <span className="text-[#716F68] block text-[9px]">PLASTIC STATE σ(t)</span>
                    <span className="font-bold text-[#21445B]">{selectedCell.plasticState}</span>
                  </div>
                  <div className="bg-[#FFFFFF] p-2 rounded-lg border border-[#E5E0D8]">
                    <span className="text-[#716F68] block text-[9px]">EFFECTIVE WEIGHT</span>
                    <span className="font-bold text-[#245B38]">
                      {(selectedCell.weight + selectedCell.plasticState).toFixed(3)}
                    </span>
                  </div>
                  <div className="bg-[#FFFFFF] p-2 rounded-lg border border-[#E5E0D8]">
                    <span className="text-[#716F68] block text-[9px]">CLUSTER PARTICIPANT</span>
                    <span className={`font-bold ${selectedCell.isKeyCluster ? 'text-[#B08928]' : 'text-[#716F68]'}`}>
                      {selectedCell.isKeyCluster ? 'Yes (Recall Core)' : 'Background'}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-[#5F625F] leading-snug">
                  {selectedCell.isKeyCluster
                    ? `Synapse (${selectedCell.i} → ${selectedCell.j}) is an activated associative link. During ${currentState.timeLabel}, Hebbian plasticity modifies its connection strength.`
                    : `Synapse (${selectedCell.i} → ${selectedCell.j}) connects quiescent units. Its plastic contribution remains at basal baseline.`}
                </p>
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-[#716F68]">
                <Activity className="w-5 h-5 mx-auto text-[#A2A5A0] mb-1" />
                <span>Click any cell in the Recharts scatter matrix above to inspect its real-time weight decomposition.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

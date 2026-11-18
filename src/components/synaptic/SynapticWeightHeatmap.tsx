import React, { useState, useMemo } from 'react';
import { Activity, Play, Pause, RotateCcw, Info, Sliders, Sparkles } from 'lucide-react';

interface SynapticWeightHeatmapProps {
  numNeurons?: number;
  inputPattern?: 'Alpha' | 'Beta' | 'Gamma' | 'Orthogonal';
  synapticStrength?: number;
  recurrentSteps?: number;
}

export const SynapticWeightHeatmap: React.FC<SynapticWeightHeatmapProps> = ({
  numNeurons = 16,
  inputPattern = 'Alpha',
  synapticStrength = 0.5,
  recurrentSteps = 4,
}) => {
  // Number of visible matrix nodes in heatmap (subsampled for clarity: 8x8 or 12x12 or 16x16)
  const displayN = Math.min(16, Math.max(8, numNeurons > 24 ? 12 : numNeurons));

  // Time-step retrieval sequence playback state (0 = Initial Cue, 1 = Synaptic Read, 2 = State Propagation, 3 = Hebbian Consolidation, 4 = Settled Recall)
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hoveredCell, setHoveredCell] = useState<{
    i: number;
    j: number;
    baseWeight: number;
    plasticState: number;
    effectiveWeight: number;
    flux: number;
    isCoincident: boolean;
  } | null>(null);

  // Playback timer
  React.useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev >= 4 ? 0 : prev + 1));
    }, 1400);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Stage labels in the 4-phase BDH retrieval sequence
  const sequenceStages = [
    {
      step: 0,
      phase: 't=0 · Query Cue',
      desc: 'Sparse cue vector injected into input receptor neurons x_i(0)',
      formula: 'x_i(0) = InputCue_i',
      focus: 'Receptor injection',
    },
    {
      step: 1,
      phase: 't=1 · Synaptic Memory Read',
      desc: 'Synaptic connection matrix W_ij + σ_ij is read by incoming signals',
      formula: 'u_j(1) = \\sum_i (W_{ij} + \\sigma_{ij}) \\cdot x_i',
      focus: 'Plastic memory read',
    },
    {
      step: 2,
      phase: 't=2 · State Relaxation',
      desc: 'Top-K ReLU thresholding suppresses noise; active nodes crystallize',
      formula: 'x_j(2) = \\text{ReLU}(u_j(1) - \\theta)',
      focus: 'Sparse competitive selection',
    },
    {
      step: 3,
      phase: 't=3 · Hebbian Consolidation',
      desc: 'Coincident active pairs update plastic synapse state trace Δσ_ij',
      formula: '\\Delta\\sigma_{ij} = \\eta \\cdot x_i(2) \\cdot x_j(2)',
      focus: 'Synaptic reinforcement',
    },
    {
      step: 4,
      phase: 't=4 · Stabilized Attractor Recall',
      desc: 'Network relaxes into an associative memory basin with constant state size',
      formula: 'x^* = \\text{Fixpoint}(W + \\sigma)',
      focus: 'Converged associative retrieval',
    },
  ];

  // Deterministic calculation of synaptic matrix [N x N] for the current step and input pattern
  const matrixData = useMemo(() => {
    const matrix: {
      i: number;
      j: number;
      baseWeight: number;
      plasticState: number;
      effectiveWeight: number;
      flux: number;
      isCoincident: boolean;
    }[][] = [];

    // Seed patterns for different queries
    const patternBias =
      inputPattern === 'Alpha'
        ? [0, 1, 2, 4]
        : inputPattern === 'Beta'
        ? [2, 3, 5, 7]
        : inputPattern === 'Gamma'
        ? [1, 4, 6, 8]
        : [0, 3, 6, 9];

    for (let i = 0; i < displayN; i++) {
      const row = [];
      for (let j = 0; j < displayN; j++) {
        // Base structural weight with topological decay
        const dist = Math.min(Math.abs(i - j), displayN - Math.abs(i - j));
        const baseWeight = i === j ? 0 : Number((0.6 / (1 + dist * 0.8)).toFixed(3));

        // Memory association trace: pairs involved in active pattern receive plastic boost
        const iInPattern = patternBias.includes(i % 10);
        const jInPattern = patternBias.includes(j % 10);
        const isAssociated = iInPattern && jInPattern && i !== j;

        // Dynamics over sequence steps
        let plasticState = 0;
        let flux = 0;
        if (activeStep >= 1) {
          // Read stage
          plasticState = isAssociated ? 0.35 * synapticStrength : 0.05 * synapticStrength;
          flux = isAssociated ? 0.45 : 0.1;
        }
        if (activeStep >= 2) {
          // Propagation & thresholding stage
          plasticState = isAssociated ? 0.55 * synapticStrength : 0.08 * synapticStrength;
          flux = isAssociated ? 0.75 : 0.15;
        }
        if (activeStep >= 3) {
          // Hebbian consolidation
          plasticState = isAssociated ? 0.85 * synapticStrength : 0.12 * synapticStrength;
          flux = isAssociated ? 0.95 : 0.2;
        }
        if (activeStep === 4) {
          // Settled attractor
          plasticState = isAssociated ? 0.92 * synapticStrength : 0.09 * synapticStrength;
          flux = isAssociated ? 0.88 : 0.12;
        }

        const effectiveWeight = Number((baseWeight + plasticState).toFixed(3));

        row.push({
          i,
          j,
          baseWeight,
          plasticState: Number(plasticState.toFixed(3)),
          effectiveWeight,
          flux: Number(flux.toFixed(3)),
          isCoincident: isAssociated,
        });
      }
      matrix.push(row);
    }
    return matrix;
  }, [displayN, inputPattern, synapticStrength, activeStep]);

  // Color mapping function using semantic CSS vars
  const getCellColor = (effectiveWeight: number, isCoincident: boolean) => {
    if (effectiveWeight < 0.05) return 'bg-[var(--surface-soft)] text-[var(--text-muted)]';
    if (activeStep === 3 && isCoincident) {
      return 'bg-[var(--color-warning)] text-[var(--surface)] ring-1 ring-[var(--color-warning-border)] font-bold';
    }
    if (isCoincident) {
      if (effectiveWeight > 0.8) return 'bg-[var(--color-accent)] text-[var(--surface)] font-bold';
      if (effectiveWeight > 0.5) return 'bg-[var(--color-accent-hover)] text-[var(--surface)] font-medium';
      return 'bg-[var(--accent-blue)] text-[var(--accent-blue-text)] font-medium';
    }
    if (effectiveWeight > 0.4) return 'bg-[var(--accent-blue)] text-[var(--accent-blue-text)]';
    if (effectiveWeight > 0.2) return 'bg-[var(--color-surface-muted)] text-[var(--text-primary)]';
    return 'bg-[var(--surface-soft)] text-[var(--text-secondary)]';
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 space-y-6 shadow-xs text-[var(--text-primary)]">
      {/* Title & Playback Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-[var(--accent-blue-text)] bg-[var(--accent-blue)] px-2 py-0.5 rounded border border-[var(--border)]">
              Synaptic retrieval sequence
            </span>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              {displayN}×{displayN} Connection Matrix W_ij(t)
            </span>
          </div>
          <h4 className="text-base font-sans font-semibold text-[var(--text-primary)] mt-1">
            Synaptic Weight Activity &amp; Hebbian Plasticity Heatmap
          </h4>
          <p className="text-xs font-sans text-[var(--text-secondary)] mt-0.5 max-w-2xl">
            Watch how associative memory is retrieved directly through the synaptic tensor
            <code className="font-mono bg-[var(--surface-soft)] px-1 py-0.5 rounded text-[var(--accent-blue-text)] ml-1">
              W_ij + σ_ij(t)
            </code>
            without scanning a growing external key-value token cache.
          </p>
        </div>

        {/* Step Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--surface)] text-xs font-sans font-semibold transition-all shadow-xs cursor-pointer"
            title={isPlaying ? 'Pause sequence' : 'Play retrieval sequence'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Play Sequence'}</span>
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setActiveStep(0);
            }}
            className="p-1.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-soft)] text-[var(--text-secondary)] border border-[var(--border)] transition-all cursor-pointer"
            title="Reset to step 0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sequence Timeline Step Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {sequenceStages.map((st) => {
          const isCurrent = activeStep === st.step;
          return (
            <button
              key={st.step}
              onClick={() => {
                setIsPlaying(false);
                setActiveStep(st.step);
              }}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-[var(--accent-blue)] border-[var(--color-accent)] shadow-xs'
                  : 'bg-[var(--surface-soft)] border-[var(--border)] hover:bg-[var(--color-surface-muted)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono font-bold ${isCurrent ? 'text-[var(--accent-blue-text)]' : 'text-[var(--text-muted)]'}`}>
                  {st.phase.split('·')[0]}
                </span>
              </div>
              <div className={`text-xs font-sans font-semibold mt-1 leading-snug line-clamp-1 ${isCurrent ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                {st.focus}
              </div>
            </button>
          );
        })}
      </div>

      {/* Current Step Description Card */}
      <div className="p-3.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-[var(--text-primary)]">
              {sequenceStages[activeStep].phase}
            </span>
            <span className="text-[var(--text-muted)]">·</span>
            <span className="text-[var(--text-secondary)]">{sequenceStages[activeStep].desc}</span>
          </div>
          <div className="font-mono text-[11px] text-[var(--accent-blue-text)]">
            Mathematical formulation: {sequenceStages[activeStep].formula}
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 bg-[var(--surface)] px-2.5 py-1 rounded-md border border-[var(--border)] text-[11px] font-mono text-[var(--text-secondary)]">
          <Sparkles className="w-3 h-3 text-[var(--accent-yellow-text)]" />
          <span>Active Cue: {inputPattern}</span>
        </div>
      </div>

      {/* Heatmap Matrix & Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Heatmap Grid (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-muted)] font-mono px-1">
            <span>Source Neurons (Pre-synaptic i → Rows)</span>
            <span>Target Neurons (Post-synaptic j → Columns)</span>
          </div>

          <div className="overflow-x-auto p-2 bg-[var(--surface-soft)] rounded-xl border border-[var(--border)]">
            <div
              className="grid gap-1 min-w-[340px]"
              style={{
                gridTemplateColumns: `repeat(${displayN}, minmax(0, 1fr))`,
              }}
            >
              {matrixData.map((row, rIdx) =>
                row.map((cell, cIdx) => {
                  const isHovered =
                    hoveredCell?.i === cell.i && hoveredCell?.j === cell.j;
                  return (
                    <button
                      key={`${rIdx}-${cIdx}`}
                      onMouseEnter={() => setHoveredCell(cell)}
                      onClick={() => setHoveredCell(cell)}
                      className={`aspect-square rounded flex flex-col items-center justify-center p-0.5 text-[9px] sm:text-[10px] font-mono transition-all cursor-pointer relative tabular-nums ${getCellColor(
                        cell.effectiveWeight,
                        cell.isCoincident
                      )} ${isHovered ? 'ring-2 ring-[var(--text-primary)] z-10 scale-105 shadow-sm' : ''}`}
                      title={`Synapse (${cell.i} → ${cell.j}): W=${cell.effectiveWeight}, State=${cell.plasticState}`}
                    >
                      {cell.i === cell.j ? (
                        <span className="opacity-30">·</span>
                      ) : (
                        <span>{cell.effectiveWeight > 0.05 ? cell.effectiveWeight.toFixed(2) : '0'}</span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Color Scale Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[var(--text-secondary)] pt-1">
            <div className="flex items-center gap-1.5">
              <span>0.0 (Dormant)</span>
              <div className="flex h-3 w-32 rounded-sm overflow-hidden border border-[var(--border)]">
                <div className="w-1/5 bg-[var(--surface-soft)]" />
                <div className="w-1/5 bg-[var(--accent-blue)]" />
                <div className="w-1/5 opacity-60 bg-[var(--color-accent)]" />
                <div className="w-1/5 opacity-85 bg-[var(--color-accent)]" />
                <div className="w-1/5 bg-[var(--color-accent)]" />
              </div>
              <span>1.0+ (Saturated)</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[var(--color-warning)] border border-[var(--color-warning-border)]" />
                <span>Hebbian Coincident Spike</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[var(--color-accent)]" />
                <span>Consolidated Memory Link</span>
              </span>
            </div>
          </div>
        </div>

        {/* Selected Synaptic Channel Inspector (4 cols) */}
        <div className="lg:col-span-4 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
            <h5 className="text-xs font-sans font-semibold text-[var(--text-primary)]">
              Synapse Weight Inspector
            </h5>
            <span className="text-[11px] font-mono text-[var(--accent-blue-text)] bg-[var(--accent-blue)] px-1.5 py-0.5 rounded">
              {hoveredCell ? `Synapse (${hoveredCell.i} → ${hoveredCell.j})` : 'Hover matrix cell'}
            </span>
          </div>

          {hoveredCell ? (
            <div className="space-y-3 text-xs font-sans">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[var(--text-muted)] font-mono text-[11px]">
                  <span>Total Effective Weight W_eff:</span>
                  <span className="font-bold text-[var(--text-primary)] tabular-nums">{hoveredCell.effectiveWeight}</span>
                </div>
                <div className="w-full bg-[var(--border)] h-1.5 rounded-sm overflow-hidden">
                  <div
                    className="bg-[var(--color-accent)] h-full transition-all"
                    style={{ width: `${Math.min(100, hoveredCell.effectiveWeight * 80)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                <div className="bg-[var(--surface)] p-2 rounded-lg border border-[var(--border)]">
                  <span className="text-[var(--text-muted)] block text-[10px]">STATIC WEIGHT W_0</span>
                  <span className="font-bold text-[var(--text-primary)] tabular-nums">{hoveredCell.baseWeight}</span>
                </div>
                <div className="bg-[var(--surface)] p-2 rounded-lg border border-[var(--border)]">
                  <span className="text-[var(--text-muted)] block text-[10px]">PLASTIC STATE σ_ij</span>
                  <span className="font-bold text-[var(--accent-blue-text)] tabular-nums">{hoveredCell.plasticState}</span>
                </div>
                <div className="bg-[var(--surface)] p-2 rounded-lg border border-[var(--border)]">
                  <span className="text-[var(--text-muted)] block text-[10px]">SIGNAL FLUX</span>
                  <span className="font-bold text-[var(--accent-green-text)] tabular-nums">{hoveredCell.flux}</span>
                </div>
                <div className="bg-[var(--surface)] p-2 rounded-lg border border-[var(--border)]">
                  <span className="text-[var(--text-muted)] block text-[10px]">ASSOCIATED PAIR</span>
                  <span className={`font-bold ${hoveredCell.isCoincident ? 'text-[var(--accent-yellow-text)]' : 'text-[var(--text-muted)]'}`}>
                    {hoveredCell.isCoincident ? 'Yes (Active)' : 'No'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[11px] text-[var(--text-secondary)] leading-snug">
                {hoveredCell.isCoincident
                  ? 'This synapse connects two nodes within the current memory cluster. During retrieval, Hebbian coincidence reinforces its trace.'
                  : 'This synapse connects background non-associated units; its plastic contribution remains at basal baseline.'}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[var(--text-muted)] space-y-1">
              <Activity className="w-5 h-5 mx-auto text-[var(--text-muted)]" />
              <p>Hover over or click any cell in the heatmap to inspect its constituent static and plastic components.</p>
            </div>
          )}

          {/* Architectural Comparison Note */}
          <div className="pt-2 border-t border-[var(--border)] space-y-1.5 text-[11px] text-[var(--text-secondary)]">
            <span className="font-bold text-[var(--text-primary)] block">BDH vs. Standard KV Cache:</span>
            <p className="leading-snug">
              Standard transformers store tokens as an unbound <code className="font-mono text-[var(--accent-blue-text)]">L × d</code> key-value cache.
              BDH stores memory as distributed state inside <code className="font-mono text-[var(--accent-blue-text)]">W_ij</code>, bounding inference footprint to <code className="font-mono text-[var(--accent-blue-text)]">O(1)</code> space per token.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

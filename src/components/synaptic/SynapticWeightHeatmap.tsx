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

  // Color mapping function: soft academic indigo/teal/amber heat palette
  const getCellColor = (effectiveWeight: number, isCoincident: boolean, flux: number) => {
    if (effectiveWeight < 0.05) return 'bg-[#F7F5EF] text-[#A2A5A0]'; // dormant/zero
    if (activeStep === 3 && isCoincident) {
      // Hebbian ignition flash
      return 'bg-[#F0C987] text-[#4A3205] ring-1 ring-[#D8A856] font-bold';
    }
    if (isCoincident) {
      if (effectiveWeight > 0.8) return 'bg-[#2B6282] text-[#FFFFFF] font-bold';
      if (effectiveWeight > 0.5) return 'bg-[#4B84A6] text-[#FFFFFF] font-medium';
      return 'bg-[#89B9D4] text-[#142B38] font-medium';
    }
    if (effectiveWeight > 0.4) return 'bg-[#D2E4F0] text-[#1C3E52]';
    if (effectiveWeight > 0.2) return 'bg-[#E7F2FA] text-[#2D5873]';
    return 'bg-[#F1F3EE] text-[#696D68]';
  };

  return (
    <div className="rounded-2xl border border-[#D9DCD8] bg-[#FFFFFF] p-5 sm:p-6 space-y-6 shadow-xs">
      {/* Title & Playback Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE6DF] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#21445B] bg-[#E7F2FA] px-2 py-0.5 rounded border border-[#CDE1F0]">
              SYNAPTIC RETRIEVAL SEQUENCE
            </span>
            <span className="text-xs font-mono text-[#716F68]">
              {displayN}×{displayN} Connection Matrix W_ij(t)
            </span>
          </div>
          <h4 className="text-base font-serif font-bold text-[#151515] mt-1">
            Synaptic Weight Activity & Hebbian Plasticity Heatmap
          </h4>
          <p className="text-xs font-sans text-[#5F625F] mt-0.5 max-w-2xl">
            Watch how associative memory is retrieved directly through the synaptic tensor
            <code className="font-mono bg-[#F7F5EF] px-1 py-0.5 rounded text-[#21445B] ml-1">
              W_ij + σ_ij(t)
            </code>
            without scanning a growing external key-value token cache.
          </p>
        </div>

        {/* Step Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2B6282] hover:bg-[#214D66] text-[#FFFFFF] text-xs font-sans font-semibold transition-all shadow-xs cursor-pointer"
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
            className="p-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F7F5EF] text-[#5F625F] border border-[#D9DCD8] transition-all cursor-pointer"
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
                  ? 'bg-[#E7F2FA] border-[#2B6282] shadow-xs'
                  : 'bg-[#FAF8F5] border-[#EAE6DF] hover:bg-[#F2EFE8]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono font-bold ${isCurrent ? 'text-[#21445B]' : 'text-[#716F68]'}`}>
                  {st.phase.split('·')[0]}
                </span>
                {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-[#2B6282]" />}
              </div>
              <div className={`text-xs font-sans font-semibold mt-1 leading-snug line-clamp-1 ${isCurrent ? 'text-[#151515]' : 'text-[#5F625F]'}`}>
                {st.focus}
              </div>
            </button>
          );
        })}
      </div>

      {/* Current Step Description Card */}
      <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#151515]">
              {sequenceStages[activeStep].phase}
            </span>
            <span className="text-[#716F68]">·</span>
            <span className="text-[#5F625F]">{sequenceStages[activeStep].desc}</span>
          </div>
          <div className="font-mono text-[11px] text-[#21445B]">
            Mathematical formulation: {sequenceStages[activeStep].formula}
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 bg-[#FFFFFF] px-2.5 py-1 rounded-md border border-[#D9DCD8] text-[11px] font-mono text-[#5F625F]">
          <Sparkles className="w-3 h-3 text-[#B08928]" />
          <span>Active Cue: {inputPattern}</span>
        </div>
      </div>

      {/* Heatmap Matrix & Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Heatmap Grid (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between text-xs text-[#716F68] font-mono px-1">
            <span>Source Neurons (Pre-synaptic i → Rows)</span>
            <span>Target Neurons (Post-synaptic j → Columns)</span>
          </div>

          <div className="overflow-x-auto p-2 bg-[#FAF8F5] rounded-xl border border-[#E5E0D8]">
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
                      className={`aspect-square rounded flex flex-col items-center justify-center p-0.5 text-[9px] sm:text-[10px] font-mono transition-all cursor-pointer relative ${getCellColor(
                        cell.effectiveWeight,
                        cell.isCoincident,
                        cell.flux
                      )} ${isHovered ? 'ring-2 ring-[#151515] z-10 scale-105 shadow-sm' : ''}`}
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
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#5F625F] pt-1">
            <div className="flex items-center gap-1.5">
              <span>0.0 (Dormant)</span>
              <div className="flex h-3 w-32 rounded overflow-hidden border border-[#D9DCD8]">
                <div className="w-1/5 bg-[#F7F5EF]" />
                <div className="w-1/5 bg-[#E7F2FA]" />
                <div className="w-1/5 bg-[#89B9D4]" />
                <div className="w-1/5 bg-[#4B84A6]" />
                <div className="w-1/5 bg-[#2B6282]" />
              </div>
              <span>1.0+ (Saturated)</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-[#F0C987] border border-[#D8A856]" />
                <span>Hebbian Coincident Spike</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-[#2B6282]" />
                <span>Consolidated Memory Link</span>
              </span>
            </div>
          </div>
        </div>

        {/* Selected Synaptic Channel Inspector (4 cols) */}
        <div className="lg:col-span-4 rounded-xl border border-[#D9DCD8] bg-[#FAF8F5] p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-2">
            <h5 className="text-xs font-serif font-bold text-[#151515]">
              Synapse Weight Inspector
            </h5>
            <span className="text-[11px] font-mono text-[#21445B] bg-[#E7F2FA] px-1.5 py-0.5 rounded">
              {hoveredCell ? `Synapse (${hoveredCell.i} → ${hoveredCell.j})` : 'Hover matrix cell'}
            </span>
          </div>

          {hoveredCell ? (
            <div className="space-y-3 text-xs font-sans">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[#716F68] font-mono text-[11px]">
                  <span>Total Effective Weight W_eff:</span>
                  <span className="font-bold text-[#151515]">{hoveredCell.effectiveWeight}</span>
                </div>
                <div className="w-full bg-[#E5E0D8] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#2B6282] h-full transition-all"
                    style={{ width: `${Math.min(100, hoveredCell.effectiveWeight * 80)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                <div className="bg-[#FFFFFF] p-2 rounded-lg border border-[#E5E0D8]">
                  <span className="text-[#716F68] block text-[9px]">STATIC WEIGHT W_0</span>
                  <span className="font-bold text-[#151515]">{hoveredCell.baseWeight}</span>
                </div>
                <div className="bg-[#FFFFFF] p-2 rounded-lg border border-[#E5E0D8]">
                  <span className="text-[#716F68] block text-[9px]">PLASTIC STATE σ_ij</span>
                  <span className="font-bold text-[#21445B]">{hoveredCell.plasticState}</span>
                </div>
                <div className="bg-[#FFFFFF] p-2 rounded-lg border border-[#E5E0D8]">
                  <span className="text-[#716F68] block text-[9px]">SIGNAL FLUX</span>
                  <span className="font-bold text-[#247A4B]">{hoveredCell.flux}</span>
                </div>
                <div className="bg-[#FFFFFF] p-2 rounded-lg border border-[#E5E0D8]">
                  <span className="text-[#716F68] block text-[9px]">ASSOCIATED PAIR</span>
                  <span className={`font-bold ${hoveredCell.isCoincident ? 'text-[#B08928]' : 'text-[#716F68]'}`}>
                    {hoveredCell.isCoincident ? 'Yes (Active)' : 'No'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#EAE6DF] text-[11px] text-[#5F625F] leading-snug">
                {hoveredCell.isCoincident
                  ? 'This synapse connects two nodes within the current memory cluster. During retrieval, Hebbian coincidence reinforces its trace.'
                  : 'This synapse connects background non-associated units; its plastic contribution remains at basal baseline.'}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[#716F68] space-y-1">
              <Activity className="w-5 h-5 mx-auto text-[#A2A5A0]" />
              <p>Hover over or click any cell in the heatmap to inspect its constituent static and plastic components.</p>
            </div>
          )}

          {/* Architectural Comparison Note */}
          <div className="pt-2 border-t border-[#EAE6DF] space-y-1.5 text-[11px] text-[#5F625F]">
            <span className="font-bold text-[#252525] block">BDH vs. Standard KV Cache:</span>
            <p className="leading-snug">
              Standard transformers store tokens as an unbound <code className="font-mono text-[#21445B]">L × d</code> key-value cache.
              BDH stores memory as distributed state inside <code className="font-mono text-[#21445B]">W_ij</code>, bounding inference footprint to <code className="font-mono text-[#21445B]">O(1)</code> space per token.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

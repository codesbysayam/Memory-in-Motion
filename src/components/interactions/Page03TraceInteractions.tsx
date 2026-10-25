import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Layers,
  ArrowRight,
  Sparkles,
  Search,
  Eye,
  Info,
} from 'lucide-react';
import { Fact, vector, CANONICAL_FACTS } from '../../models/associativeMemory';
import { InlineMath, BlockMath } from '../ui/MathView';

export const Page03TraceInteractions: React.FC = () => {
  const dim = 8;
  const facts: Fact[] = useMemo(() => CANONICAL_FACTS.slice(0, 6), []);

  // Pre-record exact states at every timestep t0 -> tN
  const recordedSteps = useMemo(() => {
    let M: number[][] = Array.from({ length: dim }, () => Array(dim).fill(0));
    const list: Array<{
      step: number;
      fact: Fact | null;
      matrix: number[][];
      vector: number[];
      norm: number;
    }> = [];

    // t0 Initial
    list.push({
      step: 0,
      fact: null,
      matrix: M.map((row) => [...row]),
      vector: Array(dim).fill(0),
      norm: 0,
    });

    facts.forEach((f, idx) => {
      const k = vector(f.key, dim);
      const v = vector(f.value, dim);
      const nextM = Array.from({ length: dim }, (_, r) =>
        Array.from({ length: dim }, (_, c) => (M[r][c] || 0) * 0.95 + 0.8 * (k[r] || 0) * (v[c] || 0))
      );

      // Readout vector for probe 'Japan'
      const q = vector('Japan', dim);
      const vec = Array(dim).fill(0);
      let sumSq = 0;
      for (let j = 0; j < dim; j++) {
        for (let i = 0; i < dim; i++) {
          vec[j] += (q[i] || 0) * (nextM[i]?.[j] || 0);
          sumSq += nextM[i][j] * nextM[i][j];
        }
      }

      M = nextM;
      list.push({
        step: idx + 1,
        fact: f,
        matrix: M.map((row) => [...row]),
        vector: vec,
        norm: Math.sqrt(sumSq),
      });
    });

    return list;
  }, [dim, facts]);

  // 1. Timeline Scrubber State
  const [currentStep, setCurrentStep] = useState<number>(recordedSteps.length - 1);
  const activeSnapshot = recordedSteps[currentStep] || recordedSteps[0];
  const initialSnapshot = recordedSteps[0];

  // 2. Before / After Toggle
  const [viewMode, setViewMode] = useState<'current' | 'initial' | 'delta'>('current');

  // 3. Coordinate Inspector State
  const [selectedCoord, setSelectedCoord] = useState<{ r: number; c: number }>({ r: 2, c: 3 });

  // 4. State Difference Animation State (Play / Pause / Step)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = window.setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= recordedSteps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 800);
    return () => clearInterval(interval);
  }, [isPlaying, recordedSteps.length]);

  // Selected coordinate delta calculation
  const coordInspection = useMemo(() => {
    const r = selectedCoord.r;
    const c = selectedCoord.c;
    const prevMat = currentStep > 0 ? recordedSteps[currentStep - 1].matrix : initialSnapshot.matrix;
    const currMat = activeSnapshot.matrix;

    const beforeVal = prevMat[r]?.[c] || 0;
    const afterVal = currMat[r]?.[c] || 0;
    const deltaVal = afterVal - beforeVal;

    return { beforeVal, afterVal, deltaVal };
  }, [selectedCoord, currentStep, recordedSteps, initialSnapshot, activeSnapshot]);

  return (
    <div className="space-y-8 mt-6">
      {/* 1. TIMELINE SCRUBBER & ANIMATION CONTROLLER */}
      <div className="rounded-xl border border-[#D8DCD8] bg-[#FFFFFF] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6DF] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#E7F2FA] text-[#31566E]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#252525]">
                1. Trajectory Timeline Scrubber & Replay
              </h3>
              <p className="text-xs text-[#5F625F]">
                Drag the scrubber to inspect recorded states across sequence ingestion without recalculating divergent trajectories.
              </p>
            </div>
          </div>

          {/* Animation Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#31566E] hover:bg-[#264457] text-white text-xs font-medium transition cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Play Trajectory'}</span>
            </button>
            <button
              onClick={() => setCurrentStep((prev) => Math.min(prev + 1, recordedSteps.length - 1))}
              disabled={currentStep >= recordedSteps.length - 1}
              className="p-1.5 rounded-lg border border-[#D8DCD8] bg-[#F7F5EF] text-[#252525] hover:bg-[#FFFFFF] text-xs transition cursor-pointer disabled:opacity-40"
              title="Step forward"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentStep(0);
              }}
              className="p-1.5 rounded-lg border border-[#D8DCD8] bg-[#F7F5EF] text-[#252525] hover:bg-[#FFFFFF] text-xs transition cursor-pointer"
              title="Reset to t0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scrubber Range Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#5F625F]">
              Timestep: <strong className="font-mono text-[#31566E] text-sm">t = {activeSnapshot.step} / {recordedSteps.length - 1}</strong>
            </span>
            <span className="font-sans text-xs text-[#252525]">
              {activeSnapshot.fact ? `Ingested: ${activeSnapshot.fact.key} → ${activeSnapshot.fact.value}` : 'Initial state M_0'}
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={recordedSteps.length - 1}
            value={currentStep}
            onChange={(e) => {
              setIsPlaying(false);
              setCurrentStep(parseInt(e.target.value, 10));
            }}
            className="w-full accent-[#31566E] cursor-pointer"
          />

          <div className="flex justify-between text-[10px] font-mono text-[#5F625F]">
            {recordedSteps.map((s) => (
              <span key={s.step} className={s.step === currentStep ? 'font-bold text-[#31566E]' : ''}>
                t_{s.step}
              </span>
            ))}
          </div>
        </div>

        {/* 2. BEFORE / AFTER TOGGLE & MATRIX DISPLAY */}
        <div className="pt-2 border-t border-[#EAE6DF] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[#5F625F]">View State:</span>
              <button
                onClick={() => setViewMode('current')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  viewMode === 'current' ? 'bg-[#31566E] text-white font-bold' : 'bg-[#F7F5EF] text-[#5F625F]'
                }`}
              >
                Current State (M_{activeSnapshot.step})
              </button>
              <button
                onClick={() => setViewMode('initial')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  viewMode === 'initial' ? 'bg-[#31566E] text-white font-bold' : 'bg-[#F7F5EF] text-[#5F625F]'
                }`}
              >
                Initial (M_0)
              </button>
              <button
                onClick={() => setViewMode('delta')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  viewMode === 'delta' ? 'bg-[#31566E] text-white font-bold' : 'bg-[#F7F5EF] text-[#5F625F]'
                }`}
              >
                Delta Shift (ΔM)
              </button>
            </div>

            <span className="font-mono text-xs text-[#5F625F]">
              Frobenius Norm: <strong className="text-[#252525]">{activeSnapshot.norm.toFixed(4)}</strong>
            </span>
          </div>

          {/* Matrix Heatmap with Clickable Coordinates */}
          <div className="matrix-scroll overflow-x-auto py-1 bg-[#F7F5EF] p-4 rounded-xl border border-[#D8DCD8]">
            <div
              className="grid gap-1 min-w-[320px]"
              style={{ gridTemplateColumns: `repeat(${dim}, minmax(0, 1fr))` }}
            >
              {activeSnapshot.matrix.map((row, r) =>
                row.map((val, c) => {
                  let displayVal = val;
                  if (viewMode === 'initial') displayVal = initialSnapshot.matrix[r][c];
                  if (viewMode === 'delta') {
                    const prevM = currentStep > 0 ? recordedSteps[currentStep - 1].matrix : initialSnapshot.matrix;
                    displayVal = val - (prevM[r][c] || 0);
                  }

                  const isSelected = selectedCoord.r === r && selectedCoord.c === c;
                  const abs = Math.min(1, Math.abs(displayVal));
                  const isPos = displayVal >= 0;

                  return (
                    <button
                      key={`${r}-${c}`}
                      onClick={() => setSelectedCoord({ r, c })}
                      title={`Click to inspect M[${r},${c}]`}
                      className={`h-7 rounded text-[10px] font-mono flex items-center justify-center transition cursor-pointer ${
                        isSelected ? 'ring-2 ring-[#252525] scale-105 z-10 font-bold' : ''
                      }`}
                      style={{
                        backgroundColor: isPos
                          ? `rgba(49, 86, 110, ${abs * 0.75 + 0.08})`
                          : `rgba(182, 66, 53, ${abs * 0.75 + 0.08})`,
                        color: abs > 0.45 ? '#FFFFFF' : '#252525',
                      }}
                    >
                      {displayVal.toFixed(1)}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. COORDINATE INSPECTOR CARD */}
      <div className="rounded-xl border border-[#D8DCD8] bg-[#FFFFFF] p-5 sm:p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 border-b border-[#EAE6DF] pb-3">
          <div className="p-1.5 rounded-lg bg-[#FFF5D8] text-[#A46622]">
            <Search className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-[#252525]">
              2. Coordinate Inspector (Cell Level)
            </h3>
            <p className="text-xs text-[#5F625F]">
              Inspecting cell coordinate <InlineMath math={`M[${selectedCoord.r}, ${selectedCoord.c}]`} /> at step <InlineMath math={`t = ${currentStep}`} />.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl border border-[#D8DCD8] bg-[#F7F5EF] space-y-1">
            <span className="text-[#5F625F] uppercase font-semibold text-[11px] block">
              Before Ingestion (<InlineMath math="t_{k-1}" />)
            </span>
            <div className="text-base font-mono font-bold text-[#252525]">
              {coordInspection.beforeVal.toFixed(4)}
            </div>
            <span className="text-[11px] text-[#5F625F]">Prior coordinate charge</span>
          </div>

          <div className="p-3.5 rounded-xl border border-[#D8DCD8] bg-[#F7F5EF] space-y-1">
            <span className="text-[#5F625F] uppercase font-semibold text-[11px] block">
              After Ingestion (<InlineMath math="t_k" />)
            </span>
            <div className="text-base font-mono font-bold text-[#31566E]">
              {coordInspection.afterVal.toFixed(4)}
            </div>
            <span className="text-[11px] text-[#5F625F]">Superimposed coordinate charge</span>
          </div>

          <div className="p-3.5 rounded-xl border border-[#D8DCD8] bg-[#E7F2FA] text-[#31566E] space-y-1">
            <span className="uppercase font-semibold text-[11px] block">
              Coordinate Delta (<InlineMath math="\Delta M_{ij}" />)
            </span>
            <div className="text-base font-mono font-bold">
              {coordInspection.deltaVal >= 0 ? `+${coordInspection.deltaVal.toFixed(4)}` : coordInspection.deltaVal.toFixed(4)}
            </div>
            <span className="text-[11px]">
              Exact Hebbian outer-product contribution: <InlineMath math="\eta k_i v_j" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

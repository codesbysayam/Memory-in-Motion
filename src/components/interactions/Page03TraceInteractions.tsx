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
      <div className="diagram-frame p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[var(--accent-blue)] text-[var(--accent-blue-text)]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[var(--text-primary)]">
                1. Trajectory timeline scrubber &amp; replay
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Drag the scrubber to inspect recorded states across sequence ingestion without recalculating divergent trajectories.
              </p>
            </div>
          </div>

          {/* Animation Controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="btn-primary text-xs"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Play trajectory'}</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.min(prev + 1, recordedSteps.length - 1))}
              disabled={currentStep >= recordedSteps.length - 1}
              className="icon-button disabled:opacity-40"
              title="Step forward"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setCurrentStep(0);
              }}
              className="icon-button"
              title="Reset to t0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scrubber Range Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--text-secondary)]">
              Timestep:{' '}
              <strong className="font-mono text-[var(--accent-blue-text)] text-sm tabular-nums">
                t = {activeSnapshot.step} / {recordedSteps.length - 1}
              </strong>
            </span>
            <span className="font-sans text-xs text-[var(--text-primary)]">
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
            className="w-full accent-[var(--color-accent)] cursor-pointer"
          />

          <div className="flex justify-between text-[11px] font-mono text-[var(--text-secondary)] tabular-nums">
            {recordedSteps.map((s) => (
              <span key={s.step} className={s.step === currentStep ? 'font-bold text-[var(--accent-blue-text)]' : ''}>
                t_{s.step}
              </span>
            ))}
          </div>
        </div>

        {/* 2. BEFORE / AFTER TOGGLE & MATRIX DISPLAY */}
        <div className="pt-2 border-t border-[var(--border)] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-semibold text-[var(--text-secondary)]">View state:</span>
              <button
                type="button"
                onClick={() => setViewMode('current')}
                className={`px-2.5 py-1 rounded-md border transition cursor-pointer ${
                  viewMode === 'current'
                    ? 'bg-[var(--accent-blue)] border-[var(--color-accent)] text-[var(--accent-blue-text)] font-bold'
                    : 'bg-[var(--surface-soft)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Current state (M_{activeSnapshot.step})
              </button>
              <button
                type="button"
                onClick={() => setViewMode('initial')}
                className={`px-2.5 py-1 rounded-md border transition cursor-pointer ${
                  viewMode === 'initial'
                    ? 'bg-[var(--accent-blue)] border-[var(--color-accent)] text-[var(--accent-blue-text)] font-bold'
                    : 'bg-[var(--surface-soft)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Initial (M_0)
              </button>
              <button
                type="button"
                onClick={() => setViewMode('delta')}
                className={`px-2.5 py-1 rounded-md border transition cursor-pointer ${
                  viewMode === 'delta'
                    ? 'bg-[var(--accent-blue)] border-[var(--color-accent)] text-[var(--accent-blue-text)] font-bold'
                    : 'bg-[var(--surface-soft)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Delta shift (ΔM)
              </button>
            </div>

            <span className="font-mono text-xs text-[var(--text-secondary)] tabular-nums">
              Frobenius norm: <strong className="text-[var(--text-primary)]">{activeSnapshot.norm.toFixed(4)}</strong>
            </span>
          </div>

          {/* Matrix Heatmap with Clickable Coordinates */}
          <div className="matrix-scroll overflow-x-auto bg-[var(--color-matrix-bg)] p-4 rounded-xl border border-[var(--color-matrix-border)]">
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
                      type="button"
                      onClick={() => setSelectedCoord({ r, c })}
                      title={`Click to inspect M[${r},${c}]`}
                      className={`h-7 rounded text-[11px] font-mono tabular-nums flex items-center justify-center transition cursor-pointer ${
                        isSelected ? 'ring-2 ring-[var(--color-matrix-ink)] scale-105 z-10 font-bold' : ''
                      }`}
                      style={{
                        backgroundColor: isPos
                          ? `rgba(76, 154, 255, ${abs * 0.72 + 0.14})`
                          : `rgba(229, 98, 90, ${abs * 0.72 + 0.14})`,
                        color: 'var(--color-matrix-ink)',
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
      <div className="diagram-frame p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
          <div className="p-1.5 rounded-lg bg-[var(--accent-yellow)] text-[var(--accent-yellow-text)]">
            <Search className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-[var(--text-primary)]">
              2. Coordinate inspector (cell level)
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Inspecting cell coordinate <InlineMath math={`M[${selectedCoord.r}, ${selectedCoord.c}]`} /> at step <InlineMath math={`t = ${currentStep}`} />.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="metric-panel space-y-1">
            <span className="text-[var(--text-secondary)] uppercase font-semibold text-[11px] block">
              Before ingestion (<InlineMath math="t_{k-1}" />)
            </span>
            <div className="text-base font-mono font-bold text-[var(--text-primary)] tabular-nums">
              {coordInspection.beforeVal.toFixed(4)}
            </div>
            <span className="text-[11px] text-[var(--text-secondary)]">Prior coordinate charge</span>
          </div>

          <div className="metric-panel space-y-1">
            <span className="text-[var(--text-secondary)] uppercase font-semibold text-[11px] block">
              After ingestion (<InlineMath math="t_k" />)
            </span>
            <div className="text-base font-mono font-bold text-[var(--accent-blue-text)] tabular-nums">
              {coordInspection.afterVal.toFixed(4)}
            </div>
            <span className="text-[11px] text-[var(--text-secondary)]">Superimposed coordinate charge</span>
          </div>

          <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--accent-blue)] text-[var(--accent-blue-text)] space-y-1">
            <span className="uppercase font-semibold text-[11px] block">
              Coordinate delta (<InlineMath math="\Delta M_{ij}" />)
            </span>
            <div className="text-base font-mono font-bold tabular-nums">
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

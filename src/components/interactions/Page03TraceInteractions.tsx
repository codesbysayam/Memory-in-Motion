import React, { useState, useEffect, useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
} from 'lucide-react';
import { Fact, vector, CANONICAL_FACTS } from '../../models/associativeMemory';
import { InlineMath } from '../ui/MathView';
import { FigureCaption } from '../essay/FigureCaption';

export const Page03TraceInteractions: React.FC = () => {
  const reducedMotion = useReducedMotion();
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

  const stepExplanation = useMemo(() => {
    if (currentStep === 0) {
      return 'Step t = 0 (Blank State): Every coordinate in M_0 is initialized to 0.000. No associations have been compressed yet.';
    }
    const prevNorm = recordedSteps[currentStep - 1]?.norm ?? 0;
    const normDelta = activeSnapshot.norm - prevNorm;
    const factLabel = activeSnapshot.fact ? `${activeSnapshot.fact.key} → ${activeSnapshot.fact.value}` : 'fact';
    return `Step t = ${currentStep} (${factLabel}): Existing matrix weights were scaled by λ = 0.95, then added rank-1 outer product η k vᵀ (η = 0.80). Frobenius norm shifted by ${normDelta >= 0 ? '+' : ''}${normDelta.toFixed(3)} to ${activeSnapshot.norm.toFixed(3)}.`;
  }, [currentStep, recordedSteps, activeSnapshot]);

  return (
    <div className="space-y-8 mt-4">
      {/* 1. TIMELINE SCRUBBER & MANUAL STEP CONTROLLER */}
      <figure className="essay-figure-stage p-5 sm:p-7 space-y-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[var(--mm-rule)] pb-4">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--mm-signal)] font-semibold block mb-1">
              Fig. 3.1 · Forensic timeline scrubber &amp; manual trace
            </span>
            <h3 className="font-sans text-lg sm:text-xl font-semibold text-[var(--mm-ink)]">
              Step forward and backward through saved matrices without recalculating
            </h3>
            <p className="text-xs text-[var(--mm-muted)] mt-1">
              Use manual Step Back / Step Forward controls or drag the scrubber across sequence ingestion (<InlineMath math="t_0 \rightarrow t_N" />).
            </p>
          </div>

          {/* Manual Step + Playback Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setCurrentStep((prev) => Math.max(0, prev - 1));
              }}
              disabled={currentStep <= 0}
              className="btn-secondary text-xs disabled:opacity-40"
              title="Step backward one write"
              aria-label="Step backward"
            >
              <SkipBack className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setCurrentStep((prev) => Math.min(prev + 1, recordedSteps.length - 1));
              }}
              disabled={currentStep >= recordedSteps.length - 1}
              className="btn-secondary text-xs disabled:opacity-40"
              title="Step forward one write"
              aria-label="Step forward"
            >
              <span>Forward</span>
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="btn-primary text-xs"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setCurrentStep(0);
              }}
              className="icon-button"
              title="Reset to t0"
              aria-label="Reset trace to t0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Synchronized Static Step Explanation */}
        <motion.div
          key={`trace-step-${currentStep}`}
          initial={reducedMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="border-l-2 border-[var(--mm-signal)] pl-4 py-1 text-xs sm:text-sm text-[var(--text-secondary)] font-sans leading-relaxed"
        >
          {stepExplanation}
        </motion.div>

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

          <div className="relative h-1.5 w-full rounded-full bg-[var(--mm-rule)] overflow-hidden mb-1">
            <div
              className="h-full bg-[var(--mm-signal)] transition-[width] duration-300"
              style={{
                width: `${(currentStep / Math.max(1, recordedSteps.length - 1)) * 100}%`,
              }}
            />
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
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStep(s.step);
                }}
                className={`cursor-pointer hover:text-[var(--mm-ink)] ${
                  s.step === currentStep ? 'font-bold text-[var(--accent-blue-text)] underline underline-offset-4' : ''
                }`}
              >
                t_{s.step}
              </button>
            ))}
          </div>
        </div>

        {/* 2. BEFORE / AFTER TOGGLE & MATRIX DISPLAY */}
        <div className="pt-3 border-t border-[var(--mm-rule)] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-1 border-b border-[var(--mm-rule)]">
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--mm-muted)] pr-3 pb-1.5">
                Snapshot
              </span>
              {([
                { key: 'current', label: `Current state (M_${activeSnapshot.step})` },
                { key: 'initial', label: 'Initial (M_0)' },
                { key: 'delta', label: 'Delta shift (ΔM)' },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setViewMode(tab.key)}
                  className={`px-3 pb-1.5 font-mono text-xs transition cursor-pointer border-b-2 -mb-[1px] ${
                    viewMode === tab.key
                      ? 'border-[var(--mm-signal)] text-[var(--mm-ink)] font-semibold'
                      : 'border-transparent text-[var(--mm-muted)] hover:text-[var(--mm-ink)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span className="font-mono text-xs text-[var(--mm-muted)] tabular-nums">
              Frobenius norm <strong className="text-[var(--mm-ink)]">{activeSnapshot.norm.toFixed(4)}</strong>
            </span>
          </div>

          {/* Matrix Heatmap with Clickable Coordinates */}
          <div className="matrix-scroll overflow-x-auto bg-[var(--color-matrix-bg)] p-4 rounded-md border border-[var(--color-matrix-border)]">
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
                      className={`h-7 rounded-sm text-[11px] font-mono tabular-nums flex items-center justify-center transition-all duration-300 cursor-pointer ${
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

        {/* 3. COORDINATE INSPECTOR STRIP (Hairline Divide) */}
        <div className="pt-4 border-t border-[var(--mm-rule)] space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-mono text-xs text-[var(--mm-ink)] font-semibold">
              Cell coordinate <InlineMath math={`M[${selectedCoord.r}, ${selectedCoord.c}]`} /> at step <InlineMath math={`t = ${currentStep}`} />
            </span>
            <span className="text-xs text-[var(--mm-muted)]">
              Click any matrix cell above to inspect its local outer-product update.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[var(--mm-rule)] border border-[var(--mm-rule)] bg-[var(--mm-paper-bright)] rounded-md text-xs">
            <div className="p-3.5 space-y-1">
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--mm-muted)] block">
                Before (<InlineMath math="t_{k-1}" />)
              </span>
              <div className="text-base font-mono font-semibold text-[var(--mm-ink)] tabular-nums">
                {coordInspection.beforeVal.toFixed(4)}
              </div>
              <span className="text-[11px] text-[var(--mm-muted)]">Prior coordinate value</span>
            </div>

            <div className="p-3.5 space-y-1">
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--mm-muted)] block">
                After (<InlineMath math="t_k" />)
              </span>
              <div className="text-base font-mono font-semibold text-[var(--mm-signal)] tabular-nums">
                {coordInspection.afterVal.toFixed(4)}
              </div>
              <span className="text-[11px] text-[var(--mm-muted)]">Superposed coordinate charge</span>
            </div>

            <div className="p-3.5 space-y-1">
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--mm-signal)] block">
                Delta (<InlineMath math="\Delta M_{ij}" />)
              </span>
              <div className="text-base font-mono font-semibold text-[var(--mm-ink)] tabular-nums">
                {coordInspection.deltaVal >= 0 ? `+${coordInspection.deltaVal.toFixed(4)}` : coordInspection.deltaVal.toFixed(4)}
              </div>
              <span className="text-[11px] text-[var(--mm-muted)]">
                Outer-product contribution: <InlineMath math="\eta k_i v_j" />
              </span>
            </div>
          </div>
        </div>

        <FigureCaption
          figure="Fig. 3.1"
          title="Every incoming fact adds a rank-1 matrix update across the exact same D×D coordinates."
          source="Deterministic replay over 8×8 toy matrix state (λ = 0.95, η = 0.80)"
          note="Units are raw coordinate weights in ℝ^(8×8)."
        />
      </figure>
    </div>
  );
};

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, RotateCcw, SkipForward, HelpCircle, Activity, Layers, Database, ArrowRight, Repeat } from 'lucide-react';
import { Fact, createAssociativeMemory, vector, cosine } from '../models/associativeMemory';
import { StateInspectionDetail } from '../models/types';
import { TruthModelComparison } from './TruthModelComparison';
import { useMemoryLens } from '../context/MemoryLensContext';
import { MathView } from './ui/MathView';

interface MemoryInspectorProps {
  facts: Fact[];
  queryKey: string;
  dim: number;
  retention: number;
  writeStrength: number;
  step?: number;
  onStepChange?: (currentStep: number) => void;
}

export const MemoryInspector: React.FC<MemoryInspectorProps> = ({
  facts,
  queryKey,
  dim,
  retention,
  writeStrength,
  step,
  onStepChange,
}) => {
  const isControlled = typeof step === 'number';
  const [internalStep, setInternalStep] = useState<number>(facts.length);
  const currentStep = isControlled ? Math.min(step, facts.length) : Math.min(internalStep, facts.length);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [hoveredCell, setHoveredCell] = useState<StateInspectionDetail & { row?: number; col?: number } | null>(null);
  const timerRef = useRef<number | null>(null);
  const { isLensActive, activeStage } = useMemoryLens();

  // Centralized step update function outside of render cycle
  const changeStep = (newStep: number) => {
    const clamped = Math.max(0, Math.min(newStep, facts.length));
    if (!isControlled) {
      setInternalStep(clamped);
    }
    onStepChange?.(clamped);
  };

  // Keep refs for interval callback to avoid side-effects inside state updaters
  const currentStepRef = useRef(currentStep);
  currentStepRef.current = currentStep;

  const factsLengthRef = useRef(facts.length);
  factsLengthRef.current = facts.length;

  const isLoopingRef = useRef(isLooping);
  isLoopingRef.current = isLooping;

  const changeStepRef = useRef(changeStep);
  changeStepRef.current = changeStep;

  // Step ticker with loop support
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = window.setInterval(() => {
      const cur = currentStepRef.current;
      const max = factsLengthRef.current;
      if (cur >= max) {
        if (isLoopingRef.current) {
          changeStepRef.current(0);
        } else {
          setIsPlaying(false);
        }
      } else {
        changeStepRef.current(cur + 1);
      }
    }, 750);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying]);

  // Compute memory deterministically up to currentStep
  const { currentMatrix, matrixHistory, queryResult, stateVector, stateHistory, stateNorm, activeUnits } =
    useMemo(() => {
      const activeFacts = facts.slice(0, currentStep);
      const memory = createAssociativeMemory(facts, dim, retention, writeStrength);

      const sHistory: number[][] = [Array(dim).fill(0)];
      activeFacts.forEach((f) => {
        memory.writeFact(f);
        const mat = memory.getMatrix();
        const diagonalOrSummary = mat.map((row, rIdx) => row[rIdx % dim]);
        sHistory.push(diagonalOrSummary);
      });

      const fullMat = memory.getMatrix();
      const qRes = memory.query(queryKey);
      const currentStateVec = sHistory[sHistory.length - 1];

      const norm = Math.sqrt(currentStateVec.reduce((acc, v) => acc + v * v, 0));
      const active = currentStateVec.filter((v) => Math.abs(v) > 0.05).length;

      return {
        currentMatrix: fullMat,
        matrixHistory: memory.getHistory(),
        queryResult: qRes,
        stateVector: currentStateVec,
        stateHistory: sHistory,
        stateNorm: norm,
        activeUnits: active,
      };
    }, [facts, currentStep, dim, retention, writeStrength, queryKey]);

  const handleReset = () => {
    setIsPlaying(false);
    changeStep(0);
  };

  const handleStep = () => {
    setIsPlaying(false);
    if (currentStep >= facts.length) {
      changeStep(0);
    } else {
      changeStep(currentStep + 1);
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (currentStep >= facts.length) {
        changeStep(0);
      }
      setIsPlaying(true);
    }
  };

  const handleReplay = () => {
    changeStep(0);
    setIsPlaying(true);
  };

  const groundTruth = facts.find((f) => f.key === queryKey)?.value ?? 'UNKNOWN';
  const currentFactBeingWritten = currentStep > 0 && currentStep <= facts.length ? facts[currentStep - 1] : null;

  return (
    <div className="diagram-frame p-6 space-y-5 tabular-nums">
      {/* Header & Playback Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--accent-blue-text)]" />
            <h3 className="font-sans text-base font-semibold text-[var(--text-primary)]">
              Memory inspector &amp; fast-weight matrix
            </h3>
            <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-[var(--accent-blue)] text-[var(--accent-blue-text)] border border-[var(--border)] font-semibold">
              Interactive
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-sans mt-1">
            Step through sequential memory writes. Notice how matrix M updates and reads out the queried representation.
          </p>
        </div>

        {/* Playback Button Bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-secondary text-xs py-1.5 px-3 min-h-[34px]"
            title="Reset to step 0 (empty matrix)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={handleStep}
            className="btn btn-secondary text-xs py-1.5 px-3 min-h-[34px]"
            title={currentStep >= facts.length ? 'Restart from step 0' : 'Advance one fact step'}
          >
            <SkipForward className="w-3.5 h-3.5 text-[var(--accent-blue-text)]" />
            <span>{currentStep >= facts.length ? 'Step (Restart)' : 'Step'}</span>
          </button>

          <button
            type="button"
            onClick={handleTogglePlay}
            className={`btn text-xs py-1.5 px-4 min-h-[34px] font-semibold ${
              isPlaying ? 'btn-warning' : 'btn-primary'
            }`}
            title={isPlaying ? 'Pause animation' : 'Play fact ingestion step-by-step'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{currentStep >= facts.length ? 'Replay all' : 'Play'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReplay}
            className="btn btn-secondary text-xs py-1.5 px-3 min-h-[34px]"
            title="Start playback from step 0"
          >
            <span>Replay</span>
          </button>

          <button
            type="button"
            onClick={() => setIsLooping(!isLooping)}
            className={`btn text-xs py-1.5 px-3 min-h-[34px] ${
              isLooping ? 'btn-blue' : 'btn-secondary'
            }`}
            title="Loop playback continuously"
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>Loop</span>
          </button>

          <span className="ml-1 px-3 py-1.5 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)] text-[var(--accent-blue-text)] font-mono font-bold text-xs">
            Step {currentStep} / {facts.length}
          </span>
        </div>
      </div>

      {/* Interactive Step Scrubber & Horizontal Segmented Timeline */}
      <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-3">
        <div className="flex items-center justify-between text-xs font-sans">
          <span className="text-[var(--text-primary)] font-bold flex items-center gap-1.5">
            <span>Ingestion timeline:</span>
            <span className="font-mono text-[var(--accent-blue-text)]">t = {currentStep}</span>
          </span>
          <span className="text-xs text-[var(--text-muted)]">
            {currentStep === 0
              ? 'Empty initial state'
              : `${currentStep} of ${facts.length} facts ingested`}
          </span>
        </div>

        {/* Segmented Timeline */}
        <div className="timeline overflow-x-auto">
          {Array.from({ length: facts.length + 1 }, (_, idx) => (
            <button
              key={`inspect-timeline-t${idx}`}
              type="button"
              onClick={() => {
                setIsPlaying(false);
                changeStep(idx);
              }}
              className={`timeline-step ${currentStep === idx ? 'active' : ''}`}
              title={idx === 0 ? 'Empty matrix (t0)' : `Ingested fact ${idx} (${facts[idx - 1]?.key})`}
            >
              t{idx}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 pt-0.5">
          <span className="text-xs font-mono text-[var(--text-muted)]">t0</span>
          <input
            type="range"
            min={0}
            max={facts.length}
            value={currentStep}
            onChange={(e) => {
              const val = Number(e.target.value);
              setIsPlaying(false);
              changeStep(val);
            }}
            className="w-full accent-[var(--color-accent)] h-2 bg-[var(--border)] rounded-lg cursor-pointer"
          />
          <span className="text-xs font-mono text-[var(--text-muted)]">t{facts.length}</span>
        </div>
      </div>

      {/* Currently Ingested Fact Banner */}
      <div
        className={`p-3.5 rounded-xl border transition-all text-xs font-mono flex flex-wrap items-center justify-between gap-2 ${
          isLensActive && activeStage === 'write'
            ? 'bg-[var(--accent-blue)] border-[var(--color-accent)] text-[var(--accent-blue-text)]'
            : currentFactBeingWritten
            ? 'bg-[var(--surface-soft)] border-[var(--border)] text-[var(--text-primary)]'
            : 'bg-[var(--surface-soft)] border-[var(--border)] text-[var(--text-muted)]'
        }`}
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-[var(--accent-blue-text)] font-semibold">
            {currentFactBeingWritten ? `Step ${currentStep} active write:` : 'Initial state (t=0):'}
          </span>
          {currentFactBeingWritten ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-[var(--surface)] border border-[var(--border)] font-bold text-[var(--accent-blue-text)]">
                {currentFactBeingWritten.key}
              </span>
              <ArrowRight className="w-3 h-3 text-[var(--text-muted)]" />
              <span className="px-2.5 py-0.5 rounded-md bg-[var(--surface)] border border-[var(--border)] font-bold text-[var(--accent-yellow-text)]">
                {currentFactBeingWritten.value}
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                (update: ΔM = {writeStrength} · k_{currentStep} ⊗ v_{currentStep}^T)
              </span>
            </div>
          ) : (
            <span>Matrix initialized to zeros. Advance step to write facts.</span>
          )}
        </div>
        {isLensActive && activeStage === 'write' && (
          <span className="text-xs font-semibold bg-[var(--color-accent)] text-[var(--surface)] px-2.5 py-0.5 rounded-md">
            Lens: write stage
          </span>
        )}
      </div>

      {/* Truth Comparison Hero Bar */}
      <div
        className={`transition-all rounded-xl ${
          isLensActive && activeStage === 'retrieval'
            ? 'ring-2 ring-[var(--color-success)]'
            : ''
        }`}
      >
        <TruthModelComparison
          prediction={queryResult.prediction}
          truth={groundTruth}
          confidence={queryResult.confidence}
        />
      </div>

      {/* 2-Column Inspector: Left = Matrix M + Vector Readout, Right = State History + Candidates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Col (7 cols): Associative Memory Matrix M */}
        <div className="lg:col-span-7 space-y-4">
          <div
            className={`rounded-xl border p-4 space-y-3 transition-all ${
              isLensActive && activeStage === 'state'
                ? 'border-[var(--color-accent)] bg-[var(--accent-blue)]/30'
                : 'border-[var(--border)] bg-[var(--surface-soft)]'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <span className="text-[var(--text-primary)] font-semibold flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[var(--accent-blue-text)]" />
                Associative memory matrix M ({dim}×{dim})
              </span>
              <span className="text-xs text-[var(--accent-blue-text)] bg-[var(--surface)] px-2 py-0.5 rounded border border-[var(--border)]">
                <MathView math="M_{t+1} = \lambda M_t + \eta k_t v_t^T" />
              </span>
            </div>

            {/* Matrix Heatmap Grid */}
            <div className="overflow-x-auto p-3 bg-[var(--color-matrix-bg)] rounded-lg border border-[var(--color-matrix-border)]">
              <div
                className="grid gap-[2px] mx-auto w-fit select-none"
                style={{
                  gridTemplateColumns: `repeat(${dim}, minmax(0, 1fr))`,
                }}
              >
                {currentMatrix.map((row, rIdx) =>
                  row.map((val, cIdx) => {
                    const absVal = Math.abs(val);
                    const isPositive = val >= 0;
                    const opacity = Math.min(1, absVal * 1.8);
                    const bgStyle = isPositive
                      ? `rgba(76, 154, 255, ${Math.max(0.12, opacity * 0.85)})`
                      : `rgba(229, 98, 90, ${Math.max(0.12, opacity * 0.85)})`;

                    return (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        onMouseEnter={() => {
                          const prevVal =
                            currentStep > 1 && matrixHistory[currentStep - 2]
                              ? matrixHistory[currentStep - 2][rIdx][cIdx]
                              : 0;
                          setHoveredCell({
                            timestep: currentStep,
                            dimension: rIdx,
                            row: rIdx,
                            col: cIdx,
                            value: val,
                            delta: val - prevVal,
                            stateNorm,
                            activeUnits,
                          });
                        }}
                        onMouseLeave={() => setHoveredCell(null)}
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded-[2px] transition-all hover:ring-2 hover:ring-[var(--color-matrix-ink)] cursor-pointer relative"
                        style={{ backgroundColor: bgStyle }}
                        title={`M[${rIdx},${cIdx}] = ${val.toFixed(3)}`}
                      />
                    );
                  })
                )}
              </div>
            </div>

            {/* Pipeline Step Legend */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[var(--text-muted)] pt-1 border-t border-[var(--border)]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[var(--color-accent)] inline-block" /> Positive weight
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[var(--color-danger)] inline-block" /> Negative weight
                </span>
              </div>
              <span className="text-[var(--accent-blue-text)] font-medium">Hover cell for weight telemetry</span>
            </div>
          </div>

          {/* Vectors Row: Key Vector q, Retrieved Vector v_hat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            {/* Query Vector q */}
            <div
              className={`rounded-xl border p-3.5 space-y-2 transition-all ${
                isLensActive && activeStage === 'query'
                  ? 'border-[var(--color-accent)] bg-[var(--accent-blue)]/40'
                  : 'border-[var(--border)] bg-[var(--surface-soft)]'
              }`}
            >
              <span className="text-xs text-[var(--text-muted)] block font-semibold">
                Query key vector q (&ldquo;{queryKey}&rdquo;)
              </span>
              <div className="flex flex-wrap gap-1">
                {vector(queryKey, dim).map((val, i) => (
                  <span
                    key={i}
                    className="w-4 h-4 rounded-[2px] inline-block"
                    style={{
                      backgroundColor:
                        val >= 0
                          ? `rgba(76, 154, 255, ${Math.max(0.2, Math.abs(val))})`
                          : `rgba(229, 98, 90, ${Math.max(0.2, Math.abs(val))})`,
                    }}
                    title={`q[${i}] = ${val.toFixed(3)}`}
                  />
                ))}
              </div>
            </div>

            {/* Retrieved Value Vector v_hat */}
            <div
              className={`rounded-xl border p-3.5 space-y-2 transition-all ${
                isLensActive && activeStage === 'retrieval'
                  ? 'border-[var(--color-success-border)] bg-[var(--accent-green)]'
                  : 'border-[var(--border)] bg-[var(--surface-soft)]'
              }`}
            >
              <span className="text-xs text-[var(--text-muted)] block font-semibold">
                Retrieved value vector v̂ = q^T M
              </span>
              <div className="flex flex-wrap gap-1">
                {queryResult.vector.map((val, i) => (
                  <span
                    key={i}
                    className="w-4 h-4 rounded-[2px] inline-block"
                    style={{
                      backgroundColor:
                        val >= 0
                          ? `rgba(52, 168, 118, ${Math.max(0.2, Math.min(1, Math.abs(val) * 1.5))})`
                          : `rgba(229, 98, 90, ${Math.max(0.2, Math.min(1, Math.abs(val) * 1.5))})`,
                    }}
                    title={`v̂[${i}] = ${val.toFixed(3)}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col (5 cols): State Timeline + Nearest Candidates */}
        <div className="lg:col-span-5 space-y-4 font-mono text-xs">
          {/* Candidate Decoding Ranks */}
          <div
            className={`rounded-xl border p-4 space-y-3 transition-all ${
              isLensActive && activeStage === 'retrieval'
                ? 'border-[var(--color-success-border)] bg-[var(--accent-green)]/40'
                : 'border-[var(--border)] bg-[var(--surface-soft)]'
            }`}
          >
            <span className="text-[var(--text-primary)] font-semibold text-xs block">
              Cosine similarity to known values
            </span>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {queryResult.candidates.length > 0 ? (
                queryResult.candidates.map((cand, idx) => {
                  const isTop = idx === 0;
                  const isTruth = cand.value === groundTruth;
                  const barWidth = Math.max(0, Math.min(100, Math.round(((cand.score + 1) / 2) * 100)));

                  return (
                    <div
                      key={cand.value}
                      className={`p-2.5 rounded-lg border transition-colors ${
                        isTop
                          ? isTruth
                            ? 'border-[var(--color-success-border)] bg-[var(--accent-green)] text-[var(--accent-green-text)]'
                            : 'border-[var(--color-danger-border)] bg-[var(--accent-pink)] text-[var(--accent-pink-text)]'
                          : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold flex items-center gap-1.5">
                          {isTop && <span>★</span>}
                          {cand.value}
                          {isTruth && <span className="text-xs text-[var(--accent-blue-text)]">(Truth)</span>}
                        </span>
                        <span>cos = {cand.score.toFixed(3)}</span>
                      </div>

                      <div className="w-full bg-[var(--border)] h-1.5 rounded-sm overflow-hidden">
                        <div
                          className={`h-full rounded-sm transition-all ${
                            isTop
                              ? isTruth
                                ? 'bg-[var(--color-success)]'
                                : 'bg-[var(--color-danger)]'
                              : 'bg-[var(--text-muted)]'
                          }`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-3 text-center text-[var(--text-muted)] text-xs font-sans">
                  No memory signal retrieved at step t={currentStep}. Advance step to ingest facts.
                </div>
              )}
            </div>
          </div>

          {/* State History Across Time (Heatmap) */}
          <div
            className={`rounded-xl border p-4 space-y-2.5 transition-all ${
              isLensActive && activeStage === 'persistence'
                ? 'border-[var(--color-accent)] bg-[var(--accent-blue)]/40'
                : 'border-[var(--border)] bg-[var(--surface-soft)]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-primary)] font-semibold text-xs">
                State vector over time (t=0..{stateHistory.length - 1})
              </span>
              <span className="text-xs text-[var(--text-muted)]">d={dim}</span>
            </div>

            <div className="overflow-x-auto p-2.5 bg-[var(--color-matrix-bg)] rounded-lg border border-[var(--color-matrix-border)]">
              <div className="flex gap-1.5 items-center">
                {stateHistory.map((stepVec, tIdx) => (
                  <button
                    type="button"
                    key={tIdx}
                    onClick={() => {
                      setIsPlaying(false);
                      changeStep(tIdx);
                    }}
                    className={`flex flex-col gap-[2px] cursor-pointer p-1 rounded transition-all ${
                      currentStep === tIdx
                        ? 'ring-2 ring-[var(--color-accent)] bg-[var(--color-matrix-surface)]'
                        : 'hover:bg-[var(--color-matrix-surface)]/70'
                    }`}
                    title={`Click to jump to step t=${tIdx}`}
                  >
                    <span className="text-[10px] text-center text-[var(--color-matrix-muted)] mb-0.5 font-mono">
                      t{tIdx}
                    </span>
                    {stepVec.slice(0, Math.min(16, dim)).map((v, dIdx) => (
                      <span
                        key={dIdx}
                        className="w-3.5 h-2 rounded-[1px]"
                        style={{
                          backgroundColor:
                            v >= 0
                              ? `rgba(76, 154, 255, ${Math.max(0.14, Math.min(1, Math.abs(v)))})`
                              : `rgba(229, 98, 90, ${Math.max(0.14, Math.min(1, Math.abs(v)))})`,
                        }}
                      />
                    ))}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Technical Detail Panel */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3.5 text-xs font-mono space-y-2">
            <div className="flex items-center justify-between text-[var(--accent-blue-text)] font-semibold border-b border-[var(--border)] pb-2">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                State telemetry
              </span>
              <span>d={dim}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[var(--text-secondary)]">
              <div>
                <span className="text-[var(--text-muted)] text-xs block font-semibold">Current state norm:</span>
                <span className="font-bold text-[var(--text-primary)]">{stateNorm.toFixed(3)}</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] text-xs block font-semibold">Active units (&gt;0.05):</span>
                <span className="font-bold text-[var(--accent-blue-text)]">{activeUnits} / {dim}</span>
              </div>
            </div>

            {/* Hovered cell info if present */}
            {hoveredCell ? (
              <div className="pt-2 border-t border-[var(--border)] text-xs text-[var(--accent-yellow-text)]">
                <span>Cell [Row {hoveredCell.row}, Col {hoveredCell.col}]:</span>{' '}
                <span className="font-bold text-[var(--text-primary)]">val = {hoveredCell.value.toFixed(4)}</span>{' '}
                <span className="text-[var(--text-muted)]">(Δ = {hoveredCell.delta > 0 ? '+' : ''}{hoveredCell.delta.toFixed(4)})</span>
              </div>
            ) : (
              <div className="pt-2 border-t border-[var(--border)] text-xs text-[var(--text-muted)] font-sans">
                Hover over matrix cells to inspect localized coordinate delta.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

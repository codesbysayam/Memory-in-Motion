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
    <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-6 space-y-5 shadow-xs">
      {/* Header & Playback Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6DF] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#167C80]" />
            <h3 className="font-serif text-base font-bold text-[#151515]">
              Memory Inspector & Fast-Weight Matrix
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#EDF7F7] text-[#167C80] border border-[#CFE8E8] font-bold">
              Interactive
            </span>
          </div>
          <p className="text-xs text-[#716F68] font-sans mt-1">
            Step through sequential memory writes. Notice how matrix M updates and reads out the queried representation.
          </p>
        </div>

        {/* Playback Button Bar */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D8D4CB] bg-[#FAF8F5] text-[#716F68] hover:text-[#151515] hover:bg-[#F4F1EA] transition-colors cursor-pointer"
            title="Reset to step 0 (empty matrix)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>

          <button
            type="button"
            onClick={handleStep}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D8D4CB] bg-[#FAF8F5] text-[#151515] hover:bg-[#F4F1EA] font-semibold transition-colors cursor-pointer"
            title={currentStep >= facts.length ? 'Restart from step 0' : 'Advance one fact step'}
          >
            <SkipForward className="w-3.5 h-3.5 text-[#167C80]" />
            <span>{currentStep >= facts.length ? 'STEP (RESTART)' : 'STEP'}</span>
          </button>

          <button
            type="button"
            onClick={handleTogglePlay}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl border font-bold transition-all cursor-pointer ${
              isPlaying
                ? 'border-[#F5E2C4] bg-[#FDF8EE] text-[#A46622]'
                : 'border-[#151515] bg-[#151515] text-[#FFFFFF] hover:bg-[#2A2926]'
            }`}
            title={isPlaying ? 'Pause animation' : 'Play fact ingestion step-by-step'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{currentStep >= facts.length ? 'REPLAY ALL' : 'PLAY'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReplay}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#D8D4CB] bg-[#FAF8F5] text-[#716F68] hover:text-[#151515] hover:bg-[#F4F1EA] transition-colors cursor-pointer"
            title="Start playback from step 0"
          >
            <span>REPLAY</span>
          </button>

          <button
            type="button"
            onClick={() => setIsLooping(!isLooping)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-[11px] transition-colors cursor-pointer ${
              isLooping
                ? 'border-[#CFE8E8] bg-[#EDF7F7] text-[#167C80] font-bold'
                : 'border-[#D8D4CB] bg-[#FAF8F5] text-[#716F68] hover:text-[#151515]'
            }`}
            title="Loop playback continuously"
          >
            <Repeat className="w-3 h-3" />
            <span>LOOP</span>
          </button>

          <span className="ml-1 px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-[#167C80] font-bold text-[11px]">
            Step {currentStep} / {facts.length}
          </span>
        </div>
      </div>

      {/* Interactive Step Scrubber Slider */}
      <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-2.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#151515] font-bold flex items-center gap-1.5">
            <span>SCRUB INGESTION TIMELINE:</span>
            <span className="text-[#167C80]">t = {currentStep}</span>
          </span>
          <span className="text-[11px] text-[#716F68]">
            {currentStep === 0
              ? 'Empty Initial State'
              : `${currentStep} of ${facts.length} facts ingested into memory`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-[#716F68]">t=0</span>
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
            className="w-full accent-[#6842C2] h-2 bg-[#E5E0D8] rounded-lg cursor-pointer"
          />
          <span className="text-[10px] font-mono text-[#716F68]">t={facts.length}</span>
        </div>
      </div>

      {/* Currently Ingested Fact Banner */}
      <div
        className={`p-3.5 rounded-xl border transition-all text-xs font-mono flex items-center justify-between ${
          isLensActive && activeStage === 'write'
            ? 'bg-[#EDF7F7] border-[#167C80] text-[#167C80] ring-1 ring-[#167C80]/30 shadow-xs'
            : currentFactBeingWritten
            ? 'bg-[#FAF8F5] border-[#EAE6DF] text-[#151515]'
            : 'bg-[#FAF8F5] border-[#EAE6DF] text-[#716F68]'
        }`}
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-[#167C80] font-bold uppercase">
            {currentFactBeingWritten ? `Step ${currentStep} Active Write:` : 'Initial State (t=0):'}
          </span>
          {currentFactBeingWritten ? (
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#FFFFFF] border border-[#CFE8E8] font-bold text-[#167C80] shadow-xs">
                {currentFactBeingWritten.key}
              </span>
              <ArrowRight className="w-3 h-3 text-[#BDB7AB]" />
              <span className="px-2.5 py-0.5 rounded-md bg-[#FFFFFF] border border-[#E2D8FA] font-bold text-[#6842C2] shadow-xs">
                {currentFactBeingWritten.value}
              </span>
              <span className="text-[11px] text-[#716F68]">
                (update: ΔM = {writeStrength} · k_{currentStep} ⊗ v_{currentStep}^T)
              </span>
            </div>
          ) : (
            <span>Matrix initialized to zeros. Advance step to write facts.</span>
          )}
        </div>
        {isLensActive && activeStage === 'write' && (
          <span className="text-[10px] font-bold bg-[#167C80] text-[#FFFFFF] px-2.5 py-0.5 rounded-full">
            LENS: WRITE STAGE SPOTLIGHT
          </span>
        )}
      </div>

      {/* Truth Comparison Hero Bar */}
      <div
        className={`transition-all rounded-xl ${
          isLensActive && activeStage === 'retrieval'
            ? 'ring-2 ring-[#247A4B] shadow-sm'
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
                ? 'border-[#167C80] bg-[#F7FCFC] ring-1 ring-[#167C80]/30 shadow-xs'
                : 'border-[#EAE6DF] bg-[#FAF8F5]'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#151515] font-bold flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#6842C2]" />
                ASSOCIATIVE MEMORY MATRIX M ({dim}×{dim})
              </span>
              <span className="text-[10px] text-[#167C80] bg-[#FFFFFF] px-2 py-0.5 rounded border border-[#CFE8E8]">
                <MathView math="M_{t+1} = \lambda M_t + \eta k_t v_t^T" />
              </span>
            </div>

            {/* Matrix Heatmap Grid */}
            <div className="overflow-x-auto p-3 bg-[#FFFFFF] rounded-lg border border-[#E5E0D8]">
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
                      ? `rgba(22, 124, 128, ${Math.max(0.08, opacity * 0.7)})`
                      : `rgba(182, 66, 53, ${Math.max(0.08, opacity * 0.7)})`;

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
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded-[2px] transition-all hover:ring-2 hover:ring-[#151515] cursor-pointer relative"
                        style={{ backgroundColor: bgStyle }}
                        title={`M[${rIdx},${cIdx}] = ${val.toFixed(3)}`}
                      />
                    );
                  })
                )}
              </div>
            </div>

            {/* Pipeline Step Legend */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-[#716F68] pt-1 border-t border-[#EAE6DF]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-[#167C80] inline-block" /> Positive Weight
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-[#B64235] inline-block" /> Negative Weight
                </span>
              </div>
              <span className="text-[#167C80] font-medium">Hover cell for weight telemetry</span>
            </div>
          </div>

          {/* Vectors Row: Key Vector q, Retrieved Vector v_hat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            {/* Query Vector q */}
            <div
              className={`rounded-xl border p-3.5 space-y-2 transition-all ${
                isLensActive && activeStage === 'query'
                  ? 'border-[#E2D8FA] bg-[#F3EFFF]'
                  : 'border-[#EAE6DF] bg-[#FAF8F5]'
              }`}
            >
              <span className="text-[10px] text-[#716F68] uppercase block font-bold">
                QUERY KEY VECTOR q ("{queryKey}")
              </span>
              <div className="flex flex-wrap gap-1">
                {vector(queryKey, dim).map((val, i) => (
                  <span
                    key={i}
                    className="w-4 h-4 rounded-[2px] inline-block"
                    style={{
                      backgroundColor:
                        val >= 0
                          ? `rgba(104, 66, 194, ${Math.max(0.15, Math.abs(val))})`
                          : `rgba(182, 66, 53, ${Math.max(0.15, Math.abs(val))})`,
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
                  ? 'border-[#CDEEDB] bg-[#EDF8F2]'
                  : 'border-[#EAE6DF] bg-[#FAF8F5]'
              }`}
            >
              <span className="text-[10px] text-[#716F68] uppercase block font-bold">
                RETRIEVED VALUE VECTOR v̂ = q^T M
              </span>
              <div className="flex flex-wrap gap-1">
                {queryResult.vector.map((val, i) => (
                  <span
                    key={i}
                    className="w-4 h-4 rounded-[2px] inline-block"
                    style={{
                      backgroundColor:
                        val >= 0
                          ? `rgba(22, 124, 128, ${Math.max(0.15, Math.min(1, Math.abs(val) * 1.5))})`
                          : `rgba(182, 66, 53, ${Math.max(0.15, Math.min(1, Math.abs(val) * 1.5))})`,
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
                ? 'border-[#CDEEDB] bg-[#EDF8F2]'
                : 'border-[#EAE6DF] bg-[#FAF8F5]'
            }`}
          >
            <span className="text-[#151515] font-bold text-xs uppercase tracking-wider block">
              Cosine Similarity to Known Values
            </span>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
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
                            ? 'border-[#CDEEDB] bg-[#EDF8F2] text-[#247A4B]'
                            : 'border-[#F7D3CF] bg-[#FDF2F0] text-[#B64235]'
                          : 'border-[#EAE6DF] bg-[#FFFFFF] text-[#52504A]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold flex items-center gap-1.5">
                          {isTop && <span>★</span>}
                          {cand.value}
                          {isTruth && <span className="text-[9px] text-[#167C80]">(Truth)</span>}
                        </span>
                        <span>cosine = {cand.score.toFixed(3)}</span>
                      </div>

                      <div className="w-full bg-[#E5E0D8] h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isTop
                              ? isTruth
                                ? 'bg-[#247A4B]'
                                : 'bg-[#B64235]'
                              : 'bg-[#BDB7AB]'
                          }`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-3 text-center text-[#716F68] text-[11px]">
                  No memory signal retrieved at step t={currentStep}. Advance step to ingest facts.
                </div>
              )}
            </div>
          </div>

          {/* State History Across Time (Heatmap) */}
          <div
            className={`rounded-xl border p-4 space-y-2.5 transition-all ${
              isLensActive && activeStage === 'persistence'
                ? 'border-[#E2D8FA] bg-[#F3EFFF]'
                : 'border-[#EAE6DF] bg-[#FAF8F5]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[#151515] font-bold text-xs uppercase tracking-wider">
                State Vector Over Time (t=0..{stateHistory.length - 1})
              </span>
              <span className="text-[10px] text-[#716F68]">D={dim}</span>
            </div>

            <div className="overflow-x-auto p-2.5 bg-[#FFFFFF] rounded-lg border border-[#E5E0D8]">
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
                        ? 'ring-2 ring-[#167C80] bg-[#EDF7F7]'
                        : 'hover:bg-[#FAF8F5]'
                    }`}
                    title={`Click to jump to step t=${tIdx}`}
                  >
                    <span className="text-[8px] text-center text-[#716F68] mb-0.5 font-mono">
                      t{tIdx}
                    </span>
                    {stepVec.slice(0, Math.min(16, dim)).map((v, dIdx) => (
                      <span
                        key={dIdx}
                        className="w-3.5 h-2 rounded-[1px]"
                        style={{
                          backgroundColor:
                            v >= 0
                              ? `rgba(22, 124, 128, ${Math.max(0.1, Math.min(1, Math.abs(v)))})`
                              : `rgba(182, 66, 53, ${Math.max(0.1, Math.min(1, Math.abs(v)))})`,
                        }}
                      />
                    ))}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Technical Detail Panel */}
          <div className="rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] p-3.5 text-[11px] font-mono space-y-2">
            <div className="flex items-center justify-between text-[#167C80] font-bold border-b border-[#EAE6DF] pb-2">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                STATE TELEMETRY
              </span>
              <span>D={dim}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[#52504A]">
              <div>
                <span className="text-[#716F68] text-[10px] block font-semibold">CURRENT STATE NORM:</span>
                <span className="font-bold text-[#151515]">{stateNorm.toFixed(3)}</span>
              </div>
              <div>
                <span className="text-[#716F68] text-[10px] block font-semibold">ACTIVE UNITS (&gt;0.05):</span>
                <span className="font-bold text-[#167C80]">{activeUnits} / {dim}</span>
              </div>
            </div>

            {/* Hovered cell info if present */}
            {hoveredCell ? (
              <div className="pt-2 border-t border-[#EAE6DF] text-[10px] text-[#A46622]">
                <span>Cell [Row {hoveredCell.row}, Col {hoveredCell.col}]:</span>{' '}
                <span className="font-bold text-[#151515]">val = {hoveredCell.value.toFixed(4)}</span>{' '}
                <span className="text-[#716F68]">(Δ = {hoveredCell.delta > 0 ? '+' : ''}{hoveredCell.delta.toFixed(4)})</span>
              </div>
            ) : (
              <div className="pt-2 border-t border-[#EAE6DF] text-[10px] text-[#716F68]">
                Hover over matrix cells to inspect localized coordinate delta.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

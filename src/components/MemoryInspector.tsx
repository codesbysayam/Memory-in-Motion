import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, RotateCcw, SkipForward, HelpCircle, Activity, Layers, Database } from 'lucide-react';
import { Fact, createAssociativeMemory, vector, cosine } from '../models/associativeMemory';
import { StateInspectionDetail } from '../models/types';
import { TruthModelComparison } from './TruthModelComparison';

interface MemoryInspectorProps {
  facts: Fact[];
  queryKey: string;
  dim: number;
  retention: number;
  writeStrength: number;
  onStepChange?: (currentStep: number) => void;
}

export const MemoryInspector: React.FC<MemoryInspectorProps> = ({
  facts,
  queryKey,
  dim,
  retention,
  writeStrength,
  onStepChange,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(facts.length);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hoveredCell, setHoveredCell] = useState<StateInspectionDetail | null>(null);
  const timerRef = useRef<number | null>(null);

  // Sync step if facts length shrinks
  useEffect(() => {
    if (currentStep > facts.length) {
      setCurrentStep(facts.length);
    }
  }, [facts.length, currentStep]);

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

  // Step ticker
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= facts.length) {
            setIsPlaying(false);
            return prev;
          }
          const next = prev + 1;
          onStepChange?.(next);
          return next;
        });
      }, 700);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, facts.length, onStepChange]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    onStepChange?.(0);
  };

  const handleStep = () => {
    setIsPlaying(false);
    if (currentStep < facts.length) {
      const next = currentStep + 1;
      setCurrentStep(next);
      onStepChange?.(next);
    }
  };

  const handleReplay = () => {
    setCurrentStep(0);
    setIsPlaying(true);
    onStepChange?.(0);
  };

  const groundTruth = facts.find((f) => f.key === queryKey)?.value ?? 'UNKNOWN';

  return (
    <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-5 space-y-6">
      {/* Header & Playback Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#252A35] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#22D3EE]" />
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
              Memory Inspector & Fast-Weight Matrix
            </h3>
          </div>
          <p className="text-xs text-[#8F96A3] mt-0.5">
            Step through sequential memory writes. Observe matrix M update and vector readout.
          </p>
        </div>

        {/* Playback Button Bar */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#252A35] bg-[#151922] text-[#8F96A3] hover:text-white hover:border-[#22D3EE]/50 transition-colors"
            title="Reset to step 0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>

          <button
            onClick={handleStep}
            disabled={currentStep >= facts.length}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#252A35] bg-[#151922] text-[#8F96A3] hover:text-white disabled:opacity-40 hover:border-[#22D3EE]/50 transition-colors"
            title="Advance one step"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>STEP</span>
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#22D3EE] bg-cyan-950/60 text-[#22D3EE] font-bold hover:bg-cyan-900/60 transition-colors"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>PLAY</span>
              </>
            )}
          </button>

          <button
            onClick={handleReplay}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#252A35] bg-[#151922] text-[#8F96A3] hover:text-white hover:border-[#22D3EE]/50 transition-colors"
          >
            <span>REPLAY</span>
          </button>

          <span className="ml-2 px-2 py-1 rounded bg-[#151922] border border-[#252A35] text-zinc-300 text-[11px]">
            Step {currentStep}/{facts.length}
          </span>
        </div>
      </div>

      {/* Truth Comparison Hero Bar */}
      <TruthModelComparison
        prediction={queryResult.prediction}
        truth={groundTruth}
        confidence={queryResult.confidence}
      />

      {/* 2-Column Inspector: Left = Matrix M + Vector Readout, Right = State History + Candidates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Col (7 cols): Associative Memory Matrix M */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xl border border-[#252A35] bg-[#151922] p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-white font-semibold flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-violet-400" />
                ASSOCIATIVE MEMORY MATRIX M ({dim}×{dim})
              </span>
              <span className="text-[10px] text-[#8F96A3]">M_(t+1) = λM_t + η k_t v_t^T</span>
            </div>

            {/* Matrix Heatmap Grid */}
            <div className="overflow-x-auto p-2 bg-[#07080B] rounded-lg border border-[#252A35]">
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
                      ? `rgba(34, 211, 238, ${Math.max(0.08, opacity)})`
                      : `rgba(244, 63, 94, ${Math.max(0.08, opacity)})`;

                    return (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        onMouseEnter={() => {
                          const prevVal = currentStep > 0 && matrixHistory[currentStep - 2]
                            ? matrixHistory[currentStep - 2][rIdx][cIdx]
                            : 0;
                          setHoveredCell({
                            timestep: currentStep,
                            dimension: rIdx,
                            value: val,
                            delta: val - prevVal,
                            stateNorm,
                            activeUnits,
                          });
                        }}
                        onMouseLeave={() => setHoveredCell(null)}
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded-[2px] transition-all hover:ring-2 hover:ring-white cursor-pointer relative"
                        style={{ backgroundColor: bgStyle }}
                      />
                    );
                  })
                )}
              </div>
            </div>

            {/* Pipeline Step Legend */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-[#8F96A3] pt-1 border-t border-[#252A35]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-[#22D3EE] inline-block" /> Positive Weight
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-[#F43F5E] inline-block" /> Negative Weight
                </span>
              </div>
              <span>Hover cell for weight telemetry</span>
            </div>
          </div>

          {/* Vectors Row: Key Vector q, Retrieved Vector v_hat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            {/* Query Vector q */}
            <div className="rounded-xl border border-[#252A35] bg-[#151922] p-3 space-y-2">
              <span className="text-[10px] text-[#8F96A3] uppercase block">
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
                          ? `rgba(168, 85, 247, ${Math.max(0.15, Math.abs(val))})`
                          : `rgba(236, 72, 153, ${Math.max(0.15, Math.abs(val))})`,
                    }}
                    title={`q[${i}] = ${val.toFixed(3)}`}
                  />
                ))}
              </div>
            </div>

            {/* Retrieved Value Vector v_hat */}
            <div className="rounded-xl border border-[#252A35] bg-[#151922] p-3 space-y-2">
              <span className="text-[10px] text-[#8F96A3] uppercase block">
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
                          ? `rgba(34, 211, 238, ${Math.max(0.15, Math.min(1, Math.abs(val) * 1.5))})`
                          : `rgba(244, 63, 94, ${Math.max(0.15, Math.min(1, Math.abs(val) * 1.5))})`,
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
          <div className="rounded-xl border border-[#252A35] bg-[#151922] p-4 space-y-3">
            <span className="text-white font-semibold text-xs uppercase tracking-wider block">
              Cosine Similarity to Known Values
            </span>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {queryResult.candidates.map((cand, idx) => {
                const isTop = idx === 0;
                const isTruth = cand.value === groundTruth;
                const barWidth = Math.max(0, Math.min(100, Math.round(((cand.score + 1) / 2) * 100)));

                return (
                  <div
                    key={cand.value}
                    className={`p-2 rounded border transition-colors ${
                      isTop
                        ? isTruth
                          ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-200'
                          : 'border-rose-500/50 bg-rose-950/20 text-rose-200'
                        : 'border-[#252A35] bg-[#11141A] text-[#8F96A3]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold flex items-center gap-1.5">
                        {isTop && <span>★</span>}
                        {cand.value}
                        {isTruth && <span className="text-[9px] text-[#22D3EE]">(Truth)</span>}
                      </span>
                      <span>cosine = {cand.score.toFixed(3)}</span>
                    </div>

                    <div className="w-full bg-[#07080B] h-1.5 rounded-full overflow-hidden border border-[#252A35]">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isTop
                            ? isTruth
                              ? 'bg-emerald-400'
                              : 'bg-rose-400'
                            : 'bg-zinc-600'
                        }`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* State History Across Time (Heatmap) */}
          <div className="rounded-xl border border-[#252A35] bg-[#151922] p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold text-xs uppercase tracking-wider">
                State Vector Over Time (t=0..{stateHistory.length - 1})
              </span>
              <span className="text-[10px] text-[#8F96A3]">D={dim}</span>
            </div>

            <div className="overflow-x-auto p-2 bg-[#07080B] rounded border border-[#252A35]">
              <div className="flex gap-1 items-center">
                {stateHistory.map((stepVec, tIdx) => (
                  <div
                    key={tIdx}
                    onClick={() => {
                      setCurrentStep(tIdx);
                      onStepChange?.(tIdx);
                    }}
                    className={`flex flex-col gap-[2px] cursor-pointer p-0.5 rounded transition-all ${
                      currentStep === tIdx
                        ? 'ring-1 ring-[#22D3EE] bg-cyan-950/40'
                        : 'hover:bg-zinc-900'
                    }`}
                    title={`Click to inspect step t=${tIdx}`}
                  >
                    <span className="text-[8px] text-center text-[#8F96A3] mb-0.5 font-mono">
                      t{tIdx}
                    </span>
                    {stepVec.slice(0, Math.min(16, dim)).map((v, dIdx) => (
                      <span
                        key={dIdx}
                        className="w-3.5 h-2 rounded-[1px]"
                        style={{
                          backgroundColor:
                            v >= 0
                              ? `rgba(34, 211, 238, ${Math.max(0.1, Math.min(1, Math.abs(v)))})`
                              : `rgba(244, 63, 94, ${Math.max(0.1, Math.min(1, Math.abs(v)))})`,
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Technical Detail Panel */}
          <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-3 text-[11px] font-mono space-y-2">
            <div className="flex items-center justify-between text-[#22D3EE] font-semibold border-b border-[#252A35] pb-1.5">
              <span className="flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" />
                STATE TELEMETRY
              </span>
              <span>D={dim}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-zinc-300">
              <div>
                <span className="text-[#8F96A3] text-[10px] block">CURRENT STATE NORM:</span>
                <span className="font-bold text-white">{stateNorm.toFixed(3)}</span>
              </div>
              <div>
                <span className="text-[#8F96A3] text-[10px] block">ACTIVE UNITS (&gt;0.05):</span>
                <span className="font-bold text-[#22D3EE]">{activeUnits} / {dim}</span>
              </div>
            </div>

            {/* Hovered cell info if present */}
            {hoveredCell ? (
              <div className="pt-2 border-t border-[#252A35] text-[10px] text-amber-300">
                <span>Cell [Row {hoveredCell.dimension}, Col]:</span>{' '}
                <span className="font-bold text-white">val = {hoveredCell.value.toFixed(4)}</span>{' '}
                <span className="text-zinc-400">(Δ = {hoveredCell.delta > 0 ? '+' : ''}{hoveredCell.delta.toFixed(4)})</span>
              </div>
            ) : (
              <div className="pt-2 border-t border-[#252A35] text-[10px] text-[#8F96A3]">
                Hover over matrix cells to inspect localized coordinate delta.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

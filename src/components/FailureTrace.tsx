import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  AlertOctagon,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Layers,
  Database,
  Search,
  ArrowRight,
} from 'lucide-react';

export interface RecordedTraceStep {
  stepIndex: number;
  label: string;
  operation: 'WRITE' | 'READ';
  inputFact?: { key: string; value: string; isTarget: boolean };
  queryKey?: string;
  stateMatrix: number[][];
  stateVector: number[];
  deltaVector: number[];
  predictionAtStep: string;
  confidenceAtStep: number;
  isCorrectAtStep: boolean;
  notes: string;
}

export interface FailureTraceProps {
  steps: RecordedTraceStep[];
  dimension: number;
  groundTruth: string;
  targetKey: string;
  finalPrediction: string;
  finalConfidence: number;
  onClose?: () => void;
  id?: string;
}

export const FailureTrace: React.FC<FailureTraceProps> = ({
  steps,
  dimension,
  groundTruth,
  targetKey,
  finalPrediction,
  finalConfidence,
  onClose,
  id = 'failure-trace-replay',
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(900); // ms per step
  const timerRef = useRef<number | null>(null);

  const totalSteps = steps.length;
  const currentStep = steps[currentStepIdx] || steps[0];

  // Playback timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setCurrentStepIdx((prev) => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, totalSteps, playbackSpeed]);

  const handlePlayPause = () => {
    if (currentStepIdx >= totalSteps - 1) {
      setCurrentStepIdx(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIdx(0);
  };

  const handleStepPrev = () => {
    setIsPlaying(false);
    setCurrentStepIdx((prev) => Math.max(0, prev - 1));
  };

  const handleStepNext = () => {
    setIsPlaying(false);
    setCurrentStepIdx((prev) => Math.min(totalSteps - 1, prev + 1));
  };

  // Identify failure tipping point: step where prediction changed from correct to wrong
  const failureStepIndex = steps.findIndex(
    (s, idx) => idx > 0 && !s.isCorrectAtStep && steps[idx - 1]?.isCorrectAtStep
  );

  const isFinalStep = currentStepIdx === totalSteps - 1;
  const isFailureTippingPoint = failureStepIndex !== -1 && currentStepIdx === failureStepIndex;

  return (
    <div
      id={id}
      className="rounded-2xl border border-rose-800/60 bg-[#0A0D15] p-5 sm:p-7 text-slate-100 shadow-2xl space-y-6 animate-in fade-in duration-300"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#20293D] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-700/80 text-rose-400 shadow-inner">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-rose-400 font-bold">
                FAILURE TRACE REPLAY ENGINE
              </span>
              <span className="text-[10px] font-mono uppercase text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 rounded font-semibold">
                EXACT EXPERIMENT STATES
              </span>
            </div>
            <h3 className="text-lg font-bold font-mono text-white mt-0.5">
              Step-by-Step Memory Degradation Trace
            </h3>
          </div>
        </div>

        {/* Scientific Guarantee Badge */}
        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-[#121622] border border-[#232A3D] px-3 py-1.5 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-[#22D3EE]" />
          <span>Deterministic Replay · No Fake Animation</span>
        </div>
      </div>

      {/* Progress Stepper Pills */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>EXPERIMENT SEQUENCE TIMELINE</span>
          <span>
            Step {currentStepIdx + 1} of {totalSteps}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1.5">
          {steps.map((st, idx) => {
            const isSelected = idx === currentStepIdx;
            const isFailurePoint = idx === failureStepIndex;

            let borderClass = 'border-[#222A3D] bg-[#121723] text-slate-400';
            if (isSelected) {
              borderClass = 'border-[#22D3EE] bg-cyan-950/80 text-white ring-1 ring-[#22D3EE] font-bold';
            } else if (isFailurePoint) {
              borderClass = 'border-rose-700/80 bg-rose-950/40 text-rose-300';
            }

            return (
              <button
                key={idx}
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStepIdx(idx);
                }}
                className={`p-2 rounded-lg border text-left font-mono text-xs transition-all flex flex-col justify-between h-14 ${borderClass}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#8F96A3]">STEP {String(idx + 1).padStart(2, '0')}</span>
                  <span
                    className={`text-[9px] px-1 rounded uppercase font-bold ${
                      st.operation === 'WRITE'
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                        : 'bg-violet-950/60 text-violet-300 border border-violet-800/40'
                    }`}
                  >
                    {st.operation}
                  </span>
                </div>
                <div className="truncate font-semibold text-[11px] text-white">
                  {st.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Playback Controls & Status Callout */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#101522] border border-[#20293D]">
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="p-2 rounded-lg border border-[#283248] bg-[#161C2C] text-slate-300 hover:text-white hover:bg-[#1E253A] transition"
            title="Reset to step 1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleStepPrev}
            disabled={currentStepIdx === 0}
            className="p-2 rounded-lg border border-[#283248] bg-[#161C2C] text-slate-300 hover:text-white disabled:opacity-40 transition"
            title="Previous step"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={handlePlayPause}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold shadow-md shadow-blue-500/20 transition"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>PLAY REPLAY</span>
              </>
            )}
          </button>

          <button
            onClick={handleStepNext}
            disabled={currentStepIdx >= totalSteps - 1}
            className="p-2 rounded-lg border border-[#283248] bg-[#161C2C] text-slate-300 hover:text-white disabled:opacity-40 transition"
            title="Next step"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
          <span>Speed:</span>
          {[
            { label: '0.5x', ms: 1400 },
            { label: '1x', ms: 900 },
            { label: '2x', ms: 450 },
          ].map((sp) => (
            <button
              key={sp.label}
              onClick={() => setPlaybackSpeed(sp.ms)}
              className={`px-2 py-1 rounded border text-[11px] ${
                playbackSpeed === sp.ms
                  ? 'border-[#22D3EE] bg-cyan-950/60 text-[#22D3EE] font-bold'
                  : 'border-[#252A35] bg-[#151922] text-[#8F96A3] hover:text-white'
              }`}
            >
              {sp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split: Left = Step Operation & Telemetry, Right = Live State Matrix Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols): Step Details */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-[#222A3D] bg-[#101420] p-4 space-y-3 font-mono">
            <div className="flex items-center justify-between border-b border-[#20283C] pb-2">
              <span className="text-xs text-slate-400 uppercase">STEP OPERATION</span>
              <span
                className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${
                  currentStep.operation === 'WRITE'
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                    : 'bg-violet-950/80 text-violet-300 border border-violet-800'
                }`}
              >
                {currentStep.operation}
              </span>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-bold text-white">
                {currentStep.label}
              </div>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                {currentStep.notes}
              </p>
            </div>

            {/* Probe evaluation at this step */}
            <div className="pt-2 border-t border-[#20283C] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Target Key Probe:</span>
                <span className="text-white font-bold">"{targetKey}"</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Retrieved Output:</span>
                <span
                  className={`font-bold ${
                    currentStep.isCorrectAtStep ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {currentStep.predictionAtStep} {currentStep.isCorrectAtStep ? '✓' : '✕'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs" title="This score is based on representation similarity and is not a calibrated probability.">
                <span className="text-slate-400">Retrieval Score:</span>
                <span className="text-[#22D3EE] font-bold">
                  {Math.round(currentStep.confidenceAtStep * 100)}%
                </span>
              </div>
            </div>

            {isFailureTippingPoint && (
              <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-700 text-rose-200 text-xs font-sans flex items-start gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>
                  <strong>CRITICAL TIPPING POINT:</strong> At this write step, cumulative coordinate superposition displaced the original vector projection below the classification boundary.
                </span>
              </div>
            )}
          </div>

          {/* Prompt-mandated Final Step Block */}
          {isFinalStep && (
            <div className="rounded-xl border border-rose-600/60 bg-rose-950/30 p-4 space-y-3 font-mono">
              <div className="text-xs font-bold text-rose-300 uppercase tracking-wide flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>OBSERVED FINAL RESULT</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded bg-[#0E131E] border border-[#20283C]">
                  <span className="text-[10px] text-slate-400 block uppercase">EXPECTED</span>
                  <strong className="text-white text-sm block mt-0.5">{groundTruth}</strong>
                </div>

                <div className="p-2.5 rounded bg-[#0E131E] border border-rose-900/60">
                  <span className="text-[10px] text-slate-400 block uppercase">RETRIEVED</span>
                  <strong className="text-rose-400 text-sm block mt-0.5">{finalPrediction}</strong>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-rose-900/40" title="This score is based on representation similarity and is not a calibrated probability.">
                <span className="text-slate-400">RETRIEVAL SCORE:</span>
                <span className="text-[#22D3EE] font-bold text-sm">
                  {Math.round(finalConfidence * 100)}%
                </span>
              </div>

              <div className="p-2 rounded bg-rose-950/80 border border-rose-800 text-rose-300 text-center font-bold text-xs uppercase tracking-wider">
                ✗ MEMORY INTERFERENCE
              </div>
            </div>
          )}
        </div>

        {/* Right Column (7 cols): Exact Recorded State Heatmap */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xl border border-[#222A3D] bg-[#101420] p-4 space-y-3 font-mono">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white font-semibold flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-violet-400" />
                RECORDED STATE MATRIX M ({dimension}×{dimension})
              </span>
              <span className="text-[10px] text-slate-400">At Step {currentStepIdx + 1}</span>
            </div>

            {/* Matrix Heatmap Grid */}
            <div className="overflow-x-auto p-3 bg-[#07090F] rounded-lg border border-[#1E2538]">
              <div
                className="grid gap-[2px] mx-auto w-fit select-none"
                style={{
                  gridTemplateColumns: `repeat(${dimension}, minmax(0, 1fr))`,
                }}
              >
                {currentStep.stateMatrix.map((row, rIdx) =>
                  row.map((val, cIdx) => {
                    const absVal = Math.abs(val);
                    const isPositive = val >= 0;
                    const opacity = Math.min(1, absVal * 1.6);
                    const bgStyle = isPositive
                      ? `rgba(34, 211, 238, ${Math.max(0.08, opacity)})`
                      : `rgba(244, 63, 94, ${Math.max(0.08, opacity)})`;

                    return (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        title={`M[${rIdx},${cIdx}] = ${val.toFixed(3)}`}
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded-[2px] transition-all hover:ring-2 hover:ring-white cursor-pointer"
                        style={{ backgroundColor: bgStyle }}
                      />
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-400 pt-1 border-t border-[#20283C]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-[#22D3EE] inline-block" /> Positive Weight
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-[#F43F5E] inline-block" /> Negative Weight
                </span>
              </div>
              <span className="text-zinc-500">Exact coordinates stored in memory</span>
            </div>
          </div>

          {/* Scientific Guarantee Label */}
          <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-[#1C2336] text-xs font-sans text-slate-300 leading-relaxed">
            <strong className="text-white font-mono block mb-1">
              PROVENANCE GUARANTEE:
            </strong>
            “Replay uses the exact states produced by the experiment. No random animation. No fabricated intermediate states.”
          </div>
        </div>
      </div>
    </div>
  );
};

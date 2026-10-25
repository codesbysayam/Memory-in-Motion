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
      className="rounded-xl border border-[#D8DCD8] bg-[#FFFFFF] p-5 sm:p-7 text-[#252525] shadow-xs space-y-6 animate-in fade-in duration-300"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6DF] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#F9E9ED] border border-[#F2CAD2] text-[#B64235]">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-[#B64235] font-semibold">
                Interference trace replay
              </span>
              <span className="text-xs font-mono text-[#247A4B] bg-[#DCEFE2] border border-[#BCE2C9] px-2 py-0.5 rounded font-semibold">
                Exact experiment states
              </span>
            </div>
            <h3 className="text-lg font-serif font-bold text-[#252525] mt-0.5">
              Step-by-step memory degradation trace
            </h3>
          </div>
        </div>

        {/* Scientific Guarantee Badge */}
        <div className="flex items-center gap-1.5 text-xs text-[#5F625F] bg-[#F7F5EF] border border-[#D8DCD8] px-3 py-1.5 rounded-lg">
          <ShieldCheck className="w-4 h-4 text-[#31566E]" />
          <span>Deterministic replay · No synthetic animation</span>
        </div>
      </div>

      {/* Progress Stepper Pills */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#5F625F]">
          <span className="font-semibold uppercase text-[11px]">Experiment sequence timeline</span>
          <span className="font-mono">
            Step {currentStepIdx + 1} of {totalSteps}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1.5">
          {steps.map((st, idx) => {
            const isSelected = idx === currentStepIdx;
            const isFailurePoint = idx === failureStepIndex;

            let borderClass = 'border-[#D8DCD8] bg-[#F7F5EF] text-[#5F625F]';
            if (isSelected) {
              borderClass = 'border-[#B8D7ED] bg-[#E7F2FA] text-[#31566E] ring-1 ring-[#31566E] font-semibold';
            } else if (isFailurePoint) {
              borderClass = 'border-[#F2CAD2] bg-[#F9E9ED] text-[#B64235] font-semibold';
            }

            return (
              <button
                key={idx}
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStepIdx(idx);
                }}
                className={`p-2 rounded-lg border text-left text-xs transition-all flex flex-col justify-between h-14 cursor-pointer ${borderClass}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#5F625F]">#{String(idx + 1).padStart(2, '0')}</span>
                  <span
                    className={`text-[10px] px-1 rounded uppercase font-semibold ${
                      st.operation === 'WRITE'
                        ? 'bg-[#FFF5D8] text-[#8C5D17] border border-[#E8D9A8]'
                        : 'bg-[#E7F2FA] text-[#31566E] border border-[#B8D7ED]'
                    }`}
                  >
                    {st.operation}
                  </span>
                </div>
                <div className="truncate font-medium text-xs text-[#252525]">
                  {st.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Playback Controls & Status Callout */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#F7F5EF] border border-[#D8DCD8]">
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-[#FFFFFF] hover:bg-[#F1F2F0] border border-[#D8DCD8] text-[#5F625F] hover:text-[#252525] text-xs cursor-pointer transition"
            title="Reset to step 1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleStepPrev}
            disabled={currentStepIdx === 0}
            className="p-2 rounded-lg bg-[#FFFFFF] hover:bg-[#F1F2F0] border border-[#D8DCD8] text-[#5F625F] hover:text-[#252525] text-xs disabled:opacity-40 cursor-pointer transition"
            title="Previous step"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={handlePlayPause}
            className="px-4 py-2 rounded-lg bg-[#DCEFE2] hover:bg-[#CDE8D5] text-[#245B38] border border-[#BCE2C9] text-xs font-semibold flex items-center gap-2 cursor-pointer transition"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Play trace</span>
              </>
            )}
          </button>

          <button
            onClick={handleStepNext}
            disabled={currentStepIdx >= totalSteps - 1}
            className="p-2 rounded-lg bg-[#FFFFFF] hover:bg-[#F1F2F0] border border-[#D8DCD8] text-[#5F625F] hover:text-[#252525] text-xs disabled:opacity-40 cursor-pointer transition"
            title="Next step"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1.5 text-xs text-[#5F625F]">
          <span>Speed:</span>
          {[
            { label: '0.5x', ms: 1400 },
            { label: '1x', ms: 900 },
            { label: '2x', ms: 450 },
          ].map((sp) => (
            <button
              key={sp.label}
              onClick={() => setPlaybackSpeed(sp.ms)}
              className={`px-2 py-1 rounded border text-xs transition-colors cursor-pointer ${
                playbackSpeed === sp.ms
                  ? 'bg-[#E7F2FA] text-[#31566E] border-[#B8D7ED] font-semibold'
                  : 'border-[#D8DCD8] bg-[#FFFFFF] text-[#5F625F] hover:text-[#252525]'
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
          <div className="rounded-xl border border-[#D8DCD8] bg-[#F7F5EF] p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-2">
              <span className="text-xs text-[#5F625F] uppercase font-medium">Step operation</span>
              <span
                className={`text-xs px-2 py-0.5 rounded font-semibold uppercase ${
                  currentStep.operation === 'WRITE'
                    ? 'bg-[#FFF5D8] text-[#8C5D17] border border-[#E8D9A8]'
                    : 'bg-[#E7F2FA] text-[#31566E] border border-[#B8D7ED]'
                }`}
              >
                {currentStep.operation}
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-semibold text-[#252525]">
                {currentStep.label}
              </div>
              <p className="text-xs text-[#5F625F] font-sans leading-relaxed">
                {currentStep.notes}
              </p>
            </div>

            {/* Probe evaluation at this step */}
            <div className="pt-2 border-t border-[#EAE6DF] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#5F625F]">Target Key Probe:</span>
                <span className="text-[#252525] font-semibold">"{targetKey}"</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#5F625F]">Retrieved Output:</span>
                <span
                  className={`font-semibold ${
                    currentStep.isCorrectAtStep ? 'text-[#247A4B]' : 'text-[#B64235]'
                  }`}
                >
                  {currentStep.predictionAtStep} {currentStep.isCorrectAtStep ? '✓' : '✕'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs" title="Cosine similarity between retrieved representation and candidate. This is not a calibrated probability.">
                <span className="text-[#5F625F]">Retrieval score:</span>
                <span className="text-[#31566E] font-mono font-bold">
                  {Math.round(currentStep.confidenceAtStep * 100)}%
                </span>
              </div>
            </div>

            {isFailureTippingPoint && (
              <div className="p-2.5 rounded-lg bg-[#F9E9ED] border border-[#F2CAD2] text-[#B64235] text-xs font-sans flex items-start gap-2">
                <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Interference tipping point:</strong> At this write step, cumulative coordinate superposition displaced the original vector projection below the classification boundary.
                </span>
              </div>
            )}
          </div>

          {/* Prompt-mandated Final Step Block */}
          {isFinalStep && (
            <div className="rounded-xl border border-[#F2CAD2] bg-[#F9E9ED] p-4 space-y-3 text-xs">
              <div className="text-xs font-bold text-[#B64235] uppercase tracking-wide flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-[#B64235]" />
                <span>Observed final result</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded bg-[#FFFFFF] border border-[#D8DCD8]">
                  <span className="text-xs text-[#5F625F] block font-medium">Expected</span>
                  <strong className="text-[#252525] text-sm block mt-0.5">{groundTruth}</strong>
                </div>

                <div className="p-2.5 rounded bg-[#FFFFFF] border border-[#F2CAD2]">
                  <span className="text-xs text-[#5F625F] block font-medium">Retrieved</span>
                  <strong className="text-[#B64235] text-sm block mt-0.5">{finalPrediction}</strong>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-[#F2CAD2]" title="Cosine similarity between retrieved representation and candidate. This is not a calibrated probability.">
                <span className="text-[#5F625F]">Retrieval score:</span>
                <span className="text-[#31566E] font-mono font-bold text-sm">
                  {Math.round(finalConfidence * 100)}%
                </span>
              </div>

              <div className="p-2 rounded bg-[#FFFFFF] border border-[#F2CAD2] text-[#B64235] text-center font-semibold text-xs uppercase tracking-wider">
                Interference detected
              </div>
            </div>
          )}
        </div>

        {/* Right Column (7 cols): Exact Recorded State Heatmap */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xl border border-[#D8DCD8] bg-[#FFFFFF] p-4 space-y-3 text-xs shadow-2xs">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#252525] font-semibold flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#31566E]" />
                Recorded state matrix M ({dimension}×{dimension})
              </span>
              <span className="text-xs text-[#5F625F]">At step {currentStepIdx + 1}</span>
            </div>

            {/* Matrix Heatmap Grid */}
            <div className="overflow-x-auto p-3 bg-[#F7F5EF] rounded-lg border border-[#D8DCD8]">
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
                      ? `rgba(220, 239, 226, ${Math.max(0.2, opacity)})`
                      : `rgba(249, 233, 237, ${Math.max(0.2, opacity)})`;

                    return (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        title={`M[${rIdx},${cIdx}] = ${val.toFixed(3)}`}
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded-[2px] transition-all hover:ring-2 hover:ring-[#31566E] cursor-pointer"
                        style={{ backgroundColor: bgStyle }}
                      />
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#5F625F] pt-1 border-t border-[#EAE6DF]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-[#DCEFE2] border border-[#BCE2C9] inline-block" /> Positive Weight
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-[#F9E9ED] border border-[#F2CAD2] inline-block" /> Negative Weight
                </span>
              </div>
              <span className="text-[#5F625F]">Exact coordinates stored in memory</span>
            </div>
          </div>

          {/* Scientific Guarantee Label */}
          <div className="p-3.5 rounded-lg bg-[#F7F5EF] border border-[#D8DCD8] text-xs font-sans text-[#5F625F] leading-relaxed">
            <strong className="text-[#252525] block mb-0.5">
              Provenance guarantee:
            </strong>
            “Replay uses the exact states produced by the experiment. No random animation. No fabricated intermediate states.”
          </div>
        </div>
      </div>
    </div>
  );
};

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
      className="diagram-frame p-5 sm:p-7 text-[var(--text-primary)] space-y-6 animate-in fade-in duration-300"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[var(--accent-pink)] border border-[var(--color-danger-border)] text-[var(--accent-pink-text)]">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-[var(--accent-pink-text)] font-semibold">
                Interference trace replay
              </span>
              <span className="text-xs font-mono text-[var(--accent-green-text)] bg-[var(--accent-green)] border border-[var(--color-success-border)] px-2 py-0.5 rounded font-semibold">
                Exact experiment states
              </span>
            </div>
            <h3 className="text-lg font-sans font-semibold text-[var(--text-primary)] mt-0.5">
              Step-by-step memory degradation trace
            </h3>
          </div>
        </div>

        {/* Scientific Guarantee Badge */}
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] bg-[var(--surface-soft)] border border-[var(--border)] px-3 py-1.5 rounded-lg">
          <ShieldCheck className="w-4 h-4 text-[var(--accent-blue-text)]" />
          <span>Deterministic replay · No synthetic animation</span>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span className="font-semibold uppercase text-[11px]">Experiment sequence timeline</span>
          <span className="font-mono tabular-nums">
            Step {currentStepIdx + 1} of {totalSteps}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1.5">
          {steps.map((st, idx) => {
            const isSelected = idx === currentStepIdx;
            const isFailurePoint = idx === failureStepIndex;

            let borderClass = 'border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-secondary)]';
            if (isSelected) {
              borderClass = 'border-[var(--accent-blue-text)] bg-[var(--accent-blue)] text-[var(--accent-blue-text)] ring-1 ring-[var(--accent-blue-text)] font-semibold';
            } else if (isFailurePoint) {
              borderClass = 'border-[var(--color-danger-border)] bg-[var(--accent-pink)] text-[var(--accent-pink-text)] font-semibold';
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
                  <span className="text-[10px] font-mono text-[var(--text-muted)] tabular-nums">#{String(idx + 1).padStart(2, '0')}</span>
                  <span
                    className={`text-[10px] px-1 rounded uppercase font-semibold ${
                      st.operation === 'WRITE'
                        ? 'bg-[var(--accent-yellow)] text-[var(--accent-yellow-text)] border border-[var(--color-warning-border)]'
                        : 'bg-[var(--accent-blue)] text-[var(--accent-blue-text)] border border-[var(--border)]'
                    }`}
                  >
                    {st.operation}
                  </span>
                </div>
                <div className="truncate font-medium text-xs text-[var(--text-primary)]">
                  {st.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Playback Controls & Status Callout */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)]">
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-[var(--surface)] hover:bg-[var(--color-surface-muted)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs cursor-pointer transition"
            title="Reset to step 1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleStepPrev}
            disabled={currentStepIdx === 0}
            className="p-2 rounded-lg bg-[var(--surface)] hover:bg-[var(--color-surface-muted)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs disabled:opacity-40 cursor-pointer transition"
            title="Previous step"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={handlePlayPause}
            className="px-4 py-2 rounded-lg bg-[var(--accent-green)] hover:opacity-90 text-[var(--accent-green-text)] border border-[var(--color-success-border)] text-xs font-semibold flex items-center gap-2 cursor-pointer transition"
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
            className="p-2 rounded-lg bg-[var(--surface)] hover:bg-[var(--color-surface-muted)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs disabled:opacity-40 cursor-pointer transition"
            title="Next step"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
          <span>Speed:</span>
          {[
            { label: '0.5x', ms: 1400 },
            { label: '1x', ms: 900 },
            { label: '2x', ms: 450 },
          ].map((sp) => (
            <button
              key={sp.label}
              onClick={() => setPlaybackSpeed(sp.ms)}
              className={`px-2 py-1 rounded border text-xs tabular-nums transition-colors cursor-pointer ${
                playbackSpeed === sp.ms
                  ? 'bg-[var(--accent-blue)] text-[var(--accent-blue-text)] border-[var(--accent-blue-text)] font-semibold'
                  : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
              <span className="text-xs text-[var(--text-secondary)] uppercase font-medium">Step operation</span>
              <span
                className={`text-xs px-2 py-0.5 rounded font-semibold uppercase ${
                  currentStep.operation === 'WRITE'
                    ? 'bg-[var(--accent-yellow)] text-[var(--accent-yellow-text)] border border-[var(--color-warning-border)]'
                    : 'bg-[var(--accent-blue)] text-[var(--accent-blue-text)] border border-[var(--border)]'
                }`}
              >
                {currentStep.operation}
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                {currentStep.label}
              </div>
              <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
                {currentStep.notes}
              </p>
            </div>

            {/* Probe evaluation at this step */}
            <div className="pt-2 border-t border-[var(--border)] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Target key probe:</span>
                <span className="text-[var(--text-primary)] font-semibold">"{targetKey}"</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Retrieved output:</span>
                <span
                  className={`font-semibold ${
                    currentStep.isCorrectAtStep ? 'text-[var(--accent-green-text)]' : 'text-[var(--accent-pink-text)]'
                  }`}
                >
                  {currentStep.predictionAtStep} {currentStep.isCorrectAtStep ? '✓' : '✕'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs" title="Cosine similarity between retrieved representation and candidate. This is not a calibrated probability.">
                <span className="text-[var(--text-secondary)]">Retrieval score:</span>
                <span className="text-[var(--accent-blue-text)] font-mono font-bold tabular-nums">
                  {Math.round(currentStep.confidenceAtStep * 100)}%
                </span>
              </div>
            </div>

            {isFailureTippingPoint && (
              <div className="p-2.5 rounded-lg bg-[var(--accent-pink)] border border-[var(--color-danger-border)] text-[var(--accent-pink-text)] text-xs font-sans flex items-start gap-2">
                <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Interference tipping point:</strong> At this write step, cumulative coordinate superposition displaced the original vector projection below the classification boundary.
                </span>
              </div>
            )}
          </div>

          {/* Prompt-mandated Final Step Block */}
          {isFinalStep && (
            <div className="rounded-xl border border-[var(--color-danger-border)] bg-[var(--accent-pink)] p-4 space-y-3 text-xs">
              <div className="text-xs font-bold text-[var(--accent-pink-text)] uppercase tracking-wide flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-[var(--accent-pink-text)]" />
                <span>Observed final result</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded bg-[var(--surface)] border border-[var(--border)]">
                  <span className="text-xs text-[var(--text-secondary)] block font-medium">Expected</span>
                  <strong className="text-[var(--text-primary)] text-sm block mt-0.5">{groundTruth}</strong>
                </div>

                <div className="p-2.5 rounded bg-[var(--surface)] border border-[var(--color-danger-border)]">
                  <span className="text-xs text-[var(--text-secondary)] block font-medium">Retrieved</span>
                  <strong className="text-[var(--accent-pink-text)] text-sm block mt-0.5">{finalPrediction}</strong>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-[var(--color-danger-border)]" title="Cosine similarity between retrieved representation and candidate. This is not a calibrated probability.">
                <span className="text-[var(--text-secondary)]">Retrieval score:</span>
                <span className="text-[var(--accent-blue-text)] font-mono font-bold text-sm tabular-nums">
                  {Math.round(finalConfidence * 100)}%
                </span>
              </div>

              <div className="p-2 rounded bg-[var(--surface)] border border-[var(--color-danger-border)] text-[var(--accent-pink-text)] text-center font-semibold text-xs uppercase tracking-wider">
                Interference detected
              </div>
            </div>
          )}
        </div>

        {/* Right Column (7 cols): Exact Recorded State Heatmap */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-primary)] font-semibold flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[var(--accent-blue-text)]" />
                Recorded state matrix M ({dimension}×{dimension})
              </span>
              <span className="text-xs text-[var(--text-secondary)] tabular-nums">At step {currentStepIdx + 1}</span>
            </div>

            {/* Matrix Heatmap Grid */}
            <div className="overflow-x-auto p-3 bg-[var(--color-matrix-bg)] rounded-lg border border-[var(--color-matrix-border)]">
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
                      ? `rgba(76, 154, 255, ${Math.max(0.18, opacity)})`
                      : `rgba(229, 98, 90, ${Math.max(0.18, opacity)})`;

                    return (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        title={`M[${rIdx},${cIdx}] = ${val.toFixed(3)}`}
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded-[2px] transition-all hover:ring-2 hover:ring-[var(--color-matrix-ink)] cursor-pointer"
                        style={{ backgroundColor: bgStyle }}
                      />
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-secondary)] pt-1 border-t border-[var(--border)]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-[2px] inline-block" style={{ backgroundColor: 'rgba(76, 154, 255, 0.85)' }} /> Positive weight
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-[2px] inline-block" style={{ backgroundColor: 'rgba(229, 98, 90, 0.85)' }} /> Negative weight
                </span>
              </div>
              <span className="text-[var(--text-muted)]">Exact coordinates stored in memory</span>
            </div>
          </div>

          {/* Scientific Guarantee Label */}
          <div className="p-3.5 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)] text-xs font-sans text-[var(--text-secondary)] leading-relaxed">
            <strong className="text-[var(--text-primary)] block mb-0.5">
              Provenance guarantee:
            </strong>
            “Replay uses the exact states produced by the experiment. No random animation. No fabricated intermediate states.”
          </div>
        </div>
      </div>
    </div>
  );
};

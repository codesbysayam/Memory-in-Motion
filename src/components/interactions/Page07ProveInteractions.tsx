import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertOctagon,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import { FigureCaption } from '../essay/FigureCaption';

export const Page07ProveInteractions: React.FC = () => {
  // 1. Predict Before Reveal State
  const [userPrediction, setUserPrediction] = useState<'remember' | 'collide' | null>(null);
  const [confidence, setConfidence] = useState<'low' | 'medium' | 'high'>('medium');
  const [explanationText, setExplanationText] = useState<string>('');
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([]);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [hasRetried, setHasRetried] = useState<boolean>(false);

  const scenario = {
    title: 'Hypothesis Verification: High Distractor Density at D=8',
    question:
      'We write 10 distinct, uncorrelated country-capital pairs into an 8-dimensional associative memory matrix with retention λ = 0.95. Will the initial fact (Japan → Tokyo) be correctly retrieved?',
    actualOutcome: 'collide',
    explanation:
      'In D=8 dimensional Euclidean space, at most 8 mutually orthogonal directions can exist. Storing 10 facts guarantees linear dependence and catastrophic coordinate crosstalk. The top-1 prediction collides with a later distractor.',
  };

  const isPredictionCorrect = userPrediction === scenario.actualOutcome;

  const handleToggleEvidence = (id: string) => {
    setSelectedEvidence((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleRetry = () => {
    setUserPrediction(null);
    setIsRevealed(false);
    setHasRetried(true);
  };

  const summaryMetrics = {
    conceptsUnderstood: 7,
    experimentsCompleted: 12,
    mistakesRecorded: hasRetried ? 1 : isRevealed && !isPredictionCorrect ? 1 : 0,
    successfulPredictions: isRevealed && isPredictionCorrect ? 5 : 4,
    finalScorePct: isRevealed && isPredictionCorrect ? 92 : 84,
  };

  return (
    <section className="space-y-8">
      {/* 1. PREDICT BEFORE REVEAL INTERACTION */}
      <div className="essay-figure-stage px-5 sm:px-8 py-6 space-y-6">
        <div className="border-b border-[var(--mm-rule)] pb-4 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <div className="essay-eyebrow text-[var(--mm-signal)] font-semibold mb-1">
              07.3 · Predict-Before-Reveal Protocol
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-normal text-[var(--mm-ink)]">
              {scenario.title}
            </h3>
          </div>
          <span className="text-xs font-mono text-[var(--mm-muted)]">
            Rank bound: N = 10 &gt; D = 8
          </span>
        </div>

        <p className="text-sm sm:text-[15px] text-[var(--mm-ink-soft)] leading-relaxed max-w-3xl">
          {scenario.question}
        </p>

        {!isRevealed ? (
          <div className="space-y-6">
            {/* Step 1: User Prediction */}
            <div className="space-y-2.5">
              <span className="essay-eyebrow block">Step 1 · Your prediction</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUserPrediction('remember')}
                  className={`p-3.5 rounded-md border text-xs text-left transition-colors cursor-pointer ${
                    userPrediction === 'remember'
                      ? 'border-[var(--color-success)] bg-[var(--color-success-soft)] text-[var(--color-success)]'
                      : 'border-[var(--mm-rule)] bg-[var(--page-bg)] text-[var(--mm-ink)] hover:border-[var(--mm-rule-strong)]'
                  }`}
                >
                  <strong className="block text-sm font-semibold mb-1">Will Remember (Accurate Readout)</strong>
                  <span className="text-xs text-[var(--mm-ink-soft)] block leading-relaxed">
                    Sufficient quasi-orthogonal separation survives in 8 dimensions.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setUserPrediction('collide')}
                  className={`p-3.5 rounded-md border text-xs text-left transition-colors cursor-pointer ${
                    userPrediction === 'collide'
                      ? 'border-[var(--color-danger)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]'
                      : 'border-[var(--mm-rule)] bg-[var(--page-bg)] text-[var(--mm-ink)] hover:border-[var(--mm-rule-strong)]'
                  }`}
                >
                  <strong className="block text-sm font-semibold mb-1">Will Collide (Interference Failure)</strong>
                  <span className="text-xs text-[var(--mm-ink-soft)] block leading-relaxed">
                    10 facts exceed 8 dimensions, forcing coordinate superposition overlap.
                  </span>
                </button>
              </div>
            </div>

            {/* Step 2: Self-Reported Confidence */}
            <div className="space-y-2">
              <span className="essay-eyebrow block">Step 2 · Self-reported certainty</span>
              <div className="flex flex-wrap items-center gap-4 border-b border-[var(--mm-rule)]">
                {(['low', 'medium', 'high'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setConfidence(lvl)}
                    className={`pb-2 text-xs font-sans capitalize transition-colors cursor-pointer border-b-2 -mb-px ${
                      confidence === lvl
                        ? 'border-[var(--mm-signal)] text-[var(--mm-ink)] font-semibold'
                        : 'border-transparent text-[var(--mm-muted)] hover:text-[var(--mm-ink)]'
                    }`}
                  >
                    {lvl} Confidence
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Explanation Field */}
            <div className="space-y-2">
              <label htmlFor="prove-rationale-input" className="essay-eyebrow block">
                Step 3 · Rationale statement (optional)
              </label>
              <textarea
                id="prove-rationale-input"
                rows={2}
                value={explanationText}
                onChange={(e) => setExplanationText(e.target.value)}
                placeholder="I think this will happen because..."
                className="w-full p-3 rounded-md border border-[var(--mm-rule)] bg-[var(--page-bg)] text-sm text-[var(--mm-ink)] placeholder:text-[var(--mm-muted)] focus:outline-none focus:border-[var(--mm-signal)]"
              />
            </div>

            {/* Step 4: Evidence Checkboxes */}
            <div className="space-y-2">
              <span className="essay-eyebrow block">Step 4 · Supporting mechanisms</span>
              <div className="space-y-1.5 text-sm">
                {[
                  { id: 'ev1', text: 'Dimensional capacity bound: N > D violates orthogonal independence.' },
                  { id: 'ev2', text: 'Exponential retention decay: λ^t weakens earlier written facts.' },
                  { id: 'ev3', text: 'Frobenius norm saturation: energy drift increases cross-talk.' },
                ].map((ev) => (
                  <label key={ev.id} className="flex items-center gap-2.5 cursor-pointer text-[var(--mm-ink-soft)] hover:text-[var(--mm-ink)]">
                    <input
                      type="checkbox"
                      checked={selectedEvidence.includes(ev.id)}
                      onChange={() => handleToggleEvidence(ev.id)}
                      className="rounded accent-[var(--mm-signal)]"
                    />
                    <span>{ev.text}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={() => setIsRevealed(true)}
                disabled={!userPrediction}
                className="btn-primary text-sm"
              >
                <span>Reveal Experimental Outcome</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in">
            <div
              className={`p-4 border-l-2 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm ${
                isPredictionCorrect
                  ? 'border-[var(--color-success)] bg-[var(--color-success-soft)]/60 text-[var(--color-success)]'
                  : 'border-[var(--color-danger)] bg-[var(--color-danger-soft)]/60 text-[var(--color-danger)]'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {isPredictionCorrect ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                ) : (
                  <AlertOctagon className="w-5 h-5 shrink-0 mt-0.5" />
                )}
                <div>
                  <strong className="text-sm block font-semibold">
                    {isPredictionCorrect ? 'Prediction Verified by Experiment' : 'Empirical Collision Observed'}
                  </strong>
                  <span className="text-xs text-[var(--mm-ink)]">
                    Your prediction: {userPrediction} ({confidence} confidence) · Actual result: {scenario.actualOutcome}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRetry}
                className="btn-secondary text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Challenge</span>
              </button>
            </div>

            <div className="pl-4 border-l-2 border-[var(--mm-signal)] text-xs sm:text-sm space-y-2">
              <span className="essay-eyebrow block">Mechanistic explanation</span>
              <p className="text-[var(--mm-ink)] leading-relaxed">{scenario.explanation}</p>
              {explanationText && (
                <div className="pt-2 border-t border-[var(--mm-rule)] text-[var(--mm-ink-soft)]">
                  <span>Your stated rationale: </span>
                  <em className="text-[var(--mm-ink)]">&ldquo;{explanationText}&rdquo;</em>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Capstone Telemetry Strip (Flat divide-x) */}
        <div className="pt-5 border-t border-[var(--mm-rule)] space-y-3">
          <div className="essay-eyebrow">Session Telemetry Summary</div>
          <div className="grid grid-cols-2 sm:grid-cols-5 border-y border-[var(--mm-rule)] divide-y sm:divide-y-0 sm:divide-x divide-[var(--mm-rule)] text-xs tabular-nums">
            <div className="py-3 px-3 space-y-0.5">
              <span className="text-[var(--mm-muted)] block">Concepts</span>
              <strong className="text-lg font-mono font-semibold text-[var(--mm-ink)] block">
                {summaryMetrics.conceptsUnderstood} / 7
              </strong>
            </div>
            <div className="py-3 px-3 space-y-0.5">
              <span className="text-[var(--mm-muted)] block">Trials Run</span>
              <strong className="text-lg font-mono font-semibold text-[var(--mm-ink)] block">
                {summaryMetrics.experimentsCompleted}
              </strong>
            </div>
            <div className="py-3 px-3 space-y-0.5">
              <span className="text-[var(--mm-muted)] block">Retries</span>
              <strong className="text-lg font-mono font-semibold text-[var(--color-danger)] block">
                {summaryMetrics.mistakesRecorded}
              </strong>
            </div>
            <div className="py-3 px-3 space-y-0.5">
              <span className="text-[var(--mm-muted)] block">Verified</span>
              <strong className="text-lg font-mono font-semibold text-[var(--color-success)] block">
                {summaryMetrics.successfulPredictions}
              </strong>
            </div>
            <div className="py-3 px-3 space-y-0.5 col-span-2 sm:col-span-1">
              <span className="text-[var(--mm-signal)] block font-medium">Session Mastery</span>
              <strong className="text-lg font-mono font-semibold text-[var(--mm-signal)] block">
                {summaryMetrics.finalScorePct}%
              </strong>
            </div>
          </div>
        </div>

        <FigureCaption
          figure="Fig. 7.3"
          title="Overcomplete fast-weight packing at N=10, D=8 forces rank collision and readout failure."
          source="Live Toy Computation"
        />
      </div>
    </section>
  );
};


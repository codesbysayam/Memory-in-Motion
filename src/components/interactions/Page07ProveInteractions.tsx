import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  AlertOctagon,
  RotateCcw,
  Sparkles,
  ArrowRight,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import { InlineMath, BlockMath } from '../ui/MathView';

export const Page07ProveInteractions: React.FC = () => {
  // 1. Predict Before Reveal State
  const [userPrediction, setUserPrediction] = useState<'remember' | 'collide' | null>(null);
  const [confidence, setConfidence] = useState<'low' | 'medium' | 'high'>('medium');
  const [explanationText, setExplanationText] = useState<string>('');
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([]);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [hasRetried, setHasRetried] = useState<boolean>(false);

  // Question Scenario
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

  // Final Knowledge Summary metrics
  const summaryMetrics = {
    conceptsUnderstood: 7,
    experimentsCompleted: 12,
    mistakesRecorded: hasRetried ? 1 : isRevealed && !isPredictionCorrect ? 1 : 0,
    successfulPredictions: isRevealed && isPredictionCorrect ? 5 : 4,
    finalScorePct: isRevealed && isPredictionCorrect ? 92 : 84,
  };

  return (
    <div className="space-y-8">
      {/* 1. PREDICT BEFORE REVEAL INTERACTION */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <div className="px-5 py-4 sm:px-6 border-b border-[var(--border)] bg-[var(--surface-soft)] flex items-start gap-3">
          <HelpCircle className="w-4 h-4 text-[var(--accent-blue-text)] shrink-0 mt-1" />
          <div>
            <h3 className="font-sans text-base font-semibold text-[var(--text-primary)]">
              Hypothesis Test: Predict Before Reveal
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
              Commit to an empirical prediction and state your rationale before inspecting the simulation outcome.
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Scenario Context */}
          <div className="pb-4 border-b border-[var(--border)] space-y-1.5">
            <h4 className="text-sm sm:text-base font-sans font-semibold text-[var(--text-primary)]">
              {scenario.title}
            </h4>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{scenario.question}</p>
          </div>

          {!isRevealed ? (
            <div className="space-y-5">
              {/* Step 1: User Prediction */}
              <div className="space-y-2.5">
                <span className="text-xs font-mono font-medium text-[var(--text-secondary)] block">
                  Step 1 · Your prediction
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUserPrediction('remember')}
                    className={`p-3.5 rounded-lg border text-xs text-left transition-colors cursor-pointer ${
                      userPrediction === 'remember'
                        ? 'border-[var(--color-success)] bg-[var(--accent-green)] text-[var(--accent-green-text)] ring-1 ring-[var(--color-success)]'
                        : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-soft)]'
                    }`}
                  >
                    <strong className="block text-sm font-semibold mb-1">Will Remember (Accurate Readout)</strong>
                    <span className="text-xs text-[var(--text-secondary)] block leading-relaxed">
                      Sufficient quasi-orthogonal separation survives in 8 dimensions.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserPrediction('collide')}
                    className={`p-3.5 rounded-lg border text-xs text-left transition-colors cursor-pointer ${
                      userPrediction === 'collide'
                        ? 'border-[var(--color-danger)] bg-[var(--accent-pink)] text-[var(--accent-pink-text)] ring-1 ring-[var(--color-danger)]'
                        : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-soft)]'
                    }`}
                  >
                    <strong className="block text-sm font-semibold mb-1">Will Collide (Interference Failure)</strong>
                    <span className="text-xs text-[var(--text-secondary)] block leading-relaxed">
                      10 facts exceed 8 dimensions, forcing coordinate superposition overlap.
                    </span>
                  </button>
                </div>
              </div>

              {/* Step 2: Self-Reported Confidence */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-medium text-[var(--text-secondary)] block">
                  Step 2 · Self-reported confidence (learner certainty)
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {(['low', 'medium', 'high'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setConfidence(lvl)}
                      className={`px-3 py-1.5 rounded-md border text-xs font-medium capitalize transition-colors cursor-pointer ${
                        confidence === lvl
                          ? 'border-[var(--color-accent)] bg-[var(--accent-blue)] text-[var(--accent-blue-text)] font-semibold'
                          : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {lvl} Confidence
                    </button>
                  ))}
                </div>
                <span className="text-xs text-[var(--text-muted)] block">
                  Tracks learner certainty, distinct from model cosine similarity.
                </span>
              </div>

              {/* Step 3: Explanation Field */}
              <div className="space-y-2">
                <label htmlFor="prove-rationale-input" className="text-xs font-mono font-medium text-[var(--text-secondary)] block">
                  Step 3 · Rationale statement
                </label>
                <textarea
                  id="prove-rationale-input"
                  rows={2}
                  value={explanationText}
                  onChange={(e) => setExplanationText(e.target.value)}
                  placeholder="I think this will happen because..."
                  className="w-full p-3 rounded-lg border border-[var(--border)] bg-[var(--page-bg)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--color-accent)]"
                />
              </div>

              {/* Step 4: Evidence Checkboxes */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-medium text-[var(--text-secondary)] block">
                  Step 4 · Supporting evidence check
                </span>
                <div className="space-y-1.5 text-sm">
                  {[
                    { id: 'ev1', text: 'Dimensional capacity bound: N > D violates orthogonal independence.' },
                    { id: 'ev2', text: 'Exponential retention decay: λ^t weakens earlier written facts.' },
                    { id: 'ev3', text: 'Frobenius norm saturation: energy drift increases cross-talk.' },
                  ].map((ev) => (
                    <label key={ev.id} className="flex items-center gap-2.5 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                      <input
                        type="checkbox"
                        checked={selectedEvidence.includes(ev.id)}
                        onChange={() => handleToggleEvidence(ev.id)}
                        className="rounded accent-[var(--color-accent)]"
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
              {/* Outcome Banner */}
              <div
                className={`p-4 rounded-lg border flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm ${
                  isPredictionCorrect
                    ? 'bg-[var(--accent-green)] border-[var(--color-success-border)] text-[var(--accent-green-text)]'
                    : 'bg-[var(--accent-pink)] border-[var(--color-danger-border)] text-[var(--accent-pink-text)]'
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
                    <span className="text-xs text-[var(--text-primary)]">
                      Your prediction: {userPrediction} · Actual result: {scenario.actualOutcome}
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

              {/* Scientific Explanation */}
              <div className="p-4 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)] text-xs sm:text-sm space-y-2">
                <span className="font-mono font-medium text-[var(--text-secondary)] text-xs block">
                  Mechanistic explanation
                </span>
                <p className="text-[var(--text-primary)] leading-relaxed">{scenario.explanation}</p>
                {explanationText && (
                  <div className="pt-2 border-t border-[var(--border)] text-[var(--text-secondary)]">
                    <span>Your stated rationale: </span>
                    <em className="text-[var(--text-primary)]">&ldquo;{explanationText}&rdquo;</em>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. FINAL KNOWLEDGE & PROGRESS SUMMARY */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <div className="px-5 py-4 sm:px-6 border-b border-[var(--border)] bg-[var(--surface-soft)] flex items-start gap-3">
          <Award className="w-4 h-4 text-[var(--accent-yellow-text)] shrink-0 mt-1" />
          <div>
            <h3 className="font-sans text-base font-semibold text-[var(--text-primary)]">
              Capstone Knowledge Summary
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
              Performance telemetry across all 7 research stages.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border)] text-xs">
          <div className="p-4 space-y-1">
            <span className="text-[var(--text-secondary)] block">Concepts Mastered</span>
            <strong className="text-xl font-mono tabular-nums font-semibold text-[var(--text-primary)] block">
              {summaryMetrics.conceptsUnderstood} / 7
            </strong>
          </div>
          <div className="p-4 space-y-1">
            <span className="text-[var(--text-secondary)] block">Trials Completed</span>
            <strong className="text-xl font-mono tabular-nums font-semibold text-[var(--text-primary)] block">
              {summaryMetrics.experimentsCompleted}
            </strong>
          </div>
          <div className="p-4 space-y-1">
            <span className="text-[var(--text-secondary)] block">Mistakes / Retries</span>
            <strong className="text-xl font-mono tabular-nums font-semibold text-[var(--accent-pink-text)] block">
              {summaryMetrics.mistakesRecorded}
            </strong>
          </div>
          <div className="p-4 space-y-1">
            <span className="text-[var(--text-secondary)] block">Correct Predictions</span>
            <strong className="text-xl font-mono tabular-nums font-semibold text-[var(--accent-green-text)] block">
              {summaryMetrics.successfulPredictions}
            </strong>
          </div>
          <div className="p-4 space-y-1 bg-[var(--accent-blue)] col-span-2 sm:col-span-1">
            <span className="text-[var(--accent-blue-text)] block font-medium">Mastery Score</span>
            <strong className="text-xl font-mono tabular-nums font-semibold text-[var(--accent-blue-text)] block">
              {summaryMetrics.finalScorePct}%
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};

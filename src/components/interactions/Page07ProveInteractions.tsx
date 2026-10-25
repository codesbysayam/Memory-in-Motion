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
    <div className="space-y-8 mt-6">
      {/* 1. PREDICT BEFORE REVEAL INTERACTION */}
      <div className="rounded-xl border border-[#D8DCD8] bg-[#FFFFFF] p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-[#EAE6DF] pb-3">
          <div className="p-1.5 rounded-lg bg-[#E7F2FA] text-[#31566E]">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-[#252525]">
              1. Hypothesis Test: Predict Before Reveal
            </h3>
            <p className="text-xs text-[#5F625F]">
              Commit to an empirical prediction and state your rationale before inspecting the simulation outcome.
            </p>
          </div>
        </div>

        {/* Scenario Card */}
        <div className="p-4 rounded-xl bg-[#F7F5EF] border border-[#D8DCD8] space-y-2 text-xs">
          <strong className="text-sm font-serif block text-[#252525]">{scenario.title}</strong>
          <p className="text-[#5F625F] leading-relaxed">{scenario.question}</p>
        </div>

        {!isRevealed ? (
          <div className="space-y-4">
            {/* Step 1: User Prediction */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#252525] block">
                Step 1: Your Prediction
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setUserPrediction('remember')}
                  className={`p-3 rounded-xl border text-xs font-medium text-left transition cursor-pointer ${
                    userPrediction === 'remember'
                      ? 'border-[#247A4B] bg-[#DCEFE2] text-[#247A4B] font-bold shadow-xs'
                      : 'border-[#D8DCD8] bg-[#F7F5EF] text-[#5F625F] hover:text-[#252525]'
                  }`}
                >
                  <strong className="block text-sm">Will Remember (Accurate Readout)</strong>
                  <span className="text-[11px] opacity-80">
                    Sufficient quasi-orthogonal separation survives in 8 dimensions.
                  </span>
                </button>

                <button
                  onClick={() => setUserPrediction('collide')}
                  className={`p-3 rounded-xl border text-xs font-medium text-left transition cursor-pointer ${
                    userPrediction === 'collide'
                      ? 'border-[#B64235] bg-[#F9E9ED] text-[#B64235] font-bold shadow-xs'
                      : 'border-[#D8DCD8] bg-[#F7F5EF] text-[#5F625F] hover:text-[#252525]'
                  }`}
                >
                  <strong className="block text-sm">Will Collide (Interference Failure)</strong>
                  <span className="text-[11px] opacity-80">
                    10 facts exceed 8 dimensions, forcing coordinate superposition overlap.
                  </span>
                </button>
              </div>
            </div>

            {/* Step 2: Self-Reported Confidence */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-[#252525] block">
                Step 2: Self-Reported Confidence (Learner Certainty)
              </span>
              <div className="flex items-center gap-2">
                {(['low', 'medium', 'high'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setConfidence(lvl)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium capitalize transition cursor-pointer ${
                      confidence === lvl
                        ? 'border-[#31566E] bg-[#E7F2FA] text-[#31566E] font-bold shadow-xs'
                        : 'border-[#D8DCD8] bg-[#F7F5EF] text-[#5F625F]'
                    }`}
                  >
                    {lvl} Confidence
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-[#5F625F] italic">
                Note: Tracks learner certainty, distinct from model cosine similarity.
              </span>
            </div>

            {/* Step 3: Explanation Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#252525] block">
                Step 3: Rationale Statement
              </label>
              <textarea
                rows={2}
                value={explanationText}
                onChange={(e) => setExplanationText(e.target.value)}
                placeholder="I think this will happen because..."
                className="w-full p-3 rounded-xl border border-[#D8DCD8] bg-[#F7F5EF] text-xs text-[#252525] focus:outline-none focus:ring-1 focus:ring-[#31566E]"
              />
            </div>

            {/* Step 4: Evidence Checkboxes */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-[#252525] block">
                Step 4: Supporting Evidence Check
              </span>
              <div className="space-y-1 text-xs">
                {[
                  { id: 'ev1', text: 'Dimensional capacity bound: N > D violates orthogonal independence.' },
                  { id: 'ev2', text: 'Exponential retention decay: λ^t weakens earlier written facts.' },
                  { id: 'ev3', text: 'Frobenius norm saturation: energy drift increases cross-talk.' },
                ].map((ev) => (
                  <label key={ev.id} className="flex items-center gap-2 cursor-pointer text-[#5F625F] hover:text-[#252525]">
                    <input
                      type="checkbox"
                      checked={selectedEvidence.includes(ev.id)}
                      onChange={() => handleToggleEvidence(ev.id)}
                      className="rounded accent-[#31566E]"
                    />
                    <span>{ev.text}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsRevealed(true)}
              disabled={!userPrediction}
              className="px-5 py-2.5 rounded-lg bg-[#247A4B] hover:bg-[#1E6B43] text-white text-xs font-medium transition cursor-pointer disabled:opacity-50"
            >
              Reveal Experimental Outcome →
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in">
            {/* Outcome Banner */}
            <div
              className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                isPredictionCorrect
                  ? 'bg-[#DCEFE2] border-[#D8DCD8] text-[#247A4B]'
                  : 'bg-[#F9E9ED] border-[#D8DCD8] text-[#B64235]'
              }`}
            >
              <div className="flex items-center gap-2">
                {isPredictionCorrect ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertOctagon className="w-5 h-5 shrink-0" />}
                <div>
                  <strong className="text-sm block">
                    {isPredictionCorrect ? 'Prediction Verified by Experiment' : 'Empirical Collision Observed'}
                  </strong>
                  <span>Your prediction: {userPrediction} · Actual result: {scenario.actualOutcome}</span>
                </div>
              </div>

              <button
                onClick={handleRetry}
                className="px-3 py-1.5 rounded-lg bg-[#FFFFFF] text-[#252525] border border-[#D8DCD8] text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Challenge</span>
              </button>
            </div>

            {/* Scientific Explanation */}
            <div className="p-4 rounded-xl bg-[#F7F5EF] border border-[#D8DCD8] text-xs space-y-1.5">
              <span className="font-semibold uppercase text-[#5F625F] text-[11px] block">
                Mechanistic Explanation
              </span>
              <p className="text-[#252525] leading-relaxed">{scenario.explanation}</p>
              {explanationText && (
                <div className="pt-2 border-t border-[#D8DCD8] text-[#5F625F]">
                  <span>Your stated rationale: </span>
                  <em className="text-[#252525]">"{explanationText}"</em>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. FINAL KNOWLEDGE & PROGRESS SUMMARY */}
      <div className="rounded-xl border border-[#D8DCD8] bg-[#FFFFFF] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#EAE6DF] pb-3">
          <div className="p-1.5 rounded-lg bg-[#FFF5D8] text-[#A46622]">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-[#252525]">
              2. Capstone Knowledge Summary
            </h3>
            <p className="text-xs text-[#5F625F]">
              Comprehensive performance telemetry across all 7 research stages.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#F7F5EF] border border-[#D8DCD8] space-y-1">
            <span className="text-[#5F625F] block text-[11px]">Concepts Mastered</span>
            <strong className="text-xl font-serif text-[#252525]">{summaryMetrics.conceptsUnderstood} / 7</strong>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F7F5EF] border border-[#D8DCD8] space-y-1">
            <span className="text-[#5F625F] block text-[11px]">Trials Completed</span>
            <strong className="text-xl font-serif text-[#252525]">{summaryMetrics.experimentsCompleted}</strong>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F7F5EF] border border-[#D8DCD8] space-y-1">
            <span className="text-[#5F625F] block text-[11px]">Mistakes / Retries</span>
            <strong className="text-xl font-serif text-[#B64235]">{summaryMetrics.mistakesRecorded}</strong>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F7F5EF] border border-[#D8DCD8] space-y-1">
            <span className="text-[#5F625F] block text-[11px]">Correct Predictions</span>
            <strong className="text-xl font-serif text-[#247A4B]">{summaryMetrics.successfulPredictions}</strong>
          </div>
          <div className="p-3.5 rounded-xl bg-[#E7F2FA] border border-[#D8DCD8] text-[#31566E] space-y-1">
            <span className="block text-[11px]">Mastery Score</span>
            <strong className="text-xl font-serif">{summaryMetrics.finalScorePct}%</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

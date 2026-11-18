import React, { useState, useMemo } from 'react';
import { Award, CheckCircle2, XCircle, RotateCcw, ArrowRight, HelpCircle } from 'lucide-react';
import { SectionHeader } from './ui/SectionHeader';
import { TruthModel } from './ui/TruthModel';
import { SeededRandom } from '../utils/seededRandom';
import { normalizeVector, cosineSimilarity } from '../utils/metrics';
import { DiscoveryMode } from './DiscoveryMode';
import { ScientificHonestyPanel } from './ScientificHonestyPanel';
import { EvidenceStrip } from './ui/EvidenceStrip';
import { InlineMath, FormattedMathText } from './ui/MathView';

interface TrialConfig {
  round: number;
  dim: number;
  factsCount: number;
  similarity: 'Low' | 'High';
  targetKey: string;
  expectedVal: number;
  explanation: string;
}

const TRIALS: TrialConfig[] = [
  {
    round: 1,
    dim: 8,
    factsCount: 3,
    similarity: 'Low',
    targetKey: 'B',
    expectedVal: 42,
    explanation: 'With D=8 and only 3 distinct, uncorrelated variable pairs, the representation vectors remain quasi-orthogonal. The state has ample geometric capacity.',
  },
  {
    round: 2,
    dim: 4,
    factsCount: 6,
    similarity: 'Low',
    targetKey: 'B',
    expectedVal: 42,
    explanation: 'With D=4, at most 4 mutually orthogonal vectors can exist in the coordinate system. Compressing 6 pairs guarantees overlapping dot-products and memory interference.',
  },
  {
    round: 3,
    dim: 8,
    factsCount: 7,
    similarity: 'High',
    targetKey: 'B',
    expectedVal: 42,
    explanation: 'High semantic correlation between values causes vector clusters to align in similar directions, drastically shrinking the decision margin.',
  },
  {
    round: 4,
    dim: 16,
    factsCount: 6,
    similarity: 'Low',
    targetKey: 'B',
    expectedVal: 42,
    explanation: 'With 16 dimensions, the Johnson-Lindenstrauss lemma allows several dozen quasi-orthogonal projections with minimal cross-talk. 6 pairs easily fit.',
  },
  {
    round: 5,
    dim: 4,
    factsCount: 8,
    similarity: 'High',
    targetKey: 'B',
    expectedVal: 42,
    explanation: 'Extreme overload: 8 highly correlated pairs crowded into a 4-dimensional continuous state causes catastrophic superposition failure.',
  },
];

export const Section05FindTheFailure: React.FC = () => {
  const [currentRoundIdx, setCurrentRoundIdx] = useState<number>(0);
  const [userPrediction, setUserPrediction] = useState<'remember' | 'forget' | null>(null);
  const [score, setScore] = useState<number>(0);

  const trial = TRIALS[currentRoundIdx];

  // Deterministic simulation for this trial
  const result = useMemo(() => {
    const rng = new SeededRandom(2026 + trial.round * 13);
    const D = trial.dim;
    const pairs = [
      { key: 'A', val: 19 },
      { key: 'B', val: 42 },
      { key: 'C', val: 88 },
      { key: 'D', val: 104 },
      { key: 'E', val: 55 },
      { key: 'F', val: 21 },
      { key: 'G', val: 93 },
      { key: 'H', val: 67 },
    ].slice(0, trial.factsCount);

    const noiseFactor = trial.similarity === 'High' ? 0.45 : 0.08;

    const keyVecs = new Map<string, number[]>();
    const valVecs = new Map<number, number[]>();

    pairs.forEach((p) => {
      keyVecs.set(p.key, normalizeVector(Array.from({ length: D }, () => rng.nextGaussian(0, 1))));
      const vRaw = Array.from({ length: D }, () => rng.nextGaussian(0, 1));
      if (trial.similarity === 'High') vRaw[0] += 1.2;
      valVecs.set(p.val, normalizeVector(vRaw));
    });

    let state = new Array(D).fill(0);
    pairs.forEach((p) => {
      const k = keyVecs.get(p.key)!;
      const v = valVecs.get(p.val)!;
      for (let i = 0; i < D; i++) {
        state[i] += (k[i] * v[(i + 1) % D]) + (k[i] + v[i]) * 0.25;
        state[i] += rng.nextGaussian(0, noiseFactor);
      }
      state = normalizeVector(state);
    });

    // Probe B
    const bKey = keyVecs.get('B')!;
    const scores = pairs.map((p) => {
      const v = valVecs.get(p.val)!;
      const probe = Array.from({ length: D }, (_, i) => (bKey[i] * v[(i + 1) % D]) + (bKey[i] + v[i]) * 0.25);
      return { val: p.val, sim: cosineSimilarity(state, normalizeVector(probe)) };
    });

    scores.sort((a, b) => b.sim - a.sim);
    const predicted = scores[0].val;
    const modelRemembers = predicted === trial.expectedVal;

    return {
      pairs,
      predicted,
      modelRemembers,
      actualMargin: scores[0].sim - (scores[1]?.sim || 0),
    };
  }, [trial]);

  const handlePredict = (choice: 'remember' | 'forget') => {
    if (userPrediction !== null) return;
    setUserPrediction(choice);

    const isUserCorrect =
      (choice === 'remember' && result.modelRemembers) ||
      (choice === 'forget' && !result.modelRemembers);

    if (isUserCorrect) {
      setScore((s) => s + 1);
    }
  };

  const handleNextRound = () => {
    setUserPrediction(null);
    setCurrentRoundIdx((prev) => (prev + 1) % TRIALS.length);
  };

  const handleResetChallenge = () => {
    setCurrentRoundIdx(0);
    setUserPrediction(null);
    setScore(0);
  };

  const isUserCorrect =
    userPrediction !== null &&
    ((userPrediction === 'remember' && result.modelRemembers) ||
      (userPrediction === 'forget' && !result.modelRemembers));

  return (
    <section id="section-05" className="w-full scroll-mt-20 border-b border-[var(--border)] bg-[var(--page-bg)] text-[var(--text-primary)] py-10">
      <div id="section-05-deltas" className="scroll-mt-24" />
      <div id="debug-panel-section" className="scroll-mt-24" />
      <div className="w-full space-y-6">
        <SectionHeader
          number="05"
          category="FIND THE FAILURE CHALLENGE"
          title="Predict the Boundary: Will it Remember or Forget?"
          subtitle={
            <span>
              Inspect the trial parameters (Capacity <InlineMath math="D" />, Stream Length <InlineMath math="T" />, Similarity). Before looking at the result, predict whether the continuous recurrent state will successfully retrieve <InlineMath math="B = 42" /> or suffer memory failure.
            </span>
          }
          discovery="Human intuition often underestimates interference: adding just 2 distractor vectors in low dimensions can catastrophically corrupt prior memory associations."
        />

        {/* Epistemic Evidence Classification */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <EvidenceStrip
            type="live"
            detail="Deterministic synthetic memory trials with active vector cosine probing"
          />
        </div>

        {/* Interactive Discovery Mode: Can your memory hold this? */}
        <div className="mb-12">
          <DiscoveryMode />
        </div>

        {/* 12-Column Responsive Layout for Pre-computed Challenge Trials */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Challenge Trial Interface */}
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 font-sans">
                <span className="text-xs font-semibold text-[var(--accent-blue-text)] tabular-nums">
                  Round {String(trial.round).padStart(2, '0')} / 05
                </span>
                <span className="text-xs text-[var(--text-secondary)] tabular-nums">
                  Score: <strong className="text-[var(--text-primary)] font-mono tabular-nums">{score}</strong> / {TRIALS.length}
                </span>
              </div>

              {/* Trial Specifications */}
              <div className="grid grid-cols-3 gap-2 text-xs font-sans">
                <div className="rounded-lg bg-[var(--surface)] p-2.5 border border-[var(--border)]">
                  <span className="text-[var(--text-secondary)] block text-xs">Capacity</span>
                  <span className="font-bold text-[var(--text-primary)] font-mono tabular-nums"><InlineMath math={`D = ${trial.dim}`} /></span>
                </div>
                <div className="rounded-lg bg-[var(--surface)] p-2.5 border border-[var(--border)]">
                  <span className="text-[var(--text-secondary)] block text-xs">Facts (<InlineMath math="T" />)</span>
                  <span className="font-bold text-[var(--text-primary)] font-mono tabular-nums">{trial.factsCount} pairs</span>
                </div>
                <div className="rounded-lg bg-[var(--surface)] p-2.5 border border-[var(--border)]">
                  <span className="text-[var(--text-secondary)] block text-xs">Crosstalk</span>
                  <span className={`font-bold font-sans ${trial.similarity === 'High' ? 'text-[var(--accent-yellow-text)]' : 'text-[var(--accent-green-text)]'}`}>
                    {trial.similarity}
                  </span>
                </div>
              </div>

              {/* Variable stream tokens */}
              <div>
                <span className="text-xs font-sans text-[var(--text-secondary)] block mb-1.5">
                  Stream sequence (Target key is B):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.pairs.map((p) => {
                    const isTarget = p.key === 'B';
                    return (
                      <span
                        key={p.key}
                        className={`px-2 py-1 rounded text-xs font-mono border ${
                          isTarget
                            ? 'bg-[var(--accent-blue)] border-[var(--border)] text-[var(--accent-blue-text)] font-bold'
                            : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)]'
                        }`}
                      >
                        {p.key} → {p.val}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Prediction Decision Buttons */}
              <div className="pt-2 border-t border-[var(--border)] space-y-2">
                <span className="text-xs font-sans text-[var(--text-secondary)] block">
                  Your hypothesis for Round {trial.round}:
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handlePredict('remember')}
                    disabled={userPrediction !== null}
                    className={`py-2 px-3 rounded-lg border text-xs font-sans font-semibold transition-all ${
                      userPrediction === 'remember'
                        ? 'border-[var(--accent-green-text)] bg-[var(--accent-green)] text-[var(--accent-green-text)] ring-1 ring-[var(--accent-green-text)]'
                        : userPrediction !== null
                        ? 'opacity-40 border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)]'
                        : 'border-[var(--border)] bg-[var(--accent-green)] hover:opacity-90 text-[var(--accent-green-text)] cursor-pointer'
                    }`}
                  >
                    <span className="inline-flex items-center justify-center gap-1">
                      <span>Will remember</span>
                      <span className="font-mono text-xs">(B=42)</span>
                    </span>
                  </button>

                  <button
                    onClick={() => handlePredict('forget')}
                    disabled={userPrediction !== null}
                    className={`py-2 px-3 rounded-lg border text-xs font-sans font-semibold transition-all ${
                      userPrediction === 'forget'
                        ? 'border-[var(--accent-pink-text)] bg-[var(--accent-pink)] text-[var(--accent-pink-text)] ring-1 ring-[var(--accent-pink-text)]'
                        : userPrediction !== null
                        ? 'opacity-40 border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)]'
                        : 'border-[var(--border)] bg-[var(--accent-pink)] hover:opacity-90 text-[var(--accent-pink-text)] cursor-pointer'
                    }`}
                  >
                    Will forget (Interference)
                  </button>
                </div>
              </div>

              {/* User Outcome Evaluation */}
              {userPrediction !== null && (
                <div
                  className={`rounded-lg p-3 border text-xs space-y-2 animate-in fade-in font-sans ${
                    isUserCorrect
                      ? 'bg-[var(--accent-green)] border-[var(--border)] text-[var(--accent-green-text)]'
                      : 'bg-[var(--accent-yellow)] border-[var(--border)] text-[var(--accent-yellow-text)]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    {isUserCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[var(--accent-green-text)]" />
                        <span>Hypothesis confirmed (+1 pt)</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-[var(--accent-yellow-text)]" />
                        <span>Hypothesis disproved</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed text-[var(--text-primary)]">
                    {trial.explanation}
                  </p>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleNextRound}
                      className="btn-primary py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      <span>{currentRoundIdx === TRIALS.length - 1 ? 'Finish challenge' : 'Next trial'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs font-sans text-[var(--text-secondary)]">
              <span>Round {trial.round} of 5</span>
              <button
                onClick={handleResetChallenge}
                className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset all trials</span>
              </button>
            </div>
          </div>

          {/* Right Column: Ground Truth vs Model Prediction */}
          <div className="lg:col-span-7 space-y-5">
            <TruthModel
              truth="42 (Key B)"
              model={userPrediction !== null ? String(result.predicted) : '??? (Make prediction first)'}
              label={`Trial ${trial.round} empirical probe for key "B"`}
              confidence={userPrediction !== null ? Math.max(0.2, 0.5 + result.actualMargin) : undefined}
              margin={userPrediction !== null ? result.actualMargin : undefined}
              status={
                userPrediction === null
                  ? 'match'
                  : result.modelRemembers
                  ? 'match'
                  : 'interference'
              }
              explanation={
                userPrediction === null
                  ? 'Make your prediction on the left to reveal the actual vector probe computation.'
                  : result.modelRemembers
                  ? `The model recalled B = ${result.predicted}. The decision margin remained positive (+${result.actualMargin.toFixed(2)}).`
                  : `Interference observed: The model retrieved ${result.predicted} instead of 42. High coordinate overlap caused the probe to lock onto an interference pattern.`
              }
            />
          </div>
        </div>

        {/* Scientific Evidence & Honesty Disclosure */}
        <div className="mt-10">
          <ScientificHonestyPanel />
        </div>
      </div>
    </section>
  );
};

import React, { useState, useMemo } from 'react';
import { Award, CheckCircle2, XCircle, RotateCcw, ArrowRight, HelpCircle } from 'lucide-react';
import { SectionHeader } from './ui/SectionHeader';
import { TruthModel } from './ui/TruthModel';
import { SeededRandom } from '../utils/seededRandom';
import { normalizeVector, cosineSimilarity } from '../utils/metrics';
import { DiscoveryMode } from './DiscoveryMode';
import { ScientificHonestyPanel } from './ScientificHonestyPanel';
import { EvidenceStrip } from './ui/EvidenceStrip';

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
    <section id="section-05" className="scroll-mt-20 border-b border-[#252A35] bg-[#07080B] py-14">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <SectionHeader
          number="05"
          category="FIND THE FAILURE CHALLENGE"
          title="Predict the Boundary: Will it Remember or Forget?"
          subtitle="Inspect the trial parameters (Capacity D, Stream Length T, Similarity). Before looking at the result, predict whether the continuous recurrent state will successfully retrieve B = 42 or suffer memory failure."
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
            <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#252A35] pb-2">
                <span className="text-xs font-mono uppercase tracking-widest text-[#22D3EE] font-semibold">
                  ROUND {String(trial.round).padStart(2, '0')} / 05
                </span>
                <span className="text-xs font-mono text-[#8F96A3]">
                  SCORE: <strong className="text-white">{score}</strong> / {TRIALS.length}
                </span>
              </div>

              {/* Trial Specifications */}
              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <div className="rounded-lg bg-[#151922] p-2.5 border border-[#252A35]">
                  <span className="text-[#8F96A3] block text-[10px]">CAPACITY</span>
                  <span className="font-bold text-white">D = {trial.dim}</span>
                </div>
                <div className="rounded-lg bg-[#151922] p-2.5 border border-[#252A35]">
                  <span className="text-[#8F96A3] block text-[10px]">FACTS (T)</span>
                  <span className="font-bold text-white">{trial.factsCount} pairs</span>
                </div>
                <div className="rounded-lg bg-[#151922] p-2.5 border border-[#252A35]">
                  <span className="text-[#8F96A3] block text-[10px]">CROSSTALK</span>
                  <span className={`font-bold ${trial.similarity === 'High' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {trial.similarity}
                  </span>
                </div>
              </div>

              {/* Variable stream tokens */}
              <div>
                <span className="text-[11px] font-mono uppercase text-[#8F96A3] block mb-1.5">
                  Stream Sequence (Target key is B):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.pairs.map((p) => {
                    const isTarget = p.key === 'B';
                    return (
                      <span
                        key={p.key}
                        className={`px-2 py-1 rounded text-xs font-mono border ${
                          isTarget
                            ? 'bg-violet-950/60 border-violet-500/60 text-violet-200 font-bold'
                            : 'bg-[#151922] border-[#252A35] text-[#8F96A3]'
                        }`}
                      >
                        {p.key} → {p.val}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Prediction Decision Buttons */}
              <div className="pt-2 border-t border-[#252A35] space-y-2">
                <span className="text-xs font-mono text-[#8F96A3] block">
                  Your Scientific Hypothesis for Round {trial.round}:
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handlePredict('remember')}
                    disabled={userPrediction !== null}
                    className={`py-2.5 px-3 rounded-lg border text-xs font-mono font-semibold transition-all ${
                      userPrediction === 'remember'
                        ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                        : userPrediction !== null
                        ? 'opacity-40 border-[#252A35] bg-[#151922] text-[#8F96A3]'
                        : 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/40 cursor-pointer'
                    }`}
                  >
                    WILL REMEMBER (B=42)
                  </button>

                  <button
                    onClick={() => handlePredict('forget')}
                    disabled={userPrediction !== null}
                    className={`py-2.5 px-3 rounded-lg border text-xs font-mono font-semibold transition-all ${
                      userPrediction === 'forget'
                        ? 'border-rose-400 bg-rose-500/20 text-rose-300'
                        : userPrediction !== null
                        ? 'opacity-40 border-[#252A35] bg-[#151922] text-[#8F96A3]'
                        : 'border-rose-500/40 bg-rose-950/30 text-rose-300 hover:bg-rose-900/40 cursor-pointer'
                    }`}
                  >
                    WILL FORGET (INTERFERENCE)
                  </button>
                </div>
              </div>

              {/* User Outcome Evaluation */}
              {userPrediction !== null && (
                <div
                  className={`rounded-lg p-3 border text-xs space-y-2 animate-in fade-in ${
                    isUserCorrect
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                      : 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold font-mono">
                    {isUserCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>HYPOTHESIS CONFIRMED! (+1 PT)</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-amber-400" />
                        <span>HYPOTHESIS DISPROVED</span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] leading-relaxed text-[#F4F5F7]">
                    {trial.explanation}
                  </p>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleNextRound}
                      className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-white text-black font-mono text-xs font-semibold hover:bg-[#22D3EE] transition-colors"
                    >
                      <span>{currentRoundIdx === TRIALS.length - 1 ? 'Finish Challenge' : 'Next Trial'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-[#8F96A3]">
              <span>Round {trial.round} of 5</span>
              <button
                onClick={handleResetChallenge}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All Trials</span>
              </button>
            </div>
          </div>

          {/* Right Column: Ground Truth vs Model Prediction */}
          <div className="lg:col-span-7 space-y-5">
            <TruthModel
              truth="42 (Key B)"
              model={userPrediction !== null ? String(result.predicted) : '??? (Make prediction first)'}
              label={`TRIAL ${trial.round} EMPIRICAL PROBE FOR KEY "B"`}
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
                  : `Memory failure! The model retrieved ${result.predicted} instead of 42. High coordinate overlap caused the probe to lock onto an interference pattern.`
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

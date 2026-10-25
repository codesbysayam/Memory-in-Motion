import React, { useState, useMemo } from 'react';
import {
  Target,
  HelpCircle,
  Play,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Eye,
  EyeOff,
  Cpu,
  ShieldCheck,
  Brain,
  Award,
} from 'lucide-react';
import { CANONICAL_FACTS, Fact, vector, cosine, norm } from '../models/associativeMemory';
import { markMilestoneCompleted } from '../utils/progressTracker';

export const FinalChallenge: React.FC = () => {
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [userPrediction, setUserPrediction] = useState<string | null>(null);
  const [testRevealed, setTestRevealed] = useState<boolean>(false);
  const [roundScores, setRoundScores] = useState<boolean[]>([false, false, false]);
  const [selectedBdhMemoryLocation, setSelectedBdhMemoryLocation] = useState<string | null>(null);

  // 12 canonical facts used for the test
  const testFacts: Fact[] = useMemo(() => CANONICAL_FACTS.slice(0, 12), []);

  // Helper to evaluate a configuration deterministically
  const runTestEvaluation = (dim: number, retention: number, interference: number) => {
    let M = Array.from({ length: dim }, () => Array(dim).fill(0));
    const interferenceKey = vector('FINAL_CHALLENGE_INTERFERENCE', dim);

    for (const fact of testFacts) {
      const baseK = vector(fact.key, dim);
      const baseV = vector(fact.value, dim);

      let k = baseK.map(
        (val, i) => (1 - interference) * val + interference * (interferenceKey[i] ?? 0)
      );
      const kNorm = norm(k) || 1;
      k = k.map((v) => v / kNorm);

      M = M.map((row) => row.map((x) => x * retention));

      for (let i = 0; i < dim; i++) {
        for (let j = 0; j < dim; j++) {
          M[i][j] += 0.8 * k[i] * baseV[j];
        }
      }
    }

    let correctCount = 0;
    for (const fact of testFacts) {
      const baseK = vector(fact.key, dim);
      let q = baseK.map(
        (val, i) => (1 - interference) * val + interference * (interferenceKey[i] ?? 0)
      );
      const qNorm = norm(q) || 1;
      q = q.map((v) => v / qNorm);

      const retrieved = Array(dim).fill(0);
      for (let j = 0; j < dim; j++) {
        for (let i = 0; i < dim; i++) {
          retrieved[j] += q[i] * M[i][j];
        }
      }

      let bestVal = 'UNKNOWN';
      let bestScore = -Infinity;
      for (const cand of testFacts) {
        const score = cosine(retrieved, vector(cand.value, dim));
        if (score > bestScore) {
          bestScore = score;
          bestVal = cand.value;
        }
      }

      if (bestVal === fact.value && bestScore > 0.05) {
        correctCount++;
      }
    }

    return {
      dim,
      retention,
      interference,
      correctCount,
      total: testFacts.length,
      accuracy: Math.round((correctCount / testFacts.length) * 100),
    };
  };

  // Round 1 Configurations:
  // System A: dim 8, retention 0.72, interference 0.1
  // System B: dim 16, retention 0.95, interference 0.1
  const r1A = useMemo(() => runTestEvaluation(8, 0.72, 0.1), [testFacts]);
  const r1B = useMemo(() => runTestEvaluation(16, 0.95, 0.1), [testFacts]);

  // Round 2 Configurations:
  // System A: dim 32, retention 0.92, interference 0.85 (High interference overwhelms large dimension)
  // System B: dim 16, retention 0.98, interference 0.05 (Clean orthogonal states)
  const r2A = useMemo(() => runTestEvaluation(32, 0.92, 0.85), [testFacts]);
  const r2B = useMemo(() => runTestEvaluation(16, 0.98, 0.05), [testFacts]);

  // Round 3 Interactive Test Selection:
  // "Which change is most likely to reduce interference?"
  const [round3SelectedAction, setRound3SelectedAction] = useState<string | null>(null);

  const handleTestPrediction = () => {
    setTestRevealed(true);
    const newScores = [...roundScores];

    if (currentRound === 1) {
      const isCorrect = userPrediction === 'B';
      newScores[0] = isCorrect;
    } else if (currentRound === 2) {
      const isCorrect = userPrediction === 'B';
      newScores[1] = isCorrect;
    }
    setRoundScores(newScores);
  };

  const handleNextRound = () => {
    setUserPrediction(null);
    setTestRevealed(false);
    setCurrentRound((r) => r + 1);
  };

  const handleResetChallenge = () => {
    setCurrentRound(1);
    setUserPrediction(null);
    setTestRevealed(false);
    setRoundScores([false, false, false]);
    setRound3SelectedAction(null);
    setSelectedBdhMemoryLocation(null);
  };

  const scrollToBdhExplorer = () => {
    const el = document.getElementById('section-08');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div id="final-challenge" className="rounded-xl border border-[#D8DCD8] bg-[#FFFFFF] p-5 sm:p-7 text-[#252525] shadow-xs space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6DF] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-[#31566E] bg-[#E7F2FA] border border-[#B8D7ED] px-2.5 py-0.5 rounded-md font-semibold flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              Empirical evaluation
            </span>
            <span className="text-xs uppercase tracking-wider text-[#8C5D17] bg-[#FFF5D8] border border-[#E8D9A8] px-2.5 py-0.5 rounded-md font-semibold">
              Hypothesis stress test
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#252525] tracking-tight">
            Stress-test the boundary conditions
          </h3>
          <p className="text-xs sm:text-sm text-[#5F625F] font-sans max-w-2xl leading-relaxed">
            Rigorous inquiry requires investigating where our models encounter limits. Probe recurrent memory past its boundary conditions: predict where the mathematical mechanism encounters interference, run the deterministic probe, and observe the result.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#5F625F]">
            Round <strong className="text-[#252525]">{Math.min(currentRound, 3)}</strong> of 3
          </span>
          <button
            onClick={handleResetChallenge}
            className="p-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F7F5EF] border border-[#D8DCD8] text-[#5F625F] hover:text-[#252525] transition cursor-pointer"
            title="Restart challenge"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ROUND 1: Blind Capacity & Retention */}
      {currentRound === 1 && (
        <div className="space-y-5 animate-in fade-in">
          <div className="p-4 rounded-xl bg-[#F7F5EF] border border-[#D8DCD8] space-y-3">
            <div className="text-xs text-[#31566E] font-semibold uppercase">
              Round 1: Comparative memory trial
            </div>
            <p className="text-xs sm:text-sm text-[#5F625F] font-sans">
              Two hidden memory systems are presented with the exact same sequence of {testFacts.length} sequential world facts. Which system will retrieve more facts correctly?
            </p>

            {/* Hidden Systems Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="p-4 rounded-lg bg-[#FFFFFF] border border-[#D8DCD8] space-y-2 shadow-2xs">
                <div className="text-[#31566E] font-semibold text-sm">System A</div>
                <div className="text-[#5F625F] text-[11px] font-mono space-y-1">
                  <div>Dimension: [???]</div>
                  <div>Retention Rate: [???]</div>
                  <div>Interference: [???]</div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#FFFFFF] border border-[#D8DCD8] space-y-2 shadow-2xs">
                <div className="text-[#8C5D17] font-semibold text-sm">System B</div>
                <div className="text-[#5F625F] text-[11px] font-mono space-y-1">
                  <div>Dimension: [???]</div>
                  <div>Retention Rate: [???]</div>
                  <div>Interference: [???]</div>
                </div>
              </div>
            </div>
          </div>

          {/* Prediction Selection */}
          {!testRevealed ? (
            <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#D8DCD8] space-y-3 shadow-2xs">
              <div className="text-xs text-[#5F625F] uppercase font-semibold">
                Your prediction:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {['A', 'B', 'Not enough information'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setUserPrediction(opt)}
                    className={`p-3 rounded-lg border text-center transition font-medium cursor-pointer ${
                      userPrediction === opt
                        ? 'bg-[#E7F2FA] border-[#B8D7ED] text-[#31566E] font-semibold'
                        : 'bg-[#F7F5EF] border-[#D8DCD8] text-[#5F625F] hover:text-[#252525] hover:bg-[#F1F2F0]'
                    }`}
                  >
                    {opt === 'A'
                      ? 'System A will perform better'
                      : opt === 'B'
                      ? 'System B will perform better'
                      : 'Not enough information'}
                  </button>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  disabled={!userPrediction}
                  onClick={handleTestPrediction}
                  className="px-4 py-2 rounded-lg bg-[#DCEFE2] hover:bg-[#CDE8D5] text-[#245B38] border border-[#BCE2C9] text-xs font-semibold disabled:opacity-40 flex items-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run experiment & reveal</span>
                </button>
              </div>
            </div>
          ) : (
            /* Revealed Test Results & Explanation */
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                {/* Revealed System A */}
                <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#D8DCD8] space-y-2 shadow-2xs">
                  <div className="flex justify-between items-center text-[#31566E] font-semibold">
                    <span>System A revealed</span>
                    <span>{r1A.accuracy}% Acc</span>
                  </div>
                  <div className="text-[#5F625F] space-y-1 text-[11px]">
                    <div>Dimension: <strong className="text-[#252525]">{r1A.dim}D</strong> (Constrained)</div>
                    <div>Retention: <strong className="text-[#252525]">{(r1A.retention * 100).toFixed(0)}%</strong> (Rapid Decay)</div>
                    <div>Correct: {r1A.correctCount} / {r1A.total} facts</div>
                  </div>
                </div>

                {/* Revealed System B */}
                <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#D8DCD8] space-y-2 shadow-2xs">
                  <div className="flex justify-between items-center text-[#8C5D17] font-semibold">
                    <span>System B revealed</span>
                    <span className="text-[#247A4B]">{r1B.accuracy}% Acc</span>
                  </div>
                  <div className="text-[#5F625F] space-y-1 text-[11px]">
                    <div>Dimension: <strong className="text-[#252525]">{r1B.dim}D</strong> (Higher Capacity)</div>
                    <div>Retention: <strong className="text-[#252525]">{(r1B.retention * 100).toFixed(0)}%</strong> (Strong Persistence)</div>
                    <div>Correct: {r1B.correctCount} / {r1B.total} facts</div>
                  </div>
                </div>
              </div>

              {/* Explanation of Observed Result */}
              <div className="p-4 rounded-xl bg-[#F7F5EF] border border-[#D8DCD8] space-y-2 text-xs">
                <div className="text-[#252525] font-semibold flex items-center gap-2">
                  {userPrediction === 'B' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#247A4B]" />
                  ) : (
                    <XCircle className="w-4 h-4 text-[#8C5D17]" />
                  )}
                  <span>
                    {userPrediction === 'B'
                      ? 'Correct prediction'
                      : userPrediction === 'Not enough information'
                      ? 'A reasonable conservative guess, but System B holds a definitive parameter advantage'
                      : 'Observed outcome: System A experienced temporal decay and limited coordinate capacity.'}
                  </span>
                </div>
                <p className="text-[#5F625F] font-sans text-xs leading-relaxed">
                  System B combines higher orthogonal vector capacity (16D vs 8D) with high retention (95% vs 72%). In System A, earlier facts decayed exponentially while later facts collided in the cramped 8-dimensional space.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleNextRound}
                  className="px-3.5 py-2 rounded-lg bg-[#FFFFFF] hover:bg-[#F7F5EF] border border-[#D8DCD8] text-[#252525] text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span>Proceed to round 2</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ROUND 2: High Interference vs Clean Separation */}
      {currentRound === 2 && (
        <div className="space-y-5 animate-in fade-in">
          <div className="p-4 rounded-xl bg-[#F7F5EF] border border-[#D8DCD8] space-y-3">
            <div className="text-xs text-[#31566E] font-semibold uppercase">
              Round 2: Dimension vs. Interference
            </div>
            <p className="text-xs sm:text-sm text-[#5F625F] font-sans">
              System A has a larger state dimension (32D), but is subjected to 85% correlated key interference. System B has a 16D state with near-zero interference. Which will retrieve more facts correctly?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 font-mono text-xs">
              <div className="p-4 rounded-lg bg-[#FFFFFF] border border-[#D8DCD8] space-y-1 shadow-2xs">
                <div className="text-[#31566E] font-semibold text-sm">System A</div>
                <div className="text-[#5F625F] text-[11px]">Dimension: 32D | High Key Correlation (85%)</div>
              </div>
              <div className="p-4 rounded-lg bg-[#FFFFFF] border border-[#D8DCD8] space-y-1 shadow-2xs">
                <div className="text-[#8C5D17] font-semibold text-sm">System B</div>
                <div className="text-[#5F625F] text-[11px]">Dimension: 16D | Clean Orthogonal Keys (5%)</div>
              </div>
            </div>
          </div>

          {!testRevealed ? (
            <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#D8DCD8] space-y-3 shadow-2xs">
              <div className="text-xs text-[#5F625F] uppercase font-semibold">
                Your prediction:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {['A', 'B', 'They will perform similarly'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setUserPrediction(opt)}
                    className={`p-3 rounded-lg border text-center transition font-medium cursor-pointer ${
                      userPrediction === opt
                        ? 'bg-[#E7F2FA] border-[#B8D7ED] text-[#31566E] font-semibold'
                        : 'bg-[#F7F5EF] border-[#D8DCD8] text-[#5F625F] hover:text-[#252525] hover:bg-[#F1F2F0]'
                    }`}
                  >
                    {opt === 'A'
                      ? 'System A (Larger dimension)'
                      : opt === 'B'
                      ? 'System B (Orthogonality)'
                      : 'They will perform similarly'}
                  </button>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  disabled={!userPrediction}
                  onClick={handleTestPrediction}
                  className="px-4 py-2 rounded-lg bg-[#DCEFE2] hover:bg-[#CDE8D5] text-[#245B38] border border-[#BCE2C9] text-xs font-semibold disabled:opacity-40 flex items-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run experiment & reveal</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#D8DCD8] space-y-2 shadow-2xs">
                  <div className="flex justify-between items-center text-[#31566E] font-semibold">
                    <span>System A: 32D High-Interference</span>
                    <span className="text-[#B64235]">{r2A.accuracy}% Acc</span>
                  </div>
                  <div className="text-[#5F625F] text-[11px]">
                    Despite 32 dimensions, high correlation caused coordinate cross-talk ({r2A.correctCount}/{r2A.total} correct).
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#D8DCD8] space-y-2 shadow-2xs">
                  <div className="flex justify-between items-center text-[#8C5D17] font-semibold">
                    <span>System B: 16D Orthogonal</span>
                    <span className="text-[#247A4B]">{r2B.accuracy}% Acc</span>
                  </div>
                  <div className="text-[#5F625F] text-[11px]">
                    Low interference permitted clean uncorrupted retrieval ({r2B.correctCount}/{r2B.total} correct).
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F7F5EF] border border-[#D8DCD8] space-y-2 text-xs">
                <div className="text-[#252525] font-semibold flex items-center gap-2">
                  {userPrediction === 'B' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#247A4B]" />
                  ) : (
                    <XCircle className="w-4 h-4 text-[#8C5D17]" />
                  )}
                  <span>
                    {userPrediction === 'B'
                      ? 'Orthogonality outweighs raw dimension'
                      : 'Observed result: High correlation impairs retrieval even with wider dimensional matrices.'}
                  </span>
                </div>
                <p className="text-[#5F625F] font-sans text-xs leading-relaxed">
                  When keys are correlated, adding dimensions does not prevent them from projecting onto overlapping coordinate subspaces. Clean orthogonality is the fundamental currency of associative retrieval.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleNextRound}
                  className="px-3.5 py-2 rounded-lg bg-[#FFFFFF] hover:bg-[#F7F5EF] border border-[#D8DCD8] text-[#252525] text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span>Proceed to synthesis</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ROUND 3 & CAPSTONE MASTERY SCREEN */}
      {currentRound >= 3 && (
        <div className="space-y-6 animate-in fade-in">
          {/* Diagnostic Question */}
          <div className="p-5 rounded-xl bg-[#F7F5EF] border border-[#D8DCD8] space-y-4 text-xs">
            <div className="text-xs text-[#8C5D17] font-semibold uppercase">
              Round 3: Causal interference diagnostic
            </div>
            <div className="text-sm font-semibold text-[#252525]">
              Which architectural change is most effective at reducing interference in a fixed-size recurrent state?
            </div>

            <div className="space-y-2 text-xs">
              {[
                {
                  id: 'dim-ortho',
                  label: 'Expanding state dimension to provide higher-dimensional near-orthogonal subspaces',
                  correct: true,
                },
                {
                  id: 'decay-fast',
                  label: 'Decreasing retention rate below 0.3 so older states quickly dissolve',
                  correct: false,
                },
                {
                  id: 'more-keys',
                  label: 'Packing more correlated distractor keys into the same state matrix',
                  correct: false,
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setRound3SelectedAction(opt.id);
                    if (opt.correct) {
                      markMilestoneCompleted('verify_knowledge');
                      try {
                        localStorage.setItem('memory_final_challenge_completed', 'true');
                      } catch {
                        // ignore
                      }
                      window.dispatchEvent(new CustomEvent('final_challenge_completed'));
                    }
                  }}
                  className={`w-full p-3 rounded-lg border text-left transition flex items-center justify-between cursor-pointer ${
                    round3SelectedAction === opt.id
                      ? opt.correct
                        ? 'bg-[#DCEFE2] border-[#BCE2C9] text-[#247A4B] font-semibold'
                        : 'bg-[#F9E9ED] border-[#F2CAD2] text-[#B64235]'
                      : 'bg-[#FFFFFF] border-[#D8DCD8] text-[#5F625F] hover:text-[#252525]'
                  }`}
                >
                  <span>{opt.label}</span>
                  {round3SelectedAction === opt.id && (
                    <span className="ml-2 font-semibold">
                      {opt.correct ? '✓ Mechanically valid' : '✕ Ineffective'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Synthesis Master Card */}
          <div className="p-6 rounded-xl bg-[#FFFFFF] border border-[#D8DCD8] space-y-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EAE6DF] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#DCEFE2] border border-[#BCE2C9] text-[#247A4B]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs uppercase text-[#247A4B] font-semibold">
                    Evaluation complete
                  </div>
                  <h4 className="text-lg sm:text-xl font-serif font-bold text-[#252525]">
                    Understanding verified
                  </h4>
                </div>
              </div>

              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open_certificate_modal'))}
                className="px-4 py-2 rounded-lg bg-[#DCEFE2] hover:bg-[#CDE8D5] text-[#245B38] border border-[#BCE2C9] text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <Award className="w-4 h-4 text-[#8C5D17]" />
                <span>View attestation certificate</span>
                <Sparkles className="w-3.5 h-3.5 text-[#8C5D17]" />
              </button>
            </div>

            {/* Verified Capabilities Checklist */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {[
                'Fixed-size state',
                'Information persistence',
                'Compression trade-offs',
                'Interference dynamics',
                'Associative retrieval',
                'Recurrent computation',
              ].map((item) => (
                <div
                  key={item}
                  className="p-3 rounded-lg bg-[#F7F5EF] border border-[#EAE6DF] flex items-center gap-2 text-[#252525]"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#247A4B] shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Where Does Memory Live in BDH? Section */}
            <div className="p-4 rounded-xl bg-[#F7F5EF] border border-[#D8DCD8] space-y-3 text-xs">
              <div className="text-[#31566E] font-semibold uppercase text-xs flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#31566E]" />
                Research context: Where does memory reside in BDH?
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'kv', label: 'In an expanding KV cache', correct: false },
                  { id: 'synaptic', label: 'In the continuous synaptic state σ', correct: true },
                  { id: 'prompt', label: 'In visible scratchpad tokens', correct: false },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedBdhMemoryLocation(opt.id)}
                    className={`p-3 rounded-lg border text-center transition font-medium cursor-pointer ${
                      selectedBdhMemoryLocation === opt.id
                        ? opt.correct
                          ? 'bg-[#DCEFE2] border-[#BCE2C9] text-[#245B38] font-semibold'
                          : 'bg-[#F9E9ED] border-[#F2CAD2] text-[#B64235]'
                        : 'bg-[#FFFFFF] border-[#D8DCD8] text-[#5F625F] hover:text-[#252525]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {selectedBdhMemoryLocation === 'synaptic' && (
                <div className="p-3.5 rounded-lg bg-[#E7F2FA] border border-[#B8D7ED] text-[#31566E] space-y-2 animate-in fade-in">
                  <p className="text-xs font-sans">
                    <strong>Confirmed:</strong> Working memory resides in continuous synaptic edge plasticity ($\sigma$), updated in-place via local particle relaxation without allocating new token memory.
                  </p>
                  <button
                    onClick={scrollToBdhExplorer}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#31566E] hover:underline cursor-pointer"
                  >
                    <span>Inspect synaptic states in the BDH interactive microscope</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

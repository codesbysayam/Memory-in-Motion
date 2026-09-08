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
} from 'lucide-react';
import { CANONICAL_FACTS, Fact, vector, cosine, norm } from '../models/associativeMemory';

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
    <div id="final-challenge" className="rounded-2xl border border-[#252A35] bg-[#0A0D16] p-5 sm:p-7 text-slate-100 shadow-2xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2538] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-0.5 rounded-md font-bold flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              CAPSTONE EVALUATION
            </span>
            <span className="text-xs font-mono uppercase tracking-wider text-purple-300 bg-purple-950/70 border border-purple-800/60 px-2.5 py-0.5 rounded-md font-bold">
              PREDICT → TEST → EXPLAIN
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
            BLIND ARCHITECTURAL CHALLENGE
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-2xl">
            Test your understanding of recurrent memory mechanisms. Make a prediction based on hidden parameters, execute the live deterministic experiment, and explain the observed failure or success.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">
            ROUND <strong className="text-white">{Math.min(currentRound, 3)}</strong> OF 3
          </span>
          <button
            onClick={handleResetChallenge}
            className="p-1.5 rounded-lg bg-[#141A28] border border-[#232D42] text-slate-400 hover:text-white transition"
            title="Restart Challenge"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ROUND 1: Blind Capacity & Retention */}
      {currentRound === 1 && (
        <div className="space-y-5 animate-in fade-in">
          <div className="p-4 rounded-xl bg-[#0F1424] border border-[#1F2942] space-y-3">
            <div className="text-xs font-mono text-cyan-400 font-bold uppercase">
              ROUND 1: BLIND MEMORY TRIAL
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-sans">
              Two hidden memory systems are presented with the exact same sequence of {testFacts.length} sequential world facts. Which system will retrieve more facts correctly?
            </p>

            {/* Hidden Systems Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 font-mono text-xs">
              <div className="p-4 rounded-lg bg-[#0A0D18] border border-[#252E44] space-y-2">
                <div className="text-cyan-300 font-bold text-sm">SYSTEM A</div>
                <div className="text-slate-400 text-[11px] space-y-1">
                  <div>Dimension: [???]</div>
                  <div>Retention Rate: [???]</div>
                  <div>Interference: [???]</div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#0A0D18] border border-[#252E44] space-y-2">
                <div className="text-purple-300 font-bold text-sm">SYSTEM B</div>
                <div className="text-slate-400 text-[11px] space-y-1">
                  <div>Dimension: [???]</div>
                  <div>Retention Rate: [???]</div>
                  <div>Interference: [???]</div>
                </div>
              </div>
            </div>
          </div>

          {/* Prediction Selection */}
          {!testRevealed ? (
            <div className="p-4 rounded-xl bg-[#0A0E18] border border-[#1A2234] space-y-3">
              <div className="text-xs font-mono text-slate-400 uppercase font-semibold">
                YOUR PREDICTION:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                {['A', 'B', 'Not enough information'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setUserPrediction(opt)}
                    className={`p-3 rounded-lg border text-center transition font-bold ${
                      userPrediction === opt
                        ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg shadow-cyan-600/30'
                        : 'bg-[#121828] border-[#202B40] text-slate-300 hover:text-white hover:bg-[#161F34]'
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
                  className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-emerald-600/30 disabled:opacity-40"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>RUN EXPERIMENT & REVEAL</span>
                </button>
              </div>
            </div>
          ) : (
            /* Revealed Test Results & Explanation */
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                {/* Revealed System A */}
                <div className="p-4 rounded-xl bg-[#0A0D18] border border-cyan-800/40 space-y-2">
                  <div className="flex justify-between items-center text-cyan-300 font-bold">
                    <span>SYSTEM A REVEALED</span>
                    <span>{r1A.accuracy}% Acc</span>
                  </div>
                  <div className="text-slate-300 space-y-1 text-[11px]">
                    <div>Dimension: <strong className="text-white">{r1A.dim}D</strong> (Constrained)</div>
                    <div>Retention: <strong className="text-white">{(r1A.retention * 100).toFixed(0)}%</strong> (Rapid Decay)</div>
                    <div>Correct: {r1A.correctCount} / {r1A.total} facts</div>
                  </div>
                </div>

                {/* Revealed System B */}
                <div className="p-4 rounded-xl bg-[#0A0D18] border border-purple-800/40 space-y-2">
                  <div className="flex justify-between items-center text-purple-300 font-bold">
                    <span>SYSTEM B REVEALED</span>
                    <span className="text-emerald-400">{r1B.accuracy}% Acc</span>
                  </div>
                  <div className="text-slate-300 space-y-1 text-[11px]">
                    <div>Dimension: <strong className="text-white">{r1B.dim}D</strong> (Higher Capacity)</div>
                    <div>Retention: <strong className="text-white">{(r1B.retention * 100).toFixed(0)}%</strong> (Strong Persistence)</div>
                    <div>Correct: {r1B.correctCount} / {r1B.total} facts</div>
                  </div>
                </div>
              </div>

              {/* Explanation of Observed Result */}
              <div className="p-4 rounded-xl bg-[#0E1424] border border-[#1E2740] space-y-2 font-mono text-xs">
                <div className="text-white font-bold flex items-center gap-2">
                  {userPrediction === 'B' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-amber-400" />
                  )}
                  <span>
                    {userPrediction === 'B'
                      ? 'Correct Prediction!'
                      : userPrediction === 'Not enough information'
                      ? 'A reasonable conservative guess, but System B holds a definitive parameter advantage!'
                      : 'Incorrect: System A suffered severe temporal decay and limited dimension.'}
                  </span>
                </div>
                <p className="text-slate-300 font-sans text-xs leading-relaxed">
                  System B combines higher orthogonal vector capacity (16D vs 8D) with high retention (95% vs 72%). In System A, earlier facts decayed exponentially while later facts collided in the cramped 8-dimensional space.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleNextRound}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <span>Proceed to Round 2</span>
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
          <div className="p-4 rounded-xl bg-[#0F1424] border border-[#1F2942] space-y-3">
            <div className="text-xs font-mono text-purple-400 font-bold uppercase">
              ROUND 2: DIMENSION VS. INTERFERENCE
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-sans">
              Hint: System A has a much larger state dimension (32D), but is subjected to 85% correlated key interference. System B has only a 16D state, but has near-zero interference. Which will retrieve more facts correctly?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 font-mono text-xs">
              <div className="p-4 rounded-lg bg-[#0A0D18] border border-[#252E44] space-y-1">
                <div className="text-cyan-300 font-bold text-sm">SYSTEM A</div>
                <div className="text-slate-400 text-[11px]">Dimension: 32D | High Key Correlation (85%)</div>
              </div>
              <div className="p-4 rounded-lg bg-[#0A0D18] border border-[#252E44] space-y-1">
                <div className="text-purple-300 font-bold text-sm">SYSTEM B</div>
                <div className="text-slate-400 text-[11px]">Dimension: 16D | Clean Orthogonal Keys (5%)</div>
              </div>
            </div>
          </div>

          {!testRevealed ? (
            <div className="p-4 rounded-xl bg-[#0A0E18] border border-[#1A2234] space-y-3">
              <div className="text-xs font-mono text-slate-400 uppercase font-semibold">
                YOUR PREDICTION:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                {['A', 'B', 'They will perform similarly'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setUserPrediction(opt)}
                    className={`p-3 rounded-lg border text-center transition font-bold ${
                      userPrediction === opt
                        ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/30'
                        : 'bg-[#121828] border-[#202B40] text-slate-300 hover:text-white hover:bg-[#161F34]'
                    }`}
                  >
                    {opt === 'A'
                      ? 'System A (Larger Dimension wins)'
                      : opt === 'B'
                      ? 'System B (Clean Orthogonality wins)'
                      : 'They will perform similarly'}
                  </button>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  disabled={!userPrediction}
                  onClick={handleTestPrediction}
                  className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-purple-600/30 disabled:opacity-40"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>RUN EXPERIMENT & REVEAL</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                <div className="p-4 rounded-xl bg-[#0A0D18] border border-cyan-800/40 space-y-2">
                  <div className="flex justify-between items-center text-cyan-300 font-bold">
                    <span>SYSTEM A: 32D HIGH-INTERFERENCE</span>
                    <span className="text-rose-400">{r2A.accuracy}% Acc</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Despite 32 dimensions, high correlation caused fatal superposition cross-talk ({r2A.correctCount}/{r2A.total} correct).
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0A0D18] border border-purple-800/40 space-y-2">
                  <div className="flex justify-between items-center text-purple-300 font-bold">
                    <span>SYSTEM B: 16D CLEAN ORTHOGONAL</span>
                    <span className="text-emerald-400">{r2B.accuracy}% Acc</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Near-zero interference allowed clean uncorrupted retrieval ({r2B.correctCount}/{r2B.total} correct).
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0E1424] border border-[#1E2740] space-y-2 font-mono text-xs">
                <div className="text-white font-bold flex items-center gap-2">
                  {userPrediction === 'B' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-amber-400" />
                  )}
                  <span>
                    {userPrediction === 'B'
                      ? 'Spot on! Orthogonality outweighs raw dimension.'
                      : 'Surprising result! High interference ruins even wide dimensional matrices.'}
                  </span>
                </div>
                <p className="text-slate-300 font-sans text-xs leading-relaxed">
                  When keys are correlated, adding dimensions does not prevent them from projecting onto overlapping coordinate subspaces. Clean orthogonality is the fundamental currency of associative retrieval.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleNextRound}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <span>Proceed to Final Capstone</span>
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
          <div className="p-5 rounded-xl bg-[#0F1424] border border-[#1F2A44] space-y-4 font-mono text-xs">
            <div className="text-xs text-amber-400 font-bold uppercase">
              ROUND 3: CAUSAL INTERFERENCE DIAGNOSTIC
            </div>
            <div className="text-sm font-bold text-white">
              Which architectural change is most effective at preventing catastrophic interference in a fixed-size recurrent state?
            </div>

            <div className="space-y-2 font-mono text-xs">
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
                  onClick={() => setRound3SelectedAction(opt.id)}
                  className={`w-full p-3 rounded-lg border text-left transition flex items-center justify-between ${
                    round3SelectedAction === opt.id
                      ? opt.correct
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold'
                        : 'bg-rose-950/60 border-rose-500 text-rose-200'
                      : 'bg-[#121828] border-[#202B40] text-slate-300 hover:text-white'
                  }`}
                >
                  <span>{opt.label}</span>
                  {round3SelectedAction === opt.id && (
                    <span className="ml-2 font-bold">
                      {opt.correct ? '✓ MECHANICALLY VALID' : '✕ INEFFECTIVE'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* YOU CAN EXPLAIN THE MECHANISM Master Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-[#0F1524] to-[#0A0D16] border border-emerald-500/40 space-y-5 shadow-xl">
            <div className="flex items-center gap-3 border-b border-[#1D273E] pb-4">
              <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-mono uppercase text-emerald-400 font-bold">
                  EVALUATION COMPLETE
                </div>
                <h4 className="text-lg sm:text-xl font-bold font-mono text-white">
                  YOU CAN EXPLAIN THE MECHANISM
                </h4>
              </div>
            </div>

            {/* Verified Capabilities Checklist */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
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
                  className="p-3 rounded-lg bg-[#070912] border border-emerald-500/30 flex items-center gap-2 text-slate-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Where Does Memory Live in BDH? Section */}
            <div className="p-4 rounded-xl bg-[#090C16] border border-purple-500/30 space-y-3 font-mono text-xs">
              <div className="text-purple-300 font-bold uppercase text-xs flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                FINAL INQUIRY: WHERE DOES MEMORY LIVE IN BDH?
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
                    className={`p-3 rounded-lg border text-center transition font-bold ${
                      selectedBdhMemoryLocation === opt.id
                        ? opt.correct
                          ? 'bg-purple-600 border-purple-400 text-white shadow-lg'
                          : 'bg-rose-950 border-rose-500 text-rose-200'
                        : 'bg-[#121626] border-[#222B42] text-slate-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {selectedBdhMemoryLocation === 'synaptic' && (
                <div className="p-3 rounded-lg bg-purple-950/40 border border-purple-500/40 text-purple-200 space-y-2 animate-in fade-in">
                  <p className="text-xs font-sans">
                    <strong>Exactly correct:</strong> Working memory lives in continuous synaptic edge plasticity ($\sigma$), updated in-place via 4-phase local particle relaxation.
                  </p>
                  <button
                    onClick={scrollToBdhExplorer}
                    className="inline-flex items-center gap-2 text-xs font-mono font-bold text-cyan-300 hover:text-cyan-200 underline"
                  >
                    <span>Inspect Synaptic Weights in the BDH Microscope (Section 08)</span>
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

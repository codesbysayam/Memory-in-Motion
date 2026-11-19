import React, { useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Play,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { CANONICAL_FACTS, Fact, vector, cosine, norm } from '../models/associativeMemory';
import { markMilestoneCompleted } from '../utils/progressTracker';
import { FigureCaption } from './essay/FigureCaption';

export const FinalChallenge: React.FC = () => {
  const reducedMotion = useReducedMotion();
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
  const r1A = useMemo(() => runTestEvaluation(8, 0.72, 0.1), [testFacts]);
  const r1B = useMemo(() => runTestEvaluation(16, 0.95, 0.1), [testFacts]);

  // Round 2 Configurations:
  const r2A = useMemo(() => runTestEvaluation(32, 0.92, 0.85), [testFacts]);
  const r2B = useMemo(() => runTestEvaluation(16, 0.98, 0.05), [testFacts]);

  // Round 3 Interactive Test Selection:
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
    <section id="final-challenge" className="w-full space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--mm-rule)] pb-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="essay-eyebrow flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[var(--mm-signal)] tabular-nums">07.2</span>
            <span aria-hidden="true" className="text-[var(--mm-rule-strong)]">·</span>
            <span>Empirical evaluation · Hypothesis stress test</span>
          </div>
          <h2 className="essay-section-title">
            Stress-test the boundary conditions
          </h2>
          <p className="essay-lead">
            Probe recurrent memory past its boundary conditions: predict where interference emerges, execute the deterministic matrix probe, and inspect the readout.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-[var(--mm-muted)] tabular-nums">
            Round <strong className="text-[var(--mm-ink)]">{Math.min(currentRound, 3)}</strong> / 3
          </span>
          <button
            type="button"
            onClick={handleResetChallenge}
            className="btn-secondary text-xs py-1.5 px-2.5"
            title="Restart challenge"
            aria-label="Restart challenge"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <motion.div
        key={`challenge-round-${currentRound}`}
        initial={reducedMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="essay-figure-stage px-5 sm:px-8 py-6 text-[var(--mm-ink)] space-y-6"
      >
        {/* ROUND 1: Blind Capacity & Retention */}
        {currentRound === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="space-y-3">
              <div className="essay-eyebrow text-[var(--mm-signal)] font-semibold">
                Round 1 · Comparative memory trial
              </div>
              <p className="text-sm sm:text-[15px] text-[var(--mm-ink-soft)] font-sans leading-relaxed max-w-2xl">
                Two hidden memory systems ingest the exact same sequence of {testFacts.length} world facts. Predict which system will retrieve more facts accurately.
              </p>

              {/* Hairline comparative table for blind systems */}
              <div className="grid grid-cols-1 sm:grid-cols-2 border-y border-[var(--mm-rule)] divide-y sm:divide-y-0 sm:divide-x divide-[var(--mm-rule)]">
                <div className="py-4 sm:pr-6 space-y-1.5">
                  <div className="text-[var(--mm-signal)] font-sans font-semibold text-sm">System A</div>
                  <div className="text-[var(--mm-muted)] text-xs font-mono space-y-0.5 tabular-nums">
                    <div>Dimension: [hidden]</div>
                    <div>Retention Rate: [hidden]</div>
                    <div>Interference: [hidden]</div>
                  </div>
                </div>

                <div className="py-4 sm:pl-6 space-y-1.5">
                  <div className="text-[var(--mm-amber)] font-sans font-semibold text-sm">System B</div>
                  <div className="text-[var(--mm-muted)] text-xs font-mono space-y-0.5 tabular-nums">
                    <div>Dimension: [hidden]</div>
                    <div>Retention Rate: [hidden]</div>
                    <div>Interference: [hidden]</div>
                  </div>
                </div>
              </div>
            </div>

            {!testRevealed ? (
              <div className="space-y-3">
                <div className="essay-eyebrow">Your prediction</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-sm font-sans">
                  {['A', 'B', 'Not enough information'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setUserPrediction(opt)}
                      className={`p-3 rounded-md border text-center transition cursor-pointer ${
                        userPrediction === opt
                          ? 'bg-[var(--mm-signal-soft)] border-[var(--mm-signal)] text-[var(--mm-ink)] font-semibold'
                          : 'bg-[var(--page-bg)] border-[var(--mm-rule)] text-[var(--mm-ink)] hover:border-[var(--mm-rule-strong)]'
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

                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    disabled={!userPrediction}
                    onClick={handleTestPrediction}
                    className="btn-primary text-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run experiment &amp; reveal</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 border-y border-[var(--mm-rule)] divide-y sm:divide-y-0 sm:divide-x divide-[var(--mm-rule)] text-xs font-mono tabular-nums">
                  <div className="py-4 sm:pr-6 space-y-2">
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-[var(--mm-signal)]">System A revealed</span>
                      <span>{r1A.accuracy}% acc</span>
                    </div>
                    <div className="text-[var(--mm-ink-soft)] space-y-1">
                      <div>Dimension: <strong className="text-[var(--mm-ink)]">{r1A.dim}D</strong> (Constrained)</div>
                      <div>Retention: <strong className="text-[var(--mm-ink)]">{(r1A.retention * 100).toFixed(0)}%</strong> (Rapid Decay)</div>
                      <div>Correct: {r1A.correctCount} / {r1A.total} facts</div>
                    </div>
                  </div>

                  <div className="py-4 sm:pl-6 space-y-2">
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-[var(--mm-amber)]">System B revealed</span>
                      <span className="text-[var(--color-success)]">{r1B.accuracy}% acc</span>
                    </div>
                    <div className="text-[var(--mm-ink-soft)] space-y-1">
                      <div>Dimension: <strong className="text-[var(--mm-ink)]">{r1B.dim}D</strong> (Higher Capacity)</div>
                      <div>Retention: <strong className="text-[var(--mm-ink)]">{(r1B.retention * 100).toFixed(0)}%</strong> (Strong Persistence)</div>
                      <div>Correct: {r1B.correctCount} / {r1B.total} facts</div>
                    </div>
                  </div>
                </div>

                <div className="pl-4 border-l-2 border-[var(--mm-signal)] space-y-1.5 text-sm">
                  <div className="text-[var(--mm-ink)] font-semibold flex items-center gap-2">
                    {userPrediction === 'B' ? (
                      <CheckCircle2 className="w-4 h-4 text-[var(--color-success)] shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[var(--mm-amber)] shrink-0" />
                    )}
                    <span>
                      {userPrediction === 'B'
                        ? 'Correct prediction'
                        : userPrediction === 'Not enough information'
                        ? 'Reasonable conservative baseline; revealed telemetry shows System B dominates'
                        : 'Observed outcome: System A experienced rapid temporal decay and constrained capacity.'}
                    </span>
                  </div>
                  <p className="text-[var(--mm-ink-soft)] font-sans text-xs sm:text-sm leading-relaxed">
                    System B combines higher orthogonal vector capacity (16D vs 8D) with high retention (95% vs 72%). In System A, earlier facts decayed exponentially while later facts collided in the cramped 8-dimensional space.
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleNextRound}
                    className="btn-secondary text-xs"
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
          <div className="space-y-6 animate-in fade-in">
            <div className="space-y-3">
              <div className="essay-eyebrow text-[var(--mm-signal)] font-semibold">
                Round 2 · Dimension vs. interference
              </div>
              <p className="text-sm sm:text-[15px] text-[var(--mm-ink-soft)] font-sans leading-relaxed max-w-2xl">
                System A has a larger state dimension (32D), but suffers 85% correlated key interference. System B uses a smaller 16D state with near-zero key interference. Which retrieves more facts?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 border-y border-[var(--mm-rule)] divide-y sm:divide-y-0 sm:divide-x divide-[var(--mm-rule)] font-mono text-xs">
                <div className="py-4 sm:pr-6 space-y-1">
                  <div className="text-[var(--mm-signal)] font-sans font-semibold text-sm">System A</div>
                  <div className="text-[var(--mm-ink-soft)]">Dimension: 32D · High Key Correlation (85%)</div>
                </div>
                <div className="py-4 sm:pl-6 space-y-1">
                  <div className="text-[var(--mm-amber)] font-sans font-semibold text-sm">System B</div>
                  <div className="text-[var(--mm-ink-soft)]">Dimension: 16D · Clean Orthogonal Keys (5%)</div>
                </div>
              </div>
            </div>

            {!testRevealed ? (
              <div className="space-y-3">
                <div className="essay-eyebrow">Your prediction</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-sm font-sans">
                  {['A', 'B', 'They will perform similarly'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setUserPrediction(opt)}
                      className={`p-3 rounded-md border text-center transition cursor-pointer ${
                        userPrediction === opt
                          ? 'bg-[var(--mm-signal-soft)] border-[var(--mm-signal)] text-[var(--mm-ink)] font-semibold'
                          : 'bg-[var(--page-bg)] border-[var(--mm-rule)] text-[var(--mm-ink)] hover:border-[var(--mm-rule-strong)]'
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

                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    disabled={!userPrediction}
                    onClick={handleTestPrediction}
                    className="btn-primary text-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run experiment &amp; reveal</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 border-y border-[var(--mm-rule)] divide-y sm:divide-y-0 sm:divide-x divide-[var(--mm-rule)] font-mono text-xs tabular-nums">
                  <div className="py-4 sm:pr-6 space-y-2">
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-[var(--mm-signal)]">System A · 32D High-Interference</span>
                      <span className="text-[var(--color-danger)]">{r2A.accuracy}% acc</span>
                    </div>
                    <div className="text-[var(--mm-ink-soft)] font-sans">
                      Despite 32 dimensions, high correlation caused coordinate crosstalk ({r2A.correctCount}/{r2A.total} correct).
                    </div>
                  </div>

                  <div className="py-4 sm:pl-6 space-y-2">
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-[var(--mm-amber)]">System B · 16D Orthogonal</span>
                      <span className="text-[var(--color-success)]">{r2B.accuracy}% acc</span>
                    </div>
                    <div className="text-[var(--mm-ink-soft)] font-sans">
                      Low interference permitted clean uncorrupted retrieval ({r2B.correctCount}/{r2B.total} correct).
                    </div>
                  </div>
                </div>

                <div className="pl-4 border-l-2 border-[var(--mm-signal)] space-y-1.5 text-sm">
                  <div className="text-[var(--mm-ink)] font-semibold flex items-center gap-2">
                    {userPrediction === 'B' ? (
                      <CheckCircle2 className="w-4 h-4 text-[var(--color-success)] shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[var(--mm-amber)] shrink-0" />
                    )}
                    <span>
                      {userPrediction === 'B'
                        ? 'Orthogonality outweighs raw dimension'
                        : 'Observed result: High correlation impairs retrieval even with wider dimensional matrices.'}
                    </span>
                  </div>
                  <p className="text-[var(--mm-ink-soft)] font-sans text-xs sm:text-sm leading-relaxed">
                    When keys are correlated, adding dimensions does not prevent them from projecting onto overlapping coordinate subspaces. Clean orthogonality is the fundamental currency of associative retrieval.
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleNextRound}
                    className="btn-secondary text-xs"
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
            <div className="space-y-4">
              <div className="essay-eyebrow text-[var(--mm-amber)] font-semibold">
                Round 3 · Causal interference diagnostic
              </div>
              <div className="text-base sm:text-lg font-serif font-medium text-[var(--mm-ink)]">
                Which architectural change is most effective at reducing interference in a fixed-size recurrent state?
              </div>

              <div className="space-y-2 text-xs sm:text-sm font-sans">
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
                    type="button"
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
                    className={`w-full p-3.5 rounded-md border text-left transition flex items-center justify-between cursor-pointer ${
                      round3SelectedAction === opt.id
                        ? opt.correct
                          ? 'bg-[var(--color-success-soft)] border-[var(--color-success-border)] text-[var(--color-success)] font-semibold'
                          : 'bg-[var(--color-danger-soft)] border-[var(--color-danger-border)] text-[var(--color-danger)]'
                        : 'bg-[var(--page-bg)] border-[var(--mm-rule)] text-[var(--mm-ink)] hover:border-[var(--mm-rule-strong)]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {round3SelectedAction === opt.id && (
                      <span className="ml-2 font-mono text-xs shrink-0 font-semibold">
                        {opt.correct ? '✓ Mechanically valid' : '✕ Ineffective'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Synthesis Summary Block (Flat hairline division) */}
            <div className="pt-6 border-t border-[var(--mm-rule)] space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-[var(--color-success)] shrink-0" />
                  <div>
                    <div className="essay-eyebrow text-[var(--color-success)] font-semibold">
                      Evaluation synthesis
                    </div>
                    <h4 className="text-lg font-serif font-medium text-[var(--mm-ink)]">
                      Empirical principles verified
                    </h4>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('open_certificate_modal'))}
                  className="btn-primary text-xs"
                >
                  <Award className="w-4 h-4" />
                  <span>View attestation certificate</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 border-y border-[var(--mm-rule)] divide-y sm:divide-y-0 sm:divide-x divide-[var(--mm-rule)] text-xs">
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
                    className="py-2.5 px-3 flex items-center gap-2 text-[var(--mm-ink)]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-success)] shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Where Does Memory Live in BDH? */}
              <div className="space-y-3 text-xs">
                <div className="text-[var(--mm-signal)] font-mono font-semibold">
                  Research context · Where does memory reside in BDH?
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'kv', label: 'In an expanding KV cache', correct: false },
                    { id: 'synaptic', label: 'In the continuous synaptic state σ', correct: true },
                    { id: 'prompt', label: 'In visible scratchpad tokens', correct: false },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedBdhMemoryLocation(opt.id)}
                      className={`p-3 rounded-md border text-center transition font-sans font-medium cursor-pointer ${
                        selectedBdhMemoryLocation === opt.id
                          ? opt.correct
                            ? 'bg-[var(--color-success-soft)] border-[var(--color-success-border)] text-[var(--color-success)] font-semibold'
                            : 'bg-[var(--color-danger-soft)] border-[var(--color-danger-border)] text-[var(--color-danger)]'
                          : 'bg-[var(--page-bg)] border-[var(--mm-rule)] text-[var(--mm-ink)] hover:border-[var(--mm-rule-strong)]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {selectedBdhMemoryLocation === 'synaptic' && (
                  <div className="pl-4 border-l-2 border-[var(--mm-signal)] space-y-2 animate-in fade-in">
                    <p className="text-xs sm:text-sm font-sans text-[var(--mm-ink)]">
                      <strong>Confirmed:</strong> Working memory resides in continuous synaptic edge plasticity (σ), updated in-place via local particle relaxation without allocating new token memory.
                    </p>
                    <button
                      type="button"
                      onClick={scrollToBdhExplorer}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--mm-signal)] hover:underline cursor-pointer"
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

        <FigureCaption
          figure="Fig. 7.2"
          title="Three-round empirical boundary probe comparing 8D, 16D, and 32D correlated regimes across 12 sequential associations."
          source="Live Toy Computation"
        />
      </motion.div>
    </section>
  );
};


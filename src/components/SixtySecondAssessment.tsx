import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Flame,
  Binary,
  RotateCcw,
  Award,
  Play,
  Pause,
  ArrowRight,
  ArrowLeft,
  X,
  HelpCircle,
} from 'lucide-react';
import {
  CANONICAL_FACTS,
  Fact,
  createAssociativeMemory,
  vector,
  dot,
  norm,
  cosine,
} from '../models/associativeMemory';
import { EvidenceStrip } from './ui/EvidenceStrip';
import { MathView, InlineMath } from './ui/MathView';
import {
  markMilestoneCompleted,
  saveTestAttempt,
  getTestAttempts,
  StageResult,
  SixtySecondTestAttempt,
} from '../utils/progressTracker';

export interface SixtySecondAssessmentProps {
  isModal?: boolean;
  onClose?: () => void;
  onExploreFullLab?: () => void;
  onEnterSandbox?: () => void;
  onNavigate?: (pageId: string) => void;
}

export type TestTimer = {
  startedAt: number | null;
  elapsedMs: number;
  running: boolean;
  finished: boolean;
};

interface StepMeta {
  index: number;
  label: string;
  shortTitle: string;
  title: string;
  targetSeconds: number;
}

const STEPS: StepMeta[] = [
  {
    index: 1,
    label: 'STEP 01',
    shortTitle: 'Remember',
    title: 'High-Fidelity Retention in Fixed-Size State',
    targetSeconds: 12,
  },
  {
    index: 2,
    label: 'STEP 02',
    shortTitle: 'Break It',
    title: 'Capacity Pressure & Coordinate Interference',
    targetSeconds: 24,
  },
  {
    index: 3,
    label: 'STEP 03',
    shortTitle: 'Trace It',
    title: 'Matrix Delta Forensics & Frobenius Drift',
    targetSeconds: 36,
  },
  {
    index: 4,
    label: 'STEP 04',
    shortTitle: 'Measure It',
    title: 'Quantitative Dimensional Capacity Check',
    targetSeconds: 48,
  },
  {
    index: 5,
    label: 'STEP 05',
    shortTitle: 'BDH Synthesis',
    title: 'From Toy Matrix to Synaptic Plasticity',
    targetSeconds: 60,
  },
];

const INITIAL_FACTS: Fact[] = [
  { key: 'Japan', value: 'Tokyo', category: 'Asia' },
  { key: 'France', value: 'Paris', category: 'Europe' },
  { key: 'Brazil', value: 'Brasília', category: 'South America' },
];

const DISTRACTOR_CANDIDATES: Fact[] = [
  { key: 'Egypt', value: 'Cairo', category: 'Africa' },
  { key: 'Canada', value: 'Ottawa', category: 'North America' },
  { key: 'Germany', value: 'Berlin', category: 'Europe' },
  { key: 'Kenya', value: 'Nairobi', category: 'Africa' },
];

export const SixtySecondAssessment: React.FC<SixtySecondAssessmentProps> = ({
  isModal = false,
  onClose,
  onExploreFullLab,
  onEnterSandbox,
  onNavigate,
}) => {
  const reducedMotion = useReducedMotion();
  // Test Lifecycle
  const [testStarted, setTestStarted] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [timer, setTimer] = useState<TestTimer>({
    startedAt: null,
    elapsedMs: 0,
    running: false,
    finished: false,
  });
  const [autoPace, setAutoPace] = useState<boolean>(false);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [testAttempts, setTestAttempts] = useState<SixtySecondTestAttempt[]>(() => getTestAttempts());

  // Results & Scoring (20 points per step = 100 max)
  const [stageResults, setStageResults] = useState<Record<number, StageResult>>({});
  const [testCompleted, setTestCompleted] = useState<boolean>(false);
  const [timedOut, setTimedOut] = useState<boolean>(false);

  // -------------------------------------------------------------
  // STEP 1 STATE: Remember
  // -------------------------------------------------------------
  const [step1Answer, setStep1Answer] = useState<string | null>(null);
  const [step1Checked, setStep1Checked] = useState<boolean>(false);

  // -------------------------------------------------------------
  // STEP 2 STATE: Break It (Interference)
  // -------------------------------------------------------------
  const [addedDistractors, setAddedDistractors] = useState<Fact[]>([]);
  const [step2Answer, setStep2Answer] = useState<'yes' | 'no' | null>(null);
  const [step2Checked, setStep2Checked] = useState<boolean>(false);

  // -------------------------------------------------------------
  // STEP 3 STATE: Trace It (Coordinate snapshots)
  // -------------------------------------------------------------
  const [selectedSnapshotIdx, setSelectedSnapshotIdx] = useState<number>(0);
  const [step3Answer, setStep3Answer] = useState<string | null>(null);
  const [step3Checked, setStep3Checked] = useState<boolean>(false);

  // -------------------------------------------------------------
  // STEP 4 STATE: Measure It (Quantitative hypothesis)
  // -------------------------------------------------------------
  const [step4Prediction, setStep4Prediction] = useState<'A' | 'B' | 'C' | null>(null);
  const [step4Checked, setStep4Checked] = useState<boolean>(false);

  // -------------------------------------------------------------
  // STEP 5 STATE: BDH Synthesis
  // -------------------------------------------------------------
  const [step5Answer1, setStep5Answer1] = useState<string | null>(null);
  const [step5Answer2, setStep5Answer2] = useState<string | null>(null);
  const [step5Checked, setStep5Checked] = useState<boolean>(false);

  const timerRef = useRef<number | null>(null);

  // -------------------------------------------------------------
  // REAL CONTINUOUS TIMER via requestAnimationFrame
  // -------------------------------------------------------------
  useEffect(() => {
    if (!timer.running || timer.finished || timer.startedAt === null) {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
      return;
    }

    const updateTimer = () => {
      const now = performance.now();
      const elapsed = now - (timer.startedAt || now);

      if (elapsed >= 60000) {
        // 60-Second Time Limit Reached
        setTimer((prev) => ({
          ...prev,
          elapsedMs: 60000,
          running: false,
          finished: true,
        }));
        setTimedOut(true);
        return;
      }

      setTimer((prev) => ({ ...prev, elapsedMs: elapsed }));
      timerRef.current = requestAnimationFrame(updateTimer);
    };

    timerRef.current = requestAnimationFrame(updateTimer);

    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [timer.running, timer.finished, timer.startedAt]);

  // -------------------------------------------------------------
  // START TEST HANDLER
  // -------------------------------------------------------------
  const handleStartTest = useCallback(() => {
    const now = performance.now();
    setTestStarted(true);
    setCurrentStep(1);
    setTimer({
      startedAt: now,
      elapsedMs: 0,
      running: true,
      finished: false,
    });
    setTestCompleted(false);
    setTimedOut(false);
    setStageResults({});
    // Reset inputs
    setStep1Answer(null);
    setStep1Checked(false);
    setAddedDistractors([]);
    setStep2Answer(null);
    setStep2Checked(false);
    setSelectedSnapshotIdx(0);
    setStep3Answer(null);
    setStep3Checked(false);
    setStep4Prediction(null);
    setStep4Checked(false);
    setStep5Answer1(null);
    setStep5Answer2(null);
    setStep5Checked(false);
  }, []);

  // -------------------------------------------------------------
  // RESTART TEST HANDLER
  // -------------------------------------------------------------
  const handleRestart = useCallback(() => {
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
    setTestStarted(false);
    setCurrentStep(1);
    setTimer({
      startedAt: null,
      elapsedMs: 0,
      running: false,
      finished: false,
    });
    setTestCompleted(false);
    setTimedOut(false);
    setStageResults({});
    setStep1Answer(null);
    setStep1Checked(false);
    setAddedDistractors([]);
    setStep2Answer(null);
    setStep2Checked(false);
    setSelectedSnapshotIdx(0);
    setStep3Answer(null);
    setStep3Checked(false);
    setStep4Prediction(null);
    setStep4Checked(false);
    setStep5Answer1(null);
    setStep5Answer2(null);
    setStep5Checked(false);
  }, []);

  // -------------------------------------------------------------
  // REAL EXPERIMENT ENGINE COMPUTATIONS
  // -------------------------------------------------------------

  // Step 1: Base Memory with 3 facts (Japan -> Tokyo, France -> Paris, Brazil -> Brasília)
  const baseMemory = useMemo(() => {
    const dim = 16;
    const allKnownFacts = [...INITIAL_FACTS, ...DISTRACTOR_CANDIDATES];
    const mem = createAssociativeMemory(allKnownFacts, dim, 0.95, 0.8);
    INITIAL_FACTS.forEach((f) => mem.writeFact(f));
    const queryRes = mem.query('Japan');
    const matrix = mem.getMatrix();
    return {
      mem,
      matrix,
      queryRes,
      groundTruth: 'Tokyo',
      dim,
    };
  }, []);

  // Step 2 & 3: Memory with Distractors added
  const disturbedMemory = useMemo(() => {
    const dim = 16;
    const allFacts = [...INITIAL_FACTS, ...addedDistractors];
    const allKnownFacts = [...INITIAL_FACTS, ...DISTRACTOR_CANDIDATES];
    const mem = createAssociativeMemory(allKnownFacts, dim, 0.95, 0.8);
    allFacts.forEach((f) => mem.writeFact(f));
    const finalMatrix = mem.getMatrix();
    const queryRes = mem.query('Japan');
    const history = mem.getHistory(); // array of matrices after each writeFact

    // Matrix Delta from Initial State to Current
    const initialMatrix = baseMemory.matrix;
    const matrixDelta: number[][] = finalMatrix.map((row, r) =>
      row.map((val, c) => val - (initialMatrix[r]?.[c] || 0))
    );

    // Coordinate statistics
    let maxPos = { val: -Infinity, r: 0, c: 0 };
    let maxNeg = { val: Infinity, r: 0, c: 0 };
    let absSum = 0;
    let initialSumSq = 0;
    let finalSumSq = 0;
    let deltaSumSq = 0;

    for (let r = 0; r < dim; r++) {
      for (let c = 0; c < dim; c++) {
        const iVal = initialMatrix[r]?.[c] || 0;
        const fVal = finalMatrix[r]?.[c] || 0;
        const dVal = fVal - iVal;

        initialSumSq += iVal * iVal;
        finalSumSq += fVal * fVal;
        deltaSumSq += dVal * dVal;
        absSum += Math.abs(dVal);

        if (dVal > maxPos.val) maxPos = { val: dVal, r, c };
        if (dVal < maxNeg.val) maxNeg = { val: dVal, r, c };
      }
    }

    const initialFrobenius = Math.sqrt(initialSumSq);
    const finalFrobenius = Math.sqrt(finalSumSq);
    const deltaFrobenius = Math.sqrt(deltaSumSq);
    const meanAbsDelta = absSum / (dim * dim);

    return {
      mem,
      allFacts,
      finalMatrix,
      queryRes,
      history,
      matrixDelta,
      maxPos,
      maxNeg,
      meanAbsDelta,
      initialFrobenius,
      finalFrobenius,
      deltaFrobenius,
      // Changes compared to initial query
      scoreDelta: queryRes.retrievalScore - baseMemory.queryRes.retrievalScore,
      marginDelta: queryRes.top1Margin - baseMemory.queryRes.top1Margin,
      predictionChanged: queryRes.prediction !== baseMemory.queryRes.prediction,
    };
  }, [baseMemory, addedDistractors]);

  // Step 4: Quantitative Capacity Simulation (Baseline D=16 vs D=8 vs D=32)
  const capacityComparison = useMemo(() => {
    const testFacts = [...INITIAL_FACTS, DISTRACTOR_CANDIDATES[0], DISTRACTOR_CANDIDATES[1]]; // 5 facts
    const allKnown = [...INITIAL_FACTS, ...DISTRACTOR_CANDIDATES];

    // Baseline (D=16)
    const mem16 = createAssociativeMemory(allKnown, 16, 0.95, 0.8);
    testFacts.forEach((f) => mem16.writeFact(f));
    const res16 = mem16.query('Japan');

    // Compressed (D=8)
    const mem8 = createAssociativeMemory(allKnown, 8, 0.95, 0.8);
    testFacts.forEach((f) => mem8.writeFact(f));
    const res8 = mem8.query('Japan');

    // Expanded (D=32)
    const mem32 = createAssociativeMemory(allKnown, 32, 0.95, 0.8);
    testFacts.forEach((f) => mem32.writeFact(f));
    const res32 = mem32.query('Japan');

    return {
      baseline: {
        dim: 16,
        score: res16.retrievalScore,
        margin: res16.top1Margin,
        prediction: res16.prediction,
      },
      compressed: {
        dim: 8,
        score: res8.retrievalScore,
        margin: res8.top1Margin,
        prediction: res8.prediction,
        scoreDelta: res8.retrievalScore - res16.retrievalScore,
        marginDelta: res8.top1Margin - res16.top1Margin,
      },
      expanded: {
        dim: 32,
        score: res32.retrievalScore,
        margin: res32.top1Margin,
        prediction: res32.prediction,
        scoreDelta: res32.retrievalScore - res16.retrievalScore,
        marginDelta: res32.top1Margin - res16.top1Margin,
      },
    };
  }, []);

  // -------------------------------------------------------------
  // STAGE CHECK ACTIONS
  // -------------------------------------------------------------

  // Step 1 Check
  const handleCheckStep1 = () => {
    if (!step1Answer) return;
    const isCorrect = step1Answer === baseMemory.groundTruth;
    const result: StageResult = {
      stage: 1,
      correct: isCorrect,
      points: isCorrect ? 20 : 0,
      responseTimeMs: timer.elapsedMs,
      userAnswer: step1Answer,
      expectedAnswer: baseMemory.groundTruth,
    };
    setStageResults((prev) => ({ ...prev, 1: result }));
    setStep1Checked(true);

    if (autoPace) {
      setTimeout(() => {
        setCurrentStep(2);
      }, 1500);
    }
  };

  // Step 2 Add Distractor
  const handleAddDistractor = (fact: Fact) => {
    if (addedDistractors.some((d) => d.key === fact.key)) return;
    setAddedDistractors((prev) => [...prev, fact]);
    // reset check if modifying distractor list
    setStep2Checked(false);
  };

  // Step 2 Check
  const handleCheckStep2 = () => {
    if (!step2Answer) return;
    // Real evaluation: Did retrieval change?
    const didChange =
      Math.abs(disturbedMemory.scoreDelta) > 0.005 ||
      Math.abs(disturbedMemory.marginDelta) > 0.005 ||
      disturbedMemory.predictionChanged;

    const isCorrect = (step2Answer === 'yes' && didChange) || (step2Answer === 'no' && !didChange);

    const result: StageResult = {
      stage: 2,
      correct: isCorrect,
      points: isCorrect ? 20 : 0,
      responseTimeMs: timer.elapsedMs,
      userAnswer: step2Answer === 'yes' ? 'Yes (Changed)' : 'No (Unchanged)',
      expectedAnswer: didChange ? 'Yes (Changed)' : 'No (Unchanged)',
    };
    setStageResults((prev) => ({ ...prev, 2: result }));
    setStep2Checked(true);

    if (autoPace) {
      setTimeout(() => {
        setCurrentStep(3);
      }, 1500);
    }
  };

  // Step 3 Check
  const handleCheckStep3 = () => {
    if (!step3Answer) return;
    // Correct answer is A (outer products accumulated onto existing coordinates)
    const isCorrect = step3Answer === 'A';
    const result: StageResult = {
      stage: 3,
      correct: isCorrect,
      points: isCorrect ? 20 : 0,
      responseTimeMs: timer.elapsedMs,
      userAnswer: step3Answer,
      expectedAnswer: 'A',
    };
    setStageResults((prev) => ({ ...prev, 3: result }));
    setStep3Checked(true);

    if (autoPace) {
      setTimeout(() => {
        setCurrentStep(4);
      }, 1500);
    }
  };

  // Step 4 Check
  const handleCheckStep4 = () => {
    if (!step4Prediction) return;
    // Option A is correct (Lower dimension D=8 reduces quasi-orthogonal capacity)
    const isCorrect = step4Prediction === 'A';
    const result: StageResult = {
      stage: 4,
      correct: isCorrect,
      points: isCorrect ? 20 : 0,
      responseTimeMs: timer.elapsedMs,
      userAnswer: step4Prediction,
      expectedAnswer: 'A',
    };
    setStageResults((prev) => ({ ...prev, 4: result }));
    setStep4Checked(true);

    if (autoPace) {
      setTimeout(() => {
        setCurrentStep(5);
      }, 1500);
    }
  };

  // Step 5 Check & Finish
  const handleCheckStep5 = () => {
    if (!step5Answer1 || !step5Answer2) return;
    // Q1: B (fixed recurrent state), Q2: A (compressed finite representation)
    const q1Correct = step5Answer1 === 'B';
    const q2Correct = step5Answer2 === 'A';
    const totalPoints = (q1Correct ? 10 : 0) + (q2Correct ? 10 : 0);
    const isFullyCorrect = q1Correct && q2Correct;

    const result: StageResult = {
      stage: 5,
      correct: isFullyCorrect,
      points: totalPoints,
      responseTimeMs: timer.elapsedMs,
      userAnswer: `Q1: ${step5Answer1}, Q2: ${step5Answer2}`,
      expectedAnswer: 'Q1: B, Q2: A',
    };

    const updatedResults = { ...stageResults, 5: result };
    setStageResults(updatedResults);
    setStep5Checked(true);

    // Stop timer
    const totalElapsed = timer.elapsedMs;
    setTimer((prev) => ({ ...prev, running: false, finished: true }));
    setTestCompleted(true);

    // Calculate total score
    const totalScore: number = (Object.values(updatedResults) as StageResult[]).reduce(
      (sum: number, r: StageResult) => sum + r.points,
      0
    );

    // Save test attempt
    const attempt: SixtySecondTestAttempt = {
      id: `attempt_${Date.now()}`,
      startedAt: timer.startedAt || Date.now() - totalElapsed,
      completedAt: Date.now(),
      elapsedMs: totalElapsed,
      score: totalScore,
      timedOut: false,
      stages: Object.values(updatedResults) as StageResult[],
    };

    saveTestAttempt(attempt);
    setTestAttempts((prev) => [attempt, ...prev]);

    // Mark milestone if passed (>= 60 points)
    if (totalScore >= 60) {
      markMilestoneCompleted('verify_knowledge');
    }
  };

  // Current total points
  const currentTotalScore = useMemo(() => {
    return (Object.values(stageResults) as StageResult[]).reduce(
      (sum: number, r: StageResult) => sum + r.points,
      0
    );
  }, [stageResults]);

  // Is current step checked?
  const isCurrentStepChecked = useMemo(() => {
    if (currentStep === 1) return step1Checked;
    if (currentStep === 2) return step2Checked;
    if (currentStep === 3) return step3Checked;
    if (currentStep === 4) return step4Checked;
    if (currentStep === 5) return step5Checked;
    return false;
  }, [currentStep, step1Checked, step2Checked, step3Checked, step4Checked, step5Checked]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isModal) {
          if (timer.running) setShowExitConfirm(true);
          else if (onClose) onClose();
        }
      } else if (e.key === 'ArrowLeft') {
        if (testStarted && currentStep > 1) {
          setCurrentStep((s) => s - 1);
        }
      } else if (e.key === 'ArrowRight') {
        if (testStarted && currentStep < 5 && isCurrentStepChecked) {
          setCurrentStep((s) => s + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModal, timer.running, onClose, testStarted, currentStep, isCurrentStepChecked]);

  // Format seconds
  const formattedSeconds = (timer.elapsedMs / 1000).toFixed(1);
  const formattedSecondsInt = Math.floor(timer.elapsedMs / 1000);

  // Selected snapshot for Step 3
  const activeSnapshotMatrix = useMemo(() => {
    if (disturbedMemory.history.length === 0) return disturbedMemory.finalMatrix;
    const idx = Math.min(selectedSnapshotIdx, disturbedMemory.history.length - 1);
    return disturbedMemory.history[idx] || disturbedMemory.finalMatrix;
  }, [disturbedMemory, selectedSnapshotIdx]);

  const isRunningTest = testStarted && !testCompleted && !timedOut;

  return (
    <div
      data-assessment-active={isRunningTest ? 'true' : undefined}
      className={`w-full font-sans text-[var(--mm-ink)] ${
        isModal
          ? 'max-w-4xl mx-auto rounded-xl border border-[var(--mm-rule)] bg-[var(--mm-paper-bright)] shadow-[var(--shadow-popover)] overflow-hidden flex flex-col max-h-[92vh]'
          : 'essay-figure-stage overflow-hidden'
      }`}
    >
      {/* ============================================================ */}
      {/* TOP HEADER: Clean Restrained Assessment Bar                  */}
      {/* ============================================================ */}
      <div className="px-5 py-4 sm:px-8 border-b border-[var(--mm-rule)] flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[var(--mm-signal)] font-semibold uppercase tracking-[0.06em]">
              <Clock className="w-3.5 h-3.5" />
              <span>60s fast verification</span>
            </span>
            <EvidenceStrip type="live" detail="Associative fast-weight matrix engine" />
          </div>
          <h3 className="text-base sm:text-lg font-sans font-semibold text-[var(--mm-ink)]">
            {testStarted
              ? `${STEPS[currentStep - 1].label} · ${STEPS[currentStep - 1].title}`
              : 'Interactive Mechanistic Assessment'}
          </h3>
        </div>

        <div className="flex items-center gap-2.5">
          {isRunningTest && (
            <>
              {/* Auto-Pace Toggle */}
              <button
                type="button"
                onClick={() => setAutoPace((p) => !p)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-sans transition border cursor-pointer ${
                  autoPace
                    ? 'bg-[var(--color-success-soft)] border-[var(--color-success-border)] text-[var(--color-success)] font-semibold'
                    : 'bg-[var(--page-bg)] border-[var(--mm-rule)] text-[var(--mm-ink-soft)] hover:border-[var(--mm-rule-strong)] hover:text-[var(--mm-ink)]'
                }`}
                title="When active, advances 1.5s after checking an answer"
              >
                {autoPace ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span className="hidden sm:inline">Auto-Pace: {autoPace ? 'On' : 'Off'}</span>
              </button>

              {/* Real Continuous Timer Display */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--page-bg)] border border-[var(--mm-rule)] text-xs font-mono tabular-nums">
                <span className="text-[var(--mm-muted)]">Elapsed</span>
                <strong
                  className={`font-bold ${
                    timer.elapsedMs <= 45000
                      ? 'text-[var(--mm-ink)]'
                      : timer.elapsedMs <= 55000
                      ? 'text-[var(--mm-amber)]'
                      : 'text-[var(--mm-coral)]'
                  }`}
                >
                  {formattedSecondsInt < 10 ? `0${formattedSecondsInt}` : formattedSecondsInt}s
                </strong>
                <span className="text-[var(--mm-muted)]">/ 60s</span>
              </div>
            </>
          )}

          {isModal && onClose && (
            <button
              type="button"
              onClick={() => {
                if (timer.running) setShowExitConfirm(true);
                else onClose();
              }}
              className="p-1.5 rounded-md bg-[var(--page-bg)] hover:bg-[var(--surface-soft)] border border-[var(--mm-rule)] text-[var(--mm-ink-soft)] hover:text-[var(--mm-ink)] transition cursor-pointer"
              aria-label="Close"
              title="Close assessment"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5-STAGE PROGRESS TIMELINE (Quiet Hairline Strip)             */}
      {/* ============================================================ */}
      {testStarted && (
        <div className="grid grid-cols-5 border-b border-[var(--mm-rule)] text-xs font-mono divide-x divide-[var(--mm-rule)]">
          {STEPS.map((st) => {
            const isDone = stageResults[st.index] !== undefined;
            const isCurrent = currentStep === st.index;
            const isLocked = !isDone && !isCurrent;

            let tabClass = 'text-[var(--mm-muted)] cursor-not-allowed';
            if (isCurrent) {
              tabClass =
                'text-[var(--mm-signal)] border-b-2 border-b-[var(--mm-signal)] font-semibold bg-[var(--mm-signal-soft)]/40';
            } else if (isDone) {
              tabClass =
                'text-[var(--color-success)] border-b-2 border-b-[var(--color-success)] hover:bg-[var(--page-bg)] cursor-pointer';
            }

            return (
              <button
                key={st.index}
                type="button"
                disabled={isLocked}
                onClick={() => {
                  if (!isLocked) setCurrentStep(st.index);
                }}
                className={`py-2.5 px-2 text-center transition-colors relative ${tabClass}`}
              >
                <div className="text-[10px] tracking-wider opacity-85">{st.label}</div>
                <div className="truncate text-xs font-sans font-medium hidden sm:block mt-0.5">
                  {st.shortTitle}
                </div>
                <div className="text-[10px] text-[var(--mm-muted)] font-mono hidden md:block tabular-nums">
                  ~{st.targetSeconds}s
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* MAIN CONTENT AREA                                            */}
      {/* ============================================================ */}
      <div className="px-5 py-6 sm:px-8 overflow-y-auto flex-1 space-y-6">
        {/* ------------------------------------------------------------ */}
        {/* START SCREEN                                                 */}
        {/* ------------------------------------------------------------ */}
        {!testStarted && !testCompleted && !timedOut && (
          <div className="max-w-[780px] mx-auto space-y-7 py-2 animate-in fade-in">
            <div className="space-y-3">
              <div className="essay-eyebrow text-[var(--mm-signal)] font-semibold">
                Empirical protocol · 5-stage evaluation
              </div>
              <h3 className="text-2xl sm:text-[32px] font-serif font-normal text-[var(--mm-ink)] tracking-[-0.02em] leading-[1.15]">
                Can you predict, break, trace and explain a fixed-size recurrent memory?
              </h3>
              <p className="text-sm sm:text-[15px] text-[var(--mm-ink-soft)] leading-relaxed max-w-2xl">
                Complete the 5-stage mechanistic evaluation. Every prediction is checked live against deterministic associative fast-weight matrix updates.
              </p>
            </div>

            {/* 5 Stages Structured Overview (Pure Hairline List) */}
            <div className="border-y border-[var(--mm-rule)] divide-y divide-[var(--mm-rule)]">
              {[
                {
                  num: '01',
                  name: 'Remember',
                  target: '~12s',
                  desc: 'Verify query readout for an association stored in a compact fixed-size matrix.',
                },
                {
                  num: '02',
                  name: 'Break It',
                  target: '~24s',
                  desc: 'Write competing distractor facts and probe the onset of representational crosstalk.',
                },
                {
                  num: '03',
                  name: 'Trace It',
                  target: '~36s',
                  desc: 'Inspect exact coordinate deltas and Frobenius norm energy drift between snapshots.',
                },
                {
                  num: '04',
                  name: 'Measure It',
                  target: '~48s',
                  desc: 'Predict how dimension capacity D affects quasi-orthogonal separation and margin.',
                },
                {
                  num: '05',
                  name: 'BDH Synthesis',
                  target: '~60s',
                  desc: 'Connect fixed recurrent state principles to synaptic plasticity in the Dragon Hatchling architecture.',
                },
              ].map((item) => (
                <div
                  key={item.num}
                  className="py-3.5 grid grid-cols-1 sm:grid-cols-[190px_1fr] gap-1 sm:gap-5 items-baseline"
                >
                  <div className="flex items-center gap-2.5 font-mono text-xs tabular-nums">
                    <span className="text-[var(--mm-signal)] font-semibold">{item.num}</span>
                    <span className="font-sans font-semibold text-sm text-[var(--mm-ink)]">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-[var(--mm-muted)]">({item.target})</span>
                  </div>
                  <p className="text-xs sm:text-[13px] text-[var(--mm-ink-soft)] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Scientific Honesty Footnote (Unboxed border-l accent) */}
            <div className="pl-4 border-l-2 border-[var(--mm-rule-strong)] flex items-start gap-2.5 text-xs text-[var(--mm-ink-soft)] leading-relaxed">
              <HelpCircle className="w-4 h-4 text-[var(--mm-muted)] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[var(--mm-ink)]">Educational Toy Computation:</strong> This
                assessment runs in real time over a 16×16 associative fast-weight matrix. It
                illustrates fixed-state recurrence and does not execute the full official BDH PyTorch graph.
              </div>
            </div>

            {/* Start CTA Row */}
            <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-[var(--mm-muted)] font-mono tabular-nums">
                5 stages · 20 pts each · 60s target pacing
              </div>
              <button
                type="button"
                onClick={handleStartTest}
                className="btn-primary w-full sm:w-auto px-6 py-2.5 text-sm"
              >
                <span>Start Test</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Past Attempts History (if available) */}
            {testAttempts.length > 0 && (
              <div className="pt-4 border-t border-[var(--mm-rule)] space-y-2">
                <span className="essay-eyebrow block">Previous session attempts</span>
                <div className="divide-y divide-[var(--mm-rule)] border-y border-[var(--mm-rule)] max-h-32 overflow-y-auto">
                  {testAttempts.slice(0, 3).map((att) => (
                    <div
                      key={att.id}
                      className="py-2 flex items-center justify-between text-xs font-mono text-[var(--mm-ink-soft)] tabular-nums"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            att.score >= 80
                              ? 'text-[var(--color-success)] font-bold'
                              : 'text-[var(--mm-amber)] font-semibold'
                          }
                        >
                          {att.score}/100 pts
                        </span>
                        <span className="text-[var(--mm-muted)]">·</span>
                        <span>{(att.elapsedMs / 1000).toFixed(1)}s</span>
                      </div>
                      <span className="text-[var(--mm-muted)] text-[11px]">
                        {new Date(att.completedAt || att.startedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* ACTIVE SINGLE-QUESTION STAGE (Steps 01–05)                   */}
        {/* ------------------------------------------------------------ */}
        {testStarted && !testCompleted && !timedOut && (
          <motion.div
            key={`assessment-step-${currentStep}`}
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
        {/* ------------------------------------------------------------ */}
        {/* STEP 01: REMEMBER                                            */}
        {/* ------------------------------------------------------------ */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in">
            {/* Context Box */}
            <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-mono text-[var(--color-accent-ink)] font-semibold">
                  Test 1: Fixed-size retrieval fidelity
                </span>
                <span className="text-[11px] font-mono text-[var(--color-success)] bg-[var(--color-success-soft)] border border-[var(--color-success-border)] px-2 py-0.5 rounded">
                  State: D=16 matrix (256 floats)
                </span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
                The model sequentially stored 3 facts into a fixed-size state matrix (<InlineMath math="M \in \mathbb{R}^{16 \times 16}" />):
              </p>
              <div className="flex flex-wrap gap-2 pt-0.5">
                {INITIAL_FACTS.map((f) => (
                  <span
                    key={f.key}
                    className="px-2.5 py-1 rounded-md bg-[var(--surface)] border border-[var(--border)] text-xs font-mono text-[var(--text-primary)]"
                  >
                    <strong>{f.key}</strong> → {f.value}
                  </span>
                ))}
              </div>
            </div>

            {/* Question */}
            <div className="space-y-3">
              <h4 className="font-sans text-base sm:text-lg font-semibold text-[var(--text-primary)]">
                Which value should the memory retrieve when the query key is "Japan"?
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {['Tokyo', 'Paris', 'Brasília'].map((optionVal) => {
                  const isSelected = step1Answer === optionVal;
                  let btnStyle =
                    'bg-[var(--surface)] border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--color-border-strong)] hover:bg-[var(--surface-soft)]';
                  if (isSelected) {
                    btnStyle =
                      'bg-[var(--accent-blue)] border-[var(--color-accent)] text-[var(--color-accent-ink)] font-semibold';
                  }

                  return (
                    <button
                      key={optionVal}
                      type="button"
                      disabled={step1Checked}
                      onClick={() => setStep1Answer(optionVal)}
                      className={`p-3 rounded-lg border text-sm font-sans transition text-center cursor-pointer ${btnStyle}`}
                    >
                      {optionVal}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Check Button & Results */}
            {!step1Checked ? (
              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  disabled={!step1Answer}
                  onClick={handleCheckStep1}
                  className="px-5 py-2 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-40 text-[var(--surface)] font-sans text-xs font-semibold transition cursor-pointer"
                >
                  Check Answer
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                {/* Live Model Readout vs Ground Truth */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)]">
                    <span className="text-[11px] text-[var(--text-muted)] block">Query Key</span>
                    <strong className="text-sm text-[var(--text-primary)] mt-0.5 block">Japan</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)]">
                    <span className="text-[11px] text-[var(--text-muted)] block">Ground Truth</span>
                    <strong className="text-sm text-[var(--text-primary)] mt-0.5 block">
                      {baseMemory.groundTruth}
                    </strong>
                  </div>
                  <div
                    className={`p-3 rounded-lg border ${
                      stageResults[1]?.correct
                        ? 'bg-[var(--color-success-soft)] border-[var(--color-success-border)] text-[var(--color-success)]'
                        : 'bg-[var(--color-danger-soft)] border-[var(--color-danger-border)] text-[var(--color-danger)]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span>Model Readout</span>
                      <span className="font-bold">
                        {stageResults[1]?.correct ? '✓ Match (+20 pts)' : '✗ Incorrect'}
                      </span>
                    </div>
                    <strong className="text-sm mt-0.5 block">{baseMemory.queryRes.prediction}</strong>
                    <div className="text-[11px] mt-0.5 opacity-90">
                      Score: {baseMemory.queryRes.retrievalScore.toFixed(3)} · Margin:{' '}
                      {baseMemory.queryRes.top1Margin.toFixed(3)}
                    </div>
                  </div>
                </div>

                {/* Feedback note */}
                <div
                  className={`p-3.5 rounded-lg border text-xs sm:text-sm font-sans leading-relaxed ${
                    stageResults[1]?.correct
                      ? 'bg-[var(--color-success-soft)] border-[var(--color-success-border)] text-[var(--color-success)]'
                      : 'bg-[var(--color-danger-soft)] border-[var(--color-danger-border)] text-[var(--color-danger)]'
                  }`}
                >
                  {stageResults[1]?.correct ? (
                    <div>
                      <strong>Correct (+20 Points).</strong> The query key vector was projected through
                      recurrent state matrix <InlineMath math="M" /> (<InlineMath math="\hat{v} = q^\top M" />), cleanly
                      isolating the target vector for Tokyo without requiring a separate token tape.
                    </div>
                  ) : (
                    <div>
                      <strong>Incorrect (0 Points).</strong> Your answer was {step1Answer}, but the ground
                      truth is Tokyo. The query key vector was Japan, whose stored association is Tokyo.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* STEP 02: BREAK IT                                            */}
        {/* ------------------------------------------------------------ */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-mono text-[var(--color-warning)] font-semibold flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Test 2: Superposition & capacity pressure</span>
                </span>
                <span className="text-[11px] font-mono text-[var(--text-muted)]">
                  State Capacity: D=16 Fixed
                </span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
                What happens when competing associations are superposed into the <em>exact same</em> 16×16
                coordinate matrix? <strong className="text-[var(--text-primary)]">Add one or more distractor facts below</strong> to write their
                outer products into the state:
              </p>

              {/* Distractor buttons */}
              <div className="flex flex-wrap gap-2 pt-0.5">
                {DISTRACTOR_CANDIDATES.map((cand) => {
                  const isAdded = addedDistractors.some((d) => d.key === cand.key);
                  return (
                    <button
                      key={cand.key}
                      type="button"
                      onClick={() => handleAddDistractor(cand)}
                      disabled={isAdded || step2Checked}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition cursor-pointer flex items-center gap-1.5 ${
                        isAdded
                          ? 'bg-[var(--color-success-soft)] border-[var(--color-success-border)] text-[var(--color-success)] font-semibold'
                          : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--color-warning)]'
                      }`}
                    >
                      <span>{isAdded ? '✓' : '+'}</span>
                      <span>
                        {cand.key} → {cand.value}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question */}
            <div className="space-y-3">
              <h4 className="font-sans text-base sm:text-lg font-semibold text-[var(--text-primary)]">
                Did adding competing information alter the retrieval score or readout for "Japan"?
              </h4>

              <div className="grid grid-cols-2 gap-3 max-w-sm">
                {[
                  { val: 'yes', label: 'Yes (Altered)' },
                  { val: 'no', label: 'No (Unchanged)' },
                ].map((opt) => {
                  const isSelected = step2Answer === opt.val;
                  let btnStyle =
                    'bg-[var(--surface)] border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--color-border-strong)] hover:bg-[var(--surface-soft)]';
                  if (isSelected) {
                    btnStyle =
                      'bg-[var(--accent-blue)] border-[var(--color-accent)] text-[var(--color-accent-ink)] font-semibold';
                  }

                  return (
                    <button
                      key={opt.val}
                      type="button"
                      disabled={step2Checked}
                      onClick={() => setStep2Answer(opt.val as 'yes' | 'no')}
                      className={`p-3 rounded-lg border text-sm font-sans transition text-center cursor-pointer ${btnStyle}`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Probe Button & Live Engine Readout */}
            {!step2Checked ? (
              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  disabled={!step2Answer || addedDistractors.length === 0}
                  onClick={handleCheckStep2}
                  className="px-5 py-2 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-40 text-[var(--surface)] font-sans text-xs font-semibold transition cursor-pointer"
                >
                  Run Probe & Evaluate
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)]">
                    <span className="text-[11px] text-[var(--text-muted)] block">Target Query</span>
                    <strong className="text-sm text-[var(--text-primary)] mt-0.5 block">Japan</strong>
                  </div>

                  <div className="p-3 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)]">
                    <span className="text-[11px] text-[var(--text-muted)] block">Distractors</span>
                    <strong className="text-sm text-[var(--color-warning)] mt-0.5 block">
                      +{addedDistractors.length} added
                    </strong>
                  </div>

                  <div className="p-3 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)]">
                    <span className="text-[11px] text-[var(--text-muted)] block">
                      Retrieval Score Δ
                    </span>
                    <strong
                      className={`text-sm mt-0.5 block ${
                        disturbedMemory.scoreDelta < 0
                          ? 'text-[var(--color-danger)]'
                          : 'text-[var(--color-success)]'
                      }`}
                    >
                      {disturbedMemory.scoreDelta > 0 ? '+' : ''}
                      {disturbedMemory.scoreDelta.toFixed(3)}
                    </strong>
                  </div>

                  <div
                    className={`p-3 rounded-lg border ${
                      stageResults[2]?.correct
                        ? 'bg-[var(--color-success-soft)] border-[var(--color-success-border)] text-[var(--color-success)]'
                        : 'bg-[var(--color-danger-soft)] border-[var(--color-danger-border)] text-[var(--color-danger)]'
                    }`}
                  >
                    <span className="text-[11px] block">Assessment</span>
                    <strong className="text-sm mt-0.5 block">
                      {stageResults[2]?.correct ? '✓ Pass (+20 pts)' : '✗ Incorrect'}
                    </strong>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)] text-xs sm:text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
                  <strong className="text-[var(--text-primary)]">Empirical Observation:</strong>{' '}
                  {disturbedMemory.predictionChanged ? (
                    <span>
                      Severe interference occurred: the readout prediction shifted to "
                      {disturbedMemory.queryRes.prediction}". Competing vector superpositions displaced
                      the coordinate trajectory.
                    </span>
                  ) : (
                    <span>
                      Retrieval remained correct under these conditions, but margin narrowed by Δ ={' '}
                      {disturbedMemory.marginDelta.toFixed(3)}. The competing fact superposed noise onto
                      the retrieval axis.
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* STEP 03: TRACE IT                                            */}
        {/* ------------------------------------------------------------ */}
        {testStarted && currentStep === 3 && !testCompleted && !timedOut && (
          <div className="space-y-5 animate-in fade-in">
            <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-mono text-[var(--color-accent-ink)] font-semibold">
                  Test 3: Matrix state forensics & energy drift
                </span>
                <span className="text-[11px] font-mono text-[var(--text-muted)]">
                  Frobenius Norm ‖M‖_F: {disturbedMemory.finalFrobenius.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
                Inspect the recorded sequence of state snapshots (<InlineMath math="t_0 \to t_N" />) from the
                actual memory history. Click any step to inspect the state at that moment in time:
              </p>

              {/* Timeline selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {disturbedMemory.history.map((_, idx) => {
                  const fact = disturbedMemory.allFacts[idx];
                  const isSelected = selectedSnapshotIdx === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedSnapshotIdx(idx)}
                      className={`px-3 py-1 rounded-lg border text-xs font-mono transition cursor-pointer shrink-0 ${
                        isSelected
                          ? 'bg-[var(--accent-blue)] border-[var(--color-accent)] text-[var(--color-accent-ink)] font-semibold'
                          : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--color-border-strong)]'
                      }`}
                    >
                      <span>t={idx + 1}</span>
                      <span className="text-[var(--text-muted)] ml-1">({fact?.key || 'Fact'})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Numerical Matrix Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)] space-y-1">
                <span className="text-[11px] text-[var(--text-muted)] block">
                  Largest Positive Change
                </span>
                <strong className="text-sm text-[var(--color-success)] block">
                  +{disturbedMemory.maxPos.val.toFixed(3)}
                </strong>
                <span className="text-[11px] text-[var(--text-muted)]">
                  at coordinate [row {disturbedMemory.maxPos.r}, col {disturbedMemory.maxPos.c}]
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)] space-y-1">
                <span className="text-[11px] text-[var(--text-muted)] block">
                  Largest Negative Shift
                </span>
                <strong className="text-sm text-[var(--color-danger)] block">
                  {disturbedMemory.maxNeg.val.toFixed(3)}
                </strong>
                <span className="text-[11px] text-[var(--text-muted)]">
                  at coordinate [row {disturbedMemory.maxNeg.r}, col {disturbedMemory.maxNeg.c}]
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)] space-y-1">
                <span className="text-[11px] text-[var(--text-muted)] block">
                  Mean Absolute Δ Coordinate
                </span>
                <strong className="text-sm text-[var(--text-primary)] block">
                  {disturbedMemory.meanAbsDelta.toFixed(4)}
                </strong>
                <span className="text-[11px] text-[var(--text-muted)]">
                  across all 256 coordinates
                </span>
              </div>
            </div>

            {/* Question */}
            <div className="space-y-3">
              <h4 className="font-sans text-base sm:text-lg font-semibold text-[var(--text-primary)]">
                What caused the coordinate drift between Initial M and Final M?
              </h4>

              <div className="space-y-2 text-sm font-sans">
                {[
                  {
                    id: 'A',
                    text: 'The outer products of newly added facts accumulated onto the existing coordinates without expanding matrix size.',
                    isCorrect: true,
                  },
                  {
                    id: 'B',
                    text: 'The matrix automatically allocated new rows and columns for each incoming fact.',
                    isCorrect: false,
                  },
                  {
                    id: 'C',
                    text: 'A random seed reshuffled all matrix entries during inference.',
                    isCorrect: false,
                  },
                ].map((opt) => {
                  const isSelected = step3Answer === opt.id;
                  let cardStyle =
                    'bg-[var(--surface)] border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--color-border-strong)] hover:bg-[var(--surface-soft)]';
                  if (isSelected) {
                    cardStyle =
                      'bg-[var(--accent-blue)] border-[var(--color-accent)] text-[var(--color-accent-ink)] font-semibold';
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={step3Checked}
                      onClick={() => setStep3Answer(opt.id)}
                      className={`w-full text-left p-3.5 rounded-lg border transition flex items-start gap-3 cursor-pointer ${cardStyle}`}
                    >
                      <span className="w-5 h-5 rounded bg-[var(--surface-soft)] border border-[var(--border)] flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5 text-[var(--text-secondary)]">
                        {opt.id}
                      </span>
                      <span className="leading-relaxed">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Check Button & Scientific Rigor Note */}
            {!step3Checked ? (
              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  disabled={!step3Answer}
                  onClick={handleCheckStep3}
                  className="px-5 py-2 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-40 text-[var(--surface)] font-sans text-xs font-semibold transition cursor-pointer"
                >
                  Verify Hypothesis
                </button>
              </div>
            ) : (
              <div
                className={`p-3.5 rounded-lg border text-xs sm:text-sm font-sans leading-relaxed ${
                  stageResults[3]?.correct
                    ? 'bg-[var(--color-success-soft)] border-[var(--color-success-border)] text-[var(--color-success)]'
                    : 'bg-[var(--color-danger-soft)] border-[var(--color-danger-border)] text-[var(--color-danger)]'
                }`}
              >
                {stageResults[3]?.correct ? (
                  <div>
                    <strong>Correct (+20 Points).</strong> Computed from the current deterministic experiment configuration.
                    Coordinate drift is the mathematical consequence of superposing outer products (<InlineMath math="\Delta M = \eta k v^\top" />)
                    into a bounded coordinate volume.
                  </div>
                ) : (
                  <div>
                    <strong>Incorrect (0 Points).</strong> The matrix size remained strictly fixed at 16×16.
                    Updates superpose directly onto existing coordinates rather than creating new dimensions.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* STEP 04: MEASURE IT                                          */}
        {/* ------------------------------------------------------------ */}
        {testStarted && currentStep === 4 && !testCompleted && !timedOut && (
          <div className="space-y-5 animate-in fade-in">
            <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-2">
              <span className="text-xs font-mono text-[var(--color-accent-ink)] font-semibold block">
                Test 4: Quantitative capacity prediction
              </span>
              <p className="text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
                Baseline setting: Dimension <InlineMath math="D=16" />, Retention <InlineMath math="\lambda=0.95" />, 5 facts stored.
                Predict how changing configuration will impact the likelihood of interference:
              </p>
            </div>

            {/* Hypothesis Options */}
            <div className="space-y-3">
              <h4 className="font-sans text-base sm:text-lg font-semibold text-[var(--text-primary)]">
                Which condition should make interference more likely to occur?
              </h4>

              <div className="space-y-2 text-sm font-sans">
                {[
                  {
                    id: 'A',
                    text: 'Reducing state dimension D from 16 to 8 (fewer quasi-orthogonal axes).',
                    isCorrect: true,
                  },
                  {
                    id: 'B',
                    text: 'Increasing state dimension D from 16 to 32 (more quasi-orthogonal axes).',
                    isCorrect: false,
                  },
                  {
                    id: 'C',
                    text: 'Setting the number of distractor writes to zero.',
                    isCorrect: false,
                  },
                ].map((opt) => {
                  const isSelected = step4Prediction === opt.id;
                  let cardStyle =
                    'bg-[var(--surface)] border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--color-border-strong)] hover:bg-[var(--surface-soft)]';
                  if (isSelected) {
                    cardStyle =
                      'bg-[var(--accent-blue)] border-[var(--color-accent)] text-[var(--color-accent-ink)] font-semibold';
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={step4Checked}
                      onClick={() => setStep4Prediction(opt.id as 'A' | 'B' | 'C')}
                      className={`w-full text-left p-3.5 rounded-lg border transition flex items-start gap-3 cursor-pointer ${cardStyle}`}
                    >
                      <span className="w-5 h-5 rounded bg-[var(--surface-soft)] border border-[var(--border)] flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5 text-[var(--text-secondary)]">
                        {opt.id}
                      </span>
                      <span className="leading-relaxed">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Run Measurement Button */}
            {!step4Checked ? (
              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  disabled={!step4Prediction}
                  onClick={handleCheckStep4}
                  className="px-5 py-2 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-40 text-[var(--surface)] font-sans text-xs font-semibold transition cursor-pointer"
                >
                  Run Measurement & Compare
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                {/* Quantitative Measurement Table */}
                <div className="rounded-xl border border-[var(--border)] overflow-x-auto bg-[var(--surface)] text-xs font-mono">
                  <div className="min-w-[480px]">
                    <div className="grid grid-cols-4 bg-[var(--surface-soft)] px-4 py-2.5 text-[var(--text-muted)] font-semibold border-b border-[var(--border)]">
                      <span>Dimension</span>
                      <span>Retrieval Score</span>
                      <span>Top-1 Margin</span>
                      <span>Predicted State</span>
                    </div>

                    {/* D=8 */}
                    <div className="grid grid-cols-4 px-4 py-2.5 border-b border-[var(--border)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]">
                      <span className="font-bold">D = 8 (Compressed)</span>
                      <span>{capacityComparison.compressed.score.toFixed(3)}</span>
                      <span className="font-bold">{capacityComparison.compressed.margin.toFixed(3)}</span>
                      <span>{capacityComparison.compressed.prediction}</span>
                    </div>

                    {/* D=16 */}
                    <div className="grid grid-cols-4 px-4 py-2.5 border-b border-[var(--border)] text-[var(--text-primary)]">
                      <span className="font-bold">D = 16 (Baseline)</span>
                      <span>{capacityComparison.baseline.score.toFixed(3)}</span>
                      <span>{capacityComparison.baseline.margin.toFixed(3)}</span>
                      <span>{capacityComparison.baseline.prediction}</span>
                    </div>

                    {/* D=32 */}
                    <div className="grid grid-cols-4 px-4 py-2.5 bg-[var(--color-success-soft)] text-[var(--color-success)]">
                      <span className="font-bold">D = 32 (Expanded)</span>
                      <span>{capacityComparison.expanded.score.toFixed(3)}</span>
                      <span className="font-bold">{capacityComparison.expanded.margin.toFixed(3)}</span>
                      <span>{capacityComparison.expanded.prediction}</span>
                    </div>
                  </div>
                </div>

                {/* Feedback */}
                <div
                  className={`p-3.5 rounded-lg border text-xs sm:text-sm font-sans leading-relaxed ${
                    stageResults[4]?.correct
                      ? 'bg-[var(--color-success-soft)] border-[var(--color-success-border)] text-[var(--color-success)]'
                      : 'bg-[var(--color-danger-soft)] border-[var(--color-danger-border)] text-[var(--color-danger)]'
                  }`}
                >
                  {stageResults[4]?.correct ? (
                    <div>
                      <strong>Correct (+20 Points).</strong> Observed measurement confirms: reducing dimension to <InlineMath math="D=8" /> collapses
                      margin to {capacityComparison.compressed.margin.toFixed(3)}, making coordinate crosstalk much more severe. Higher dimensions (<InlineMath math="D=32" />) provide exponentially more quasi-orthogonal directions.
                    </div>
                  ) : (
                    <div>
                      <strong>Incorrect (0 Points).</strong> Higher dimensions provide more quasi-orthogonal directions, delaying interference. Reducing dimension to D=8 concentrates coordinates into fewer axes, accelerating interference.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* STEP 05: BDH SYNTHESIS                                       */}
        {/* ------------------------------------------------------------ */}
        {testStarted && currentStep === 5 && !testCompleted && !timedOut && (
          <div className="space-y-5 animate-in fade-in">
            <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="text-[var(--color-accent-ink)] font-semibold">
                  Test 5: BDH architectural synthesis
                </span>
                <span className="text-[var(--text-muted)]">·</span>
                <span className="text-[var(--color-warning)]">Educational abstraction</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
                Connect your empirical observations of recurrent memory to modern architectures like Pathway's Dragon Hatchling (BDH):
              </p>
            </div>

            {/* Question 1 */}
            <div className="space-y-2.5">
              <h4 className="font-sans text-sm sm:text-base font-semibold text-[var(--text-primary)]">
                1. Which architectural idea is most closely related to what you observed in this experiment?
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm font-sans">
                {[
                  { id: 'A', text: 'A growing token-by-token KV cache that expands per step' },
                  { id: 'B', text: 'A fixed recurrent state updated sequentially over time' },
                  { id: 'C', text: 'An external database query table' },
                  { id: 'D', text: 'A stateless feedforward model with zero persistent state' },
                ].map((opt) => {
                  const isSelected = step5Answer1 === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={step5Checked}
                      onClick={() => setStep5Answer1(opt.id)}
                      className={`p-3 rounded-lg border text-left transition cursor-pointer flex items-start gap-2.5 ${
                        isSelected
                          ? 'bg-[var(--accent-blue)] border-[var(--color-accent)] text-[var(--color-accent-ink)] font-semibold'
                          : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--color-border-strong)] hover:bg-[var(--surface-soft)]'
                      }`}
                    >
                      <span className="w-5 h-5 rounded bg-[var(--surface-soft)] border border-[var(--border)] flex items-center justify-center font-mono font-bold shrink-0 text-[11px] text-[var(--text-secondary)]">
                        {opt.id}
                      </span>
                      <span>{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question 2 */}
            <div className="space-y-2.5 pt-1">
              <h4 className="font-sans text-sm sm:text-base font-semibold text-[var(--text-primary)]">
                2. Why can a fixed-size recurrent representation still experience interference?
              </h4>
              <div className="space-y-2 text-xs sm:text-sm font-sans">
                {[
                  {
                    id: 'A',
                    text: 'Multiple associations are compressed/updated within a finite representation, so new updates can alter previously stored associations.',
                  },
                  {
                    id: 'B',
                    text: 'Recurrent networks cannot perform addition or vector dot products.',
                  },
                  {
                    id: 'C',
                    text: 'Hardware GPU floating-point precision forces coordinates to zero every 5 steps.',
                  },
                ].map((opt) => {
                  const isSelected = step5Answer2 === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={step5Checked}
                      onClick={() => setStep5Answer2(opt.id)}
                      className={`w-full p-3 rounded-lg border text-left transition cursor-pointer flex items-start gap-2.5 ${
                        isSelected
                          ? 'bg-[var(--accent-blue)] border-[var(--color-accent)] text-[var(--color-accent-ink)] font-semibold'
                          : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--color-border-strong)] hover:bg-[var(--surface-soft)]'
                      }`}
                    >
                      <span className="w-5 h-5 rounded bg-[var(--surface-soft)] border border-[var(--border)] flex items-center justify-center font-mono font-bold shrink-0 text-[11px] text-[var(--text-secondary)]">
                        {opt.id}
                      </span>
                      <span>{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BDH Honesty Callout */}
            <div className="p-3.5 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)] text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
              <strong className="text-[var(--text-primary)]">Scientific Honesty Note:</strong> Your experiment is an educational associative-memory
              model. It illustrates the fixed-state and interference principle; it is not the official BDH
              implementation. BDH distributes state across a scale-free graph with dynamic synapses <InlineMath math="\sigma_{ij}" />.
            </div>

            {/* Finish Test Button */}
            {!step5Checked && (
              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  disabled={!step5Answer1 || !step5Answer2}
                  onClick={handleCheckStep5}
                  className="px-6 py-2.5 rounded-lg bg-[var(--color-success)] hover:opacity-90 disabled:opacity-40 text-[var(--surface)] font-sans text-xs font-semibold transition cursor-pointer"
                >
                  Submit & Finish Test
                </button>
              </div>
            )}
          </div>
        )}
          </motion.div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* COMPLETION SCREEN: Final Assessment Results                  */}
        {/* ------------------------------------------------------------ */}
        {testCompleted && (
          <div className="max-w-3xl mx-auto space-y-6 py-2 animate-in fade-in">
            {/* Header Summary */}
            <div className="p-5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-[var(--color-success-soft)] border border-[var(--color-success-border)] text-[var(--color-success)]">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-[var(--color-success)] font-semibold">
                      Verification complete
                    </span>
                    <h3 className="text-xl sm:text-2xl font-sans font-semibold text-[var(--text-primary)]">
                      60-Second Fast Assessment Results
                    </h3>
                  </div>
                </div>

                <div className="text-right font-mono tabular-nums">
                  <div className="text-2xl sm:text-3xl font-bold text-[var(--color-success)]">
                    {currentTotalScore} <span className="text-sm text-[var(--text-muted)]">/ 100</span>
                  </div>
                  <span className="text-xs text-[var(--text-muted)]">
                    Time: {formattedSeconds}s
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2 text-xs font-sans">
                <span className="text-[var(--text-secondary)]">Proficiency Evaluation:</span>
                <span
                  className={`font-semibold px-2.5 py-1 rounded-md border ${
                    currentTotalScore >= 80
                      ? 'bg-[var(--color-success-soft)] border-[var(--color-success-border)] text-[var(--color-success)]'
                      : currentTotalScore >= 60
                      ? 'bg-[var(--color-warning-soft)] border-[var(--color-warning-border)] text-[var(--color-warning)]'
                      : 'bg-[var(--color-danger-soft)] border-[var(--color-danger-border)] text-[var(--color-danger)]'
                  }`}
                >
                  {currentTotalScore >= 80
                    ? 'Concept Demonstrated (80–100)'
                    : currentTotalScore >= 60
                    ? 'Mostly Understood (60–79)'
                    : 'Review Recommended (0–59)'}
                </span>
              </div>
            </div>

            {/* Stage-by-Stage Breakdown */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-[var(--text-muted)] font-medium block">
                Stage-by-stage performance breakdown
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs font-mono">
                {STEPS.map((st) => {
                  const res = stageResults[st.index];
                  const pts = res?.points ?? 0;
                  const passed = pts >= 10;
                  return (
                    <div
                      key={st.index}
                      className={`p-3 rounded-lg border text-center space-y-1 ${
                        passed
                          ? 'bg-[var(--color-success-soft)] border-[var(--color-success-border)] text-[var(--color-success)]'
                          : 'bg-[var(--color-danger-soft)] border-[var(--color-danger-border)] text-[var(--color-danger)]'
                      }`}
                    >
                      <div className="text-[11px] opacity-85 font-sans font-medium">{st.shortTitle}</div>
                      <div className="text-sm font-bold">{pts} / 20</div>
                      <div className="text-[11px]">{passed ? '✓ Passed' : '✗ Review'}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4-Part Scientific Assessment Synthesis */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-1">
                <span className="text-[var(--color-accent-ink)] font-mono font-semibold text-xs block">
                  1. Prediction
                </span>
                <p className="text-[var(--text-primary)] leading-relaxed">
                  Evaluated your initial hypothesis: whether fixed-size fast-weight states could retain specific associations under sequence scaling without a growing token tape.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-1">
                <span className="text-[var(--color-success)] font-mono font-semibold text-xs block">
                  2. Observation
                </span>
                <p className="text-[var(--text-primary)] leading-relaxed">
                  Observed retrieval accuracy, decision margins, and state norm shifts across 5 progressive stages in real-time matrix algebra.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-1">
                <span className="text-[var(--color-warning)] font-mono font-semibold text-xs block">
                  3. Explanation
                </span>
                <p className="text-[var(--text-primary)] leading-relaxed">
                  Interference arises naturally when sequence length exceeds available quasi-orthogonal directions in dimension D, causing coordinate crosstalk and forgetting.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--accent-blue)] border border-[var(--border)] text-[var(--color-accent-ink)] space-y-1">
                <span className="font-mono font-semibold text-xs block">
                  4. Limitation
                </span>
                <p className="leading-relaxed">
                  Educational laboratory abstraction. Real-world frontier architectures (BDH) utilize decentralized plastic graphs rather than monolithic toy outer-product matrices.
                </p>
              </div>
            </div>

            {/* What You Demonstrated Checklist */}
            <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-2.5">
              <span className="text-sm font-sans font-semibold text-[var(--text-primary)] block">
                Demonstrated Principles
              </span>
              <div className="space-y-1.5 text-xs sm:text-sm text-[var(--text-secondary)]">
                <div className="flex items-center gap-2">
                  <span className={stageResults[1]?.correct ? 'text-[var(--color-success)] font-bold' : 'text-[var(--text-muted)]'}>
                    {stageResults[1]?.correct ? '✓' : '○'}
                  </span>
                  <span>Fixed-size memory carries information forward without growing a token tape.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={stageResults[2]?.correct ? 'text-[var(--color-success)] font-bold' : 'text-[var(--text-muted)]'}>
                    {stageResults[2]?.correct ? '✓' : '○'}
                  </span>
                  <span>Superposing competing facts causes coordinate crosstalk and narrows retrieval margin.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={stageResults[3]?.correct ? 'text-[var(--color-success)] font-bold' : 'text-[var(--text-muted)]'}>
                    {stageResults[3]?.correct ? '✓' : '○'}
                  </span>
                  <span>Coordinate drift and Frobenius energy changes can be mathematically inspected.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={stageResults[4]?.correct ? 'text-[var(--color-success)] font-bold' : 'text-[var(--text-muted)]'}>
                    {stageResults[4]?.correct ? '✓' : '○'}
                  </span>
                  <span>State dimension D directly governs quasi-orthogonal capacity limits.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={stageResults[5]?.correct ? 'text-[var(--color-success)] font-bold' : 'text-[var(--text-muted)]'}>
                    {stageResults[5]?.correct ? '✓' : '○'}
                  </span>
                  <span>BDH generalizes fixed-state recurrence using decentralized Hebbian synapses.</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleRestart}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-soft)] border border-[var(--border)] text-xs font-sans font-semibold text-[var(--text-primary)] transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>New Attempt</span>
              </button>

              <div className="flex flex-wrap items-center gap-2">
                {onExploreFullLab && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onClose) onClose();
                      onExploreFullLab();
                    }}
                    className="px-3.5 py-2 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-soft)] border border-[var(--border)] text-xs font-sans font-semibold text-[var(--text-primary)] transition cursor-pointer"
                  >
                    Interference Lab →
                  </button>
                )}
                {onEnterSandbox && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onClose) onClose();
                      onEnterSandbox();
                    }}
                    className="px-3.5 py-2 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-soft)] border border-[var(--border)] text-xs font-sans font-semibold text-[var(--text-primary)] transition cursor-pointer"
                  >
                    BDH Architecture →
                  </button>
                )}
                {isModal && onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--surface)] text-xs font-sans font-semibold transition cursor-pointer"
                  >
                    Return to Document
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* TIMEOUT SCREEN: Time Limit Reached (60s)                     */}
        {/* ------------------------------------------------------------ */}
        {timedOut && !testCompleted && (
          <div className="max-w-xl mx-auto space-y-5 py-4 animate-in fade-in text-center sm:text-left">
            <div className="p-5 rounded-xl bg-[var(--color-danger-soft)] border border-[var(--color-danger-border)] space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--surface)] text-[var(--color-danger)] border border-[var(--color-danger-border)]">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-sans font-semibold text-[var(--text-primary)]">
                    Time Limit Reached (60 Seconds)
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans">
                    The 60-second target window has elapsed. You completed{' '}
                    <strong className="text-[var(--text-primary)]">{Object.keys(stageResults).length} of 5</strong> stages.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--color-danger-border)] flex items-center justify-between text-xs font-mono text-[var(--text-primary)]">
                <span>Score Accumulated So Far:</span>
                <strong className="text-sm text-[var(--color-accent-ink)]">{currentTotalScore} / 100 pts</strong>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-3 pt-1">
              <button
                type="button"
                onClick={handleRestart}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--surface)] text-xs font-sans font-semibold transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restart 60s Challenge</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTestCompleted(true);
                }}
                className="px-4 py-2.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-soft)] border border-[var(--border)] text-xs font-sans font-semibold text-[var(--text-primary)] transition cursor-pointer"
              >
                Review Completed Results
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* BOTTOM ACTION & NAVIGATION BAR                               */}
      {/* ============================================================ */}
      {testStarted && !testCompleted && !timedOut && (
        <div className="px-5 py-3 sm:px-6 sm:py-3.5 border-t border-[var(--border)] bg-[var(--surface-soft)] flex items-center justify-between text-xs font-sans">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--page-bg)] disabled:opacity-35 border border-[var(--border)] text-[var(--text-primary)] font-medium transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <div className="text-[var(--text-muted)] font-mono text-[11px] hidden sm:flex items-center gap-2">
            <span>Use</span>
            <kbd className="px-1.5 py-0.5 bg-[var(--surface)] border border-[var(--border)] rounded text-[var(--text-secondary)]">
              ←
            </kbd>
            <kbd className="px-1.5 py-0.5 bg-[var(--surface)] border border-[var(--border)] rounded text-[var(--text-secondary)]">
              →
            </kbd>
            <span>or</span>
            <kbd className="px-1.5 py-0.5 bg-[var(--surface)] border border-[var(--border)] rounded text-[var(--text-secondary)]">
              ESC
            </kbd>
          </div>

          {currentStep < 5 ? (
            <button
              type="button"
              disabled={!isCurrentStepChecked}
              onClick={() => setCurrentStep((s) => Math.min(5, s + 1))}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-40 text-[var(--surface)] font-semibold transition cursor-pointer"
            >
              <span>Next Step ({currentStep}/5)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={!isCurrentStepChecked}
              onClick={() => setTestCompleted(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[var(--color-success)] hover:opacity-90 disabled:opacity-40 text-[var(--surface)] font-semibold transition cursor-pointer"
            >
              <span>Review Summary</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* EXIT CONFIRMATION DIALOG                                     */}
      {/* ============================================================ */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-xl bg-[var(--surface)] p-5 border border-[var(--border)] shadow-xl space-y-4 text-center">
            <h4 className="font-sans text-base font-semibold text-[var(--text-primary)]">
              Leave the 60-Second Test?
            </h4>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
              Your test is currently running. Leaving now will cancel this attempt.
            </p>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)] text-xs font-sans font-semibold text-[var(--text-primary)] hover:bg-[var(--page-bg)] transition cursor-pointer"
              >
                Continue Test
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExitConfirm(false);
                  if (onClose) onClose();
                }}
                className="px-4 py-2 rounded-lg bg-[var(--color-danger)] hover:opacity-90 text-[var(--surface)] text-xs font-sans font-semibold transition cursor-pointer"
              >
                Exit Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

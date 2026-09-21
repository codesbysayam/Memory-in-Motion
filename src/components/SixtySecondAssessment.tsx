import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Flame,
  Binary,
  RotateCcw,
  Sparkles,
  Award,
  Play,
  Pause,
  ArrowRight,
  ArrowLeft,
  X,
  HelpCircle,
  BarChart3,
  Layers,
  ChevronRight,
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

  return (
    <div
      className={`w-full font-sans text-[#252525] ${
        isModal
          ? 'max-w-4xl mx-auto rounded-2xl border border-[#D8D5CC] bg-[#FFFFFF] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]'
          : 'rounded-2xl border border-[#E2DFD6] bg-[#FFFFFF] shadow-sm overflow-hidden'
      }`}
    >
      {/* ============================================================ */}
      {/* TOP HEADER: Clean Academic Bar                              */}
      {/* ============================================================ */}
      <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-b border-[#E6E3DB] bg-[#FAF8F5] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#EAF2F8] border border-[#BDD9ED] text-[#1B4D7E]">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#1B4D7E] font-bold">
                60-SECOND FAST VERIFICATION
              </span>
              <EvidenceStrip type="live" detail="Real associative fast-weight engine" />
            </div>
            <h2 className="text-sm sm:text-base font-serif font-bold text-[#191919] mt-0.5">
              {testStarted
                ? `${STEPS[currentStep - 1].label} · ${STEPS[currentStep - 1].title}`
                : 'Interactive Mechanistic Assessment'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {testStarted && !testCompleted && !timedOut && (
            <>
              {/* Auto-Pace Toggle */}
              <button
                type="button"
                onClick={() => setAutoPace((p) => !p)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-sans transition border cursor-pointer ${
                  autoPace
                    ? 'bg-[#EBF5EF] border-[#A2D3B4] text-[#185E38] font-bold'
                    : 'bg-[#FFFFFF] border-[#DCD9D0] text-[#55524B] hover:border-[#B5B2A9]'
                }`}
                title="When active, advances 1.5s after checking an answer"
              >
                {autoPace ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span className="hidden sm:inline">Auto-Pace: {autoPace ? 'On' : 'Off'}</span>
              </button>

              {/* Real Continuous Timer Display */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FFFFFF] border border-[#D5D2C9] text-xs font-mono">
                <span className="text-[#726F67]">Elapsed:</span>
                <strong
                  className={`font-bold ${
                    timer.elapsedMs <= 45000
                      ? 'text-[#1B4D7E]'
                      : timer.elapsedMs <= 55000
                      ? 'text-[#9A5C0E]'
                      : 'text-[#9C1C1C]'
                  }`}
                >
                  {formattedSecondsInt < 10 ? `0${formattedSecondsInt}` : formattedSecondsInt}s
                </strong>
                <span className="text-[#8E8B83]">/ 60s target</span>
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
              className="p-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F2EFE9] border border-[#D5D2C9] text-[#605D56] hover:text-[#191919] transition cursor-pointer"
              aria-label="Close"
              title="Close assessment"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5-STAGE PROGRESS TIMELINE (Active during test)               */}
      {/* ============================================================ */}
      {testStarted && (
        <div className="grid grid-cols-5 border-b border-[#E6E3DB] bg-[#F7F5F0] text-xs font-mono">
          {STEPS.map((st) => {
            const isDone = stageResults[st.index] !== undefined;
            const isCurrent = currentStep === st.index;
            const isLocked = !isDone && !isCurrent;

            let tabClass = 'bg-transparent text-[#8C8A82] cursor-not-allowed';
            if (isCurrent) {
              tabClass = 'bg-[#EBF3FB] text-[#164776] border-b-2 border-b-[#1D5E99] font-bold';
            } else if (isDone) {
              tabClass =
                'bg-[#F0F7F2] text-[#1E6B43] border-b-2 border-b-[#4BAE76] hover:bg-[#E8F3EB] cursor-pointer';
            }

            return (
              <button
                key={st.index}
                type="button"
                disabled={isLocked}
                onClick={() => {
                  if (!isLocked) setCurrentStep(st.index);
                }}
                className={`py-2 px-2 text-center border-r border-[#E6E3DB] last:border-r-0 transition-all relative ${tabClass}`}
              >
                <div className="text-[10px] tracking-wider opacity-85">{st.label}</div>
                <div className="truncate text-xs hidden sm:block mt-0.5">{st.shortTitle}</div>
                <div className="text-[9px] text-[#8C8A82] font-mono hidden md:block">
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
      <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">
        {/* ------------------------------------------------------------ */}
        {/* START SCREEN                                                 */}
        {/* ------------------------------------------------------------ */}
        {!testStarted && !testCompleted && !timedOut && (
          <div className="max-w-2xl mx-auto space-y-6 py-4 animate-in fade-in">
            <div className="space-y-3 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF3FB] border border-[#BFDBF1] text-xs font-mono text-[#184877] font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                EMPIRICAL VERIFICATION PROTOCOL
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#151515] tracking-tight">
                Can you predict, break, trace and explain a fixed-size recurrent memory?
              </h3>
              <p className="text-sm sm:text-base text-[#525049] leading-relaxed">
                Take the genuine 5-stage assessment. Every answer is evaluated against real matrix
                calculations from the educational fast-weight engine.
              </p>
            </div>

            {/* 5 Stages Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
              <div className="p-3.5 rounded-xl border border-[#E3E0D7] bg-[#FAF9F6] space-y-1">
                <strong className="text-[#191919] font-serif text-sm block">1. Remember (~12s)</strong>
                <p className="text-[#605D56] leading-relaxed">
                  Verify query readout for an association stored in a compact fixed-size matrix.
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-[#E3E0D7] bg-[#FAF9F6] space-y-1">
                <strong className="text-[#191919] font-serif text-sm block">2. Break It (~24s)</strong>
                <p className="text-[#605D56] leading-relaxed">
                  Write competing distractor facts and probe the onset of representational crosstalk.
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-[#E3E0D7] bg-[#FAF9F6] space-y-1">
                <strong className="text-[#191919] font-serif text-sm block">3. Trace It (~36s)</strong>
                <p className="text-[#605D56] leading-relaxed">
                  Inspect exact coordinate deltas and Frobenius norm energy drift between snapshots.
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-[#E3E0D7] bg-[#FAF9F6] space-y-1">
                <strong className="text-[#191919] font-serif text-sm block">4. Measure It (~48s)</strong>
                <p className="text-[#605D56] leading-relaxed">
                  Predict how dimension capacity D affects quasi-orthogonal separation and margin.
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-[#E3E0D7] bg-[#FAF9F6] space-y-1 sm:col-span-2">
                <strong className="text-[#191919] font-serif text-sm block">5. BDH Synthesis (~60s)</strong>
                <p className="text-[#605D56] leading-relaxed">
                  Connect fixed recurrent state principles to synaptic plasticity in the Dragon
                  Hatchling architecture.
                </p>
              </div>
            </div>

            {/* Scientific Honesty Notice */}
            <div className="p-3.5 rounded-xl bg-[#F6F4EF] border border-[#E5E2D8] flex items-start gap-2.5 text-xs text-[#5E5B53]">
              <HelpCircle className="w-4 h-4 text-[#8C887E] shrink-0 mt-0.5" />
              <div>
                <strong>Educational Toy Computation:</strong> This assessment evaluates your
                understanding using an associative linear fast-weight model. It illustrates
                fixed-state recurrence; it is not the full official BDH PyTorch graph implementation.
              </div>
            </div>

            {/* Start CTA Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-[#706D65] font-mono">
                5 Stages · 20 Pts Each · 60s Target Pacing
              </div>
              <button
                type="button"
                onClick={handleStartTest}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#1B4D7E] hover:bg-[#153E65] text-white font-sans text-sm font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Start Test</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Past Attempts History (if available) */}
            {testAttempts.length > 0 && (
              <div className="pt-4 border-t border-[#E8E5DC] space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#737068] font-bold block">
                  Previous Session Attempts
                </span>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {testAttempts.slice(0, 3).map((att) => (
                    <div
                      key={att.id}
                      className="p-2.5 rounded-lg bg-[#FAF9F6] border border-[#E8E5DD] flex items-center justify-between text-xs font-mono text-[#525049]"
                    >
                      <div className="flex items-center gap-2">
                        <span className={att.score >= 80 ? 'text-[#1E6B43] font-bold' : 'text-[#8E5311]'}>
                          {att.score}/100 Pts
                        </span>
                        <span>·</span>
                        <span>{(att.elapsedMs / 1000).toFixed(1)}s</span>
                      </div>
                      <span className="text-[#88857D] text-[11px]">
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
        {/* STEP 01: REMEMBER                                            */}
        {/* ------------------------------------------------------------ */}
        {testStarted && currentStep === 1 && !testCompleted && !timedOut && (
          <div className="space-y-5 animate-in fade-in">
            {/* Context Box */}
            <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E3DFD5] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-[#1B4D7E] font-bold tracking-wider">
                  TEST 1: FIXED-SIZE RETRIEVAL FIDELITY
                </span>
                <span className="text-[11px] font-mono text-[#185E38] bg-[#EAF5EF] border border-[#BDE3CC] px-2 py-0.5 rounded">
                  State: D=16 Matrix (256 Floats)
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#4E4B43] font-sans leading-relaxed">
                The model sequentially stored 3 facts into a fixed-size state matrix (<InlineMath math="M \in \mathbb{R}^{16 \times 16}" />):
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {INITIAL_FACTS.map((f) => (
                  <span
                    key={f.key}
                    className="px-2.5 py-1 rounded-md bg-[#FFFFFF] border border-[#DDD9CF] text-xs font-mono text-[#2B2925]"
                  >
                    <strong>{f.key}</strong> → {f.value}
                  </span>
                ))}
              </div>
            </div>

            {/* Question */}
            <div className="space-y-3">
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#191919]">
                Which value should the memory retrieve when the query key is "Japan"?
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {['Tokyo', 'Paris', 'Brasília'].map((optionVal) => {
                  const isSelected = step1Answer === optionVal;
                  let btnStyle =
                    'bg-[#FFFFFF] border-[#DCD9D0] text-[#302E29] hover:border-[#B5B1A6]';
                  if (isSelected) {
                    btnStyle = 'bg-[#EBF3FB] border-[#1D5E99] text-[#154676] font-bold ring-1 ring-[#1D5E99]';
                  }

                  return (
                    <button
                      key={optionVal}
                      type="button"
                      disabled={step1Checked}
                      onClick={() => setStep1Answer(optionVal)}
                      className={`p-3 rounded-xl border text-sm font-sans transition text-center cursor-pointer ${btnStyle}`}
                    >
                      {optionVal}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Check Button & Results */}
            {!step1Checked ? (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  disabled={!step1Answer}
                  onClick={handleCheckStep1}
                  className="px-5 py-2 rounded-xl bg-[#1B4D7E] hover:bg-[#153E65] disabled:opacity-40 text-white font-sans text-xs font-bold transition shadow cursor-pointer"
                >
                  Check Answer
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                {/* Live Model Readout vs Ground Truth */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E3DFD5]">
                    <span className="text-[10px] text-[#716E66] uppercase block">Query Key</span>
                    <strong className="text-sm text-[#191919] mt-0.5 block">Japan</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E3DFD5]">
                    <span className="text-[10px] text-[#716E66] uppercase block">Ground Truth</span>
                    <strong className="text-sm text-[#191919] mt-0.5 block">{baseMemory.groundTruth}</strong>
                  </div>
                  <div
                    className={`p-3 rounded-xl border ${
                      stageResults[1]?.correct
                        ? 'bg-[#EAF5EF] border-[#B2DEC3] text-[#185E38]'
                        : 'bg-[#FDF1F1] border-[#F2C2C2] text-[#9A2222]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] uppercase">
                      <span>Model Readout</span>
                      <span className="font-bold">
                        {stageResults[1]?.correct ? '✓ MATCH (+20 PTS)' : '✗ INCORRECT'}
                      </span>
                    </div>
                    <strong className="text-sm mt-0.5 block">{baseMemory.queryRes.prediction}</strong>
                    <div className="text-[10px] mt-0.5 opacity-85">
                      Retrieval Score: {baseMemory.queryRes.retrievalScore.toFixed(3)} · Margin:{' '}
                      {baseMemory.queryRes.top1Margin.toFixed(3)}
                    </div>
                  </div>
                </div>

                {/* Feedback note */}
                <div
                  className={`p-3.5 rounded-xl border text-xs font-sans leading-relaxed ${
                    stageResults[1]?.correct
                      ? 'bg-[#EAF5EF] border-[#B2DEC3] text-[#185E38]'
                      : 'bg-[#FDF1F1] border-[#F2C2C2] text-[#9A2222]'
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
        {testStarted && currentStep === 2 && !testCompleted && !timedOut && (
          <div className="space-y-5 animate-in fade-in">
            {/* Header */}
            <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E3DFD5] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-[#9A5C0E] font-bold tracking-wider flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#C27313]" />
                  TEST 2: SUPERPOSITION & CAPACITY PRESSURE
                </span>
                <span className="text-[11px] font-mono text-[#716E66]">
                  State Capacity: D=16 Fixed
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#4E4B43] font-sans leading-relaxed">
                What happens when competing associations are superposed into the <em>exact same</em> 16×16 coordinate
                matrix? <strong>Add one or more distractor facts below</strong> to write their outer products into the state:
              </p>

              {/* Distractor buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
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
                          ? 'bg-[#EBF5EF] border-[#B0DEBF] text-[#1E6B43] font-bold'
                          : 'bg-[#FFFFFF] border-[#DCD9D0] text-[#302E29] hover:border-[#9A5C0E]'
                      }`}
                    >
                      <span>{isAdded ? '✓' : '+'}</span>
                      <span>{cand.key} → {cand.value}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question */}
            <div className="space-y-3">
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#191919]">
                Did adding competing information alter the retrieval score or readout for "Japan"?
              </h3>

              <div className="grid grid-cols-2 gap-3 max-w-sm">
                {[
                  { val: 'yes', label: 'Yes (Altered)' },
                  { val: 'no', label: 'No (Unchanged)' },
                ].map((opt) => {
                  const isSelected = step2Answer === opt.val;
                  let btnStyle =
                    'bg-[#FFFFFF] border-[#DCD9D0] text-[#302E29] hover:border-[#B5B1A6]';
                  if (isSelected) {
                    btnStyle = 'bg-[#EBF3FB] border-[#1D5E99] text-[#154676] font-bold ring-1 ring-[#1D5E99]';
                  }

                  return (
                    <button
                      key={opt.val}
                      type="button"
                      disabled={step2Checked}
                      onClick={() => setStep2Answer(opt.val as 'yes' | 'no')}
                      className={`p-3 rounded-xl border text-sm font-sans transition text-center cursor-pointer ${btnStyle}`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Probe Button & Live Engine Readout */}
            {!step2Checked ? (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  disabled={!step2Answer || addedDistractors.length === 0}
                  onClick={handleCheckStep2}
                  className="px-5 py-2 rounded-xl bg-[#1B4D7E] hover:bg-[#153E65] disabled:opacity-40 text-white font-sans text-xs font-bold transition shadow cursor-pointer"
                >
                  Run Probe & Evaluate
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                {/* Metric Delta Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E3DFD5]">
                    <span className="text-[10px] text-[#716E66] uppercase block">Target Query</span>
                    <strong className="text-sm text-[#191919] mt-0.5 block">Japan</strong>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E3DFD5]">
                    <span className="text-[10px] text-[#716E66] uppercase block">Distractors</span>
                    <strong className="text-sm text-[#9A5C0E] mt-0.5 block">
                      +{addedDistractors.length} Added
                    </strong>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E3DFD5]">
                    <span className="text-[10px] text-[#716E66] uppercase block">Retrieval Score Δ</span>
                    <strong
                      className={`text-sm mt-0.5 block ${
                        disturbedMemory.scoreDelta < 0 ? 'text-[#9A2222]' : 'text-[#185E38]'
                      }`}
                    >
                      {disturbedMemory.scoreDelta > 0 ? '+' : ''}
                      {disturbedMemory.scoreDelta.toFixed(3)}
                    </strong>
                  </div>

                  <div
                    className={`p-3 rounded-xl border ${
                      stageResults[2]?.correct
                        ? 'bg-[#EAF5EF] border-[#B2DEC3] text-[#185E38]'
                        : 'bg-[#FDF1F1] border-[#F2C2C2] text-[#9A2222]'
                    }`}
                  >
                    <span className="text-[10px] uppercase block">Assessment</span>
                    <strong className="text-sm mt-0.5 block">
                      {stageResults[2]?.correct ? '✓ PASS (+20 PTS)' : '✗ INCORRECT'}
                    </strong>
                  </div>
                </div>

                {/* Mechanistic Explanation */}
                <div className="p-3.5 rounded-xl bg-[#F6F4EF] border border-[#E5E2D8] text-xs text-[#4F4C44] space-y-1 font-sans leading-relaxed">
                  <strong>Empirical Observation:</strong>{' '}
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
            {/* Context & Snapshot Timeline */}
            <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E3DFD5] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-[#1B4D7E] font-bold tracking-wider">
                  TEST 3: MATRIX STATE FORENSICS & ENERGY DRIFT
                </span>
                <span className="text-[11px] font-mono text-[#716E66]">
                  Frobenius Norm ‖M‖_F: {disturbedMemory.finalFrobenius.toFixed(2)}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#4E4B43] font-sans leading-relaxed">
                Inspect the recorded sequence of state snapshots (<InlineMath math="t_0 \to t_N" />) from the actual memory history.
                Click any step to inspect the state at that moment in time:
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
                          ? 'bg-[#EBF3FB] border-[#1D5E99] text-[#154676] font-bold ring-1 ring-[#1D5E99]'
                          : 'bg-[#FFFFFF] border-[#DCD9D0] text-[#55524B] hover:border-[#8E8B83]'
                      }`}
                    >
                      <span>t={idx + 1}</span>
                      <span className="text-[#88857D] ml-1">({fact?.key || 'Fact'})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Numerical Matrix Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E3DFD5] space-y-1">
                <span className="text-[10px] text-[#716E66] uppercase block">
                  Largest Positive Change
                </span>
                <strong className="text-sm text-[#185E38] block">
                  +{disturbedMemory.maxPos.val.toFixed(3)}
                </strong>
                <span className="text-[11px] text-[#716E66]">
                  at coordinate [row {disturbedMemory.maxPos.r}, col {disturbedMemory.maxPos.c}]
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E3DFD5] space-y-1">
                <span className="text-[10px] text-[#716E66] uppercase block">
                  Largest Negative Shift
                </span>
                <strong className="text-sm text-[#9A2222] block">
                  {disturbedMemory.maxNeg.val.toFixed(3)}
                </strong>
                <span className="text-[11px] text-[#716E66]">
                  at coordinate [row {disturbedMemory.maxNeg.r}, col {disturbedMemory.maxNeg.c}]
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E3DFD5] space-y-1">
                <span className="text-[10px] text-[#716E66] uppercase block">
                  Mean Absolute Δ Coordinate
                </span>
                <strong className="text-sm text-[#191919] block">
                  {disturbedMemory.meanAbsDelta.toFixed(4)}
                </strong>
                <span className="text-[11px] text-[#716E66]">
                  across all 256 coordinates
                </span>
              </div>
            </div>

            {/* Question */}
            <div className="space-y-3">
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#191919]">
                What caused the coordinate drift between Initial M and Final M?
              </h3>

              <div className="space-y-2 text-xs sm:text-sm font-sans">
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
                    'bg-[#FFFFFF] border-[#DCD9D0] text-[#302E29] hover:border-[#B5B1A6]';
                  if (isSelected) {
                    cardStyle =
                      'bg-[#EBF3FB] border-[#1D5E99] text-[#154676] font-semibold ring-1 ring-[#1D5E99]';
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={step3Checked}
                      onClick={() => setStep3Answer(opt.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition flex items-start gap-3 cursor-pointer ${cardStyle}`}
                    >
                      <span className="w-5 h-5 rounded-md bg-[#F4F2EB] border border-[#DDD9CF] flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
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
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  disabled={!step3Answer}
                  onClick={handleCheckStep3}
                  className="px-5 py-2 rounded-xl bg-[#1B4D7E] hover:bg-[#153E65] disabled:opacity-40 text-white font-sans text-xs font-bold transition shadow cursor-pointer"
                >
                  Verify Hypothesis
                </button>
              </div>
            ) : (
              <div
                className={`p-3.5 rounded-xl border text-xs font-sans leading-relaxed ${
                  stageResults[3]?.correct
                    ? 'bg-[#EAF5EF] border-[#B2DEC3] text-[#185E38]'
                    : 'bg-[#FDF1F1] border-[#F2C2C2] text-[#9A2222]'
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
            {/* Header */}
            <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E3DFD5] space-y-2">
              <span className="text-xs font-mono uppercase text-[#1B4D7E] font-bold tracking-wider block">
                TEST 4: QUANTITATIVE CAPACITY PREDICTION
              </span>
              <p className="text-xs sm:text-sm text-[#4E4B43] font-sans leading-relaxed">
                Baseline setting: Dimension <InlineMath math="D=16" />, Retention <InlineMath math="\lambda=0.95" />, 5 facts stored.
                Predict how changing configuration will impact the likelihood of interference:
              </p>
            </div>

            {/* Hypothesis Options */}
            <div className="space-y-3">
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#191919]">
                Which condition should make interference more likely to occur?
              </h3>

              <div className="space-y-2 text-xs sm:text-sm font-sans">
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
                    'bg-[#FFFFFF] border-[#DCD9D0] text-[#302E29] hover:border-[#B5B1A6]';
                  if (isSelected) {
                    cardStyle =
                      'bg-[#EBF3FB] border-[#1D5E99] text-[#154676] font-semibold ring-1 ring-[#1D5E99]';
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={step4Checked}
                      onClick={() => setStep4Prediction(opt.id as 'A' | 'B' | 'C')}
                      className={`w-full text-left p-3.5 rounded-xl border transition flex items-start gap-3 cursor-pointer ${cardStyle}`}
                    >
                      <span className="w-5 h-5 rounded-md bg-[#F4F2EB] border border-[#DDD9CF] flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
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
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  disabled={!step4Prediction}
                  onClick={handleCheckStep4}
                  className="px-5 py-2 rounded-xl bg-[#1B4D7E] hover:bg-[#153E65] disabled:opacity-40 text-white font-sans text-xs font-bold transition shadow cursor-pointer"
                >
                  Run Measurement & Compare
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                {/* Quantitative Measurement Table */}
                <div className="rounded-xl border border-[#E3DFD5] overflow-hidden bg-[#FAF9F6] text-xs font-mono">
                  <div className="grid grid-cols-4 bg-[#F2EFE8] px-3.5 py-2 text-[#706D64] font-semibold border-b border-[#E3DFD5]">
                    <span>Dimension</span>
                    <span>Retrieval Score</span>
                    <span>Top-1 Margin</span>
                    <span>Predicted State</span>
                  </div>

                  {/* D=8 */}
                  <div className="grid grid-cols-4 px-3.5 py-2.5 border-b border-[#EBE8DF] bg-[#FDF5F5] text-[#8C1D1D]">
                    <span className="font-bold">D = 8 (Compressed)</span>
                    <span>{capacityComparison.compressed.score.toFixed(3)}</span>
                    <span className="font-bold">{capacityComparison.compressed.margin.toFixed(3)}</span>
                    <span>{capacityComparison.compressed.prediction}</span>
                  </div>

                  {/* D=16 */}
                  <div className="grid grid-cols-4 px-3.5 py-2.5 border-b border-[#EBE8DF] text-[#302E29]">
                    <span className="font-bold">D = 16 (Baseline)</span>
                    <span>{capacityComparison.baseline.score.toFixed(3)}</span>
                    <span>{capacityComparison.baseline.margin.toFixed(3)}</span>
                    <span>{capacityComparison.baseline.prediction}</span>
                  </div>

                  {/* D=32 */}
                  <div className="grid grid-cols-4 px-3.5 py-2.5 bg-[#F2F8F4] text-[#185E38]">
                    <span className="font-bold">D = 32 (Expanded)</span>
                    <span>{capacityComparison.expanded.score.toFixed(3)}</span>
                    <span className="font-bold">{capacityComparison.expanded.margin.toFixed(3)}</span>
                    <span>{capacityComparison.expanded.prediction}</span>
                  </div>
                </div>

                {/* Feedback */}
                <div
                  className={`p-3.5 rounded-xl border text-xs font-sans leading-relaxed ${
                    stageResults[4]?.correct
                      ? 'bg-[#EAF5EF] border-[#B2DEC3] text-[#185E38]'
                      : 'bg-[#FDF1F1] border-[#F2C2C2] text-[#9A2222]'
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
            {/* Header */}
            <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E3DFD5] space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#F1EBFB] border border-[#D9C6F5] text-[#552599] font-bold">
                  BDH ARCHITECTURAL SYNTHESIS
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#FAF2E6] border border-[#EAD5BA] text-[#8E5311] font-bold">
                  EDUCATIONAL ABSTRACTION
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#4E4B43] font-sans leading-relaxed">
                Connect your empirical observations of recurrent memory to modern architectures like Pathway's Dragon Hatchling (BDH):
              </p>
            </div>

            {/* Question 1 */}
            <div className="space-y-2.5">
              <h4 className="font-serif text-sm sm:text-base font-bold text-[#191919]">
                1. Which architectural idea is most closely related to what you observed in this experiment?
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans">
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
                      className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-start gap-2.5 ${
                        isSelected
                          ? 'bg-[#EBF3FB] border-[#1D5E99] text-[#154676] font-semibold ring-1 ring-[#1D5E99]'
                          : 'bg-[#FFFFFF] border-[#DCD9D0] text-[#302E29] hover:border-[#B5B1A6]'
                      }`}
                    >
                      <span className="w-5 h-5 rounded bg-[#F4F2EB] flex items-center justify-center font-mono font-bold shrink-0 text-[11px]">
                        {opt.id}
                      </span>
                      <span>{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question 2 */}
            <div className="space-y-2.5 pt-2">
              <h4 className="font-serif text-sm sm:text-base font-bold text-[#191919]">
                2. Why can a fixed-size recurrent representation still experience interference?
              </h4>
              <div className="space-y-2 text-xs font-sans">
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
                      className={`w-full p-3 rounded-xl border text-left transition cursor-pointer flex items-start gap-2.5 ${
                        isSelected
                          ? 'bg-[#EBF3FB] border-[#1D5E99] text-[#154676] font-semibold ring-1 ring-[#1D5E99]'
                          : 'bg-[#FFFFFF] border-[#DCD9D0] text-[#302E29] hover:border-[#B5B1A6]'
                      }`}
                    >
                      <span className="w-5 h-5 rounded bg-[#F4F2EB] flex items-center justify-center font-mono font-bold shrink-0 text-[11px]">
                        {opt.id}
                      </span>
                      <span>{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BDH Honesty Callout */}
            <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#E3DFD5] text-xs text-[#55524B] space-y-1 font-sans">
              <strong>Scientific Honesty Note:</strong> Your experiment is an educational associative-memory
              model. It illustrates the fixed-state and interference principle; it is not the official BDH
              implementation. BDH distributes state across a scale-free graph with dynamic synapses <InlineMath math="\sigma_{ij}" />.
            </div>

            {/* Finish Test Button */}
            {!step5Checked && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  disabled={!step5Answer1 || !step5Answer2}
                  onClick={handleCheckStep5}
                  className="px-6 py-2.5 rounded-xl bg-[#1E6B43] hover:bg-[#175635] disabled:opacity-40 text-white font-sans text-xs font-bold transition shadow cursor-pointer"
                >
                  Submit & Finish Test
                </button>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/* COMPLETION SCREEN: Final Assessment Results                  */}
        {/* ------------------------------------------------------------ */}
        {testCompleted && (
          <div className="max-w-2xl mx-auto space-y-6 py-2 animate-in fade-in">
            {/* Header Badge */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#FAF8F5] via-[#FFFFFF] to-[#F3F7F5] border border-[#D5DDD7] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#EAF5EF] border border-[#BDE3CC] text-[#1E6B43]">
                    <Award className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#1E6B43] font-bold">
                      VERIFICATION COMPLETE
                    </span>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#191919]">
                      60-Second Fast Assessment Results
                    </h3>
                  </div>
                </div>

                {/* Score badge */}
                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-mono font-bold text-[#1E6B43]">
                    {currentTotalScore} <span className="text-sm text-[#737068]">/ 100</span>
                  </div>
                  <span className="text-xs font-mono text-[#737068]">
                    Time: {formattedSeconds}s
                  </span>
                </div>
              </div>

              {/* Assessment Label */}
              <div className="pt-2 border-t border-[#E8E5DD] flex items-center justify-between text-xs font-sans">
                <span className="text-[#55524B]">Proficiency Evaluation:</span>
                <span
                  className={`font-bold px-2.5 py-0.5 rounded-full ${
                    currentTotalScore >= 80
                      ? 'bg-[#EAF5EF] text-[#1E6B43]'
                      : currentTotalScore >= 60
                      ? 'bg-[#FAF2E6] text-[#8E5311]'
                      : 'bg-[#FDF1F1] text-[#9A2222]'
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
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#706D65] font-bold block">
                Stage-by-Stage Performance Breakdown
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs font-mono">
                {STEPS.map((st) => {
                  const res = stageResults[st.index];
                  const pts = res?.points ?? 0;
                  const passed = pts >= 10;
                  return (
                    <div
                      key={st.index}
                      className={`p-3 rounded-xl border text-center space-y-1 ${
                        passed
                          ? 'bg-[#EAF5EF] border-[#BDE3CC] text-[#1E6B43]'
                          : 'bg-[#FDF1F1] border-[#F2C2C2] text-[#9A2222]'
                      }`}
                    >
                      <div className="text-[10px] opacity-80">{st.shortTitle}</div>
                      <div className="text-sm font-bold">{pts} / 20</div>
                      <div className="text-[10px]">{passed ? '✓ Passed' : '✗ Review'}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* What You Demonstrated Checklist */}
            <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E3DFD5] space-y-2.5">
              <span className="text-xs font-serif font-bold text-[#191919] block">
                Demonstrated Principles
              </span>
              <div className="space-y-1.5 text-xs text-[#4C4942]">
                <div className="flex items-center gap-2">
                  <span className={stageResults[1]?.correct ? 'text-[#1E6B43] font-bold' : 'text-[#8C887E]'}>
                    {stageResults[1]?.correct ? '✓' : '○'}
                  </span>
                  <span>Fixed-size memory carries information forward without growing a token tape.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={stageResults[2]?.correct ? 'text-[#1E6B43] font-bold' : 'text-[#8C887E]'}>
                    {stageResults[2]?.correct ? '✓' : '○'}
                  </span>
                  <span>Superposing competing facts causes coordinate crosstalk and narrows retrieval margin.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={stageResults[3]?.correct ? 'text-[#1E6B43] font-bold' : 'text-[#8C887E]'}>
                    {stageResults[3]?.correct ? '✓' : '○'}
                  </span>
                  <span>Coordinate drift and Frobenius energy changes can be mathematically inspected.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={stageResults[4]?.correct ? 'text-[#1E6B43] font-bold' : 'text-[#8C887E]'}>
                    {stageResults[4]?.correct ? '✓' : '○'}
                  </span>
                  <span>State dimension D directly governs quasi-orthogonal capacity limits.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={stageResults[5]?.correct ? 'text-[#1E6B43] font-bold' : 'text-[#8C887E]'}>
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
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FAF9F6] hover:bg-[#F2EFE8] border border-[#DCD9CF] text-xs font-sans font-semibold text-[#504D45] transition cursor-pointer"
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
                    className="px-3.5 py-2 rounded-xl bg-[#FAF9F6] hover:bg-[#F2EFE8] border border-[#DCD9CF] text-xs font-sans font-semibold text-[#302E28] transition cursor-pointer"
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
                    className="px-3.5 py-2 rounded-xl bg-[#FAF9F6] hover:bg-[#F2EFE8] border border-[#DCD9CF] text-xs font-sans font-semibold text-[#302E28] transition cursor-pointer"
                  >
                    BDH Architecture →
                  </button>
                )}
                {isModal && onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-[#1B4D7E] hover:bg-[#153E65] text-white text-xs font-sans font-bold transition cursor-pointer shadow"
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
            <div className="p-5 rounded-2xl bg-[#FFF8F8] border border-[#F5CACA] space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#FDF1F1] text-[#9A2222]">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-[#191919]">
                    Time Limit Reached (60 Seconds)
                  </h3>
                  <p className="text-xs text-[#6E6B62] font-sans">
                    The 60-second target window has elapsed. You completed{' '}
                    <strong>{Object.keys(stageResults).length} of 5</strong> stages.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#F2D7D7] flex items-center justify-between text-xs font-mono">
                <span>Score Accumulated So Far:</span>
                <strong className="text-sm text-[#1B4D7E]">{currentTotalScore} / 100 Pts</strong>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-3 pt-2">
              <button
                type="button"
                onClick={handleRestart}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B4D7E] hover:bg-[#153E65] text-white text-xs font-sans font-bold transition shadow cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restart 60s Challenge</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTestCompleted(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#FAF9F6] hover:bg-[#F2EFE8] border border-[#DCD9CF] text-xs font-sans font-semibold text-[#504D45] transition cursor-pointer"
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
        <div className="px-5 py-3 sm:px-6 sm:py-3.5 border-t border-[#E6E3DB] bg-[#FAF8F5] flex items-center justify-between text-xs font-sans">
          {/* Back Button */}
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F2EFE9] disabled:opacity-30 border border-[#D5D2C9] text-[#55524B] font-medium transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          {/* Keyboard hints */}
          <div className="text-[#8C887E] font-mono text-[11px] hidden sm:flex items-center gap-2">
            <span>Use</span>
            <kbd className="px-1.5 py-0.5 bg-[#FFFFFF] border border-[#D5D2C9] rounded text-[#4C4942]">
              ←
            </kbd>
            <kbd className="px-1.5 py-0.5 bg-[#FFFFFF] border border-[#D5D2C9] rounded text-[#4C4942]">
              →
            </kbd>
            <span>or</span>
            <kbd className="px-1.5 py-0.5 bg-[#FFFFFF] border border-[#D5D2C9] rounded text-[#4C4942]">
              ESC
            </kbd>
          </div>

          {/* Next Step / Finish Button */}
          {currentStep < 5 ? (
            <button
              type="button"
              disabled={!isCurrentStepChecked}
              onClick={() => setCurrentStep((s) => Math.min(5, s + 1))}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#1B4D7E] hover:bg-[#153E65] disabled:opacity-40 text-white font-bold transition shadow cursor-pointer"
            >
              <span>Next Step ({currentStep}/5)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={!isCurrentStepChecked}
              onClick={() => setTestCompleted(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#1E6B43] hover:bg-[#175635] disabled:opacity-40 text-white font-bold transition shadow cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 border border-[#D5D2C9] shadow-xl space-y-4 text-center">
            <h4 className="font-serif text-base font-bold text-[#191919]">
              Leave the 60-Second Test?
            </h4>
            <p className="text-xs text-[#605D55] font-sans leading-relaxed">
              Your test is currently running. Leaving now will cancel this attempt.
            </p>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 rounded-xl bg-[#FAF9F6] border border-[#D5D2C9] text-xs font-sans font-bold text-[#45423B] hover:bg-[#F2EFE8] transition cursor-pointer"
              >
                Continue Test
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExitConfirm(false);
                  if (onClose) onClose();
                }}
                className="px-4 py-2 rounded-xl bg-[#9A2222] hover:bg-[#7D1B1B] text-white text-xs font-sans font-bold transition cursor-pointer"
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

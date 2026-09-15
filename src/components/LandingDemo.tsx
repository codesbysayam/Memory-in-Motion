import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Plus,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Clock,
  ArrowDown,
  Sliders,
  Sparkles,
  Info,
  Maximize2,
  Activity,
  Layers,
  Gauge,
} from 'lucide-react';
import { Fact, createAssociativeMemory, vector, norm, dot, cosine } from '../models/associativeMemory';
import { InlineMath, BlockMath, FormattedMathText } from './ui/MathView';
import { ControlSlider } from './ui/ControlSlider';
import { useExperiment } from '../context/ExperimentContext';
import { DebugPanel } from './DebugPanel';

interface LandingDemoProps {
  onExploreClick?: () => void;
  onStartJudgeMode?: () => void;
}

export type CandidateAffinity = {
  value: string;
  score: number;
};

export type ProbeEvaluation = {
  vector: number[];
  prediction: string;
  retrievalScore: number;
  top1Margin: number;
  candidates: CandidateAffinity[];
  groundTruth: string;
  isCorrect: boolean;
  isInterference: boolean;
  status: 'Correct' | 'Interference' | 'Unknown';
};

export type ExperimentSnapshot = {
  step: number;
  input: Fact | null;
  state: number[];
  matrix: number[][];
  prediction: string;
  retrievalScore: number;
  top1Margin: number;
};

export type ExperimentState = {
  facts: Fact[];
  step: number;
  matrix: number[][];
  state: number[];
  history: ExperimentSnapshot[];
  activeProbe: string;
  evaluation: ProbeEvaluation;
};

export const INITIAL_FACTS: Fact[] = [
  { key: 'Japan', value: 'Tokyo' },
  { key: 'France', value: 'Paris' },
  { key: 'Brazil', value: 'Brasília' },
];

export const CANONICAL_DISTRACTORS: Fact[] = [
  { key: 'Egypt', value: 'Cairo' },
  { key: 'Germany', value: 'Berlin' },
  { key: 'Kenya', value: 'Nairobi' },
  { key: 'Canada', value: 'Ottawa' },
  { key: 'India', value: 'New Delhi' },
  { key: 'Australia', value: 'Canberra' },
  { key: 'Argentina', value: 'Buenos Aires' },
  { key: 'South Korea', value: 'Seoul' },
  { key: 'Mexico', value: 'Mexico City' },
];

export const QUICK_PRESETS: Fact[] = [
  { key: 'Italy', value: 'Rome' },
  { key: 'Spain', value: 'Madrid' },
  { key: 'Norway', value: 'Oslo' },
  { key: 'Peru', value: 'Lima' },
];

/**
 * Deterministic probe evaluation against the CURRENT memory matrix M \in R^(d x d).
 * Does not mutate matrix or history.
 */
export function evaluateProbe(
  matrix: number[][],
  facts: Fact[],
  key: string,
  dim: number,
  noise = 0
): ProbeEvaluation {
  if (!key || facts.length === 0 || !matrix || matrix.length === 0) {
    return {
      vector: Array(dim).fill(0),
      prediction: 'UNKNOWN',
      retrievalScore: 0,
      top1Margin: 0,
      candidates: [],
      groundTruth: 'UNKNOWN',
      isCorrect: false,
      isInterference: false,
      status: 'Unknown',
    };
  }

  // 1. Query vector q \in R^d
  let q = vector(key, dim);
  if (noise > 0) {
    const perturbation = vector(`perturb:${key}`, dim);
    q = q.map((x, i) => x * (1 - noise) + (perturbation[i] || 0) * noise);
    const qn = norm(q) || 1;
    q = q.map((x) => x / qn);
  }

  // 2. Projected readout: \hat{v}_j = \sum_{i} q_i M_{ij}
  const retrieved = Array(dim).fill(0);
  for (let j = 0; j < dim; j++) {
    for (let i = 0; i < dim; i++) {
      retrieved[j] += (q[i] || 0) * (matrix[i]?.[j] || 0);
    }
  }

  // 3. Candidate affinities across unique candidate values in experiment facts
  const uniqueCandidateValues = Array.from(new Set(facts.map((f) => f.value))).filter(Boolean);
  const candidates: CandidateAffinity[] = uniqueCandidateValues
    .map((val) => ({
      value: val,
      score: cosine(retrieved, vector(val, dim)),
    }))
    .sort((a, b) => b.score - a.score);

  const top = candidates[0];
  const second = candidates[1];
  const prediction = top?.value ?? 'UNKNOWN';
  const retrievalScore = top?.score ?? 0;
  const top1Margin = top && second ? top.score - second.score : (top ? top.score : 0);

  // 4. Ground truth strictly derived from active probe key in facts
  const match = facts.find((f) => f.key.trim().toLowerCase() === key.trim().toLowerCase());
  const groundTruth = match ? match.value : 'UNKNOWN';

  // 5. Status logic (Section 8)
  const isCorrect =
    prediction !== 'UNKNOWN' &&
    groundTruth !== 'UNKNOWN' &&
    prediction.trim().toLowerCase() === groundTruth.trim().toLowerCase();

  const isInterference =
    groundTruth !== 'UNKNOWN' &&
    prediction !== 'UNKNOWN' &&
    !isCorrect;

  const status: 'Correct' | 'Interference' | 'Unknown' =
    prediction === 'UNKNOWN'
      ? 'Unknown'
      : isCorrect
      ? 'Correct'
      : 'Interference';

  return {
    vector: retrieved,
    prediction,
    retrievalScore,
    top1Margin,
    candidates,
    groundTruth,
    isCorrect,
    isInterference,
    status,
  };
}

/**
 * Deterministically constructs an ExperimentState replay up to targetStep.
 */
export function buildExperimentState(
  facts: Fact[],
  activeProbe: string,
  targetStep: number,
  config: { dimension: number; retention: number; writeStrength: number; interference?: number }
): ExperimentState {
  const dim = Math.max(2, Math.min(64, config.dimension || 16));
  const retention = Math.max(0, Math.min(1, config.retention ?? 0.95));
  const writeStrength = Math.max(0.1, Math.min(2, config.writeStrength ?? 0.8));
  const noise = Math.max(0, Math.min(1, config.interference ?? 0));

  const validStep = Math.max(0, Math.min(targetStep, facts.length));
  let M: number[][] = Array.from({ length: dim }, () => Array(dim).fill(0));
  const history: ExperimentSnapshot[] = [];

  for (let s = 0; s < validStep; s++) {
    const fact = facts[s];
    const k = vector(fact.key, dim);
    const v = vector(fact.value, dim);

    const nextM = Array.from({ length: dim }, (_, i) =>
      Array.from({ length: dim }, (_, j) => (M[i]?.[j] || 0) * retention + writeStrength * (k[i] || 0) * (v[j] || 0))
    );

    const evalAtStep = evaluateProbe(nextM, facts, activeProbe, dim, noise);
    history.push({
      step: s + 1,
      input: fact,
      state: evalAtStep.vector,
      matrix: nextM,
      prediction: evalAtStep.prediction,
      retrievalScore: evalAtStep.retrievalScore,
      top1Margin: evalAtStep.top1Margin,
    });

    M = nextM;
  }

  const evaluation = evaluateProbe(M, facts, activeProbe, dim, noise);

  return {
    facts,
    step: validStep,
    matrix: M,
    state: evaluation.vector,
    history,
    activeProbe,
    evaluation,
  };
}

/**
 * Executes exactly ONE experiment transition step:
 * Determines next input -> writes rank-1 outer product -> updates M -> computes state -> evaluates probe -> returns new state.
 */
export function runStep(
  current: ExperimentState,
  config: { dimension: number; retention: number; writeStrength: number; interference?: number }
): ExperimentState {
  const dim = Math.max(2, Math.min(64, config.dimension || 16));
  const retention = Math.max(0, Math.min(1, config.retention ?? 0.95));
  const writeStrength = Math.max(0.1, Math.min(2, config.writeStrength ?? 0.8));
  const noise = Math.max(0, Math.min(1, config.interference ?? 0));

  let nextFact: Fact;
  let nextFacts = current.facts;

  if (current.step < current.facts.length) {
    nextFact = current.facts[current.step];
  } else {
    // All existing facts in stream written: pull next available distractor
    const existingKeys = new Set(current.facts.map((f) => f.key.toLowerCase()));
    const distractor = CANONICAL_DISTRACTORS.find((d) => !existingKeys.has(d.key.toLowerCase()));
    if (!distractor) {
      return current;
    }
    nextFact = distractor;
    nextFacts = [...current.facts, nextFact];
  }

  const nextStep = current.step + 1;
  const k = vector(nextFact.key, dim);
  const v = vector(nextFact.value, dim);

  const nextM = Array.from({ length: dim }, (_, i) =>
    Array.from({ length: dim }, (_, j) =>
      (current.matrix[i]?.[j] || 0) * retention + writeStrength * (k[i] || 0) * (v[j] || 0)
    )
  );

  const evaluation = evaluateProbe(nextM, nextFacts, current.activeProbe, dim, noise);

  const snapshot: ExperimentSnapshot = {
    step: nextStep,
    input: nextFact,
    state: evaluation.vector,
    matrix: nextM,
    prediction: evaluation.prediction,
    retrievalScore: evaluation.retrievalScore,
    top1Margin: evaluation.top1Margin,
  };

  return {
    facts: nextFacts,
    step: nextStep,
    matrix: nextM,
    state: evaluation.vector,
    history: [...current.history, snapshot],
    activeProbe: current.activeProbe,
    evaluation,
  };
}

export const LandingDemo: React.FC<LandingDemoProps> = ({
  onExploreClick,
  onStartJudgeMode,
}) => {
  // Global experiment configuration
  const { config, updateConfig } = useExperiment();
  const dim = config.dimension;
  const retention = config.retention;
  const writeStrength = config.writeStrength;
  const interferenceNoise = config.interference;

  // Single Source of Truth: Experiment State
  const [experiment, setExperiment] = useState<ExperimentState>(() => {
    return buildExperimentState(INITIAL_FACTS, 'Japan', INITIAL_FACTS.length, {
      dimension: config.dimension || 16,
      retention: config.retention ?? 0.95,
      writeStrength: config.writeStrength ?? 0.8,
      interference: config.interference ?? 0,
    });
  });

  // Custom fact input form controls
  const [customKey, setCustomKey] = useState<string>('');
  const [customValue, setCustomValue] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);

  // Stepping & execution animation state
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Interactive matrix & vector inspection with delta
  const [hoveredCell, setHoveredCell] = useState<{ r: number; c: number; val: number; delta: number } | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number; val: number; delta: number } | null>(null);
  const [hoveredVectorCoord, setHoveredVectorCoord] = useState<{ idx: number; val: number } | null>(null);
  const [selectedVectorCoord, setSelectedVectorCoord] = useState<{ idx: number; val: number } | null>(null);

  // Panel toggle state
  const [showConditions, setShowConditions] = useState<boolean>(false);

  // Ref to always access current config inside timer
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // Synchronize experiment when configuration sliders or presets change
  useEffect(() => {
    setExperiment((prev) => {
      return buildExperimentState(prev.facts, prev.activeProbe, prev.step, {
        dimension: dim,
        retention,
        writeStrength,
        interference: interferenceNoise,
      });
    });
  }, [dim, retention, writeStrength, interferenceNoise]);

  // Safely manage Auto-Play timer: executes the SAME real runStep function
  useEffect(() => {
    if (!isRunning) return;

    const intervalId = window.setInterval(() => {
      setExperiment((prev) => {
        if (prev.step >= prev.facts.length) {
          setIsRunning(false);
          return prev;
        }
        return runStep(prev, {
          dimension: configRef.current.dimension,
          retention: configRef.current.retention,
          writeStrength: configRef.current.writeStrength,
          interference: configRef.current.interference,
        });
      });
    }, 650);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isRunning]);

  // Developer diagnostics log (Section 16)
  useEffect(() => {
    console.log('[Recurrent Instrument State]', {
      factsCount: experiment.facts.length,
      step: experiment.step,
      activeProbe: experiment.activeProbe,
      groundTruth: experiment.evaluation.groundTruth,
      prediction: experiment.evaluation.prediction,
      retrievalScore: experiment.evaluation.retrievalScore.toFixed(3),
      top1Margin: experiment.evaluation.top1Margin.toFixed(3),
      status: experiment.evaluation.status,
    });
  }, [experiment]);

  // State matrix Frobenius norm: ||M||_F = sqrt(sum M_ij^2)
  const matrixNorm = useMemo(() => {
    let sum = 0;
    const M = experiment.matrix;
    for (let r = 0; r < M.length; r++) {
      for (let c = 0; c < (M[r]?.length || 0); c++) {
        const val = M[r][c] || 0;
        sum += val * val;
      }
    }
    return Math.sqrt(sum);
  }, [experiment.matrix]);

  // State vector Euclidean norm: ||v_hat||_2
  const vectorNorm = useMemo(() => {
    let sum = 0;
    const v = experiment.state;
    for (let i = 0; i < v.length; i++) {
      const val = v[i] || 0;
      sum += val * val;
    }
    return Math.sqrt(sum);
  }, [experiment.state]);

  // Compute delta for coordinate M[r, c] from previous step snapshot
  const getCellDelta = (r: number, c: number): number => {
    if (experiment.history.length < 1) return 0;
    if (experiment.history.length === 1 && experiment.step === 1) {
      return experiment.matrix[r]?.[c] || 0;
    }
    const prevMatrix = experiment.history[experiment.history.length - 2]?.matrix;
    if (!prevMatrix) return 0;
    const currentVal = experiment.matrix[r]?.[c] || 0;
    const prevVal = prevMatrix[r]?.[c] || 0;
    return currentVal - prevVal;
  };

  // Remaining canonical distractors not yet in the facts list
  const nextDistractor = useMemo(() => {
    const existingKeys = new Set(experiment.facts.map((f) => f.key.toLowerCase()));
    return CANONICAL_DISTRACTORS.find((d) => !existingKeys.has(d.key.toLowerCase())) || null;
  }, [experiment.facts]);

  // PRIMARY USER CONTROLS

  // Set active probe key (immediately evaluates on CURRENT matrix)
  const handleSetProbe = (newProbeKey: string) => {
    setExperiment((prev) => {
      const evaluation = evaluateProbe(prev.matrix, prev.facts, newProbeKey, dim, interferenceNoise);
      return {
        ...prev,
        activeProbe: newProbeKey,
        state: evaluation.vector,
        evaluation,
      };
    });
  };

  // Add Distractor: appends distractor and executes outer-product write step
  const handleAddDistractor = () => {
    if (!nextDistractor) return;
    setIsRunning(false);
    setExperiment((prev) => {
      const nextFacts = [...prev.facts, nextDistractor];
      return runStep(
        { ...prev, facts: nextFacts },
        { dimension: dim, retention, writeStrength, interference: interferenceNoise }
      );
    });
  };

  // Custom Fact Input submission: writes new fact into memory
  const handleAddCustomFact = (e: React.FormEvent) => {
    e.preventDefault();
    const k = customKey.trim();
    const v = customValue.trim();
    if (!k || !v) return;

    setIsRunning(false);
    setExperiment((prev) => {
      const existingIdx = prev.facts.findIndex((f) => f.key.toLowerCase() === k.toLowerCase());
      if (existingIdx >= 0) {
        const nextFacts = prev.facts.map((f, i) => (i === existingIdx ? { key: k, value: v } : f));
        return buildExperimentState(nextFacts, prev.activeProbe, prev.step, {
          dimension: dim,
          retention,
          writeStrength,
          interference: interferenceNoise,
        });
      } else {
        const nextFacts = [...prev.facts, { key: k, value: v }];
        return runStep(
          { ...prev, facts: nextFacts },
          { dimension: dim, retention, writeStrength, interference: interferenceNoise }
        );
      }
    });

    setCustomKey('');
    setCustomValue('');
    setShowCustomInput(false);
  };

  // Quick Preset Add
  const handleQuickAdd = (preset: Fact) => {
    setIsRunning(false);
    setExperiment((prev) => {
      if (prev.facts.some((f) => f.key.toLowerCase() === preset.key.toLowerCase())) {
        return prev;
      }
      const nextFacts = [...prev.facts, preset];
      return runStep(
        { ...prev, facts: nextFacts },
        { dimension: dim, retention, writeStrength, interference: interferenceNoise }
      );
    });
  };

  // Remove Fact: rebuilds memory from remaining facts
  const handleRemoveFact = (indexToRemove: number) => {
    if (experiment.facts.length <= 1) return;
    setIsRunning(false);
    setExperiment((prev) => {
      const removed = prev.facts[indexToRemove];
      const nextFacts = prev.facts.filter((_, idx) => idx !== indexToRemove);
      let nextProbe = prev.activeProbe;
      if (removed.key.toLowerCase() === prev.activeProbe.toLowerCase()) {
        nextProbe = nextFacts[0]?.key || '';
      }
      const nextStep = Math.min(prev.step, nextFacts.length);
      return buildExperimentState(nextFacts, nextProbe, nextStep, {
        dimension: dim,
        retention,
        writeStrength,
        interference: interferenceNoise,
      });
    });
  };

  // Reset to initial deterministic experiment state
  const handleReset = () => {
    setIsRunning(false);
    setSelectedCell(null);
    setHoveredCell(null);
    setSelectedVectorCoord(null);
    setHoveredVectorCoord(null);
    updateConfig({
      dimension: 16,
      retention: 0.95,
      writeStrength: 0.8,
      interference: 0,
      distractors: 2,
    });
    setExperiment(
      buildExperimentState(INITIAL_FACTS, 'Japan', INITIAL_FACTS.length, {
        dimension: 16,
        retention: 0.95,
        writeStrength: 0.8,
        interference: 0,
      })
    );
  };

  // Auto-Play: repeatedly executes the same real runStep function
  const handleTogglePlay = () => {
    if (isRunning) {
      setIsRunning(false);
    } else {
      if (experiment.step >= experiment.facts.length) {
        // Rewind to t=0 and play sequence from start
        setExperiment((prev) =>
          buildExperimentState(prev.facts, prev.activeProbe, 0, {
            dimension: dim,
            retention,
            writeStrength,
            interference: interferenceNoise,
          })
        );
      }
      setIsRunning(true);
    }
  };

  // Step: executes exactly ONE experiment transition
  const handleStepForward = () => {
    setIsRunning(false);
    setExperiment((prev) =>
      runStep(prev, {
        dimension: dim,
        retention,
        writeStrength,
        interference: interferenceNoise,
      })
    );
  };

  // Scenario Presets: genuinely triggers interference or high capacity conditions
  const applyConditionPreset = (preset: 'balanced' | 'capacity' | 'interference' | 'decay') => {
    switch (preset) {
      case 'balanced':
        updateConfig({
          dimension: 12,
          retention: 0.95,
          writeStrength: 0.8,
          interference: 0.0,
          distractors: 2,
        });
        break;
      case 'capacity':
        updateConfig({
          dimension: 24,
          retention: 0.98,
          writeStrength: 0.8,
          interference: 0.0,
          distractors: 4,
        });
        break;
      case 'interference':
        updateConfig({
          dimension: 6,
          retention: 0.90,
          writeStrength: 1.1,
          interference: 0.25,
          distractors: 4,
        });
        break;
      case 'decay':
        updateConfig({
          dimension: 12,
          retention: 0.55,
          writeStrength: 0.8,
          interference: 0.0,
          distractors: 2,
        });
        break;
    }
  };

  const activeInspectCell = selectedCell || hoveredCell;
  const activeVectorCoord = selectedVectorCoord || hoveredVectorCoord;

  return (
    <section
      id="landing-hero"
      className="w-full border-b border-[#D8D3C9] bg-[#F5F2EA] text-[#1C1B19] pt-10 pb-16 relative overflow-hidden"
    >
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        {/* Top Research Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-[#6842C2] bg-[#F3EFFF] px-3 py-1 rounded-full border border-[#E2D8FA] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#6842C2]" />
              STAGE 01 · FOUNDATIONAL EXPERIMENT
            </span>
            <span className="text-[11px] font-mono text-[#6B665E] hidden sm:inline">
              Associative Fast-Weight Recurrence
            </span>
          </div>

          <div className="flex items-center gap-3">
            {onStartJudgeMode && (
              <button
                type="button"
                onClick={onStartJudgeMode}
                className="btn btn-secondary text-xs"
              >
                <Clock className="w-3.5 h-3.5 text-[#31566E]" />
                <span>60s Guided Test</span>
              </button>
            )}
            <div className="font-mono text-[11px] text-[#403D38] bg-[#FFFFFF] border border-[#D8D3C9] px-2.5 py-1 rounded-md flex items-center gap-1">
              <InlineMath math={`M \\in \\mathbb{R}^{${dim} \\times ${dim}}`} />
            </div>
          </div>
        </div>

        {/* Framing Question & Editorial Statement */}
        <div className="max-w-3xl space-y-3">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#1C1B19] tracking-tight leading-[1.1]">
            Can a fixed-size state remember what matters?
          </h1>
          <p className="text-base sm:text-lg text-[#403D38] font-sans leading-relaxed">
            A recurrent system can carry information forward without storing every previous token.
            Instead of an unbounded KV cache, it stores facts in continuous state updates.
            Observe the live instrument below to see how superposition and decay govern retrieval.
          </p>
        </div>

        {/* THE HERO SCIENTIFIC INSTRUMENT */}
        {/* Instrumentation: DebugPanel Component Extracting Real Engine State */}
        <DebugPanel
          id="live-experiment-debug-panel"
          className="mb-6"
          activeFactsCount={experiment.facts.length}
          step={experiment.step}
          matrixNorm={matrixNorm}
          activeProbe={experiment.activeProbe}
          prediction={experiment.evaluation.prediction}
          groundTruth={experiment.evaluation.groundTruth}
          retrievalScore={experiment.evaluation.retrievalScore}
          top1Margin={experiment.evaluation.top1Margin}
          status={experiment.evaluation.status}
          mode="interactive"
        />

        <div className="rounded-2xl border border-[#D8D3C9] bg-[#FFFFFF] shadow-xs overflow-hidden">
          {/* Instrument Header Bar */}
          <div className="px-5 sm:px-7 py-4 border-b border-[#D8D3C9] bg-[#FAF8F3] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#245B38] animate-pulse" />
              <h2 className="font-serif font-bold text-base sm:text-lg text-[#1C1B19]">
                Live Recurrent Memory Instrument
              </h2>
              <span className="font-mono text-xs text-[#6B665E] hidden md:inline border-l border-[#D8D3C9] pl-2.5">
                <InlineMath math="M_{t+1} = \lambda M_t + \eta k_t v_t^\top" />
              </span>
            </div>

            {/* Primary Action Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowCustomInput((prev) => !prev)}
                className="btn btn-primary text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add fact</span>
              </button>

              <button
                type="button"
                onClick={handleTogglePlay}
                className={`btn ${isRunning ? 'btn-primary' : 'btn-secondary'} text-xs`}
                title={isRunning ? 'Pause playback' : 'Play sequence writes step-by-step'}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Auto-play</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleStepForward}
                className="btn btn-secondary text-xs"
                title="Step forward one fact write"
              >
                Step
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="btn btn-secondary p-1.5 min-h-[34px]"
                title="Reset memory instrument to initial state"
                aria-label="Reset memory"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 3-Column Instrument Grid: INPUT STREAM | CURRENT STATE | QUERY & RESULT */}
          <div className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* COLUMN 1: INPUT STREAM (4 Cols) */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-[#6B665E] font-semibold">
                  Input Stream ({experiment.step}/{experiment.facts.length} Written)
                </span>
                <button
                  type="button"
                  onClick={() => setShowCustomInput(!showCustomInput)}
                  className="text-xs font-sans font-medium text-[#31566E] hover:underline cursor-pointer"
                >
                  {showCustomInput ? 'Cancel' : '+ Custom Fact'}
                </button>
              </div>

              {/* Custom fact input form */}
              {showCustomInput && (
                <div className="p-3.5 rounded-xl bg-[#FAF8F3] border border-[#D8D3C9] space-y-2.5 text-xs font-sans">
                  <form onSubmit={handleAddCustomFact} className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Key (e.g. Spain)"
                        value={customKey}
                        onChange={(e) => setCustomKey(e.target.value)}
                        className="px-2.5 py-1.5 rounded-md border border-[#D8D3C9] bg-white text-[#1C1B19] font-mono text-xs focus:outline-none focus:border-[#31566E]"
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. Madrid)"
                        value={customValue}
                        onChange={(e) => setCustomValue(e.target.value)}
                        className="px-2.5 py-1.5 rounded-md border border-[#D8D3C9] bg-white text-[#1C1B19] font-mono text-xs focus:outline-none focus:border-[#31566E]"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!customKey.trim() || !customValue.trim()}
                        className="btn btn-primary text-xs py-1 px-3"
                      >
                        Insert into stream
                      </button>
                    </div>
                  </form>

                  {/* Quick Preset Buttons */}
                  <div className="pt-1.5 border-t border-[#E5E0D8]">
                    <span className="text-xs text-[#6B665E] block mb-1 font-mono">Quick presets:</span>
                    <div className="flex flex-wrap gap-1">
                      {QUICK_PRESETS.map((preset) => (
                        <button
                          key={preset.key}
                          type="button"
                          onClick={() => handleQuickAdd(preset)}
                          disabled={experiment.facts.some((f) => f.key.toLowerCase() === preset.key.toLowerCase())}
                          className="btn btn-secondary text-xs py-0.5 px-2 min-h-[26px]"
                        >
                          + {preset.key} → {preset.value}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Facts List */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {experiment.facts.map((fact, idx) => {
                  const isWritten = idx < experiment.step;
                  const isCurrentlyWriting = idx === experiment.step - 1 && isRunning;
                  const isTarget = fact.key.toLowerCase() === experiment.activeProbe.toLowerCase();

                  return (
                    <div
                      key={`${fact.key}-${idx}`}
                      className={`p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs ${
                        isCurrentlyWriting
                          ? 'border-[#245B38] bg-[#EBF7EE] text-[#1C1B19] shadow-xs'
                          : isTarget
                          ? 'border-[#31566E] bg-[#F4F8FA] text-[#1C1B19]'
                          : isWritten
                          ? 'border-[#D8D3C9] bg-[#FFFFFF] text-[#1C1B19]'
                          : 'border-[#E5E0D8] bg-[#FAF8F3] text-[#9E9A92] opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span
                          className={`w-5 h-5 rounded-full font-mono text-[10px] flex items-center justify-center font-bold ${
                            isCurrentlyWriting
                              ? 'bg-[#245B38] text-white animate-pulse'
                              : isWritten
                              ? 'bg-[#EFEBE0] text-[#1C1B19]'
                              : 'bg-transparent text-[#9E9A92] border border-[#D8D3C9]'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div className="truncate">
                          <span className="font-semibold text-[#1C1B19]">{fact.key}</span>
                          <span className="text-[#9E9A92] mx-1.5">→</span>
                          <span className={isTarget ? 'font-bold text-[#31566E]' : 'text-[#403D38]'}>
                            {fact.value}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {isTarget ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#31566E] text-white">
                            Probe
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetProbe(fact.key)}
                            className="btn btn-secondary text-xs py-0.5 px-2 min-h-[24px]"
                            title={`Set ${fact.key} as probe target`}
                          >
                            Probe
                          </button>
                        )}
                        {experiment.facts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveFact(idx)}
                            className="p-1 rounded text-[#9E9A92] hover:text-[#8A352E] transition-colors cursor-pointer"
                            title="Remove fact"
                            aria-label={`Remove fact ${fact.key}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Distractor Suggestion Bar */}
              {nextDistractor && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleAddDistractor}
                    className="btn btn-secondary w-full py-2 px-3 flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add distractor: {nextDistractor.key} → {nextDistractor.value}</span>
                  </button>
                </div>
              )}
            </div>

            {/* COLUMN 2: CURRENT STATE M & RETRIEVED VECTOR (4 Cols) */}
            <div className="lg:col-span-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-[#6B665E] font-semibold flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#6842C2]" />
                  Memory State <InlineMath math="M_t" /> (<InlineMath math={`t = ${experiment.step}`} />)
                </span>
                <span className="font-mono text-xs text-[#403D38] flex items-center gap-1">
                  <InlineMath math="\|M\|_F" /> = <strong>{matrixNorm.toFixed(3)}</strong>
                </span>
              </div>

              {/* Matrix Heatmap View */}
              <div className="p-3.5 rounded-xl border border-[#292D33] bg-[#0D0F12] text-[#F5F3EE] space-y-3 shadow-inner">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#C8C4BC]">
                  <span className="flex items-center gap-1">
                    <InlineMath math={`${dim} \\times ${dim}`} /> STATE MATRIX
                  </span>
                  <span>
                    <InlineMath math={`\\lambda = ${retention.toFixed(2)}`} />
                  </span>
                </div>

                {/* State Grid */}
                <div
                  className="grid gap-1 overflow-hidden select-none"
                  style={{
                    gridTemplateColumns: `repeat(${dim}, minmax(0, 1fr))`,
                  }}
                >
                  {experiment.matrix.map((row, rIdx) =>
                    row.map((val, cIdx) => {
                      const isPos = val >= 0;
                      const abs = Math.min(Math.abs(val) * 1.4, 1);
                      const bg = isPos
                        ? `rgba(104, 66, 194, ${Math.max(0.15, abs)})`
                        : `rgba(40, 124, 124, ${Math.max(0.15, abs)})`;

                      const isSelected = selectedCell?.r === rIdx && selectedCell?.c === cIdx;
                      const isHovered = hoveredCell?.r === rIdx && hoveredCell?.c === cIdx;

                      return (
                        <div
                          key={`${rIdx}-${cIdx}`}
                          style={{ backgroundColor: bg }}
                          onMouseEnter={() => {
                            const delta = getCellDelta(rIdx, cIdx);
                            setHoveredCell({ r: rIdx, c: cIdx, val, delta });
                          }}
                          onMouseLeave={() => setHoveredCell(null)}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedCell(null);
                            } else {
                              const delta = getCellDelta(rIdx, cIdx);
                              setSelectedCell({ r: rIdx, c: cIdx, val, delta });
                            }
                          }}
                          className={`aspect-square rounded-[2px] transition-all duration-150 border cursor-pointer ${
                            isSelected
                              ? 'border-yellow-400 ring-2 ring-yellow-400/80 z-10 scale-125'
                              : isHovered
                              ? 'border-white ring-1 ring-white/60 z-10 scale-110'
                              : 'border-white/10'
                          }`}
                        />
                      );
                    })
                  )}
                </div>

                {/* Interactive Cell Inspector Box */}
                {activeInspectCell ? (
                  <div className="p-2.5 rounded-lg bg-[#151922] border border-[#292D33] text-[11px] font-mono text-[#F5F3EE] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[#A78BFA] font-bold">
                        <InlineMath math={`M[${activeInspectCell.r}, ${activeInspectCell.c}]`} />
                      </span>
                      <span className="text-[10px] text-[#C8C4BC]">
                        {selectedCell ? '(Pinned)' : '(Hover)'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div>
                        <span className="text-[#9E9A92]">Value: </span>
                        <strong className="text-white">{activeInspectCell.val.toFixed(4)}</strong>
                      </div>
                      <div>
                        <span className="text-[#9E9A92]">&Delta;: </span>
                        <strong
                          className={
                            activeInspectCell.delta > 0.0001
                              ? 'text-emerald-400'
                              : activeInspectCell.delta < -0.0001
                              ? 'text-rose-400'
                              : 'text-slate-400'
                          }
                        >
                          {activeInspectCell.delta >= 0 ? `+${activeInspectCell.delta.toFixed(4)}` : activeInspectCell.delta.toFixed(4)}
                        </strong>
                      </div>
                    </div>
                    <div className="text-[10px] text-[#C8C4BC] font-sans">
                      {activeInspectCell.val > 0.05 ? (
                        <span className="text-emerald-300">Constructive associative weight strengthening key-value binding.</span>
                      ) : activeInspectCell.val < -0.05 ? (
                        <span className="text-rose-300">Negative interference coordinate from superimposed distractor projection.</span>
                      ) : (
                        <span className="text-slate-400">Near-zero coordinate in residual subspace.</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] font-mono text-[#9E9A92] text-center py-1">
                    Hover or click any matrix coordinate to inspect
                  </div>
                )}

                {/* Color Legend */}
                <div className="flex items-center justify-between text-[10px] font-mono text-[#C8C4BC] pt-1.5 border-t border-[#292D33]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-[#6842C2]" />
                    <span>Positive association</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-[#287C7C]" />
                    <span>Negative interference</span>
                  </div>
                </div>
              </div>

              {/* Retrieved State Vector Strip: v_hat = q^T M in R^d */}
              <div className="p-3.5 rounded-xl border border-[#292D33] bg-[#0D0F12] text-[#F5F3EE] space-y-2.5 shadow-inner">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#C8C4BC]">
                  <span className="flex items-center gap-1.5 font-bold text-[#A78BFA]">
                    <Activity className="w-3.5 h-3.5 text-[#A78BFA]" />
                    STATE VECTOR <InlineMath math="\hat{v} = q^\top M" />
                  </span>
                  <span className="text-[#C8C4BC]">
                    <InlineMath math="\|\hat{v}\|_2" /> = <strong className="text-white">{vectorNorm.toFixed(3)}</strong>
                  </span>
                </div>

                {/* Vector coordinates horizontal bar */}
                <div
                  className="grid gap-1 overflow-hidden select-none"
                  style={{
                    gridTemplateColumns: `repeat(${dim}, minmax(0, 1fr))`,
                  }}
                >
                  {experiment.state.map((val, idx) => {
                    const isPos = val >= 0;
                    const abs = Math.min(Math.abs(val) * 1.5, 1);
                    const bg = isPos
                      ? `rgba(167, 139, 250, ${Math.max(0.18, abs)})`
                      : `rgba(40, 124, 124, ${Math.max(0.18, abs)})`;

                    const isSelected = selectedVectorCoord?.idx === idx;
                    const isHovered = hoveredVectorCoord?.idx === idx;

                    return (
                      <div
                        key={`v-${idx}`}
                        style={{ backgroundColor: bg }}
                        onMouseEnter={() => setHoveredVectorCoord({ idx, val })}
                        onMouseLeave={() => setHoveredVectorCoord(null)}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedVectorCoord(null);
                          } else {
                            setSelectedVectorCoord({ idx, val });
                          }
                        }}
                        className={`h-6 rounded-[2px] transition-all duration-150 border cursor-pointer ${
                          isSelected
                            ? 'border-yellow-400 ring-2 ring-yellow-400/80 z-10 scale-110'
                            : isHovered
                            ? 'border-white ring-1 ring-white/60 z-10 scale-105'
                            : 'border-white/10'
                        }`}
                        title={`Coordinate j=${idx}: ${val.toFixed(4)}`}
                      />
                    );
                  })}
                </div>

                {/* Vector coordinate inspector feedback */}
                {activeVectorCoord ? (
                  <div className="p-2 rounded-lg bg-[#151922] border border-[#292D33] text-[11px] font-mono text-[#F5F3EE] flex items-center justify-between">
                    <span className="text-[#A78BFA] font-bold">
                      <InlineMath math={`\\hat{v}_{${activeVectorCoord.idx}} = ${activeVectorCoord.val.toFixed(4)}`} />
                    </span>
                    <span className="text-[10px] text-[#C8C4BC]">
                      {activeVectorCoord.val > 0.05 ? (
                        <span className="text-emerald-300">Aligned projection</span>
                      ) : activeVectorCoord.val < -0.05 ? (
                        <span className="text-rose-300">Interference component</span>
                      ) : (
                        <span className="text-slate-400">Null coordinate</span>
                      )}
                    </span>
                  </div>
                ) : (
                  <div className="text-[10px] font-mono text-[#9E9A92] text-center py-0.5">
                    Hover coordinate bar <InlineMath math="\hat{v}_j" /> (<InlineMath math={`j \\in [0, ${dim - 1}]`} />) to inspect
                  </div>
                )}
              </div>

              <div className="text-xs text-[#6B665E] font-sans leading-relaxed">
                <FormattedMathText text="Recurrent write accumulates outer-products $M_t = \lambda M_{t-1} + \eta k_t v_t^\top$. The query computes the projected state vector $\hat{v} = q^\top M$." />
              </div>
            </div>

            {/* COLUMN 3: QUERY & REAL-TIME RECOMPUTATION (4 Cols) */}
            <div className="lg:col-span-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-[#6B665E] font-semibold flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-[#6842C2]" />
                  Query & Model Output
                </span>
                <span className="text-xs font-sans text-[#6B665E]">
                  Target: <strong className="text-[#1C1B19]">{experiment.activeProbe}</strong>
                </span>
              </div>

              {/* Retrieval Card */}
              <div className="p-4 rounded-xl border border-[#D8D3C9] bg-[#FAF8F3] space-y-3.5 shadow-xs">
                {/* Probe selector */}
                <div className="space-y-1">
                  <label className="text-[11px] font-sans font-medium text-[#6B665E] block">
                    Active Probe Key (<InlineMath math="q = k_{\text{probe}}" />):
                  </label>
                  <div className="flex gap-1.5">
                    <select
                      value={experiment.activeProbe}
                      onChange={(e) => handleSetProbe(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-[#D8D3C9] bg-[#FFFFFF] text-[#1C1B19] font-sans text-xs font-semibold focus:outline-none focus:border-[#6842C2] cursor-pointer"
                    >
                      {experiment.facts.map((f) => (
                        <option key={f.key} value={f.key}>
                          {f.key} (Target: {f.value})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Ground Truth vs Computed Output */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#D8D3C9] space-y-0.5">
                    <div className="text-[10px] font-mono text-[#6B665E] uppercase font-semibold">
                      Ground Truth
                    </div>
                    <div className="font-serif font-bold text-sm text-[#1C1B19]">
                      {experiment.evaluation.groundTruth}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#D8D3C9] space-y-0.5">
                    <div className="text-[10px] font-mono text-[#6B665E] uppercase font-semibold">
                      Model Output
                    </div>
                    <div
                      className={`font-serif font-bold text-sm ${
                        experiment.evaluation.isCorrect ? 'text-[#247A4B]' : 'text-[#B64235]'
                      }`}
                    >
                      {experiment.evaluation.prediction}
                    </div>
                  </div>
                </div>

                {/* Empirical Metrics & Visual Gauges */}
                <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#D8D3C9] space-y-2.5 text-xs font-mono">
                  {/* Retrieval Score with Gauge */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[#6B665E]">
                        <span>Retrieval Score:</span>
                        <span
                          title="This score is computed from representation similarity. It is not a calibrated probability."
                          className="cursor-help"
                        >
                          <HelpCircle className="w-3 h-3 text-[#9E9A92]" />
                        </span>
                      </div>
                      <strong className="text-[#1C1B19]">
                        {experiment.evaluation.retrievalScore.toFixed(3)}
                      </strong>
                    </div>
                    {/* Visual Score Bar */}
                    <div className="w-full bg-[#E5E0D8] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#6842C2] transition-all duration-300"
                        style={{
                          width: `${Math.max(0, Math.min(100, Math.max(0, experiment.evaluation.retrievalScore) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Top-1 Margin with Gauge */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[#6B665E]">
                        <span>Top-1 Margin (<InlineMath math="\Delta s" />):</span>
                        <span
                          title="Difference between best candidate score and second-best candidate score: Δs = s_(1) - s_(2)."
                          className="cursor-help"
                        >
                          <HelpCircle className="w-3 h-3 text-[#9E9A92]" />
                        </span>
                      </div>
                      <strong
                        className={
                          experiment.evaluation.top1Margin >= 0.15
                            ? 'text-[#247A4B]'
                            : experiment.evaluation.top1Margin >= 0.05
                            ? 'text-amber-700'
                            : 'text-[#B64235]'
                        }
                      >
                        {experiment.evaluation.top1Margin.toFixed(3)}
                      </strong>
                    </div>
                    {/* Visual Margin Bar */}
                    <div className="w-full bg-[#E5E0D8] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          experiment.evaluation.top1Margin >= 0.15
                            ? 'bg-[#247A4B]'
                            : experiment.evaluation.top1Margin >= 0.05
                            ? 'bg-amber-500'
                            : 'bg-[#B64235]'
                        }`}
                        style={{
                          width: `${Math.max(0, Math.min(100, (experiment.evaluation.top1Margin / 0.5) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#E5E0D8]">
                    <span className="text-[#6B665E]">Empirical Status:</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 ${
                        experiment.evaluation.status === 'Correct'
                          ? 'bg-[#EAF5EF] text-[#247A4B] border border-[#CDEEDB]'
                          : experiment.evaluation.status === 'Interference'
                          ? 'bg-[#FDEDEC] text-[#B64235] border border-[#FADBD8]'
                          : 'bg-[#FAF8F3] text-[#6B665E] border border-[#D8D3C9]'
                      }`}
                    >
                      {experiment.evaluation.status === 'Correct' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-[#247A4B]" />
                          <span>Correct</span>
                        </>
                      ) : experiment.evaluation.status === 'Interference' ? (
                        <>
                          <AlertTriangle className="w-3 h-3 text-[#B64235]" />
                          <span>Interference</span>
                        </>
                      ) : (
                        <>
                          <HelpCircle className="w-3 h-3 text-[#6B665E]" />
                          <span>Unknown</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Candidate breakdown table */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono text-[#6B665E] uppercase tracking-wider font-semibold flex items-center justify-between">
                    <span>Candidate Affinities (<InlineMath math="\text{sim}(\hat{v}, v_c)" />)</span>
                    <span className="text-[9px] text-[#9E9A92]">{experiment.evaluation.candidates.length} candidates</span>
                  </div>
                  <div className="space-y-1 text-xs font-mono">
                    {experiment.evaluation.candidates.map((cand, cIdx) => (
                      <div
                        key={cand.value}
                        className="flex items-center justify-between py-1 px-2 rounded bg-white border border-[#E5E0D8]"
                      >
                        <span className="truncate flex items-center gap-1">
                          <span className="text-[#9E9A92] mr-1">{cIdx + 1}.</span>
                          <span
                            className={
                              cand.value === experiment.evaluation.prediction
                                ? 'font-bold text-[#6842C2]'
                                : cand.value === experiment.evaluation.groundTruth
                                ? 'font-semibold text-[#247A4B]'
                                : 'text-[#403D38]'
                            }
                          >
                            {cand.value}
                          </span>
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-[#E5E0D8] h-1.5 rounded-full overflow-hidden hidden sm:block">
                            <div
                              className={`h-full ${cand.score >= 0 ? 'bg-[#6842C2]' : 'bg-[#287C7C]'}`}
                              style={{ width: `${Math.max(0, Math.min(100, Math.abs(cand.score) * 100))}%` }}
                            />
                          </div>
                          <span className="text-[#6B665E] shrink-0 font-semibold w-12 text-right">
                            {cand.score.toFixed(3)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECONDARY CONTROLS (COLLAPSED UNDER "Change the conditions") */}
          <div className="border-t border-[#D8D3C9] bg-[#FAF8F3]">
            <button
              onClick={() => setShowConditions(!showConditions)}
              className="w-full px-5 sm:px-7 py-3.5 flex items-center justify-between text-xs font-sans font-semibold text-[#1C1B19] hover:bg-[#F3EFFF] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#6842C2]" />
                <span>Change the conditions</span>
                <span className="text-[#6B665E] font-normal text-[11px] hidden sm:inline">
                  (Dimension <InlineMath math="d" />, retention <InlineMath math="\lambda" />, write strength <InlineMath math="\eta" />, interference noise <InlineMath math="\sigma" />)
                </span>
              </div>
              <div className="flex items-center gap-1 text-[#6842C2]">
                <span className="text-xs">{showConditions ? 'Hide' : 'Configure Parameters'}</span>
                {showConditions ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </button>

            {showConditions && (
              <div className="p-5 sm:p-7 border-t border-[#D8D3C9] bg-[#FFFFFF] space-y-6 animate-in fade-in duration-200 text-xs font-sans">
                {/* Preset Scenarios Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-[#FAF8F3] border border-[#D8D3C9]">
                  <span className="font-mono text-xs text-[#6B665E] font-semibold">
                    Test scenarios:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyConditionPreset('balanced')}
                      className="btn btn-secondary text-xs py-1 px-2.5 min-h-[30px]"
                    >
                      Balanced (<InlineMath math="d=12, \lambda=0.95" />)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyConditionPreset('capacity')}
                      className="btn btn-secondary text-xs py-1 px-2.5 min-h-[30px]"
                    >
                      High capacity (<InlineMath math="d=24, \lambda=0.98" />)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyConditionPreset('interference')}
                      className="btn btn-secondary text-xs py-1 px-2.5 min-h-[30px] text-[#8A352E]"
                    >
                      Interference boundary (<InlineMath math="d=6, \sigma=0.25" />)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyConditionPreset('decay')}
                      className="btn btn-secondary text-xs py-1 px-2.5 min-h-[30px] text-[#B88728]"
                    >
                      Rapid decay (<InlineMath math="\lambda=0.55" />)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Dimension */}
                  <ControlSlider
                    label={<span>Dimension (<InlineMath math="d" />)</span>}
                    value={dim}
                    min={4}
                    max={32}
                    step={4}
                    unit="D"
                    description="Capacity bound ~ O(d). Lower dimensions trigger subspace interference."
                    onChange={(val) => updateConfig({ dimension: val })}
                    theme="light"
                  />

                  {/* Retention Rate (lambda) */}
                  <ControlSlider
                    label={<span>Retention (<InlineMath math="\lambda" />)</span>}
                    value={retention}
                    min={0.5}
                    max={1.0}
                    step={0.01}
                    formatValue={(v) => `${(v * 100).toFixed(0)}%`}
                    description="Decay applied at each step: M_t = \lambda M_{t-1} + \eta k_t v_t^\top."
                    onChange={(val) => updateConfig({ retention: val })}
                    theme="light"
                  />

                  {/* Write Strength (eta) */}
                  <ControlSlider
                    label={<span>Write Strength (<InlineMath math="\eta" />)</span>}
                    value={writeStrength}
                    min={0.2}
                    max={1.5}
                    step={0.05}
                    formatValue={(v) => v.toFixed(2)}
                    description="Scale factor of outer-product rank-1 updates."
                    onChange={(val) => updateConfig({ writeStrength: val })}
                    theme="light"
                  />

                  {/* Interference Noise */}
                  <ControlSlider
                    label={<span>Interference (<InlineMath math="\sigma" />)</span>}
                    value={interferenceNoise}
                    min={0.0}
                    max={0.8}
                    step={0.05}
                    formatValue={(v) => `${(v * 100).toFixed(0)}%`}
                    description="Query perturbation noise q = k_{probe} + \epsilon."
                    onChange={(val) => updateConfig({ interference: val })}
                    theme="light"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Anchor to Continue Down to Detailed Sections */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#D8D3C9]">
          <div className="text-xs sm:text-sm text-[#6B665E] font-sans">
            Next: Observe what happens when sequence length exceeds dimension capacity.
          </div>

          <button
            type="button"
            onClick={() => {
              if (onExploreClick) {
                onExploreClick();
              } else {
                const el = document.getElementById('section-01');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="btn btn-primary text-xs py-2.5 px-5"
          >
            <span>Explore the mechanism</span>
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};

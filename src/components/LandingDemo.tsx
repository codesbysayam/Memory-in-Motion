import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Plus,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sliders,
  Activity,
  Layers,
  Gauge,
  ArrowDown,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { Fact, vector, norm, cosine } from '../models/associativeMemory';
import { InlineMath, FormattedMathText } from './ui/MathView';
import { ControlSlider } from './ui/ControlSlider';
import { useExperiment } from '../context/ExperimentContext';
import { DebugPanel } from './DebugPanel';
import { FigureCaption } from './essay/FigureCaption';

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

  let q = vector(key, dim);
  if (noise > 0) {
    const perturbation = vector(`perturb:${key}`, dim);
    q = q.map((x, i) => x * (1 - noise) + (perturbation[i] || 0) * noise);
    const qn = norm(q) || 1;
    q = q.map((x) => x / qn);
  }

  const retrieved = Array(dim).fill(0);
  for (let j = 0; j < dim; j++) {
    for (let i = 0; i < dim; i++) {
      retrieved[j] += (q[i] || 0) * (matrix[i]?.[j] || 0);
    }
  }

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
  const top1Margin = top && second ? top.score - second.score : top ? top.score : 0;

  const match = facts.find((f) => f.key.trim().toLowerCase() === key.trim().toLowerCase());
  const groundTruth = match ? match.value : 'UNKNOWN';

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
 * Executes exactly ONE experiment transition step.
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
}) => {
  const reducedMotion = useReducedMotion();
  const { config, updateConfig } = useExperiment();
  const dim = config.dimension;
  const retention = config.retention;
  const writeStrength = config.writeStrength;
  const interferenceNoise = config.interference;

  const [experiment, setExperiment] = useState<ExperimentState>(() => {
    return buildExperimentState(INITIAL_FACTS, 'Japan', INITIAL_FACTS.length, {
      dimension: config.dimension || 16,
      retention: config.retention ?? 0.95,
      writeStrength: config.writeStrength ?? 0.8,
      interference: config.interference ?? 0,
    });
  });

  const [fieldLens, setFieldLens] = useState<'write' | 'mix' | 'read'>('mix');
  const [customKey, setCustomKey] = useState<string>('');
  const [customValue, setCustomValue] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [hoveredCell, setHoveredCell] = useState<{ r: number; c: number; val: number; delta: number } | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number; val: number; delta: number } | null>(null);
  const [hoveredVectorCoord, setHoveredVectorCoord] = useState<{ idx: number; val: number } | null>(null);
  const [selectedVectorCoord, setSelectedVectorCoord] = useState<{ idx: number; val: number } | null>(null);
  const [showConditions, setShowConditions] = useState<boolean>(false);

  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

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
    return () => window.clearInterval(intervalId);
  }, [isRunning]);

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

  const vectorNorm = useMemo(() => {
    let sum = 0;
    const v = experiment.state;
    for (let i = 0; i < v.length; i++) {
      const val = v[i] || 0;
      sum += val * val;
    }
    return Math.sqrt(sum);
  }, [experiment.state]);

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

  const nextDistractor = useMemo(() => {
    const existingKeys = new Set(experiment.facts.map((f) => f.key.toLowerCase()));
    return CANONICAL_DISTRACTORS.find((d) => !existingKeys.has(d.key.toLowerCase())) || null;
  }, [experiment.facts]);

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

  const handleTogglePlay = () => {
    if (isRunning) {
      setIsRunning(false);
    } else {
      if (experiment.step >= experiment.facts.length) {
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

  const applyConditionPreset = (preset: 'balanced' | 'capacity' | 'interference' | 'decay') => {
    switch (preset) {
      case 'balanced':
        updateConfig({ dimension: 12, retention: 0.95, writeStrength: 0.8, interference: 0.0, distractors: 2 });
        break;
      case 'capacity':
        updateConfig({ dimension: 24, retention: 0.98, writeStrength: 0.8, interference: 0.0, distractors: 4 });
        break;
      case 'interference':
        updateConfig({ dimension: 6, retention: 0.90, writeStrength: 1.1, interference: 0.25, distractors: 4 });
        break;
      case 'decay':
        updateConfig({ dimension: 12, retention: 0.55, writeStrength: 0.8, interference: 0.0, distractors: 2 });
        break;
    }
  };

  const activeInspectCell = selectedCell || hoveredCell;
  const activeVectorCoord = selectedVectorCoord || hoveredVectorCoord;

  // Compute grid sample (up to 8x8 visual projection of actual M) for the bespoke Cover Memory Field SVG
  const fieldGridSize = Math.min(8, dim);
  const latestFact = experiment.facts[Math.max(0, experiment.step - 1)] || INITIAL_FACTS[0];

  return (
    <section
      id="landing-hero"
      className="w-full bg-[var(--page-bg)] text-[var(--text-primary)]"
    >
      {/* ================================================================= */}
      {/* VIEWPORT 1: COVER QUESTION + CENTRAL INTERACTIVE MEMORY FIELD     */}
      {/* ================================================================= */}
      <div className="research-container pt-6 sm:pt-8 pb-8 sm:pb-10 space-y-6 sm:space-y-7 border-b border-[var(--mm-rule)]">
        {/* Asymmetric Left-Aligned Monumental Cover Masthead */}
        <div className="essay-stage-wide text-left space-y-3.5">
          <motion.p
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="essay-eyebrow text-[var(--mm-signal)]"
          >
            An interactive essay on in-context learning with recurrent memory
          </motion.p>

          <motion.h1
            initial={reducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="essay-cover-title"
          >
            What survives when memory cannot grow?
          </motion.h1>

          <motion.p
            initial={reducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="essay-lead"
          >
            A fixed-size recurrent state holds past facts in constant memory—until new impressions overlap in the exact same coordinates and rewrite what was already there.
          </motion.p>
        </div>

        {/* Single Central Interactive Memory Field Figure */}
        <motion.figure
          data-editorial-reveal="scale"
          initial={reducedMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="essay-stage-wide space-y-3"
        >
          <div className="border-y border-[var(--mm-rule)] bg-[var(--mm-paper-bright)] py-4 sm:py-5 px-4 sm:px-7 space-y-3.5">
            {/* Minimal Lens Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <span className="font-semibold text-[var(--mm-signal)]">MEMORY FIELD</span>
                <span className="text-[var(--mm-rule-strong)]">·</span>
                <span className="tabular-nums">
                  {experiment.step} facts in <InlineMath math={`\\mathbb{R}^{${dim} \\times ${dim}}`} />
                </span>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-1 border-b border-[var(--mm-rule)] max-w-full">
                {(
                  [
                    { id: 'write', label: '1. Write fact', short: '1. Write' },
                    { id: 'mix', label: '2. Superpose field', short: '2. Superpose' },
                    { id: 'read', label: '3. Probe readout', short: '3. Probe' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFieldLens(tab.id)}
                    className={`px-2 sm:px-2.5 py-1.5 text-[10.5px] sm:text-[11px] font-mono whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b-2 -mb-px ${
                      fieldLens === tab.id
                        ? 'border-[var(--mm-signal)] text-[var(--text-primary)] font-semibold'
                        : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <span className="sm:hidden">{tab.short}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Central SVG Memory Field Canvas */}
            <div className="w-full overflow-hidden">
              <svg
                viewBox="0 0 880 310"
                className="w-full max-h-[260px] mx-auto block select-none"
                role="img"
                aria-label="Interactive Memory Field showing incoming facts absorbed into fixed matrix coordinates and retrieved by query projection"
              >
                <defs>
                  <radialGradient id="fieldGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="var(--mm-signal)" stopOpacity="0.18" />
                    <stop offset="70%" stopColor="var(--mm-teal)" stopOpacity="0.06" />
                    <stop offset="100%" stopColor="var(--mm-paper-bright)" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Subtle Field Envelope */}
                <circle cx="440" cy="155" r="144" fill="url(#fieldGlow)" />

                {/* Left: Incoming Fact Stream Nodes */}
                <g opacity={fieldLens === 'read' ? 0.45 : 1}>
                  <text
                    x="32"
                    y="32"
                    fontSize="10.5"
                    fontFamily="var(--font-mono)"
                    fill="var(--text-muted)"
                    letterSpacing="0.08em"
                  >
                    INCOMING IMPRESSIONS ({experiment.step})
                  </text>
                  {experiment.facts.slice(0, 6).map((fact, idx) => {
                    const yPos = 60 + idx * 38;
                    const isWritten = idx < experiment.step;
                    const isTarget = fact.key.toLowerCase() === experiment.activeProbe.toLowerCase();
                    return (
                      <g
                        key={`${fact.key}-${idx}`}
                        className="cursor-pointer"
                        onClick={() => handleSetProbe(fact.key)}
                      >
                        <motion.line
                          x1="214"
                          y1={yPos}
                          x2="318"
                          y2={75 + (idx % 4) * 48}
                          initial={reducedMotion ? false : { pathLength: 0.2, opacity: 0.25 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{ duration: 0.55, delay: idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
                          stroke={
                            isTarget
                              ? 'var(--mm-signal)'
                              : isWritten
                              ? 'var(--mm-rule-strong)'
                              : 'var(--mm-rule)'
                          }
                          strokeWidth={isTarget ? 1.8 : 1}
                          strokeDasharray={isWritten ? undefined : '3 3'}
                          strokeOpacity={isWritten ? 0.78 : 0.4}
                        />
                        <circle
                          cx="40"
                          cy={yPos}
                          r={isTarget ? 5 : 3.5}
                          fill={isTarget ? 'var(--mm-signal)' : isWritten ? 'var(--mm-teal)' : 'var(--mm-rule-strong)'}
                        />
                        <text
                          x="54"
                          y={yPos + 4}
                          fontSize="12.5"
                          fontFamily="var(--font-sans)"
                          fontWeight={isTarget ? '600' : '500'}
                          fill={isTarget ? 'var(--mm-signal)' : 'var(--text-primary)'}
                        >
                          {fact.key} → {fact.value}
                        </text>
                      </g>
                    );
                  })}
                  {experiment.facts.length > 6 && (
                    <text
                      x="54"
                      y="292"
                      fontSize="11"
                      fontFamily="var(--font-mono)"
                      fill="var(--text-muted)"
                    >
                      +{experiment.facts.length - 6} more superposed facts
                    </text>
                  )}
                </g>

                {/* Center: Bounded Coordinate Field M ∈ R^(D×D) */}
                <g opacity={fieldLens === 'write' ? 0.72 : 1}>
                  <text
                    x="440"
                    y="24"
                    textAnchor="middle"
                    fontSize="10.5"
                    fontFamily="var(--font-mono)"
                    fill="var(--text-muted)"
                    letterSpacing="0.08em"
                  >
                    BOUNDED STATE M ∈ ℝ^({dim}×{dim}) · ‖M‖ = {matrixNorm.toFixed(2)}
                  </text>

                  {/* Field Bounding Frame */}
                  <rect
                    x="324"
                    y="40"
                    width="232"
                    height="232"
                    rx="4"
                    fill="var(--color-matrix-bg)"
                    stroke={fieldLens === 'mix' ? 'var(--mm-signal)' : 'var(--color-matrix-border)'}
                    strokeWidth={fieldLens === 'mix' ? 1.8 : 1}
                  />

                  {/* Deterministic Signed Amplitude Coordinates */}
                  {Array.from({ length: fieldGridSize }).map((_, r) =>
                    Array.from({ length: fieldGridSize }).map((__, c) => {
                      const val = experiment.matrix[r]?.[c] ?? 0;
                      const stepPx = 204 / fieldGridSize;
                      const cellSize = stepPx - 3;
                      const x = 338 + c * stepPx;
                      const y = 54 + r * stepPx;
                      const mag = Math.min(1, Math.abs(val) * 1.45);
                      const isPos = val >= 0;
                      const fill = isPos
                        ? `rgba(78, 134, 240, ${Math.max(0.14, mag * 0.92)})`
                        : `rgba(218, 98, 76, ${Math.max(0.14, mag * 0.92)})`;
                      return (
                        <g key={`${r}-${c}`}>
                          <motion.rect
                            x={x}
                            y={y}
                            width={cellSize}
                            height={cellSize}
                            rx="2"
                            fill={fill}
                            initial={false}
                            animate={{
                              opacity: mag > 0.02 ? 1 : 0.42,
                              scale: mag > 0.42 ? 1 : 0.94,
                            }}
                            transition={{
                              duration: reducedMotion ? 0 : 0.34,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                            style={{
                              transformBox: 'fill-box',
                              transformOrigin: 'center',
                              transition: 'fill 320ms cubic-bezier(0.22, 1, 0.36, 1)',
                            }}
                          />
                          {mag > 0.42 && (
                            <circle
                              cx={x + cellSize / 2}
                              cy={y + cellSize / 2}
                              r={Math.max(1.5, cellSize * 0.14 * mag)}
                              fill="rgba(255,255,255,0.75)"
                            />
                          )}
                        </g>
                      );
                    })
                  )}

                  <text
                    x="440"
                    y="294"
                    textAnchor="middle"
                    fontSize="10.5"
                    fontFamily="var(--font-mono)"
                    fill="var(--text-muted)"
                  >
                    Latest write: {latestFact.key} → {latestFact.value} (λ={retention.toFixed(2)})
                  </text>
                </g>

                {/* Right: Query Projection & What Survived */}
                <g opacity={fieldLens === 'write' ? 0.55 : 1}>
                  <text
                    x="622"
                    y="32"
                    fontSize="10.5"
                    fontFamily="var(--font-mono)"
                    fill="var(--text-muted)"
                    letterSpacing="0.08em"
                  >
                    PROBE READOUT (q = {experiment.activeProbe})
                  </text>

                  {/* Outgoing projection arcs */}
                  <motion.line
                    key={`${experiment.activeProbe}-${experiment.step}`}
                    x1="556"
                    y1="156"
                    x2="624"
                    y2="128"
                    initial={reducedMotion ? false : { pathLength: 0.1 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    stroke={experiment.evaluation.isCorrect ? 'var(--mm-teal)' : 'var(--mm-coral)'}
                    strokeWidth="2"
                  />

                  <text
                    x="628"
                    y="108"
                    fontSize="11"
                    fontFamily="var(--font-mono)"
                    fill="var(--text-muted)"
                  >
                    Predicted recall
                  </text>
                  <text
                    x="628"
                    y="138"
                    fontSize="28"
                    fontFamily="var(--font-display)"
                    fontWeight="400"
                    fill={experiment.evaluation.isCorrect ? 'var(--mm-teal)' : 'var(--mm-coral)'}
                  >
                    {experiment.evaluation.prediction}
                  </text>
                  <text
                    x="628"
                    y="162"
                    fontSize="12"
                    fontFamily="var(--font-sans)"
                    fill="var(--text-secondary)"
                  >
                    Expected: {experiment.evaluation.groundTruth}
                  </text>

                  {/* Candidate separation bars */}
                  {experiment.evaluation.candidates.slice(0, 4).map((cand, i) => {
                    const barY = 190 + i * 24;
                    const barW = Math.max(4, Math.min(180, Math.max(0, cand.score) * 180));
                    const isTop = i === 0;
                    return (
                      <g key={cand.value}>
                        <text
                          x="628"
                          y={barY + 10}
                          fontSize="11"
                          fontFamily="var(--font-mono)"
                          fill={isTop ? 'var(--text-primary)' : 'var(--text-muted)'}
                          fontWeight={isTop ? '600' : '400'}
                        >
                          {cand.value}
                        </text>
                        <rect
                          x="728"
                          y={barY + 2}
                          width={barW * 0.65}
                          height="8"
                          rx="1.5"
                          style={{ transition: 'width 340ms cubic-bezier(0.22, 1, 0.36, 1), fill 240ms ease' }}
                          fill={
                            isTop
                              ? experiment.evaluation.isCorrect
                                ? 'var(--mm-teal)'
                                : 'var(--mm-coral)'
                              : 'var(--mm-rule-strong)'
                          }
                        />
                        <text
                          x="856"
                          y={barY + 10}
                          textAnchor="end"
                          fontSize="10.5"
                          fontFamily="var(--font-mono)"
                          fill="var(--text-muted)"
                        >
                          {cand.score.toFixed(2)}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>

            <FigureCaption
              figureNumber="FIG. 0.1"
              caption="Bounded Memory Field projection (deterministic toy model)."
              description="Click any fact on the left to probe what survived superposition inside the fixed coordinate grid."
              source={`Deterministic ${dim}×${dim} toy associative computation · conceptual field projection`}
            />
          </div>
        </motion.figure>

        {/* Single Invitation */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="essay-stage-wide flex justify-center lg:justify-start pt-1"
        >
          <button
            type="button"
            onClick={() => {
              const tensionEl = document.getElementById('narrative-tension');
              if (tensionEl) {
                tensionEl.scrollIntoView({ behavior: 'smooth' });
              } else if (onExploreClick) {
                onExploreClick();
              }
            }}
            className="btn-primary px-6 py-3 text-sm"
          >
            <span>Begin reading</span>
            <ArrowDown className="w-4 h-4" />
          </button>
        </motion.div>
      </div>

      {/* ================================================================= */}
      {/* SCROLL 1: NARRATIVE TENSION (ARCHIVE vs BOUNDED FIELD)            */}
      {/* ================================================================= */}
      <div
        id="narrative-tension"
        className="research-container py-16 sm:py-20 space-y-10 border-b border-[var(--mm-rule)]"
      >
        <div className="essay-column text-center space-y-4">
          <h2 className="essay-section-title">
            Every new token widens an archive. A fixed state must absorb it in place.
          </h2>
          <p className="essay-lead mx-auto">
            Standard Transformers append every past key and value onto an expanding tape. Fixed-size recurrent models refuse to allocate more memory—so every new fact lands inside the same finite space.
          </p>
        </div>

        {/* Single Minimal Comparative Visual */}
        <div className="essay-stage-wide border-y border-[var(--mm-rule)] py-7 px-4 sm:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:divide-x divide-[var(--mm-rule)]">
          <div className="space-y-3 md:pr-4">
            <div className="flex items-baseline justify-between font-mono text-xs">
              <span className="text-[var(--mm-amber)] font-semibold">GROWING ARCHIVE · O(T)</span>
              <span className="text-[var(--text-muted)]">{experiment.facts.length} slots allocated</span>
            </div>
            <div className="flex flex-wrap gap-1.5 py-2">
              {experiment.facts.map((f, i) => (
                <span
                  key={`${f.key}-${i}`}
                  className="px-2 py-1 text-[11px] font-mono border border-[var(--mm-rule)] bg-[var(--mm-paper-bright)] text-[var(--text-primary)]"
                >
                  {f.key}→{f.value}
                </span>
              ))}
              <span className="px-2 py-1 text-[11px] font-mono border border-dashed border-[var(--mm-amber)] text-[var(--mm-amber)]">
                + next token...
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
              Verbatim retention never collides—at the cost of a cache that expands endlessly with context length.
            </p>
          </div>

          <div className="space-y-3 md:pl-8">
            <div className="flex items-baseline justify-between font-mono text-xs">
              <span className="text-[var(--mm-signal)] font-semibold">FIXED MEMORY FIELD · O(1)</span>
              <span className="text-[var(--text-muted)]">Always {dim}×{dim} coordinates</span>
            </div>
            <div className="py-2 flex items-center gap-4">
              <div
                className="grid gap-0.5 w-20 h-20 p-1.5 bg-[var(--color-matrix-bg)] border border-[var(--color-matrix-border)] shrink-0"
                style={{ gridTemplateColumns: `repeat(4, minmax(0, 1fr))` }}
              >
                {Array.from({ length: 16 }).map((_, idx) => {
                  const r = Math.floor(idx / 4);
                  const c = idx % 4;
                  const val = experiment.matrix[r]?.[c] ?? 0;
                  return (
                    <div
                      key={idx}
                      style={{
                        backgroundColor:
                          val >= 0
                            ? `rgba(78, 134, 240, ${Math.max(0.2, Math.min(1, Math.abs(val) * 1.4))})`
                            : `rgba(218, 98, 76, ${Math.max(0.2, Math.min(1, Math.abs(val) * 1.4))})`,
                      }}
                    />
                  );
                })}
              </div>
              <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
                Constant footprint regardless of stream length. Every new update writes onto the same <InlineMath math={`${dim}^2`} /> numbers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* SCROLL 2: DIRECT PROMPT ("Add another piece of information")      */}
      {/* ================================================================= */}
      <div className="research-container py-14 sm:py-16 space-y-10 border-b border-[var(--mm-rule)]">
        <div className="essay-column text-center space-y-5">
          <span className="essay-eyebrow text-[var(--mm-signal)]">Try the mechanism yourself</span>
          <h2 className="essay-section-title">
            Add another piece of information.
          </h2>
          <p className="essay-lead mx-auto">
            Each press writes one more country–capital pair into the exact same matrix—without allocating a single extra coordinate. Watch what happens to the readout for{' '}
            <strong className="text-[var(--text-primary)]">{experiment.activeProbe}</strong>.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {nextDistractor ? (
              <button
                type="button"
                onClick={handleAddDistractor}
                className="btn-primary text-sm px-5 py-2.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add another piece of information ({nextDistractor.key} → {nextDistractor.value})</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleReset}
                className="btn-primary text-sm px-5 py-2.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Replay from 3 initial facts</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleReset}
              className="btn-secondary text-sm px-4 py-2.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Inline quick dimension pressure selector */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono pt-1 text-[var(--text-muted)]">
            <span>Field size:</span>
            {[6, 16, 32].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => updateConfig({ dimension: d })}
                className={`px-2 py-0.5 border-b-2 transition-colors cursor-pointer ${
                  dim === d
                    ? 'border-[var(--mm-signal)] text-[var(--mm-signal)] font-semibold'
                    : 'border-transparent hover:text-[var(--text-primary)]'
                }`}
              >
                {d}×{d}
              </button>
            ))}
            <span className="text-[var(--mm-rule-strong)]">·</span>
            <span>
              Margin Δs ={' '}
              <strong className={experiment.evaluation.isCorrect ? 'text-[var(--mm-teal)]' : 'text-[var(--mm-coral)]'}>
                {experiment.evaluation.top1Margin.toFixed(3)} ({experiment.evaluation.status})
              </strong>
            </span>
          </div>
        </div>

        {/* FULL SCIENTIFIC INSTRUMENT (Preserved cleanly below Scroll 2 prompt) */}
        <div id="live-experiment-instrument" className="essay-figure-stage essay-stage-wide">
          <div className="px-4 sm:px-6 py-4 border-b border-[var(--mm-rule)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs font-semibold text-[var(--mm-signal)]">FIG. 0.2</span>
              <h2 className="font-serif font-normal text-xl sm:text-2xl text-[var(--text-primary)]">
                Live Recurrent Memory Instrument
              </h2>
              <span className="font-mono text-xs text-[var(--text-secondary)] hidden md:inline border-l border-[var(--mm-rule)] pl-3">
                <InlineMath math="M_{t+1} = \lambda M_t + \eta k_t v_t^\top" />
              </span>
            </div>

            <div className="playback-controls">
              <button
                type="button"
                onClick={handleReset}
                className="btn-secondary text-xs"
                title="Reset memory instrument to initial state"
                aria-label="Reset memory"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                type="button"
                onClick={handleStepForward}
                className="btn-secondary text-xs"
                title="Step forward one fact write"
              >
                Step
              </button>

              <button
                type="button"
                onClick={handleTogglePlay}
                className={`${isRunning ? 'btn-primary' : 'btn-secondary'} text-xs`}
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
                    <span>Play</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* COLUMN 1: INPUT STREAM */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                <h3 className="font-mono text-xs font-semibold tabular-nums text-[var(--text-secondary)]">
                  Input stream ({experiment.step}/{experiment.facts.length} written)
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCustomInput((prev) => !prev)}
                  className="btn-primary text-xs py-1 px-2.5 min-h-[30px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showCustomInput ? 'Close' : 'Add fact'}</span>
                </button>
              </div>

              {showCustomInput && (
                <div className="p-3.5 rounded-md bg-[var(--surface-soft)] border border-[var(--border)] space-y-2.5 text-xs font-sans">
                  <form onSubmit={handleAddCustomFact} className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Key (e.g. Spain)"
                        value={customKey}
                        onChange={(e) => setCustomKey(e.target.value)}
                        className="px-2.5 py-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] font-mono text-xs focus:outline-none focus:border-[var(--color-accent)]"
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. Madrid)"
                        value={customValue}
                        onChange={(e) => setCustomValue(e.target.value)}
                        className="px-2.5 py-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] font-mono text-xs focus:outline-none focus:border-[var(--color-accent)]"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!customKey.trim() || !customValue.trim()}
                        className="btn-primary text-xs py-1 px-3"
                      >
                        Insert into stream
                      </button>
                    </div>
                  </form>

                  <div className="pt-2 border-t border-[var(--border)]">
                    <span className="text-xs text-[var(--text-muted)] block mb-1.5 font-mono">Quick presets:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_PRESETS.map((preset) => (
                        <button
                          key={preset.key}
                          type="button"
                          onClick={() => handleQuickAdd(preset)}
                          disabled={experiment.facts.some((f) => f.key.toLowerCase() === preset.key.toLowerCase())}
                          className="btn-secondary text-xs py-1 px-2 min-h-[28px]"
                        >
                          + {preset.key} → {preset.value}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="divide-y divide-[var(--mm-rule)] border-y border-[var(--mm-rule)] max-h-[300px] overflow-y-auto">
                {experiment.facts.map((fact, idx) => {
                  const isWritten = idx < experiment.step;
                  const isCurrentlyWriting = idx === experiment.step - 1 && isRunning;
                  const isTarget = fact.key.toLowerCase() === experiment.activeProbe.toLowerCase();

                  return (
                    <div
                      key={`${fact.key}-${idx}`}
                      className={`py-2 px-2 transition-colors flex items-center justify-between text-xs ${
                        isCurrentlyWriting
                          ? 'bg-[var(--accent-green)] text-[var(--text-primary)]'
                          : isTarget
                          ? 'bg-[var(--accent-blue)]/65 text-[var(--text-primary)]'
                          : isWritten
                          ? 'text-[var(--text-primary)]'
                          : 'text-[var(--text-muted)] opacity-70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="font-mono text-[11px] tabular-nums text-[var(--text-muted)] w-4 shrink-0">
                          {idx + 1}.
                        </span>
                        <div className="truncate">
                          <span className="font-semibold text-[var(--text-primary)]">{fact.key}</span>
                          <span className="text-[var(--text-muted)] mx-1.5">→</span>
                          <span className={isTarget ? 'font-semibold text-[var(--accent-blue-text)]' : 'text-[var(--text-secondary)]'}>
                            {fact.value}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {isTarget ? (
                          <span className="text-[11px] font-mono font-semibold text-[var(--mm-signal)]">
                            Probing
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetProbe(fact.key)}
                            className="text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--mm-signal)] hover:underline cursor-pointer px-1"
                            title={`Set ${fact.key} as probe target`}
                          >
                            Probe
                          </button>
                        )}
                        {experiment.facts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveFact(idx)}
                            className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--accent-pink-text)] transition-colors cursor-pointer"
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

              {nextDistractor && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleAddDistractor}
                    className="btn-secondary w-full py-2 px-3 flex items-center justify-center gap-1.5 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add distractor: {nextDistractor.key} → {nextDistractor.value}</span>
                  </button>
                </div>
              )}
            </div>

            {/* COLUMN 2: CURRENT STATE M & RETRIEVED VECTOR */}
            <div className="lg:col-span-4 space-y-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-[var(--text-secondary)] font-semibold flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[var(--accent-blue-text)]" />
                  Memory state <InlineMath math="M_t" /> (<InlineMath math={`t = ${experiment.step}`} />)
                </span>
                <span className="font-mono text-xs tabular-nums text-[var(--text-primary)] flex items-center gap-1">
                  <InlineMath math="\|M\|_F" /> = <strong>{matrixNorm.toFixed(3)}</strong>
                </span>
              </div>

              <div className="p-3.5 rounded-md border border-[var(--color-matrix-border)] bg-[var(--color-matrix-bg)] text-[var(--color-matrix-ink)] space-y-3">
                <div className="flex items-center justify-between text-xs font-mono tabular-nums text-[var(--color-matrix-muted)]">
                  <span>
                    <InlineMath math={`${dim} \\times ${dim}`} /> state matrix
                  </span>
                  <span>
                    <InlineMath math={`\\lambda = ${retention.toFixed(2)}`} />
                  </span>
                </div>

                <div
                  className="grid gap-1 overflow-hidden select-none"
                  style={{ gridTemplateColumns: `repeat(${dim}, minmax(0, 1fr))` }}
                >
                  {experiment.matrix.map((row, rIdx) =>
                    row.map((val, cIdx) => {
                      const isPos = val >= 0;
                      const abs = Math.min(Math.abs(val) * 1.4, 1);
                      const bg = isPos
                        ? `rgba(78, 134, 240, ${Math.max(0.16, abs)})`
                        : `rgba(220, 76, 76, ${Math.max(0.16, abs)})`;

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
                          className={`aspect-square rounded-[2px] transition-transform duration-150 border cursor-pointer ${
                            isSelected
                              ? 'border-amber-300 ring-2 ring-amber-300/80 z-10 scale-125'
                              : isHovered
                              ? 'border-white ring-1 ring-white/70 z-10 scale-110'
                              : 'border-white/10'
                          }`}
                        />
                      );
                    })
                  )}
                </div>

                {activeInspectCell ? (
                  <div className="p-2.5 rounded-md bg-[var(--color-matrix-surface)] border border-[var(--color-matrix-border)] text-xs font-mono tabular-nums text-[var(--color-matrix-ink)] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sky-300 font-semibold">
                        <InlineMath math={`M[${activeInspectCell.r}, ${activeInspectCell.c}]`} />
                      </span>
                      <span className="text-xs text-[var(--color-matrix-muted)]">
                        {selectedCell ? 'Pinned' : 'Hover'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div>
                        <span className="text-[var(--color-matrix-muted)]">Value: </span>
                        <strong className="text-[var(--color-matrix-ink)]">{activeInspectCell.val.toFixed(4)}</strong>
                      </div>
                      <div>
                        <span className="text-[var(--color-matrix-muted)]">&Delta;: </span>
                        <strong
                          className={
                            activeInspectCell.delta > 0.0001
                              ? 'text-emerald-300'
                              : activeInspectCell.delta < -0.0001
                              ? 'text-rose-300'
                              : 'text-[var(--color-matrix-muted)]'
                          }
                        >
                          {activeInspectCell.delta >= 0 ? `+${activeInspectCell.delta.toFixed(4)}` : activeInspectCell.delta.toFixed(4)}
                        </strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs font-mono text-[var(--color-matrix-muted)] text-center py-1">
                    Hover or click any matrix coordinate to inspect
                  </div>
                )}

                <div className="flex items-center justify-between text-xs font-mono text-[var(--color-matrix-muted)] pt-2 border-t border-[var(--color-matrix-border)]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-sky-400" />
                    <span>Positive weight</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-rose-400" />
                    <span>Negative weight</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-md border border-[var(--color-matrix-border)] bg-[var(--color-matrix-bg)] text-[var(--color-matrix-ink)] space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono tabular-nums text-[var(--color-matrix-muted)]">
                  <span className="flex items-center gap-1.5 font-semibold text-sky-300">
                    <Activity className="w-3.5 h-3.5 text-sky-300" />
                    State vector <InlineMath math="\hat{v} = q^\top M" />
                  </span>
                  <span>
                    <InlineMath math="\|\hat{v}\|_2" /> = <strong className="text-[var(--color-matrix-ink)]">{vectorNorm.toFixed(3)}</strong>
                  </span>
                </div>

                <div
                  className="grid gap-1 overflow-hidden select-none"
                  style={{ gridTemplateColumns: `repeat(${dim}, minmax(0, 1fr))` }}
                >
                  {experiment.state.map((val, idx) => {
                    const isPos = val >= 0;
                    const abs = Math.min(Math.abs(val) * 1.5, 1);
                    const bg = isPos
                      ? `rgba(126, 168, 255, ${Math.max(0.18, abs)})`
                      : `rgba(220, 76, 76, ${Math.max(0.18, abs)})`;

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
                        className={`h-6 rounded-[2px] transition-transform duration-150 border cursor-pointer ${
                          isSelected
                            ? 'border-amber-300 ring-2 ring-amber-300/80 z-10 scale-110'
                            : isHovered
                            ? 'border-white ring-1 ring-white/70 z-10 scale-105'
                            : 'border-white/10'
                        }`}
                        title={`Coordinate j=${idx}: ${val.toFixed(4)}`}
                      />
                    );
                  })}
                </div>

                {activeVectorCoord ? (
                  <div className="p-2 rounded bg-[var(--color-matrix-surface)] border border-[var(--color-matrix-border)] text-xs font-mono tabular-nums text-[var(--color-matrix-ink)] flex items-center justify-between gap-2">
                    <span className="text-sky-300 font-semibold">
                      <InlineMath math={`\\hat{v}_{${activeVectorCoord.idx}} = ${activeVectorCoord.val.toFixed(4)}`} />
                    </span>
                    <span className="text-xs text-[var(--color-matrix-muted)]">
                      {activeVectorCoord.val > 0.05 ? 'Aligned' : activeVectorCoord.val < -0.05 ? 'Interference' : 'Null'}
                    </span>
                  </div>
                ) : (
                  <div className="text-xs font-mono text-[var(--color-matrix-muted)] text-center py-0.5">
                    Hover coordinate bar <InlineMath math="\hat{v}_j" /> to inspect
                  </div>
                )}
              </div>

              <div className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
                <FormattedMathText text="Recurrent writes accumulate rank-1 outer products $M_t = \lambda M_{t-1} + \eta k_t v_t^\top$. Querying computes $\hat{v} = q^\top M$." />
              </div>
            </div>

            {/* COLUMN 3: QUERY & READOUT */}
            <div className="lg:col-span-4 space-y-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-[var(--text-secondary)] font-semibold flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-[var(--accent-blue-text)]" />
                  Query &amp; output
                </span>
                <span className="text-xs font-sans text-[var(--text-secondary)]">
                  Target: <strong className="text-[var(--text-primary)]">{experiment.activeProbe}</strong>
                </span>
              </div>

              <div className="space-y-4 border-t border-[var(--mm-rule)] pt-3">
                <div className="space-y-1.5">
                  <label htmlFor="landing-probe-select" className="text-xs font-sans font-medium text-[var(--text-secondary)] block">
                    Active probe key (<InlineMath math="q = k_{\text{probe}}" />):
                  </label>
                  <select
                    id="landing-probe-select"
                    value={experiment.activeProbe}
                    onChange={(e) => handleSetProbe(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] font-sans text-xs font-semibold focus:outline-none focus:border-[var(--color-accent)] cursor-pointer"
                  >
                    {experiment.facts.map((f) => (
                      <option key={f.key} value={f.key}>
                        {f.key} (Target: {f.value})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 divide-x divide-[var(--mm-rule)] border-y border-[var(--mm-rule)] py-2.5">
                  <div className="pr-3 space-y-0.5">
                    <div className="text-[11px] font-mono text-[var(--text-muted)]">Ground truth</div>
                    <div className="font-sans font-semibold text-sm text-[var(--text-primary)]">
                      {experiment.evaluation.groundTruth}
                    </div>
                  </div>
                  <div className="pl-3 space-y-0.5">
                    <div className="text-[11px] font-mono text-[var(--text-muted)]">Model output</div>
                    <div
                      className={`font-sans font-semibold text-sm ${
                        experiment.evaluation.isCorrect ? 'text-[var(--accent-green-text)]' : 'text-[var(--accent-pink-text)]'
                      }`}
                    >
                      {experiment.evaluation.prediction}
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs font-mono tabular-nums">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-secondary)]">Retrieval score</span>
                      <strong className="text-[var(--text-primary)]">
                        {experiment.evaluation.retrievalScore.toFixed(3)}
                      </strong>
                    </div>
                    <div className="w-full bg-[var(--mm-rule)] h-1.5 rounded-sm overflow-hidden">
                      <div
                        className="h-full bg-[var(--color-accent)] transition-all duration-300"
                        style={{
                          width: `${Math.max(0, Math.min(100, Math.max(0, experiment.evaluation.retrievalScore) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-secondary)]">
                        Top-1 margin (<InlineMath math="\Delta s" />)
                      </span>
                      <strong
                        className={
                          experiment.evaluation.top1Margin >= 0.15
                            ? 'text-[var(--accent-green-text)]'
                            : experiment.evaluation.top1Margin >= 0.05
                            ? 'text-[var(--accent-yellow-text)]'
                            : 'text-[var(--accent-pink-text)]'
                        }
                      >
                        {experiment.evaluation.top1Margin.toFixed(3)}
                      </strong>
                    </div>
                    <div className="w-full bg-[var(--mm-rule)] h-1.5 rounded-sm overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          experiment.evaluation.top1Margin >= 0.15
                            ? 'bg-[var(--color-success)]'
                            : experiment.evaluation.top1Margin >= 0.05
                            ? 'bg-[var(--color-warning)]'
                            : 'bg-[var(--color-danger)]'
                        }`}
                        style={{
                          width: `${Math.max(0, Math.min(100, (experiment.evaluation.top1Margin / 0.5) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--mm-rule)]">
                    <span className="text-[var(--text-secondary)]">Status</span>
                    <span
                      className={`text-xs font-semibold flex items-center gap-1.5 ${
                        experiment.evaluation.status === 'Correct'
                          ? 'text-[var(--accent-green-text)]'
                          : experiment.evaluation.status === 'Interference'
                          ? 'text-[var(--accent-pink-text)]'
                          : 'text-[var(--text-secondary)]'
                      }`}
                    >
                      {experiment.evaluation.status === 'Correct' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Correct</span>
                        </>
                      ) : experiment.evaluation.status === 'Interference' ? (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>Interference</span>
                        </>
                      ) : (
                        <>
                          <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Unknown</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-[var(--mm-rule)]">
                  <div className="text-xs font-mono text-[var(--text-secondary)] font-semibold flex items-center justify-between">
                    <span>Candidate affinities</span>
                    <span className="text-xs tabular-nums text-[var(--text-muted)]">{experiment.evaluation.candidates.length} candidates</span>
                  </div>
                  <div className="divide-y divide-[var(--mm-rule)] border-y border-[var(--mm-rule)] text-xs font-mono tabular-nums">
                    {experiment.evaluation.candidates.map((cand, cIdx) => (
                      <div key={cand.value} className="flex items-center justify-between py-1.5 px-1">
                        <span className="truncate flex items-center gap-1">
                          <span className="text-[var(--text-muted)] mr-1">{cIdx + 1}.</span>
                          <span
                            className={
                              cand.value === experiment.evaluation.prediction
                                ? 'font-bold text-[var(--accent-blue-text)]'
                                : cand.value === experiment.evaluation.groundTruth
                                ? 'font-semibold text-[var(--accent-green-text)]'
                                : 'text-[var(--text-primary)]'
                            }
                          >
                            {cand.value}
                          </span>
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-14 bg-[var(--mm-rule)] h-1.5 rounded-full overflow-hidden hidden sm:block">
                            <div
                              className={`h-full ${cand.score >= 0 ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-danger)]'}`}
                              style={{ width: `${Math.max(0, Math.min(100, Math.abs(cand.score) * 100))}%` }}
                            />
                          </div>
                          <span className="text-[var(--text-secondary)] shrink-0 font-semibold w-12 text-right">
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

          <div className="border-t border-[var(--border)] bg-[var(--surface-soft)] px-5 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-sans text-xs font-semibold text-[var(--text-primary)]">
                Experiment conditions
              </span>
              <span className="text-[var(--text-secondary)] font-normal text-xs hidden sm:inline">
                Dimension <InlineMath math="d" />, retention <InlineMath math="\lambda" />, write strength <InlineMath math="\eta" />, interference noise <InlineMath math="\sigma" />
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowConditions(!showConditions)}
              className="change-conditions"
              aria-expanded={showConditions}
            >
              <Sliders className="w-4 h-4 text-[var(--accent-blue-text)]" />
              <span>{showConditions ? 'Hide conditions' : 'Change conditions'}</span>
              {showConditions ? (
                <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
              )}
            </button>
          </div>

          {showConditions && (
            <div className="p-5 sm:p-6 border-t border-[var(--border)] bg-[var(--surface)] space-y-6 text-xs font-sans">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--mm-rule)]">
                <span className="font-mono text-xs text-[var(--text-secondary)] font-semibold">
                  Preset conditions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button type="button" onClick={() => applyConditionPreset('balanced')} className="btn-secondary text-xs py-1 px-2.5 min-h-[30px]">
                    Balanced (<InlineMath math="d=12, \lambda=0.95" />)
                  </button>
                  <button type="button" onClick={() => applyConditionPreset('capacity')} className="btn-secondary text-xs py-1 px-2.5 min-h-[30px]">
                    High capacity (<InlineMath math="d=24, \lambda=0.98" />)
                  </button>
                  <button type="button" onClick={() => applyConditionPreset('interference')} className="btn-secondary text-xs py-1 px-2.5 min-h-[30px] text-[var(--accent-pink-text)]">
                    Interference boundary (<InlineMath math="d=6, \sigma=0.25" />)
                  </button>
                  <button type="button" onClick={() => applyConditionPreset('decay')} className="btn-secondary text-xs py-1 px-2.5 min-h-[30px] text-[var(--accent-yellow-text)]">
                    Rapid decay (<InlineMath math="\lambda=0.55" />)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <ControlSlider
                  id="landing-dim"
                  label={<span>Dimension (<InlineMath math="d" />)</span>}
                  value={dim}
                  min={4}
                  max={32}
                  step={4}
                  unit="D"
                  description="Capacity bound ~ O(d). Lower dimensions trigger subspace interference."
                  onChange={(val) => updateConfig({ dimension: val })}
                />

                <ControlSlider
                  id="landing-retention"
                  label={<span>Retention (<InlineMath math="\lambda" />)</span>}
                  value={retention}
                  min={0.5}
                  max={1.0}
                  step={0.01}
                  formatValue={(v) => `${(v * 100).toFixed(0)}%`}
                  description="Decay applied at each step: M_t = λ M_{t-1} + η k_t v_t^T."
                  onChange={(val) => updateConfig({ retention: val })}
                />

                <ControlSlider
                  id="landing-eta"
                  label={<span>Write strength (<InlineMath math="\eta" />)</span>}
                  value={writeStrength}
                  min={0.2}
                  max={1.5}
                  step={0.05}
                  formatValue={(v) => v.toFixed(2)}
                  description="Scale factor of outer-product rank-1 updates."
                  onChange={(val) => updateConfig({ writeStrength: val })}
                />

                <ControlSlider
                  id="landing-noise"
                  label={<span>Interference (<InlineMath math="\sigma" />)</span>}
                  value={interferenceNoise}
                  min={0.0}
                  max={0.8}
                  step={0.05}
                  formatValue={(v) => `${(v * 100).toFixed(0)}%`}
                  description="Query perturbation noise q = k_{probe} + ε."
                  onChange={(val) => updateConfig({ interference: val })}
                />
              </div>
            </div>
          )}
        </div>

        <div className="essay-stage-wide">
          <DebugPanel
            id="live-experiment-debug-panel"
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
            facts={experiment.facts}
            matrix={experiment.matrix}
            state={experiment.state}
            history={experiment.history}
            config={{
              dimension: dim,
              retention,
              writeStrength,
              interference: interferenceNoise,
            }}
          />
        </div>
      </div>

      {/* ================================================================= */}
      {/* SCROLL 3: CHAPTER MARKER TRANSITION                               */}
      {/* ================================================================= */}
      <div className="research-container py-10 sm:py-12 border-b border-[var(--mm-rule)]">
        <div className="essay-column flex flex-wrap items-baseline justify-between gap-4">
          <span className="essay-chapter-marker">
            <strong className="text-[var(--mm-signal)]">01 / MEMORY</strong>
            <span>Where does a sequence model store what it just read?</span>
          </span>
          <span className="font-mono text-xs text-[var(--text-muted)]">
            Scroll down into Chapter 01
          </span>
        </div>
      </div>
    </section>
  );
};

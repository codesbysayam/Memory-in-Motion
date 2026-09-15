import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  ExperimentConfig,
  DEFAULT_CONFIG,
  ExperimentMode,
  CandidateAffinity,
  ProbeEvaluation,
  ExperimentSnapshot,
  BaselineSnapshot,
  RunRecord,
  ExperimentState,
  experimentId,
} from '../types/experiment';
import { EXPERIMENT_PRESETS, findFailurePreset } from '../data/experimentPresets';
import { Fact } from '../models/types';
import { vector, cosine } from '../models/associativeMemory';

export type LabMode = ExperimentMode;

export const INITIAL_FACTS: Fact[] = [
  { key: 'Japan', value: 'Tokyo', category: 'Asia' },
  { key: 'France', value: 'Paris', category: 'Europe' },
  { key: 'Brazil', value: 'Brasília', category: 'South America' },
];

export const CANONICAL_DISTRACTORS: Fact[] = [
  { key: 'Egypt', value: 'Cairo', category: 'Africa' },
  { key: 'Germany', value: 'Berlin', category: 'Europe' },
  { key: 'Kenya', value: 'Nairobi', category: 'Africa' },
  { key: 'Canada', value: 'Ottawa', category: 'North America' },
  { key: 'India', value: 'New Delhi', category: 'Asia' },
  { key: 'Australia', value: 'Canberra', category: 'Oceania' },
  { key: 'Argentina', value: 'Buenos Aires', category: 'South America' },
  { key: 'South Korea', value: 'Seoul', category: 'Asia' },
  { key: 'Mexico', value: 'Mexico City', category: 'North America' },
];

/**
 * Deterministic probe evaluation against the CURRENT memory matrix M \in R^(d x d).
 * Does not mutate matrix or history.
 */
export function evaluateProbe(
  matrix: number[][],
  facts: Fact[],
  key: string | null,
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
    const qn = Math.sqrt(q.reduce((acc, v) => acc + v * v, 0)) || 1;
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
  const top1Margin = top && second ? top.score - second.score : top ? top.score : 0;

  // 4. Ground truth strictly derived from active probe key in facts
  const match = facts.find((f) => f.key.trim().toLowerCase() === key.trim().toLowerCase());
  const groundTruth = match ? match.value : 'UNKNOWN';

  // 5. Status logic (Section 22)
  const isCorrect =
    prediction !== 'UNKNOWN' &&
    groundTruth !== 'UNKNOWN' &&
    prediction.trim().toLowerCase() === groundTruth.trim().toLowerCase();

  const isInterference = groundTruth !== 'UNKNOWN' && prediction !== 'UNKNOWN' && !isCorrect;

  const status: 'Correct' | 'Interference' | 'Unknown' =
    prediction === 'UNKNOWN' ? 'Unknown' : isCorrect ? 'Correct' : 'Interference';

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
  activeProbe: string | null,
  targetStep: number,
  config: ExperimentConfig,
  mode: ExperimentMode = 'guided',
  guidedStep = 1,
  guidedCompleted = [false, false, false, false, false],
  learnerPrediction: 'correct' | 'interference' | null = null
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
    mode,
    facts,
    config,
    matrix: M,
    state: evaluation.vector,
    history,
    activeProbe,
    prediction: evaluation.prediction,
    groundTruth: evaluation.groundTruth,
    retrievalScore: evaluation.retrievalScore,
    top1Margin: evaluation.top1Margin,
    status: evaluation.status,
    step: validStep,
    guidedStep,
    guidedCompleted,
    learnerPrediction,
  };
}

export interface ComparisonDiff {
  stateCosineSimilarity: number;
  stateNormDiff: number;
  matrixNormDiff: number;
  scoreDiff: number;
  marginDiff: number;
  predictionChanged: boolean;
  basePrediction: string;
  currPrediction: string;
  baseScore: number;
  currScore: number;
}

export interface ExperimentContextType {
  // Mode
  mode: ExperimentMode;
  setMode: (m: ExperimentMode) => void;

  // Configuration
  config: ExperimentConfig;
  prevConfig: ExperimentConfig;
  setConfig: (configOrUpdater: ExperimentConfig | ((prev: ExperimentConfig) => ExperimentConfig)) => void;
  updateConfig: (partial: Partial<ExperimentConfig>) => void;
  activePresetKey: string | null;
  applyPreset: (key: string) => void;

  // Unified State (Section 13)
  state: ExperimentState;
  facts: Fact[];
  matrix: number[][];
  stateVector: number[];
  history: ExperimentSnapshot[];
  activeProbe: string | null;
  prediction: string;
  groundTruth: string;
  retrievalScore: number;
  top1Margin: number;
  status: 'Correct' | 'Interference' | 'Unknown';
  step: number;
  guidedStep: number;
  guidedCompleted: boolean[];
  learnerPrediction: 'correct' | 'interference' | null;

  // Internal Metrics & Diagnostics
  activeFactsCount: number;
  matrixNorm: number;
  vectorNorm: number;
  currentRunId: string;
  candidates: CandidateAffinity[];

  // Baseline Comparison (Section 19)
  baseline: BaselineSnapshot | null;
  saveBaseline: () => void;
  comparisonDiff: ComparisonDiff | null;

  // Experiment History (Section 20)
  historyRuns: RunRecord[];
  selectHistoricalRun: (runId: string) => void;

  // Playback & Execution
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  togglePlay: () => void;

  // Core Mathematical Engine Operations (Section 14)
  runStep: () => void;
  evaluateCurrentProbe: (key?: string) => void;
  rebuildMemory: (newFacts?: Fact[], targetStep?: number, probeKey?: string, newConfig?: ExperimentConfig) => void;
  resetExperiment: () => void;

  // Fact & Probe Controls
  addFact: (fact: Fact) => void;
  removeFact: (index: number) => void;
  addDistractor: () => void;
  setActiveProbe: (key: string) => void;

  // Guided Mode Controls
  setGuidedStep: (step: number) => void;
  completeGuidedStep: (step: number) => void;
  setLearnerPrediction: (pred: 'correct' | 'interference' | null) => void;
  executeGuidedWrite: () => void;
  executeGuidedProbe: () => void;
  beforeAfterDistractor: { before: ProbeEvaluation; after: ProbeEvaluation; distractor: Fact } | null;

  // Compatibility with existing UI
  resetLab: () => void;
  showJudgeMode: boolean;
  setShowJudgeMode: (show: boolean) => void;
  triggerFailurePreset: () => void;
}

const ExperimentContext = createContext<ExperimentContextType | null>(null);

export const ExperimentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ExperimentMode>('guided');
  const [config, setConfigState] = useState<ExperimentConfig>(DEFAULT_CONFIG);
  const [prevConfig, setPrevConfig] = useState<ExperimentConfig>(DEFAULT_CONFIG);
  const [activePresetKey, setActivePresetKey] = useState<string | null>('clean');
  const [showJudgeMode, setShowJudgeMode] = useState<boolean>(false);

  // Playback state
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Comparison Baseline (Section 19)
  const [baseline, setBaseline] = useState<BaselineSnapshot | null>(null);

  // History Runs (Section 20)
  const [historyRuns, setHistoryRuns] = useState<RunRecord[]>([]);

  // Guided Mode Interventions state (Section 4)
  const [beforeAfterDistractor, setBeforeAfterDistractor] = useState<{
    before: ProbeEvaluation;
    after: ProbeEvaluation;
    distractor: Fact;
  } | null>(null);

  // Unified State
  const [state, setState] = useState<ExperimentState>(() => {
    return buildExperimentState(
      INITIAL_FACTS,
      'Japan',
      INITIAL_FACTS.length,
      DEFAULT_CONFIG,
      'guided',
      1,
      [false, false, false, false, false],
      null
    );
  });

  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // Set mode handler
  const setMode = useCallback((newMode: ExperimentMode) => {
    setModeState(newMode);
    setState((prev) => ({
      ...prev,
      mode: newMode,
    }));
  }, []);

  // Compute matrix Frobenius norm: ||M||_F = sqrt(sum M_ij^2)
  const matrixNorm = useMemo(() => {
    let sum = 0;
    const M = state.matrix;
    for (let r = 0; r < M.length; r++) {
      for (let c = 0; c < (M[r]?.length || 0); c++) {
        const val = M[r][c] || 0;
        sum += val * val;
      }
    }
    return Math.sqrt(sum);
  }, [state.matrix]);

  // Compute state vector Euclidean norm: ||v||_2
  const vectorNorm = useMemo(() => {
    let sum = 0;
    const v = state.state;
    for (let i = 0; i < v.length; i++) {
      const val = v[i] || 0;
      sum += val * val;
    }
    return Math.sqrt(sum);
  }, [state.state]);

  // Evaluate candidate affinities for active probe
  const candidates = useMemo<CandidateAffinity[]>(() => {
    const dim = config.dimension;
    const uniqueValues: string[] = Array.from(new Set(state.facts.map((f) => f.value))).filter(Boolean) as string[];
    return uniqueValues
      .map((val: string) => ({
        value: val,
        score: cosine(state.state, vector(val, dim)),
      }))
      .sort((a, b) => b.score - a.score);
  }, [state.facts, state.state, config.dimension]);

  // Current Run ID
  const currentRunId = useMemo(() => {
    return experimentId(config.dimension, config.retention, state.facts.length, config.seed);
  }, [config.dimension, config.retention, state.facts.length, config.seed]);

  // Record a historical run snapshot
  const recordRunSnapshot = useCallback(
    (customState?: ExperimentState) => {
      const target = customState || state;
      const runId = `RUN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      const record: RunRecord = {
        id: runId,
        label: `Run #${historyRuns.length + 1}`,
        timestamp: timeStr,
        config: { ...target.config },
        factsCount: target.facts.length,
        probe: target.activeProbe || 'Japan',
        prediction: target.prediction,
        groundTruth: target.groundTruth,
        retrievalScore: target.retrievalScore,
        top1Margin: target.top1Margin,
        status: target.status,
        state: [...target.state],
        matrix: target.matrix.map((row) => [...row]),
      };

      setHistoryRuns((prev) => [record, ...prev.slice(0, 9)]);
    },
    [state, historyRuns.length]
  );

  // Core Mathematical Engine Operations: Rebuild
  const rebuildMemory = useCallback(
    (
      newFacts?: Fact[],
      targetStep?: number,
      probeKey?: string,
      newConfig?: ExperimentConfig
    ) => {
      setState((prevState) => {
        const activeFacts = newFacts ?? prevState.facts;
        const activeConf = newConfig ?? configRef.current;
        const activeTargetStep = targetStep ?? prevState.step;
        const activeTargetProbe = probeKey !== undefined ? probeKey : prevState.activeProbe;

        return buildExperimentState(
          activeFacts,
          activeTargetProbe,
          activeTargetStep,
          activeConf,
          prevState.mode,
          prevState.guidedStep,
          prevState.guidedCompleted,
          prevState.learnerPrediction
        );
      });
    },
    []
  );

  // Core Mathematical Engine Operations: Run Step
  const runStep = useCallback(() => {
    setState((current) => {
      const dim = Math.max(2, Math.min(64, configRef.current.dimension || 16));
      const retention = Math.max(0, Math.min(1, configRef.current.retention ?? 0.95));
      const writeStrength = Math.max(0.1, Math.min(2, configRef.current.writeStrength ?? 0.8));
      const noise = Math.max(0, Math.min(1, configRef.current.interference ?? 0));

      let nextFact: Fact;
      let nextFacts = current.facts;

      if (current.step < current.facts.length) {
        nextFact = current.facts[current.step];
      } else {
        // Find next distractor
        const existingKeys = new Set(current.facts.map((f) => f.key.toLowerCase()));
        const distractor = CANONICAL_DISTRACTORS.find((d) => !existingKeys.has(d.key.toLowerCase()));
        if (!distractor) {
          setIsRunning(false);
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

      const updatedState: ExperimentState = {
        ...current,
        facts: nextFacts,
        step: nextStep,
        matrix: nextM,
        state: evaluation.vector,
        history: [...current.history, snapshot],
        prediction: evaluation.prediction,
        groundTruth: evaluation.groundTruth,
        retrievalScore: evaluation.retrievalScore,
        top1Margin: evaluation.top1Margin,
        status: evaluation.status,
      };

      return updatedState;
    });
  }, []);

  // Playback timer handling
  useEffect(() => {
    if (!isRunning) return;

    const intervalId = window.setInterval(() => {
      runStep();
    }, 700);

    return () => window.clearInterval(intervalId);
  }, [isRunning, runStep]);

  const togglePlay = useCallback(() => {
    setIsRunning((prev) => {
      const willRun = !prev;
      if (willRun) {
        setState((current) => {
          const existingKeys = new Set(current.facts.map((f) => f.key.toLowerCase()));
          const hasMore = CANONICAL_DISTRACTORS.some((d) => !existingKeys.has(d.key.toLowerCase()));
          // If already at end of stream and no more distractors, restart from initial facts at step 0
          if (!hasMore && current.step >= current.facts.length) {
            return buildExperimentState(
              INITIAL_FACTS,
              current.activeProbe || 'Japan',
              0,
              configRef.current,
              current.mode,
              current.guidedStep,
              current.guidedCompleted,
              current.learnerPrediction
            );
          }
          return current;
        });
      }
      return willRun;
    });
  }, []);

  // Update Probe
  const setActiveProbe = useCallback(
    (newProbeKey: string) => {
      setState((prev) => {
        const dim = Math.max(2, Math.min(64, configRef.current.dimension || 16));
        const noise = Math.max(0, Math.min(1, configRef.current.interference ?? 0));
        const evaluation = evaluateProbe(
          prev.matrix,
          prev.facts,
          newProbeKey,
          dim,
          noise
        );
        return {
          ...prev,
          activeProbe: newProbeKey,
          state: evaluation.vector,
          prediction: evaluation.prediction,
          groundTruth: evaluation.groundTruth,
          retrievalScore: evaluation.retrievalScore,
          top1Margin: evaluation.top1Margin,
          status: evaluation.status,
        };
      });
    },
    []
  );

  const evaluateCurrentProbe = useCallback(
    (probeKey?: string) => {
      const key = probeKey ?? state.activeProbe;
      if (key) setActiveProbe(key);
    },
    [state.activeProbe, setActiveProbe]
  );

  // Configuration updates
  const setConfig = useCallback(
    (configOrUpdater: ExperimentConfig | ((prev: ExperimentConfig) => ExperimentConfig)) => {
      setConfigState((current) => {
        const next = typeof configOrUpdater === 'function' ? configOrUpdater(current) : configOrUpdater;
        setPrevConfig(current);

        setState((prev) =>
          buildExperimentState(
            prev.facts,
            prev.activeProbe,
            prev.step,
            next,
            prev.mode,
            prev.guidedStep,
            prev.guidedCompleted,
            prev.learnerPrediction
          )
        );

        return next;
      });
    },
    []
  );

  const updateConfig = useCallback(
    (partial: Partial<ExperimentConfig>) => {
      setConfigState((current) => {
        const next = { ...current, ...partial };
        setPrevConfig(current);

        setState((prev) =>
          buildExperimentState(
            prev.facts,
            prev.activeProbe,
            prev.step,
            next,
            prev.mode,
            prev.guidedStep,
            prev.guidedCompleted,
            prev.learnerPrediction
          )
        );

        return next;
      });
    },
    []
  );

  // Presets
  const applyPreset = useCallback(
    (presetKey: string) => {
      const preset = EXPERIMENT_PRESETS[presetKey];
      if (preset) {
        setActivePresetKey(presetKey);
        setConfigState((current) => {
          setPrevConfig(current);
          const next = { ...preset.config };

          // Build facts for preset: ensure initial facts are present plus target distractors
          const targetKey = preset.targetKey || 'Japan';
          const distractors = CANONICAL_DISTRACTORS.filter(
            (d) => d.key.toLowerCase() !== targetKey.toLowerCase()
          ).slice(0, next.distractors);
          const baseFacts = INITIAL_FACTS;
          const facts = [
            ...baseFacts,
            ...distractors.filter((d) => !baseFacts.some((b) => b.key.toLowerCase() === d.key.toLowerCase())),
          ];

          setState((prev) => {
            const nextState = buildExperimentState(
              facts,
              targetKey,
              facts.length,
              next,
              prev.mode,
              prev.guidedStep,
              prev.guidedCompleted,
              prev.learnerPrediction
            );
            recordRunSnapshot(nextState);
            return nextState;
          });

          return next;
        });
      }
    },
    [recordRunSnapshot]
  );

  // Add a fact
  const addFact = useCallback(
    (fact: Fact) => {
      setState((prev) => {
        const nextFacts = [...prev.facts, fact];
        return buildExperimentState(
          nextFacts,
          prev.activeProbe,
          nextFacts.length,
          configRef.current,
          prev.mode,
          prev.guidedStep,
          prev.guidedCompleted,
          prev.learnerPrediction
        );
      });
    },
    []
  );

  // Remove a fact
  const removeFact = useCallback(
    (index: number) => {
      setState((prev) => {
        if (prev.facts.length <= 1) return prev;
        const nextFacts = prev.facts.filter((_, i) => i !== index);
        const nextStep = Math.min(prev.step, nextFacts.length);
        const nextProbe = nextFacts.some((f) => f.key === prev.activeProbe)
          ? prev.activeProbe
          : nextFacts[0]?.key || null;

        return buildExperimentState(
          nextFacts,
          nextProbe,
          nextStep,
          configRef.current,
          prev.mode,
          prev.guidedStep,
          prev.guidedCompleted,
          prev.learnerPrediction
        );
      });
    },
    []
  );

  // Add Distractor and compute real Before vs After
  const addDistractor = useCallback(() => {
    setState((current) => {
      const existingKeys = new Set(current.facts.map((f) => f.key.toLowerCase()));
      const distractor = CANONICAL_DISTRACTORS.find((d) => !existingKeys.has(d.key.toLowerCase()));
      if (!distractor) return current;

      const dim = Math.max(2, Math.min(64, configRef.current.dimension || 16));
      const retention = Math.max(0, Math.min(1, configRef.current.retention ?? 0.95));
      const writeStrength = Math.max(0.1, Math.min(2, configRef.current.writeStrength ?? 0.8));
      const noise = Math.max(0, Math.min(1, configRef.current.interference ?? 0));

      const beforeEval = evaluateProbe(
        current.matrix,
        current.facts,
        current.activeProbe,
        dim,
        noise
      );

      const nextFacts = [...current.facts, distractor];
      const nextStep = current.step + 1;
      const k = vector(distractor.key, dim);
      const v = vector(distractor.value, dim);

      const nextM = Array.from({ length: dim }, (_, i) =>
        Array.from({ length: dim }, (_, j) =>
          (current.matrix[i]?.[j] || 0) * retention + writeStrength * (k[i] || 0) * (v[j] || 0)
        )
      );

      const afterEval = evaluateProbe(nextM, nextFacts, current.activeProbe, dim, noise);

      setBeforeAfterDistractor({
        before: beforeEval,
        after: afterEval,
        distractor,
      });

      const snapshot: ExperimentSnapshot = {
        step: nextStep,
        input: distractor,
        state: afterEval.vector,
        matrix: nextM,
        prediction: afterEval.prediction,
        retrievalScore: afterEval.retrievalScore,
        top1Margin: afterEval.top1Margin,
      };

      return {
        ...current,
        facts: nextFacts,
        step: nextStep,
        matrix: nextM,
        state: afterEval.vector,
        history: [...current.history, snapshot],
        prediction: afterEval.prediction,
        groundTruth: afterEval.groundTruth,
        retrievalScore: afterEval.retrievalScore,
        top1Margin: afterEval.top1Margin,
        status: afterEval.status,
      };
    });
  }, []);

  // Guided Mode Step navigation
  const setGuidedStep = useCallback((step: number) => {
    setState((prev) => ({
      ...prev,
      guidedStep: Math.max(1, Math.min(5, step)),
    }));
  }, []);

  const completeGuidedStep = useCallback((stepIndex: number) => {
    setState((prev) => {
      const nextCompleted = [...prev.guidedCompleted];
      nextCompleted[stepIndex - 1] = true;
      return {
        ...prev,
        guidedCompleted: nextCompleted,
      };
    });
  }, []);

  const setLearnerPrediction = useCallback((pred: 'correct' | 'interference' | null) => {
    setState((prev) => ({
      ...prev,
      learnerPrediction: pred,
    }));
  }, []);

  // Guided Step 1: Write Facts Action
  const executeGuidedWrite = useCallback(() => {
    setState((prev) => {
      const rebuilt = buildExperimentState(
        INITIAL_FACTS,
        'Japan',
        INITIAL_FACTS.length,
        config,
        'guided',
        1,
        [true, false, false, false, false],
        prev.learnerPrediction
      );
      return rebuilt;
    });
  }, [config]);

  // Guided Step 3: Run Probe Action
  const executeGuidedProbe = useCallback(() => {
    setState((prev) => {
      const evaluation = evaluateProbe(
        prev.matrix,
        prev.facts,
        'Japan',
        config.dimension,
        config.interference
      );
      const nextCompleted = [...prev.guidedCompleted];
      nextCompleted[2] = true;
      return {
        ...prev,
        activeProbe: 'Japan',
        state: evaluation.vector,
        prediction: evaluation.prediction,
        groundTruth: evaluation.groundTruth,
        retrievalScore: evaluation.retrievalScore,
        top1Margin: evaluation.top1Margin,
        status: evaluation.status,
        guidedCompleted: nextCompleted,
      };
    });
  }, [config.dimension, config.interference]);

  // Save Baseline (Section 19)
  const saveBaseline = useCallback(() => {
    const baselineSnap: BaselineSnapshot = {
      id: `BASE-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toLocaleTimeString(),
      config: { ...config },
      facts: [...state.facts],
      step: state.step,
      state: [...state.state],
      matrix: state.matrix.map((row) => [...row]),
      prediction: state.prediction,
      groundTruth: state.groundTruth,
      retrievalScore: state.retrievalScore,
      top1Margin: state.top1Margin,
      matrixNorm,
      vectorNorm,
    };
    setBaseline(baselineSnap);
  }, [config, state, matrixNorm, vectorNorm]);

  // Compare Current Run vs Baseline (Section 19)
  const comparisonDiff = useMemo<ComparisonDiff | null>(() => {
    if (!baseline) return null;
    const stateSim = cosine(state.state, baseline.state);
    return {
      stateCosineSimilarity: stateSim,
      stateNormDiff: vectorNorm - baseline.vectorNorm,
      matrixNormDiff: matrixNorm - baseline.matrixNorm,
      scoreDiff: state.retrievalScore - baseline.retrievalScore,
      marginDiff: state.top1Margin - baseline.top1Margin,
      predictionChanged: state.prediction !== baseline.prediction,
      basePrediction: baseline.prediction,
      currPrediction: state.prediction,
      baseScore: baseline.retrievalScore,
      currScore: state.retrievalScore,
    };
  }, [baseline, state, matrixNorm, vectorNorm]);

  // Restore or inspect a historical run
  const selectHistoricalRun = useCallback((runId: string) => {
    const found = historyRuns.find((r) => r.id === runId);
    if (!found) return;

    setConfigState(found.config);
    setState((prev) => ({
      ...prev,
      config: found.config,
      matrix: found.matrix.map((row) => [...row]),
      state: [...found.state],
      activeProbe: found.probe,
      prediction: found.prediction,
      groundTruth: found.groundTruth,
      retrievalScore: found.retrievalScore,
      top1Margin: found.top1Margin,
      status: found.status,
    }));
  }, [historyRuns]);

  // Reset entire experiment
  const resetExperiment = useCallback(() => {
    setIsRunning(false);
    setConfigState(DEFAULT_CONFIG);
    setActivePresetKey('clean');
    setBeforeAfterDistractor(null);

    const initial = buildExperimentState(
      INITIAL_FACTS,
      'Japan',
      INITIAL_FACTS.length,
      DEFAULT_CONFIG,
      mode,
      1,
      [false, false, false, false, false],
      null
    );
    setState(initial);
  }, [mode]);

  const resetLab = useCallback(() => {
    resetExperiment();
  }, [resetExperiment]);

  const triggerFailurePreset = useCallback(() => {
    const failConfig = findFailurePreset('Japan', 'Tokyo');
    updateConfig(failConfig);
    const el = document.getElementById('section-05') || document.getElementById('section-04');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [updateConfig]);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      config,
      prevConfig,
      setConfig,
      updateConfig,
      activePresetKey,
      applyPreset,
      state,
      facts: state.facts,
      matrix: state.matrix,
      stateVector: state.state,
      history: state.history,
      activeProbe: state.activeProbe,
      prediction: state.prediction,
      groundTruth: state.groundTruth,
      retrievalScore: state.retrievalScore,
      top1Margin: state.top1Margin,
      status: state.status,
      step: state.step,
      guidedStep: state.guidedStep,
      guidedCompleted: state.guidedCompleted,
      learnerPrediction: state.learnerPrediction,
      activeFactsCount: state.facts.length,
      matrixNorm,
      vectorNorm,
      currentRunId,
      candidates,
      baseline,
      saveBaseline,
      comparisonDiff,
      historyRuns,
      selectHistoricalRun,
      isRunning,
      setIsRunning,
      togglePlay,
      runStep,
      evaluateCurrentProbe,
      rebuildMemory,
      resetExperiment,
      addFact,
      removeFact,
      addDistractor,
      setActiveProbe,
      setGuidedStep,
      completeGuidedStep,
      setLearnerPrediction,
      executeGuidedWrite,
      executeGuidedProbe,
      beforeAfterDistractor,
      resetLab,
      showJudgeMode,
      setShowJudgeMode,
      triggerFailurePreset,
    }),
    [
      mode,
      setMode,
      config,
      prevConfig,
      setConfig,
      updateConfig,
      activePresetKey,
      applyPreset,
      state,
      matrixNorm,
      vectorNorm,
      currentRunId,
      candidates,
      baseline,
      saveBaseline,
      comparisonDiff,
      historyRuns,
      selectHistoricalRun,
      isRunning,
      togglePlay,
      runStep,
      evaluateCurrentProbe,
      rebuildMemory,
      resetExperiment,
      addFact,
      removeFact,
      addDistractor,
      setActiveProbe,
      setGuidedStep,
      completeGuidedStep,
      setLearnerPrediction,
      executeGuidedWrite,
      executeGuidedProbe,
      beforeAfterDistractor,
      resetLab,
      showJudgeMode,
      setShowJudgeMode,
      triggerFailurePreset,
    ]
  );

  return <ExperimentContext.Provider value={value}>{children}</ExperimentContext.Provider>;
};

export function useExperiment() {
  const ctx = useContext(ExperimentContext);
  if (!ctx) {
    throw new Error('useExperiment must be used within an ExperimentProvider');
  }
  return ctx;
}


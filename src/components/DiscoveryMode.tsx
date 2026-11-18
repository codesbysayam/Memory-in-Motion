import React, { useState, useMemo, useCallback } from 'react';
import { CANONICAL_FACTS, Fact } from '../models/associativeMemory';
import { SourceBadge } from './ui/SourceBadge';
import { StateInspector } from './StateInspector';
import { FailureTrace, RecordedTraceStep } from './FailureTrace';
import { EvidenceStrip } from './ui/EvidenceStrip';
import { ParameterDelta } from './ParameterDelta';
import { ClaimEvidenceLimitation } from './ClaimEvidenceLimitation';
import { EXPERIMENT_PRESETS, ExperimentPreset } from '../data/experimentPresets';
import { useExperiment, INITIAL_FACTS, evaluateProbe } from '../context/ExperimentContext';
import { GlossaryTerm } from './GlossaryTerm';
import { MathView } from './ui/MathView';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  CheckCircle,
  XCircle,
  AlertOctagon,
  Sliders,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  Flame,
  Search,
  Sparkles,
  Wrench,
  Compass,
  Lock,
  Unlock,
  Bookmark,
  TrendingDown,
  TrendingUp,
  History,
  Layers,
  ArrowDownRight,
  Database,
  Eye,
  RefreshCw,
  Plus,
  Minus,
} from 'lucide-react';

interface DiscoveryModeProps {
  id?: string;
  initialMode?: 'guided' | 'sandbox';
}

interface RecoveryResult {
  interventionLabel: string;
  userHypothesis: 'YES' | 'NO';
  before: { prediction: string; confidence: number; isCorrect: boolean; dim: number; ret: number; dist: number };
  after: { prediction: string; confidence: number; isCorrect: boolean; dim: number; ret: number; dist: number };
}

export const DiscoveryMode: React.FC<DiscoveryModeProps> = ({
  id = 'discovery-mode-container',
  initialMode,
}) => {
  const {
    mode,
    setMode,
    config,
    updateConfig,
    applyPreset,
    facts,
    step,
    matrix,
    stateVector,
    history,
    activeProbe,
    prediction,
    groundTruth,
    retrievalScore,
    top1Margin,
    status,
    guidedStep,
    guidedCompleted,
    learnerPrediction,
    setGuidedStep,
    completeGuidedStep,
    setLearnerPrediction,
    executeGuidedWrite,
    executeGuidedProbe,
    addDistractor,
    beforeAfterDistractor,
    resetExperiment,
    runStep,
    isRunning,
    togglePlay,
    setActiveProbe,
    baseline,
    saveBaseline,
    comparisonDiff,
    historyRuns,
    selectHistoricalRun,
    matrixNorm,
    vectorNorm,
    currentRunId,
    candidates,
  } = useExperiment();

  // If initialMode prop is provided and different from context on mount, set it
  React.useEffect(() => {
    if (initialMode && initialMode !== mode) {
      setMode(initialMode);
    }
  }, [initialMode, setMode]);

  // Trace and failure UI states
  const [showFailureTrace, setShowFailureTrace] = useState<boolean>(false);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<string | null>(null);
  const [quizRevealed, setQuizRevealed] = useState<boolean>(false);

  // Controlled experiment selection in Guided Step 5
  const [guidedIntervention, setGuidedIntervention] = useState<'dim' | 'ret' | 'dist'>('dim');
  const [guidedInterventionDone, setGuidedInterventionDone] = useState<boolean>(false);

  // Recovery experiment in Sandbox mode
  const [selectedIntervention, setSelectedIntervention] = useState<'dim' | 'ret' | 'dist'>('dim');
  const [learnerHypothesis, setLearnerHypothesis] = useState<'YES' | 'NO' | null>(null);
  const [recoveryResult, setRecoveryResult] = useState<RecoveryResult | null>(null);

  // Previous config tracking for ParameterDelta
  const [prevParams, setPrevParams] = useState<{ dimension: number; retention: number; distractors: number } | null>(null);

  const isCorrect = status === 'Correct';
  const targetFact = useMemo(() => {
    return facts.find((f) => f.key === (activeProbe || 'Japan')) || facts[0] || { key: 'Japan', value: 'Tokyo', category: 'Asia' };
  }, [facts, activeProbe]);

  // Handle parameter changes in Sandbox mode
  const handleConfigChange = (partial: Partial<typeof config>) => {
    setPrevParams({
      dimension: config.dimension,
      retention: config.retention,
      distractors: config.distractors,
    });
    updateConfig(partial);
  };

  // Convert history snapshots to RecordedTraceStep for FailureTrace component
  const recordedTraceSteps = useMemo<RecordedTraceStep[]>(() => {
    return history.map((snap, idx) => {
      const fact = snap.input || facts[idx] || { key: 'Init', value: 'None' };
      const isTarget = fact.key.toLowerCase() === (activeProbe || 'Japan').toLowerCase();
      const prevSlice = idx > 0 && history[idx - 1] ? history[idx - 1].state : Array(config.dimension).fill(0);
      const delta = snap.state.map((v, i) => v - (prevSlice[i] || 0));

      return {
        stepIndex: idx,
        label: isTarget ? `${fact.key} → ${fact.value}` : `Distractor: ${fact.key} → ${fact.value}`,
        operation: 'WRITE',
        inputFact: {
          key: fact.key,
          value: fact.value,
          isTarget,
        },
        stateMatrix: snap.matrix,
        stateVector: snap.state,
        deltaVector: delta,
        predictionAtStep: snap.prediction,
        confidenceAtStep: snap.retrievalScore,
        isCorrectAtStep: snap.prediction.toLowerCase() === targetFact.value.toLowerCase(),
        notes: isTarget
          ? `Step 01: Ingested target association "${fact.key} → ${fact.value}" into D=${config.dimension} state matrix.`
          : `Step ${String(idx + 1).padStart(2, '0')}: Ingested distractor "${fact.key} → ${fact.value}". Added superposition cross-talk.`,
      };
    });
  }, [history, facts, activeProbe, config.dimension, targetFact.value]);

  // Active slice for StateInspector
  const activeSlice = useMemo(() => {
    return matrix.map((row, idx) => row[idx % config.dimension] ?? 0);
  }, [matrix, config.dimension]);

  // Recovery execution in Sandbox mode
  const handleExecuteRecovery = () => {
    if (!learnerHypothesis) return;

    const beforeState = {
      prediction,
      confidence: retrievalScore,
      isCorrect,
      dim: config.dimension,
      ret: config.retention,
      dist: config.distractors,
    };

    let newDim = config.dimension;
    let newRet = config.retention;
    let newDist = config.distractors;
    let label = '';

    if (selectedIntervention === 'dim') {
      newDim = Math.min(config.dimension >= 16 ? 32 : 16, 32);
      label = `Increase dimension from D=${config.dimension} to D=${newDim}`;
    } else if (selectedIntervention === 'ret') {
      newRet = 0.98;
      label = `Increase retention rate from ${Math.round(config.retention * 100)}% to 98%`;
    } else {
      newDist = Math.max(1, Math.floor(config.distractors / 2));
      label = `Reduce distractors from ${config.distractors} to ${newDist}`;
    }

    // Apply config change to real engine
    handleConfigChange({ dimension: newDim, retention: newRet, distractors: newDist });

    setRecoveryResult({
      interventionLabel: label,
      userHypothesis: learnerHypothesis,
      before: beforeState,
      after: {
        prediction,
        confidence: retrievalScore,
        isCorrect,
        dim: newDim,
        ret: newRet,
        dist: newDist,
      },
    });
  };

  // Guided Step 5 Controlled experiment handler
  const handleGuidedControlledExperiment = (type: 'dim' | 'ret' | 'dist') => {
    setGuidedIntervention(type);
    setGuidedInterventionDone(true);
    if (type === 'dim') {
      updateConfig({ dimension: 32 });
    } else if (type === 'ret') {
      updateConfig({ retention: 0.5 });
    } else {
      // Reduce distractors
      resetExperiment();
    }
  };

  const quizOptions = [
    {
      id: 'A',
      text: 'The input facts were completely erased',
      isCorrect: false,
    },
    {
      id: 'B',
      text: 'Multiple outer-product updates collided in the fixed-size coordinate manifold',
      isCorrect: true,
    },
    {
      id: 'C',
      text: 'The query vector was corrupted by random noise',
      isCorrect: false,
    },
    {
      id: 'D',
      text: 'The memory system is incapable of storing any associations',
      isCorrect: false,
    },
  ];

  return (
    <div
      id={id}
      className="diagram-frame p-5 sm:p-7 text-[var(--text-primary)] space-y-7"
    >
      {/* ============================================================ */}
      {/* TOP BAR: REAL MODE SWITCHER & REPRODUCIBLE RUN ID */}
      {/* ============================================================ */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <EvidenceStrip type="live" detail="Real model engine" />
          <div className="flex items-center bg-[var(--surface-soft)] border border-[var(--border)] rounded-xl p-1">
            <button
              id="mode-toggle-guided"
              type="button"
              onClick={() => setMode('guided')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-sans transition-all cursor-pointer ${
                mode === 'guided'
                  ? 'bg-[var(--surface)] text-[var(--text-primary)] font-bold shadow-xs border border-[var(--border)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-[var(--accent-blue-text)]" />
              <span>Guided mode</span>
            </button>
            <button
              id="mode-toggle-sandbox"
              type="button"
              onClick={() => setMode('sandbox')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-sans transition-all cursor-pointer ${
                mode === 'sandbox'
                  ? 'bg-[var(--surface)] text-[var(--text-primary)] font-bold shadow-xs border border-[var(--border)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Wrench className="w-3.5 h-3.5 text-[var(--accent-blue-text)]" />
              <span>Sandbox mode</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-sans text-[var(--text-secondary)] hidden lg:inline">
            {mode === 'guided'
              ? 'Follow the experiment step by step.'
              : 'Change the system and test your own hypothesis.'}
          </div>
          <div className="flex items-center gap-2 font-sans text-xs text-[var(--text-secondary)]">
            <span>Run ID:</span>
            <span className="px-2 py-0.5 rounded bg-[var(--surface-soft)] border border-[var(--border)] text-[var(--text-primary)] font-mono font-semibold tabular-nums">
              {currentRunId}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODE 1: GUIDED MODE (5 SCIENTIFIC STAGES WITH LOCKING) */}
      {/* ============================================================ */}
      {mode === 'guided' && (
        <div className="space-y-6">
          {/* Progress Indicator: STEP 1 / 5 to STEP 5 / 5 */}
          <div className="research-callout p-4 sm:p-5 space-y-3 font-sans">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[var(--accent-blue-text)] flex items-center gap-1.5 tabular-nums">
                <Compass className="w-4 h-4 text-[var(--accent-blue-text)]" />
                Scientific protocol · Step {guidedStep} / 5
              </span>
              <button
                type="button"
                onClick={resetExperiment}
                className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset guided lab</span>
              </button>
            </div>

            {/* 5 Stages Progress Tracker */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {[
                { num: 1, name: 'Write' },
                { num: 2, name: 'Compress' },
                { num: 3, name: 'Probe' },
                { num: 4, name: 'Break' },
                { num: 5, name: 'Explain' },
              ].map((st) => {
                const isActive = guidedStep === st.num;
                const isDone = guidedCompleted[st.num - 1];
                const isLocked = st.num > 1 && !guidedCompleted[st.num - 2] && !isDone;

                return (
                  <button
                    key={st.num}
                    type="button"
                    disabled={isLocked}
                    onClick={() => setGuidedStep(st.num)}
                    className={`p-2 sm:p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isActive
                        ? 'border-[var(--color-accent)] bg-[var(--accent-blue)] text-[var(--accent-blue-text)] font-bold ring-1 ring-[var(--color-accent)]'
                        : isDone
                        ? 'border-[var(--color-success-border)] bg-[var(--accent-green)] text-[var(--accent-green-text)]'
                        : isLocked
                        ? 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] cursor-not-allowed opacity-60'
                        : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-xs tabular-nums">0{st.num}</span>
                      {isDone ? (
                        <CheckCircle2 className="w-3 h-3 text-[var(--accent-green-text)]" />
                      ) : isLocked ? (
                        <Lock className="w-3 h-3 text-[var(--text-muted)]" />
                      ) : null}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold truncate mt-1">
                      {st.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* -------------------------------------------------------- */}
          {/* STEP 1: WRITE */}
          {/* -------------------------------------------------------- */}
          {guidedStep === 1 && (
            <div className="research-callout p-5 sm:p-6 space-y-5 text-[var(--text-primary)]">
              <div className="space-y-1">
                <span className="text-xs font-sans text-[var(--accent-blue-text)] font-semibold">
                  Stage 01 · Writing initial associations
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                  Write base facts into a <GlossaryTerm term="recurrent state" className="text-[var(--text-primary)] hover:text-[var(--accent-blue-text)]">fixed-size recurrent state</GlossaryTerm>
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
                  In a recurrent memory architecture, facts are not stored in an expanding <GlossaryTerm term="kv-cache" className="text-[var(--text-primary)] hover:text-[var(--accent-blue-text)]">KV-cache</GlossaryTerm> list. Instead, each incoming association is mapped into vector representations and written as an <GlossaryTerm term="Hebbian plasticity" className="text-[var(--text-primary)] hover:text-[var(--accent-blue-text)]">outer-product update</GlossaryTerm> into a single recurrent state matrix <span className="font-mono text-[var(--accent-blue-text)] tabular-nums">{"M ∈ ℝ^(16×16)"}</span>.
                </p>
              </div>

              {/* Input stream preview */}
              <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3 font-sans text-xs">
                <div className="text-[var(--text-secondary)] text-xs font-semibold">
                  Canonical stream to write:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {INITIAL_FACTS.map((f, i) => (
                    <div key={i} className="metric-panel flex items-center justify-between">
                      <span className="text-[var(--text-primary)] font-semibold font-sans">{f.key}</span>
                      <span className="text-[var(--accent-blue-text)] font-bold font-mono">→ {f.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  id="guided-step1-write-btn"
                  type="button"
                  onClick={() => {
                    executeGuidedWrite();
                    completeGuidedStep(1);
                  }}
                  className="px-5 py-2.5 rounded-lg bg-[var(--accent-green)] hover:opacity-90 text-[var(--accent-green-text)] border border-[var(--color-success-border)] text-xs font-sans font-semibold flex items-center gap-2 cursor-pointer transition"
                >
                  <Database className="w-4 h-4" />
                  <span>Write facts into memory</span>
                </button>

                {guidedCompleted[0] && (
                  <button
                    type="button"
                    onClick={() => setGuidedStep(2)}
                    className="btn-primary text-xs"
                  >
                    <span>Next: Compress</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* STEP 2: COMPRESS */}
          {/* -------------------------------------------------------- */}
          {guidedStep === 2 && (
            <div className="research-callout p-5 sm:p-6 space-y-5 text-[var(--text-primary)]">
              <div className="space-y-1">
                <span className="text-xs font-sans text-[var(--accent-blue-text)] font-semibold">
                  Stage 02 · Coordinate superposition
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                  3 facts compressed into a single matrix manifold
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
                  Notice that the memory size has not grown. All 3 facts now superpose inside the same <span className="font-mono text-[var(--accent-blue-text)] tabular-nums">D=16</span> dimensional coordinates: <MathView math="M = \sum \eta k_t v_t^\top" />. The <GlossaryTerm term="Frobenius norm" className="text-[var(--text-primary)] hover:text-[var(--accent-yellow-text)]">Frobenius norm</GlossaryTerm> <span className="font-mono text-[var(--accent-yellow-text)] tabular-nums">||M||_F = {matrixNorm.toFixed(4)}</span> reflects the accumulated magnitude of written coordinates.
                </p>
              </div>

              {/* State Inspector / Heatmap */}
              <StateInspector
                history={history.map((h) => h.matrix)}
                currentState={activeSlice}
                dimension={config.dimension}
                currentStep={step}
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setGuidedStep(1)}
                  className="btn-secondary text-xs"
                >
                  Back to step 1
                </button>
                <button
                  id="guided-step2-next-btn"
                  type="button"
                  onClick={() => {
                    completeGuidedStep(2);
                    setGuidedStep(3);
                  }}
                  className="btn-primary text-xs"
                >
                  <span>Next: Probe memory</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* STEP 3: PROBE (PREDICTION BEFORE RESULT MANDATORY) */}
          {/* -------------------------------------------------------- */}
          {guidedStep === 3 && (
            <div className="research-callout p-5 sm:p-6 space-y-5 text-[var(--text-primary)]">
              <div className="space-y-1">
                <span className="text-xs font-sans text-[var(--accent-blue-text)] font-semibold">
                  Stage 03 · Hypothesis &amp; probe evaluation
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                  Formulate a prediction before probing the state
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
                  We will query the memory with key <strong className="text-[var(--text-primary)] font-mono">&quot;Japan&quot;</strong>. Will the superposed matrix readout project accurately onto <strong className="text-[var(--accent-green-text)] font-mono">&quot;Tokyo&quot;</strong> without interference?
                </p>
              </div>

              {/* Prediction Question Box */}
              <div className="p-4 sm:p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3 font-sans">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-primary)] font-semibold">Question: Will current memory retrieve &quot;Tokyo&quot;?</span>
                  <span className="text-xs text-[var(--accent-yellow-text)] bg-[var(--accent-yellow)] border border-[var(--color-warning-border)] px-2 py-0.5 rounded font-medium">
                    Prediction required
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    id="predict-correct-btn"
                    type="button"
                    onClick={() => setLearnerPrediction('correct')}
                    className={`p-3.5 rounded-lg border text-left flex items-center justify-between transition cursor-pointer font-sans text-xs ${
                      learnerPrediction === 'correct'
                        ? 'bg-[var(--accent-green)] border-[var(--color-success-border)] text-[var(--accent-green-text)] font-bold ring-1 ring-[var(--color-success)]'
                        : 'bg-[var(--surface-soft)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <span>Yes, retrieve correctly</span>
                    {learnerPrediction === 'correct' && <CheckCircle2 className="w-4 h-4 text-[var(--accent-green-text)]" />}
                  </button>

                  <button
                    id="predict-interfere-btn"
                    type="button"
                    onClick={() => setLearnerPrediction('interference')}
                    className={`p-3.5 rounded-lg border text-left flex items-center justify-between transition cursor-pointer font-sans text-xs ${
                      learnerPrediction === 'interference'
                        ? 'bg-[var(--accent-pink)] border-[var(--color-danger-border)] text-[var(--accent-pink-text)] font-bold ring-1 ring-[var(--color-danger)]'
                        : 'bg-[var(--surface-soft)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <span>No, interference occurs</span>
                    {learnerPrediction === 'interference' && <CheckCircle2 className="w-4 h-4 text-[var(--accent-pink-text)]" />}
                  </button>
                </div>

                {!learnerPrediction && (
                  <p className="text-xs text-[var(--accent-yellow-text)] font-sans">
                    * Make your prediction to unlock probe execution.
                  </p>
                )}
              </div>

              {/* Action: Run Probe */}
              <div className="flex items-center gap-3">
                <button
                  id="run-guided-probe-btn"
                  type="button"
                  disabled={!learnerPrediction}
                  onClick={() => {
                    executeGuidedProbe();
                    completeGuidedStep(3);
                  }}
                  className="px-5 py-2.5 rounded-lg bg-[var(--accent-green)] hover:opacity-90 text-[var(--accent-green-text)] border border-[var(--color-success-border)] disabled:opacity-40 disabled:cursor-not-allowed font-sans text-xs font-semibold flex items-center gap-2 cursor-pointer transition"
                >
                  <Eye className="w-4 h-4" />
                  <span>Run probe evaluation</span>
                </button>
              </div>

              {/* Computed Probe Results & Comparison (once executed) */}
              {guidedCompleted[2] && (
                <div className="space-y-4 pt-3 border-t border-[var(--border)] animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-sans tabular-nums">
                    <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                      <div className="text-xs text-[var(--text-secondary)]">Ground truth</div>
                      <div className="text-base font-bold text-[var(--text-primary)] font-mono mt-0.5">{groundTruth}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-[var(--accent-green)] border border-[var(--color-success-border)]">
                      <div className="text-xs text-[var(--accent-green-text)]">Model output</div>
                      <div className="text-base font-bold text-[var(--accent-green-text)] font-mono mt-0.5">{prediction}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                      <div className="text-xs text-[var(--text-secondary)]">Retrieval score</div>
                      <div className="text-base font-bold text-[var(--accent-blue-text)] font-mono mt-0.5">{retrievalScore.toFixed(4)}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                      <div className="text-xs text-[var(--text-secondary)]">Top-1 margin</div>
                      <div className="text-base font-bold text-[var(--accent-green-text)] font-mono mt-0.5">{top1Margin.toFixed(4)}</div>
                    </div>
                  </div>

                  {/* PREDICTION VS ACTUAL RESULT */}
                  <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2 text-xs font-sans">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-secondary)] font-semibold">Prediction vs. observed outcome:</span>
                      <span className="px-2 py-0.5 rounded bg-[var(--accent-green)] border border-[var(--color-success-border)] text-[var(--accent-green-text)] font-semibold text-xs">
                        Evaluation confirmed
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="metric-panel">
                        <span className="text-xs text-[var(--text-secondary)] block">Your prediction</span>
                        <div className="text-[var(--text-primary)] font-bold mt-0.5">
                          {learnerPrediction === 'correct' ? 'Correct Retrieval' : 'Interference'}
                        </div>
                      </div>
                      <div className="metric-panel">
                        <span className="text-xs text-[var(--text-secondary)] block">Actual outcome</span>
                        <div className="text-[var(--accent-green-text)] font-bold mt-0.5 font-mono tabular-nums">
                          {status} ({prediction} with score {retrievalScore.toFixed(3)})
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed pt-1">
                      Because only 3 facts were written into a <span className="font-mono text-[var(--accent-blue-text)] tabular-nums">D=16</span> dimensional space, vector keys remain largely quasi-orthogonal, leaving ample representational room for clean readout.
                    </p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setGuidedStep(4)}
                      className="btn-primary text-xs"
                    >
                      <span>Next: Induce interference</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* STEP 4: INDUCE INTERFERENCE */}
          {/* -------------------------------------------------------- */}
          {guidedStep === 4 && (
            <div className="rounded-xl border border-[var(--color-danger-border)] bg-[var(--surface-soft)] p-5 sm:p-6 space-y-5 text-[var(--text-primary)]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-sans font-semibold text-[var(--accent-pink-text)] bg-[var(--accent-pink)] border border-[var(--color-danger-border)] px-2.5 py-0.5 rounded flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-[var(--accent-pink-text)]" />
                    Stage 04 · Induced coordinate interference
                  </span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                  Add competing information to observe coordinate interference
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
                  Click below to inject distractor facts into the stream. Each click writes an outer-product update into the same fixed-size <span className="font-mono text-[var(--accent-blue-text)] tabular-nums">D=16</span> matrix. Watch the retrieval score and margin degrade until interference triggers.
                </p>
              </div>

              {/* Action: Add Distractor */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  id="add-guided-distractor-btn"
                  type="button"
                  onClick={() => {
                    addDistractor();
                    completeGuidedStep(4);
                  }}
                  className="px-5 py-2.5 rounded-lg bg-[var(--accent-pink)] hover:opacity-90 text-[var(--accent-pink-text)] border border-[var(--color-danger-border)] text-xs font-sans font-semibold flex items-center gap-2 cursor-pointer transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add distractor fact</span>
                </button>
                <span className="text-xs font-sans text-[var(--text-secondary)] tabular-nums">
                  Active stream facts: <strong className="text-[var(--text-primary)] font-mono">{facts.length}</strong>
                </span>
              </div>

              {/* Real Computed Before vs After */}
              {beforeAfterDistractor && (
                <div className="p-4 sm:p-5 rounded-xl bg-[var(--surface)] border border-[var(--color-danger-border)] space-y-3 font-sans text-xs animate-in fade-in">
                  <div className="flex items-center justify-between text-xs border-b border-[var(--border)] pb-2">
                    <span className="text-[var(--accent-pink-text)] font-semibold">
                      Injected: {beforeAfterDistractor.distractor.key} → {beforeAfterDistractor.distractor.value}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">
                      Target probe: &quot;{activeProbe || 'Japan'}&quot;
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-sans tabular-nums">
                    <div className="metric-panel">
                      <span className="text-xs text-[var(--text-secondary)] block">Prediction</span>
                      <div className="font-bold font-mono mt-1">
                        <span className="text-[var(--text-secondary)]">{beforeAfterDistractor.before.prediction}</span>
                        <span className="mx-1 text-[var(--text-muted)]">→</span>
                        <span className={isCorrect ? 'text-[var(--accent-green-text)]' : 'text-[var(--accent-pink-text)]'}>
                          {beforeAfterDistractor.after.prediction}
                        </span>
                      </div>
                    </div>

                    <div className="metric-panel">
                      <span className="text-xs text-[var(--text-secondary)] block">Retrieval score</span>
                      <div className="font-bold font-mono mt-1">
                        <span className="text-[var(--text-secondary)]">{beforeAfterDistractor.before.retrievalScore.toFixed(3)}</span>
                        <span className="mx-1 text-[var(--text-muted)]">→</span>
                        <span className="text-[var(--accent-blue-text)]">{beforeAfterDistractor.after.retrievalScore.toFixed(3)}</span>
                      </div>
                    </div>

                    <div className="metric-panel">
                      <span className="text-xs text-[var(--text-secondary)] block">Top-1 margin</span>
                      <div className="font-bold font-mono mt-1">
                        <span className="text-[var(--text-secondary)]">{beforeAfterDistractor.before.top1Margin.toFixed(3)}</span>
                        <span className="mx-1 text-[var(--text-muted)]">→</span>
                        <span className={beforeAfterDistractor.after.top1Margin < 0.1 ? 'text-[var(--accent-pink-text)]' : 'text-[var(--accent-yellow-text)]'}>
                          {beforeAfterDistractor.after.top1Margin.toFixed(3)}
                        </span>
                      </div>
                    </div>

                    <div className="metric-panel">
                      <span className="text-xs text-[var(--text-secondary)] block">Outcome</span>
                      <div className="font-bold mt-1 text-xs">
                        {status === 'Correct' ? (
                          <span className="text-[var(--accent-green-text)]">Correct (Margin reduced)</span>
                        ) : (
                          <span className="text-[var(--accent-pink-text)]">Interference triggered</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setGuidedStep(3)}
                  className="btn-secondary text-xs"
                >
                  Back to step 3
                </button>
                <button
                  id="guided-step4-next-btn"
                  type="button"
                  onClick={() => {
                    completeGuidedStep(4);
                    setGuidedStep(5);
                  }}
                  className="btn-primary text-xs"
                >
                  <span>Next: Explain &amp; controlled lab</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* STEP 5: EXPLAIN & CONTROLLED EXPERIMENT */}
          {/* -------------------------------------------------------- */}
          {guidedStep === 5 && (
            <div className="research-callout p-5 sm:p-6 space-y-6 text-[var(--text-primary)]">
              <div className="space-y-1">
                <span className="text-xs font-sans text-[var(--accent-blue-text)] font-semibold">
                  Stage 05 · Scientific interpretation &amp; isolated variables
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                  Controlled variable experiment
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
                  In a rigorous scientific inquiry, we change <strong className="text-[var(--text-primary)]">one meaningful variable at a time</strong> to identify causal relationships. Select one variable below to isolate its effect:
                </p>
              </div>

              {/* Controlled Variable Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans text-xs tabular-nums">
                <button
                  type="button"
                  onClick={() => handleGuidedControlledExperiment('dim')}
                  className={`p-3.5 rounded-lg border text-left transition cursor-pointer ${
                    guidedIntervention === 'dim'
                      ? 'border-[var(--color-accent)] bg-[var(--accent-blue)] text-[var(--accent-blue-text)] font-semibold ring-1 ring-[var(--color-accent)]'
                      : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <div className="font-bold">Increase Dimension (D)</div>
                  <div className="text-xs opacity-75 mt-0.5 font-mono">D={config.dimension} → D=32</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleGuidedControlledExperiment('ret')}
                  className={`p-3.5 rounded-lg border text-left transition cursor-pointer ${
                    guidedIntervention === 'ret'
                      ? 'border-[var(--color-accent)] bg-[var(--accent-blue)] text-[var(--accent-blue-text)] font-semibold ring-1 ring-[var(--color-accent)]'
                      : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <div className="font-bold">Lower Retention (λ)</div>
                  <div className="text-xs opacity-75 mt-0.5 font-mono">λ={Math.round(config.retention * 100)}% → λ=50%</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleGuidedControlledExperiment('dist')}
                  className={`p-3.5 rounded-lg border text-left transition cursor-pointer ${
                    guidedIntervention === 'dist'
                      ? 'border-[var(--color-accent)] bg-[var(--accent-blue)] text-[var(--accent-blue-text)] font-semibold ring-1 ring-[var(--color-accent)]'
                      : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <div className="font-bold">Clear Distractors</div>
                  <div className="text-xs opacity-75 mt-0.5 font-mono">N={facts.length} → N=3 base facts</div>
                </button>
              </div>

              {/* WHAT CHANGED? WHY IT MATTERS? OBSERVED RESULT? */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans text-xs">
                <div className="p-3.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] space-y-1">
                  <span className="text-xs text-[var(--accent-blue-text)] font-bold">What changed?</span>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {guidedIntervention === 'dim'
                      ? 'Expanded state capacity to D=32.'
                      : guidedIntervention === 'ret'
                      ? 'Reduced decay factor to λ=0.50.'
                      : 'Removed all competing distractors.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] space-y-1">
                  <span className="text-xs text-[var(--accent-yellow-text)] font-bold">Why it matters</span>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {guidedIntervention === 'dim'
                      ? 'Higher dimensions increase near-orthogonal vector capacity exponentially.'
                      : guidedIntervention === 'ret'
                      ? 'Low retention causes early associations to vanish rapidly.'
                      : 'Uncrowded states experience minimal coordinate overlap.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] space-y-1 tabular-nums">
                  <span className="text-xs text-[var(--accent-green-text)] font-bold">Observed result</span>
                  <p className="text-xs text-[var(--text-primary)] font-bold font-mono mt-0.5">
                    {prediction} (Score: {retrievalScore.toFixed(3)}, Status: {status})
                  </p>
                </div>
              </div>

              {/* Scientific Interpretation */}
              <div className="p-4 sm:p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2">
                <h4 className="font-serif font-bold text-base text-[var(--text-primary)]">
                  Scientific conclusion
                </h4>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
                  {status === 'Interference'
                    ? 'Adding competing facts into the fixed-size recurrent state caused coordinate superposition overlap. The projected readout vector projected closer to a distractor candidate than the target association.'
                    : 'Additional information reduced the top-1 margin, but the representational capacity was sufficient to preserve the target association.'}
                </p>
              </div>

              {/* Quiz: Why did it fail? */}
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
                  <HelpCircle className="w-4 h-4 text-[var(--accent-blue-text)]" />
                  <h4 className="text-sm font-serif font-bold text-[var(--text-primary)]">Inquiry: Why did retrieval change?</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-sans text-xs">
                  {quizOptions.map((opt) => {
                    const isSelected = selectedQuizAnswer === opt.id;
                    let btnClass = 'border-[var(--border)] bg-[var(--surface-soft)] hover:bg-[var(--color-surface-muted)] text-[var(--text-primary)]';

                    if (quizRevealed) {
                      if (opt.isCorrect) {
                        btnClass = 'border-[var(--color-success-border)] bg-[var(--accent-green)] text-[var(--accent-green-text)] font-bold';
                      } else if (isSelected && !opt.isCorrect) {
                        btnClass = 'border-[var(--color-danger-border)] bg-[var(--accent-pink)] text-[var(--accent-pink-text)]';
                      } else {
                        btnClass = 'border-[var(--border)] bg-[var(--surface-soft)] opacity-50 text-[var(--text-muted)]';
                      }
                    }

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setSelectedQuizAnswer(opt.id);
                          setQuizRevealed(true);
                        }}
                        className={`p-3.5 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${btnClass}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-md bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-xs text-[var(--text-primary)] font-bold shrink-0 font-mono">
                            {opt.id}
                          </span>
                          <span>{opt.text}</span>
                        </div>
                        {quizRevealed && opt.isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-[var(--accent-green-text)] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {quizRevealed && (
                  <div className="p-4 rounded-lg bg-[var(--accent-green)] border border-[var(--color-success-border)] space-y-1 animate-in fade-in">
                    <div className="flex items-center gap-2 font-sans font-bold text-xs text-[var(--accent-green-text)]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Observation verified</span>
                    </div>
                    <p className="text-xs text-[var(--accent-green-text)] font-sans leading-relaxed">
                      Fixed-size recurrent state vectors rely on superposition. As competing associations accumulate, the inner-product readout begins cross-talking with distractor coordinate projections.
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={resetExperiment}
                  className="btn-secondary text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restart guided lesson</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('sandbox')}
                  className="btn-primary text-xs"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Switch to sandbox mode</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODE 2: SANDBOX MODE (FREE EXPERIMENTATION & COMPARISON) */}
      {/* ============================================================ */}
      {mode === 'sandbox' && (
        <div className="space-y-6">
          {/* Preset Toolbar */}
          <div className="research-callout p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-secondary)] font-semibold flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[var(--accent-blue-text)]" />
                Sandbox presets
              </span>
              <span className="text-xs text-[var(--text-secondary)]">Deterministic parameters</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              {[
                { key: 'clean', name: 'Clean memory', sub: 'D=16, λ=0.95, low noise' },
                { key: 'stress', name: 'Pressure test', sub: 'D=8, λ=0.95, 8 distractors' },
                { key: 'forget', name: 'Forgetting', sub: 'D=16, λ=0.55, decay' },
                { key: 'capacity', name: 'High capacity', sub: 'D=32, λ=0.95' },
              ].map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => applyPreset(p.key)}
                  className="p-3 rounded-lg bg-[var(--surface)] hover:bg-[var(--color-surface-muted)] border border-[var(--border)] text-left transition cursor-pointer"
                >
                  <div className="font-semibold text-[var(--text-primary)] text-xs">{p.name}</div>
                  <div className="text-xs font-mono text-[var(--text-secondary)] mt-0.5 tabular-nums">{p.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Parameter Panel */}
          <div className="diagram-frame p-5 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
              <span className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[var(--accent-blue-text)]" />
                System parameter controls
              </span>
              <span className="text-xs font-sans text-[var(--text-secondary)]">
                Sliders directly trigger real-time recalculations
              </span>
            </div>

            {/* Parameter Delta */}
            {prevParams && (
              <ParameterDelta
                prev={prevParams}
                curr={{
                  dimension: config.dimension,
                  retention: config.retention,
                  distractors: config.distractors,
                }}
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs tabular-nums">
              {/* 1. Dimension */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-secondary)] font-medium" title="Coordinate capacity of the recurrent state space">
                    Dimension (D)
                  </span>
                  <span className="font-mono text-xs font-semibold bg-[var(--accent-blue)] text-[var(--accent-blue-text)] border border-[var(--border)] px-2 py-0.5 rounded">
                    D = {config.dimension}
                  </span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="32"
                  step="4"
                  value={config.dimension}
                  onChange={(e) => handleConfigChange({ dimension: Number(e.target.value) })}
                  className="w-full h-1.5 bg-[var(--color-surface-muted)] rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"
                />
                <div className="flex justify-between text-xs font-mono text-[var(--text-secondary)]">
                  <span>4</span>
                  <span>16</span>
                  <span>32</span>
                </div>
              </div>

              {/* 2. Retention */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-secondary)] font-medium" title="Fraction of state carried forward: M_{t+1} = \lambda M_t + ...">
                    Retention (λ)
                  </span>
                  <span className="font-mono text-xs font-semibold bg-[var(--accent-green)] text-[var(--accent-green-text)] border border-[var(--color-success-border)] px-2 py-0.5 rounded">
                    {Math.round(config.retention * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={config.retention}
                  onChange={(e) => handleConfigChange({ retention: Number(e.target.value) })}
                  className="w-full h-1.5 bg-[var(--color-surface-muted)] rounded-lg appearance-none cursor-pointer accent-[var(--color-success)]"
                />
                <div className="flex justify-between text-xs font-mono text-[var(--text-secondary)]">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* 3. Write Strength */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-secondary)] font-medium" title="Magnitude of outer product updates \eta k_t v_t^\top">
                    Write strength (η)
                  </span>
                  <span className="font-mono text-xs font-semibold bg-[var(--surface-soft)] text-[var(--text-primary)] border border-[var(--border)] px-2 py-0.5 rounded">
                    η = {config.writeStrength.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.1"
                  value={config.writeStrength}
                  onChange={(e) => handleConfigChange({ writeStrength: Number(e.target.value) })}
                  className="w-full h-1.5 bg-[var(--color-surface-muted)] rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"
                />
                <div className="flex justify-between text-xs font-mono text-[var(--text-secondary)]">
                  <span>0.1</span>
                  <span>1.0</span>
                  <span>2.0</span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border)]">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  id="sandbox-step-btn"
                  type="button"
                  onClick={runStep}
                  className="px-3 py-1.5 rounded-lg bg-[var(--accent-green)] hover:opacity-90 text-[var(--accent-green-text)] border border-[var(--color-success-border)] text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition tabular-nums"
                  title="Execute exactly one memory write transition"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  <span>Step (t={step})</span>
                </button>

                <button
                  id="sandbox-play-btn"
                  type="button"
                  onClick={togglePlay}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition ${
                    isRunning
                      ? 'bg-[var(--accent-yellow)] border-[var(--color-warning-border)] text-[var(--accent-yellow-text)]'
                      : 'bg-[var(--surface)] hover:bg-[var(--surface-soft)] border-[var(--border)] text-[var(--text-primary)]'
                  }`}
                >
                  {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isRunning ? 'Pause' : 'Auto-play'}</span>
                </button>

                <button
                  id="sandbox-distractor-btn"
                  type="button"
                  onClick={addDistractor}
                  className="btn-secondary text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add distractor</span>
                </button>

                <button
                  id="sandbox-reset-btn"
                  type="button"
                  onClick={resetExperiment}
                  className="utility-button text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Probe Selector */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[var(--text-secondary)] text-xs uppercase font-medium">Probe:</span>
                <div className="flex flex-wrap items-center gap-1 font-mono">
                  {facts.slice(0, 4).map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setActiveProbe(f.key)}
                      className={`px-2.5 py-1 rounded-md border text-xs font-medium transition cursor-pointer ${
                        activeProbe === f.key
                          ? 'bg-[var(--accent-blue)] border-[var(--color-accent)] text-[var(--accent-blue-text)] font-semibold'
                          : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {f.key}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Real-Time Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs tabular-nums">
            <div className="p-3.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
              <div className="text-xs text-[var(--text-secondary)] uppercase font-medium">Ground truth</div>
              <div className="text-lg font-serif font-semibold text-[var(--text-primary)] mt-0.5">
                {groundTruth} <span className="font-sans text-xs text-[var(--text-secondary)]">({activeProbe || 'Japan'})</span>
              </div>
            </div>

            <div
              className={`p-3.5 rounded-lg border ${
                isCorrect
                  ? 'bg-[var(--accent-green)] border-[var(--color-success-border)] text-[var(--accent-green-text)]'
                  : 'bg-[var(--accent-pink)] border-[var(--color-danger-border)] text-[var(--accent-pink-text)]'
              }`}
            >
              <div className="flex items-center justify-between text-xs uppercase font-medium">
                <span>Model output</span>
                {isCorrect ? (
                  <span className="text-[var(--accent-green-text)] font-semibold">✓ Correct</span>
                ) : (
                  <span className="text-[var(--accent-pink-text)] font-semibold">Interference detected</span>
                )}
              </div>
              <div className="text-lg font-serif font-semibold mt-0.5 text-[var(--text-primary)]">
                {prediction}
              </div>
            </div>

            <div
              className="p-3.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]"
              title="Cosine similarity between the retrieved representation and a candidate value representation. This is not a calibrated probability."
            >
              <div className="text-xs text-[var(--text-secondary)] uppercase font-medium">Retrieval score</div>
              <div className="text-lg font-mono font-semibold text-[var(--accent-blue-text)] mt-0.5">
                {retrievalScore.toFixed(4)}
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
              <div className="text-xs text-[var(--text-secondary)] uppercase font-medium">Top-1 margin</div>
              <div className={`text-lg font-mono font-semibold mt-0.5 ${top1Margin > 0.2 ? 'text-[var(--accent-green-text)]' : 'text-[var(--accent-pink-text)]'}`}>
                {top1Margin.toFixed(4)}
              </div>
            </div>
          </div>

          {/* State Heatmap Inspector */}
          <StateInspector
            history={history.map((h) => h.matrix)}
            currentState={activeSlice}
            dimension={config.dimension}
            currentStep={step}
          />

          {/* ============================================================ */}
          {/* SANDBOX COMPARISON: CURRENT RUN vs BASELINE (Section 19) */}
          {/* ============================================================ */}
          <div className="diagram-frame p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-[var(--accent-blue-text)]" />
                <h4 className="font-serif font-bold text-base text-[var(--text-primary)]">
                  Current run vs baseline
                </h4>
              </div>
              <button
                id="save-baseline-btn"
                type="button"
                onClick={saveBaseline}
                className="btn-secondary text-xs"
              >
                <Bookmark className="w-3.5 h-3.5 text-[var(--accent-blue-text)]" />
                <span>{baseline ? 'Update baseline' : 'Save as baseline'}</span>
              </button>
            </div>

            {comparisonDiff ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs tabular-nums">
                <div className="metric-panel">
                  <span className="text-xs text-[var(--text-secondary)] block">Cosine similarity</span>
                  <div className="text-base font-mono font-bold text-[var(--accent-blue-text)] mt-0.5">
                    {comparisonDiff.stateCosineSimilarity.toFixed(4)}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mt-0.5">Vector alignment</div>
                </div>

                <div className="metric-panel">
                  <span className="text-xs text-[var(--text-secondary)] block">Δ Retrieval score</span>
                  <div
                    className={`text-base font-mono font-bold mt-0.5 flex items-center gap-1 ${
                      comparisonDiff.scoreDiff >= 0 ? 'text-[var(--accent-green-text)]' : 'text-[var(--accent-pink-text)]'
                    }`}
                  >
                    {comparisonDiff.scoreDiff >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{comparisonDiff.scoreDiff >= 0 ? '+' : ''}{comparisonDiff.scoreDiff.toFixed(4)}</span>
                  </div>
                  <div className="text-xs font-mono text-[var(--text-secondary)] mt-0.5">vs {comparisonDiff.baseScore.toFixed(3)}</div>
                </div>

                <div className="metric-panel">
                  <span className="text-xs text-[var(--text-secondary)] block">Δ Top-1 margin</span>
                  <div
                    className={`text-base font-mono font-bold mt-0.5 flex items-center gap-1 ${
                      comparisonDiff.marginDiff >= 0 ? 'text-[var(--accent-green-text)]' : 'text-[var(--accent-pink-text)]'
                    }`}
                  >
                    {comparisonDiff.marginDiff >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{comparisonDiff.marginDiff >= 0 ? '+' : ''}{comparisonDiff.marginDiff.toFixed(4)}</span>
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mt-0.5">Confidence margin</div>
                </div>

                <div className="metric-panel">
                  <span className="text-xs text-[var(--text-secondary)] block">Δ Matrix norm</span>
                  <div className="text-base font-mono font-bold text-[var(--accent-yellow-text)] mt-0.5">
                    {comparisonDiff.matrixNormDiff >= 0 ? '+' : ''}{comparisonDiff.matrixNormDiff.toFixed(4)}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mt-0.5">Frobenius energy</div>
                </div>

                <div className="metric-panel">
                  <span className="text-xs text-[var(--text-secondary)] block">Prediction shift</span>
                  <div className="text-xs font-bold mt-1 truncate">
                    {comparisonDiff.predictionChanged ? (
                      <span className="text-[var(--accent-pink-text)]">
                        {comparisonDiff.basePrediction} → {comparisonDiff.currPrediction}
                      </span>
                    ) : (
                      <span className="text-[var(--accent-green-text)]">Unchanged ({comparisonDiff.currPrediction})</span>
                    )}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mt-0.5">Argmax outcome</div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[var(--text-secondary)] font-sans italic">
                No baseline saved yet. Click &quot;Save as baseline&quot; to lock in current parameters and compare future adjustments.
              </p>
            )}
          </div>

          {/* ============================================================ */}
          {/* SANDBOX EXPERIMENT HISTORY (Section 20) */}
          {/* ============================================================ */}
          {historyRuns.length > 0 && (
            <div className="diagram-frame p-5 space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-[var(--border)] pb-2.5">
                <span className="text-[var(--text-secondary)] font-semibold flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-[var(--accent-blue-text)]" />
                  Experiment run history
                </span>
                <span className="text-xs text-[var(--text-secondary)] tabular-nums">
                  {historyRuns.length} recorded snapshot{historyRuns.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {historyRuns.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => selectHistoricalRun(r.id)}
                    className="w-full p-2.5 rounded-lg bg-[var(--surface-soft)] hover:bg-[var(--color-surface-muted)] border border-[var(--border)] flex items-center justify-between text-xs transition cursor-pointer text-left tabular-nums"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[var(--accent-blue-text)] font-semibold">{r.label}</span>
                      <span className="text-[var(--text-secondary)] text-xs">({r.timestamp})</span>
                      <span className="font-mono text-[var(--text-secondary)] text-xs">
                        D={r.config.dimension} λ={Math.round(r.config.retention * 100)}%
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[var(--text-secondary)]">&quot;{r.probe}&quot; → <strong className="text-[var(--text-primary)]">{r.prediction}</strong></span>
                      <span className="font-mono text-[var(--accent-blue-text)] text-xs">{r.retrievalScore.toFixed(3)}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                          r.status === 'Correct'
                            ? 'bg-[var(--accent-green)] text-[var(--accent-green-text)]'
                            : 'bg-[var(--accent-pink)] text-[var(--accent-pink-text)]'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Failure Trace Drawer (if toggled) */}
          {showFailureTrace && (
            <FailureTrace
              steps={recordedTraceSteps}
              dimension={config.dimension}
              groundTruth={groundTruth}
              targetKey={activeProbe || 'Japan'}
              finalPrediction={prediction}
              finalConfidence={retrievalScore}
              onClose={() => setShowFailureTrace(false)}
            />
          )}

          {/* Failure Alert Box & Trace Trigger */}
          {!isCorrect && (
            <div className="rounded-xl border border-[var(--color-danger-border)] bg-[var(--accent-pink)] p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-danger-border)] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--color-danger-border)] text-[var(--accent-pink-text)]">
                    <AlertOctagon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs uppercase text-[var(--accent-pink-text)] font-semibold tracking-wider">
                      Observed anomaly
                    </div>
                    <h4 className="text-base font-serif font-semibold text-[var(--text-primary)]">Interference detected</h4>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowFailureTrace(!showFailureTrace)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-soft)] border border-[var(--color-danger-border)] text-[var(--accent-pink-text)] text-xs font-semibold transition cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{showFailureTrace ? 'Hide trace' : 'Trace interference'}</span>
                </button>
              </div>

              <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
                Querying for <em>&quot;{activeProbe || 'Japan'}&quot;</em> projected strongest onto <em>&quot;{prediction}&quot;</em> instead of <em>&quot;{groundTruth}&quot;</em> due to coordinate superposition overlap in the fixed-size <span className="tabular-nums">{config.dimension}×{config.dimension}</span> state space.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Epistemic Boundary Component */}
      <div className="pt-2">
        <ClaimEvidenceLimitation
          claim="Increasing competing information can reduce retrieval quality in this educational model."
          evidence="Live deterministic associative memory computation over ℝ^D."
          limitation="This demonstrates parametric superposition behavior in a simplified educational model; it does not establish a universal capacity law across all recurrent architectures."
        />
      </div>
    </div>
  );
};

export default DiscoveryMode;

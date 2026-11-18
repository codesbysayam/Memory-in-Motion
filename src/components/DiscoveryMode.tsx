import React, { useState, useMemo } from 'react';
import { Fact } from '../models/associativeMemory';
import { StateInspector } from './StateInspector';
import { FailureTrace, RecordedTraceStep } from './FailureTrace';
import { EvidenceStrip } from './ui/EvidenceStrip';
import { ParameterDelta } from './ParameterDelta';
import { ClaimEvidenceLimitation } from './ClaimEvidenceLimitation';
import { FigureCaption } from './essay/FigureCaption';
import { useExperiment, INITIAL_FACTS } from '../context/ExperimentContext';
import { GlossaryTerm } from './GlossaryTerm';
import { MathView } from './ui/MathView';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  AlertOctagon,
  Sliders,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  Flame,
  Search,
  Wrench,
  Compass,
  Lock,
  Bookmark,
  TrendingDown,
  TrendingUp,
  History,
  Database,
  Eye,
  Plus,
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
    <figure
      id={id}
      className="essay-figure-stage p-5 sm:p-7 text-[var(--text-primary)] space-y-6"
    >
      {/* TOP BAR: MODE SWITCHER & REPRODUCIBLE RUN ID */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--mm-rule)] pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <EvidenceStrip type="live" detail="Real model engine" />
          <div className="flex items-center border-b border-[var(--mm-rule)]">
            <button
              id="mode-toggle-guided"
              type="button"
              onClick={() => setMode('guided')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-sans transition-colors cursor-pointer border-b-2 -mb-[1px] ${
                mode === 'guided'
                  ? 'border-[var(--mm-signal)] text-[var(--mm-ink)] font-semibold'
                  : 'border-transparent text-[var(--mm-muted)] hover:text-[var(--mm-ink)]'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-[var(--mm-signal)]" />
              <span>Guided protocol</span>
            </button>
            <button
              id="mode-toggle-sandbox"
              type="button"
              onClick={() => setMode('sandbox')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-sans transition-colors cursor-pointer border-b-2 -mb-[1px] ${
                mode === 'sandbox'
                  ? 'border-[var(--mm-signal)] text-[var(--mm-ink)] font-semibold'
                  : 'border-transparent text-[var(--mm-muted)] hover:text-[var(--mm-ink)]'
              }`}
            >
              <Wrench className="w-3.5 h-3.5 text-[var(--mm-signal)]" />
              <span>Free sandbox</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-sans text-[var(--mm-muted)] hidden lg:inline">
            {mode === 'guided'
              ? 'Follow the experiment step by step.'
              : 'Vary parameters and isolate causal effects.'}
          </span>
          <span className="font-mono text-xs text-[var(--mm-muted)] tabular-nums">
            Run <strong className="text-[var(--mm-ink)]">{currentRunId}</strong>
          </span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODE 1: GUIDED MODE (5 SCIENTIFIC STAGES WITH LOCKING) */}
      {/* ============================================================ */}
      {mode === 'guided' && (
        <div className="space-y-6">
          {/* Progress Indicator: STEP 1 / 5 to STEP 5 / 5 */}
          <div className="pb-4 border-b border-[var(--mm-rule)] space-y-3 font-sans">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--mm-signal)] font-semibold flex items-center gap-1.5 tabular-nums">
                <Compass className="w-3.5 h-3.5" />
                Protocol · Step {guidedStep} / 5
              </span>
              <button
                type="button"
                onClick={resetExperiment}
                className="flex items-center gap-1.5 text-xs text-[var(--mm-muted)] hover:text-[var(--mm-ink)] transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset guided lab</span>
              </button>
            </div>

            {/* 5 Stages Progress Tracker (Hairline) */}
            <div className="grid grid-cols-5 border border-[var(--mm-rule)] divide-x divide-[var(--mm-rule)] rounded-md overflow-hidden bg-[var(--mm-paper-bright)]">
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
                    className={`p-2 sm:p-2.5 text-left transition cursor-pointer flex flex-col justify-between ${
                      isActive
                        ? 'bg-[var(--accent-blue)] text-[var(--accent-blue-text)] font-bold'
                        : isDone
                        ? 'bg-[var(--accent-green)]/50 text-[var(--accent-green-text)]'
                        : isLocked
                        ? 'text-[var(--text-muted)] cursor-not-allowed opacity-55'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)]'
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
            <div className="space-y-5 text-[var(--text-primary)]">
              <div className="space-y-1">
                <span className="text-xs font-mono text-[var(--mm-signal)] font-semibold">
                  Stage 01 · Writing initial associations
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-medium text-[var(--text-primary)]">
                  Write base facts into a <GlossaryTerm term="recurrent state" className="text-[var(--text-primary)] hover:text-[var(--accent-blue-text)]">fixed-size recurrent state</GlossaryTerm>
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
                  In a recurrent memory architecture, facts are not stored in an expanding <GlossaryTerm term="kv-cache" className="text-[var(--text-primary)] hover:text-[var(--accent-blue-text)]">KV-cache</GlossaryTerm> list. Instead, each incoming association is mapped into vector representations and written as an <GlossaryTerm term="Hebbian plasticity" className="text-[var(--text-primary)] hover:text-[var(--accent-blue-text)]">outer-product update</GlossaryTerm> into a single recurrent state matrix <span className="font-mono text-[var(--accent-blue-text)] tabular-nums">{"M ∈ ℝ^(16×16)"}</span>.
                </p>
              </div>

              {/* Input stream preview (Hairline strip) */}
              <div className="space-y-2 pt-2 border-t border-[var(--mm-rule)] font-sans text-xs">
                <div className="text-[var(--text-muted)] text-xs font-mono uppercase tracking-wider">
                  Canonical stream to write
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[var(--mm-rule)] border-y border-[var(--mm-rule)]">
                  {INITIAL_FACTS.map((f, i) => (
                    <div key={i} className="py-2.5 sm:px-3 first:sm:pl-0 last:sm:pr-0 flex items-center justify-between">
                      <span className="text-[var(--text-primary)] font-semibold font-sans">{f.key}</span>
                      <span className="text-[var(--mm-signal)] font-bold font-mono">→ {f.value}</span>
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
                  className="px-5 py-2.5 rounded-md bg-[var(--accent-green)] hover:opacity-90 text-[var(--accent-green-text)] border border-[var(--color-success-border)] text-xs font-sans font-semibold flex items-center gap-2 cursor-pointer transition"
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
            <div className="space-y-5 text-[var(--text-primary)]">
              <div className="space-y-1">
                <span className="text-xs font-mono text-[var(--mm-signal)] font-semibold">
                  Stage 02 · Coordinate superposition
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-medium text-[var(--text-primary)]">
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
            <div className="space-y-5 text-[var(--text-primary)]">
              <div className="space-y-1">
                <span className="text-xs font-mono text-[var(--mm-signal)] font-semibold">
                  Stage 03 · Hypothesis &amp; probe evaluation
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-medium text-[var(--text-primary)]">
                  Formulate a prediction before probing the state
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
                  We will query the memory with key <strong className="text-[var(--text-primary)] font-mono">&quot;Japan&quot;</strong>. Will the superposed matrix readout project accurately onto <strong className="text-[var(--accent-green-text)] font-mono">&quot;Tokyo&quot;</strong> without interference?
                </p>
              </div>

              {/* Prediction Question Block (Hairline) */}
              <div className="pt-4 border-t border-[var(--mm-rule)] space-y-3 font-sans">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-primary)] font-semibold">Question: Will current memory retrieve &quot;Tokyo&quot;?</span>
                  <span className="text-xs text-[var(--accent-yellow-text)] font-mono">
                    Prediction required
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    id="predict-correct-btn"
                    type="button"
                    onClick={() => setLearnerPrediction('correct')}
                    className={`p-3 rounded-md border text-left flex items-center justify-between transition cursor-pointer font-sans text-xs ${
                      learnerPrediction === 'correct'
                        ? 'bg-[var(--accent-green)] border-[var(--color-success-border)] text-[var(--accent-green-text)] font-bold'
                        : 'bg-[var(--surface-soft)] border-[var(--mm-rule)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <span>Yes, retrieve correctly</span>
                    {learnerPrediction === 'correct' && <CheckCircle2 className="w-4 h-4 text-[var(--accent-green-text)]" />}
                  </button>

                  <button
                    id="predict-interfere-btn"
                    type="button"
                    onClick={() => setLearnerPrediction('interference')}
                    className={`p-3 rounded-md border text-left flex items-center justify-between transition cursor-pointer font-sans text-xs ${
                      learnerPrediction === 'interference'
                        ? 'bg-[var(--accent-pink)] border-[var(--color-danger-border)] text-[var(--accent-pink-text)] font-bold'
                        : 'bg-[var(--surface-soft)] border-[var(--mm-rule)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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
                  className="px-5 py-2.5 rounded-md bg-[var(--accent-green)] hover:opacity-90 text-[var(--accent-green-text)] border border-[var(--color-success-border)] disabled:opacity-40 disabled:cursor-not-allowed font-sans text-xs font-semibold flex items-center gap-2 cursor-pointer transition"
                >
                  <Eye className="w-4 h-4" />
                  <span>Run probe evaluation</span>
                </button>
              </div>

              {/* Computed Probe Results & Comparison (Hairline) */}
              {guidedCompleted[2] && (
                <div className="space-y-4 pt-4 border-t border-[var(--mm-rule)] animate-in fade-in">
                  <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--mm-rule)] border-y border-[var(--mm-rule)] text-xs font-sans tabular-nums">
                    <div className="py-3 sm:pr-4">
                      <div className="text-xs text-[var(--text-muted)] font-mono uppercase">Ground truth</div>
                      <div className="text-base font-bold text-[var(--text-primary)] font-mono mt-0.5">{groundTruth}</div>
                    </div>
                    <div className="py-3 sm:px-4">
                      <div className="text-xs text-[var(--accent-green-text)] font-mono uppercase">Model output</div>
                      <div className="text-base font-bold text-[var(--accent-green-text)] font-mono mt-0.5">{prediction}</div>
                    </div>
                    <div className="py-3 sm:px-4">
                      <div className="text-xs text-[var(--text-muted)] font-mono uppercase">Retrieval score</div>
                      <div className="text-base font-bold text-[var(--mm-signal)] font-mono mt-0.5">{retrievalScore.toFixed(4)}</div>
                    </div>
                    <div className="py-3 sm:pl-4">
                      <div className="text-xs text-[var(--text-muted)] font-mono uppercase">Top-1 margin</div>
                      <div className="text-base font-bold text-[var(--accent-green-text)] font-mono mt-0.5">{top1Margin.toFixed(4)}</div>
                    </div>
                  </div>

                  {/* PREDICTION VS ACTUAL RESULT */}
                  <div className="space-y-2.5 text-xs font-sans">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-secondary)] font-semibold">Prediction vs. observed outcome:</span>
                      <span className="text-[var(--accent-green-text)] font-mono font-semibold text-xs">
                        ✓ Evaluation confirmed
                      </span>
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-[var(--mm-rule)] border-y border-[var(--mm-rule)] text-xs">
                      <div className="py-2.5 pr-4">
                        <span className="text-xs text-[var(--text-secondary)] block">Your prediction</span>
                        <div className="text-[var(--text-primary)] font-bold mt-0.5">
                          {learnerPrediction === 'correct' ? 'Correct Retrieval' : 'Interference'}
                        </div>
                      </div>
                      <div className="py-2.5 pl-4">
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
            <div className="space-y-5 text-[var(--text-primary)]">
              <div className="space-y-1">
                <span className="text-xs font-mono font-semibold text-[var(--mm-coral)] flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-[var(--mm-coral)]" />
                  Stage 04 · Induced coordinate interference
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-medium text-[var(--text-primary)]">
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
                  className="px-5 py-2.5 rounded-md bg-[var(--accent-pink)] hover:opacity-90 text-[var(--accent-pink-text)] border border-[var(--color-danger-border)] text-xs font-sans font-semibold flex items-center gap-2 cursor-pointer transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add distractor fact</span>
                </button>
                <span className="text-xs font-sans text-[var(--text-secondary)] tabular-nums">
                  Active stream facts: <strong className="text-[var(--text-primary)] font-mono">{facts.length}</strong>
                </span>
              </div>

              {/* Real Computed Before vs After (Hairline) */}
              {beforeAfterDistractor && (
                <div className="pt-4 border-t border-[var(--color-danger-border)] space-y-3 font-sans text-xs animate-in fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--accent-pink-text)] font-semibold">
                      Injected: {beforeAfterDistractor.distractor.key} → {beforeAfterDistractor.distractor.value}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)] font-mono">
                      Target probe: &quot;{activeProbe || 'Japan'}&quot;
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--mm-rule)] border-y border-[var(--mm-rule)] text-xs font-sans tabular-nums">
                    <div className="py-2.5 sm:pr-3">
                      <span className="text-xs text-[var(--text-muted)] block">Prediction</span>
                      <div className="font-bold font-mono mt-1">
                        <span className="text-[var(--text-secondary)]">{beforeAfterDistractor.before.prediction}</span>
                        <span className="mx-1 text-[var(--text-muted)]">→</span>
                        <span className={isCorrect ? 'text-[var(--accent-green-text)]' : 'text-[var(--accent-pink-text)]'}>
                          {beforeAfterDistractor.after.prediction}
                        </span>
                      </div>
                    </div>

                    <div className="py-2.5 sm:px-3">
                      <span className="text-xs text-[var(--text-muted)] block">Retrieval score</span>
                      <div className="font-bold font-mono mt-1">
                        <span className="text-[var(--text-secondary)]">{beforeAfterDistractor.before.retrievalScore.toFixed(3)}</span>
                        <span className="mx-1 text-[var(--text-muted)]">→</span>
                        <span className="text-[var(--mm-signal)]">{beforeAfterDistractor.after.retrievalScore.toFixed(3)}</span>
                      </div>
                    </div>

                    <div className="py-2.5 sm:px-3">
                      <span className="text-xs text-[var(--text-muted)] block">Top-1 margin</span>
                      <div className="font-bold font-mono mt-1">
                        <span className="text-[var(--text-secondary)]">{beforeAfterDistractor.before.top1Margin.toFixed(3)}</span>
                        <span className="mx-1 text-[var(--text-muted)]">→</span>
                        <span className={beforeAfterDistractor.after.top1Margin < 0.1 ? 'text-[var(--accent-pink-text)]' : 'text-[var(--accent-yellow-text)]'}>
                          {beforeAfterDistractor.after.top1Margin.toFixed(3)}
                        </span>
                      </div>
                    </div>

                    <div className="py-2.5 sm:pl-3">
                      <span className="text-xs text-[var(--text-muted)] block">Outcome</span>
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
            <div className="space-y-6 text-[var(--text-primary)]">
              <div className="space-y-1">
                <span className="text-xs font-mono text-[var(--mm-signal)] font-semibold">
                  Stage 05 · Scientific interpretation &amp; isolated variables
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-medium text-[var(--text-primary)]">
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
                  className={`p-3 rounded-md border text-left transition cursor-pointer ${
                    guidedIntervention === 'dim'
                      ? 'border-[var(--color-accent)] bg-[var(--accent-blue)] text-[var(--accent-blue-text)] font-semibold'
                      : 'border-[var(--mm-rule)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <div className="font-bold">Increase Dimension (D)</div>
                  <div className="text-xs opacity-75 mt-0.5 font-mono">D={config.dimension} → D=32</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleGuidedControlledExperiment('ret')}
                  className={`p-3 rounded-md border text-left transition cursor-pointer ${
                    guidedIntervention === 'ret'
                      ? 'border-[var(--color-accent)] bg-[var(--accent-blue)] text-[var(--accent-blue-text)] font-semibold'
                      : 'border-[var(--mm-rule)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <div className="font-bold">Lower Retention (λ)</div>
                  <div className="text-xs opacity-75 mt-0.5 font-mono">λ={Math.round(config.retention * 100)}% → λ=50%</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleGuidedControlledExperiment('dist')}
                  className={`p-3 rounded-md border text-left transition cursor-pointer ${
                    guidedIntervention === 'dist'
                      ? 'border-[var(--color-accent)] bg-[var(--accent-blue)] text-[var(--accent-blue-text)] font-semibold'
                      : 'border-[var(--mm-rule)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <div className="font-bold">Clear Distractors</div>
                  <div className="text-xs opacity-75 mt-0.5 font-mono">N={facts.length} → N=3 base facts</div>
                </button>
              </div>

              {/* WHAT CHANGED? WHY IT MATTERS? OBSERVED RESULT? (Hairline) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[var(--mm-rule)] border-y border-[var(--mm-rule)] font-sans text-xs">
                <div className="py-3 sm:pr-4 space-y-1">
                  <span className="text-xs font-mono uppercase tracking-wider text-[var(--mm-signal)] font-semibold block">What changed?</span>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {guidedIntervention === 'dim'
                      ? 'Expanded state capacity to D=32.'
                      : guidedIntervention === 'ret'
                      ? 'Reduced decay factor to λ=0.50.'
                      : 'Removed all competing distractors.'}
                  </p>
                </div>

                <div className="py-3 sm:px-4 space-y-1">
                  <span className="text-xs font-mono uppercase tracking-wider text-[var(--accent-yellow-text)] font-semibold block">Why it matters</span>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {guidedIntervention === 'dim'
                      ? 'Higher dimensions increase near-orthogonal vector capacity exponentially.'
                      : guidedIntervention === 'ret'
                      ? 'Low retention causes early associations to vanish rapidly.'
                      : 'Uncrowded states experience minimal coordinate overlap.'}
                  </p>
                </div>

                <div className="py-3 sm:pl-4 space-y-1 tabular-nums">
                  <span className="text-xs font-mono uppercase tracking-wider text-[var(--accent-green-text)] font-semibold block">Observed result</span>
                  <p className="text-xs text-[var(--text-primary)] font-bold font-mono mt-0.5">
                    {prediction} (Score: {retrievalScore.toFixed(3)}, Status: {status})
                  </p>
                </div>
              </div>

              {/* Scientific Interpretation */}
              <div className="space-y-1.5">
                <h4 className="font-serif font-medium text-base text-[var(--text-primary)]">
                  Scientific conclusion
                </h4>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
                  {status === 'Interference'
                    ? 'Adding competing facts into the fixed-size recurrent state caused coordinate superposition overlap. The projected readout vector projected closer to a distractor candidate than the target association.'
                    : 'Additional information reduced the top-1 margin, but the representational capacity was sufficient to preserve the target association.'}
                </p>
              </div>

              {/* Quiz: Why did it fail? (Hairline) */}
              <div className="pt-5 border-t border-[var(--mm-rule)] space-y-4">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[var(--accent-blue-text)]" />
                  <h4 className="text-sm font-serif font-medium text-[var(--text-primary)]">Inquiry: Why did retrieval change?</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-sans text-xs">
                  {quizOptions.map((opt) => {
                    const isSelected = selectedQuizAnswer === opt.id;
                    let btnClass = 'border-[var(--mm-rule)] bg-[var(--surface-soft)] hover:bg-[var(--color-surface-muted)] text-[var(--text-primary)]';

                    if (quizRevealed) {
                      if (opt.isCorrect) {
                        btnClass = 'border-[var(--color-success-border)] bg-[var(--accent-green)] text-[var(--accent-green-text)] font-bold';
                      } else if (isSelected && !opt.isCorrect) {
                        btnClass = 'border-[var(--color-danger-border)] bg-[var(--accent-pink)] text-[var(--accent-pink-text)]';
                      } else {
                        btnClass = 'border-[var(--mm-rule)] bg-[var(--surface-soft)] opacity-50 text-[var(--text-muted)]';
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
                        className={`p-3 rounded-md border text-left flex items-center justify-between transition-all cursor-pointer ${btnClass}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-sm bg-[var(--surface)] border border-[var(--mm-rule)] flex items-center justify-center text-xs text-[var(--text-primary)] font-bold shrink-0 font-mono">
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
                  <div className="py-3 px-4 rounded-md bg-[var(--accent-green)]/40 border border-[var(--color-success-border)] space-y-1 animate-in fade-in">
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
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--mm-rule)]">
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
          {/* Preset Toolbar (Hairline) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-secondary)] font-semibold flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[var(--accent-blue-text)]" />
                Sandbox presets
              </span>
              <span className="text-xs text-[var(--text-muted)] font-mono">Deterministic parameters</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 border border-[var(--mm-rule)] divide-y sm:divide-y-0 sm:divide-x divide-[var(--mm-rule)] rounded-md overflow-hidden text-xs">
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
                  className="p-3 bg-[var(--surface)] hover:bg-[var(--surface-soft)] text-left transition cursor-pointer"
                >
                  <div className="font-semibold text-[var(--text-primary)] text-xs">{p.name}</div>
                  <div className="text-xs font-mono text-[var(--text-secondary)] mt-0.5 tabular-nums">{p.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Parameter Panel (Hairline Top Rule) */}
          <div className="pt-5 border-t border-[var(--mm-rule)] space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
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
                  <span className="font-mono text-xs font-semibold text-[var(--mm-signal)]">
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
                  <span className="font-mono text-xs font-semibold text-[var(--accent-green-text)]">
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
                  <span className="font-mono text-xs font-semibold text-[var(--text-primary)]">
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

          {/* Real-Time Telemetry Strip (Hairline Divide) */}
          <div className="grid grid-cols-1 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--mm-rule)] border border-[var(--mm-rule)] bg-[var(--mm-paper-bright)] rounded-md text-xs tabular-nums">
            <div className="p-3.5">
              <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--mm-muted)]">Ground truth</div>
              <div className="text-lg font-serif font-normal text-[var(--mm-ink)] mt-0.5">
                {groundTruth} <span className="font-sans text-xs text-[var(--mm-muted)]">({activeProbe || 'Japan'})</span>
              </div>
            </div>

            <div className="p-3.5">
              <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.08em]">
                <span className="text-[var(--mm-muted)]">Model output</span>
                <span className={`font-semibold ${isCorrect ? 'text-[var(--accent-green-text)]' : 'text-[var(--mm-coral)]'}`}>
                  {isCorrect ? '✓ Match' : 'Collision'}
                </span>
              </div>
              <div className={`text-lg font-serif font-normal mt-0.5 ${isCorrect ? 'text-[var(--mm-ink)]' : 'text-[var(--mm-coral)]'}`}>
                {prediction}
              </div>
            </div>

            <div
              className="p-3.5"
              title="Cosine similarity between the retrieved representation and a candidate value representation. This is not a calibrated probability."
            >
              <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--mm-muted)]">Retrieval score</div>
              <div className="text-lg font-mono font-semibold text-[var(--mm-signal)] mt-0.5">
                {retrievalScore.toFixed(4)}
              </div>
            </div>

            <div className="p-3.5">
              <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--mm-muted)]">Top-1 margin</div>
              <div className={`text-lg font-mono font-semibold mt-0.5 ${top1Margin > 0.2 ? 'text-[var(--accent-green-text)]' : 'text-[var(--mm-coral)]'}`}>
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
          <div className="pt-5 border-t border-[var(--mm-rule)] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-[var(--accent-blue-text)]" />
                <h4 className="font-serif font-medium text-base text-[var(--text-primary)]">
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
              <div className="grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-[var(--mm-rule)] border-y border-[var(--mm-rule)] text-xs tabular-nums">
                <div className="py-3 sm:pr-4">
                  <span className="text-xs text-[var(--text-muted)] block">Cosine similarity</span>
                  <div className="text-base font-mono font-bold text-[var(--mm-signal)] mt-0.5">
                    {comparisonDiff.stateCosineSimilarity.toFixed(4)}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mt-0.5">Vector alignment</div>
                </div>

                <div className="py-3 sm:px-4">
                  <span className="text-xs text-[var(--text-muted)] block">Δ Retrieval score</span>
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

                <div className="py-3 sm:px-4">
                  <span className="text-xs text-[var(--text-muted)] block">Δ Top-1 margin</span>
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

                <div className="py-3 sm:px-4">
                  <span className="text-xs text-[var(--text-muted)] block">Δ Matrix norm</span>
                  <div className="text-base font-mono font-bold text-[var(--accent-yellow-text)] mt-0.5">
                    {comparisonDiff.matrixNormDiff >= 0 ? '+' : ''}{comparisonDiff.matrixNormDiff.toFixed(4)}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mt-0.5">Frobenius energy</div>
                </div>

                <div className="py-3 sm:pl-4">
                  <span className="text-xs text-[var(--text-muted)] block">Prediction shift</span>
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
            <div className="pt-5 border-t border-[var(--mm-rule)] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)] font-semibold flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-[var(--accent-blue-text)]" />
                  Experiment run history
                </span>
                <span className="text-xs text-[var(--text-muted)] font-mono tabular-nums">
                  {historyRuns.length} recorded snapshot{historyRuns.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="divide-y divide-[var(--mm-rule)] border-y border-[var(--mm-rule)] max-h-48 overflow-y-auto">
                {historyRuns.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => selectHistoricalRun(r.id)}
                    className="w-full py-2.5 px-2 hover:bg-[var(--surface-soft)] flex items-center justify-between text-xs transition cursor-pointer text-left tabular-nums"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[var(--mm-signal)] font-semibold">{r.label}</span>
                      <span className="text-[var(--text-muted)] text-xs">({r.timestamp})</span>
                      <span className="font-mono text-[var(--text-secondary)] text-xs">
                        D={r.config.dimension} λ={Math.round(r.config.retention * 100)}%
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[var(--text-secondary)]">&quot;{r.probe}&quot; → <strong className="text-[var(--text-primary)]">{r.prediction}</strong></span>
                      <span className="font-mono text-[var(--mm-signal)] text-xs">{r.retrievalScore.toFixed(3)}</span>
                      <span
                        className={`text-xs font-semibold ${
                          r.status === 'Correct'
                            ? 'text-[var(--accent-green-text)]'
                            : 'text-[var(--accent-pink-text)]'
                        }`}
                      >
                        {r.status === 'Correct' ? '● Correct' : '▲ Collision'}
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

          {/* Failure Alert Strip & Trace Trigger */}
          {!isCorrect && (
            <div className="border-t-2 border-[var(--color-danger)] bg-[var(--accent-pink)]/35 p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-danger-border)] pb-3">
                <div className="flex items-center gap-2.5">
                  <AlertOctagon className="w-5 h-5 text-[var(--accent-pink-text)] shrink-0" />
                  <div>
                    <div className="text-[11px] font-mono uppercase text-[var(--accent-pink-text)] font-semibold tracking-wider">
                      Observed anomaly
                    </div>
                    <h4 className="text-base font-serif font-medium text-[var(--text-primary)]">Interference detected</h4>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowFailureTrace(!showFailureTrace)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--surface)] hover:bg-[var(--surface-soft)] border border-[var(--color-danger-border)] text-[var(--accent-pink-text)] text-xs font-semibold transition cursor-pointer"
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

      {/* Epistemic Boundary & Figure Caption */}
      <FigureCaption
        figure="Fig. 3.2"
        title="Increasing competing associations compresses vector margins until a distractor overtakes the target readout."
        source="Live deterministic associative matrix M ∈ ℝ^(D×D)"
        note="This demonstrates superposition behavior in a toy educational model, not a universal law across all recurrent architectures."
      />
    </figure>
  );
};

export default DiscoveryMode;

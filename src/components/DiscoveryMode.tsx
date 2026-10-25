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
      className="rounded-xl border border-[#D8DCD8] bg-[#FFFFFF] p-5 sm:p-7 text-[#252525] shadow-xs space-y-7"
    >
      {/* ============================================================ */}
      {/* TOP BAR: REAL MODE SWITCHER & REPRODUCIBLE RUN ID */}
      {/* ============================================================ */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EAE6DF] pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <EvidenceStrip type="live" detail="Real model engine" />
          <div className="flex items-center bg-[#F1F2F0] border border-[#D8DCD8] rounded-xl p-1">
            <button
              id="mode-toggle-guided"
              onClick={() => setMode('guided')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-sans transition-all cursor-pointer ${
                mode === 'guided'
                  ? 'bg-[#FFFFFF] text-[#252525] font-bold shadow-xs border border-[#D8DCD8]'
                  : 'text-[#5F625F] hover:text-[#252525]'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-[#21445B]" />
              <span>Guided mode</span>
            </button>
            <button
              id="mode-toggle-sandbox"
              onClick={() => setMode('sandbox')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-sans transition-all cursor-pointer ${
                mode === 'sandbox'
                  ? 'bg-[#FFFFFF] text-[#252525] font-bold shadow-xs border border-[#D8DCD8]'
                  : 'text-[#5F625F] hover:text-[#252525]'
              }`}
            >
              <Wrench className="w-3.5 h-3.5 text-[#21445B]" />
              <span>Sandbox mode</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-sans text-[#5F625F] hidden lg:inline">
            {mode === 'guided'
              ? 'Follow the experiment step by step.'
              : 'Change the system and test your own hypothesis.'}
          </div>
          <div className="flex items-center gap-2 font-sans text-xs text-[#5F625F]">
            <span>Run ID:</span>
            <span className="px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#D8DCD8] text-[#252525] font-mono font-semibold">
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
          <div className="rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] p-4 sm:p-5 space-y-3 font-sans">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#21445B] flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#21445B]" />
                Scientific protocol · Step {guidedStep} / 5
              </span>
              <button
                onClick={resetExperiment}
                className="flex items-center gap-1.5 text-xs text-[#5F625F] hover:text-[#252525] transition cursor-pointer"
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
                    disabled={isLocked}
                    onClick={() => setGuidedStep(st.num)}
                    className={`p-2 sm:p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isActive
                        ? 'border-[#2B6282] bg-[#E7F2FA] text-[#21445B] font-bold ring-1 ring-[#2B6282]'
                        : isDone
                        ? 'border-[#C5DDCB] bg-[#DCEFE2] text-[#245B38]'
                        : isLocked
                        ? 'border-[#EAE6DF] bg-[#FFFFFF] text-[#7D817D] cursor-not-allowed opacity-60'
                        : 'border-[#D8DCD8] bg-[#FFFFFF] text-[#5F625F] hover:text-[#252525]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-xs">0{st.num}</span>
                      {isDone ? (
                        <CheckCircle2 className="w-3 h-3 text-[#247A4B]" />
                      ) : isLocked ? (
                        <Lock className="w-3 h-3 text-[#7D817D]" />
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
            <div className="rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] p-5 sm:p-6 space-y-5 text-[#252525]">
              <div className="space-y-1">
                <span className="text-xs font-sans text-[#21445B] font-semibold">
                  Stage 01 · Writing initial associations
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#252525]">
                  Write base facts into a <GlossaryTerm term="recurrent state" className="text-[#252525] hover:text-[#21445B]">fixed-size recurrent state</GlossaryTerm>
                </h3>
                <p className="text-xs sm:text-sm text-[#5F625F] font-sans leading-relaxed">
                  In a recurrent memory architecture, facts are not stored in an expanding <GlossaryTerm term="kv-cache" className="text-[#252525] hover:text-[#21445B]">KV-cache</GlossaryTerm> list. Instead, each incoming association is mapped into vector representations and written as an <GlossaryTerm term="Hebbian plasticity" className="text-[#252525] hover:text-[#21445B]">outer-product update</GlossaryTerm> into a single recurrent state matrix <span className="font-mono text-[#21445B]">{"M ∈ ℝ^(16×16)"}</span>.
                </p>
              </div>

              {/* Input stream preview */}
              <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#EAE6DF] space-y-3 font-sans text-xs">
                <div className="text-[#5F625F] text-xs font-semibold">
                  Canonical stream to write:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {INITIAL_FACTS.map((f, i) => (
                    <div key={i} className="p-3 rounded-lg bg-[#FAF8F5] border border-[#EAE6DF] flex items-center justify-between">
                      <span className="text-[#252525] font-semibold font-sans">{f.key}</span>
                      <span className="text-[#21445B] font-bold font-mono">→ {f.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  id="guided-step1-write-btn"
                  onClick={() => {
                    executeGuidedWrite();
                    completeGuidedStep(1);
                  }}
                  className="px-5 py-2.5 rounded-lg bg-[#DCEFE2] hover:bg-[#D0E8D7] text-[#245B38] border border-[#C5DDCB] text-xs font-sans font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition"
                >
                  <Database className="w-4 h-4" />
                  <span>Write facts into memory</span>
                </button>

                {guidedCompleted[0] && (
                  <button
                    onClick={() => setGuidedStep(2)}
                    className="px-5 py-2.5 rounded-lg bg-[#252525] hover:bg-[#151515] text-white text-xs font-sans font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition"
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
            <div className="rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] p-5 sm:p-6 space-y-5 text-[#252525]">
              <div className="space-y-1">
                <span className="text-xs font-sans text-[#21445B] font-semibold">
                  Stage 02 · Coordinate superposition
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#252525]">
                  3 facts compressed into a single matrix manifold
                </h3>
                <p className="text-xs sm:text-sm text-[#5F625F] font-sans leading-relaxed">
                  Notice that the memory size has not grown. All 3 facts now superpose inside the same <span className="font-mono text-[#21445B]">D=16</span> dimensional coordinates: <span className="font-mono text-[#21445B]">M = \sum \eta k_t v_t^\top</span>. The <GlossaryTerm term="Frobenius norm" className="text-[#252525] hover:text-[#A46622]">Frobenius norm</GlossaryTerm> <span className="font-mono text-[#A46622]">||M||_F = {matrixNorm.toFixed(4)}</span> reflects the accumulated magnitude of written coordinates.
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
                  onClick={() => setGuidedStep(1)}
                  className="px-4 py-2 rounded-lg bg-[#FFFFFF] border border-[#D8DCD8] text-[#5F625F] hover:text-[#252525] text-xs font-sans font-medium cursor-pointer transition"
                >
                  Back to step 1
                </button>
                <button
                  id="guided-step2-next-btn"
                  onClick={() => {
                    completeGuidedStep(2);
                    setGuidedStep(3);
                  }}
                  className="px-5 py-2.5 rounded-lg bg-[#252525] hover:bg-[#151515] text-white text-xs font-sans font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition"
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
            <div className="rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] p-5 sm:p-6 space-y-5 text-[#252525]">
              <div className="space-y-1">
                <span className="text-xs font-sans text-[#21445B] font-semibold">
                  Stage 03 · Hypothesis & probe evaluation
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#252525]">
                  Formulate a prediction before probing the state
                </h3>
                <p className="text-xs sm:text-sm text-[#5F625F] font-sans leading-relaxed">
                  We will query the memory with key <strong className="text-[#252525] font-mono">"Japan"</strong>. Will the superposed matrix readout project accurately onto <strong className="text-[#247A4B] font-mono">"Tokyo"</strong> without interference?
                </p>
              </div>

              {/* Prediction Question Box */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#FFFFFF] border border-[#EAE6DF] space-y-3 font-sans">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#252525] font-semibold">Question: Will current memory retrieve "Tokyo"?</span>
                  <span className="text-xs text-[#A46622] bg-[#FFF5D8] border border-[#F3E5BE] px-2 py-0.5 rounded font-medium">
                    Prediction required
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    id="predict-correct-btn"
                    onClick={() => setLearnerPrediction('correct')}
                    className={`p-3.5 rounded-lg border text-left flex items-center justify-between transition cursor-pointer font-sans text-xs ${
                      learnerPrediction === 'correct'
                        ? 'bg-[#DCEFE2] border-[#C5DDCB] text-[#245B38] font-bold ring-1 ring-[#247A4B]'
                        : 'bg-[#FAF8F5] border-[#D8DCD8] text-[#5F625F] hover:text-[#252525]'
                    }`}
                  >
                    <span>Yes, retrieve correctly</span>
                    {learnerPrediction === 'correct' && <CheckCircle2 className="w-4 h-4 text-[#247A4B]" />}
                  </button>

                  <button
                    id="predict-interfere-btn"
                    onClick={() => setLearnerPrediction('interference')}
                    className={`p-3.5 rounded-lg border text-left flex items-center justify-between transition cursor-pointer font-sans text-xs ${
                      learnerPrediction === 'interference'
                        ? 'bg-[#F9E9ED] border-[#F2CAD2] text-[#B64235] font-bold ring-1 ring-[#B64235]'
                        : 'bg-[#FAF8F5] border-[#D8DCD8] text-[#5F625F] hover:text-[#252525]'
                    }`}
                  >
                    <span>No, interference occurs</span>
                    {learnerPrediction === 'interference' && <CheckCircle2 className="w-4 h-4 text-[#B64235]" />}
                  </button>
                </div>

                {!learnerPrediction && (
                  <p className="text-xs text-[#A46622] font-sans">
                    * Make your prediction to unlock probe execution.
                  </p>
                )}
              </div>

              {/* Action: Run Probe */}
              <div className="flex items-center gap-3">
                <button
                  id="run-guided-probe-btn"
                  disabled={!learnerPrediction}
                  onClick={() => {
                    executeGuidedProbe();
                    completeGuidedStep(3);
                  }}
                  className="px-5 py-2.5 rounded-lg bg-[#DCEFE2] hover:bg-[#D0E8D7] text-[#245B38] border border-[#C5DDCB] disabled:opacity-40 disabled:cursor-not-allowed font-sans text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition"
                >
                  <Eye className="w-4 h-4" />
                  <span>Run probe evaluation</span>
                </button>
              </div>

              {/* Computed Probe Results & Comparison (once executed) */}
              {guidedCompleted[2] && (
                <div className="space-y-4 pt-3 border-t border-[#EAE6DF] animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-sans">
                    <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#EAE6DF]">
                      <div className="text-xs text-[#5F625F]">Ground truth</div>
                      <div className="text-base font-bold text-[#252525] font-mono mt-0.5">{groundTruth}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#DCEFE2] border border-[#C5DDCB]">
                      <div className="text-xs text-[#245B38]">Model output</div>
                      <div className="text-base font-bold text-[#245B38] font-mono mt-0.5">{prediction}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#EAE6DF]">
                      <div className="text-xs text-[#5F625F]">Retrieval score</div>
                      <div className="text-base font-bold text-[#21445B] font-mono mt-0.5">{retrievalScore.toFixed(4)}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#EAE6DF]">
                      <div className="text-xs text-[#5F625F]">Top-1 margin</div>
                      <div className="text-base font-bold text-[#247A4B] font-mono mt-0.5">{top1Margin.toFixed(4)}</div>
                    </div>
                  </div>

                  {/* PREDICTION VS ACTUAL RESULT */}
                  <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#EAE6DF] space-y-2 text-xs font-sans">
                    <div className="flex items-center justify-between">
                      <span className="text-[#5F625F] font-semibold">Prediction vs. observed outcome:</span>
                      <span className="px-2 py-0.5 rounded bg-[#DCEFE2] border border-[#C5DDCB] text-[#245B38] font-semibold text-xs">
                        Evaluation confirmed
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#EAE6DF]">
                        <span className="text-xs text-[#5F625F] block">Your prediction</span>
                        <div className="text-[#252525] font-bold mt-0.5">
                          {learnerPrediction === 'correct' ? 'Correct Retrieval' : 'Interference'}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#EAE6DF]">
                        <span className="text-xs text-[#5F625F] block">Actual outcome</span>
                        <div className="text-[#247A4B] font-bold mt-0.5 font-mono">
                          {status} ({prediction} with score {retrievalScore.toFixed(3)})
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-[#5F625F] leading-relaxed pt-1">
                      Because only 3 facts were written into a <span className="font-mono text-[#21445B]">D=16</span> dimensional space, vector keys remain largely quasi-orthogonal, leaving ample representational room for clean readout.
                    </p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setGuidedStep(4)}
                      className="px-5 py-2.5 rounded-lg bg-[#252525] hover:bg-[#151515] text-white text-xs font-sans font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition"
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
            <div className="rounded-xl border border-[#F2CAD2] bg-[#FAF8F5] p-5 sm:p-6 space-y-5 text-[#252525]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-sans font-semibold text-[#B64235] bg-[#F9E9ED] border border-[#F2CAD2] px-2.5 py-0.5 rounded flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-[#B64235]" />
                    Stage 04 · Induced coordinate interference
                  </span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#252525]">
                  Add competing information to observe coordinate interference
                </h3>
                <p className="text-xs sm:text-sm text-[#5F625F] font-sans leading-relaxed">
                  Click below to inject distractor facts into the stream. Each click writes an outer-product update into the same fixed-size <span className="font-mono text-[#21445B]">D=16</span> matrix. Watch the retrieval score and margin degrade until interference triggers.
                </p>
              </div>

              {/* Action: Add Distractor */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  id="add-guided-distractor-btn"
                  onClick={() => {
                    addDistractor();
                    completeGuidedStep(4);
                  }}
                  className="px-5 py-2.5 rounded-lg bg-[#F9E9ED] hover:bg-[#F2CAD2] text-[#B64235] border border-[#F2CAD2] text-xs font-sans font-semibold flex items-center gap-2 shadow-xs cursor-pointer transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add distractor fact</span>
                </button>
                <span className="text-xs font-sans text-[#5F625F]">
                  Active stream facts: <strong className="text-[#252525] font-mono">{facts.length}</strong>
                </span>
              </div>

              {/* Real Computed Before vs After */}
              {beforeAfterDistractor && (
                <div className="p-4 sm:p-5 rounded-xl bg-[#FFFFFF] border border-[#F2CAD2] space-y-3 font-sans text-xs animate-in fade-in">
                  <div className="flex items-center justify-between text-xs border-b border-[#EAE6DF] pb-2">
                    <span className="text-[#B64235] font-semibold">
                      Injected: {beforeAfterDistractor.distractor.key} → {beforeAfterDistractor.distractor.value}
                    </span>
                    <span className="text-xs text-[#5F625F]">
                      Target probe: "{activeProbe || 'Japan'}"
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-sans">
                    <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#EAE6DF]">
                      <span className="text-xs text-[#5F625F] block">Prediction</span>
                      <div className="font-bold font-mono mt-1">
                        <span className="text-[#5F625F]">{beforeAfterDistractor.before.prediction}</span>
                        <span className="mx-1 text-[#7D817D]">→</span>
                        <span className={isCorrect ? 'text-[#247A4B]' : 'text-[#B64235]'}>
                          {beforeAfterDistractor.after.prediction}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#EAE6DF]">
                      <span className="text-xs text-[#5F625F] block">Retrieval score</span>
                      <div className="font-bold font-mono mt-1">
                        <span className="text-[#5F625F]">{beforeAfterDistractor.before.retrievalScore.toFixed(3)}</span>
                        <span className="mx-1 text-[#7D817D]">→</span>
                        <span className="text-[#21445B]">{beforeAfterDistractor.after.retrievalScore.toFixed(3)}</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#EAE6DF]">
                      <span className="text-xs text-[#5F625F] block">Top-1 margin</span>
                      <div className="font-bold font-mono mt-1">
                        <span className="text-[#5F625F]">{beforeAfterDistractor.before.top1Margin.toFixed(3)}</span>
                        <span className="mx-1 text-[#7D817D]">→</span>
                        <span className={beforeAfterDistractor.after.top1Margin < 0.1 ? 'text-[#B64235]' : 'text-[#A46622]'}>
                          {beforeAfterDistractor.after.top1Margin.toFixed(3)}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#EAE6DF]">
                      <span className="text-xs text-[#5F625F] block">Outcome</span>
                      <div className="font-bold mt-1 text-xs">
                        {status === 'Correct' ? (
                          <span className="text-[#247A4B]">Correct (Margin reduced)</span>
                        ) : (
                          <span className="text-[#B64235]">Interference triggered</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => setGuidedStep(3)}
                  className="px-4 py-2 rounded-lg bg-[#FFFFFF] border border-[#D8DCD8] text-[#5F625F] hover:text-[#252525] text-xs font-sans font-medium cursor-pointer transition"
                >
                  Back to step 3
                </button>
                <button
                  id="guided-step4-next-btn"
                  onClick={() => {
                    completeGuidedStep(4);
                    setGuidedStep(5);
                  }}
                  className="px-5 py-2.5 rounded-lg bg-[#252525] hover:bg-[#151515] text-white text-xs font-sans font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition"
                >
                  <span>Next: Explain & controlled lab</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* STEP 5: EXPLAIN & CONTROLLED EXPERIMENT */}
          {/* -------------------------------------------------------- */}
          {guidedStep === 5 && (
            <div className="rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] p-5 sm:p-6 space-y-6 text-[#252525]">
              <div className="space-y-1">
                <span className="text-xs font-sans text-[#21445B] font-semibold">
                  Stage 05 · Scientific interpretation & isolated variables
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#252525]">
                  Controlled variable experiment
                </h3>
                <p className="text-xs sm:text-sm text-[#5F625F] font-sans leading-relaxed">
                  In a rigorous scientific inquiry, we change <strong className="text-[#252525]">one meaningful variable at a time</strong> to identify causal relationships. Select one variable below to isolate its effect:
                </p>
              </div>

              {/* Controlled Variable Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans text-xs">
                <button
                  onClick={() => handleGuidedControlledExperiment('dim')}
                  className={`p-3.5 rounded-lg border text-left transition cursor-pointer ${
                    guidedIntervention === 'dim'
                      ? 'border-[#2B6282] bg-[#E7F2FA] text-[#21445B] font-semibold ring-1 ring-[#2B6282]'
                      : 'border-[#D8DCD8] bg-[#FFFFFF] text-[#5F625F] hover:text-[#252525]'
                  }`}
                >
                  <div className="font-bold">Increase Dimension (D)</div>
                  <div className="text-xs opacity-75 mt-0.5 font-mono">D={config.dimension} → D=32</div>
                </button>

                <button
                  onClick={() => handleGuidedControlledExperiment('ret')}
                  className={`p-3.5 rounded-lg border text-left transition cursor-pointer ${
                    guidedIntervention === 'ret'
                      ? 'border-[#2B6282] bg-[#E7F2FA] text-[#21445B] font-semibold ring-1 ring-[#2B6282]'
                      : 'border-[#D8DCD8] bg-[#FFFFFF] text-[#5F625F] hover:text-[#252525]'
                  }`}
                >
                  <div className="font-bold">Lower Retention (λ)</div>
                  <div className="text-xs opacity-75 mt-0.5 font-mono">λ={Math.round(config.retention * 100)}% → λ=50%</div>
                </button>

                <button
                  onClick={() => handleGuidedControlledExperiment('dist')}
                  className={`p-3.5 rounded-lg border text-left transition cursor-pointer ${
                    guidedIntervention === 'dist'
                      ? 'border-[#2B6282] bg-[#E7F2FA] text-[#21445B] font-semibold ring-1 ring-[#2B6282]'
                      : 'border-[#D8DCD8] bg-[#FFFFFF] text-[#5F625F] hover:text-[#252525]'
                  }`}
                >
                  <div className="font-bold">Clear Distractors</div>
                  <div className="text-xs opacity-75 mt-0.5 font-mono">N={facts.length} → N=3 base facts</div>
                </button>
              </div>

              {/* WHAT CHANGED? WHY IT MATTERS? OBSERVED RESULT? */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans text-xs">
                <div className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#EAE6DF] space-y-1">
                  <span className="text-xs text-[#21445B] font-bold">What changed?</span>
                  <p className="text-xs text-[#5F625F] leading-relaxed">
                    {guidedIntervention === 'dim'
                      ? 'Expanded state capacity to D=32.'
                      : guidedIntervention === 'ret'
                      ? 'Reduced decay factor to λ=0.50.'
                      : 'Removed all competing distractors.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#EAE6DF] space-y-1">
                  <span className="text-xs text-[#A46622] font-bold">Why it matters</span>
                  <p className="text-xs text-[#5F625F] leading-relaxed">
                    {guidedIntervention === 'dim'
                      ? 'Higher dimensions increase near-orthogonal vector capacity exponentially.'
                      : guidedIntervention === 'ret'
                      ? 'Low retention causes early associations to vanish rapidly.'
                      : 'Uncrowded states experience minimal coordinate overlap.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#EAE6DF] space-y-1">
                  <span className="text-xs text-[#247A4B] font-bold">Observed result</span>
                  <p className="text-xs text-[#252525] font-bold font-mono mt-0.5">
                    {prediction} (Score: {retrievalScore.toFixed(3)}, Status: {status})
                  </p>
                </div>
              </div>

              {/* Scientific Interpretation */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#FFFFFF] border border-[#EAE6DF] space-y-2">
                <h4 className="font-serif font-bold text-base text-[#252525]">
                  Scientific conclusion
                </h4>
                <p className="text-xs sm:text-sm text-[#5F625F] font-sans leading-relaxed">
                  {status === 'Interference'
                    ? 'Adding competing facts into the fixed-size recurrent state caused coordinate superposition overlap. The projected readout vector projected closer to a distractor candidate than the target association.'
                    : 'Additional information reduced the top-1 margin, but the representational capacity was sufficient to preserve the target association.'}
                </p>
              </div>

              {/* Quiz: Why did it fail? */}
              <div className="rounded-xl border border-[#EAE6DF] bg-[#FFFFFF] p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-[#EAE6DF] pb-3">
                  <HelpCircle className="w-4 h-4 text-[#21445B]" />
                  <h4 className="text-sm font-serif font-bold text-[#252525]">Inquiry: Why did retrieval change?</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-sans text-xs">
                  {quizOptions.map((opt) => {
                    const isSelected = selectedQuizAnswer === opt.id;
                    let btnClass = 'border-[#D8DCD8] bg-[#FAF8F5] hover:bg-[#F1F2F0] text-[#252525]';

                    if (quizRevealed) {
                      if (opt.isCorrect) {
                        btnClass = 'border-[#C5DDCB] bg-[#DCEFE2] text-[#245B38] font-bold';
                      } else if (isSelected && !opt.isCorrect) {
                        btnClass = 'border-[#F2CAD2] bg-[#F9E9ED] text-[#B64235]';
                      } else {
                        btnClass = 'border-[#EAE6DF] bg-[#FAF8F5] opacity-50 text-[#7D817D]';
                      }
                    }

                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setSelectedQuizAnswer(opt.id);
                          setQuizRevealed(true);
                        }}
                        className={`p-3.5 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${btnClass}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-[#FFFFFF] border border-[#D8DCD8] flex items-center justify-center text-xs text-[#252525] font-bold shrink-0 font-mono">
                            {opt.id}
                          </span>
                          <span>{opt.text}</span>
                        </div>
                        {quizRevealed && opt.isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-[#247A4B] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {quizRevealed && (
                  <div className="p-4 rounded-lg bg-[#DCEFE2] border border-[#C5DDCB] space-y-1 animate-in fade-in">
                    <div className="flex items-center gap-2 font-sans font-bold text-xs text-[#245B38]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Observation verified</span>
                    </div>
                    <p className="text-xs text-[#245B38] font-sans leading-relaxed">
                      Fixed-size recurrent state vectors rely on superposition. As competing associations accumulate, the inner-product readout begins cross-talking with distractor coordinate projections.
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#EAE6DF]">
                <button
                  onClick={resetExperiment}
                  className="px-4 py-2.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F1F2F0] text-[#5F625F] hover:text-[#252525] text-xs font-sans border border-[#D8DCD8] flex items-center gap-2 cursor-pointer transition font-medium"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restart guided lesson</span>
                </button>

                <button
                  onClick={() => setMode('sandbox')}
                  className="px-5 py-2.5 rounded-lg bg-[#252525] hover:bg-[#151515] text-white font-sans text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition"
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
          <div className="rounded-xl border border-[#D8DCD8] bg-[#F7F5EF] p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#5F625F] font-semibold flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#31566E]" />
                Sandbox presets
              </span>
              <span className="text-xs text-[#5F625F]">Deterministic parameters</span>
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
                  onClick={() => applyPreset(p.key)}
                  className="p-3 rounded-lg bg-[#FFFFFF] hover:bg-[#F1F2F0] border border-[#D8DCD8] text-left transition cursor-pointer shadow-2xs"
                >
                  <div className="font-semibold text-[#252525] text-xs">{p.name}</div>
                  <div className="text-xs font-mono text-[#5F625F] mt-0.5">{p.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Parameter Panel */}
          <div className="rounded-xl border border-[#D8DCD8] bg-[#FFFFFF] p-5 space-y-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EAE6DF] pb-3">
              <span className="text-xs font-semibold text-[#252525] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#31566E]" />
                System parameter controls
              </span>
              <span className="text-xs font-sans text-[#5F625F]">
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
              {/* 1. Dimension */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#5F625F] font-medium" title="Coordinate capacity of the recurrent state space">
                    Dimension (D)
                  </span>
                  <span className="font-mono text-xs font-semibold bg-[#E7F2FA] text-[#31566E] border border-[#B8D7ED] px-2 py-0.5 rounded">
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
                  className="w-full h-1.5 bg-[#EAE6DF] rounded-lg appearance-none cursor-pointer accent-[#31566E]"
                />
                <div className="flex justify-between text-xs font-mono text-[#5F625F]">
                  <span>4</span>
                  <span>16</span>
                  <span>32</span>
                </div>
              </div>

              {/* 2. Retention */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#5F625F] font-medium" title="Fraction of state carried forward: M_{t+1} = \lambda M_t + ...">
                    Retention (λ)
                  </span>
                  <span className="font-mono text-xs font-semibold bg-[#DCEFE2] text-[#247A4B] border border-[#BCE2C9] px-2 py-0.5 rounded">
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
                  className="w-full h-1.5 bg-[#EAE6DF] rounded-lg appearance-none cursor-pointer accent-[#247A4B]"
                />
                <div className="flex justify-between text-xs font-mono text-[#5F625F]">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* 3. Write Strength */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#5F625F] font-medium" title="Magnitude of outer product updates \eta k_t v_t^\top">
                    Write strength (η)
                  </span>
                  <span className="font-mono text-xs font-semibold bg-[#F1F2F0] text-[#252525] border border-[#D8DCD8] px-2 py-0.5 rounded">
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
                  className="w-full h-1.5 bg-[#EAE6DF] rounded-lg appearance-none cursor-pointer accent-[#31566E]"
                />
                <div className="flex justify-between text-xs font-mono text-[#5F625F]">
                  <span>0.1</span>
                  <span>1.0</span>
                  <span>2.0</span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#EAE6DF]">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  id="sandbox-step-btn"
                  onClick={runStep}
                  className="px-3 py-1.5 rounded-lg bg-[#DCEFE2] hover:bg-[#CDE8D5] text-[#245B38] border border-[#BCE2C9] text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition"
                  title="Execute exactly one memory write transition"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  <span>Step (t={step})</span>
                </button>

                <button
                  id="sandbox-play-btn"
                  onClick={togglePlay}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition ${
                    isRunning
                      ? 'bg-[#FFF5D8] border-[#E8D9A8] text-[#8C5D17]'
                      : 'bg-[#FFFFFF] hover:bg-[#F7F5EF] border-[#D8DCD8] text-[#252525]'
                  }`}
                >
                  {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isRunning ? 'Pause' : 'Auto-play'}</span>
                </button>

                <button
                  id="sandbox-distractor-btn"
                  onClick={addDistractor}
                  className="px-3 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F7F5EF] border border-[#D8DCD8] text-[#252525] text-xs font-medium cursor-pointer flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add distractor</span>
                </button>

                <button
                  id="sandbox-reset-btn"
                  onClick={resetExperiment}
                  className="px-3 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F7F5EF] border border-[#D8DCD8] text-[#5F625F] hover:text-[#252525] text-xs cursor-pointer flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Probe Selector */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[#5F625F] text-xs uppercase font-medium">Probe:</span>
                <div className="flex flex-wrap items-center gap-1 font-mono">
                  {facts.slice(0, 4).map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setActiveProbe(f.key)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                        activeProbe === f.key
                          ? 'bg-[#E7F2FA] border border-[#B8D7ED] text-[#31566E] font-semibold'
                          : 'bg-[#FFFFFF] border border-[#D8DCD8] text-[#5F625F] hover:text-[#252525]'
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
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#D8DCD8] shadow-2xs">
              <div className="text-xs text-[#5F625F] uppercase font-medium">Ground truth</div>
              <div className="text-lg font-serif font-semibold text-[#252525] mt-0.5">
                {groundTruth} <span className="font-sans text-xs text-[#5F625F]">({activeProbe || 'Japan'})</span>
              </div>
            </div>

            <div
              className={`p-3.5 rounded-lg border shadow-2xs ${
                isCorrect
                  ? 'bg-[#DCEFE2] border-[#BCE2C9] text-[#247A4B]'
                  : 'bg-[#F9E9ED] border-[#F2CAD2] text-[#B64235]'
              }`}
            >
              <div className="flex items-center justify-between text-xs uppercase font-medium">
                <span>Model output</span>
                {isCorrect ? (
                  <span className="text-[#247A4B] font-semibold">✓ Correct</span>
                ) : (
                  <span className="text-[#B64235] font-semibold">Interference detected</span>
                )}
              </div>
              <div className="text-lg font-serif font-semibold mt-0.5">
                {prediction}
              </div>
            </div>

            <div
              className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#D8DCD8] shadow-2xs"
              title="Cosine similarity between the retrieved representation and a candidate value representation. This is not a calibrated probability."
            >
              <div className="text-xs text-[#5F625F] uppercase font-medium">Retrieval score</div>
              <div className="text-lg font-mono font-semibold text-[#31566E] mt-0.5">
                {retrievalScore.toFixed(4)}
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#D8DCD8] shadow-2xs">
              <div className="text-xs text-[#5F625F] uppercase font-medium">Top-1 margin</div>
              <div className={`text-lg font-mono font-semibold mt-0.5 ${top1Margin > 0.2 ? 'text-[#247A4B]' : 'text-[#B64235]'}`}>
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
          <div className="rounded-xl border border-[#D8DCD8] bg-[#FFFFFF] p-5 space-y-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6DF] pb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-[#31566E]" />
                <h4 className="font-serif font-bold text-base text-[#252525]">
                  Current run vs baseline
                </h4>
              </div>
              <button
                id="save-baseline-btn"
                onClick={saveBaseline}
                className="px-3 py-1.5 rounded-lg bg-[#F7F5EF] hover:bg-[#F1F2F0] border border-[#D8DCD8] text-[#252525] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
              >
                <Bookmark className="w-3.5 h-3.5 text-[#31566E]" />
                <span>{baseline ? 'Update baseline' : 'Save as baseline'}</span>
              </button>
            </div>

            {comparisonDiff ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                <div className="p-3 rounded-lg bg-[#F7F5EF] border border-[#EAE6DF]">
                  <span className="text-xs text-[#5F625F] block">Cosine similarity</span>
                  <div className="text-base font-mono font-bold text-[#31566E] mt-0.5">
                    {comparisonDiff.stateCosineSimilarity.toFixed(4)}
                  </div>
                  <div className="text-xs text-[#5F625F] mt-0.5">Vector alignment</div>
                </div>

                <div className="p-3 rounded-lg bg-[#F7F5EF] border border-[#EAE6DF]">
                  <span className="text-xs text-[#5F625F] block">Δ Retrieval score</span>
                  <div
                    className={`text-base font-mono font-bold mt-0.5 flex items-center gap-1 ${
                      comparisonDiff.scoreDiff >= 0 ? 'text-[#247A4B]' : 'text-[#B64235]'
                    }`}
                  >
                    {comparisonDiff.scoreDiff >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{comparisonDiff.scoreDiff >= 0 ? '+' : ''}{comparisonDiff.scoreDiff.toFixed(4)}</span>
                  </div>
                  <div className="text-xs font-mono text-[#5F625F] mt-0.5">vs {comparisonDiff.baseScore.toFixed(3)}</div>
                </div>

                <div className="p-3 rounded-lg bg-[#F7F5EF] border border-[#EAE6DF]">
                  <span className="text-xs text-[#5F625F] block">Δ Top-1 margin</span>
                  <div
                    className={`text-base font-mono font-bold mt-0.5 flex items-center gap-1 ${
                      comparisonDiff.marginDiff >= 0 ? 'text-[#247A4B]' : 'text-[#B64235]'
                    }`}
                  >
                    {comparisonDiff.marginDiff >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{comparisonDiff.marginDiff >= 0 ? '+' : ''}{comparisonDiff.marginDiff.toFixed(4)}</span>
                  </div>
                  <div className="text-xs text-[#5F625F] mt-0.5">Confidence margin</div>
                </div>

                <div className="p-3 rounded-lg bg-[#F7F5EF] border border-[#EAE6DF]">
                  <span className="text-xs text-[#5F625F] block">Δ Matrix norm</span>
                  <div className="text-base font-mono font-bold text-[#8C5D17] mt-0.5">
                    {comparisonDiff.matrixNormDiff >= 0 ? '+' : ''}{comparisonDiff.matrixNormDiff.toFixed(4)}
                  </div>
                  <div className="text-xs text-[#5F625F] mt-0.5">Frobenius energy</div>
                </div>

                <div className="p-3 rounded-lg bg-[#F7F5EF] border border-[#EAE6DF]">
                  <span className="text-xs text-[#5F625F] block">Prediction shift</span>
                  <div className="text-xs font-bold mt-1 truncate">
                    {comparisonDiff.predictionChanged ? (
                      <span className="text-[#B64235]">
                        {comparisonDiff.basePrediction} → {comparisonDiff.currPrediction}
                      </span>
                    ) : (
                      <span className="text-[#247A4B]">Unchanged ({comparisonDiff.currPrediction})</span>
                    )}
                  </div>
                  <div className="text-xs text-[#5F625F] mt-0.5">Argmax outcome</div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#5F625F] font-sans italic">
                No baseline saved yet. Click "Save as baseline" to lock in current parameters and compare future adjustments.
              </p>
            )}
          </div>

          {/* ============================================================ */}
          {/* SANDBOX EXPERIMENT HISTORY (Section 20) */}
          {/* ============================================================ */}
          {historyRuns.length > 0 && (
            <div className="rounded-xl border border-[#D8DCD8] bg-[#FFFFFF] p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between text-xs border-b border-[#EAE6DF] pb-2.5">
                <span className="text-[#5F625F] font-semibold flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-[#31566E]" />
                  Experiment run history
                </span>
                <span className="text-xs text-[#5F625F]">
                  {historyRuns.length} recorded snapshot{historyRuns.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {historyRuns.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => selectHistoricalRun(r.id)}
                    className="w-full p-2.5 rounded-lg bg-[#F7F5EF] hover:bg-[#F1F2F0] border border-[#EAE6DF] flex items-center justify-between text-xs transition cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[#31566E] font-semibold">{r.label}</span>
                      <span className="text-[#5F625F] text-xs">({r.timestamp})</span>
                      <span className="font-mono text-[#5F625F] text-xs">
                        D={r.config.dimension} λ={Math.round(r.config.retention * 100)}%
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[#5F625F]">"{r.probe}" → <strong className="text-[#252525]">{r.prediction}</strong></span>
                      <span className="font-mono text-[#31566E] text-xs">{r.retrievalScore.toFixed(3)}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                          r.status === 'Correct'
                            ? 'bg-[#DCEFE2] text-[#247A4B]'
                            : 'bg-[#F9E9ED] text-[#B64235]'
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
            <div className="rounded-xl border border-[#F2CAD2] bg-[#F9E9ED] p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F2CAD2] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-[#FFFFFF] border border-[#F2CAD2] text-[#B64235]">
                    <AlertOctagon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs uppercase text-[#B64235] font-semibold tracking-wider">
                      Observed anomaly
                    </div>
                    <h4 className="text-base font-serif font-semibold text-[#252525]">Interference detected</h4>
                  </div>
                </div>

                <button
                  onClick={() => setShowFailureTrace(!showFailureTrace)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F7F5EF] border border-[#F2CAD2] text-[#B64235] text-xs font-semibold transition cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{showFailureTrace ? 'Hide trace' : 'Trace interference'}</span>
                </button>
              </div>

              <p className="text-xs text-[#5F625F] font-sans leading-relaxed">
                Querying for <em>"{activeProbe || 'Japan'}"</em> projected strongest onto <em>"{prediction}"</em> instead of <em>"{groundTruth}"</em> due to coordinate superposition overlap in the fixed-size {config.dimension}×{config.dimension} state space.
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

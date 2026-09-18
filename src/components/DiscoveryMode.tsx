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
      className="rounded-2xl border border-[#232A3B] bg-[#090D16] p-5 sm:p-7 text-slate-100 shadow-xl space-y-7"
    >
      {/* ============================================================ */}
      {/* TOP BAR: REAL MODE SWITCHER & REPRODUCIBLE RUN ID */}
      {/* ============================================================ */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1E2536] pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <EvidenceStrip type="live" detail="Real model engine" />
          <div className="flex items-center bg-[#111624] border border-[#232B3E] rounded-xl p-1 shadow-inner">
            <button
              id="mode-toggle-guided"
              onClick={() => setMode('guided')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                mode === 'guided'
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>GUIDED MODE</span>
            </button>
            <button
              id="mode-toggle-sandbox"
              onClick={() => setMode('sandbox')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                mode === 'sandbox'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>SANDBOX MODE</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-sans text-slate-400 hidden lg:inline">
            {mode === 'guided'
              ? 'Follow the experiment step by step.'
              : 'Change the system and test your own hypothesis.'}
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
            <span>RUN ID:</span>
            <span className="px-2 py-0.5 rounded bg-[#111624] border border-[#232B3E] text-slate-200 font-semibold">
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
          <div className="rounded-2xl border border-purple-900/40 bg-[#0E0C18] p-4 sm:p-5 space-y-3 font-mono">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs uppercase tracking-widest text-purple-400 font-bold flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-purple-400" />
                SCIENTIFIC PROTOCOL · STEP {guidedStep} / 5
              </span>
              <button
                onClick={resetExperiment}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RESET GUIDED LAB</span>
              </button>
            </div>

            {/* 5 Stages Progress Tracker */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {[
                { num: 1, name: 'WRITE' },
                { num: 2, name: 'COMPRESS' },
                { num: 3, name: 'PROBE' },
                { num: 4, name: 'BREAK' },
                { num: 5, name: 'EXPLAIN' },
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
                        ? 'border-purple-500 bg-purple-950/70 text-white font-bold ring-1 ring-purple-500'
                        : isDone
                        ? 'border-emerald-700/60 bg-emerald-950/20 text-emerald-300'
                        : isLocked
                        ? 'border-[#1C2332] bg-[#0A0D15] text-slate-600 cursor-not-allowed opacity-60'
                        : 'border-[#222B3D] bg-[#121826] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span>0{st.num}</span>
                      {isDone ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      ) : isLocked ? (
                        <Lock className="w-3 h-3 text-slate-600" />
                      ) : null}
                    </div>
                    <div className="text-xs sm:text-sm font-bold truncate mt-1">
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
            <div className="rounded-2xl border border-[#232B3E] bg-[#0C111C] p-5 sm:p-6 space-y-5">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase text-purple-400 font-bold">
                  STAGE 01 · WRITING INITIAL ASSOCIATIONS
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                  Write base facts into a <GlossaryTerm term="recurrent state" className="text-white hover:text-purple-300">fixed-size recurrent state</GlossaryTerm>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                  In a recurrent memory architecture, facts are not stored in an expanding <GlossaryTerm term="kv-cache" className="text-slate-300 hover:text-purple-300">KV-cache</GlossaryTerm> list. Instead, each incoming association is mapped into vector representations and written as an <GlossaryTerm term="Hebbian plasticity" className="text-slate-300 hover:text-purple-300">outer-product update</GlossaryTerm> into a single recurrent state matrix <span className="font-mono text-purple-300">{"M ∈ ℝ^(16×16)"}</span>.
                </p>
              </div>

              {/* Input stream preview */}
              <div className="p-4 rounded-xl bg-[#080C14] border border-[#1C263A] space-y-3 font-mono text-xs">
                <div className="text-slate-400 text-xs uppercase font-bold">
                  CANONICAL STREAM TO WRITE:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {INITIAL_FACTS.map((f, i) => (
                    <div key={i} className="p-3 rounded-lg bg-[#111724] border border-[#1E293E] flex items-center justify-between">
                      <span className="text-slate-300 font-semibold">{f.key}</span>
                      <span className="text-purple-300 font-bold">→ {f.value}</span>
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
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer"
                >
                  <Database className="w-4 h-4" />
                  <span>WRITE FACTS INTO MEMORY</span>
                </button>

                {guidedCompleted[0] && (
                  <button
                    onClick={() => setGuidedStep(2)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30"
                  >
                    <span>NEXT: COMPRESS</span>
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
            <div className="rounded-2xl border border-[#232B3E] bg-[#0C111C] p-5 sm:p-6 space-y-5">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase text-purple-400 font-bold">
                  STAGE 02 · COORDINATE SUPERPOSITION
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                  3 facts compressed into a single matrix manifold
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                  Notice that the memory size has not grown. All 3 facts now superpose inside the same <span className="font-mono text-cyan-300">D=16</span> dimensional coordinates: <span className="font-mono text-purple-300">M = \sum \eta k_t v_t^\top</span>. The <GlossaryTerm term="Frobenius norm" className="text-slate-300 hover:text-amber-300">Frobenius norm</GlossaryTerm> <span className="font-mono text-amber-300">||M||_F = {matrixNorm.toFixed(4)}</span> reflects the accumulated magnitude of written coordinates.
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
                  className="px-4 py-2 rounded-xl bg-[#141B2A] border border-slate-700 text-slate-300 font-mono text-xs cursor-pointer"
                >
                  BACK TO STEP 1
                </button>
                <button
                  id="guided-step2-next-btn"
                  onClick={() => {
                    completeGuidedStep(2);
                    setGuidedStep(3);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-600/30"
                >
                  <span>NEXT: PROBE MEMORY</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* STEP 3: PROBE (PREDICTION BEFORE RESULT MANDATORY) */}
          {/* -------------------------------------------------------- */}
          {guidedStep === 3 && (
            <div className="rounded-2xl border border-[#232B3E] bg-[#0C111C] p-5 sm:p-6 space-y-5">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase text-purple-400 font-bold">
                  STAGE 03 · HYPOTHESIS & PROBE EVALUATION
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                  Formulate a prediction before probing the state
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                  We will query the memory with key <strong className="text-white">"Japan"</strong>. Will the superposed matrix readout project accurately onto <strong className="text-emerald-400">"Tokyo"</strong> without interference?
                </p>
              </div>

              {/* Prediction Question Box */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#0E1524] border border-[#1E293E] space-y-3 font-mono">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-bold">QUESTION: Will current memory retrieve "Tokyo"?</span>
                  <span className="text-xs text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                    PREDICTION REQUIRED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    id="predict-correct-btn"
                    onClick={() => setLearnerPrediction('correct')}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                      learnerPrediction === 'correct'
                        ? 'bg-purple-950 border-purple-500 text-white font-bold ring-1 ring-purple-500'
                        : 'bg-[#121927] border-[#222E44] text-slate-300 hover:bg-[#1A2538]'
                    }`}
                  >
                    <span>YES, RETRIEVE CORRECTLY</span>
                    {learnerPrediction === 'correct' && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                  </button>

                  <button
                    id="predict-interfere-btn"
                    onClick={() => setLearnerPrediction('interference')}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                      learnerPrediction === 'interference'
                        ? 'bg-purple-950 border-purple-500 text-white font-bold ring-1 ring-purple-500'
                        : 'bg-[#121927] border-[#222E44] text-slate-300 hover:bg-[#1A2538]'
                    }`}
                  >
                    <span>NO, INTERFERENCE OCCURS</span>
                    {learnerPrediction === 'interference' && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                  </button>
                </div>

                {!learnerPrediction && (
                  <p className="text-xs text-amber-400/90 font-sans">
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
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-600/30"
                >
                  <Eye className="w-4 h-4" />
                  <span>RUN PROBE EVALUATION</span>
                </button>
              </div>

              {/* Computed Probe Results & Comparison (once executed) */}
              {guidedCompleted[2] && (
                <div className="space-y-4 pt-3 border-t border-[#1C263A] animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
                    <div className="p-3 rounded-xl bg-[#0E1524] border border-[#1E293E]">
                      <div className="text-xs text-slate-400 uppercase">GROUND TRUTH</div>
                      <div className="text-base font-bold text-white mt-0.5">{groundTruth}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-700/50">
                      <div className="text-xs text-slate-400 uppercase">MODEL OUTPUT</div>
                      <div className="text-base font-bold text-emerald-300 mt-0.5">{prediction}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0E1524] border border-[#1E293E]">
                      <div className="text-xs text-slate-400 uppercase">RETRIEVAL SCORE</div>
                      <div className="text-base font-bold text-purple-300 mt-0.5">{retrievalScore.toFixed(4)}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0E1524] border border-[#1E293E]">
                      <div className="text-xs text-slate-400 uppercase">TOP-1 MARGIN</div>
                      <div className="text-base font-bold text-emerald-400 mt-0.5">{top1Margin.toFixed(4)}</div>
                    </div>
                  </div>

                  {/* PREDICTION VS ACTUAL RESULT */}
                  <div className="p-4 rounded-xl bg-[#0D1420] border border-[#1E2A40] space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 uppercase font-bold">PREDICTION vs ACTUAL:</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-600 text-emerald-300 font-bold text-xs">
                        EVALUATION CONFIRMED
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 rounded-lg bg-[#121A2A]">
                        <span className="text-xs text-slate-500 uppercase block">YOUR PREDICTION</span>
                        <div className="text-white font-bold mt-0.5">
                          {learnerPrediction === 'correct' ? 'Correct Retrieval' : 'Interference'}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#121A2A]">
                        <span className="text-xs text-slate-500 uppercase block">ACTUAL OUTCOME</span>
                        <div className="text-emerald-400 font-bold mt-0.5">
                          {status} ({prediction} with score {retrievalScore.toFixed(3)})
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed pt-1">
                      Because only 3 facts were written into a <span className="font-mono text-cyan-300">D=16</span> dimensional space, vector keys remain largely quasi-orthogonal, leaving ample representational room for clean readout.
                    </p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setGuidedStep(4)}
                      className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-600/30"
                    >
                      <span>NEXT: BREAK THE MEMORY</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* STEP 4: BREAK (CAUSE INTERFERENCE) */}
          {/* -------------------------------------------------------- */}
          {guidedStep === 4 && (
            <div className="rounded-2xl border border-rose-900/50 bg-[#0E0B14] p-5 sm:p-6 space-y-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-rose-400 bg-rose-950/80 border border-rose-800/80 px-2.5 py-0.5 rounded font-bold flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                    STAGE 04 · BREAK THE MEMORY
                  </span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                  Add competing information to cause coordinate interference
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                  Click below to inject distractor facts into the stream. Each click writes an outer-product update into the same fixed-size <span className="font-mono text-cyan-300">D=16</span> matrix. Watch the retrieval score and margin degrade until interference triggers.
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
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-600/30 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>ADD COMPETING DISTRACTOR</span>
                </button>
                <span className="text-xs font-mono text-slate-400">
                  Active stream facts: <strong className="text-white">{facts.length}</strong>
                </span>
              </div>

              {/* Real Computed Before vs After */}
              {beforeAfterDistractor && (
                <div className="p-4 sm:p-5 rounded-xl bg-[#140F1D] border border-rose-900/60 space-y-3 font-mono animate-in fade-in">
                  <div className="flex items-center justify-between text-xs border-b border-rose-950 pb-2">
                    <span className="text-rose-300 font-bold uppercase">
                      INJECTED: {beforeAfterDistractor.distractor.key} → {beforeAfterDistractor.distractor.value}
                    </span>
                    <span className="text-xs text-slate-400">
                      Target probe: "{activeProbe || 'Japan'}"
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-lg bg-[#1A1326] border border-rose-950">
                      <span className="text-xs text-slate-400 block uppercase">PREDICTION</span>
                      <div className="font-bold mt-1">
                        <span className="text-slate-400">{beforeAfterDistractor.before.prediction}</span>
                        <span className="mx-1 text-slate-600">→</span>
                        <span className={isCorrect ? 'text-emerald-400' : 'text-rose-400'}>
                          {beforeAfterDistractor.after.prediction}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#1A1326] border border-rose-950">
                      <span className="text-xs text-slate-400 block uppercase">SCORE GAP</span>
                      <div className="font-bold mt-1">
                        <span className="text-slate-400">{beforeAfterDistractor.before.retrievalScore.toFixed(3)}</span>
                        <span className="mx-1 text-slate-600">→</span>
                        <span className="text-purple-300">{beforeAfterDistractor.after.retrievalScore.toFixed(3)}</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#1A1326] border border-rose-950">
                      <span className="text-xs text-slate-400 block uppercase">TOP-1 MARGIN</span>
                      <div className="font-bold mt-1">
                        <span className="text-slate-400">{beforeAfterDistractor.before.top1Margin.toFixed(3)}</span>
                        <span className="mx-1 text-slate-600">→</span>
                        <span className={beforeAfterDistractor.after.top1Margin < 0.1 ? 'text-rose-400' : 'text-amber-300'}>
                          {beforeAfterDistractor.after.top1Margin.toFixed(3)}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#1A1326] border border-rose-950">
                      <span className="text-xs text-slate-400 block uppercase">OUTCOME</span>
                      <div className="font-bold mt-1 text-xs">
                        {status === 'Correct' ? (
                          <span className="text-emerald-400">CORRECT (MARGIN REDUCED)</span>
                        ) : (
                          <span className="text-rose-400">INTERFERENCE TRIGGERED</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => setGuidedStep(3)}
                  className="px-4 py-2 rounded-xl bg-[#141B2A] border border-slate-700 text-slate-300 font-mono text-xs cursor-pointer"
                >
                  BACK TO STEP 3
                </button>
                <button
                  id="guided-step4-next-btn"
                  onClick={() => {
                    completeGuidedStep(4);
                    setGuidedStep(5);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-600/30"
                >
                  <span>NEXT: EXPLAIN & CONTROLLED LAB</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* STEP 5: EXPLAIN & CONTROLLED EXPERIMENT */}
          {/* -------------------------------------------------------- */}
          {guidedStep === 5 && (
            <div className="rounded-2xl border border-purple-800/60 bg-[#0C101A] p-5 sm:p-6 space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase text-purple-400 font-bold">
                  STAGE 05 · SCIENTIFIC INTERPRETATION & ISOLATED VARIABLES
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                  Controlled Variable Experiment
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                  In a rigorous scientific inquiry, we change <strong className="text-white">one meaningful variable at a time</strong> to identify causal relationships. Select one variable below to isolate its effect:
                </p>
              </div>

              {/* Controlled Variable Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <button
                  onClick={() => handleGuidedControlledExperiment('dim')}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                    guidedIntervention === 'dim'
                      ? 'border-cyan-500 bg-cyan-950/70 text-cyan-200 ring-1 ring-cyan-500'
                      : 'border-[#1C2538] bg-[#0E1726] text-slate-400'
                  }`}
                >
                  <div className="font-bold">Increase Dimension (D)</div>
                  <div className="text-xs opacity-75 mt-0.5">D={config.dimension} → D=32</div>
                </button>

                <button
                  onClick={() => handleGuidedControlledExperiment('ret')}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                    guidedIntervention === 'ret'
                      ? 'border-cyan-500 bg-cyan-950/70 text-cyan-200 ring-1 ring-cyan-500'
                      : 'border-[#1C2538] bg-[#0E1726] text-slate-400'
                  }`}
                >
                  <div className="font-bold">Lower Retention (λ)</div>
                  <div className="text-xs opacity-75 mt-0.5">λ={Math.round(config.retention * 100)}% → λ=50%</div>
                </button>

                <button
                  onClick={() => handleGuidedControlledExperiment('dist')}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                    guidedIntervention === 'dist'
                      ? 'border-cyan-500 bg-cyan-950/70 text-cyan-200 ring-1 ring-cyan-500'
                      : 'border-[#1C2538] bg-[#0E1726] text-slate-400'
                  }`}
                >
                  <div className="font-bold">Clear Distractors</div>
                  <div className="text-xs opacity-75 mt-0.5">N={facts.length} → N=3 base facts</div>
                </button>
              </div>

              {/* WHAT CHANGED? WHY IT MATTERS? OBSERVED RESULT? */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3.5 rounded-xl bg-[#09101A] border border-[#1A263B] space-y-1">
                  <span className="text-xs text-cyan-400 font-bold uppercase">WHAT CHANGED?</span>
                  <p className="text-xs text-slate-200 font-sans leading-relaxed">
                    {guidedIntervention === 'dim'
                      ? 'Expanded state capacity to D=32.'
                      : guidedIntervention === 'ret'
                      ? 'Reduced decay factor to λ=0.50.'
                      : 'Removed all competing distractors.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#09101A] border border-[#1A263B] space-y-1">
                  <span className="text-xs text-purple-400 font-bold uppercase">WHY IT MATTERS</span>
                  <p className="text-xs text-slate-200 font-sans leading-relaxed">
                    {guidedIntervention === 'dim'
                      ? 'Higher dimensions increase near-orthogonal vector capacity exponentially.'
                      : guidedIntervention === 'ret'
                      ? 'Low retention causes early associations to vanish rapidly.'
                      : 'Uncrowded states experience minimal coordinate overlap.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#09101A] border border-[#1A263B] space-y-1">
                  <span className="text-xs text-emerald-400 font-bold uppercase">OBSERVED RESULT</span>
                  <p className="text-xs text-white font-bold font-mono mt-0.5">
                    {prediction} (Score: {retrievalScore.toFixed(3)}, Status: {status})
                  </p>
                </div>
              </div>

              {/* Scientific Interpretation */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#0B0F1B] border border-[#1E293E] space-y-2">
                <h4 className="font-serif font-bold text-base text-white">
                  Scientific Conclusion
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                  {status === 'Interference'
                    ? 'Adding competing facts into the fixed-size recurrent state caused coordinate superposition overlap. The projected readout vector projected closer to a distractor candidate than the target association.'
                    : 'Additional information reduced the top-1 margin, but the representational capacity was sufficient to preserve the target association.'}
                </p>
              </div>

              {/* Quiz: Why did it fail? */}
              <div className="rounded-2xl border border-[#252C3F] bg-[#0E1321] p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-[#1E2536] pb-3">
                  <HelpCircle className="w-4 h-4 text-purple-400" />
                  <h4 className="text-sm font-bold font-mono text-white">QUIZ: WHY DID IT FAIL?</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-xs">
                  {quizOptions.map((opt) => {
                    const isSelected = selectedQuizAnswer === opt.id;
                    let btnClass = 'border-[#222A3D] bg-[#121826] hover:bg-[#182133] text-slate-200';

                    if (quizRevealed) {
                      if (opt.isCorrect) {
                        btnClass = 'border-emerald-700 bg-emerald-950/60 text-emerald-200 font-bold';
                      } else if (isSelected && !opt.isCorrect) {
                        btnClass = 'border-rose-700 bg-rose-950/60 text-rose-300';
                      } else {
                        btnClass = 'border-[#1C2332] bg-[#0E131E] opacity-40 text-slate-500';
                      }
                    }

                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setSelectedQuizAnswer(opt.id);
                          setQuizRevealed(true);
                        }}
                        className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${btnClass}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-300 font-bold shrink-0">
                            {opt.id}
                          </span>
                          <span>{opt.text}</span>
                        </div>
                        {quizRevealed && opt.isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {quizRevealed && (
                  <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-600/50 space-y-1 animate-in fade-in">
                    <div className="flex items-center gap-2 font-mono font-bold text-xs text-emerald-400 uppercase">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>CORRECT SCIENTIFIC OBSERVATION</span>
                    </div>
                    <p className="text-xs text-slate-200 font-sans leading-relaxed">
                      Fixed-size recurrent state vectors rely on superposition. As competing associations accumulate, the inner-product readout begins cross-talking with distractor coordinate projections.
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1C263A]">
                <button
                  onClick={resetExperiment}
                  className="px-4 py-2.5 rounded-xl bg-[#141B2A] hover:bg-[#1C253B] text-slate-300 text-xs font-mono border border-slate-700 flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>RESTART GUIDED LESSON</span>
                </button>

                <button
                  onClick={() => setMode('sandbox')}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
                >
                  <Wrench className="w-4 h-4" />
                  <span>SWITCH TO SANDBOX MODE</span>
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
          <div className="rounded-2xl border border-[#1E2536] bg-[#0E1320] p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 uppercase font-bold flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-400" />
                SANDBOX PRESETS
              </span>
              <span className="text-xs text-slate-500">Real deterministic parameters</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
              {[
                { key: 'clean', name: 'CLEAN MEMORY', sub: 'D=16, λ=0.95, low noise' },
                { key: 'stress', name: 'PRESSURE', sub: 'D=8, λ=0.95, 8 distractors' },
                { key: 'forget', name: 'FORGETTING', sub: 'D=16, λ=0.55, decay' },
                { key: 'capacity', name: 'HIGH CAPACITY', sub: 'D=32, λ=0.95' },
              ].map((p) => (
                <button
                  key={p.key}
                  onClick={() => applyPreset(p.key)}
                  className="p-3 rounded-xl bg-[#121827] hover:bg-[#1A2338] border border-[#232E45] text-left transition cursor-pointer"
                >
                  <div className="font-bold text-white text-xs">{p.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{p.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Parameter Panel */}
          <div className="rounded-2xl border border-[#1E2536] bg-[#0C101A] p-5 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1A2130] pb-3">
              <span className="text-xs font-mono text-slate-300 font-bold uppercase flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-400" />
                SYSTEM PARAMETER CONTROLS
              </span>
              <span className="text-xs font-sans text-slate-500">
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-xs">
              {/* 1. Dimension */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-semibold" title="Coordinate capacity of the recurrent state space">
                    DIMENSION (D)
                  </span>
                  <span className="text-cyan-300 font-bold bg-cyan-950/70 border border-cyan-800/60 px-2 py-0.5 rounded">
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
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>4</span>
                  <span>16</span>
                  <span>32</span>
                </div>
              </div>

              {/* 2. Retention */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-semibold" title="Fraction of state carried forward: M_{t+1} = \lambda M_t + ...">
                    RETENTION (λ)
                  </span>
                  <span className="text-emerald-400 font-bold bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 rounded">
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
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* 3. Write Strength */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-semibold" title="Magnitude of outer product updates \eta k_t v_t^\top">
                    WRITE STRENGTH (η)
                  </span>
                  <span className="text-purple-300 font-bold bg-purple-950/70 border border-purple-800/60 px-2 py-0.5 rounded">
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
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>0.1</span>
                  <span>1.0</span>
                  <span>2.0</span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1A2130]">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  id="sandbox-step-btn"
                  onClick={runStep}
                  className="btn btn-primary text-xs font-bold cursor-pointer"
                  title="Execute exactly one memory write transition"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  <span>STEP (t={step})</span>
                </button>

                <button
                  id="sandbox-play-btn"
                  onClick={togglePlay}
                  className={`btn ${
                    isRunning ? 'btn-warning' : 'btn-secondary'
                  } text-xs font-bold cursor-pointer`}
                >
                  {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isRunning ? 'PAUSE' : 'AUTO-PLAY'}</span>
                </button>

                <button
                  id="sandbox-distractor-btn"
                  onClick={addDistractor}
                  className="btn btn-warning text-xs font-medium cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ADD DISTRACTOR</span>
                </button>

                <button
                  id="sandbox-reset-btn"
                  onClick={resetExperiment}
                  className="btn btn-secondary text-xs cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>RESET</span>
                </button>
              </div>

              {/* Probe Selector */}
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className="text-slate-500 text-xs uppercase">PROBE:</span>
                <div className="flex flex-wrap items-center gap-1">
                  {facts.slice(0, 4).map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setActiveProbe(f.key)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        activeProbe === f.key
                          ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-bold'
                          : 'bg-[#101624] border border-[#1E283E] text-slate-400 hover:text-slate-200'
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
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-[#0D121F] border border-[#1E2536]">
              <div className="text-xs text-slate-400 uppercase">GROUND TRUTH</div>
              <div className="text-lg font-bold text-white mt-0.5">
                {groundTruth} ({activeProbe || 'Japan'})
              </div>
            </div>

            <div
              className={`p-3.5 rounded-xl border ${
                isCorrect
                  ? 'bg-emerald-950/30 border-emerald-700/50'
                  : 'bg-rose-950/30 border-rose-700/60'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-400 uppercase">
                <span>MODEL OUTPUT</span>
                {isCorrect ? (
                  <span className="text-emerald-400 font-bold">✓ CORRECT</span>
                ) : (
                  <span className="text-rose-400 font-bold">✗ INTERFERENCE</span>
                )}
              </div>
              <div className={`text-lg font-bold mt-0.5 ${isCorrect ? 'text-emerald-300' : 'text-rose-300'}`}>
                {prediction}
              </div>
            </div>

            <div
              className="p-3.5 rounded-xl bg-[#0D121F] border border-[#1E2536]"
              title="This score is computed from representation similarity. It is not a calibrated probability."
            >
              <div className="text-xs text-slate-400 uppercase">RETRIEVAL SCORE</div>
              <div className="text-lg font-bold text-purple-300 mt-0.5">
                {retrievalScore.toFixed(4)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0D121F] border border-[#1E2536]">
              <div className="text-xs text-slate-400 uppercase">TOP-1 MARGIN</div>
              <div className={`text-lg font-bold mt-0.5 ${top1Margin > 0.2 ? 'text-emerald-400' : 'text-rose-400'}`}>
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
          <div className="rounded-2xl border border-[#202B40] bg-[#0B0F19] p-5 space-y-4 font-mono">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1A2336] pb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-cyan-400" />
                <h4 className="font-serif font-bold text-base text-white">
                  CURRENT RUN vs BASELINE
                </h4>
              </div>
              <button
                id="save-baseline-btn"
                onClick={saveBaseline}
                className="btn btn-secondary text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{baseline ? 'UPDATE BASELINE' : 'SAVE AS BASELINE'}</span>
              </button>
            </div>

            {comparisonDiff ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-[#101726] border border-[#1C2840]">
                  <span className="text-xs text-slate-500 uppercase block">COSINE SIMILARITY</span>
                  <div className="text-base font-bold text-cyan-300 mt-0.5">
                    {comparisonDiff.stateCosineSimilarity.toFixed(4)}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Vector alignment</div>
                </div>

                <div className="p-3 rounded-xl bg-[#101726] border border-[#1C2840]">
                  <span className="text-xs text-slate-500 uppercase block">Δ RETRIEVAL SCORE</span>
                  <div
                    className={`text-base font-bold mt-0.5 flex items-center gap-1 ${
                      comparisonDiff.scoreDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {comparisonDiff.scoreDiff >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{comparisonDiff.scoreDiff >= 0 ? '+' : ''}{comparisonDiff.scoreDiff.toFixed(4)}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">vs {comparisonDiff.baseScore.toFixed(3)}</div>
                </div>

                <div className="p-3 rounded-xl bg-[#101726] border border-[#1C2840]">
                  <span className="text-xs text-slate-500 uppercase block">Δ TOP-1 MARGIN</span>
                  <div
                    className={`text-base font-bold mt-0.5 flex items-center gap-1 ${
                      comparisonDiff.marginDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {comparisonDiff.marginDiff >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{comparisonDiff.marginDiff >= 0 ? '+' : ''}{comparisonDiff.marginDiff.toFixed(4)}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Confidence margin</div>
                </div>

                <div className="p-3 rounded-xl bg-[#101726] border border-[#1C2840]">
                  <span className="text-xs text-slate-500 uppercase block">Δ MATRIX NORM</span>
                  <div className="text-base font-bold text-amber-300 mt-0.5">
                    {comparisonDiff.matrixNormDiff >= 0 ? '+' : ''}{comparisonDiff.matrixNormDiff.toFixed(4)}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Frobenius energy</div>
                </div>

                <div className="p-3 rounded-xl bg-[#101726] border border-[#1C2840]">
                  <span className="text-xs text-slate-500 uppercase block">PREDICTION SHIFT</span>
                  <div className="text-xs font-bold mt-1 truncate">
                    {comparisonDiff.predictionChanged ? (
                      <span className="text-rose-400">
                        {comparisonDiff.basePrediction} → {comparisonDiff.currPrediction}
                      </span>
                    ) : (
                      <span className="text-emerald-400">Unchanged ({comparisonDiff.currPrediction})</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Argmax outcome</div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-sans italic">
                No baseline saved yet. Click "SAVE AS BASELINE" to lock in current parameters and compare future adjustments.
              </p>
            )}
          </div>

          {/* ============================================================ */}
          {/* SANDBOX EXPERIMENT HISTORY (Section 20) */}
          {/* ============================================================ */}
          {historyRuns.length > 0 && (
            <div className="rounded-2xl border border-[#1E2536] bg-[#0A0E18] p-5 space-y-3 font-mono">
              <div className="flex items-center justify-between text-xs border-b border-[#1A2130] pb-2.5">
                <span className="text-slate-400 uppercase font-bold flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-purple-400" />
                  EXPERIMENT RUN HISTORY
                </span>
                <span className="text-xs text-slate-500">
                  {historyRuns.length} recorded snapshot{historyRuns.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {historyRuns.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => selectHistoricalRun(r.id)}
                    className="w-full p-2.5 rounded-lg bg-[#111624] hover:bg-[#182033] border border-[#1F2A3F] flex items-center justify-between text-xs transition cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-300 font-bold">{r.label}</span>
                      <span className="text-slate-500 text-xs">({r.timestamp})</span>
                      <span className="text-slate-400 text-xs">
                        D={r.config.dimension} λ={Math.round(r.config.retention * 100)}%
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-slate-300">"{r.probe}" → <strong className="text-white">{r.prediction}</strong></span>
                      <span className="text-purple-300 text-xs">{r.retrievalScore.toFixed(3)}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                          r.status === 'Correct'
                            ? 'bg-emerald-950 text-emerald-300'
                            : 'bg-rose-950 text-rose-300'
                        }`}
                      >
                        {r.status.toUpperCase()}
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
            <div className="rounded-2xl border border-rose-700/70 bg-[#0F0D15] p-5 sm:p-6 space-y-4 font-mono">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-950 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-rose-950 border border-rose-700 text-rose-400">
                    <AlertOctagon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs uppercase text-rose-400 font-bold tracking-wider">
                      OBSERVED ANOMALY
                    </div>
                    <h4 className="text-lg font-bold text-white">RECURRENT MEMORY FAILURE</h4>
                  </div>
                </div>

                <button
                  onClick={() => setShowFailureTrace(!showFailureTrace)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold shadow-lg shadow-rose-600/30 transition-all hover:scale-105 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{showFailureTrace ? 'HIDE FAILURE TRACE' : 'TRACE FAILURE'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-300 font-sans leading-relaxed">
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

import React, { useState, useMemo, useCallback } from 'react';
import { CANONICAL_FACTS, createAssociativeMemory, Fact } from '../models/associativeMemory';
import { SourceBadge } from './ui/SourceBadge';
import { StateInspector } from './StateInspector';
import { FailureTrace, RecordedTraceStep } from './FailureTrace';
import { EvidenceStrip } from './ui/EvidenceStrip';
import { ParameterDelta } from './ParameterDelta';
import { ClaimEvidenceLimitation } from './ClaimEvidenceLimitation';
import { EXPERIMENT_PRESETS, ExperimentPreset } from '../data/experimentPresets';
import { experimentId } from '../types/experiment';
import {
  Play,
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
  initialMode = 'guided',
}) => {
  const [mode, setMode] = useState<'guided' | 'sandbox'>(initialMode);

  // Current parameters
  const [dimension, setDimension] = useState<number>(16);
  const [retention, setRetention] = useState<number>(0.95);
  const [distractorCount, setDistractorCount] = useState<number>(2);

  // Previous parameters for causal delta display
  const [prevConfig, setPrevConfig] = useState<{ dimension: number; retention: number; distractors: number } | null>(null);

  // Stepping controls & UI state
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null);
  const [showFailureTrace, setShowFailureTrace] = useState<boolean>(false);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<string | null>(null);
  const [quizRevealed, setQuizRevealed] = useState<boolean>(false);

  // Recovery experiment interactive state
  const [selectedIntervention, setSelectedIntervention] = useState<'dim' | 'ret' | 'dist'>('dim');
  const [learnerHypothesis, setLearnerHypothesis] = useState<'YES' | 'NO' | null>(null);
  const [recoveryResult, setRecoveryResult] = useState<RecoveryResult | null>(null);

  const targetFact: Fact = { key: 'Japan', value: 'Tokyo', category: 'Asia' };

  // Track parameter changes for ParameterDelta
  const updateConfig = (newDim: number, newRet: number, newDist: number) => {
    setPrevConfig({ dimension, retention, distractors: distractorCount });
    setDimension(newDim);
    setRetention(newRet);
    setDistractorCount(newDist);
    setShowFailureTrace(false);
    setRecoveryResult(null);
  };

  const applyPreset = (preset: ExperimentPreset) => {
    updateConfig(preset.config.dimension, preset.config.retention, preset.config.distractors);
  };

  // Generate sequence: Target fact + distractor facts
  const fullFactSequence = useMemo<Fact[]>(() => {
    const distractors = CANONICAL_FACTS.filter((f) => f.key !== targetFact.key).slice(0, distractorCount);
    return [targetFact, ...distractors];
  }, [distractorCount, targetFact]);

  // Compute live deterministic simulation and full step-by-step trace
  const { simulation, recordedTraceSteps } = useMemo(() => {
    const memory = createAssociativeMemory(fullFactSequence, dimension, retention, 0.8);
    const history: number[][][] = [];
    const stateSlices: number[][] = [Array(dimension).fill(0)];
    const traceSteps: RecordedTraceStep[] = [];
    let prevSlice = Array(dimension).fill(0);

    // Write facts sequentially and record state at each step
    for (let i = 0; i < fullFactSequence.length; i++) {
      const fact = fullFactSequence[i];
      memory.writeFact(fact);

      const mat = memory.getMatrix();
      history.push(mat);

      const slice = mat.map((row, idx) => row[idx % dimension] ?? 0);
      stateSlices.push(slice);
      const delta = slice.map((v, idx) => v - (prevSlice[idx] ?? 0));
      prevSlice = slice;

      const queryRes = memory.query(targetFact.key);

      traceSteps.push({
        stepIndex: i,
        label:
          fact.key === targetFact.key
            ? `${fact.key} → ${fact.value}`
            : `Distractor: ${fact.key} → ${fact.value}`,
        operation: 'WRITE',
        inputFact: {
          key: fact.key,
          value: fact.value,
          isTarget: fact.key === targetFact.key,
        },
        stateMatrix: mat,
        stateVector: slice,
        deltaVector: delta,
        predictionAtStep: queryRes.prediction,
        confidenceAtStep: queryRes.confidence,
        isCorrectAtStep: queryRes.prediction === targetFact.value,
        notes:
          fact.key === targetFact.key
            ? `Step 01: Ingested target association "${fact.key} → ${fact.value}" into D=${dimension} fast-weight matrix.`
            : `Step ${String(i + 1).padStart(2, '0')}: Ingested distractor "${fact.key} → ${fact.value}". Injected superposition cross-talk.`,
      });
    }

    const finalQuery = memory.query(targetFact.key);
    const finalMat = memory.getMatrix();
    const finalSlice = finalMat.map((row, idx) => row[idx % dimension] ?? 0);
    const finalIsCorrect = finalQuery.prediction === targetFact.value;

    // Add final READ step to trace
    traceSteps.push({
      stepIndex: fullFactSequence.length,
      label: `QUERY: ${targetFact.key}`,
      operation: 'READ',
      queryKey: targetFact.key,
      stateMatrix: finalMat,
      stateVector: finalSlice,
      deltaVector: Array(dimension).fill(0),
      predictionAtStep: finalQuery.prediction,
      confidenceAtStep: finalQuery.confidence,
      isCorrectAtStep: finalIsCorrect,
      notes: `Final Readout: Query vector q = vector("${targetFact.key}") projected onto matrix M to decode candidate value.`,
    });

    return {
      simulation: {
        history,
        stateSlices,
        prediction: finalQuery.prediction,
        confidence: finalQuery.confidence,
        isCorrect: finalIsCorrect,
        finalMatrix: finalMat,
      },
      recordedTraceSteps: traceSteps,
    };
  }, [fullFactSequence, dimension, retention, targetFact]);

  // Handlers
  const handleReset = useCallback(() => {
    updateConfig(16, 0.95, 2);
    setCurrentStepIndex(null);
    setShowFailureTrace(false);
    setSelectedQuizAnswer(null);
    setQuizRevealed(false);
    setRecoveryResult(null);
    setLearnerHypothesis(null);
  }, []);

  const handleStepThrough = useCallback(() => {
    setCurrentStepIndex((prev) => {
      if (prev === null) return 1;
      if (prev >= fullFactSequence.length) return 1;
      return prev + 1;
    });
  }, [fullFactSequence.length]);

  const activeSlice = useMemo(() => {
    if (currentStepIndex !== null && simulation.stateSlices[currentStepIndex]) {
      return simulation.stateSlices[currentStepIndex];
    }
    return simulation.stateSlices[simulation.stateSlices.length - 1] || Array(dimension).fill(0);
  }, [currentStepIndex, simulation.stateSlices, dimension]);

  // Execute recovery intervention
  const handleExecuteRecovery = () => {
    if (!learnerHypothesis) return;

    const beforeState = {
      prediction: simulation.prediction,
      confidence: simulation.confidence,
      isCorrect: simulation.isCorrect,
      dim: dimension,
      ret: retention,
      dist: distractorCount,
    };

    let newDim = dimension;
    let newRet = retention;
    let newDist = distractorCount;
    let label = '';

    if (selectedIntervention === 'dim') {
      newDim = Math.min(dimension >= 16 ? 32 : 16, 32);
      label = `Increase dimension from D=${dimension} to D=${newDim}`;
    } else if (selectedIntervention === 'ret') {
      newRet = 0.98;
      label = `Increase retention rate from ${Math.round(retention * 100)}% to 98%`;
    } else {
      newDist = Math.max(1, Math.floor(distractorCount / 2));
      label = `Reduce distractors from ${distractorCount} to ${newDist}`;
    }

    // Run new simulation with the proposed recovery
    const distractors = CANONICAL_FACTS.filter((f) => f.key !== targetFact.key).slice(0, newDist);
    const newSeq = [targetFact, ...distractors];
    const newMemory = createAssociativeMemory(newSeq, newDim, newRet, 0.8);
    for (const f of newSeq) {
      newMemory.writeFact(f);
    }
    const newQuery = newMemory.query(targetFact.key);

    const afterState = {
      prediction: newQuery.prediction,
      confidence: newQuery.confidence,
      isCorrect: newQuery.prediction === targetFact.value,
      dim: newDim,
      ret: newRet,
      dist: newDist,
    };

    setRecoveryResult({
      interventionLabel: label,
      userHypothesis: learnerHypothesis,
      before: beforeState,
      after: afterState,
    });

    // Apply the new config to the primary state
    updateConfig(newDim, newRet, newDist);
  };

  const quizOptions = [
    {
      id: 'A',
      text: 'The input was corrupted',
      isCorrect: false,
    },
    {
      id: 'B',
      text: 'Information interfered with existing memory',
      isCorrect: true,
    },
    {
      id: 'C',
      text: 'The query was removed',
      isCorrect: false,
    },
    {
      id: 'D',
      text: 'Random error',
      isCorrect: false,
    },
  ];

  const currentRunId = experimentId(dimension, retention, fullFactSequence.length, 42);

  return (
    <div
      id={id}
      className="rounded-2xl border border-[#232A3B] bg-[#090D16] p-5 sm:p-7 text-slate-100 shadow-xl space-y-7"
    >
      {/* Top Bar: Mode Switcher & Reproducible Run ID */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2536] pb-4">
        <div className="flex items-center gap-3">
          <EvidenceStrip type="live" detail="Real model engine" />
          <div className="flex items-center bg-[#111624] border border-[#232B3E] rounded-xl p-0.5">
            <button
              onClick={() => setMode('guided')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer ${
                mode === 'guided'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>GUIDED MODE</span>
            </button>
            <button
              onClick={() => setMode('sandbox')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer ${
                mode === 'sandbox'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>SANDBOX MODE</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
          <span>RUN ID:</span>
          <span className="px-2 py-0.5 rounded bg-[#111624] border border-[#232B3E] text-slate-200 font-semibold">
            {currentRunId}
          </span>
        </div>
      </div>

      {/* 1. Hero Header: "CAN YOU MAKE IT FORGET?" */}
      <div className="rounded-2xl border border-rose-900/40 bg-gradient-to-r from-[#120B16] via-[#0D121F] to-[#0A131C] p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-rose-400 bg-rose-950/80 border border-rose-800/80 px-2.5 py-0.5 rounded font-bold flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              HERO EXPERIMENT · BREAK THE MEMORY
            </span>
            <SourceBadge type="OBSERVED RESULT" />
          </div>

          <div className="text-xs font-mono text-slate-400">
            Current: D={dimension} · λ={Math.round(retention * 100)}% · Distractors={distractorCount}
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-wide">
            CAN YOU MAKE IT FORGET?
          </h3>
          <p className="text-sm text-slate-300 font-sans max-w-2xl leading-relaxed">
            The associative memory state stores information using a fixed-size representation. Adjust parameters or select experimental presets to observe where retrieval breaks down.
          </p>
        </div>

        {/* Current Target vs Current Memory Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 font-mono text-xs">
          <div className="p-3 rounded-xl bg-[#0B0F19] border border-[#20293D] flex items-center justify-between">
            <span className="text-slate-400 uppercase">Target Fact:</span>
            <strong className="text-white text-sm">
              {targetFact.key.toUpperCase()} → {targetFact.value.toUpperCase()}
            </strong>
          </div>

          <div
            className={`p-3 rounded-xl border flex items-center justify-between ${
              simulation.isCorrect
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}
          >
            <span className="text-slate-300 uppercase">Current Memory:</span>
            <strong className="text-sm flex items-center gap-1.5">
              {simulation.isCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>✓ remembers {targetFact.value}</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>✗ forgot {targetFact.value} (retrieved {simulation.prediction})</span>
                </>
              )}
            </strong>
          </div>
        </div>
      </div>

      {/* Preset Toolbar (Guided Mode & Sandbox) */}
      <div className="rounded-xl border border-[#1E2536] bg-[#0D121F] p-4 space-y-3 font-mono">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            VALIDATED EXPERIMENT PRESETS
          </span>
          <span className="text-[11px] text-slate-500">Click to instantly test conditions</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {Object.values(EXPERIMENT_PRESETS).map((preset) => {
            const isMatch =
              dimension === preset.config.dimension &&
              retention === preset.config.retention &&
              distractorCount === preset.config.distractors;

            return (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isMatch
                    ? 'border-cyan-500 bg-cyan-950/50 text-cyan-200 shadow-md shadow-cyan-500/20'
                    : 'border-[#222A3E] bg-[#121826] hover:bg-[#182133] text-slate-300'
                }`}
              >
                <div className="text-xs font-bold uppercase">{preset.name}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{preset.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Causal Delta Feedback (ParameterDelta) */}
      {prevConfig && (
        <ParameterDelta
          prevConfig={{
            dimension: prevConfig.dimension,
            retention: prevConfig.retention,
            distractors: prevConfig.distractors,
          }}
          currConfig={{
            dimension,
            retention,
            distractors: distractorCount,
          }}
          prevResult={
            prevConfig.dimension === 16 && prevConfig.retention >= 0.9 && prevConfig.distractors <= 3
              ? { prediction: 'Tokyo', confidence: 0.92, isCorrect: true }
              : undefined
          }
          currResult={{
            prediction: simulation.prediction,
            confidence: simulation.confidence,
            isCorrect: simulation.isCorrect,
          }}
        />
      )}

      {/* 2. Step 4 Sliders Deck */}
      <div className="rounded-xl border border-[#1E2536] bg-[#0D121F] p-5 space-y-5">
        <div className="flex items-center justify-between border-b border-[#1A2130] pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#22D3EE]" />
            <h4 className="text-xs sm:text-sm font-bold font-mono text-white">
              MEMORY PARAMETER CONTROLS
            </h4>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Tune parameters to break retrieval
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Slider 1: Memory Dimension 4 to 32 */}
          <div className="space-y-2 font-mono">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold">MEMORY DIMENSION</span>
              <span className="text-[#22D3EE] font-bold bg-cyan-950/70 border border-cyan-800/60 px-2 py-0.5 rounded">
                D = {dimension}
              </span>
            </div>
            <input
              type="range"
              min="4"
              max="32"
              step="4"
              value={dimension}
              onChange={(e) => {
                updateConfig(Number(e.target.value), retention, distractorCount);
              }}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#22D3EE]"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>4</span>
              <span>16</span>
              <span>32</span>
            </div>
          </div>

          {/* Slider 2: Retention 0% to 100% */}
          <div className="space-y-2 font-mono">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold">RETENTION</span>
              <span className="text-emerald-400 font-bold bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 rounded">
                {Math.round(retention * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.00"
              step="0.05"
              value={retention}
              onChange={(e) => {
                updateConfig(dimension, Number(e.target.value), distractorCount);
              }}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Slider 3: Distractors 0 to 25 */}
          <div className="space-y-2 font-mono">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold">DISTRACTORS</span>
              <span className="text-amber-400 font-bold bg-amber-950/70 border border-amber-800/60 px-2 py-0.5 rounded">
                {distractorCount}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={distractorCount}
              onChange={(e) => {
                updateConfig(dimension, retention, Number(e.target.value));
              }}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0</span>
              <span>12</span>
              <span>25</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1A2130]">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setCurrentStepIndex(null);
              }}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold shadow-lg shadow-blue-500/20 transition cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>RUN EXPERIMENT</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#141B2A] hover:bg-[#1C253B] text-slate-300 text-xs font-mono border border-slate-700 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET</span>
            </button>
          </div>

          <button
            onClick={handleStepThrough}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#141B2A] hover:bg-[#1C253B] text-slate-200 text-xs font-mono border border-slate-700 transition cursor-pointer"
          >
            <SkipForward className="w-3.5 h-3.5 text-[#22D3EE]" />
            <span>
              STEP THROUGH ({currentStepIndex !== null ? currentStepIndex : fullFactSequence.length}/{fullFactSequence.length})
            </span>
          </button>
        </div>
      </div>

      {/* 3. Real-Time Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 font-mono text-xs">
        <div className="p-3.5 rounded-xl bg-[#0D121F] border border-[#1E2536]">
          <div className="text-[10px] text-slate-400 uppercase">GROUND TRUTH</div>
          <div className="text-lg font-bold text-white mt-0.5">
            {targetFact.value} ({targetFact.key})
          </div>
        </div>

        <div
          className={`p-3.5 rounded-xl border ${
            simulation.isCorrect
              ? 'bg-emerald-950/30 border-emerald-700/50'
              : 'bg-rose-950/30 border-rose-700/60'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase">
            <span>MODEL OUTPUT</span>
            {simulation.isCorrect ? (
              <span className="text-emerald-400 font-bold">✓ CORRECT</span>
            ) : (
              <span className="text-rose-400 font-bold">✗ FAILURE</span>
            )}
          </div>
          <div
            className={`text-lg font-bold mt-0.5 ${
              simulation.isCorrect ? 'text-emerald-300' : 'text-rose-300'
            }`}
          >
            {simulation.prediction}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0D121F] border border-[#1E2536]" title="This score is based on representation similarity and is not a calibrated probability.">
          <div className="text-[10px] text-slate-400 uppercase">RETRIEVAL SCORE</div>
          <div className="text-lg font-bold text-purple-300 mt-0.5">
            {Math.round(simulation.confidence * 100)}%
          </div>
        </div>
      </div>

      {/* 4. State Matrix Heatmap */}
      <StateInspector
        history={simulation.history}
        currentState={activeSlice}
        dimension={dimension}
        currentStep={currentStepIndex ?? fullFactSequence.length}
      />

      {/* 5. Memory Failure Panel (Step 4 & Step 5) */}
      {!simulation.isCorrect && (
        <div className="space-y-6">
          {/* Failure Alert Box */}
          <div className="rounded-2xl border border-rose-700/70 bg-[#0F0D15] p-5 sm:p-6 space-y-4 font-mono">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-950 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-rose-950 border border-rose-700 text-rose-400">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase text-rose-400 font-bold tracking-wider">
                    OBSERVED ANOMALY
                  </div>
                  <h4 className="text-lg font-bold text-white">MEMORY FAILURE</h4>
                </div>
              </div>

              {/* [TRACE FAILURE] button */}
              <button
                onClick={() => setShowFailureTrace(!showFailureTrace)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold shadow-lg shadow-rose-600/30 transition-all hover:scale-105 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{showFailureTrace ? 'HIDE FAILURE TRACE' : 'TRACE FAILURE'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[#14121B] border border-[#2B2335]">
                <span className="text-slate-400 block text-[10px] uppercase">GROUND TRUTH</span>
                <strong className="text-white text-base block mt-0.5">{targetFact.value}</strong>
              </div>

              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60">
                <span className="text-rose-300 block text-[10px] uppercase">RETRIEVED</span>
                <strong className="text-rose-400 text-base block mt-0.5">{simulation.prediction}</strong>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              The query for <em>"{targetFact.key}"</em> projected strongest onto <em>"{simulation.prediction}"</em> due to overlapping outer-product updates written into the fixed-size {dimension}×{dimension} state matrix.
            </p>
          </div>

          {/* Interactive Pedagogical RECOVERY Workflow: "CAN YOU RECOVER THE MEMORY?" */}
          <div className="rounded-2xl border border-cyan-800/60 bg-[#0A121E] p-5 sm:p-6 space-y-4 font-mono">
            <div className="flex items-center gap-2 border-b border-cyan-950 pb-3">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h4 className="text-base font-bold text-white uppercase tracking-wide">
                CAN YOU RECOVER THE MEMORY?
              </h4>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              When retrieval fails, adjusting representation capacity, retention strength, or information load can allow recovery. Select one intervention to test:
            </p>

            {/* 1. Select Intervention */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <button
                onClick={() => setSelectedIntervention('dim')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  selectedIntervention === 'dim'
                    ? 'border-cyan-500 bg-cyan-950/70 text-cyan-200'
                    : 'border-[#1C2538] bg-[#0E1726] text-slate-400'
                }`}
              >
                <div className="font-bold">Increase Dimension</div>
                <div className="text-[10px] opacity-75 mt-0.5">D={dimension} → D={Math.min(dimension >= 16 ? 32 : 16, 32)}</div>
              </button>

              <button
                onClick={() => setSelectedIntervention('ret')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  selectedIntervention === 'ret'
                    ? 'border-cyan-500 bg-cyan-950/70 text-cyan-200'
                    : 'border-[#1C2538] bg-[#0E1726] text-slate-400'
                }`}
              >
                <div className="font-bold">Increase Retention</div>
                <div className="text-[10px] opacity-75 mt-0.5">λ={Math.round(retention * 100)}% → λ=98%</div>
              </button>

              <button
                onClick={() => setSelectedIntervention('dist')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  selectedIntervention === 'dist'
                    ? 'border-cyan-500 bg-cyan-950/70 text-cyan-200'
                    : 'border-[#1C2538] bg-[#0E1726] text-slate-400'
                }`}
              >
                <div className="font-bold">Reduce Distractors</div>
                <div className="text-[10px] opacity-75 mt-0.5">N={distractorCount} → N={Math.max(1, Math.floor(distractorCount / 2))}</div>
              </button>
            </div>

            {/* 2. Formulate Learner Hypothesis */}
            <div className="p-3.5 rounded-xl bg-[#09101A] border border-[#1A263B] space-y-2">
              <div className="text-xs text-slate-300 font-sans">
                <strong>Hypothesis question:</strong> Do you think this change will improve retrieval?
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setLearnerHypothesis('YES')}
                  className={`px-4 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                    learnerHypothesis === 'YES'
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-[#121C2B] border-slate-700 text-slate-300 hover:bg-[#1A273C]'
                  }`}
                >
                  YES, IMPROVE
                </button>
                <button
                  onClick={() => setLearnerHypothesis('NO')}
                  className={`px-4 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                    learnerHypothesis === 'NO'
                      ? 'bg-rose-600 border-rose-500 text-white'
                      : 'bg-[#121C2B] border-slate-700 text-slate-300 hover:bg-[#1A273C]'
                  }`}
                >
                  NO, STILL FAIL
                </button>

                <button
                  onClick={handleExecuteRecovery}
                  disabled={!learnerHypothesis}
                  className="ml-auto px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition cursor-pointer"
                >
                  APPLY & RERUN EXPERIMENT
                </button>
              </div>
            </div>

            {/* 3. Recovery Evaluation Result (if executed) */}
            {recoveryResult && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">OUTCOME:</span>
                  {recoveryResult.after.isCorrect ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-300 font-bold text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      RECOVERY OBSERVED
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-amber-950 border border-amber-600 text-amber-300 font-bold text-xs flex items-center gap-1.5">
                      <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
                      NO RECOVERY IN THIS RUN
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#0E1522] border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">BEFORE INTERVENTION</span>
                    <div className="text-rose-400 font-bold mt-0.5">
                      {recoveryResult.before.prediction} ({Math.round(recoveryResult.before.confidence * 100)}%) ✗
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0E1522] border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">AFTER INTERVENTION</span>
                    <div className={`font-bold mt-0.5 ${recoveryResult.after.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {recoveryResult.after.prediction} ({Math.round(recoveryResult.after.confidence * 100)}%) {recoveryResult.after.isCorrect ? '✓' : '✗'}
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 font-sans italic">
                  Changing the memory configuration changed the behavior of this educational model. This demonstrates how parameter choices influence interference dynamics, rather than claiming a universal architectural law.
                </p>
              </div>
            )}
          </div>

          {/* Dedicated Replay View (Step 5) */}
          {showFailureTrace && (
            <FailureTrace
              steps={recordedTraceSteps}
              dimension={dimension}
              groundTruth={targetFact.value}
              targetKey={targetFact.key}
              finalPrediction={simulation.prediction}
              finalConfidence={simulation.confidence}
              onClose={() => setShowFailureTrace(false)}
            />
          )}

          {/* Quiz: WHY DID IT FAIL? */}
          <div className="rounded-2xl border border-[#252C3F] bg-[#0E1321] p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#1E2536] pb-3">
              <HelpCircle className="w-4 h-4 text-purple-400" />
              <h4 className="text-sm font-bold font-mono text-white">WHY DID IT FAIL?</h4>
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
                      <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-300 font-bold shrink-0">
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

            {/* Revealed Explanation */}
            {quizRevealed && (
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-600/50 space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 font-mono font-bold text-xs text-emerald-400 uppercase">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>CORRECT.</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed">
                  The educational memory state had to represent multiple pieces of information using a fixed-size representation.
                </p>
                <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                  As competing information accumulated, retrieval became less reliable in this experiment.
                </p>
              </div>
            )}
          </div>
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


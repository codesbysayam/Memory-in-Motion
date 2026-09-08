import React, { useState, useMemo } from 'react';
import {
  Scissors,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Layers,
  Activity,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Info,
  Sliders,
  Sparkles,
} from 'lucide-react';
import {
  CANONICAL_FACTS,
  Fact,
  createAssociativeMemory,
} from '../models/associativeMemory';
import { MatrixDiff } from './MatrixDiff';
import { SourceBadge } from './ui/SourceBadge';
import { EvidenceStrip } from './ui/EvidenceStrip';

export const MemorySurgery: React.FC = () => {
  // Configurable parameters
  const [dim, setDim] = useState<number>(8);
  const [retention, setRetention] = useState<number>(0.90);
  const [sequenceLength, setSequenceLength] = useState<number>(6);
  const [removedIndex, setRemovedIndex] = useState<number>(3); // Default: remove 4th write (distractor)
  const [targetIndex, setTargetIndex] = useState<number>(2); // Default: target is 3rd write ("Japan")
  const [userPrediction, setUserPrediction] = useState<'change' | 'same' | 'unsure' | null>(null);

  // Derive active fact sequence from canonical dataset
  const activeFacts: Fact[] = useMemo(() => {
    return CANONICAL_FACTS.slice(0, Math.min(sequenceLength, CANONICAL_FACTS.length));
  }, [sequenceLength]);

  // Target query fact and ground truth
  const targetFact = activeFacts[Math.min(targetIndex, activeFacts.length - 1)] || activeFacts[0];
  const targetKey = targetFact.key;
  const groundTruth = targetFact.value;

  // RUN A: ORIGINAL RUN (All writes applied)
  const originalRun = useMemo(() => {
    const memory = createAssociativeMemory(activeFacts, dim, retention, 0.8);
    for (const fact of activeFacts) {
      memory.writeFact(fact);
    }
    const queryResult = memory.query(targetKey);
    const topScore = queryResult.candidates[0]?.score ?? 0;
    const secondScore = queryResult.candidates[1]?.score ?? 0;
    const top1Margin = queryResult.candidates.length > 1
      ? Math.max(0, topScore - secondScore)
      : topScore;

    return {
      prediction: queryResult.prediction,
      retrievalScore: queryResult.confidence,
      top1Margin,
      isCorrect: queryResult.prediction.toLowerCase() === groundTruth.toLowerCase(),
      finalMatrix: memory.getMatrix(),
      finalState: queryResult.vector,
      candidates: queryResult.candidates,
    };
  }, [activeFacts, dim, retention, targetKey, groundTruth]);

  // RUN B: COUNTERFACTUAL RUN (Selected write omitted)
  const counterfactualFacts = useMemo(() => {
    return activeFacts.filter((_, idx) => idx !== removedIndex);
  }, [activeFacts, removedIndex]);

  const counterfactualRun = useMemo(() => {
    const memory = createAssociativeMemory(counterfactualFacts, dim, retention, 0.8);
    for (const fact of counterfactualFacts) {
      memory.writeFact(fact);
    }
    const queryResult = memory.query(targetKey);
    const topScore = queryResult.candidates[0]?.score ?? 0;
    const secondScore = queryResult.candidates[1]?.score ?? 0;
    const top1Margin = queryResult.candidates.length > 1
      ? Math.max(0, topScore - secondScore)
      : topScore;

    return {
      prediction: queryResult.prediction,
      retrievalScore: queryResult.confidence,
      top1Margin,
      isCorrect: queryResult.prediction.toLowerCase() === groundTruth.toLowerCase(),
      finalMatrix: memory.getMatrix(),
      finalState: queryResult.vector,
      candidates: queryResult.candidates,
    };
  }, [counterfactualFacts, dim, retention, targetKey, groundTruth]);

  // CALCULATE CAUSAL EFFECT DIFFERENTIAL
  const causalDelta = useMemo(() => {
    const predictionChanged = originalRun.prediction !== counterfactualRun.prediction;
    const scoreDelta = counterfactualRun.retrievalScore - originalRun.retrievalScore;
    const marginDelta = counterfactualRun.top1Margin - originalRun.top1Margin;

    // State differences
    const stateDiffs = counterfactualRun.finalState.map(
      (val, i) => val - (originalRun.finalState[i] || 0)
    );
    const meanAbsStateDiff =
      stateDiffs.reduce((acc, d) => acc + Math.abs(d), 0) / (dim || 1);
    const maxAbsStateDiff = Math.max(...stateDiffs.map(Math.abs), 0);

    // Matrix differences
    let changedCells = 0;
    let sumAbsMatrix = 0;
    const totalCells = dim * dim;
    for (let r = 0; r < dim; r++) {
      for (let c = 0; c < dim; c++) {
        const origVal = originalRun.finalMatrix[r]?.[c] ?? 0;
        const cfVal = counterfactualRun.finalMatrix[r]?.[c] ?? 0;
        const diff = Math.abs(cfVal - origVal);
        sumAbsMatrix += diff;
        if (diff > 1e-4) {
          changedCells++;
        }
      }
    }
    const meanAbsMatrixDiff = totalCells > 0 ? sumAbsMatrix / totalCells : 0;

    return {
      predictionChanged,
      scoreDelta,
      marginDelta,
      meanAbsStateDiff,
      maxAbsStateDiff,
      changedCells,
      totalCells,
      meanAbsMatrixDiff,
      stateDiffs,
    };
  }, [originalRun, counterfactualRun, dim]);

  // Removed fact metadata
  const removedFact = activeFacts[removedIndex] || activeFacts[0];
  const isRemovingTarget = removedFact.key === targetKey;

  // Dynamic explanation of why outcome occurred
  const dynamicExplanation = useMemo(() => {
    if (isRemovingTarget) {
      return `By surgically omitting Write #${removedIndex + 1} ("${removedFact.key} → ${removedFact.value}"), you removed the primary target association from memory. Because the key-value outer product was never bound into the recurrent matrix, the query vector encountered only residual noise or orthogonal crosstalk, reducing the target's retrieval score by ${Math.abs(causalDelta.scoreDelta * 100).toFixed(1)} pp.`;
    }
    if (causalDelta.predictionChanged) {
      return `Omitting Write #${removedIndex + 1} ("${removedFact.key} → ${removedFact.value}") caused a causal prediction flip from "${originalRun.prediction}" to "${counterfactualRun.prediction}". Without this distractor's interference footprint in the ${dim}-dimensional recurrent state, the latent projection shifted its nearest-neighbor cosine similarity.`;
    }
    if (causalDelta.scoreDelta > 0.01) {
      return `Removing Write #${removedIndex + 1} ("${removedFact.key} → ${removedFact.value}") improved retrieval score by +${(causalDelta.scoreDelta * 100).toFixed(1)} pp and increased the Top-1 margin by +${causalDelta.marginDelta.toFixed(3)}. This directly confirms that Write #${removedIndex + 1} was acting as an intervening distractor, causing geometric crosstalk in the fixed-size state.`;
    }
    if (causalDelta.scoreDelta < -0.01) {
      return `Removing Write #${removedIndex + 1} slightly lowered the retrieval score by ${(causalDelta.scoreDelta * 100).toFixed(1)} pp. In linear superposition, omitting this write altered the norm normalization across candidate projections, though the top-1 prediction remained intact.`;
    }
    return `Removing Write #${removedIndex + 1} ("${removedFact.key} → ${removedFact.value}") produced minimal retrieval change for "${targetKey}" (score delta ${(causalDelta.scoreDelta * 100).toFixed(1)} pp). Its key-value outer product occupied coordinates largely orthogonal to the target query subspace in this ${dim}-dimensional matrix.`;
  }, [
    isRemovingTarget,
    removedFact,
    removedIndex,
    causalDelta,
    originalRun.prediction,
    counterfactualRun.prediction,
    dim,
    targetKey,
  ]);

  const handleReset = () => {
    setDim(8);
    setRetention(0.90);
    setSequenceLength(6);
    setRemovedIndex(3);
    setTargetIndex(2);
    setUserPrediction(null);
  };

  return (
    <div id="memory-surgery" className="space-y-6 text-slate-100 font-sans">
      {/* Evidence Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <EvidenceStrip
            type="live"
            detail="Controlled counterfactual difference calculated on identical seed and configuration"
          />
          <EvidenceStrip
            type="abstraction"
            detail="Educational counterfactual causal probe (hold all variables fixed, omit 1 write)"
          />
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#252A35] bg-[#11141A] text-xs font-mono text-[#8F96A3] hover:text-white hover:border-[#3B4354] transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RESET SURGERY</span>
        </button>
      </div>

      {/* Intro Header */}
      <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/20 via-[#0B0E17] to-cyan-950/20 p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2 text-rose-400 text-xs font-mono font-bold uppercase tracking-wider">
          <Scissors className="w-4 h-4" />
          <span>MEMORY SURGERY: CONTROLLED COUNTERFACTUAL EXPERIMENT</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          What would have happened if a specific memory write had never occurred?
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
          Rather than just observing memory degrade, conduct a controlled intervention. We take an identical sequence, configuration, and random seed, and execute two parallel runs: <strong>Run A (Original)</strong> with all writes, and <strong>Run B (Counterfactual)</strong> with exactly one write omitted. The measured difference isolates the exact causal footprint of that write on the final recurrent state and retrieval.
        </p>
      </div>

      {/* Configuration & Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 rounded-xl border border-[#252A35] bg-[#0E131F] p-4 text-xs font-mono">
        <div>
          <label className="text-slate-400 block mb-1">STATE DIMENSION (D)</label>
          <select
            value={dim}
            onChange={(e) => setDim(Number(e.target.value))}
            className="w-full bg-[#161D2E] border border-[#2A344A] rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-cyan-400"
          >
            <option value={4}>4 dimensions (Extremely compressed)</option>
            <option value={8}>8 dimensions (Standard toy)</option>
            <option value={16}>16 dimensions (Higher capacity)</option>
            <option value={32}>32 dimensions (Spacious)</option>
          </select>
        </div>

        <div>
          <label className="text-slate-400 block mb-1">RETENTION (λ)</label>
          <select
            value={retention}
            onChange={(e) => setRetention(Number(e.target.value))}
            className="w-full bg-[#161D2E] border border-[#2A344A] rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-cyan-400"
          >
            <option value={0.75}>0.75 (Rapid decay)</option>
            <option value={0.85}>0.85 (Moderate retention)</option>
            <option value={0.90}>0.90 (Balanced)</option>
            <option value={0.98}>0.98 (Strong persistence)</option>
          </select>
        </div>

        <div>
          <label className="text-slate-400 block mb-1">SEQUENCE LENGTH</label>
          <select
            value={sequenceLength}
            onChange={(e) => {
              const val = Number(e.target.value);
              setSequenceLength(val);
              if (removedIndex >= val) setRemovedIndex(val - 1);
              if (targetIndex >= val) setTargetIndex(val - 1);
            }}
            className="w-full bg-[#161D2E] border border-[#2A344A] rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-cyan-400"
          >
            <option value={5}>5 writes</option>
            <option value={6}>6 writes</option>
            <option value={7}>7 writes</option>
            <option value={8}>8 writes</option>
            <option value={10}>10 writes</option>
          </select>
        </div>

        <div>
          <label className="text-slate-400 block mb-1">TARGET QUERY KEY</label>
          <select
            value={targetIndex}
            onChange={(e) => setTargetIndex(Number(e.target.value))}
            className="w-full bg-[#161D2E] border border-[#2A344A] rounded-lg px-2.5 py-1.5 text-cyan-300 font-bold focus:outline-none focus:border-cyan-400"
          >
            {activeFacts.map((fact, idx) => (
              <option key={idx} value={idx}>
                Step {idx + 1}: {fact.key} (GT: {fact.value})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* STEP 1: INTERVENTION SELECTION (THE RECORDED SEQUENCE) */}
      <div className="rounded-2xl border border-[#252A35] bg-[#0A0D16] p-5 space-y-4 font-mono">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E2536] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
              1. RECORDED WRITE SEQUENCE & SURGICAL INTERVENTION
            </span>
            <SourceBadge type="toy" />
          </div>
          <span className="text-[11px] text-slate-400">
            Click any step to toggle which write is omitted in the counterfactual run.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeFacts.map((fact, idx) => {
            const isRemoved = idx === removedIndex;
            const isTarget = fact.key === targetKey;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setRemovedIndex(idx)}
                className={`relative p-3.5 rounded-xl border text-left transition-all ${
                  isRemoved
                    ? 'border-rose-500 bg-rose-950/40 ring-1 ring-rose-500 shadow-lg shadow-rose-950/30'
                    : isTarget
                    ? 'border-cyan-800 bg-[#0E1524] hover:border-cyan-500'
                    : 'border-[#1F273B] bg-[#0E131E] hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-slate-400">STEP {idx + 1}</span>
                  {isTarget && (
                    <span className="text-[9px] bg-cyan-950/80 border border-cyan-700 text-cyan-300 px-1.5 py-0.5 rounded font-bold">
                      QUERY TARGET
                    </span>
                  )}
                  {isRemoved && (
                    <span className="text-[9px] bg-rose-950/90 border border-rose-700 text-rose-300 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                      <Scissors className="w-2.5 h-2.5" /> OMITTED
                    </span>
                  )}
                </div>

                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span className={isRemoved ? 'line-through text-rose-300/80' : 'text-slate-100'}>
                    {fact.key}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className={isRemoved ? 'line-through text-rose-300/80' : 'text-cyan-300'}>
                    {fact.value}
                  </span>
                </div>

                <div className="mt-2 pt-2 border-t border-[#1C2333] flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Operation:</span>
                  <span className={isRemoved ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                    {isRemoved ? 'Omit write in Run B' : 'Written in both runs'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 2: PREDICT THE EFFECT (LEARNING MOMENT) */}
      <div className="rounded-2xl border border-indigo-500/40 bg-[#0D1120] p-5 space-y-3 font-mono">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>2. PREDICT THE EFFECT BEFORE REVEALING RESULTS</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          When Write #{removedIndex + 1} (
          <strong className="text-white">{removedFact.key} → {removedFact.value}</strong>
          ) is omitted from memory, what do you predict will happen to the prediction for{' '}
          <strong className="text-cyan-300">"{targetKey}"</strong>?
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <button
            type="button"
            onClick={() => setUserPrediction('change')}
            className={`p-3 rounded-xl border text-center transition-all ${
              userPrediction === 'change'
                ? 'border-indigo-400 bg-indigo-950/70 text-indigo-200 font-bold ring-1 ring-indigo-400'
                : 'border-[#222B3F] bg-[#121727] text-slate-400 hover:text-white hover:border-slate-500'
            }`}
          >
            <div className="text-xs">Prediction will change</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Top-1 flips to a different city</div>
          </button>

          <button
            type="button"
            onClick={() => setUserPrediction('same')}
            className={`p-3 rounded-xl border text-center transition-all ${
              userPrediction === 'same'
                ? 'border-indigo-400 bg-indigo-950/70 text-indigo-200 font-bold ring-1 ring-indigo-400'
                : 'border-[#222B3F] bg-[#121727] text-slate-400 hover:text-white hover:border-slate-500'
            }`}
          >
            <div className="text-xs">Prediction will stay the same</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Top-1 remains identical</div>
          </button>

          <button
            type="button"
            onClick={() => setUserPrediction('unsure')}
            className={`p-3 rounded-xl border text-center transition-all ${
              userPrediction === 'unsure'
                ? 'border-indigo-400 bg-indigo-950/70 text-indigo-200 font-bold ring-1 ring-indigo-400'
                : 'border-[#222B3F] bg-[#121727] text-slate-400 hover:text-white hover:border-slate-500'
            }`}
          >
            <div className="text-xs">Not sure / Dependent</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Need to observe the difference</div>
          </button>
        </div>
      </div>

      {/* STEP 3: SIDE-BY-SIDE RUN COMPARISON */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RUN A: ORIGINAL */}
        <div className="rounded-2xl border border-[#252A35] bg-[#0A0D16] p-5 space-y-4 font-mono">
          <div className="flex items-center justify-between border-b border-[#1E2536] pb-3">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                RUN A: ORIGINAL
              </span>
              <span className="text-[11px] text-slate-400">All {activeFacts.length} writes applied</span>
            </div>
            <span className="text-[10px] bg-cyan-950/60 border border-cyan-800 text-cyan-300 px-2 py-0.5 rounded">
              CONTROL
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-[#0E131F] border border-[#1F273B] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">QUERY → GROUND TRUTH</span>
                <span className="text-sm font-bold text-white">
                  "{targetKey}" → <span className="text-cyan-300">{groundTruth}</span>
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0E131F] border border-[#1F273B] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">MODEL PREDICTION</span>
                <span className="text-base font-bold text-white flex items-center gap-1.5 mt-0.5">
                  {originalRun.prediction}
                  {originalRun.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )}
                </span>
              </div>
              <div className="text-right">
                <span
                  className="text-[10px] text-slate-400 uppercase block"
                  title="This score is based on representation similarity and is not a calibrated probability."
                >
                  RETRIEVAL SCORE
                </span>
                <span className="text-base font-bold text-purple-300 mt-0.5 block">
                  {Math.round(originalRun.retrievalScore * 100)}%
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0E131F] border border-[#1F273B] flex items-center justify-between">
              <span className="text-[11px] text-slate-400">TOP-1 MARGIN:</span>
              <span className="text-xs font-bold text-white">
                {originalRun.top1Margin.toFixed(3)}
              </span>
            </div>
          </div>

          {/* Latent Vector Snapshot */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
              <span>FINAL RETRIEVED VECTOR (1D)</span>
              <span>{dim} DIMENSIONS</span>
            </div>
            <div className="grid grid-cols-8 gap-1">
              {originalRun.finalState.slice(0, Math.min(16, dim)).map((val, i) => (
                <div
                  key={i}
                  className="p-1 rounded bg-[#131929] border border-[#212B41] text-center"
                  title={`Dimension ${i + 1}: ${val.toFixed(3)}`}
                >
                  <div className="text-[8px] text-slate-400">D{i + 1}</div>
                  <div className="text-[9px] text-cyan-300 font-bold truncate">
                    {val.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RUN B: COUNTERFACTUAL */}
        <div className="rounded-2xl border border-rose-500/40 bg-[#0A0D16] p-5 space-y-4 font-mono">
          <div className="flex items-center justify-between border-b border-[#1E2536] pb-3">
            <div>
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">
                RUN B: COUNTERFACTUAL
              </span>
              <span className="text-[11px] text-slate-400">
                Write #{removedIndex + 1} ({removedFact.key}) omitted
              </span>
            </div>
            <span className="text-[10px] bg-rose-950/60 border border-rose-800 text-rose-300 px-2 py-0.5 rounded">
              INTERVENTION
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-[#0E131F] border border-[#1F273B] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">QUERY → GROUND TRUTH</span>
                <span className="text-sm font-bold text-white">
                  "{targetKey}" → <span className="text-cyan-300">{groundTruth}</span>
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0E131F] border border-[#1F273B] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">MODEL PREDICTION</span>
                <span className="text-base font-bold text-white flex items-center gap-1.5 mt-0.5">
                  {counterfactualRun.prediction}
                  {counterfactualRun.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )}
                </span>
              </div>
              <div className="text-right">
                <span
                  className="text-[10px] text-slate-400 uppercase block"
                  title="This score is based on representation similarity and is not a calibrated probability."
                >
                  RETRIEVAL SCORE
                </span>
                <span className="text-base font-bold text-purple-300 mt-0.5 block">
                  {Math.round(counterfactualRun.retrievalScore * 100)}%
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0E131F] border border-[#1F273B] flex items-center justify-between">
              <span className="text-[11px] text-slate-400">TOP-1 MARGIN:</span>
              <span className="text-xs font-bold text-white">
                {counterfactualRun.top1Margin.toFixed(3)}
              </span>
            </div>
          </div>

          {/* Latent Vector Snapshot */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
              <span>FINAL RETRIEVED VECTOR (1D)</span>
              <span>{dim} DIMENSIONS</span>
            </div>
            <div className="grid grid-cols-8 gap-1">
              {counterfactualRun.finalState.slice(0, Math.min(16, dim)).map((val, i) => (
                <div
                  key={i}
                  className="p-1 rounded bg-[#131929] border border-[#212B41] text-center"
                  title={`Dimension ${i + 1}: ${val.toFixed(3)}`}
                >
                  <div className="text-[8px] text-slate-400">D{i + 1}</div>
                  <div className="text-[9px] text-rose-300 font-bold truncate">
                    {val.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* STEP 4: MEASURED COUNTERFACTUAL EFFECT */}
      <div className="rounded-2xl border border-[#252A35] bg-[#0E131F] p-5 space-y-4 font-mono">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#20293D] pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              MEASURED COUNTERFACTUAL EFFECT (OBSERVED DIFFERENCE)
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">
            Observed counterfactual difference in this educational model.
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="p-3 rounded-xl bg-[#131929] border border-[#212B41]">
            <div className="text-[10px] text-slate-400 uppercase">PREDICTION CHANGED?</div>
            <div
              className={`text-sm font-bold mt-1 ${
                causalDelta.predictionChanged ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {causalDelta.predictionChanged ? 'YES (Flipped)' : 'NO (Stable)'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#131929] border border-[#212B41]">
            <div className="text-[10px] text-slate-400 uppercase">SCORE DELTA</div>
            <div
              className={`text-sm font-bold mt-1 flex items-center gap-1 ${
                causalDelta.scoreDelta > 0
                  ? 'text-emerald-400'
                  : causalDelta.scoreDelta < 0
                  ? 'text-rose-400'
                  : 'text-slate-300'
              }`}
            >
              {causalDelta.scoreDelta > 0 ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : causalDelta.scoreDelta < 0 ? (
                <TrendingDown className="w-3.5 h-3.5" />
              ) : null}
              {(causalDelta.scoreDelta * 100).toFixed(1)} pp
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#131929] border border-[#212B41]">
            <div className="text-[10px] text-slate-400 uppercase">TOP-1 MARGIN DELTA</div>
            <div className="text-sm font-bold text-white mt-1">
              {causalDelta.marginDelta >= 0
                ? `+${causalDelta.marginDelta.toFixed(3)}`
                : causalDelta.marginDelta.toFixed(3)}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#131929] border border-[#212B41]">
            <div className="text-[10px] text-slate-400 uppercase">MEAN STATE DELTA</div>
            <div className="text-sm font-bold text-cyan-300 mt-1">
              {causalDelta.meanAbsStateDiff.toFixed(3)}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#131929] border border-[#212B41]">
            <div className="text-[10px] text-slate-400 uppercase">MAX STATE DELTA</div>
            <div className="text-sm font-bold text-cyan-300 mt-1">
              {causalDelta.maxAbsStateDiff.toFixed(3)}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#131929] border border-[#212B41]">
            <div className="text-[10px] text-slate-400 uppercase">CHANGED CELLS</div>
            <div className="text-sm font-bold text-purple-300 mt-1">
              {causalDelta.changedCells} / {causalDelta.totalCells}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#131929] border border-[#212B41]">
            <div className="text-[10px] text-slate-400 uppercase">MEAN MATRIX DELTA</div>
            <div className="text-sm font-bold text-purple-300 mt-1">
              {causalDelta.meanAbsMatrixDiff.toFixed(4)}
            </div>
          </div>
        </div>
      </div>

      {/* STEP 5: LATENT DIMENSION DIFFERENTIALS */}
      <div className="rounded-2xl border border-[#252A35] bg-[#0A0D16] p-5 space-y-4 font-mono">
        <div className="flex items-center justify-between border-b border-[#1E2536] pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              LATENT DIMENSION DIFFERENTIALS (Δs = s_cf − s_orig)
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">
            Labeled coordinates in shared recurrent space
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {causalDelta.stateDiffs.slice(0, Math.min(16, dim)).map((diff, dIdx) => {
            const origVal = originalRun.finalState[dIdx] ?? 0;
            const cfVal = counterfactualRun.finalState[dIdx] ?? 0;

            return (
              <div
                key={dIdx}
                className="p-3 rounded-xl bg-[#0E131F] border border-[#1E2536] space-y-1.5"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 font-bold">
                    LATENT DIMENSION {String(dIdx + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`font-bold ${
                      Math.abs(diff) > 0.05
                        ? diff > 0
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                        : 'text-slate-400'
                    }`}
                  >
                    Δ {diff >= 0 ? `+${diff.toFixed(3)}` : diff.toFixed(3)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span className="text-slate-400">
                    Orig: <span className="text-cyan-300">{origVal.toFixed(2)}</span>
                  </span>
                  <span className="text-slate-400">
                    CF: <span className="text-rose-300">{cfVal.toFixed(2)}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 6: MATRIX DIFFERENTIAL INSPECTOR */}
      <div className="space-y-2">
        <MatrixDiff
          matrixBefore={originalRun.finalMatrix}
          matrixAfter={counterfactualRun.finalMatrix}
          dimension={dim}
        />
      </div>

      {/* STEP 7: LEARNING REVEAL & EXPLANATION */}
      <div className="rounded-2xl border border-indigo-500/40 bg-gradient-to-br from-indigo-950/30 via-[#0C101C] to-[#0A0D16] p-5 sm:p-6 space-y-4 font-mono">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
          <Info className="w-4 h-4" />
          <span>CAUSAL EXPLANATION & PEDAGOGICAL SYNTHESIS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-[#11162A] border border-indigo-900/40 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase block">YOUR HYPOTHESIS:</span>
            <span className="text-sm font-bold text-indigo-200">
              {userPrediction === 'change'
                ? 'Prediction would change'
                : userPrediction === 'same'
                ? 'Prediction would stay the same'
                : userPrediction === 'unsure'
                ? 'Unsure / testing sensitivity'
                : 'No hypothesis recorded prior to execution'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#11162A] border border-indigo-900/40 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase block">ACTUAL MEASURED OUTCOME:</span>
            <span className="text-sm font-bold text-white">
              {causalDelta.predictionChanged
                ? `Prediction changed from "${originalRun.prediction}" to "${counterfactualRun.prediction}"`
                : `Prediction remained stable at "${counterfactualRun.prediction}" (score Δ ${(causalDelta.scoreDelta * 100).toFixed(1)} pp)`}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#090D18] border border-[#1E2536] space-y-2">
          <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            WHY DID THIS OCCUR?
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {dynamicExplanation}
          </p>
        </div>

        {/* Connection to Central Claim */}
        <div className="pt-2 border-t border-indigo-900/40 space-y-2 font-sans text-xs">
          <div className="text-slate-300 leading-relaxed">
            <strong className="text-white">Connection to Central Claim:</strong> Memory Surgery isolates the trade-off at the heart of recurrent memory. Because the recurrent state size is fixed ($D = {dim}$), writing a fact is not a discrete append; it adds an outer product directly into shared matrix coordinates. When you remove a write, you witness how that specific update either preserved, distorted, or decayed other representations.
          </div>
          <p className="text-[11px] text-slate-400 italic">
            <strong>Limitation:</strong> Memory Surgery is a controlled counterfactual experiment inside this educational model. It changes one operation while holding the other experiment conditions fixed. The resulting difference shows how sensitive this particular toy memory is to that update. It is not a causal claim about all recurrent neural networks.
          </p>
        </div>
      </div>
    </div>
  );
};

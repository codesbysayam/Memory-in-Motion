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
import { GlossaryTerm } from './GlossaryTerm';

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
    <div id="memory-surgery" className="space-y-6 text-[var(--text-primary)] font-sans">
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
          type="button"
          onClick={handleReset}
          className="btn-secondary text-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset surgery</span>
        </button>
      </div>

      {/* Intro Header */}
      <div className="research-callout p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2 text-[var(--accent-yellow-text)] text-xs font-sans font-semibold">
          <Scissors className="w-4 h-4" />
          <span>Memory surgery: counterfactual comparison</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-serif font-bold text-[var(--text-primary)] tracking-tight">
          What would have happened if a specific memory write had never occurred?
        </h3>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-4xl font-sans">
          Rather than just observing memory degrade, conduct a controlled intervention. We take an identical sequence, configuration, and random seed, and execute two parallel runs: <strong>Run A (Original)</strong> with all writes, and <strong>Run B (Counterfactual)</strong> with exactly one write omitted. The measured difference isolates the exact causal footprint of that write on the final <GlossaryTerm term="recurrent state" className="text-[var(--accent-blue-text)] hover:underline">recurrent state</GlossaryTerm> and retrieval.
        </p>
      </div>

      {/* Configuration & Controls */}
      <div className="diagram-frame grid grid-cols-1 md:grid-cols-4 gap-4 p-4 text-xs font-sans">
        <div>
          <label className="text-[var(--text-secondary)] block mb-1 font-semibold">State dimension (D)</label>
          <select
            value={dim}
            onChange={(e) => setDim(Number(e.target.value))}
            className="w-full bg-[var(--surface-soft)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-accent)] cursor-pointer tabular-nums"
          >
            <option value={4}>4 dimensions (Extremely compressed)</option>
            <option value={8}>8 dimensions (Standard toy)</option>
            <option value={16}>16 dimensions (Higher capacity)</option>
            <option value={32}>32 dimensions (Spacious)</option>
          </select>
        </div>

        <div>
          <label className="text-[var(--text-secondary)] block mb-1 font-semibold">Retention (λ)</label>
          <select
            value={retention}
            onChange={(e) => setRetention(Number(e.target.value))}
            className="w-full bg-[var(--surface-soft)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-accent)] cursor-pointer tabular-nums"
          >
            <option value={0.75}>0.75 (Rapid decay)</option>
            <option value={0.85}>0.85 (Moderate retention)</option>
            <option value={0.90}>0.90 (Balanced)</option>
            <option value={0.98}>0.98 (Strong persistence)</option>
          </select>
        </div>

        <div>
          <label className="text-[var(--text-secondary)] block mb-1 font-semibold">Sequence length</label>
          <select
            value={sequenceLength}
            onChange={(e) => {
              const val = Number(e.target.value);
              setSequenceLength(val);
              if (removedIndex >= val) setRemovedIndex(val - 1);
              if (targetIndex >= val) setTargetIndex(val - 1);
            }}
            className="w-full bg-[var(--surface-soft)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-accent)] cursor-pointer tabular-nums"
          >
            <option value={5}>5 writes</option>
            <option value={6}>6 writes</option>
            <option value={7}>7 writes</option>
            <option value={8}>8 writes</option>
            <option value={10}>10 writes</option>
          </select>
        </div>

        <div>
          <label className="text-[var(--text-secondary)] block mb-1 font-semibold">Target query key</label>
          <select
            value={targetIndex}
            onChange={(e) => setTargetIndex(Number(e.target.value))}
            className="w-full bg-[var(--surface-soft)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-[var(--accent-blue-text)] font-semibold focus:outline-none focus:border-[var(--color-accent)] cursor-pointer"
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
      <div className="diagram-frame p-5 space-y-4 font-sans">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--accent-yellow-text)]">
              1. Recorded write sequence &amp; surgical intervention
            </span>
            <SourceBadge type="toy" />
          </div>
          <span className="text-xs text-[var(--text-secondary)]">
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
                className={`relative p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                  isRemoved
                    ? 'border-[var(--color-danger-border)] bg-[var(--accent-pink)] ring-1 ring-[var(--color-danger-border)]'
                    : isTarget
                    ? 'border-[var(--color-accent)] bg-[var(--accent-blue)]'
                    : 'border-[var(--border)] bg-[var(--surface-soft)] hover:border-[var(--color-border-strong)]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-[var(--text-secondary)] font-mono tabular-nums">Step {idx + 1}</span>
                  {isTarget && (
                    <span className="text-xs bg-[var(--surface)] border border-[var(--border)] text-[var(--accent-blue-text)] px-1.5 py-0.5 rounded font-semibold">
                      Query target
                    </span>
                  )}
                  {isRemoved && (
                    <span className="text-xs bg-[var(--surface)] border border-[var(--color-danger-border)] text-[var(--accent-pink-text)] px-1.5 py-0.5 rounded font-semibold flex items-center gap-1">
                      <Scissors className="w-2.5 h-2.5" /> Omitted
                    </span>
                  )}
                </div>

                <div className="text-sm font-serif font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <span className={isRemoved ? 'line-through text-[var(--accent-pink-text)] opacity-75' : 'text-[var(--text-primary)]'}>
                    {fact.key}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span className={isRemoved ? 'line-through text-[var(--accent-pink-text)] opacity-75' : 'text-[var(--accent-blue-text)]'}>
                    {fact.value}
                  </span>
                </div>

                <div className="mt-2 pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">Operation:</span>
                  <span className={isRemoved ? 'text-[var(--accent-pink-text)] font-semibold' : 'text-[var(--text-secondary)]'}>
                    {isRemoved ? 'Omit write in Run B' : 'Written in both runs'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 2: PREDICT THE EFFECT (LEARNING MOMENT) */}
      <div className="research-callout p-5 space-y-3 font-sans">
        <div className="flex items-center gap-2 text-[var(--accent-blue-text)] text-xs font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>2. Predict the effect before revealing results</span>
        </div>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          When Write #{removedIndex + 1} (
          <strong className="text-[var(--text-primary)]">{removedFact.key} → {removedFact.value}</strong>
          ) is omitted from memory, what do you predict will happen to the prediction for{' '}
          <strong className="text-[var(--accent-blue-text)]">&quot;{targetKey}&quot;</strong>?
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <button
            type="button"
            onClick={() => setUserPrediction('change')}
            className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
              userPrediction === 'change'
                ? 'border-[var(--color-accent)] bg-[var(--accent-blue)] text-[var(--accent-blue-text)] font-semibold'
                : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--color-border-strong)]'
            }`}
          >
            <div className="text-xs font-semibold text-[var(--text-primary)]">Prediction will change</div>
            <div className="text-xs text-[var(--text-secondary)] mt-0.5">Top-1 flips to a different city</div>
          </button>

          <button
            type="button"
            onClick={() => setUserPrediction('same')}
            className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
              userPrediction === 'same'
                ? 'border-[var(--color-accent)] bg-[var(--accent-blue)] text-[var(--accent-blue-text)] font-semibold'
                : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--color-border-strong)]'
            }`}
          >
            <div className="text-xs font-semibold text-[var(--text-primary)]">Prediction will stay the same</div>
            <div className="text-xs text-[var(--text-secondary)] mt-0.5">Top-1 remains identical</div>
          </button>

          <button
            type="button"
            onClick={() => setUserPrediction('unsure')}
            className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
              userPrediction === 'unsure'
                ? 'border-[var(--color-accent)] bg-[var(--accent-blue)] text-[var(--accent-blue-text)] font-semibold'
                : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--color-border-strong)]'
            }`}
          >
            <div className="text-xs font-semibold text-[var(--text-primary)]">Not sure / Dependent</div>
            <div className="text-xs text-[var(--text-secondary)] mt-0.5">Need to observe the difference</div>
          </button>
        </div>
      </div>

      {/* STEP 3: SIDE-BY-SIDE RUN COMPARISON */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RUN A: ORIGINAL */}
        <div className="diagram-frame p-5 space-y-4 font-sans">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div>
              <span className="text-xs font-semibold text-[var(--accent-blue-text)] block">
                Run A: Original
              </span>
              <span className="text-xs text-[var(--text-secondary)] tabular-nums">All {activeFacts.length} writes applied</span>
            </div>
            <span className="text-xs bg-[var(--accent-blue)] border border-[var(--border)] text-[var(--accent-blue-text)] px-2 py-0.5 rounded font-semibold">
              Control
            </span>
          </div>

          <div className="space-y-3">
            <div className="metric-panel flex items-center justify-between">
              <div>
                <span className="text-xs text-[var(--text-secondary)] block">Query → Ground truth</span>
                <span className="text-sm font-serif font-bold text-[var(--text-primary)]">
                  &quot;{targetKey}&quot; → <span className="text-[var(--accent-blue-text)]">{groundTruth}</span>
                </span>
              </div>
            </div>

            <div className="metric-panel flex items-center justify-between">
              <div>
                <span className="text-xs text-[var(--text-secondary)] block">Model prediction</span>
                <span className="text-base font-serif font-bold text-[var(--text-primary)] flex items-center gap-1.5 mt-0.5">
                  {originalRun.prediction}
                  {originalRun.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-[var(--accent-green-text)]" />
                  ) : (
                    <XCircle className="w-4 h-4 text-[var(--accent-pink-text)]" />
                  )}
                </span>
              </div>
              <div className="text-right">
                <span
                  className="text-xs text-[var(--text-secondary)] block"
                  title="Cosine similarity between representation and candidate. This is not a calibrated probability."
                >
                  Retrieval score
                </span>
                <span className="text-base font-mono font-bold text-[var(--text-primary)] mt-0.5 block tabular-nums">
                  {Math.round(originalRun.retrievalScore * 100)}%
                </span>
              </div>
            </div>

            <div className="metric-panel flex items-center justify-between text-xs font-sans">
              <span className="text-[var(--text-secondary)]">Top-1 margin:</span>
              <span className="font-mono font-semibold text-[var(--text-primary)] tabular-nums">
                {originalRun.top1Margin.toFixed(3)}
              </span>
            </div>
          </div>

          {/* Latent Vector Snapshot */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-1.5 tabular-nums">
              <span>Final retrieved vector (1D)</span>
              <span className="font-mono">{dim} dimensions</span>
            </div>
            <div className="grid grid-cols-8 gap-1">
              {originalRun.finalState.slice(0, Math.min(16, dim)).map((val, i) => (
                <div
                  key={i}
                  className="p-1 rounded bg-[var(--surface-soft)] border border-[var(--border)] text-center tabular-nums"
                  title={`Dimension ${i + 1}: ${val.toFixed(3)}`}
                >
                  <div className="text-[10px] text-[var(--text-muted)] font-mono">D{i + 1}</div>
                  <div className="text-xs text-[var(--accent-blue-text)] font-mono font-bold truncate">
                    {val.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RUN B: COUNTERFACTUAL */}
        <div className="diagram-frame p-5 space-y-4 font-sans">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div>
              <span className="text-xs font-semibold text-[var(--accent-yellow-text)] block">
                Run B: Counterfactual
              </span>
              <span className="text-xs text-[var(--text-secondary)] tabular-nums">
                Write #{removedIndex + 1} ({removedFact.key}) omitted
              </span>
            </div>
            <span className="text-xs bg-[var(--accent-yellow)] border border-[var(--color-warning-border)] text-[var(--accent-yellow-text)] px-2 py-0.5 rounded font-semibold">
              Intervention
            </span>
          </div>

          <div className="space-y-3">
            <div className="metric-panel flex items-center justify-between">
              <div>
                <span className="text-xs text-[var(--text-secondary)] block">Query → Ground truth</span>
                <span className="text-sm font-serif font-bold text-[var(--text-primary)]">
                  &quot;{targetKey}&quot; → <span className="text-[var(--accent-blue-text)]">{groundTruth}</span>
                </span>
              </div>
            </div>

            <div className="metric-panel flex items-center justify-between">
              <div>
                <span className="text-xs text-[var(--text-secondary)] block">Model prediction</span>
                <span className="text-base font-serif font-bold text-[var(--text-primary)] flex items-center gap-1.5 mt-0.5">
                  {counterfactualRun.prediction}
                  {counterfactualRun.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-[var(--accent-green-text)]" />
                  ) : (
                    <XCircle className="w-4 h-4 text-[var(--accent-pink-text)]" />
                  )}
                </span>
              </div>
              <div className="text-right">
                <span
                  className="text-xs text-[var(--text-secondary)] block"
                  title="Cosine similarity between representation and candidate. This is not a calibrated probability."
                >
                  Retrieval score
                </span>
                <span className="text-base font-mono font-bold text-[var(--text-primary)] mt-0.5 block tabular-nums">
                  {Math.round(counterfactualRun.retrievalScore * 100)}%
                </span>
              </div>
            </div>

            <div className="metric-panel flex items-center justify-between text-xs font-sans">
              <span className="text-[var(--text-secondary)]">Top-1 margin:</span>
              <span className="font-mono font-semibold text-[var(--text-primary)] tabular-nums">
                {counterfactualRun.top1Margin.toFixed(3)}
              </span>
            </div>
          </div>

          {/* Latent Vector Snapshot */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-1.5 tabular-nums">
              <span>Final retrieved vector (1D)</span>
              <span className="font-mono">{dim} dimensions</span>
            </div>
            <div className="grid grid-cols-8 gap-1">
              {counterfactualRun.finalState.slice(0, Math.min(16, dim)).map((val, i) => (
                <div
                  key={i}
                  className="p-1 rounded bg-[var(--surface-soft)] border border-[var(--border)] text-center tabular-nums"
                  title={`Dimension ${i + 1}: ${val.toFixed(3)}`}
                >
                  <div className="text-[10px] text-[var(--text-muted)] font-mono">D{i + 1}</div>
                  <div className="text-xs text-[var(--accent-yellow-text)] font-mono font-bold truncate">
                    {val.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* STEP 4: MEASURED COUNTERFACTUAL EFFECT */}
      <div className="research-callout p-5 space-y-4 font-sans">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[var(--accent-blue-text)]" />
            <h4 className="text-xs font-semibold text-[var(--text-primary)]">
              Measured counterfactual effect (observed difference)
            </h4>
          </div>
          <span className="text-xs text-[var(--text-secondary)]">
            Observed counterfactual difference in this educational model.
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 tabular-nums">
          <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
            <div className="text-xs text-[var(--text-secondary)]">Prediction changed?</div>
            <div
              className={`text-sm font-serif font-bold mt-1 ${
                causalDelta.predictionChanged ? 'text-[var(--accent-pink-text)]' : 'text-[var(--accent-green-text)]'
              }`}
            >
              {causalDelta.predictionChanged ? 'Yes (Flipped)' : 'No (Stable)'}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
            <div className="text-xs text-[var(--text-secondary)]">Score delta</div>
            <div
              className={`text-sm font-mono font-bold mt-1 flex items-center gap-1 ${
                causalDelta.scoreDelta > 0
                  ? 'text-[var(--accent-green-text)]'
                  : causalDelta.scoreDelta < 0
                  ? 'text-[var(--accent-pink-text)]'
                  : 'text-[var(--text-secondary)]'
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

          <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
            <div className="text-xs text-[var(--text-secondary)]">Top-1 margin delta</div>
            <div className="text-sm font-mono font-bold text-[var(--text-primary)] mt-1">
              {causalDelta.marginDelta >= 0
                ? `+${causalDelta.marginDelta.toFixed(3)}`
                : causalDelta.marginDelta.toFixed(3)}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
            <div className="text-xs text-[var(--text-secondary)]">Mean state delta</div>
            <div className="text-sm font-mono font-bold text-[var(--accent-blue-text)] mt-1">
              {causalDelta.meanAbsStateDiff.toFixed(3)}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
            <div className="text-xs text-[var(--text-secondary)]">Max state delta</div>
            <div className="text-sm font-mono font-bold text-[var(--accent-blue-text)] mt-1">
              {causalDelta.maxAbsStateDiff.toFixed(3)}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
            <div className="text-xs text-[var(--text-secondary)]">Changed cells</div>
            <div className="text-sm font-mono font-bold text-[var(--accent-blue-text)] mt-1">
              {causalDelta.changedCells} / {causalDelta.totalCells}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
            <div className="text-xs text-[var(--text-secondary)]">Mean matrix delta</div>
            <div className="text-sm font-mono font-bold text-[var(--accent-blue-text)] mt-1">
              {causalDelta.meanAbsMatrixDiff.toFixed(4)}
            </div>
          </div>
        </div>
      </div>

      {/* STEP 5: LATENT DIMENSION DIFFERENTIALS */}
      <div className="diagram-frame p-5 space-y-4 font-sans">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--accent-blue-text)]" />
            <h4 className="text-xs font-semibold text-[var(--text-primary)]">
              Latent dimension differentials (Δs = s_cf − s_orig)
            </h4>
          </div>
          <span className="text-xs text-[var(--text-secondary)]">
            Labeled coordinates in shared recurrent space
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 tabular-nums">
          {causalDelta.stateDiffs.slice(0, Math.min(16, dim)).map((diff, dIdx) => {
            const origVal = originalRun.finalState[dIdx] ?? 0;
            const cfVal = counterfactualRun.finalState[dIdx] ?? 0;

            return (
              <div
                key={dIdx}
                className="metric-panel space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-secondary)] font-mono font-semibold">
                    Dim {String(dIdx + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      Math.abs(diff) > 0.05
                        ? diff > 0
                          ? 'text-[var(--accent-green-text)]'
                          : 'text-[var(--accent-pink-text)]'
                        : 'text-[var(--text-muted)]'
                    }`}
                  >
                    Δ {diff >= 0 ? `+${diff.toFixed(3)}` : diff.toFixed(3)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-[var(--text-secondary)]">
                  <span>
                    Orig: <span className="text-[var(--accent-blue-text)] font-bold">{origVal.toFixed(2)}</span>
                  </span>
                  <span>
                    CF: <span className="text-[var(--accent-yellow-text)] font-bold">{cfVal.toFixed(2)}</span>
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
      <div className="research-callout p-5 sm:p-6 space-y-4 font-sans">
        <div className="flex items-center gap-2 text-[var(--accent-blue-text)] text-xs font-semibold">
          <Info className="w-4 h-4" />
          <span>Causal explanation &amp; pedagogical synthesis</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] space-y-1">
            <span className="text-xs text-[var(--text-secondary)] block">Your hypothesis:</span>
            <span className="text-sm font-semibold text-[var(--accent-blue-text)]">
              {userPrediction === 'change'
                ? 'Prediction would change'
                : userPrediction === 'same'
                ? 'Prediction would stay the same'
                : userPrediction === 'unsure'
                ? 'Unsure / testing sensitivity'
                : 'No hypothesis recorded prior to execution'}
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] space-y-1">
            <span className="text-xs text-[var(--text-secondary)] block">Actual measured outcome:</span>
            <span className="text-sm font-semibold text-[var(--text-primary)] tabular-nums">
              {causalDelta.predictionChanged
                ? `Prediction changed from "${originalRun.prediction}" to "${counterfactualRun.prediction}"`
                : `Prediction remained stable at "${counterfactualRun.prediction}" (score Δ ${(causalDelta.scoreDelta * 100).toFixed(1)} pp)`}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)] space-y-2">
          <div className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[var(--accent-blue-text)]" />
            Why did this occur?
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
            {dynamicExplanation}
          </p>
        </div>

        {/* Connection to Central Claim */}
        <div className="pt-2 border-t border-[var(--border)] space-y-2 font-sans text-xs">
          <div className="text-[var(--text-secondary)] leading-relaxed">
            <strong className="text-[var(--text-primary)]">Connection to central claim:</strong> Memory Surgery isolates the trade-off at the heart of recurrent memory. Because the recurrent state size is fixed (<span className="font-mono tabular-nums">D = {dim}</span>), writing a fact is not a discrete append; it adds an <GlossaryTerm term="Hebbian plasticity" className="text-[var(--accent-blue-text)] hover:underline">outer product</GlossaryTerm> directly into shared matrix coordinates. When you remove a write, you witness how that specific update either preserved, distorted, or decayed other representations.
          </div>
          <p className="text-xs text-[var(--text-muted)] italic">
            <strong>Limitation:</strong> Memory Surgery is a controlled counterfactual experiment inside this educational model. Educational toy — not the official BDH implementation. It changes one operation while holding the other experiment conditions fixed. The resulting difference shows how sensitive this particular toy memory is to that update.
          </p>
        </div>
      </div>
    </div>
  );
};

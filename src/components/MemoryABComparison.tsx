import React, { useState, useMemo } from 'react';
import {
  GitCompare,
  Copy,
  ArrowLeftRight,
  RotateCcw,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Sliders,
  Sparkles,
} from 'lucide-react';
import {
  CANONICAL_FACTS,
  Fact,
  vector,
  cosine,
  norm,
} from '../models/associativeMemory';

interface MemoryConfig {
  dim: number; // 8, 16, 32
  retention: number; // 0.5 to 1.0
  interference: number; // 0.0 to 1.0
  latentSteps: number; // 0 to 16
}

export const MemoryABComparison: React.FC = () => {
  const [factsCount, setFactsCount] = useState<number>(16);
  const [testQueryKey, setTestQueryKey] = useState<string>('Japan');

  // Config A (default: dimension 8, retention 90%, interference 0.4)
  const [configA, setConfigA] = useState<MemoryConfig>({
    dim: 8,
    retention: 0.9,
    interference: 0.4,
    latentSteps: 0,
  });

  // Config B (default: dimension 32, retention 98%, interference 0.1)
  const [configB, setConfigB] = useState<MemoryConfig>({
    dim: 32,
    retention: 0.98,
    interference: 0.1,
    latentSteps: 4,
  });

  const [isAFrozen, setIsAFrozen] = useState<boolean>(false);

  const sharedFacts: Fact[] = useMemo(() => {
    return CANONICAL_FACTS.slice(0, factsCount);
  }, [factsCount]);

  // Deterministic evaluation function for a specific config
  const evaluateMemorySystem = (cfg: MemoryConfig) => {
    const { dim, retention, interference, latentSteps } = cfg;
    let M = Array.from({ length: dim }, () => Array(dim).fill(0));
    const interferenceAxis = vector('GLOBAL_AB_INTERFERENCE', dim);

    // Write all shared facts
    for (const fact of sharedFacts) {
      const baseK = vector(fact.key, dim);
      const baseV = vector(fact.value, dim);

      let k = baseK.map(
        (val, i) => (1 - interference) * val + interference * (interferenceAxis[i] ?? 0)
      );
      const kNorm = norm(k) || 1;
      k = k.map((v) => v / kNorm);

      M = M.map((row) => row.map((x) => x * retention));

      for (let i = 0; i < dim; i++) {
        for (let j = 0; j < dim; j++) {
          M[i][j] += 0.8 * k[i] * baseV[j];
        }
      }
    }

    // Apply latent steps if > 0 (recurrent latent consolidation)
    if (latentSteps > 0) {
      for (let s = 0; s < latentSteps; s++) {
        M = M.map((row) => row.map((x) => Math.tanh(x * 1.02)));
      }
    }

    // Evaluate all facts for accuracy
    let correctCount = 0;
    const failures: { key: string; expected: string; got: string }[] = [];

    for (const fact of sharedFacts) {
      const baseK = vector(fact.key, dim);
      let q = baseK.map(
        (val, i) => (1 - interference) * val + interference * (interferenceAxis[i] ?? 0)
      );
      const qNorm = norm(q) || 1;
      q = q.map((v) => v / qNorm);

      const retrieved = Array(dim).fill(0);
      for (let j = 0; j < dim; j++) {
        for (let i = 0; i < dim; i++) {
          retrieved[j] += q[i] * M[i][j];
        }
      }

      let bestVal = 'UNKNOWN';
      let bestScore = -Infinity;
      for (const cand of sharedFacts) {
        const score = cosine(retrieved, vector(cand.value, dim));
        if (score > bestScore) {
          bestScore = score;
          bestVal = cand.value;
        }
      }

      if (bestVal === fact.value && bestScore > 0.05) {
        correctCount++;
      } else {
        failures.push({ key: fact.key, expected: fact.value, got: bestVal });
      }
    }

    // Evaluate target test query specifically
    const baseKTarget = vector(testQueryKey, dim);
    let qTarget = baseKTarget.map(
      (val, i) => (1 - interference) * val + interference * (interferenceAxis[i] ?? 0)
    );
    const qTargetNorm = norm(qTarget) || 1;
    qTarget = qTarget.map((v) => v / qTargetNorm);

    const retrievedTarget = Array(dim).fill(0);
    for (let j = 0; j < dim; j++) {
      for (let i = 0; i < dim; i++) {
        retrievedTarget[j] += qTarget[i] * M[i][j];
      }
    }

    let targetPredicted = 'UNKNOWN';
    let targetScore = -Infinity;
    for (const cand of sharedFacts) {
      const score = cosine(retrievedTarget, vector(cand.value, dim));
      if (score > targetScore) {
        targetScore = score;
        targetPredicted = cand.value;
      }
    }

    const groundTruthObj = sharedFacts.find((f) => f.key === testQueryKey);
    const groundTruth = groundTruthObj ? groundTruthObj.value : 'UNKNOWN';
    const isTargetCorrect = targetPredicted === groundTruth && targetScore > 0.05;

    return {
      accuracy: sharedFacts.length > 0 ? (correctCount / sharedFacts.length) * 100 : 0,
      failuresCount: failures.length,
      targetPredicted,
      groundTruth,
      targetScore,
      targetConfidence: Math.max(0, Math.min(1, (targetScore + 1) / 2)),
      isTargetCorrect,
      matrix: M,
    };
  };

  const resultsA = useMemo(() => evaluateMemorySystem(configA), [configA, sharedFacts, testQueryKey]);
  const resultsB = useMemo(() => evaluateMemorySystem(configB), [configB, sharedFacts, testQueryKey]);

  // Actions
  const handleCopyAToB = () => {
    setConfigB({ ...configA });
  };

  const handleSwap = () => {
    if (isAFrozen) return;
    const temp = { ...configA };
    setConfigA({ ...configB });
    setConfigB(temp);
  };

  const handleResetBoth = () => {
    setConfigA({ dim: 8, retention: 0.9, interference: 0.4, latentSteps: 0 });
    setConfigB({ dim: 32, retention: 0.98, interference: 0.1, latentSteps: 4 });
    setIsAFrozen(false);
  };

  return (
    <div className="diagram-frame p-5 sm:p-7 text-[var(--text-primary)] space-y-6">
      {/* Header & Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-sans text-[var(--accent-blue-text)] bg-[var(--accent-blue)] border border-[var(--border)] px-2.5 py-0.5 rounded-md font-semibold flex items-center gap-1.5">
              <GitCompare className="w-3.5 h-3.5" />
              A/B experiment mode
            </span>
            <span className="text-xs font-sans text-[var(--text-secondary)] bg-[var(--surface-soft)] border border-[var(--border)] px-2.5 py-0.5 rounded-md font-semibold">
              Controlled comparison
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[var(--text-primary)] tracking-tight">
            Same information. Different memory.
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans max-w-2xl">
            Freeze System A or adjust parameters independently. Both receive the exact same sequence of {factsCount} facts. Observe what parameter changed the outcome.
          </p>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex flex-wrap items-center gap-2 font-sans text-xs">
          <button
            onClick={() => setIsAFrozen(!isAFrozen)}
            className={`px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 cursor-pointer ${
              isAFrozen
                ? 'bg-[var(--accent-yellow)] border-[var(--color-warning-border)] text-[var(--accent-yellow-text)] font-semibold'
                : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)]'
            }`}
          >
            {isAFrozen ? <Lock className="w-3.5 h-3.5 text-[var(--accent-yellow-text)]" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{isAFrozen ? 'Memory A frozen' : 'Freeze A'}</span>
          </button>

          <button
            onClick={handleCopyAToB}
            className="px-3 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)] flex items-center gap-1.5 transition cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy A → B</span>
          </button>

          <button
            onClick={handleSwap}
            disabled={isAFrozen}
            className="px-3 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)] flex items-center gap-1.5 transition cursor-pointer disabled:opacity-40"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Swap</span>
          </button>

          <button
            onClick={handleResetBoth}
            className="px-3 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)] flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset both</span>
          </button>
        </div>
      </div>

      {/* Shared Facts Sequence Bar */}
      <div className="p-3.5 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-4 font-sans text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[var(--text-secondary)] font-semibold">Shared dataset:</span>
          <span className="font-mono text-xs font-bold text-[var(--text-primary)] bg-[var(--surface)] px-2.5 py-0.5 rounded border border-[var(--border)] tabular-nums">
            {factsCount} facts loaded
          </span>
          <span className="text-[var(--text-muted)]">| Query cue: &quot;{testQueryKey}&quot;</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[var(--text-secondary)] text-[11px] font-semibold">Count:</span>
          {[8, 16, 24, 32].map((cnt) => (
            <button
              key={cnt}
              onClick={() => setFactsCount(cnt)}
              className={`px-2.5 py-0.5 rounded text-xs transition border font-mono tabular-nums cursor-pointer ${
                factsCount === cnt
                  ? 'bg-[var(--accent-blue)] border-[var(--accent-blue-text)] text-[var(--accent-blue-text)] font-bold'
                  : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)]'
              }`}
            >
              {cnt}
            </button>
          ))}
        </div>
      </div>

      {/* Side-by-Side Comparison Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System A Column */}
        <div className="p-5 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)] space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 font-sans text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-[2px] bg-[var(--accent-blue-text)]" />
              <strong className="text-[var(--text-primary)] font-serif font-semibold text-base">Memory system A</strong>
              {isAFrozen && (
                <span className="text-[10px] font-sans bg-[var(--accent-yellow)] text-[var(--accent-yellow-text)] px-2 py-0.5 rounded border border-[var(--color-warning-border)] font-semibold">
                  Frozen
                </span>
              )}
            </div>
            <span className="text-[var(--accent-blue-text)] font-mono font-bold text-sm tabular-nums">
              {resultsA.accuracy.toFixed(0)}% accuracy
            </span>
          </div>

          {/* Controls for A */}
          <div className="space-y-3 font-sans text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Dimension:</span>
              <div className="flex gap-1">
                {[8, 16, 32].map((d) => (
                  <button
                    key={d}
                    disabled={isAFrozen}
                    onClick={() => setConfigA({ ...configA, dim: d })}
                    className={`px-2.5 py-0.5 rounded border font-mono text-[11px] tabular-nums cursor-pointer ${
                      configA.dim === d
                        ? 'bg-[var(--accent-blue)] border-[var(--accent-blue-text)] text-[var(--accent-blue-text)] font-bold'
                        : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {d}D
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Retention:</span>
                <span className="text-[var(--text-primary)] font-mono font-bold tabular-nums">{(configA.retention * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="2"
                disabled={isAFrozen}
                value={configA.retention * 100}
                onChange={(e) =>
                  setConfigA({ ...configA, retention: Number(e.target.value) / 100 })
                }
                className="w-full accent-[var(--accent-blue-text)] cursor-pointer h-1.5 bg-[var(--border)] rounded"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Interference:</span>
                <span className="text-[var(--text-primary)] font-mono font-bold tabular-nums">{(configA.interference * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                disabled={isAFrozen}
                value={configA.interference * 100}
                onChange={(e) =>
                  setConfigA({ ...configA, interference: Number(e.target.value) / 100 })
                }
                className="w-full accent-[var(--accent-blue-text)] cursor-pointer h-1.5 bg-[var(--border)] rounded"
              />
            </div>
          </div>

          {/* Results Summary for A */}
          <div className="p-3.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] space-y-2 font-sans text-xs">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Query target:</span>
              <span className="text-[var(--text-primary)] font-serif font-bold">{testQueryKey}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Decoded prediction:</span>
              <span
                className={`font-serif font-bold ${
                  resultsA.isTargetCorrect ? 'text-[var(--accent-green-text)]' : 'text-[var(--accent-pink-text)]'
                }`}
              >
                {resultsA.targetPredicted}
              </span>
            </div>
            <div className="flex justify-between" title="Cosine similarity between the retrieved representation and candidate value. This is not a calibrated probability.">
              <span className="text-[var(--text-secondary)]">Retrieval score:</span>
              <span className="text-[var(--text-primary)] font-mono font-semibold tabular-nums">{(resultsA.targetConfidence * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between border-t border-[var(--border)] pt-2">
              <span className="text-[var(--text-secondary)]">Failures across all {factsCount} facts:</span>
              <strong className="text-[var(--accent-pink-text)] font-mono tabular-nums">{resultsA.failuresCount}</strong>
            </div>
          </div>
        </div>

        {/* System B Column */}
        <div className="p-5 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)] space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 font-sans text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-[2px] bg-[var(--accent-green-text)]" />
              <strong className="text-[var(--text-primary)] font-serif font-semibold text-base">Memory system B</strong>
            </div>
            <span className="text-[var(--accent-green-text)] font-mono font-bold text-sm tabular-nums">
              {resultsB.accuracy.toFixed(0)}% accuracy
            </span>
          </div>

          {/* Controls for B */}
          <div className="space-y-3 font-sans text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Dimension:</span>
              <div className="flex gap-1">
                {[8, 16, 32].map((d) => (
                  <button
                    key={d}
                    onClick={() => setConfigB({ ...configB, dim: d })}
                    className={`px-2.5 py-0.5 rounded border font-mono text-[11px] tabular-nums cursor-pointer ${
                      configB.dim === d
                        ? 'bg-[var(--accent-green)] border-[var(--color-success-border)] text-[var(--accent-green-text)] font-bold'
                        : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {d}D
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Retention:</span>
                <span className="text-[var(--text-primary)] font-mono font-bold tabular-nums">{(configB.retention * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="2"
                value={configB.retention * 100}
                onChange={(e) =>
                  setConfigB({ ...configB, retention: Number(e.target.value) / 100 })
                }
                className="w-full accent-[var(--accent-green-text)] cursor-pointer h-1.5 bg-[var(--border)] rounded"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Interference:</span>
                <span className="text-[var(--text-primary)] font-mono font-bold tabular-nums">{(configB.interference * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={configB.interference * 100}
                onChange={(e) =>
                  setConfigB({ ...configB, interference: Number(e.target.value) / 100 })
                }
                className="w-full accent-[var(--accent-green-text)] cursor-pointer h-1.5 bg-[var(--border)] rounded"
              />
            </div>
          </div>

          {/* Results Summary for B */}
          <div className="p-3.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] space-y-2 font-sans text-xs">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Query target:</span>
              <span className="text-[var(--text-primary)] font-serif font-bold">{testQueryKey}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Decoded prediction:</span>
              <span
                className={`font-serif font-bold ${
                  resultsB.isTargetCorrect ? 'text-[var(--accent-green-text)]' : 'text-[var(--accent-pink-text)]'
                }`}
              >
                {resultsB.targetPredicted}
              </span>
            </div>
            <div className="flex justify-between" title="Cosine similarity between the retrieved representation and candidate value. This is not a calibrated probability.">
              <span className="text-[var(--text-secondary)]">Retrieval score:</span>
              <span className="text-[var(--text-primary)] font-mono font-semibold tabular-nums">{(resultsB.targetConfidence * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between border-t border-[var(--border)] pt-2">
              <span className="text-[var(--text-secondary)]">Failures across all {factsCount} facts:</span>
              <strong className="text-[var(--accent-pink-text)] font-mono tabular-nums">{resultsB.failuresCount}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Epistemic Conclusion Question */}
      <div className="p-4 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-3 text-xs font-sans">
        <span className="text-[var(--text-secondary)]">
          <strong className="text-[var(--text-primary)]">What parameter changed the outcome?</strong> Higher dimension increases orthogonal capacity; higher retention slows temporal decay; lower interference prevents crosstalk superposition.
        </span>
        <span className="text-[var(--accent-blue-text)] font-mono font-semibold bg-[var(--accent-blue)] px-2.5 py-1 rounded border border-[var(--border)] tabular-nums">
          Δ {Math.abs(resultsB.accuracy - resultsA.accuracy).toFixed(0)}% accuracy spread
        </span>
      </div>
    </div>
  );
};

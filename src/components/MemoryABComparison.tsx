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
    <div className="rounded-2xl border border-[#252A35] bg-[#0A0D16] p-5 sm:p-7 text-slate-100 shadow-2xl space-y-6">
      {/* Header & Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2638] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-0.5 rounded-md font-bold flex items-center gap-1.5">
              <GitCompare className="w-3.5 h-3.5" />
              A/B EXPERIMENT MODE
            </span>
            <span className="text-xs font-mono uppercase tracking-wider text-purple-300 bg-purple-950/70 border border-purple-800/60 px-2.5 py-0.5 rounded-md font-bold">
              CONTROLLED COMPARISON
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
            SAME INFORMATION. DIFFERENT MEMORY.
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-2xl">
            Freeze System A or adjust parameters independently. Both receive the exact same sequence of {factsCount} facts. Observe what parameter changed the outcome.
          </p>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setIsAFrozen(!isAFrozen)}
            className={`px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 ${
              isAFrozen
                ? 'bg-amber-950/70 border-amber-500 text-amber-200 font-bold'
                : 'bg-[#131926] border-[#222E44] text-slate-300 hover:text-white'
            }`}
          >
            {isAFrozen ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{isAFrozen ? 'MEMORY A FROZEN' : 'FREEZE A'}</span>
          </button>

          <button
            onClick={handleCopyAToB}
            className="px-3 py-1.5 rounded-lg bg-[#131926] border border-[#222E44] text-slate-300 hover:text-white flex items-center gap-1.5 transition"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>COPY A → B</span>
          </button>

          <button
            onClick={handleSwap}
            disabled={isAFrozen}
            className="px-3 py-1.5 rounded-lg bg-[#131926] border border-[#222E44] text-slate-300 hover:text-white flex items-center gap-1.5 transition disabled:opacity-40"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>SWAP</span>
          </button>

          <button
            onClick={handleResetBoth}
            className="px-3 py-1.5 rounded-lg bg-[#131926] border border-[#222E44] text-slate-300 hover:text-white flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET BOTH</span>
          </button>
        </div>
      </div>

      {/* Shared Facts Sequence Bar */}
      <div className="p-3.5 rounded-xl bg-[#090D18] border border-[#1C2538] flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">SHARED DATASET:</span>
          <span className="text-white font-bold bg-[#141B2A] px-2.5 py-0.5 rounded border border-[#232F46]">
            {factsCount} Facts Loaded
          </span>
          <span className="text-slate-500">| Query: "{testQueryKey}"</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-[11px]">COUNT:</span>
          {[8, 16, 24, 32].map((cnt) => (
            <button
              key={cnt}
              onClick={() => setFactsCount(cnt)}
              className={`px-2 py-0.5 rounded text-xs transition border ${
                factsCount === cnt
                  ? 'bg-cyan-600 border-cyan-400 text-white font-bold'
                  : 'bg-[#121724] border-[#222C3E] text-slate-400 hover:text-white'
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
        <div className="p-5 rounded-xl bg-[#0C101C] border border-[#20293E] space-y-4">
          <div className="flex items-center justify-between border-b border-[#1B2336] pb-2 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <strong className="text-white text-sm">MEMORY SYSTEM A</strong>
              {isAFrozen && (
                <span className="text-[9px] bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-800">
                  LOCKED
                </span>
              )}
            </div>
            <span className="text-cyan-300 font-bold text-sm">
              {resultsA.accuracy.toFixed(0)}% Accuracy
            </span>
          </div>

          {/* Controls for A */}
          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Dimension:</span>
              <div className="flex gap-1">
                {[8, 16, 32].map((d) => (
                  <button
                    key={d}
                    disabled={isAFrozen}
                    onClick={() => setConfigA({ ...configA, dim: d })}
                    className={`px-2 py-0.5 rounded border text-[11px] ${
                      configA.dim === d
                        ? 'bg-cyan-600 border-cyan-400 text-white font-bold'
                        : 'bg-[#151C2C] border-[#222B3E] text-slate-400'
                    }`}
                  >
                    {d}D
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Retention:</span>
                <span className="text-white font-bold">{(configA.retention * 100).toFixed(0)}%</span>
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
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Interference:</span>
                <span className="text-white font-bold">{(configA.interference * 100).toFixed(0)}%</span>
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
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
            </div>
          </div>

          {/* Results Summary for A */}
          <div className="p-3.5 rounded-lg bg-[#080B14] border border-[#182134] space-y-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Query Target:</span>
              <span className="text-white font-bold">{testQueryKey}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Decoded Prediction:</span>
              <span
                className={`font-bold ${
                  resultsA.isTargetCorrect ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {resultsA.targetPredicted}
              </span>
            </div>
            <div className="flex justify-between" title="This score is based on representation similarity and is not a calibrated probability.">
              <span className="text-slate-400">Retrieval Score:</span>
              <span className="text-white">{(resultsA.targetConfidence * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between border-t border-[#182134] pt-2">
              <span className="text-slate-400">Failures across all {factsCount} facts:</span>
              <strong className="text-rose-400">{resultsA.failuresCount}</strong>
            </div>
          </div>
        </div>

        {/* System B Column */}
        <div className="p-5 rounded-xl bg-[#0E101E] border border-[#292244] space-y-4">
          <div className="flex items-center justify-between border-b border-[#211A38] pb-2 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              <strong className="text-white text-sm">MEMORY SYSTEM B</strong>
            </div>
            <span className="text-purple-300 font-bold text-sm">
              {resultsB.accuracy.toFixed(0)}% Accuracy
            </span>
          </div>

          {/* Controls for B */}
          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Dimension:</span>
              <div className="flex gap-1">
                {[8, 16, 32].map((d) => (
                  <button
                    key={d}
                    onClick={() => setConfigB({ ...configB, dim: d })}
                    className={`px-2 py-0.5 rounded border text-[11px] ${
                      configB.dim === d
                        ? 'bg-purple-600 border-purple-400 text-white font-bold'
                        : 'bg-[#17142A] border-[#292244] text-slate-400'
                    }`}
                  >
                    {d}D
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Retention:</span>
                <span className="text-white font-bold">{(configB.retention * 100).toFixed(0)}%</span>
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
                className="w-full accent-purple-400 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Interference:</span>
                <span className="text-white font-bold">{(configB.interference * 100).toFixed(0)}%</span>
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
                className="w-full accent-purple-400 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
            </div>
          </div>

          {/* Results Summary for B */}
          <div className="p-3.5 rounded-lg bg-[#090816] border border-[#1F1732] space-y-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Query Target:</span>
              <span className="text-white font-bold">{testQueryKey}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Decoded Prediction:</span>
              <span
                className={`font-bold ${
                  resultsB.isTargetCorrect ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {resultsB.targetPredicted}
              </span>
            </div>
            <div className="flex justify-between" title="This score is based on representation similarity and is not a calibrated probability.">
              <span className="text-slate-400">Retrieval Score:</span>
              <span className="text-white">{(resultsB.targetConfidence * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between border-t border-[#1F1732] pt-2">
              <span className="text-slate-400">Failures across all {factsCount} facts:</span>
              <strong className="text-rose-400">{resultsB.failuresCount}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Epistemic Conclusion Question */}
      <div className="p-4 rounded-xl bg-[#090C16] border border-[#1A2234] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <span className="text-slate-300">
          <strong>What parameter changed the outcome?</strong> Higher dimension increases orthogonal capacity; higher retention slows temporal decay; lower interference prevents cross-talk superposition.
        </span>
        <span className="text-cyan-400 font-bold bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800/60">
          DELTA: {Math.abs(resultsB.accuracy - resultsA.accuracy).toFixed(0)}% ACCURACY SPREAD
        </span>
      </div>
    </div>
  );
};

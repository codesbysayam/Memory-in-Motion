import React, { useState, useMemo } from 'react';
import {
  Clock,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Activity,
  Play,
  RotateCcw,
} from 'lucide-react';
import {
  createAssociativeMemory,
  vector,
  cosine,
  CANONICAL_FACTS,
  Fact,
} from '../models/associativeMemory';

export const MemoryDecayExperiment: React.FC = () => {
  const [retentionPercent, setRetentionPercent] = useState<number>(85); // 0% - 100%
  const [totalUpdates, setTotalUpdates] = useState<number>(10); // 1 - 15 updates
  const [selectedStep, setSelectedStep] = useState<number>(5);
  const [distractorType, setDistractorType] = useState<'neutral' | 'unrelated'>('neutral');

  const dim = 16;
  const targetFact: Fact = { key: 'France', value: 'Paris', category: 'Europe' };

  // Candidate values to decode against
  const candidatePool: Fact[] = useMemo(() => {
    return [targetFact, ...CANONICAL_FACTS.slice(1, 10)];
  }, [targetFact]);

  // Run dynamic experiment:
  // Step 0: Write France -> Paris
  // Steps 1..totalUpdates: Apply repeated updates with retention λ and neutral/distractor facts
  const simulationData = useMemo(() => {
    const λ = retentionPercent / 100;
    const writeStrength = 0.8;

    let M = Array.from({ length: dim }, () => Array(dim).fill(0));
    const kTarget = vector(targetFact.key, dim);
    const vTarget = vector(targetFact.value, dim);

    // Initial write at t=0
    for (let i = 0; i < dim; i++) {
      for (let j = 0; j < dim; j++) {
        M[i][j] += writeStrength * kTarget[i] * vTarget[j];
      }
    }

    const stepsHistory: {
      step: number;
      action: string;
      matrix: number[][];
      prediction: string;
      confidence: number;
      isCorrect: boolean;
      cosineRaw: number;
    }[] = [];

    // Helper to evaluate query at current matrix
    const evaluate = (stepNum: number, actionName: string) => {
      const q = vector(targetFact.key, dim);
      const retrieved = Array(dim).fill(0);
      for (let j = 0; j < dim; j++) {
        for (let i = 0; i < dim; i++) {
          retrieved[j] += q[i] * M[i][j];
        }
      }

      // Find top candidate
      let bestVal = 'UNKNOWN';
      let bestScore = -Infinity;
      for (const cand of candidatePool) {
        const cVec = vector(cand.value, dim);
        const score = cosine(retrieved, cVec);
        if (score > bestScore) {
          bestScore = score;
          bestVal = cand.value;
        }
      }

      const normalizedConfidence = Math.max(0, Math.min(1, (bestScore + 1) / 2));
      const correct = bestVal === targetFact.value && bestScore > 0.15;

      stepsHistory.push({
        step: stepNum,
        action: actionName,
        matrix: M.map((r) => [...r]),
        prediction: correct ? bestVal : (bestScore > 0.05 ? bestVal : 'UNKNOWN'),
        confidence: normalizedConfidence,
        isCorrect: correct,
        cosineRaw: bestScore,
      });
    };

    // Record t=0
    evaluate(0, 'WRITE: France → Paris');

    // Simulate subsequent updates
    for (let s = 1; s <= totalUpdates; s++) {
      // Decay existing matrix by λ
      M = M.map((row) => row.map((x) => x * λ));

      // If unrelated distractors enabled, add slight orthogonal background noise
      if (distractorType === 'unrelated') {
        const noiseKey = CANONICAL_FACTS[3 + (s % 6)]?.key || `Item_${s}`;
        const noiseVal = CANONICAL_FACTS[3 + (s % 6)]?.value || `City_${s}`;
        const kn = vector(noiseKey, dim);
        const vn = vector(noiseVal, dim);
        for (let i = 0; i < dim; i++) {
          for (let j = 0; j < dim; j++) {
            M[i][j] += 0.3 * kn[i] * vn[j];
          }
        }
      }

      evaluate(s, `UPDATE ${s}: No new relevant facts`);
    }

    // Find the first step where memory becomes unreliable (confidence drops below 0.55 or prediction fails)
    const unreliableStep = stepsHistory.find(
      (h) => h.step > 0 && (!h.isCorrect || h.confidence < 0.55)
    )?.step;

    return {
      history: stepsHistory,
      unreliableStep: unreliableStep ?? null,
    };
  }, [retentionPercent, totalUpdates, distractorType, candidatePool, dim]);

  const currentStepData = simulationData.history[selectedStep] || simulationData.history[0];

  return (
    <div className="rounded-2xl border border-[#252A35] bg-[#0A0D15] p-5 sm:p-7 text-slate-100 shadow-2xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2536] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-0.5 rounded-md font-bold">
              EXPERIMENT: MEMORY DECAY & FORGETTING
            </span>
            <span className="text-xs font-mono uppercase tracking-wider text-amber-300 bg-amber-950/70 border border-amber-800/60 px-2.5 py-0.5 rounded-md font-bold">
              TOY COMPUTATION
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
            WHAT HAPPENS OVER REPEATED RECURRENT UPDATES?
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-2xl">
            Write <strong className="text-white">France → Paris</strong>, then execute repeated recurrent updates with no new relevant information. Control retention to observe how fast the associative state degrades.
          </p>
        </div>

        <button
          onClick={() => {
            setRetentionPercent(85);
            setTotalUpdates(10);
            setSelectedStep(5);
          }}
          className="px-3 py-1.5 rounded-lg bg-[#141A28] border border-[#232D42] text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1.5 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Control Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-[#0F1422] border border-[#1C2538]">
        {/* Retention Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400">RETENTION (λ):</span>
            <strong className="text-cyan-400 font-mono text-sm">{retentionPercent}%</strong>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={retentionPercent}
            onChange={(e) => setRetentionPercent(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>0% (Instant Loss)</span>
            <span>100% (Lossless)</span>
          </div>
        </div>

        {/* Update Steps */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400">NUMBER OF UPDATES:</span>
            <strong className="text-purple-400 font-mono text-sm">{totalUpdates} STEPS</strong>
          </div>
          <input
            type="range"
            min="3"
            max="15"
            step="1"
            value={totalUpdates}
            onChange={(e) => {
              const val = Number(e.target.value);
              setTotalUpdates(val);
              if (selectedStep > val) setSelectedStep(val);
            }}
            className="w-full accent-purple-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>3 Steps</span>
            <span>15 Steps</span>
          </div>
        </div>

        {/* Distractor Type */}
        <div className="space-y-2">
          <div className="text-xs font-mono text-slate-400">UPDATE DYNAMICS:</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setDistractorType('neutral')}
              className={`py-2 px-2.5 rounded-lg border text-xs font-mono transition ${
                distractorType === 'neutral'
                  ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 font-bold'
                  : 'bg-[#151C2C] border-[#222D42] text-slate-400 hover:text-white'
              }`}
            >
              Neutral Pass (λ·M)
            </button>
            <button
              onClick={() => setDistractorType('unrelated')}
              className={`py-2 px-2.5 rounded-lg border text-xs font-mono transition ${
                distractorType === 'unrelated'
                  ? 'bg-purple-950/60 border-purple-500 text-purple-200 font-bold'
                  : 'bg-[#151C2C] border-[#222D42] text-slate-400 hover:text-white'
              }`}
            >
              With Distractors
            </button>
          </div>
        </div>
      </div>

      {/* Plot: Number of Updates vs Retrieval Score */}
      <div className="p-4 rounded-xl bg-[#0C101A] border border-[#1E2638] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#182132] pb-2 text-xs font-mono">
          <span className="text-white font-bold flex items-center gap-2" title="This score is based on representation similarity and is not a calibrated probability.">
            <Activity className="w-4 h-4 text-cyan-400" />
            PLOT: NUMBER OF UPDATES VS. RETRIEVAL SCORE
          </span>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              Correct (Paris)
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              Degraded / Fail
            </span>
          </div>
        </div>

        {/* Graphical Bars Display */}
        <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-16 gap-1.5 items-end h-44 pt-4 px-2 bg-[#070912] rounded-lg border border-[#151C2C] relative">
          {/* Threshold Line at 55% */}
          <div
            className="absolute left-0 right-0 border-b border-dashed border-amber-500/40 pointer-events-none flex items-center justify-end pr-2"
            style={{ bottom: '55%' }}
          >
            <span className="text-[9px] font-mono text-amber-400/80 bg-[#070912] px-1 rounded">
              Reliability Threshold (55%)
            </span>
          </div>

          {simulationData.history.map((pt) => {
            const isSelected = selectedStep === pt.step;
            const isUnreliableMarker = simulationData.unreliableStep === pt.step;
            const heightPercent = Math.max(8, Math.round(pt.confidence * 100));

            return (
              <div
                key={pt.step}
                onClick={() => setSelectedStep(pt.step)}
                className="flex flex-col items-center h-full justify-end group cursor-pointer"
              >
                {/* Unreliable Marker Banner */}
                {isUnreliableMarker && (
                  <div className="mb-1 bg-rose-950 border border-rose-500 text-rose-300 text-[8px] font-mono font-bold px-1 py-0.5 rounded whitespace-nowrap z-10 animate-bounce">
                    UNRELIABLE
                  </div>
                )}

                <div
                  className={`w-full rounded-t transition-all ${
                    pt.isCorrect
                      ? isSelected
                        ? 'bg-cyan-400 shadow-md shadow-cyan-500/50'
                        : 'bg-cyan-600/70 hover:bg-cyan-500'
                      : isSelected
                      ? 'bg-rose-500 shadow-md shadow-rose-500/50'
                      : 'bg-rose-700/60 hover:bg-rose-600'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />

                <span
                  className={`text-[9px] font-mono mt-1 ${
                    isSelected ? 'text-white font-bold' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                >
                  t={pt.step}
                </span>
              </div>
            );
          })}
        </div>

        {/* Dynamic Vertical Marker Explanation */}
        {simulationData.unreliableStep !== null ? (
          <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-xs font-mono text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>
              <strong>MEMORY BECOMES UNRELIABLE AT STEP {simulationData.unreliableStep}:</strong>{' '}
              Retrieval score dropped below recognition threshold due to repeated retention attenuation (λ ={' '}
              {retentionPercent}%).
            </span>
          </div>
        ) : (
          <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs font-mono text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              <strong>MEMORY REMAINS RELIABLE:</strong> At λ = {retentionPercent}%, Paris was successfully retrieved across all {totalUpdates} updates.
            </span>
          </div>
        )}
      </div>

      {/* Selected Step Inspector & Actual State Heatmap */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-xl bg-[#090D18] border border-[#1B2336]">
        {/* Step Telemetry */}
        <div className="space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-[#182134] pb-2">
            <span className="text-slate-400">INSPECTED STEP:</span>
            <strong className="text-white text-sm">Step t = {currentStepData.step}</strong>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Action:</span>
              <span className="text-cyan-300">{currentStepData.action}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Query:</span>
              <span className="text-white font-bold">"France"</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Ground Truth:</span>
              <span className="text-white">Paris</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Predicted Answer:</span>
              <span
                className={`font-bold ${
                  currentStepData.isCorrect ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {currentStepData.prediction}
              </span>
            </div>
            <div className="flex justify-between" title="This score is based on representation similarity and is not a calibrated probability.">
              <span className="text-slate-400">Retrieval Score:</span>
              <strong className="text-white">
                {(currentStepData.confidence * 100).toFixed(1)}% (Cosine: {currentStepData.cosineRaw.toFixed(2)})
              </strong>
            </div>
          </div>
        </div>

        {/* Live Matrix Heatmap after selected step */}
        <div className="space-y-2 font-mono text-xs">
          <div className="flex justify-between items-center text-slate-400">
            <span>ACTUAL STATE MATRIX M_t ({dim}x{dim}):</span>
            <span className="text-[10px] text-purple-300">Live In-Memory Tensor</span>
          </div>

          <div className="grid grid-cols-16 gap-[1.5px] p-2 bg-[#05070D] rounded-lg border border-[#151C2C]">
            {currentStepData.matrix.flatMap((row, rIdx) =>
              row.map((val, cIdx) => {
                const absVal = Math.min(Math.abs(val) * 1.5, 1);
                const isPos = val >= 0;
                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    title={`M[${rIdx}, ${cIdx}] = ${val.toFixed(3)}`}
                    className="w-full h-2.5 rounded-[1px] transition-colors"
                    style={{
                      backgroundColor: isPos
                        ? `rgba(34, 211, 238, ${0.1 + absVal * 0.9})`
                        : `rgba(244, 63, 94, ${0.1 + absVal * 0.9})`,
                    }}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Explanatory Scientific Guardrail */}
      <div className="p-3.5 rounded-lg bg-[#0C101C] border border-[#1C2538] text-[11px] text-slate-400 font-sans leading-relaxed">
        <strong className="text-slate-200">Scientific Clarification:</strong> In this educational model, repeated state updates with retention below 1 gradually reduce the influence of earlier information. Do not equate this toy directly with biological memory decay or claim a universal forgetting curve.
      </div>
    </div>
  );
};

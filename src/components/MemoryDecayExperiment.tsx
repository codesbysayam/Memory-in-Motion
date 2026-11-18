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
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7 text-[var(--text-primary)] shadow-xs space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-sans text-[var(--accent-blue-text)] bg-[var(--accent-blue)] border border-[var(--border)] px-2.5 py-0.5 rounded-md font-semibold">
              Experiment: memory decay & retention
            </span>
            <span className="text-xs font-sans text-[var(--text-secondary)] bg-[var(--surface-soft)] border border-[var(--border)] px-2.5 py-0.5 rounded-md font-semibold">
              Educational toy
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[var(--text-primary)] tracking-tight">
            What happens over repeated recurrent updates?
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans max-w-2xl">
            Write <strong className="text-[var(--text-primary)]">France → Paris</strong>, then execute repeated recurrent updates with no new relevant information. Control retention to observe how fast the associative state degrades.
          </p>
        </div>

        <button
          onClick={() => {
            setRetentionPercent(85);
            setTotalUpdates(10);
            setSelectedStep(5);
          }}
          className="px-3 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs font-sans text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)] flex items-center gap-1.5 transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset defaults</span>
        </button>
      </div>

      {/* Control Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)]">
        {/* Retention Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-sans">
            <span className="text-[var(--text-secondary)]">Retention (λ):</span>
            <strong className="text-[var(--accent-blue-text)] font-mono text-sm">{retentionPercent}%</strong>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={retentionPercent}
            onChange={(e) => setRetentionPercent(Number(e.target.value))}
            className="w-full accent-[var(--accent-blue-text)] cursor-pointer h-1.5 bg-[var(--border)] rounded-lg"
          />
          <div className="flex justify-between text-xs font-sans text-[var(--text-muted)]">
            <span>0% (Instant loss)</span>
            <span>100% (Lossless)</span>
          </div>
        </div>

        {/* Update Steps */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-sans">
            <span className="text-[var(--text-secondary)]">Number of updates:</span>
            <strong className="text-[var(--text-primary)] font-mono text-sm">{totalUpdates} steps</strong>
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
            className="w-full accent-[var(--accent-blue-text)] cursor-pointer h-1.5 bg-[var(--border)] rounded-lg"
          />
          <div className="flex justify-between text-xs font-sans text-[var(--text-muted)]">
            <span>3 steps</span>
            <span>15 steps</span>
          </div>
        </div>

        {/* Distractor Type */}
        <div className="space-y-2">
          <div className="text-xs font-sans text-[var(--text-secondary)]">Update dynamics:</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setDistractorType('neutral')}
              className={`py-2 px-2.5 rounded-lg border text-xs font-sans transition cursor-pointer ${
                distractorType === 'neutral'
                  ? 'bg-[var(--accent-blue)] border-[var(--border)] text-[var(--accent-blue-text)] font-semibold'
                  : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)]'
              }`}
            >
              Neutral pass (λ·M)
            </button>
            <button
              onClick={() => setDistractorType('unrelated')}
              className={`py-2 px-2.5 rounded-lg border text-xs font-sans transition cursor-pointer ${
                distractorType === 'unrelated'
                  ? 'bg-[var(--accent-blue)] border-[var(--border)] text-[var(--accent-blue-text)] font-semibold'
                  : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)]'
              }`}
            >
              With distractors
            </button>
          </div>
        </div>
      </div>

      {/* Plot: Number of Updates vs Retrieval Score */}
      <div className="p-4 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-2 text-xs font-sans">
          <span className="text-[var(--text-primary)] font-semibold flex items-center gap-2" title="This score is based on representation similarity and is not a calibrated probability.">
            <Activity className="w-4 h-4 text-[var(--accent-blue-text)]" />
            Plot: number of updates vs. retrieval score
          </span>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-[var(--accent-green-text)]">
              <span className="w-2.5 h-2.5 rounded-[2px] bg-[var(--accent-green-text)]" />
              Correct (Paris)
            </span>
            <span className="flex items-center gap-1.5 text-[var(--accent-yellow-text)]">
              <span className="w-2.5 h-2.5 rounded-[2px] bg-[var(--accent-yellow-text)]" />
              Degraded / fail
            </span>
          </div>
        </div>

        {/* Graphical Bars Display */}
        <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-16 gap-1.5 items-end h-44 pt-4 px-2 bg-[var(--surface)] rounded-lg border border-[var(--border)] relative">
          {/* Threshold Line at 55% */}
          <div
            className="absolute left-0 right-0 border-b border-dashed border-[var(--accent-yellow-text)]/60 pointer-events-none flex items-center justify-end pr-2"
            style={{ bottom: '55%' }}
          >
            <span className="text-xs font-sans text-[var(--accent-yellow-text)] bg-[var(--surface)] px-1 rounded font-medium">
              Reliability threshold (55%)
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
                  <div className="mb-1 bg-[var(--accent-pink)] border border-[var(--border)] text-[var(--accent-pink-text)] text-[10px] font-sans font-semibold px-1 py-0.5 rounded whitespace-nowrap z-10">
                    Unreliable
                  </div>
                )}

                <div
                  className={`w-full rounded-t transition-all ${
                    pt.isCorrect
                      ? isSelected
                        ? 'bg-[var(--accent-green-text)] shadow-xs'
                        : 'bg-[var(--accent-green)] hover:opacity-80'
                      : isSelected
                      ? 'bg-[var(--accent-pink-text)] shadow-xs'
                      : 'bg-[var(--accent-pink)] hover:opacity-80'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />

                <span
                  className={`text-xs font-mono mt-1 ${
                    isSelected ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'
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
          <div className="p-2.5 rounded-lg bg-[var(--accent-pink)] border border-[var(--border)] text-xs font-sans text-[var(--accent-pink-text)] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[var(--accent-pink-text)] flex-shrink-0" />
            <span>
              <strong>Memory becomes unreliable at step {simulationData.unreliableStep}:</strong>{' '}
              Retrieval score dropped below recognition threshold due to repeated retention attenuation (λ ={' '}
              {retentionPercent}%).
            </span>
          </div>
        ) : (
          <div className="p-2.5 rounded-lg bg-[var(--accent-green)] border border-[var(--border)] text-xs font-sans text-[var(--accent-green-text)] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[var(--accent-green-text)] flex-shrink-0" />
            <span>
              <strong>Memory remains reliable:</strong> At λ = {retentionPercent}%, Paris was successfully retrieved across all {totalUpdates} updates.
            </span>
          </div>
        )}
      </div>

      {/* Selected Step Inspector & Actual State Heatmap */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)]">
        {/* Step Telemetry */}
        <div className="p-3.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] space-y-3 font-sans text-xs">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
            <span className="text-[var(--text-secondary)]">Inspected step:</span>
            <strong className="text-[var(--text-primary)] font-mono text-sm">Step t = {currentStepData.step}</strong>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Action:</span>
              <span className="text-[var(--accent-blue-text)] font-medium">{currentStepData.action}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Query cue:</span>
              <span className="text-[var(--text-primary)] font-serif font-bold">&quot;France&quot;</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Ground truth:</span>
              <span className="text-[var(--text-primary)] font-serif font-semibold">Paris</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Predicted answer:</span>
              <span
                className={`font-serif font-bold ${
                  currentStepData.isCorrect ? 'text-[var(--accent-green-text)]' : 'text-[var(--accent-pink-text)]'
                }`}
              >
                {currentStepData.prediction}
              </span>
            </div>
            <div className="flex justify-between" title="Cosine similarity between representation and candidate. This is not a calibrated probability.">
              <span className="text-[var(--text-secondary)]">Retrieval score:</span>
              <strong className="text-[var(--text-primary)] font-mono">
                {(currentStepData.confidence * 100).toFixed(1)}% (Cosine: {currentStepData.cosineRaw.toFixed(2)})
              </strong>
            </div>
          </div>
        </div>

        {/* Live Matrix Heatmap after selected step */}
        <div className="p-3.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] space-y-2 text-xs">
          <div className="flex justify-between items-center text-[var(--text-secondary)] font-sans">
            <span className="font-semibold text-[var(--text-primary)]">State matrix M_t ({dim}×{dim}):</span>
            <span className="text-[var(--accent-blue-text)]">Live in-memory state</span>
          </div>

          <div className="grid grid-cols-16 gap-[1.5px] p-2 bg-[var(--color-matrix-bg)] rounded-lg border border-[var(--color-matrix-border)]">
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
                        ? `rgba(76, 154, 255, ${0.18 + absVal * 0.82})`
                        : `rgba(229, 98, 90, ${0.18 + absVal * 0.82})`,
                    }}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Explanatory Scientific Guardrail */}
      <div className="p-3.5 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)] text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
        <strong className="text-[var(--text-primary)]">Educational toy:</strong> Educational toy — not the official BDH implementation. In this educational model, repeated state updates with retention below 1 gradually reduce the influence of earlier information.
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  Clock,
  TrendingDown,
  HelpCircle,
} from 'lucide-react';
import { Fact, CANONICAL_FACTS, createAssociativeMemory } from '../models/associativeMemory';

export const StatePersistenceExperiment: React.FC = () => {
  const [interveningCount, setInterveningCount] = useState<number>(6);
  const [retention, setRetention] = useState<number>(0.95);
  const [dimension, setDimension] = useState<number>(16);
  const [activeStepInspection, setActiveStepInspection] = useState<number>(0);

  const targetFact: Fact = { key: 'Japan', value: 'Tokyo', category: 'Asia' };

  // Distractor facts to inject sequentially
  const distractorPool: Fact[] = useMemo(
    () => CANONICAL_FACTS.filter((f) => f.key !== 'Japan'),
    []
  );

  // Compute live step-by-step history:
  // Step 0: Write Japan -> Tokyo
  // Step 1..N: Write distractor i
  const simulationData = useMemo(() => {
    const memory = createAssociativeMemory([targetFact, ...distractorPool], dimension, retention, 0.8);

    // Initial write
    memory.writeFact(targetFact);
    const q0 = memory.query('Japan');
    const sorted0 = [...q0.candidates].sort((a, b) => b.score - a.score);
    const margin0 = sorted0[0] && sorted0[1] ? Math.max(0, sorted0[0].score - sorted0[1].score) : sorted0[0]?.score ?? 0;

    const steps = [
      {
        step: 0,
        event: 'Target Write: Japan → Tokyo',
        interveningAdded: 0,
        prediction: q0.prediction,
        score: q0.confidence,
        margin: margin0,
        isCorrect: q0.prediction === 'Tokyo',
        matrix: memory.getMatrix(),
      },
    ];

    // Intervening writes
    for (let i = 0; i < interveningCount; i++) {
      const dFact = distractorPool[i % distractorPool.length];
      memory.writeFact(dFact);

      const q = memory.query('Japan');
      const sorted = [...q.candidates].sort((a, b) => b.score - a.score);
      const m = sorted[0] && sorted[1] ? Math.max(0, sorted[0].score - sorted[1].score) : sorted[0]?.score ?? 0;

      steps.push({
        step: i + 1,
        event: `Intervening Fact ${i + 1}: ${dFact.key} → ${dFact.value}`,
        interveningAdded: i + 1,
        prediction: q.prediction,
        score: q.confidence,
        margin: m,
        isCorrect: q.prediction === 'Tokyo',
        matrix: memory.getMatrix(),
      });
    }

    return steps;
  }, [dimension, retention, interveningCount, targetFact, distractorPool]);

  // Current inspected step
  const currentInspection = simulationData[Math.min(activeStepInspection, simulationData.length - 1)] || simulationData[0];

  return (
    <div className="diagram-frame p-5 sm:p-6 text-[var(--text-primary)] space-y-5 font-mono tabular-nums">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--accent-blue-text)]" />
            <h4 className="text-sm font-bold text-[var(--text-primary)]">
              State persistence experiment · information retention under intervening updates
            </h4>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-sans">
            This experiment asks whether information written earlier remains recoverable after later state updates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-0.5 rounded-md bg-[var(--accent-blue)] border border-[var(--border)] text-[var(--accent-blue-text)] font-semibold">
            Live computation
          </span>
          <span className="text-xs px-2 py-0.5 rounded-md bg-[var(--surface-soft)] border border-[var(--border)] text-[var(--text-muted)]">
            d={dimension}
          </span>
        </div>
      </div>

      {/* Controls Deck */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* Intervening updates slider */}
        <div className="p-3.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-1.5">
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)] font-semibold">Intervening updates:</span>
            <strong className="text-[var(--accent-blue-text)]">{interveningCount} facts</strong>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={interveningCount}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setInterveningCount(val);
              if (activeStepInspection > val) setActiveStepInspection(val);
            }}
            className="w-full accent-[var(--color-accent)] cursor-pointer"
          />
          <span className="text-xs text-[var(--text-muted)] font-sans block">
            Number of subsequent writes applied over the target fact.
          </span>
        </div>

        {/* Retention factor */}
        <div className="p-3.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-1.5">
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)] font-semibold">Retention (λ):</span>
            <strong className="text-[var(--accent-yellow-text)]">{(retention * 100).toFixed(0)}%</strong>
          </div>
          <input
            type="range"
            min="0.4"
            max="1.0"
            step="0.05"
            value={retention}
            onChange={(e) => setRetention(parseFloat(e.target.value))}
            className="w-full accent-[var(--color-warning)] cursor-pointer"
          />
          <span className="text-xs text-[var(--text-muted)] font-sans block">
            Memory decay rate per update step.
          </span>
        </div>

        {/* Dimension */}
        <div className="p-3.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-1.5">
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)] font-semibold text-xs">Dimension:</span>
            <strong className="text-[var(--text-primary)] text-xs">d={dimension}</strong>
          </div>
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {[8, 16, 32].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDimension(d)}
                className={`dimension-delta ${dimension === d ? 'active' : ''}`}
              >
                d={d}
              </button>
            ))}
          </div>
          <span className="text-xs text-[var(--text-muted)] font-sans block pt-1">
            Capacity scaling in vector space.
          </span>
        </div>
      </div>

      {/* Persistence Trajectory Chart & Table */}
      <div className="rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] p-4 space-y-3 text-xs">
        <div className="flex flex-wrap justify-between items-center gap-2 border-b border-[var(--border)] pb-2">
          <span className="font-semibold text-[var(--text-primary)] text-xs flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5 text-[var(--accent-blue-text)]" />
            Measured retrieval score trajectory across time
          </span>
          <span className="text-xs text-[var(--text-muted)]">Query: &ldquo;Japan&rdquo; → &ldquo;Tokyo&rdquo;</span>
        </div>

        {/* Horizontal Segmented Timeline */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-sans">
            <span className="font-semibold text-[var(--text-primary)]">Select timestep snapshot:</span>
            <span className="text-xs font-mono">Active: t{currentInspection.step}</span>
          </div>
          <div className="timeline overflow-x-auto">
            {simulationData.map((s, idx) => {
              const isInspected = idx === activeStepInspection;
              return (
                <button
                  key={`step-btn-${s.step}`}
                  type="button"
                  onClick={() => setActiveStepInspection(idx)}
                  className={`timeline-step ${isInspected ? 'active' : ''}`}
                  title={`Select snapshot t=${s.step}: ${(s.score * 100).toFixed(0)}% score`}
                >
                  t{s.step}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bar Timeline Visual */}
        <div className="overflow-x-auto py-1">
          <div className="flex gap-2 items-end min-w-[500px] h-28 pt-4 px-3 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
            {simulationData.map((s, idx) => {
              const scorePct = Math.max(8, Math.min(100, Math.round(s.score * 100)));
              const isInspected = idx === activeStepInspection;

              return (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => setActiveStepInspection(idx)}
                  className={`flex-1 flex flex-col items-center justify-end h-full cursor-pointer p-1 rounded-md transition-all ${
                    isInspected
                      ? 'bg-[var(--accent-blue)] ring-1 ring-[var(--color-accent)]'
                      : 'hover:bg-[var(--surface-soft)]'
                  }`}
                  title={`Step ${s.step}: Score ${(s.score * 100).toFixed(1)}%, Margin: ${s.margin.toFixed(3)}`}
                >
                  <span className="text-xs font-mono text-[var(--text-secondary)] mb-1 font-bold">
                    {(s.score * 100).toFixed(0)}%
                  </span>
                  <div
                    className={`w-full rounded-t transition-all ${
                      s.isCorrect ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-danger)]'
                    }`}
                    style={{ height: `${scorePct}%` }}
                  />
                  <span className={`text-xs font-mono mt-1 font-semibold ${isInspected ? 'text-[var(--accent-blue-text)] font-bold' : 'text-[var(--text-muted)]'}`}>
                    t{s.step}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Inspected Step Telemetry */}
        <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[var(--text-muted)] text-xs block font-semibold">
              Inspected timestep t={currentInspection.step}:
            </span>
            <div className="text-sm font-bold text-[var(--text-primary)] mt-0.5">
              {currentInspection.event}
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-[var(--text-muted)] text-xs block">Retrieval score:</span>
              <strong className={currentInspection.isCorrect ? 'text-[var(--accent-blue-text)]' : 'text-[var(--accent-pink-text)]'}>
                {(currentInspection.score * 100).toFixed(1)}%
              </strong>
            </div>

            <div>
              <span className="text-[var(--text-muted)] text-xs block">Top-1 margin:</span>
              <strong className="text-[var(--accent-yellow-text)]">{currentInspection.margin.toFixed(3)}</strong>
            </div>

            <div>
              <span className="text-[var(--text-muted)] text-xs block">Prediction:</span>
              <strong className={currentInspection.isCorrect ? 'text-[var(--accent-green-text)]' : 'text-[var(--accent-pink-text)]'}>
                &ldquo;{currentInspection.prediction}&rdquo;
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Epistemic note */}
      <div className="research-callout text-xs text-[var(--text-secondary)] font-sans flex items-start gap-2">
        <HelpCircle className="w-4 h-4 text-[var(--accent-blue-text)] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[var(--text-primary)]">Scientific principle:</strong> This experiment asks whether information written earlier remains recoverable after later state updates. Do not call this result a universal forgetting curve; it is a direct measurement of linear associative decay under this toy&apos;s specific parameters.
        </div>
      </div>
    </div>
  );
};

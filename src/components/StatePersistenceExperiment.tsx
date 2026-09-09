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
    <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-5 sm:p-6 text-[#151515] space-y-5 font-mono shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EAE6DF] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#167C80]" />
            <h4 className="text-sm font-bold text-[#151515] uppercase tracking-wider">
              State Persistence Experiment · Information Retention Under Intervening Updates
            </h4>
          </div>
          <p className="text-xs text-[#716F68] mt-1 font-sans">
            This experiment asks whether information written earlier remains recoverable after later state updates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2.5 py-0.5 rounded bg-[#EDF7F7] border border-[#CFE8E8] text-[#167C80] font-bold">
            LIVE COMPUTATION
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#EAE6DF] text-[#716F68]">
            D={dimension}
          </span>
        </div>
      </div>

      {/* Controls Deck */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* Intervening updates slider */}
        <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-1.5">
          <div className="flex justify-between">
            <span className="text-[#716F68] font-bold">INTERVENING UPDATES:</span>
            <strong className="text-[#167C80]">{interveningCount} facts</strong>
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
            className="w-full accent-[#167C80] cursor-pointer"
          />
          <span className="text-[10px] text-[#716F68] font-sans block">
            Number of subsequent writes applied over the target fact.
          </span>
        </div>

        {/* Retention factor */}
        <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-1.5">
          <div className="flex justify-between">
            <span className="text-[#716F68] font-bold">RETENTION (λ):</span>
            <strong className="text-[#A46622]">{(retention * 100).toFixed(0)}%</strong>
          </div>
          <input
            type="range"
            min="0.4"
            max="1.0"
            step="0.05"
            value={retention}
            onChange={(e) => setRetention(parseFloat(e.target.value))}
            className="w-full accent-[#A46622] cursor-pointer"
          />
          <span className="text-[10px] text-[#716F68] font-sans block">
            Memory decay rate per update step.
          </span>
        </div>

        {/* Dimension */}
        <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-1.5">
          <div className="flex justify-between">
            <span className="text-[#716F68] font-bold">DIMENSION:</span>
            <strong className="text-[#151515]">D={dimension}</strong>
          </div>
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {[8, 16, 32].map((d) => (
              <button
                key={d}
                onClick={() => setDimension(d)}
                className={`py-1 rounded-lg text-[11px] border font-bold transition cursor-pointer ${
                  dimension === d
                    ? 'bg-[#F3EFFF] border-[#6842C2] text-[#6842C2]'
                    : 'bg-[#FFFFFF] border-[#E5E0D8] text-[#716F68] hover:text-[#151515]'
                }`}
              >
                D={d}
              </button>
            ))}
          </div>
          <span className="text-[10px] text-[#716F68] font-sans block">
            Capacity scaling in vector space.
          </span>
        </div>
      </div>

      {/* Persistence Trajectory Chart & Table */}
      <div className="rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] p-4 space-y-3 text-xs">
        <div className="flex justify-between items-center border-b border-[#EAE6DF] pb-2">
          <span className="font-bold text-[#151515] uppercase text-[11px] flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5 text-[#167C80]" />
            MEASURED RETRIEVAL SCORE TRAJECTORY ACROSS TIME
          </span>
          <span className="text-[10px] text-[#716F68]">Query: &ldquo;Japan&rdquo; → &ldquo;Tokyo&rdquo;</span>
        </div>

        {/* Bar Timeline Visual */}
        <div className="overflow-x-auto py-2">
          <div className="flex gap-2 items-end min-w-[500px] h-32 pt-4 px-2 bg-[#FFFFFF] rounded-lg border border-[#E5E0D8]">
            {simulationData.map((s, idx) => {
              const scorePct = Math.max(8, Math.min(100, Math.round(s.score * 100)));
              const isInspected = idx === activeStepInspection;

              return (
                <div
                  key={s.step}
                  onClick={() => setActiveStepInspection(idx)}
                  className={`flex-1 flex flex-col items-center justify-end h-full cursor-pointer p-1 rounded-lg transition-all ${
                    isInspected
                      ? 'bg-[#F3EFFF] ring-2 ring-[#6842C2]'
                      : 'hover:bg-[#FAF8F5]'
                  }`}
                  title={`Step ${s.step}: Score ${(s.score * 100).toFixed(1)}%, Margin: ${s.margin.toFixed(3)}`}
                >
                  <span className="text-[9px] font-mono text-[#716F68] mb-1 font-bold">
                    {(s.score * 100).toFixed(0)}%
                  </span>
                  <div
                    className={`w-full rounded-t transition-all ${
                      s.isCorrect ? 'bg-[#167C80]' : 'bg-[#B64235]'
                    }`}
                    style={{ height: `${scorePct}%` }}
                  />
                  <span className="text-[8px] font-mono text-[#716F68] mt-1 font-semibold">
                    t={s.step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inspected Step Telemetry */}
        <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E0D8] text-xs flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[#716F68] text-[10px] uppercase block font-bold">
              INSPECTED TIMESTEP t={currentInspection.step}:
            </span>
            <div className="text-sm font-bold text-[#151515] mt-0.5">
              {currentInspection.event}
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-[#716F68] text-[10px] block">RETRIEVAL SCORE:</span>
              <strong className={currentInspection.isCorrect ? 'text-[#167C80]' : 'text-[#B64235]'}>
                {(currentInspection.score * 100).toFixed(1)}%
              </strong>
            </div>

            <div>
              <span className="text-[#716F68] text-[10px] block">TOP-1 MARGIN:</span>
              <strong className="text-[#A46622]">{currentInspection.margin.toFixed(3)}</strong>
            </div>

            <div>
              <span className="text-[#716F68] text-[10px] block">PREDICTION:</span>
              <strong className={currentInspection.isCorrect ? 'text-[#247A4B]' : 'text-[#B64235]'}>
                &ldquo;{currentInspection.prediction}&rdquo;
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Epistemic note */}
      <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs text-[#52504A] font-sans flex items-start gap-2">
        <HelpCircle className="w-4 h-4 text-[#167C80] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#151515]">Scientific Principle:</strong> This experiment asks whether information written earlier remains recoverable after later state updates. Do not call this result a universal forgetting curve; it is a direct measurement of linear associative decay under this toy&apos;s specific parameters.
        </div>
      </div>
    </div>
  );
};

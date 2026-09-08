import React, { useState, useMemo } from 'react';
import {
  Clock,
  ArrowRight,
  TrendingDown,
  Activity,
  HelpCircle,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertCircle,
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
    <div className="rounded-2xl border border-[#252A35] bg-[#0A0E18] p-5 sm:p-6 text-slate-100 space-y-5 font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E2536] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              State Persistence Experiment · Information Retention Under Intervening Updates
            </h4>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            This experiment asks whether information written earlier remains recoverable after later state updates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-bold">
            LIVE TOY COMPUTATION
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-slate-400">
            D={dimension}
          </span>
        </div>
      </div>

      {/* Controls Deck */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* Intervening updates slider */}
        <div className="p-3 rounded-xl bg-[#111726] border border-[#202C44] space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold">INTERVENING UPDATES:</span>
            <strong className="text-cyan-300">{interveningCount} facts</strong>
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
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <span className="text-[10px] text-slate-500 font-sans block">
            Number of subsequent writes applied over the target fact.
          </span>
        </div>

        {/* Retention factor */}
        <div className="p-3 rounded-xl bg-[#111726] border border-[#202C44] space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold">RETENTION (λ):</span>
            <strong className="text-amber-300">{(retention * 100).toFixed(0)}%</strong>
          </div>
          <input
            type="range"
            min="0.4"
            max="1.0"
            step="0.05"
            value={retention}
            onChange={(e) => setRetention(parseFloat(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
          <span className="text-[10px] text-slate-500 font-sans block">
            Memory decay rate per update step.
          </span>
        </div>

        {/* Dimension */}
        <div className="p-3 rounded-xl bg-[#111726] border border-[#202C44] space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold">DIMENSION:</span>
            <strong className="text-white">D={dimension}</strong>
          </div>
          <div className="grid grid-cols-3 gap-1 pt-1">
            {[8, 16, 32].map((d) => (
              <button
                key={d}
                onClick={() => setDimension(d)}
                className={`py-1 rounded text-[11px] border font-bold transition ${
                  dimension === d
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-200'
                    : 'bg-[#151C2C] border-[#222E46] text-slate-400 hover:text-white'
                }`}
              >
                D={d}
              </button>
            ))}
          </div>
          <span className="text-[10px] text-slate-500 font-sans block">
            Capacity scaling in vector space.
          </span>
        </div>
      </div>

      {/* Persistence Trajectory Chart & Table */}
      <div className="rounded-xl bg-[#0D121F] border border-[#1E273A] p-4 space-y-3 text-xs">
        <div className="flex justify-between items-center border-b border-[#1C2538] pb-2">
          <span className="font-bold text-slate-300 uppercase text-[11px] flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5 text-cyan-400" />
            MEASURED RETRIEVAL SCORE TRAJECTORY ACROSS TIME
          </span>
          <span className="text-[10px] text-slate-500">Query: &ldquo;Japan&rdquo; → &ldquo;Tokyo&rdquo;</span>
        </div>

        {/* Bar Timeline Visual */}
        <div className="overflow-x-auto py-2">
          <div className="flex gap-2 items-end min-w-[500px] h-32 pt-4 px-2 bg-[#080B14] rounded-lg border border-[#172032]">
            {simulationData.map((s, idx) => {
              const scorePct = Math.max(8, Math.min(100, Math.round(s.score * 100)));
              const isInspected = idx === activeStepInspection;

              return (
                <div
                  key={s.step}
                  onClick={() => setActiveStepInspection(idx)}
                  className={`flex-1 flex flex-col items-center justify-end h-full cursor-pointer p-1 rounded transition-all ${
                    isInspected
                      ? 'bg-cyan-950/60 ring-1 ring-cyan-400'
                      : 'hover:bg-[#121828]'
                  }`}
                  title={`Step ${s.step}: Score ${(s.score * 100).toFixed(1)}%, Margin: ${s.margin.toFixed(3)}`}
                >
                  <span className="text-[9px] font-mono text-slate-300 mb-1">
                    {(s.score * 100).toFixed(0)}%
                  </span>
                  <div
                    className={`w-full rounded-t transition-all ${
                      s.isCorrect ? 'bg-cyan-400' : 'bg-rose-500'
                    }`}
                    style={{ height: `${scorePct}%` }}
                  />
                  <span className="text-[8px] font-mono text-slate-500 mt-1">
                    t={s.step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inspected Step Telemetry */}
        <div className="p-3 rounded-lg bg-[#111726] border border-[#202B40] text-xs flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-slate-400 text-[10px] uppercase block font-bold">
              INSPECTED TIMESTEP t={currentInspection.step}:
            </span>
            <div className="text-sm font-bold text-white mt-0.5">
              {currentInspection.event}
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 text-[10px] block">RETRIEVAL SCORE:</span>
              <strong className={currentInspection.isCorrect ? 'text-cyan-300' : 'text-rose-400'}>
                {(currentInspection.score * 100).toFixed(1)}%
              </strong>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] block">TOP-1 MARGIN:</span>
              <strong className="text-amber-300">{currentInspection.margin.toFixed(3)}</strong>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] block">PREDICTION:</span>
              <strong className={currentInspection.isCorrect ? 'text-emerald-300' : 'text-rose-400'}>
                &ldquo;{currentInspection.prediction}&rdquo;
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Epistemic note */}
      <div className="p-3 rounded-xl bg-[#080B14] border border-[#182132] text-xs text-slate-300 font-sans flex items-start gap-2">
        <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong>Scientific Principle:</strong> This experiment asks whether information written earlier remains recoverable after later state updates. Do not call this result a universal forgetting curve; it is a direct measurement of linear associative decay under this toy&apos;s specific parameters.
        </div>
      </div>
    </div>
  );
};

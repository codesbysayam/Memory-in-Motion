import React, { useState, useMemo } from 'react';
import { ArrowRight, ArrowLeftRight, CheckCircle2, AlertTriangle, HelpCircle, Layers, Sliders } from 'lucide-react';
import { Fact, CANONICAL_FACTS, createAssociativeMemory } from '../models/associativeMemory';

export const ContextOrderExperiment: React.FC = () => {
  const [dimension, setDimension] = useState<number>(16);
  const [retention, setRetention] = useState<number>(0.95);
  const [writeStrength, setWriteStrength] = useState<number>(0.8);
  const [customQuery, setCustomQuery] = useState<string>('Japan');

  // Base set of 4 facts
  const baseFacts: Fact[] = useMemo(() => [
    { key: 'France', value: 'Paris', category: 'Europe' },
    { key: 'Japan', value: 'Tokyo', category: 'Asia' },
    { key: 'Brazil', value: 'Brasília', category: 'South America' },
    { key: 'Italy', value: 'Rome', category: 'Europe' },
  ], []);

  // Sequence A: Standard Order
  const sequenceA = useMemo(() => [...baseFacts], [baseFacts]);

  // Sequence B: Reversed Order
  const sequenceB = useMemo(() => [...baseFacts].reverse(), [baseFacts]);

  // Run both sequences through the exact deterministic engine
  const evalResults = useMemo(() => {
    // Sequence A
    const memA = createAssociativeMemory(sequenceA, dimension, retention, writeStrength);
    sequenceA.forEach((f) => memA.writeFact(f));
    const matA = memA.getMatrix();

    // Sequence B
    const memB = createAssociativeMemory(sequenceB, dimension, retention, writeStrength);
    sequenceB.forEach((f) => memB.writeFact(f));
    const matB = memB.getMatrix();

    // Test all queries
    let correctCountA = 0;
    let correctCountB = 0;
    let sumScoreA = 0;
    let sumScoreB = 0;

    const queryBreakdown = baseFacts.map((fact) => {
      const qA = memA.query(fact.key);
      const qB = memB.query(fact.key);

      const isCorrA = qA.prediction === fact.value;
      const isCorrB = qB.prediction === fact.value;

      if (isCorrA) correctCountA++;
      if (isCorrB) correctCountB++;

      sumScoreA += qA.confidence;
      sumScoreB += qB.confidence;

      return {
        key: fact.key,
        groundTruth: fact.value,
        predA: qA.prediction,
        scoreA: qA.confidence,
        corrA: isCorrA,
        predB: qB.prediction,
        scoreB: qB.confidence,
        corrB: isCorrB,
      };
    });

    const meanScoreA = sumScoreA / baseFacts.length;
    const meanScoreB = sumScoreB / baseFacts.length;

    // Frobenius norm difference between final matrices
    let frobeniusSum = 0;
    for (let r = 0; r < dimension; r++) {
      for (let c = 0; c < dimension; c++) {
        const diff = (matA[r]?.[c] ?? 0) - (matB[r]?.[c] ?? 0);
        frobeniusSum += diff * diff;
      }
    }
    const matrixDiffNorm = Math.sqrt(frobeniusSum);

    return {
      queryBreakdown,
      accA: (correctCountA / baseFacts.length) * 100,
      accB: (correctCountB / baseFacts.length) * 100,
      meanScoreA,
      meanScoreB,
      matrixDiffNorm,
      hasDifference: Math.abs(meanScoreA - meanScoreB) > 0.001 || correctCountA !== correctCountB || matrixDiffNorm > 0.001,
    };
  }, [baseFacts, sequenceA, sequenceB, dimension, retention, writeStrength]);

  return (
    <div className="rounded-2xl border border-[#252A35] bg-[#0A0E18] p-5 sm:p-6 text-slate-100 space-y-5 font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E2536] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Context Order Experiment · Same Information, Different Order
            </h4>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Does the sequential presentation order of identical facts alter the final recurrent state and retrieval accuracy?
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-bold">
            CONTROLLED TOY EXPERIMENT
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-slate-400">
            D={dimension}
          </span>
        </div>
      </div>

      {/* Side-by-Side Order Representation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Sequence A */}
        <div className="p-4 rounded-xl bg-[#111726] border border-[#202C44] space-y-3">
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
            <span>SEQUENCE A (FORWARD ORDER)</span>
            <span className="text-cyan-400">{sequenceA.length} Facts</span>
          </div>

          <div className="space-y-1.5">
            {sequenceA.map((f, i) => (
              <div key={f.key} className="flex items-center justify-between p-2 rounded bg-[#0B0F19] border border-[#1A2234]">
                <span className="text-slate-500 font-mono text-[10px]">Step {i + 1}</span>
                <span className="font-bold text-white">{f.key}</span>
                <ArrowRight className="w-3 h-3 text-slate-600" />
                <span className="text-cyan-300 font-bold">{f.value}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#1C2538] flex justify-between text-xs">
            <span>Accuracy: <strong className="text-white">{evalResults.accA.toFixed(0)}%</strong></span>
            <span>Avg Retrieval Score: <strong className="text-cyan-300">{evalResults.meanScoreA.toFixed(3)}</strong></span>
          </div>
        </div>

        {/* Sequence B */}
        <div className="p-4 rounded-xl bg-[#111726] border border-[#202C44] space-y-3">
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
            <span>SEQUENCE B (REVERSED ORDER)</span>
            <span className="text-amber-400">{sequenceB.length} Facts</span>
          </div>

          <div className="space-y-1.5">
            {sequenceB.map((f, i) => (
              <div key={f.key} className="flex items-center justify-between p-2 rounded bg-[#0B0F19] border border-[#1A2234]">
                <span className="text-slate-500 font-mono text-[10px]">Step {i + 1}</span>
                <span className="font-bold text-white">{f.key}</span>
                <ArrowRight className="w-3 h-3 text-slate-600" />
                <span className="text-amber-300 font-bold">{f.value}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#1C2538] flex justify-between text-xs">
            <span>Accuracy: <strong className="text-white">{evalResults.accB.toFixed(0)}%</strong></span>
            <span>Avg Retrieval Score: <strong className="text-amber-300">{evalResults.meanScoreB.toFixed(3)}</strong></span>
          </div>
        </div>
      </div>

      {/* Query Breakdown Table */}
      <div className="rounded-xl bg-[#0D121F] border border-[#1E273A] p-4 space-y-3 text-xs">
        <span className="font-bold text-slate-300 uppercase text-[11px] block">
          QUERY-BY-QUERY COMPARISON
        </span>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1C2538] text-[10px] text-slate-400 uppercase">
                <th className="pb-2">PROBE KEY</th>
                <th className="pb-2">GROUND TRUTH</th>
                <th className="pb-2">ORDER A (PRED / SCORE)</th>
                <th className="pb-2">ORDER B (PRED / SCORE)</th>
                <th className="pb-2 text-right">EFFECT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#151C2C]">
              {evalResults.queryBreakdown.map((row) => (
                <tr key={row.key} className="hover:bg-[#121826]">
                  <td className="py-2 font-bold text-white">{row.key}</td>
                  <td className="py-2 text-slate-400">{row.groundTruth}</td>
                  <td className="py-2">
                    <span className={row.corrA ? 'text-emerald-400' : 'text-rose-400'}>
                      {row.predA} ({row.scoreA.toFixed(2)})
                    </span>
                  </td>
                  <td className="py-2">
                    <span className={row.corrB ? 'text-emerald-400' : 'text-rose-400'}>
                      {row.predB} ({row.scoreB.toFixed(2)})
                    </span>
                  </td>
                  <td className="py-2 text-right font-mono">
                    {Math.abs(row.scoreA - row.scoreB) < 0.01 ? (
                      <span className="text-slate-500 text-[10px]">Equivalent</span>
                    ) : row.scoreA > row.scoreB ? (
                      <span className="text-cyan-400 text-[10px]">A stronger (+{(row.scoreA - row.scoreB).toFixed(2)})</span>
                    ) : (
                      <span className="text-amber-400 text-[10px]">B stronger (+{(row.scoreB - row.scoreA).toFixed(2)})</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Measured Matrix Frobenius Difference */}
      <div className="p-3 rounded-lg bg-[#0E131F] border border-[#1C2538] flex flex-wrap items-center justify-between gap-2 text-xs">
        <div>
          <span className="text-slate-400">Final State Matrix L2 Difference: </span>
          <strong className="text-cyan-300 font-mono">||M_A - M_B||_F = {evalResults.matrixDiffNorm.toFixed(4)}</strong>
        </div>
        <div className="text-[11px] text-slate-400 font-sans">
          {evalResults.matrixDiffNorm > 0.001
            ? 'Because retention λ < 1.0, earlier updates decay exponentially more than later updates, breaking commutativity.'
            : 'Order did not affect retrieval under this configuration.'}
        </div>
      </div>

      {/* Explanation Box */}
      <div className="p-3 rounded-xl bg-[#080B14] border border-[#182132] text-xs text-slate-300 font-sans flex items-start gap-2">
        <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong>Scientific Principle:</strong> In recurrent memory with decay factor &lambda; &lt; 1, memory is not commutative. The most recently seen facts undergo fewer decay cycles than facts presented earlier in the sequence.
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { ArrowRight, ArrowLeftRight, HelpCircle } from 'lucide-react';
import { Fact, createAssociativeMemory } from '../models/associativeMemory';
import { MathView } from './ui/MathView';

export const ContextOrderExperiment: React.FC = () => {
  const [dimension] = useState<number>(16);
  const [retention] = useState<number>(0.95);
  const [writeStrength] = useState<number>(0.8);

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
    <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-5 sm:p-6 text-[#151515] space-y-5 font-mono shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EAE6DF] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-[#167C80]" />
            <h4 className="text-sm font-bold text-[#151515] uppercase tracking-wider">
              Context Order Experiment · Same Information, Different Order
            </h4>
          </div>
          <p className="text-xs text-[#716F68] mt-1 font-sans">
            Does the sequential presentation order of identical facts alter the final recurrent state and retrieval accuracy?
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2.5 py-0.5 rounded bg-[#EDF7F7] border border-[#CFE8E8] text-[#167C80] font-bold">
            CONTROLLED TOY EXPERIMENT
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#EAE6DF] text-[#716F68]">
            D={dimension}
          </span>
        </div>
      </div>

      {/* Side-by-Side Order Representation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Sequence A */}
        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-3">
          <div className="flex justify-between items-center text-[10px] text-[#716F68] font-bold uppercase">
            <span>SEQUENCE A (FORWARD ORDER)</span>
            <span className="text-[#167C80]">{sequenceA.length} Facts</span>
          </div>

          <div className="space-y-1.5">
            {sequenceA.map((f, i) => (
              <div key={f.key} className="flex items-center justify-between p-2.5 rounded-lg bg-[#FFFFFF] border border-[#E5E0D8]">
                <span className="text-[#716F68] font-mono text-[10px]">Step {i + 1}</span>
                <span className="font-bold text-[#151515]">{f.key}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#BDB7AB]" />
                <span className="text-[#167C80] font-bold">{f.value}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#EAE6DF] flex justify-between text-xs">
            <span className="text-[#716F68]">Accuracy: <strong className="text-[#151515]">{evalResults.accA.toFixed(0)}%</strong></span>
            <span className="text-[#716F68]">Avg Retrieval Score: <strong className="text-[#167C80]">{evalResults.meanScoreA.toFixed(3)}</strong></span>
          </div>
        </div>

        {/* Sequence B */}
        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-3">
          <div className="flex justify-between items-center text-[10px] text-[#716F68] font-bold uppercase">
            <span>SEQUENCE B (REVERSED ORDER)</span>
            <span className="text-[#6842C2]">{sequenceB.length} Facts</span>
          </div>

          <div className="space-y-1.5">
            {sequenceB.map((f, i) => (
              <div key={f.key} className="flex items-center justify-between p-2.5 rounded-lg bg-[#FFFFFF] border border-[#E5E0D8]">
                <span className="text-[#716F68] font-mono text-[10px]">Step {i + 1}</span>
                <span className="font-bold text-[#151515]">{f.key}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#BDB7AB]" />
                <span className="text-[#6842C2] font-bold">{f.value}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#EAE6DF] flex justify-between text-xs">
            <span className="text-[#716F68]">Accuracy: <strong className="text-[#151515]">{evalResults.accB.toFixed(0)}%</strong></span>
            <span className="text-[#716F68]">Avg Retrieval Score: <strong className="text-[#6842C2]">{evalResults.meanScoreB.toFixed(3)}</strong></span>
          </div>
        </div>
      </div>

      {/* Query Breakdown Table */}
      <div className="rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] p-4 space-y-3 text-xs">
        <span className="font-bold text-[#151515] uppercase text-[11px] block">
          QUERY-BY-QUERY COMPARISON
        </span>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#EAE6DF] text-[10px] text-[#716F68] uppercase">
                <th className="pb-2">PROBE KEY</th>
                <th className="pb-2">GROUND TRUTH</th>
                <th className="pb-2">ORDER A (PRED / SCORE)</th>
                <th className="pb-2">ORDER B (PRED / SCORE)</th>
                <th className="pb-2 text-right">EFFECT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE6DF]">
              {evalResults.queryBreakdown.map((row) => (
                <tr key={row.key} className="hover:bg-[#FFFFFF]/60">
                  <td className="py-2.5 font-bold text-[#151515]">{row.key}</td>
                  <td className="py-2.5 text-[#716F68]">{row.groundTruth}</td>
                  <td className="py-2.5">
                    <span className={`font-semibold ${row.corrA ? 'text-[#247A4B]' : 'text-[#B64235]'}`}>
                      {row.predA} ({row.scoreA.toFixed(2)})
                    </span>
                  </td>
                  <td className="py-2.5">
                    <span className={`font-semibold ${row.corrB ? 'text-[#247A4B]' : 'text-[#B64235]'}`}>
                      {row.predB} ({row.scoreB.toFixed(2)})
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-mono">
                    {Math.abs(row.scoreA - row.scoreB) < 0.01 ? (
                      <span className="text-[#716F68] text-[10px]">Equivalent</span>
                    ) : row.scoreA > row.scoreB ? (
                      <span className="text-[#167C80] font-bold text-[10px]">A stronger (+{(row.scoreA - row.scoreB).toFixed(2)})</span>
                    ) : (
                      <span className="text-[#6842C2] font-bold text-[10px]">B stronger (+{(row.scoreB - row.scoreA).toFixed(2)})</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Measured Matrix Frobenius Difference */}
      <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] flex flex-wrap items-center justify-between gap-2 text-xs">
        <div>
          <span className="text-[#716F68]">Final State Matrix L2 Difference: </span>
          <strong className="text-[#6842C2] font-mono">
            <MathView math={`\\|M_A - M_B\\|_F = ${evalResults.matrixDiffNorm.toFixed(4)}`} />
          </strong>
        </div>
        <div className="text-[11px] text-[#716F68] font-sans">
          {evalResults.matrixDiffNorm > 0.001
            ? <span>Because retention <MathView math="\lambda < 1.0" />, earlier updates decay exponentially more than later updates, breaking commutativity.</span>
            : 'Order did not affect retrieval under this configuration.'}
        </div>
      </div>

      {/* Explanation Box */}
      <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs text-[#52504A] font-sans flex items-start gap-2">
        <HelpCircle className="w-4 h-4 text-[#167C80] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#151515]">Scientific Principle:</strong> In recurrent memory with decay factor <MathView math="\lambda < 1" />, memory is not commutative. The most recently seen facts undergo fewer decay cycles than facts presented earlier in the sequence.
        </div>
      </div>
    </div>
  );
};

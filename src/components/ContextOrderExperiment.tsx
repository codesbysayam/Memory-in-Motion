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
    <div className="diagram-frame p-5 sm:p-6 text-[var(--text-primary)] space-y-5 font-mono tabular-nums">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-[var(--accent-blue-text)]" />
            <h4 className="text-sm font-bold text-[var(--text-primary)]">
              Context order experiment · same information, different order
            </h4>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-sans">
            Does the sequential presentation order of identical facts alter the final recurrent state and retrieval accuracy?
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-0.5 rounded-md bg-[var(--accent-blue)] border border-[var(--border)] text-[var(--accent-blue-text)] font-semibold">
            Controlled toy experiment
          </span>
          <span className="text-xs px-2 py-0.5 rounded-md bg-[var(--surface-soft)] border border-[var(--border)] text-[var(--text-muted)]">
            d={dimension}
          </span>
        </div>
      </div>

      {/* Side-by-Side Order Representation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Sequence A */}
        <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-3">
          <div className="flex justify-between items-center text-xs text-[var(--text-muted)] font-semibold">
            <span>Sequence A (forward order)</span>
            <span className="text-[var(--accent-blue-text)]">{sequenceA.length} facts</span>
          </div>

          <div className="space-y-1.5">
            {sequenceA.map((f, i) => (
              <div key={f.key} className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                <span className="text-[var(--text-muted)] font-mono text-xs">Step {i + 1}</span>
                <span className="font-bold text-[var(--text-primary)]">{f.key}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span className="text-[var(--accent-blue-text)] font-bold">{f.value}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[var(--border)] flex justify-between text-xs">
            <span className="text-[var(--text-muted)]">Accuracy: <strong className="text-[var(--text-primary)]">{evalResults.accA.toFixed(0)}%</strong></span>
            <span className="text-[var(--text-muted)]">Avg score: <strong className="text-[var(--accent-blue-text)]">{evalResults.meanScoreA.toFixed(3)}</strong></span>
          </div>
        </div>

        {/* Sequence B */}
        <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-3">
          <div className="flex justify-between items-center text-xs text-[var(--text-muted)] font-semibold">
            <span>Sequence B (reversed order)</span>
            <span className="text-[var(--accent-yellow-text)]">{sequenceB.length} facts</span>
          </div>

          <div className="space-y-1.5">
            {sequenceB.map((f, i) => (
              <div key={f.key} className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                <span className="text-[var(--text-muted)] font-mono text-xs">Step {i + 1}</span>
                <span className="font-bold text-[var(--text-primary)]">{f.key}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span className="text-[var(--accent-yellow-text)] font-bold">{f.value}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[var(--border)] flex justify-between text-xs">
            <span className="text-[var(--text-muted)]">Accuracy: <strong className="text-[var(--text-primary)]">{evalResults.accB.toFixed(0)}%</strong></span>
            <span className="text-[var(--text-muted)]">Avg score: <strong className="text-[var(--accent-yellow-text)]">{evalResults.meanScoreB.toFixed(3)}</strong></span>
          </div>
        </div>
      </div>

      {/* Query Breakdown Table */}
      <div className="rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] p-4 space-y-3 text-xs">
        <span className="font-semibold text-[var(--text-primary)] text-xs block">
          Query-by-query comparison
        </span>

        <div className="research-table-wrap">
          <table className="research-table text-xs">
            <thead>
              <tr>
                <th>Probe key</th>
                <th>Ground truth</th>
                <th>Order A (pred / score)</th>
                <th>Order B (pred / score)</th>
                <th className="text-right">Effect</th>
              </tr>
            </thead>
            <tbody>
              {evalResults.queryBreakdown.map((row) => (
                <tr key={row.key}>
                  <td className="font-bold">{row.key}</td>
                  <td className="text-[var(--text-secondary)]">{row.groundTruth}</td>
                  <td>
                    <span className={`font-semibold ${row.corrA ? 'text-[var(--accent-green-text)]' : 'text-[var(--accent-pink-text)]'}`}>
                      {row.predA} ({row.scoreA.toFixed(2)})
                    </span>
                  </td>
                  <td>
                    <span className={`font-semibold ${row.corrB ? 'text-[var(--accent-green-text)]' : 'text-[var(--accent-pink-text)]'}`}>
                      {row.predB} ({row.scoreB.toFixed(2)})
                    </span>
                  </td>
                  <td className="text-right font-mono">
                    {Math.abs(row.scoreA - row.scoreB) < 0.01 ? (
                      <span className="text-[var(--text-muted)] text-xs">Equivalent</span>
                    ) : row.scoreA > row.scoreB ? (
                      <span className="text-[var(--accent-blue-text)] font-bold text-xs">A stronger (+{(row.scoreA - row.scoreB).toFixed(2)})</span>
                    ) : (
                      <span className="text-[var(--accent-yellow-text)] font-bold text-xs">B stronger (+{(row.scoreB - row.scoreA).toFixed(2)})</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Measured Matrix Frobenius Difference */}
      <div className="p-3.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-2 text-xs">
        <div>
          <span className="text-[var(--text-muted)]">Final state matrix L2 difference: </span>
          <strong className="text-[var(--accent-blue-text)] font-mono">
            <MathView math={`\\|M_A - M_B\\|_F = ${evalResults.matrixDiffNorm.toFixed(4)}`} />
          </strong>
        </div>
        <div className="text-xs text-[var(--text-secondary)] font-sans">
          {evalResults.matrixDiffNorm > 0.001
            ? <span>Because retention <MathView math="\lambda < 1.0" />, earlier updates decay exponentially more than later updates, breaking commutativity.</span>
            : 'Order did not affect retrieval under this configuration.'}
        </div>
      </div>

      {/* Explanation Box */}
      <div className="research-callout text-xs text-[var(--text-secondary)] font-sans flex items-start gap-2">
        <HelpCircle className="w-4 h-4 text-[var(--accent-blue-text)] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[var(--text-primary)]">Scientific principle:</strong> In recurrent memory with decay factor <MathView math="\lambda < 1" />, memory is not commutative. The most recently seen facts undergo fewer decay cycles than facts presented earlier in the sequence.
        </div>
      </div>
    </div>
  );
};

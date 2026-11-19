import React from 'react';

export interface TruthModelComparisonProps {
  prediction: string;
  truth: string;
  confidence: number;
  className?: string;
  theme?: 'light' | 'dark';
}

export function TruthModelComparison({
  prediction,
  truth,
  confidence,
  className = '',
}: TruthModelComparisonProps) {
  const correct =
    prediction.toLowerCase().trim() === truth.toLowerCase().trim() && prediction !== 'UNKNOWN';

  return (
    <div
      className={`truth-grid grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] p-4 text-xs shadow-xs ${className}`}
    >
      <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)]">
        <span className="text-xs block uppercase font-semibold text-[var(--text-secondary)]">
          Ground truth
        </span>
        <strong className="font-mono text-sm font-semibold block mt-1 text-[var(--text-primary)]">
          {truth}
        </strong>
      </div>

      <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)]">
        <span className="text-xs block uppercase font-semibold text-[var(--text-secondary)]">
          Model output
        </span>
        <strong
          className={`font-mono text-sm font-semibold block mt-1 ${
            correct ? 'text-[var(--accent-green-text)]' : 'text-[var(--accent-pink-text)]'
          }`}
        >
          {prediction}
        </strong>
      </div>

      <div
        className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)]"
        title="Cosine similarity between the retrieved representation and a candidate value representation. This is not a calibrated probability."
      >
        <span className="text-xs block uppercase font-semibold text-[var(--text-secondary)]">
          Retrieval score
        </span>
        <strong className="font-mono text-base font-bold block mt-1 text-[var(--accent-blue-text)]">
          {Math.round(confidence * 100)}%
        </strong>
      </div>

      <div
        className={`p-3 rounded-lg border flex items-center justify-center font-semibold text-xs tracking-wider transition-colors ${
          correct
            ? 'bg-[var(--accent-green)] border-[var(--border)] text-[var(--accent-green-text)]'
            : 'bg-[var(--accent-pink)] border-[var(--border)] text-[var(--accent-pink-text)]'
        }`}
      >
        {correct ? '✓ Correct' : 'Interference detected'}
      </div>
    </div>
  );
}

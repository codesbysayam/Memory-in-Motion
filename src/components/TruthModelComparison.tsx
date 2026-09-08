import React from 'react';

export interface TruthModelComparisonProps {
  prediction: string;
  truth: string;
  confidence: number;
  className?: string;
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
      className={`truth-grid grid grid-cols-2 sm:grid-cols-4 gap-2.5 rounded-xl border border-[#252A35] bg-[#11141A] p-3.5 font-mono text-xs ${className}`}
    >
      <div className="bg-[#151922] p-2.5 rounded-lg border border-[#252A35]">
        <span className="text-[10px] text-[#8F96A3] block tracking-wider uppercase">GROUND TRUTH</span>
        <strong className="text-white text-sm tracking-wide block mt-0.5">{truth}</strong>
      </div>

      <div className="bg-[#151922] p-2.5 rounded-lg border border-[#252A35]">
        <span className="text-[10px] text-[#8F96A3] block tracking-wider uppercase">MODEL OUTPUT</span>
        <strong className={`text-sm tracking-wide block mt-0.5 ${correct ? 'text-emerald-300' : 'text-rose-400'}`}>
          {prediction}
        </strong>
      </div>

      <div className="bg-[#151922] p-2.5 rounded-lg border border-[#252A35]" title="This score is based on representation similarity and is not a calibrated probability.">
        <span className="text-[10px] text-[#8F96A3] block tracking-wider uppercase">RETRIEVAL SCORE</span>
        <strong className="text-[#22D3EE] text-sm tracking-wide block mt-0.5">
          {Math.round(confidence * 100)}%
        </strong>
      </div>

      <div
        className={`p-2.5 rounded-lg border flex items-center justify-center font-bold text-xs tracking-wider uppercase transition-colors ${
          correct
            ? 'success bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
            : 'failure bg-rose-950/40 border-rose-500/40 text-rose-300'
        }`}
      >
        {correct ? '✓ CORRECT' : '✗ INTERFERENCE'}
      </div>
    </div>
  );
}

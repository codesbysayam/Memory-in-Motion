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
      className={`truth-grid grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl border border-[#E5E0D8] bg-[#FFFFFF] p-4 font-mono text-xs shadow-xs ${className}`}
    >
      <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#EAE6DF]">
        <span className="text-[10px] text-[#716F68] block tracking-wider uppercase font-bold">GROUND TRUTH</span>
        <strong className="text-[#151515] font-serif text-base tracking-wide block mt-1">{truth}</strong>
      </div>

      <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#EAE6DF]">
        <span className="text-[10px] text-[#716F68] block tracking-wider uppercase font-bold">MODEL OUTPUT</span>
        <strong className={`font-serif text-base tracking-wide block mt-1 ${correct ? 'text-[#247A4B]' : 'text-[#B64235]'}`}>
          {prediction}
        </strong>
      </div>

      <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#EAE6DF]" title="This score is based on representation similarity and is not a calibrated probability.">
        <span className="text-[10px] text-[#716F68] block tracking-wider uppercase font-bold">RETRIEVAL SCORE</span>
        <strong className="text-[#167C80] font-serif text-base tracking-wide block mt-1">
          {Math.round(confidence * 100)}%
        </strong>
      </div>

      <div
        className={`p-3 rounded-lg border flex items-center justify-center font-bold text-xs tracking-wider uppercase transition-colors ${
          correct
            ? 'success bg-[#EDF8F2] border-[#CDEEDB] text-[#247A4B]'
            : 'failure bg-[#FDF2F0] border-[#F7D3CF] text-[#B64235]'
        }`}
      >
        {correct ? '✓ CORRECT' : '✗ INTERFERENCE'}
      </div>
    </div>
  );
}

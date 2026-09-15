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
  theme = 'dark',
}: TruthModelComparisonProps) {
  const correct =
    prediction.toLowerCase().trim() === truth.toLowerCase().trim() && prediction !== 'UNKNOWN';
  const isDark = theme === 'dark';

  return (
    <div
      className={`truth-grid grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl border p-4 font-mono text-xs shadow-xs ${
        isDark
          ? 'border-[#252A35] bg-[#11141A]'
          : 'border-[#E5E0D8] bg-[#FFFFFF]'
      } ${className}`}
    >
      <div className={`p-3 rounded-lg border ${isDark ? 'bg-[#151922] border-[#252A35]' : 'bg-[#FAF8F5] border-[#EAE6DF]'}`}>
        <span className={`text-[10px] block tracking-wider uppercase font-bold ${isDark ? 'text-[#8F96A3]' : 'text-[#716F68]'}`}>
          GROUND TRUTH
        </span>
        <strong className={`font-serif text-base tracking-wide block mt-1 ${isDark ? 'text-white' : 'text-[#151515]'}`}>
          {truth}
        </strong>
      </div>

      <div className={`p-3 rounded-lg border ${isDark ? 'bg-[#151922] border-[#252A35]' : 'bg-[#FAF8F5] border-[#EAE6DF]'}`}>
        <span className={`text-[10px] block tracking-wider uppercase font-bold ${isDark ? 'text-[#8F96A3]' : 'text-[#716F68]'}`}>
          MODEL OUTPUT
        </span>
        <strong className={`font-serif text-base tracking-wide block mt-1 ${
          correct
            ? isDark ? 'text-emerald-400' : 'text-[#247A4B]'
            : isDark ? 'text-rose-400' : 'text-[#B64235]'
        }`}>
          {prediction}
        </strong>
      </div>

      <div
        className={`p-3 rounded-lg border ${isDark ? 'bg-[#151922] border-[#252A35]' : 'bg-[#FAF8F5] border-[#EAE6DF]'}`}
        title="This score is based on representation similarity and is not a calibrated probability."
      >
        <span className={`text-[10px] block tracking-wider uppercase font-bold ${isDark ? 'text-[#8F96A3]' : 'text-[#716F68]'}`}>
          RETRIEVAL SCORE
        </span>
        <strong className={`font-serif text-base tracking-wide block mt-1 ${isDark ? 'text-[#22D3EE]' : 'text-[#167C80]'}`}>
          {Math.round(confidence * 100)}%
        </strong>
      </div>

      <div
        className={`p-3 rounded-lg border flex items-center justify-center font-bold text-xs tracking-wider uppercase transition-colors ${
          correct
            ? isDark
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-[#EDF8F2] border-[#CDEEDB] text-[#247A4B]'
            : isDark
            ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            : 'bg-[#FDF2F0] border-[#F7D3CF] text-[#B64235]'
        }`}
      >
        {correct ? '✓ CORRECT' : '✗ INTERFERENCE'}
      </div>
    </div>
  );
}

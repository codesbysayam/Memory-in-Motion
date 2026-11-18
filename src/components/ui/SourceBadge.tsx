import React from 'react';

export type SourceBadgeType =
  | 'primary'
  | 'official'
  | 'toy'
  | 'illustration'
  | 'TOY COMPUTATION'
  | 'OBSERVED RESULT'
  | 'EXPLANATION'
  | string;

interface SourceBadgeProps {
  type: SourceBadgeType;
  className?: string;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({ type, className = '' }) => {
  switch (type) {
    case 'primary':
      return (
        <span
          className={`font-mono text-[11px] font-medium text-[var(--accent-blue-text)] whitespace-nowrap ${className}`}
          title="Peer-reviewed or formal technical preprint literature"
        >
          Primary Paper
        </span>
      );

    case 'official':
      return (
        <span
          className={`font-mono text-[11px] font-medium text-[var(--color-success)] whitespace-nowrap ${className}`}
          title="Official Pathway technical releases, documentation, or code repositories"
        >
          Official Pathway
        </span>
      );

    case 'toy':
    case 'TOY COMPUTATION':
      return (
        <span
          className={`font-mono text-[11px] font-medium text-[var(--color-warning)] whitespace-nowrap ${className}`}
          title="Educational in-browser simulation built to demonstrate principles"
        >
          Toy Experiment
        </span>
      );

    case 'OBSERVED RESULT':
      return (
        <span
          className={`font-mono text-[11px] font-medium text-[var(--color-success)] whitespace-nowrap ${className}`}
          title="Direct measurement observed in current simulation session"
        >
          Observed Result
        </span>
      );

    case 'EXPLANATION':
      return (
        <span
          className={`font-mono text-[11px] font-medium text-[var(--accent-blue-text)] whitespace-nowrap ${className}`}
          title="Theoretical deduction explaining the empirical phenomena"
        >
          Explanation
        </span>
      );

    case 'illustration':
    default:
      return (
        <span
          className={`font-mono text-[11px] font-medium text-[var(--text-secondary)] whitespace-nowrap ${className}`}
          title="Schematic visual representation to aid conceptual intuition"
        >
          Illustration
        </span>
      );
  }
};

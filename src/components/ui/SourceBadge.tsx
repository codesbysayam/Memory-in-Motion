import React from 'react';
import { BookOpen, ShieldCheck, Cpu, Sparkles, Activity, FileText } from 'lucide-react';

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
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-[var(--border)] bg-[var(--accent-blue)] text-[var(--accent-blue-text)] font-mono text-[11px] font-medium whitespace-nowrap ${className}`}
          title="Peer-reviewed or formal technical preprint literature"
        >
          <BookOpen className="w-3 h-3 shrink-0" />
          <span>Primary Paper</span>
        </span>
      );

    case 'official':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-[var(--color-success-border)] bg-[var(--accent-green)] text-[var(--accent-green-text)] font-mono text-[11px] font-medium whitespace-nowrap ${className}`}
          title="Official Pathway technical releases, documentation, or code repositories"
        >
          <ShieldCheck className="w-3 h-3 shrink-0" />
          <span>Official Pathway</span>
        </span>
      );

    case 'toy':
    case 'TOY COMPUTATION':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-[var(--color-warning-border)] bg-[var(--accent-yellow)] text-[var(--accent-yellow-text)] font-mono text-[11px] font-medium whitespace-nowrap ${className}`}
          title="Educational in-browser simulation built to demonstrate principles"
        >
          <Cpu className="w-3 h-3 shrink-0" />
          <span>Toy Experiment</span>
        </span>
      );

    case 'OBSERVED RESULT':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-[var(--color-success-border)] bg-[var(--accent-green)] text-[var(--accent-green-text)] font-mono text-[11px] font-medium whitespace-nowrap ${className}`}
          title="Direct measurement observed in current simulation session"
        >
          <Activity className="w-3 h-3 shrink-0" />
          <span>Observed Result</span>
        </span>
      );

    case 'EXPLANATION':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-[var(--border)] bg-[var(--accent-blue)] text-[var(--accent-blue-text)] font-mono text-[11px] font-medium whitespace-nowrap ${className}`}
          title="Theoretical deduction explaining the empirical phenomena"
        >
          <FileText className="w-3 h-3 shrink-0" />
          <span>Explanation</span>
        </span>
      );

    case 'illustration':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-secondary)] font-mono text-[11px] font-medium whitespace-nowrap ${className}`}
          title="Schematic visual representation to aid conceptual intuition"
        >
          <Sparkles className="w-3 h-3 shrink-0" />
          <span>Illustration</span>
        </span>
      );
  }
};

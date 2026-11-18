import React from 'react';
import { EVIDENCE, EvidenceType } from '../../constants/evidence';

interface EvidenceStripProps {
  type: EvidenceType;
  detail?: React.ReactNode;
  className?: string;
}

export function EvidenceStrip({ type, detail, className = '' }: EvidenceStripProps) {
  const getToneClass = () => {
    switch (type) {
      case 'live':
        return 'text-[var(--accent-blue-text)]';
      case 'published':
        return 'text-[var(--color-success)]';
      case 'abstraction':
        return 'text-[var(--text-primary)]';
      case 'illustration':
        return 'text-[var(--color-warning)]';
      case 'precomputed':
        return 'text-[var(--accent-blue-text)]';
    }
  };

  return (
    <div
      className={`inline-flex flex-wrap items-center gap-2 text-xs font-mono ${className}`}
      title={detail ? `${EVIDENCE[type]} — ${detail}` : EVIDENCE[type]}
    >
      <span className={`font-semibold whitespace-nowrap ${getToneClass()}`}>
        {EVIDENCE[type]}
      </span>
      {detail && (
        <>
          <span aria-hidden="true" className="text-[var(--mm-rule-strong)]">·</span>
          <span className="text-xs text-[var(--text-secondary)] font-sans">
            {detail}
          </span>
        </>
      )}
    </div>
  );
}

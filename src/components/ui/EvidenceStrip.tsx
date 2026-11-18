import React from 'react';
import { EVIDENCE, EvidenceType } from '../../constants/evidence';
import { ShieldCheck, BookOpen, Binary, Eye, Sparkles } from 'lucide-react';

interface EvidenceStripProps {
  type: EvidenceType;
  detail?: React.ReactNode;
  className?: string;
}

export function EvidenceStrip({ type, detail, className = '' }: EvidenceStripProps) {
  const getIcon = () => {
    switch (type) {
      case 'live':
        return <Binary className="w-3.5 h-3.5 shrink-0" />;
      case 'published':
        return <BookOpen className="w-3.5 h-3.5 shrink-0" />;
      case 'abstraction':
        return <ShieldCheck className="w-3.5 h-3.5 shrink-0" />;
      case 'illustration':
        return <Eye className="w-3.5 h-3.5 shrink-0" />;
      case 'precomputed':
        return <Sparkles className="w-3.5 h-3.5 shrink-0" />;
    }
  };

  const getBadgeStyle = () => {
    switch (type) {
      case 'live':
        return 'border-[var(--border)] bg-[var(--accent-blue)] text-[var(--accent-blue-text)]';
      case 'published':
        return 'border-[var(--color-success-border)] bg-[var(--accent-green)] text-[var(--accent-green-text)]';
      case 'abstraction':
        return 'border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-primary)]';
      case 'illustration':
        return 'border-[var(--color-warning-border)] bg-[var(--accent-yellow)] text-[var(--accent-yellow-text)]';
      case 'precomputed':
        return 'border-[var(--border)] bg-[var(--accent-blue)] text-[var(--accent-blue-text)]';
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md border text-xs font-mono select-none ${getBadgeStyle()} ${className}`}
      title={detail ? `${EVIDENCE[type]} — ${detail}` : EVIDENCE[type]}
    >
      <span className="flex items-center gap-1.5 font-medium text-[11px] whitespace-nowrap">
        {getIcon()}
        <span>{EVIDENCE[type]}</span>
      </span>
      {detail && (
        <>
          <span aria-hidden="true" className="opacity-40">·</span>
          <span className="text-[11px] text-[var(--text-secondary)] font-sans truncate max-w-[280px]">
            {detail}
          </span>
        </>
      )}
    </div>
  );
}

import React from 'react';
import { CheckCircle2, AlertTriangle, BookOpen } from 'lucide-react';

export interface ClaimEvidenceLimitationProps {
  claim: string;
  evidence: string;
  limitation: string;
  sourceType?: 'live' | 'published' | 'abstraction';
}

export const ClaimEvidenceLimitation: React.FC<ClaimEvidenceLimitationProps> = ({
  claim,
  evidence,
  limitation,
}) => {
  return (
    <div className="diagram-frame p-5 sm:p-6 font-mono text-xs space-y-4 text-[var(--text-primary)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 text-xs text-[var(--text-secondary)] font-sans">
        <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-[var(--accent-blue-text)]" />
          <span>Epistemic audit: Scientific boundaries</span>
        </span>
        <span className="text-[var(--text-muted)]">Rigorous evaluation</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CLAIM */}
        <div className="p-4 rounded-xl bg-[var(--accent-blue)] border border-[var(--border)] space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-[var(--accent-blue-text)] text-xs font-sans">
            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-blue-text)] shrink-0" />
            <span>Claim</span>
          </div>
          <p className="text-xs text-[var(--text-primary)] font-sans leading-relaxed">
            {claim}
          </p>
        </div>

        {/* EVIDENCE */}
        <div className="p-4 rounded-xl bg-[var(--accent-green)] border border-[var(--color-success-border)] space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-[var(--accent-green-text)] text-xs font-sans">
            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-green-text)] shrink-0" />
            <span>Evidence</span>
          </div>
          <p className="text-xs text-[var(--text-primary)] font-sans leading-relaxed">
            {evidence}
          </p>
        </div>

        {/* LIMITATION */}
        <div className="p-4 rounded-xl bg-[var(--accent-yellow)] border border-[var(--color-warning-border)] space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-[var(--accent-yellow-text)] text-xs font-sans">
            <AlertTriangle className="w-3.5 h-3.5 text-[var(--accent-yellow-text)] shrink-0" />
            <span>Limitation</span>
          </div>
          <p className="text-xs text-[var(--text-primary)] font-sans leading-relaxed">
            {limitation}
          </p>
        </div>
      </div>
    </div>
  );
};

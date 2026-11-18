import React from 'react';
import { MathView } from './MathView';

interface EquationCardProps {
  label?: string;
  formula: string;
  plainEnglish: string;
  systemImpact: string;
  id?: string;
}

export function EquationCard({
  label = "State update formulation",
  formula,
  plainEnglish,
  systemImpact,
  id
}: EquationCardProps) {
  return (
    <div id={id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 text-[var(--text-primary)] space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-mono font-medium text-[var(--text-muted)]">
          {label}
        </span>
        <span className="text-[11px] font-mono font-medium text-[var(--accent-blue-text)] bg-[var(--accent-blue)] px-2 py-0.5 rounded-md border border-[var(--border)]">
          Mathematical definition
        </span>
      </div>

      <div className="rounded-lg bg-[var(--color-code-bg)] border border-[var(--border)] p-4 text-center overflow-x-auto">
        <div className="text-sm sm:text-base font-medium text-[var(--text-primary)] tracking-wide py-1">
          <MathView math={formula} block />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg bg-[var(--surface-soft)] p-3 border border-[var(--border)]">
          <div className="text-[11px] font-mono font-medium text-[var(--text-muted)] mb-1">Plain English</div>
          <div className="text-[var(--text-primary)] leading-relaxed">{plainEnglish}</div>
        </div>

        <div className="rounded-lg bg-[var(--surface-soft)] p-3 border border-[var(--border)]">
          <div className="text-[11px] font-mono font-medium text-[var(--accent-blue-text)] mb-1">System effect</div>
          <div className="text-[var(--text-primary)] leading-relaxed">{systemImpact}</div>
        </div>
      </div>
    </div>
  );
}

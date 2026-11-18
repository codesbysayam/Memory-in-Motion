import React from 'react';
import { FormattedMathText } from './MathView';

interface SectionHeaderProps {
  number: string;
  category?: string;
  title: React.ReactNode;
  subtitle: string | React.ReactNode;
  discovery?: string | React.ReactNode;
  id?: string;
  theme?: 'dark' | 'light';
}

export function SectionHeader({
  number,
  category,
  title,
  subtitle,
  discovery,
  id,
}: SectionHeaderProps) {
  return (
    <header id={id} className="mb-10 border-b border-[var(--mm-rule)] pb-8">
      <div className="flex flex-wrap items-center gap-2.5 mb-3 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
        <span className="font-semibold text-[var(--mm-signal)] tabular-nums">
          {number}
        </span>
        {category && (
          <>
            <span aria-hidden="true" className="text-[var(--mm-rule-strong)]">/</span>
            <span className="text-[var(--text-secondary)]">
              {category}
            </span>
          </>
        )}
      </div>

      <h2 className="essay-section-title mb-4 max-w-[820px]">
        {title}
      </h2>

      <div className="essay-lead">
        {typeof subtitle === 'string' ? <FormattedMathText text={subtitle} /> : subtitle}
      </div>

      {discovery && (
        <div className="mt-6 pt-4 border-t border-[var(--mm-rule)] max-w-[720px] grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-2 sm:gap-4 items-baseline">
          <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--mm-signal)] font-semibold">
            Observation
          </span>
          <div className="text-sm text-[var(--text-primary)] font-sans leading-relaxed">
            {typeof discovery === 'string' ? <FormattedMathText text={discovery} /> : discovery}
          </div>
        </div>
      )}
    </header>
  );
}

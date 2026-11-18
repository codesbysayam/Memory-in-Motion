import React from 'react';
import { FormattedMathText } from './MathView';
import { ResearchCallout } from './ResearchCallout';

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
    <div id={id} className="mb-8 border-b border-[var(--border)] pb-6">
      <div className="flex flex-wrap items-center gap-2 mb-2.5 font-mono text-xs text-[var(--text-muted)]">
        <span className="font-semibold text-[var(--accent-blue-text)] tabular-nums">
          {number}
        </span>
        {category && (
          <>
            <span aria-hidden="true" className="text-[var(--border)]">·</span>
            <span className="text-[var(--text-secondary)]">
              {category}
            </span>
          </>
        )}
      </div>

      <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-serif font-semibold tracking-tight mb-3 leading-[1.15] text-[var(--text-primary)] max-w-[760px]">
        {title}
      </h2>

      <div className="text-[15px] sm:text-[17px] max-w-[760px] leading-relaxed font-sans text-[var(--text-secondary)]">
        {typeof subtitle === 'string' ? <FormattedMathText text={subtitle} /> : subtitle}
      </div>

      {discovery && (
        <ResearchCallout tone="info" title="Key observation" className="mt-5 max-w-[760px]">
          {typeof discovery === 'string' ? <FormattedMathText text={discovery} /> : discovery}
        </ResearchCallout>
      )}
    </div>
  );
}

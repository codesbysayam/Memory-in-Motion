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
    <div id={id} className="mb-10 border-b border-[var(--border)] pb-6">
      <div className="flex flex-wrap items-center gap-2 mb-2.5">
        <span className="font-mono text-xs uppercase tracking-widest font-bold text-[var(--accent-blue-text)]">
          {number}
        </span>
        {category && (
          <>
            <span className="text-[var(--border)]">/</span>
            <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-secondary)]">
              {category}
            </span>
          </>
        )}
      </div>

      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold tracking-tight mb-3 leading-tight text-[var(--text-primary)]">
        {title}
      </h2>

      <div className="text-base sm:text-lg max-w-3xl leading-relaxed font-sans text-[var(--text-secondary)]">
        {typeof subtitle === 'string' ? <FormattedMathText text={subtitle} /> : subtitle}
      </div>

      {discovery && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--accent-blue)] px-3.5 py-1.5 text-xs shadow-xs">
          <span className="font-mono font-bold uppercase tracking-wider text-[10px] text-[var(--accent-blue-text)]">
            Key Discovery:
          </span>
          <span className="font-medium text-[var(--text-primary)]">
            {typeof discovery === 'string' ? <FormattedMathText text={discovery} /> : discovery}
          </span>
        </div>
      )}
    </div>
  );
}

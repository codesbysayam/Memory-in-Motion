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
  theme = 'light'
}: SectionHeaderProps) {
  return (
    <div id={id} className="mb-10 border-b border-[#E5E0D8] pb-6">
      <div className="flex flex-wrap items-center gap-2 mb-2.5">
        <span className="font-mono text-xs uppercase tracking-widest font-bold text-[#6842C2]">
          {number}
        </span>
        {category && (
          <>
            <span className="text-[#D8D4CB]">/</span>
            <span className="font-mono text-xs uppercase tracking-wider text-[#716F68]">
              {category}
            </span>
          </>
        )}
      </div>

      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal tracking-tight mb-3 leading-tight text-[#151515]">
        {title}
      </h2>

      <div className="text-base sm:text-lg max-w-3xl leading-relaxed text-[#52504A] font-sans">
        {typeof subtitle === 'string' ? <FormattedMathText text={subtitle} /> : subtitle}
      </div>

      {discovery && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#CFE8E8] bg-[#EDF7F7] px-3.5 py-1.5 text-xs text-[#167C80] shadow-xs">
          <span className="font-mono font-bold uppercase tracking-wider text-[10px] text-[#167C80]">
            Key Discovery:
          </span>
          <span className="font-medium">
            {typeof discovery === 'string' ? <FormattedMathText text={discovery} /> : discovery}
          </span>
        </div>
      )}
    </div>
  );
}

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
  theme
}: SectionHeaderProps) {
  // If explicitly dark, or if sections 04 or 05 which have bg-[#07080B]
  const isDark = theme === 'dark' || number === '04' || number === '05';

  return (
    <div id={id} className={`mb-10 border-b pb-6 ${isDark ? 'border-[#252A35]' : 'border-[#E5E0D8]'}`}>
      <div className="flex flex-wrap items-center gap-2 mb-2.5">
        <span className={`font-mono text-xs uppercase tracking-widest font-bold ${isDark ? 'text-[#A78BFA]' : 'text-[#6842C2]'}`}>
          {number}
        </span>
        {category && (
          <>
            <span className={isDark ? 'text-[#4A5568]' : 'text-[#D8D4CB]'}>/</span>
            <span className={`font-mono text-xs uppercase tracking-wider ${isDark ? 'text-[#CBD5E1]' : 'text-[#716F68]'}`}>
              {category}
            </span>
          </>
        )}
      </div>

      <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-serif font-bold tracking-tight mb-3 leading-tight ${isDark ? 'text-white' : 'text-[#151515]'}`}>
        {title}
      </h2>

      <div className={`text-base sm:text-lg max-w-3xl leading-relaxed font-sans ${isDark ? 'text-[#E2E8F0]' : 'text-[#52504A]'}`}>
        {typeof subtitle === 'string' ? <FormattedMathText text={subtitle} /> : subtitle}
      </div>

      {discovery && (
        <div className={`mt-4 inline-flex items-center gap-2 rounded-lg border px-3.5 py-1.5 text-xs shadow-xs ${
          isDark
            ? 'border-[#287C7C]/60 bg-[#0B2525] text-[#4FD1C5]'
            : 'border-[#CFE8E8] bg-[#EDF7F7] text-[#167C80]'
        }`}>
          <span className={`font-mono font-bold uppercase tracking-wider text-[10px] ${
            isDark ? 'text-[#4FD1C5]' : 'text-[#167C80]'
          }`}>
            Key Discovery:
          </span>
          <span className={`font-medium ${isDark ? 'text-[#E2E8F0]' : 'text-[#167C80]'}`}>
            {typeof discovery === 'string' ? <FormattedMathText text={discovery} /> : discovery}
          </span>
        </div>
      )}
    </div>
  );
}

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
  theme = 'dark'
}: SectionHeaderProps) {
  const isLight = theme === 'light';

  return (
    <div id={id} className={`mb-8 border-b pb-6 ${isLight ? 'border-[#D8D4CB]' : 'border-[#252A35]/80'}`}>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className={`font-mono text-xs uppercase tracking-widest font-semibold ${isLight ? 'text-[#6842C2]' : 'text-[#8B5CF6]'}`}>
          {number}
        </span>
        {category && (
          <>
            <span className={isLight ? 'text-[#D8D4CB]' : 'text-[#252A35]'}>/</span>
            <span className={`font-mono text-xs uppercase tracking-wider ${isLight ? 'text-[#716F68]' : 'text-[#8F96A3]'}`}>
              {category}
            </span>
          </>
        )}
      </div>

      <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-serif font-normal tracking-tight mb-2 leading-tight ${isLight ? 'text-[#151515]' : 'text-[#F4F5F7]'}`}>
        {title}
      </h2>

      <div className={`text-base max-w-3xl leading-relaxed ${isLight ? 'text-[#2A2926]' : 'text-[#8F96A3]'}`}>
        {typeof subtitle === 'string' ? <FormattedMathText text={subtitle} /> : subtitle}
      </div>

      {discovery && (
        <div className={`mt-3 inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs ${isLight ? 'bg-[#ECE8DF] border-[#D8D4CB] text-[#167C80]' : 'bg-[#151922] border-[#252A35] text-[#22D3EE]'}`}>
          <span className={`font-mono font-medium uppercase tracking-wider text-[10px] ${isLight ? 'text-[#716F68]' : 'text-[#8F96A3]'}`}>Key Discovery:</span>
          <span>{typeof discovery === 'string' ? <FormattedMathText text={discovery} /> : discovery}</span>
        </div>
      )}
    </div>
  );
}

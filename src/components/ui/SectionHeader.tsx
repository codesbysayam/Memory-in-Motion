import React from 'react';

interface SectionHeaderProps {
  number: string;
  category?: string;
  title: string;
  subtitle: string;
  discovery?: string;
  id?: string;
}

export function SectionHeader({
  number,
  category,
  title,
  subtitle,
  discovery,
  id
}: SectionHeaderProps) {
  return (
    <div id={id} className="mb-8 border-b border-[#252A35]/80 pb-6">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="font-mono text-xs uppercase tracking-widest text-[#8B5CF6] font-semibold">
          {number}
        </span>
        {category && (
          <>
            <span className="text-[#252A35]">/</span>
            <span className="font-mono text-xs uppercase tracking-wider text-[#8F96A3]">
              {category}
            </span>
          </>
        )}
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F4F5F7] mb-2 font-sans">
        {title}
      </h2>

      <p className="text-base text-[#8F96A3] max-w-3xl leading-relaxed">
        {subtitle}
      </p>

      {discovery && (
        <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#151922] border border-[#252A35] px-3 py-1.5 text-xs text-[#22D3EE]">
          <span className="font-mono font-medium uppercase tracking-wider text-[10px] text-[#8F96A3]">Key Discovery:</span>
          <span>{discovery}</span>
        </div>
      )}
    </div>
  );
}

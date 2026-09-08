import React from 'react';

export type EvidenceCategory = 'PRIMARY SOURCE' | 'OFFICIAL PATHWAY MATERIAL' | 'OUR TOY EXPERIMENT' | 'ILLUSTRATION';

interface EvidenceBadgeProps {
  category: EvidenceCategory;
  className?: string;
}

export function EvidenceBadge({ category, className = '' }: EvidenceBadgeProps) {
  const styles: Record<EvidenceCategory, string> = {
    'PRIMARY SOURCE': 'bg-violet-950/40 text-violet-300 border-violet-500/40',
    'OFFICIAL PATHWAY MATERIAL': 'bg-cyan-950/40 text-cyan-300 border-cyan-500/40',
    'OUR TOY EXPERIMENT': 'bg-amber-950/40 text-amber-300 border-amber-500/40',
    'ILLUSTRATION': 'bg-zinc-900 text-zinc-400 border-zinc-700/60',
  };

  return (
    <span
      className={`inline-flex items-center text-[10px] font-mono font-medium px-2 py-0.5 rounded border uppercase tracking-wider ${styles[category]} ${className}`}
    >
      {category}
    </span>
  );
}

interface SourceCardProps {
  title: string;
  authors?: string;
  year?: string | number;
  source: string;
  category: EvidenceCategory;
  whyItMatters: string;
  link?: string;
  id?: string;
}

export function SourceCard({
  title,
  authors,
  year,
  source,
  category,
  whyItMatters,
  link,
  id
}: SourceCardProps) {
  return (
    <div id={id} className="rounded-xl border border-[#252A35] bg-[#11141A] p-4 text-[#F4F5F7] space-y-2.5">
      <div className="flex items-center justify-between">
        <EvidenceBadge category={category} />
        {year && <span className="font-mono text-xs text-[#8F96A3]">{year}</span>}
      </div>

      <div>
        <h4 className="font-semibold text-white text-sm leading-snug">
          {link ? (
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#22D3EE] transition-colors underline decoration-[#252A35] underline-offset-4"
            >
              {title}
            </a>
          ) : (
            title
          )}
        </h4>
        {authors && <p className="text-xs text-[#8F96A3] mt-0.5">{authors}</p>}
        <p className="text-[11px] font-mono text-[#8B5CF6] mt-0.5">{source}</p>
      </div>

      <div className="rounded-lg bg-[#151922] p-2.5 border border-[#252A35]/60 text-xs text-[#8F96A3] leading-relaxed">
        <span className="text-white font-medium block mb-0.5">Why it matters here:</span>
        {whyItMatters}
      </div>
    </div>
  );
}

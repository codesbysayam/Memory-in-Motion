import React from 'react';
import { BookOpen, ShieldCheck, Cpu, Sparkles } from 'lucide-react';

export type SourceBadgeType = 'primary' | 'official' | 'toy' | 'illustration';

interface SourceBadgeProps {
  type: SourceBadgeType;
  className?: string;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({ type, className = '' }) => {
  switch (type) {
    case 'primary':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-violet-500/40 bg-violet-950/30 text-violet-300 font-mono text-[10px] tracking-wider font-semibold uppercase ${className}`}
          title="Peer-reviewed or formal technical preprint literature"
        >
          <BookOpen className="w-3 h-3 text-violet-400" />
          <span>[PRIMARY PAPER]</span>
        </span>
      );

    case 'official':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-[#22D3EE]/40 bg-cyan-950/30 text-[#22D3EE] font-mono text-[10px] tracking-wider font-semibold uppercase ${className}`}
          title="Official Pathway technical releases, documentation, or code repositories"
        >
          <ShieldCheck className="w-3 h-3 text-[#22D3EE]" />
          <span>[OFFICIAL PATHWAY]</span>
        </span>
      );

    case 'toy':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-amber-500/40 bg-amber-950/30 text-amber-300 font-mono text-[10px] tracking-wider font-semibold uppercase ${className}`}
          title="Educational in-browser simulation built to demonstrate principles"
        >
          <Cpu className="w-3 h-3 text-amber-400" />
          <span>[OUR TOY EXPERIMENT]</span>
        </span>
      );

    case 'illustration':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-[#8F96A3]/40 bg-[#151922] text-[#8F96A3] font-mono text-[10px] tracking-wider font-semibold uppercase ${className}`}
          title="Schematic visual representation to aid conceptual intuition"
        >
          <Sparkles className="w-3 h-3 text-[#8F96A3]" />
          <span>[ILLUSTRATION]</span>
        </span>
      );
  }
};

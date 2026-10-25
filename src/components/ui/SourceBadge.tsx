import React from 'react';
import { BookOpen, ShieldCheck, Cpu, Sparkles, Activity, FileText } from 'lucide-react';

export type SourceBadgeType =
  | 'primary'
  | 'official'
  | 'toy'
  | 'illustration'
  | 'TOY COMPUTATION'
  | 'OBSERVED RESULT'
  | 'EXPLANATION'
  | string;

interface SourceBadgeProps {
  type: SourceBadgeType;
  className?: string;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({ type, className = '' }) => {
  switch (type) {
    case 'primary':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border border-[#E2D8FA] bg-[#F3EFFF] text-[#6842C2] font-mono text-[10px] tracking-wider font-bold uppercase ${className}`}
          title="Peer-reviewed or formal technical preprint literature"
        >
          <BookOpen className="w-3 h-3 text-[#6842C2]" />
          <span>[PRIMARY PAPER]</span>
        </span>
      );

    case 'official':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border border-[#CFE8E8] bg-[#EDF7F7] text-[#167C80] font-mono text-[10px] tracking-wider font-bold uppercase ${className}`}
          title="Official Pathway technical releases, documentation, or code repositories"
        >
          <ShieldCheck className="w-3 h-3 text-[#167C80]" />
          <span>[OFFICIAL PATHWAY]</span>
        </span>
      );

    case 'toy':
    case 'TOY COMPUTATION':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border border-[#F5E2C4] bg-[#FDF8EE] text-[#A46622] font-mono text-[10px] tracking-wider font-bold uppercase ${className}`}
          title="Educational in-browser simulation built to demonstrate principles"
        >
          <Cpu className="w-3 h-3 text-[#A46622]" />
          <span>[OUR TOY EXPERIMENT]</span>
        </span>
      );

    case 'OBSERVED RESULT':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border border-[#CDEEDB] bg-[#EDF8F2] text-[#247A4B] font-mono text-[10px] tracking-wider font-bold uppercase ${className}`}
          title="Direct measurement observed in current simulation session"
        >
          <Activity className="w-3 h-3 text-[#247A4B]" />
          <span>[OBSERVED RESULT]</span>
        </span>
      );

    case 'EXPLANATION':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border border-[#D3E2F2] bg-[#EEF4FA] text-[#2F6399] font-mono text-[10px] tracking-wider font-bold uppercase ${className}`}
          title="Theoretical deduction explaining the empirical phenomena"
        >
          <FileText className="w-3 h-3 text-[#2F6399]" />
          <span>[EXPLANATION]</span>
        </span>
      );

    case 'illustration':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border border-[#EAE6DF] bg-[#FAF8F5] text-[#716F68] font-mono text-[10px] tracking-wider font-bold uppercase ${className}`}
          title="Schematic visual representation to aid conceptual intuition"
        >
          <Sparkles className="w-3 h-3 text-[#716F68]" />
          <span>[ILLUSTRATION]</span>
        </span>
      );
  }
};

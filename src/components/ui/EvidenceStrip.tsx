import React from 'react';
import { EVIDENCE, EvidenceType } from '../../constants/evidence';
import { ShieldCheck, BookOpen, Binary, Eye, Sparkles } from 'lucide-react';

interface EvidenceStripProps {
  type: EvidenceType;
  detail?: string;
  className?: string;
}

export function EvidenceStrip({ type, detail, className = '' }: EvidenceStripProps) {
  const getIcon = () => {
    switch (type) {
      case 'live':
        return <Binary className="w-3.5 h-3.5 text-[#167C80]" />;
      case 'published':
        return <BookOpen className="w-3.5 h-3.5 text-[#247A4B]" />;
      case 'abstraction':
        return <ShieldCheck className="w-3.5 h-3.5 text-[#6842C2]" />;
      case 'illustration':
        return <Eye className="w-3.5 h-3.5 text-[#A46622]" />;
      case 'precomputed':
        return <Sparkles className="w-3.5 h-3.5 text-[#2F6399]" />;
    }
  };

  const getBadgeStyle = () => {
    switch (type) {
      case 'live':
        return 'border-[#CFE8E8] bg-[#EDF7F7] text-[#167C80]';
      case 'published':
        return 'border-[#CDEEDB] bg-[#EDF8F2] text-[#247A4B]';
      case 'abstraction':
        return 'border-[#E2D8FA] bg-[#F3EFFF] text-[#6842C2]';
      case 'illustration':
        return 'border-[#F5E2C4] bg-[#FDF8EE] text-[#A46622]';
      case 'precomputed':
        return 'border-[#D3E2F2] bg-[#EEF4FA] text-[#2F6399]';
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-mono select-none ${getBadgeStyle()} ${className}`}
      title={detail ? `${EVIDENCE[type]} — ${detail}` : EVIDENCE[type]}
    >
      <span className="flex items-center gap-1.5 font-bold tracking-wider uppercase text-[10px]">
        {getIcon()}
        <span>{EVIDENCE[type]}</span>
      </span>
      {detail && (
        <>
          <span className="opacity-40">•</span>
          <span className="text-[10px] text-[#52504A] font-sans truncate max-w-[280px]">
            {detail}
          </span>
        </>
      )}
    </div>
  );
}

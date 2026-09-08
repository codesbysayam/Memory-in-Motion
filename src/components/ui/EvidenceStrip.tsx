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
        return <Binary className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />;
      case 'published':
        return <BookOpen className="w-3.5 h-3.5 text-emerald-400" />;
      case 'abstraction':
        return <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />;
      case 'illustration':
        return <Eye className="w-3.5 h-3.5 text-amber-400" />;
      case 'precomputed':
        return <Sparkles className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  const getBadgeStyle = () => {
    switch (type) {
      case 'live':
        return 'border-cyan-500/30 bg-cyan-950/40 text-cyan-300';
      case 'published':
        return 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300';
      case 'abstraction':
        return 'border-purple-500/30 bg-purple-950/40 text-purple-300';
      case 'illustration':
        return 'border-amber-500/30 bg-amber-950/40 text-amber-300';
      case 'precomputed':
        return 'border-blue-500/30 bg-blue-950/40 text-blue-300';
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
          <span className="opacity-30">•</span>
          <span className="text-[10px] text-slate-300 font-sans truncate max-w-[280px]">
            {detail}
          </span>
        </>
      )}
    </div>
  );
}

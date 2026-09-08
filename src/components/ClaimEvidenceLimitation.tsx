import React from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, BookOpen } from 'lucide-react';

export interface ClaimEvidenceLimitationProps {
  claim: string;
  evidence: string;
  limitation: string;
  sourceType?: 'live' | 'published' | 'abstraction';
}

export const ClaimEvidenceLimitation: React.FC<ClaimEvidenceLimitationProps> = ({
  claim,
  evidence,
  limitation,
  sourceType = 'live',
}) => {
  return (
    <div className="rounded-xl border border-[#20293D] bg-[#090C16] p-4 sm:p-5 font-mono text-xs space-y-3 shadow-md">
      <div className="flex items-center justify-between border-b border-[#1A2234] pb-2 text-[10px] text-slate-400 uppercase tracking-wider">
        <span className="font-bold text-white flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-[#22D3EE]" />
          EPISTEMIC AUDIT: SCIENTIFIC BOUNDARIES
        </span>
        <span className="text-[#8F96A3]">Rigorous Evaluation</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* CLAIM */}
        <div className="p-3 rounded-lg bg-[#0E1320] border border-[#1E273C] space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-purple-300 text-[11px] uppercase">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
            <span>CLAIM</span>
          </div>
          <p className="text-xs text-slate-200 font-sans leading-relaxed">
            {claim}
          </p>
        </div>

        {/* EVIDENCE */}
        <div className="p-3 rounded-lg bg-[#0E1320] border border-cyan-800/40 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-[#22D3EE] text-[11px] uppercase">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#22D3EE]" />
            <span>EVIDENCE</span>
          </div>
          <p className="text-xs text-slate-200 font-sans leading-relaxed">
            {evidence}
          </p>
        </div>

        {/* LIMITATION */}
        <div className="p-3 rounded-lg bg-[#0E1320] border border-amber-800/40 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-amber-300 text-[11px] uppercase">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>LIMITATION</span>
          </div>
          <p className="text-xs text-slate-200 font-sans leading-relaxed">
            {limitation}
          </p>
        </div>
      </div>
    </div>
  );
};

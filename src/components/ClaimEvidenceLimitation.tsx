import React from 'react';
import { CheckCircle2, AlertTriangle, BookOpen } from 'lucide-react';

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
}) => {
  return (
    <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-5 sm:p-6 font-mono text-xs space-y-4 shadow-xs text-[#151515]">
      <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-3 text-[10px] text-[#716F68] uppercase tracking-wider">
        <span className="font-bold text-[#151515] flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-[#167C80]" />
          <span>EPISTEMIC AUDIT: SCIENTIFIC BOUNDARIES</span>
        </span>
        <span className="text-[#716F68]">Rigorous Evaluation</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CLAIM */}
        <div className="p-4 rounded-xl bg-[#FAF8FD] border border-[#E2D8FA] space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-[#6842C2] text-[11px] uppercase">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#6842C2]" />
            <span>CLAIM</span>
          </div>
          <p className="text-xs text-[#2A2926] font-sans leading-relaxed">
            {claim}
          </p>
        </div>

        {/* EVIDENCE */}
        <div className="p-4 rounded-xl bg-[#EDF7F7] border border-[#CFE8E8] space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-[#167C80] text-[11px] uppercase">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#167C80]" />
            <span>EVIDENCE</span>
          </div>
          <p className="text-xs text-[#2A2926] font-sans leading-relaxed">
            {evidence}
          </p>
        </div>

        {/* LIMITATION */}
        <div className="p-4 rounded-xl bg-[#FFF8EE] border border-[#F5E2C4] space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-[#A46622] text-[11px] uppercase">
            <AlertTriangle className="w-3.5 h-3.5 text-[#A46622]" />
            <span>LIMITATION</span>
          </div>
          <p className="text-xs text-[#2A2926] font-sans leading-relaxed">
            {limitation}
          </p>
        </div>
      </div>
    </div>
  );
};

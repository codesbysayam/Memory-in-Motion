import React from 'react';

interface EquationCardProps {
  label?: string;
  formula: string;
  plainEnglish: string;
  systemImpact: string;
  id?: string;
}

export function EquationCard({
  label = "STATE UPDATE FORMULATION",
  formula,
  plainEnglish,
  systemImpact,
  id
}: EquationCardProps) {
  return (
    <div id={id} className="rounded-xl border border-[#252A35] bg-[#11141A] p-4 text-[#F4F5F7] space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#8F96A3]">
          {label}
        </span>
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B5CF6] bg-[#8B5CF6]/10 px-2 py-0.5 rounded border border-[#8B5CF6]/20">
          MATHEMATICAL DEFINITION
        </span>
      </div>

      <div className="rounded-lg bg-[#151922] border border-[#252A35] p-3 text-center overflow-x-auto">
        <div className="font-mono text-sm sm:text-base font-medium text-[#22D3EE] tracking-wide py-1">
          {formula}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg bg-[#151922]/60 p-2.5 border border-[#252A35]/50">
          <div className="text-[10px] font-mono uppercase text-[#8F96A3] mb-1">Plain English</div>
          <div className="text-[#F4F5F7] leading-relaxed">{plainEnglish}</div>
        </div>

        <div className="rounded-lg bg-[#151922]/60 p-2.5 border border-[#252A35]/50">
          <div className="text-[10px] font-mono uppercase text-[#8B5CF6] mb-1">What changes in system</div>
          <div className="text-[#F4F5F7] leading-relaxed">{systemImpact}</div>
        </div>
      </div>
    </div>
  );
}

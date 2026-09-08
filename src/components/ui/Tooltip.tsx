import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  term: string;
  definition: string;
  children?: React.ReactNode;
  id?: string;
}

export function Tooltip({ term, definition, children, id }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span id={id} className="relative inline-flex items-center">
      <span
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="cursor-help border-b border-dotted border-[#8B5CF6] text-white hover:text-[#22D3EE] transition-colors inline-flex items-center gap-0.5"
      >
        {children || term}
        <HelpCircle className="w-3 h-3 text-[#8F96A3] inline-block ml-0.5" />
      </span>

      {isOpen && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 p-2.5 bg-[#151922] border border-[#252A35] rounded-lg shadow-xl text-xs text-[#F4F5F7] text-left leading-relaxed">
          <span className="block font-mono text-[10px] uppercase tracking-wider text-[#22D3EE] mb-1 font-semibold">
            {term}
          </span>
          <span className="text-[#8F96A3] block">
            {definition}
          </span>
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#151922]" />
        </span>
      )}
    </span>
  );
}

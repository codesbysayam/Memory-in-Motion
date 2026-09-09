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
        className="cursor-help border-b border-dotted border-[#6842C2] text-[#151515] hover:text-[#6842C2] transition-colors inline-flex items-center gap-0.5 font-medium"
      >
        {children || term}
        <HelpCircle className="w-3 h-3 text-[#716F68] inline-block ml-0.5" />
      </span>

      {isOpen && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 p-3 bg-[#FFFFFF] border border-[#E5E0D8] rounded-xl shadow-xl text-xs text-[#151515] text-left leading-relaxed">
          <span className="block font-mono text-[10px] uppercase tracking-wider text-[#6842C2] mb-1 font-bold">
            {term}
          </span>
          <span className="text-[#52504A] block font-sans">
            {definition}
          </span>
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#FFFFFF]" />
        </span>
      )}
    </span>
  );
}

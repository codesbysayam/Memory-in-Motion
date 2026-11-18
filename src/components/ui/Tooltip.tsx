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
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="cursor-help border-b border-dotted border-[var(--color-accent)] text-[var(--text-primary)] hover:text-[var(--accent-blue-text)] transition-colors inline-flex items-center gap-0.5 font-medium"
      >
        {children || term}
        <HelpCircle className="w-3 h-3 text-[var(--text-muted)] inline-block ml-0.5" />
      </button>

      {isOpen && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 p-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-[var(--shadow-popover)] text-xs text-[var(--text-primary)] text-left leading-relaxed">
          <span className="block font-mono text-[11px] text-[var(--accent-blue-text)] mb-1 font-semibold">
            {term}
          </span>
          <span className="text-[var(--text-secondary)] block font-sans">
            {definition}
          </span>
        </span>
      )}
    </span>
  );
}

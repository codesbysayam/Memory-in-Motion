import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { useGlossary } from '../context/GlossaryContext';
import { findGlossaryTerm } from '../data/glossaryData';

interface GlossaryTermProps {
  term: string;
  children?: React.ReactNode;
  className?: string;
  showIcon?: boolean;
}

export const GlossaryTerm: React.FC<GlossaryTermProps> = ({
  term,
  children,
  className = '',
  showIcon = false,
}) => {
  const { openGlossary } = useGlossary();
  const [isHovered, setIsHovered] = useState(false);

  const matched = findGlossaryTerm(term);
  const displayText = children || (matched ? matched.term : term);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openGlossary(term);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      openGlossary(term);
    }
  };

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        title={matched ? `${matched.term}: ${matched.shortDefinition} (Click to open Concept Glossary)` : 'Click to inspect in Concept Glossary'}
        className={`inline-flex items-baseline font-medium cursor-pointer border-b border-dashed border-[#6842C2]/60 hover:border-[#6842C2] text-inherit hover:text-[#6842C2] hover:bg-[#6842C2]/10 transition-all rounded-xs px-0.5 -mx-0.5 focus:outline-none focus:ring-2 focus:ring-[#6842C2]/40 ${className}`}
      >
        <span>{displayText}</span>
        {showIcon && (
          <BookOpen className="w-2.5 h-2.5 ml-0.5 text-[#6842C2] opacity-70 inline" />
        )}
      </button>

      {/* Floating Hover Card Preview */}
      {isHovered && matched && (
        <span
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-[#0B0F1C] border border-[#232E44] text-white rounded-xl shadow-2xl z-50 pointer-events-none text-left animate-in fade-in zoom-in-95 duration-150"
          role="tooltip"
        >
          <span className="block text-xs font-mono uppercase tracking-wider text-[#A78BFA] font-bold mb-0.5">
            {matched.category} · CONCEPT
          </span>
          <span className="block font-bold text-xs font-mono text-white mb-1">
            {matched.term}
          </span>
          <span className="block text-xs text-slate-300 font-sans leading-relaxed line-clamp-3">
            {matched.shortDefinition}
          </span>
          <span className="mt-2 pt-1.5 border-t border-[#1C2538] flex items-center justify-between text-xs text-[#93C5FD] font-mono">
            <span>Click to inspect</span>
            <span className="text-slate-400">→</span>
          </span>
        </span>
      )}
    </span>
  );
};

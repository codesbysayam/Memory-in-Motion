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
        className={`inline-flex items-baseline font-medium cursor-pointer border-b border-dashed border-[#31566E]/50 hover:border-[#31566E] text-inherit hover:text-[#31566E] hover:bg-[#E7F2FA]/50 transition-all rounded-xs px-0.5 -mx-0.5 focus:outline-none focus:ring-1 focus:ring-[#31566E]/40 ${className}`}
      >
        <span>{displayText}</span>
        {showIcon && (
          <BookOpen className="w-2.5 h-2.5 ml-0.5 text-[#31566E] opacity-70 inline" />
        )}
      </button>

      {/* Floating Hover Card Preview */}
      {isHovered && matched && (
        <span
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-[#FFFFFF] border border-[#D8DCD8] text-[#252525] rounded-xl shadow-lg z-50 pointer-events-none text-left animate-in fade-in zoom-in-95 duration-150"
          role="tooltip"
        >
          <span className="block text-xs uppercase tracking-wider text-[#5F625F] font-semibold mb-0.5">
            {matched.category} · Concept
          </span>
          <span className="block font-bold text-xs text-[#252525] mb-1">
            {matched.term}
          </span>
          <span className="block text-xs text-[#5F625F] font-sans leading-relaxed line-clamp-3">
            {matched.shortDefinition}
          </span>
          <span className="mt-2 pt-1.5 border-t border-[#EAE6DF] flex items-center justify-between text-xs text-[#31566E] font-medium">
            <span>Click to inspect</span>
            <span className="text-[#5F625F]">→</span>
          </span>
        </span>
      )}
    </span>
  );
};

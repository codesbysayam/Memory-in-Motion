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
        className={`inline-flex items-baseline font-medium cursor-pointer border-b border-dashed border-[var(--color-accent)]/50 hover:border-[var(--color-accent)] text-inherit hover:text-[var(--accent-blue-text)] hover:bg-[var(--accent-blue)]/60 transition-all rounded-xs px-0.5 -mx-0.5 focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]/40 ${className}`}
      >
        <span>{displayText}</span>
        {showIcon && (
          <BookOpen className="w-2.5 h-2.5 ml-0.5 text-[var(--accent-blue-text)] opacity-80 inline" />
        )}
      </button>

      {/* Floating Hover Card Preview */}
      {isHovered && matched && (
        <span
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] rounded-xl shadow-[var(--shadow-popover)] z-50 pointer-events-none text-left animate-in fade-in zoom-in-95 duration-150"
          role="tooltip"
        >
          <span className="block text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-0.5">
            {matched.category} · Concept
          </span>
          <span className="block font-bold text-xs text-[var(--text-primary)] mb-1">
            {matched.term}
          </span>
          <span className="block text-xs text-[var(--text-secondary)] font-sans leading-relaxed line-clamp-3">
            {matched.shortDefinition}
          </span>
          <span className="mt-2 pt-1.5 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--accent-blue-text)] font-medium">
            <span>Click to inspect</span>
            <span className="text-[var(--text-muted)]">→</span>
          </span>
        </span>
      )}
    </span>
  );
};

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  X,
  Search,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Layers,
  Lightbulb,
  Cpu,
  Bookmark,
} from 'lucide-react';
import { useGlossary } from '../context/GlossaryContext';
import {
  GLOSSARY_TERMS,
  GLOSSARY_CATEGORIES,
  GlossaryTerm,
  GlossaryCategory,
} from '../data/glossaryData';
import { FormattedMathText } from './ui/MathView';

interface ConceptGlossaryDrawerProps {
  onNavigateSection?: (pageId: string, sectionId?: string) => void;
}

export const ConceptGlossaryDrawer: React.FC<ConceptGlossaryDrawerProps> = ({
  onNavigateSection,
}) => {
  const {
    isOpen,
    activeTerm,
    closeGlossary,
    selectTerm,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
  } = useGlossary();

  const [viewMode, setViewMode] = useState<'grid' | 'detail'>('grid');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const contentContainerRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeGlossary();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeGlossary]);

  // Reset scroll when switching view or term
  useEffect(() => {
    if (contentContainerRef.current) {
      contentContainerRef.current.scrollTop = 0;
    }
  }, [viewMode, activeTerm.id]);

  // Filtered terms list
  const filteredTerms = useMemo(() => {
    const all = Object.values(GLOSSARY_TERMS);
    return all.filter((term) => {
      const matchesCategory =
        selectedCategory === 'All' || term.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        term.term.toLowerCase().includes(q) ||
        term.shortDefinition.toLowerCase().includes(q) ||
        term.aliases.some((a) => a.toLowerCase().includes(q)) ||
        term.category.toLowerCase().includes(q) ||
        (term.formula && term.formula.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, selectedCategory]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: Object.keys(GLOSSARY_TERMS).length };
    GLOSSARY_CATEGORIES.forEach((cat) => {
      counts[cat] = Object.values(GLOSSARY_TERMS).filter((t) => t.category === cat).length;
    });
    return counts;
  }, []);

  // Previous and next terms in filtered list
  const currentFilteredIndex = filteredTerms.findIndex((t) => t.id === activeTerm.id);
  const prevTerm = currentFilteredIndex > 0 ? filteredTerms[currentFilteredIndex - 1] : null;
  const nextTerm =
    currentFilteredIndex >= 0 && currentFilteredIndex < filteredTerms.length - 1
      ? filteredTerms[currentFilteredIndex + 1]
      : null;

  const handleNavigateToLab = () => {
    if (activeTerm.targetPage && onNavigateSection) {
      onNavigateSection(activeTerm.targetPage, activeTerm.targetSectionId);
      closeGlossary();
    } else if (activeTerm.targetSectionId) {
      const el = document.getElementById(activeTerm.targetSectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        closeGlossary();
      }
    }
  };

  const handleSelectCard = (termId: string) => {
    selectTerm(termId);
    setViewMode('detail');
  };

  if (!isOpen) return null;

  return (
    <div
      className="glossary-overlay"
      onClick={closeGlossary}
      role="dialog"
      aria-modal="true"
      aria-label="Concept Glossary"
    >
      <div
        className="glossary-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Editorial Style */}
        <div className="flex-shrink-0 px-5 sm:px-7 pt-5 sm:pt-6 pb-4 border-b border-[#D9DCD8] bg-[#FFFFFF]">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-wider text-[#5F625F] uppercase font-sans">
                  Theoretical Reference
                </span>
                <span className="text-[11px] text-[#5F625F]">·</span>
                <span className="text-[11px] font-mono text-[#5F625F]">
                  {filteredTerms.length} concepts
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif text-[#252525] tracking-tight m-0">
                Concept Glossary
              </h2>
              <p className="text-xs sm:text-sm text-[#5F625F] font-sans m-0 pt-0.5">
                Mathematical foundations, state dynamics, and architectural principles.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <kbd className="hidden sm:inline-block px-2 py-1 rounded text-xs text-[#5F625F] border border-[#D9DCD8] bg-[#F7F5EF] font-mono">
                ESC
              </kbd>
              <button
                onClick={closeGlossary}
                aria-label="Close glossary"
                className="p-2 rounded-lg text-[#5F625F] hover:text-[#252525] hover:bg-[#F0F1EF] border border-[#D9DCD8] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5F625F]" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (viewMode === 'detail') {
                  setViewMode('grid');
                }
              }}
              placeholder="Search concepts, formulas, or keywords…"
              className="glossary-search w-full pl-10 pr-9 py-2.5 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5F625F] hover:text-[#252525] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-0.5 no-scrollbar">
            <button
              onClick={() => {
                setSelectedCategory('All');
                setViewMode('grid');
              }}
              className={`glossary-tab ${selectedCategory === 'All' ? 'active' : ''}`}
            >
              All ({categoryCounts['All']})
            </button>
            {GLOSSARY_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setViewMode('grid');
                }}
                className={`glossary-tab ${selectedCategory === cat ? 'active' : ''}`}
              >
                {cat} ({categoryCounts[cat] || 0})
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div
          ref={contentContainerRef}
          className="glossary-content p-5 sm:p-7"
        >
          {viewMode === 'grid' ? (
            /* Concept Grid */
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#5F625F]">
                <span>
                  Showing {filteredTerms.length} {filteredTerms.length === 1 ? 'concept' : 'concepts'}
                </span>
                <span>Click any concept to inspect formulas & theory</span>
              </div>

              {filteredTerms.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <p className="text-[#5F625F] text-sm font-sans">
                    No matching concepts found for &ldquo;{searchQuery}&rdquo;.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="px-4 py-2 rounded-lg bg-[#FFFFFF] hover:bg-[#F7F5EF] border border-[#D9DCD8] text-xs text-[#252525] transition cursor-pointer font-medium"
                  >
                    Reset Search & Filters
                  </button>
                </div>
              ) : (
                <div className="glossary-grid grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {filteredTerms.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectCard(item.id)}
                      className="glossary-card cursor-pointer group hover:-translate-y-0.5"
                    >
                      <span className="category">
                        {item.category}
                      </span>
                      <h3 className="group-hover:text-[#2B6282] transition-colors font-serif">
                        {item.term}
                      </h3>
                      <p className="flex-1 font-sans">
                        {item.shortDefinition}
                      </p>
                      <div className="mt-4 pt-3 border-t border-[#E8EBE7] flex items-center justify-between text-[11px] text-[#5F625F] group-hover:text-[#2B6282] transition-colors">
                        <span>
                          {item.formula ? 'Includes tensor formulation' : 'Theoretical concept'}
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                          Inspect <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Detailed Dossier View */
            <div className="space-y-6">
              {/* Back to grid button */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setViewMode('grid')}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F7F5EF] border border-[#D9DCD8] text-xs text-[#252525] transition cursor-pointer font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to all concepts ({filteredTerms.length})</span>
                </button>

                <div className="flex items-center gap-2 text-xs text-[#5F625F]">
                  {prevTerm && (
                    <button
                      onClick={() => selectTerm(prevTerm.id)}
                      className="flex items-center gap-1 hover:text-[#252525] transition cursor-pointer px-2 py-1 rounded hover:bg-[#FFFFFF]"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{prevTerm.term}</span>
                    </button>
                  )}
                  {nextTerm && (
                    <button
                      onClick={() => selectTerm(nextTerm.id)}
                      className="flex items-center gap-1 hover:text-[#252525] transition cursor-pointer px-2 py-1 rounded hover:bg-[#FFFFFF]"
                    >
                      <span className="hidden sm:inline">{nextTerm.term}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Title & Category */}
              <div className="space-y-2 border-b border-[#D9DCD8] pb-5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2B6282] font-sans">
                    {activeTerm.category}
                  </span>
                  {activeTerm.targetPage && (
                    <>
                      <span className="text-[#5F625F]">·</span>
                      <span className="text-xs text-[#5F625F] font-sans">
                        Stage: {activeTerm.targetPage}
                      </span>
                    </>
                  )}
                </div>
                <h1 className="text-3xl sm:text-4xl font-serif text-[#252525] tracking-tight m-0">
                  {activeTerm.term}
                </h1>

                {/* Aliases */}
                {activeTerm.aliases.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-[#5F625F]">
                    <span>Also known as:</span>
                    {activeTerm.aliases.map((alias) => (
                      <span
                        key={alias}
                        className="px-2 py-0.5 rounded bg-[#F0F1EF] border border-[#D9DCD8] text-[#252525]"
                      >
                        {alias}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Core Definition Callout */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#E7F2FA] border border-[#CDE1F0] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#21445B] uppercase tracking-wider font-sans">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Core Definition</span>
                </div>
                <p className="text-sm sm:text-base text-[#252525] leading-relaxed m-0 font-sans">
                  {activeTerm.shortDefinition}
                </p>
              </div>

              {/* Mathematical Formulation (KaTeX) */}
              {activeTerm.formula && (
                <div className="rounded-xl bg-[#FFFFFF] border border-[#D9DCD8] p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#2B6282] uppercase tracking-wider font-sans">
                    <span className="flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Mathematical Formulation</span>
                    </span>
                    <span className="text-[11px] text-[#5F625F] lowercase font-mono">tensor law</span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#F0F1EF] border border-[#D9DCD8] text-[#252525] text-sm overflow-x-auto font-mono">
                    <FormattedMathText text={activeTerm.formula} />
                  </div>

                  {activeTerm.formulaExplanation && (
                    <p className="text-xs text-[#5F625F] leading-relaxed m-0 font-sans">
                      <span className="font-semibold text-[#252525]">Notation: </span>
                      {activeTerm.formulaExplanation}
                    </p>
                  )}
                </div>
              )}

              {/* Deep Dive Theory */}
              <div className="space-y-2 bg-[#FFFFFF] border border-[#D9DCD8] rounded-xl p-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#5F625F] flex items-center gap-2 font-sans">
                  <Layers className="w-3.5 h-3.5 text-[#2B6282]" />
                  <span>Theoretical Foundation</span>
                </div>
                <p className="text-xs sm:text-sm text-[#252525] leading-relaxed m-0 font-sans">
                  {activeTerm.deepDive}
                </p>
              </div>

              {/* Physical Intuition */}
              <div className="rounded-xl bg-[#FFF5D8] border border-[#F0E3B8] p-4 sm:p-5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#5A4716] uppercase tracking-wider font-sans">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Physical Analogy & Intuition</span>
                </div>
                <p className="text-xs sm:text-sm text-[#5A4716] leading-relaxed m-0 font-sans">
                  {activeTerm.intuition}
                </p>
              </div>

              {/* Empirical Role in This Lab */}
              <div className="rounded-xl bg-[#DCEFE2] border border-[#C5DDCB] p-4 sm:p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#24452E] uppercase tracking-wider font-sans">
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>How to Experiment in This Lab</span>
                </div>
                <p className="text-xs sm:text-sm text-[#24452E] leading-relaxed m-0 font-sans">
                  {activeTerm.empiricalRole}
                </p>

                {(activeTerm.targetPage || activeTerm.targetSectionId) && (
                  <div className="pt-1">
                    <button
                      onClick={handleNavigateToLab}
                      className="btn btn-primary text-xs"
                    >
                      <span>Jump to Lab Section</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Related Concepts */}
              {activeTerm.relatedTerms.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#D9DCD8]">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#5F625F] font-sans">
                    Related Concepts
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeTerm.relatedTerms.map((relId) => {
                      const rel = GLOSSARY_TERMS[relId];
                      if (!rel) return null;
                      return (
                        <button
                          key={rel.id}
                          onClick={() => selectTerm(rel.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#D9DCD8] hover:border-[#B5B9B3] hover:bg-[#F7F5EF] text-[#252525] text-xs transition flex items-center gap-1.5 cursor-pointer font-medium"
                        >
                          <span>{rel.term}</span>
                          <ChevronRight className="w-3 h-3 text-[#5F625F]" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

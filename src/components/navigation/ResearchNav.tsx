import React, { useState } from 'react';
import { Menu, X, BookOpen, ChevronRight, Clock } from 'lucide-react';

interface ResearchNavProps {
  currentSectionId: string;
  activeSectionIndex: number;
  totalSections?: number;
  onNavigate: (sectionId: string) => void;
  onOpenIndex?: () => void;
  onStartJudgeMode?: () => void;
}

export function ResearchNav({
  currentSectionId,
  activeSectionIndex,
  totalSections = 10,
  onNavigate,
  onOpenIndex,
  onStartJudgeMode,
}: ResearchNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sectionsList = [
    { id: 'section-01', num: '01', title: '01 MEMORY', category: 'Foundation' },
    { id: 'section-05', num: '02', title: '02 BREAK', category: 'Interference' },
    { id: 'section-04', num: '03', title: '03 TRACE', category: 'Dynamics' },
    { id: 'section-measure', num: '04', title: '04 MEASURE', category: 'Analytics' },
    { id: 'section-08', num: '05', title: '05 BDH', category: 'Architecture' },
    { id: 'section-10', num: '06', title: '06 REASON', category: 'Reasoning' },
    { id: 'final-eval', num: '07', title: '07 PROVE', category: 'Evaluation' },
    { id: 'you-made-it', num: '08', title: 'CERTIFICATE', category: 'Attestation' },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E5E0D8] bg-[#FBF9F5]/90 backdrop-blur-md">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
          <button
            onClick={() => handleNavClick('landing-hero')}
            className="flex items-center gap-2 sm:gap-2.5 text-left group min-w-0 cursor-pointer"
          >
            <div className="w-7 h-7 shrink-0 rounded-lg bg-[#6842C2] flex items-center justify-center shadow-xs">
              <span className="font-serif text-xs font-bold text-white">M</span>
            </div>
            <div className="min-w-0 flex items-center">
              <span className="font-serif font-bold text-xs sm:text-sm tracking-tight text-[#151515] group-hover:text-[#6842C2] transition-colors truncate block">
                MEMORY IN MOTION
              </span>
              <span className="hidden md:inline-block ml-2 text-[10px] font-mono text-[#716F68] bg-[#F4F1EA] px-1.5 py-0.5 rounded border border-[#E5E0D8]">
                DATAFORGE 2026
              </span>
            </div>
          </button>
        </div>

        {/* Primary nav group tabs */}
        <nav className="hidden xl:flex items-center gap-1 text-xs font-mono">
          {sectionsList.map((sec) => (
            <button
              key={sec.id}
              onClick={() => handleNavClick(sec.id)}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                currentSectionId === sec.id
                  ? 'text-[#6842C2] bg-[#FFFFFF] border border-[#D8D4CB] font-bold shadow-xs'
                  : 'text-[#716F68] hover:text-[#151515] hover:bg-[#F4F1EA]'
              }`}
            >
              {sec.title}
            </button>
          ))}
        </nav>

        {/* Right side: Step counter & actions */}
        <div className="flex items-center gap-2">
          {onStartJudgeMode && (
            <button
              onClick={onStartJudgeMode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F3EFFF] hover:bg-[#EAE2FB] text-[#6842C2] border border-[#E2D8FA] font-mono text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Start 60-Second Guided Judge Experiment"
            >
              <Clock className="w-3.5 h-3.5 text-[#6842C2]" />
              <span className="hidden lg:inline">60s EXPERIMENT</span>
              <span className="lg:hidden">60s</span>
            </button>
          )}

          <div className="hidden sm:block font-mono text-xs text-[#716F68] bg-[#FFFFFF] border border-[#E5E0D8] px-2.5 py-1 rounded-lg shadow-xs">
            <span className="text-[#151515] font-semibold">{String(Math.min(activeSectionIndex, totalSections)).padStart(2, '0')}</span>
            <span className="mx-1 text-[#BDB7AB]">/</span>
            <span>{String(totalSections).padStart(2, '0')}</span>
          </div>

          {/* Table of Contents / Index Modal Trigger */}
          {onOpenIndex && (
            <button
              id="top-right-index-menu-btn"
              onClick={onOpenIndex}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#FFFFFF] hover:bg-[#F4F1EA] text-[#151515] border border-[#E5E0D8] hover:border-[#D8D4CB] transition-all shadow-xs group cursor-pointer touch-manipulation"
              title="Chapter Index & Roadmap"
              aria-label="Chapter Index & Roadmap"
            >
              <Menu className="w-5 h-5 text-[#716F68] group-hover:text-[#151515] transition-colors" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5E0D8] bg-[#FBF9F5] px-4 py-4 space-y-1 shadow-xl max-h-[80vh] overflow-y-auto">
          <div className="text-[11px] font-mono text-[#716F68] uppercase tracking-wider mb-2 px-2">
            Table of Contents
          </div>
          {sectionsList.map((sec) => (
            <button
              key={sec.id}
              onClick={() => handleNavClick(sec.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono text-left transition-colors cursor-pointer ${
                currentSectionId === sec.id
                  ? 'bg-[#FFFFFF] text-[#6842C2] border border-[#D8D4CB] font-bold shadow-xs'
                  : 'text-[#716F68] hover:text-[#151515] hover:bg-[#F4F1EA]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[#6842C2] font-semibold">{sec.num}</span>
                <span>{sec.title}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

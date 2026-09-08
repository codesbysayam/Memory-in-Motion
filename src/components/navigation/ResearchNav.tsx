import React, { useState } from 'react';
import { Menu, X, BookOpen, FlaskConical, Cpu, FileText, ChevronRight, Clock } from 'lucide-react';

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
    { id: 'section-01', num: '01', title: 'Memory Problem', category: 'Learn' },
    { id: 'section-02', num: '02', title: 'Growing Context', category: 'Learn' },
    { id: 'section-03', num: '03', title: 'Recurrent Memory', category: 'Laboratory' },
    { id: 'section-04', num: '04', title: 'Interference Lab', category: 'Laboratory' },
    { id: 'section-05', num: '05', title: 'Find the Failure', category: 'Laboratory' },
    { id: 'section-06', num: '06', title: 'Why This Matters', category: 'Laboratory' },
    { id: 'section-07', num: '07', title: 'Meet BDH', category: 'BDH' },
    { id: 'section-08', num: '08', title: 'BDH Architecture', category: 'BDH' },
    { id: 'section-09', num: '09', title: 'BDH Playground', category: 'BDH' },
    { id: 'section-10', num: '10', title: 'BDH-CQ Reasoning', category: 'BDH' },
    { id: 'section-so-what', num: '11', title: 'So What? Future', category: 'Research' },
    { id: 'evidence-sources', num: '12', title: 'Evidence & Sources', category: 'Research' },
    { id: 'final-eval', num: '13', title: 'Capstone Evaluation', category: 'Research' },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#252A35] bg-[#07080B]/90 backdrop-blur-md">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
          <button
            onClick={() => handleNavClick('landing-hero')}
            className="flex items-center gap-2 sm:gap-2.5 text-left group min-w-0"
          >
            <div className="w-7 h-7 shrink-0 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 p-[1px] flex items-center justify-center shadow-sm">
              <div className="w-full h-full bg-[#07080B] rounded-[7px] flex items-center justify-center group-hover:bg-[#11141A] transition-colors">
                <span className="font-mono text-xs font-bold text-violet-400">M</span>
              </div>
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-xs sm:text-sm tracking-wide text-white group-hover:text-[#22D3EE] transition-colors truncate block">
                MEMORY IN MOTION
              </span>
              <span className="hidden md:inline-block ml-2 text-[10px] font-mono text-[#8F96A3] bg-[#151922] px-1.5 py-0.5 rounded border border-[#252A35]">
                DATAFORGE 2026
              </span>
            </div>
          </button>
        </div>

        {/* Primary nav group tabs */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
          <button
            onClick={() => handleNavClick('section-01')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeSectionIndex <= 2
                ? 'text-white bg-[#151922] border border-[#252A35]'
                : 'text-[#8F96A3] hover:text-white hover:bg-[#11141A]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-violet-400" />
            Learn
          </button>
          <button
            onClick={() => handleNavClick('section-03')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeSectionIndex >= 3 && activeSectionIndex <= 6
                ? 'text-white bg-[#151922] border border-[#252A35]'
                : 'text-[#8F96A3] hover:text-white hover:bg-[#11141A]'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
            Laboratory
          </button>
          <button
            onClick={() => handleNavClick('section-07')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeSectionIndex >= 7 && activeSectionIndex <= 9
                ? 'text-white bg-[#151922] border border-[#252A35]'
                : 'text-[#8F96A3] hover:text-white hover:bg-[#11141A]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            BDH Architecture
          </button>
          <button
            onClick={() => handleNavClick('section-10')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeSectionIndex >= 10
                ? 'text-white bg-[#151922] border border-[#252A35]'
                : 'text-[#8F96A3] hover:text-white hover:bg-[#11141A]'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            Synthesis & Sources
          </button>
        </nav>

        {/* Right side: Step counter & mobile toggle */}
        <div className="flex items-center gap-2">
          {onStartJudgeMode && (
            <button
              onClick={onStartJudgeMode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-600/25 hover:from-cyan-500/30 hover:to-blue-600/35 text-cyan-300 border border-cyan-500/50 hover:border-cyan-400 font-mono text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="Start 60-Second Guided Judge Experiment"
            >
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden lg:inline">60s EXPERIMENT</span>
              <span className="lg:hidden">60s</span>
            </button>
          )}

          <div className="hidden sm:block font-mono text-xs text-[#8F96A3] bg-[#151922] border border-[#252A35] px-2.5 py-1 rounded-lg">
            <span className="text-white font-semibold">{String(Math.min(activeSectionIndex, totalSections)).padStart(2, '0')}</span>
            <span className="mx-1 text-[#8F96A3]">/</span>
            <span>{String(totalSections).padStart(2, '0')}</span>
          </div>

          {/* Three-dash symbol in top-right corner for Index & Roadmap */}
          {onOpenIndex && (
            <button
              id="top-right-index-menu-btn"
              onClick={onOpenIndex}
              className="flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg bg-[#141A28] hover:bg-[#1C253B] text-[#22D3EE] border border-[#252A35] hover:border-cyan-500/50 transition-all shadow-sm group cursor-pointer touch-manipulation"
              title="Open Chapter Index & Roadmap"
              aria-label="Open Chapter Index & Roadmap"
            >
              <Menu className="w-5 h-5 text-[#22D3EE] group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline font-mono text-xs font-semibold text-slate-300 group-hover:text-white">
                INDEX
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#252A35] bg-[#07080B] px-4 py-4 space-y-1 shadow-2xl max-h-[80vh] overflow-y-auto">
          <div className="text-[11px] font-mono text-[#8F96A3] uppercase tracking-wider mb-2 px-2">
            Table of Contents
          </div>
          {sectionsList.map((sec) => (
            <button
              key={sec.id}
              onClick={() => handleNavClick(sec.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono text-left transition-colors ${
                currentSectionId === sec.id
                  ? 'bg-[#151922] text-[#22D3EE] border border-[#252A35]'
                  : 'text-[#8F96A3] hover:text-white hover:bg-[#11141A]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-violet-400 font-semibold">{sec.num}</span>
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

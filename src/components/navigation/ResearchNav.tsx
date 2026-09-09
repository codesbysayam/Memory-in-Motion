import React, { useState } from 'react';
import { Menu, X, ChevronRight, Clock, Award } from 'lucide-react';

export type PageId = 'memory' | 'break' | 'trace' | 'measure' | 'bdh' | 'reason' | 'prove';

export interface PageInfo {
  id: PageId;
  num: string;
  title: string;
  subtitle: string;
}

export const PAGES: PageInfo[] = [
  { id: 'memory', num: '01', title: 'Memory', subtitle: 'Where memory lives' },
  { id: 'break', num: '02', title: 'Break', subtitle: 'Inducing failure' },
  { id: 'trace', num: '03', title: 'Trace', subtitle: 'Inside the state' },
  { id: 'measure', num: '04', title: 'Measure', subtitle: 'Capacity bounds' },
  { id: 'bdh', num: '05', title: 'BDH', subtitle: 'Synaptic networks' },
  { id: 'reason', num: '06', title: 'Reason', subtitle: 'Latent dynamics' },
  { id: 'prove', num: '07', title: 'Prove', subtitle: 'Evaluation & certificate' },
];

interface ResearchNavProps {
  currentPage: PageId;
  onPageChange: (page: PageId) => void;
  onOpenIndex?: () => void;
  onStartJudgeMode?: () => void;
  onOpenCertificate?: () => void;
}

export function ResearchNav({
  currentPage,
  onPageChange,
  onOpenIndex,
  onStartJudgeMode,
  onOpenCertificate,
}: ResearchNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentIndex = PAGES.findIndex((p) => p.id === currentPage);
  const activePageNum = currentIndex >= 0 ? currentIndex + 1 : 1;

  const handleSelect = (id: PageId) => {
    onPageChange(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E5E0D8] bg-[#FBF9F5]/95 backdrop-blur-md no-print">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-15 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSelect('memory')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[#6842C2] text-white flex items-center justify-center shadow-xs font-serif font-bold text-sm">
              M
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-sm sm:text-base tracking-tight text-[#151515] group-hover:text-[#6842C2] transition-colors leading-tight">
                Memory in Motion
              </span>
              <span className="text-[10.5px] font-sans text-[#716F68] leading-tight hidden sm:block">
                Interactive Scientific Laboratory
              </span>
            </div>
          </button>
        </div>

        {/* 7-Page Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1">
          {PAGES.map((page, index) => {
            const isActive = page.id === currentPage;
            const isCompleted = index < currentIndex;

            return (
              <button
                key={page.id}
                onClick={() => handleSelect(page.id)}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'text-[#6842C2] bg-[#FFFFFF] border border-[#D8D4CB] font-semibold shadow-xs'
                    : isCompleted
                    ? 'text-[#151515] hover:text-[#6842C2] hover:bg-[#F4F1EA]'
                    : 'text-[#716F68] hover:text-[#151515] hover:bg-[#F4F1EA]'
                }`}
              >
                <span
                  className={`font-mono text-[10px] ${
                    isActive ? 'text-[#6842C2]' : 'text-[#8C8982]'
                  }`}
                >
                  {page.num}
                </span>
                <span>{page.title}</span>
              </button>
            );
          })}
        </nav>

        {/* Right side: Progress indicator & Actions */}
        <div className="flex items-center gap-2">
          {/* Subtle 01 / 07 indicator */}
          <div className="hidden sm:flex items-center gap-1 font-mono text-xs text-[#716F68] bg-[#FFFFFF] border border-[#E5E0D8] px-2.5 py-1 rounded-lg shadow-xs">
            <span className="text-[#151515] font-semibold">
              {String(activePageNum).padStart(2, '0')}
            </span>
            <span className="text-[#BDB7AB]">/</span>
            <span>{String(PAGES.length).padStart(2, '0')}</span>
          </div>

          {/* 60s Fast Experiment CTA */}
          {onStartJudgeMode && (
            <button
              onClick={onStartJudgeMode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F3EFFF] hover:bg-[#EAE2FB] text-[#6842C2] border border-[#E2D8FA] font-sans text-xs font-semibold transition-all shadow-xs cursor-pointer"
              title="Quick 60-Second Guided Verification"
            >
              <Clock className="w-3.5 h-3.5 text-[#6842C2]" />
              <span className="hidden sm:inline">60s Experiment</span>
            </button>
          )}

          {/* Quick Certificate View if reached Prove or completed */}
          {onOpenCertificate && (
            <button
              onClick={onOpenCertificate}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#FFFFFF] text-[#247A4B] border border-[#D8D4CB] font-sans text-xs font-semibold transition-all shadow-xs cursor-pointer"
              title="View Certificate of Completion"
            >
              <Award className="w-3.5 h-3.5 text-[#247A4B]" />
              <span>Certificate</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-[#FFFFFF] hover:bg-[#F4F1EA] text-[#151515] border border-[#E5E0D8] transition-all shadow-xs cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#151515]" /> : <Menu className="w-5 h-5 text-[#716F68]" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E5E0D8] bg-[#FBF9F5] px-4 py-4 space-y-1 shadow-xl max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between text-xs text-[#716F68] font-sans px-2 pb-2">
            <span>Learning Stages</span>
            <span className="font-mono">
              Stage {activePageNum} of {PAGES.length}
            </span>
          </div>

          <div className="space-y-1">
            {PAGES.map((page, index) => {
              const isActive = page.id === currentPage;
              const isCompleted = index < currentIndex;

              return (
                <button
                  key={page.id}
                  onClick={() => handleSelect(page.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm font-sans transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#FFFFFF] text-[#6842C2] border border-[#D8D4CB] font-bold shadow-xs'
                      : 'text-[#52504A] hover:text-[#151515] hover:bg-[#F4F1EA]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[#8C8982] w-5">
                      {page.num}
                    </span>
                    <div>
                      <div className="font-medium text-[#151515] leading-tight">
                        {page.title}
                      </div>
                      <div className="text-[11px] text-[#716F68] font-normal">
                        {page.subtitle}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#8C8982]" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}

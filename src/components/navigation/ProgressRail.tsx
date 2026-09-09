import React, { useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Compass } from 'lucide-react';

interface ProgressRailProps {
  currentSectionId: string;
  onNavigate: (sectionId: string) => void;
  onOpenIndex?: () => void;
}

export function ProgressRail({ currentSectionId, onNavigate, onOpenIndex }: ProgressRailProps) {
  // Start collapsed by default on standard desktop to completely prevent covering text
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const steps = [
    { id: 'section-01', num: '01', label: 'Memory' },
    { id: 'section-02', num: '02', label: 'Context' },
    { id: 'section-03', num: '03', label: 'State' },
    { id: 'section-measure', num: '04', label: 'Measure' },
    { id: 'section-04', num: '05', label: 'Interference' },
    { id: 'section-05', num: '06', label: 'Failure' },
    { id: 'section-06', num: '07', label: 'Trade-offs' },
    { id: 'section-07', num: '08', label: 'BDH' },
    { id: 'section-08', num: '09', label: 'Synapses' },
    { id: 'section-09', num: '10', label: 'Playground' },
    { id: 'section-10', num: '11', label: 'Reasoning' },
    { id: 'final-eval', num: '12', label: 'Evaluation' },
  ];

  const currentActiveStep = steps.find((s) => s.id === currentSectionId) || steps[0];

  return (
    <aside
      aria-label="Investigation progress rail"
      className="hidden xl:block fixed left-4 top-20 z-30 transition-all duration-300"
    >
      {isCollapsed ? (
        /* Collapsed pill mode: compact, never blocks reading */
        <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-[#FFFFFF]/95 backdrop-blur-md border border-[#E5E0D8] shadow-md text-[#151515]">
          <button
            onClick={() => setIsCollapsed(false)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono bg-[#FAF8F5] hover:bg-[#F3EFFF] text-[#6842C2] border border-[#E5E0D8] transition-all cursor-pointer"
            title="Expand Investigation Rail"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="font-bold">{currentActiveStep.num}</span>
            <span className="text-[#716F68]">/ 12</span>
            <ChevronRight className="w-3 h-3 text-[#716F68]" />
          </button>

          {onOpenIndex && (
            <button
              onClick={onOpenIndex}
              className="p-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#F3EFFF] text-[#6842C2] border border-[#E5E0D8] transition-all cursor-pointer"
              title="Open Chapter Index"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        /* Expanded mode: sleek, warm light editorial, non-overlapping */
        <nav
          aria-label="Progress Rail"
          className="flex flex-col gap-2 p-3.5 rounded-2xl bg-[#FFFFFF]/95 backdrop-blur-xl border border-[#E5E0D8] w-48 shadow-lg animate-in fade-in duration-200 text-[#151515]"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-[#EAE6DF] text-[10px] font-mono uppercase tracking-wider text-[#716F68]">
            <span className="font-bold text-[#151515] flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-[#167C80]" />
              CHAPTERS
            </span>

            <div className="flex items-center gap-1">
              {onOpenIndex && (
                <button
                  onClick={onOpenIndex}
                  className="px-2 py-0.5 rounded-md bg-[#F3EFFF] border border-[#E2D8FA] text-[#6842C2] hover:bg-[#ECE5FC] transition cursor-pointer font-bold"
                  title="Open Dedicated Chapter Index"
                >
                  INDEX
                </button>
              )}
              <button
                onClick={() => setIsCollapsed(true)}
                className="p-0.5 rounded-md hover:bg-[#FAF8F5] text-[#716F68] hover:text-[#151515] transition cursor-pointer"
                title="Collapse Rail"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Chapter Buttons List */}
          <div className="flex flex-col gap-0.5 max-h-[70vh] overflow-y-auto pr-0.5">
            {steps.map((step) => {
              const isActive = currentSectionId === step.id;

              return (
                <button
                  key={step.id}
                  onClick={() => onNavigate(step.id)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#F3EFFF] text-[#6842C2] border border-[#E2D8FA] font-bold shadow-xs'
                      : 'text-[#716F68] hover:text-[#151515] hover:bg-[#FAF8F5] border border-transparent'
                  }`}
                >
                  <span
                    className={`text-[10px] font-bold ${
                      isActive ? 'text-[#6842C2]' : 'text-[#A09D94]'
                    }`}
                  >
                    {step.num}
                  </span>
                  <span className="truncate text-[11px]">{step.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#6842C2] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Dedicated Index Page Trigger Button at bottom */}
          {onOpenIndex && (
            <button
              onClick={onOpenIndex}
              className="mt-1 w-full py-1.5 px-2 rounded-xl bg-[#F3EFFF] border border-[#E2D8FA] text-[#6842C2] text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 hover:bg-[#ECE5FC] transition-colors cursor-pointer"
            >
              <BookOpen className="w-3 h-3 text-[#6842C2]" />
              <span>FULL CHAPTER INDEX</span>
            </button>
          )}
        </nav>
      )}
    </aside>
  );
}

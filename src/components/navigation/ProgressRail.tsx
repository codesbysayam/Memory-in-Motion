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
    { id: 'section-04', num: '04', label: 'Interference' },
    { id: 'section-05', num: '05', label: 'Failure' },
    { id: 'section-06', num: '06', label: 'Trade-offs' },
    { id: 'section-07', num: '07', label: 'BDH' },
    { id: 'section-08', num: '08', label: 'Synapses' },
    { id: 'section-09', num: '09', label: 'Playground' },
    { id: 'section-10', num: '10', label: 'Reasoning' },
    { id: 'evidence-sources', num: '11', label: 'Evidence' },
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
        <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-[#080B12]/95 backdrop-blur-md border border-[#252A35] shadow-2xl">
          <button
            onClick={() => setIsCollapsed(false)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono bg-[#121622] hover:bg-[#182030] text-[#22D3EE] border border-[#252A35] transition-all"
            title="Expand Investigation Rail"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="font-bold">{currentActiveStep.num}</span>
            <span className="text-slate-400">/ 12</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </button>

          {onOpenIndex && (
            <button
              onClick={onOpenIndex}
              className="p-1.5 rounded-lg bg-[#121622] hover:bg-[#182030] text-purple-400 border border-[#252A35] transition-all"
              title="Open Chapter Index"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        /* Expanded mode: sleek, well-formatted, non-overlapping */
        <nav
          aria-label="Progress Rail"
          className="flex flex-col gap-2 p-3 rounded-2xl bg-[#070910]/95 backdrop-blur-xl border border-[#232B3C] w-48 shadow-2xl animate-in fade-in duration-200"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-[#1E2536] text-[10px] font-mono uppercase tracking-wider text-slate-400">
            <span className="font-bold text-white flex items-center gap-1">
              <Compass className="w-3 h-3 text-[#22D3EE]" />
              CHAPTERS
            </span>

            <div className="flex items-center gap-1">
              {onOpenIndex && (
                <button
                  onClick={onOpenIndex}
                  className="px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-800/60 text-purple-300 hover:bg-purple-900/60 transition"
                  title="Open Dedicated Chapter Index"
                >
                  INDEX
                </button>
              )}
              <button
                onClick={() => setIsCollapsed(true)}
                className="p-0.5 rounded hover:bg-[#151922] text-slate-400 hover:text-white transition"
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
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono text-left transition-all ${
                    isActive
                      ? 'bg-cyan-950/60 text-[#22D3EE] border border-cyan-700/50 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-[#141824] border border-transparent'
                  }`}
                >
                  <span
                    className={`text-[10px] font-bold ${
                      isActive ? 'text-[#22D3EE]' : 'text-slate-500'
                    }`}
                  >
                    {step.num}
                  </span>
                  <span className="truncate text-[11px]">{step.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#22D3EE] animate-pulse shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Dedicated Index Page Trigger Button at bottom */}
          {onOpenIndex && (
            <button
              onClick={onOpenIndex}
              className="mt-1 w-full py-1.5 px-2 rounded-lg bg-gradient-to-r from-purple-950/60 to-cyan-950/60 border border-purple-700/40 text-purple-200 text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 hover:border-purple-500 transition-colors"
            >
              <BookOpen className="w-3 h-3 text-[#22D3EE]" />
              <span>FULL CHAPTER INDEX</span>
            </button>
          )}
        </nav>
      )}
    </aside>
  );
}

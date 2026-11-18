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
        <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-[var(--surface)]/95 backdrop-blur-md border border-[var(--border)] shadow-md text-[var(--text-primary)]">
          <button
            onClick={() => setIsCollapsed(false)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono tabular-nums bg-[var(--surface-soft)] hover:bg-[var(--color-accent-soft)] text-[var(--color-accent-ink)] border border-[var(--border)] transition-all cursor-pointer"
            title="Expand Investigation Rail"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="font-semibold">{currentActiveStep.num}</span>
            <span className="text-[var(--text-muted)]">/ 12</span>
            <ChevronRight className="w-3 h-3 text-[var(--text-muted)]" />
          </button>

          {onOpenIndex && (
            <button
              onClick={onOpenIndex}
              className="p-1.5 rounded-lg bg-[var(--surface-soft)] hover:bg-[var(--color-accent-soft)] text-[var(--color-accent-ink)] border border-[var(--border)] transition-all cursor-pointer"
              title="Open Chapter Index"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        <nav
          aria-label="Progress Rail"
          className="flex flex-col gap-2 p-3.5 rounded-xl bg-[var(--surface)]/95 backdrop-blur-xl border border-[var(--border)] w-48 shadow-lg animate-in fade-in duration-200 text-[var(--text-primary)]"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border)] text-[11px] font-sans font-medium text-[var(--text-muted)]">
            <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[var(--accent-blue-text)]" />
              Chapters
            </span>

            <div className="flex items-center gap-1">
              {onOpenIndex && (
                <button
                  onClick={onOpenIndex}
                  className="px-2 py-0.5 rounded-md bg-[var(--color-accent-soft)] border border-[var(--color-border-strong)] text-[var(--color-accent-ink)] hover:opacity-90 transition cursor-pointer font-medium text-[11px]"
                  title="Open Dedicated Chapter Index"
                >
                  Index
                </button>
              )}
              <button
                onClick={() => setIsCollapsed(true)}
                className="p-0.5 rounded-md hover:bg-[var(--surface-soft)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition cursor-pointer"
                title="Collapse Rail"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-0.5 max-h-[70vh] overflow-y-auto pr-0.5">
            {steps.map((step) => {
              const isActive = currentSectionId === step.id;

              return (
                <button
                  key={step.id}
                  onClick={() => onNavigate(step.id)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-sans text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent-ink)] border border-[var(--color-border-strong)] font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)] border border-transparent'
                  }`}
                >
                  <span
                    className={`text-[11px] font-mono tabular-nums ${
                      isActive ? 'text-[var(--color-accent-ink)]' : 'text-[var(--text-muted)]'
                    }`}
                  >
                    {step.num}
                  </span>
                  <span className="truncate">{step.label}</span>
                </button>
              );
            })}
          </div>

          {onOpenIndex && (
            <button
              onClick={onOpenIndex}
              className="mt-1 w-full py-1.5 px-2.5 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-sans font-medium flex items-center justify-center gap-1.5 hover:bg-[var(--color-surface-muted)] transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-[var(--accent-blue-text)]" />
              <span>Chapter Index</span>
            </button>
          )}
        </nav>
      )}
    </aside>
  );
}

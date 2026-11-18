import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface JourneyStep {
  id: string;
  num: string;
  title: string;
  shortDesc: string;
}

export const JOURNEY_STEPS: JourneyStep[] = [
  { id: 'landing-demo', num: '00', title: 'Where Does Memory Live?', shortDesc: 'Immediate live experiment' },
  { id: 'memory-problem', num: '01', title: 'The Memory Problem', shortDesc: 'Token history vs state' },
  { id: 'growing-context', num: '02', title: 'Growing Context', shortDesc: 'Side-by-side scaling' },
  { id: 'recurrent-memory', num: '03', title: 'Fixed-Size State', shortDesc: 'Mathematical toy model' },
  { id: 'interference-lab', num: '04', title: 'Interference', shortDesc: 'State heatmap & breakdown' },
  { id: 'find-failure', num: '05', title: 'Find the Failure', shortDesc: 'Deterministic challenge' },
  { id: 'why-matters', num: '06', title: 'Why This Matters', shortDesc: 'The foundational trade-off' },
  { id: 'meet-bdh', num: '07', title: 'Meet BDH', shortDesc: 'Dragon Hatchling post-transformer' },
  { id: 'synaptic-memory', num: '08', title: 'Synaptic Memory', shortDesc: 'Graph & connection updates' },
  { id: 'bdh-playground', num: '09', title: 'BDH Playground', shortDesc: 'Local dynamics sandbox' },
  { id: 'bdh-cq', num: '10', title: 'BDH-CQ Reasoning', shortDesc: 'Latent in-context learning' },
  { id: 'research-evidence', num: '11', title: 'Evidence & Papers', shortDesc: 'Verified citations' },
  { id: 'final-eval', num: '12', title: '60s Test & Challenge', shortDesc: 'Predict & verify' },
];

interface JourneyNavProps {
  activeSection: string;
  onSelectSection: (id: string) => void;
}

export const JourneyNav: React.FC<JourneyNavProps> = ({ activeSection, onSelectSection }) => {
  return (
    <div className="border-b border-[var(--border)] bg-[var(--surface-soft)] py-2 text-[var(--text-primary)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between pb-1.5">
          <span className="font-sans text-xs font-medium text-[var(--text-muted)]">
            Learning Journey · 12 Modules
          </span>
          <span className="font-sans text-xs text-[var(--accent-blue-text)]">
            Click step to navigate
          </span>
        </div>

        {/* Horizontally scrollable step buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {JOURNEY_STEPS.map((step, idx) => {
            const isActive = activeSection === step.id;
            return (
              <React.Fragment key={step.id}>
                <button
                  id={`nav-btn-${step.id}`}
                  onClick={() => onSelectSection(step.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1 transition-all cursor-pointer ${
                    isActive
                      ? 'border-[var(--color-border-strong)] bg-[var(--color-accent-soft)] font-semibold text-[var(--color-accent-ink)]'
                      : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--color-border-strong)] hover:text-[var(--text-primary)]'
                  }`}
                  title={`${step.title}: ${step.shortDesc}`}
                >
                  <span className="font-mono tabular-nums text-xs text-[var(--accent-blue-text)]">{step.num}</span>
                  <span className="whitespace-nowrap">{step.title}</span>
                </button>
                {idx < JOURNEY_STEPS.length - 1 && (
                  <ChevronRight className="h-3 w-3 shrink-0 text-[var(--text-muted)]" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

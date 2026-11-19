import React, { useEffect, useRef } from 'react';

export interface ScrollyStepItem {
  id: string;
  eyebrow?: string;
  label?: string;
  title: string;
  body: React.ReactNode;
}

export type ScrollyStep = ScrollyStepItem;

interface StickyScrollySectionProps {
  steps: ScrollyStepItem[];
  activeStepIndex?: number;
  activeStep?: number;
  onStepChange: (index: number) => void;
  visual?: React.ReactNode;
  figure?: React.ReactNode;
  reverse?: boolean;
}

export const StickyScrollySection: React.FC<StickyScrollySectionProps> = ({
  steps,
  activeStepIndex,
  activeStep,
  onStepChange,
  visual,
  figure,
  reverse = false,
}) => {
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const resolvedStepIndex = activeStepIndex ?? activeStep ?? 0;
  const resolvedVisual = visual ?? figure;

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idxAttr = entry.target.getAttribute('data-step-index');
            if (idxAttr !== null) {
              const idx = parseInt(idxAttr, 10);
              if (!Number.isNaN(idx)) {
                onStepChange(idx);
              }
            }
          }
        });
      },
      {
        rootMargin: '-32% 0px -45% 0px',
        threshold: 0.1,
      }
    );

    stepRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [steps.length, onStepChange]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
      <div className={`lg:col-span-5 space-y-4 ${reverse ? 'lg:order-2' : 'lg:order-1'}`}>
        {steps.map((step, idx) => {
          const isActive = idx === resolvedStepIndex;
          const eyebrowText = step.eyebrow ?? step.label ?? '';
          return (
            <div
              key={step.id}
              ref={(el) => {
                stepRefs.current[idx] = el;
              }}
              role="button"
              tabIndex={0}
              data-step-index={idx}
              onClick={() => onStepChange(idx)}
              onKeyDown={(e) => {
                if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onStepChange(idx);
                }
              }}
              className={`scrolly-step w-full text-left block cursor-pointer ${
                isActive ? 'is-active' : ''
              }`}
              aria-current={isActive ? 'step' : undefined}
            >
              {eyebrowText && <div className="essay-eyebrow mb-1">{eyebrowText}</div>}
              <h3 className="font-serif text-xl sm:text-2xl font-normal text-[var(--text-primary)] leading-snug mb-1.5">
                {step.title}
              </h3>
              <div className="text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
                {step.body}
              </div>
            </div>
          );
        })}
      </div>

      <div
        className={`lg:col-span-7 lg:sticky lg:top-20 essay-figure-stage ${
          reverse ? 'lg:order-1' : 'lg:order-2'
        }`}
      >
        {resolvedVisual}
      </div>
    </div>
  );
};

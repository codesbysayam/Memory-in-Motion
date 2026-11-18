import React from 'react';
import { Info, AlertTriangle, AlertCircle, CheckCircle2, BookOpen } from 'lucide-react';

export type ResearchCalloutTone = 'info' | 'warning' | 'danger' | 'success' | 'neutral';

export interface ResearchCalloutProps {
  tone?: ResearchCalloutTone;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

const TONE_CLASSES: Record<ResearchCalloutTone, { rule: string; iconColor: string; titleColor: string }> = {
  info: {
    rule: 'border-[var(--mm-rule)] bg-[var(--mm-paper-bright)]',
    iconColor: 'text-[var(--mm-signal)]',
    titleColor: 'text-[var(--text-primary)]',
  },
  warning: {
    rule: 'border-[var(--color-warning-border)] bg-[var(--accent-yellow)]',
    iconColor: 'text-[var(--accent-yellow-text)]',
    titleColor: 'text-[var(--accent-yellow-text)]',
  },
  danger: {
    rule: 'border-[var(--color-danger-border)] bg-[var(--accent-pink)]',
    iconColor: 'text-[var(--accent-pink-text)]',
    titleColor: 'text-[var(--accent-pink-text)]',
  },
  success: {
    rule: 'border-[var(--color-success-border)] bg-[var(--accent-green)]',
    iconColor: 'text-[var(--accent-green-text)]',
    titleColor: 'text-[var(--accent-green-text)]',
  },
  neutral: {
    rule: 'border-[var(--mm-rule)] bg-[var(--surface-soft)]',
    iconColor: 'text-[var(--text-secondary)]',
    titleColor: 'text-[var(--text-primary)]',
  },
};

export const ResearchCallout: React.FC<ResearchCalloutProps> = ({
  tone = 'neutral',
  title,
  children,
  className = '',
  id,
}) => {
  const style = TONE_CLASSES[tone];

  const Icon =
    tone === 'warning'
      ? AlertTriangle
      : tone === 'danger'
      ? AlertCircle
      : tone === 'success'
      ? CheckCircle2
      : tone === 'info'
      ? Info
      : BookOpen;

  return (
    <div
      id={id}
      className={`border-y py-4 px-5 text-sm leading-relaxed ${style.rule} ${className}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${style.iconColor}`} aria-hidden="true" />
        <div className="min-w-0 flex-1 space-y-1">
          {title && (
            <div className={`font-sans text-xs font-semibold uppercase tracking-wider font-mono ${style.titleColor}`}>
              {title}
            </div>
          )}
          <div className="text-[var(--text-secondary)] font-sans text-xs sm:text-sm leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

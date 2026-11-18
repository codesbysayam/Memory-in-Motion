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

const TONE_CLASSES: Record<ResearchCalloutTone, { container: string; iconColor: string; titleColor: string }> = {
  info: {
    container: 'bg-[var(--accent-blue)] border-[var(--border)]',
    iconColor: 'text-[var(--accent-blue-text)]',
    titleColor: 'text-[var(--accent-blue-text)]',
  },
  warning: {
    container: 'bg-[var(--accent-yellow)] border-[var(--color-warning-border)]',
    iconColor: 'text-[var(--accent-yellow-text)]',
    titleColor: 'text-[var(--accent-yellow-text)]',
  },
  danger: {
    container: 'bg-[var(--accent-pink)] border-[var(--color-danger-border)]',
    iconColor: 'text-[var(--accent-pink-text)]',
    titleColor: 'text-[var(--accent-pink-text)]',
  },
  success: {
    container: 'bg-[var(--accent-green)] border-[var(--color-success-border)]',
    iconColor: 'text-[var(--accent-green-text)]',
    titleColor: 'text-[var(--accent-green-text)]',
  },
  neutral: {
    container: 'bg-[var(--surface-soft)] border-[var(--border)]',
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
      className={`rounded-xl border p-4 sm:p-5 text-sm leading-relaxed ${style.container} ${className}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${style.iconColor}`} aria-hidden="true" />
        <div className="min-w-0 flex-1 space-y-1.5">
          {title && (
            <div className={`font-sans text-sm font-semibold leading-snug ${style.titleColor}`}>
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

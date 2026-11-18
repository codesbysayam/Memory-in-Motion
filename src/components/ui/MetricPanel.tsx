import React from 'react';

export type MetricPanelTone = 'default' | 'accent' | 'success' | 'warning' | 'danger';

export interface MetricPanelProps {
  label: React.ReactNode;
  value: React.ReactNode;
  unit?: React.ReactNode;
  caption?: React.ReactNode;
  tone?: MetricPanelTone;
  className?: string;
  id?: string;
}

const VALUE_TONE_CLASSES: Record<MetricPanelTone, string> = {
  default: 'text-[var(--text-primary)]',
  accent: 'text-[var(--accent-blue-text)]',
  success: 'text-[var(--accent-green-text)]',
  warning: 'text-[var(--accent-yellow-text)]',
  danger: 'text-[var(--accent-pink-text)]',
};

export const MetricPanel: React.FC<MetricPanelProps> = ({
  label,
  value,
  unit,
  caption,
  tone = 'default',
  className = '',
  id,
}) => {
  return (
    <div
      id={id}
      className={`metric-panel flex flex-col justify-between gap-1.5 ${className}`}
    >
      <div className="font-mono text-[11px] font-medium text-[var(--text-muted)] leading-snug">
        {label}
      </div>
      <div className="flex items-baseline gap-1.5 min-w-0">
        <span className={`font-mono text-xl sm:text-2xl font-semibold tabular-nums tracking-tight truncate ${VALUE_TONE_CLASSES[tone]}`}>
          {value}
        </span>
        {unit && (
          <span className="font-mono text-xs text-[var(--text-muted)] shrink-0">
            {unit}
          </span>
        )}
      </div>
      {caption && (
        <div className="text-xs font-sans text-[var(--text-secondary)] leading-snug pt-1 border-t border-[var(--border)]">
          {caption}
        </div>
      )}
    </div>
  );
};

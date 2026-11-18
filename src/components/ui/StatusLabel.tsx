import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  Cpu,
  BookOpen,
  ShieldCheck,
  Eye,
  Binary,
  Activity,
} from 'lucide-react';

export type StatusKind =
  | 'correct'
  | 'interference'
  | 'decayed'
  | 'unknown'
  | 'toy'
  | 'primary'
  | 'official'
  | 'illustration'
  | 'live'
  | 'published'
  | 'observed'
  | 'neutral';

export interface StatusLabelProps {
  status: StatusKind;
  label?: string;
  className?: string;
  title?: string;
}

const CONFIG: Record<
  StatusKind,
  { defaultLabel: string; classes: string; icon: React.ComponentType<{ className?: string }> }
> = {
  correct: {
    defaultLabel: 'Correct',
    classes: 'bg-[var(--accent-green)] text-[var(--accent-green-text)] border-[var(--color-success-border)]',
    icon: CheckCircle2,
  },
  interference: {
    defaultLabel: 'Interference',
    classes: 'bg-[var(--accent-yellow)] text-[var(--accent-yellow-text)] border-[var(--color-warning-border)]',
    icon: AlertTriangle,
  },
  decayed: {
    defaultLabel: 'Decayed',
    classes: 'bg-[var(--accent-pink)] text-[var(--accent-pink-text)] border-[var(--color-danger-border)]',
    icon: AlertCircle,
  },
  unknown: {
    defaultLabel: 'Unknown',
    classes: 'bg-[var(--surface-soft)] text-[var(--text-secondary)] border-[var(--border)]',
    icon: HelpCircle,
  },
  toy: {
    defaultLabel: 'Toy Model',
    classes: 'bg-[var(--accent-yellow)] text-[var(--accent-yellow-text)] border-[var(--color-warning-border)]',
    icon: Cpu,
  },
  primary: {
    defaultLabel: 'Primary Source',
    classes: 'bg-[var(--accent-blue)] text-[var(--accent-blue-text)] border-[var(--border)]',
    icon: BookOpen,
  },
  official: {
    defaultLabel: 'Official Material',
    classes: 'bg-[var(--accent-green)] text-[var(--accent-green-text)] border-[var(--color-success-border)]',
    icon: ShieldCheck,
  },
  illustration: {
    defaultLabel: 'Schematic Illustration',
    classes: 'bg-[var(--surface-soft)] text-[var(--text-secondary)] border-[var(--border)]',
    icon: Eye,
  },
  live: {
    defaultLabel: 'Live Computation',
    classes: 'bg-[var(--accent-blue)] text-[var(--accent-blue-text)] border-[var(--border)]',
    icon: Binary,
  },
  published: {
    defaultLabel: 'Published Literature',
    classes: 'bg-[var(--accent-green)] text-[var(--accent-green-text)] border-[var(--color-success-border)]',
    icon: BookOpen,
  },
  observed: {
    defaultLabel: 'Observed Result',
    classes: 'bg-[var(--accent-green)] text-[var(--accent-green-text)] border-[var(--color-success-border)]',
    icon: Activity,
  },
  neutral: {
    defaultLabel: 'Note',
    classes: 'bg-[var(--surface-soft)] text-[var(--text-secondary)] border-[var(--border)]',
    icon: HelpCircle,
  },
};

export const StatusLabel: React.FC<StatusLabelProps> = ({
  status,
  label,
  className = '',
  title,
}) => {
  const cfg = CONFIG[status] ?? CONFIG.neutral;
  const Icon = cfg.icon;

  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border font-mono text-[11px] font-medium leading-tight whitespace-nowrap shrink-0 ${cfg.classes} ${className}`}
    >
      <Icon className="w-3 h-3 shrink-0" aria-hidden="true" />
      <span>{label ?? cfg.defaultLabel}</span>
    </span>
  );
};

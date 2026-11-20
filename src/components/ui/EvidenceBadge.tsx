import React from 'react';

export type EvidenceCategory = 'PRIMARY SOURCE' | 'OFFICIAL PATHWAY MATERIAL' | 'OUR TOY EXPERIMENT' | 'ILLUSTRATION';

interface EvidenceBadgeProps {
  category: EvidenceCategory;
  className?: string;
}

export function EvidenceBadge({ category, className = '' }: EvidenceBadgeProps) {
  const styles: Record<EvidenceCategory, string> = {
    'PRIMARY SOURCE': 'bg-[var(--accent-blue)] text-[var(--accent-blue-text)] border-[var(--border)]',
    'OFFICIAL PATHWAY MATERIAL': 'bg-[var(--accent-green)] text-[var(--accent-green-text)] border-[var(--color-success-border)]',
    'OUR TOY EXPERIMENT': 'bg-[var(--accent-yellow)] text-[var(--accent-yellow-text)] border-[var(--color-warning-border)]',
    'ILLUSTRATION': 'bg-[var(--surface-soft)] text-[var(--text-secondary)] border-[var(--border)]',
  };

  const labels: Record<EvidenceCategory, string> = {
    'PRIMARY SOURCE': 'Primary Source',
    'OFFICIAL PATHWAY MATERIAL': 'Official Material',
    'OUR TOY EXPERIMENT': 'Toy Experiment',
    'ILLUSTRATION': 'Illustration',
  };

  return (
    <span
      className={`inline-flex items-center text-[11px] font-mono font-medium px-2 py-0.5 rounded-md border ${styles[category]} ${className}`}
    >
      {labels[category] ?? category}
    </span>
  );
}

interface SourceCardProps {
  title: string;
  authors?: string;
  year?: string | number;
  source: string;
  category: EvidenceCategory;
  whyItMatters: string;
  link?: string;
  id?: string;
}

export function SourceCard({
  title,
  authors,
  year,
  source,
  category,
  whyItMatters,
  link,
  id
}: SourceCardProps) {
  return (
    <div id={id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 text-[var(--text-primary)] space-y-3">
      <div className="flex items-center justify-between gap-2">
        <EvidenceBadge category={category} />
        {year && <span className="font-mono text-xs tabular-nums text-[var(--text-muted)]">{year}</span>}
      </div>

      <div>
        <h4 className="font-sans font-semibold text-[var(--text-primary)] text-base leading-snug">
          {link ? (
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="hover:text-[var(--accent-blue-text)] transition-colors underline decoration-[var(--border)] underline-offset-4"
            >
              {title}
            </a>
          ) : (
            title
          )}
        </h4>
        {authors && <p className="text-xs text-[var(--text-secondary)] mt-1">{authors}</p>}
        <p className="text-xs font-mono text-[var(--accent-blue-text)] mt-1">{source}</p>
      </div>

      <div className="rounded-lg bg-[var(--surface-soft)] p-3 border border-[var(--border)] text-xs text-[var(--text-secondary)] leading-relaxed">
        <span className="text-[var(--text-primary)] font-medium block mb-0.5">Why it matters here</span>
        {whyItMatters}
      </div>
    </div>
  );
}

import React from 'react';
import { StatusLabel } from './StatusLabel';

export interface TruthModelProps {
  truth: string;
  model: string;
  label?: string;
  confidence?: number;
  margin?: number;
  status?: 'match' | 'interference' | 'forgotten';
  explanation?: string;
  id?: string;
}

export function TruthModel({
  truth,
  model,
  label = "Capital of Japan",
  confidence,
  margin,
  status = "match",
  explanation,
  id
}: TruthModelProps) {
  const isMatch = status === 'match';
  const isInterference = status === 'interference';

  const statusColor = isMatch
    ? 'text-[var(--accent-green-text)] border-[var(--color-success-border)] bg-[var(--accent-green)]'
    : isInterference
    ? 'text-[var(--accent-yellow-text)] border-[var(--color-warning-border)] bg-[var(--accent-yellow)]'
    : 'text-[var(--accent-pink-text)] border-[var(--color-danger-border)] bg-[var(--accent-pink)]';

  const statusBadge = isMatch ? (
    <StatusLabel status="correct" label="State match" />
  ) : isInterference ? (
    <StatusLabel status="interference" label="Interference" />
  ) : (
    <StatusLabel status="decayed" label="Decayed" />
  );

  return (
    <div id={id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-[var(--text-primary)] space-y-3">
      <div className="flex items-center justify-between gap-2 text-xs text-[var(--text-muted)] font-mono">
        <span className="truncate">{label}</span>
        {statusBadge}
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] p-3">
          <div className="text-[11px] text-[var(--text-muted)] font-mono mb-1">Ground truth</div>
          <div className="font-serif font-semibold text-[var(--text-primary)] text-base">{truth}</div>
        </div>

        <div className={`rounded-lg border p-3 ${statusColor}`}>
          <div className="text-[11px] opacity-85 font-mono mb-1">Model prediction</div>
          <div className="font-serif font-semibold text-base">{model}</div>
        </div>
      </div>

      {(confidence !== undefined || margin !== undefined) && (
        <div className="flex items-center justify-between gap-2 text-xs font-mono tabular-nums text-[var(--text-secondary)] pt-2 border-t border-[var(--border)]">
          {confidence !== undefined && (
            <span>
              Cosine sim: <strong className="text-[var(--text-primary)]">{confidence.toFixed(3)}</strong>
            </span>
          )}
          {margin !== undefined && (
            <span>
              Margin:{' '}
              <strong className={margin > 0.1 ? 'text-[var(--accent-green-text)]' : 'text-[var(--accent-yellow-text)]'}>
                {margin > 0 ? `+${margin.toFixed(2)}` : margin.toFixed(2)}
              </strong>
            </span>
          )}
        </div>
      )}

      {explanation && (
        <div className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed border-t border-[var(--border)] pt-2">
          {explanation}
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { BookOpen, Download, Trash2, CheckCircle2, AlertTriangle, Copy } from 'lucide-react';

export interface NotebookEntry {
  id: string;
  timestamp: string;
  type: 'parameter' | 'run' | 'prediction' | 'failure' | 'recovery' | 'preset';
  title: string;
  detail: string;
  tags?: string[];
}

interface ExperimentNotebookProps {
  entries: NotebookEntry[];
  onClear: () => void;
  className?: string;
}

export const ExperimentNotebook: React.FC<ExperimentNotebookProps> = ({
  entries,
  onClear,
  className = '',
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleExportText = () => {
    const text = entries
      .map(
        (e) =>
          `[${e.timestamp}] ${e.type.toUpperCase()}: ${e.title}\n  Details: ${e.detail}`
      )
      .join('\n\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memory-experiment-notebook-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`diagram-frame p-5 flex flex-col font-mono text-xs tabular-nums ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3 mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[var(--accent-blue-text)]" />
          <span className="font-semibold text-[var(--text-primary)]">
            Experiment notebook
          </span>
          <span className="text-[11px] bg-[var(--accent-blue)] text-[var(--accent-blue-text)] px-2 py-0.5 rounded border border-[var(--border)] font-semibold">
            {entries.length} logged
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleExportText}
            className="btn-secondary py-1 px-2 text-[11px]"
            title="Copy as Plain Text"
          >
            <Copy className="w-3 h-3 text-[var(--accent-blue-text)]" />
            <span>{copied ? 'Copied ✓' : 'Copy'}</span>
          </button>
          <button
            type="button"
            onClick={handleExportJSON}
            className="btn-secondary py-1 px-2 text-[11px]"
            title="Export JSON"
          >
            <Download className="w-3 h-3 text-[var(--accent-blue-text)]" />
            <span>JSON</span>
          </button>
          {entries.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="p-1.5 px-2 rounded-lg bg-[var(--accent-pink)] hover:opacity-90 text-[var(--accent-pink-text)] border border-[var(--color-danger-border)] text-[11px] transition cursor-pointer"
              title="Clear Notebook"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {entries.length === 0 ? (
          <div className="py-6 text-center text-[var(--text-muted)] text-xs font-sans">
            No experiment actions logged yet. Changing parameters, querying keys, or running sweeps will log automatically.
          </div>
        ) : (
          entries.map((entry) => {
            const isFailure = entry.type === 'failure';
            const isRecovery = entry.type === 'recovery';

            return (
              <div
                key={entry.id}
                className={`p-2.5 rounded-lg border text-[11px] space-y-1 transition-all ${
                  isFailure
                    ? 'bg-[var(--accent-pink)] border-[var(--color-danger-border)] text-[var(--accent-pink-text)]'
                    : isRecovery
                    ? 'bg-[var(--accent-green)] border-[var(--color-success-border)] text-[var(--accent-green-text)]'
                    : 'bg-[var(--surface-soft)] border-[var(--border)] text-[var(--text-secondary)]'
                }`}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[var(--text-muted)]">{entry.timestamp}</span>
                  <span
                    className={`uppercase font-semibold tracking-wider ${
                      isFailure
                        ? 'text-[var(--accent-pink-text)]'
                        : isRecovery
                        ? 'text-[var(--accent-green-text)]'
                        : 'text-[var(--accent-blue-text)]'
                    }`}
                  >
                    {entry.type}
                  </span>
                </div>
                <div className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                  {isFailure && <AlertTriangle className="w-3 h-3 text-[var(--accent-pink-text)] shrink-0" />}
                  {isRecovery && <CheckCircle2 className="w-3 h-3 text-[var(--accent-green-text)] shrink-0" />}
                  <span>{entry.title}</span>
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  {entry.detail}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

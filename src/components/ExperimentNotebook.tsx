import React, { useState } from 'react';
import { BookOpen, Download, Trash2, CheckCircle2, AlertTriangle, ArrowRight, Copy } from 'lucide-react';

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
    <div className={`rounded-xl border border-[#252A35] bg-[#0E121A] p-4 flex flex-col font-mono text-xs ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1E2536] pb-3 mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-white tracking-wide uppercase">
            EXPERIMENT NOTEBOOK
          </span>
          <span className="text-[10px] bg-[#182030] text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800/40">
            {entries.length} LOGGED
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleExportText}
            className="p-1 px-2 rounded bg-[#151924] hover:bg-[#1E2538] text-slate-300 hover:text-white border border-[#252A35] text-[10px] flex items-center gap-1 transition"
            title="Copy as Plain Text"
          >
            <Copy className="w-3 h-3 text-cyan-400" />
            <span>{copied ? 'COPIED ✓' : 'COPY'}</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="p-1 px-2 rounded bg-[#151924] hover:bg-[#1E2538] text-slate-300 hover:text-white border border-[#252A35] text-[10px] flex items-center gap-1 transition"
            title="Export JSON"
          >
            <Download className="w-3 h-3 text-indigo-400" />
            <span>JSON</span>
          </button>
          {entries.length > 0 && (
            <button
              onClick={onClear}
              className="p-1 px-1.5 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 text-[10px] transition ml-1"
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
          <div className="py-6 text-center text-slate-500 text-[11px]">
            No experiment actions logged yet. Changing parameters, querying keys, or running sweeps will log automatically.
          </div>
        ) : (
          entries.map((entry) => {
            const isFailure = entry.type === 'failure';
            const isRecovery = entry.type === 'recovery';

            return (
              <div
                key={entry.id}
                className={`p-2 rounded-lg border text-[11px] space-y-0.5 transition-all ${
                  isFailure
                    ? 'bg-rose-950/20 border-rose-800/50 text-rose-200'
                    : isRecovery
                    ? 'bg-emerald-950/20 border-emerald-800/50 text-emerald-200'
                    : 'bg-[#121622] border-[#202738] text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">{entry.timestamp}</span>
                  <span
                    className={`uppercase font-bold tracking-wider ${
                      isFailure
                        ? 'text-rose-400'
                        : isRecovery
                        ? 'text-emerald-400'
                        : 'text-cyan-400'
                    }`}
                  >
                    {entry.type}
                  </span>
                </div>
                <div className="font-semibold text-white flex items-center gap-1">
                  {isFailure && <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />}
                  {isRecovery && <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />}
                  <span>{entry.title}</span>
                </div>
                <div className="text-[10px] text-slate-400 leading-tight">
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

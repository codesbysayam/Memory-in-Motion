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
    <div className={`rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-5 flex flex-col font-mono text-xs shadow-xs ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-3 mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#167C80]" />
          <span className="font-bold text-[#151515] tracking-wide uppercase">
            EXPERIMENT NOTEBOOK
          </span>
          <span className="text-[10px] bg-[#EDF7F7] text-[#167C80] px-2 py-0.5 rounded border border-[#CFE8E8] font-bold">
            {entries.length} LOGGED
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleExportText}
            className="p-1.5 px-2.5 rounded-lg bg-[#FAF8F5] hover:bg-[#F4F1EA] text-[#716F68] hover:text-[#151515] border border-[#D8D4CB] text-[10px] flex items-center gap-1 transition cursor-pointer"
            title="Copy as Plain Text"
          >
            <Copy className="w-3 h-3 text-[#167C80]" />
            <span>{copied ? 'COPIED ✓' : 'COPY'}</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="p-1.5 px-2.5 rounded-lg bg-[#FAF8F5] hover:bg-[#F4F1EA] text-[#716F68] hover:text-[#151515] border border-[#D8D4CB] text-[10px] flex items-center gap-1 transition cursor-pointer"
            title="Export JSON"
          >
            <Download className="w-3 h-3 text-[#6842C2]" />
            <span>JSON</span>
          </button>
          {entries.length > 0 && (
            <button
              onClick={onClear}
              className="p-1.5 px-2 rounded-lg bg-[#FDF2F0] hover:bg-[#FCE7E4] text-[#B64235] border border-[#F7D3CF] text-[10px] transition cursor-pointer ml-1"
              title="Clear Notebook"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
        {entries.length === 0 ? (
          <div className="py-6 text-center text-[#716F68] text-[11px] font-sans">
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
                    ? 'bg-[#FDF2F0] border-[#F7D3CF] text-[#B64235]'
                    : isRecovery
                    ? 'bg-[#EDF8F2] border-[#CDEEDB] text-[#247A4B]'
                    : 'bg-[#FAF8F5] border-[#EAE6DF] text-[#52504A]'
                }`}
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-[#716F68]">{entry.timestamp}</span>
                  <span
                    className={`uppercase font-bold tracking-wider ${
                      isFailure
                        ? 'text-[#B64235]'
                        : isRecovery
                        ? 'text-[#247A4B]'
                        : 'text-[#167C80]'
                    }`}
                  >
                    {entry.type}
                  </span>
                </div>
                <div className="font-semibold text-[#151515] flex items-center gap-1.5">
                  {isFailure && <AlertTriangle className="w-3 h-3 text-[#B64235] shrink-0" />}
                  {isRecovery && <CheckCircle2 className="w-3 h-3 text-[#247A4B] shrink-0" />}
                  <span>{entry.title}</span>
                </div>
                <div className="text-[10px] text-[#716F68] leading-relaxed">
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

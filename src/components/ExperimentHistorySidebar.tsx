import React, { useState, useEffect } from 'react';
import {
  History,
  RotateCcw,
  Trash2,
  Download,
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertOctagon,
  Sliders,
  Layers,
  Sparkles,
} from 'lucide-react';
import { InterferenceConfig } from '../models/interferenceLabEngine';
import { InlineMath } from './ui/MathView';

export interface ExperimentHistoryRecord {
  id: string;
  timestamp: string;
  config: InterferenceConfig;
  factsCount: number;
  probe: string;
  prediction: string;
  groundTruth: string;
  retrievalScore: number;
  top1Margin: number;
  status: 'Correct' | 'Interference' | 'Unknown';
  matrixNorm?: number;
}

const STORAGE_KEY = 'memory_interference_history_records';

export function getStoredHistory(): ExperimentHistoryRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.slice(0, 10);
    }
  } catch (e) {
    console.warn('Failed to parse experiment history from localStorage', e);
  }
  return [];
}

export function saveStoredHistory(records: ExperimentHistoryRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, 10)));
  } catch (e) {
    console.warn('Failed to save experiment history to localStorage', e);
  }
}

interface ExperimentHistorySidebarProps {
  currentConfig?: InterferenceConfig;
  currentPrediction?: string;
  currentTruth?: string;
  currentScore?: number;
  currentMargin?: number;
  currentStatus?: 'Correct' | 'Interference' | 'Unknown';
  currentMatrixNorm?: number;
  onRevert: (record: ExperimentHistoryRecord) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const ExperimentHistorySidebar: React.FC<ExperimentHistorySidebarProps> = ({
  currentConfig,
  currentPrediction,
  currentTruth,
  currentScore,
  currentMargin,
  currentStatus,
  currentMatrixNorm,
  onRevert,
  isOpen: controlledIsOpen,
  onToggle: controlledOnToggle,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const toggleOpen = controlledOnToggle !== undefined ? controlledOnToggle : () => setInternalIsOpen((v) => !v);

  const [records, setRecords] = useState<ExperimentHistoryRecord[]>(() => getStoredHistory());
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [revertedBanner, setRevertedBanner] = useState<string | null>(null);

  // Sync with storage on mount and when custom storage events fire
  useEffect(() => {
    const handleStorageUpdate = () => {
      setRecords(getStoredHistory());
    };
    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('experiment_history_updated', handleStorageUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('experiment_history_updated', handleStorageUpdate);
    };
  }, []);

  // Listen for new experiment recorded
  useEffect(() => {
    const handleNewExperiment = (e: any) => {
      if (e.detail?.record) {
        setRecords((prev) => {
          const next = [e.detail.record, ...prev.filter((r) => r.id !== e.detail.record.id)].slice(0, 10);
          saveStoredHistory(next);
          return next;
        });
      }
    };
    window.addEventListener('record_experiment_history', handleNewExperiment);
    return () => {
      window.removeEventListener('record_experiment_history', handleNewExperiment);
    };
  }, []);

  // Automatically record when outcome parameters change significantly
  useEffect(() => {
    if (!currentConfig || !currentPrediction || currentPrediction === 'UNKNOWN') return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const expId = `EXP-D${currentConfig.dimension}-R${Math.round(currentConfig.retention * 100)}-L${currentConfig.sequenceLength}-${Date.now().toString(36).slice(-4).toUpperCase()}`;

    const newRec: ExperimentHistoryRecord = {
      id: expId,
      timestamp: timeStr,
      config: { ...currentConfig },
      factsCount: currentConfig.sequenceLength,
      probe: currentConfig.targetKey || 'Japan',
      prediction: currentPrediction,
      groundTruth: currentTruth || 'UNKNOWN',
      retrievalScore: currentScore || 0,
      top1Margin: currentMargin || 0,
      status: currentStatus || 'Unknown',
      matrixNorm: currentMatrixNorm,
    };

    setRecords((prev) => {
      // Don't duplicate if latest is identical in config and outcome
      const latest = prev[0];
      if (
        latest &&
        latest.config.dimension === newRec.config.dimension &&
        latest.config.retention === newRec.config.retention &&
        latest.config.sequenceLength === newRec.config.sequenceLength &&
        latest.config.interference === newRec.config.interference &&
        latest.config.targetKey === newRec.config.targetKey &&
        latest.prediction === newRec.prediction
      ) {
        return prev;
      }
      const updated = [newRec, ...prev].slice(0, 10);
      saveStoredHistory(updated);
      return updated;
    });
  }, [
    currentConfig?.dimension,
    currentConfig?.retention,
    currentConfig?.sequenceLength,
    currentConfig?.interference,
    currentConfig?.targetKey,
    currentPrediction,
    currentTruth,
    currentScore,
    currentMargin,
    currentStatus,
    currentMatrixNorm,
  ]);

  const handleRevert = (rec: ExperimentHistoryRecord) => {
    setActiveRecordId(rec.id);
    onRevert(rec);
    setRevertedBanner(`Reverted to state from ${rec.timestamp} (${rec.id})`);
    setTimeout(() => setRevertedBanner(null), 3000);
  };

  const handleClearHistory = () => {
    if (confirm('Clear the experiment history log?')) {
      setRecords([]);
      saveStoredHistory([]);
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `interference-experiment-history-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <>
      {/* Floating Persistent Launch Tab (desktop/tablet edge, avoids mobile content overlap) */}
      {!isOpen && (
        <button
          onClick={toggleOpen}
          aria-label="Open Experiment History Panel"
          className="hidden md:flex fixed right-0 bottom-24 z-40 bg-[var(--surface)] text-[var(--text-primary)] border-l border-y border-[var(--border)] rounded-l-lg px-2 py-2.5 shadow-sm hover:bg-[var(--surface-soft)] transition flex-col items-center gap-1.5 cursor-pointer group"
          title="Experiment History (Last 10 Runs)"
        >
          <History className="w-4 h-4 text-[var(--accent-blue-text)] group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-sans font-medium writing-mode-vertical rotate-180 tracking-wide tabular-nums">
            History ({records.length})
          </span>
        </button>
      )}

      {/* Persistent Sidebar / Slide-Over Drawer */}
      {isOpen && (
        <aside
          aria-label="Experiment History Sidebar"
          className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-[var(--surface)] border-l border-[var(--border)] shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[var(--border)] bg-[var(--surface-soft)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[var(--accent-blue)] text-[var(--accent-blue-text)]">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-[var(--text-primary)]">
                  Experiment history
                </h3>
                <p className="text-xs text-[var(--text-secondary)] tabular-nums">
                  Last {records.length} runs in Interference Lab
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {records.length > 0 && (
                <>
                  <button
                    onClick={handleExportJSON}
                    title="Export history as JSON"
                    aria-label="Export history as JSON"
                    className="p-1.5 rounded-md hover:bg-[var(--surface)] text-[var(--text-secondary)] border border-transparent hover:border-[var(--border)] transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleClearHistory}
                    title="Clear history"
                    aria-label="Clear history"
                    className="p-1.5 rounded-md hover:bg-[var(--accent-pink)] text-[var(--accent-pink-text)] transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                onClick={toggleOpen}
                aria-label="Close sidebar"
                className="p-1.5 rounded-md hover:bg-[var(--color-surface-muted)] text-[var(--text-secondary)] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Revert Feedback Notification */}
          {revertedBanner && (
            <div className="bg-[var(--accent-green)] text-[var(--accent-green-text)] text-xs px-4 py-2 border-b border-[var(--border)] flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{revertedBanner}</span>
            </div>
          )}

          {/* List of Experiment Records */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 safe-pb">
            {records.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-3">
                <div className="w-10 h-10 mx-auto rounded-lg bg-[var(--surface-soft)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)]">
                  <Sliders className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-sm text-[var(--text-primary)]">
                  No experiments recorded yet
                </h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Run experiments in the Interference Lab by changing retention, dimension, distractors, or running probes. The last 10 states are saved here so you can quickly inspect and revert to any configuration.
                </p>
              </div>
            ) : (
              records.map((rec, idx) => {
                const isCorrect = rec.status === 'Correct';
                const isSelected = activeRecordId === rec.id;

                return (
                  <div
                    key={rec.id}
                    className={`rounded-xl border transition p-3.5 space-y-2.5 ${
                      isSelected
                        ? 'border-[var(--accent-blue-text)] bg-[var(--accent-blue)] ring-1 ring-[var(--accent-blue-text)]'
                        : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--color-border-strong)]'
                    }`}
                  >
                    {/* Top Row: Index, Timestamp, Status */}
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] font-bold text-[var(--text-secondary)] tabular-nums">
                          #{records.length - idx}
                        </span>
                        <span className="font-mono text-[11px] text-[var(--text-secondary)] tabular-nums">
                          {rec.timestamp}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded ${
                            isCorrect
                              ? 'bg-[var(--accent-green)] text-[var(--accent-green-text)]'
                              : 'bg-[var(--accent-pink)] text-[var(--accent-pink-text)]'
                          }`}
                        >
                          {isCorrect ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <AlertOctagon className="w-3 h-3" />
                          )}
                          <span>{rec.status}</span>
                        </span>
                      </div>
                    </div>

                    {/* Parameters Grid */}
                    <div className="grid grid-cols-3 gap-2 text-xs bg-[var(--surface-soft)] p-2 rounded-lg border border-[var(--border)] tabular-nums">
                      <div>
                        <span className="text-[10px] text-[var(--text-muted)] block">
                          Dim <InlineMath math="D" />
                        </span>
                        <strong className="font-mono text-xs text-[var(--text-primary)]">
                          {rec.config.dimension}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-[var(--text-muted)] block">
                          Retention <InlineMath math="\lambda" />
                        </span>
                        <strong className="font-mono text-xs text-[var(--text-primary)]">
                          {rec.config.retention.toFixed(2)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-[var(--text-muted)] block">
                          Facts / Seq
                        </span>
                        <strong className="font-mono text-xs text-[var(--text-primary)]">
                          {rec.factsCount}
                        </strong>
                      </div>
                    </div>

                    {/* Outcome: Probe, Prediction, Ground Truth */}
                    <div className="text-xs space-y-1">
                      <div className="flex items-center justify-between text-[var(--text-secondary)]">
                        <span>Probe: <strong className="text-[var(--text-primary)]">{rec.probe}</strong></span>
                        <span>Score: <strong className="font-mono tabular-nums text-[var(--text-primary)]">{(rec.retrievalScore * 100).toFixed(1)}%</strong></span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-secondary)]">
                          Output: <strong className={isCorrect ? 'text-[var(--accent-green-text)]' : 'text-[var(--accent-pink-text)]'}>{rec.prediction}</strong>
                        </span>
                        <span className="text-[11px] text-[var(--text-muted)]">
                          Truth: {rec.groundTruth}
                        </span>
                      </div>
                    </div>

                    {/* Revert Action */}
                    <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
                      <span className="font-mono text-[10px] text-[var(--text-muted)] truncate max-w-[170px]" title={rec.id}>
                        {rec.id}
                      </span>
                      <button
                        onClick={() => handleRevert(rec)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--accent-green)] text-[var(--accent-green-text)] border border-[var(--border)] hover:border-[var(--color-success-border)] text-xs font-medium transition cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Revert to state</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-[var(--border)] bg-[var(--surface-soft)] text-xs text-[var(--text-secondary)] flex items-center justify-between">
            <span>Deterministic state snapshot</span>
            <span className="font-mono text-[11px]">Storage: localStorage</span>
          </div>
        </aside>
      )}
    </>
  );
};

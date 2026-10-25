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
      {/* Floating Persistent Launch Tab (when sidebar is closed) */}
      {!isOpen && (
        <button
          onClick={toggleOpen}
          aria-label="Open Experiment History Panel"
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-[#FFFFFF] dark:bg-[#202428] text-[#252525] dark:text-[#F5F3EE] border-l border-y border-[#D8DCD8] dark:border-[#3A4044] rounded-l-xl px-2.5 py-3 shadow-md hover:bg-[#F7F5EF] dark:hover:bg-[#272C30] transition flex flex-col items-center gap-1.5 cursor-pointer group"
          title="Experiment History (Last 10 Runs)"
        >
          <History className="w-4 h-4 text-[#31566E] group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-sans font-medium writing-mode-vertical rotate-180 tracking-wide">
            History ({records.length})
          </span>
        </button>
      )}

      {/* Persistent Sidebar / Slide-Over Drawer */}
      {isOpen && (
        <aside
          aria-label="Experiment History Sidebar"
          className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-[#FFFFFF] dark:bg-[#202428] border-l border-[#D8DCD8] dark:border-[#3A4044] shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#D8DCD8] dark:border-[#3A4044] bg-[#F7F5EF] dark:bg-[#171A1D] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#E7F2FA] dark:bg-[#263C4B] text-[#31566E] dark:text-[#89C0E8]">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-[#252525] dark:text-[#F5F3EE]">
                  Experiment History
                </h3>
                <p className="text-xs text-[#5F625F] dark:text-[#C4C8C5]">
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
                    className="p-1.5 rounded-md hover:bg-[#FFFFFF] dark:hover:bg-[#202428] text-[#5F625F] dark:text-[#C4C8C5] border border-transparent hover:border-[#D8DCD8] dark:hover:border-[#3A4044] transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleClearHistory}
                    title="Clear history"
                    aria-label="Clear history"
                    className="p-1.5 rounded-md hover:bg-[#F9E9ED] text-[#B64235] transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                onClick={toggleOpen}
                aria-label="Close sidebar"
                className="p-1.5 rounded-md hover:bg-[#EAE6DF] dark:hover:bg-[#272C30] text-[#5F625F] dark:text-[#C4C8C5] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Revert Feedback Notification */}
          {revertedBanner && (
            <div className="bg-[#DCEFE2] dark:bg-[#253B2D] text-[#247A4B] dark:text-[#70B98A] text-xs px-4 py-2 border-b border-[#D8DCD8] dark:border-[#3A4044] flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{revertedBanner}</span>
            </div>
          )}

          {/* List of Experiment Records */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 safe-pb">
            {records.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-3">
                <div className="w-10 h-10 mx-auto rounded-full bg-[#F7F5EF] dark:bg-[#171A1D] border border-[#D8DCD8] dark:border-[#3A4044] flex items-center justify-center text-[#5F625F]">
                  <Sliders className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-sm text-[#252525] dark:text-[#F5F3EE]">
                  No experiments recorded yet
                </h4>
                <p className="text-xs text-[#5F625F] dark:text-[#C4C8C5] leading-relaxed">
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
                        ? 'border-[#31566E] bg-[#E7F2FA]/50 dark:bg-[#263C4B]/50 ring-1 ring-[#31566E]'
                        : 'border-[#D8DCD8] dark:border-[#3A4044] bg-[#FFFFFF] dark:bg-[#202428] hover:border-[#5F625F]'
                    }`}
                  >
                    {/* Top Row: Index, Timestamp, Status */}
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] font-bold text-[#5F625F] dark:text-[#C4C8C5]">
                          #{records.length - idx}
                        </span>
                        <span className="font-mono text-[11px] text-[#5F625F] dark:text-[#C4C8C5]">
                          {rec.timestamp}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded ${
                            isCorrect
                              ? 'bg-[#DCEFE2] dark:bg-[#253B2D] text-[#247A4B] dark:text-[#70B98A]'
                              : 'bg-[#F9E9ED] dark:bg-[#452C31] text-[#B64235] dark:text-[#E27D72]'
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
                    <div className="grid grid-cols-3 gap-2 text-xs bg-[#F7F5EF] dark:bg-[#171A1D] p-2 rounded-lg border border-[#D8DCD8] dark:border-[#3A4044]">
                      <div>
                        <span className="text-[10px] text-[#5F625F] dark:text-[#C4C8C5] block">
                          Dim <InlineMath math="D" />
                        </span>
                        <strong className="font-mono text-xs text-[#252525] dark:text-[#F5F3EE]">
                          {rec.config.dimension}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#5F625F] dark:text-[#C4C8C5] block">
                          Retention <InlineMath math="\lambda" />
                        </span>
                        <strong className="font-mono text-xs text-[#252525] dark:text-[#F5F3EE]">
                          {rec.config.retention.toFixed(2)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#5F625F] dark:text-[#C4C8C5] block">
                          Facts / Seq
                        </span>
                        <strong className="font-mono text-xs text-[#252525] dark:text-[#F5F3EE]">
                          {rec.factsCount}
                        </strong>
                      </div>
                    </div>

                    {/* Outcome: Probe, Prediction, Ground Truth */}
                    <div className="text-xs space-y-1">
                      <div className="flex items-center justify-between text-[#5F625F] dark:text-[#C4C8C5]">
                        <span>Probe: <strong className="text-[#252525] dark:text-[#F5F3EE]">{rec.probe}</strong></span>
                        <span>Score: <strong className="font-mono text-[#252525] dark:text-[#F5F3EE]">{(rec.retrievalScore * 100).toFixed(1)}%</strong></span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#5F625F] dark:text-[#C4C8C5]">
                          Output: <strong className={isCorrect ? 'text-[#247A4B] dark:text-[#70B98A]' : 'text-[#B64235] dark:text-[#E27D72]'}>{rec.prediction}</strong>
                        </span>
                        <span className="text-[11px] text-[#5F625F] dark:text-[#C4C8C5]">
                          Truth: {rec.groundTruth}
                        </span>
                      </div>
                    </div>

                    {/* Revert Action */}
                    <div className="pt-2 border-t border-[#D8DCD8] dark:border-[#3A4044] flex items-center justify-between">
                      <span className="font-mono text-[10px] text-[#5F625F] dark:text-[#C4C8C5] truncate max-w-[170px]" title={rec.id}>
                        {rec.id}
                      </span>
                      <button
                        onClick={() => handleRevert(rec)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFFFFF] dark:bg-[#202428] hover:bg-[#DCEFE2] dark:hover:bg-[#253B2D] text-[#247A4B] dark:text-[#70B98A] border border-[#D8DCD8] dark:border-[#3A4044] hover:border-[#247A4B] text-xs font-medium transition cursor-pointer shadow-2xs"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Revert to State</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-[#D8DCD8] dark:border-[#3A4044] bg-[#F7F5EF] dark:bg-[#171A1D] text-xs text-[#5F625F] dark:text-[#C4C8C5] flex items-center justify-between">
            <span>Deterministic state snapshot</span>
            <span className="font-mono text-[11px]">Storage: localStorage</span>
          </div>
        </aside>
      )}
    </>
  );
};

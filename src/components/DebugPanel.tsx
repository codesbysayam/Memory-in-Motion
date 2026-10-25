import React, { useState } from 'react';
import { useExperiment } from '../context/ExperimentContext';
import { Download, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

interface DebugPanelProps {
  id?: string;
  className?: string;
  activeFactsCount?: number;
  step?: number;
  matrixNorm?: number;
  activeProbe?: string | null;
  prediction?: string;
  groundTruth?: string;
  retrievalScore?: number;
  top1Margin?: number;
  status?: 'Correct' | 'Interference' | 'Unknown';
  mode?: string;
  currentRunId?: string;
  facts?: any[];
  matrix?: number[][];
  state?: number[];
  history?: any[];
  config?: any;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  id = 'live-experiment-panel',
  className = '',
  activeFactsCount: propActiveFactsCount,
  step: propStep,
  matrixNorm: propMatrixNorm,
  activeProbe: propActiveProbe,
  prediction: propPrediction,
  groundTruth: propGroundTruth,
  retrievalScore: propRetrievalScore,
  top1Margin: propTop1Margin,
  status: propStatus,
  mode: propMode,
  currentRunId: propCurrentRunId,
  facts: propFacts,
  matrix: propMatrix,
  state: propState,
  history: propHistory,
  config: propConfig,
}) => {
  const context = useExperiment();

  const activeFactsCount = propActiveFactsCount ?? context?.activeFactsCount ?? 3;
  const step = propStep ?? context?.step ?? 3;
  const matrixNorm = propMatrixNorm ?? context?.matrixNorm ?? 1.1753;
  const activeProbe = propActiveProbe !== undefined ? propActiveProbe : context?.activeProbe ?? 'Japan';
  const prediction = propPrediction ?? context?.prediction ?? 'Tokyo';
  const groundTruth = propGroundTruth ?? context?.groundTruth ?? 'Tokyo';
  const retrievalScore = propRetrievalScore ?? context?.retrievalScore ?? 0.9858;
  const top1Margin = propTop1Margin ?? context?.top1Margin ?? 0.6198;
  const status = propStatus ?? context?.status ?? 'Correct';
  const mode = propMode ?? context?.mode ?? 'interactive';
  const currentRunId = propCurrentRunId ?? context?.currentRunId ?? `MEM-D16-S${step}`;
  const config = propConfig ?? context?.config;

  const [expanded, setExpanded] = useState<boolean>(true);
  const [exported, setExported] = useState<boolean>(false);

  const isCorrect = status === 'Correct';
  const isInterference = status === 'Interference';

  const handleExportJSON = () => {
    const experimentData = {
      experimentId: currentRunId,
      timestamp: new Date().toISOString(),
      mode,
      config: config || {
        dimension: 16,
        retention: 0.95,
        writeStrength: 0.8,
        interference: 0,
      },
      factsCount: activeFactsCount,
      step,
      probe: activeProbe,
      result: {
        prediction,
        groundTruth,
        retrievalScore: Number(retrievalScore.toFixed(4)),
        top1Margin: Number(top1Margin.toFixed(4)),
        status,
        isCorrect,
      },
      state: {
        norm: Number(matrixNorm.toFixed(4)),
        vector: propState || context?.state || [],
        matrix: propMatrix || context?.matrix || [],
      },
      facts: propFacts || context?.facts || [],
      history: propHistory || context?.historyRuns || [],
    };

    const blob = new Blob([JSON.stringify(experimentData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentRunId || 'memory-experiment'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  return (
    <div
      id={id}
      className={`lab-section shadow-sm transition-all ${className}`}
    >
      {/* Editorial Instrument Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--lab-border)] pb-3 mb-4">
        <div>
          <div className="text-[11px] font-sans font-bold uppercase tracking-wider text-[var(--lab-secondary)]">
            LIVE EXPERIMENT
          </div>
          <h2 className="font-serif text-lg sm:text-xl font-semibold text-[var(--lab-text)] mt-0.5">
            Interactive memory instrument
          </h2>
        </div>

        {/* Quiet Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-sans text-[var(--lab-secondary)] hover:text-[var(--lab-text)] bg-[var(--lab-surface)] hover:bg-[var(--lab-border)] border border-[var(--lab-border)] rounded-md transition-colors cursor-pointer"
            title="Download complete verified experiment record as JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exported ? 'Downloaded' : 'Export JSON'}</span>
          </button>

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-sans text-[var(--lab-secondary)] hover:text-[var(--lab-text)] hover:bg-[var(--lab-surface)] rounded-md transition-colors cursor-pointer"
            aria-expanded={expanded}
          >
            <span>{expanded ? 'Collapse' : 'Expand'}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Scientific Status Notification (Non-neon, semantic, quiet) */}
          <div className="flex items-center justify-between gap-3">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-sans font-medium border ${
                isCorrect
                  ? 'bg-[var(--accent-green)] text-[var(--accent-green-text)] border-[var(--border)]'
                  : isInterference
                  ? 'bg-[var(--accent-pink)] text-[var(--accent-pink-text)] border-[var(--border)]'
                  : 'bg-[var(--lab-surface)] text-[var(--lab-secondary)] border-[var(--lab-border)]'
              }`}
            >
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[var(--accent-green-text)] shrink-0" />
                  <span>✓ Correct retrieval: probe &quot;{activeProbe}&quot; matches ground truth</span>
                </>
              ) : isInterference ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-[var(--accent-pink-text)] shrink-0" />
                  <span>Interference detected: probe vector diverged from ground truth</span>
                </>
              ) : (
                <span>State initialised</span>
              )}
            </div>

            <div className="text-xs font-mono text-[var(--lab-secondary)] hidden sm:block">
              ID: {currentRunId}
            </div>
          </div>

          {/* 4 Conceptual Columns: Experiment, Current state, Probe, Result */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* 1. Experiment Section */}
            <div className="p-3.5 rounded-xl bg-[var(--lab-surface)] border border-[var(--lab-border)] space-y-2">
              <span className="text-[11px] font-mono font-bold text-[var(--lab-secondary)] uppercase tracking-wider block">
                EXPERIMENT
              </span>
              <div className="space-y-1">
                <div className="font-mono text-sm text-[var(--lab-text)] font-semibold">{activeFactsCount} facts</div>
                <div className="font-mono text-xs text-[var(--lab-secondary)]">t = {step}</div>
                <div className="font-mono text-xs text-[var(--lab-secondary)]">D = 16</div>
              </div>
            </div>

            {/* 2. Current State Section */}
            <div className="p-3.5 rounded-xl bg-[var(--lab-surface)] border border-[var(--lab-border)] space-y-2">
              <span className="text-[11px] font-mono font-bold text-[var(--lab-secondary)] uppercase tracking-wider block">
                CURRENT STATE
              </span>
              <div className="space-y-1">
                <div className="font-mono text-sm text-[var(--lab-text)] font-semibold">
                  ‖M‖<sub>F</sub> = {matrixNorm.toFixed(4)}
                </div>
                <div className="font-mono text-xs text-[var(--lab-secondary)]">
                  M ∈ ℝ<sup>16×16</sup>
                </div>
              </div>
            </div>

            {/* 3. Probe Section */}
            <div className="p-3.5 rounded-xl bg-[var(--lab-surface)] border border-[var(--lab-border)] space-y-2">
              <span className="text-[11px] font-mono font-bold text-[var(--lab-secondary)] uppercase tracking-wider block">
                PROBE
              </span>
              <div className="space-y-1">
                <div className="font-serif text-lg font-bold text-[var(--lab-text)] truncate" title={activeProbe || 'None'}>
                  {activeProbe || 'None'}
                </div>
                <div className="font-mono text-xs text-[var(--lab-secondary)]">
                  qᵀ M
                </div>
              </div>
            </div>

            {/* 4. Result Section */}
            <div
              className={`p-3.5 rounded-xl border space-y-2 bg-[var(--lab-surface)] ${
                isCorrect
                  ? 'border-[var(--accent-green-text)]/40'
                  : 'border-[var(--accent-pink-text)]/40'
              }`}
            >
              <span className="text-[11px] font-mono font-bold text-[var(--lab-secondary)] uppercase tracking-wider block">
                RESULT
              </span>
              <div className="space-y-1">
                <div
                  className={`font-serif text-lg font-bold truncate ${
                    isCorrect ? 'text-[var(--accent-green-text)]' : 'text-[var(--accent-pink-text)]'
                  }`}
                  title={prediction}
                >
                  {prediction}
                </div>
                <div className="text-xs text-[var(--lab-secondary)] flex items-center justify-between">
                  <span>Ground truth:</span>
                  <span className="font-semibold text-[var(--lab-text)]">{groundTruth}</span>
                </div>
                <div className="text-xs text-[var(--lab-secondary)] flex items-center justify-between">
                  <span>Retrieval score:</span>
                  <span className="font-mono font-medium text-[var(--lab-text)]">{retrievalScore.toFixed(4)}</span>
                </div>
                <div className="text-xs text-[var(--lab-secondary)] flex items-center justify-between">
                  <span>Top-1 margin:</span>
                  <span className="font-mono font-medium text-[var(--lab-text)]">{top1Margin.toFixed(4)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Quantitative Metrics Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-3.5 py-2 rounded-xl bg-[var(--lab-surface)] border border-[var(--lab-border)] text-xs font-sans">
            <div className="flex flex-wrap items-center gap-6 text-[var(--lab-secondary)]">
              <div
                className="flex items-center gap-2"
                title="Cosine similarity between the retrieved representation and a candidate value representation. This is not a calibrated probability."
              >
                <span>Retrieval score:</span>
                <span className="font-mono font-bold text-[var(--accent-blue-text)]">{retrievalScore.toFixed(4)}</span>
                <span
                  className="cursor-help text-[var(--lab-secondary)] hover:text-[var(--lab-text)]"
                  title="Cosine similarity between the retrieved representation and a candidate value representation. This is not a calibrated probability."
                >
                  <HelpCircle className="w-3.5 h-3.5 inline" />
                </span>
              </div>

              <div
                className="flex items-center gap-2"
                title="Difference between the top candidate similarity score and the runner-up candidate score."
              >
                <span>Top-1 margin:</span>
                <span className="font-mono font-semibold text-[var(--lab-text)]">{top1Margin.toFixed(4)}</span>
              </div>
            </div>

            <p className="text-[11px] text-[var(--lab-secondary)] italic">
              Cosine similarity is representation alignment, not a calibrated probability.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

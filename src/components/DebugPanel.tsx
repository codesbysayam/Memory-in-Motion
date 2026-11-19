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

  const activeDim = config?.dimension ?? 16;

  return (
    <div
      id={id}
      className={`lab-section ${className}`}
    >
      {/* Editorial Instrument Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3 mb-4">
        <div>
          <div className="text-xs font-mono text-[var(--text-muted)]">
            Run summary &amp; telemetry
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-normal text-[var(--text-primary)] mt-0.5">
            Experiment state snapshot
          </h2>
        </div>

        {/* Quiet Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportJSON}
            className="btn-secondary text-xs"
            title="Download complete verified experiment record as JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exported ? 'Downloaded' : 'Export JSON'}</span>
          </button>

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="btn-tertiary text-xs"
            aria-expanded={expanded}
          >
            <span>{expanded ? 'Collapse' : 'Expand'}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-4">
          {/* Scientific Status Notification (Non-neon, semantic, quiet) */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-sans font-medium border ${
                isCorrect
                  ? 'bg-[var(--accent-green)] text-[var(--accent-green-text)] border-[var(--color-success-border)]'
                  : isInterference
                  ? 'bg-[var(--accent-pink)] text-[var(--accent-pink-text)] border-[var(--color-danger-border)]'
                  : 'bg-[var(--surface-soft)] text-[var(--text-secondary)] border-[var(--border)]'
              }`}
            >
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Correct retrieval: probe &ldquo;{activeProbe}&rdquo; matches ground truth</span>
                </>
              ) : isInterference ? (
                <>
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Interference detected: probe vector diverged from ground truth</span>
                </>
              ) : (
                <span>State initialized</span>
              )}
            </div>

            <div className="text-xs font-mono tabular-nums text-[var(--text-muted)] hidden sm:block">
              Run ID: {currentRunId}
            </div>
          </div>

          {/* 4 Conceptual Columns: Experiment, Current state, Probe, Result */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* 1. Experiment Section */}
            <div className="metric-panel space-y-1.5">
              <span className="text-[11px] font-mono font-medium text-[var(--text-muted)] block">
                Experiment
              </span>
              <div className="space-y-0.5 tabular-nums">
                <div className="font-mono text-sm text-[var(--text-primary)] font-semibold">{activeFactsCount} facts</div>
                <div className="font-mono text-xs text-[var(--text-secondary)]">t = {step}</div>
                <div className="font-mono text-xs text-[var(--text-secondary)]">D = {activeDim}</div>
              </div>
            </div>

            {/* 2. Current State Section */}
            <div className="metric-panel space-y-1.5">
              <span className="text-[11px] font-mono font-medium text-[var(--text-muted)] block">
                Current state
              </span>
              <div className="space-y-0.5 tabular-nums">
                <div className="font-mono text-sm text-[var(--text-primary)] font-semibold">
                  ‖M‖<sub>F</sub> = {matrixNorm.toFixed(4)}
                </div>
                <div className="font-mono text-xs text-[var(--text-secondary)]">
                  M ∈ ℝ<sup>{activeDim}×{activeDim}</sup>
                </div>
              </div>
            </div>

            {/* 3. Probe Section */}
            <div className="metric-panel space-y-1.5">
              <span className="text-[11px] font-mono font-medium text-[var(--text-muted)] block">
                Probe
              </span>
              <div className="space-y-0.5">
                <div className="font-mono text-base font-semibold text-[var(--text-primary)] truncate" title={activeProbe || 'None'}>
                  {activeProbe || 'None'}
                </div>
                <div className="font-mono text-xs text-[var(--text-secondary)]">
                  qᵀ M
                </div>
              </div>
            </div>

            {/* 4. Result Section */}
            <div
              className={`metric-panel space-y-1.5 ${
                isCorrect
                  ? 'border-[var(--color-success-border)]'
                  : 'border-[var(--color-danger-border)]'
              }`}
            >
              <span className="text-[11px] font-mono font-medium text-[var(--text-muted)] block">
                Result
              </span>
              <div className="space-y-1 tabular-nums">
                <div
                  className={`font-mono text-base font-semibold truncate ${
                    isCorrect ? 'text-[var(--accent-green-text)]' : 'text-[var(--accent-pink-text)]'
                  }`}
                  title={prediction}
                >
                  {prediction}
                </div>
                <div className="text-xs text-[var(--text-secondary)] flex items-center justify-between gap-2">
                  <span>Ground truth</span>
                  <span className="font-semibold text-[var(--text-primary)]">{groundTruth}</span>
                </div>
                <div className="text-xs text-[var(--text-secondary)] flex items-center justify-between gap-2">
                  <span>Similarity</span>
                  <span className="font-mono font-medium text-[var(--text-primary)]">{retrievalScore.toFixed(4)}</span>
                </div>
                <div className="text-xs text-[var(--text-secondary)] flex items-center justify-between gap-2">
                  <span>Top-1 margin</span>
                  <span className="font-mono font-medium text-[var(--text-primary)]">{top1Margin.toFixed(4)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Quantitative Metrics Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-2.5 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)] text-xs font-sans">
            <div className="flex flex-wrap items-center gap-6 text-[var(--text-secondary)] tabular-nums">
              <div
                className="flex items-center gap-2"
                title="Cosine similarity between the retrieved representation and a candidate value representation. This is not a calibrated probability."
              >
                <span>Retrieval score:</span>
                <span className="font-mono font-semibold text-[var(--accent-blue-text)]">{retrievalScore.toFixed(4)}</span>
                <span
                  className="cursor-help text-[var(--text-muted)] hover:text-[var(--text-primary)]"
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
                <span className="font-mono font-semibold text-[var(--text-primary)]">{top1Margin.toFixed(4)}</span>
              </div>
            </div>

            <p className="text-xs text-[var(--text-muted)]">
              Cosine similarity reflects representation alignment, not a calibrated probability.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

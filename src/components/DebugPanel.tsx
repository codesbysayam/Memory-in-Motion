import React, { useState } from 'react';
import { useExperiment } from '../context/ExperimentContext';
import { Terminal, Copy, Check, Activity, ShieldCheck, AlertTriangle } from 'lucide-react';
import { GlossaryTerm } from './GlossaryTerm';

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
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  id = 'experiment-debug-panel',
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
}) => {
  const context = useExperiment();

  const activeFactsCount = propActiveFactsCount ?? context.activeFactsCount;
  const step = propStep ?? context.step;
  const matrixNorm = propMatrixNorm ?? context.matrixNorm;
  const activeProbe = propActiveProbe !== undefined ? propActiveProbe : context.activeProbe;
  const prediction = propPrediction ?? context.prediction;
  const groundTruth = propGroundTruth ?? context.groundTruth;
  const retrievalScore = propRetrievalScore ?? context.retrievalScore;
  const top1Margin = propTop1Margin ?? context.top1Margin;
  const status = propStatus ?? context.status;
  const mode = propMode ?? context.mode;
  const currentRunId = propCurrentRunId ?? context.currentRunId;
  const config = context.config;

  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleCopy = () => {
    const payload = {
      timestamp: new Date().toISOString(),
      mode,
      currentRunId,
      activeFactsCount,
      stepIndex: step,
      matrixFrobeniusNorm: Number(matrixNorm.toFixed(6)),
      activeProbeKey: activeProbe,
      modelPrediction: prediction,
      groundTruth,
      retrievalScore: Number(retrievalScore.toFixed(6)),
      top1Margin: Number(top1Margin.toFixed(6)),
      status,
      config,
    };

    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCorrect = status === 'Correct';
  const isInterference = status === 'Interference';

  return (
    <div
      id={id}
      className={`rounded-2xl border border-[#D9DCD8] bg-[#FFFFFF] text-[#252525] p-4 sm:p-5 shadow-xs transition-all ${className}`}
    >
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6DF] pb-3 mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#EBF1F5] border border-[#D9DCD8] flex items-center justify-center text-[#31566E]">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wider text-[#31566E]">
                Engine state verifier
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-[#FAF8F5] border border-[#D9DCD8] text-[#4F514E]">
                <Activity className="w-3 h-3 text-[#31566E]" />
                {mode} mode
              </span>
            </div>
            <h2 className="font-serif text-sm sm:text-base font-bold text-[#252525]">
              Deterministic memory state diagnostics
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <button
            type="button"
            onClick={handleCopy}
            title="Copy current telemetry JSON"
            className="btn btn-secondary text-xs py-1 px-2.5 min-h-[30px]"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#245B38]" />
                <span className="text-[#245B38] text-xs">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#4F514E]" />
                <span className="text-xs">Export JSON</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn btn-secondary text-xs py-1 px-2.5 min-h-[30px]"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* 8 Required Engine Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 font-mono">
            {/* 1. Active Facts Count */}
            <div
              id="debug-metric-active-facts"
              className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] flex flex-col justify-between"
            >
              <div className="text-xs text-[#70736F] font-semibold">
                Active facts
              </div>
              <div className="text-base sm:text-lg font-bold text-[#252525] mt-1">
                {activeFactsCount}
              </div>
              <div className="text-[11px] text-[#70736F] mt-0.5">Stream facts count</div>
            </div>

            {/* 2. Current Step Index */}
            <div
              id="debug-metric-step-index"
              className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] flex flex-col justify-between"
            >
              <div className="text-xs text-[#70736F] font-semibold">
                Step index
              </div>
              <div className="text-base sm:text-lg font-bold text-[#31566E] mt-1">
                t = {step}
              </div>
              <div className="text-[11px] text-[#70736F] mt-0.5">Transitions executed</div>
            </div>

            {/* 3. Matrix Frobenius Norm */}
            <div
              id="debug-metric-matrix-norm"
              className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] flex flex-col justify-between"
            >
              <div className="text-xs text-[#70736F] font-semibold flex items-center justify-between">
                <span>||M||_F norm</span>
              </div>
              <div className="text-base sm:text-lg font-bold text-[#252525] mt-1 font-mono">
                {matrixNorm.toFixed(4)}
              </div>
              <div className="text-[11px] text-[#70736F] mt-0.5">
                <GlossaryTerm term="Frobenius norm" className="text-[#4F514E] hover:text-[#252525] border-dashed border-[#D9DCD8]">
                  Frobenius state
                </GlossaryTerm>
              </div>
            </div>

            {/* 4. Active Probe Key */}
            <div
              id="debug-metric-active-probe"
              className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] flex flex-col justify-between"
            >
              <div className="text-xs text-[#70736F] font-semibold">
                Probe key
              </div>
              <div className="text-base sm:text-lg font-bold text-[#252525] mt-1 truncate" title={activeProbe || 'None'}>
                "{activeProbe || 'None'}"
              </div>
              <div className="text-[11px] text-[#70736F] mt-0.5">Query association</div>
            </div>

            {/* 5. Model Prediction */}
            <div
              id="debug-metric-prediction"
              className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                isCorrect
                  ? 'bg-[#EBF7EE] border-[#B2D8BD] text-[#245B38]'
                  : isInterference
                  ? 'bg-[#FDF2F0] border-[#ECC0BC] text-[#8A352E]'
                  : 'bg-[#FAF8F5] border-[#EAE6DF] text-[#252525]'
              }`}
            >
              <div className="text-xs font-semibold opacity-85">
                Prediction
              </div>
              <div className="text-base sm:text-lg font-bold mt-1 truncate" title={prediction}>
                {prediction}
              </div>
              <div className="text-[11px] opacity-75 mt-0.5">Argmax projection</div>
            </div>

            {/* 6. Ground Truth */}
            <div
              id="debug-metric-ground-truth"
              className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] flex flex-col justify-between"
            >
              <div className="text-xs text-[#70736F] font-semibold">
                Ground truth
              </div>
              <div className="text-base sm:text-lg font-bold text-[#252525] mt-1 truncate" title={groundTruth}>
                {groundTruth}
              </div>
              <div className="text-[11px] text-[#70736F] mt-0.5">Target value</div>
            </div>

            {/* 7. Retrieval Score */}
            <div
              id="debug-metric-retrieval-score"
              className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] flex flex-col justify-between"
              title="This score is computed from representation similarity. It is not a calibrated probability."
            >
              <div className="text-xs text-[#70736F] font-semibold">
                Score
              </div>
              <div className="text-base sm:text-lg font-bold text-[#31566E] mt-1">
                {retrievalScore.toFixed(4)}
              </div>
              <div className="text-[11px] text-[#70736F] mt-0.5">Top-1 cosine sim</div>
            </div>

            {/* 8. Top-1 Margin */}
            <div
              id="debug-metric-top1-margin"
              className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] flex flex-col justify-between"
            >
              <div className="text-xs text-[#70736F] font-semibold">
                Top-1 margin
              </div>
              <div
                className={`text-base sm:text-lg font-bold mt-1 ${
                  top1Margin > 0.3 ? 'text-[#245B38]' : top1Margin > 0.1 ? 'text-[#B88728]' : 'text-[#8A352E]'
                }`}
              >
                {top1Margin.toFixed(4)}
              </div>
              <div className="text-[11px] text-[#70736F] mt-0.5">Score gap to 2nd</div>
            </div>
          </div>

          {/* Sub-bar: Status and Run ID */}
          <div className="mt-3 pt-2.5 border-t border-[#EAE6DF] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#70736F]">
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#70736F]">Engine status:</span>
              <span
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold ${
                  isCorrect
                    ? 'bg-[#EBF7EE] border border-[#B2D8BD] text-[#245B38]'
                    : isInterference
                    ? 'bg-[#FDF2F0] border border-[#ECC0BC] text-[#8A352E]'
                    : 'bg-[#FAF8F5] border border-[#D9DCD8] text-[#4F514E]'
                }`}
              >
                {isCorrect ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-[#245B38]" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-[#8A352E]" />
                )}
                {status}
              </span>
              <span className="hidden sm:inline text-[#D9DCD8]">•</span>
              <span className="hidden sm:inline text-xs text-[#70736F]">
                q = vector("{activeProbe}", {config.dimension})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[#70736F] text-xs">Reproducible run:</span>
              <span className="px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#D9DCD8] text-[#252525] text-xs font-semibold">
                {currentRunId}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default DebugPanel;

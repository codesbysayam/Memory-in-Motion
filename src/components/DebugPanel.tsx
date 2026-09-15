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
      className={`rounded-2xl border border-[#232B3E] bg-[#0A0E17] text-slate-100 p-4 sm:p-5 shadow-xl transition-all ${className}`}
    >
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1A2333] pb-3 mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-emerald-400">
                [ENGINE STATE VERIFIER]
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#121A2A] border border-[#232E47] text-cyan-300 uppercase">
                <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
                {mode} MODE
              </span>
            </div>
            <h3 className="font-serif text-sm sm:text-base font-bold text-white">
              Deterministic Memory State Diagnostics
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={handleCopy}
            title="Copy current telemetry JSON"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-[#121927] hover:bg-[#1A2438] border border-[#222E44] text-slate-300 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-[11px]">COPIED</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[11px]">EXPORT JSON</span>
              </>
            )}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2 py-1 rounded-lg text-xs bg-[#121927] hover:bg-[#1A2438] border border-[#222E44] text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            {isExpanded ? 'COLLAPSE' : 'EXPAND'}
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
              className="p-2.5 rounded-xl bg-[#0E1524] border border-[#1C263A] flex flex-col justify-between"
            >
              <div className="text-[10px] text-slate-400 uppercase tracking-tight">
                ACTIVE FACTS
              </div>
              <div className="text-base sm:text-lg font-bold text-white mt-1">
                {activeFactsCount}
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">Stream facts count</div>
            </div>

            {/* 2. Current Step Index */}
            <div
              id="debug-metric-step-index"
              className="p-2.5 rounded-xl bg-[#0E1524] border border-[#1C263A] flex flex-col justify-between"
            >
              <div className="text-[10px] text-slate-400 uppercase tracking-tight">
                STEP INDEX
              </div>
              <div className="text-base sm:text-lg font-bold text-cyan-300 mt-1">
                t = {step}
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">Transitions executed</div>
            </div>

            {/* 3. Matrix Frobenius Norm */}
            <div
              id="debug-metric-matrix-norm"
              className="p-2.5 rounded-xl bg-[#0E1524] border border-[#1C263A] flex flex-col justify-between"
            >
              <div className="text-[10px] text-slate-400 uppercase tracking-tight flex items-center justify-between">
                <span>||M||_F NORM</span>
              </div>
              <div className="text-base sm:text-lg font-bold text-amber-300 mt-1 font-mono">
                {matrixNorm.toFixed(4)}
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">
                <GlossaryTerm term="Frobenius norm" className="text-slate-400 hover:text-amber-300 border-dashed border-slate-600">
                  Frobenius state
                </GlossaryTerm>
              </div>
            </div>

            {/* 4. Active Probe Key */}
            <div
              id="debug-metric-active-probe"
              className="p-2.5 rounded-xl bg-[#0E1524] border border-[#1C263A] flex flex-col justify-between"
            >
              <div className="text-[10px] text-slate-400 uppercase tracking-tight">
                PROBE KEY
              </div>
              <div className="text-base sm:text-lg font-bold text-white mt-1 truncate" title={activeProbe || 'None'}>
                "{activeProbe || 'None'}"
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">Query association</div>
            </div>

            {/* 5. Model Prediction */}
            <div
              id="debug-metric-prediction"
              className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                isCorrect
                  ? 'bg-emerald-950/30 border-emerald-700/50 text-emerald-300'
                  : isInterference
                  ? 'bg-rose-950/30 border-rose-700/50 text-rose-300'
                  : 'bg-[#0E1524] border-[#1C263A] text-slate-200'
              }`}
            >
              <div className="text-[10px] uppercase tracking-tight opacity-75">
                PREDICTION
              </div>
              <div className="text-base sm:text-lg font-bold mt-1 truncate" title={prediction}>
                {prediction}
              </div>
              <div className="text-[9px] opacity-60 mt-0.5">Argmax projection</div>
            </div>

            {/* 6. Ground Truth */}
            <div
              id="debug-metric-ground-truth"
              className="p-2.5 rounded-xl bg-[#0E1524] border border-[#1C263A] flex flex-col justify-between"
            >
              <div className="text-[10px] text-slate-400 uppercase tracking-tight">
                GROUND TRUTH
              </div>
              <div className="text-base sm:text-lg font-bold text-white mt-1 truncate" title={groundTruth}>
                {groundTruth}
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">Target value</div>
            </div>

            {/* 7. Retrieval Score */}
            <div
              id="debug-metric-retrieval-score"
              className="p-2.5 rounded-xl bg-[#0E1524] border border-[#1C263A] flex flex-col justify-between"
              title="This score is computed from representation similarity. It is not a calibrated probability."
            >
              <div className="text-[10px] text-slate-400 uppercase tracking-tight">
                SCORE
              </div>
              <div className="text-base sm:text-lg font-bold text-purple-300 mt-1">
                {retrievalScore.toFixed(4)}
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">Top-1 cosine sim</div>
            </div>

            {/* 8. Top-1 Margin */}
            <div
              id="debug-metric-top1-margin"
              className="p-2.5 rounded-xl bg-[#0E1524] border border-[#1C263A] flex flex-col justify-between"
            >
              <div className="text-[10px] text-slate-400 uppercase tracking-tight">
                TOP-1 MARGIN
              </div>
              <div
                className={`text-base sm:text-lg font-bold mt-1 ${
                  top1Margin > 0.3 ? 'text-emerald-400' : top1Margin > 0.1 ? 'text-amber-400' : 'text-rose-400'
                }`}
              >
                {top1Margin.toFixed(4)}
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">Score gap to 2nd</div>
            </div>
          </div>

          {/* Sub-bar: Status and Run ID */}
          <div className="mt-3 pt-2.5 border-t border-[#182133] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-500">ENGINE STATUS:</span>
              <span
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold ${
                  isCorrect
                    ? 'bg-emerald-950/60 border border-emerald-600/70 text-emerald-300'
                    : isInterference
                    ? 'bg-rose-950/60 border border-rose-600/70 text-rose-300'
                    : 'bg-slate-800 border border-slate-700 text-slate-300'
                }`}
              >
                {isCorrect ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                )}
                {status.toUpperCase()}
              </span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="hidden sm:inline text-[11px] text-slate-400">
                q = vector("{activeProbe}", {config.dimension})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px]">REPRODUCIBLE RUN:</span>
              <span className="px-2 py-0.5 rounded bg-[#101726] border border-[#1F2B44] text-slate-300 text-[11px] font-semibold">
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

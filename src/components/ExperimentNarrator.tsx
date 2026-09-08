import React from 'react';
import { Target, AlertTriangle, CheckCircle, Sparkles, HelpCircle } from 'lucide-react';
import { SourceBadge } from './ui/SourceBadge';

export type DiscoveryPhase =
  | 'INITIAL_SUCCESS'
  | 'MANIPULATING'
  | 'FAILURE_DETECTED'
  | 'QUESTION_ACTIVE'
  | 'EXPLANATION_REVEALED'
  | 'DISCOVERY_COMPLETE';

interface ExperimentNarratorProps {
  phase: DiscoveryPhase;
  targetKey: string;
  groundTruth: string;
  prediction: string;
  isCorrect: boolean;
  distractorCount: number;
  dimension: number;
}

export const ExperimentNarrator: React.FC<ExperimentNarratorProps> = ({
  phase,
  targetKey,
  groundTruth,
  prediction,
  isCorrect,
  distractorCount,
  dimension,
}) => {
  return (
    <div className="rounded-xl border border-[#252E40] bg-[#0C111D] p-5 text-slate-100 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2536] pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded font-semibold">
            DISCOVERY MODE
          </span>
          <span className="text-xs font-mono text-slate-400">
            Scientific Discovery Loop: Predict → Manipulate → Observe → Explain
          </span>
        </div>
        <div className="flex items-center gap-2">
          <SourceBadge type="TOY COMPUTATION" />
          <span className="text-[11px] font-mono text-slate-500">Live Browser Engine</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-950/80 border border-blue-800/80 text-blue-400 shrink-0 mt-0.5">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold font-mono text-white">
              MEMORY TEST: CAN YOUR MEMORY HOLD THIS?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
              I will show the system a sequence of facts. You control the memory parameters.
              <br />
              <strong className="text-amber-300 font-mono">
                Your Challenge: Try to manipulate parameters until it forgets: {targetKey} → {groundTruth}
              </strong>
            </p>
          </div>
        </div>

        {/* Phase-specific feedback banner */}
        {phase === 'INITIAL_SUCCESS' && (
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-xs font-mono text-emerald-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Baseline state: Model correctly answers <strong>{targetKey} → {prediction}</strong> at D={dimension} with {distractorCount} distractors.
              </span>
            </div>
            <span className="text-emerald-400 font-bold shrink-0">STABLE ✓</span>
          </div>
        )}

        {(phase === 'FAILURE_DETECTED' || phase === 'QUESTION_ACTIVE') && (
          <div className="p-3.5 rounded-lg bg-rose-950/50 border border-rose-700/60 text-xs font-mono text-rose-200 flex items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <div className="font-bold text-rose-300 uppercase tracking-wide text-xs">
                  MEMORY FAILURE DETECTED: Prediction ≠ Ground Truth
                </div>
                <div className="text-[11px] text-rose-200/90 mt-0.5">
                  Expected <strong className="text-white">{groundTruth}</strong>, but associative retrieval produced{' '}
                  <strong className="text-rose-400 underline">{prediction}</strong>.
                </div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded bg-rose-900/80 text-rose-300 font-bold text-xs border border-rose-600/60 shrink-0">
              COLLISION ✕
            </span>
          </div>
        )}

        {phase === 'EXPLANATION_REVEALED' && (
          <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-800/50 text-xs font-mono text-blue-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
            <span>
              Analysis Unlocked: Examine the exact state displacement and trace the failure sequence below.
            </span>
          </div>
        )}

        {phase === 'DISCOVERY_COMPLETE' && (
          <div className="p-3.5 rounded-lg bg-gradient-to-r from-purple-950/50 to-blue-950/50 border border-purple-800/60 text-xs font-mono text-purple-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>DISCOVERY COMPLETE:</strong> You successfully forced the model to experience state interference!
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

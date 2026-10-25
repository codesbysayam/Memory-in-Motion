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
    <div className="rounded-xl border border-[#D8DCD8] bg-[#FFFFFF] p-5 text-[#252525] shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6DF] pb-3 mb-4 font-sans">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#A46622] bg-[#FFF5D8] border border-[#F3E5BE] px-2 py-0.5 rounded font-semibold">
            Discovery mode
          </span>
          <span className="text-xs text-[#5F625F]">
            Scientific discovery loop: Predict → Manipulate → Observe → Explain
          </span>
        </div>
        <div className="flex items-center gap-2">
          <SourceBadge type="TOY COMPUTATION" />
          <span className="text-xs text-[#5F625F]">Live browser engine</span>
        </div>
      </div>

      <div className="space-y-3 font-sans">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[#E7F2FA] border border-[#CDE1F0] text-[#21445B] shrink-0 mt-0.5">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-[#252525]">
              Memory challenge: Can fixed memory preserve this fact?
            </h3>
            <p className="text-xs sm:text-sm text-[#5F625F] mt-1 leading-relaxed">
              We present the recurrent model with sequential facts. You control the state parameters.
              <br />
              <strong className="text-[#A46622] font-medium">
                Challenge: Adjust parameters until state interference changes retrieval of: <span className="font-mono text-[#252525]">{targetKey} → {groundTruth}</span>
              </strong>
            </p>
          </div>
        </div>

        {/* Phase-specific feedback banner */}
        {phase === 'INITIAL_SUCCESS' && (
          <div className="p-3 rounded-lg bg-[#DCEFE2] border border-[#C5DDCB] text-xs font-sans text-[#245B38] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#247A4B] shrink-0" />
              <span>
                Baseline state: Model correctly retrieves <strong>{targetKey} → {prediction}</strong> at dimension D={dimension} with {distractorCount} distractor facts.
              </span>
            </div>
            <span className="text-[#245B38] font-bold shrink-0">Stable state ✓</span>
          </div>
        )}

        {(phase === 'FAILURE_DETECTED' || phase === 'QUESTION_ACTIVE') && (
          <div className="p-3.5 rounded-lg bg-[#F9E9ED] border border-[#F2CAD2] text-xs font-sans text-[#B64235] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-[#B64235] shrink-0" />
              <div>
                <div className="font-bold text-[#B64235] text-xs">
                  Interference detected: Prediction does not match ground truth
                </div>
                <div className="text-xs text-[#B64235]/90 mt-0.5">
                  Expected <strong className="text-[#252525] font-mono">{groundTruth}</strong>, but associative retrieval produced{' '}
                  <strong className="underline font-mono">{prediction}</strong>.
                </div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded bg-[#FFFFFF] text-[#B64235] font-bold text-xs border border-[#F2CAD2] shrink-0">
              Interference observed ✕
            </span>
          </div>
        )}

        {phase === 'EXPLANATION_REVEALED' && (
          <div className="p-3 rounded-lg bg-[#E7F2FA] border border-[#CDE1F0] text-xs font-sans text-[#21445B] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#21445B] shrink-0" />
            <span>
              Analysis available: Examine the exact state displacement and trace the failure sequence below.
            </span>
          </div>
        )}

        {phase === 'DISCOVERY_COMPLETE' && (
          <div className="p-3.5 rounded-lg bg-[#FAF8F5] border border-[#D8DCD8] text-xs font-sans text-[#252525] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#A46622] shrink-0" />
              <span>
                <strong>Discovery complete:</strong> You demonstrated how finite capacity leads directly to superposition interference!
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

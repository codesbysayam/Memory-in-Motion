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
    <div className="diagram-frame p-5 text-[var(--text-primary)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3 mb-4 font-sans">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--accent-yellow-text)] bg-[var(--accent-yellow)] border border-[var(--color-warning-border)] px-2 py-0.5 rounded font-semibold">
            Discovery mode
          </span>
          <span className="text-xs text-[var(--text-secondary)]">
            Scientific discovery loop: Predict → Manipulate → Observe → Explain
          </span>
        </div>
        <div className="flex items-center gap-2">
          <SourceBadge type="TOY COMPUTATION" />
          <span className="text-xs text-[var(--text-secondary)]">Live browser engine</span>
        </div>
      </div>

      <div className="space-y-3 font-sans">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[var(--accent-blue)] border border-[var(--border)] text-[var(--accent-blue-text)] shrink-0 mt-0.5">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-[var(--text-primary)]">
              Memory challenge: Can fixed memory preserve this fact?
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
              We present the recurrent model with sequential facts. You control the state parameters.
              <br />
              <strong className="text-[var(--accent-yellow-text)] font-medium">
                Challenge: Adjust parameters until state interference changes retrieval of:{' '}
                <span className="font-mono text-[var(--text-primary)]">{targetKey} → {groundTruth}</span>
              </strong>
            </p>
          </div>
        </div>

        {/* Phase-specific feedback banner */}
        {phase === 'INITIAL_SUCCESS' && (
          <div className="p-3 rounded-lg bg-[var(--accent-green)] border border-[var(--color-success-border)] text-xs font-sans text-[var(--accent-green-text)] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[var(--accent-green-text)] shrink-0" />
              <span>
                Baseline state: Model correctly retrieves <strong className="text-[var(--text-primary)]">{targetKey} → {prediction}</strong> at dimension <span className="tabular-nums">D={dimension}</span> with <span className="tabular-nums">{distractorCount}</span> distractor facts.
              </span>
            </div>
            <span className="text-[var(--accent-green-text)] font-bold shrink-0">Stable state ✓</span>
          </div>
        )}

        {(phase === 'FAILURE_DETECTED' || phase === 'QUESTION_ACTIVE') && (
          <div className="p-3.5 rounded-lg bg-[var(--accent-pink)] border border-[var(--color-danger-border)] text-xs font-sans text-[var(--accent-pink-text)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-[var(--accent-pink-text)] shrink-0" />
              <div>
                <div className="font-bold text-[var(--accent-pink-text)] text-xs">
                  Interference detected: Prediction does not match ground truth
                </div>
                <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Expected <strong className="text-[var(--text-primary)] font-mono">{groundTruth}</strong>, but associative retrieval produced{' '}
                  <strong className="underline font-mono text-[var(--accent-pink-text)]">{prediction}</strong>.
                </div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded bg-[var(--surface)] text-[var(--accent-pink-text)] font-bold text-xs border border-[var(--color-danger-border)] shrink-0">
              Interference observed ✕
            </span>
          </div>
        )}

        {phase === 'EXPLANATION_REVEALED' && (
          <div className="p-3 rounded-lg bg-[var(--accent-blue)] border border-[var(--border)] text-xs font-sans text-[var(--accent-blue-text)] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--accent-blue-text)] shrink-0" />
            <span>
              Analysis available: Examine the exact state displacement and trace the failure sequence below.
            </span>
          </div>
        )}

        {phase === 'DISCOVERY_COMPLETE' && (
          <div className="p-3.5 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)] text-xs font-sans text-[var(--text-primary)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--accent-yellow-text)] shrink-0" />
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

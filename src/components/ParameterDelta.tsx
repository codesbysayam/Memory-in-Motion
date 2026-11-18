import React from 'react';
import { ExperimentConfig } from '../types/experiment';
import { CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Activity } from 'lucide-react';

export interface ParameterDeltaProps {
  prevConfig?: Partial<ExperimentConfig>;
  currConfig?: Partial<ExperimentConfig>;
  prev?: Partial<ExperimentConfig>;
  curr?: Partial<ExperimentConfig>;
  prevResult?: {
    prediction: string;
    confidence: number;
    isCorrect: boolean;
  };
  currResult?: {
    prediction: string;
    confidence: number;
    isCorrect: boolean;
  };
  queryKey?: string;
}

export const ParameterDelta: React.FC<ParameterDeltaProps> = ({
  prevConfig: rawPrevConfig,
  currConfig: rawCurrConfig,
  prev,
  curr,
  prevResult,
  currResult,
  queryKey = 'Japan',
}) => {
  const prevConfig = (rawPrevConfig || prev || {}) as ExperimentConfig;
  const currConfig = (rawCurrConfig || curr || {}) as ExperimentConfig;
  // Find changed parameters
  const paramNames: (keyof ExperimentConfig)[] = [
    'dimension',
    'retention',
    'writeStrength',
    'interference',
    'distractors',
    'seed',
  ];

  const changedParams: {
    key: keyof ExperimentConfig;
    name: string;
    oldVal: string | number;
    newVal: string | number;
  }[] = [];

  const constantParams: string[] = [];

  paramNames.forEach((key) => {
    const oldVal = prevConfig[key];
    const newVal = currConfig[key];

    if (oldVal !== newVal) {
      let formatOld: string | number = oldVal;
      let formatNew: string | number = newVal;

      if (key === 'retention') {
        formatOld = `${Math.round(Number(oldVal) * 100)}%`;
        formatNew = `${Math.round(Number(newVal) * 100)}%`;
      }

      changedParams.push({
        key,
        name:
          key === 'dimension'
            ? 'Memory Dimension (D)'
            : key === 'retention'
            ? 'Retention Rate (λ)'
            : key === 'writeStrength'
            ? 'Write Strength (η)'
            : key === 'distractors'
            ? 'Distractor Facts (N)'
            : key === 'interference'
            ? 'Interference Factor'
            : 'Seed',
        oldVal: formatOld,
        newVal: formatNew,
      });
    } else {
      constantParams.push(
        key === 'dimension'
          ? 'Dimension'
          : key === 'retention'
          ? 'Retention'
          : key === 'distractors'
          ? 'Distractors'
          : key === 'writeStrength'
          ? 'Write Strength'
          : key
      );
    }
  });

  const isSingleVariable = changedParams.length === 1;
  const isMultiVariable = changedParams.length > 1;

  if (changedParams.length === 0) {
    return null;
  }

  const singleParam = changedParams[0];

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-xs space-y-3 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[var(--accent-blue-text)]" />
          <span className="font-semibold text-[var(--text-primary)] uppercase tracking-wider text-xs font-sans">
            What changed?
          </span>
        </div>

        {isSingleVariable ? (
          <span className="px-2.5 py-0.5 rounded bg-[var(--accent-green)] border border-[var(--color-success-border)] text-[var(--accent-green-text)] text-xs font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[var(--accent-green-text)]" />
            Controlled comparison (1 variable)
          </span>
        ) : (
          <span className="px-2.5 py-0.5 rounded bg-[var(--accent-yellow)] border border-[var(--color-warning-border)] text-[var(--accent-yellow-text)] text-xs font-semibold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-[var(--accent-yellow-text)]" />
            Multi-variable change ({changedParams.length} variables)
          </span>
        )}
      </div>

      {/* Parameter Delta Display */}
      <div className="space-y-1.5">
        <span className="text-xs text-[var(--text-secondary)] uppercase font-medium">Parameter delta:</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {changedParams.map((p) => (
            <div
              key={p.key}
              className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-between"
            >
              <span className="text-[var(--text-primary)] font-medium">{p.name}</span>
              <div className="flex items-center gap-1.5 font-mono font-bold tabular-nums">
                <span className="text-[var(--accent-pink-text)]">{p.oldVal}</span>
                <ArrowRight className="w-3 h-3 text-[var(--text-muted)]" />
                <span className="text-[var(--accent-green-text)]">{p.newVal}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Output Changes (Before vs After) */}
      {prevResult && currResult && (
        <div className="space-y-1.5 pt-1">
          <span className="text-xs text-[var(--text-secondary)] uppercase font-medium">Output changes for probe "{queryKey}":</span>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            {/* Prediction */}
            <div className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
              <span className="text-xs text-[var(--text-secondary)] block uppercase font-medium">Prediction</span>
              <div className="flex items-center justify-center gap-1 mt-0.5 font-serif font-semibold">
                <span className={prevResult.isCorrect ? 'text-[var(--accent-green-text)]' : 'text-[var(--accent-pink-text)]'}>
                  {prevResult.prediction}
                </span>
                <ArrowRight className="w-2.5 h-2.5 text-[var(--text-muted)]" />
                <span className={currResult.isCorrect ? 'text-[var(--accent-green-text)] font-bold' : 'text-[var(--accent-pink-text)] font-bold'}>
                  {currResult.prediction}
                </span>
              </div>
            </div>

            {/* Retrieval Score */}
            <div className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)]" title="Cosine similarity between retrieved representation and candidate. This is not a calibrated probability.">
              <span className="text-xs text-[var(--text-secondary)] block uppercase font-medium">Retrieval score</span>
              <div className="flex items-center justify-center gap-1 mt-0.5 font-mono tabular-nums">
                <span className="text-[var(--text-secondary)]">{Math.round(prevResult.confidence * 100)}%</span>
                <ArrowRight className="w-2.5 h-2.5 text-[var(--text-muted)]" />
                <span className="text-[var(--accent-blue-text)] font-bold">{Math.round(currResult.confidence * 100)}%</span>
              </div>
            </div>

            {/* Accuracy / Status */}
            <div className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
              <span className="text-xs text-[var(--text-secondary)] block uppercase font-medium">Status</span>
              <div className="flex items-center justify-center gap-1 mt-0.5 font-sans font-semibold">
                <span className={prevResult.isCorrect ? 'text-[var(--accent-green-text)]' : 'text-[var(--accent-pink-text)]'}>
                  {prevResult.isCorrect ? 'Pass' : 'Collision'}
                </span>
                <ArrowRight className="w-2.5 h-2.5 text-[var(--text-muted)]" />
                <span className={currResult.isCorrect ? 'text-[var(--accent-green-text)]' : 'text-[var(--accent-pink-text)]'}>
                  {currResult.isCorrect ? 'Pass' : 'Collision'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* What Stayed Fixed? */}
      <div className="pt-2 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
        <div>
          <span className="text-[var(--text-primary)] font-semibold">Held constant: </span>
          <span>{constantParams.join(', ')} · Dataset (Canonical Facts) · Seed {currConfig.seed}</span>
        </div>

        {isMultiVariable && (
          <span className="text-[var(--accent-yellow-text)] italic">
            *Multiple variables shifted simultaneously; outcome cannot be attributed to a single cause.
          </span>
        )}
      </div>
    </div>
  );
};

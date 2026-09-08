import React from 'react';
import { ExperimentConfig } from '../types/experiment';
import { CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Activity } from 'lucide-react';

export interface ParameterDeltaProps {
  prevConfig: ExperimentConfig;
  currConfig: ExperimentConfig;
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
  prevConfig,
  currConfig,
  prevResult,
  currResult,
  queryKey = 'Japan',
}) => {
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
    <div className="rounded-xl border border-[#222B3D] bg-[#0A0E18] p-4 font-mono text-xs space-y-3 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1C2436] pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#22D3EE]" />
          <span className="font-bold text-white uppercase tracking-wider text-[11px]">
            WHAT CHANGED?
          </span>
        </div>

        {isSingleVariable ? (
          <span className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold uppercase flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            CONTROLLED COMPARISON (1 VARIABLE)
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded bg-amber-950/70 border border-amber-500/40 text-amber-300 text-[10px] font-bold uppercase flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            MULTI-VARIABLE CHANGE ({changedParams.length} VARIABLES)
          </span>
        )}
      </div>

      {/* Parameter Delta Display */}
      <div className="space-y-1.5">
        <span className="text-[10px] text-slate-400 uppercase">PARAMETER DELTA:</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {changedParams.map((p) => (
            <div
              key={p.key}
              className="p-2.5 rounded-lg bg-[#111624] border border-[#232B3E] flex items-center justify-between"
            >
              <span className="text-slate-300 font-semibold">{p.name}</span>
              <div className="flex items-center gap-1.5 font-bold">
                <span className="text-rose-400">{p.oldVal}</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span className="text-emerald-400">{p.newVal}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Output Changes (Before vs After) */}
      {prevResult && currResult && (
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] text-slate-400 uppercase">OUTPUT CHANGES FOR PROBE "{queryKey}":</span>
          <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
            {/* Prediction */}
            <div className="p-2 rounded bg-[#0E131E] border border-[#1E2536]">
              <span className="text-[9px] text-slate-400 block uppercase">PREDICTION</span>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <span className={prevResult.isCorrect ? 'text-emerald-400' : 'text-rose-400'}>
                  {prevResult.prediction}
                </span>
                <ArrowRight className="w-2.5 h-2.5 text-slate-500" />
                <span className={currResult.isCorrect ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {currResult.prediction}
                </span>
              </div>
            </div>

            {/* Retrieval Score */}
            <div className="p-2 rounded bg-[#0E131E] border border-[#1E2536]" title="This score is based on representation similarity and is not a calibrated probability.">
              <span className="text-[9px] text-slate-400 block uppercase">RETRIEVAL SCORE</span>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <span className="text-slate-400">{Math.round(prevResult.confidence * 100)}%</span>
                <ArrowRight className="w-2.5 h-2.5 text-slate-500" />
                <span className="text-[#22D3EE] font-bold">{Math.round(currResult.confidence * 100)}%</span>
              </div>
            </div>

            {/* Accuracy / Status */}
            <div className="p-2 rounded bg-[#0E131E] border border-[#1E2536]">
              <span className="text-[9px] text-slate-400 block uppercase">STATUS</span>
              <div className="flex items-center justify-center gap-1 mt-0.5 font-bold">
                <span className={prevResult.isCorrect ? 'text-emerald-400' : 'text-rose-400'}>
                  {prevResult.isCorrect ? 'PASS' : 'FAIL'}
                </span>
                <ArrowRight className="w-2.5 h-2.5 text-slate-500" />
                <span className={currResult.isCorrect ? 'text-emerald-400' : 'text-rose-400'}>
                  {currResult.isCorrect ? 'PASS' : 'FAIL'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* What Stayed Fixed? */}
      <div className="pt-2 border-t border-[#1C2436] flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
        <div>
          <span className="text-slate-300 font-bold">HELD CONSTANT: </span>
          <span>{constantParams.join(', ')} · Dataset (Canonical Facts) · Seed {currConfig.seed}</span>
        </div>

        {isMultiVariable && (
          <span className="text-amber-400 italic">
            *Multiple variables shifted simultaneously; outcome cannot be attributed to a single cause.
          </span>
        )}
      </div>
    </div>
  );
};

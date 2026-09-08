import React, { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, Play, RotateCcw, AlertOctagon, HelpCircle, Sparkles } from 'lucide-react';
import { SourceBadge } from './ui/SourceBadge';
import { StateDiff } from './StateDiff';

interface FailureExplanationProps {
  targetKey: string;
  groundTruth: string;
  prediction: string;
  confidence: number;
  prevState: number[];
  currState: number[];
  dimension: number;
  distractorCount: number;
  onTraceFailure: () => void;
  onTryAgain: () => void;
  onCompleteDiscovery: () => void;
  id?: string;
}

export const FailureExplanation: React.FC<FailureExplanationProps> = ({
  targetKey,
  groundTruth,
  prediction,
  confidence,
  prevState,
  currState,
  dimension,
  distractorCount,
  onTraceFailure,
  onTryAgain,
  onCompleteDiscovery,
  id = 'failure-explanation-panel',
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [isTracing, setIsTracing] = useState<boolean>(false);
  const [traceStep, setTraceStep] = useState<number>(0);

  const options = [
    {
      id: 'A',
      text: 'The model received incorrect training data',
      isCorrect: false,
      feedback: 'Incorrect. The training/input data provided was 100% correct and deterministic.',
    },
    {
      id: 'B',
      text: 'The fixed memory became overloaded/interfered',
      isCorrect: true,
      feedback: 'Correct! A fixed-size representation must superimpose incoming facts. As capacity bounds are exceeded, overlapping coordinate writes interfere with retrieval.',
    },
    {
      id: 'C',
      text: 'The query disappeared from the input stream',
      isCorrect: false,
      feedback: 'Incorrect. The exact query key ("Japan") was preserved and presented directly at retrieval.',
    },
    {
      id: 'D',
      text: 'Random failure or non-deterministic coin flip',
      isCorrect: false,
      feedback: 'Incorrect. The underlying mathematical operations are strictly deterministic matrix additions.',
    },
  ];

  const handleSelectOption = (optId: string) => {
    if (hasAnswered) return;
    setSelectedOption(optId);
    setHasAnswered(true);
  };

  const handleRunTrace = () => {
    setIsTracing(true);
    setTraceStep(1);
    onTraceFailure();

    // Step through the actual stages:
    // 1. INPUT -> 2. MEMORY WRITE -> 3. STATE CHANGE -> 4. QUERY -> 5. RETRIEVAL -> 6. WRONG VALUE
    let s = 1;
    const interval = setInterval(() => {
      s++;
      setTraceStep(s);
      if (s >= 6) {
        clearInterval(interval);
        setIsTracing(false);
      }
    }, 700);
  };

  const traceStages = [
    { num: 1, title: 'INPUT', desc: `Distractors & "${targetKey} → ${groundTruth}"` },
    { num: 2, title: 'MEMORY WRITE', desc: 'M[t] = λM[t-1] + η(k ⊗ v)' },
    { num: 3, title: 'STATE CHANGE', desc: `Superposition in D=${dimension} dims` },
    { num: 4, title: 'QUERY', desc: `q = vector("${targetKey}")` },
    { num: 5, title: 'RETRIEVAL', desc: `v̂ = qᵀ · M` },
    { num: 6, title: 'WRONG VALUE', desc: `Cosine argmax = "${prediction}" ✕` },
  ];

  return (
    <div id={id} className="rounded-2xl border border-rose-900/60 bg-[#0B0F19] p-5 sm:p-7 text-slate-100 shadow-2xl space-y-6">
      {/* Failure Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2536] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-rose-950/80 border border-rose-800/80 text-rose-400">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400">
                DIAGNOSTIC INQUIRY
              </span>
              <SourceBadge type="OBSERVED RESULT" />
            </div>
            <h3 className="text-lg font-bold font-mono text-white mt-0.5">
              Why do you think this memory failure happened?
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Target: <strong className="text-white">{targetKey}</strong></span>
          <span>·</span>
          <span>Output: <strong className="text-rose-400">{prediction}</strong></span>
        </div>
      </div>

      {/* Multiple Choice Options */}
      <div className="space-y-2.5">
        {options.map((opt) => {
          const isSelected = selectedOption === opt.id;
          let btnClass = 'border-[#232B3D] bg-[#121826] hover:bg-[#182133] text-slate-200';

          if (hasAnswered) {
            if (opt.isCorrect) {
              btnClass = 'border-emerald-700 bg-emerald-950/50 text-emerald-200';
            } else if (isSelected && !opt.isCorrect) {
              btnClass = 'border-rose-700 bg-rose-950/50 text-rose-200';
            } else {
              btnClass = 'border-[#1C2332] bg-[#0E131E] opacity-50 text-slate-500';
            }
          }

          return (
            <button
              key={opt.id}
              onClick={() => handleSelectOption(opt.id)}
              disabled={hasAnswered}
              className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3.5 text-xs sm:text-sm font-mono ${btnClass}`}
            >
              <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center font-bold shrink-0 text-slate-300">
                {opt.id}
              </span>
              <div className="flex-1">
                <div>{opt.text}</div>
                {hasAnswered && isSelected && (
                  <p
                    className={`mt-2 text-xs leading-relaxed font-sans ${
                      opt.isCorrect ? 'text-emerald-300' : 'text-rose-300'
                    }`}
                  >
                    {opt.feedback}
                  </p>
                )}
                {hasAnswered && !isSelected && opt.isCorrect && (
                  <p className="mt-2 text-xs leading-relaxed font-sans text-emerald-400 font-medium">
                    ✓ {opt.feedback}
                  </p>
                )}
              </div>
              {hasAnswered && opt.isCorrect && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              )}
              {hasAnswered && isSelected && !opt.isCorrect && (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Revealed Explanation & State Difference */}
      {hasAnswered && (
        <div className="pt-4 border-t border-[#1C2538] space-y-6">
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-slate-900/40 to-purple-950/40 border border-blue-800/40">
            <div className="flex items-center gap-2 mb-2">
              <SourceBadge type="EXPLANATION" />
              <h4 className="text-sm font-bold font-mono text-blue-300">WHAT JUST HAPPENED?</h4>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              The educational model keeps a <strong>fixed-size internal representation</strong> (a {dimension}×{dimension} fast-weight matrix).
              As more information ({distractorCount} intervening distractor facts) was written into that representation,
              the non-orthogonal key vectors superimposed conflicting values onto the same coordinates.
              When queried for <em>"{targetKey}"</em>, the matrix projected strongest along the subspace of <em>"{prediction}"</em>,
              causing a catastrophic associative failure.
            </p>
          </div>

          {/* Real-Time State Diff Inspector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-300 font-semibold">
                State Vector Displacement (Before vs. After Superposition)
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Highlighting highest delta dimensions
              </span>
            </div>
            <StateDiff
              prevState={prevState}
              currState={currState}
              stepIndex={distractorCount + 1}
              inputDescription={`Distractor facts written into D=${dimension} state`}
            />
          </div>

          {/* Tracing the Recorded Failure */}
          <div className="p-4 rounded-xl bg-[#0F1422] border border-[#1E273A] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h5 className="text-xs sm:text-sm font-bold font-mono text-slate-200">
                  TRACE THE RECORDED COMPUTATION
                </h5>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Step sequentially through the deterministic vector operations that yielded the wrong answer.
                </p>
              </div>

              <button
                onClick={handleRunTrace}
                disabled={isTracing}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-mono font-semibold transition"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isTracing ? 'TRACING...' : 'TRACE THE FAILURE'}</span>
              </button>
            </div>

            {/* Trace Step Rail */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2">
              {traceStages.map((stage) => {
                const isActive = traceStep === stage.num;
                const isPassed = traceStep > stage.num;
                return (
                  <div
                    key={stage.num}
                    className={`p-2.5 rounded-lg border text-center transition-all ${
                      isActive
                        ? 'border-amber-400 bg-amber-950/60 ring-1 ring-amber-400/50'
                        : isPassed
                        ? 'border-blue-700 bg-blue-950/40'
                        : 'border-[#1E2536] bg-[#121724] opacity-60'
                    }`}
                  >
                    <div className="text-[10px] font-mono text-slate-400">STAGE 0{stage.num}</div>
                    <div
                      className={`text-xs font-bold font-mono mt-0.5 ${
                        stage.num === 6 ? 'text-rose-400' : 'text-slate-200'
                      }`}
                    >
                      {stage.title}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 truncate" title={stage.desc}>
                      {stage.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Footer: Try Again or Complete Discovery */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1C2538]">
            <button
              onClick={onTryAgain}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#192234] hover:bg-[#202B40] text-slate-200 text-xs font-mono font-semibold border border-slate-700 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>TRY AGAIN (Change 1 Parameter)</span>
            </button>

            <button
              onClick={onCompleteDiscovery}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white text-xs font-mono font-bold shadow-lg shadow-blue-500/20 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>COMPLETE DISCOVERY</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

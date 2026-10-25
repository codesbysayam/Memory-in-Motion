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
    { num: 1, title: 'Input', desc: `Distractors & "${targetKey} → ${groundTruth}"` },
    { num: 2, title: 'Memory write', desc: 'M[t] = λM[t-1] + η(k ⊗ v)' },
    { num: 3, title: 'State change', desc: `Superposition in D=${dimension} dims` },
    { num: 4, title: 'Query', desc: `q = vector("${targetKey}")` },
    { num: 5, title: 'Retrieval', desc: `v̂ = qᵀ · M` },
    { num: 6, title: 'Observed mismatch', desc: `Cosine argmax = "${prediction}"` },
  ];

  return (
    <div id={id} className="rounded-xl border border-[#D8DCD8] bg-[#FFFFFF] p-5 sm:p-7 text-[#252525] shadow-xs space-y-6">
      {/* Failure Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6DF] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#F9E9ED] border border-[#F2CAD2] text-[#B64235]">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-sans font-semibold text-[#B64235]">
                Interference inquiry
              </span>
              <SourceBadge type="OBSERVED RESULT" />
            </div>
            <h3 className="text-lg font-serif font-bold text-[#252525] mt-0.5">
              Why did this retrieval change occur?
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-sans text-[#5F625F]">
          <span>Target: <strong className="text-[#252525] font-mono">{targetKey}</strong></span>
          <span>·</span>
          <span>Output: <strong className="text-[#B64235] font-mono">{prediction}</strong></span>
        </div>
      </div>

      {/* Multiple Choice Options */}
      <div className="space-y-2.5">
        {options.map((opt) => {
          const isSelected = selectedOption === opt.id;
          let btnClass = 'border-[#D8DCD8] bg-[#FAF8F5] hover:bg-[#F0EEEA] text-[#252525]';

          if (hasAnswered) {
            if (opt.isCorrect) {
              btnClass = 'border-[#C5DDCB] bg-[#DCEFE2] text-[#245B38] font-medium';
            } else if (isSelected && !opt.isCorrect) {
              btnClass = 'border-[#F2CAD2] bg-[#F9E9ED] text-[#B64235]';
            } else {
              btnClass = 'border-[#EAE6DF] bg-[#FAF8F5] opacity-50 text-[#7D817D]';
            }
          }

          return (
            <button
              key={opt.id}
              onClick={() => handleSelectOption(opt.id)}
              disabled={hasAnswered}
              className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3.5 text-xs sm:text-sm font-sans ${btnClass}`}
            >
              <span className="w-6 h-6 rounded-lg bg-[#FFFFFF] border border-[#D8DCD8] flex items-center justify-center font-bold shrink-0 text-[#252525] font-mono text-xs">
                {opt.id}
              </span>
              <div className="flex-1">
                <div>{opt.text}</div>
                {hasAnswered && isSelected && (
                  <p
                    className={`mt-2 text-xs leading-relaxed font-sans ${
                      opt.isCorrect ? 'text-[#245B38]' : 'text-[#B64235]'
                    }`}
                  >
                    {opt.feedback}
                  </p>
                )}
                {hasAnswered && !isSelected && opt.isCorrect && (
                  <p className="mt-2 text-xs leading-relaxed font-sans text-[#245B38] font-medium">
                    ✓ {opt.feedback}
                  </p>
                )}
              </div>
              {hasAnswered && opt.isCorrect && (
                <CheckCircle2 className="w-4 h-4 text-[#247A4B] shrink-0 mt-0.5" />
              )}
              {hasAnswered && isSelected && !opt.isCorrect && (
                <XCircle className="w-4 h-4 text-[#B64235] shrink-0 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Revealed Explanation & State Difference */}
      {hasAnswered && (
        <div className="pt-4 border-t border-[#EAE6DF] space-y-6">
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF]">
            <div className="flex items-center gap-2 mb-2">
              <SourceBadge type="EXPLANATION" />
              <h4 className="text-sm font-serif font-bold text-[#252525]">Mechanistic explanation</h4>
            </div>
            <p className="text-xs sm:text-sm text-[#5F625F] leading-relaxed font-sans">
              The educational model keeps a <strong>fixed-size internal representation</strong> (a {dimension}×{dimension} fast-weight matrix).
              As more information ({distractorCount} intervening distractor facts) was written into that representation,
              the non-orthogonal key vectors superimposed conflicting values onto the same coordinates.
              When queried for <em>"{targetKey}"</em>, the matrix projected strongest along the subspace of <em>"{prediction}"</em>,
              causing an associative interference event.
            </p>
          </div>

          {/* Real-Time State Diff Inspector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-sans text-[#252525] font-semibold">
                State vector displacement (Before vs. after superposition)
              </span>
              <span className="text-xs font-sans text-[#5F625F]">
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
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h5 className="text-xs sm:text-sm font-serif font-bold text-[#252525]">
                  Trace the recorded computation
                </h5>
                <p className="text-xs text-[#5F625F] font-sans mt-0.5">
                  Step sequentially through the deterministic vector operations that yielded the observed answer.
                </p>
              </div>

              <button
                onClick={handleRunTrace}
                disabled={isTracing}
                className="px-3.5 py-1.5 rounded-lg bg-[#DCEFE2] hover:bg-[#D0E8D7] text-[#245B38] border border-[#C5DDCB] text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isTracing ? 'Tracing...' : 'Trace the failure'}</span>
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
                        ? 'border-[#2B6282] bg-[#E7F2FA] text-[#21445B] ring-1 ring-[#2B6282]'
                        : isPassed
                        ? 'border-[#C5DDCB] bg-[#DCEFE2] text-[#245B38]'
                        : 'border-[#EAE6DF] bg-[#FFFFFF] opacity-70'
                    }`}
                  >
                    <div className="text-xs font-sans text-[#5F625F]">Stage 0{stage.num}</div>
                    <div
                      className={`text-xs font-bold font-sans mt-0.5 ${
                        stage.num === 6 ? 'text-[#B64235]' : 'text-[#252525]'
                      }`}
                    >
                      {stage.title}
                    </div>
                    <div className="text-xs text-[#5F625F] mt-1 truncate" title={stage.desc}>
                      {stage.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Footer: Try Again or Complete Discovery */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#EAE6DF]">
            <button
              onClick={onTryAgain}
              className="px-3.5 py-2 rounded-lg bg-[#FAF8F5] hover:bg-[#F0EEEA] text-[#252525] border border-[#D8DCD8] text-xs font-semibold flex items-center gap-2 cursor-pointer transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#5F625F]" />
              <span>Try again (Change 1 parameter)</span>
            </button>

            <button
              onClick={onCompleteDiscovery}
              className="px-3.5 py-2 rounded-lg bg-[#DCEFE2] hover:bg-[#D0E8D7] text-[#245B38] border border-[#C5DDCB] text-xs font-bold flex items-center gap-2 cursor-pointer transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Complete discovery</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

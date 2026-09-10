import React, { useState } from 'react';
import {
  HelpCircle,
  Award,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: {
    label: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: '1. Why can fixed-size recurrent memory forget earlier information?',
    options: [
      {
        label: 'A',
        text: 'The GPU runs out of VRAM and deletes prior tokens from disk.',
        isCorrect: false,
        explanation: 'Incorrect. Memory forgetting here is an algebraic property of compressing information into a bounded state, not hardware memory exhaustion.',
      },
      {
        label: 'B',
        text: 'Representations are packed into a bounded coordinate space; accumulating updates cause geometric overlap, crosstalk, and decay.',
        isCorrect: true,
        explanation: 'Correct! Superposition in ℝ^D can only support ~D quasi-orthogonal facts before coordinate interference and coordinate decay degrade retrieval.',
      },
      {
        label: 'C',
        text: 'Because gradient descent forces all weights to reset to zero during inference.',
        isCorrect: false,
        explanation: 'Incorrect. Inference does not run backpropagation or weight resets; memory updates occur strictly via the forward recurrent pass.',
      },
    ],
  },
  {
    id: 2,
    question: '2. What fundamentally changes when memory capacity (dimension D) increases?',
    options: [
      {
        label: 'A',
        text: 'The state space supports more nearly-orthogonal directions, delaying interference and accommodating longer sequences before collision.',
        isCorrect: true,
        explanation: 'Correct! Higher dimensions provide exponentially more quasi-orthogonal directions, allowing more distinct facts to be superimposed without crosstalk.',
      },
      {
        label: 'B',
        text: 'The memory turns into a full Transformer KV cache and grows quadratically with sequence length.',
        isCorrect: false,
        explanation: 'Incorrect. The state remains fixed at size D × D; it does not expand per token like a Transformer KV cache.',
      },
      {
        label: 'C',
        text: 'The model becomes immune to all possible forms of noise and can store infinite facts.',
        isCorrect: false,
        explanation: 'Incorrect. Any finite dimension D still has a mathematical capacity limit governed by linear algebra.',
      },
    ],
  },
  {
    id: 3,
    question: '3. Where does contextual memory live in the Dragon Hatchling (BDH) architecture?',
    options: [
      {
        label: 'A',
        text: 'In an external Python dictionary passed between generation rounds.',
        isCorrect: false,
        explanation: 'Incorrect. BDH has no external dictionary or detached lookup table.',
      },
      {
        label: 'B',
        text: 'In a token tape that grows with every new token generated.',
        isCorrect: false,
        explanation: 'Incorrect. The central point of BDH is avoiding an expanding token-by-token tape.',
      },
      {
        label: 'C',
        text: 'Inside dynamic synaptic connection weights σ(i, j) and sparse neuron activations on a scale-free graph.',
        isCorrect: true,
        explanation: 'Correct! BDH stores in-context memory in plastic synaptic states σ(i, j) modulated by local Hebbian-like activity rather than an external KV cache.',
      },
    ],
  },
];

export const SixtySecondTest: React.FC = () => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSelect = (questionId: number, optionIdx: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const isComplete = answeredCount === QUESTIONS.length;

  const score = QUESTIONS.reduce((acc, q) => {
    const selected = selectedAnswers[q.id];
    if (selected !== undefined && q.options[selected]?.isCorrect) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const isSuccess = score === QUESTIONS.length;

  const handleReset = () => {
    setSelectedAnswers({});
    setSubmitted(false);
  };

  return (
    <div id="sixty-second-test" className="rounded-2xl border border-[#252A35] bg-[#0E1117] p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#252A35] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#6842C2]" />
            <h3 className="font-serif text-lg font-bold text-white tracking-tight">
              Scientific Challenge: What Did You Learn?
            </h3>
          </div>
          <p className="text-xs text-[#9E9A92] font-sans mt-0.5">
            Test your scientific mental model against the 3 core principles of recurrent working memory.
          </p>
        </div>

        {submitted && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#252A35] bg-[#151922] text-xs font-sans font-medium text-[#C8C4BC] hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Challenge</span>
          </button>
        )}
      </div>

      {/* 3 Questions */}
      <div className="space-y-6">
        {QUESTIONS.map((q) => {
          const selectedIdx = selectedAnswers[q.id];
          const selectedOption = selectedIdx !== undefined ? q.options[selectedIdx] : null;

          return (
            <div key={q.id} className="rounded-xl border border-[#252A35] bg-[#11141A] p-5 space-y-3 font-sans text-xs">
              <h4 className="text-white font-serif font-bold text-sm leading-snug">{q.question}</h4>

              <div className="space-y-2">
                {q.options.map((opt, optIdx) => {
                  const isSelected = selectedIdx === optIdx;
                  let borderClass = 'border-[#252A35] bg-[#151922] text-zinc-300 hover:border-zinc-500';

                  if (submitted) {
                    if (opt.isCorrect) {
                      borderClass = 'border-emerald-500/60 bg-emerald-950/30 text-emerald-200 font-bold';
                    } else if (isSelected && !opt.isCorrect) {
                      borderClass = 'border-rose-500/60 bg-rose-950/30 text-rose-200';
                    } else {
                      borderClass = 'border-[#252A35]/50 bg-[#151922]/50 text-zinc-500 opacity-60';
                    }
                  } else if (isSelected) {
                    borderClass = 'border-[#287C7C] bg-teal-950/40 text-teal-200 font-bold ring-1 ring-[#287C7C]';
                  }

                  return (
                    <button
                      key={opt.label}
                      onClick={() => handleSelect(q.id, optIdx)}
                      disabled={submitted}
                      className={`w-full text-left p-3 rounded-lg border transition-all flex items-start gap-3 cursor-pointer ${borderClass}`}
                    >
                      <span className="w-5 h-5 rounded-md bg-[#07080B] border border-[#252A35] flex items-center justify-center font-mono font-bold text-[11px] shrink-0">
                        {opt.label}
                      </span>
                      <span className="text-[12px] leading-relaxed flex-1 font-sans">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Immediate explanation if submitted */}
              {submitted && selectedOption && (
                <div
                  className={`p-3 rounded-lg text-[11px] leading-relaxed border font-sans ${
                    selectedOption.isCorrect
                      ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                      : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5 mb-1 font-serif">
                    {selectedOption.isCorrect ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Scientific Insight:</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        <span>Conceptual Correction:</span>
                      </>
                    )}
                  </div>
                  {selectedOption.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit / Results Verdict */}
      <div className="pt-2">
        {!submitted ? (
          <button
            onClick={() => setSubmitted(true)}
            disabled={!isComplete}
            className={`w-full py-3 px-4 rounded-xl font-sans text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              isComplete
                ? 'bg-[#287C7C] text-white hover:bg-[#206363] shadow-md cursor-pointer'
                : 'bg-[#151922] text-[#8F96A3] border border-[#252A35] cursor-not-allowed'
            }`}
          >
            <span>Submit Scientific Verdict ({answeredCount}/3 Answered)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div
            className={`rounded-xl border p-5 text-center font-sans space-y-2 ${
              isSuccess
                ? 'border-emerald-500/60 bg-emerald-950/30 text-emerald-200'
                : 'border-amber-500/60 bg-amber-950/30 text-amber-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2 text-base font-serif font-bold">
              {isSuccess ? (
                <>
                  <Award className="w-5 h-5 text-emerald-400" />
                  <span>You Understood the Mechanism ({score}/3)</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-5 h-5 text-amber-400" />
                  <span>Run the Experiment Again ({score}/3 Correct)</span>
                </>
              )}
            </div>
            <p className="text-xs text-zinc-300 max-w-xl mx-auto leading-relaxed font-sans">
              {isSuccess
                ? 'You have directly verified how fixed-size states carry information forward without expanding token-by-token caches, while experiencing how coordinate compression causes interference and forgetting.'
                : 'Review the interference curves and capacity experiments in Section 04 and try the challenge again to solidify the physical intuitions.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

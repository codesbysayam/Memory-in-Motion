import React, { useState } from 'react';
import {
  HelpCircle,
  Award,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { SixtySecondAssessment } from './SixtySecondAssessment';

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
        explanation:
          'Incorrect. Memory forgetting here is an algebraic property of compressing information into a bounded state, not hardware memory exhaustion.',
      },
      {
        label: 'B',
        text: 'Representations are packed into a bounded coordinate space; accumulating updates cause geometric overlap, crosstalk, and decay.',
        isCorrect: true,
        explanation:
          'Correct! Superposition in ℝ^D can only support ~D quasi-orthogonal facts before coordinate interference and coordinate decay degrade retrieval.',
      },
      {
        label: 'C',
        text: 'Because gradient descent forces all weights to reset to zero during inference.',
        isCorrect: false,
        explanation:
          'Incorrect. Inference does not run backpropagation or weight resets; memory updates occur strictly via the forward recurrent pass.',
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
        explanation:
          'Correct! Higher dimensions provide exponentially more quasi-orthogonal directions, allowing more distinct facts to be superimposed without crosstalk.',
      },
      {
        label: 'B',
        text: 'The memory turns into a full Transformer KV cache and grows quadratically with sequence length.',
        isCorrect: false,
        explanation:
          'Incorrect. The state remains fixed at size D × D; it does not expand per token like a Transformer KV cache.',
      },
      {
        label: 'C',
        text: 'The model becomes immune to all possible forms of noise and can store infinite facts.',
        isCorrect: false,
        explanation:
          'Incorrect. Any finite dimension D still has a mathematical capacity limit governed by linear algebra.',
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
        explanation:
          'Correct! BDH stores in-context memory in plastic synaptic states σ(i, j) modulated by local Hebbian-like activity rather than an external KV cache.',
      },
    ],
  },
];

export const SixtySecondTest: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'assessment' | 'conceptual'>('assessment');
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
    <div id="sixty-second-test" className="w-full space-y-6">
      {/* Stage Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E0D8] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#1B4D7E] px-2 py-0.5 rounded bg-[#EAF2FA] border border-[#CDE1F2]">
              07.1 VERIFICATION
            </span>
            <span className="text-xs text-[#726E65]">·</span>
            <span className="text-xs font-mono text-[#52504A]">Interactive Assessment</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1B19] tracking-tight mt-1">
            60-Second Fast Verification
          </h2>
          <p className="text-xs sm:text-sm text-[#5A574E] font-sans mt-0.5 max-w-2xl">
            A real-time evaluation testing your experimental understanding across 5 sequential stages:
            Remember, Break, Trace, Measure, and BDH Synthesis.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F0EEEA] border border-[#DCD9CF]">
          <button
            type="button"
            onClick={() => setActiveTab('assessment')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition cursor-pointer ${
              activeTab === 'assessment'
                ? 'bg-white text-[#1B4D7E] shadow-xs'
                : 'text-[#6E6B62] hover:text-[#252525]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Interactive 60s Test</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('conceptual')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition cursor-pointer ${
              activeTab === 'conceptual'
                ? 'bg-white text-[#1B4D7E] shadow-xs'
                : 'text-[#6E6B62] hover:text-[#252525]'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Theory Check (3 Qs)</span>
          </button>
        </div>
      </div>

      {/* Main Interactive 60-Second Assessment */}
      {activeTab === 'assessment' ? (
        <div className="animate-in fade-in duration-200">
          <SixtySecondAssessment isModal={false} />
        </div>
      ) : (
        /* Conceptual 3-Question Verification */
        <div className="rounded-2xl border border-[#DCD9CF] bg-[#FFFFFF] p-6 space-y-6 animate-in fade-in duration-200 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFECE6] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#1B4D7E]" />
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#1C1B19]">
                  Conceptual Principles of Recurrent State
                </h3>
              </div>
              <p className="text-xs text-[#6A675E] font-sans mt-0.5">
                Verify the algebraic reasoning behind coordinate superposition and BDH synapses.
              </p>
            </div>

            {submitted && (
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D5D2C9] bg-[#FAF9F6] text-xs font-sans font-medium text-[#4B4840] hover:bg-[#F2EFE8] transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Questions</span>
              </button>
            )}
          </div>

          <div className="space-y-5">
            {QUESTIONS.map((q) => {
              const selectedIdx = selectedAnswers[q.id];
              const selectedOption = selectedIdx !== undefined ? q.options[selectedIdx] : null;

              return (
                <div
                  key={q.id}
                  className="rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] p-5 space-y-3 font-sans text-xs"
                >
                  <h4 className="text-[#191919] font-serif font-bold text-sm leading-snug">
                    {q.question}
                  </h4>

                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedIdx === optIdx;
                      let borderClass = 'border-[#DCD9CF] bg-[#FFFFFF] text-[#33312B] hover:border-[#B5B2A8]';

                      if (submitted) {
                        if (opt.isCorrect) {
                          borderClass = 'border-[#2E7D4E] bg-[#F0F8F3] text-[#1E5635] font-bold';
                        } else if (isSelected && !opt.isCorrect) {
                          borderClass = 'border-[#C53939] bg-[#FFF5F5] text-[#9A2222]';
                        } else {
                          borderClass = 'border-[#EAE7DF] bg-[#F7F5F0] text-[#8C887E] opacity-60';
                        }
                      } else if (isSelected) {
                        borderClass = 'border-[#1B4D7E] bg-[#EAF2FA] text-[#1B4D7E] font-bold ring-1 ring-[#1B4D7E]';
                      }

                      return (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => handleSelect(q.id, optIdx)}
                          disabled={submitted}
                          className={`w-full text-left p-3 rounded-lg border transition flex items-start gap-3 cursor-pointer ${borderClass}`}
                        >
                          <span className="w-5 h-5 rounded-md bg-[#FAF9F6] border border-[#D5D2C9] flex items-center justify-center font-mono font-bold text-[11px] shrink-0">
                            {opt.label}
                          </span>
                          <span className="text-[12px] leading-relaxed flex-1 font-sans">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>

                  {submitted && selectedOption && (
                    <div
                      className={`p-3 rounded-lg text-[11px] leading-relaxed border font-sans ${
                        selectedOption.isCorrect
                          ? 'bg-[#F0F8F3] border-[#BDE0C8] text-[#1E5635]'
                          : 'bg-[#FFF5F5] border-[#F5CACA] text-[#9A2222]'
                      }`}
                    >
                      <div className="font-bold flex items-center gap-1.5 mb-1 font-serif">
                        {selectedOption.isCorrect ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D4E]" />
                            <span>Scientific Insight:</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-[#C53939]" />
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

          <div className="pt-2">
            {!submitted ? (
              <button
                type="button"
                onClick={() => setSubmitted(true)}
                disabled={!isComplete}
                className={`w-full py-3 px-4 rounded-xl font-sans text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                  isComplete
                    ? 'bg-[#1B4D7E] text-white hover:bg-[#153E65] shadow-xs'
                    : 'bg-[#EDEAE4] text-[#9A968C] border border-[#DDD9CF] cursor-not-allowed'
                }`}
              >
                <span>Submit Answers ({answeredCount}/3 Complete)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div
                className={`rounded-xl border p-5 text-center font-sans space-y-2 ${
                  isSuccess
                    ? 'border-[#BDE0C8] bg-[#F0F8F3] text-[#1E5635]'
                    : 'border-[#F8DDB3] bg-[#FEF9EE] text-[#8C6212]'
                }`}
              >
                <div className="flex items-center justify-center gap-2 text-base font-serif font-bold">
                  {isSuccess ? (
                    <>
                      <Award className="w-5 h-5 text-[#2E7D4E]" />
                      <span>Conceptual Mastery Verified ({score}/3)</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-5 h-5 text-[#B87D17]" />
                      <span>Review the Laboratory ({score}/3 Correct)</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-[#55524B] max-w-xl mx-auto leading-relaxed font-sans">
                  {isSuccess
                    ? 'You have clearly differentiated fixed-size coordinate state representations from token tapes and understood how plastic synapses in BDH avoid catastrophic forgetting.'
                    : 'Review the interference curves and capacity experiments in Stage 02 and Stage 04 to solidify the algebraic foundation.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

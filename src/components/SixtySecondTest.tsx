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
    <section id="sixty-second-test" className="w-full space-y-6">
      {/* Assessment Header & Integrated Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
            <span className="font-semibold text-[var(--accent-blue-text)] tabular-nums">07.1</span>
            <span aria-hidden="true" className="text-[var(--border)]">·</span>
            <span>Interactive assessment</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[var(--text-primary)] tracking-[-0.02em]">
            60-Second Fast Verification
          </h2>
          <p className="text-sm sm:text-[15px] text-[var(--text-secondary)] font-sans leading-relaxed">
            A real-time evaluation testing your experimental understanding across 5 sequential stages: Remember, Break, Trace, Measure, and BDH Synthesis.
          </p>
        </div>

        {/* Mode Selector integrated cleanly into section header */}
        <div
          className="inline-flex items-center gap-1 p-1 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)] self-start md:self-auto shrink-0"
          role="tablist"
          aria-label="Assessment mode"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'assessment'}
            onClick={() => setActiveTab('assessment')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-sans font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'assessment'
                ? 'bg-[var(--surface)] text-[var(--text-primary)] font-semibold border border-[var(--border)] shadow-[var(--shadow-panel)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[var(--accent-blue-text)] shrink-0" />
            <span>Interactive 60s Test</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'conceptual'}
            onClick={() => setActiveTab('conceptual')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-sans font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'conceptual'
                ? 'bg-[var(--surface)] text-[var(--text-primary)] font-semibold border border-[var(--border)] shadow-[var(--shadow-panel)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-[var(--accent-blue-text)] shrink-0" />
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
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden animate-in fade-in duration-200">
          <div className="px-5 py-4 sm:px-6 border-b border-[var(--border)] bg-[var(--surface-soft)] flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-sans font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[var(--accent-blue-text)] shrink-0" />
                <span>Conceptual Principles of Recurrent State</span>
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans mt-0.5">
                Verify the algebraic reasoning behind coordinate superposition and BDH synapses.
              </p>
            </div>

            {submitted && (
              <button
                type="button"
                onClick={handleReset}
                className="btn-secondary text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Questions</span>
              </button>
            )}
          </div>

          <div className="divide-y divide-[var(--border)]">
            {QUESTIONS.map((q) => {
              const selectedIdx = selectedAnswers[q.id];
              const selectedOption = selectedIdx !== undefined ? q.options[selectedIdx] : null;

              return (
                <div
                  key={q.id}
                  className="p-5 sm:p-6 space-y-4 font-sans"
                >
                  <h4 className="text-[var(--text-primary)] font-sans font-semibold text-base sm:text-[17px] leading-snug">
                    {q.question}
                  </h4>

                  <div className="space-y-2.5">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedIdx === optIdx;
                      let optionStyle =
                        'border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-soft)] hover:border-[var(--color-border-strong)]';
                      let badgeStyle =
                        'bg-[var(--surface-soft)] border-[var(--border)] text-[var(--text-secondary)]';

                      if (submitted) {
                        if (opt.isCorrect) {
                          optionStyle =
                            'border-[var(--color-success)] bg-[var(--accent-green)] text-[var(--accent-green-text)] font-medium';
                          badgeStyle =
                            'bg-[var(--color-success)] border-[var(--color-success)] text-[var(--surface)]';
                        } else if (isSelected && !opt.isCorrect) {
                          optionStyle =
                            'border-[var(--color-danger)] bg-[var(--accent-pink)] text-[var(--accent-pink-text)]';
                          badgeStyle =
                            'bg-[var(--color-danger)] border-[var(--color-danger)] text-[var(--surface)]';
                        } else {
                          optionStyle =
                            'border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-muted)] opacity-60 cursor-default';
                        }
                      } else if (isSelected) {
                        optionStyle =
                          'border-[var(--color-accent)] bg-[var(--accent-blue)] text-[var(--text-primary)] font-medium ring-1 ring-[var(--color-accent)]';
                        badgeStyle =
                          'bg-[var(--color-accent)] border-[var(--color-accent)] text-[var(--surface)]';
                      }

                      return (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => handleSelect(q.id, optIdx)}
                          disabled={submitted}
                          className={`w-full text-left p-3.5 rounded-lg border transition-colors flex items-start gap-3 ${
                            submitted ? 'cursor-default' : 'cursor-pointer'
                          } ${optionStyle}`}
                        >
                          <span
                            className={`w-6 h-6 rounded-md border flex items-center justify-center font-mono font-semibold text-xs shrink-0 mt-0.5 transition-colors ${badgeStyle}`}
                          >
                            {opt.label}
                          </span>
                          <span className="text-sm leading-relaxed flex-1 font-sans">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>

                  {submitted && selectedOption && (
                    <div
                      className={`p-4 rounded-lg text-xs sm:text-sm leading-relaxed border font-sans ${
                        selectedOption.isCorrect
                          ? 'bg-[var(--accent-green)] border-[var(--color-success-border)] text-[var(--accent-green-text)]'
                          : 'bg-[var(--accent-pink)] border-[var(--color-danger-border)] text-[var(--accent-pink-text)]'
                      }`}
                    >
                      <div className="font-semibold flex items-center gap-1.5 mb-1">
                        {selectedOption.isCorrect ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>Scientific insight</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 shrink-0" />
                            <span>Conceptual correction</span>
                          </>
                        )}
                      </div>
                      <p className="text-[var(--text-primary)] leading-relaxed">
                        {selectedOption.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="px-5 py-4 sm:px-6 border-t border-[var(--border)] bg-[var(--surface-soft)]">
            {!submitted ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-mono tabular-nums text-[var(--text-secondary)]">
                  {answeredCount} of {QUESTIONS.length} questions answered
                </span>
                <button
                  type="button"
                  onClick={() => setSubmitted(true)}
                  disabled={!isComplete}
                  className="btn-primary text-sm"
                >
                  <span>Submit Answers ({answeredCount}/3 Complete)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                className={`rounded-lg border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans ${
                  isSuccess
                    ? 'border-[var(--color-success-border)] bg-[var(--accent-green)] text-[var(--accent-green-text)]'
                    : 'border-[var(--color-warning-border)] bg-[var(--accent-yellow)] text-[var(--accent-yellow-text)]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-base font-semibold">
                    {isSuccess ? (
                      <>
                        <Award className="w-5 h-5 shrink-0" />
                        <span>Conceptual Mastery Verified ({score}/3)</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-5 h-5 shrink-0" />
                        <span>Review the Laboratory ({score}/3 Correct)</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed">
                    {isSuccess
                      ? 'You have clearly differentiated fixed-size coordinate state representations from token tapes and understood how plastic synapses in BDH avoid catastrophic forgetting.'
                      : 'Review the interference curves and capacity experiments in Stage 02 and Stage 04 to solidify the algebraic foundation.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="btn-secondary text-xs shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Try again</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

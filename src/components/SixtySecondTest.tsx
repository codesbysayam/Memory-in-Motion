import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  HelpCircle,
  Award,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { SixtySecondAssessment } from './SixtySecondAssessment';
import { FigureCaption } from './essay/FigureCaption';

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
    question: 'Why can fixed-size recurrent memory forget earlier information?',
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
          'Correct. Superposition in ℝ^D can only support ~D quasi-orthogonal facts before coordinate interference and decay degrade retrieval.',
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
    question: 'What fundamentally changes when memory capacity (dimension D) increases?',
    options: [
      {
        label: 'A',
        text: 'The state space supports more nearly-orthogonal directions, delaying interference and accommodating longer sequences before collision.',
        isCorrect: true,
        explanation:
          'Correct. Higher dimensions provide more quasi-orthogonal directions, allowing more distinct facts to be superimposed without crosstalk.',
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
    question: 'Where does contextual memory live in the Dragon Hatchling (BDH) architecture?',
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
          'Correct. BDH stores in-context memory in plastic synaptic states σ(i, j) modulated by local Hebbian-like activity rather than an external KV cache.',
      },
    ],
  },
];

export const SixtySecondTest: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<'assessment' | 'conceptual'>('assessment');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSelect = (questionId: number, optionIdx: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const isComplete = answeredCount === QUESTIONS.length;
  const activeQuestion = QUESTIONS[currentQuestionIdx] || QUESTIONS[0];
  const selectedIdx = selectedAnswers[activeQuestion.id];
  const selectedOption = selectedIdx !== undefined ? activeQuestion.options[selectedIdx] : null;

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
    setCurrentQuestionIdx(0);
    setSubmitted(false);
  };

  return (
    <section id="sixty-second-test" className="w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--mm-rule)] pb-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="essay-eyebrow flex items-center gap-2">
            <span className="font-semibold text-[var(--mm-signal)] tabular-nums">07.1</span>
            <span aria-hidden="true" className="text-[var(--mm-rule-strong)]">·</span>
            <span>Interactive assessment</span>
          </div>
          <h2 className="essay-section-title">
            60-Second Fast Verification
          </h2>
          <p className="essay-lead">
            A focused evaluation testing your experimental understanding across five sequential stages: Remember, Break, Trace, Measure, and BDH Synthesis.
          </p>
        </div>

        <div
          className="flex items-center gap-6 self-start md:self-end shrink-0 border-b border-transparent -mb-[17px]"
          role="tablist"
          aria-label="Assessment mode"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'assessment'}
            onClick={() => setActiveTab('assessment')}
            className={`flex items-center gap-1.5 pb-3 text-xs font-sans transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
              activeTab === 'assessment'
                ? 'border-[var(--mm-signal)] text-[var(--mm-ink)] font-semibold'
                : 'border-transparent text-[var(--mm-muted)] hover:text-[var(--mm-ink)]'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[var(--mm-signal)] shrink-0" />
            <span>Interactive 60s Test</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'conceptual'}
            onClick={() => setActiveTab('conceptual')}
            className={`flex items-center gap-1.5 pb-3 text-xs font-sans transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
              activeTab === 'conceptual'
                ? 'border-[var(--mm-signal)] text-[var(--mm-ink)] font-semibold'
                : 'border-transparent text-[var(--mm-muted)] hover:text-[var(--mm-ink)]'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-[var(--mm-signal)] shrink-0" />
            <span>Theory Check (3 Qs)</span>
          </button>
        </div>
      </div>

      {activeTab === 'assessment' ? (
        <div className="animate-in fade-in duration-200">
          <SixtySecondAssessment isModal={false} />
        </div>
      ) : (
        <div className="essay-figure-stage px-5 sm:px-8 py-6 sm:py-8 animate-in fade-in duration-200">
          <div className="essay-column space-y-6">
            {/* Single-Question Progress Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--mm-rule)] pb-4">
              <div>
                <span className="font-mono text-xs text-[var(--mm-signal)] font-semibold">
                  QUESTION {currentQuestionIdx + 1} OF {QUESTIONS.length}
                </span>
                <h3 className="text-lg font-serif font-medium text-[var(--mm-ink)] mt-0.5">
                  Conceptual Principles of Recurrent State
                </h3>
              </div>

              <div className="flex items-center gap-1.5" role="tablist" aria-label="Theory questions">
                {QUESTIONS.map((q, idx) => {
                  const isAnswered = selectedAnswers[q.id] !== undefined;
                  const isCurrent = idx === currentQuestionIdx;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      role="tab"
                      aria-selected={isCurrent}
                      onClick={() => setCurrentQuestionIdx(idx)}
                      className={`w-8 h-8 rounded-sm font-mono text-xs transition-colors cursor-pointer border ${
                        isCurrent
                          ? 'border-[var(--mm-signal)] bg-[var(--mm-signal)] text-[var(--surface)] font-semibold'
                          : isAnswered
                          ? 'border-[var(--mm-teal-border)] bg-[var(--mm-teal-soft)] text-[var(--color-success)] font-medium'
                          : 'border-[var(--mm-rule)] bg-[var(--page-bg)] text-[var(--mm-muted)]'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Single Question */}
            <motion.div
              key={`q-${activeQuestion.id}`}
              initial={reducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4 font-sans"
            >
              <h4 className="text-[var(--mm-ink)] font-serif text-xl sm:text-2xl font-medium leading-snug">
                {activeQuestion.question}
              </h4>

              <div className="space-y-2.5">
                {activeQuestion.options.map((opt, optIdx) => {
                  const isSelected = selectedIdx === optIdx;
                  let optionStyle =
                    'border-[var(--mm-rule)] bg-[var(--page-bg)] text-[var(--mm-ink)] hover:border-[var(--mm-rule-strong)]';
                  let badgeStyle =
                    'text-[var(--mm-muted)] border-[var(--mm-rule)] bg-[var(--mm-paper-bright)]';

                  if (submitted) {
                    if (opt.isCorrect) {
                      optionStyle =
                        'border-[var(--color-success-border)] bg-[var(--color-success-soft)] text-[var(--color-success)] font-medium';
                      badgeStyle =
                        'bg-[var(--color-success)] border-[var(--color-success)] text-[var(--surface)]';
                    } else if (isSelected && !opt.isCorrect) {
                      optionStyle =
                        'border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]';
                      badgeStyle =
                        'bg-[var(--color-danger)] border-[var(--color-danger)] text-[var(--surface)]';
                    } else {
                      optionStyle =
                        'border-[var(--mm-rule)] bg-[var(--page-bg)] text-[var(--mm-muted)] opacity-60 cursor-default';
                    }
                  } else if (isSelected) {
                    optionStyle =
                      'border-[var(--mm-signal)] bg-[var(--mm-signal-soft)] text-[var(--mm-ink)] font-medium';
                    badgeStyle =
                      'bg-[var(--mm-signal)] border-[var(--mm-signal)] text-[var(--surface)]';
                  }

                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => handleSelect(activeQuestion.id, optIdx)}
                      disabled={submitted}
                      className={`w-full text-left p-4 rounded-md border transition-colors flex items-start gap-3 min-h-[48px] ${
                        submitted ? 'cursor-default' : 'cursor-pointer'
                      } ${optionStyle}`}
                    >
                      <span
                        className={`w-6 h-6 rounded-sm border flex items-center justify-center font-mono font-semibold text-xs shrink-0 mt-0.5 transition-colors ${badgeStyle}`}
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
                  className={`pt-3 pl-4 border-l-2 text-xs sm:text-sm leading-relaxed font-sans ${
                    selectedOption.isCorrect
                      ? 'border-[var(--color-success)] text-[var(--color-success)]'
                      : 'border-[var(--color-danger)] text-[var(--color-danger)]'
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
                  <p className="text-[var(--mm-ink)] leading-relaxed">
                    {selectedOption.explanation}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Single-Question Navigation + Submit Footer */}
            <div className="pt-4 border-t border-[var(--mm-rule)] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentQuestionIdx === 0}
                  onClick={() => setCurrentQuestionIdx((i) => Math.max(0, i - 1))}
                  className="btn-secondary text-xs disabled:opacity-40"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  disabled={currentQuestionIdx >= QUESTIONS.length - 1}
                  onClick={() => setCurrentQuestionIdx((i) => Math.min(QUESTIONS.length - 1, i + 1))}
                  className="btn-secondary text-xs disabled:opacity-40"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {!submitted ? (
                <button
                  type="button"
                  onClick={() => setSubmitted(true)}
                  disabled={!isComplete}
                  className="btn-primary text-xs"
                >
                  <span>Verify All ({answeredCount}/3 Answered)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
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

            {submitted && (
              <div
                className={`p-4 border-l-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans ${
                  isSuccess
                    ? 'border-[var(--color-success)] bg-[var(--color-success-soft)]/50 text-[var(--color-success)]'
                    : 'border-[var(--color-warning)] bg-[var(--color-warning-soft)]/50 text-[var(--color-warning)]'
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
                  <p className="text-xs sm:text-sm text-[var(--mm-ink)] leading-relaxed">
                    {isSuccess
                      ? 'You have clearly differentiated fixed-size coordinate state representations from token tapes and understood how plastic synapses in BDH avoid catastrophic forgetting.'
                      : 'Use the 1–3 selector above to review feedback on each question, or revisit Chapters 02 and 04.'}
                  </p>
                </div>
              </div>
            )}

            <FigureCaption
              figure="Fig. 7.1b"
              title="One-question-at-a-time conceptual check across superposition, dimension scaling, and BDH plasticity."
              source="Educational Synthesis"
            />
          </div>
        </div>
      )}
    </section>
  );
};

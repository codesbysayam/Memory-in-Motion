import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, ArrowRight, RotateCcw, Lightbulb, Sparkles } from 'lucide-react';

interface ConceptGroup {
  id: string;
  name: string;
  keywords: string[];
}

const CONCEPT_GROUPS: ConceptGroup[] = [
  {
    id: 'fixed-size',
    name: 'Fixed-size state',
    keywords: ['fixed-size', 'fixed state', 'bounded state', 'finite state', 'fixed dimension', 'bounded vector'],
  },
  {
    id: 'compression',
    name: 'Compression',
    keywords: ['compress', 'compression', 'compressed', 'superposition', 'packed', 'packing'],
  },
  {
    id: 'interference',
    name: 'Interference',
    keywords: ['interference', 'overlap', 'competition', 'competing', 'crosstalk', 'noise', 'collision'],
  },
  {
    id: 'retrieval',
    name: 'Retrieval',
    keywords: ['retrieval', 'retrieve', 'query', 'recall', 'readout', 'probe', 'cosine'],
  },
  {
    id: 'failure',
    name: 'Decay / Forgetting',
    keywords: ['forget', 'forgot', 'decay', 'failure', 'wrong', 'corrupt', 'loss', 'degradation'],
  },
];

export const ExplainItChallenge: React.FC = () => {
  const [userText, setUserText] = useState<string>('');
  const [hasEvaluated, setHasEvaluated] = useState<boolean>(false);
  const [showModelAnswer, setShowModelAnswer] = useState<boolean>(false);

  const normalizedInput = userText.toLowerCase();

  // Evaluate matches
  const matchResults = CONCEPT_GROUPS.map((group) => {
    const matched = group.keywords.some((kw) => normalizedInput.includes(kw));
    return {
      ...group,
      matched,
    };
  });

  const matchedCount = matchResults.filter((r) => r.matched).length;

  const handleCheck = () => {
    if (userText.trim().length > 0) {
      setHasEvaluated(true);
    }
  };

  const handleReset = () => {
    setUserText('');
    setHasEvaluated(false);
    setShowModelAnswer(false);
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-5 text-[var(--text-primary)] shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[var(--accent-blue)] border border-[var(--border)] text-[var(--accent-blue-text)]">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-[var(--accent-blue-text)] font-semibold">
                Concept check
              </span>
              <span className="text-xs text-[var(--text-muted)] bg-[var(--surface-soft)] border border-[var(--border)] px-2 py-0.5 rounded-md">
                Deterministic keyword analysis · No LLM grading
              </span>
            </div>
            <h3 className="text-base font-sans font-semibold text-[var(--text-primary)] mt-0.5">
              A friend asks: &ldquo;Why did the system forget Tokyo?&rdquo;
            </h3>
          </div>
        </div>

        <span className="text-xs text-[var(--text-muted)]">
          Explain in your own words
        </span>
      </div>

      {/* Input Text Area */}
      <div className="space-y-3">
        <textarea
          rows={3}
          value={userText}
          onChange={(e) => {
            setUserText(e.target.value);
            if (hasEvaluated) setHasEvaluated(false);
          }}
          placeholder="Type your explanation here (e.g., The system uses a fixed-size state, so ingesting distractors compressed too much information, causing interference that corrupted retrieval)..."
          className="w-full rounded-xl bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] p-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] font-sans resize-none transition-all outline-hidden"
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-mono text-[var(--text-muted)]">
            {userText.trim().length} characters
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {hasEvaluated && (
              <button
                onClick={handleReset}
                className="px-3 py-1.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-soft)] border border-[var(--border)] text-[var(--text-secondary)] text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try again</span>
              </button>
            )}

            <button
              onClick={() => setShowModelAnswer(!showModelAnswer)}
              className="px-3 py-1.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-soft)] border border-[var(--border)] text-[var(--text-secondary)] text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5 text-[var(--accent-yellow-text)]" />
              <span>{showModelAnswer ? 'Hide model explanation' : 'Show model explanation'}</span>
            </button>

            <button
              onClick={handleCheck}
              disabled={userText.trim().length === 0}
              className="px-3.5 py-1.5 rounded-lg bg-[var(--accent-green)] hover:opacity-90 text-[var(--accent-green-text)] border border-[var(--color-success-border)] text-xs font-semibold disabled:opacity-40 disabled:pointer-events-none transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span>Check my explanation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Evaluation Results */}
      {hasEvaluated && (
        <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-3 text-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
            <span className="text-[var(--text-primary)] font-semibold text-xs">
              Concept detection summary ({matchedCount} / {CONCEPT_GROUPS.length} identified)
            </span>
            <span className={`text-xs font-semibold ${matchedCount >= 3 ? 'text-[var(--accent-green-text)]' : 'text-[var(--accent-yellow-text)]'}`}>
              {matchedCount >= 3 ? 'Strong synthesis ✓' : 'Partial explanation'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {matchResults.map((r) => (
              <div
                key={r.id}
                className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                  r.matched
                    ? 'bg-[var(--accent-green)] border-[var(--color-success-border)] text-[var(--accent-green-text)] font-semibold'
                    : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)]'
                }`}
              >
                {r.matched ? (
                  <CheckCircle2 className="w-4 h-4 text-[var(--accent-green-text)] shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                )}
                <span className="text-xs truncate">{r.name}</span>
              </div>
            ))}
          </div>

          <p className="text-[var(--text-secondary)] text-xs font-sans leading-relaxed pt-1">
            A strong scientific explanation connects the <strong className="text-[var(--text-primary)]">fixed-size state</strong> with <strong className="text-[var(--text-primary)]">compression</strong>, <strong className="text-[var(--text-primary)]">superposition interference</strong>, and <strong className="text-[var(--text-primary)]">retrieval failure</strong>.
          </p>
        </div>
      )}

      {/* Reference / Model Answer */}
      {showModelAnswer && (
        <div className="p-4 rounded-xl bg-[var(--accent-yellow)] border border-[var(--color-warning-border)] text-xs text-[var(--text-primary)] space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 font-semibold text-[var(--accent-yellow-text)]">
            <Sparkles className="w-4 h-4 text-[var(--accent-yellow-text)]" />
            <span>Model reference explanation:</span>
          </div>
          <p className="text-[var(--text-primary)] font-sans leading-relaxed text-xs">
            &ldquo;In this recurrent architecture, memory is compressed into a fixed-size vector matrix rather than expanding dynamically like a Transformer KV-cache. When new associations and distractors are ingested sequentially, their outer-product coordinate updates superimpose onto the existing coordinates. Because the state dimension is finite, adding competing facts causes geometric crosstalk (interference), shifting the readout vector closer to distractor candidates and causing retrieval failure.&rdquo;
          </p>
        </div>
      )}
    </div>
  );
};

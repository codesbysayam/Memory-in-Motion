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
    <div className="rounded-xl border border-[#D8DCD8] bg-[#FFFFFF] p-6 space-y-5 text-[#252525] shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6DF] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#E7F2FA] border border-[#B8D7ED] text-[#31566E]">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-[#31566E] font-semibold">
                Concept check
              </span>
              <span className="text-xs text-[#5F625F] bg-[#F7F5EF] border border-[#D8DCD8] px-2 py-0.5 rounded-full">
                Deterministic keyword analysis · No LLM grading
              </span>
            </div>
            <h3 className="text-base font-serif font-bold text-[#252525] mt-0.5">
              A friend asks: &ldquo;Why did the system forget Tokyo?&rdquo;
            </h3>
          </div>
        </div>

        <span className="text-xs text-[#5F625F]">
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
          className="w-full rounded-xl bg-[#FFFFFF] border border-[#D8DCD8] focus:border-[#31566E] focus:ring-1 focus:ring-[#31566E] p-4 text-sm text-[#252525] placeholder-[#8F96A3] font-sans resize-none transition-all outline-hidden"
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-mono text-[#5F625F]">
            {userText.trim().length} characters
          </div>

          <div className="flex items-center gap-2">
            {hasEvaluated && (
              <button
                onClick={handleReset}
                className="px-3 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F7F5EF] border border-[#D8DCD8] text-[#5F625F] text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try again</span>
              </button>
            )}

            <button
              onClick={() => setShowModelAnswer(!showModelAnswer)}
              className="px-3 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F7F5EF] border border-[#D8DCD8] text-[#5F625F] text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5 text-[#8C5D17]" />
              <span>{showModelAnswer ? 'Hide model explanation' : 'Show model explanation'}</span>
            </button>

            <button
              onClick={handleCheck}
              disabled={userText.trim().length === 0}
              className="px-3.5 py-1.5 rounded-lg bg-[#DCEFE2] hover:bg-[#CDE8D5] text-[#245B38] border border-[#BCE2C9] text-xs font-semibold disabled:opacity-40 disabled:pointer-events-none transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span>Check my explanation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Evaluation Results */}
      {hasEvaluated && (
        <div className="p-4 rounded-xl bg-[#F7F5EF] border border-[#D8DCD8] space-y-3 text-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-2">
            <span className="text-[#252525] font-semibold uppercase tracking-wider text-xs">
              Concept detection summary ({matchedCount} / {CONCEPT_GROUPS.length} identified)
            </span>
            <span className={`text-xs font-semibold ${matchedCount >= 3 ? 'text-[#247A4B]' : 'text-[#8C5D17]'}`}>
              {matchedCount >= 3 ? 'Strong synthesis ✓' : 'Partial explanation'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {matchResults.map((r) => (
              <div
                key={r.id}
                className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                  r.matched
                    ? 'bg-[#DCEFE2] border-[#BCE2C9] text-[#247A4B] font-semibold'
                    : 'bg-[#FFFFFF] border-[#D8DCD8] text-[#5F625F]'
                }`}
              >
                {r.matched ? (
                  <CheckCircle2 className="w-4 h-4 text-[#247A4B] shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-[#8F96A3] shrink-0" />
                )}
                <span className="text-xs truncate">{r.name}</span>
              </div>
            ))}
          </div>

          <p className="text-[#5F625F] text-xs font-sans leading-relaxed pt-1">
            A strong scientific explanation connects the <strong>fixed-size state</strong> with <strong>compression</strong>, <strong>superposition interference</strong>, and <strong>retrieval failure</strong>.
          </p>
        </div>
      )}

      {/* Reference / Model Answer */}
      {showModelAnswer && (
        <div className="p-4 rounded-xl bg-[#FFF5D8] border border-[#E8D9A8] text-xs text-[#252525] space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 font-semibold text-[#8C5D17]">
            <Sparkles className="w-4 h-4 text-[#8C5D17]" />
            <span>Model reference explanation:</span>
          </div>
          <p className="text-[#252525] font-sans leading-relaxed text-xs">
            &ldquo;In this recurrent architecture, memory is compressed into a fixed-size vector matrix rather than expanding dynamically like a Transformer KV-cache. When new associations and distractors are ingested sequentially, their outer-product coordinate updates superimpose onto the existing coordinates. Because the state dimension is finite, adding competing facts causes geometric crosstalk (interference), shifting the readout vector closer to distractor candidates and causing retrieval failure.&rdquo;
          </p>
        </div>
      )}
    </div>
  );
};

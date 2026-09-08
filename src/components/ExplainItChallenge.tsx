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
    <div className="rounded-2xl border border-[#252A35] bg-[#0C0F17] p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2536] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-950/70 border border-violet-800/70 text-violet-300">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-widest text-violet-400 uppercase">
                CAN YOU EXPLAIN IT?
              </span>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-full">
                LOCAL CONCEPT CHECK · NO AI GRADING
              </span>
            </div>
            <h3 className="text-base font-semibold text-white mt-0.5">
              A friend asks: &ldquo;Why did the system forget Tokyo?&rdquo;
            </h3>
          </div>
        </div>

        <span className="text-xs font-mono text-slate-400">
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
          className="w-full rounded-xl bg-[#121622] border border-[#252A35] focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE] p-4 text-sm text-white placeholder-slate-500 font-sans resize-none transition-all"
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-mono text-slate-400">
            {userText.trim().length} characters
          </div>

          <div className="flex items-center gap-2">
            {hasEvaluated && (
              <button
                onClick={handleReset}
                className="px-3 py-1.5 rounded-lg border border-[#252A35] bg-[#151922] hover:bg-[#1A202C] text-xs font-mono text-slate-300 flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>TRY AGAIN</span>
              </button>
            )}

            <button
              onClick={() => setShowModelAnswer(!showModelAnswer)}
              className="px-3 py-1.5 rounded-lg border border-purple-800/60 bg-purple-950/40 hover:bg-purple-900/60 text-xs font-mono text-purple-300 flex items-center gap-1.5 transition"
            >
              <Lightbulb className="w-3.5 h-3.5 text-purple-400" />
              <span>{showModelAnswer ? 'HIDE MODEL EXPLANATION' : 'SHOW MODEL EXPLANATION'}</span>
            </button>

            <button
              onClick={handleCheck}
              disabled={userText.trim().length === 0}
              className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:pointer-events-none text-black font-mono text-xs font-bold transition shadow-sm flex items-center gap-1.5"
            >
              <span>CHECK MY EXPLANATION</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Evaluation Results */}
      {hasEvaluated && (
        <div className="p-4 rounded-xl bg-[#090D15] border border-[#1E2536] space-y-3 font-mono text-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[#1E2536] pb-2">
            <span className="text-slate-300 font-bold uppercase tracking-wider">
              CONCEPT DETECTION SUMMARY ({matchedCount} / {CONCEPT_GROUPS.length} IDENTIFIED)
            </span>
            <span className={`text-[11px] font-bold ${matchedCount >= 3 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {matchedCount >= 3 ? 'STRONG SYNTHESIS ✓' : 'PARTIAL EXPLANATION'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {matchResults.map((r) => (
              <div
                key={r.id}
                className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                  r.matched
                    ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300 font-semibold'
                    : 'bg-[#121622] border-[#22283A] text-slate-500'
                }`}
              >
                {r.matched ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-600 shrink-0" />
                )}
                <span className="text-[11px] truncate">{r.name}</span>
              </div>
            ))}
          </div>

          <p className="text-slate-300 text-xs font-sans leading-relaxed pt-1">
            A strong scientific explanation connects the <strong>fixed-size state</strong> with <strong>compression</strong>, <strong>superposition interference</strong>, and <strong>retrieval failure</strong>.
          </p>
        </div>
      )}

      {/* Reference / Model Answer */}
      {showModelAnswer && (
        <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 text-xs font-mono text-purple-200 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 font-bold text-purple-300">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>MODEL REFERENCE EXPLANATION:</span>
          </div>
          <p className="text-slate-300 font-sans leading-relaxed text-xs">
            &ldquo;In this recurrent architecture, memory is compressed into a fixed-size vector matrix rather than expanding dynamically like a Transformer KV-cache. When new associations and distractors are ingested sequentially, their outer-product coordinate updates superimpose onto the existing coordinates. Because the state dimension is finite, adding competing facts causes geometric crosstalk (interference), shifting the readout vector closer to distractor candidates and causing retrieval failure.&rdquo;
          </p>
        </div>
      )}
    </div>
  );
};

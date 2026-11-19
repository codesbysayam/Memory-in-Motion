import React, { useState } from 'react';
import { BookOpen, BarChart3, GraduationCap, Cpu } from 'lucide-react';

export type EvidenceLevel = 1 | 2 | 3 | 4;

interface EvidenceItem {
  id: string;
  level: EvidenceLevel;
  badge: string;
  sourceType: string;
  claim: string;
  sourceCitation: string;
  verificationMethod: string;
  accentClass: string;
}

const EVIDENCE_ITEMS: EvidenceItem[] = [
  {
    id: 'ev-1',
    level: 1,
    badge: 'Live toy computation',
    sourceType: 'Browser Runtime',
    claim: 'Cosine similarity between Japan query vector and reconstructed matrix read vector Tokyo drops from 0.91 to 0.18 under 8 distractor updates.',
    sourceCitation: 'In-browser associative memory matrix simulation (JavaScript runtime).',
    verificationMethod: 'Calculated deterministically in real time on this machine.',
    accentClass: 'text-[var(--mm-signal)]',
  },
  {
    id: 'ev-2',
    level: 2,
    badge: 'Published research',
    sourceType: 'Primary Literature',
    claim: 'BDH architecture maintains linear computation with recurrent synaptic fast weights updated via outer-product rules without softmax attention matrices.',
    sourceCitation: 'Pathway Research / Dragon Hatchling Technical Report (2025/2026).',
    verificationMethod: 'Formal mathematical definition and pseudocode in Equations of Reasoning.',
    accentClass: 'text-[var(--mm-ink)]',
  },
  {
    id: 'ev-3',
    level: 3,
    badge: 'Published benchmark',
    sourceType: 'Empirical Results',
    claim: 'Constant memory consumption achieved across long sequence contexts while maintaining competitive perplexity on reasoning benchmarks.',
    sourceCitation: 'BDH-CQ / Pathway Experimental Benchmark Suite.',
    verificationMethod: 'Peer-reviewed or archived empirical evaluations against transformer baselines.',
    accentClass: 'text-[var(--color-success)]',
  },
  {
    id: 'ev-4',
    level: 4,
    badge: 'Educational interpretation',
    sourceType: 'Pedagogical Model',
    claim: 'The trade-off between growing token context and fixed recurrent states can be thought of as a continuous balance between storage cost and interference.',
    sourceCitation: 'Memory In Motion Laboratory Educational Synthesis.',
    verificationMethod: 'Conceptual framing intended to build mechanical intuition.',
    accentClass: 'text-[var(--mm-amber)]',
  },
];

export const EvidenceLadder: React.FC<{ theme?: 'dark' | 'light' }> = () => {
  const [activeFilter, setActiveFilter] = useState<EvidenceLevel | 'all'>('all');

  const filteredItems = activeFilter === 'all'
    ? EVIDENCE_ITEMS
    : EVIDENCE_ITEMS.filter((item) => item.level === activeFilter);

  const levels: { level: EvidenceLevel; title: string; subtitle: string; icon: React.ReactNode; accent: string }[] = [
    {
      level: 1,
      title: 'Live toy computation',
      subtitle: 'Generated locally by this browser right now.',
      icon: <Cpu className="w-3.5 h-3.5 text-[var(--mm-signal)]" />,
      accent: 'text-[var(--mm-signal)]',
    },
    {
      level: 2,
      title: 'Published research',
      subtitle: 'From the primary paper and mathematical equations.',
      icon: <BookOpen className="w-3.5 h-3.5 text-[var(--mm-signal)]" />,
      accent: 'text-[var(--mm-signal)]',
    },
    {
      level: 3,
      title: 'Published benchmark',
      subtitle: 'Reported empirical research results.',
      icon: <BarChart3 className="w-3.5 h-3.5 text-[var(--color-success)]" />,
      accent: 'text-[var(--color-success)]',
    },
    {
      level: 4,
      title: 'Educational interpretation',
      subtitle: 'Pedagogical explanation for human intuition.',
      icon: <GraduationCap className="w-3.5 h-3.5 text-[var(--mm-amber)]" />,
      accent: 'text-[var(--mm-amber)]',
    },
  ];

  return (
    <div className="essay-figure-stage px-5 sm:px-8 py-6 space-y-6 text-[var(--mm-ink)]">
      {/* Header */}
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--mm-rule)] pb-4">
        <div>
          <h4 className="text-lg sm:text-xl font-sans font-semibold text-[var(--mm-ink)]">
            The Evidence Ladder · Epistemic Contract
          </h4>
          <p className="text-xs sm:text-sm mt-1 font-sans text-[var(--mm-ink-soft)]">
            Every claim across this interactive essay is labeled by epistemic origin so live toy measurements never blur with published production benchmarks.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`text-xs font-mono cursor-pointer transition-colors ${
            activeFilter === 'all' ? 'text-[var(--mm-signal)] font-semibold' : 'text-[var(--mm-muted)] hover:text-[var(--mm-ink)]'
          }`}
        >
          {activeFilter === 'all' ? 'Showing all 4 levels' : 'Reset filter · Show all'}
        </button>
      </div>

      {/* 4 Levels Filter Strip (Hairline divide-x tabs, zero nested rounded cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-y border-[var(--mm-rule)] divide-y sm:divide-y-0 lg:divide-x divide-[var(--mm-rule)] text-xs font-sans">
        {levels.map((lvl) => {
          const isActive = activeFilter === lvl.level;
          return (
            <button
              key={lvl.level}
              type="button"
              onClick={() => setActiveFilter(isActive ? 'all' : lvl.level)}
              className={`p-3.5 text-left transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[var(--mm-signal-soft)]/50 border-b-2 border-b-[var(--mm-signal)]'
                  : activeFilter === 'all'
                  ? 'hover:bg-[var(--page-bg)]'
                  : 'opacity-55 hover:opacity-100 hover:bg-[var(--page-bg)]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`font-mono text-[11px] uppercase tracking-[0.06em] font-semibold ${lvl.accent}`}>
                  Level 0{lvl.level}
                </span>
                {lvl.icon}
              </div>
              <strong className="block text-sm font-semibold text-[var(--mm-ink)]">{lvl.title}</strong>
              <span className="text-xs text-[var(--mm-ink-soft)] mt-0.5 block leading-snug">
                {lvl.subtitle}
              </span>
            </button>
          );
        })}
      </div>

      {/* Claim Rows Stack */}
      <div className="divide-y divide-[var(--mm-rule)]">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="py-4 first:pt-1 last:pb-1 space-y-2 text-xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono">
              <span className={`font-semibold uppercase tracking-[0.05em] ${item.accentClass}`}>
                Level {item.level} · {item.badge}
              </span>
              <span className="text-[var(--mm-muted)]">
                Source: {item.sourceType}
              </span>
            </div>

            <div className="text-sm sm:text-[15px] font-medium font-sans leading-relaxed text-[var(--mm-ink)]">
              &ldquo;{item.claim}&rdquo;
            </div>

            <div className="pt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans text-[var(--mm-ink-soft)]">
              <div>
                <strong className="font-semibold text-[var(--mm-ink)]">Citation: </strong>
                <span>{item.sourceCitation}</span>
              </div>
              <div>
                <strong className="font-semibold text-[var(--mm-ink)]">Verification: </strong>
                <span>{item.verificationMethod}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


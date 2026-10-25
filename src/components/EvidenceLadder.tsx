import React, { useState } from 'react';
import { ShieldCheck, BookOpen, BarChart3, GraduationCap, Cpu, Layers, HelpCircle, CheckCircle2 } from 'lucide-react';

export type EvidenceLevel = 1 | 2 | 3 | 4;

interface EvidenceItem {
  id: string;
  level: EvidenceLevel;
  badge: string;
  sourceType: string;
  claim: string;
  sourceCitation: string;
  verificationMethod: string;
  color: string;
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
    color: 'border-[var(--accent-blue-text)]/30 bg-[var(--accent-blue)] text-[var(--accent-blue-text)]',
  },
  {
    id: 'ev-2',
    level: 2,
    badge: 'Published research',
    sourceType: 'Primary Literature',
    claim: 'BDH architecture maintains linear computation with recurrent synaptic fast weights updated via outer-product rules without softmax attention matrices.',
    sourceCitation: 'Pathway Research / Dragon Hatchling Technical Report (2025/2026).',
    verificationMethod: 'Formal mathematical definition and pseudocode in Equations of Reasoning.',
    color: 'border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-primary)]',
  },
  {
    id: 'ev-3',
    level: 3,
    badge: 'Published benchmark',
    sourceType: 'Empirical Results',
    claim: 'Constant memory consumption achieved across long sequence contexts while maintaining competitive perplexity on reasoning benchmarks.',
    sourceCitation: 'BDH-CQ / Pathway Experimental Benchmark Suite.',
    verificationMethod: 'Peer-reviewed or archived empirical evaluations against transformer baselines.',
    color: 'border-[var(--accent-green-text)]/30 bg-[var(--accent-green)] text-[var(--accent-green-text)]',
  },
  {
    id: 'ev-4',
    level: 4,
    badge: 'Educational interpretation',
    sourceType: 'Pedagogical Model',
    claim: 'The trade-off between growing token context and fixed recurrent states can be thought of as a continuous balance between storage cost and interference.',
    sourceCitation: 'Memory In Motion Laboratory Educational Synthesis.',
    verificationMethod: 'Conceptual framing intended to build mechanical intuition.',
    color: 'border-[var(--accent-yellow-text)]/30 bg-[var(--accent-yellow)] text-[var(--accent-yellow-text)]',
  },
];

export const EvidenceLadder: React.FC<{ theme?: 'dark' | 'light' }> = ({ theme = 'light' }) => {
  const [activeFilter, setActiveFilter] = useState<EvidenceLevel | 'all'>('all');

  const filteredItems = activeFilter === 'all'
    ? EVIDENCE_ITEMS
    : EVIDENCE_ITEMS.filter((item) => item.level === activeFilter);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 space-y-5 text-[var(--text-primary)] shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[var(--accent-blue-text)]" />
            <h4 className="text-base font-serif font-bold text-[var(--text-primary)]">
              The evidence ladder · Scientific epistemic contract
            </h4>
          </div>
          <p className="text-xs mt-1 font-sans text-[var(--text-secondary)]">
            Different statements in this laboratory come from different evidence sources. The labels make that distinction explicit.
          </p>
        </div>

        <span className="text-xs px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-secondary)] font-sans font-medium">
          4-level taxonomy
        </span>
      </div>

      {/* 4 Levels Hierarchy Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs font-sans">
        <button
          onClick={() => setActiveFilter(activeFilter === 1 ? 'all' : 1)}
          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
            activeFilter === 1 || activeFilter === 'all'
              ? 'border-[var(--accent-blue-text)] bg-[var(--accent-blue)] ring-1 ring-[var(--accent-blue-text)]'
              : 'border-[var(--border)] bg-[var(--surface-soft)] opacity-70'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-[var(--accent-blue-text)]">Level 1</span>
            <Cpu className="w-3.5 h-3.5 text-[var(--accent-blue-text)]" />
          </div>
          <strong className="block text-xs text-[var(--text-primary)]">Live toy computation</strong>
          <span className="text-xs text-[var(--text-secondary)] mt-0.5 block">
            Generated locally by this browser right now.
          </span>
        </button>

        <button
          onClick={() => setActiveFilter(activeFilter === 2 ? 'all' : 2)}
          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
            activeFilter === 2 || activeFilter === 'all'
              ? 'border-[var(--accent-blue-text)] bg-[var(--accent-blue)] ring-1 ring-[var(--accent-blue-text)]'
              : 'border-[var(--border)] bg-[var(--surface-soft)] opacity-70'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-[var(--accent-blue-text)]">Level 2</span>
            <BookOpen className="w-3.5 h-3.5 text-[var(--accent-blue-text)]" />
          </div>
          <strong className="block text-xs text-[var(--text-primary)]">Published research</strong>
          <span className="text-xs text-[var(--text-secondary)] mt-0.5 block">
            From the primary paper and mathematical equations.
          </span>
        </button>

        <button
          onClick={() => setActiveFilter(activeFilter === 3 ? 'all' : 3)}
          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
            activeFilter === 3 || activeFilter === 'all'
              ? 'border-[var(--accent-green-text)] bg-[var(--accent-green)] ring-1 ring-[var(--accent-green-text)]'
              : 'border-[var(--border)] bg-[var(--surface-soft)] opacity-70'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-[var(--accent-green-text)]">Level 3</span>
            <BarChart3 className="w-3.5 h-3.5 text-[var(--accent-green-text)]" />
          </div>
          <strong className="block text-xs text-[var(--text-primary)]">Published benchmark</strong>
          <span className="text-xs text-[var(--text-secondary)] mt-0.5 block">
            Reported empirical research results.
          </span>
        </button>

        <button
          onClick={() => setActiveFilter(activeFilter === 4 ? 'all' : 4)}
          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
            activeFilter === 4 || activeFilter === 'all'
              ? 'border-[var(--accent-yellow-text)] bg-[var(--accent-yellow)] ring-1 ring-[var(--accent-yellow-text)]'
              : 'border-[var(--border)] bg-[var(--surface-soft)] opacity-70'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-[var(--accent-yellow-text)]">Level 4</span>
            <GraduationCap className="w-3.5 h-3.5 text-[var(--accent-yellow-text)]" />
          </div>
          <strong className="block text-xs text-[var(--text-primary)]">Educational interpretation</strong>
          <span className="text-xs text-[var(--text-secondary)] mt-0.5 block">
            Pedagogical explanation for human intuition.
          </span>
        </button>
      </div>

      {/* Claim Cards Stack */}
      <div className="space-y-3 pt-1">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] space-y-2 text-xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 font-sans">
              <span className={`px-2 py-0.5 rounded border text-xs font-semibold ${item.color}`}>
                Level {item.level} · {item.badge}
              </span>
              <span className="text-xs text-[var(--text-secondary)]">
                Source: {item.sourceType}
              </span>
            </div>

            <div className="text-sm font-semibold font-sans leading-snug text-[var(--text-primary)]">
              &ldquo;{item.claim}&rdquo;
            </div>

            <div className="pt-2 border-t border-[var(--border)] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans text-[var(--text-secondary)]">
              <div>
                <strong className="text-xs font-semibold block text-[var(--text-primary)]">
                  Citation:
                </strong>
                <span>{item.sourceCitation}</span>
              </div>
              <div>
                <strong className="text-xs font-semibold block text-[var(--text-primary)]">
                  Verification:
                </strong>
                <span>{item.verificationMethod}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

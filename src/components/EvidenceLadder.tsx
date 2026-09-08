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
    badge: 'LIVE TOY COMPUTATION',
    sourceType: 'Browser Runtime',
    claim: 'Cosine similarity between Japan query vector and reconstructed matrix read vector Tokyo drops from 0.91 to 0.18 under 8 distractor updates.',
    sourceCitation: 'In-browser associative memory matrix simulation (JavaScript runtime).',
    verificationMethod: 'Calculated deterministically in real time on this machine.',
    color: 'border-cyan-500/60 bg-cyan-950/30 text-cyan-300',
  },
  {
    id: 'ev-2',
    level: 2,
    badge: 'PUBLISHED RESEARCH',
    sourceType: 'Primary Literature',
    claim: 'BDH architecture maintains linear computation with recurrent synaptic fast weights updated via outer-product rules without softmax attention matrices.',
    sourceCitation: 'Pathway Research / Dragon Hatchling Technical Report (2025/2026).',
    verificationMethod: 'Formal mathematical definition and pseudocode in Equations of Reasoning.',
    color: 'border-purple-500/60 bg-purple-950/30 text-purple-300',
  },
  {
    id: 'ev-3',
    level: 3,
    badge: 'PUBLISHED BENCHMARK',
    sourceType: 'Empirical Results',
    claim: 'Constant memory consumption achieved across long sequence contexts while maintaining competitive perplexity on reasoning benchmarks.',
    sourceCitation: 'BDH-CQ / Pathway Experimental Benchmark Suite.',
    verificationMethod: 'Peer-reviewed or archived empirical evaluations against transformer baselines.',
    color: 'border-emerald-500/60 bg-emerald-950/30 text-emerald-300',
  },
  {
    id: 'ev-4',
    level: 4,
    badge: 'EDUCATIONAL INTERPRETATION',
    sourceType: 'Pedagogical Model',
    claim: 'The trade-off between growing token context and fixed recurrent states can be thought of as a continuous balance between storage cost and interference.',
    sourceCitation: 'Memory In Motion Laboratory Educational Synthesis.',
    verificationMethod: 'Conceptual framing intended to build mechanical intuition.',
    color: 'border-amber-500/60 bg-amber-950/30 text-amber-300',
  },
];

export const EvidenceLadder: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<EvidenceLevel | 'all'>('all');

  const filteredItems = activeFilter === 'all'
    ? EVIDENCE_ITEMS
    : EVIDENCE_ITEMS.filter((item) => item.level === activeFilter);

  return (
    <div className="rounded-2xl border border-[#252A35] bg-[#0A0D16] p-5 sm:p-6 text-slate-100 space-y-5 font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E2536] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              The Evidence Ladder · Scientific Epistemic Contract
            </h4>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Different statements in this laboratory come from different evidence sources. The labels make that distinction explicit.
          </p>
        </div>

        <span className="text-[10px] px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-slate-400 font-bold">
          4-LEVEL TAXONOMY
        </span>
      </div>

      {/* 4 Levels Hierarchy Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
        <button
          onClick={() => setActiveFilter(activeFilter === 1 ? 'all' : 1)}
          className={`p-3 rounded-xl border text-left transition ${
            activeFilter === 1 || activeFilter === 'all'
              ? 'border-cyan-500/50 bg-cyan-950/20'
              : 'border-[#1E2536] bg-[#0E131F] opacity-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-cyan-400">LEVEL 1</span>
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <strong className="text-white block text-[11px]">LIVE TOY COMPUTATION</strong>
          <span className="text-[10px] text-slate-400 font-sans mt-0.5 block">
            Generated locally by this browser right now.
          </span>
        </button>

        <button
          onClick={() => setActiveFilter(activeFilter === 2 ? 'all' : 2)}
          className={`p-3 rounded-xl border text-left transition ${
            activeFilter === 2 || activeFilter === 'all'
              ? 'border-purple-500/50 bg-purple-950/20'
              : 'border-[#1E2536] bg-[#0E131F] opacity-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-purple-400">LEVEL 2</span>
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <strong className="text-white block text-[11px]">PUBLISHED RESEARCH</strong>
          <span className="text-[10px] text-slate-400 font-sans mt-0.5 block">
            From the primary paper and mathematical equations.
          </span>
        </button>

        <button
          onClick={() => setActiveFilter(activeFilter === 3 ? 'all' : 3)}
          className={`p-3 rounded-xl border text-left transition ${
            activeFilter === 3 || activeFilter === 'all'
              ? 'border-emerald-500/50 bg-emerald-950/20'
              : 'border-[#1E2536] bg-[#0E131F] opacity-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-emerald-400">LEVEL 3</span>
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <strong className="text-white block text-[11px]">PUBLISHED BENCHMARK</strong>
          <span className="text-[10px] text-slate-400 font-sans mt-0.5 block">
            Reported empirical research results.
          </span>
        </button>

        <button
          onClick={() => setActiveFilter(activeFilter === 4 ? 'all' : 4)}
          className={`p-3 rounded-xl border text-left transition ${
            activeFilter === 4 || activeFilter === 'all'
              ? 'border-amber-500/50 bg-amber-950/20'
              : 'border-[#1E2536] bg-[#0E131F] opacity-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-amber-400">LEVEL 4</span>
            <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <strong className="text-white block text-[11px]">EDUCATIONAL INTERPRETATION</strong>
          <span className="text-[10px] text-slate-400 font-sans mt-0.5 block">
            Pedagogical explanation for human intuition.
          </span>
        </button>
      </div>

      {/* Claim Cards Stack */}
      <div className="space-y-3 pt-1">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl bg-[#0E131F] border border-[#1E273A] space-y-2 text-xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${item.color}`}>
                LEVEL {item.level} · {item.badge}
              </span>
              <span className="text-[10px] text-slate-400 font-sans">Source: {item.sourceType}</span>
            </div>

            <div className="text-sm font-semibold text-white font-sans leading-snug">
              &ldquo;{item.claim}&rdquo;
            </div>

            <div className="pt-2 border-t border-[#1A2234] grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400 font-sans">
              <div>
                <strong className="text-slate-300 font-mono text-[10px] uppercase block">CITATION:</strong>
                <span>{item.sourceCitation}</span>
              </div>
              <div>
                <strong className="text-slate-300 font-mono text-[10px] uppercase block">VERIFICATION:</strong>
                <span>{item.verificationMethod}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React from 'react';
import {
  Brain,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { LatentReasoningDemo } from './LatentReasoningDemo';
import { MODEL_CONTRACT } from '../data/bdhResearch';

export const BDHCQBridge: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Interactive Toy Latent Reasoning Demo */}
      <LatentReasoningDemo />

      {/* Official BDH-CQ Research Card & Epistemic Boundaries */}
      <div className="rounded-2xl border border-[#252A35] bg-[#0C101A] p-6 space-y-6 text-slate-100 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1D2536] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-950/80 border border-purple-800 text-purple-300">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase text-purple-400 font-bold">
                PRIMARY RESEARCH CARD
              </div>
              <h4 className="text-lg font-bold font-mono text-white">
                BDH-CQ: “In-Context Learning with Recurrent Latent Reasoning”
              </h4>
            </div>
          </div>

          <a
            href="https://pathway.com/research/introducing-bdh-cq"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-mono font-semibold transition"
          >
            <span>Open Official Article</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* What We Borrow vs What We Do Not Claim */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* What We Borrow */}
          <div className="p-4 rounded-xl bg-[#090D18] border border-emerald-500/30 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              WHAT WE BORROW
            </div>
            <ul className="space-y-2 text-xs text-slate-300 font-sans">
              {MODEL_CONTRACT.whatWeBorrow.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What We Do Not Claim */}
          <div className="p-4 rounded-xl bg-[#090D18] border border-amber-500/30 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase">
              <XCircle className="w-4 h-4 text-amber-400" />
              WHAT WE DO NOT CLAIM
            </div>
            <ul className="space-y-2 text-xs text-slate-300 font-sans">
              {MODEL_CONTRACT.whatWeDoNotClaim.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Epistemic Footer */}
        <div className="p-3 rounded-lg bg-[#070A12] border border-[#182030] text-[11px] font-mono text-slate-400 flex items-center justify-between">
          <span>SOURCE PROVENANCE: Kosowski et al. (2025) & Pathway (2026)</span>
          <span className="text-purple-400 font-semibold">ARC-AGI-1 In-Context Evaluation</span>
        </div>
      </div>
    </div>
  );
};

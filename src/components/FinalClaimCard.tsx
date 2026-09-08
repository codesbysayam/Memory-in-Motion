import React from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export const FinalClaimCard: React.FC = () => {
  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-[#0B0F19] p-6 sm:p-8 text-slate-100 shadow-2xl space-y-6 font-mono">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2538] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-700/60 text-cyan-300">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] uppercase text-cyan-400 font-bold tracking-wider">
              EPISTEMIC CONTRACT
            </div>
            <h3 className="text-lg font-bold text-white uppercase">
              WHAT THIS SITE DEMONSTRATES
            </h3>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800 text-cyan-300 text-xs font-bold">
          SCIENTIFIC INTEGRITY GUARANTEE
        </span>
      </div>

      {/* 3 Honest Claims */}
      <div className="space-y-3">
        <div className="text-xs uppercase text-slate-400 font-bold tracking-wider">
          THREE VERIFIED CLAIMS (PROVEN IN YOUR BROWSER):
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#111624] border border-[#1E263C] space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>1. Recall-Interference Trade-Off</span>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              We mathematically demonstrate why any fixed-size continuous memory state faces an inevitable trade-off between preservation fidelity and capacity limits as distractors accumulate.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#111624] border border-[#1E263C] space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>2. Coordinate-by-Coordinate Inspection</span>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              We show how sequential associative updates can be fully inspected, visualized as coordinate superpositions, and probed with explicit cosine similarity decoding in real time.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#111624] border border-[#1E263C] space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>3. Bridge to Synaptic Latent Reasoning</span>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              We directly connect these linear algebraic principles to Pathway's BDH architecture, where memory resides inside plastic synaptic connection weights and multi-step reasoning occurs in latent state space.
            </p>
          </div>
        </div>
      </div>

      {/* 1 Honest Disclaimer */}
      <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs space-y-1">
        <div className="flex items-center gap-2 font-bold uppercase text-amber-300">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>ONE EXPLICIT DISCLAIMER:</span>
        </div>
        <p className="font-sans leading-relaxed text-slate-300">
          This site is an educational conceptual model. It does not run the production BDH model or reproduce its benchmark results. The interactive laboratories help you understand the foundational mechanisms of recurrent fast weights and synaptic plasticity; they do not replace reading the primary peer-reviewed literature.
        </p>
      </div>
    </div>
  );
};

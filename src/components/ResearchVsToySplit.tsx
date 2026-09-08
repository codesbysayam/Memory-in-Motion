import React from 'react';
import { CheckCircle2, ShieldAlert, Cpu, Award, ArrowRight, ExternalLink } from 'lucide-react';

export const ResearchVsToySplit: React.FC = () => {
  return (
    <div className="rounded-2xl border border-[#252A35] bg-[#0A0D16] p-6 text-slate-100 space-y-6">
      <div className="border-b border-[#1E2536] pb-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-cyan-400" />
          <h3 className="font-mono text-base font-bold text-white uppercase tracking-wider">
            Research vs Toy: Epistemic Split Screen
          </h3>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          A transparent comparison between our in-browser educational lab and the published peer-reviewed BDH papers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
        {/* Left Side: What Our Toy Shows */}
        <div className="rounded-xl border border-cyan-500/30 bg-[#0F1420] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E2638] pb-2">
            <span className="text-xs font-bold text-[#22D3EE] uppercase flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              WHAT OUR TOY LAB SHOWS
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800 text-cyan-300 font-bold">
              PROVEN IN BROWSER
            </span>
          </div>

          <ul className="space-y-3 text-xs text-slate-300 font-sans">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-mono font-bold">•</span>
              <span>
                <strong>Fixed-State Compression:</strong> Ingesting sequential key-value bindings into a fixed vector/matrix causes coordinate superposition.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-mono font-bold">•</span>
              <span>
                <strong>Predictable Interference:</strong> Lower dimensions and higher distractors degrade cosine retrieval scores predictably.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-mono font-bold">•</span>
              <span>
                <strong>Coordinate-by-Coordinate Inspection:</strong> Every update step M_(t+1) = λM_t + η k_t v_t^T is 100% visible and deterministic in JavaScript.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-mono font-bold">•</span>
              <span>
                <strong>Plasticity Concept:</strong> Shows that state can update incrementally without appending tokens to a context window.
              </span>
            </li>
          </ul>
        </div>

        {/* Right Side: What BDH Paper Claims */}
        <div className="rounded-xl border border-purple-500/30 bg-[#0F1420] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E2638] pb-2">
            <span className="text-xs font-bold text-purple-300 uppercase flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-purple-400" />
              WHAT THE BDH PAPER CLAIMS
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800 text-purple-300 font-bold">
              PEER-REVIEWED RESEARCH
            </span>
          </div>

          <ul className="space-y-3 text-xs text-slate-300 font-sans">
            <li className="flex items-start gap-2">
              <span className="text-purple-400 font-mono font-bold">•</span>
              <span>
                <strong>150M-Parameter Model:</strong> BDH-CQ is a trained neural architecture tested on standardized benchmarks (ARC-AGI-1, GSM8k).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 font-mono font-bold">•</span>
              <span>
                <strong>Synaptic Working Memory:</strong> Memory is distributed across plastic connection weights σ(i,j) in a scale-free graph topology.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 font-mono font-bold">•</span>
              <span>
                <strong>Latent Convergence:</strong> Multi-round recurrent relaxation settles into attractor states before emitting output tokens.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 font-mono font-bold">•</span>
              <span>
                <strong>Production Scaling:</strong> Implemented on accelerator hardware with constant inference memory footprint during in-context updates.
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-[#090D17] border border-[#1A2234] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
        <span>Scientific Honesty: Our lab builds conceptual intuition; Pathway built the production architecture.</span>
        <a
          href="https://pathway.com/research"
          target="_blank"
          rel="noreferrer"
          className="text-cyan-400 hover:underline flex items-center gap-1"
        >
          <span>Read Pathway Research Papers</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

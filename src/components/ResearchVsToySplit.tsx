import React from 'react';
import { CheckCircle2, ShieldAlert, Cpu, Award, ArrowRight, ExternalLink } from 'lucide-react';
import { MathView } from './ui/MathView';

export const ResearchVsToySplit: React.FC = () => {
  return (
    <div className="rounded-xl border border-[#D8DCD8] bg-[#FFFFFF] p-6 text-[#252525] space-y-6 shadow-xs">
      <div className="border-b border-[#EAE6DF] pb-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-[#21445B]" />
          <h3 className="font-serif text-lg font-bold text-[#252525] tracking-tight">
            Research vs. toy: Epistemic comparison
          </h3>
        </div>
        <p className="text-xs text-[#5F625F] font-sans mt-1">
          A transparent comparison between our in-browser educational lab and the published peer-reviewed BDH papers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
        {/* Left Side: What Our Toy Shows */}
        <div className="rounded-xl border border-[#CDE1F0] bg-[#FAF8F5] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-2">
            <span className="text-xs font-bold text-[#21445B] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#21445B]" />
              What our educational lab shows
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#E7F2FA] border border-[#CDE1F0] text-[#21445B] font-semibold font-sans">
              Browser runtime
            </span>
          </div>

          <ul className="space-y-3 text-xs text-[#5F625F]">
            <li className="flex items-start gap-2">
              <span className="text-[#21445B] font-bold">•</span>
              <span>
                <strong className="text-[#252525]">Fixed-state compression:</strong> Ingesting sequential key-value bindings into a fixed vector/matrix causes coordinate superposition.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#21445B] font-bold">•</span>
              <span>
                <strong className="text-[#252525]">Predictable interference:</strong> Lower dimensions and higher distractors degrade cosine retrieval scores predictably.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#21445B] font-bold">•</span>
              <span>
                <strong className="text-[#252525]">Step-by-step inspection:</strong> Every update step <MathView math="M_{t+1} = \lambda M_t + \eta k_t v_t^T" /> is visible and deterministic in JavaScript.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#21445B] font-bold">•</span>
              <span>
                <strong className="text-[#252525]">Plasticity concept:</strong> Shows that state can update incrementally without appending tokens to a context window.
              </span>
            </li>
          </ul>
        </div>

        {/* Right Side: What BDH Paper Claims */}
        <div className="rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-2">
            <span className="text-xs font-bold text-[#A46622] flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-[#A46622]" />
              What the BDH paper claims
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#FFF5D8] border border-[#F3E5BE] text-[#A46622] font-semibold font-sans">
              Peer-reviewed research
            </span>
          </div>

          <ul className="space-y-3 text-xs text-[#5F625F]">
            <li className="flex items-start gap-2">
              <span className="text-[#A46622] font-bold">•</span>
              <span>
                <strong className="text-[#252525]">150M-parameter model:</strong> BDH-CQ is a trained neural architecture tested on standardized benchmarks (ARC-AGI-1, GSM8k).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#A46622] font-bold">•</span>
              <span>
                <strong className="text-[#252525]">Synaptic working memory:</strong> Memory is distributed across plastic connection weights σ(i,j) in a graph topology.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#A46622] font-bold">•</span>
              <span>
                <strong className="text-[#252525]">Latent convergence:</strong> Multi-round recurrent relaxation settles into attractor states before emitting output tokens.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#A46622] font-bold">•</span>
              <span>
                <strong className="text-[#252525]">Production scaling:</strong> Implemented on accelerator hardware with constant inference memory footprint during in-context updates.
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="p-3.5 rounded-lg bg-[#F7F5EF] border border-[#EAE6DF] flex flex-wrap items-center justify-between gap-3 text-xs font-sans text-[#5F625F]">
        <span>Scientific honesty: This lab builds conceptual intuition; Pathway created the production architecture.</span>
        <a
          href="https://pathway.com/research"
          target="_blank"
          rel="noreferrer"
          className="text-[#21445B] hover:underline flex items-center gap-1 font-semibold"
        >
          <span>Read Pathway research papers</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};

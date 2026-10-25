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
      <div className="rounded-xl border border-[#D8DCD8] bg-[#FFFFFF] p-6 space-y-6 text-[#252525] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6DF] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#E7F2FA] border border-[#CDE1F0] text-[#21445B]">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-sans text-[#21445B] font-semibold">
                Published research reference
              </div>
              <h4 className="text-lg font-serif font-bold text-[#252525] tracking-tight">
                BDH-CQ: “In-Context Learning with Recurrent Latent Reasoning”
              </h4>
            </div>
          </div>

          <a
            href="https://pathway.com/research/introducing-bdh-cq"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#F0EEEA] text-[#252525] border border-[#D8DCD8] text-xs font-sans font-semibold transition"
          >
            <span>Official research article</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#5F625F]" />
          </a>
        </div>

        {/* What We Borrow vs What We Do Not Claim */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* What We Borrow */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#DCEFE2] space-y-3">
            <div className="flex items-center gap-2 text-xs font-sans font-bold text-[#247A4B]">
              <CheckCircle2 className="w-4 h-4 text-[#247A4B]" />
              <span>What this educational lab adapts</span>
            </div>
            <ul className="space-y-2 text-xs text-[#5F625F] font-sans">
              {MODEL_CONTRACT.whatWeBorrow.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#247A4B] font-bold mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What We Do Not Claim */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#FFF5D8] space-y-3">
            <div className="flex items-center gap-2 text-xs font-sans font-bold text-[#A46622]">
              <XCircle className="w-4 h-4 text-[#A46622]" />
              <span>Epistemic limits (What we do not claim)</span>
            </div>
            <ul className="space-y-2 text-xs text-[#5F625F] font-sans">
              {MODEL_CONTRACT.whatWeDoNotClaim.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#A46622] font-bold mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Epistemic Footer */}
        <div className="p-3 rounded-lg bg-[#F7F5EF] border border-[#EAE6DF] text-xs font-sans text-[#5F625F] flex flex-wrap items-center justify-between gap-2">
          <span>Source provenance: Kosowski et al. (2025) & Pathway (2026)</span>
          <span className="text-[#21445B] font-medium">ARC-AGI-1 in-context evaluation</span>
        </div>
      </div>
    </div>
  );
};

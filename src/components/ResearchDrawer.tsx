import React from 'react';
import {
  X,
  BookOpen,
  ExternalLink,
  ShieldCheck,
  Brain,
  FileText,
  Award,
  Layers,
  Sparkles,
} from 'lucide-react';
import { RESEARCH_SOURCES, MODEL_CONTRACT } from '../data/bdhResearch';

interface ResearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResearchDrawer: React.FC<ResearchDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#252525]/40 backdrop-blur-xs animate-in fade-in">
      <div
        className="w-full max-w-xl bg-[#FFFFFF] border-l border-[#D8DCD8] h-full overflow-y-auto p-6 sm:p-8 space-y-6 text-[#252525] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#E7F2FA] border border-[#B8D7ED] text-[#31566E]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs uppercase text-[#31566E] font-semibold tracking-wider">
                Primary citations & contract
              </div>
              <h3 className="text-lg font-serif font-bold text-[#252525]">Research archive</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#F7F5EF] border border-[#D8DCD8] text-[#5F625F] hover:text-[#252525] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Epistemic Disclaimer Box */}
        <div className="p-4 rounded-xl bg-[#FFF5D8] border border-[#E8D9A8] space-y-2 text-xs font-sans">
          <div className="flex items-center gap-2 font-semibold text-[#8C5D17] text-xs uppercase">
            <ShieldCheck className="w-4 h-4 text-[#8C5D17]" />
            Epistemic boundary
          </div>
          <p className="text-[#5F625F] leading-relaxed">
            This interactive publication is an educational model designed to explain principles of recurrent memory. It does not run a checkpoint of the BDH model or reproduce its exact internal representations.
          </p>
        </div>

        {/* Model Contract Summary */}
        <div className="space-y-3 text-xs">
          <div className="text-[#252525] uppercase text-xs font-semibold flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#31566E]" />
            The three-layer model contract
          </div>

          <div className="space-y-2.5">
            {MODEL_CONTRACT.layers.map((l) => (
              <div
                key={l.num}
                className="p-3.5 rounded-lg bg-[#F7F5EF] border border-[#EAE6DF] space-y-1"
              >
                <div className="flex justify-between items-center text-xs text-[#5F625F]">
                  <span className="text-[#31566E] font-semibold">{l.num} {l.title}</span>
                  <span className="text-[11px] font-mono">{l.scope}</span>
                </div>
                <p className="text-xs text-[#5F625F] font-sans">{l.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Primary Citations */}
        <div className="space-y-3 text-xs">
          <div className="text-[#252525] uppercase text-xs font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#31566E]" />
            Primary sources & benchmarks
          </div>

          <div className="space-y-3">
            {RESEARCH_SOURCES.map((src) => (
              <div
                key={src.id}
                className="p-4 rounded-xl bg-[#FFFFFF] border border-[#D8DCD8] space-y-2 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-serif font-bold text-[#252525] text-sm">{src.title}</h4>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 rounded bg-[#F7F5EF] border border-[#D8DCD8] text-[#31566E] hover:text-[#252525] transition flex-shrink-0"
                    title="Open Source URL"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="text-xs text-[#5F625F] font-sans">
                  <span className="text-[#31566E] font-medium">{src.authors}</span> ({src.year}) •{' '}
                  <span className="text-[#5F625F]">{src.venue}</span>
                </div>

                <p className="text-xs text-[#5F625F] font-sans leading-relaxed border-t border-[#EAE6DF] pt-2">
                  {src.keyContribution}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ARC-AGI Benchmark Context */}
        <div className="p-4 rounded-xl bg-[#F7F5EF] border border-[#D8DCD8] space-y-2 text-xs">
          <div className="flex items-center gap-2 text-[#31566E] font-semibold uppercase text-xs">
            <Award className="w-4 h-4" />
            ARC-AGI benchmark context
          </div>
          <p className="text-xs text-[#5F625F] font-sans leading-relaxed">
            BDH-CQ established competitive performance on the ARC-AGI-1 benchmark via pure in-context recurrent latent reasoning without external fine-tuning or tokenized test-time search generation.
          </p>
        </div>

        {/* Drawer Footer */}
        <div className="pt-2 border-t border-[#EAE6DF] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#FFFFFF] hover:bg-[#F7F5EF] border border-[#D8DCD8] text-xs font-medium text-[#252525] transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full max-w-xl bg-[#080B14] border-l border-[#20293E] h-full overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-100 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-[#1C2538] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-950 border border-purple-800 text-purple-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-purple-400 font-bold">
                PRIMARY CITATIONS & CONTRACT
              </div>
              <h3 className="text-lg font-bold font-mono text-white">RESEARCH ARCHIVE</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#141A28] border border-[#232E44] text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Epistemic Disclaimer Box */}
        <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/40 space-y-2 text-xs font-sans">
          <div className="flex items-center gap-2 font-mono font-bold text-purple-300 text-[11px] uppercase">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            EPISTEMIC DISCLAIMER
          </div>
          <p className="text-slate-300 leading-relaxed">
            This application is an educational model designed to explain principles of recurrent memory. It does not run a checkpoint of the BDH model or reproduce its exact internal representations.
          </p>
        </div>

        {/* Model Contract Summary */}
        <div className="space-y-3 font-mono text-xs">
          <div className="text-slate-400 uppercase text-[11px] font-bold flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            THE THREE-LAYER MODEL CONTRACT
          </div>

          <div className="space-y-2.5">
            {MODEL_CONTRACT.layers.map((l) => (
              <div
                key={l.num}
                className="p-3 rounded-lg bg-[#0E1321] border border-[#1A2336] space-y-1"
              >
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span className="text-cyan-400 font-bold">{l.num} {l.title}</span>
                  <span>{l.scope}</span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans">{l.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Primary Citations */}
        <div className="space-y-3 font-mono text-xs">
          <div className="text-slate-400 uppercase text-[11px] font-bold flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" />
            PRIMARY SOURCES & BENCHMARKS
          </div>

          <div className="space-y-3">
            {RESEARCH_SOURCES.map((src) => (
              <div
                key={src.id}
                className="p-4 rounded-xl bg-[#0B0F1C] border border-[#1C2538] space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-white text-xs font-mono">{src.title}</h4>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 rounded bg-purple-950/80 border border-purple-700 text-purple-300 hover:text-white transition flex-shrink-0"
                    title="Open Source URL"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="text-[11px] text-slate-400 font-sans">
                  <span className="text-purple-300 font-mono">{src.authors}</span> ({src.year}) •{' '}
                  <span className="text-slate-300 font-mono">{src.venue}</span>
                </div>

                <p className="text-[11px] text-slate-400 font-sans leading-relaxed border-t border-[#161F32] pt-2">
                  {src.keyContribution}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ARC-AGI Benchmark Context */}
        <div className="p-4 rounded-xl bg-[#090C16] border border-[#1A2234] space-y-2 font-mono text-xs">
          <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase text-[11px]">
            <Award className="w-4 h-4" />
            ARC-AGI BENCHMARK CONTEXT
          </div>
          <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
            BDH-CQ established competitive performance on the ARC-AGI-1 benchmark via pure in-context recurrent latent reasoning without external fine-tuning or tokenized test-time search generation.
          </p>
        </div>

        {/* Drawer Footer */}
        <div className="pt-2 border-t border-[#1C2538] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#141A28] border border-[#232E44] text-xs font-mono text-slate-300 hover:text-white transition"
          >
            Close Archive
          </button>
        </div>
      </div>
    </div>
  );
};

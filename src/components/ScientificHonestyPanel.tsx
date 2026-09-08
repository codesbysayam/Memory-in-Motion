import React from 'react';
import { ShieldAlert, Cpu, Award, BookOpen, ExternalLink } from 'lucide-react';
import { sources } from '../data/researchSources';
import { SourceBadge } from './ui/SourceBadge';

interface ScientificHonestyPanelProps {
  id?: string;
}

export const ScientificHonestyPanel: React.FC<ScientificHonestyPanelProps> = ({
  id = 'scientific-honesty-panel',
}) => {
  return (
    <div id={id} className="rounded-xl border border-[#232B3B] bg-[#0A0E17] p-5 text-slate-300 font-mono text-xs shadow-lg space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2536] pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-white uppercase tracking-wider">
            ABOUT THIS EXPERIMENT · SCIENTIFIC EVIDENCE DISCIPLINE
          </span>
        </div>
        <SourceBadge type="EXPLANATION" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Live Toy Computation */}
        <div className="p-3.5 rounded-lg bg-[#101624] border border-[#1E273A] space-y-1.5">
          <div className="text-blue-300 font-bold flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" />
            LIVE TOY COMPUTATION
          </div>
          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
            The coordinates, matrix heatmaps, and retrieval scores were computed dynamically in your browser using deterministic linear algebra (M_(t+1) = λ·M_t + η·k_t·v_t^T).
          </p>
        </div>

        {/* Not a Published Benchmark */}
        <div className="p-3.5 rounded-lg bg-[#101624] border border-[#1E273A] space-y-1.5">
          <div className="text-amber-300 font-bold flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" />
            NOT A PUBLISHED BENCHMARK
          </div>
          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
            This experiment is designed to expose a core theoretical concept (superposition & capacity bounds), not to establish a universal empirical scaling law for all neural systems.
          </p>
        </div>

        {/* BDH Connection */}
        <div className="p-3.5 rounded-lg bg-[#101624] border border-[#1E273A] space-y-1.5">
          <div className="text-purple-300 font-bold flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            BDH CONNECTION
          </div>
          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
            The Dragon Hatchling section is an educational abstraction grounded directly in published literature (Kosowski et al., 2025) and official repository dynamics.
          </p>
        </div>
      </div>

      <div className="pt-2 border-t border-[#1C2538] flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
        <span>Citation anchor: Kosowski et al. (2025) · arXiv:2509.26507</span>
        <a
          href={sources.bdhPaper.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
        >
          <span>View Primary Paper</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

import React from 'react';
import { ShieldAlert, Cpu, Award, BookOpen, ExternalLink } from 'lucide-react';
import { sources } from '../data/researchSources';
import { SourceBadge } from './ui/SourceBadge';
import { MathView } from './ui/MathView';

interface ScientificHonestyPanelProps {
  id?: string;
}

export const ScientificHonestyPanel: React.FC<ScientificHonestyPanelProps> = ({
  id = 'scientific-honesty-panel',
}) => {
  return (
    <div id={id} className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-6 text-[#151515] font-mono text-xs shadow-xs space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6DF] pb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#A46622]" />
          <span className="font-bold text-[#151515] uppercase tracking-wider">
            ABOUT THIS EXPERIMENT · SCIENTIFIC EVIDENCE DISCIPLINE
          </span>
        </div>
        <SourceBadge type="EXPLANATION" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Live Toy Computation */}
        <div className="p-4 rounded-xl bg-[#EDF7F7] border border-[#CFE8E8] space-y-2">
          <div className="text-[#167C80] font-bold flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" />
            <span>LIVE TOY COMPUTATION</span>
          </div>
          <p className="text-[11px] text-[#52504A] font-sans leading-relaxed">
            The coordinates, matrix heatmaps, and retrieval scores were computed dynamically in your browser using deterministic linear algebra (<MathView math="M_{t+1} = \lambda M_t + \eta k_t v_t^T" />).
          </p>
        </div>

        {/* Not a Published Benchmark */}
        <div className="p-4 rounded-xl bg-[#FFF8EE] border border-[#F5E2C4] space-y-2">
          <div className="text-[#A46622] font-bold flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" />
            <span>NOT A PUBLISHED BENCHMARK</span>
          </div>
          <p className="text-[11px] text-[#52504A] font-sans leading-relaxed">
            This experiment is designed to expose a core theoretical concept (superposition & capacity bounds), not to establish a universal empirical scaling law for all neural systems.
          </p>
        </div>

        {/* BDH Connection */}
        <div className="p-4 rounded-xl bg-[#FAF8FD] border border-[#E2D8FA] space-y-2">
          <div className="text-[#6842C2] font-bold flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>BDH CONNECTION</span>
          </div>
          <p className="text-[11px] text-[#52504A] font-sans leading-relaxed">
            The Dragon Hatchling section is an educational abstraction grounded directly in published literature (Kosowski et al., 2025) and official repository dynamics.
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-[#EAE6DF] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#716F68]">
        <span>Citation anchor: Kosowski et al. (2025) · arXiv:2509.26507</span>
        <a
          href={sources.bdhPaper.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[#167C80] hover:underline font-semibold"
        >
          <span>View Primary Paper</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

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
    <div id={id} className="diagram-frame p-6 text-[var(--text-primary)] font-mono text-xs space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[var(--accent-yellow-text)]" />
          <span className="font-bold text-[var(--text-primary)] uppercase tracking-wider">
            About this experiment · Scientific evidence discipline
          </span>
        </div>
        <SourceBadge type="EXPLANATION" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Live Toy Computation */}
        <div className="p-4 rounded-xl bg-[var(--accent-blue)] border border-[var(--border)] space-y-2">
          <div className="text-[var(--accent-blue-text)] font-bold flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" />
            <span>Live toy computation</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
            The coordinates, matrix heatmaps, and retrieval scores were computed dynamically in your browser using deterministic linear algebra (<MathView math="M_{t+1} = \lambda M_t + \eta k_t v_t^T" />).
          </p>
        </div>

        {/* Not a Published Benchmark */}
        <div className="p-4 rounded-xl bg-[var(--accent-yellow)] border border-[var(--color-warning-border)] space-y-2">
          <div className="text-[var(--accent-yellow-text)] font-bold flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" />
            <span>Not a published benchmark</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
            This experiment is designed to expose a core theoretical concept (superposition & capacity bounds), not to establish a universal empirical scaling law for all neural systems.
          </p>
        </div>

        {/* BDH Connection */}
        <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-2">
          <div className="text-[var(--text-primary)] font-bold flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[var(--accent-blue-text)]" />
            <span>BDH connection</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
            The Dragon Hatchling section is an educational abstraction grounded directly in published literature (Kosowski et al., 2025) and official repository dynamics.
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
        <span>Citation anchor: Kosowski et al. (2025) · arXiv:2509.26507</span>
        <a
          href={sources.bdhPaper.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[var(--accent-blue-text)] hover:underline font-semibold"
        >
          <span>View primary paper</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

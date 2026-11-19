import React from 'react';
import { CheckCircle2, Cpu, Award, ExternalLink } from 'lucide-react';
import { MathView } from './ui/MathView';

export const ResearchVsToySplit: React.FC = () => {
  return (
    <div className="diagram-frame p-6 text-[var(--text-primary)] space-y-6">
      <div className="border-b border-[var(--border)] pb-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-[var(--accent-blue-text)] shrink-0" />
          <h3 className="font-sans text-lg font-semibold text-[var(--text-primary)] tracking-tight">
            Research vs. toy: Epistemic comparison
          </h3>
        </div>
        <p className="text-xs text-[var(--text-secondary)] font-sans mt-1">
          A transparent comparison between our in-browser educational lab and the published peer-reviewed BDH papers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
        {/* Left Side: What Our Toy Shows */}
        <div className="metric-panel space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] pb-2.5">
            <span className="text-xs font-semibold text-[var(--accent-blue-text)] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[var(--accent-blue-text)] shrink-0" />
              What our educational lab shows
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-[var(--accent-blue)] border border-[var(--border)] text-[var(--accent-blue-text)] font-medium whitespace-nowrap">
              Browser runtime
            </span>
          </div>

          <ul className="space-y-3 text-xs text-[var(--text-secondary)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--accent-blue-text)] font-bold">•</span>
              <span>
                <strong className="text-[var(--text-primary)]">Fixed-state compression:</strong> Ingesting sequential key-value bindings into a fixed vector/matrix causes coordinate superposition.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--accent-blue-text)] font-bold">•</span>
              <span>
                <strong className="text-[var(--text-primary)]">Predictable interference:</strong> Lower dimensions and higher distractors degrade cosine retrieval scores predictably.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--accent-blue-text)] font-bold">•</span>
              <span>
                <strong className="text-[var(--text-primary)]">Step-by-step inspection:</strong> Every update step <MathView math="M_{t+1} = \lambda M_t + \eta k_t v_t^T" /> is visible and deterministic in JavaScript.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--accent-blue-text)] font-bold">•</span>
              <span>
                <strong className="text-[var(--text-primary)]">Plasticity concept:</strong> Shows that state can update incrementally without appending tokens to a context window.
              </span>
            </li>
          </ul>
        </div>

        {/* Right Side: What BDH Paper Claims */}
        <div className="metric-panel space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] pb-2.5">
            <span className="text-xs font-semibold text-[var(--accent-yellow-text)] flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-[var(--accent-yellow-text)] shrink-0" />
              What the BDH paper claims
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-[var(--accent-yellow)] border border-[var(--color-warning-border)] text-[var(--accent-yellow-text)] font-medium whitespace-nowrap">
              Peer-reviewed research
            </span>
          </div>

          <ul className="space-y-3 text-xs text-[var(--text-secondary)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--accent-yellow-text)] font-bold">•</span>
              <span>
                <strong className="text-[var(--text-primary)]">150M-parameter model:</strong> BDH-CQ is a trained neural architecture tested on standardized benchmarks (ARC-AGI-1, GSM8k).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--accent-yellow-text)] font-bold">•</span>
              <span>
                <strong className="text-[var(--text-primary)]">Synaptic working memory:</strong> Memory is distributed across plastic connection weights σ(i,j) in a graph topology.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--accent-yellow-text)] font-bold">•</span>
              <span>
                <strong className="text-[var(--text-primary)]">Latent convergence:</strong> Multi-round recurrent relaxation settles into attractor states before emitting output tokens.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--accent-yellow-text)] font-bold">•</span>
              <span>
                <strong className="text-[var(--text-primary)]">Production scaling:</strong> Implemented on accelerator hardware with constant inference memory footprint during in-context updates.
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="research-callout flex flex-wrap items-center justify-between gap-3 text-xs font-sans text-[var(--text-secondary)]">
        <span>Scientific honesty: This lab builds conceptual intuition; Pathway created the production architecture.</span>
        <a
          href="https://pathway.com/research"
          target="_blank"
          rel="noreferrer"
          className="text-[var(--accent-blue-text)] hover:underline flex items-center gap-1 font-semibold"
        >
          <span>Read Pathway research papers</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};

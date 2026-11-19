import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Code2, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';
import { MODEL_CONTRACT } from '../data/bdhResearch';
import { MathView } from './ui/MathView';

export const UnderTheHoodPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="diagram-frame p-5 sm:p-7 text-[var(--text-primary)] space-y-6">
      {/* MODEL CONTRACT Header */}
      <div className="space-y-3 border-b border-[var(--border)] pb-5">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-[var(--accent-blue-text)] bg-[var(--accent-blue)] border border-[var(--border)] px-2.5 py-0.5 rounded-md font-semibold">
            Scientific provenance
          </span>
          <span className="text-xs uppercase tracking-wider text-[var(--text-secondary)] bg-[var(--surface-soft)] border border-[var(--border)] px-2.5 py-0.5 rounded-md font-semibold">
            Model contract
          </span>
        </div>

        <h3 className="text-lg sm:text-xl font-sans font-semibold text-[var(--text-primary)] tracking-tight">
          The three-layer model contract
        </h3>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans max-w-3xl leading-relaxed">
          To maintain scientific honesty and intellectual transparency, this publication explicitly distinguishes in-browser educational linear algebra from published peer-reviewed findings.
        </p>

        {/* 3 Explicit Layers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {MODEL_CONTRACT.layers.map((layer) => (
            <div
              key={layer.num}
              className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-2 text-xs"
            >
              <div className="flex items-center justify-between text-[var(--text-secondary)] font-semibold">
                <span className="text-[var(--accent-blue-text)] font-serif text-sm tabular-nums">Layer {layer.num}</span>
                <span className="text-[11px] font-mono uppercase text-[var(--text-muted)]">Scope</span>
              </div>
              <div className="text-[var(--text-primary)] font-semibold text-sm tracking-wide font-sans">{layer.title}</div>
              <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
                {layer.description}
              </p>
              <div className="text-xs text-[var(--text-secondary)] border-t border-[var(--border)] pt-2 font-sans">
                {layer.scope}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Collapsible UNDER THE HOOD Panel (Collapsed by default) */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-4 flex items-center justify-between text-xs text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)] transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Code2 className="w-4 h-4 text-[var(--accent-blue-text)]" />
            <span className="font-semibold text-sm text-[var(--text-primary)]">Under the hood: mathematical equations</span>
            <span className="text-[11px] text-[var(--text-secondary)] bg-[var(--surface-soft)] px-2 py-0.5 rounded border border-[var(--border)]">
              {isOpen ? 'Click to collapse' : 'Click to expand'}
            </span>
          </div>
          {isOpen ? <ChevronUp className="w-4 h-4 text-[var(--text-secondary)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />}
        </button>

        {isOpen && (
          <div className="p-5 border-t border-[var(--border)] space-y-5 animate-in fade-in text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Input Encoding */}
              <div className="p-3.5 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)] space-y-1.5">
                <div className="text-[var(--text-secondary)] text-[11px] uppercase font-semibold">1. Input encoding</div>
                <div className="text-[var(--accent-blue-text)] font-mono font-bold text-sm">x_t ∈ ℝ^d</div>
                <p className="text-xs text-[var(--text-secondary)] font-sans">
                  Keys and values are mapped into d-dimensional orthogonal or pseudo-random coordinate vectors.
                </p>
              </div>

              {/* Recurrent Update */}
              <div className="p-3.5 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)] space-y-1.5">
                <div className="text-[var(--text-secondary)] text-[11px] uppercase font-semibold">2. Recurrent update</div>
                <div className="text-[var(--accent-blue-text)] font-bold text-sm">
                  <MathView math="h_t = \tanh(W_h h_{t-1} + W_x x_t)" />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-sans">
                  The latent state vector is updated iteratively without expanding external sequence tokens.
                </p>
              </div>

              {/* Associative Memory Update */}
              <div className="p-3.5 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)] space-y-1.5">
                <div className="text-[var(--text-secondary)] text-[11px] uppercase font-semibold">3. Associative matrix write</div>
                <div className="text-[var(--accent-yellow-text)] font-bold text-sm">
                  <MathView math="M_{t+1} = \lambda M_t + \eta k_t v_t^T" />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-sans">
                  Linear fast-weight outer product write with retention attenuation factor <MathView math="\lambda \in [0, 1]" />.
                </p>
              </div>

              {/* Query & Decoding */}
              <div className="p-3.5 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)] space-y-1.5">
                <div className="text-[var(--text-secondary)] text-[11px] uppercase font-semibold">4. Query & decoding</div>
                <div className="text-[var(--accent-green-text)] font-bold text-sm">
                  <MathView math="\hat{v} = q^T M, \quad \hat{y} = \operatorname{argmax}_v \operatorname{sim}(\hat{v}, v)" />
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-sans">
                  Vector projection followed by cosine similarity ranking across all stored candidate concepts.
                </p>
              </div>
            </div>

            {/* Crucial Epistemic Boundary Notice */}
            <div className="p-3.5 rounded-lg bg-[var(--accent-yellow)] border border-[var(--color-warning-border)] text-[var(--text-primary)] text-xs font-sans space-y-1">
              <div className="font-semibold text-[var(--accent-yellow-text)] flex items-center gap-1.5 text-xs">
                <ShieldAlert className="w-4 h-4" />
                Mathematical provenance disclaimer
              </div>
              <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                <strong className="text-[var(--text-primary)]">This is our educational model, not the official BDH equations.</strong> While our toy uses deterministic outer-product associative fast weights (M ∈ ℝ^(d×d)), the actual Dragon Hatchling architecture (Kosowski et al., 2025; Pathway, 2026) operates on high-dimensional neuron variables X and plastic synaptic connection tensors σ(i, j) governed by 4-phase localized particle relaxation.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Code2, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';
import { MODEL_CONTRACT } from '../data/bdhResearch';
import { MathView } from './ui/MathView';

export const UnderTheHoodPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="rounded-xl border border-[#D8DCD8] bg-[#FFFFFF] p-5 sm:p-7 text-[#252525] shadow-xs space-y-6">
      {/* MODEL CONTRACT Header */}
      <div className="space-y-3 border-b border-[#EAE6DF] pb-5">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-[#31566E] bg-[#E7F2FA] border border-[#B8D7ED] px-2.5 py-0.5 rounded-md font-semibold">
            Scientific provenance
          </span>
          <span className="text-xs uppercase tracking-wider text-[#5F625F] bg-[#F7F5EF] border border-[#D8DCD8] px-2.5 py-0.5 rounded-md font-semibold">
            Model contract
          </span>
        </div>

        <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#252525] tracking-tight">
          The three-layer model contract
        </h3>
        <p className="text-xs sm:text-sm text-[#5F625F] font-sans max-w-3xl leading-relaxed">
          To maintain scientific honesty and intellectual transparency, this publication explicitly distinguishes in-browser educational linear algebra from published peer-reviewed findings.
        </p>

        {/* 3 Explicit Layers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {MODEL_CONTRACT.layers.map((layer) => (
            <div
              key={layer.num}
              className="p-4 rounded-xl bg-[#F7F5EF] border border-[#EAE6DF] space-y-2 text-xs"
            >
              <div className="flex items-center justify-between text-[#5F625F] font-semibold">
                <span className="text-[#31566E] font-serif text-sm">Layer {layer.num}</span>
                <span className="text-[10px] font-mono uppercase text-[#5F625F]">Scope</span>
              </div>
              <div className="text-[#252525] font-semibold text-sm tracking-wide font-sans">{layer.title}</div>
              <p className="text-xs text-[#5F625F] font-sans leading-relaxed">
                {layer.description}
              </p>
              <div className="text-[11px] text-[#5F625F] border-t border-[#EAE6DF] pt-2 font-sans">
                {layer.scope}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Collapsible UNDER THE HOOD Panel (Collapsed by default) */}
      <div className="rounded-xl border border-[#D8DCD8] bg-[#FFFFFF] overflow-hidden shadow-2xs">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-4 flex items-center justify-between text-xs text-left text-[#5F625F] hover:text-[#252525] hover:bg-[#F7F5EF] transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Code2 className="w-4 h-4 text-[#31566E]" />
            <span className="font-semibold text-sm text-[#252525]">Under the hood: mathematical equations</span>
            <span className="text-[10px] text-[#5F625F] bg-[#F7F5EF] px-2 py-0.5 rounded border border-[#D8DCD8]">
              {isOpen ? 'Click to collapse' : 'Click to expand'}
            </span>
          </div>
          {isOpen ? <ChevronUp className="w-4 h-4 text-[#5F625F]" /> : <ChevronDown className="w-4 h-4 text-[#5F625F]" />}
        </button>

        {isOpen && (
          <div className="p-5 border-t border-[#EAE6DF] space-y-5 animate-in fade-in text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Input Encoding */}
              <div className="p-3.5 rounded-lg bg-[#F7F5EF] border border-[#EAE6DF] space-y-1.5">
                <div className="text-[#5F625F] text-[10px] uppercase font-semibold">1. Input encoding</div>
                <div className="text-[#31566E] font-mono font-bold text-sm">x_t ∈ ℝ^d</div>
                <p className="text-xs text-[#5F625F] font-sans">
                  Keys and values are mapped into d-dimensional orthogonal or pseudo-random coordinate vectors.
                </p>
              </div>

              {/* Recurrent Update */}
              <div className="p-3.5 rounded-lg bg-[#F7F5EF] border border-[#EAE6DF] space-y-1.5">
                <div className="text-[#5F625F] text-[10px] uppercase font-semibold">2. Recurrent update</div>
                <div className="text-[#31566E] font-bold text-sm">
                  <MathView math="h_t = \tanh(W_h h_{t-1} + W_x x_t)" />
                </div>
                <p className="text-xs text-[#5F625F] font-sans">
                  The latent state vector is updated iteratively without expanding external sequence tokens.
                </p>
              </div>

              {/* Associative Memory Update */}
              <div className="p-3.5 rounded-lg bg-[#F7F5EF] border border-[#EAE6DF] space-y-1.5">
                <div className="text-[#5F625F] text-[10px] uppercase font-semibold">3. Associative matrix write</div>
                <div className="text-[#8C5D17] font-bold text-sm">
                  <MathView math="M_{t+1} = \lambda M_t + \eta k_t v_t^T" />
                </div>
                <p className="text-xs text-[#5F625F] font-sans">
                  Linear fast-weight outer product write with retention attenuation factor <MathView math="\lambda \in [0, 1]" />.
                </p>
              </div>

              {/* Query & Decoding */}
              <div className="p-3.5 rounded-lg bg-[#F7F5EF] border border-[#EAE6DF] space-y-1.5">
                <div className="text-[#5F625F] text-[10px] uppercase font-semibold">4. Query & decoding</div>
                <div className="text-[#247A4B] font-bold text-sm">
                  <MathView math="\hat{v} = q^T M, \quad \hat{y} = \operatorname{argmax}_v \operatorname{sim}(\hat{v}, v)" />
                </div>
                <p className="text-xs text-[#5F625F] font-sans">
                  Vector projection followed by cosine similarity ranking across all stored candidate concepts.
                </p>
              </div>
            </div>

            {/* Crucial Epistemic Boundary Notice */}
            <div className="p-3.5 rounded-lg bg-[#FFF5D8] border border-[#E8D9A8] text-[#252525] text-xs font-sans space-y-1">
              <div className="font-semibold text-[#8C5D17] flex items-center gap-1.5 text-xs">
                <ShieldAlert className="w-4 h-4" />
                Mathematical provenance disclaimer
              </div>
              <p className="text-xs leading-relaxed text-[#5F625F]">
                <strong className="text-[#252525]">This is our educational model, not the official BDH equations.</strong> While our toy uses deterministic outer-product associative fast weights (M ∈ ℝ^(d×d)), the actual Dragon Hatchling architecture (Kosowski et al., 2025; Pathway, 2026) operates on high-dimensional neuron variables X and plastic synaptic connection tensors σ(i, j) governed by 4-phase localized particle relaxation.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

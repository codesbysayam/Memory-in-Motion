import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Code2, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';
import { MODEL_CONTRACT } from '../data/bdhResearch';
import { MathView } from './ui/MathView';

export const UnderTheHoodPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="rounded-2xl border border-[#252A35] bg-[#0A0D16] p-5 sm:p-7 text-slate-100 shadow-2xl space-y-6">
      {/* MODEL CONTRACT Header */}
      <div className="space-y-3 border-b border-[#1E2536] pb-5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-purple-400 bg-purple-950/60 border border-purple-800/60 px-2.5 py-0.5 rounded-md font-bold">
            SCIENTIFIC PROVENANCE
          </span>
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-0.5 rounded-md font-bold">
            MODEL CONTRACT
          </span>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
          THE THREE-LAYER MODEL CONTRACT
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-3xl leading-relaxed">
          To maintain strict scientific honesty and intellectual transparency, this laboratory explicitly separates in-browser educational linear algebra from published peer-reviewed findings.
        </p>

        {/* 3 Explicit Layers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {MODEL_CONTRACT.layers.map((layer) => (
            <div
              key={layer.num}
              className="p-4 rounded-xl bg-[#0E1321] border border-[#1E2638] space-y-2 font-mono text-xs"
            >
              <div className="flex items-center justify-between text-slate-500 font-bold">
                <span className="text-purple-400">{layer.num}</span>
                <span className="text-[10px] text-slate-500">LAYER</span>
              </div>
              <div className="text-white font-bold text-sm tracking-wide">{layer.title}</div>
              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                {layer.description}
              </p>
              <div className="text-[10px] text-slate-500 border-t border-[#192234] pt-2 font-sans">
                {layer.scope}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Collapsible UNDER THE HOOD Panel (Collapsed by default) */}
      <div className="rounded-xl border border-[#1E273C] bg-[#070A12] overflow-hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-4 flex items-center justify-between font-mono text-xs text-left text-slate-300 hover:text-white hover:bg-[#0E1424] transition"
        >
          <div className="flex items-center gap-2.5">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-sm text-white">UNDER THE HOOD: MATHEMATICAL EQUATIONS</span>
            <span className="text-[10px] text-slate-500 bg-[#121828] px-2 py-0.5 rounded border border-[#1E273C]">
              {isOpen ? 'CLICK TO COLLAPSE' : 'CLICK TO EXPAND'}
            </span>
          </div>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isOpen && (
          <div className="p-5 border-t border-[#1C2538] space-y-5 animate-in fade-in font-mono text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Input Encoding */}
              <div className="p-3.5 rounded-lg bg-[#0C101C] border border-[#1A2234] space-y-1.5">
                <div className="text-slate-400 text-[10px] uppercase font-bold">1. INPUT ENCODING</div>
                <div className="text-cyan-300 font-bold text-sm">x_t ∈ ℝ^d</div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Keys and values are mapped into d-dimensional orthogonal or pseudo-random coordinate vectors.
                </p>
              </div>

              {/* Recurrent Update */}
              <div className="p-3.5 rounded-lg bg-[#0C101C] border border-[#1A2234] space-y-1.5">
                <div className="text-slate-400 text-[10px] uppercase font-bold">2. RECURRENT UPDATE</div>
                <div className="text-cyan-300 font-bold text-sm">
                  <MathView math="h_t = \tanh(W_h h_{t-1} + W_x x_t)" />
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  The latent state vector is updated iteratively without expanding external sequence tokens.
                </p>
              </div>

              {/* Associative Memory Update */}
              <div className="p-3.5 rounded-lg bg-[#0C101C] border border-[#1A2234] space-y-1.5">
                <div className="text-slate-400 text-[10px] uppercase font-bold">3. ASSOCIATIVE MATRIX WRITE</div>
                <div className="text-purple-300 font-bold text-sm">
                  <MathView math="M_{t+1} = \lambda M_t + \eta k_t v_t^T" />
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Linear fast-weight outer product write with retention attenuation factor <MathView math="\lambda \in [0, 1]" />.
                </p>
              </div>

              {/* Query & Decoding */}
              <div className="p-3.5 rounded-lg bg-[#0C101C] border border-[#1A2234] space-y-1.5">
                <div className="text-slate-400 text-[10px] uppercase font-bold">4. QUERY & DECODING</div>
                <div className="text-emerald-300 font-bold text-sm">
                  <MathView math="\hat{v} = q^T M, \quad \hat{y} = \operatorname{argmax}_v \operatorname{sim}(\hat{v}, v)" />
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Vector projection followed by cosine similarity ranking across all stored candidate concepts.
                </p>
              </div>
            </div>

            {/* Crucial Epistemic Boundary Notice */}
            <div className="p-3.5 rounded-lg bg-amber-950/30 border border-amber-500/40 text-amber-200/90 text-xs font-sans space-y-1">
              <div className="font-mono font-bold text-amber-400 flex items-center gap-1.5 text-[11px]">
                <ShieldAlert className="w-4 h-4" />
                MATHEMATICAL PROVENANCE DISCLAIMER
              </div>
              <p>
                <strong>This is our educational model, not the official BDH equations.</strong> While our toy uses deterministic outer-product associative fast weights (M ∈ ℝ^(d×d)), the actual Dragon Hatchling architecture (Kosowski et al., 2025; Pathway, 2026) operates on high-dimensional neuron variables X and plastic synaptic connection tensors σ(i, j) governed by 4-phase localized particle relaxation.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

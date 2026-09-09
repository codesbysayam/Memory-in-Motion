import React from 'react';
import { ShieldCheck, Sparkles, ArrowUpRight } from 'lucide-react';
import { FinalClaimCard } from './FinalClaimCard';

export const TakeawaysAndFooter: React.FC = () => {
  const takeaways = [
    {
      num: '01',
      title: 'Recurrent Memory Mechanism',
      desc: 'Recurrent memory carries task-relevant information forward through continuous internal state coordinates rather than accumulating an unbounded token sequence.',
    },
    {
      num: '02',
      title: 'Bounded Resource Footprint',
      desc: 'Fixed-size states prevent out-of-memory crashes and enable continuous lifelong streaming with deterministic constant latency per step.',
    },
    {
      num: '03',
      title: 'The Compression Trade-off',
      desc: 'Compressing many items into finite vector dimensions creates inevitable geometric crosstalk, representational interference, and forgetting.',
    },
    {
      num: '04',
      title: 'BDH Synaptic Architecture',
      desc: 'Dragon Hatchling (BDH) shifts memory from 1D dense vectors to synaptic connection weights across a scale-free particle graph, distinct from Mamba/SSMs.',
    },
    {
      num: '05',
      title: 'Epistemic Honesty & Rigor',
      desc: 'In-browser toy models build direct physical intuition for interference; published papers define full production BDH properties.',
    },
  ];

  return (
    <footer id="takeaways" className="scroll-mt-20 border-t border-[#E5E0D8] bg-[#FBF9F5] py-20 text-[#151515]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 space-y-12">
        {/* Five Takeaways */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded bg-[#F3EFFF] text-[#6842C2] border border-[#E2D8FA] font-bold">
              SYNTHESIS
            </span>
            <span className="text-xs font-mono text-[#716F68]">
              WHAT YOU SHOULD REMEMBER
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-serif tracking-tight text-[#151515] font-normal">
            Five core scientific takeaways
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {takeaways.map((t) => (
              <div
                key={t.num}
                className="flex flex-col justify-between rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-5 space-y-3 shadow-xs hover:border-[#D8D4CB] transition-all"
              >
                <div>
                  <span className="font-mono text-xs font-bold text-[#6842C2] block mb-1">
                    {t.num}
                  </span>
                  <h4 className="text-xs font-serif font-bold text-[#151515] mb-1.5">
                    {t.title}
                  </h4>
                  <p className="text-[11px] text-[#716F68] leading-relaxed font-sans">
                    {t.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 19. WHAT THIS SITE DEMONSTRATES: Final Claim & Disclaimer Card */}
        <div>
          <FinalClaimCard />
        </div>

        {/* Technical Honesty & AI Disclosure */}
        <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-6 text-xs text-[#52504A] leading-relaxed space-y-2 shadow-xs">
          <div className="flex items-center gap-2 font-mono text-[#151515] font-bold">
            <ShieldCheck className="w-4 h-4 text-[#167C80]" />
            <span>Technical Honesty & AI Assistance Disclosure</span>
          </div>
          <p>
            This laboratory was created for <strong>DataForge 2026 — Pathway Track (&ldquo;Explain the Frontier&rdquo;)</strong>. All simulations execute deterministically in your browser using PRNG-seeded vector arithmetic and local graph updates. No benchmark numbers or experimental claims were fabricated.
          </p>
          <p className="font-mono text-[11px] text-[#716F68]">
            &ldquo;This project uses AI-assisted development. The author is responsible for understanding, verifying, and defending every component.&rdquo;
          </p>
        </div>

        {/* Hackathon Footer Line */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-[#EAE6DF] pt-6 text-xs text-[#716F68] font-mono">
          <div>
            DataForge 2026 — Pathway Track · <span className="text-[#151515] font-semibold">&ldquo;Explain the Frontier&rdquo;</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/pathwaycom/bdh"
              target="_blank"
              rel="noreferrer"
              className="text-[#167C80] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Pathway BDH Repo</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
            <a
              href="https://arxiv.org/abs/2509.26507"
              target="_blank"
              rel="noreferrer"
              className="text-[#6842C2] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>arXiv:2509.26507</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

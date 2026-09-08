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
    <footer id="takeaways" className="scroll-mt-20 border-t border-[#252A35] bg-[#07080B] py-14 text-zinc-300">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Five Takeaways */}
        <div className="mb-10 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#22D3EE]">
              SYNTHESIS · WHAT YOU SHOULD REMEMBER
            </span>
          </div>

          <h2 className="font-mono text-xl font-bold text-white sm:text-2xl">
            Five Core Scientific Takeaways
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {takeaways.map((t) => (
              <div
                key={t.num}
                className="flex flex-col justify-between rounded-xl border border-[#252A35] bg-[#11141A] p-5 space-y-3"
              >
                <div>
                  <span className="font-mono text-xs font-bold text-violet-400 block mb-1">
                    {t.num}
                  </span>
                  <h4 className="text-xs font-semibold text-white mb-1.5">
                    {t.title}
                  </h4>
                  <p className="text-[11px] text-[#8F96A3] leading-relaxed font-sans">
                    {t.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 19. WHAT THIS SITE DEMONSTRATES: Final Claim & Disclaimer Card */}
        <div className="mb-10">
          <FinalClaimCard />
        </div>

        {/* Technical Honesty & AI Disclosure */}
        <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-5 text-xs text-[#8F96A3] leading-relaxed space-y-2">
          <div className="flex items-center gap-2 font-mono text-white font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Technical Honesty & AI Assistance Disclosure</span>
          </div>
          <p>
            This laboratory was created for <strong>DataForge 2026 — Pathway Track ("Explain the Frontier")</strong>. All simulations execute deterministically in your browser using PRNG-seeded vector arithmetic and local graph updates. No benchmark numbers or experimental claims were fabricated.
          </p>
          <p className="font-mono text-[11px] text-[#8F96A3]">
            "This project uses AI-assisted development. The author is responsible for understanding, verifying, and defending every component."
          </p>
        </div>

        {/* Hackathon Footer Line */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-[#252A35] pt-6 text-xs text-[#8F96A3] font-mono">
          <div>
            DataForge 2026 — Pathway Track · <span className="text-white font-semibold">"Explain the Frontier"</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/pathwaycom/bdh"
              target="_blank"
              rel="noreferrer"
              className="text-[#22D3EE] hover:underline flex items-center gap-1"
            >
              <span>Pathway BDH Repo</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
            <a
              href="https://arxiv.org/abs/2509.26507"
              target="_blank"
              rel="noreferrer"
              className="text-violet-400 hover:underline flex items-center gap-1"
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

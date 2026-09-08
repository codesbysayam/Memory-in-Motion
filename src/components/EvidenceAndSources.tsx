import React, { useState } from 'react';
import { ExternalLink, ShieldCheck, CheckCircle2, Bookmark, BookOpen, Layers } from 'lucide-react';
import { getVerifiedResearch } from '../data/research';
import { OFFICIAL_SOURCES, PAPER_LANDSCAPE } from '../data/sources';
import { RESEARCH_SOURCES, ResearchSource } from '../data/researchSources';
import { SectionHeader } from './ui/SectionHeader';
import { SourceBadge, SourceBadgeType } from './ui/SourceBadge';
import { EvidenceLadder } from './EvidenceLadder';

export const EvidenceAndSources: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('ALL');

  const verifiedResearch = getVerifiedResearch();

  const types: { key: string; label: string }[] = [
    { key: 'ALL', label: 'ALL SOURCES' },
    { key: 'primary', label: 'PRIMARY PAPERS' },
    { key: 'official', label: 'OFFICIAL PATHWAY' },
    { key: 'toy', label: 'TOY EXPERIMENTS' },
  ];

  const filteredEntries =
    filterType === 'ALL'
      ? verifiedResearch
      : verifiedResearch.filter((entry) => entry.type === filterType);

  return (
    <section id="evidence-sources" className="scroll-mt-20 border-b border-[#252A35] bg-[#07080B] py-14">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 space-y-10">
        <SectionHeader
          number="11"
          category="FORMAL RESEARCH EVIDENCE"
          title="Research Evidence & Paper Landscape"
          subtitle="All scientific claims across this laboratory are rigorously grounded in peer-reviewed primary literature, official Pathway technical releases, and educational toy simulations."
          discovery="Decoupling claims into verified primary literature versus educational toy models maintains complete epistemic honesty."
        />

        {/* 4-Level Epistemic Evidence Ladder */}
        <EvidenceLadder />

        {/* Section O Primary Source Dossier */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#252A35] pb-2">
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#22D3EE]" />
              PRIMARY BDH & RECURRENT RESEARCH DOSSIER
            </h3>
            <span className="font-mono text-xs text-[#8F96A3]">
              Pathway / Kosowski et al. (2025–2026)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
            {RESEARCH_SOURCES.map((src) => (
              <div
                key={src.id}
                className="rounded-xl border border-[#252A35] bg-[#11141A] p-5 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950/60 border border-[#22D3EE]/30 text-[#22D3EE]">
                      [{src.badge}]
                    </span>
                    <span className="text-[10px] text-[#8F96A3]">{src.year}</span>
                  </div>

                  <h4 className="font-bold text-white text-xs leading-snug">{src.title}</h4>
                  <div className="text-[10px] text-violet-300 font-sans">{src.authors}</div>

                  <div className="pt-2 border-t border-[#252A35] space-y-1">
                    <span className="text-[10px] text-[#8F96A3] uppercase block font-semibold">
                      WHAT IT SUPPORTS:
                    </span>
                    <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                      {src.whatItSupports}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#252A35] flex items-center justify-between text-[10px]">
                  <span className="text-[#8F96A3]">{src.type}</span>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#22D3EE] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Inspect Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Paper Landscape Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
              Comprehensive Research Landscape (2022–2026)
            </h3>
            <span className="font-mono text-xs text-[#8F96A3]">
              Peer-Reviewed & Technical Preprints
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#252A35] bg-[#11141A]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-[#252A35] bg-[#151922] text-[#8F96A3] text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-bold">Paper Title & Authors</th>
                  <th className="py-3 px-3">Year / Venue</th>
                  <th className="py-3 px-3">Contribution</th>
                  <th className="py-3 px-3">Classification</th>
                  <th className="py-3 px-4 text-right">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252A35]/60 text-zinc-300">
                {PAPER_LANDSCAPE.map((paper, idx) => (
                  <tr key={idx} className="hover:bg-[#151922]/50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{paper.title}</div>
                      <div className="text-[11px] text-[#8F96A3] font-sans mt-0.5">{paper.authors}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="rounded bg-[#151922] border border-[#252A35] px-2 py-0.5 text-[10px] text-zinc-300">
                        {paper.year} · {paper.venue}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans text-xs text-[#8F96A3] max-w-xs leading-relaxed">
                      {paper.conceptContribution}
                    </td>
                    <td className="py-3 px-3">
                      <SourceBadge type="primary" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={paper.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-[11px] text-[#22D3EE] hover:underline"
                      >
                        <span>arXiv</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Official Sources Reference Box */}
        <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-5 space-y-3 font-mono text-xs">
          <div className="font-mono text-xs font-bold uppercase text-white tracking-wider">
            Official Research Repositories & Specifications:
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {OFFICIAL_SOURCES.map((src, i) => (
              <a
                key={i}
                href={src.url}
                target="_blank"
                rel="noreferrer"
                className="group rounded-lg border border-[#252A35] bg-[#07080B] p-4 transition-all hover:border-[#22D3EE]/50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#22D3EE]">{src.venue}</span>
                  <ExternalLink className="w-3 h-3 text-[#8F96A3] group-hover:text-[#22D3EE]" />
                </div>
                <div className="mt-1 font-semibold text-xs text-white group-hover:text-[#22D3EE]">
                  {src.title}
                </div>
                <p className="mt-1 text-[11px] text-[#8F96A3] font-sans line-clamp-2">
                  {src.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

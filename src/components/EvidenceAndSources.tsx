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
    <section id="evidence-sources" className="scroll-mt-20 border-b border-[#D8D4CB] bg-[#F4F1EA] text-[#151515] py-16">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 space-y-12">
        <SectionHeader
          number="11"
          category="BIBLIOGRAPHY & PROVENANCE"
          title="Research Evidence & Epistemic Dossier"
          subtitle="All mathematical definitions, recurrent state equations, and complexity proofs across this laboratory are explicitly grounded in peer-reviewed literature, primary technical preprints, and verifiable toy formulations."
          discovery="Decoupling claims into primary academic literature, official benchmarks, and toy computational models preserves strict epistemic rigor."
          theme="light"
        />

        {/* 4-Level Epistemic Evidence Ladder */}
        <EvidenceLadder theme="light" />

        {/* Section O Primary Source Dossier */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-[#D8D4CB] pb-3">
            <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#151515] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#6842C2]" />
              Primary Recurrent & BDH Bibliography
            </h3>
            <span className="font-mono text-xs text-[#716F68]">
              Annotated Canonical Citations [1]–[{RESEARCH_SOURCES.length}]
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 font-mono text-xs">
            {RESEARCH_SOURCES.map((src, idx) => (
              <div
                key={src.id}
                className="rounded-xl border border-[#D8D4CB] bg-[#ECE8DF] p-5 flex flex-col justify-between space-y-4 shadow-sm hover:border-[#6842C2]/40 transition-colors"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F4F1EA] border border-[#D8D4CB] text-[#6842C2]">
                      [{idx + 1}] {src.badge}
                    </span>
                    <span className="text-[11px] font-semibold text-[#716F68]">{src.year}</span>
                  </div>

                  <h4 className="font-serif font-medium text-sm text-[#151515] leading-snug">
                    {src.title}
                  </h4>
                  <div className="text-[11px] text-[#716F68] font-sans italic">
                    {src.authors}
                  </div>

                  <div className="pt-2 border-t border-[#D8D4CB] space-y-1">
                    <span className="text-[10px] text-[#A46622] uppercase block font-bold tracking-wider">
                      EMPIRICAL & THEORETICAL BASIS:
                    </span>
                    <p className="text-[11px] text-[#2A2926] font-sans leading-relaxed">
                      {src.whatItSupports}
                    </p>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-[#D8D4CB] flex items-center justify-between text-[11px]">
                  <span className="text-[#716F68] capitalize">{src.type} source</span>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#6842C2] hover:text-[#52309e] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>View Preprint</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Paper Landscape Table */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-[#D8D4CB] pb-2">
            <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#151515]">
              Comparative Academic Landscape (2022–2026)
            </h3>
            <span className="font-mono text-xs text-[#716F68]">
              Peer-Reviewed & Technical Reports
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#D8D4CB] bg-[#ECE8DF] shadow-sm">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-[#D8D4CB] bg-[#E3DFD5] text-[#2A2926] text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-bold">Paper Title & Authors</th>
                  <th className="py-3 px-3">Year / Venue</th>
                  <th className="py-3 px-3">Core Contribution</th>
                  <th className="py-3 px-3">Class</th>
                  <th className="py-3 px-4 text-right">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8D4CB] text-[#2A2926]">
                {PAPER_LANDSCAPE.map((paper, idx) => (
                  <tr key={idx} className="hover:bg-[#E7E3D9] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-serif font-medium text-sm text-[#151515]">{paper.title}</div>
                      <div className="text-[11px] text-[#716F68] font-sans mt-0.5">{paper.authors}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="rounded bg-[#F4F1EA] border border-[#D8D4CB] px-2 py-0.5 text-[10px] text-[#2A2926] font-semibold">
                        {paper.year} · {paper.venue}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-sans text-xs text-[#2A2926] max-w-xs leading-relaxed">
                      {paper.conceptContribution}
                    </td>
                    <td className="py-3.5 px-3">
                      <SourceBadge type="primary" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <a
                        href={paper.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-[11px] text-[#6842C2] font-semibold hover:underline"
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
        <div className="rounded-xl border border-[#D8D4CB] bg-[#ECE8DF] p-6 space-y-3 font-mono text-xs shadow-sm">
          <div className="font-mono text-xs font-bold uppercase text-[#151515] tracking-wider">
            Official Research Repositories & Specifications:
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {OFFICIAL_SOURCES.map((src, i) => (
              <a
                key={i}
                href={src.url}
                target="_blank"
                rel="noreferrer"
                className="group rounded-lg border border-[#D8D4CB] bg-[#F4F1EA] p-4 transition-all hover:border-[#6842C2] hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-[#167C80]">{src.venue}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#716F68] group-hover:text-[#6842C2] transition-colors" />
                </div>
                <div className="mt-1 font-serif text-sm font-medium text-[#151515] group-hover:text-[#6842C2] transition-colors">
                  {src.title}
                </div>
                <p className="mt-1 text-[11px] text-[#716F68] font-sans line-clamp-2 leading-relaxed">
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

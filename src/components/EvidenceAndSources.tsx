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
    <section id="evidence-sources" className="scroll-mt-20 border-t border-[var(--border)] bg-[var(--page-bg)] text-[var(--text-primary)] py-12 space-y-12">
      <SectionHeader
        number="11"
        category="Bibliography & Provenance"
        title="Research Evidence & Epistemic Dossier"
        subtitle="All mathematical definitions, recurrent state equations, and complexity proofs across this laboratory are explicitly grounded in peer-reviewed literature, primary technical preprints, and verifiable toy formulations."
        discovery="Decoupling claims into primary academic literature, official benchmarks, and toy computational models preserves strict epistemic rigor."
      />

      {/* 4-Level Epistemic Evidence Ladder */}
      <EvidenceLadder />

      {/* Primary Source Dossier */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
          <h3 className="font-serif text-xl sm:text-2xl font-normal text-[var(--text-primary)] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[var(--color-accent-ink)]" />
            <span>Primary Recurrent & BDH Bibliography</span>
          </h3>
          <span className="font-mono text-xs text-[var(--text-muted)]">
            Annotated canonical citations [1]–[{RESEARCH_SOURCES.length}]
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
          {RESEARCH_SOURCES.map((src, idx) => (
            <div
              key={src.id}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col justify-between space-y-4 hover:border-[var(--color-border-strong)] transition-colors"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[var(--accent-blue)] border border-[var(--border)] text-[var(--color-accent-ink)]">
                    [{idx + 1}] {src.badge}
                  </span>
                  <span className="text-xs font-medium text-[var(--text-muted)]">{src.year}</span>
                </div>

                <h4 className="font-sans font-semibold text-sm text-[var(--text-primary)] leading-snug">
                  {src.title}
                </h4>
                <div className="text-xs text-[var(--text-muted)] font-sans italic">
                  {src.authors}
                </div>

                <div className="pt-2.5 border-t border-[var(--border)] space-y-1">
                  <span className="text-xs text-[var(--color-warning)] block font-semibold">
                    Empirical & theoretical basis
                  </span>
                  <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
                    {src.whatItSupports}
                  </p>
                </div>
              </div>

              <div className="pt-2.5 border-t border-[var(--border)] flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)] capitalize">{src.type} source</span>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--color-accent-ink)] hover:underline flex items-center gap-1 font-semibold"
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
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-2">
          <h3 className="font-serif text-xl sm:text-2xl font-normal text-[var(--text-primary)]">
            Comparative Academic Landscape (2022–2026)
          </h3>
          <span className="font-mono text-xs text-[var(--text-muted)]">
            Peer-reviewed & technical reports
          </span>
        </div>

        <div className="research-table-wrap bg-[var(--surface)]">
          <table className="research-table w-full text-left text-xs font-mono">
            <thead className="border-b border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-secondary)] text-xs">
              <tr>
                <th className="py-3 px-4 font-semibold">Paper Title & Authors</th>
                <th className="py-3 px-3 font-semibold">Year / Venue</th>
                <th className="py-3 px-3 font-semibold">Core Contribution</th>
                <th className="py-3 px-3 font-semibold">Class</th>
                <th className="py-3 px-4 text-right font-semibold">Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-[var(--text-secondary)]">
              {PAPER_LANDSCAPE.map((paper, idx) => (
                <tr key={idx} className="hover:bg-[var(--surface-soft)] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-sans font-semibold text-sm text-[var(--text-primary)]">{paper.title}</div>
                    <div className="text-xs text-[var(--text-muted)] font-sans mt-0.5">{paper.authors}</div>
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="rounded bg-[var(--surface-soft)] border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--text-primary)] font-medium">
                      {paper.year} · {paper.venue}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-sans text-xs text-[var(--text-secondary)] max-w-xs leading-relaxed">
                    {paper.conceptContribution}
                  </td>
                  <td className="py-3.5 px-3">
                    <SourceBadge type="primary" />
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <a
                      href={paper.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-xs text-[var(--color-accent-ink)] font-semibold hover:underline"
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
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 space-y-4 font-mono text-xs">
        <div className="text-xs font-semibold text-[var(--text-primary)]">
          Official research repositories & specifications
        </div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {OFFICIAL_SOURCES.map((src, i) => (
            <a
              key={i}
              href={src.url}
              target="_blank"
              rel="noreferrer"
              className="group rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] p-4 transition-colors hover:border-[var(--color-accent)]"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-[var(--color-success)]">{src.venue}</span>
                <ExternalLink className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--color-accent-ink)] transition-colors" />
              </div>
              <div className="mt-1 font-sans text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-accent-ink)] transition-colors">
                {src.title}
              </div>
              <p className="mt-1 text-xs text-[var(--text-secondary)] font-sans line-clamp-2 leading-relaxed">
                {src.description}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

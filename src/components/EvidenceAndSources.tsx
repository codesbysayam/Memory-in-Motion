import React from 'react';
import { ExternalLink, BookOpen } from 'lucide-react';
import { OFFICIAL_SOURCES, PAPER_LANDSCAPE } from '../data/sources';
import { RESEARCH_SOURCES } from '../data/researchSources';
import { SectionHeader } from './ui/SectionHeader';
import { SourceBadge } from './ui/SourceBadge';
import { EvidenceLadder } from './EvidenceLadder';

export const EvidenceAndSources: React.FC = () => {
  return (
    <section id="evidence-sources" className="scroll-mt-20 border-t border-[var(--mm-rule)] bg-[var(--page-bg)] text-[var(--mm-ink)] py-12 space-y-12">
      <SectionHeader
        number="07.5"
        category="Bibliography & Provenance"
        title="Research Evidence & Epistemic Dossier"
        subtitle="All mathematical definitions, recurrent state equations, and complexity proofs across this visual essay are grounded in peer-reviewed literature, primary preprints, and deterministic toy models."
        discovery="Decoupling claims into primary academic literature, official benchmarks, and toy computational models preserves strict epistemic rigor."
      />

      {/* 4-Level Epistemic Evidence Ladder */}
      <EvidenceLadder />

      {/* Primary Source Dossier */}
      <div className="space-y-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--mm-rule)] pb-3">
          <h3 className="font-serif text-xl sm:text-2xl font-medium text-[var(--mm-ink)] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[var(--mm-signal)]" />
            <span>Primary Recurrent &amp; BDH Bibliography</span>
          </h3>
          <span className="font-mono text-xs text-[var(--mm-muted)] tabular-nums">
            Annotated canonical citations [1]–[{RESEARCH_SOURCES.length}]
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-y border-[var(--mm-rule)] divide-y md:divide-x divide-[var(--mm-rule)] font-mono text-xs">
          {RESEARCH_SOURCES.map((src, idx) => (
            <div
              key={src.id}
              className="p-5 flex flex-col justify-between space-y-4 bg-[var(--mm-paper-bright)]"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--mm-signal)]">
                    [{idx + 1}] {src.badge}
                  </span>
                  <span className="text-xs font-medium text-[var(--mm-muted)] tabular-nums">{src.year}</span>
                </div>

                <h4 className="font-sans font-semibold text-sm text-[var(--mm-ink)] leading-snug">
                  {src.title}
                </h4>
                <div className="text-xs text-[var(--mm-muted)] font-sans italic">
                  {src.authors}
                </div>

                <div className="pt-2.5 border-t border-[var(--mm-rule)] space-y-1">
                  <span className="text-[11px] uppercase tracking-[0.05em] text-[var(--mm-amber)] block font-semibold">
                    Empirical &amp; theoretical basis
                  </span>
                  <p className="text-xs text-[var(--mm-ink-soft)] font-sans leading-relaxed">
                    {src.whatItSupports}
                  </p>
                </div>
              </div>

              <div className="pt-2.5 border-t border-[var(--mm-rule)] flex items-center justify-between text-xs">
                <span className="text-[var(--mm-muted)] capitalize">{src.type} source</span>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--mm-signal)] hover:underline flex items-center gap-1 font-semibold"
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
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--mm-rule)] pb-2">
          <h3 className="font-serif text-xl sm:text-2xl font-medium text-[var(--mm-ink)]">
            Comparative Academic Landscape (2022–2026)
          </h3>
          <span className="font-mono text-xs text-[var(--mm-muted)]">
            Peer-reviewed &amp; technical reports
          </span>
        </div>

        <div className="research-table-wrap">
          <table className="research-table w-full text-left text-xs font-mono">
            <thead>
              <tr>
                <th>Paper Title &amp; Authors</th>
                <th>Year / Venue</th>
                <th>Core Contribution</th>
                <th>Class</th>
                <th className="text-right">Link</th>
              </tr>
            </thead>
            <tbody>
              {PAPER_LANDSCAPE.map((paper, idx) => (
                <tr key={idx}>
                  <td>
                    <div className="font-sans font-semibold text-sm text-[var(--mm-ink)]">{paper.title}</div>
                    <div className="text-xs text-[var(--mm-muted)] font-sans mt-0.5">{paper.authors}</div>
                  </td>
                  <td className="whitespace-nowrap font-mono text-xs text-[var(--mm-ink-soft)] tabular-nums">
                    {paper.year} · {paper.venue}
                  </td>
                  <td className="font-sans text-xs text-[var(--mm-ink-soft)] max-w-xs leading-relaxed">
                    {paper.conceptContribution}
                  </td>
                  <td>
                    <SourceBadge type="primary" />
                  </td>
                  <td className="text-right whitespace-nowrap">
                    <a
                      href={paper.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-xs text-[var(--mm-signal)] font-semibold hover:underline"
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

      {/* Official Sources Reference List */}
      <div className="space-y-4 font-mono text-xs">
        <div className="essay-eyebrow font-semibold">
          Official research repositories &amp; specifications
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-y border-[var(--mm-rule)] divide-y sm:divide-x divide-[var(--mm-rule)] bg-[var(--mm-paper-bright)]">
          {OFFICIAL_SOURCES.map((src, i) => (
            <a
              key={i}
              href={src.url}
              target="_blank"
              rel="noreferrer"
              className="group p-4 transition-colors hover:bg-[var(--page-bg)]"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-[var(--color-success)]">{src.venue}</span>
                <ExternalLink className="w-3.5 h-3.5 text-[var(--mm-muted)] group-hover:text-[var(--mm-signal)] transition-colors" />
              </div>
              <div className="mt-1 font-sans text-sm font-semibold text-[var(--mm-ink)] group-hover:text-[var(--mm-signal)] transition-colors">
                {src.title}
              </div>
              <p className="mt-1 text-xs text-[var(--mm-ink-soft)] font-sans line-clamp-2 leading-relaxed">
                {src.description}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};


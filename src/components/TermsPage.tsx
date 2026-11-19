import React from 'react';
import { FileText, ArrowLeft, BookOpen, AlertTriangle, Scale, ShieldCheck, Mail } from 'lucide-react';

interface TermsPageProps {
  onBackToLab?: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onBackToLab }) => {
  return (
    <div className="w-full bg-[var(--page-bg)] min-h-[calc(100vh-60px)] font-sans text-[var(--text-primary)]">
      {/* Top Banner Header */}
      <div className="border-b border-[var(--border)] bg-[var(--surface-soft)]">
        <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-4">
          <button
            type="button"
            onClick={onBackToLab}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--page-bg)] border border-[var(--border)] text-xs font-medium text-[var(--text-primary)] transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Research Lab</span>
          </button>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-[var(--color-accent-ink)] font-semibold">
                Legal agreement
              </span>
              <span className="text-[var(--text-muted)]">·</span>
              <span className="text-[var(--text-muted)]">Terms of service</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[var(--text-primary)] tracking-tight">
              Terms of Service
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl leading-relaxed">
              Standard terms of use for the Memory in Motion interactive scientific research and pedagogical laboratory.
            </p>
          </div>
        </div>
      </div>

      {/* Main Legal Content */}
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-10 space-y-8 leading-relaxed text-sm sm:text-base text-[var(--text-secondary)]">
        {/* Core Notice Callout */}
        <div className="p-5 rounded-xl bg-[var(--accent-blue)] border border-[var(--border)] space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-accent-ink)]">
            <BookOpen className="w-5 h-5 shrink-0" />
            <span>Educational Research License &amp; Dissemination</span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--color-accent-ink)] leading-relaxed">
            This application is offered free of charge as an open interactive educational simulator for computational neuroscience and recurrent neural network architectures.
          </p>
        </div>

        <div className="space-y-3">
          <span className="text-xs font-mono text-[var(--text-muted)] font-medium block">
            Last Updated: March 2026 · Canonical Version 1.0
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-normal text-[var(--text-primary)]">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using the Memory in Motion web application, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you should discontinue use of the simulator.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <h2 className="text-xl sm:text-2xl font-serif font-normal text-[var(--text-primary)]">
            2. Permitted Use &amp; Academic Exploration
          </h2>
          <p>
            You are granted a non-exclusive, revocable license to interact with the visualizations, inspect source formulations, evaluate 60-second test challenges, and download personalized completion certificates for academic, self-study, or research presentation purposes.
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-[var(--text-secondary)] pl-2">
            <li>You may cite and share findings from the interactive lab in academic curricula or publications.</li>
            <li>You may not attempt to reverse engineer backend infrastructure or disrupt hosting availability.</li>
            <li>You may not misrepresent generated toy model calculations as full-scale production BDH benchmark results.</li>
          </ul>
        </div>

        <div className="space-y-3 pt-2">
          <h2 className="text-xl sm:text-2xl font-serif font-normal text-[var(--text-primary)]">
            3. Scientific Attribution &amp; Research Papers
          </h2>
          <p>
            Concepts describing the Dragon Hatchling (BDH) architecture, scale-free particle graph dynamics, and recurrent latent computation reference research published by Pathway and collaborating authors:
          </p>
          <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs sm:text-sm font-mono space-y-1">
            <div className="font-semibold text-[var(--text-primary)]">Primary Research Reference:</div>
            <div className="text-[var(--color-accent-ink)]">Pathway BDH: Dragon Hatchling Architecture (arXiv:2509.26507)</div>
            <div className="text-[var(--text-muted)] text-xs">Official Repository: github.com/pathwaycom/bdh</div>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <h2 className="text-xl sm:text-2xl font-serif font-normal text-[var(--text-primary)]">
            4. Disclaimer of Warranties
          </h2>
          <div className="p-4 rounded-xl bg-[var(--color-warning-soft)] border border-[var(--color-warning-border)] space-y-2 text-xs sm:text-sm text-[var(--color-warning)]">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Educational Toy Model Abstraction Notice</span>
            </div>
            <p className="leading-relaxed">
              The matrix simulations and particle physics representations provided in this application are simplified educational models designed to cultivate intuitive geometric understanding of associative interference. They are provided &ldquo;as is&rdquo; without warranties of mathematical completeness or commercial fitness.
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <h2 className="text-xl sm:text-2xl font-serif font-normal text-[var(--text-primary)]">
            5. Limitation of Liability
          </h2>
          <p>
            In no event shall the authors, contributors, or hosting providers be liable for any direct, indirect, incidental, or consequential damages arising from the use or inability to use this educational simulator.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <h2 className="text-xl sm:text-2xl font-serif font-normal text-[var(--text-primary)]">
            6. Contact Information
          </h2>
          <p>
            For legal notices, educational licensing queries, or research collaborations, please contact:
          </p>
          <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center gap-3">
            <Mail className="w-5 h-5 text-[var(--color-accent-ink)] shrink-0" />
            <div className="text-xs sm:text-sm">
              <strong className="text-[var(--text-primary)] block">Legal Inquiries &amp; Academic Inquiries</strong>
              <a
                href="mailto:obsidianoptics.in@gmail.com"
                className="text-[var(--color-accent-ink)] hover:underline font-mono text-xs"
              >
                obsidianoptics.in@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Return Button */}
        <div className="pt-6 border-t border-[var(--border)] flex items-center justify-between">
          <span className="text-xs font-mono text-[var(--text-muted)]">
            Memory in Motion · Scientific Laboratory
          </span>
          <button
            type="button"
            onClick={onBackToLab}
            className="px-5 py-2.5 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--surface)] text-xs font-semibold transition cursor-pointer"
          >
            Return to Laboratory
          </button>
        </div>
      </div>
    </div>
  );
};

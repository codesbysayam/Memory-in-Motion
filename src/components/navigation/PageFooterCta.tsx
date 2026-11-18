import React from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { PageId } from './ResearchNav';

interface PageFooterCtaProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  nextPage?: PageId;
  prevPage?: PageId;
  nextTitle?: string;
  ctaText: string;
  subtext?: string;
  onOpenShortcuts?: () => void;
}

export const PageFooterCta: React.FC<PageFooterCtaProps> = ({
  onNavigate,
  nextPage,
  prevPage,
  ctaText,
  subtext,
  onOpenShortcuts,
}) => {
  const handleNext = () => {
    if (nextPage) {
      onNavigate(nextPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (prevPage) {
      onNavigate(prevPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenHelp = () => {
    if (onOpenShortcuts) {
      onOpenShortcuts();
    } else {
      window.dispatchEvent(new CustomEvent('open_shortcuts_help'));
    }
  };

  return (
    <footer className="w-full border-t border-[var(--mm-rule)] bg-[var(--page-bg)] py-10 mt-16 no-print">
      <div className="research-container space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Previous stage link */}
          {prevPage ? (
            <button
              type="button"
              onClick={handlePrev}
              className="btn-tertiary text-sm cursor-pointer px-0 hover:bg-transparent hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous stage</span>
            </button>
          ) : (
            <div />
          )}

          {/* Next stage CTA */}
          {nextPage && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 text-left sm:text-right">
              {subtext && (
                <span className="text-sm text-[var(--text-secondary)] font-sans max-w-md">
                  {subtext}
                </span>
              )}
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary text-sm cursor-pointer shrink-0 whitespace-nowrap"
              >
                <span>{ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Hairline Sub-footer with quiet keyboard navigation reference */}
        <div className="border-t border-[var(--mm-rule)] pt-5 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[var(--text-muted)]">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>Memory in Motion · Visual Research Essay</span>
            <span aria-hidden="true" className="text-[var(--mm-rule-strong)]">·</span>
            <button
              type="button"
              onClick={handleOpenHelp}
              className="text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline cursor-pointer"
              title="Open keyboard shortcuts reference"
            >
              Keys: N next · P prev · G glossary · ? help
            </button>
          </div>
          <div className="flex items-center gap-3 font-sans">
            <a
              href="/privacy"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('privacy');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[var(--text-primary)] hover:underline cursor-pointer"
            >
              Privacy Policy
            </a>
            <span aria-hidden="true" className="text-[var(--mm-rule-strong)]">·</span>
            <a
              href="/terms"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('terms');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[var(--text-primary)] hover:underline cursor-pointer"
            >
              Terms of Use
            </a>
            <span aria-hidden="true" className="text-[var(--mm-rule-strong)]">·</span>
            <a
              href="/docs"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('docs');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[var(--text-primary)] hover:underline cursor-pointer"
            >
              Docs
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

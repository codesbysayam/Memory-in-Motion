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
}

export const PageFooterCta: React.FC<PageFooterCtaProps> = ({
  onNavigate,
  nextPage,
  prevPage,
  ctaText,
  subtext,
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

  return (
    <div className="w-full border-t border-[var(--border)] bg-[var(--surface-soft)] py-8 mt-14 no-print">
      <div className="research-container space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Previous stage button */}
          {prevPage ? (
            <button
              onClick={handlePrev}
              className="btn-tertiary text-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous stage</span>
            </button>
          ) : (
            <div />
          )}

          {/* Next stage CTA */}
          {nextPage && (
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-right">
              {subtext && (
                <span className="text-xs text-[var(--text-secondary)] font-sans">
                  {subtext}
                </span>
              )}
              <button
                onClick={handleNext}
                className="btn-primary text-sm cursor-pointer"
              >
                <span>{ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Legal & Disclosures Sub-footer */}
        <div className="border-t border-[var(--border)] pt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[var(--text-muted)]">
          <span>Memory in Motion · Interactive Research &amp; Pedagogical Laboratory</span>
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
            <span aria-hidden="true" className="text-[var(--border)]">·</span>
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
            <span aria-hidden="true" className="text-[var(--border)]">·</span>
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
    </div>
  );
};

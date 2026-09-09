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
    <div className="w-full border-t border-[#E5E0D8] bg-[#F4F1EA] py-10 px-4 sm:px-6 mt-12 no-print">
      <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Previous stage button */}
        {prevPage ? (
          <button
            onClick={handlePrev}
            className="flex items-center gap-2 text-xs font-sans text-[#716F68] hover:text-[#151515] py-2 px-3 rounded-lg hover:bg-[#FAF8F5] transition-all cursor-pointer"
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
              <span className="text-xs text-[#716F68] font-sans">
                {subtext}
              </span>
            )}
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[#6842C2] hover:bg-[#5735A8] text-white font-sans text-sm font-semibold transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <span>{ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { ArrowLeft, Compass } from 'lucide-react';

interface NotFoundPageProps {
  onReturnToMemory: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onReturnToMemory }) => {
  return (
    <div
      id="custom-404-page"
      className="min-h-[80vh] flex items-center justify-center p-6 bg-[#FBF9F5] text-[#1C1B19] font-sans"
    >
      <div className="w-full max-w-md text-center space-y-6 p-8 rounded-2xl border border-[#E5E0D8] bg-white shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-[#EAF2FA] border border-[#CDE1F2] flex items-center justify-center mx-auto text-[#1B4D7E]">
          <Compass className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <div className="font-mono text-xs font-bold text-[#1B4D7E] tracking-wider uppercase bg-[#EAF2FA] px-2.5 py-1 rounded inline-block border border-[#CDE1F2]">
            Status 404 · Unmapped Coordinate
          </div>
          <h1 className="text-5xl sm:text-6xl font-serif font-bold text-[#1C1B19] tracking-tight">
            404
          </h1>
          <p className="text-base sm:text-lg text-[#55524B] font-serif">
            This page is not part of the experiment.
          </p>
        </div>

        <p className="text-xs text-[#726E65] font-sans max-w-xs mx-auto leading-relaxed">
          The requested coordinate lies outside the 7 experimental stages and documentation specifications.
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={onReturnToMemory}
            className="w-full py-3 px-4 rounded-xl bg-[#1B4D7E] hover:bg-[#153E65] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Memory</span>
          </button>
        </div>
      </div>
    </div>
  );
};

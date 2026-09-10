import React from 'react';
import { CertificateData } from '../utils/certificatePdf';
import { LogoMark } from './ui/LogoMark';

interface CertificateDocumentProps {
  data: CertificateData;
  className?: string;
}

/**
 * Single canonical source of truth for the Certificate of Completion.
 * Adheres strictly to A4 portrait proportions (210mm x 297mm) with 16mm safe margins.
 * Used for on-screen preview, modal display, and browser print.
 */
export const CertificateDocument: React.FC<CertificateDocumentProps> = ({ data, className = '' }) => {
  const name = data.learnerName.trim() || 'Learner';
  const certId = data.certificateId || 'MEM-2026-CAPSTONE';
  const dateStr =
    data.dateIssued ||
    new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  const milestones = data.milestonesCount ?? 8;
  const total = data.totalMilestones ?? 8;
  const finalChallengeStatus = data.finalChallengeStatus || 'Verified & Completed';

  // Fluid font size for learner name to prevent overflow for long names
  const getNameSizeClass = (len: number) => {
    if (len > 30) return 'text-lg sm:text-xl md:text-2xl';
    if (len > 22) return 'text-xl sm:text-2xl md:text-3xl';
    return 'text-2xl sm:text-3xl md:text-4xl';
  };

  return (
    <div
      id="certificate-document"
      className={`certificate-page relative w-full max-w-[620px] aspect-[210/297] mx-auto bg-[#FBF9F5] text-[#151515] p-6 sm:p-10 flex flex-col justify-between select-none shadow-md rounded-lg overflow-hidden border border-[#D8D4CB] print:shadow-none print:max-w-none print:w-[210mm] print:h-[297mm] print:rounded-none print:border-none ${className}`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* Outer Border (Strict 16mm safe margin) */}
      <div className="absolute inset-4 sm:inset-5 border border-[#D8D4CB] pointer-events-none rounded-sm">
        {/* Inner Restrained Accent Border (18.5mm equivalent) */}
        <div className="absolute inset-1.5 border border-[#6842C2]/35 pointer-events-none">
          {/* Corner tick accents */}
          <div className="absolute -top-[1px] -left-[1px] w-2.5 h-2.5 border-t-2 border-l-2 border-[#6842C2]" />
          <div className="absolute -top-[1px] -right-[1px] w-2.5 h-2.5 border-t-2 border-r-2 border-[#6842C2]" />
          <div className="absolute -bottom-[1px] -left-[1px] w-2.5 h-2.5 border-b-2 border-l-2 border-[#6842C2]" />
          <div className="absolute -bottom-[1px] -right-[1px] w-2.5 h-2.5 border-b-2 border-r-2 border-[#6842C2]" />
        </div>
      </div>

      {/* Top Header & Logo Mark */}
      <div className="text-center pt-2 sm:pt-4 space-y-2 relative z-10">
        <div className="flex justify-center">
          <LogoMark size={36} variant="purple" />
        </div>
        <p className="text-[9.5px] sm:text-[10.5px] font-sans font-semibold tracking-widest text-[#716F68] uppercase">
          Memory in Motion · Interactive Scientific Laboratory
        </p>
      </div>

      {/* Central Content */}
      <div className="text-center space-y-3 sm:space-y-4 px-3 sm:px-6 relative z-10 my-auto">
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold tracking-tight text-[#151515]">
            CERTIFICATE OF COMPLETION
          </h2>
          <div className="w-16 sm:w-20 h-px bg-[#D8D4CB] mx-auto" />
        </div>

        <div className="space-y-1 sm:space-y-2 pt-1">
          <p className="text-xs sm:text-sm font-serif italic text-[#716F68]">
            This certifies that
          </p>
          <div
            className={`font-serif font-bold text-[#151515] tracking-wide break-words px-2 leading-tight ${getNameSizeClass(
              name.length
            )}`}
          >
            {name}
          </div>
          <div className="w-32 sm:w-48 h-px bg-[#E5E0D8] mx-auto mt-1" />
        </div>

        <div className="space-y-1 pt-1">
          <p className="text-[11px] sm:text-xs text-[#52504A] font-sans">
            has completed
          </p>
          <p className="text-xs sm:text-sm font-sans font-bold text-[#151515] tracking-wide uppercase">
            IN-CONTEXT LEARNING WITH RECURRENT MEMORY
          </p>
          <p className="text-[10.5px] sm:text-xs text-[#52504A] font-serif italic max-w-[440px] mx-auto leading-relaxed pt-1">
            "An interactive laboratory exploring recurrent state, retrieval, interference and its connection to BDH."
          </p>
        </div>

        {/* Verification Metadata Box */}
        <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg py-2.5 px-3 sm:px-4 max-w-[460px] mx-auto space-y-1 text-center font-mono">
          <div className="grid grid-cols-2 gap-1 text-[9px] sm:text-[10px] text-[#52504A] text-left px-2">
            <div>
              <span className="text-[#716F68]">Completion ID: </span>
              <strong className="text-[#6842C2]">{certId}</strong>
            </div>
            <div>
              <span className="text-[#716F68]">Date Issued: </span>
              <strong className="text-[#151515]">{dateStr}</strong>
            </div>
            <div>
              <span className="text-[#716F68]">Experiments Completed: </span>
              <strong className="text-[#287C7C]">{milestones} / {total}</strong>
            </div>
            <div>
              <span className="text-[#716F68]">Final Challenge: </span>
              <strong className="text-[#247A4B]">{finalChallengeStatus}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Attestation & Honest Disclaimer */}
      <div className="pt-2 sm:pt-4 relative z-10 space-y-2">
        <div className="flex items-center justify-between px-4 sm:px-10 pb-2 border-t border-[#D8D4CB] text-[9px] sm:text-[10px] pt-3 font-sans">
          <div className="text-left">
            <span className="block font-bold text-[#151515]">ISSUED DATE</span>
            <span className="font-mono text-[#716F68]">{dateStr}</span>
          </div>
          <div className="text-right">
            <span className="block font-bold text-[#151515]">LABORATORY ATTESTATION</span>
            <span className="font-mono text-[#716F68]">Deterministic In-Browser Engine</span>
          </div>
        </div>

        {/* Honest Disclaimer */}
        <p className="text-[8px] sm:text-[8.5px] font-sans italic text-[#8C8982] text-center pb-1">
          Educational completion certificate — not an institutional or professional certification.
        </p>
      </div>
    </div>
  );
};


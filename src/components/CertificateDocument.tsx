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
      className={`certificate-print-wrapper certificate-page relative w-full max-w-[620px] aspect-[210/297] mx-auto bg-[#F7FAF4] text-[#0C130F] p-6 sm:p-10 print:p-[16mm] flex flex-col justify-between select-none shadow-md rounded-lg overflow-hidden border border-[#CBD5C7] print:shadow-none print:max-w-none print:w-[210mm] print:h-[297mm] print:rounded-none print:border-none ${className}`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* Outer Border (Strict 16mm safe margin) */}
      <div className="absolute inset-4 sm:inset-5 print:inset-[16mm] border border-[#CBD5C7] pointer-events-none rounded-sm">
        {/* Inner Restrained Accent Border (18.5mm equivalent) */}
        <div className="absolute inset-1.5 print:inset-[2.5mm] border border-[#CBD5C7] pointer-events-none">
          {/* Corner tick accents */}
          <div className="absolute -top-[1px] -left-[1px] w-2.5 h-2.5 border-t-2 border-l-2 border-[#38600A]" />
          <div className="absolute -top-[1px] -right-[1px] w-2.5 h-2.5 border-t-2 border-r-2 border-[#38600A]" />
          <div className="absolute -bottom-[1px] -left-[1px] w-2.5 h-2.5 border-b-2 border-l-2 border-[#38600A]" />
          <div className="absolute -bottom-[1px] -right-[1px] w-2.5 h-2.5 border-b-2 border-r-2 border-[#38600A]" />
        </div>
      </div>

      {/* Top Header & Logo Mark */}
      <div className="text-center pt-2 sm:pt-4 space-y-2 relative z-10">
        <div className="flex justify-center">
          <LogoMark size={36} variant="soft-blue" />
        </div>
        <p className="text-[9.5px] sm:text-[10.5px] font-sans font-semibold tracking-widest text-[#49574D] uppercase">
          Memory in Motion · Interactive Scientific Laboratory
        </p>
      </div>

      {/* Central Content */}
      <div className="text-center space-y-3 sm:space-y-4 px-3 sm:px-6 relative z-10 my-auto">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold tracking-tight text-[#0C130F]">
            CERTIFICATE OF COMPLETION
          </h2>
          <div className="w-16 sm:w-20 h-0.5 bg-[#4A7C10] mx-auto" />
        </div>

        <div className="space-y-1 sm:space-y-2 pt-1">
          <p className="text-xs sm:text-sm font-sans font-medium text-[#49574D]">
            This certifies that
          </p>
          <div
            className={`font-display font-semibold text-[#0C130F] tracking-tight break-words px-2 leading-tight ${getNameSizeClass(
              name.length
            )}`}
          >
            {name}
          </div>
          <div className="w-32 sm:w-48 h-px bg-[#CBD5C7] mx-auto mt-1" />
        </div>

        <div className="space-y-1 pt-1">
          <p className="text-xs text-[#49574D] font-sans">
            has completed
          </p>
          <p className="text-xs sm:text-sm font-sans font-bold text-[#0C130F] tracking-wide uppercase">
            IN-CONTEXT LEARNING WITH RECURRENT MEMORY
          </p>
          <p className="text-xs text-[#49574D] font-sans max-w-[440px] mx-auto leading-relaxed pt-1">
            &ldquo;An interactive laboratory exploring recurrent state, retrieval, interference and its connection to BDH.&rdquo;
          </p>
        </div>

        {/* Verification Metadata Box */}
        <div className="bg-[#FFFFFF] border border-[#CBD5C7] rounded-lg py-2.5 px-3 sm:px-4 max-w-[460px] mx-auto space-y-1 text-center font-mono">
          <div className="grid grid-cols-2 gap-1 text-xs text-[#0C130F] text-left px-2">
            <div>
              <span className="text-[#49574D]">Completion ID: </span>
              <strong className="text-[#38600A]">{certId}</strong>
            </div>
            <div>
              <span className="text-[#475569]">Date Issued: </span>
              <strong className="text-[#0B1528]">{dateStr}</strong>
            </div>
            <div>
              <span className="text-[#475569]">Experiments Completed: </span>
              <strong className="text-[#047857]">{milestones} / {total}</strong>
            </div>
            <div>
              <span className="text-[#475569]">Final Challenge: </span>
              <strong className="text-[#047857]">{finalChallengeStatus}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Attestation & Honest Disclaimer */}
      <div className="pt-2 sm:pt-4 relative z-10 space-y-2">
        <div className="flex items-center justify-between px-4 sm:px-10 pb-2 border-t border-[#CBD5E1] text-xs pt-3 font-sans">
          <div className="text-left">
            <span className="block font-bold text-[#0B1528]">ISSUED DATE</span>
            <span className="font-mono text-[#475569]">{dateStr}</span>
          </div>
          <div className="text-right">
            <span className="block font-bold text-[#0B1528]">LABORATORY ATTESTATION</span>
            <span className="font-mono text-[#475569]">Deterministic In-Browser Engine</span>
          </div>
        </div>

        {/* Honest Disclaimer */}
        <p className="text-xs font-sans text-[#475569] text-center pb-1">
          Educational completion certificate — not an institutional or professional certification.
        </p>
      </div>
    </div>
  );
};


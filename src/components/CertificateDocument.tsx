import React from 'react';
import { CertificateData } from '../utils/certificatePdf';

interface CertificateDocumentProps {
  data: CertificateData;
  className?: string;
}

/**
 * Single source of truth for the Certificate of Completion visual document.
 * Adheres strictly to A4 portrait proportions (210mm x 297mm).
 * Used for both on-screen preview and browser print.
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

  // Responsive font size for learner name
  const getNameSizeClass = (len: number) => {
    if (len > 28) return 'text-lg sm:text-xl md:text-2xl';
    if (len > 18) return 'text-xl sm:text-2xl md:text-3xl';
    return 'text-2xl sm:text-3xl md:text-4xl';
  };

  return (
    <div
      className={`relative w-full max-w-[620px] aspect-[210/297] mx-auto bg-[#FBF9F5] text-[#151515] p-6 sm:p-10 flex flex-col justify-between select-none shadow-md rounded-lg overflow-hidden border border-[#D8D4CB] print:shadow-none print:max-w-none print:w-[210mm] print:h-[297mm] print:rounded-none print:border-none ${className}`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* Outer Border (14mm equivalent) */}
      <div className="absolute inset-3 sm:inset-4 border border-[#D8D4CB] pointer-events-none rounded-sm">
        {/* Inner Restrained Violet Border (16.5mm equivalent) */}
        <div className="absolute inset-1 border border-[#6842C2] pointer-events-none opacity-85">
          {/* Corner tick marks */}
          <div className="absolute -top-[1px] -left-[1px] w-2.5 h-2.5 border-t-2 border-l-2 border-[#6842C2]" />
          <div className="absolute -top-[1px] -right-[1px] w-2.5 h-2.5 border-t-2 border-r-2 border-[#6842C2]" />
          <div className="absolute -bottom-[1px] -left-[1px] w-2.5 h-2.5 border-b-2 border-l-2 border-[#6842C2]" />
          <div className="absolute -bottom-[1px] -right-[1px] w-2.5 h-2.5 border-b-2 border-r-2 border-[#6842C2]" />
        </div>
      </div>

      {/* Top Header */}
      <div className="text-center pt-2 sm:pt-4 space-y-1 relative z-10">
        <p className="text-[9px] sm:text-[10px] font-sans font-bold tracking-widest text-[#716F68] uppercase">
          DataForge 2026 · Pathway Track
        </p>
        <p className="text-[11px] sm:text-xs font-serif italic text-[#167C80]">
          Memory in Motion · Interactive Research Laboratory
        </p>
      </div>

      {/* Central Content */}
      <div className="text-center space-y-3 sm:space-y-4 px-2 sm:px-6 relative z-10 my-auto">
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
          <div className={`font-serif font-bold text-[#151515] tracking-wide break-words px-2 leading-tight ${getNameSizeClass(name.length)}`}>
            {name}
          </div>
          <div className="w-32 sm:w-48 h-px bg-[#E5E0D8] mx-auto mt-1" />
        </div>

        <div className="space-y-1 pt-1">
          <p className="text-[11px] sm:text-xs text-[#52504A] font-sans">
            has completed the interactive learning laboratory on
          </p>
          <p className="text-xs sm:text-sm font-sans font-bold text-[#151515] tracking-wide uppercase">
            In-Context Learning with Recurrent Memory
          </p>
          <p className="text-[10px] sm:text-xs text-[#52504A] font-sans max-w-[440px] mx-auto leading-relaxed pt-1">
            exploring fixed-size recurrent state, associative retrieval, representational capacity bounds, coordinate interference, and the connection to the Dragon Hatchling (BDH) architecture.
          </p>
        </div>

        {/* Verification Metadata Box */}
        <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg py-2 px-3 sm:px-4 max-w-[460px] mx-auto space-y-1 text-center font-mono">
          <p className="text-[9px] sm:text-[10.5px] font-bold text-[#6842C2]">
            COMPLETION ID: {certId} &nbsp;·&nbsp; MILESTONES: {milestones}/{total}
          </p>
          <p className="text-[8.5px] sm:text-[9.5px] font-medium text-[#167C80]">
            EVALUATION: FULLY VERIFIED &nbsp;·&nbsp; STATUS: COMPLETED
          </p>
        </div>

        {/* Quiet Equation Identity */}
        <p className="text-[9px] sm:text-[10px] font-serif italic text-[#8C8982]">
          State Law: M_(t+1) = λ M_t + η k_t v_t^T &nbsp;·&nbsp; Readout: v̂ = q^T M
        </p>
      </div>

      {/* Footer Attestation & Signatures */}
      <div className="pt-2 sm:pt-4 relative z-10">
        <div className="flex items-center justify-between px-4 sm:px-10 pb-3 border-t border-[#D8D4CB] text-[9px] sm:text-[10px] pt-3">
          <div className="text-left">
            <span className="block font-sans font-bold text-[#151515]">DATE ISSUED</span>
            <span className="font-mono text-[#716F68]">{dateStr}</span>
          </div>
          <div className="text-right">
            <span className="block font-sans font-bold text-[#151515]">LABORATORY ATTESTATION</span>
            <span className="font-mono text-[#716F68]">Deterministic In-Browser Engine</span>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-[8px] sm:text-[8.5px] font-sans italic text-[#8C8982] text-center pb-1">
          Educational completion certificate — not an institutional or university accredited degree.
        </p>
      </div>
    </div>
  );
};

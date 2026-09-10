import React, { useState } from 'react';
import { X, Download, Printer, Copy, CheckCircle2, Award, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { CertificateDocument } from './CertificateDocument';
import { downloadCertificatePDF, CertificateData } from '../utils/certificatePdf';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialName?: string;
  milestonesCount?: number;
  totalMilestones?: number;
  certificateId?: string;
  isUnlocked?: boolean;
  onNavigateToProve?: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  initialName = '',
  milestonesCount = 8,
  totalMilestones = 8,
  certificateId = 'MEM-2026-CAPSTONE',
  isUnlocked = true,
  onNavigateToProve,
}) => {
  const [learnerName, setLearnerName] = useState<string>(
    initialName || localStorage.getItem('memory_lab_learner_name') || ''
  );
  const [isGenerated, setIsGenerated] = useState<boolean>(() => {
    return localStorage.getItem('memory_lab_cert_generated') === 'true';
  });
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const certData: CertificateData = {
    learnerName: learnerName || 'Learner',
    certificateId,
    milestonesCount,
    totalMilestones,
    finalChallengeStatus: 'Verified & Completed',
    dateIssued: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  };

  const handleNameChange = (val: string) => {
    setLearnerName(val);
    try {
      localStorage.setItem('memory_lab_learner_name', val);
    } catch {
      // ignore
    }
  };

  const handleGenerate = () => {
    if (!learnerName.trim()) {
      setLearnerName('Learner');
    }
    setIsGenerated(true);
    try {
      localStorage.setItem('memory_lab_cert_generated', 'true');
    } catch {
      // ignore
    }
  };

  const handleDownload = () => {
    downloadCertificatePDF(certData);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const summary = `CERTIFICATE OF COMPLETION
Recipient: ${certData.learnerName}
Completion ID: ${certData.certificateId}
Date Issued: ${certData.dateIssued}
Laboratory: In-Context Learning with Recurrent Memory
Status: ${certData.milestonesCount}/${certData.totalMilestones} Experiments Verified`;

    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#151515]/60 backdrop-blur-xs overflow-y-auto no-print">
      <div className="relative w-full max-w-4xl bg-[#FFFFFF] rounded-2xl border border-[#D8D4CB] shadow-2xl p-5 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto text-[#151515]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F3EFFF] text-[#6842C2] border border-[#E2D8FA] flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-[#151515]">
                Certificate of Completion
              </h3>
              <p className="text-xs text-[#716F68] font-sans">
                Official attestation for In-Context Learning with Recurrent Memory.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#716F68] hover:text-[#151515] hover:bg-[#FAF8F5] transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* LOCKED STATE */}
        {!isUnlocked && (
          <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#E5E0D8] text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#D8D4CB] flex items-center justify-center mx-auto text-[#716F68]">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h4 className="font-serif font-bold text-base text-[#151515]">
                Complete Stage 07 (Prove) to Unlock
              </h4>
              <p className="text-xs text-[#716F68] font-sans leading-relaxed">
                The certificate is earned by completing the experimental challenges and the evaluation in Stage 07. You currently have {milestonesCount} of {totalMilestones} milestones recorded.
              </p>
            </div>
            {onNavigateToProve && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToProve();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6842C2] hover:bg-[#5835AC] text-white font-sans text-xs font-semibold shadow-xs cursor-pointer"
              >
                <span>Go to Stage 07 (Prove)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* UNLOCKED BUT NOT YET GENERATED */}
        {isUnlocked && !isGenerated && (
          <div className="p-6 rounded-2xl bg-[#FBF9F5] border border-[#E5E0D8] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#EDF7F7] text-[#167C80] flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-[#151515]">
                  Verification Complete — Ready to Generate
                </h4>
                <p className="text-xs text-[#716F68] font-sans">
                  Enter your full name to generate your personalized Certificate of Completion.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <input
                type="text"
                value={learnerName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Enter your full name (e.g. Alexandra Elizabeth Johnson)"
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#D8D4CB] text-[#151515] focus:outline-none focus:border-[#6842C2] font-sans text-sm"
              />
              <button
                onClick={handleGenerate}
                className="px-5 py-2.5 rounded-xl bg-[#6842C2] hover:bg-[#5835AC] text-white font-sans text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
              >
                Generate Certificate
              </button>
            </div>
          </div>
        )}

        {/* UNLOCKED & GENERATED */}
        {isUnlocked && isGenerated && (
          <>
            {/* Name Configuration Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8]">
              <div className="space-y-0.5">
                <label className="text-xs font-sans font-bold text-[#151515] block">
                  Recipient Name on Certificate
                </label>
                <p className="text-[11px] text-[#716F68] font-sans">
                  Need to adjust your name? Update here to refresh the document.
                </p>
              </div>

              <input
                type="text"
                value={learnerName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Alexandra Elizabeth Johnson"
                className="px-4 py-2 rounded-xl bg-[#FFFFFF] border border-[#D8D4CB] text-[#151515] focus:outline-none focus:border-[#6842C2] font-sans text-sm w-full sm:w-64"
              />
            </div>

            {/* Live A4 Portrait Certificate Document */}
            <div className="py-2 overflow-x-auto flex justify-center bg-[#F4F1EA] rounded-xl p-4 sm:p-6 border border-[#E5E0D8]">
              <CertificateDocument data={certData} />
            </div>

            {/* Action Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#EAE6DF]">
              <div className="text-xs text-[#716F68] font-sans">
                Layout: Fixed A4 Portrait (210mm × 297mm) · 16mm safe margins
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleCopy}
                  className="px-3.5 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#FAF8F5] text-[#151515] border border-[#D8D4CB] font-sans text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? (
                    <CheckCircle2 className="w-4 h-4 text-[#247A4B]" />
                  ) : (
                    <Copy className="w-4 h-4 text-[#716F68]" />
                  )}
                  <span>{copied ? 'Copied' : 'Copy Text'}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="px-3.5 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#FAF8F5] text-[#151515] border border-[#D8D4CB] font-sans text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#716F68]" />
                  <span>Print / Save as PDF</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="px-4 py-2 rounded-xl bg-[#167C80] hover:bg-[#136B6F] text-white font-sans text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF (A4)</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};


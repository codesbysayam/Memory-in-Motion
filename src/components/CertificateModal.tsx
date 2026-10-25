import React, { useState, useEffect, useRef } from 'react';
import { X, Download, Printer, Copy, CheckCircle2, Award, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { CertificateDocument } from './CertificateDocument';
import { downloadCertificatePDF, printCertificatePDF, CertificateData } from '../utils/certificatePdf';
import { triggerConfettiExplosion } from '../utils/confettiExplosion';

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
  const [modalStatus, setModalStatus] = useState<string | null>(null);
  const hasTriggeredInitialConfetti = useRef<boolean>(false);

  // Auto-trigger confetti explosion when user achieves final milestone or finishes the final challenge
  useEffect(() => {
    if (!isOpen) {
      hasTriggeredInitialConfetti.current = false;
      return;
    }

    const isFinalMilestoneOrChallengeDone =
      isUnlocked ||
      milestonesCount >= totalMilestones ||
      localStorage.getItem('memory_final_challenge_completed') === 'true' ||
      localStorage.getItem('memory_lab_cert_generated') === 'true';

    if (isFinalMilestoneOrChallengeDone && !hasTriggeredInitialConfetti.current) {
      hasTriggeredInitialConfetti.current = true;
      const timer = setTimeout(() => {
        triggerConfettiExplosion();
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isUnlocked, milestonesCount, totalMilestones]);

  // Listen for real-time final challenge completion or milestone updates while modal is active
  useEffect(() => {
    const handleConfettiEvent = () => {
      if (isOpen) {
        triggerConfettiExplosion();
      }
    };
    window.addEventListener('final_challenge_completed', handleConfettiEvent);
    window.addEventListener('trigger_certificate_confetti', handleConfettiEvent);
    return () => {
      window.removeEventListener('final_challenge_completed', handleConfettiEvent);
      window.removeEventListener('trigger_certificate_confetti', handleConfettiEvent);
    };
  }, [isOpen]);

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
    triggerConfettiExplosion();
  };

  const handleDownload = () => {
    setModalStatus('Downloading PDF...');
    downloadCertificatePDF(certData);
    setTimeout(() => setModalStatus(null), 3000);
  };

  const handlePrint = () => {
    setModalStatus('Opening Print dialog / Saving PDF...');
    printCertificatePDF(certData);
    setTimeout(() => setModalStatus(null), 3500);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs overflow-y-auto no-print">
      <div className="relative w-full max-w-4xl bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-2xl p-5 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto text-[var(--text-primary)]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-green)] text-[var(--accent-green-text)] border border-[var(--border)] flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-[var(--text-primary)]">
                Certificate of Completion
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-sans">
                Attestation for In-Context Learning with Recurrent Memory.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isUnlocked && (
              <button
                onClick={() => triggerConfettiExplosion()}
                className="px-3 py-1.5 rounded-lg bg-[var(--surface-soft)] hover:bg-[var(--surface)] text-[var(--accent-green-text)] border border-[var(--border)] font-sans text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                title="Celebrate achievement again with confetti"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span className="hidden sm:inline">Celebrate</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)] transition-all cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* LOCKED STATE */}
        {!isUnlocked && (
          <div className="p-6 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)] text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center mx-auto text-[var(--text-secondary)]">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h4 className="font-serif font-bold text-base text-[var(--text-primary)]">
                Complete Stage 07 (Prove) to Unlock
              </h4>
              <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
                The certificate is earned by completing the experimental challenges and the evaluation in Stage 07. You currently have {milestonesCount} of {totalMilestones} milestones recorded.
              </p>
            </div>
            {onNavigateToProve && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToProve();
                }}
                className="btn btn-primary"
              >
                <span>Go to Stage 07 (Prove)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* UNLOCKED BUT NOT YET GENERATED */}
        {isUnlocked && !isGenerated && (
          <div className="p-6 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-[var(--accent-blue)] text-[var(--accent-blue-text)] flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-[var(--text-primary)]">
                  Verification Complete — Ready to Generate
                </h4>
                <p className="text-xs text-[var(--text-secondary)] font-sans">
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
                className="flex-1 px-4 py-2.5 rounded-md bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-blue-text)] font-sans text-sm"
              />
              <button
                onClick={handleGenerate}
                className="btn btn-primary"
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
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)]">
              <div className="space-y-0.5">
                <label className="text-xs font-sans font-bold text-[var(--text-primary)] block">
                  Recipient Name on Certificate
                </label>
                <p className="text-[11px] text-[var(--text-secondary)] font-sans">
                  Need to adjust your name? Update here to refresh the document.
                </p>
              </div>

              <input
                type="text"
                value={learnerName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Alexandra Elizabeth Johnson"
                className="px-4 py-2 rounded-md bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-blue-text)] font-sans text-sm w-full sm:w-64"
              />
            </div>

            {/* Live A4 Portrait Certificate Document */}
            <div className="certificate-print-wrapper py-2 overflow-x-auto flex justify-center bg-[var(--surface-soft)] rounded-lg p-4 sm:p-6 border border-[var(--border)]">
              <CertificateDocument data={certData} />
            </div>

            {/* Action Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border)]">
              <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] font-sans">
                <span>Layout: Fixed A4 Portrait (210mm × 297mm) · 16mm safe margins</span>
                {modalStatus && (
                  <span className="px-2 py-0.5 rounded bg-[var(--accent-green)] text-[var(--accent-green-text)] font-mono text-[10px] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{modalStatus}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleCopy}
                  className="btn btn-secondary text-xs"
                >
                  {copied ? (
                    <CheckCircle2 className="w-4 h-4 text-[var(--accent-green-text)]" />
                  ) : (
                    <Copy className="w-4 h-4 text-[var(--text-secondary)]" />
                  )}
                  <span>{copied ? 'Copied' : 'Copy Text'}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="btn btn-secondary text-xs"
                >
                  <Printer className="w-4 h-4 text-[var(--text-secondary)]" />
                  <span>Print / Save as PDF</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="btn btn-primary text-xs"
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


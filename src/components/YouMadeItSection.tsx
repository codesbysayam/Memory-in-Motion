import React, { useState, useEffect } from 'react';
import {
  Award,
  Download,
  Printer,
  Copy,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Check,
  Lock,
} from 'lucide-react';
import { MILESTONES, getCompletedMilestones } from '../utils/progressTracker';
import { CertificateDocument } from './CertificateDocument';
import { downloadCertificatePDF } from '../utils/certificatePdf';

export const YouMadeItSection: React.FC = () => {
  const [completedMilestones, setCompletedMilestones] = useState<string[]>([]);
  const [learnerName, setLearnerName] = useState<string>('Learner');
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);
  const [copyStatus, setCopyStatus] = useState<boolean>(false);
  const [certificateId, setCertificateId] = useState<string>('MEM-2026-A8F29D');
  const [certificateGenerated, setCertificateGenerated] = useState<boolean>(() => {
    return localStorage.getItem('memory_lab_cert_generated') === 'true';
  });

  const isCertificateUnlocked =
    completedMilestones.includes('verify_knowledge') ||
    localStorage.getItem('memory_final_challenge_completed') === 'true';

  // Load progress and name from localStorage
  useEffect(() => {
    setCompletedMilestones(getCompletedMilestones());

    const savedName = localStorage.getItem('memory_learner_name');
    if (savedName) {
      setLearnerName(savedName);
    }

    // Generate or load consistent ID
    let savedId = localStorage.getItem('memory_cert_id');
    if (!savedId) {
      savedId = 'MEM-2026-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      localStorage.setItem('memory_cert_id', savedId);
    }
    setCertificateId(savedId);

    const handleMilestoneUpdate = (e: any) => {
      if (e.detail?.all) {
        setCompletedMilestones(e.detail.all);
      }
    };

    window.addEventListener('milestone_updated', handleMilestoneUpdate);
    return () => window.removeEventListener('milestone_updated', handleMilestoneUpdate);
  }, []);

  const handleNameChange = (name: string) => {
    setLearnerName(name);
    localStorage.setItem('memory_learner_name', name);
  };

  const toggleMilestoneManual = (id: string) => {
    let updated: string[];
    if (completedMilestones.includes(id)) {
      updated = completedMilestones.filter((m) => m !== id);
    } else {
      updated = [...completedMilestones, id];
    }
    setCompletedMilestones(updated);
    localStorage.setItem('memory_in_motion_progress', JSON.stringify(updated));
  };

  const completionPercentage = Math.round(
    (completedMilestones.length / MILESTONES.length) * 100
  );

  // Knowledge Snapshot Q&A
  const questions = [
    {
      id: 1,
      q: 'Why doesn\'t recurrent memory need to grow with every token?',
      answer:
        'Because instead of appending each token into an unbounded cache (like standard KV cache in Transformers with O(T) memory), recurrent architectures compress incoming facts into a fixed-dimensional state vector or matrix (O(1) memory). Updates happen strictly in place via state recurrence: M_(t+1) = λ M_t + η k_t v_t^T.',
    },
    {
      id: 2,
      q: 'Why can a fixed-size state forget or interfere with earlier information?',
      answer:
        'A fixed-size state possesses a finite mathematical dimensionality D. Writing more facts than the vector subspace can cleanly orthogonalize forces vectors to superpose and collide. Furthermore, exponential retention decay (λ^t where λ < 1) continually attenuates earlier outer products, introducing a recency bias and inevitable forgetting.',
    },
    {
      id: 3,
      q: 'Why is BDH related to this idea, but not identical to this toy memory experiment?',
      answer:
        'Both BDH and this toy share the core principle that memory is stored in continuous state updates rather than raw token buffers. However, while our toy uses a single centralized fast-weight matrix with global outer-product writes, Dragon Hatchling (BDH) distributes memory across decentralized plastic synaptic connections (σ_ij) inside a scale-free sparse graph that updates via local Hebbian plasticity and latent recurrent relaxation.',
    },
  ];

  // Download Publication-Grade A4 Portrait PDF
  const handleDownloadPDF = () => {
    downloadCertificatePDF({
      learnerName,
      certificateId,
      milestonesCount: completedMilestones.length,
      totalMilestones: MILESTONES.length,
      completionPercentage,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const summary = `🎓 MEMORY IN MOTION — LAB COMPLETION RECORD
Learner: ${learnerName}
ID: ${certificateId}
Completion: ${completionPercentage}% (${completedMilestones.length}/${MILESTONES.length} milestones)
Date: ${new Date().toLocaleDateString()}
Core Scientific Lesson: Fixed-size recurrent states maintain O(1) memory at the cost of lossy compression and geometric capacity interference.`;

    navigator.clipboard.writeText(summary).then(() => {
      setCopyStatus(true);
      setTimeout(() => setCopyStatus(false), 2500);
    });
  };

  return (
    <section id="you-made-it" className="scroll-mt-20 border-b border-[#E5E0D8] bg-[#FBF9F5] py-20 text-[#151515]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 space-y-12">
        {/* Editorial Section Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded bg-[#F3EFFF] text-[#6842C2] border border-[#E2D8FA] font-bold">
              FINAL CAPSTONE
            </span>
            <span className="text-xs font-mono text-[#716F68]">
              RESEARCH ATTESTATION & SUMMARY
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-serif tracking-tight text-[#151515] font-normal">
            You broke the memory.
          </h2>

          <p className="text-sm sm:text-base text-[#52504A] font-sans max-w-3xl leading-relaxed">
            You pushed the recurrent state beyond its capacity, diagnosed interference, inspected coordinate drift, and explored synaptic architectures. Review your accomplishments and claim your scientific laboratory certificate.
          </p>
        </div>

        {/* Milestone Progress Checklist */}
        <div className="p-6 sm:p-8 rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] space-y-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EAE6DF] pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#151515] flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#167C80]" />
                <span>Laboratory Accomplishment Checklist</span>
              </h3>
              <p className="text-xs text-[#716F68] font-sans mt-0.5">
                Each milestone reflects an active empirical observation in this session.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-[#167C80] bg-[#EDF7F7] border border-[#CFE8E8] px-3 py-1 rounded-xl font-bold">
                {completedMilestones.length} / {MILESTONES.length} Completed ({completionPercentage}%)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
            {MILESTONES.map((m) => {
              const isDone = completedMilestones.includes(m.id);
              return (
                <div
                  key={m.id}
                  onClick={() => toggleMilestoneManual(m.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    isDone
                      ? 'bg-[#F3EFFF] border-[#6842C2]/40 text-[#151515]'
                      : 'bg-[#FAF8F5] border-[#EAE6DF] text-[#716F68] hover:border-[#D8D4CB]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-[#151515] leading-snug">
                      {m.label}
                    </span>
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${
                        isDone
                          ? 'bg-[#6842C2] border-[#6842C2] text-white'
                          : 'border-[#BDB7AB] bg-[#FFFFFF]'
                      }`}
                    >
                      {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                  </div>
                  <p className="text-[10px] font-sans text-[#716F68] leading-normal">
                    {m.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Final Knowledge Snapshot (3 Click-to-Reveal Questions) */}
        <div className="p-6 sm:p-8 rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] space-y-4 shadow-xs">
          <div className="border-b border-[#EAE6DF] pb-3">
            <h3 className="text-base sm:text-lg font-serif font-bold text-[#151515] flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#6842C2]" />
              <span>Final Knowledge Snapshot (Foundational Questions)</span>
            </h3>
            <p className="text-xs text-[#716F68] font-sans mt-0.5">
              Click each question to reveal the rigorous mechanistic answer.
            </p>
          </div>

          <div className="space-y-3">
            {questions.map((q) => {
              const isOpen = activeQuestion === q.id;
              return (
                <div
                  key={q.id}
                  className="rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setActiveQuestion(isOpen ? null : q.id)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 font-mono text-xs sm:text-sm text-[#151515] hover:text-[#6842C2] cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[#6842C2] font-bold">0{q.id}.</span>
                      <span className="font-semibold">{q.q}</span>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-[#716F68]" /> : <ChevronDown className="w-4 h-4 text-[#716F68]" />}
                  </button>

                  {isOpen && (
                    <div className="p-4 pt-0 font-sans text-xs text-[#52504A] border-t border-[#EAE6DF] leading-relaxed animate-in fade-in duration-150">
                      {q.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Certificate of Completion Preview & Download */}
        <div id="you-made-it-certificate" className="p-6 sm:p-8 rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] space-y-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EAE6DF] pb-4">
            <div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-[#151515] flex items-center gap-2">
                <Award className="w-5 h-5 text-[#6842C2]" />
                <span>Certificate of Completion</span>
              </h3>
              <p className="text-xs text-[#716F68] font-sans mt-0.5">
                Official attestation for completing the interactive laboratory on In-Context Learning with Recurrent Memory.
              </p>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-[#716F68]">Status:</span>
              <span
                className={`px-2.5 py-0.5 rounded-md font-bold ${
                  isCertificateUnlocked
                    ? 'bg-[#EAF5EF] text-[#247A4B] border border-[#CDEEDB]'
                    : 'bg-[#F4F1EA] text-[#716F68] border border-[#E5E0D8]'
                }`}
              >
                {isCertificateUnlocked ? 'UNLOCKED' : 'LOCKED (REQUIRES PROVE STAGE)'}
              </span>
            </div>
          </div>

          {/* LOCKED STATE: When learner has not completed Final Challenge in Stage 07 */}
          {!isCertificateUnlocked && (
            <div className="p-6 sm:p-8 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#FFFFFF] border border-[#D8D4CB] flex items-center justify-center mx-auto text-[#716F68] shadow-xs">
                <Lock className="w-5 h-5 text-[#716F68]" />
              </div>
              <div className="space-y-1.5 max-w-lg mx-auto">
                <h4 className="font-serif font-bold text-base text-[#151515]">
                  Certificate Locked — Complete Stage 07 Final Challenge
                </h4>
                <p className="text-xs text-[#716F68] font-sans leading-relaxed">
                  To ensure genuine learning, the Certificate of Completion unlocks after completing the Final Challenge in Stage 07 above.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    const el = document.getElementById('final-challenge');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2 rounded-xl bg-[#6842C2] hover:bg-[#5835AC] text-white font-sans text-xs font-semibold transition-all shadow-xs cursor-pointer"
                >
                  Go to Final Challenge Above
                </button>
              </div>
            </div>
          )}

          {/* UNLOCKED BUT NOT YET GENERATED */}
          {isCertificateUnlocked && !certificateGenerated && (
            <div className="p-6 sm:p-8 rounded-xl bg-[#FAF8F5] border border-[#D8D4CB] space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#247A4B] font-bold block">
                  Evaluation Verified
                </span>
                <h4 className="font-serif font-bold text-lg text-[#151515]">
                  Claim Your Certificate of Completion
                </h4>
                <p className="text-xs text-[#716F68] font-sans">
                  Enter your full name exactly as you wish it to appear on your verified scientific certificate document.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2 max-w-xl">
                <input
                  type="text"
                  value={learnerName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Alexandra Elizabeth Johnson"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#FFFFFF] border border-[#D8D4CB] text-[#151515] focus:outline-none focus:border-[#6842C2] font-sans text-sm"
                />
                <button
                  onClick={() => {
                    if (!learnerName.trim()) {
                      handleNameChange('Learner');
                    }
                    setCertificateGenerated(true);
                    localStorage.setItem('memory_lab_cert_generated', 'true');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#6842C2] hover:bg-[#5835AC] text-white font-sans text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                >
                  Generate Certificate
                </button>
              </div>
            </div>
          )}

          {/* UNLOCKED & GENERATED: Live Certificate Document and Export Controls */}
          {isCertificateUnlocked && certificateGenerated && (
            <>
              {/* Adjust Name Row */}
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
                  className="px-3.5 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#D8D4CB] text-[#151515] focus:outline-none focus:border-[#6842C2] font-sans text-xs w-64"
                />
              </div>

              {/* Certificate Live Paper Preview (Single Source of Truth) */}
              <div className="rounded-2xl border border-[#D8D4CB] bg-[#F4F1EA] p-4 sm:p-8 flex justify-center overflow-x-auto shadow-inner">
                <CertificateDocument
                  data={{
                    learnerName,
                    certificateId,
                    milestonesCount: completedMilestones.length,
                    totalMilestones: MILESTONES.length,
                    completionPercentage,
                    finalChallengeStatus: 'Verified & Completed',
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={handleDownloadPDF}
                    className="px-5 py-2.5 rounded-xl bg-[#167C80] hover:bg-[#136B6F] text-white font-sans text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download certificate (A4 PDF)</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-4 py-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FAF8F5] text-[#151515] border border-[#E5E0D8] font-sans text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-[#716F68]" />
                    <span>Print / Save as PDF</span>
                  </button>

                  <button
                    onClick={handleCopySummary}
                    className="px-4 py-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FAF8F5] text-[#151515] border border-[#E5E0D8] font-sans text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {copyStatus ? <CheckCircle2 className="w-4 h-4 text-[#247A4B]" /> : <Copy className="w-4 h-4 text-[#716F68]" />}
                    <span>{copyStatus ? 'Copied to clipboard' : 'Copy verification summary'}</span>
                  </button>
                </div>

                <div className="text-[11px] font-sans text-[#716F68] italic">
                  Educational completion certificate — not an institutional or professional certification.
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

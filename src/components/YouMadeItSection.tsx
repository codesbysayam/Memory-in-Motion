import React, { useState, useEffect } from 'react';
import {
  Award,
  Download,
  Printer,
  Copy,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Check,
  Lock,
} from 'lucide-react';
import { MILESTONES, getCompletedMilestones } from '../utils/progressTracker';
import { CertificateDocument } from './CertificateDocument';
import { downloadCertificatePDF, printCertificatePDF } from '../utils/certificatePdf';
import { triggerConfettiExplosion } from '../utils/confettiExplosion';

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

  useEffect(() => {
    setCompletedMilestones(getCompletedMilestones());

    const savedName = localStorage.getItem('memory_learner_name');
    if (savedName) {
      setLearnerName(savedName);
    }

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

  const questions = [
    {
      id: 1,
      q: "Why doesn't recurrent memory need to grow with every token?",
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

  const [printStatus, setPrintStatus] = useState<string | null>(null);

  const handleDownloadPDF = () => {
    setPrintStatus('Downloading certificate PDF...');
    downloadCertificatePDF({
      learnerName,
      certificateId,
      milestonesCount: completedMilestones.length,
      totalMilestones: MILESTONES.length,
      completionPercentage,
    });
    setTimeout(() => setPrintStatus(null), 3000);
  };

  const handlePrint = () => {
    setPrintStatus('Opening Print / Save as PDF dialog...');
    printCertificatePDF({
      learnerName,
      certificateId,
      milestonesCount: completedMilestones.length,
      totalMilestones: MILESTONES.length,
      completionPercentage,
    });
    setTimeout(() => setPrintStatus(null), 3500);
  };

  const handleCopySummary = () => {
    const summary = `MEMORY IN MOTION — LAB COMPLETION RECORD
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
    <section id="you-made-it" className="scroll-mt-20 border-t border-[var(--mm-rule)] bg-[var(--page-bg)] py-12 text-[var(--mm-ink)]">
      <div className="space-y-12">
        {/* Editorial Section Header */}
        <div className="space-y-2.5 max-w-3xl">
          <div className="essay-eyebrow flex items-center gap-2">
            <span className="text-[var(--mm-signal)] font-semibold">07.6 · Final capstone</span>
            <span aria-hidden="true" className="text-[var(--mm-rule-strong)]">·</span>
            <span>Research attestation &amp; summary</span>
          </div>

          <h2 className="essay-stage-title">
            You broke the memory.
          </h2>

          <p className="essay-lead">
            You pushed the recurrent state beyond its capacity, diagnosed interference, inspected coordinate drift, and explored synaptic architectures. Review your accomplishments and claim your scientific laboratory certificate.
          </p>
        </div>

        {/* Milestone Progress Checklist */}
        <div className="essay-figure-stage px-5 sm:px-8 py-6 space-y-5">
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[var(--mm-rule)] pb-4">
            <div>
              <h3 className="text-lg font-serif font-normal text-[var(--mm-ink)]">
                Laboratory Accomplishment Checklist
              </h3>
              <p className="text-xs text-[var(--mm-ink-soft)] font-sans mt-0.5">
                Each milestone reflects an active empirical observation in this session.
              </p>
            </div>

            <div className="text-xs font-mono text-[var(--color-success)] font-semibold tabular-nums">
              {completedMilestones.length} / {MILESTONES.length} Completed ({completionPercentage}%)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-y border-[var(--mm-rule)] divide-y md:divide-x divide-[var(--mm-rule)] font-mono text-xs">
            {MILESTONES.map((m) => {
              const isDone = completedMilestones.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleMilestoneManual(m.id)}
                  className={`p-4 text-left transition-colors cursor-pointer flex flex-col justify-between space-y-2 ${
                    isDone
                      ? 'bg-[var(--mm-signal-soft)]/50 text-[var(--mm-ink)]'
                      : 'bg-transparent text-[var(--mm-ink-soft)] hover:bg-[var(--page-bg)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 w-full">
                    <span className="font-semibold font-sans text-sm text-[var(--mm-ink)] leading-snug">
                      {m.label}
                    </span>
                    <span
                      className={`w-4 h-4 rounded-sm flex items-center justify-center shrink-0 border ${
                        isDone
                          ? 'bg-[var(--mm-signal)] border-[var(--mm-signal)] text-[var(--surface)]'
                          : 'border-[var(--mm-rule-strong)] bg-[var(--page-bg)]'
                      }`}
                    >
                      {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                  </div>
                  <p className="text-xs font-sans text-[var(--mm-ink-soft)] leading-normal">
                    {m.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Final Knowledge Snapshot (3 Click-to-Reveal Questions) */}
        <div className="essay-figure-stage px-5 sm:px-8 py-6 space-y-5">
          <div className="border-b border-[var(--mm-rule)] pb-3">
            <h3 className="text-lg font-serif font-normal text-[var(--mm-ink)]">
              Final Knowledge Snapshot (Foundational Questions)
            </h3>
            <p className="text-xs text-[var(--mm-ink-soft)] font-sans mt-0.5">
              Click each question to expand the rigorous mechanistic explanation.
            </p>
          </div>

          <div className="divide-y divide-[var(--mm-rule)]">
            {questions.map((q) => {
              const isOpen = activeQuestion === q.id;
              return (
                <div key={q.id} className="transition-colors">
                  <button
                    type="button"
                    onClick={() => setActiveQuestion(isOpen ? null : q.id)}
                    className="w-full py-4 text-left flex items-center justify-between gap-4 font-sans text-sm sm:text-[15px] text-[var(--mm-ink)] hover:text-[var(--mm-signal)] cursor-pointer"
                  >
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-xs text-[var(--mm-signal)] font-semibold tabular-nums">
                        0{q.id}
                      </span>
                      <span className="font-semibold">{q.q}</span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[var(--mm-muted)] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[var(--mm-muted)] shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="pb-4 pl-7 font-sans text-xs sm:text-sm text-[var(--mm-ink-soft)] leading-relaxed animate-in fade-in duration-150">
                      {q.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Certificate of Completion Preview & Download */}
        <div id="you-made-it-certificate" className="essay-figure-stage px-5 sm:px-8 py-6 space-y-6">
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[var(--mm-rule)] pb-4">
            <div>
              <h3 className="text-lg sm:text-xl font-serif font-normal text-[var(--mm-ink)] flex items-center gap-2">
                <Award className="w-5 h-5 text-[var(--mm-signal)]" />
                <span>Certificate of Completion</span>
              </h3>
              <p className="text-xs text-[var(--mm-ink-soft)] font-sans mt-0.5">
                Official attestation for completing the interactive laboratory on In-Context Learning with Recurrent Memory.
              </p>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-[var(--mm-muted)]">Status:</span>
              <span
                className={`font-semibold ${
                  isCertificateUnlocked
                    ? 'text-[var(--color-success)]'
                    : 'text-[var(--mm-ink-soft)]'
                }`}
              >
                {isCertificateUnlocked ? 'Unlocked' : 'Locked · Complete Final Challenge above'}
              </span>
            </div>
          </div>

          {/* LOCKED STATE */}
          {!isCertificateUnlocked && (
            <div className="py-6 text-center space-y-4">
              <Lock className="w-5 h-5 text-[var(--mm-muted)] mx-auto" />
              <div className="space-y-1.5 max-w-lg mx-auto">
                <h4 className="font-serif font-normal text-base text-[var(--mm-ink)]">
                  Certificate Locked — Complete Stage 07 Final Challenge
                </h4>
                <p className="text-xs text-[var(--mm-ink-soft)] font-sans leading-relaxed">
                  To ensure genuine learning, the Certificate of Completion unlocks after completing Round 3 of the Final Challenge above.
                </p>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('final-challenge');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="btn-primary text-xs"
                >
                  Go to Final Challenge Above
                </button>
              </div>
            </div>
          )}

          {/* UNLOCKED BUT NOT YET GENERATED */}
          {isCertificateUnlocked && !certificateGenerated && (
            <div className="py-4 space-y-4 max-w-2xl">
              <div className="space-y-1">
                <span className="essay-eyebrow text-[var(--color-success)] font-semibold block">
                  Evaluation Verified
                </span>
                <h4 className="font-serif font-normal text-lg text-[var(--mm-ink)]">
                  Claim Your Certificate of Completion
                </h4>
                <p className="text-xs text-[var(--mm-ink-soft)] font-sans">
                  Enter your full name exactly as you wish it to appear on your scientific certificate document.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-1 max-w-xl">
                <input
                  type="text"
                  value={learnerName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Alexandra Elizabeth Johnson"
                  className="flex-1 px-4 py-2.5 rounded-md bg-[var(--page-bg)] border border-[var(--mm-rule)] text-[var(--mm-ink)] focus:outline-none focus:border-[var(--mm-signal)] font-sans text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!learnerName.trim()) {
                      handleNameChange('Learner');
                    }
                    setCertificateGenerated(true);
                    localStorage.setItem('memory_lab_cert_generated', 'true');
                    triggerConfettiExplosion();
                  }}
                  className="btn-primary px-5 py-2.5 text-xs shrink-0"
                >
                  Generate Certificate
                </button>
              </div>
            </div>
          )}

          {/* UNLOCKED & GENERATED */}
          {isCertificateUnlocked && certificateGenerated && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--mm-rule)]">
                <div className="space-y-0.5">
                  <label className="text-xs font-sans font-semibold text-[var(--mm-ink)] block">
                    Recipient Name on Certificate
                  </label>
                  <p className="text-xs text-[var(--mm-ink-soft)] font-sans">
                    Update here to refresh the live document.
                  </p>
                </div>

                <input
                  type="text"
                  value={learnerName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Alexandra Elizabeth Johnson"
                  className="px-3.5 py-1.5 rounded-md bg-[var(--page-bg)] border border-[var(--mm-rule)] text-[var(--mm-ink)] focus:outline-none focus:border-[var(--mm-signal)] font-sans text-xs w-64"
                />
              </div>

              <div className="certificate-print-wrapper border border-[var(--mm-rule)] bg-[var(--page-bg)] p-4 sm:p-8 flex justify-center overflow-x-auto">
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

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    className="btn-primary text-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download certificate (A4 PDF)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="btn-secondary text-xs"
                  >
                    <Printer className="w-4 h-4 text-[var(--mm-ink-soft)]" />
                    <span>Print / Save as PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="btn-secondary text-xs"
                  >
                    {copyStatus ? (
                      <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" />
                    ) : (
                      <Copy className="w-4 h-4 text-[var(--mm-ink-soft)]" />
                    )}
                    <span>{copyStatus ? 'Copied to clipboard' : 'Copy verification summary'}</span>
                  </button>

                  {printStatus && (
                    <span className="text-[var(--color-success)] font-mono text-xs font-semibold animate-in fade-in flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{printStatus}</span>
                    </span>
                  )}
                </div>

                <div className="text-xs font-sans text-[var(--mm-muted)] italic">
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


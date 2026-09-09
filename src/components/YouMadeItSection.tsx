import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  Download,
  Printer,
  Copy,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  FileCheck,
  Check
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { MILESTONES, getCompletedMilestones, markMilestoneCompleted } from '../utils/progressTracker';
import { MathView } from './ui/MathView';

export const YouMadeItSection: React.FC = () => {
  const [completedMilestones, setCompletedMilestones] = useState<string[]>([]);
  const [learnerName, setLearnerName] = useState<string>('Learner');
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);
  const [copyStatus, setCopyStatus] = useState<boolean>(false);
  const [certificateId, setCertificateId] = useState<string>('MEM-2026-A8F29D');

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

  // Browser-side PDF Generation with jsPDF
  const generatePDFCertificate = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Elegant paper background: #F4F1EA
    doc.setFillColor(244, 241, 234);
    doc.rect(0, 0, 297, 210, 'F');

    // Outer subtle double border: #D8D4CB & #151515
    doc.setDrawColor(216, 212, 203);
    doc.setLineWidth(1.2);
    doc.rect(12, 12, 273, 186);

    doc.setDrawColor(104, 66, 194); // Memory Purple Accent line
    doc.setLineWidth(0.4);
    doc.rect(14, 14, 269, 182);

    // Header metadata
    doc.setFont('courier', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(113, 111, 104);
    doc.text('DATAFORGE 2026 · PATHWAY TRACK · INTERACTIVE LABORATORY', 148.5, 30, { align: 'center' });

    // Main Certificate Heading
    doc.setFont('times', 'bold');
    doc.setFontSize(26);
    doc.setTextColor(21, 21, 21);
    doc.text('CERTIFICATE OF SCIENTIFIC COMPLETION', 148.5, 46, { align: 'center' });

    // Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(42, 41, 38);
    doc.text('In-Context Learning with Recurrent Memory & Latent Dynamics', 148.5, 54, { align: 'center' });

    // Divider line
    doc.setDrawColor(216, 212, 203);
    doc.setLineWidth(0.5);
    doc.line(60, 60, 237, 60);

    // Presentation text
    doc.setFont('times', 'italic');
    doc.setFontSize(13);
    doc.setTextColor(113, 111, 104);
    doc.text('This certifies that', 148.5, 75, { align: 'center' });

    // Recipient Name
    doc.setFont('times', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(21, 21, 21);
    doc.text(learnerName.trim() || 'Learner', 148.5, 90, { align: 'center' });

    // Accomplishment paragraph
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(42, 41, 38);
    const summaryLines = [
      'has successfully completed the interactive research laboratory on Recurrent State Memory,',
      'systematically investigated representational capacity bounds, induced and diagnosed retrieval interference,',
      'examined continuous coordinate deltas (ΔM_t), and evaluated the Dragon Hatchling (BDH) synaptic architecture.',
    ];
    doc.text(summaryLines, 148.5, 106, { align: 'center', lineHeightFactor: 1.5 });

    // Technical Metrics Badge
    doc.setFillColor(235, 230, 220);
    doc.roundedRect(65, 126, 167, 18, 2, 2, 'F');
    doc.setFont('courier', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(104, 66, 194);
    doc.text(
      `MILESTONES: ${completedMilestones.length}/${MILESTONES.length} COMPLETED   |   COMPLETION RATE: ${completionPercentage}%   |   VERIFICATION ID: ${certificateId}`,
      148.5,
      137,
      { align: 'center' }
    );

    // Core Formula Stamp
    doc.setFont('times', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(113, 111, 104);
    doc.text('State Update Law: M_(t+1) = λ M_t + η k_t v_t^T   ·   Readout: v̂ = q^T M', 148.5, 154, { align: 'center' });

    // Signatures / Date block
    doc.setDrawColor(216, 212, 203);
    doc.setLineWidth(0.4);
    doc.line(35, 178, 100, 178);
    doc.line(197, 178, 262, 178);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(42, 41, 38);
    doc.text('DATE ISSUED', 67.5, 183, { align: 'center' });
    doc.text('LABORATORY ATTESTATION', 229.5, 183, { align: 'center' });

    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(113, 111, 104);
    doc.text(today, 67.5, 188, { align: 'center' });
    doc.text('Deterministic In-Browser Engine', 229.5, 188, { align: 'center' });

    // Bottom honest disclaimer
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(140, 137, 130);
    doc.text(
      'Educational completion certificate — not an institutional or university accredited degree.',
      148.5,
      198,
      { align: 'center' }
    );

    // Save PDF
    const cleanName = learnerName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    doc.save(`memory-in-motion-certificate-${cleanName || 'learner'}.pdf`);
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
    <section id="you-made-it" className="scroll-mt-20 border-b border-[#252A35] bg-[#07090E] py-16 text-[#F4F5F7]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 space-y-12">
        {/* Editorial Section Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded bg-violet-950/70 text-violet-300 border border-violet-800/60 font-bold">
              FINAL CAPSTONE
            </span>
            <span className="text-xs font-mono text-[#8F96A3]">
              RESEARCH ATTESTATION & SUMMARY
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-serif tracking-tight text-white font-normal">
            YOU BROKE THE MEMORY.
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 font-sans max-w-3xl leading-relaxed">
            You pushed the recurrent state beyond its capacity, diagnosed interference, inspected coordinate drift, and explored synaptic architectures. Review your accomplishments and claim your scientific laboratory certificate.
          </p>
        </div>

        {/* Milestone Progress Checklist */}
        <div className="p-6 rounded-2xl border border-[#20293D] bg-[#0D121D] space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A2436] pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-cyan-400" />
                <span>Laboratory Accomplishment Checklist</span>
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Each milestone reflects an active empirical observation in this session.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/50 px-3 py-1 rounded-lg font-bold">
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
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    isDone
                      ? 'bg-[#101A24] border-cyan-800/50 text-slate-200'
                      : 'bg-[#090D15] border-[#1C2538] text-slate-500 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-white leading-snug">
                      {m.label}
                    </span>
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${
                        isDone
                          ? 'bg-cyan-500 border-cyan-400 text-black'
                          : 'border-slate-600'
                      }`}
                    >
                      {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                  </div>
                  <p className="text-[10px] font-sans text-slate-400 leading-normal">
                    {m.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Final Knowledge Snapshot (3 Click-to-Reveal Questions) */}
        <div className="p-6 rounded-2xl border border-[#20293D] bg-[#0D121D] space-y-4">
          <div className="border-b border-[#1A2436] pb-3">
            <h3 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-purple-400" />
              <span>Final Knowledge Snapshot (Foundational Questions)</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Click each question to reveal the rigorous mechanistic answer.
            </p>
          </div>

          <div className="space-y-3">
            {questions.map((q) => {
              const isOpen = activeQuestion === q.id;
              return (
                <div
                  key={q.id}
                  className="rounded-xl border border-[#1E273A] bg-[#0A0E18] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setActiveQuestion(isOpen ? null : q.id)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 font-mono text-xs sm:text-sm text-white hover:text-cyan-300 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-purple-400 font-bold">0{q.id}.</span>
                      <span className="font-semibold">{q.q}</span>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>

                  {isOpen && (
                    <div className="p-4 pt-0 font-sans text-xs text-slate-300 border-t border-[#161F2E] leading-relaxed animate-in fade-in duration-150">
                      {q.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Certificate of Completion Preview & Download */}
        <div className="p-6 sm:p-8 rounded-2xl border border-[#2B354C] bg-[#111724] space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1E283E] pb-4">
            <div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Certificate of Completion</span>
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Download a personalized, publication-grade PDF certificate of your work.
              </p>
            </div>

            {/* Learner Name Input */}
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-slate-400">YOUR NAME:</span>
              <input
                type="text"
                value={learnerName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Enter your name"
                className="px-3 py-1.5 rounded-lg bg-[#090C14] border border-[#222E44] text-white focus:outline-none focus:border-cyan-400 font-mono text-xs w-48"
              />
            </div>
          </div>

          {/* Certificate Live Paper Preview */}
          <div className="rounded-xl border border-[#D8D4CB] bg-[#F4F1EA] text-[#151515] p-6 sm:p-10 shadow-2xl relative overflow-hidden select-none">
            {/* Inner Border */}
            <div className="border border-[#D8D4CB] p-6 sm:p-8 space-y-6 text-center">
              <div className="space-y-1">
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#716F68] block">
                  DATAFORGE 2026 · PATHWAY TRACK · INTERACTIVE LABORATORY
                </span>
                <h4 className="text-xl sm:text-3xl font-serif font-bold tracking-tight text-[#151515]">
                  CERTIFICATE OF SCIENTIFIC COMPLETION
                </h4>
                <p className="text-xs font-sans text-[#2A2926]">
                  In-Context Learning with Recurrent Memory & Latent Dynamics
                </p>
              </div>

              <div className="w-24 h-px bg-[#D8D4CB] mx-auto" />

              <div className="space-y-1">
                <span className="text-xs font-serif italic text-[#716F68]">
                  This certifies that
                </span>
                <div className="text-xl sm:text-2xl font-serif font-bold text-[#151515] tracking-wide">
                  {learnerName.trim() || 'Learner'}
                </div>
              </div>

              <p className="text-xs font-sans text-[#2A2926] max-w-xl mx-auto leading-relaxed">
                has successfully completed the interactive research laboratory on Recurrent State Memory, systematically investigated representational capacity bounds, induced retrieval interference, and evaluated the Dragon Hatchling (BDH) synaptic architecture.
              </p>

              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded bg-[#EBE6DC] text-[10px] font-mono text-[#6842C2] font-bold">
                <span>MILESTONES: {completedMilestones.length}/{MILESTONES.length}</span>
                <span>·</span>
                <span>RATE: {completionPercentage}%</span>
                <span>·</span>
                <span>ID: {certificateId}</span>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-[#D8D4CB] text-[10px] font-mono text-[#716F68]">
                <div>
                  <span className="block font-bold text-[#151515]">DATE ISSUED</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
                <div className="text-right">
                  <span className="block font-bold text-[#151515]">LABORATORY ATTESTATION</span>
                  <span>Deterministic In-Browser Engine</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={generatePDFCertificate}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-cyan-950/50 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>DOWNLOAD CERTIFICATE (PDF)</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-4 py-2.5 rounded-xl bg-[#182132] hover:bg-[#202B40] text-slate-300 hover:text-white border border-[#2B3852] font-mono text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>PRINT / SAVE AS PDF</span>
              </button>

              <button
                onClick={handleCopySummary}
                className="px-4 py-2.5 rounded-xl bg-[#182132] hover:bg-[#202B40] text-slate-300 hover:text-white border border-[#2B3852] font-mono text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
              >
                {copyStatus ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copyStatus ? 'COPIED TO CLIPBOARD' : 'COPY SUMMARY'}</span>
              </button>
            </div>

            <div className="text-[11px] font-sans text-slate-400 italic">
              Educational completion certificate — not an institutional or university accredited degree.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

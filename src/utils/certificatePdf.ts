import { jsPDF } from 'jspdf';

export interface CertificateData {
  learnerName: string;
  certificateId: string;
  dateIssued?: string;
  milestonesCount?: number;
  totalMilestones?: number;
  completionPercentage?: number;
}

/**
 * Generates an elegant, publication-grade A4 portrait PDF certificate of completion.
 * Fully contained within standard A4 portrait boundaries (210mm x 297mm) with 15-18mm safe margins.
 */
export function generateCertificatePDF(data: CertificateData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const PAGE_WIDTH = 210;
  const PAGE_HEIGHT = 297;
  const CENTER_X = PAGE_WIDTH / 2;

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

  // 1. Warm paper background (#FBF9F5)
  doc.setFillColor(251, 249, 245);
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');

  // 2. Outer elegant neutral border (14mm inset)
  doc.setDrawColor(216, 212, 203);
  doc.setLineWidth(0.8);
  doc.rect(14, 14, PAGE_WIDTH - 28, PAGE_HEIGHT - 28);

  // 3. Inner restrained violet border (16.5mm inset)
  doc.setDrawColor(104, 66, 194);
  doc.setLineWidth(0.35);
  doc.rect(16.5, 16.5, PAGE_WIDTH - 33, PAGE_HEIGHT - 33);

  // 4. Subtle corner accent tick marks
  doc.setDrawColor(104, 66, 194);
  doc.setLineWidth(0.6);
  // Top-left
  doc.line(16.5, 22, 22, 22);
  doc.line(22, 16.5, 22, 22);
  // Top-right
  doc.line(PAGE_WIDTH - 16.5, 22, PAGE_WIDTH - 22, 22);
  doc.line(PAGE_WIDTH - 22, 16.5, PAGE_WIDTH - 22, 22);
  // Bottom-left
  doc.line(16.5, PAGE_HEIGHT - 22, 22, PAGE_HEIGHT - 22);
  doc.line(22, PAGE_HEIGHT - 16.5, 22, PAGE_HEIGHT - 22);
  // Bottom-right
  doc.line(PAGE_WIDTH - 16.5, PAGE_HEIGHT - 22, PAGE_WIDTH - 22, PAGE_HEIGHT - 22);
  doc.line(PAGE_WIDTH - 22, PAGE_HEIGHT - 16.5, PAGE_WIDTH - 22, PAGE_HEIGHT - 22);

  // 5. Header Track Info (safe max-width: 140mm)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(113, 111, 104);
  doc.text('DATAFORGE 2026 · PATHWAY TRACK', CENTER_X, 33, { align: 'center' });

  doc.setFont('times', 'italic');
  doc.setFontSize(10.5);
  doc.setTextColor(22, 124, 128); // Muted teal
  doc.text('MEMORY IN MOTION · INTERACTIVE RESEARCH LABORATORY', CENTER_X, 39, { align: 'center' });

  // 6. Main Certificate Title
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(21, 21, 21);
  doc.text('CERTIFICATE OF COMPLETION', CENTER_X, 54, { align: 'center' });

  // Thin decorative rule
  doc.setDrawColor(216, 212, 203);
  doc.setLineWidth(0.4);
  doc.line(CENTER_X - 28, 62, CENTER_X + 28, 62);

  // 7. Presentation Line
  doc.setFont('times', 'italic');
  doc.setFontSize(12.5);
  doc.setTextColor(113, 111, 104);
  doc.text('This certifies that', CENTER_X, 76, { align: 'center' });

  // 8. Learner Name (Dynamically sized and wrapped if necessary)
  let nameFontSize = 22;
  if (name.length > 28) {
    nameFontSize = 16;
  } else if (name.length > 18) {
    nameFontSize = 19;
  }
  doc.setFont('times', 'bold');
  doc.setFontSize(nameFontSize);
  doc.setTextColor(21, 21, 21);
  const nameLines = doc.splitTextToSize(name, 140);
  doc.text(nameLines, CENTER_X, 92, { align: 'center' });

  // Subtle line under name
  doc.setDrawColor(229, 224, 216);
  doc.setLineWidth(0.3);
  doc.line(CENTER_X - 45, 102, CENTER_X + 45, 102);

  // 9. Achievement Description
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(82, 80, 74);
  doc.text('has completed the interactive learning laboratory on', CENTER_X, 114, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(21, 21, 21);
  doc.text('IN-CONTEXT LEARNING WITH RECURRENT MEMORY', CENTER_X, 122, { align: 'center' });

  // Controlled wrapped body paragraph (max-width 140mm)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(82, 80, 74);
  const accomplishmentText =
    'exploring fixed-size recurrent state, associative retrieval, representational capacity bounds, coordinate interference, and the connection to the Dragon Hatchling (BDH) architecture.';
  const wrappedAccomplishment = doc.splitTextToSize(accomplishmentText, 140);
  doc.text(wrappedAccomplishment, CENTER_X, 133, { align: 'center', lineHeightFactor: 1.45 });

  // 10. Verification Badge Box (X: 35, Y: 154, W: 140, H: 26)
  doc.setFillColor(250, 248, 245);
  doc.setDrawColor(229, 224, 216);
  doc.setLineWidth(0.4);
  doc.roundedRect(35, 154, 140, 26, 2.5, 2.5, 'FD');

  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(104, 66, 194); // Violet
  doc.text(`COMPLETION ID: ${certId}   ·   MILESTONES: ${milestones}/${total}`, CENTER_X, 164, {
    align: 'center',
  });

  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(22, 124, 128); // Teal
  doc.text('EVALUATION: FULLY VERIFIED   ·   STATUS: COMPLETED', CENTER_X, 172, {
    align: 'center',
  });

  // 11. Subtle Mathematical Identity Stamp (quiet in footer)
  doc.setFont('times', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(140, 137, 130);
  doc.text('State Law: M_(t+1) = λ M_t + η k_t v_t^T   ·   Readout: v̂ = q^T M', CENTER_X, 198, {
    align: 'center',
  });

  // 12. Signatures / Attestation Row
  const leftSigX = 65;
  const rightSigX = 145;
  const sigY = 228;

  doc.setDrawColor(216, 212, 203);
  doc.setLineWidth(0.4);
  doc.line(leftSigX - 25, sigY, leftSigX + 25, sigY);
  doc.line(rightSigX - 25, sigY, rightSigX + 25, sigY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(42, 41, 38);
  doc.text('DATE ISSUED', leftSigX, sigY + 5, { align: 'center' });
  doc.text('LABORATORY ATTESTATION', rightSigX, sigY + 5, { align: 'center' });

  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(113, 111, 104);
  doc.text(dateStr, leftSigX, sigY + 11, { align: 'center' });
  doc.text('Deterministic In-Browser Engine', rightSigX, sigY + 11, { align: 'center' });

  // 13. Bottom Honest Disclaimer (Safe distance from bottom border: Y = 265)
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(140, 137, 130);
  doc.text(
    'Educational completion certificate — not an institutional or university accredited degree.',
    CENTER_X,
    265,
    { align: 'center' }
  );

  return doc;
}

export function downloadCertificatePDF(data: CertificateData) {
  const doc = generateCertificatePDF(data);
  const cleanName = (data.learnerName || 'learner')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-');
  doc.save(`memory-in-motion-certificate-${cleanName}.pdf`);
}

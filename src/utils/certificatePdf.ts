import { jsPDF } from 'jspdf';

export interface CertificateData {
  learnerName: string;
  certificateId: string;
  dateIssued?: string;
  milestonesCount?: number;
  totalMilestones?: number;
  completionPercentage?: number;
  finalChallengeStatus?: string;
}

/**
 * Generates an elegant, publication-grade A4 portrait PDF certificate of completion.
 * Strictly 210mm x 297mm with 16mm safe margins on all sides.
 * Exactly mirrors the on-screen CertificateDocument.
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
  const SAFE_MARGIN = 16; // 16mm strict safe margin

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

  // 1. Warm paper background (#FBF9F5)
  doc.setFillColor(251, 249, 245);
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');

  // 2. Outer elegant neutral border (16mm margin)
  doc.setDrawColor(216, 212, 203);
  doc.setLineWidth(0.6);
  doc.rect(SAFE_MARGIN, SAFE_MARGIN, PAGE_WIDTH - 2 * SAFE_MARGIN, PAGE_HEIGHT - 2 * SAFE_MARGIN);

  // 3. Inner restrained accent border (18.5mm margin)
  const innerMargin = SAFE_MARGIN + 2.5;
  doc.setDrawColor(104, 66, 194);
  doc.setLineWidth(0.3);
  doc.rect(innerMargin, innerMargin, PAGE_WIDTH - 2 * innerMargin, PAGE_HEIGHT - 2 * innerMargin);

  // 4. Corner tick accents
  doc.setDrawColor(104, 66, 194);
  doc.setLineWidth(0.6);
  // Top-left
  doc.line(innerMargin, innerMargin + 4, innerMargin + 4, innerMargin + 4);
  doc.line(innerMargin + 4, innerMargin, innerMargin + 4, innerMargin + 4);
  // Top-right
  doc.line(PAGE_WIDTH - innerMargin, innerMargin + 4, PAGE_WIDTH - innerMargin - 4, innerMargin + 4);
  doc.line(PAGE_WIDTH - innerMargin - 4, innerMargin, PAGE_WIDTH - innerMargin - 4, innerMargin + 4);
  // Bottom-left
  doc.line(innerMargin, PAGE_HEIGHT - innerMargin - 4, innerMargin + 4, PAGE_HEIGHT - innerMargin - 4);
  doc.line(innerMargin + 4, PAGE_HEIGHT - innerMargin, innerMargin + 4, PAGE_HEIGHT - innerMargin - 4);
  // Bottom-right
  doc.line(PAGE_WIDTH - innerMargin, PAGE_HEIGHT - innerMargin - 4, PAGE_WIDTH - innerMargin - 4, PAGE_HEIGHT - innerMargin - 4);
  doc.line(PAGE_WIDTH - innerMargin - 4, PAGE_HEIGHT - innerMargin, PAGE_WIDTH - innerMargin - 4, PAGE_HEIGHT - innerMargin - 4);

  // 5. Logo Mark (Memory + Recurrent loop + State node)
  const logoY = 24;
  doc.setFillColor(243, 239, 255); // #F3EFFF
  doc.setDrawColor(104, 66, 194); // #6842C2
  doc.setLineWidth(0.3);
  doc.roundedRect(CENTER_X - 6, logoY, 12, 12, 2.5, 2.5, 'FD');

  // Recurrent M continuous line
  doc.setDrawColor(104, 66, 194);
  doc.setLineWidth(0.65);
  doc.line(CENTER_X - 3.5, logoY + 9.5, CENTER_X - 3.5, logoY + 4.5);
  doc.line(CENTER_X - 3.5, logoY + 4.5, CENTER_X - 1.2, logoY + 6.8);
  doc.line(CENTER_X - 1.2, logoY + 6.8, CENTER_X + 1.2, logoY + 4.5);
  doc.line(CENTER_X + 1.2, logoY + 4.5, CENTER_X + 3.5, logoY + 9.5);

  // Active state node
  doc.setFillColor(40, 124, 124); // #287C7C
  doc.circle(CENTER_X, logoY + 6.8, 0.75, 'F');

  // 6. Header: Lab Name
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(113, 111, 104);
  doc.text('MEMORY IN MOTION · INTERACTIVE SCIENTIFIC LABORATORY', CENTER_X, 42, { align: 'center' });

  // 7. Main Certificate Title
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(21, 21, 21);
  doc.text('CERTIFICATE OF COMPLETION', CENTER_X, 58, { align: 'center' });

  // Thin decorative divider line
  doc.setDrawColor(216, 212, 203);
  doc.setLineWidth(0.4);
  doc.line(CENTER_X - 25, 66, CENTER_X + 25, 66);

  // 8. Presentation Line
  doc.setFont('times', 'italic');
  doc.setFontSize(12.5);
  doc.setTextColor(113, 111, 104);
  doc.text('This certifies that', CENTER_X, 78, { align: 'center' });

  // 9. Learner Name (Dynamically sized and wrapped to prevent any clipping)
  let nameFontSize = 24;
  if (name.length > 28) {
    nameFontSize = 17;
  } else if (name.length > 18) {
    nameFontSize = 20;
  }
  doc.setFont('times', 'bold');
  doc.setFontSize(nameFontSize);
  doc.setTextColor(21, 21, 21);
  const nameLines = doc.splitTextToSize(name, 140);
  doc.text(nameLines, CENTER_X, 93, { align: 'center' });

  // Decorative underline beneath name
  doc.setDrawColor(229, 224, 216);
  doc.setLineWidth(0.3);
  doc.line(CENTER_X - 40, 103, CENTER_X + 40, 103);

  // 10. Completion Declaration
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(82, 80, 74);
  doc.text('has completed', CENTER_X, 114, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(21, 21, 21);
  doc.text('IN-CONTEXT LEARNING WITH RECURRENT MEMORY', CENTER_X, 122, { align: 'center' });

  // Scope quote
  doc.setFont('times', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(82, 80, 74);
  const quoteText =
    '"An interactive laboratory exploring recurrent state, retrieval, interference and its connection to BDH."';
  const wrappedQuote = doc.splitTextToSize(quoteText, 140);
  doc.text(wrappedQuote, CENTER_X, 133, { align: 'center', lineHeightFactor: 1.4 });

  // 11. Verification Metadata Box (X: 35, Y: 152, W: 140, H: 28)
  doc.setFillColor(250, 248, 245);
  doc.setDrawColor(229, 224, 216);
  doc.setLineWidth(0.4);
  doc.roundedRect(35, 152, 140, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(113, 111, 104);
  doc.text('Completion ID:', 42, 162);
  doc.text('Date Issued:', 108, 162);
  doc.text('Experiments Completed:', 42, 172);
  doc.text('Final Challenge:', 108, 172);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(104, 66, 194); // Violet for ID
  doc.text(certId, 68, 162);

  doc.setTextColor(21, 21, 21);
  doc.text(dateStr, 127, 162);

  doc.setTextColor(40, 124, 124); // Teal for experiments
  doc.text(`${milestones} / ${total}`, 77, 172);

  doc.setTextColor(36, 122, 75); // Forest green for verified
  doc.text(finalChallengeStatus, 131, 172);

  // 12. Attestation Row
  const leftSigX = 65;
  const rightSigX = 145;
  const sigY = 224;

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

  // 13. Bottom Honest Disclaimer (Safe distance from bottom border: Y = 258)
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(140, 137, 130);
  doc.text(
    'Educational completion certificate — not an institutional or professional certification.',
    CENTER_X,
    258,
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

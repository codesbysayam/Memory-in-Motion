import React from 'react';
import { X, Shield, FileText } from 'lucide-react';

interface LegalModalProps {
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col bg-[var(--surface)] text-[var(--text-primary)] rounded-xl border border-[var(--border)] shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-soft)]">
          <div className="flex items-center gap-2.5">
            {type === 'privacy' ? (
              <Shield className="w-5 h-5 text-[var(--accent-blue-text)]" />
            ) : (
              <FileText className="w-5 h-5 text-[var(--accent-blue-text)]" />
            )}
            <h3 className="font-sans text-lg font-semibold text-[var(--text-primary)]">
              {type === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] transition-colors cursor-pointer"
            aria-label="Close legal modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
          {type === 'privacy' ? (
            <>
              <div className="p-3.5 rounded-lg bg-[var(--color-success-soft)] border border-[var(--color-success-border)] text-[var(--color-success)] text-xs font-medium">
                <strong>Zero Data Harvesting:</strong> Memory in Motion is an offline-capable educational laboratory. All calculations, state transitions, and test scores run 100% locally in your browser.
              </div>

              <div className="text-[11px] text-[var(--text-muted)] font-mono">
                Last updated: March 2026 · Contact: <a href="mailto:obsidianoptics.in@gmail.com" className="text-[var(--accent-blue-text)] underline">obsidianoptics.in@gmail.com</a>
              </div>

              <h4 className="font-sans font-semibold text-[var(--text-primary)] text-base">1. Information Collection & Storage</h4>
              <p>
                We do not collect, transmit, or sell personal data. No accounts are required to use this laboratory. All state data (including milestone progression and 60-second test attempts) is saved strictly in your browser’s local client storage (<code className="px-1.5 py-0.5 rounded bg-[var(--surface-soft)] border border-[var(--border)] text-[var(--text-primary)] font-mono text-xs">localStorage</code>).
              </p>

              <h4 className="font-sans font-semibold text-[var(--text-primary)] text-base">2. Third-Party Services</h4>
              <p>
                This application is hosted on Google Cloud Run and loads standard open-source typography from Google Fonts (DM Sans, Newsreader, and JetBrains Mono). We do not embed third-party advertising or cross-site tracking cookies.
              </p>

              <h4 className="font-sans font-semibold text-[var(--text-primary)] text-base">3. Analytics & Telemetry</h4>
              <p>
                Optional, privacy-preserving performance telemetry is only recorded if explicitly consented to via the privacy preferences banner. No personally identifiable information (PII) is ever attached.
              </p>

              <h4 className="font-sans font-semibold text-[var(--text-primary)] text-base">4. Inquiries & Contact</h4>
              <p>
                For questions regarding this educational platform or scientific inquiries, contact: <code className="px-1.5 py-0.5 rounded bg-[var(--surface-soft)] border border-[var(--border)] text-[var(--text-primary)] font-mono text-xs">obsidianoptics.in@gmail.com</code>.
              </p>
            </>
          ) : (
            <>
              <div className="p-3.5 rounded-lg bg-[var(--accent-blue)] border border-[var(--color-border-strong)] text-[var(--accent-blue-text)] text-xs font-medium">
                <strong>Educational License:</strong> Memory in Motion is created for public scientific research and educational dissemination under open principles.
              </div>

              <div className="text-[11px] text-[var(--text-muted)] font-mono">
                Last updated: March 2026 · Contact: <a href="mailto:obsidianoptics.in@gmail.com" className="text-[var(--accent-blue-text)] underline">obsidianoptics.in@gmail.com</a>
              </div>

              <h4 className="font-sans font-semibold text-[var(--text-primary)] text-base">1. Educational Nature</h4>
              <p>
                All demonstrations, interactive matrices, and particle simulations are intended for educational and research exploration of recurrent neural representations.
              </p>

              <h4 className="font-sans font-semibold text-[var(--text-primary)] text-base">2. Scientific Attribution</h4>
              <p>
                Concepts relating to the Dragon Hatchling (BDH) architecture and associative recurrent models reference Pathway's published research (arXiv:2509.26507).
              </p>

              <h4 className="font-sans font-semibold text-[var(--text-primary)] text-base">3. Disclaimer of Warranties & Limitation of Liability</h4>
              <p>
                This software is provided "as is", without warranty of any kind, express or implied. In no event shall the authors, maintainers, or host organization be liable for any claim, damages, or liabilities arising from the use of this educational site.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[var(--border)] bg-[var(--surface-soft)] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-primary text-xs"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

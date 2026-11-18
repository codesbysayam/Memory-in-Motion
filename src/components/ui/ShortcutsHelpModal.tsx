import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GLOBAL_SHORTCUTS = [
  { key: 'N', label: 'Next stage', detail: 'Advance through stages 01 → 07 (paused during timed test)' },
  { key: 'P', label: 'Previous stage', detail: 'Return to the preceding stage (paused during timed test)' },
  { key: 'G', label: 'Concept glossary', detail: 'Toggle searchable definitions and tensor laws' },
  { key: 'C', label: 'Table of contents', detail: 'Open stage & subsection index drawer' },
  { key: '?', label: 'Keyboard reference', detail: 'Show or dismiss this reference panel' },
  { key: 'Esc', label: 'Dismiss overlay', detail: 'Close active modals, drawers, or menus' },
];

const LAB_SHORTCUTS = [
  { key: 'R', label: 'Reset lab parameters', detail: 'Restore default Interference Lab baseline (Stage 02)' },
  { key: 'Enter', label: 'Re-run trial', detail: 'Re-evaluate current parameters & append notebook log' },
  { key: '1–4', label: 'Set dimension D', detail: 'Quick-switch matrix width D ∈ {4, 8, 16, 32}' },
  { key: '← / →', label: 'Step assessment', detail: 'Navigate between checked steps during 60s verification' },
];

export const ShortcutsHelpModal: React.FC<ShortcutsHelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-title"
    >
      <div
        className="w-full max-w-xl rounded-lg border border-[var(--mm-rule)] bg-[var(--surface)] text-[var(--text-primary)] shadow-[var(--shadow-popover)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[var(--mm-rule)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Keyboard className="w-4 h-4 text-[var(--mm-signal)]" />
            <div>
              <h2
                id="shortcuts-modal-title"
                className="font-serif text-lg font-medium text-[var(--text-primary)] leading-tight"
              >
                Keyboard Shortcuts
              </h2>
              <p className="text-xs text-[var(--text-secondary)] font-sans">
                Direct navigation across stages, glossary, and simulation controls
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close keyboard shortcuts"
            className="p-1.5 rounded border border-[var(--mm-rule)] hover:bg-[var(--surface-soft)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          <div className="space-y-2.5">
            <div className="essay-eyebrow">Global Essay Navigation</div>
            <div className="divide-y divide-[var(--mm-rule)] border-t border-b border-[var(--mm-rule)]">
              {GLOBAL_SHORTCUTS.map((item) => (
                <div
                  key={item.key}
                  className="py-2.5 flex items-baseline justify-between gap-4 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-sans font-semibold text-[var(--text-primary)] text-sm">
                      {item.label}
                    </div>
                    <div className="font-sans text-[var(--text-secondary)]">
                      {item.detail}
                    </div>
                  </div>
                  <kbd className="px-2 py-0.5 rounded bg-[var(--surface-soft)] border border-[var(--mm-rule-strong)] font-mono text-xs font-semibold text-[var(--text-primary)] shrink-0">
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="essay-eyebrow">Laboratory &amp; Assessment Shortcuts</div>
            <div className="divide-y divide-[var(--mm-rule)] border-t border-b border-[var(--mm-rule)]">
              {LAB_SHORTCUTS.map((item) => (
                <div
                  key={item.key}
                  className="py-2.5 flex items-baseline justify-between gap-4 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-sans font-semibold text-[var(--text-primary)] text-sm">
                      {item.label}
                    </div>
                    <div className="font-sans text-[var(--text-secondary)]">
                      {item.detail}
                    </div>
                  </div>
                  <kbd className="px-2 py-0.5 rounded bg-[var(--surface-soft)] border border-[var(--mm-rule-strong)] font-mono text-xs font-semibold text-[var(--text-primary)] shrink-0">
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-[var(--mm-rule)] bg-[var(--surface-soft)] flex items-center justify-between text-xs text-[var(--text-muted)] font-mono">
          <span>Ignored when typing in text fields</span>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

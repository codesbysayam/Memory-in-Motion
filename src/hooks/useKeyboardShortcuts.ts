import { useEffect } from 'react';
import { PageId } from '../components/navigation/ResearchNav';

export const STAGE_ORDER: PageId[] = [
  'memory',
  'break',
  'trace',
  'measure',
  'bdh',
  'reason',
  'prove',
];

const STAGE_LABELS: Record<PageId, string> = {
  memory: '01 Memory',
  break: '02 Break',
  trace: '03 Trace',
  measure: '04 Measure',
  bdh: '05 BDH',
  reason: '06 Reason',
  prove: '07 Prove',
  docs: 'Docs',
  privacy: 'Privacy',
  terms: 'Terms',
  '404': '404',
};

interface UseKeyboardShortcutsOptions {
  currentPage: PageId;
  onPageChange: (page: PageId) => void;
  onToggleGlossary: () => void;
  onToggleHelp: () => void;
  onShortcutTriggered?: (message: string) => void;
  isHelpOpen?: boolean;
  onCloseHelp?: () => void;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toUpperCase();
  if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') {
    return true;
  }
  if (target.isContentEditable || target.closest('[contenteditable="true"]')) {
    return true;
  }
  return false;
}

export function useKeyboardShortcuts({
  currentPage,
  onPageChange,
  onToggleGlossary,
  onToggleHelp,
  onShortcutTriggered,
  isHelpOpen = false,
  onCloseHelp,
}: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === 'Escape') {
        if (
          document.activeElement instanceof HTMLElement &&
          document.activeElement.closest('[role="dialog"]')
        ) {
          document.activeElement.blur();
        }
        if (isHelpOpen && onCloseHelp) {
          onCloseHelp();
        }
        window.dispatchEvent(new CustomEvent('close_all_overlays'));
        return;
      }

      if (isEditableTarget(e.target)) return;

      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault();
        onToggleHelp();
        return;
      }

      const lower = e.key.toLowerCase();

      if (lower === 'g') {
        e.preventDefault();
        onToggleGlossary();
        onShortcutTriggered?.('Toggled Concept Glossary [G]');
        return;
      }

      if (lower === 'c') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('toggle_toc_drawer'));
        onShortcutTriggered?.('Toggled Table of Contents [C]');
        return;
      }

      // Pause N / P stage navigation while a timed 60-second assessment is actively running
      const isAssessmentActive = Boolean(
        document.querySelector('[data-assessment-active="true"]')
      );
      if (isAssessmentActive) return;

      const stageIdx = STAGE_ORDER.indexOf(currentPage);

      if (lower === 'n') {
        e.preventDefault();
        const nextIdx = stageIdx >= 0 ? Math.min(STAGE_ORDER.length - 1, stageIdx + 1) : 0;
        const target = STAGE_ORDER[nextIdx];
        if (nextIdx !== stageIdx || stageIdx < 0) {
          onPageChange(target);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          onShortcutTriggered?.(`Stage ${STAGE_LABELS[target]} [N]`);
        }
        return;
      }

      if (lower === 'p') {
        e.preventDefault();
        const prevIdx = stageIdx >= 0 ? Math.max(0, stageIdx - 1) : 0;
        const target = STAGE_ORDER[prevIdx];
        if (prevIdx !== stageIdx || stageIdx < 0) {
          onPageChange(target);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          onShortcutTriggered?.(`Stage ${STAGE_LABELS[target]} [P]`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentPage,
    onPageChange,
    onToggleGlossary,
    onToggleHelp,
    onShortcutTriggered,
    isHelpOpen,
    onCloseHelp,
  ]);
}

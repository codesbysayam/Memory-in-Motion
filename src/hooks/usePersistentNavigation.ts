import { useState, useEffect, useRef, useCallback } from 'react';
import { PageId, PAGES } from '../components/navigation/ResearchNav';

const VALID_PAGES: PageId[] = ['memory', 'break', 'trace', 'measure', 'bdh', 'reason', 'prove'];

export const STORAGE_PAGE_KEY = 'memory_in_motion_current_page';
export const STORAGE_SCROLL_KEY = 'memory_in_motion_scroll_state';

export interface PersistentScrollData {
  positions: Partial<Record<PageId, number>>;
  lastPage: PageId;
  lastScrollY: number;
  timestamp: number;
}

/**
 * Safely parse JSON from localStorage
 */
function getStoredScrollData(): PersistentScrollData {
  try {
    const raw = localStorage.getItem(STORAGE_SCROLL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.positions) {
        return parsed as PersistentScrollData;
      }
    }
  } catch (err) {
    console.warn('Could not read persistent scroll state from localStorage', err);
  }
  return {
    positions: {},
    lastPage: 'memory',
    lastScrollY: 0,
    timestamp: Date.now(),
  };
}

/**
 * Safely resolve the initial PageId on load:
 * 1. URL Hash (e.g. #break or #break/section-04) takes first priority if explicitly present
 * 2. localStorage saved 'memory_in_motion_current_page'
 * 3. Default to 'memory'
 */
function getInitialPage(): { page: PageId; subsectionId?: string } {
  try {
    const rawHash = window.location.hash.replace('#', '').trim();
    if (rawHash) {
      const [pagePart, subsectionPart] = rawHash.split('/');
      if (VALID_PAGES.includes(pagePart as PageId)) {
        return {
          page: pagePart as PageId,
          subsectionId: subsectionPart || undefined,
        };
      }
    }

    const storedPage = localStorage.getItem(STORAGE_PAGE_KEY);
    if (storedPage && VALID_PAGES.includes(storedPage as PageId)) {
      return { page: storedPage as PageId };
    }
  } catch (err) {
    console.warn('Error resolving initial page state', err);
  }

  return { page: 'memory' };
}

export function usePersistentNavigation() {
  const initial = useRef(getInitialPage()).current;
  const [currentPage, setCurrentPage] = useState<PageId>(initial.page);
  const [isRestored, setIsRestored] = useState<boolean>(false);

  // Track if user has interacted/scrolled manually so we don't fight their input
  const userHasScrolledManually = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  /**
   * Scroll smoothly to a named subsection DOM ID and apply a subtle focus ring
   */
  const scrollToSubsection = useCallback((sectionId: string) => {
    let attempts = 0;
    const maxAttempts = 7;
    const delays = [0, 40, 100, 200, 350, 550, 800];

    const tryScroll = () => {
      const el = document.getElementById(sectionId);
      if (el) {
        const headerOffset = 76;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: Math.max(0, offsetPosition),
          left: 0,
          behavior: 'smooth',
        });

        // Visual highlight pulse
        el.classList.add('ring-2', 'ring-[#6842C2]', 'ring-offset-4', 'rounded-xl', 'transition-all', 'duration-500');
        setTimeout(() => {
          el.classList.remove('ring-2', 'ring-[#6842C2]', 'ring-offset-4', 'rounded-xl');
        }, 2200);
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(tryScroll, delays[attempts] || 200);
      }
    };

    tryScroll();
  }, []);

  /**
   * Handle changing pages or jumping to a subsection
   */
  const handlePageChange = useCallback(
    (page: PageId, sectionId?: string) => {
      userHasScrolledManually.current = true;
      setCurrentPage(page);

      try {
        localStorage.setItem(STORAGE_PAGE_KEY, page);
      } catch (err) {
        console.warn('Failed to save current page to localStorage', err);
      }

      window.location.hash = sectionId ? `${page}/${sectionId}` : page;

      if (sectionId) {
        if (currentPage === page) {
          scrollToSubsection(sectionId);
        } else {
          setTimeout(() => {
            scrollToSubsection(sectionId);
          }, 120);
        }
      } else {
        // When switching to a new page without a subsection anchor, scroll to top
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

        // Update stored scroll position for this new page to 0
        try {
          const stored = getStoredScrollData();
          stored.positions[page] = 0;
          stored.lastPage = page;
          stored.lastScrollY = 0;
          stored.timestamp = Date.now();
          localStorage.setItem(STORAGE_SCROLL_KEY, JSON.stringify(stored));
        } catch (e) {
          // ignore
        }
      }
    },
    [currentPage, scrollToSubsection]
  );

  /**
   * Save current page to localStorage whenever currentPage state changes
   */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PAGE_KEY, currentPage);
    } catch (err) {
      console.warn('Failed to save current page to localStorage', err);
    }
  }, [currentPage]);

  /**
   * Restore scroll position on initial load / refresh
   */
  useEffect(() => {
    const rawHash = window.location.hash.replace('#', '').trim();
    const [, subsectionPart] = rawHash.split('/');

    // If an explicit subsection anchor is present in hash, scroll to that subsection
    if (subsectionPart) {
      const timer = setTimeout(() => {
        scrollToSubsection(subsectionPart);
        setIsRestored(true);
      }, 200);
      return () => clearTimeout(timer);
    }

    // Otherwise, restore saved scroll position for this page from localStorage
    const stored = getStoredScrollData();
    const savedY = stored.positions[currentPage] ?? (stored.lastPage === currentPage ? stored.lastScrollY : 0);

    if (savedY > 0) {
      // Multiple attempts to ensure layout stabilization (e.g. after heavy SVG / chart paints)
      const restoreAttempts = [0, 50, 150, 350];
      const timerIds: number[] = [];

      restoreAttempts.forEach((delay) => {
        const id = window.setTimeout(() => {
          if (!userHasScrolledManually.current) {
            window.scrollTo({
              top: savedY,
              left: 0,
              behavior: 'auto',
            });
          }
        }, delay);
        timerIds.push(id);
      });

      const finalTimer = window.setTimeout(() => {
        setIsRestored(true);
      }, 400);
      timerIds.push(finalTimer);

      return () => {
        timerIds.forEach((id) => clearTimeout(id));
      };
    } else {
      setIsRestored(true);
    }
  }, [currentPage, scrollToSubsection]);

  /**
   * Save scroll position periodically while scrolling and on page unload
   */
  useEffect(() => {
    const saveCurrentScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      try {
        const currentData = getStoredScrollData();
        currentData.positions[currentPage] = Math.round(scrollY);
        currentData.lastPage = currentPage;
        currentData.lastScrollY = Math.round(scrollY);
        currentData.timestamp = Date.now();
        localStorage.setItem(STORAGE_SCROLL_KEY, JSON.stringify(currentData));
      } catch (err) {
        // Quota or disabled localStorage
      }
    };

    const handleScroll = () => {
      userHasScrolledManually.current = true;

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        if (scrollTimeoutRef.current) {
          window.clearTimeout(scrollTimeoutRef.current);
        }
        // Debounce write to localStorage to avoid performance overhead
        scrollTimeoutRef.current = window.setTimeout(() => {
          saveCurrentScroll();
        }, 120);
      });
    };

    // Immediate save before browser reload / navigation away
    const handleBeforeUnload = () => {
      saveCurrentScroll();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [currentPage]);

  /**
   * Listen to external hash changes (e.g. user clicking back/forward buttons)
   */
  useEffect(() => {
    const handleHashChange = () => {
      const raw = window.location.hash.replace('#', '');
      const [pagePart, sectionPart] = raw.split('/');
      if (VALID_PAGES.includes(pagePart as PageId)) {
        userHasScrolledManually.current = true;
        setCurrentPage(pagePart as PageId);
        try {
          localStorage.setItem(STORAGE_PAGE_KEY, pagePart);
        } catch (e) {
          // ignore
        }
        if (sectionPart) {
          setTimeout(() => {
            scrollToSubsection(sectionPart);
          }, 120);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [scrollToSubsection]);

  return {
    currentPage,
    setCurrentPage,
    handlePageChange,
    scrollToSubsection,
    isRestored,
  };
}

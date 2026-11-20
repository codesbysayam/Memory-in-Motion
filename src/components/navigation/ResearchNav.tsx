import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Award,
  BookOpen,
  ListTree,
  ArrowRight,
  Keyboard,
  FileText,
} from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import { LogoMark } from '../ui/LogoMark';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';

export type PageId =
  | 'memory'
  | 'break'
  | 'trace'
  | 'measure'
  | 'bdh'
  | 'reason'
  | 'prove'
  | 'docs'
  | 'privacy'
  | 'terms'
  | '404';

export interface NavSubsection {
  id: string;
  num: string;
  title: string;
  shortTitle: string;
  description: string;
  badge?: string;
}

export interface PageInfo {
  id: PageId;
  num: string;
  title: string;
  subtitle: string;
  subsections?: NavSubsection[];
}

export const PAGES: PageInfo[] = [
  {
    id: 'memory',
    num: '01',
    title: 'Memory',
    subtitle: 'Where memory lives',
    subsections: [
      {
        id: 'section-01',
        num: '01.1',
        title: 'The Memory Problem',
        shortTitle: 'Memory Problem',
        description: 'Fixed-size recurrent state vs. unbounded token KV cache',
        badge: 'Foundation',
      },
      {
        id: 'section-02',
        num: '01.2',
        title: 'Growing Context & KV-Cache',
        shortTitle: 'Growing Context',
        description: 'Token sequence expansion in standard Transformers',
        badge: 'KV-Cache',
      },
      {
        id: 'section-03',
        num: '01.3',
        title: 'Recurrent State Ingestion',
        shortTitle: 'Recurrent Memory',
        description: 'Fixed-size matrix coordinate ingestion and linear readout',
        badge: 'Matrix State',
      },
      {
        id: 'section-hebbian-plasticity',
        num: '01.4',
        title: 'Hebbian Plasticity & Fast Weights',
        shortTitle: 'Hebbian Plasticity',
        description: 'Outer-product updates: M_{t+1} = λM_t + η k_t v_t^⊤',
        badge: 'Core Law',
      },
      {
        id: 'section-context-order',
        num: '01.5',
        title: 'Context Presentation Order',
        shortTitle: 'Context Order',
        description: 'Recency bias and ordering sensitivity in sequential memory',
        badge: 'Mechanistic',
      },
    ],
  },
  {
    id: 'break',
    num: '02',
    title: 'Break',
    subtitle: 'Inducing failure',
    subsections: [
      {
        id: 'section-04',
        num: '02.1',
        title: 'Memory Boundary Stress-Test',
        shortTitle: 'Boundary Stress',
        description: 'Manipulate retention, sequence length, and dimension',
        badge: 'Stress Lab',
      },
      {
        id: 'section-04-limits',
        num: '02.2',
        title: 'Capacity Limits & Collision Points',
        shortTitle: 'Capacity Limits',
        description: 'Empirical failure threshold when sequence length exceeds D',
        badge: 'Collisions',
      },
      {
        id: 'section-interference-matrix',
        num: '02.3',
        title: 'Interference Cross-Talk Heatmap',
        shortTitle: 'Interference Heatmap',
        description: 'Pairwise geometric coordinate overlap and crosstalk',
        badge: 'Geometry',
      },
    ],
  },
  {
    id: 'trace',
    num: '03',
    title: 'Trace',
    subtitle: 'Inside the state',
    subsections: [
      {
        id: 'section-05',
        num: '03.1',
        title: 'Find the Failure Challenge',
        shortTitle: 'Failure Challenge',
        description: 'Predict whether the recurrent state will remember or forget',
        badge: 'Prediction',
      },
      {
        id: 'section-05-deltas',
        num: '03.2',
        title: 'Coordinate Delta Inspection',
        shortTitle: 'Delta Inspection',
        description: 'Track coordinate shifts ΔM_t after each fact write',
        badge: 'ΔM Trace',
      },
      {
        id: 'memory-surgery',
        num: '03.3',
        title: 'Counterfactual Memory Surgery',
        shortTitle: 'Memory Surgery',
        description: 'Isolate the causal footprint of a single omitted fact',
        badge: 'Intervention',
      },
      {
        id: 'debug-panel-section',
        num: '03.4',
        title: 'Diagnostic Debug Console',
        shortTitle: 'Debug Console',
        description: 'Live Frobenius norm, prediction confidence, and margins',
        badge: 'Diagnostics',
      },
    ],
  },
  {
    id: 'measure',
    num: '04',
    title: 'Measure',
    subtitle: 'Capacity bounds',
    subsections: [
      {
        id: 'section-measure',
        num: '04.1',
        title: 'Empirical Retrieval Curves',
        shortTitle: 'Retrieval Curves',
        description: 'Retrieval accuracy vs. sequence length across dimensions',
        badge: 'Empirical',
      },
      {
        id: 'section-capacity-bounds',
        num: '04.2',
        title: 'Information Capacity Bounds',
        shortTitle: 'Capacity Bounds',
        description: 'O(D) theoretical bound under linear superposition',
        badge: 'Theory',
      },
      {
        id: 'section-frobenius-drift',
        num: '04.3',
        title: 'Energy & Frobenius Norm Drift',
        shortTitle: 'Frobenius Drift',
        description: 'Accumulation of ||M||_F energy and coordinate drift',
        badge: 'Norm ||M||',
      },
    ],
  },
  {
    id: 'bdh',
    num: '05',
    title: 'BDH',
    subtitle: 'Synaptic networks',
    subsections: [
      {
        id: 'section-06',
        num: '05.1',
        title: 'Why Architecture Matters',
        shortTitle: 'Architecture Limits',
        description: 'Transitioning from monolithic vectors to graph topologies',
        badge: 'Motivation',
      },
      {
        id: 'section-07',
        num: '05.2',
        title: 'Meet Dragon Hatchling (BDH)',
        shortTitle: 'Meet BDH',
        description: 'Sparse particle graph architecture with local plasticity',
        badge: 'Frontier',
      },
      {
        id: 'section-bdh-plasticity',
        num: '05.3',
        title: 'Synaptic Hebbian Plasticity in BDH',
        shortTitle: 'Synaptic Plasticity',
        description: 'Decentralized local learning in plastic synapses',
        badge: 'Hebbian',
      },
      {
        id: 'bdh-microscope-explorer',
        num: '05.4',
        title: 'Graph Particle Microscope',
        shortTitle: 'BDH Microscope',
        description: 'Explore individual neurons, synapse activations, and topologies',
        badge: 'Interactive',
      },
      {
        id: 'bdh-synaptic-heatmap',
        num: '05.5',
        title: 'Synaptic Weight Activity Heatmap',
        shortTitle: 'Synaptic Heatmap',
        description: 'Matrix heatmap of synaptic weights during memory retrieval sequence',
        badge: 'Heatmap',
      },
    ],
  },
  {
    id: 'reason',
    num: '06',
    title: 'Reason',
    subtitle: 'Latent dynamics',
    subsections: [
      {
        id: 'section-09',
        num: '06.1',
        title: 'Synaptic Particle Playground',
        shortTitle: 'Particle Playground',
        description: 'Live particle simulation of graph relaxation dynamics',
        badge: 'Physics Sim',
      },
      {
        id: 'section-10',
        num: '06.2',
        title: 'BDH-CQ Latent Relaxation',
        shortTitle: 'Latent Thinking',
        description: 'Continuous latent thinking loops before token emission',
        badge: 'Continuous',
      },
      {
        id: 'section-so-what',
        num: '06.3',
        title: 'Synthesis & Core Implications',
        shortTitle: 'Takeaways',
        description: 'What plastic recurrent memory means for modern AI',
        badge: 'Synthesis',
      },
    ],
  },
  {
    id: 'prove',
    num: '07',
    title: 'Prove',
    subtitle: 'Evaluation & certificate',
    subsections: [
      {
        id: 'sixty-second-test',
        num: '07.1',
        title: '60-Second Fast Verification',
        shortTitle: '60s Verification',
        description: 'Quick structured test of your experimental understanding',
        badge: 'Verification',
      },
      {
        id: 'final-challenge',
        num: '07.2',
        title: 'Diagnostic Prediction Challenge',
        shortTitle: 'Diagnostic Lab',
        description: 'Test your predictions against empirical ground truth',
        badge: 'Challenge',
      },
      {
        id: 'concept-synthesis-map',
        num: '07.3',
        title: 'Concept Synthesis Map',
        shortTitle: 'Concept Map',
        description: 'Taxonomy connecting Hebbian plasticity, state, and BDH',
        badge: 'Taxonomy',
      },
      {
        id: 'evidence-sources',
        num: '07.4',
        title: 'Epistemic Evidence & Citations',
        shortTitle: 'Citations',
        description: 'Clear distinction between toy models and published literature',
        badge: 'Evidence',
      },
      {
        id: 'you-made-it',
        num: '07.5',
        title: 'Laboratory Certificate & Verification',
        shortTitle: 'Certificate',
        description: 'Review completion criteria and export laboratory certificate',
        badge: 'Certificate',
      },
    ],
  },
];

interface ResearchNavProps {
  currentPage: PageId;
  onPageChange: (page: PageId, sectionId?: string) => void;
  onOpenIndex?: () => void;
  onStartJudgeMode?: () => void;
  onOpenCertificate?: () => void;
  onOpenGlossary?: () => void;
  onOpenDocs?: () => void;
}

export function ResearchNav({
  currentPage,
  onPageChange,
  onStartJudgeMode,
  onOpenCertificate,
  onOpenGlossary,
  onOpenDocs,
}: ResearchNavProps) {
  const reducedMotion = useReducedMotion();
  const [tocDrawerOpen, setTocDrawerOpen] = useState(false);
  const [tocSearch, setTocSearch] = useState('');
  const [scrollRatio, setScrollRatio] = useState(0);

  const currentIndex = PAGES.findIndex((p) => p.id === currentPage);
  const currentPageInfo = currentIndex >= 0 ? PAGES[currentIndex] : null;
  const chapterProgressPct =
    currentIndex >= 0 ? ((currentIndex + Math.min(1, scrollRatio)) / PAGES.length) * 100 : 100;

  useEffect(() => {
    const updateScroll = () => {
      const doc = document.documentElement;
      const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
      setScrollRatio(Math.max(0, Math.min(1, window.scrollY / maxScroll)));
    };
    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    return () => window.removeEventListener('scroll', updateScroll);
  }, [currentPage]);

  const handleSelect = (id: PageId) => {
    setTocDrawerOpen(false);
    onPageChange(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubsectionSelect = (pageId: PageId, subsectionId: string) => {
    setTocDrawerOpen(false);
    onPageChange(pageId, subsectionId);
  };

  const filteredPages = PAGES.map((p) => {
    if (!tocSearch.trim()) return p;
    const query = tocSearch.toLowerCase();
    const stageMatch =
      p.title.toLowerCase().includes(query) || p.subtitle.toLowerCase().includes(query);
    const matchingSubs = p.subsections?.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.shortTitle.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        (s.badge && s.badge.toLowerCase().includes(query))
    );
    if (stageMatch) return p;
    if (matchingSubs && matchingSubs.length > 0) {
      return { ...p, subsections: matchingSubs };
    }
    return null;
  }).filter(Boolean) as PageInfo[];

  const closeDrawer = () => {
    if (
      document.activeElement instanceof HTMLElement &&
      document.activeElement.closest('[aria-label="Essay Chapters & Index"]')
    ) {
      document.activeElement.blur();
    }
    setTocDrawerOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDrawer();
      }
    };
    const handleToggleToc = () => {
      setTocDrawerOpen((prev) => !prev);
    };
    const handleCloseOverlays = () => {
      closeDrawer();
    };

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('toggle_toc_drawer', handleToggleToc);
    window.addEventListener('close_all_overlays', handleCloseOverlays);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('toggle_toc_drawer', handleToggleToc);
      window.removeEventListener('close_all_overlays', handleCloseOverlays);
    };
  }, []);

  return (
    <>
      <header className="site-header no-print">
        <div className="site-header-inner">
          {/* LEFT: Quiet Publication Wordmark + Discreet Chapter Indicator */}
          <div className="header-brand">
            <button
              type="button"
              onClick={() => handleSelect('memory')}
              className="flex items-center gap-2 text-left group cursor-pointer whitespace-nowrap min-w-0 min-h-[40px]"
              title="Return to Cover: Memory in Motion"
              aria-label="Memory in Motion cover"
            >
              <LogoMark size={22} variant="editorial" className="shrink-0" />
              <span className="header-brand-title truncate group-hover:text-[var(--mm-signal)] transition-colors">
                Memory in Motion
              </span>
            </button>

            {currentPageInfo && (
              <div className="hidden lg:flex items-center gap-2.5 pl-3 ml-1 border-l border-[var(--mm-rule)] text-xs font-mono tabular-nums text-[var(--text-muted)] truncate">
                <span>
                  Ch. {currentPageInfo.num} / {String(PAGES.length).padStart(2, '0')}
                </span>
                <span aria-hidden="true" className="text-[var(--mm-rule-strong)]">·</span>
                <span className="font-sans text-[var(--text-secondary)] truncate">
                  {currentPageInfo.title}
                </span>
              </div>
            )}
          </div>

          {/* RIGHT: Restrained Controls (Theme Switcher + Single Chapters Index Drawer Trigger) */}
          <div className="header-actions">
            <ThemeSwitcher />

            <span className="hidden sm:block header-divider" aria-hidden="true" />

            <button
              type="button"
              onClick={() => setTocDrawerOpen(true)}
              className="inline-flex items-center justify-center header-secondary-button"
              title="Open Chapters & Essay Index (Shortcut: C)"
              aria-label="Open Chapters Index"
              aria-expanded={tocDrawerOpen}
            >
              <ListTree className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
              <span>Chapters</span>
              <kbd className="hidden lg:inline-block ml-1 px-1 py-0.2 text-[11px] font-mono text-[var(--text-muted)] border border-[var(--border)] rounded bg-[var(--page-bg)]">
                C
              </kbd>
            </button>
          </div>
        </div>

        {/* Ultra-thin Reading Progress Hairline */}
        <div className="w-full h-[2px] bg-transparent overflow-hidden" aria-hidden="true">
          <div
            className="h-full bg-[var(--mm-signal)] transition-[width] duration-200"
            style={{ width: `${Math.max(4, Math.min(100, chapterProgressPct))}%` }}
          />
        </div>
      </header>

      {/* Unified Chapters & Essay Index Slide-Over Drawer */}
      {tocDrawerOpen && (
        <div
          className={`fixed inset-0 z-50 flex justify-end bg-black/50 ${
            reducedMotion ? '' : 'animate-in fade-in duration-150'
          }`}
          onClick={closeDrawer}
        >
          <div
            className={`w-full max-w-lg bg-[var(--page-bg)] text-[var(--text-primary)] h-full shadow-[var(--shadow-popover)] flex flex-col border-l border-[var(--border)] ${
              reducedMotion ? '' : 'animate-in slide-in-from-right-6 duration-200'
            }`}
            role="dialog"
            aria-modal="true"
            aria-label="Essay Chapters & Index"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-[var(--mm-rule)] bg-[var(--mm-paper-bright)] flex items-center justify-between gap-3">
              <div>
                <span className="essay-eyebrow block text-[var(--mm-signal)]">Essay index</span>
                <h2 className="font-serif text-xl font-normal text-[var(--text-primary)] leading-tight mt-0.5">
                  Seven Chapters on Recurrent Memory
                </h2>
              </div>

              <button
                type="button"
                onClick={closeDrawer}
                className="min-w-[44px] min-h-[44px] rounded-md hover:bg-[var(--surface-soft)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
                aria-label="Close Chapters Index"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="px-6 py-3.5 border-b border-[var(--mm-rule)] bg-[var(--page-bg)]">
              <input
                type="text"
                placeholder="Filter chapters or topics (e.g., Hebbian, capacity, BDH)..."
                value={tocSearch}
                onChange={(e) => setTocSearch(e.target.value)}
                className="w-full min-h-[40px] px-3.5 py-2 rounded-md bg-[var(--mm-paper-bright)] border border-[var(--mm-rule)] text-xs font-sans text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--mm-signal)]"
              />
            </div>

            {/* Hairline Chapter & Subsection Index */}
            <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[var(--mm-rule)]">
              {filteredPages.length === 0 ? (
                <div className="text-center py-12 text-xs text-[var(--text-secondary)]">
                  No chapters or sections matching &ldquo;{tocSearch}&rdquo;.
                </div>
              ) : (
                filteredPages.map((page) => {
                  const isCurrent = page.id === currentPage;
                  return (
                    <div key={page.id} className="py-5 first:pt-2 last:pb-4 space-y-2.5">
                      <div className="flex items-baseline justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => handleSelect(page.id)}
                          className={`text-left group flex items-baseline gap-2.5 cursor-pointer min-h-[40px] ${
                            isCurrent ? 'text-[var(--mm-signal)]' : 'text-[var(--text-primary)]'
                          }`}
                        >
                          <span className="font-mono text-xs font-semibold tabular-nums text-[var(--mm-signal)]">
                            {page.num}
                          </span>
                          <span className="font-serif text-lg font-normal group-hover:text-[var(--mm-signal)] transition-colors">
                            {page.title}
                          </span>
                          <span className="text-xs font-sans text-[var(--text-muted)] hidden sm:inline">
                            — {page.subtitle}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSelect(page.id)}
                          className="text-xs font-sans text-[var(--mm-signal)] hover:underline inline-flex items-center gap-1 cursor-pointer shrink-0 min-h-[36px]"
                        >
                          <span>{isCurrent ? 'Top' : 'Read'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                      {page.subsections && page.subsections.length > 0 && (
                        <div className="pl-4 border-l border-[var(--mm-rule)] space-y-0.5">
                          {page.subsections.map((sub) => (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => handleSubsectionSelect(page.id, sub.id)}
                              className="w-full text-left py-2 px-2.5 rounded-sm hover:bg-[var(--mm-paper-inset)] transition-colors flex items-start gap-2.5 group cursor-pointer min-h-[44px]"
                            >
                              <span className="font-mono text-[11px] tabular-nums text-[var(--text-muted)] shrink-0 mt-0.5">
                                {sub.num}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-[var(--text-primary)] group-hover:text-[var(--mm-signal)] transition-colors">
                                  {sub.title}
                                </div>
                                <p className="text-[11px] text-[var(--text-secondary)] font-sans mt-0.5 leading-snug">
                                  {sub.description}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Unified Utility Links Footer */}
            <div className="px-6 py-4 border-t border-[var(--mm-rule)] bg-[var(--mm-paper-bright)] space-y-3">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-sans">
                {onOpenGlossary && (
                  <button
                    type="button"
                    onClick={() => {
                      setTocDrawerOpen(false);
                      onOpenGlossary();
                    }}
                    className="inline-flex items-center gap-1.5 font-medium text-[var(--mm-signal)] hover:underline cursor-pointer min-h-[36px]"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Glossary (G)</span>
                  </button>
                )}

                {onStartJudgeMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setTocDrawerOpen(false);
                      onStartJudgeMode();
                    }}
                    className="inline-flex items-center gap-1.5 font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline cursor-pointer min-h-[36px]"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>60s Verification</span>
                  </button>
                )}

                {onOpenCertificate && (
                  <button
                    type="button"
                    onClick={() => {
                      setTocDrawerOpen(false);
                      onOpenCertificate();
                    }}
                    className="inline-flex items-center gap-1.5 font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline cursor-pointer min-h-[36px]"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Certificate</span>
                  </button>
                )}

                {onOpenDocs && (
                  <button
                    type="button"
                    onClick={() => {
                      setTocDrawerOpen(false);
                      onOpenDocs();
                    }}
                    className="inline-flex items-center gap-1.5 font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline cursor-pointer min-h-[36px]"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Docs</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setTocDrawerOpen(false);
                    window.dispatchEvent(new CustomEvent('open_shortcuts_help'));
                  }}
                  className="inline-flex items-center gap-1.5 font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline cursor-pointer min-h-[36px]"
                >
                  <Keyboard className="w-3.5 h-3.5" />
                  <span>Shortcuts (?)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

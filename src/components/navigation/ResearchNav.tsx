import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Clock,
  Award,
  BookOpen,
  ListTree,
  Bookmark,
  Sparkles,
  ArrowRight,
  Hash,
} from 'lucide-react';
import { LogoMark } from '../ui/LogoMark';

export type PageId = 'memory' | 'break' | 'trace' | 'measure' | 'bdh' | 'reason' | 'prove' | 'docs' | 'privacy' | 'terms' | '404';

export interface NavSubsection {
  id: string; // DOM element ID to scroll to
  num: string; // e.g. '01.1'
  title: string; // e.g. 'Hebbian Plasticity & Fast Weights'
  shortTitle: string; // e.g. 'Hebbian Plasticity'
  description: string; // concise description for the TOC dropdown
  badge?: string; // e.g. 'Core Law', 'Interactive', 'Intervention'
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
  onOpenIndex,
  onStartJudgeMode,
  onOpenCertificate,
  onOpenGlossary,
  onOpenDocs,
}: ResearchNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileStages, setExpandedMobileStages] = useState<Record<string, boolean>>({
    memory: true,
  });
  const [activeDropdownPage, setActiveDropdownPage] = useState<PageId | null>(null);
  const [tocDrawerOpen, setTocDrawerOpen] = useState(false);
  const [tocSearch, setTocSearch] = useState('');

  const dropdownCloseTimeoutRef = useRef<number | null>(null);

  const currentIndex = PAGES.findIndex((p) => p.id === currentPage);
  const activePageNum = currentIndex >= 0 ? currentIndex + 1 : 1;

  // Handle stage direct click
  const handleSelect = (id: PageId) => {
    setActiveDropdownPage(null);
    setMobileMenuOpen(false);
    setTocDrawerOpen(false);
    onPageChange(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle subsection click (Table of Contents behavior)
  const handleSubsectionSelect = (pageId: PageId, subsectionId: string) => {
    setActiveDropdownPage(null);
    setMobileMenuOpen(false);
    setTocDrawerOpen(false);
    onPageChange(pageId, subsectionId);
  };

  const handleMouseEnterNav = (pageId: PageId) => {
    if (dropdownCloseTimeoutRef.current) {
      clearTimeout(dropdownCloseTimeoutRef.current);
      dropdownCloseTimeoutRef.current = null;
    }
    setActiveDropdownPage(pageId);
  };

  const handleMouseLeaveNav = () => {
    if (dropdownCloseTimeoutRef.current) {
      clearTimeout(dropdownCloseTimeoutRef.current);
    }
    dropdownCloseTimeoutRef.current = window.setTimeout(() => {
      setActiveDropdownPage(null);
    }, 180);
  };

  // Filtered pages for Table of Contents drawer
  const filteredPages = PAGES.map((p) => {
    if (!tocSearch.trim()) return p;
    const query = tocSearch.toLowerCase();
    const stageMatch = p.title.toLowerCase().includes(query) || p.subtitle.toLowerCase().includes(query);
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

  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const moreDropdownRef = useRef<HTMLDivElement | null>(null);

  // Close "More" dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false);
      }
    };
    if (moreDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [moreDropdownOpen]);

  // Current page object for compact tablet/mobile display
  const currentPageInfo = PAGES.find((p) => p.id === currentPage) || PAGES[0];

  return (
    <>
      <header className="site-header no-print">
        <div className="site-header-inner">
          {/* LEFT: Brand / Logo Area */}
          <div className="header-brand">
            <button
              onClick={() => handleSelect('memory')}
              className="flex items-center gap-2 sm:gap-2.5 text-left group cursor-pointer"
              title="Return to Stage 01: Memory"
              aria-label="Memory in Motion home"
            >
              <LogoMark size={28} variant="editorial" />
              <div className="flex flex-col">
                <span className="header-brand-title group-hover:text-[#2B6282] transition-colors">
                  Memory in Motion
                </span>
                <span className="text-[10px] font-sans text-[#716F68] leading-tight hidden xl:block whitespace-nowrap">
                  Interactive Research Laboratory
                </span>
              </div>
            </button>
          </div>

          {/* TABLET / MOBILE ONLY: Compact Current Stage Indicator (hidden on large desktop) */}
          <div className="hidden md:flex lg:hidden items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FAF8F5] border border-[#D9DCD8] text-xs font-sans">
            <span className="font-mono text-[11px] font-bold text-[#21445B] bg-[#E7F2FA] px-1.5 py-0.5 rounded">
              {currentPageInfo.num}
            </span>
            <span className="font-semibold text-[#252525] max-w-[120px] truncate">
              {currentPageInfo.title}
            </span>
          </div>

          {/* CENTER: Primary Navigation (01–07 stages) - Visible >= 1024px */}
          <nav className="primary-nav" aria-label="Primary stages navigation">
            {PAGES.map((page, index) => {
              const isActive = page.id === currentPage;
              const isDropdownOpen = activeDropdownPage === page.id;
              const hasSubsections = Boolean(page.subsections && page.subsections.length > 0);

              return (
                <div
                  key={page.id}
                  className="relative shrink-0"
                  onMouseEnter={() => handleMouseEnterNav(page.id)}
                  onMouseLeave={handleMouseLeaveNav}
                >
                  <button
                    onClick={() => handleSelect(page.id)}
                    className={`primary-nav-item ${isActive ? 'active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span
                      className={`font-mono text-xs ${
                        isActive ? 'text-[#21445B] font-bold' : 'text-[#7D817D]'
                      }`}
                    >
                      {page.num}
                    </span>
                    <span className="font-semibold">
                      {page.title}
                    </span>
                    {hasSubsections && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdownPage(isDropdownOpen ? null : page.id);
                        }}
                        className="p-0.5 text-[#7D817D] hover:text-[#252525] cursor-pointer ml-0.5"
                        title={`View Stage ${page.num} Subsections`}
                        aria-label={`Toggle Stage ${page.num} subsections`}
                      >
                        <ChevronDown
                          className={`w-3 h-3 transition-transform duration-200 ${
                            isDropdownOpen ? 'rotate-180 text-[#21445B]' : 'opacity-70'
                          }`}
                        />
                      </span>
                    )}
                  </button>

                  {/* Table of Contents Popover for this Page */}
                  {isDropdownOpen && page.subsections && (
                    <div
                      className="absolute top-full left-0 mt-1 w-84 sm:w-96 rounded-xl border border-[#D9DCD8] bg-[#FFFFFF] p-3 shadow-lg z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                      onMouseEnter={() => handleMouseEnterNav(page.id)}
                      onMouseLeave={handleMouseLeaveNav}
                    >
                      {/* TOC Header */}
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#D9DCD8]">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs uppercase font-bold text-[#21445B] bg-[#E7F2FA] px-2 py-0.5 rounded border border-[#CDE1F0]">
                            Stage {page.num} · Subsections
                          </span>
                        </div>
                        <button
                          onClick={() => handleSelect(page.id)}
                          className="text-xs font-sans text-[#2B6282] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Overview Top</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Subsection List */}
                      <div className="space-y-1">
                        {page.subsections.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => handleSubsectionSelect(page.id, sub.id)}
                            className="w-full text-left p-2 rounded-lg hover:bg-[#F7F5EF] border border-transparent hover:border-[#D9DCD8] transition-all group cursor-pointer flex items-start gap-2.5"
                          >
                            <span className="font-mono text-xs font-semibold text-[#21445B] bg-[#F0F1EF] group-hover:bg-[#E7F2FA] px-1.5 py-0.5 rounded border border-[#D9DCD8] shrink-0 mt-0.5">
                              {sub.num}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-semibold text-[#252525] group-hover:text-[#2B6282] transition-colors truncate font-sans">
                                  {sub.title}
                                </span>
                                {sub.badge && (
                                  <span className="text-xs font-mono uppercase px-1.5 py-0.5 rounded bg-[#F0F1EF] border border-[#D9DCD8] text-[#5F625F] shrink-0">
                                    {sub.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#5F625F] font-sans leading-snug line-clamp-1 mt-0.5">
                                {sub.description}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* RIGHT: Secondary Actions Area */}
          <div className="header-actions">
            {/* Contents Trigger - ALWAYS visible on desktop and tablet */}
            <button
              onClick={() => setTocDrawerOpen(true)}
              className="header-secondary-button"
              title="Open Complete Research Table of Contents"
              aria-label="Open Table of Contents"
            >
              <ListTree className="w-3.5 h-3.5 text-[#5F625F] shrink-0" />
              <span>Contents</span>
            </button>

            {/* Glossary Trigger - visible on large desktop (>= 1280px) */}
            {onOpenGlossary && (
              <button
                onClick={onOpenGlossary}
                className="header-secondary-button glossary hidden xl:inline-flex"
                title="Open Concept Glossary"
                aria-label="Open Concept Glossary"
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                <span>Glossary</span>
              </button>
            )}

            {/* 60s Fast Experiment CTA - visible on extra-wide desktop (>= 1400px) */}
            {onStartJudgeMode && (
              <button
                onClick={onStartJudgeMode}
                className="header-secondary-button hidden 2xl:inline-flex bg-[#FFF5D8] hover:bg-[#F8EFCB] text-[#5A4716] border-[#F0E3B8]"
                title="Quick 60-Second Guided Verification"
              >
                <Clock className="w-3.5 h-3.5 text-[#5A4716] shrink-0" />
                <span>60s Test</span>
              </button>
            )}

            {/* Priority-Based "More ▾" Overflow Dropdown (compact & medium viewports) */}
            <div className="relative hidden sm:block xl:hidden" ref={moreDropdownRef}>
              <button
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className="header-more-btn"
                title="More Research Tools"
                aria-expanded={moreDropdownOpen}
              >
                <span>More</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {moreDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-52 rounded-xl border border-[#D9DCD8] bg-[#FFFFFF] p-2 shadow-lg z-50 animate-in fade-in slide-in-from-top-1 duration-150 space-y-1">
                  {onOpenGlossary && (
                    <button
                      onClick={() => {
                        setMoreDropdownOpen(false);
                        onOpenGlossary();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#E7F2FA] text-xs font-sans font-semibold text-[#21445B] transition-colors text-left cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4 text-[#21445B]" />
                      <span>Concept Glossary</span>
                    </button>
                  )}

                  {onStartJudgeMode && (
                    <button
                      onClick={() => {
                        setMoreDropdownOpen(false);
                        onStartJudgeMode();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#FFF5D8] text-xs font-sans font-semibold text-[#5A4716] transition-colors text-left cursor-pointer"
                    >
                      <Clock className="w-4 h-4 text-[#5A4716]" />
                      <span>60s Experiment</span>
                    </button>
                  )}

                  {onOpenCertificate && (
                    <button
                      onClick={() => {
                        setMoreDropdownOpen(false);
                        onOpenCertificate();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#DCEFE2] text-xs font-sans font-semibold text-[#24452E] transition-colors text-left cursor-pointer"
                    >
                      <Award className="w-4 h-4 text-[#24452E]" />
                      <span>Certificate</span>
                    </button>
                  )}

                  {onOpenDocs && (
                    <button
                      onClick={() => {
                        setMoreDropdownOpen(false);
                        onOpenDocs();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#FAF8F5] text-xs font-sans font-semibold text-[#48453E] transition-colors text-left cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4 text-[#48453E]" />
                      <span>Documentation</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Mobile / Tablet Menu Trigger (hidden on large desktop >= 1024px) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-[#FFFFFF] hover:bg-[#F0F1EF] text-[#252525] border border-[#D9DCD8] transition-all cursor-pointer shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 text-[#252525]" /> : <Menu className="w-4 h-4 text-[#5F625F]" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Menu with Full Subsection Accordions */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#D9DCD8] bg-[#FFFFFF] px-4 py-4 space-y-2 shadow-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between text-xs text-[#5F625F] font-sans px-2 pb-2">
              <span className="font-semibold text-[#252525]">Learning Stages & Subsections</span>
              <span className="font-mono">
                Stage {activePageNum} of {PAGES.length}
              </span>
            </div>

            <div className="space-y-2">
              {PAGES.map((page, index) => {
                const isActive = page.id === currentPage;
                const isExpanded = Boolean(expandedMobileStages[page.id]);
                const hasSubsections = Boolean(page.subsections && page.subsections.length > 0);

                return (
                  <div
                    key={page.id}
                    className="rounded-lg border border-[#D9DCD8] bg-[#FFFFFF] overflow-hidden"
                  >
                    <div className="flex items-center justify-between p-2.5">
                      <button
                        onClick={() => handleSelect(page.id)}
                        className="flex items-center gap-3 text-left flex-1 cursor-pointer"
                      >
                        <span className="font-mono text-xs text-[#7D817D] w-5">
                          {page.num}
                        </span>
                        <div>
                          <div className={`font-semibold text-sm leading-tight ${isActive ? 'text-[#21445B]' : 'text-[#252525]'}`}>
                            {page.title}
                          </div>
                          <div className="text-xs text-[#5F625F] font-normal">
                            {page.subtitle}
                          </div>
                        </div>
                      </button>

                      {hasSubsections && (
                        <button
                          onClick={() =>
                            setExpandedMobileStages((prev) => ({
                              ...prev,
                              [page.id]: !prev[page.id],
                            }))
                          }
                          className="p-1.5 rounded-md hover:bg-[#F0F1EF] text-[#5F625F] cursor-pointer"
                          aria-label={`Toggle subsections for ${page.title}`}
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180 text-[#21445B]' : ''
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    {/* Subsections Accordion for Mobile */}
                    {isExpanded && page.subsections && (
                      <div className="bg-[#F7F5EF] border-t border-[#D9DCD8] px-3 py-2 space-y-1.5">
                        <div className="text-xs font-mono uppercase text-[#5F625F] font-bold px-1 pt-1">
                          Table of Contents ({page.subsections.length} topics)
                        </div>
                        {page.subsections.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => handleSubsectionSelect(page.id, sub.id)}
                            className="w-full text-left p-2 rounded-md bg-[#FFFFFF] hover:bg-[#E7F2FA] border border-[#D9DCD8] flex items-start gap-2.5 transition-colors cursor-pointer"
                          >
                            <span className="font-mono text-xs font-semibold text-[#21445B] shrink-0 mt-0.5">
                              {sub.num}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-[#252525] truncate">
                                {sub.title}
                              </div>
                              <div className="text-[10.5px] text-[#5F625F] line-clamp-1">
                                {sub.description}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mobile Drawer Actions */}
            <div className="pt-3 border-t border-[#D9DCD8] grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setTocDrawerOpen(true);
                }}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#FFFFFF] text-[#252525] border border-[#D9DCD8] font-sans text-xs font-semibold col-span-2 cursor-pointer"
              >
                <ListTree className="w-4 h-4 text-[#5F625F]" />
                <span>Complete Table of Contents</span>
              </button>

              {onOpenGlossary && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenGlossary();
                  }}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#E7F2FA] text-[#21445B] border border-[#CDE1F0] font-sans text-xs font-semibold col-span-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Concept Glossary</span>
                </button>
              )}

              {onStartJudgeMode && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onStartJudgeMode();
                  }}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#FFF5D8] text-[#5A4716] border border-[#F0E3B8] font-sans text-xs font-semibold cursor-pointer"
                >
                  <Clock className="w-4 h-4" />
                  <span>60s Test</span>
                </button>
              )}

              {onOpenCertificate && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenCertificate();
                  }}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#DCEFE2] text-[#24452E] border border-[#C5DDCB] font-sans text-xs font-semibold cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>Certificate</span>
                </button>
              )}
            </div>

            {/* Mobile Footer Disclosures */}
            <div className="pt-3 border-t border-[#E8EBE7] flex items-center justify-between text-xs text-[#716F68] px-1 font-sans">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onPageChange('privacy');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-[#21445B] hover:underline cursor-pointer"
              >
                Privacy Policy
              </button>
              <span>·</span>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onPageChange('terms');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-[#21445B] hover:underline cursor-pointer"
              >
                Terms of Use
              </button>
              <span>·</span>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onPageChange('docs');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-[#21445B] hover:underline cursor-pointer"
              >
                Documentation
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Global Table of Contents Slide-Over Drawer */}
      {tocDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/35 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg bg-[#FFFFFF] h-full shadow-2xl flex flex-col border-l border-[#D9DCD8] animate-in slide-in-from-right duration-250"
            role="dialog"
            aria-modal="true"
            aria-label="Table of Contents"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#D9DCD8] bg-[#FFFFFF] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#E7F2FA] border border-[#CDE1F0] flex items-center justify-center">
                  <ListTree className="w-4 h-4 text-[#21445B]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#252525] leading-tight">
                    Table of Contents
                  </h3>
                  <p className="text-xs text-[#5F625F] font-sans">
                    Navigate all 7 stages & research subsections
                  </p>
                </div>
              </div>

              <button
                onClick={() => setTocDrawerOpen(false)}
                className="w-8 h-8 rounded-md hover:bg-[#F0F1EF] border border-[#D9DCD8] flex items-center justify-center text-[#5F625F] hover:text-[#252525] transition cursor-pointer"
                aria-label="Close Table of Contents"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Search */}
            <div className="p-4 border-b border-[#D9DCD8] bg-[#F7F5EF]">
              <input
                type="text"
                placeholder="Search topics (e.g., 'Hebbian plasticity', 'bounds', 'KV-cache')..."
                value={tocSearch}
                onChange={(e) => setTocSearch(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-[#FFFFFF] border border-[#D9DCD8] text-xs font-sans text-[#252525] focus:outline-none focus:border-[#2B6282]"
              />
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F7F5EF]">
              {filteredPages.length === 0 ? (
                <div className="text-center py-10 text-xs text-[#5F625F]">
                  No subsections matching &ldquo;{tocSearch}&rdquo;.
                </div>
              ) : (
                filteredPages.map((page) => (
                  <div
                    key={page.id}
                    className="rounded-lg border border-[#D9DCD8] bg-[#FFFFFF] p-4 space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between border-b border-[#E8EBE7] pb-2">
                      <button
                        onClick={() => handleSelect(page.id)}
                        className="text-left group flex items-center gap-2 cursor-pointer"
                      >
                        <span className="font-mono text-xs font-bold text-[#21445B] bg-[#E7F2FA] px-2 py-0.5 rounded border border-[#CDE1F0]">
                          Stage {page.num}
                        </span>
                        <span className="font-serif font-bold text-sm text-[#252525] group-hover:text-[#2B6282] transition-colors">
                          {page.title}
                        </span>
                      </button>

                      <button
                        onClick={() => handleSelect(page.id)}
                        className="text-xs font-sans text-[#2B6282] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Jump to Top</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {page.subsections && page.subsections.length > 0 && (
                      <div className="space-y-1.5 pl-1">
                        {page.subsections.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => handleSubsectionSelect(page.id, sub.id)}
                            className="w-full text-left p-2.5 rounded-md hover:bg-[#F7F5EF] border border-transparent hover:border-[#D9DCD8] transition-all flex items-start gap-3 group cursor-pointer"
                          >
                            <span className="font-mono text-xs font-bold text-[#21445B] bg-[#F0F1EF] group-hover:bg-[#E7F2FA] px-1.5 py-0.5 rounded border border-[#D9DCD8] shrink-0 mt-0.5">
                              {sub.num}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-[#252525] group-hover:text-[#2B6282] transition-colors">
                                  {sub.title}
                                </span>
                                {sub.badge && (
                                  <span className="text-xs font-mono uppercase px-1.5 py-0.5 rounded bg-[#F0F1EF] border border-[#D9DCD8] text-[#5F625F] shrink-0">
                                    {sub.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#5F625F] font-sans mt-0.5 leading-snug">
                                {sub.description}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[#D9DCD8] bg-[#FFFFFF] flex items-center justify-between text-xs text-[#5F625F]">
              <span>Clicking any item scrolls directly to the subsection</span>
              <button
                onClick={() => setTocDrawerOpen(false)}
                className="btn btn-secondary text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

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

export type PageId = 'memory' | 'break' | 'trace' | 'measure' | 'bdh' | 'reason' | 'prove';

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
}

export function ResearchNav({
  currentPage,
  onPageChange,
  onOpenIndex,
  onStartJudgeMode,
  onOpenCertificate,
  onOpenGlossary,
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

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#D9DCD8] bg-[#FFFFFF]/95 backdrop-blur-md no-print">
        <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 h-14 sm:h-15 flex items-center justify-between gap-2 sm:gap-3">
          {/* Brand / Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleSelect('memory')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <LogoMark size={28} variant="editorial" />
              <div className="flex flex-col">
                <span className="font-serif font-bold text-sm sm:text-base tracking-tight text-[#252525] group-hover:text-[#2B6282] transition-colors leading-tight whitespace-nowrap">
                  Memory in Motion
                </span>
                <span className="text-[10px] font-sans text-[#5F625F] leading-tight hidden 2xl:block whitespace-nowrap">
                  Interactive Scientific Laboratory
                </span>
              </div>
            </button>
          </div>

          {/* 7-Page Navigation Tabs: clean, responsive unified pills */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 relative shrink min-w-0">
            {PAGES.map((page, index) => {
              const isActive = page.id === currentPage;
              const isCompleted = index < currentIndex;
              const isDropdownOpen = activeDropdownPage === page.id;
              const hasSubsections = Boolean(page.subsections && page.subsections.length > 0);

              return (
                <div
                  key={page.id}
                  className="relative"
                  onMouseEnter={() => handleMouseEnterNav(page.id)}
                  onMouseLeave={handleMouseLeaveNav}
                >
                  <button
                    onClick={() => handleSelect(page.id)}
                    className={`px-2.5 xl:px-3 py-1.5 text-xs font-sans rounded-md transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#E7F2FA] text-[#252525] border border-[#CDE1F0] font-semibold'
                        : isCompleted
                        ? 'text-[#252525] hover:bg-[#F0F1EF] hover:text-[#252525]'
                        : 'text-[#5F625F] hover:bg-[#F0F1EF] hover:text-[#252525]'
                    }`}
                  >
                    <span
                      className={`font-mono text-xs ${
                        isActive ? 'text-[#21445B] font-bold' : 'text-[#7D817D]'
                      }`}
                    >
                      {page.num}
                    </span>
                    <span className={isActive ? 'inline font-semibold' : 'hidden xl:inline'}>
                      {page.title}
                    </span>
                    {hasSubsections && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdownPage(isDropdownOpen ? null : page.id);
                        }}
                        className="p-0.5 text-[#7D817D] hover:text-[#252525] cursor-pointer"
                        title={`View Stage ${page.num} Subsections`}
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
                      className="absolute top-full left-0 mt-1.5 w-84 sm:w-96 rounded-xl border border-[#D9DCD8] bg-[#FFFFFF] p-3 shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-150"
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

          {/* Right side: Action Triggers & Navigation Drawers */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Global Table of Contents Drawer Trigger */}
            <button
              onClick={() => setTocDrawerOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md bg-[#FFFFFF] hover:bg-[#F7F5EF] text-[#252525] border border-[#D9DCD8] font-sans text-xs font-medium transition-all cursor-pointer shrink-0"
              title="Open Complete Research Table of Contents"
            >
              <ListTree className="w-3.5 h-3.5 text-[#5F625F]" />
              <span className="hidden sm:inline">Contents</span>
            </button>

            {/* Concept Glossary Drawer Trigger */}
            {onOpenGlossary && (
              <button
                onClick={onOpenGlossary}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md bg-[#E7F2FA] hover:bg-[#DDEBF7] text-[#21445B] border border-[#CDE1F0] font-sans text-xs font-semibold transition-all cursor-pointer shrink-0"
                title="Open Concept Glossary"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#21445B]" />
                <span className="hidden sm:inline">Glossary</span>
              </button>
            )}

            {/* 60s Fast Experiment CTA */}
            {onStartJudgeMode && (
              <button
                onClick={onStartJudgeMode}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md bg-[#FFF5D8] hover:bg-[#F8EFCB] text-[#5A4716] border border-[#F0E3B8] font-sans text-xs font-semibold transition-all cursor-pointer shrink-0"
                title="Quick 60-Second Guided Verification"
              >
                <Clock className="w-3.5 h-3.5 text-[#5A4716]" />
                <span className="hidden md:inline">60s Test</span>
              </button>
            )}

            {/* Quick Certificate View (when available) */}
            {onOpenCertificate && (
              <button
                onClick={onOpenCertificate}
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#DCEFE2] hover:bg-[#CFE8D6] text-[#24452E] border border-[#C5DDCB] font-sans text-xs font-semibold transition-all cursor-pointer shrink-0"
                title="View Certificate of Completion"
              >
                <Award className="w-3.5 h-3.5 text-[#24452E]" />
                <span className="hidden 2xl:inline">Certificate</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-8 h-8 rounded-md bg-[#FFFFFF] hover:bg-[#F0F1EF] text-[#252525] border border-[#D9DCD8] transition-all cursor-pointer"
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

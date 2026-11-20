import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ExperimentProvider } from './context/ExperimentContext';
import { MemoryLensProvider } from './context/MemoryLensContext';
import { GlossaryProvider, useGlossary } from './context/GlossaryContext';
import { ResearchNav, PageId } from './components/navigation/ResearchNav';
import { PageFooterCta } from './components/navigation/PageFooterCta';
import { JudgeMode } from './components/JudgeMode';
import { CertificateModal } from './components/CertificateModal';
import { ConceptGlossaryDrawer } from './components/ConceptGlossaryDrawer';
import { ShortcutsHelpModal } from './components/ui/ShortcutsHelpModal';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { getCompletedMilestones } from './utils/progressTracker';
import {
  EditorialAtmosphere,
  EditorialPageTransition,
  EditorialRevealObserver,
  EditorialScrollProgress,
  ChapterKicker,
} from './components/EditorialMotion';

// Components mapped to the 7 learning stages
import { LandingDemo } from './components/LandingDemo';
import { Section01MemoryProblem } from './components/Section01MemoryProblem';
import { Section02GrowingContext } from './components/Section02GrowingContext';
import { Section03RecurrentMemory } from './components/Section03RecurrentMemory';
import { Section04InterferenceLab } from './components/Section04InterferenceLab';
import { ErrorBoundary } from './components/ErrorBoundary';
import { reexecuteLastValidExperiment } from './models/interferenceLabEngine';
import { Section05FindTheFailure } from './components/Section05FindTheFailure';
import { MemorySurgery } from './components/MemorySurgery';
import { SectionMeasure } from './components/SectionMeasure';
import { Section06WhyThisMatters } from './components/Section06WhyThisMatters';
import { Section07MeetBDH } from './components/Section07MeetBDH';
import { Section08BDHArchitecture } from './components/Section08BDHArchitecture';
import { Section09BDHPlayground } from './components/Section09BDHPlayground';
import { Section10BDHCQ } from './components/Section10BDHCQ';
import { CapacityExperiment } from './components/CapacityExperiment';
import { SoWhatSection } from './components/SoWhatSection';
import { SixtySecondTest } from './components/SixtySecondTest';
import { FinalChallenge } from './components/FinalChallenge';
import { ConceptMap } from './components/ConceptMap';
import { EvidenceAndSources } from './components/EvidenceAndSources';
import { YouMadeItSection } from './components/YouMadeItSection';
import { TakeawaysAndFooter } from './components/TakeawaysAndFooter';
import { DocumentationViewer } from './components/DocumentationViewer';
import { PrivacyPage } from './components/PrivacyPage';
import { TermsPage } from './components/TermsPage';
import { NotFoundPage } from './components/NotFoundPage';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { usePersistentNavigation } from './hooks/usePersistentNavigation';
import { ThemeProvider } from './context/ThemeContext';
import { Page01MemoryInteractions } from './components/interactions/Page01MemoryInteractions';
import { Page02BreakInteractions } from './components/interactions/Page02BreakInteractions';
import { Page03TraceInteractions } from './components/interactions/Page03TraceInteractions';
import { Page04MeasureInteractions } from './components/interactions/Page04MeasureInteractions';
import { Page05BDHInteractions } from './components/interactions/Page05BDHInteractions';
import { Page06ReasonInteractions } from './components/interactions/Page06ReasonInteractions';
import { Page07ProveInteractions } from './components/interactions/Page07ProveInteractions';

function AppContent() {
  const { isOpen: isGlossaryOpen, openGlossary, closeGlossary } = useGlossary();
  const {
    currentPage,
    handlePageChange,
  } = usePersistentNavigation();

  const [isJudgeModeOpen, setIsJudgeModeOpen] = useState<boolean>(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState<boolean>(false);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState<boolean>(false);
  const [shortcutFeedback, setShortcutFeedback] = useState<string | null>(null);
  const feedbackTimerRef = useRef<number | null>(null);
  const [milestonesCount, setMilestonesCount] = useState<number>(() => getCompletedMilestones().length);

  const showShortcutFeedback = useCallback((msg: string) => {
    setShortcutFeedback(msg);
    if (feedbackTimerRef.current) {
      window.clearTimeout(feedbackTimerRef.current);
    }
    feedbackTimerRef.current = window.setTimeout(() => {
      setShortcutFeedback(null);
    }, 1800);
  }, []);

  const toggleGlossary = useCallback(() => {
    if (isGlossaryOpen) {
      closeGlossary();
    } else {
      openGlossary();
    }
  }, [isGlossaryOpen, openGlossary, closeGlossary]);

  const toggleShortcutsHelp = useCallback(() => {
    setIsShortcutsHelpOpen((prev) => !prev);
  }, []);

  useKeyboardShortcuts({
    currentPage,
    onPageChange: handlePageChange,
    onToggleGlossary: toggleGlossary,
    onToggleHelp: toggleShortcutsHelp,
    onShortcutTriggered: showShortcutFeedback,
    isHelpOpen: isShortcutsHelpOpen,
    onCloseHelp: () => setIsShortcutsHelpOpen(false),
  });

  useEffect(() => {
    const handleMilestoneUpdate = (e: any) => {
      if (e.detail?.all) {
        const newCount = e.detail.all.length;
        setMilestonesCount(newCount);
        // Automatically open the certificate modal when achieving the final milestone (8/8)
        if (newCount >= 8) {
          setIsCertificateModalOpen(true);
        }
      }
    };

    const handleFinalChallenge = () => {
      setIsCertificateModalOpen(true);
    };

    const handleOpenCert = () => {
      setIsCertificateModalOpen(true);
    };

    const handleOpenShortcuts = () => {
      setIsShortcutsHelpOpen(true);
    };

    const handleCloseAllOverlays = () => {
      setIsCertificateModalOpen(false);
      setIsShortcutsHelpOpen(false);
    };

    window.addEventListener('milestone_updated', handleMilestoneUpdate);
    window.addEventListener('final_challenge_completed', handleFinalChallenge);
    window.addEventListener('open_certificate_modal', handleOpenCert);
    window.addEventListener('open_shortcuts_help', handleOpenShortcuts);
    window.addEventListener('close_all_overlays', handleCloseAllOverlays);

    return () => {
      window.removeEventListener('milestone_updated', handleMilestoneUpdate);
      window.removeEventListener('final_challenge_completed', handleFinalChallenge);
      window.removeEventListener('open_certificate_modal', handleOpenCert);
      window.removeEventListener('open_shortcuts_help', handleOpenShortcuts);
      window.removeEventListener('close_all_overlays', handleCloseAllOverlays);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[var(--page-bg)] text-[var(--text-primary)] font-sans selection:bg-[var(--accent-blue)] selection:text-[var(--accent-blue-text)]">
      <EditorialAtmosphere />
      <EditorialScrollProgress />
      <EditorialRevealObserver />
      {/* Navigation Bar */}
      <ResearchNav
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onStartJudgeMode={() => setIsJudgeModeOpen(true)}
        onOpenCertificate={() => setIsCertificateModalOpen(true)}
        onOpenGlossary={() => openGlossary()}
        onOpenDocs={() => handlePageChange('docs')}
      />

      {/* Concept Glossary Drawer */}
      <ConceptGlossaryDrawer
        onNavigateSection={(pageId, sectionId) => {
          handlePageChange(pageId as PageId);
          if (sectionId) {
            setTimeout(() => {
              const el = document.getElementById(sectionId);
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
        }}
      />

      {/* 60-Second Fast Verification Modal */}
      <JudgeMode
        isOpen={isJudgeModeOpen}
        onClose={() => setIsJudgeModeOpen(false)}
        onExploreFullLab={() => handlePageChange('break')}
        onEnterSandbox={() => handlePageChange('bdh')}
        onNavigate={(pageId) => handlePageChange(pageId as PageId)}
      />

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
        milestonesCount={milestonesCount}
        totalMilestones={8}
        isUnlocked={
          milestonesCount >= 8 ||
          localStorage.getItem('memory_final_challenge_completed') === 'true'
        }
        onNavigateToProve={() => handlePageChange('prove')}
      />

      {/* Keyboard Shortcuts Reference Modal */}
      <ShortcutsHelpModal
        isOpen={isShortcutsHelpOpen}
        onClose={() => setIsShortcutsHelpOpen(false)}
      />

      {/* Quiet auto-dismissing keyboard navigation feedback */}
      {shortcutFeedback && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-4 sm:left-6 z-30 px-3 py-1.5 rounded-lg border border-[var(--mm-rule-strong)] bg-[var(--surface)] text-[var(--text-primary)] font-mono text-xs shadow-[var(--shadow-popover)] pointer-events-none no-print"
        >
          {shortcutFeedback}
        </div>
      )}

      {/* 7 Educational Stages */}
      <EditorialPageTransition pageKey={currentPage}>
        <main className="w-full flex-1">
          {/* ============================================================ */}
          {/* PAGE 1: MEMORY                                               */}
          {/* ============================================================ */}
          {currentPage === 'memory' && (
            <div className="chapter-page chapter-page--memory w-full" data-chapter="01">
              <LandingDemo
                onExploreClick={() => {
                  const el = document.getElementById('section-01');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                onStartJudgeMode={() => setIsJudgeModeOpen(true)}
              />

              <div className="research-container space-y-12 py-8">
                <Section01MemoryProblem />
                <Section02GrowingContext />
                <Section03RecurrentMemory />
                <Page01MemoryInteractions />
              </div>

              <PageFooterCta
                currentPage="memory"
                onNavigate={handlePageChange}
                nextPage="break"
                ctaText="See how memory changes →"
                subtext="Next: Can you intentionally make the recurrent memory fail?"
              />
            </div>
          )}

          {/* ============================================================ */}
          {/* PAGE 2: BREAK (DARK LABORATORY THEATRE OPENING)              */}
          {/* ============================================================ */}
          {currentPage === 'break' && (
            <div className="chapter-page chapter-page--break w-full" data-chapter="02">
              <header
                className="chapter-opening w-full essay-night-band border-b border-[var(--mm-rule)]"
                data-chapter-index="02"
              >
                <div className="research-container py-10 sm:py-14">
                  <div className="essay-stage-wide grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-end">
                    <div className="lg:col-span-8 space-y-3">
                      <ChapterKicker
                        number="02 / BREAK"
                        label="From Ch. 01 · Constant space forces shared coordinates"
                      />
                      <h1 className="essay-stage-title">
                        Where does compression break?
                      </h1>
                    </div>
                    <div className="lg:col-span-4 lg:border-l lg:border-[var(--mm-rule)] lg:pl-6">
                      <p className="text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
                        Walk through the five control knobs below—shrink dimension <span className="font-mono">D</span>, pack more facts, or dial down retention—and locate the exact collision boundary.
                      </p>
                    </div>
                  </div>
                </div>
              </header>

              <div className="w-full">
                <ErrorBoundary
                  title="Matrix Computation Interrupted"
                  description="An unexpected mathematical or state exception occurred during recurrent associative memory computation. You can retry the last valid experiment configuration before the failure occurred or perform a full reset to default baseline."
                  retryLabel="Retry Last Operation"
                  resetLabel="Full Reset to Defaults"
                  sectionName="04 / When Memory Collides (Interference Lab)"
                  retryLastOperation={reexecuteLastValidExperiment}
                >
                  <Section04InterferenceLab />
                </ErrorBoundary>

                <div className="research-container py-6">
                  <Page02BreakInteractions />
                </div>
              </div>

              <PageFooterCta
                currentPage="break"
                onNavigate={handlePageChange}
                prevPage="memory"
                nextPage="trace"
                ctaText="Inspect the trace →"
                subtext="Next: Open the matrix mid-stream to inspect every ΔM coordinate update."
              />
            </div>
          )}

          {/* ============================================================ */}
          {/* PAGE 3: TRACE (NIGHT-TONED FORENSIC BAND OPENING)            */}
          {/* ============================================================ */}
          {currentPage === 'trace' && (
            <div className="chapter-page chapter-page--trace w-full" data-chapter="03">
              <header
                className="chapter-opening w-full essay-night-band border-b border-[var(--mm-rule)]"
                data-chapter-index="03"
              >
                <div className="research-container py-12 sm:py-16">
                  <div className="essay-column text-center space-y-4">
                    <ChapterKicker
                      number="03 / TRACE"
                      label="From Ch. 02 · After the collision flips readout"
                      centered
                    />
                    <h1 className="essay-stage-title mx-auto">
                      Inside the state update.
                    </h1>
                    <p className="essay-lead mx-auto">
                      Step backward and forward through the exact outer-product updates (<span className="font-mono">ΔM</span>), run counterfactual Memory Surgery, and isolate the write that overwrote Tokyo.
                    </p>
                  </div>
                </div>
              </header>

              <div className="essay-night-band border-b border-[var(--mm-rule)] py-8">
                <div className="research-container">
                  <Page03TraceInteractions />
                </div>
              </div>

              <div className="research-container py-8 space-y-12">
                <Section05FindTheFailure />
                <div className="pt-8 border-t border-[var(--mm-rule)]">
                  <MemorySurgery />
                </div>
              </div>

              <PageFooterCta
                currentPage="trace"
                onNavigate={handlePageChange}
                prevPage="break"
                nextPage="measure"
                ctaText="Measure capacity →"
                subtext="Next: Quantify empirical retrieval bounds across dimensions D."
              />
            </div>
          )}

          {/* ============================================================ */}
          {/* PAGE 4: MEASURE (WIDE DATA STORY OPENING)                    */}
          {/* ============================================================ */}
          {currentPage === 'measure' && (
            <div className="chapter-page chapter-page--measure w-full" data-chapter="04">
              <header
                className="chapter-opening w-full border-b border-[var(--mm-rule)] bg-[var(--page-bg)]"
                data-chapter-index="04"
              >
                <div className="research-container py-12 sm:py-16 space-y-8">
                  <div className="essay-stage-wide space-y-4">
                    <ChapterKicker
                      number="04 / MEASURE"
                      label="From Ch. 03 · Scaling laws of superposition"
                    />
                    <h1 className="essay-stage-title max-w-4xl">
                      How much fits before it fades?
                    </h1>
                    <p className="essay-lead">
                      Across runs, one scaling law governs fixed-size superposition: doubling dimension <span className="font-mono">D</span> buys roughly linear room for distinct bindings before crosstalk takes over.
                    </p>
                  </div>

                  <div className="essay-stage-wide grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[var(--mm-rule)] border-y border-[var(--mm-rule)] py-4 text-xs font-mono">
                    <div className="py-2 sm:pr-6">
                      <span className="text-[var(--text-muted)] block">EMPIRICAL SCALING</span>
                      <span className="text-[var(--text-primary)] font-semibold text-sm">O(D) quasi-orthogonal bound</span>
                    </div>
                    <div className="py-2 sm:px-6">
                      <span className="text-[var(--text-muted)] block">STATE FOOTPRINT</span>
                      <span className="text-[var(--text-primary)] font-semibold text-sm">Constant D×D regardless of T</span>
                    </div>
                    <div className="py-2 sm:pl-6">
                      <span className="text-[var(--text-muted)] block">INSPECTABLE EVIDENCE</span>
                      <span className="text-[var(--text-primary)] font-semibold text-sm">Charts + CSV/Table fallback</span>
                    </div>
                  </div>
                </div>
              </header>

              <div className="research-container space-y-12 py-8">
                <SectionMeasure />
                <CapacityExperiment id="section-capacity-bounds" />
                <Page04MeasureInteractions />
              </div>

              <PageFooterCta
                currentPage="measure"
                onNavigate={handlePageChange}
                prevPage="trace"
                nextPage="bdh"
                ctaText="Explore BDH synapses →"
                subtext="Next: Moving memory from dense matrices to sparse plastic graphs."
              />
            </div>
          )}

          {/* ============================================================ */}
          {/* PAGE 5: BDH (ARCHITECTURAL EXPLAINER OPENING)                */}
          {/* ============================================================ */}
          {currentPage === 'bdh' && (
            <div className="chapter-page chapter-page--bdh w-full" data-chapter="05">
              <header
                className="chapter-opening w-full border-b border-[var(--mm-rule)] bg-[var(--mm-paper-bright)]"
                data-chapter-index="05"
              >
                <div className="research-container py-12 sm:py-16">
                  <div className="essay-stage-wide grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-7 space-y-4">
                      <ChapterKicker
                        number="05 / BDH"
                        label="From Ch. 04 · Beyond dense D×D matrices"
                      />
                      <h1 className="essay-stage-title">
                        From dense matrices to plastic synapses.
                      </h1>
                    </div>
                    <div className="lg:col-span-5 space-y-2.5 lg:pt-8 text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
                      <p>
                        Pathway&apos;s Dragon Hatchling (BDH, <span className="font-mono text-xs">arXiv:2509.26507</span>) distributes working memory across sparse edges of a scale-free particle graph with local Hebbian plasticity.
                      </p>
                      <p className="text-xs font-mono text-[var(--text-muted)]">
                        Note: Interactive simulations below separate educational toy models from published Pathway equations.
                      </p>
                    </div>
                  </div>
                </div>
              </header>

              <div className="w-full space-y-12 py-8">
                <div className="research-container space-y-12">
                  <Section06WhyThisMatters />
                  <Section07MeetBDH />
                  <Page05BDHInteractions />
                </div>
                <Section08BDHArchitecture />
              </div>

              <PageFooterCta
                currentPage="bdh"
                onNavigate={handlePageChange}
                prevPage="measure"
                nextPage="reason"
                ctaText="Explore latent reasoning →"
                subtext="Next: How BDH-CQ relaxes across synapses before emitting tokens."
              />
            </div>
          )}

          {/* ============================================================ */}
          {/* PAGE 6: REASON (QUIET READING COLUMN OPENING)                */}
          {/* ============================================================ */}
          {currentPage === 'reason' && (
            <div className="chapter-page chapter-page--reason w-full" data-chapter="06">
              <header
                className="chapter-opening w-full border-b border-[var(--mm-rule)] bg-[var(--page-bg)]"
                data-chapter-index="06"
              >
                <div className="research-container py-12 sm:py-16">
                  <div className="essay-column space-y-4">
                    <ChapterKicker
                      number="06 / REASON"
                      label="From Ch. 05 · Latent relaxation & synthesis"
                    />
                    <h1 className="essay-stage-title">
                      Reasoning without token emission.
                    </h1>
                    <p className="essay-lead">
                      Instead of thinking only out loud through discrete tokens, inspect how BDH-CQ iterates continuously across plastic synapses before committing to an output.
                    </p>
                  </div>
                </div>
              </header>

              <div className="research-container space-y-12 py-8">
                <Section09BDHPlayground />
                <Section10BDHCQ />
                <Page06ReasonInteractions />
                <SoWhatSection />
              </div>

              <PageFooterCta
                currentPage="reason"
                onNavigate={handlePageChange}
                prevPage="bdh"
                nextPage="prove"
                ctaText="Verify understanding →"
                subtext="Final Chapter: Focused predictions, empirical verification, and certificate."
              />
            </div>
          )}

          {/* ============================================================ */}
          {/* PAGE 7: PROVE (FOCUSED SINGLE-QUESTION CLIMAX)               */}
          {/* ============================================================ */}
          {currentPage === 'prove' && (
            <div className="chapter-page chapter-page--prove w-full" data-chapter="07">
              <header
                className="chapter-opening w-full border-b border-[var(--mm-rule)] bg-[var(--page-bg)]"
                data-chapter-index="07"
              >
                <div className="research-container py-12 sm:py-16">
                  <div className="essay-column text-center space-y-4">
                    <ChapterKicker
                      number="07 / PROVE"
                      label="Final verification & synthesis"
                      centered
                    />
                    <h1 className="essay-stage-title mx-auto">
                      Predict the state before it runs.
                    </h1>
                    <p className="essay-lead mx-auto">
                      Test your intuition one question at a time against live matrix computations, trace the causal taxonomy, and claim your laboratory certificate.
                    </p>
                  </div>
                </div>
              </header>

              <div className="research-container space-y-14 py-10">
                <SixtySecondTest />
                <FinalChallenge />
                <Page07ProveInteractions />
                <ConceptMap id="concept-synthesis-map" />
                <EvidenceAndSources />
                <YouMadeItSection />
              </div>

              <TakeawaysAndFooter
                onNavigateDocs={() => handlePageChange('docs')}
                onNavigatePrivacy={() => handlePageChange('privacy')}
                onNavigateTerms={() => handlePageChange('terms')}
              />
            </div>
          )}

          {/* ============================================================ */}
          {/* PUBLIC DOCUMENTATION SPECS: /docs                            */}
          {/* ============================================================ */}
          {currentPage === 'docs' && (
            <div className="animate-in fade-in duration-300 w-full">
              <DocumentationViewer onBackToLab={() => handlePageChange('memory')} />
              <TakeawaysAndFooter
                onNavigateDocs={() => handlePageChange('docs')}
                onNavigatePrivacy={() => handlePageChange('privacy')}
                onNavigateTerms={() => handlePageChange('terms')}
              />
            </div>
          )}

          {/* ============================================================ */}
          {/* PRIVACY POLICY PAGE: /privacy                                */}
          {/* ============================================================ */}
          {currentPage === 'privacy' && (
            <div className="animate-in fade-in duration-300 w-full">
              <PrivacyPage onBackToLab={() => handlePageChange('memory')} />
              <TakeawaysAndFooter
                onNavigateDocs={() => handlePageChange('docs')}
                onNavigatePrivacy={() => handlePageChange('privacy')}
                onNavigateTerms={() => handlePageChange('terms')}
              />
            </div>
          )}

          {/* ============================================================ */}
          {/* TERMS OF SERVICE PAGE: /terms                                */}
          {/* ============================================================ */}
          {currentPage === 'terms' && (
            <div className="animate-in fade-in duration-300 w-full">
              <TermsPage onBackToLab={() => handlePageChange('memory')} />
              <TakeawaysAndFooter
                onNavigateDocs={() => handlePageChange('docs')}
                onNavigatePrivacy={() => handlePageChange('privacy')}
                onNavigateTerms={() => handlePageChange('terms')}
              />
            </div>
          )}

          {/* ============================================================ */}
          {/* CUSTOM 404 NOT FOUND PAGE                                    */}
          {/* ============================================================ */}
          {currentPage === '404' && (
            <div className="animate-in fade-in duration-300 w-full">
              <NotFoundPage onReturnToMemory={() => handlePageChange('memory')} />
              <TakeawaysAndFooter
                onNavigateDocs={() => handlePageChange('docs')}
                onNavigatePrivacy={() => handlePageChange('privacy')}
                onNavigateTerms={() => handlePageChange('terms')}
              />
            </div>
          )}
        </main>
      </EditorialPageTransition>

        {/* Client-Side Cookie & Privacy Preferences Banner */}
        <CookieConsentBanner />
      </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ExperimentProvider>
        <MemoryLensProvider>
          <GlossaryProvider>
            <AppContent />
          </GlossaryProvider>
        </MemoryLensProvider>
      </ExperimentProvider>
    </ThemeProvider>
  );
}

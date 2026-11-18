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

// Components mapped to the 7 learning stages
import { LandingDemo } from './components/LandingDemo';
import { Section01MemoryProblem } from './components/Section01MemoryProblem';
import { Section02GrowingContext } from './components/Section02GrowingContext';
import { Section03RecurrentMemory } from './components/Section03RecurrentMemory';
import { Section04InterferenceLab } from './components/Section04InterferenceLab';
import { ErrorBoundary } from './components/ErrorBoundary';
import { reexecuteLastValidExperiment } from './models/interferenceLabEngine';
import { Section05FindTheFailure } from './components/Section05FindTheFailure';
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
          className="fixed bottom-5 right-5 z-50 px-3.5 py-2 rounded-md border border-[var(--mm-rule-strong)] bg-[var(--surface)] text-[var(--text-primary)] font-mono text-xs shadow-[var(--shadow-popover)] pointer-events-none no-print"
        >
          {shortcutFeedback}
        </div>
      )}

      {/* 7 Educational Stages */}
      <main className="w-full flex-1">
          {/* ============================================================ */}
          {/* PAGE 1: MEMORY                                               */}
          {/* ============================================================ */}
          {currentPage === 'memory' && (
            <div className="animate-in fade-in duration-300 w-full">
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
          {/* PAGE 2: BREAK                                                */}
          {/* ============================================================ */}
          {currentPage === 'break' && (
            <div className="animate-in fade-in duration-300 w-full">
              <header className="w-full border-b border-[var(--mm-rule)] bg-[var(--page-bg)]">
                <div className="research-container py-12 sm:py-16">
                  <div className="space-y-4 max-w-3xl">
                    <div className="essay-eyebrow">
                      <span className="text-[var(--mm-coral)] font-semibold">Stage 02</span>
                      <span className="mx-2 text-[var(--mm-rule-strong)]">·</span>
                      <span>Interference &amp; stress-testing</span>
                    </div>
                    <h1 className="essay-stage-title">
                      When compression collides.
                    </h1>
                    <p className="essay-lead">
                      Tune decay, shrink state dimension, and inject overlapping keys to locate the exact threshold where fixed-size associative memory begins to cross-talk.
                    </p>
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
                ctaText="Find the failure →"
                subtext="Next: Inspect what actually happened inside the coordinates."
              />
            </div>
          )}

          {/* ============================================================ */}
          {/* PAGE 3: TRACE                                                */}
          {/* ============================================================ */}
          {currentPage === 'trace' && (
            <div className="animate-in fade-in duration-300 w-full">
              <header className="w-full border-b border-[var(--mm-rule)] bg-[var(--page-bg)]">
                <div className="research-container py-12 sm:py-16">
                  <div className="space-y-4 max-w-3xl">
                    <div className="essay-eyebrow">
                      <span className="text-[var(--mm-signal)] font-semibold">Stage 03</span>
                      <span className="mx-2 text-[var(--mm-rule-strong)]">·</span>
                      <span>Coordinate diagnostics &amp; interventions</span>
                    </div>
                    <h1 className="essay-stage-title">
                      Inside the state update.
                    </h1>
                    <p className="essay-lead">
                      Follow the sequence step by step. Inspect per-write coordinate shifts (ΔM), run counterfactual Memory Surgery, and isolate the moment a fact is overwritten.
                    </p>
                  </div>
                </div>
              </header>

              <div className="research-container py-6 space-y-8">
                <Section05FindTheFailure />
                <Page03TraceInteractions />
              </div>

              <PageFooterCta
                currentPage="trace"
                onNavigate={handlePageChange}
                prevPage="break"
                nextPage="measure"
                ctaText="Measure it →"
                subtext="Next: Quantify capacity bounds across dimensions."
              />
            </div>
          )}

          {/* ============================================================ */}
          {/* PAGE 4: MEASURE                                              */}
          {/* ============================================================ */}
          {currentPage === 'measure' && (
            <div className="animate-in fade-in duration-300 w-full">
              <header className="w-full border-b border-[var(--mm-rule)] bg-[var(--page-bg)]">
                <div className="research-container py-12 sm:py-16">
                  <div className="space-y-4 max-w-3xl">
                    <div className="essay-eyebrow">
                      <span className="text-[var(--mm-teal)] font-semibold">Stage 04</span>
                      <span className="mx-2 text-[var(--mm-rule-strong)]">·</span>
                      <span>Empirical capacity &amp; scaling</span>
                    </div>
                    <h1 className="essay-stage-title">
                      How much fits before it fades.
                    </h1>
                    <p className="essay-lead">
                      Measure retrieval accuracy across state dimensions D, track Frobenius norm drift, and test theoretical O(D) capacity bounds against live runs.
                    </p>
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
                ctaText="Now connect the idea →"
                subtext="Next: From vector matrix state to synaptic neural networks."
              />
            </div>
          )}

          {/* ============================================================ */}
          {/* PAGE 5: BDH                                                  */}
          {/* ============================================================ */}
          {currentPage === 'bdh' && (
            <div className="animate-in fade-in duration-300 w-full">
              <header className="w-full border-b border-[var(--mm-rule)] bg-[var(--page-bg)]">
                <div className="research-container py-12 sm:py-16">
                  <div className="space-y-4 max-w-3xl">
                    <div className="essay-eyebrow">
                      <span className="text-[var(--mm-amber)] font-semibold">Stage 05</span>
                      <span className="mx-2 text-[var(--mm-rule-strong)]">·</span>
                      <span>Architecture · Pathway Dragon Hatchling</span>
                    </div>
                    <h1 className="essay-stage-title">
                      From dense matrices to plastic synapses.
                    </h1>
                    <p className="essay-lead">
                      How Pathway’s Dragon Hatchling (BDH) replaces dense recurrent mixing with sparse, scale-free particle graphs governed by local Hebbian plasticity.
                    </p>
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
                ctaText="Explore recurrent reasoning →"
                subtext="Next: Latent dynamics and thinking without token output."
              />
            </div>
          )}

          {/* ============================================================ */}
          {/* PAGE 6: REASON                                               */}
          {/* ============================================================ */}
          {currentPage === 'reason' && (
            <div className="animate-in fade-in duration-300 w-full">
              <header className="w-full border-b border-[var(--mm-rule)] bg-[var(--page-bg)]">
                <div className="research-container py-12 sm:py-16">
                  <div className="space-y-4 max-w-3xl">
                    <div className="essay-eyebrow">
                      <span className="text-[var(--mm-signal)] font-semibold">Stage 06</span>
                      <span className="mx-2 text-[var(--mm-rule-strong)]">·</span>
                      <span>Latent dynamics &amp; BDH-CQ</span>
                    </div>
                    <h1 className="essay-stage-title">
                      Reasoning without token emission.
                    </h1>
                    <p className="essay-lead">
                      Instead of thinking only out loud through discrete tokens, inspect how BDH-CQ iterates continuously across plastic synapses before emitting an answer.
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
                ctaText="Prove what you learned →"
                subtext="Final Stage: Guided evaluation, prediction challenges, and your Certificate."
              />
            </div>
          )}

          {/* ============================================================ */}
          {/* PAGE 7: PROVE                                                */}
          {/* ============================================================ */}
          {currentPage === 'prove' && (
            <div className="animate-in fade-in duration-300 w-full">
              <header className="w-full border-b border-[var(--mm-rule)] bg-[var(--page-bg)]">
                <div className="research-container py-12 sm:py-16">
                  <div className="space-y-4 max-w-3xl">
                    <div className="essay-eyebrow">
                      <span className="text-[var(--mm-teal)] font-semibold">Stage 07</span>
                      <span className="mx-2 text-[var(--mm-rule-strong)]">·</span>
                      <span>Synthesis &amp; verification</span>
                    </div>
                    <h1 className="essay-stage-title">
                      Demonstrate your understanding.
                    </h1>
                    <p className="essay-lead">
                      Predict the state. Trace the update. Explain the trade-off. Verify predictions against live matrix computations and unlock your research certificate.
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

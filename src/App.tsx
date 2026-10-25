import React, { useState, useEffect } from 'react';
import { ExperimentProvider } from './context/ExperimentContext';
import { MemoryLensProvider } from './context/MemoryLensContext';
import { GlossaryProvider, useGlossary } from './context/GlossaryContext';
import { ResearchNav, PageId, PAGES } from './components/navigation/ResearchNav';
import { PageFooterCta } from './components/navigation/PageFooterCta';
import { JudgeMode } from './components/JudgeMode';
import { CertificateModal } from './components/CertificateModal';
import { ConceptGlossaryDrawer } from './components/ConceptGlossaryDrawer';
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
  const { openGlossary } = useGlossary();
  const {
    currentPage,
    handlePageChange,
  } = usePersistentNavigation();

  const [isJudgeModeOpen, setIsJudgeModeOpen] = useState<boolean>(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState<boolean>(false);
  const [milestonesCount, setMilestonesCount] = useState<number>(() => getCompletedMilestones().length);

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

    window.addEventListener('milestone_updated', handleMilestoneUpdate);
    window.addEventListener('final_challenge_completed', handleFinalChallenge);
    window.addEventListener('open_certificate_modal', handleOpenCert);

    return () => {
      window.removeEventListener('milestone_updated', handleMilestoneUpdate);
      window.removeEventListener('final_challenge_completed', handleFinalChallenge);
      window.removeEventListener('open_certificate_modal', handleOpenCert);
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

              <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12 py-8">
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
              <div className="w-full border-b border-[var(--border)] bg-[var(--surface)]">
                <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-sans text-[var(--text-secondary)]">
                      <span className="font-semibold text-[var(--accent-blue-text)]">Stage 02 · Experimentation</span>
                      <span aria-hidden="true" className="text-[var(--border)]">·</span>
                      <span>Stress-testing memory retention</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[var(--text-primary)] tracking-tight">
                      Can You Make It Forget?
                    </h1>
                    <p className="text-sm sm:text-base text-[var(--text-secondary)] font-sans max-w-2xl">
                      Stress-test the recurrent state. Tune retention, inject distractors, and discover the exact boundary where associative memory begins to collide.
                    </p>
                  </div>
                </div>
              </div>

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

                <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
              <div className="w-full border-b border-[var(--border)] bg-[var(--surface)]">
                <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-sans text-[var(--text-secondary)]">
                      <span className="font-semibold text-[var(--accent-blue-text)]">Stage 03 · Diagnostics</span>
                      <span aria-hidden="true" className="text-[var(--border)]">·</span>
                      <span>State coordinate inspection</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[var(--text-primary)] tracking-tight">
                      What Changed Inside the State?
                    </h1>
                    <p className="text-sm sm:text-base text-[var(--text-secondary)] font-sans max-w-2xl">
                      Step through the sequence timeline. Inspect the state coordinate deltas (ΔM), observe counterfactual interventions with Memory Surgery, and isolate the exact moment of interference.
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
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
              <div className="w-full border-b border-[var(--border)] bg-[var(--surface)]">
                <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-sans text-[var(--text-secondary)]">
                      <span className="font-semibold text-[var(--accent-green-text)]">Stage 04 · Evidence</span>
                      <span aria-hidden="true" className="text-[var(--border)]">·</span>
                      <span>Empirical capacity measurements</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[var(--text-primary)] tracking-tight">
                      Turn Observations into Evidence
                    </h1>
                    <p className="text-sm sm:text-base text-[var(--text-secondary)] font-sans max-w-2xl">
                      Plot real empirical performance data. Measure retrieval accuracy against memory dimension, track Frobenius norm drift, and verify theoretical capacity limits.
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12 py-8">
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
              <div className="w-full border-b border-[var(--border)] bg-[var(--surface)]">
                <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-sans text-[var(--text-secondary)]">
                      <span className="font-semibold text-[var(--accent-yellow-text)]">Stage 05 · Architecture</span>
                      <span aria-hidden="true" className="text-[var(--border)]">·</span>
                      <span>Synaptic neural network structures</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[var(--text-primary)] tracking-tight">
                      From Vector States to Synaptic Networks
                    </h1>
                    <p className="text-sm sm:text-base text-[var(--text-secondary)] font-sans max-w-2xl">
                      Discover Pathway's Dragon Hatchling (BDH) architecture. Explore how biological Hebbian plasticity and scale-free connectivity turn recurrent state into decentralized synaptic memory.
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full space-y-12 py-8">
                <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
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
              <div className="w-full border-b border-[var(--border)] bg-[var(--surface)]">
                <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-sans text-[var(--text-secondary)]">
                      <span className="font-semibold text-[var(--accent-blue-text)]">Stage 06 · Latent reasoning</span>
                      <span aria-hidden="true" className="text-[var(--border)]">·</span>
                      <span>Continuous state dynamics and BDH-CQ</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[var(--text-primary)] tracking-tight">
                      Recurrent Latent Computation
                    </h1>
                    <p className="text-sm sm:text-base text-[var(--text-secondary)] font-sans max-w-2xl">
                      What if reasoning happens in continuous state before tokens are emitted? Explore BDH-CQ and iterative synaptic relaxation loops.
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12 py-8">
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
              <div className="w-full border-b border-[var(--border)] bg-[var(--surface)]">
                <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-sans text-[var(--text-secondary)]">
                      <span className="font-semibold text-[var(--accent-green-text)]">Stage 07 · Evaluation & Capstone</span>
                      <span aria-hidden="true" className="text-[var(--border)]">·</span>
                      <span>Synthesis, verification, and certification</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[var(--text-primary)] tracking-tight">
                      Demonstrate Your Understanding
                    </h1>
                    <p className="text-sm sm:text-base text-[var(--text-secondary)] font-sans max-w-2xl">
                      Complete the 60-second guided challenge, verify your empirical predictions, synthesize concepts, and claim your Certificate of Completion.
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12 py-8">
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

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
import { usePersistentNavigation } from './hooks/usePersistentNavigation';

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
        setMilestonesCount(e.detail.all.length);
      }
    };
    window.addEventListener('milestone_updated', handleMilestoneUpdate);
    return () => window.removeEventListener('milestone_updated', handleMilestoneUpdate);
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#252525] font-sans selection:bg-[#E7F2FA] selection:text-[#21445B]">
      {/* Navigation Bar */}
      <ResearchNav
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onStartJudgeMode={() => setIsJudgeModeOpen(true)}
        onOpenCertificate={() => setIsCertificateModalOpen(true)}
        onOpenGlossary={() => openGlossary()}
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
              <div className="w-full border-b border-[#E5E0D8] bg-[#FAF8F5]/80">
                <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-[#21445B]">
                      <span className="px-2 py-0.5 rounded bg-[#E7F2FA] border border-[#CDE1F0] font-bold">STAGE 02</span>
                      <span>·</span>
                      <span className="text-[#5F625F]">EXPERIMENTATION</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#252525] tracking-tight">
                      Can You Make It Forget?
                    </h1>
                    <p className="text-sm sm:text-base text-[#52504A] font-sans max-w-2xl">
                      Stress-test the recurrent state. Tune retention, inject distractors, and discover the exact boundary where associative memory begins to collide.
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full">
                <Section04InterferenceLab />
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
              <div className="w-full border-b border-[#E5E0D8] bg-[#FAF8F5]/80">
                <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-[#167C80]">
                      <span className="px-2 py-0.5 rounded bg-[#E6F4F5] font-bold">STAGE 03</span>
                      <span>·</span>
                      <span className="text-[#716F68]">DIAGNOSTICS</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#151515] tracking-tight">
                      What Changed Inside the State?
                    </h1>
                    <p className="text-sm sm:text-base text-[#52504A] font-sans max-w-2xl">
                      Step through the sequence timeline. Inspect the state coordinate deltas (ΔM), observe counterfactual interventions with Memory Surgery, and isolate the exact moment of interference.
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full">
                <Section05FindTheFailure />
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
              <div className="w-full border-b border-[#E5E0D8] bg-[#FAF8F5]/80">
                <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-[#247A4B]">
                      <span className="px-2 py-0.5 rounded bg-[#EAF5EF] font-bold">STAGE 04</span>
                      <span>·</span>
                      <span className="text-[#716F68]">EVIDENCE</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#151515] tracking-tight">
                      Turn Observations into Evidence
                    </h1>
                    <p className="text-sm sm:text-base text-[#52504A] font-sans max-w-2xl">
                      Plot real empirical performance data. Measure retrieval accuracy against memory dimension, track Frobenius norm drift, and verify theoretical capacity limits.
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12 py-8">
                <SectionMeasure />
                <CapacityExperiment id="section-capacity-bounds" />
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
              <div className="w-full border-b border-[#E5E0D8] bg-[#FAF8F5]/80">
                <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-[#A46622]">
                      <span className="px-2 py-0.5 rounded bg-[#FBF2E8] font-bold">STAGE 05</span>
                      <span>·</span>
                      <span className="text-[#716F68]">ARCHITECTURE</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#151515] tracking-tight">
                      From Vector States to Synaptic Networks
                    </h1>
                    <p className="text-sm sm:text-base text-[#52504A] font-sans max-w-2xl">
                      Discover Pathway's Dragon Hatchling (BDH) architecture. Explore how biological Hebbian plasticity and scale-free connectivity turn recurrent state into decentralized synaptic memory.
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full space-y-12 py-8">
                <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                  <Section06WhyThisMatters />
                  <Section07MeetBDH />
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
              <div className="w-full border-b border-[#E5E0D8] bg-[#FAF8F5]/80">
                <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-[#21445B]">
                      <span className="px-2 py-0.5 rounded bg-[#E7F2FA] border border-[#CDE1F0] font-bold">STAGE 06</span>
                      <span>·</span>
                      <span className="text-[#5F625F]">LATENT REASONING</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#252525] tracking-tight">
                      Recurrent Latent Computation
                    </h1>
                    <p className="text-sm sm:text-base text-[#52504A] font-sans max-w-2xl">
                      What if reasoning happens in continuous state before tokens are emitted? Explore BDH-CQ and iterative synaptic relaxation loops.
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12 py-8">
                <Section09BDHPlayground />
                <Section10BDHCQ />
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
              <div className="w-full border-b border-[#E5E0D8] bg-[#FAF8F5]/80">
                <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-[#247A4B]">
                      <span className="px-2 py-0.5 rounded bg-[#EAF5EF] font-bold">STAGE 07</span>
                      <span>·</span>
                      <span className="text-[#716F68]">EVALUATION & CAPSTONE</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#151515] tracking-tight">
                      Demonstrate Your Understanding
                    </h1>
                    <p className="text-sm sm:text-base text-[#52504A] font-sans max-w-2xl">
                      Complete the 60-second guided challenge, verify your empirical predictions, synthesize concepts, and claim your Certificate of Completion.
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12 py-8">
                <SixtySecondTest />
                <FinalChallenge />
                <ConceptMap id="concept-synthesis-map" />
                <EvidenceAndSources />
                <YouMadeItSection />
              </div>

              <TakeawaysAndFooter />
            </div>
          )}
        </main>
      </div>
  );
}

export default function App() {
  return (
    <ExperimentProvider>
      <MemoryLensProvider>
        <GlossaryProvider>
          <AppContent />
        </GlossaryProvider>
      </MemoryLensProvider>
    </ExperimentProvider>
  );
}

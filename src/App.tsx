import React, { useState, useEffect, useMemo } from 'react';
import { MemoryLensProvider } from './context/MemoryLensContext';
import { ResearchNav } from './components/navigation/ResearchNav';
import { ProgressRail } from './components/navigation/ProgressRail';
import { ChapterIndexModal } from './components/navigation/ChapterIndexModal';
import { JudgeMode } from './components/JudgeMode';
import { ConceptMap } from './components/ConceptMap';
import { LandingDemo } from './components/LandingDemo';
import { Section01MemoryProblem } from './components/Section01MemoryProblem';
import { Section02GrowingContext } from './components/Section02GrowingContext';
import { Section03RecurrentMemory } from './components/Section03RecurrentMemory';
import { SectionMeasure } from './components/SectionMeasure';
import { Section04InterferenceLab } from './components/Section04InterferenceLab';
import { Section05FindTheFailure } from './components/Section05FindTheFailure';
import { Section06WhyThisMatters } from './components/Section06WhyThisMatters';
import { Section07MeetBDH } from './components/Section07MeetBDH';
import { Section08BDHArchitecture } from './components/Section08BDHArchitecture';
import { Section09BDHPlayground } from './components/Section09BDHPlayground';
import { Section10BDHCQ } from './components/Section10BDHCQ';
import { SoWhatSection } from './components/SoWhatSection';
import { EvidenceAndSources } from './components/EvidenceAndSources';
import { SixtySecondTest } from './components/SixtySecondTest';
import { FinalChallenge } from './components/FinalChallenge';
import { YouMadeItSection } from './components/YouMadeItSection';
import { TakeawaysAndFooter } from './components/TakeawaysAndFooter';

const SECTION_IDS = [
  'landing-hero',
  'section-01',
  'section-02',
  'section-03',
  'section-measure',
  'section-04',
  'section-05',
  'section-06',
  'section-07',
  'section-08',
  'section-09',
  'section-10',
  'section-so-what',
  'evidence-sources',
  'final-eval',
  'you-made-it',
  'takeaways',
];

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('landing-hero');
  const [isIndexModalOpen, setIsIndexModalOpen] = useState<boolean>(false);
  const [isJudgeModeOpen, setIsJudgeModeOpen] = useState<boolean>(false);

  // Handle section jumping
  const handleSelectSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Observe active section on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const activeSectionIndex = useMemo(() => {
    const idx = SECTION_IDS.indexOf(activeSection);
    return idx >= 0 ? idx : 0;
  }, [activeSection]);

  return (
    <MemoryLensProvider>
      <div className="min-h-screen bg-[#07080B] text-[#F4F5F7] font-sans selection:bg-violet-500/30 selection:text-white">
        {/* Persistent Research Navigation Bar with Dedicated Index button */}
        <ResearchNav
          currentSectionId={activeSection}
          activeSectionIndex={activeSectionIndex}
          totalSections={12}
          onNavigate={handleSelectSection}
          onOpenIndex={() => setIsIndexModalOpen(true)}
          onStartJudgeMode={() => setIsJudgeModeOpen(true)}
        />

        {/* Dedicated Chapter Index Modal / Directory */}
        <ChapterIndexModal
          isOpen={isIndexModalOpen}
          onClose={() => setIsIndexModalOpen(false)}
          currentSectionId={activeSection}
          onNavigate={handleSelectSection}
        />

        {/* Dedicated 60-Second Judge Mode Overlay Flow */}
        <JudgeMode
          isOpen={isJudgeModeOpen}
          onClose={() => setIsJudgeModeOpen(false)}
        />

        {/* Main Scientific Explainer Content */}
        <main className="w-full">
          {/* Step 00: Landing Screen with Immediate Running Sequence & 60s Judge CTA */}
          <LandingDemo
            onExploreClick={() => handleSelectSection('section-01')}
            onStartJudgeMode={() => setIsJudgeModeOpen(true)}
          />

          {/* Step 01: The Memory Problem */}
          <Section01MemoryProblem />

          {/* Step 02: Growing Context Comparison */}
          <Section02GrowingContext />

          {/* Step 03: Fixed-Size Recurrent State (Mathematical Toy Model) */}
          <Section03RecurrentMemory />

          {/* Step 04: Measure Section (Watch Memory Change) */}
          <SectionMeasure />

          {/* Step 05: Interference Lab (Key Interactive Lesson) */}
          <Section04InterferenceLab />

          {/* Step 06: Find the Failure Challenge Mode */}
          <Section05FindTheFailure />

          {/* Step 07: Why This Matters (The Foundational Trade-off) */}
          <Section06WhyThisMatters />

          {/* Step 08: Meet Dragon Hatchling (BDH) */}
          <Section07MeetBDH />

          {/* Step 09: Synaptic Memory & Interactive Graph */}
          <Section08BDHArchitecture />

          {/* Step 10: BDH Latent Dynamics Playground */}
          <Section09BDHPlayground />

          {/* Step 11: BDH-CQ Latent In-Context Reasoning */}
          <Section10BDHCQ />

          {/* Step 12: So What? Why Does Memory Architecture Matter? */}
          <SoWhatSection />

          {/* Step 13: Research Evidence & Paper Landscape */}
          <EvidenceAndSources />

          {/* Step 14: The 60-Second Test & Final Challenge */}
          <section id="final-eval" className="scroll-mt-20 border-b border-[#252A35] bg-[#07080B] py-14">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 space-y-10">
              <SixtySecondTest />
              <FinalChallenge />
              {/* Interactive Concept Map Synthesis */}
              <ConceptMap id="concept-synthesis-map" />
            </div>
          </section>

          {/* Step 15: You Made It & Certificate of Completion */}
          <YouMadeItSection />
        </main>

        {/* Synthesis & Footer */}
        <TakeawaysAndFooter />
      </div>
    </MemoryLensProvider>
  );
}

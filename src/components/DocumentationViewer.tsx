import React, { useState } from 'react';
import {
  BookOpen,
  Layers,
  Palette,
  ShieldAlert,
  CheckSquare,
  Cpu,
  ArrowLeft,
  Copy,
  Check,
  Search,
  ExternalLink,
} from 'lucide-react';
import { InlineMath, BlockMath } from './ui/MathView';

type DocSectionId = 'project' | 'architecture' | 'design' | 'rules' | 'tasks' | 'memory';

interface DocSection {
  id: DocSectionId;
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  fileName: string;
}

const DOC_SECTIONS: DocSection[] = [
  {
    id: 'project',
    title: 'Project Requirements',
    subtitle: 'Product requirements, personas, and pedagogical framework',
    badge: 'PRD.md',
    icon: BookOpen,
    fileName: 'docs/PRD.md',
  },
  {
    id: 'architecture',
    title: 'System Architecture',
    subtitle: 'Mathematical engine, fast-weights, and state projections',
    badge: 'ARCHITECTURE.md',
    icon: Layers,
    fileName: 'docs/ARCHITECTURE.md',
  },
  {
    id: 'design',
    title: 'Design System',
    subtitle: 'Editorial typography, mathematical scales, and color palette',
    badge: 'DESIGN.md',
    icon: Palette,
    fileName: 'docs/DESIGN.md',
  },
  {
    id: 'rules',
    title: 'Scientific Rules',
    subtitle: 'Scientific honesty, epistemic labels, and code guardrails',
    badge: 'RULES.md',
    icon: ShieldAlert,
    fileName: 'docs/RULES.md',
  },
  {
    id: 'tasks',
    title: 'Tasks & Progress',
    subtitle: 'Completed implementations, 60s test, and verification log',
    badge: 'TASKS.md',
    icon: CheckSquare,
    fileName: 'docs/TASKS.md',
  },
  {
    id: 'memory',
    title: 'Project Memory',
    subtitle: 'Mechanistic deep dive into recurrent memory & BDH synapses',
    badge: 'MEMORY.md',
    icon: Cpu,
    fileName: 'docs/MEMORY.md',
  },
];

interface DocumentationViewerProps {
  onBackToLab: () => void;
  initialSection?: DocSectionId;
}

export const DocumentationViewer: React.FC<DocumentationViewerProps> = ({
  onBackToLab,
  initialSection = 'project',
}) => {
  const [activeSection, setActiveSection] = useState<DocSectionId>(initialSection);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const filteredSections = DOC_SECTIONS.filter(
    (sec) =>
      sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.badge.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + '/docs#' + activeSection);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="documentation-viewer" className="min-h-screen bg-[#FBF9F5] text-[#1C1B19] font-sans pb-16">
      {/* Top Academic Header */}
      <header className="sticky top-0 z-30 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E5E0D8]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToLab}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D5D2C9] bg-[#FAF8F5] text-xs font-semibold text-[#4B4840] hover:bg-[#F2EFE8] transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Experiment</span>
            </button>
            <div className="h-4 w-px bg-[#E5E0D8] hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-base text-[#1C1B19]">
                Memory in Motion
              </span>
              <span className="text-[#8C887E]">/</span>
              <span className="text-xs font-mono text-[#1B4D7E] bg-[#EAF2FA] px-2 py-0.5 rounded border border-[#CDE1F2]">
                Documentation Hub
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#D5D2C9] bg-white text-[#4B4840] hover:bg-[#FAF8F5] transition cursor-pointer"
              title="Copy direct link to this section"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#2E7D4E]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copied' : 'Share Doc'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Navigation Sidebar */}
          <aside className="lg:col-span-4 xl:col-span-3 space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C887E]" />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-[#D5D2C9] text-xs focus:outline-none focus:ring-1 focus:ring-[#1B4D7E] focus:border-[#1B4D7E] font-sans"
              />
            </div>

            {/* Tree Section */}
            <div className="bg-white rounded-2xl border border-[#E5E0D8] p-3 shadow-xs space-y-1">
              <div className="px-3 py-2 text-[11px] font-mono font-bold tracking-wider text-[#7C786E] uppercase border-b border-[#F0EEEA] mb-1 flex items-center justify-between">
                <span>Documentation</span>
                <span>6 specs</span>
              </div>

              {filteredSections.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setActiveSection(sec.id)}
                    className={`w-full text-left p-2.5 rounded-xl transition flex items-start gap-3 cursor-pointer ${
                      isActive
                        ? 'bg-[#EAF2FA] text-[#1B4D7E] font-semibold border border-[#CDE1F2]'
                        : 'text-[#48453E] hover:bg-[#FAF8F5] border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isActive ? 'text-[#1B4D7E]' : 'text-[#7C786E]'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs truncate">{sec.title}</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#8C887E] block truncate mt-0.5">
                        {sec.badge}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* External Links Box */}
            <div className="bg-[#FAF8F5] rounded-xl border border-[#E5E0D8] p-4 text-xs space-y-2">
              <div className="font-serif font-bold text-[#1C1B19] flex items-center gap-1.5">
                <span>Reference Repositories</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-[#55524B]">
                <li>
                  <a
                    href="https://github.com/pathwaycom/bdh"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#1B4D7E] hover:underline flex items-center gap-1 font-mono"
                  >
                    <span>pathwaycom/bdh</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://arxiv.org/abs/2509.26507"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#1B4D7E] hover:underline flex items-center gap-1 font-mono"
                  >
                    <span>arXiv:2509.26507</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>
          </aside>

          {/* Right Content Area */}
          <main className="lg:col-span-8 xl:col-span-9 bg-white rounded-2xl border border-[#E5E0D8] p-6 sm:p-10 shadow-xs space-y-8 font-sans">
            {/* Section 1: PRD */}
            {activeSection === 'project' && (
              <article className="space-y-6">
                <div className="border-b border-[#E5E0D8] pb-4">
                  <span className="text-xs font-mono font-bold text-[#1B4D7E] bg-[#EAF2FA] px-2 py-0.5 rounded border border-[#CDE1F2]">
                    docs/PRD.md
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1B19] tracking-tight mt-2">
                    Product Requirements Document (PRD)
                  </h1>
                  <p className="text-sm text-[#55524B] mt-1">
                    Pedagogical requirements, target personas, and the 7-stage learning journey.
                  </p>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-[#3E3B34] leading-relaxed">
                  <h2 className="font-serif font-bold text-lg text-[#1C1B19]">1. Executive Summary</h2>
                  <p>
                    <em>Memory in Motion</em> is an interactive, browser-based computational research laboratory designed to teach the mechanics of recurrent working memory, associative state matrices, capacity bounds, and synaptic network architectures (such as Pathway's Dragon Hatchling / BDH). The application replaces passive text explanations with live linear algebraic simulation, counterfactual interventions, and empirical evaluations.
                  </p>

                  <h2 className="font-serif font-bold text-lg text-[#1C1B19]">2. Target Personas</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] space-y-1">
                      <strong className="text-[#1C1B19] text-xs">AI Researchers</strong>
                      <p className="text-[11px] text-[#605C54]">
                        Seeking intuition for alternatives to unbounded Transformer KV-caches and non-token latent reasoning.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] space-y-1">
                      <strong className="text-[#1C1B19] text-xs">ML Students</strong>
                      <p className="text-[11px] text-[#605C54]">
                        Learning Hebbian plasticity, rank-1 outer-product updates, and subspace interference in high dimensions.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] space-y-1">
                      <strong className="text-[#1C1B19] text-xs">Scientific Evaluators</strong>
                      <p className="text-[11px] text-[#605C54]">
                        Looking for verified empirical evidence, reproducible calculations, and rigorous epistemic separation.
                      </p>
                    </div>
                  </div>

                  <h2 className="font-serif font-bold text-lg text-[#1C1B19]">3. Core Pedagogical Journey (7 Stages)</h2>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li><strong>Stage 01: Memory</strong> — The fundamental trade-off: Unbounded KV-cache token tapes vs. fixed-size continuous recurrent states.</li>
                    <li><strong>Stage 02: Break</strong> — Stress-testing state capacity. Ingesting sequential facts and distractor perturbations to witness geometric coordinate collisions.</li>
                    <li><strong>Stage 03: Trace</strong> — State coordinate difference inspection (<InlineMath math="\Delta M" />) and Counterfactual Memory Surgery.</li>
                    <li><strong>Stage 04: Measure</strong> — Quantitative capacity scaling bounds (<InlineMath math="C \approx \mathcal{O}(d)" />) across dimensions (D=4 to 64).</li>
                    <li><strong>Stage 05: BDH</strong> — Moving from a single dense matrix to Pathway's Dragon Hatchling (BDH) architecture and scale-free synaptic networks.</li>
                    <li><strong>Stage 06: Reason</strong> — Continuous latent thinking loops (BDH-CQ) before token generation with interactive particle relaxation.</li>
                    <li><strong>Stage 07: Prove</strong> — 60-Second Fast Verification interactive assessment and verifiable Certificate of Completion.</li>
                  </ol>
                </div>
              </article>
            )}

            {/* Section 2: Architecture */}
            {activeSection === 'architecture' && (
              <article className="space-y-6">
                <div className="border-b border-[#E5E0D8] pb-4">
                  <span className="text-xs font-mono font-bold text-[#1B4D7E] bg-[#EAF2FA] px-2 py-0.5 rounded border border-[#CDE1F2]">
                    docs/ARCHITECTURE.md
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1B19] tracking-tight mt-2">
                    System Architecture & Technical Specifications
                  </h1>
                  <p className="text-sm text-[#55524B] mt-1">
                    Linear algebraic simulation engine, fast-weights, and deterministic hashing.
                  </p>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-[#3E3B34] leading-relaxed">
                  <h2 className="font-serif font-bold text-lg text-[#1C1B19]">1. Client-Side Computational Engine</h2>
                  <p>
                    All mathematical operations run entirely in-browser using pure vector arithmetic in <code>/src/models/associativeMemory.ts</code>. No server latency or remote execution delays exist.
                  </p>

                  <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] space-y-3 font-mono text-xs">
                    <div className="text-[#1B4D7E] font-bold">Fast-Weight Recurrence Update:</div>
                    <BlockMath math="M_{t+1} = \lambda M_t + \eta \, k_t v_t^\top" />
                    <p className="font-sans text-[11px] text-[#55524B]">
                      Where $\lambda \in [0, 1]$ represents retention decay and $\eta &gt; 0$ represents write strength.
                    </p>
                  </div>

                  <h2 className="font-serif font-bold text-lg text-[#1C1B19]">2. Associative Readout Formulation</h2>
                  <p>
                    When querying with probe vector $q$, the retrieved representation is computed via matrix-vector multiplication:
                  </p>
                  <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] space-y-2 font-mono text-xs">
                    <BlockMath math="\hat{v} = M_t q = \underbrace{\lambda^{t-\tau} \eta (k_\tau^\top q) v_\tau}_{\text{Signal}} + \underbrace{\sum_{i \neq \tau} \lambda^{t-i} \eta (k_i^\top q) v_i}_{\text{Crosstalk Noise}}" />
                  </div>

                  <h2 className="font-serif font-bold text-lg text-[#1C1B19]">3. Component Architecture</h2>
                  <p>
                    Global state is coordinated via <code>ExperimentContext</code> and <code>usePersistentNavigation</code>. Milestone progress is tracked through <code>progressTracker.ts</code> with events dispatching on completion.
                  </p>
                </div>
              </article>
            )}

            {/* Section 3: Design */}
            {activeSection === 'design' && (
              <article className="space-y-6">
                <div className="border-b border-[#E5E0D8] pb-4">
                  <span className="text-xs font-mono font-bold text-[#1B4D7E] bg-[#EAF2FA] px-2 py-0.5 rounded border border-[#CDE1F2]">
                    docs/DESIGN.md
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1B19] tracking-tight mt-2">
                    Design System Specification
                  </h1>
                  <p className="text-sm text-[#55524B] mt-1">
                    Anti-slop aesthetics, academic print atmosphere, and mathematical typography.
                  </p>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-[#3E3B34] leading-relaxed">
                  <h2 className="font-serif font-bold text-lg text-[#1C1B19]">1. Core Color System</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl border border-[#E5E0D8] bg-[#FBF9F5]">
                      <div className="w-full h-8 rounded-lg bg-[#FBF9F5] border border-[#DDD9CF] mb-2" />
                      <div className="font-mono text-[11px] font-bold">Paper Base</div>
                      <div className="font-mono text-[10px] text-[#7C786E]">#FBF9F5</div>
                    </div>
                    <div className="p-3 rounded-xl border border-[#E5E0D8] bg-white">
                      <div className="w-full h-8 rounded-lg bg-[#1B4D7E] mb-2" />
                      <div className="font-mono text-[11px] font-bold">Academic Navy</div>
                      <div className="font-mono text-[10px] text-[#7C786E]">#1B4D7E</div>
                    </div>
                    <div className="p-3 rounded-xl border border-[#E5E0D8] bg-white">
                      <div className="w-full h-8 rounded-lg bg-[#1E6B43] mb-2" />
                      <div className="font-mono text-[11px] font-bold">Empirical Green</div>
                      <div className="font-mono text-[10px] text-[#7C786E]">#1E6B43</div>
                    </div>
                    <div className="p-3 rounded-xl border border-[#E5E0D8] bg-white">
                      <div className="w-full h-8 rounded-lg bg-[#9A2222] mb-2" />
                      <div className="font-mono text-[11px] font-bold">Interference Rose</div>
                      <div className="font-mono text-[10px] text-[#7C786E]">#9A2222</div>
                    </div>
                  </div>

                  <h2 className="font-serif font-bold text-lg text-[#1C1B19]">2. Typography Hierarchy</h2>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong>Display & Headings:</strong> Newsreader / Source Serif 4 for authoritative academic presence.</li>
                    <li><strong>Interface & Body:</strong> DM Sans / Inter for dense, highly legible controls.</li>
                    <li><strong>Formulas & Notation:</strong> JetBrains Mono and KaTeX for pristine mathematical precision.</li>
                  </ul>
                </div>
              </article>
            )}

            {/* Section 4: Rules */}
            {activeSection === 'rules' && (
              <article className="space-y-6">
                <div className="border-b border-[#E5E0D8] pb-4">
                  <span className="text-xs font-mono font-bold text-[#1B4D7E] bg-[#EAF2FA] px-2 py-0.5 rounded border border-[#CDE1F2]">
                    docs/RULES.md
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1B19] tracking-tight mt-2">
                    Scientific Honesty & Development Rules
                  </h1>
                  <p className="text-sm text-[#55524B] mt-1">
                    Epistemic humility, explicit toy model boundaries, and zero fake data.
                  </p>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-[#3E3B34] leading-relaxed">
                  <div className="p-4 rounded-xl bg-[#FEF9EE] border border-[#F8DDB3] text-[#8C6212] space-y-2">
                    <strong className="block font-serif text-sm">Rule 1: Explicit Toy Model Boundaries</strong>
                    <p className="text-xs leading-relaxed">
                      Always declare that our single-matrix memory model is a pedagogical vehicle for linear algebraic principles (superposition, crosstalk, decay), NOT an exact replica of Pathway's commercial Dragon Hatchling (BDH) architecture.
                    </p>
                  </div>

                  <h2 className="font-serif font-bold text-lg text-[#1C1B19]">Rule 2: No Fabricated Engine Output</h2>
                  <p>
                    All cosine margins, coordinate shifts, and retrieval accuracies must evaluate through actual vector arithmetic in <code>createAssociativeMemory</code>. No mock labels or static fakes are permitted.
                  </p>

                  <h2 className="font-serif font-bold text-lg text-[#1C1B19]">Rule 3: Client Privacy & Local Execution</h2>
                  <p>
                    Zero private API keys or personal identifiers exist in client bundles. All progression data is strictly stored in client <code>localStorage</code>.
                  </p>
                </div>
              </article>
            )}

            {/* Section 5: Tasks */}
            {activeSection === 'tasks' && (
              <article className="space-y-6">
                <div className="border-b border-[#E5E0D8] pb-4">
                  <span className="text-xs font-mono font-bold text-[#1B4D7E] bg-[#EAF2FA] px-2 py-0.5 rounded border border-[#CDE1F2]">
                    docs/TASKS.md
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1B19] tracking-tight mt-2">
                    Tasks & Verification Log
                  </h1>
                  <p className="text-sm text-[#55524B] mt-1">
                    Implementation audit of milestones, interactive assessment, and launch checklist.
                  </p>
                </div>

                <div className="space-y-3 text-xs sm:text-sm text-[#3E3B34]">
                  <div className="p-3.5 rounded-xl bg-[#F0F8F3] border border-[#BDE0C8] flex items-center gap-3">
                    <Check className="w-5 h-5 text-[#2E7D4E] shrink-0" />
                    <div>
                      <strong className="text-[#1E5635]">60-Second Fast Verification Assessment:</strong>
                      <span className="text-[#3E3B34] block text-xs">
                        Stateful 5-stage real-time interactive assessment with live associative memory queries, 60s hard stop, and persistence.
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F0F8F3] border border-[#BDE0C8] flex items-center gap-3">
                    <Check className="w-5 h-5 text-[#2E7D4E] shrink-0" />
                    <div>
                      <strong className="text-[#1E5635]">Interactive Particle Physics & BDH-CQ:</strong>
                      <span className="text-[#3E3B34] block text-xs">
                        Canvas particle relaxation simulation demonstrating continuous latent thinking loops before token emission.
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F0F8F3] border border-[#BDE0C8] flex items-center gap-3">
                    <Check className="w-5 h-5 text-[#2E7D4E] shrink-0" />
                    <div>
                      <strong className="text-[#1E5635]">Certificate of Completion & Confetti:</strong>
                      <span className="text-[#3E3B34] block text-xs">
                        Automated confetti explosion on capstone unlock and vector PDF export via jsPDF.
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F0F8F3] border border-[#BDE0C8] flex items-center gap-3">
                    <Check className="w-5 h-5 text-[#2E7D4E] shrink-0" />
                    <div>
                      <strong className="text-[#1E5635]">Launch Readiness & Legal Suite:</strong>
                      <span className="text-[#3E3B34] block text-xs">
                        Privacy policy, Terms of Use, cookie consent banner, social OG card, and Schema.org metadata.
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            )}

            {/* Section 6: Memory */}
            {activeSection === 'memory' && (
              <article className="space-y-6">
                <div className="border-b border-[#E5E0D8] pb-4">
                  <span className="text-xs font-mono font-bold text-[#1B4D7E] bg-[#EAF2FA] px-2 py-0.5 rounded border border-[#CDE1F2]">
                    docs/MEMORY.md
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1B19] tracking-tight mt-2">
                    Project Memory: Mechanistic Deep Dive
                  </h1>
                  <p className="text-sm text-[#55524B] mt-1">
                    Mathematical derivation of recurrent memory, crosstalk bounds, and BDH synapses.
                  </p>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-[#3E3B34] leading-relaxed">
                  <h2 className="font-serif font-bold text-lg text-[#1C1B19]">1. The Capacity Threshold</h2>
                  <p>
                    In finite dimensions $d$, random unit vectors have expected dot product magnitude:
                  </p>
                  <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8]">
                    <BlockMath math="\mathbb{E}[|u^\top v|] \approx \sqrt{\frac{2}{\pi d}}" />
                  </div>
                  <p>
                    As the sequence length <InlineMath math="T" /> grows beyond capacity <InlineMath math="C \approx \mathcal{O}(d)" />, coordinate interference builds up until the signal margin drops below the decision boundary.
                  </p>

                  <h2 className="font-serif font-bold text-lg text-[#1C1B19]">2. Pathway's Dragon Hatchling (BDH) Architecture</h2>
                  <p>
                    BDH mitigates catastrophic interference through biological Hebbian plasticity and scale-free connectivity:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong>Plastic Synaptic Weights:</strong> State is distributed across connections <InlineMath math="\sigma(i, j)" /> rather than a single dense block.</li>
                    <li><strong>Sparse Activation Cliques:</strong> New memories only modify active subgraphs, protecting earlier information from destructive overwriting.</li>
                    <li><strong>Latent Relaxation (BDH-CQ):</strong> Continuous iterative relaxation before token generation replaces single forward-pass limitations.</li>
                  </ul>
                </div>
              </article>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

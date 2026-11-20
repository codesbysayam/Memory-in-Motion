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
    <div id="documentation-viewer" className="min-h-screen bg-[var(--page-bg)] text-[var(--text-primary)] font-sans pb-16">
      {/* Top Academic Header */}
      <header className="sticky top-0 z-30 bg-[var(--page-bg)]/95 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onBackToLab}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-soft)] transition cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Experiment</span>
            </button>
            <div className="h-4 w-px bg-[var(--border)] hidden sm:block" />
            <div className="flex items-center gap-2 min-w-0 truncate">
              <span className="font-serif font-normal text-base sm:text-lg text-[var(--text-primary)] truncate">
                Memory in Motion
              </span>
              <span className="text-[var(--text-muted)] hidden sm:inline">/</span>
              <span className="text-xs font-mono text-[var(--color-accent-ink)] hidden sm:inline">
                Documentation Hub
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-soft)] transition cursor-pointer"
              title="Copy direct link to this section"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[var(--color-success)]" /> : <Copy className="w-3.5 h-3.5 text-[var(--text-secondary)]" />}
              <span>{copied ? 'Link Copied' : 'Share Doc'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Navigation Sidebar */}
          <aside className="lg:col-span-4 xl:col-span-3 space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] rounded-lg border border-[var(--border)] text-xs focus:outline-none focus:border-[var(--color-accent)] font-sans"
              />
            </div>

            {/* Tree Section */}
            <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-2.5 space-y-1">
              <div className="px-2.5 py-2 text-[11px] font-mono text-[var(--text-muted)] border-b border-[var(--border)] mb-1 flex items-center justify-between">
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
                    className={`w-full text-left p-2.5 rounded-lg transition flex items-start gap-2.5 cursor-pointer ${
                      isActive
                        ? 'bg-[var(--accent-blue)] text-[var(--color-accent-ink)] font-semibold'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--surface-soft)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isActive ? 'text-[var(--color-accent-ink)]' : 'text-[var(--text-muted)]'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs truncate">{sec.title}</div>
                      <span className="text-[10px] font-mono text-[var(--text-muted)] block truncate mt-0.5">
                        {sec.badge}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* External Links Box */}
            <div className="bg-[var(--surface-soft)] rounded-xl border border-[var(--border)] p-4 text-xs space-y-2">
              <div className="font-sans font-semibold text-[var(--text-primary)]">
                Reference Repositories
              </div>
              <ul className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                <li>
                  <a
                    href="https://github.com/pathwaycom/bdh"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--color-accent-ink)] hover:underline flex items-center gap-1 font-mono"
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
                    className="text-[var(--color-accent-ink)] hover:underline flex items-center gap-1 font-mono"
                  >
                    <span>arXiv:2509.26507</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>
          </aside>

          {/* Right Content Area */}
          <main className="lg:col-span-8 xl:col-span-9 bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6 sm:p-10 space-y-8 font-sans">
            {/* Section 1: PRD */}
            {activeSection === 'project' && (
              <article className="space-y-6">
                <div className="border-b border-[var(--border)] pb-4">
                  <span className="text-xs font-mono font-medium text-[var(--color-accent-ink)]">
                    docs/PRD.md
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[var(--text-primary)] tracking-tight mt-1.5">
                    Product Requirements Document (PRD)
                  </h1>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Pedagogical requirements, target personas, and the 7-stage learning journey.
                  </p>
                </div>

                <div className="space-y-4 text-sm text-[var(--text-secondary)] leading-relaxed">
                  <h3 className="font-sans font-semibold text-base text-[var(--text-primary)]">1. Executive Summary</h3>
                  <p>
                    <em className="text-[var(--text-primary)]">Memory in Motion</em> is an interactive, browser-based computational research laboratory designed to teach the mechanics of recurrent working memory, associative state matrices, capacity bounds, and synaptic network architectures (such as Pathway's Dragon Hatchling / BDH). The application replaces passive text explanations with live linear algebraic simulation, counterfactual interventions, and empirical evaluations.
                  </p>

                  <h3 className="font-sans font-semibold text-base text-[var(--text-primary)]">2. Target Personas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    <div className="p-3.5 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)] space-y-1">
                      <strong className="text-[var(--text-primary)] text-xs block">AI Researchers</strong>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Seeking intuition for alternatives to unbounded Transformer KV-caches and non-token latent reasoning.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)] space-y-1">
                      <strong className="text-[var(--text-primary)] text-xs block">ML Students</strong>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Learning Hebbian plasticity, rank-1 outer-product updates, and subspace interference in high dimensions.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)] space-y-1">
                      <strong className="text-[var(--text-primary)] text-xs block">Scientific Evaluators</strong>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Looking for verified empirical evidence, reproducible calculations, and rigorous epistemic separation.
                      </p>
                    </div>
                  </div>

                  <h3 className="font-sans font-semibold text-base text-[var(--text-primary)]">3. Core Pedagogical Journey (7 Stages)</h3>
                  <ol className="list-decimal pl-5 space-y-2 text-[var(--text-secondary)]">
                    <li><strong className="text-[var(--text-primary)]">Stage 01: Memory</strong> — The fundamental trade-off: Unbounded KV-cache token tapes vs. fixed-size continuous recurrent states.</li>
                    <li><strong className="text-[var(--text-primary)]">Stage 02: Break</strong> — Stress-testing state capacity. Ingesting sequential facts and distractor perturbations to witness geometric coordinate collisions.</li>
                    <li><strong className="text-[var(--text-primary)]">Stage 03: Trace</strong> — State coordinate difference inspection (<InlineMath math="\Delta M" />) and Counterfactual Memory Surgery.</li>
                    <li><strong className="text-[var(--text-primary)]">Stage 04: Measure</strong> — Quantitative capacity scaling bounds (<InlineMath math="C \approx \mathcal{O}(d)" />) across dimensions (D=4 to 64).</li>
                    <li><strong className="text-[var(--text-primary)]">Stage 05: BDH</strong> — Moving from a single dense matrix to Pathway's Dragon Hatchling (BDH) architecture and scale-free synaptic networks.</li>
                    <li><strong className="text-[var(--text-primary)]">Stage 06: Reason</strong> — Continuous latent thinking loops (BDH-CQ) before token generation with interactive particle relaxation.</li>
                    <li><strong className="text-[var(--text-primary)]">Stage 07: Prove</strong> — 60-Second Fast Verification interactive assessment and verifiable Certificate of Completion.</li>
                  </ol>
                </div>
              </article>
            )}

            {/* Section 2: Architecture */}
            {activeSection === 'architecture' && (
              <article className="space-y-6">
                <div className="border-b border-[var(--border)] pb-4">
                  <span className="text-xs font-mono font-medium text-[var(--color-accent-ink)]">
                    docs/ARCHITECTURE.md
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[var(--text-primary)] tracking-tight mt-1.5">
                    System Architecture & Technical Specifications
                  </h1>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Linear algebraic simulation engine, fast-weights, and deterministic hashing.
                  </p>
                </div>

                <div className="space-y-4 text-sm text-[var(--text-secondary)] leading-relaxed">
                  <h3 className="font-sans font-semibold text-base text-[var(--text-primary)]">1. Client-Side Computational Engine</h3>
                  <p>
                    All mathematical operations run entirely in-browser using pure vector arithmetic in <code className="px-1.5 py-0.5 rounded bg-[var(--surface-soft)] font-mono text-xs text-[var(--text-primary)]">/src/models/associativeMemory.ts</code>. No server latency or remote execution delays exist.
                  </p>

                  <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-3 font-mono text-xs">
                    <div className="text-[var(--color-accent-ink)] font-semibold">Fast-Weight Recurrence Update</div>
                    <BlockMath math="M_{t+1} = \lambda M_t + \eta \, k_t v_t^\top" />
                    <p className="font-sans text-xs text-[var(--text-secondary)]">
                      Where <InlineMath math="\lambda \in [0, 1]" /> represents retention decay and <InlineMath math="\eta > 0" /> represents write strength.
                    </p>
                  </div>

                  <h3 className="font-sans font-semibold text-base text-[var(--text-primary)]">2. Associative Readout Formulation</h3>
                  <p>
                    When querying with probe vector <InlineMath math="q" />, the retrieved representation is computed via matrix-vector multiplication:
                  </p>
                  <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-2 font-mono text-xs overflow-x-auto">
                    <BlockMath math="\hat{v} = M_t q = \underbrace{\lambda^{t-\tau} \eta (k_\tau^\top q) v_\tau}_{\text{Signal}} + \underbrace{\sum_{i \neq \tau} \lambda^{t-i} \eta (k_i^\top q) v_i}_{\text{Crosstalk Noise}}" />
                  </div>

                  <h3 className="font-sans font-semibold text-base text-[var(--text-primary)]">3. Component Architecture</h3>
                  <p>
                    Global state is coordinated via <code className="px-1.5 py-0.5 rounded bg-[var(--surface-soft)] font-mono text-xs text-[var(--text-primary)]">ExperimentContext</code> and <code className="px-1.5 py-0.5 rounded bg-[var(--surface-soft)] font-mono text-xs text-[var(--text-primary)]">usePersistentNavigation</code>. Milestone progress is tracked through <code className="px-1.5 py-0.5 rounded bg-[var(--surface-soft)] font-mono text-xs text-[var(--text-primary)]">progressTracker.ts</code> with events dispatching on completion.
                  </p>
                </div>
              </article>
            )}

            {/* Section 3: Design */}
            {activeSection === 'design' && (
              <article className="space-y-6">
                <div className="border-b border-[var(--border)] pb-4">
                  <span className="text-xs font-mono font-medium text-[var(--color-accent-ink)]">
                    docs/DESIGN.md
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[var(--text-primary)] tracking-tight mt-1.5">
                    Design System Specification
                  </h1>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Editorial restraint, semantic color tokens, and clean mathematical typography.
                  </p>
                </div>

                <div className="space-y-4 text-sm text-[var(--text-secondary)] leading-relaxed">
                  <h3 className="font-sans font-semibold text-base text-[var(--text-primary)]">1. Core Color System</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)]">
                      <div className="w-full h-8 rounded bg-[var(--page-bg)] border border-[var(--border)] mb-2" />
                      <div className="font-mono text-xs font-semibold text-[var(--text-primary)]">Page Canvas</div>
                      <div className="font-mono text-[11px] text-[var(--text-muted)]">var(--page-bg)</div>
                    </div>
                    <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)]">
                      <div className="w-full h-8 rounded bg-[var(--color-accent)] mb-2" />
                      <div className="font-mono text-xs font-semibold text-[var(--text-primary)]">Acid Lime Signal</div>
                      <div className="font-mono text-[11px] text-[var(--text-muted)]">var(--color-accent)</div>
                    </div>
                    <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)]">
                      <div className="w-full h-8 rounded bg-[var(--color-success)] mb-2" />
                      <div className="font-mono text-xs font-semibold text-[var(--text-primary)]">Mint Empirical Green</div>
                      <div className="font-mono text-[11px] text-[var(--text-muted)]">var(--color-success)</div>
                    </div>
                    <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)]">
                      <div className="w-full h-8 rounded bg-[var(--color-danger)] mb-2" />
                      <div className="font-mono text-xs font-semibold text-[var(--text-primary)]">Interference Rose</div>
                      <div className="font-mono text-[11px] text-[var(--text-muted)]">var(--color-danger)</div>
                    </div>
                  </div>

                  <h3 className="font-sans font-semibold text-base text-[var(--text-primary)]">2. Typography Hierarchy</h3>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong className="text-[var(--text-primary)]">Display Headlines (h1, h2):</strong> Space Grotesk (weights 500–700) for geometric architectural presence.</li>
                    <li><strong className="text-[var(--text-primary)]">Interface &amp; Body:</strong> DM Sans for dense, legible controls, questions, and paragraphs.</li>
                    <li><strong className="text-[var(--text-primary)]">Formulas &amp; Coordinates:</strong> DM Mono (tabular numerals) and KaTeX for technical precision.</li>
                  </ul>
                </div>
              </article>
            )}

            {/* Section 4: Rules */}
            {activeSection === 'rules' && (
              <article className="space-y-6">
                <div className="border-b border-[var(--border)] pb-4">
                  <span className="text-xs font-mono font-medium text-[var(--color-accent-ink)]">
                    docs/RULES.md
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[var(--text-primary)] tracking-tight mt-1.5">
                    Scientific Honesty & Development Rules
                  </h1>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Epistemic humility, explicit toy model boundaries, and zero fake data.
                  </p>
                </div>

                <div className="space-y-4 text-sm text-[var(--text-secondary)] leading-relaxed">
                  <div className="p-4 rounded-xl bg-[var(--color-warning-soft)] border border-[var(--color-warning-border)] text-[var(--color-warning)] space-y-1.5">
                    <strong className="block font-sans text-sm">Rule 1: Explicit Toy Model Boundaries</strong>
                    <p className="text-xs sm:text-sm leading-relaxed">
                      Always declare that our single-matrix memory model is a pedagogical vehicle for linear algebraic principles (superposition, crosstalk, decay), NOT an exact replica of Pathway's commercial Dragon Hatchling (BDH) architecture.
                    </p>
                  </div>

                  <h3 className="font-sans font-semibold text-base text-[var(--text-primary)]">Rule 2: No Fabricated Engine Output</h3>
                  <p>
                    All cosine margins, coordinate shifts, and retrieval accuracies must evaluate through actual vector arithmetic in <code className="px-1.5 py-0.5 rounded bg-[var(--surface-soft)] font-mono text-xs text-[var(--text-primary)]">createAssociativeMemory</code>. No mock labels or static fakes are permitted.
                  </p>

                  <h3 className="font-sans font-semibold text-base text-[var(--text-primary)]">Rule 3: Client Privacy &amp; Local Execution</h3>
                  <p>
                    Zero private API keys or personal identifiers exist in client bundles. All progression data is strictly stored in client <code className="px-1.5 py-0.5 rounded bg-[var(--surface-soft)] font-mono text-xs text-[var(--text-primary)]">localStorage</code>.
                  </p>
                </div>
              </article>
            )}

            {/* Section 5: Tasks */}
            {activeSection === 'tasks' && (
              <article className="space-y-6">
                <div className="border-b border-[var(--border)] pb-4">
                  <span className="text-xs font-mono font-medium text-[var(--color-accent-ink)]">
                    docs/TASKS.md
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[var(--text-primary)] tracking-tight mt-1.5">
                    Tasks & Verification Log
                  </h1>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Implementation audit of milestones, interactive assessment, and launch checklist.
                  </p>
                </div>

                <div className="space-y-3 text-sm text-[var(--text-secondary)]">
                  {[
                    {
                      title: '60-Second Fast Verification Assessment',
                      desc: 'Stateful 5-stage real-time interactive assessment with live associative memory queries, 60s hard stop, and persistence.',
                    },
                    {
                      title: 'Interactive Particle Physics & BDH-CQ',
                      desc: 'Canvas particle relaxation simulation demonstrating continuous latent thinking loops before token emission.',
                    },
                    {
                      title: 'Certificate of Completion & Confetti',
                      desc: 'Automated confetti explosion on capstone unlock and vector PDF export via jsPDF.',
                    },
                    {
                      title: 'Launch Readiness & Legal Suite',
                      desc: 'Privacy policy, Terms of Use, cookie consent banner, social OG card, and Schema.org metadata.',
                    },
                  ].map((task) => (
                    <div key={task.title} className="p-3.5 rounded-lg bg-[var(--color-success-soft)] border border-[var(--color-success-border)] flex items-start gap-3">
                      <Check className="w-4 h-4 text-[var(--color-success)] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[var(--color-success)] block text-xs sm:text-sm">{task.title}</strong>
                        <span className="text-[var(--text-secondary)] block text-xs mt-0.5">
                          {task.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            )}

            {/* Section 6: Memory */}
            {activeSection === 'memory' && (
              <article className="space-y-6">
                <div className="border-b border-[var(--border)] pb-4">
                  <span className="text-xs font-mono font-medium text-[var(--color-accent-ink)]">
                    docs/MEMORY.md
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[var(--text-primary)] tracking-tight mt-1.5">
                    Project Memory: Mechanistic Deep Dive
                  </h1>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Mathematical derivation of recurrent memory, crosstalk bounds, and BDH synapses.
                  </p>
                </div>

                <div className="space-y-4 text-sm text-[var(--text-secondary)] leading-relaxed">
                  <h3 className="font-sans font-semibold text-base text-[var(--text-primary)]">1. The Capacity Threshold</h3>
                  <p>
                    In finite dimensions <InlineMath math="d" />, random unit vectors have expected dot product magnitude:
                  </p>
                  <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)]">
                    <BlockMath math="\mathbb{E}[|u^\top v|] \approx \sqrt{\frac{2}{\pi d}}" />
                  </div>
                  <p>
                    As the sequence length <InlineMath math="T" /> grows beyond capacity <InlineMath math="C \approx \mathcal{O}(d)" />, coordinate interference builds up until the signal margin drops below the decision boundary.
                  </p>

                  <h3 className="font-sans font-semibold text-base text-[var(--text-primary)]">2. Pathway's Dragon Hatchling (BDH) Architecture</h3>
                  <p>
                    BDH mitigates catastrophic interference through biological Hebbian plasticity and scale-free connectivity:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong className="text-[var(--text-primary)]">Plastic Synaptic Weights:</strong> State is distributed across connections <InlineMath math="\sigma(i, j)" /> rather than a single dense block.</li>
                    <li><strong className="text-[var(--text-primary)]">Sparse Activation Cliques:</strong> New memories only modify active subgraphs, protecting earlier information from destructive overwriting.</li>
                    <li><strong className="text-[var(--text-primary)]">Latent Relaxation (BDH-CQ):</strong> Continuous iterative relaxation before token generation replaces single forward-pass limitations.</li>
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

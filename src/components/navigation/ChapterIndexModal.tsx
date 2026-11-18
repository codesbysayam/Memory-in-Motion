import React, { useEffect } from 'react';
import {
  X,
  ArrowRight,
  Sparkles,
  BookOpen,
  FlaskConical,
  Cpu,
  FileCheck2,
} from 'lucide-react';
import { FormattedMathText } from '../ui/MathView';

export interface ChapterInfo {
  id: string;
  num: string;
  title: string;
  category: 'Foundation' | 'Laboratory' | 'BDH' | 'Evaluation';
  shortDesc: string;
  keyFormulaOrConcept: string;
  sectionElementId: string;
}

export const CHAPTER_DIRECTORY: ChapterInfo[] = [
  {
    id: 'chapter-01',
    num: '01',
    title: 'Where Does Memory Live?',
    category: 'Foundation',
    shortDesc: 'The three fundamental memory paradigms: KV-caches, static weights, and continuous recurrent states.',
    keyFormulaOrConcept: 'Ephemeral KV vs Parametric W vs Recurrent State S',
    sectionElementId: 'section-01',
  },
  {
    id: 'chapter-02',
    num: '02',
    title: 'The Memory Problem: Growing Context',
    category: 'Foundation',
    shortDesc: 'Why Transformers hit memory limits: linear context growth and quadratic KV attention buffers.',
    keyFormulaOrConcept: 'RAM cost = 2 · b · L · h · s · bytes per token',
    sectionElementId: 'section-02',
  },
  {
    id: 'chapter-03',
    num: '03',
    title: 'Fixed-Size Recurrent Memory',
    category: 'Laboratory',
    shortDesc: 'Interactive fast-weight matrix: ingesting key-value facts through rank-1 outer product updates.',
    keyFormulaOrConcept: 'M_(t+1) = λ M_t + η k_t v_t^T',
    sectionElementId: 'section-03',
  },
  {
    id: 'chapter-04',
    num: '04',
    title: 'Watch Memory Update: State Difference',
    category: 'Laboratory',
    shortDesc: 'Empirical state coordinate analytics: inspecting coordinate deltas, drift, and superposition.',
    keyFormulaOrConcept: 'ΔM_t = M_t - M_(t-1) · Readout v̂ = q^T M',
    sectionElementId: 'section-measure',
  },
  {
    id: 'chapter-05',
    num: '05',
    title: 'Break the Memory: Induction of Forgetting',
    category: 'Laboratory',
    shortDesc: 'Hypothesis testing: adjusting capacity, retention, and distractors to systematically induce forgetting.',
    keyFormulaOrConcept: 'Challenge: Induce Japan → Paris retrieval failure',
    sectionElementId: 'section-05',
  },
  {
    id: 'chapter-06',
    num: '06',
    title: 'Trace the Failure: Step-by-Step Replay',
    category: 'Laboratory',
    shortDesc: 'Exact deterministic replay of the state matrix: pinpointing where cross-talk destroys the target trace.',
    keyFormulaOrConcept: 'Deterministic operation trace: WRITE → WRITE → READ',
    sectionElementId: 'section-04',
  },
  {
    id: 'chapter-07',
    num: '07',
    title: 'Measure Memory Capacity: Systematic Sweeps',
    category: 'Laboratory',
    shortDesc: 'Empirical benchmark curves across dimensions D ∈ {4, 8, 16, 32} and sequence lengths up to 32 facts.',
    keyFormulaOrConcept: 'Empirical phase boundaries: Accuracy & retrieval score curves',
    sectionElementId: 'section-04',
  },
  {
    id: 'chapter-08',
    num: '08',
    title: 'Memory vs Computation: Trade-Offs & Decay',
    category: 'Laboratory',
    shortDesc: '2D Interference Phase Maps, exponential retention decay, and side-by-side memory comparisons.',
    keyFormulaOrConcept: 'Retention decay: M_t = λ^t M_0 + Σ λ^(t-i) η k_i v_i^T',
    sectionElementId: 'section-06',
  },
  {
    id: 'chapter-09',
    num: '09',
    title: 'Meet BDH: Beyond Monolithic States',
    category: 'BDH',
    shortDesc: 'Pathway’s Baby Dragon Hatchling: replacing dense single-vector state with a decentralized neuronal graph.',
    keyFormulaOrConcept: 'Local Hebbian plasticity without global backpropagation',
    sectionElementId: 'section-07',
  },
  {
    id: 'chapter-10',
    num: '10',
    title: 'BDH Microscope: Synaptic Plasticity',
    category: 'BDH',
    shortDesc: 'Interactive 28-neuron network microscope: fast activations (x, y) and plastic synaptic weights (σ_ij).',
    keyFormulaOrConcept: 'σ_(ij, t+1) = λ σ_(ij, t) + η x_i y_j',
    sectionElementId: 'section-08',
  },
  {
    id: 'chapter-11',
    num: '11',
    title: 'BDH-CQ & Latent Reasoning',
    category: 'BDH',
    shortDesc: 'In-context latent reasoning on ARC-AGI-1 without emitting verbal token chains or growing scratchpads.',
    keyFormulaOrConcept: 'Recurrent latent relaxation: h_(t+1) = f(h_t, x)',
    sectionElementId: 'section-10',
  },
  {
    id: 'chapter-12',
    num: '12',
    title: 'So What? Why Memory Architecture Matters',
    category: 'Evaluation',
    shortDesc: 'Why context windows cannot grow forever and how synaptic memory replaces the linear KV cache.',
    keyFormulaOrConcept: 'Constant O(1) memory bound vs O(N) context inflation',
    sectionElementId: 'section-so-what',
  },
  {
    id: 'chapter-13',
    num: '13',
    title: 'Capstone Challenge & Primary Sources',
    category: 'Evaluation',
    shortDesc: 'The 60-Second Challenge, capstone evaluation, and verified literature citations (Kosowski 2025).',
    keyFormulaOrConcept: 'Final evaluation + Research archive & Model contract',
    sectionElementId: 'final-eval',
  },
  {
    id: 'chapter-14',
    num: '14',
    title: 'You Made It: Certificate of Completion',
    category: 'Evaluation',
    shortDesc: 'Review milestone progress, test foundational understanding, and generate a downloadable PDF certificate.',
    keyFormulaOrConcept: 'Empirical Laboratory Attestation & Provenance Record',
    sectionElementId: 'you-made-it',
  },
];

interface ChapterIndexModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSectionId: string;
  onNavigate: (sectionId: string) => void;
}

export const ChapterIndexModal: React.FC<ChapterIndexModalProps> = ({
  isOpen,
  onClose,
  currentSectionId,
  onNavigate,
}) => {
  const [activeCategoryFilter, setActiveCategoryFilter] = React.useState<string>('All');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredChapters =
    activeCategoryFilter === 'All'
      ? CHAPTER_DIRECTORY
      : CHAPTER_DIRECTORY.filter((c) => c.category === activeCategoryFilter);

  const handleSelectChapter = (ch: ChapterInfo) => {
    onNavigate(ch.sectionElementId);
    onClose();
  };

  const getCategoryBadge = (cat: ChapterInfo['category']) => {
    switch (cat) {
      case 'Foundation':
        return 'text-[var(--color-accent-ink)] bg-[var(--accent-blue)] border-[var(--border)]';
      case 'Laboratory':
        return 'text-[var(--color-success)] bg-[var(--color-success-soft)] border-[var(--color-success-border)]';
      case 'BDH':
        return 'text-[var(--color-warning)] bg-[var(--color-warning-soft)] border-[var(--color-warning-border)]';
      case 'Evaluation':
        return 'text-[var(--color-success)] bg-[var(--color-success-soft)] border-[var(--color-success-border)]';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="index-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/45 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[85vh] flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--page-bg)] shadow-2xl overflow-hidden text-[var(--text-primary)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header */}
        <div className="px-6 py-5 border-b border-[var(--border)] bg-[var(--surface-soft)] flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
              <span>Table of contents</span>
              <span>·</span>
              <span>{CHAPTER_DIRECTORY.length} scientific chapters</span>
            </div>

            <h2
              id="index-modal-title"
              className="text-2xl sm:text-3xl font-serif font-normal text-[var(--text-primary)] tracking-tight"
            >
              Investigation Roadmap
            </h2>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans">
              Follow the investigation from first principles, or jump straight into an experiment.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--page-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer shrink-0"
            aria-label="Close chapter index"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Category Filters */}
        <div className="px-6 py-3 border-b border-[var(--border)] bg-[var(--surface)] flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[var(--surface-soft)] border border-[var(--border)] text-xs font-mono">
            {['All', 'Foundation', 'Laboratory', 'BDH', 'Evaluation'].map((cat) => {
              const isActive = activeCategoryFilter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[var(--surface)] text-[var(--text-primary)] font-semibold border border-[var(--border)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {cat === 'All' ? `All (${CHAPTER_DIRECTORY.length})` : cat}
                </button>
              );
            })}
          </div>

          <span className="text-[11px] font-mono text-[var(--text-muted)] hidden sm:inline-block">
            Press <kbd className="px-1.5 py-0.5 bg-[var(--surface-soft)] border border-[var(--border)] rounded text-[var(--text-primary)]">ESC</kbd> to close
          </span>
        </div>

        {/* 3. Scrollable Chapter Grid */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-3.5 custom-scrollbar bg-[var(--page-bg)]">
          {filteredChapters.map((ch) => {
            const isCurrent = currentSectionId === ch.sectionElementId;

            return (
              <div
                key={ch.id}
                onClick={() => handleSelectChapter(ch)}
                className={`group p-4 sm:p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isCurrent
                    ? 'border-[var(--color-accent)] bg-[var(--surface)] ring-1 ring-[var(--color-accent)]/30'
                    : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--color-border-strong)]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-semibold text-[var(--color-accent-ink)]">
                        {ch.num}
                      </span>
                      <span
                        className={`text-[11px] font-mono px-2 py-0.5 rounded border font-medium ${getCategoryBadge(
                          ch.category
                        )}`}
                      >
                        {ch.category}
                      </span>
                    </div>

                    {isCurrent && (
                      <span className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--color-accent-ink)] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                        Active
                      </span>
                    )}
                  </div>

                  <h3 className="font-sans text-base font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-accent-ink)] transition-colors leading-snug">
                    {ch.title}
                  </h3>

                  <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed line-clamp-2">
                    {ch.shortDesc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs font-mono">
                  <span className="truncate max-w-[72%] text-[11px] text-[var(--text-muted)]">
                    <FormattedMathText text={ch.keyFormulaOrConcept} />
                  </span>
                  <span className="flex items-center gap-1 text-xs font-sans text-[var(--color-accent-ink)] group-hover:translate-x-0.5 transition-transform shrink-0 font-medium">
                    Explore <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. Footer */}
        <div className="px-6 py-3.5 border-t border-[var(--border)] bg-[var(--surface-soft)] flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[var(--text-muted)] shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
            <span>Educational computation · Sources and methodology</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--page-bg)] text-[var(--text-primary)] border border-[var(--border)] transition-colors cursor-pointer font-sans text-xs font-medium"
          >
            Close Index
          </button>
        </div>
      </div>
    </div>
  );
};

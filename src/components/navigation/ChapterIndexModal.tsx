import React, { useEffect } from 'react';
import {
  X,
  BookOpen,
  FlaskConical,
  Cpu,
  FileText,
  ArrowRight,
  Sparkles,
  Layers,
  Activity,
  AlertTriangle,
  Award,
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
    keyFormulaOrConcept: 'Memory taxonomy: Ephemeral KV vs Parametric W vs Recurrent State S',
    sectionElementId: 'section-01',
  },
  {
    id: 'chapter-02',
    num: '02',
    title: 'The Memory Problem: Growing Context',
    category: 'Foundation',
    shortDesc: 'Why Transformers hit memory limits: O(N) linear context growth and quadratic KV attention buffers.',
    keyFormulaOrConcept: 'RAM cost = 2 · b · L · h · s · bytes per token',
    sectionElementId: 'section-02',
  },
  {
    id: 'chapter-03',
    num: '03',
    title: 'Fixed-Size Recurrent Memory',
    category: 'Laboratory',
    shortDesc: 'Interactive fast-weight matrix: Ingesting key-value facts through rank-1 outer product updates.',
    keyFormulaOrConcept: 'M_(t+1) = λ M_t + η k_t v_t^T',
    sectionElementId: 'section-03',
  },
  {
    id: 'chapter-04',
    num: '04',
    title: 'Watch Memory Update: State Difference',
    category: 'Laboratory',
    shortDesc: 'Real-time state coordinate inspector: Inspecting deltas, coordinate drift, and superposition.',
    keyFormulaOrConcept: 'ΔM_t = M_t - M_(t-1) · Vector Readout v̂ = q^T M',
    sectionElementId: 'section-04',
  },
  {
    id: 'chapter-05',
    num: '05',
    title: 'Break the Memory: Hero Experience',
    category: 'Laboratory',
    shortDesc: 'Hypothesis testing: Adjusting capacity, retention, and distractors to systematically induce forgetting.',
    keyFormulaOrConcept: 'Challenge: Induce Japan → Paris retrieval failure',
    sectionElementId: 'section-05',
  },
  {
    id: 'chapter-06',
    num: '06',
    title: 'Trace the Failure: Step-by-Step Replay',
    category: 'Laboratory',
    shortDesc: 'Exact deterministic replay of the state matrix: Pinpointing the moment cross-talk destroys the target trace.',
    keyFormulaOrConcept: 'Deterministic operation trace: WRITE → WRITE → READ',
    sectionElementId: 'section-05',
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
    shortDesc: '2D Interference Phase Maps, exponential retention decay, and side-by-side A/B memory comparisons.',
    keyFormulaOrConcept: 'Retention decay: M_t = λ^t M_0 + Σ λ^(t-i) η k_i v_i^T',
    sectionElementId: 'section-06',
  },
  {
    id: 'chapter-09',
    num: '09',
    title: 'Meet BDH: Beyond Monolithic States',
    category: 'BDH',
    shortDesc: 'Pathway’s Baby Dragon Hatchling: replacing dense single-vector state with a decentralized neuronal graph.',
    keyFormulaOrConcept: 'Local Hebbian updates without global backpropagation',
    sectionElementId: 'section-07',
  },
  {
    id: 'chapter-10',
    num: '10',
    title: 'BDH Microscope: Synaptic Plasticity',
    category: 'BDH',
    shortDesc: 'Interactive 28-neuron network microscope: Fast activations (x, y) and plastic synaptic weights (σ_ij).',
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
    shortDesc: 'The 60-Second Challenge, 3-round capstone evaluation, and verified literature citations (Kosowski 2025).',
    keyFormulaOrConcept: 'Final evaluation + Research archive & Model contract',
    sectionElementId: 'final-eval',
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

  const getCategoryColor = (cat: ChapterInfo['category']) => {
    switch (cat) {
      case 'Foundation':
        return 'text-violet-400 bg-violet-950/60 border-violet-800/60';
      case 'Laboratory':
        return 'text-cyan-400 bg-cyan-950/60 border-cyan-800/60';
      case 'BDH':
        return 'text-purple-400 bg-purple-950/60 border-purple-800/60';
      case 'Evaluation':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="index-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl border border-[#252A35] bg-[#0A0D14] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#1E2536] bg-[#0E121C] flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#22D3EE] bg-cyan-950/60 border border-[#22D3EE]/30 px-2 py-0.5 rounded font-bold">
                TABLE OF CONTENTS
              </span>
              <span className="text-xs font-mono text-[#8F96A3]">12 SCIENTIFIC CHAPTERS</span>
            </div>
            <h2 id="index-modal-title" className="text-xl sm:text-2xl font-bold font-mono text-white tracking-wide">
              Investigation Roadmap & Chapter Index
            </h2>
            <p className="text-xs text-[#8F96A3]">
              Select any chapter to navigate directly to its interactive models, experiments, and mathematical proofs.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#151922] border border-[#252A35] text-[#8F96A3] hover:text-white hover:border-slate-500 transition-colors"
            aria-label="Close chapter index"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills Bar */}
        <div className="px-5 py-3 border-b border-[#1A2130] bg-[#080B12] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-mono">
            {['All', 'Foundation', 'Laboratory', 'BDH', 'Evaluation'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategoryFilter(cat)}
                className={`px-3 py-1 rounded-lg border transition-all ${
                  activeCategoryFilter === cat
                    ? 'border-[#22D3EE] bg-cyan-950/60 text-[#22D3EE] font-bold'
                    : 'border-[#252A35] bg-[#121622] text-[#8F96A3] hover:text-white hover:bg-[#182030]'
                }`}
              >
                {cat === 'All' ? 'All (12)' : cat}
              </button>
            ))}
          </div>

          <span className="text-[11px] font-mono text-[#8F96A3] hidden sm:inline-block">
            Press <kbd className="px-1.5 py-0.5 bg-[#151922] border border-[#252A35] rounded text-white">ESC</kbd> to close
          </span>
        </div>

        {/* Chapter Grid */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-3.5 custom-scrollbar">
          {filteredChapters.map((ch) => {
            const isCurrent = currentSectionId === ch.sectionElementId;

            return (
              <div
                key={ch.id}
                onClick={() => handleSelectChapter(ch)}
                className={`group p-4 rounded-xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                  isCurrent
                    ? 'border-[#22D3EE] bg-[#0F1726] ring-1 ring-[#22D3EE]/60 shadow-lg shadow-cyan-950/40'
                    : 'border-[#1E2536] bg-[#0D121D] hover:border-[#35405A] hover:bg-[#121826]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold font-mono text-white bg-[#171E2E] border border-[#2B354D] px-2 py-0.5 rounded">
                        {ch.num}
                      </span>
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-semibold ${getCategoryColor(ch.category)}`}>
                        {ch.category}
                      </span>
                    </div>

                    {isCurrent && (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-[#22D3EE] bg-cyan-950/70 border border-cyan-700/50 px-2 py-0.5 rounded font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE] animate-pulse" />
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <h3 className="font-mono text-sm font-bold text-white group-hover:text-[#22D3EE] transition-colors leading-snug">
                    {ch.title}
                  </h3>

                  <p className="text-xs text-[#8F96A3] mt-1.5 leading-relaxed font-sans line-clamp-2">
                    {ch.shortDesc}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#1C2436] flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="truncate max-w-[80%] text-[10px] text-zinc-400">
                    <FormattedMathText text={ch.keyFormulaOrConcept} />
                  </span>
                  <span className="flex items-center gap-1 text-[#22D3EE] font-semibold group-hover:translate-x-0.5 transition-transform shrink-0">
                    Jump <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1E2536] bg-[#090C14] flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#8F96A3]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Deterministic Educational Computation · Verified Against Kosowski et al. (2025)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#151922] hover:bg-[#1E2536] text-white border border-[#252A35] transition-colors"
          >
            Close Index
          </button>
        </div>
      </div>
    </div>
  );
};

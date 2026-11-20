import React, { useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  Play,
  RotateCcw,
  X,
  CheckCircle2,
} from 'lucide-react';
import { InterferenceConfig } from '../models/interferenceLabEngine';
import { InlineMath } from './ui/MathView';

export type TutorialKnobKey =
  | 'dimension'
  | 'sequenceLength'
  | 'retention'
  | 'interference'
  | 'seedActions';

export interface TutorialStepSpec {
  id: TutorialKnobKey;
  stepNum: string;
  knobName: string;
  headline: string;
  explanation: React.ReactNode;
  mathNote: string;
  exampleLabel: string;
  exampleConfig: Partial<InterferenceConfig>;
  getReadout: (cfg: InterferenceConfig) => string;
}

export const INTERFERENCE_TUTORIAL_STEPS: TutorialStepSpec[] = [
  {
    id: 'dimension',
    stepNum: '01',
    knobName: 'State Dimension (D)',
    headline: 'Allocate the size of the bounded Memory Field',
    explanation: (
      <span>
        Controls how many rows and columns the matrix <InlineMath math="M \in \mathbb{R}^{D \times D}" /> contains. Smaller dimensions (<InlineMath math="D=4" />) force vectors to share axes quickly; larger dimensions (<InlineMath math="D=32" />) offer more quasi-orthogonal capacity.
      </span>
    ),
    mathNote: 'Theoretical capacity scales O(D) under linear superposition.',
    exampleLabel: 'Try D = 4 bottleneck',
    exampleConfig: { dimension: 4, sequenceLength: 6, retention: 0.9, interference: 0.1 },
    getReadout: (cfg) => `D = ${cfg.dimension} (${cfg.dimension}×${cfg.dimension} coordinates)`,
  },
  {
    id: 'sequenceLength',
    stepNum: '02',
    knobName: 'Sequence Length (L)',
    headline: 'Pack more country–capital pairs into the same matrix',
    explanation: (
      <span>
        Sets how many sequential facts are written into <InlineMath math="M" /> before probing the target key. Pushing <InlineMath math="L" /> past <InlineMath math="D" /> compresses too many outer products onto the same grid and flips the live curve from clean to collision.
      </span>
    ),
    mathNote: 'Total writes = L pairs before target recall test.',
    exampleLabel: 'Try L = 12 overload',
    exampleConfig: { dimension: 8, sequenceLength: 12, retention: 0.85, interference: 0.2 },
    getReadout: (cfg) => `L = ${cfg.sequenceLength} facts packed`,
  },
  {
    id: 'retention',
    stepNum: '03',
    knobName: 'Retention (λ)',
    headline: 'Decide how fast older memories fade per step',
    explanation: (
      <span>
        Applies exponential decay <InlineMath math="\lambda" /> before every incoming write: <InlineMath math="M_t = \lambda M_{t-1} + \eta k_t v_t^\top" />. Lower retention clears room for recent facts at the expense of erasing earlier ones.
      </span>
    ),
    mathNote: 'λ = 100% keeps full magnitude; λ < 70% induces rapid recency forgetting.',
    exampleLabel: 'Try λ = 55% fast decay',
    exampleConfig: { dimension: 12, sequenceLength: 7, retention: 0.55, interference: 0.05 },
    getReadout: (cfg) => `λ = ${Math.round(cfg.retention * 100)}% per step`,
  },
  {
    id: 'interference',
    stepNum: '04',
    knobName: 'Interference Perturbation (σ)',
    headline: 'Inject geometric crosstalk between similar keys',
    explanation: (
      <span>
        Simulates non-orthogonal vector overlap during storage and readout. Even when <InlineMath math="L < D" />, rising perturbation <InlineMath math="\sigma" /> narrows the top-1 decision margin until a competing city wins ArgMax.
      </span>
    ),
    mathNote: 'Higher σ raises crosstalk amplitude relative to signal.',
    exampleLabel: 'Try σ = 45% crosstalk',
    exampleConfig: { dimension: 8, sequenceLength: 6, retention: 0.9, interference: 0.45 },
    getReadout: (cfg) => `σ = ${Math.round(cfg.interference * 100)}% perturbation`,
  },
  {
    id: 'seedActions',
    stepNum: '05',
    knobName: 'Deterministic Seed, Re-run & Reset',
    headline: 'Reproduce, log, or rewind any experimental run',
    explanation: (
      <span>
        Every parameter set produces a deterministic Experiment ID. Increment the seed to test fresh orthogonal directions, press <kbd className="px-1 py-0.5 rounded border border-[var(--mm-rule)] bg-[var(--page-bg)] font-mono text-[10px]">↵</kbd> to log a trial into the notebook, or <kbd className="px-1 py-0.5 rounded border border-[var(--mm-rule)] bg-[var(--page-bg)] font-mono text-[10px]">R</kbd> to restore baseline.
      </span>
    ),
    mathNote: 'Reproducible PRNG seed guarantees exact numerical replay.',
    exampleLabel: 'Restore baseline (D=8, L=7)',
    exampleConfig: { dimension: 8, sequenceLength: 7, retention: 0.85, interference: 0.2, seed: 42 },
    getReadout: (cfg) => `Seed = ${cfg.seed}`,
  },
];

interface InterferenceLabTutorialProps {
  isOpen: boolean;
  currentStepIndex: number;
  config: InterferenceConfig;
  onStepChange: (index: number) => void;
  onApplyExample: (patch: Partial<InterferenceConfig>, stepSpec: TutorialStepSpec) => void;
  onClose: () => void;
  onComplete: () => void;
}

export const InterferenceLabTutorial: React.FC<InterferenceLabTutorialProps> = ({
  isOpen,
  currentStepIndex,
  config,
  onStepChange,
  onApplyExample,
  onClose,
  onComplete,
}) => {
  const step = INTERFERENCE_TUTORIAL_STEPS[currentStepIndex] || INTERFERENCE_TUTORIAL_STEPS[0];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === INTERFERENCE_TUTORIAL_STEPS.length - 1;

  const prevStepRef = React.useRef<number>(currentStepIndex);

  // Scroll the highlighted control knob gently into view only when the user steps through the guide
  useEffect(() => {
    if (!isOpen) {
      prevStepRef.current = currentStepIndex;
      return;
    }
    if (prevStepRef.current !== currentStepIndex) {
      prevStepRef.current = currentStepIndex;
      const target = document.querySelector(`[data-tutorial-knob="${step.id}"]`);
      if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [isOpen, currentStepIndex, step.id]);

  if (!isOpen) return null;

  return (
    <aside
      aria-label="Interference Lab Control Knob Walkthrough"
      className="border-y border-[var(--mm-signal)]/40 bg-[var(--mm-paper-bright)] px-5 sm:px-6 py-5 space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
          <Compass className="w-4 h-4 text-[var(--mm-signal)] shrink-0" />
          <span className="font-semibold text-[var(--mm-signal)]">
            CONTROL KNOB WALKTHROUGH · STEP {step.stepNum} / 05
          </span>
          <span className="text-[var(--mm-rule-strong)]">·</span>
          <span className="text-[var(--text-secondary)]">
            Active knob: <strong className="text-[var(--text-primary)]">{step.knobName}</strong>
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1 text-xs font-sans text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer min-h-[32px]"
          aria-label="Skip walkthrough"
        >
          <span>Skip guide</span>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Step progress segmented bar */}
      <div className="grid grid-cols-5 gap-1.5" role="tablist" aria-label="Walkthrough steps">
        {INTERFERENCE_TUTORIAL_STEPS.map((s, idx) => {
          const active = idx === currentStepIndex;
          const visited = idx < currentStepIndex;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onStepChange(idx)}
              className={`text-left py-1.5 px-2 border-t-2 transition-colors cursor-pointer text-[11px] font-mono truncate ${
                active
                  ? 'border-[var(--mm-signal)] text-[var(--text-primary)] font-semibold bg-[var(--mm-signal-soft)]/50'
                  : visited
                  ? 'border-[var(--mm-teal)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  : 'border-[var(--mm-rule)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {s.stepNum}. {s.knobName.split(' ')[0]}
            </button>
          );
        })}
      </div>

      {/* Main Step Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center pt-1">
        <div className="lg:col-span-8 space-y-1.5">
          <h3 className="font-serif text-lg sm:text-xl font-normal text-[var(--text-primary)] leading-snug">
            {step.headline}
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
            {step.explanation}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] font-mono text-[var(--text-muted)]">
            <span>{step.mathNote}</span>
            <span className="text-[var(--mm-signal)] font-semibold">
              Current setting: {step.getReadout(config)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="lg:col-span-4 flex flex-wrap lg:justify-end items-center gap-2">
          <button
            type="button"
            onClick={() => onApplyExample(step.exampleConfig, step)}
            className="btn-secondary text-xs min-h-[36px]"
          >
            {step.id === 'seedActions' ? (
              <RotateCcw className="w-3.5 h-3.5 text-[var(--mm-signal)]" />
            ) : (
              <Play className="w-3.5 h-3.5 text-[var(--mm-signal)]" />
            )}
            <span>{step.exampleLabel}</span>
          </button>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={isFirst}
              onClick={() => onStepChange(Math.max(0, currentStepIndex - 1))}
              className="btn-secondary text-xs min-h-[36px] disabled:opacity-40"
              aria-label="Previous tutorial step"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            {isLast ? (
              <button
                type="button"
                onClick={onComplete}
                className="btn-primary text-xs min-h-[36px]"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Finish guide</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onStepChange(Math.min(INTERFERENCE_TUTORIAL_STEPS.length - 1, currentStepIndex + 1))}
                className="btn-primary text-xs min-h-[36px]"
              >
                <span>Next knob</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

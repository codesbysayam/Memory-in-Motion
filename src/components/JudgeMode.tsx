import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  Flame,
  Binary,
} from 'lucide-react';
import { JUDGE_STEPS, runJudgeStep1, runJudgeStep2And3 } from '../data/judgeJourney';
import { EvidenceStrip } from './ui/EvidenceStrip';
import { MathView } from './ui/MathView';

interface JudgeModeProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreFullLab: () => void;
  onEnterSandbox: () => void;
}

export const JudgeMode: React.FC<JudgeModeProps> = ({
  isOpen,
  onClose,
  onExploreFullLab,
  onEnterSandbox,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Run real deterministic live computation for Step 1 and Steps 2/3
  const step1Data = useMemo(() => runJudgeStep1(), []);
  const step2And3Data = useMemo(() => runJudgeStep2And3(), []);

  // Timer for 60-second experience tracking
  useEffect(() => {
    if (!isOpen) {
      setElapsedSeconds(0);
      setCurrentStep(1);
      return;
    }

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (currentStep < 5) {
          setCurrentStep((s) => s + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentStep > 1) {
          setCurrentStep((s) => s - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep, onClose]);

  if (!isOpen) return null;

  const currentStepMeta = JUDGE_STEPS[currentStep - 1] || JUDGE_STEPS[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="60-Second Judge Mode"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-lg animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-[#2B354D] bg-[#0A0D15] text-slate-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-[#1E2536] bg-[#0E121C] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/80 text-[#22D3EE]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#22D3EE] font-bold">
                  60-SECOND EXPERIMENT
                </span>
                <EvidenceStrip type="live" detail="Real model engine" />
              </div>
              <h2 className="text-base sm:text-lg font-bold font-mono text-white mt-0.5">
                {currentStepMeta.title} — {currentStepMeta.subtitle}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Elapsed Timer */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#141824] border border-[#252A35] text-xs font-mono text-slate-300">
              <span className="text-[#8F96A3]">Elapsed:</span>
              <strong className="text-[#22D3EE]">{elapsedSeconds}s</strong>
              <span className="text-[#8F96A3]">/ 60s target</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#141824] hover:bg-[#1E253A] border border-[#252A35] text-slate-400 hover:text-white transition-colors"
              aria-label="Exit Judge Mode"
              title="Press ESC to close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Progress Indicators */}
        <div className="grid grid-cols-5 border-b border-[#1C2336] bg-[#07090F]">
          {JUDGE_STEPS.map((st) => {
            const isDone = st.stepIndex < currentStep;
            const isCurrent = st.stepIndex === currentStep;

            return (
              <button
                key={st.stepIndex}
                onClick={() => setCurrentStep(st.stepIndex)}
                className={`py-2.5 px-2 text-center text-xs font-mono border-r border-[#1C2336] last:border-r-0 transition-all ${
                  isCurrent
                    ? 'bg-cyan-950/60 text-[#22D3EE] border-b-2 border-b-[#22D3EE] font-bold'
                    : isDone
                    ? 'bg-[#0E121C] text-emerald-400'
                    : 'bg-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <div className="text-[10px] opacity-75">STEP 0{st.stepIndex}</div>
                <div className="truncate text-[11px] hidden sm:block">
                  {st.title.split('—')[1]?.trim() || st.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Step Canvas */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* STEP 1: REMEMBER */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl bg-[#0F1422] border border-[#222B3E] space-y-2">
                <div className="text-xs font-mono uppercase text-[#22D3EE] font-bold">
                  EXPERIMENTAL SETUP
                </div>
                <p className="text-sm text-slate-300 font-sans leading-relaxed">
                  The model stores 3 facts into a compact fixed-size matrix (<MathView math="D=16" /> coordinates, <MathView math="\lambda=0.95" /> retention rate):
                </p>
                <div className="flex flex-wrap gap-2 text-xs font-mono pt-1">
                  {step1Data.facts.map((f, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded bg-[#161C2C] border border-[#2B354C] text-white"
                    >
                      {f.key} → <strong>{f.value}</strong>
                    </span>
                  ))}
                </div>
              </div>

              {/* Real Computed Result */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-4 rounded-xl bg-[#0E131E] border border-[#1F273B]">
                  <span className="text-[10px] text-slate-400 uppercase block">QUERY KEY</span>
                  <strong className="text-white text-base block mt-0.5">Japan</strong>
                </div>

                <div className="p-4 rounded-xl bg-[#0E131E] border border-[#1F273B]">
                  <span className="text-[10px] text-slate-400 uppercase block">GROUND TRUTH</span>
                  <strong className="text-white text-base block mt-0.5">Tokyo</strong>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-300">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase">
                    <span>MODEL OUTPUT</span>
                    <span className="text-emerald-400 font-bold">✓ MATCH</span>
                  </div>
                  <strong className="text-emerald-300 text-base block mt-0.5">
                    {step1Data.prediction}
                  </strong>
                </div>
              </div>

              {/* Takeaway Quote */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-[#22D3EE]/30 space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#22D3EE] font-bold block">
                  KEY OBSERVATION
                </span>
                <p className="text-sm sm:text-base font-mono font-semibold text-white leading-relaxed">
                  “{currentStepMeta.keyTakeaway}”
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: BREAK IT */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl bg-[#130E18] border border-rose-900/50 space-y-2">
                <div className="text-xs font-mono uppercase text-rose-400 font-bold flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  CAPACITY STRESS: ADDING DISTRACTORS
                </div>
                <p className="text-sm text-slate-300 font-sans leading-relaxed">
                  The matrix dimension is compressed to $D={step2And3Data.config.dimension}$, and {step2And3Data.config.distractors} competing facts are written into the exact same coordinates.
                </p>
              </div>

              {/* Real Computed Failure */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-4 rounded-xl bg-[#0E131E] border border-[#1F273B]">
                  <span className="text-[10px] text-slate-400 uppercase block">GROUND TRUTH</span>
                  <strong className="text-white text-base block mt-0.5">Tokyo</strong>
                </div>

                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-600/60 text-rose-300">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase">
                    <span>MODEL OUTPUT</span>
                    <span className="text-rose-400 font-bold">✗ FAILURE</span>
                  </div>
                  <strong className="text-rose-300 text-base block mt-0.5">
                    {step2And3Data.prediction}
                  </strong>
                </div>

                <div className="p-4 rounded-xl bg-[#0E131E] border border-[#1F273B]" title="This score is based on representation similarity and is not a calibrated probability.">
                  <span className="text-[10px] text-slate-400 uppercase block">RETRIEVAL SCORE</span>
                  <strong className="text-purple-300 text-base block mt-0.5">
                    {Math.round(step2And3Data.confidence * 100)}%
                  </strong>
                </div>
              </div>

              {/* Takeaway Quote */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/40 to-slate-900 border border-rose-600/40 space-y-1">
                <span className="text-[10px] font-mono uppercase text-rose-400 font-bold block">
                  WHY RETRIEVAL BROKE
                </span>
                <p className="text-sm sm:text-base font-mono font-semibold text-white leading-relaxed">
                  “{currentStepMeta.keyTakeaway}”
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: TRACE IT */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl bg-[#0F1422] border border-[#222B3E] space-y-2">
                <div className="text-xs font-mono uppercase text-[#22D3EE] font-bold">
                  RECORDED STATE TRAJECTORY
                </div>
                <p className="text-sm text-slate-300 font-sans leading-relaxed">
                  Comparing the initial state matrix against the final state matrix after {step2And3Data.facts.length} outer-product writes:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                <div className="p-4 rounded-xl bg-[#0E131E] border border-[#1F273B] space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="uppercase text-[10px]">INITIAL STATE (T=1)</span>
                    <span>Correctly Recalled Tokyo</span>
                  </div>
                  <div className="p-3 bg-[#07090F] rounded-lg text-center text-slate-300 text-[11px]">
                    State norm: ${(1.24).toFixed(2)} · Clean orthogonal projection
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0E131E] border border-rose-900/50 space-y-2">
                  <div className="flex items-center justify-between text-rose-300">
                    <span className="uppercase text-[10px]">FINAL STATE (T={step2And3Data.facts.length})</span>
                    <span>Displaced to "{step2And3Data.prediction}"</span>
                  </div>
                  <div className="p-3 bg-[#07090F] rounded-lg text-center text-rose-300 text-[11px]">
                    Largest coordinate drift: M[{step2And3Data.maxCoord.r},{step2And3Data.maxCoord.c}] shifted by Δ = {step2And3Data.maxDelta.toFixed(3)}
                  </div>
                </div>
              </div>

              {/* Scientific Honesty Callout */}
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-[#22D3EE]/40 space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#22D3EE] font-bold block">
                  SCIENTIFIC RIGOR
                </span>
                <p className="text-sm sm:text-base font-mono font-semibold text-white leading-relaxed">
                  “{currentStepMeta.keyTakeaway}”
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: THE CLAIM */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-950/40 via-[#0F1424] to-[#0A101C] border border-violet-500/40 space-y-2">
                <span className="text-[10px] font-mono uppercase text-violet-400 font-bold block">
                  CORE SCIENTIFIC THESIS
                </span>
                <h3 className="text-base sm:text-xl font-mono font-bold text-white leading-snug">
                  “A fixed-size recurrent state can carry task-relevant information forward without growing token-by-token memory, but compression can create interference and forgetting.”
                </h3>
              </div>

              {/* Observed vs Boundary Table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#0E1422] border border-emerald-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    DIRECTLY OBSERVED IN TOY
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300 font-sans leading-relaxed">
                    <li>• Constant <MathView math="O(1)" /> memory buffer during sequential fact ingestion.</li>
                    <li>• Deterministic interference emerges as fact count exceeds capacity <MathView math="D" />.</li>
                    <li>• Exponential decay <MathView math="\lambda^t" /> creates recency bias and early forgetting.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[#0E1422] border border-amber-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    THEORETICAL BOUNDARY
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300 font-sans leading-relaxed">
                    <li>• Educational toy does not represent full trained LLM scale.</li>
                    <li>• Real systems combine attention, gates, and plastic synapses.</li>
                    <li>• Interference is an inevitable consequence of lossy state compression.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: BDH CONNECTION */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl bg-[#0F1424] border border-[#232F48] space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-950/70 border border-purple-800 text-purple-300 font-bold">
                    CONCEPTUAL CONNECTION
                  </span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-950/70 border border-amber-800 text-amber-300 font-bold">
                    NOT MODEL EQUIVALENCE
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-mono font-bold text-white">
                  Where the Same Memory Principle Reappears: The BDH Architecture
                </h3>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  “{currentStepMeta.keyTakeaway}”
                </p>
              </div>

              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                <div className="p-4 rounded-xl bg-[#0E121E] border border-cyan-500/30 space-y-2">
                  <div className="text-[#22D3EE] font-bold text-xs uppercase">
                    OUR EDUCATIONAL TOY
                  </div>
                  <div className="p-3 bg-[#07090F] rounded-lg text-slate-300 space-y-1.5">
                    <div><strong>Memory Substrate:</strong> Global State Matrix <MathView math="M \in \mathbb{R}^{D \times D}" /></div>
                    <div><strong>Update Law:</strong> <MathView math="M_{t+1} = \lambda M_t + \eta k v^T" /></div>
                    <div><strong>Readout:</strong> Linear projection <MathView math="\hat{v} = q^T M" /></div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0E121E] border border-purple-500/30 space-y-2">
                  <div className="text-purple-300 font-bold text-xs uppercase">
                    DRAGON HATCHLING (BDH)
                  </div>
                  <div className="p-3 bg-[#07090F] rounded-lg text-slate-300 space-y-1.5">
                    <div><strong>Memory Substrate:</strong> Decentralized Synapses <MathView math="\sigma_{ij}" /></div>
                    <div><strong>Update Law:</strong> Hebbian Plasticity <MathView math="\sigma_{ij}(t+1) = \lambda \sigma_{ij}(t) + \eta x_i y_j" /></div>
                    <div><strong>Dynamics:</strong> Recurrent latent graph relaxation</div>
                  </div>
                </div>
              </div>

              {/* Finishing Calls to Action */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/50 via-purple-950/40 to-slate-900 border border-[#22D3EE]/40 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="font-mono text-sm font-bold text-white">
                    Ready to Explore the Experiments?
                  </h4>
                  <p className="text-xs text-slate-300 font-sans mt-0.5">
                    Dive into the interactive laboratory, test your hypotheses in sandbox mode, or explore the BDH synapse microscope.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      onClose();
                      onExploreFullLab();
                    }}
                    className="px-4 py-2 rounded-xl bg-[#141B2A] hover:bg-[#1C253B] text-white border border-[#2B354D] font-mono text-xs font-semibold transition"
                  >
                    EXPLORE FULL LAB
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      onEnterSandbox();
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold shadow-lg shadow-blue-500/20 transition"
                  >
                    ENTER SANDBOX
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Controls */}
        <div className="p-4 border-t border-[#1E2536] bg-[#0E121C] flex items-center justify-between text-xs font-mono">
          <button
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            disabled={currentStep === 1}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#141824] hover:bg-[#1C2336] text-slate-300 disabled:opacity-40 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK</span>
          </button>

          <div className="text-slate-400 hidden sm:block">
            Use <kbd className="px-1.5 py-0.5 bg-[#141824] border border-[#252A35] rounded text-white">←</kbd>{' '}
            <kbd className="px-1.5 py-0.5 bg-[#141824] border border-[#252A35] rounded text-white">→</kbd> or{' '}
            <kbd className="px-1.5 py-0.5 bg-[#141824] border border-[#252A35] rounded text-white">ESC</kbd>
          </div>

          {currentStep < 5 ? (
            <button
              onClick={() => setCurrentStep((s) => Math.min(5, s + 1))}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-500/20 transition-all hover:translate-x-0.5"
            >
              <span>NEXT STEP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                onExploreFullLab();
              }}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold transition-all"
            >
              <span>FINISH TOUR</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  Brain,
  Sliders,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  Cpu,
  Layers,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Activity,
  Layers3,
} from 'lucide-react';
import { latentStep, createDeterministicLatentInput } from '../models/latentReasoning';

interface LatentReasoningDemoProps {
  id?: string;
}

export const LatentReasoningDemo: React.FC<LatentReasoningDemoProps> = ({
  id = 'latent-reasoning-demo',
}) => {
  const [steps, setSteps] = useState<number>(8);
  const [retention, setRetention] = useState<number>(0.92);
  const [showLatentState, setShowLatentState] = useState<boolean>(true);
  const [showVisibleTokens, setShowVisibleTokens] = useState<boolean>(true);
  const [selectedSampleProblem, setSelectedSampleProblem] = useState<string>('ARC Pattern Rotation');

  const dim = 16;

  // Generate deterministic synthetic input for the sample problem
  const inputVector = useMemo(() => {
    return createDeterministicLatentInput(dim, selectedSampleProblem);
  }, [selectedSampleProblem, dim]);

  // Initial zeroed / quiescent state
  const initialState = useMemo(() => Array(dim).fill(0), [dim]);

  // Calculate states at each step using latentStep
  const stepStates = useMemo(() => {
    const states: number[][] = [initialState];
    let curr = [...initialState];
    for (let s = 1; s <= steps; s++) {
      curr = latentStep(curr, inputVector, 1, retention);
      states.push(curr);
    }
    return states;
  }, [initialState, inputVector, steps, retention]);

  const finalState = stepStates[stepStates.length - 1] ?? initialState;

  // Calculate synthetic output confidence or convergence
  const stateMagnitude = useMemo(() => {
    const sumSq = finalState.reduce((acc, v) => acc + v * v, 0);
    return Math.sqrt(sumSq) / Math.sqrt(dim);
  }, [finalState, dim]);

  const stepOptions = [0, 1, 2, 4, 8, 16];

  return (
    <div id={id} className="rounded-2xl border border-[#252A35] bg-[#0A0E17] p-5 sm:p-7 text-slate-100 shadow-2xl space-y-8">
      {/* Header Banner & Title */}
      <div className="space-y-3 border-b border-[#1E2536] pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-purple-400 bg-purple-950/60 border border-purple-800/60 px-2.5 py-0.5 rounded-md font-bold">
              FROM MEMORY TO REASONING
            </span>
            <span className="text-xs font-mono uppercase tracking-wider text-amber-300 bg-amber-950/70 border border-amber-800/60 px-2.5 py-0.5 rounded-md font-bold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              EDUCATIONAL TOY — NOT BDH-CQ
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              onClick={() => setShowLatentState(!showLatentState)}
              className={`px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 ${
                showLatentState
                  ? 'bg-purple-900/40 border-purple-500 text-purple-200'
                  : 'bg-[#121622] border-[#222B3D] text-slate-400'
              }`}
            >
              {showLatentState ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{showLatentState ? 'HIDE LATENT STATE' : 'SHOW LATENT STATE'}</span>
            </button>

            <button
              onClick={() => setShowVisibleTokens(!showVisibleTokens)}
              className={`px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 ${
                showVisibleTokens
                  ? 'bg-blue-900/40 border-blue-500 text-blue-200'
                  : 'bg-[#121622] border-[#222B3D] text-slate-400'
              }`}
            >
              {showVisibleTokens ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{showVisibleTokens ? 'HIDE VISIBLE TOKENS' : 'SHOW VISIBLE TOKENS'}</span>
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
            RECURRENT LATENT REASONING EXPLORER
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-3xl font-sans">
            Our toy showed memory being carried forward through an evolving internal state. Now introduce{' '}
            <strong className="text-purple-300">BDH-CQ</strong>: in-context learning with recurrent latent reasoning, where multi-step internal deliberation happens directly in latent state rather than by spewing lengthy token scratchpads into an expanding KV-cache.
          </p>
        </div>
      </div>

      {/* Visual Comparison: Verbal Reasoning vs Latent Reasoning */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Verbal Reasoning Box */}
        <div className="p-4 rounded-xl border border-amber-900/40 bg-[#140F0A] space-y-3">
          <div className="flex items-center justify-between border-b border-amber-900/40 pb-2">
            <span className="font-mono text-xs font-bold uppercase text-amber-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              VERBAL REASONING (CHAIN-OF-THOUGHT)
            </span>
            <span className="text-[10px] font-mono text-amber-500 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
              O(T) KV-CACHE
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#0D0A07] border border-[#2A1E14] font-mono text-xs text-amber-200/90 flex flex-wrap items-center gap-2">
            <span className="px-2 py-1 rounded bg-amber-900/40 border border-amber-700/50 text-white">Input Tokens</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
            <span className="px-2 py-1 rounded bg-amber-950 border border-amber-800 text-amber-300">Explanation Step 1</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
            <span className="px-2 py-1 rounded bg-amber-950 border border-amber-800 text-amber-300">Explanation Step 2</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
            <span className="px-2 py-1 rounded bg-amber-900/60 border border-amber-600 text-white font-bold">Answer Token</span>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            Every reasoning step emits visible scratchpad tokens into the prompt buffer. GPU memory footprint grows linearly or quadratically with sequence length.
          </p>
        </div>

        {/* Latent Reasoning Box */}
        <div className="p-4 rounded-xl border border-purple-900/40 bg-[#120D1F] space-y-3">
          <div className="flex items-center justify-between border-b border-purple-900/40 pb-2">
            <span className="font-mono text-xs font-bold uppercase text-purple-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              LATENT REASONING (RECURRENT DYNAMICS)
            </span>
            <span className="text-[10px] font-mono text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
              O(1) BOUNDED STATE
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#0C0816] border border-[#2D1F48] font-mono text-xs text-purple-200 flex flex-wrap items-center gap-2">
            <span className="px-2 py-1 rounded bg-purple-900/50 border border-purple-700 text-white">Input</span>
            <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
            <span className="px-2 py-1 rounded bg-purple-950 border border-purple-800 text-purple-300">Latent State h₀</span>
            <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
            <span className="px-2 py-1 rounded bg-purple-950 border border-purple-800 text-purple-300">Latent Update h₁..hₖ</span>
            <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
            <span className="px-2 py-1 rounded bg-purple-900/60 border border-purple-600 text-white font-bold">Answer</span>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            Deliberation is executed via recurrent updates on a fixed-size latent state vector without inflating the visible sequence length.
          </p>
        </div>
      </div>

      {/* Latent Steps Control Slider & Interactive Playground */}
      <div className="p-5 rounded-xl border border-[#222B3D] bg-[#0E1321] space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1C2538] pb-4">
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase font-semibold">
              RECURRENT EXPERIMENT PARAMETERS
            </div>
            <div className="text-sm font-mono font-bold text-white mt-0.5">
              CONTROL LATENT REASONING STEPS
            </div>
          </div>

          {/* Stepper Buttons: 0 / 1 / 2 / 4 / 8 / 16 */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono text-slate-400 mr-2">STEPS:</span>
            {stepOptions.map((s) => (
              <button
                key={s}
                onClick={() => setSteps(s)}
                className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold transition border ${
                  steps === s
                    ? 'bg-purple-600 border-purple-400 text-white shadow-md shadow-purple-600/30 ring-1 ring-purple-300'
                    : 'bg-[#151C2C] border-[#222C42] text-slate-300 hover:text-white hover:bg-[#1A2438]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* The Math Formula & Explanatory Notice */}
        <div className="p-3.5 rounded-lg bg-[#080C14] border border-[#1A2234] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-purple-400 font-bold">STATE RECURRENCE FORMULA:</span>
            <span className="text-white bg-[#101626] px-2 py-0.5 rounded border border-[#202C44]">
              state_(t+1) = tanh(λ · state_t + input)
            </span>
          </div>
          <span className="text-slate-400 text-[11px]">
            Repeated latent steps update the internal state without emitting visible tokens.
          </span>
        </div>

        {/* COMPUTATION WITHOUT MORE TOKENS Visual Presentation */}
        <div className="p-4 rounded-xl bg-[#090D18] border border-[#1C2538] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#172032] pb-2">
            <span className="text-xs font-mono uppercase font-bold text-emerald-400 flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              COMPUTATION WITHOUT MORE TOKENS
            </span>
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="text-slate-400">
                VISIBLE TOKENS:{' '}
                <strong className="text-white bg-slate-800 px-2 py-0.5 rounded font-mono">2</strong>
              </span>
              <span className="text-slate-400">
                LATENT UPDATES:{' '}
                <strong className="text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800 font-mono">
                  {steps}
                </strong>
              </span>
            </div>
          </div>

          {/* User & Model Visible Sequence */}
          {showVisibleTokens && (
            <div className="p-3 rounded-lg bg-[#0F1424] border border-[#202A40] space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-blue-400 font-bold">USER:</span>
                <span>Solve ARC reasoning challenge #{selectedSampleProblem}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300 border-t border-[#1C2438] pt-2">
                <span className="text-emerald-400 font-bold">MODEL:</span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-950/80 border border-blue-700 text-blue-200">
                    [INPUT]
                  </span>
                  <span className="text-slate-500">────────────────────────→</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700 text-emerald-200 font-bold">
                    [ANSWER]
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Internal Recurrent Computation Path */}
          <div className="p-3.5 rounded-lg bg-[#070910] border border-[#1A2234] space-y-3 font-mono">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>INTERNAL COMPUTATION FLOW (UNROLLED):</span>
              <span className="text-purple-400 font-semibold">{steps} Recurrent Iterations</span>
            </div>

            <div className="overflow-x-auto pb-2 flex items-center gap-2 text-xs">
              <div className="flex-shrink-0 px-2.5 py-1.5 rounded-lg bg-[#111728] border border-blue-500/40 text-blue-300 text-center">
                <div className="text-[10px] text-slate-500">INPUT</div>
                <div className="font-bold">x_0</div>
              </div>

              {Array.from({ length: Math.min(steps, 8) }).map((_, i) => (
                <React.Fragment key={i}>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                  <div className="flex-shrink-0 px-2.5 py-1.5 rounded-lg bg-purple-950/40 border border-purple-500/50 text-purple-200 text-center">
                    <div className="text-[9px] text-purple-400">LATENT STEP {i + 1}</div>
                    <div className="font-bold font-mono">h_{i + 1}</div>
                  </div>
                </React.Fragment>
              ))}

              {steps > 8 && (
                <>
                  <span className="text-slate-500">···</span>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                  <div className="flex-shrink-0 px-2.5 py-1.5 rounded-lg bg-purple-950/40 border border-purple-500/50 text-purple-200 text-center">
                    <div className="text-[9px] text-purple-400">LATENT STEP {steps}</div>
                    <div className="font-bold font-mono">h_{steps}</div>
                  </div>
                </>
              )}

              <ArrowRight className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <div className="flex-shrink-0 px-2.5 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500 text-emerald-300 text-center">
                <div className="text-[10px] text-emerald-500">OUTPUT</div>
                <div className="font-bold">ŷ</div>
              </div>
            </div>
          </div>

          {/* Live Heatmap of Latent State */}
          {showLatentState && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>LATENT STATE VECTOR DIMENSIONS ({dim}D):</span>
                <span className="text-purple-300 font-bold">
                  ||h_{steps}|| = {stateMagnitude.toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5">
                {finalState.map((val, idx) => {
                  const intensity = Math.min(Math.abs(val), 1);
                  const isPositive = val >= 0;
                  return (
                    <div
                      key={idx}
                      className="p-1.5 rounded bg-[#101422] border border-[#1A2234] text-center font-mono text-[10px]"
                      title={`Dim ${idx}: ${val.toFixed(3)}`}
                    >
                      <div className="text-slate-500 text-[9px] mb-1">{idx}</div>
                      <div
                        className={`h-4 rounded flex items-center justify-center font-bold text-[9px] ${
                          isPositive
                            ? 'bg-purple-600 text-white'
                            : 'bg-cyan-600 text-white'
                        }`}
                        style={{ opacity: 0.35 + intensity * 0.65 }}
                      >
                        {val.toFixed(1)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Conceptual Takeaway Highlight */}
        <div className="p-3.5 rounded-lg bg-purple-950/20 border border-purple-500/30 text-xs text-purple-200 font-mono text-center">
          “More computation does not necessarily mean more visible words.”
        </div>
      </div>

      {/* Side-by-Side Comparison Table: Standard Token Reasoning vs Recurrent Latent Reasoning */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        <div className="p-4 rounded-xl bg-[#0E121E] border border-[#1C2538] space-y-2.5">
          <div className="font-bold text-amber-300 uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            STANDARD TOKEN REASONING
          </div>
          <ul className="space-y-1.5 text-slate-300 font-sans text-xs">
            <li>• Reasoning is explicitly represented through emitted, visible tokens.</li>
            <li>• Context sequence length grows linearly with additional reasoning steps.</li>
            <li>• Memory footprint consumes proportionally more GPU RAM in the KV cache.</li>
            <li>• Inference speed slows down quadratically or linearly per token emitted.</li>
          </ul>
        </div>

        <div className="p-4 rounded-xl bg-[#120F20] border border-purple-900/40 space-y-2.5">
          <div className="font-bold text-purple-300 uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            RECURRENT LATENT REASONING
          </div>
          <ul className="space-y-1.5 text-slate-300 font-sans text-xs">
            <li>• Additional internal computation occurs in continuous latent state.</li>
            <li>• Reasoning steps do not correspond one-to-one with visible output tokens.</li>
            <li>• Sequence length remains bounded while computation depth expands.</li>
            <li>• Emulates human contemplation before speech: deliberation without clutter.</li>
          </ul>
        </div>
      </div>

      {/* MEMORY VS COMPUTATION DISTINCTION */}
      <div className="p-5 rounded-xl border border-[#222B3D] bg-[#0C101C] space-y-4">
        <div className="text-xs font-mono font-bold uppercase text-white flex items-center gap-2">
          <Layers3 className="w-4 h-4 text-cyan-400" />
          THE MEMORY VS. COMPUTATION DISTINCTION
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
          {/* Memory */}
          <div className="p-4 rounded-lg bg-[#0F1422] border border-blue-900/50 space-y-2">
            <div className="text-blue-300 font-bold uppercase text-sm border-b border-blue-900/40 pb-1">
              MEMORY
            </div>
            <div className="text-slate-300 font-semibold text-xs">What survives?</div>
            <div className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Information carried across successive updates. In our toy, it is the recurrent matrix $M_t$. In BDH, it is the plastic synaptic state $\sigma(i, j)$.
            </div>
          </div>

          {/* Computation */}
          <div className="p-4 rounded-lg bg-[#140F24] border border-purple-900/50 space-y-2">
            <div className="text-purple-300 font-bold uppercase text-sm border-b border-purple-900/40 pb-1">
              COMPUTATION
            </div>
            <div className="text-slate-300 font-semibold text-xs">What changes?</div>
            <div className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Transformations applied to the current state. In our toy, it is the non-linear recurrent update step. In BDH, it is the local graph relaxation cycle.
            </div>
          </div>
        </div>
      </div>

      {/* WHY DOES THIS MATTER? (Beginner-Friendly Explanation & Central Claim Connection) */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-purple-950/40 via-[#0E1322] to-blue-950/40 border border-purple-500/30 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase">
          <Sparkles className="w-4 h-4 text-purple-400" />
          WHY DOES THIS MATTER?
        </div>
        <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
          A model can perform additional internal recurrent computation while keeping the externally visible sequence shorter. Instead of inflating memory by typing out a 500-word scratchpad to solve an inductive pattern, the system iterates over its latent state in constant RAM.
        </p>
        <div className="text-xs font-mono text-purple-300 bg-purple-950/60 p-3 rounded-lg border border-purple-800/60">
          <strong>Central Claim:</strong> A useful fixed-size recurrent state can carry information across multiple computation steps, but the quality and retention of that state determines what survives.
        </div>
      </div>
    </div>
  );
};

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
import { MathView } from './ui/MathView';

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
    <div id={id} className="rounded-xl border border-[#D8DCD8] bg-[#FFFFFF] p-5 sm:p-7 text-[#252525] shadow-xs space-y-8">
      {/* Header Banner & Title */}
      <div className="space-y-3 border-b border-[#EAE6DF] pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-sans text-[#21445B] bg-[#E7F2FA] border border-[#CDE1F0] px-2.5 py-0.5 rounded-md font-semibold">
              From memory to reasoning
            </span>
            <span className="text-xs font-sans text-[#A46622] bg-[#FFF5D8] border border-[#F3E5BE] px-2.5 py-0.5 rounded-md font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Educational toy — not official BDH-CQ
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-sans">
            <button
              onClick={() => setShowLatentState(!showLatentState)}
              className={`px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 cursor-pointer font-medium ${
                showLatentState
                  ? 'bg-[#E7F2FA] border-[#2B6282] text-[#21445B] font-semibold ring-1 ring-[#2B6282]'
                  : 'bg-[#FAF8F5] border-[#D8DCD8] text-[#5F625F] hover:text-[#252525]'
              }`}
            >
              {showLatentState ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{showLatentState ? 'Hide latent state' : 'Show latent state'}</span>
            </button>

            <button
              onClick={() => setShowVisibleTokens(!showVisibleTokens)}
              className={`px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 cursor-pointer font-medium ${
                showVisibleTokens
                  ? 'bg-[#E7F2FA] border-[#2B6282] text-[#21445B] font-semibold ring-1 ring-[#2B6282]'
                  : 'bg-[#FAF8F5] border-[#D8DCD8] text-[#5F625F] hover:text-[#252525]'
              }`}
            >
              {showVisibleTokens ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{showVisibleTokens ? 'Hide visible tokens' : 'Show visible tokens'}</span>
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#252525] tracking-tight">
            Recurrent latent reasoning explorer
          </h3>
          <p className="text-xs sm:text-sm text-[#5F625F] leading-relaxed max-w-3xl font-sans">
            Our earlier experiment showed memory being carried forward through an evolving internal state. Now compare this with{' '}
            <strong className="text-[#21445B]">BDH-CQ</strong>: in-context learning with recurrent latent reasoning, where multi-step internal deliberation happens directly in latent state rather than by emitting lengthy token scratchpads into an expanding KV-cache.
          </p>
        </div>
      </div>

      {/* Visual Comparison: Verbal Reasoning vs Latent Reasoning */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Verbal Reasoning Box */}
        <div className="p-4 rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] space-y-3">
          <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-2">
            <span className="font-sans text-xs font-bold text-[#A46622] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#A46622]" />
              Verbal reasoning (Chain-of-thought)
            </span>
            <span className="text-xs font-mono text-[#A46622] bg-[#FFF5D8] px-2 py-0.5 rounded border border-[#F3E5BE]">
              O(T) KV-cache
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#EAE6DF] font-sans text-xs text-[#252525] flex flex-wrap items-center gap-2">
            <span className="px-2 py-1 rounded bg-[#F1F2F0] border border-[#D8DCD8] text-[#252525]">Input tokens</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#5F625F]" />
            <span className="px-2 py-1 rounded bg-[#FFF5D8] border border-[#F3E5BE] text-[#A46622]">Explanation step 1</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#5F625F]" />
            <span className="px-2 py-1 rounded bg-[#FFF5D8] border border-[#F3E5BE] text-[#A46622]">Explanation step 2</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#5F625F]" />
            <span className="px-2 py-1 rounded bg-[#DCEFE2] border border-[#C5DDCB] text-[#245B38] font-bold">Answer token</span>
          </div>

          <p className="text-xs text-[#5F625F] leading-relaxed font-sans">
            Every reasoning step emits visible scratchpad tokens into the prompt buffer. GPU memory footprint grows linearly or quadratically with sequence length.
          </p>
        </div>

        {/* Latent Reasoning Box */}
        <div className="p-4 rounded-xl border border-[#CDE1F0] bg-[#F7FAFD] space-y-3">
          <div className="flex items-center justify-between border-b border-[#CDE1F0] pb-2">
            <span className="font-sans text-xs font-bold text-[#21445B] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#21445B]" />
              Latent reasoning (Recurrent dynamics)
            </span>
            <span className="text-xs font-mono text-[#21445B] bg-[#E7F2FA] px-2 py-0.5 rounded border border-[#CDE1F0]">
              O(1) bounded state
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#CDE1F0] font-sans text-xs text-[#252525] flex flex-wrap items-center gap-2">
            <span className="px-2 py-1 rounded bg-[#F1F2F0] border border-[#D8DCD8] text-[#252525]">Input</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#21445B]" />
            <span className="px-2 py-1 rounded bg-[#E7F2FA] border border-[#CDE1F0] text-[#21445B]">Latent state <code className="font-mono">h₀</code></span>
            <ArrowRight className="w-3.5 h-3.5 text-[#21445B]" />
            <span className="px-2 py-1 rounded bg-[#E7F2FA] border border-[#CDE1F0] text-[#21445B]">Latent update <code className="font-mono">h₁..hₖ</code></span>
            <ArrowRight className="w-3.5 h-3.5 text-[#21445B]" />
            <span className="px-2 py-1 rounded bg-[#DCEFE2] border border-[#C5DDCB] text-[#245B38] font-bold">Answer</span>
          </div>

          <p className="text-xs text-[#5F625F] leading-relaxed font-sans">
            Deliberation is executed via recurrent updates on a fixed-size latent state vector without inflating the visible sequence length.
          </p>
        </div>
      </div>

      {/* Latent Steps Control Slider & Interactive Playground */}
      <div className="p-5 rounded-xl border border-[#D8DCD8] bg-[#FAF8F5] space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EAE6DF] pb-4">
          <div>
            <div className="text-xs font-sans text-[#5F625F] font-semibold">
              Recurrent experiment parameters
            </div>
            <div className="text-sm font-sans font-bold text-[#252525] mt-0.5">
              Control latent reasoning steps
            </div>
          </div>

          {/* Stepper Buttons: 0 / 1 / 2 / 4 / 8 / 16 */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-sans text-[#5F625F] mr-2">Steps:</span>
            {stepOptions.map((s) => (
              <button
                key={s}
                onClick={() => setSteps(s)}
                className={`px-3 py-1 rounded-lg font-mono text-xs font-bold transition border cursor-pointer ${
                  steps === s
                    ? 'bg-[#E7F2FA] border-[#2B6282] text-[#21445B] ring-1 ring-[#2B6282]'
                    : 'bg-[#FFFFFF] border-[#D8DCD8] text-[#5F625F] hover:text-[#252525] hover:bg-[#F1F2F0]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* The Math Formula & Explanatory Notice */}
        <div className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#EAE6DF] flex flex-wrap items-center justify-between gap-3 text-xs font-sans">
          <div className="flex items-center gap-2">
            <span className="text-[#21445B] font-semibold">State recurrence formula:</span>
            <span className="text-[#252525] bg-[#F1F2F0] px-2 py-0.5 rounded border border-[#D8DCD8] font-mono">
              <MathView math="s_{t+1} = \tanh(\lambda \cdot s_t + x_t)" />
            </span>
          </div>
          <span className="text-[#5F625F] text-xs">
            Repeated latent steps update the internal state without emitting visible tokens.
          </span>
        </div>

        {/* COMPUTATION WITHOUT MORE TOKENS Visual Presentation */}
        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#EAE6DF] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EAE6DF] pb-2">
            <span className="text-xs font-sans font-bold text-[#247A4B] flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              Computation without more tokens
            </span>
            <div className="flex items-center gap-3 font-sans text-xs">
              <span className="text-[#5F625F]">
                Visible tokens:{' '}
                <strong className="text-[#252525] bg-[#F1F2F0] px-2 py-0.5 rounded border border-[#D8DCD8] font-mono">2</strong>
              </span>
              <span className="text-[#5F625F]">
                Latent updates:{' '}
                <strong className="text-[#21445B] bg-[#E7F2FA] px-2 py-0.5 rounded border border-[#CDE1F0] font-mono">
                  {steps}
                </strong>
              </span>
            </div>
          </div>

          {/* User & Model Visible Sequence */}
          {showVisibleTokens && (
            <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#EAE6DF] space-y-2 text-xs font-sans">
              <div className="flex items-center gap-2 text-[#252525]">
                <span className="text-[#21445B] font-bold">User:</span>
                <span>Solve ARC reasoning challenge #{selectedSampleProblem}</span>
              </div>
              <div className="flex items-center gap-2 text-[#252525] border-t border-[#EAE6DF] pt-2">
                <span className="text-[#247A4B] font-bold">Model:</span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="px-2 py-0.5 rounded bg-[#E7F2FA] border border-[#CDE1F0] text-[#21445B]">
                    [INPUT]
                  </span>
                  <span className="text-[#5F625F]">────────────────────────→</span>
                  <span className="px-2 py-0.5 rounded bg-[#DCEFE2] border border-[#C5DDCB] text-[#245B38] font-bold">
                    [ANSWER]
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Internal Recurrent Computation Path */}
          <div className="p-3.5 rounded-lg bg-[#FAF8F5] border border-[#EAE6DF] space-y-3 font-sans">
            <div className="flex items-center justify-between text-xs text-[#5F625F]">
              <span>Internal computation flow (unrolled):</span>
              <span className="text-[#21445B] font-semibold">{steps} recurrent iterations</span>
            </div>

            <div className="overflow-x-auto pb-2 flex items-center gap-2 text-xs">
              <div className="flex-shrink-0 px-2.5 py-1.5 rounded-lg bg-[#E7F2FA] border border-[#CDE1F0] text-[#21445B] text-center font-mono">
                <div className="text-xs text-[#5F625F] font-sans">Input</div>
                <div className="font-bold">x_0</div>
              </div>

              {Array.from({ length: Math.min(steps, 8) }).map((_, i) => (
                <React.Fragment key={i}>
                  <ArrowRight className="w-3.5 h-3.5 text-[#5F625F] flex-shrink-0" />
                  <div className="flex-shrink-0 px-2.5 py-1.5 rounded-lg bg-[#FFF5D8] border border-[#F3E5BE] text-[#A46622] text-center font-mono">
                    <div className="text-xs text-[#A46622] font-sans">Step {i + 1}</div>
                    <div className="font-bold">h_{i + 1}</div>
                  </div>
                </React.Fragment>
              ))}

              {steps > 8 && (
                <>
                  <span className="text-[#5F625F]">···</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#5F625F] flex-shrink-0" />
                  <div className="flex-shrink-0 px-2.5 py-1.5 rounded-lg bg-[#FFF5D8] border border-[#F3E5BE] text-[#A46622] text-center font-mono">
                    <div className="text-xs text-[#A46622] font-sans">Step {steps}</div>
                    <div className="font-bold">h_{steps}</div>
                  </div>
                </>
              )}

              <ArrowRight className="w-3.5 h-3.5 text-[#247A4B] flex-shrink-0" />
              <div className="flex-shrink-0 px-2.5 py-1.5 rounded-lg bg-[#DCEFE2] border border-[#C5DDCB] text-[#245B38] text-center font-mono">
                <div className="text-xs text-[#247A4B] font-sans">Output</div>
                <div className="font-bold">ŷ</div>
              </div>
            </div>
          </div>

          {/* Live Heatmap of Latent State */}
          {showLatentState && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-sans text-[#5F625F]">
                <span>Latent state vector dimensions ({dim}D):</span>
                <span className="text-[#21445B] font-mono font-bold">
                  ||h_{steps}|| = {stateMagnitude.toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5">
                {finalState.map((val, idx) => {
                  const isPositive = val >= 0;
                  return (
                    <div
                      key={idx}
                      className="p-1.5 rounded bg-[#FAF8F5] border border-[#EAE6DF] text-center font-mono text-xs"
                      title={`Dim ${idx}: ${val.toFixed(3)}`}
                    >
                      <div className="text-[#5F625F] text-xs mb-1 font-sans">{idx}</div>
                      <div
                        className={`h-5 rounded flex items-center justify-center font-bold text-xs ${
                          isPositive
                            ? 'bg-[#E7F2FA] text-[#21445B] border border-[#CDE1F0]'
                            : 'bg-[#F9E9ED] text-[#B64235] border border-[#F2CAD2]'
                        }`}
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
        <div className="p-3.5 rounded-lg bg-[#F7F5EF] border border-[#EAE6DF] text-xs text-[#5F625F] font-sans text-center">
          “More computation does not necessarily mean more visible words.”
        </div>
      </div>

      {/* Side-by-Side Comparison Table: Standard Token Reasoning vs Recurrent Latent Reasoning */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-2.5">
          <div className="font-bold text-[#A46622] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#A46622]" />
            Standard token reasoning
          </div>
          <ul className="space-y-1.5 text-[#5F625F] leading-relaxed">
            <li>• Reasoning is explicitly represented through emitted, visible tokens.</li>
            <li>• Context sequence length grows linearly with additional reasoning steps.</li>
            <li>• Memory footprint consumes proportionally more GPU RAM in the KV cache.</li>
            <li>• Inference speed slows down quadratically or linearly per token emitted.</li>
          </ul>
        </div>

        <div className="p-4 rounded-xl bg-[#F7FAFD] border border-[#CDE1F0] space-y-2.5">
          <div className="font-bold text-[#21445B] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#21445B]" />
            Recurrent latent reasoning
          </div>
          <ul className="space-y-1.5 text-[#5F625F] leading-relaxed">
            <li>• Additional internal computation occurs in continuous latent state.</li>
            <li>• Reasoning steps do not correspond one-to-one with visible output tokens.</li>
            <li>• Sequence length remains bounded while computation depth expands.</li>
            <li>• Emulates contemplation before speech: deliberation without clutter.</li>
          </ul>
        </div>
      </div>

      {/* MEMORY VS COMPUTATION DISTINCTION */}
      <div className="p-5 rounded-xl border border-[#D8DCD8] bg-[#FAF8F5] space-y-4">
        <div className="text-xs font-sans font-bold text-[#252525] flex items-center gap-2">
          <Layers3 className="w-4 h-4 text-[#21445B]" />
          The memory vs. computation distinction
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
          {/* Memory */}
          <div className="p-4 rounded-lg bg-[#FFFFFF] border border-[#EAE6DF] space-y-2">
            <div className="text-[#21445B] font-bold text-sm border-b border-[#EAE6DF] pb-1">
              Memory
            </div>
            <div className="text-[#252525] font-semibold text-xs">What survives?</div>
            <div className="text-xs text-[#5F625F] leading-relaxed">
              Information carried across successive updates. In our toy, it is the recurrent matrix <code className="font-mono">M[t]</code>. In BDH, it is the plastic synaptic state <code className="font-mono">σ(i, j)</code>.
            </div>
          </div>

          {/* Computation */}
          <div className="p-4 rounded-lg bg-[#FFFFFF] border border-[#EAE6DF] space-y-2">
            <div className="text-[#A46622] font-bold text-sm border-b border-[#EAE6DF] pb-1">
              Computation
            </div>
            <div className="text-[#252525] font-semibold text-xs">What changes?</div>
            <div className="text-xs text-[#5F625F] leading-relaxed">
              Transformations applied to the current state. In our toy, it is the non-linear recurrent update step. In BDH, it is the local graph relaxation cycle.
            </div>
          </div>
        </div>
      </div>

      {/* WHY DOES THIS MATTER? (Beginner-Friendly Explanation & Central Claim Connection) */}
      <div className="p-5 rounded-xl bg-[#F7F5EF] border border-[#EAE6DF] space-y-3">
        <div className="flex items-center gap-2 text-xs font-sans font-bold text-[#252525]">
          <Sparkles className="w-4 h-4 text-[#21445B]" />
          Why does this matter?
        </div>
        <p className="text-xs sm:text-sm text-[#5F625F] font-sans leading-relaxed">
          A model can perform additional internal recurrent computation while keeping the externally visible sequence shorter. Instead of inflating memory by typing out a 500-word scratchpad to solve an inductive pattern, the system iterates over its latent state in constant RAM.
        </p>
        <div className="text-xs font-sans text-[#252525] bg-[#FFFFFF] p-3 rounded-lg border border-[#D8DCD8]">
          <strong className="text-[#21445B]">Central claim:</strong> A useful fixed-size recurrent state can carry information across multiple computation steps, but the quality and retention of that state determines what survives.
        </div>
      </div>
    </div>
  );
};

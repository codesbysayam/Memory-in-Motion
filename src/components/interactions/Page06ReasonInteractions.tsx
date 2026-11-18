import React, { useState, useMemo } from 'react';
import {
  Cpu,
  RotateCcw,
  Play,
  Sliders,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { cosine } from '../../models/associativeMemory';
import { InlineMath, BlockMath } from '../ui/MathView';

export const Page06ReasonInteractions: React.FC = () => {
  // 1. Latent Step Controller
  const [latentSteps, setLatentSteps] = useState<number>(3);

  // 3. Input Perturbation
  const [perturbationMagnitude, setPerturbationMagnitude] = useState<number>(0.15);

  const dim = 6;

  // Compute Latent Relaxation Trajectory
  // Initial state vector z_0 -> z_1 -> ... -> z_K
  // Update law: z_{k+1} = tanh(W_latent * z_k + z_input)
  const trajectory = useMemo(() => {
    // Deterministic fixed latent recurrent weights
    const W: number[][] = [
      [0.6, -0.2, 0.1, 0.0, 0.3, -0.1],
      [-0.1, 0.5, 0.2, -0.3, 0.0, 0.2],
      [0.2, -0.1, 0.7, 0.1, -0.2, 0.0],
      [0.0, 0.3, -0.2, 0.6, 0.1, -0.1],
      [-0.2, 0.0, 0.1, -0.1, 0.5, 0.3],
      [0.1, 0.2, -0.1, 0.2, -0.3, 0.6],
    ];

    const inputOrig = [0.8, -0.5, 0.3, 0.6, -0.2, 0.7];
    const inputPerturbed = inputOrig.map((v, i) =>
      i === 0 ? v + perturbationMagnitude : i === 3 ? v - perturbationMagnitude : v
    );

    const runTrajectory = (input: number[]) => {
      const steps: Array<{ step: number; state: number[]; norm: number }> = [];
      let z = [...input];
      steps.push({
        step: 0,
        state: [...z],
        norm: Math.sqrt(z.reduce((sum, v) => sum + v * v, 0)),
      });

      for (let s = 1; s <= latentSteps; s++) {
        const nextZ = Array(dim).fill(0);
        for (let i = 0; i < dim; i++) {
          let sum = 0;
          for (let j = 0; j < dim; j++) {
            sum += (W[i][j] || 0) * (z[j] || 0);
          }
          // tanh activation with residual input bias
          nextZ[i] = Math.tanh(sum + input[i] * 0.5);
        }
        z = nextZ;
        steps.push({
          step: s,
          state: [...z],
          norm: Math.sqrt(z.reduce((sum, v) => sum + v * v, 0)),
        });
      }
      return steps;
    };

    const origTraj = runTrajectory(inputOrig);
    const pertTraj = runTrajectory(inputPerturbed);

    const finalOrig = origTraj[origTraj.length - 1].state;
    const finalPert = pertTraj[pertTraj.length - 1].state;
    const finalCosine = cosine(finalOrig, finalPert);

    const diffVec = finalOrig.map((v, i) => v - finalPert[i]);
    const diffNorm = Math.sqrt(diffVec.reduce((sum, v) => sum + v * v, 0));

    return {
      origTraj,
      pertTraj,
      finalCosine,
      diffNorm,
    };
  }, [latentSteps, perturbationMagnitude]);

  // 2. Latent State Replay (active step inspected)
  const [inspectedStep, setInspectedStep] = useState<number>(0);
  const activeOrigStep = trajectory.origTraj[Math.min(inspectedStep, trajectory.origTraj.length - 1)] || trajectory.origTraj[0];
  const activePertStep = trajectory.pertTraj[Math.min(inspectedStep, trajectory.pertTraj.length - 1)] || trajectory.pertTraj[0];

  return (
    <div className="space-y-8 mt-6">
      {/* 1. LATENT STEP CONTROLLER */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[var(--accent-blue)] text-[var(--accent-blue-text)]">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-sans text-base font-semibold text-[var(--text-primary)]">
                1. Continuous Latent Relaxation Controller
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Adjust the number of internal recurrent relaxation passes executed before token emission.
              </p>
            </div>
          </div>
          <span className="text-xs italic text-[var(--text-muted)]">
            Educational abstraction of continuous test-time reasoning.
          </span>
        </div>

        {/* Latent Steps Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[var(--text-primary)]">
              Recurrent Latent Passes (<InlineMath math="K" /> steps):
            </span>
            <span className="font-mono text-sm font-bold text-[var(--accent-blue-text)] tabular-nums">
              K = {latentSteps} passes
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={8}
            step={1}
            value={latentSteps}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setLatentSteps(val);
              if (inspectedStep > val) setInspectedStep(val);
            }}
            className="w-full accent-[var(--color-accent)] cursor-pointer"
          />

          <div className="flex justify-between text-[11px] font-mono text-[var(--text-muted)] tabular-nums">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <span key={s} className={s === latentSteps ? 'font-bold text-[var(--accent-blue-text)]' : ''}>
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* 2. LATENT STATE REPLAY (INITIAL, INTERMEDIATE, FINAL) */}
        <div className="pt-3 border-t border-[var(--border)] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-[var(--text-secondary)]">Step Replay Inspector:</span>
            <div className="flex flex-wrap items-center gap-1">
              {trajectory.origTraj.map((st) => (
                <button
                  key={st.step}
                  onClick={() => setInspectedStep(st.step)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition cursor-pointer border ${
                    inspectedStep === st.step
                      ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-[var(--surface)] font-bold'
                      : 'bg-[var(--surface-soft)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Step {st.step}
                </button>
              ))}
            </div>
          </div>

          {/* State Coordinate Vector Display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-2">
              <span className="text-[var(--text-secondary)] font-semibold text-xs block">
                Original trajectory vector at step {activeOrigStep.step}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {activeOrigStep.state.map((val, idx) => (
                  <span
                    key={idx}
                    className="font-mono text-xs px-2 py-1 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] tabular-nums"
                  >
                    z_{idx}: {val.toFixed(2)}
                  </span>
                ))}
              </div>
              <span className="text-[11px] text-[var(--text-muted)] block tabular-nums">
                Vector Energy ||z||: <strong className="text-[var(--text-primary)]">{activeOrigStep.norm.toFixed(3)}</strong>
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-2">
              <span className="text-[var(--text-secondary)] font-semibold text-xs block">
                Perturbed trajectory vector at step {activePertStep.step}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {activePertStep.state.map((val, idx) => (
                  <span
                    key={idx}
                    className="font-mono text-xs px-2 py-1 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] tabular-nums"
                  >
                    z&apos;_{idx}: {val.toFixed(2)}
                  </span>
                ))}
              </div>
              <span className="text-[11px] text-[var(--text-muted)] block tabular-nums">
                Vector Energy ||z&apos;||: <strong className="text-[var(--text-primary)]">{activePertStep.norm.toFixed(3)}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 & 4. INPUT PERTURBATION & REASONING COMPARISON */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
          <div className="p-1.5 rounded-lg bg-[var(--accent-yellow)] text-[var(--accent-yellow-text)]">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-sans text-base font-semibold text-[var(--text-primary)]">
              2. Input Perturbation &amp; Reasoning Divergence
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Inject small perturbations into the initial state to evaluate trajectory stability and attractor dynamics.
            </p>
          </div>
        </div>

        {/* Perturbation slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--text-secondary)]">
              Perturbation Magnitude (<InlineMath math="\delta" />):
            </span>
            <span className="font-mono text-xs font-bold text-[var(--accent-yellow-text)] tabular-nums">
              ±{perturbationMagnitude.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={0.0}
            max={0.5}
            step={0.05}
            value={perturbationMagnitude}
            onChange={(e) => setPerturbationMagnitude(parseFloat(e.target.value))}
            className="w-full accent-[var(--color-warning)] cursor-pointer"
          />
        </div>

        {/* Trajectory Divergence Telemetry */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-1">
            <span className="text-[var(--text-secondary)] font-semibold text-xs block">
              Trajectory cosine similarity
            </span>
            <div className="text-lg font-mono font-bold text-[var(--accent-blue-text)] tabular-nums">
              {(trajectory.finalCosine * 100).toFixed(1)}%
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              Alignment between original and perturbed steady states.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-1">
            <span className="text-[var(--text-secondary)] font-semibold text-xs block">
              Final state vector delta
            </span>
            <div className="text-lg font-mono font-bold text-[var(--text-primary)] tabular-nums">
              ||Δz_K|| = {trajectory.diffNorm.toFixed(3)}
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              Euclidean distance between final latent states.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--accent-blue)] border border-[var(--border)] text-[var(--accent-blue-text)] space-y-1">
            <span className="font-semibold text-xs block">
              Attractor stability
            </span>
            <div className="text-sm font-bold text-[var(--text-primary)]">
              {trajectory.finalCosine > 0.9 ? 'Attractor Converged (Robust)' : 'Trajectory Bifurcated (Sensitive)'}
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              Iterative latent steps act as a regularizing relaxation filter that dampens small input perturbations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { cosine } from '../../models/associativeMemory';
import { InlineMath } from '../ui/MathView';
import { FigureCaption } from '../essay/FigureCaption';

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
    <div className="space-y-8 mt-8">
      {/* 1. LATENT STEP CONTROLLER */}
      <figure className="essay-figure-stage p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[var(--mm-rule)] pb-3">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--mm-signal)] font-semibold block mb-1">
              06.1 · Continuous latent relaxation
            </span>
            <h3 className="font-serif text-lg sm:text-xl font-normal text-[var(--mm-ink)]">
              Vary internal relaxation passes before decoding
            </h3>
            <p className="text-xs text-[var(--mm-muted)] mt-1">
              Adjust K to observe how fixed-point iteration filters small coordinate perturbations.
            </p>
          </div>
          <span className="font-mono text-[11px] text-[var(--mm-muted)]">
            Toy relaxation ODE
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
          <div className="grid grid-cols-1 sm:grid-cols-2 border-y border-[var(--mm-rule)] divide-y sm:divide-y-0 sm:divide-x divide-[var(--mm-rule)] text-xs">
            <div className="py-4 sm:pr-5 space-y-2">
              <span className="text-[var(--text-secondary)] font-semibold text-xs block">
                Original trajectory vector at step {activeOrigStep.step}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {activeOrigStep.state.map((val, idx) => (
                  <span
                    key={idx}
                    className="font-mono text-xs px-2 py-0.5 rounded bg-[var(--mm-paper-bright)] border border-[var(--mm-rule)] text-[var(--text-primary)] tabular-nums"
                  >
                    z_{idx}: {val.toFixed(2)}
                  </span>
                ))}
              </div>
              <span className="text-[11px] text-[var(--text-muted)] block tabular-nums">
                Vector Energy ||z||: <strong className="text-[var(--text-primary)]">{activeOrigStep.norm.toFixed(3)}</strong>
              </span>
            </div>

            <div className="py-4 sm:pl-5 space-y-2">
              <span className="text-[var(--text-secondary)] font-semibold text-xs block">
                Perturbed trajectory vector at step {activePertStep.step}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {activePertStep.state.map((val, idx) => (
                  <span
                    key={idx}
                    className="font-mono text-xs px-2 py-0.5 rounded bg-[var(--mm-paper-bright)] border border-[var(--mm-rule)] text-[var(--text-primary)] tabular-nums"
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
        {/* Perturbation & Trajectory Divergence inside same coherent stage */}
        <div className="pt-4 border-t border-[var(--mm-rule)] space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--mm-ink-soft)]">
              Initial input perturbation (<InlineMath math="\delta" />):
            </span>
            <span className="font-mono text-xs font-bold text-[var(--mm-amber)] tabular-nums">
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
            className="w-full accent-[var(--mm-amber)] cursor-pointer"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[var(--mm-rule)] border border-[var(--mm-rule)] bg-[var(--mm-paper-bright)] rounded-md text-xs">
            <div className="p-3.5 space-y-1">
              <span className="text-[var(--mm-muted)] font-semibold text-xs block">
                Trajectory cosine similarity
              </span>
              <div className="text-lg font-mono font-semibold text-[var(--mm-signal)] tabular-nums">
                {(trajectory.finalCosine * 100).toFixed(1)}%
              </div>
              <p className="text-[11px] text-[var(--mm-muted)]">
                Alignment between unperturbed and perturbed final states.
              </p>
            </div>

            <div className="p-3.5 space-y-1">
              <span className="text-[var(--mm-muted)] font-semibold text-xs block">
                Final state delta
              </span>
              <div className="text-lg font-mono font-semibold text-[var(--mm-ink)] tabular-nums">
                ||Δz_K|| = {trajectory.diffNorm.toFixed(3)}
              </div>
              <p className="text-[11px] text-[var(--mm-muted)]">
                Euclidean distance after {latentSteps} relaxation passes.
              </p>
            </div>

            <div className="p-3.5 space-y-1">
              <span className="text-[var(--mm-signal)] font-semibold text-xs block">
                Attractor convergence
              </span>
              <div className="text-sm font-semibold text-[var(--mm-ink)]">
                {trajectory.finalCosine > 0.9 ? 'Converged (Robust basin)' : 'Diverged (Sensitive)'}
              </div>
              <p className="text-[11px] text-[var(--mm-muted)] leading-relaxed">
                Contractive dynamics dampen initial coordinate jitter over steps.
              </p>
            </div>
          </div>
        </div>

        <FigureCaption
          figure="Fig. 10.2"
          title="Iterative latent passes contract perturbed inputs back toward a shared steady state without emitting intermediate tokens."
          source="Deterministic 6D contractive recurrent map z_{k+1} = tanh(W z_k + 0.5 x)"
        />
      </figure>
    </div>
  );
};

import React, { useState } from 'react';
import { SectionHeader } from './ui/SectionHeader';
import { ControlSlider } from './ui/ControlSlider';
import { calculateInterferenceIndex } from '../utils/metrics';
import { InlineMath } from './ui/MathView';
import { StickyScrollySection, ScrollyStep } from './essay/StickyScrollySection';
import { FigureCaption } from './essay/FigureCaption';
import { DataFallbackTable } from './essay/DataFallbackTable';

export const Section02GrowingContext: React.FC = () => {
  const [seqLength, setSeqLength] = useState<number>(18);
  const [capacityDim, setCapacityDim] = useState<number>(12);
  const [noiseLevel, setNoiseLevel] = useState<number>(10);
  const [activeStep, setActiveStep] = useState<number>(0);

  // Live calculations preserved from original model
  const tokenHistoryKB = seqLength * 128;
  const tokenAccuracy = Math.max(90, 100 - Math.round(noiseLevel * 0.2));
  const recurrentStateBytes = capacityDim * 4;

  const interferenceRatio = calculateInterferenceIndex(seqLength, capacityDim, noiseLevel / 100);
  const capacityRatio = capacityDim / Math.max(1, seqLength);
  const recurrentAccuracy = Math.max(
    8,
    Math.min(98, Math.round(100 * Math.exp(-interferenceRatio * 2.1) * (capacityRatio > 0.5 ? 1 : capacityRatio * 1.4)))
  );

  const isOverloaded = seqLength > capacityDim * 1.3;
  const loadFactor = seqLength / capacityDim;

  const steps: ScrollyStep[] = [
    {
      id: 'subspace-budget',
      label: 'Step 01 · Orthogonality Budget',
      title: 'A D-dimensional space fits at most D orthogonal axes.',
      body: (
        <span>
          In <InlineMath math={`\\mathbb{R}^{${capacityDim}}`} />, at most <strong className="font-mono">{capacityDim}</strong> facts can occupy non-interfering directions. Below that threshold, dot products between distinct keys stay near zero.
        </span>
      ),
    },
    {
      id: 'load-growth',
      label: 'Step 02 · Superposition Pressure',
      title: 'Adding facts pushes vectors into acute angles.',
      body: (
        <span>
          At <strong className="font-mono">T = {seqLength}</strong> facts with <strong className="font-mono">D = {capacityDim}</strong>, the load ratio reaches <strong className="font-mono">{loadFactor.toFixed(2)}×</strong>. Distinct keys can no longer remain orthogonal.
        </span>
      ),
    },
    {
      id: 'noise-perturbation',
      label: 'Step 03 · Interference & Drift',
      title: 'Overlap and channel noise erode retrieval margin.',
      body: (
        <span>
          With {noiseLevel}% distractor noise, estimated recurrent accuracy drops to <strong className="font-mono text-[var(--mm-coral)]">{recurrentAccuracy}%</strong> while KV caching keeps <strong className="font-mono">{tokenAccuracy}%</strong> by storing raw tokens.
        </span>
      ),
    },
  ];

  // Deterministic geometric rays around unit circle showing packing density
  const visibleRays = Math.min(28, seqLength);
  const cx = 135;
  const cy = 125;
  const radius = 92;

  return (
    <section id="section-02" className="scroll-mt-20 border-b border-[var(--mm-rule)] bg-[var(--page-bg)] py-14 sm:py-16">
      <div className="w-full space-y-10">
        <SectionHeader
          number="02"
          category="Growing context"
          title="Comparing the two memory paradigms"
          subtitle="Adjust sequence length T, state dimension D, and distractor noise to observe why fixed-size vectors transition from clean separation to superposition interference."
          discovery={
            <span>
              Unbounded token memory preserves exact addressability at <InlineMath math="\mathcal{O}(T)" /> RAM; bounded state keeps <InlineMath math="\mathcal{O}(1)" /> RAM but suffers vector superposition interference when <InlineMath math="T > D" />.
            </span>
          }
        />

        <StickyScrollySection
          steps={steps}
          activeStep={activeStep}
          onStepChange={(idx) => {
            setActiveStep(idx);
            if (idx === 0) setSeqLength(8);
            if (idx === 1) setSeqLength(24);
            if (idx === 2) setNoiseLevel(25);
          }}
          figure={
            <div className="p-5 sm:p-7 space-y-6">
              {/* Sliders Strip */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pb-5 border-b border-[var(--mm-rule)]">
                <ControlSlider
                  id="section02-seq-slider"
                  label={
                    <span className="flex items-center gap-1">
                      <span>Sequence</span>
                      <InlineMath math="(T)" />
                    </span>
                  }
                  value={seqLength}
                  min={4}
                  max={60}
                  step={2}
                  unit="facts"
                  onChange={(val) => setSeqLength(val)}
                />
                <ControlSlider
                  id="section02-dim-slider"
                  label={
                    <span className="flex items-center gap-1">
                      <span>Dimension</span>
                      <InlineMath math="(D)" />
                    </span>
                  }
                  value={capacityDim}
                  min={4}
                  max={32}
                  step={2}
                  unit="dims"
                  onChange={(val) => setCapacityDim(val)}
                />
                <ControlSlider
                  id="section02-noise-slider"
                  label="Distractor noise"
                  value={noiseLevel}
                  min={0}
                  max={40}
                  step={5}
                  unit="%"
                  onChange={(val) => setNoiseLevel(val)}
                />
              </div>

              {/* Combined Geometric Diagram + Hairline Comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Geometric Ray Packing Visualization */}
                <div className="lg:col-span-5">
                  <svg
                    viewBox="0 0 270 250"
                    className="w-full max-w-[270px] mx-auto h-auto block select-none"
                    role="img"
                    aria-label="Unit hypersphere projection showing vector crowding when T exceeds D"
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={radius}
                      fill="var(--surface-soft)"
                      stroke="var(--mm-rule-strong)"
                      strokeWidth="1"
                    />
                    <line x1={cx - radius} y1={cy} x2={cx + radius} y2={cy} stroke="var(--mm-rule)" strokeDasharray="3 3" />
                    <line x1={cx} y1={cy - radius} x2={cx} y2={cy + radius} stroke="var(--mm-rule)" strokeDasharray="3 3" />

                    {Array.from({ length: visibleRays }).map((_, i) => {
                      // Golden-angle spread perturbed slightly by noiseLevel
                      const jitter = Math.sin(i * 7.13) * (noiseLevel / 100) * 0.35;
                      const angle = (i * 2.39996 + jitter) % (Math.PI * 2);
                      const len = radius * (0.76 + ((i % 3) * 0.08));
                      const x2 = cx + Math.cos(angle) * len;
                      const y2 = cy + Math.sin(angle) * len;
                      const isColliding = i >= capacityDim;
                      return (
                        <g key={i}>
                          <line
                            x1={cx}
                            y1={cy}
                            x2={x2}
                            y2={y2}
                            stroke={isColliding ? 'var(--mm-coral)' : 'var(--mm-signal)'}
                            strokeWidth={isColliding ? 1.5 : 1.8}
                            opacity={isColliding ? 0.85 : 0.9}
                          />
                          <circle
                            cx={x2}
                            cy={y2}
                            r="2.5"
                            fill={isColliding ? 'var(--mm-coral)' : 'var(--mm-signal)'}
                          />
                        </g>
                      );
                    })}

                    <circle cx={cx} cy={cy} r="3.5" fill="var(--text-primary)" />
                    <text x={cx} y="242" textAnchor="middle" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--text-secondary)">
                      Load T/D = {loadFactor.toFixed(2)}× · {isOverloaded ? 'Collision regime' : 'Separable regime'}
                    </text>
                  </svg>
                </div>

                {/* Hairline Tabular Metric Comparison */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="overflow-x-auto">
                    <table className="research-table text-xs sm:text-sm">
                      <thead>
                        <tr>
                          <th>Metric</th>
                          <th>KV Cache O(T)</th>
                          <th>Recurrent State O(1)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="text-[var(--text-secondary)]">Memory footprint</td>
                          <td className="font-mono font-semibold text-[var(--mm-amber)]">
                            {tokenHistoryKB >= 1024 ? `${(tokenHistoryKB / 1024).toFixed(2)} MB` : `${tokenHistoryKB} KB`}
                          </td>
                          <td className="font-mono font-semibold text-[var(--mm-teal)]">
                            {recurrentStateBytes} bytes
                          </td>
                        </tr>
                        <tr>
                          <td className="text-[var(--text-secondary)]">Query accuracy</td>
                          <td className="font-mono font-semibold text-[var(--mm-teal)]">{tokenAccuracy}%</td>
                          <td
                            className={`font-mono font-semibold ${
                              recurrentAccuracy > 70
                                ? 'text-[var(--mm-teal)]'
                                : recurrentAccuracy > 40
                                ? 'text-[var(--mm-amber)]'
                                : 'text-[var(--mm-coral)]'
                            }`}
                          >
                            {recurrentAccuracy}%
                          </td>
                        </tr>
                        <tr>
                          <td className="text-[var(--text-secondary)]">Interference index</td>
                          <td className="font-mono text-[var(--text-muted)]">0% (indexed)</td>
                          <td className={`font-mono font-semibold ${isOverloaded ? 'text-[var(--mm-coral)]' : 'text-[var(--mm-signal)]'}`}>
                            {Math.round(interferenceRatio * 100)}%
                          </td>
                        </tr>
                        <tr>
                          <td className="text-[var(--text-secondary)]">Physical regime</td>
                          <td className="text-xs text-[var(--text-secondary)]">VRAM scales linearly</td>
                          <td className={`text-xs font-medium ${isOverloaded ? 'text-[var(--mm-coral)]' : 'text-[var(--mm-teal)]'}`}>
                            {isOverloaded ? 'Overloaded: older traces collide' : 'Stable orthogonal separation'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Saturation bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                      <span className="text-[var(--text-muted)]">State saturation index (T / D)</span>
                      <span className={isOverloaded ? 'text-[var(--mm-coral)] font-semibold' : 'text-[var(--mm-signal)] font-semibold'}>
                        {Math.min(100, Math.round((seqLength / capacityDim) * 70))}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[var(--surface-soft)] overflow-hidden">
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (seqLength / capacityDim) * 70)}%`,
                          backgroundColor: isOverloaded ? 'var(--mm-coral)' : 'var(--mm-signal)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <FigureCaption
                number="FIG. 1.2"
                title="Geometric packing pressure as facts T exceed latent dimension D."
                description="Blue rays fit within orthogonal budget (i < D); coral rays force overlapping interference."
                legend={[
                  { label: 'Orthogonal axis (i < D)', color: 'var(--mm-signal)' },
                  { label: 'Superposed ray (i ≥ D)', color: 'var(--mm-coral)' },
                ]}
                source="Toy superposition calculation"
              />

              <DataFallbackTable
                caption="Current Paradigm Metrics"
                headers={['Paradigm', 'RAM Cost', 'Load Ratio', 'Estimated Accuracy']}
                rows={[
                  ['Token KV Cache', tokenHistoryKB >= 1024 ? `${(tokenHistoryKB / 1024).toFixed(2)} MB` : `${tokenHistoryKB} KB`, '1.00× (exact)', `${tokenAccuracy}%`],
                  ['Fixed Recurrent State', `${recurrentStateBytes} bytes`, `${loadFactor.toFixed(2)}×`, `${recurrentAccuracy}%`],
                ]}
              />
            </div>
          }
        />
      </div>
    </section>
  );
};

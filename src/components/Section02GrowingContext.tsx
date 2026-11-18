import React, { useState } from 'react';
import { Database, Cpu, AlertTriangle, CheckCircle, Sliders } from 'lucide-react';
import { SectionHeader } from './ui/SectionHeader';
import { ControlSlider } from './ui/ControlSlider';
import { calculateInterferenceIndex } from '../utils/metrics';
import { InlineMath, FormattedMathText } from './ui/MathView';

export const Section02GrowingContext: React.FC = () => {
  const [seqLength, setSeqLength] = useState<number>(18);
  const [capacityDim, setCapacityDim] = useState<number>(12);
  const [noiseLevel, setNoiseLevel] = useState<number>(10);

  // Live calculations
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

  return (
    <section id="section-02" className="scroll-mt-20 border-b border-[var(--border)] bg-[var(--page-bg)] py-12">
      <div className="w-full">
        <SectionHeader
          number="02"
          category="Growing context"
          title="Comparing the two memory paradigms"
          subtitle="Manipulate sequence length, latent dimensionality, and channel noise to observe how state compression behaves compared to unbounded token caching."
          discovery={
            <span>
              Unbounded token memory preserves exact key addressability at the cost of <InlineMath math="\mathcal{O}(T)" /> RAM; bounded state bounds RAM to <InlineMath math="\mathcal{O}(1)" /> but forces vector superposition and interference when <InlineMath math="T > D" />.
            </span>
          }
        />

        {/* 12-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Parameter controls */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <span className="text-xs font-mono text-[var(--accent-blue-text)] font-semibold flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  Laboratory parameters
                </span>
                <span className="text-xs font-mono text-[var(--text-muted)]">Real time</span>
              </div>

              {/* Slider 1: Sequence Length */}
              <ControlSlider
                id="section02-seq-slider"
                label={
                  <span className="flex items-center gap-1">
                    <span>Sequence length</span>
                    <InlineMath math="(T \text{ facts})" />
                  </span>
                }
                value={seqLength}
                min={4}
                max={60}
                step={2}
                unit="facts"
                description="Number of consecutive facts arriving into the stream."
                onChange={(val) => setSeqLength(val)}
              />

              {/* Slider 2: Capacity Dimension */}
              <ControlSlider
                id="section02-dim-slider"
                label={
                  <span className="flex items-center gap-1">
                    <span>Recurrent capacity (Dimension</span>
                    <InlineMath math="D" />)
                  </span>
                }
                value={capacityDim}
                min={4}
                max={32}
                step={2}
                unit="dims"
                description={
                  <span className="flex items-center gap-1">
                    <span>Continuous coordinates in</span>
                    <InlineMath math="h_t" />.
                  </span>
                }
                onChange={(val) => setCapacityDim(val)}
              />

              {/* Slider 3: Noise Level */}
              <ControlSlider
                id="section02-noise-slider"
                label="Distractor noise level"
                value={noiseLevel}
                min={0}
                max={40}
                step={5}
                unit="%"
                description="Uncorrelated background noise perturbing incoming representations."
                onChange={(val) => setNoiseLevel(val)}
              />
            </div>

            {/* Scientific observation note */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-5 text-xs sm:text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
              <div className="font-mono text-xs text-[var(--accent-blue-text)] font-semibold mb-1.5">
                Mathematical rule of orthogonality
              </div>
              In <InlineMath math={`\\mathbb{R}^{${capacityDim}}`} />, at most <strong className="text-[var(--text-primary)] tabular-nums">{capacityDim}</strong> mutually orthogonal vectors can coexist. Once the stream contains <strong className="text-[var(--text-primary)] tabular-nums">{seqLength}</strong> facts, vectors superpose into non-orthogonal angles, reducing retrieval margins.
            </div>
          </div>

          {/* Right Column: Comparative Analysis Matrix */}
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Growing Token History */}
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-[var(--accent-yellow-text)] shrink-0" />
                    <span className="font-serif text-base font-semibold text-[var(--text-primary)]">
                      Growing token history
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[var(--accent-yellow-text)] bg-[var(--accent-yellow)] px-2 py-0.5 rounded-md border border-[var(--color-warning-border)] font-semibold whitespace-nowrap">
                    <InlineMath math="\mathcal{O}(T)" /> cache
                  </span>
                </div>

                <div className="space-y-2.5 text-xs font-sans tabular-nums">
                  <div className="flex justify-between border-b border-[var(--border)] pb-2">
                    <span className="text-[var(--text-secondary)]">Memory footprint</span>
                    <span className="font-mono font-semibold text-[var(--accent-yellow-text)]">
                      {tokenHistoryKB >= 1024 ? `${(tokenHistoryKB / 1024).toFixed(2)} MB` : `${tokenHistoryKB} KB`}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--border)] pb-2">
                    <span className="text-[var(--text-secondary)]">Retained facts</span>
                    <span className="font-mono text-[var(--text-primary)] font-semibold">{seqLength} / {seqLength} intact</span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--border)] pb-2">
                    <span className="text-[var(--text-secondary)]">Query accuracy</span>
                    <span className="font-mono font-semibold text-[var(--accent-green-text)]">{tokenAccuracy}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Addressability</span>
                    <span className="font-mono text-[var(--accent-blue-text)] font-semibold">Exact key index</span>
                  </div>
                </div>

                <div className="rounded-lg bg-[var(--surface-soft)] p-3 border border-[var(--border)] text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
                  <span className="text-[var(--accent-yellow-text)] font-semibold block mb-0.5">Physical barrier</span>
                  Hardware VRAM runs out on long conversations. Cannot operate indefinitely without eviction.
                </div>
              </div>

              {/* Card 2: Fixed Recurrent State */}
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[var(--accent-blue-text)] shrink-0" />
                    <span className="font-serif text-base font-semibold text-[var(--text-primary)]">
                      Recurrent state vector
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[var(--accent-blue-text)] bg-[var(--accent-blue)] px-2 py-0.5 rounded-md border border-[var(--border)] font-semibold whitespace-nowrap">
                    <InlineMath math="\mathcal{O}(1)" /> fixed
                  </span>
                </div>

                <div className="space-y-2.5 text-xs font-sans tabular-nums">
                  <div className="flex justify-between border-b border-[var(--border)] pb-2">
                    <span className="text-[var(--text-secondary)]">Memory footprint</span>
                    <span className="font-mono font-semibold text-[var(--accent-green-text)]">
                      {recurrentStateBytes} bytes
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--border)] pb-2">
                    <span className="text-[var(--text-secondary)]">
                      Input load ratio (<InlineMath math="T/D" />)
                    </span>
                    <span className={`font-mono font-semibold ${isOverloaded ? 'text-[var(--accent-pink-text)]' : 'text-[var(--accent-blue-text)]'}`}>
                      {(seqLength / capacityDim).toFixed(2)}×
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--border)] pb-2">
                    <span className="text-[var(--text-secondary)]">Query accuracy</span>
                    <span
                      className={`font-mono font-semibold ${
                        recurrentAccuracy > 70
                          ? 'text-[var(--accent-green-text)]'
                          : recurrentAccuracy > 40
                          ? 'text-[var(--accent-yellow-text)]'
                          : 'text-[var(--accent-pink-text)]'
                      }`}
                    >
                      {recurrentAccuracy}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Interference level</span>
                    <span className="font-mono text-[var(--accent-blue-text)] font-semibold">
                      {Math.round(interferenceRatio * 100)}%
                    </span>
                  </div>
                </div>

                <div
                  className={`rounded-lg p-3 border text-xs font-sans leading-relaxed ${
                    isOverloaded
                      ? 'bg-[var(--accent-pink)] border-[var(--color-danger-border)] text-[var(--accent-pink-text)]'
                      : 'bg-[var(--surface-soft)] border-[var(--border)] text-[var(--text-secondary)]'
                  }`}
                >
                  {isOverloaded ? (
                    <span>
                      <strong className="text-[var(--accent-pink-text)]">Interference active:</strong> Stream length ({seqLength}) exceeds dimension capacity ({capacityDim}). Superposition is decaying older traces.
                    </span>
                  ) : (
                    <span>
                      <strong className="text-[var(--accent-green-text)]">Stable compression:</strong> Stream length is within dimensional capacity ({capacityDim}); representations remain separable.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Capacity vs Interference Gauge */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                <span className="text-[var(--text-secondary)] font-semibold">State saturation index</span>
                <span className={isOverloaded ? 'text-[var(--accent-pink-text)] font-semibold' : 'text-[var(--accent-blue-text)] font-semibold'}>
                  {Math.min(100, Math.round((seqLength / capacityDim) * 70))}% saturation
                </span>
              </div>
              <div className="h-2 w-full bg-[var(--surface-soft)] rounded-full overflow-hidden border border-[var(--border)]">
                <div
                  className={`h-full transition-all duration-300 ${
                    isOverloaded ? 'bg-[var(--color-danger)]' : 'bg-[var(--color-accent)]'
                  }`}
                  style={{ width: `${Math.min(100, (seqLength / capacityDim) * 70)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


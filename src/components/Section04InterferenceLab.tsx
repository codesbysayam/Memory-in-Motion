import React, { useState, useMemo } from 'react';
import {
  AlertOctagon,
  CheckCircle,
  BarChart2,
  TrendingDown,
  Layers,
  HelpCircle,
  Sliders,
  Database,
  ArrowRight,
  Clock,
  Grid,
  ArrowLeftRight,
  Scissors,
} from 'lucide-react';
import { CANONICAL_FACTS, Fact } from '../models/associativeMemory';
import {
  runMemoryExperiment,
  runCapacityExperiment,
  runDistractorExperiment,
  CapacityDataPoint,
} from '../models/experimentEngine';
import { SectionHeader } from './ui/SectionHeader';
import { SourceBadge } from './ui/SourceBadge';
import { ControlSlider } from './ui/ControlSlider';
import { TruthModelComparison } from './TruthModelComparison';
import { CapacityExperiment } from './CapacityExperiment';
import { ScientificHonestyPanel } from './ScientificHonestyPanel';
import { MemoryDecayExperiment } from './MemoryDecayExperiment';
import { InterferenceMap } from './InterferenceMap';
import { MemoryABComparison } from './MemoryABComparison';
import { EvidenceStrip } from './ui/EvidenceStrip';
import { MemoryWriteRead } from './MemoryWriteRead';
import { MemorySurgery } from './MemorySurgery';

export const Section04InterferenceLab: React.FC = () => {
  const [activeExperiment, setActiveExperiment] = useState<
    'pipeline' | 'collision' | 'capacity' | 'distraction' | 'decay' | 'sweep' | 'ab_compare' | 'surgery'
  >('collision');

  // Parameters for "WHEN MEMORY COLLIDES"
  const [dim, setDim] = useState<number>(8);
  const [sequenceLength, setSequenceLength] = useState<number>(7);
  const [retentionPct, setRetentionPct] = useState<number>(85);
  const [interferencePct, setInterferencePct] = useState<number>(20);
  const [queryTarget] = useState<string>('Japan');

  // Compute fact sequence for Collision Experiment
  const collisionFacts = useMemo(() => {
    const list = CANONICAL_FACTS.slice(0, sequenceLength);
    // Ensure Japan is at position 1 or 2
    if (!list.some((f) => f.key === 'Japan')) {
      list.splice(1, 0, { key: 'Japan', value: 'Tokyo', category: 'Asia' });
    }
    return list.slice(0, sequenceLength);
  }, [sequenceLength]);

  const effectiveRetention = useMemo(() => {
    return Math.max(0.1, (retentionPct / 100) * (1 - (interferencePct / 100) * 0.4));
  }, [retentionPct, interferencePct]);

  // Main experiment run
  const collisionResult = useMemo(() => {
    return runMemoryExperiment(collisionFacts, queryTarget, dim, effectiveRetention, 0.8);
  }, [collisionFacts, queryTarget, dim, effectiveRetention]);

  // Live Curve: Sequence length (2 to 14) -> retrieval accuracy & confidence
  const liveCurveData = useMemo(() => {
    const curvePoints: { length: number; confidence: number; correct: boolean; prediction: string }[] = [];
    for (let l = 2; l <= Math.min(14, CANONICAL_FACTS.length); l++) {
      const slice = CANONICAL_FACTS.slice(0, l);
      if (!slice.some((f) => f.key === 'Japan')) {
        slice.splice(1, 0, { key: 'Japan', value: 'Tokyo', category: 'Asia' });
      }
      const active = slice.slice(0, l);
      const res = runMemoryExperiment(active, 'Japan', dim, effectiveRetention, 0.8);
      curvePoints.push({
        length: l,
        confidence: res.confidence,
        correct: res.correct,
        prediction: res.prediction,
      });
    }
    return curvePoints;
  }, [dim, effectiveRetention]);

  // Controlled Capacity Experiment Data
  const capacityData = useMemo(() => {
    return runCapacityExperiment(CANONICAL_FACTS, [4, 8, 16, 32], [3, 5, 8, 12, 15], 0.92, 0.8);
  }, []);

  const [selectedCapacityPoint, setSelectedCapacityPoint] = useState<CapacityDataPoint | null>(null);

  // Distractor Experiment Data
  const [distractorNum, setDistractorNum] = useState<number>(6);
  const [distractorRetention, setDistractorRetention] = useState<number>(85);
  const [distractorDim, setDistractorDim] = useState<number>(8);

  const distractorResult = useMemo(() => {
    const target: Fact = { key: 'France', value: 'Paris', category: 'Europe' };
    const distractors: Fact[] = CANONICAL_FACTS.filter((f) => f.key !== 'France').slice(0, distractorNum);
    return runDistractorExperiment(
      target,
      distractors,
      distractorDim,
      distractorRetention / 100,
      0.8
    );
  }, [distractorNum, distractorRetention, distractorDim]);

  // Dynamic Failure Explanations
  const failureExplanation = useMemo(() => {
    if (collisionResult.correct) {
      return null;
    }
    if (effectiveRetention < 0.7) {
      return 'In this educational model, retention was too low; earlier information decayed below retrieval threshold before query.';
    }
    if (sequenceLength > dim * 0.9) {
      return 'In this educational model, the sequence exceeded the effective capacity of this toy state (sequence length > dimension bound).';
    }
    if (interferencePct > 25) {
      return 'In this educational model, interference caused the query representation to retrieve a competing value due to high perturbation noise.';
    }
    return 'In this educational model, state compression increased overlap between stored representations, creating geometric crosstalk.';
  }, [collisionResult.correct, effectiveRetention, sequenceLength, dim, interferencePct]);

  return (
    <section id="section-04" className="scroll-mt-20 border-b border-[#252A35] bg-[#07080B] py-14">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 space-y-8">
        <SectionHeader
          number="04"
          category="WHEN MEMORY COLLIDES"
          title="Interference, Capacity Limits & Forgetting"
          subtitle="Explore the fundamental trade-off: fixed-size representations eliminate token-by-token KV cache expansion, but packing continuous information inevitably creates interference."
          discovery="As more information is compressed into the same fixed state, representations overlap or decay. Observed in this educational toy model."
        />

        {/* Epistemic Evidence Classification */}
        <div className="flex flex-wrap items-center gap-3">
          <EvidenceStrip
            type="live"
            detail="Interactive vector projection & superposition simulation"
          />
          <EvidenceStrip
            type="published"
            detail="Information capacity scaling O(D) under linear superposition"
          />
        </div>

        {/* Experiment Tab Selector */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#252A35] pb-3 text-xs font-mono">
          <button
            onClick={() => setActiveExperiment('pipeline')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
              activeExperiment === 'pipeline'
                ? 'border-cyan-400 bg-cyan-950/50 text-cyan-300 font-bold ring-1 ring-cyan-400'
                : 'border-[#252A35] bg-[#11141A] text-[#8F96A3] hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>0. WRITE / READ PIPELINE</span>
          </button>

          <button
            onClick={() => setActiveExperiment('collision')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
              activeExperiment === 'collision'
                ? 'border-[#22D3EE] bg-cyan-950/50 text-[#22D3EE] font-bold ring-1 ring-[#22D3EE]'
                : 'border-[#252A35] bg-[#11141A] text-[#8F96A3] hover:text-white'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            <span>1. WHEN MEMORY COLLIDES</span>
          </button>

          <button
            onClick={() => setActiveExperiment('capacity')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
              activeExperiment === 'capacity'
                ? 'border-violet-500 bg-violet-950/50 text-violet-300 font-bold ring-1 ring-violet-500'
                : 'border-[#252A35] bg-[#11141A] text-[#8F96A3] hover:text-white'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>2. HOW MUCH CAN THE STATE HOLD?</span>
          </button>

          <button
            onClick={() => setActiveExperiment('distraction')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
              activeExperiment === 'distraction'
                ? 'border-amber-500 bg-amber-950/50 text-amber-300 font-bold ring-1 ring-amber-500'
                : 'border-[#252A35] bg-[#11141A] text-[#8F96A3] hover:text-white'
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            <span>3. CAN MEMORY SURVIVE DISTRACTION?</span>
          </button>

          <button
            onClick={() => setActiveExperiment('decay')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
              activeExperiment === 'decay'
                ? 'border-rose-500 bg-rose-950/50 text-rose-300 font-bold ring-1 ring-rose-500'
                : 'border-[#252A35] bg-[#11141A] text-[#8F96A3] hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>4. DECAY & FORGETTING RATE</span>
          </button>

          <button
            onClick={() => setActiveExperiment('sweep')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
              activeExperiment === 'sweep'
                ? 'border-emerald-500 bg-emerald-950/50 text-emerald-300 font-bold ring-1 ring-emerald-500'
                : 'border-[#252A35] bg-[#11141A] text-[#8F96A3] hover:text-white'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>5. INTERFERENCE 2D SWEEP MAP</span>
          </button>

          <button
            onClick={() => setActiveExperiment('ab_compare')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
              activeExperiment === 'ab_compare'
                ? 'border-indigo-500 bg-indigo-950/50 text-indigo-300 font-bold ring-1 ring-indigo-500'
                : 'border-[#252A35] bg-[#11141A] text-[#8F96A3] hover:text-white'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>6. KV-CACHE VS RECURRENT A/B</span>
          </button>

          <button
            onClick={() => setActiveExperiment('surgery')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
              activeExperiment === 'surgery'
                ? 'border-rose-400 bg-rose-950/50 text-rose-300 font-bold ring-1 ring-rose-400'
                : 'border-[#252A35] bg-[#11141A] text-[#8F96A3] hover:text-white'
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span>7. MEMORY SURGERY (COUNTERFACTUAL)</span>
          </button>
        </div>

        {/* EXPERIMENT 0: WRITE / READ PIPELINE INSPECTOR */}
        {activeExperiment === 'pipeline' && (
          <div className="space-y-4">
            <MemoryWriteRead
              dimension={dim}
              retention={effectiveRetention}
              writeStrength={0.8}
            />
          </div>
        )}

        {/* EXPERIMENT 1: WHEN MEMORY COLLIDES */}
        {activeExperiment === 'collision' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Col (5 cols): Procedure & Controls */}
            <div className="lg:col-span-5 space-y-4 font-mono text-xs">
              <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#252A35] pb-2">
                  <span className="font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#22D3EE]" />
                    COLLISION PROCEDURE
                  </span>
                  <SourceBadge type="toy" />
                </div>

                {/* 5-Step Scientific Procedure Box */}
                <div className="rounded-lg bg-[#151922] p-3 text-[11px] text-[#8F96A3] space-y-1 border border-[#252A35]">
                  <div className="text-white font-semibold mb-1">EXPERIMENTAL PROTOCOL:</div>
                  <div>1. Learn fact A ("Japan → Tokyo").</div>
                  <div>2. Learn {sequenceLength - 1} unrelated country-capital pairs.</div>
                  <div>3. Query fact A ("Japan") again.</div>
                  <div>4. Increase sequence length or interference.</div>
                  <div>5. Observe retrieval accuracy and output flip.</div>
                </div>

                {/* Dimension selector */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#8F96A3]">State Dimension (D):</span>
                    <span className="text-[#22D3EE] font-bold">{dim}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[4, 8, 16, 32].map((d) => (
                      <button
                        key={d}
                        onClick={() => setDim(d)}
                        className={`py-1.5 rounded border text-center transition-all ${
                          dim === d
                            ? 'border-[#22D3EE] bg-cyan-950/60 text-[#22D3EE] font-bold ring-1 ring-[#22D3EE]'
                            : 'border-[#252A35] bg-[#151922] text-[#8F96A3] hover:text-white'
                        }`}
                      >
                        D={d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sequence Length */}
                <ControlSlider
                  label="Sequence Length"
                  value={sequenceLength}
                  min={2}
                  max={12}
                  step={1}
                  unit=" facts"
                  onChange={setSequenceLength}
                  description="Total facts packed into state before testing Japan."
                />

                {/* Retention */}
                <ControlSlider
                  label="Retention (λ)"
                  value={retentionPct}
                  min={20}
                  max={100}
                  step={5}
                  unit="%"
                  onChange={setRetentionPct}
                  description="Memory decay coefficient per step."
                />

                {/* Interference */}
                <ControlSlider
                  label="Interference Perturbation"
                  value={interferencePct}
                  min={0}
                  max={60}
                  step={5}
                  unit="%"
                  onChange={setInterferencePct}
                  description="Crosstalk noise between superimposed vectors."
                />

                {/* Experiment Metadata Strip */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#252A35] text-[10px] text-center">
                  <div className="bg-[#151922] p-1.5 rounded border border-[#252A35]">
                    <span className="text-[#8F96A3] block">CAPACITY</span>
                    <strong className="text-white">D={dim}</strong>
                  </div>
                  <div className="bg-[#151922] p-1.5 rounded border border-[#252A35]">
                    <span className="text-[#8F96A3] block">RETENTION</span>
                    <strong className="text-white">{retentionPct}%</strong>
                  </div>
                  <div className="bg-[#151922] p-1.5 rounded border border-[#252A35]">
                    <span className="text-[#8F96A3] block">INTERFERENCE</span>
                    <strong className="text-white">{interferencePct}%</strong>
                  </div>
                  <div className="bg-[#151922] p-1.5 rounded border border-[#252A35]">
                    <span className="text-[#8F96A3] block">ACCURACY</span>
                    <strong className={collisionResult.correct ? 'text-emerald-400' : 'text-rose-400'}>
                      {collisionResult.correct ? '100%' : '0%'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Automatic Failure Explanation */}
              {failureExplanation && (
                <div className="rounded-xl border border-rose-500/50 bg-rose-950/30 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                    <AlertOctagon className="w-4 h-4" />
                    <span>FAILURE EXPLANATION</span>
                  </div>
                  <p className="text-[11px] text-rose-200/90 leading-relaxed">
                    {failureExplanation}
                  </p>
                  <span className="text-[10px] text-rose-400 font-mono block">
                    Observed in this educational toy model.
                  </span>
                </div>
              )}
            </div>

            {/* Right Col (7 cols): Result & Live Curve */}
            <div className="lg:col-span-7 space-y-5">
              {/* Truth Comparison */}
              <TruthModelComparison
                truth="Tokyo"
                prediction={collisionResult.prediction}
                confidence={collisionResult.confidence}
              />

              {/* Live Curve: Sequence Length -> Retrieval Accuracy */}
              <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-5 space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-[#252A35] pb-2">
                  <span className="font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingDown className="w-4 h-4 text-[#22D3EE]" />
                    LIVE CURVE: SEQUENCE LENGTH → RETRIEVAL ACCURACY
                  </span>
                  <span className="text-[10px] text-zinc-400">Target: "Japan"</span>
                </div>

                {/* Graph Bars */}
                <div className="space-y-2">
                  {liveCurveData.map((pt) => {
                    const isSelected = pt.length === sequenceLength;
                    const pct = Math.round(pt.confidence * 100);

                    return (
                      <div
                        key={pt.length}
                        onClick={() => setSequenceLength(pt.length)}
                        className={`p-2 rounded border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#22D3EE] bg-cyan-950/40 ring-1 ring-[#22D3EE]'
                            : 'border-[#252A35] bg-[#151922] hover:bg-[#1A202C]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-semibold text-white">
                            Length = {pt.length} facts{' '}
                            {isSelected && <span className="text-[#22D3EE] text-[9px]">(Current)</span>}
                          </span>
                          <span className="flex items-center gap-2">
                            <span className={pt.correct ? 'text-emerald-400' : 'text-rose-400'}>
                              → {pt.prediction}
                            </span>
                            <span className="text-zinc-400">({pct}%)</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded ${
                                pt.correct ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                              }`}
                            >
                              {pt.correct ? 'CORRECT' : 'COLLISION'}
                            </span>
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-[#07080B] h-1.5 rounded-full overflow-hidden border border-[#252A35]">
                          <div
                            className={`h-full transition-all ${
                              pt.correct ? 'bg-emerald-400' : 'bg-rose-400'
                            }`}
                            style={{ width: `${Math.max(5, pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Scientific Disclaimer Note */}
                <div className="p-3 rounded bg-[#07080B] border border-[#252A35] text-[10px] text-[#8F96A3] space-y-1">
                  <span className="text-white font-semibold block">EDUCATIONAL MODEL PRINCIPLE:</span>
                  <p>
                    A fixed-size state must compress information. As more information is packed into the same state, representations can overlap or decay. This creates interference and forgetting.
                  </p>
                  <span className="text-cyan-400 italic">Observed in this educational toy model.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EXPERIMENT 2: HOW MUCH CAN THE STATE HOLD? */}
        {activeExperiment === 'capacity' && (
          <div className="space-y-6 font-mono text-xs">
            <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#252A35] pb-3">
                <div>
                  <h4 className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-1.5">
                    <BarChart2 className="w-4 h-4 text-violet-400" />
                    CONTROLLED CAPACITY EXPERIMENT: D = 4, 8, 16, 32
                  </h4>
                  <p className="text-[11px] text-[#8F96A3] mt-0.5">
                    Click any data point to inspect the corresponding memory state and factual retrieval breakdown.
                  </p>
                </div>
                <SourceBadge type="toy" />
              </div>

              {/* Data Points Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[4, 8, 16, 32].map((dimVal) => {
                  const pointsForDim = capacityData.filter((d) => d.dim === dimVal);

                  return (
                    <div
                      key={dimVal}
                      className="rounded-xl border border-[#252A35] bg-[#151922] p-3 space-y-2.5"
                    >
                      <div className="flex justify-between items-center text-xs border-b border-[#252A35] pb-1.5">
                        <span className="text-white font-bold text-sm text-[#22D3EE]">
                          Dimension D={dimVal}
                        </span>
                        <span className="text-[10px] text-[#8F96A3]">
                          Limit ≈ {Math.round(dimVal * 0.75)} facts
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {pointsForDim.map((pt) => {
                          const isSelected =
                            selectedCapacityPoint?.dim === pt.dim &&
                            selectedCapacityPoint?.factCount === pt.factCount;

                          return (
                            <button
                              key={pt.factCount}
                              onClick={() => setSelectedCapacityPoint(pt)}
                              className={`w-full text-left p-2 rounded border transition-all text-[11px] ${
                                isSelected
                                  ? 'border-violet-400 bg-violet-950/60 ring-1 ring-violet-400 text-white'
                                  : 'border-[#252A35] bg-[#11141A] text-[#8F96A3] hover:text-white'
                              }`}
                            >
                              <div className="flex justify-between mb-1">
                                <span className="font-semibold text-white">
                                  {pt.factCount} facts:
                                </span>
                                <span
                                  className={
                                    pt.accuracy > 70
                                      ? 'text-emerald-400 font-bold'
                                      : pt.accuracy > 40
                                      ? 'text-amber-400 font-bold'
                                      : 'text-rose-400 font-bold'
                                  }
                                >
                                  {pt.accuracy}% acc
                                </span>
                              </div>

                              <div className="w-full bg-[#07080B] h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    pt.accuracy > 70
                                      ? 'bg-emerald-400'
                                      : pt.accuracy > 40
                                      ? 'bg-amber-400'
                                      : 'bg-rose-400'
                                  }`}
                                  style={{ width: `${pt.accuracy}%` }}
                                />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Inspector for Selected Data Point */}
              {selectedCapacityPoint ? (
                <div className="rounded-xl border border-[#252A35] bg-[#151922] p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#252A35] pb-2">
                    <span className="font-bold text-white text-xs uppercase flex items-center gap-2">
                      <Database className="w-3.5 h-3.5 text-[#22D3EE]" />
                      INSPECTING STATE: D={selectedCapacityPoint.dim}, {selectedCapacityPoint.factCount} FACTS
                    </span>
                    <span className="text-[11px] text-emerald-300">
                      Accuracy: {selectedCapacityPoint.accuracy}% ({selectedCapacityPoint.correctCount}/{selectedCapacityPoint.factCount} correct)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="bg-[#11141A] p-2 rounded border border-[#252A35]">
                      <span className="text-[#8F96A3] block text-[10px]">COLLISIONS:</span>
                      <strong className="text-rose-400">{selectedCapacityPoint.collisions}</strong>
                    </div>
                    <div className="bg-[#11141A] p-2 rounded border border-[#252A35]">
                      <span className="text-[#8F96A3] block text-[10px]">MATRIX L2 NORM:</span>
                      <strong className="text-white">{selectedCapacityPoint.finalMatrixNorm}</strong>
                    </div>
                    <div className="bg-[#11141A] p-2 rounded border border-[#252A35]">
                      <span className="text-[#8F96A3] block text-[10px]">STORAGE FOOTPRINT:</span>
                      <strong className="text-cyan-300">{selectedCapacityPoint.dim * selectedCapacityPoint.dim * 4} Bytes (Fixed)</strong>
                    </div>
                    <div className="bg-[#11141A] p-2 rounded border border-[#252A35]">
                      <span className="text-[#8F96A3] block text-[10px]">TRANSFORMER KV EQUIV:</span>
                      <strong className="text-amber-300">{selectedCapacityPoint.factCount * 64} Bytes (Growing)</strong>
                    </div>
                  </div>

                  {/* Fact by Fact Decoded Table */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[#8F96A3] text-[10px] uppercase block">
                      INDIVIDUAL FACT RETRIEVALS:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                      {selectedCapacityPoint.samplePredictions.map((sp) => (
                        <div
                          key={sp.query}
                          className={`p-1.5 rounded border text-[10px] flex items-center justify-between ${
                            sp.correct
                              ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-200'
                              : 'border-rose-500/30 bg-rose-950/20 text-rose-200'
                          }`}
                        >
                          <span>{sp.query} → {sp.prediction}</span>
                          <span>{sp.correct ? '✓' : '✗'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#151922] border border-[#252A35] text-center text-[#8F96A3] text-xs">
                  Click any data point above to inspect the exact memory state and decoded queries.
                </div>
              )}

              {/* Full Interactive Capacity Sweep Benchmark */}
              <div className="pt-4">
                <CapacityExperiment />
              </div>
            </div>
          </div>
        )}

        {/* EXPERIMENT 3: CAN MEMORY SURVIVE DISTRACTION? */}
        {activeExperiment === 'distraction' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start font-mono text-xs">
            {/* Controls (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#252A35] pb-2">
                  <span className="font-semibold text-white uppercase tracking-wider">
                    DISTRACTION CONTROLS
                  </span>
                  <SourceBadge type="toy" />
                </div>

                <ControlSlider
                  label="Intervening Distractor Facts"
                  value={distractorNum}
                  min={1}
                  max={12}
                  step={1}
                  unit=" facts"
                  onChange={setDistractorNum}
                  description="Number of unrelated facts loaded between France and retrieval."
                />

                <ControlSlider
                  label="Retention (λ)"
                  value={distractorRetention}
                  min={40}
                  max={100}
                  step={5}
                  unit="%"
                  onChange={setDistractorRetention}
                  description="State preservation rate per intervening step."
                />

                <div className="space-y-1.5">
                  <label className="text-[11px] text-[#8F96A3] block">State Dimension:</label>
                  <div className="grid grid-cols-3 gap-1">
                    {[8, 16, 32].map((d) => (
                      <button
                        key={d}
                        onClick={() => setDistractorDim(d)}
                        className={`py-1 rounded border text-center ${
                          distractorDim === d
                            ? 'border-[#22D3EE] bg-cyan-950/60 text-[#22D3EE] font-bold'
                            : 'border-[#252A35] bg-[#151922] text-[#8F96A3]'
                        }`}
                      >
                        D={d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic Educational Cause */}
              <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-4 text-[11px] text-zinc-300 space-y-2">
                <span className="text-[#22D3EE] font-semibold block uppercase">
                  WHY DID THIS HAPPEN?
                </span>
                <p className="text-[#8F96A3] leading-relaxed">
                  {distractorResult.decayExplanation}
                </p>
                <span className="text-[10px] text-zinc-500 italic block">
                  Observed in this educational toy model.
                </span>
              </div>
            </div>

            {/* Results Timeline (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Before Distraction */}
                <div className="rounded-xl border border-emerald-500/40 bg-[#11141A] p-4 space-y-3">
                  <div className="flex justify-between items-center text-[11px] border-b border-[#252A35] pb-1.5">
                    <span className="text-emerald-400 font-bold uppercase">1. BEFORE DISTRACTION</span>
                    <span className="text-zinc-400">t = 1</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="text-zinc-400">Target Ingestion: <strong className="text-white">France → Paris</strong></div>
                    <div className="text-zinc-400">Query: <strong className="text-white">France</strong></div>
                    <div className="text-zinc-400">Decoded: <strong className="text-emerald-300">{distractorResult.beforeDistraction.prediction}</strong></div>
                    <div className="text-zinc-400">Retrieval Score: <strong className="text-cyan-300" title="This score is based on representation similarity and is not a calibrated probability.">{Math.round(distractorResult.beforeDistraction.confidence * 100)}%</strong></div>
                    <div className="text-zinc-400">Matrix Norm: <strong className="text-white">{distractorResult.matrixNormBefore}</strong></div>
                  </div>
                  <div className="p-2 rounded bg-emerald-950/40 text-emerald-300 text-center font-bold text-xs">
                    ✓ CORRECT RETRIEVAL
                  </div>
                </div>

                {/* After Distraction */}
                <div className={`rounded-xl border p-4 space-y-3 bg-[#11141A] ${
                  distractorResult.afterDistraction.correct ? 'border-emerald-500/40' : 'border-rose-500/40'
                }`}>
                  <div className="flex justify-between items-center text-[11px] border-b border-[#252A35] pb-1.5">
                    <span className={`font-bold uppercase ${
                      distractorResult.afterDistraction.correct ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      2. AFTER {distractorNum} DISTRACTORS
                    </span>
                    <span className="text-zinc-400">t = {distractorResult.totalSteps}</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="text-zinc-400">Distractors Ingested: <strong className="text-white">{distractorNum} facts</strong></div>
                    <div className="text-zinc-400">Query: <strong className="text-white">France</strong></div>
                    <div className="text-zinc-400">Decoded: <strong className={distractorResult.afterDistraction.correct ? 'text-emerald-300' : 'text-rose-400'}>
                      {distractorResult.afterDistraction.prediction}
                    </strong></div>
                    <div className="text-zinc-400">Retrieval Score: <strong className="text-cyan-300" title="This score is based on representation similarity and is not a calibrated probability.">{Math.round(distractorResult.afterDistraction.confidence * 100)}%</strong></div>
                    <div className="text-zinc-400">Matrix Norm: <strong className="text-white">{distractorResult.matrixNormAfter}</strong></div>
                  </div>
                  <div className={`p-2 rounded text-center font-bold text-xs ${
                    distractorResult.afterDistraction.correct
                      ? 'bg-emerald-950/40 text-emerald-300'
                      : 'bg-rose-950/40 text-rose-300'
                  }`}>
                    {distractorResult.afterDistraction.correct ? '✓ SURVIVED DISTRACTION' : '✗ OVERWRITTEN / DECAYED'}
                  </div>
                </div>
              </div>

              {/* State Timeline Flow */}
              <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-4 space-y-2">
                <span className="text-white font-semibold text-xs uppercase block">
                  CHRONOLOGICAL STATE TIMELINE
                </span>
                <div className="flex items-center gap-2 overflow-x-auto p-2 bg-[#07080B] rounded border border-[#252A35] text-[11px]">
                  <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-center shrink-0">
                    <div className="font-bold">t0: Target Fact</div>
                    <div className="text-[10px]">France → Paris</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-600 shrink-0" />
                  <div className="p-2 rounded bg-[#151922] border border-[#252A35] text-[#8F96A3] text-center shrink-0">
                    <div className="font-bold text-white">t1..t{distractorNum}: Distractors</div>
                    <div className="text-[10px]">{distractorNum} unrelated bindings</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-600 shrink-0" />
                  <div className={`p-2 rounded border text-center shrink-0 ${
                    distractorResult.afterDistraction.correct
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                  }`}>
                    <div className="font-bold">t_final: Probe</div>
                    <div className="text-[10px]">"France" → {distractorResult.afterDistraction.prediction}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EXPERIMENT 4: DECAY & FORGETTING FACTOR */}
        {activeExperiment === 'decay' && <MemoryDecayExperiment />}

        {/* EXPERIMENT 5: INTERFERENCE 2D PHASE BOUNDARY */}
        {activeExperiment === 'sweep' && <InterferenceMap />}

        {/* EXPERIMENT 6: TRANSFORMER KV CACHE VS RECURRENT A/B COMPARISON */}
        {activeExperiment === 'ab_compare' && <MemoryABComparison />}

        {/* EXPERIMENT 7: MEMORY SURGERY (CONTROLLED COUNTERFACTUAL) */}
        {activeExperiment === 'surgery' && <MemorySurgery />}

        {/* Scientific Evidence & Honesty Panel */}
        <div className="pt-6">
          <ScientificHonestyPanel />
        </div>
      </div>
    </section>
  );
};

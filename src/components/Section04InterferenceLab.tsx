import React, { useState, useMemo, useCallback } from 'react';
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
  RotateCcw,
  Sparkles,
  BookOpen,
  Activity,
  Info,
  Maximize2,
  Hash,
} from 'lucide-react';
import {
  InterferenceConfig,
  ExperimentResult,
  DEFAULT_INTERFERENCE_CONFIG,
  runInterferenceExperiment,
  runSequenceSweep,
  runInterferenceSweep,
  runDecayExperiment,
  runMemorySurgery,
  generateExperimentId,
  generateFacts,
} from '../models/interferenceLabEngine';
import { CANONICAL_FACTS } from '../models/associativeMemory';
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
import { StateInspector } from './StateInspector';
import { ExperimentNotebook, NotebookEntry } from './ExperimentNotebook';
import { InlineMath } from './ui/MathView';

export const Section04InterferenceLab: React.FC = () => {
  const [activeExperiment, setActiveExperiment] = useState<
    'pipeline' | 'collision' | 'capacity' | 'distraction' | 'decay' | 'sweep' | 'ab_compare' | 'surgery'
  >('collision');

  // ==================================================
  // 1. ONE SHARED EXPERIMENT STATE (Source of Truth)
  // ==================================================
  const [config, setConfig] = useState<InterferenceConfig>({ ...DEFAULT_INTERFERENCE_CONFIG });

  // Notebook Entries
  const [notebookEntries, setNotebookEntries] = useState<NotebookEntry[]>([
    {
      id: 'entry-init',
      timestamp: '22:45:00',
      type: 'run',
      title: 'Lab Initialized (MEM-D08-R085-L07-I20-S42)',
      detail: 'Default parameters loaded: Dimension 8, 7 facts packed, 85% retention, 20% interference perturbation.',
      tags: ['Baseline', 'Collision'],
    },
  ]);

  // Selected cell state for 2D sweep inside lab
  const [selectedSweepCell, setSelectedSweepCell] = useState<{ length: number; interference: number } | null>(null);

  // Inspector matrix cell hover/click
  const [selectedMatrixCell, setSelectedMatrixCell] = useState<{ r: number; c: number; val: number } | null>(null);

  // Primary Run: deterministic computation using runInterferenceExperiment
  const experimentResult: ExperimentResult = useMemo(() => {
    return runInterferenceExperiment(config);
  }, [config]);

  // Reproducible Experiment ID
  const experimentId = useMemo(() => {
    return generateExperimentId(config);
  }, [config]);

  // Live Curve across sequence lengths 2 to 14
  const liveCurveData = useMemo(() => {
    return runSequenceSweep(config, 2, 14);
  }, [config]);

  // Presets definition
  const presets: { id: string; label: string; desc: string; cfg: Partial<InterferenceConfig> }[] = [
    {
      id: 'baseline',
      label: 'BASELINE (COLLISION)',
      desc: 'D=8, 7 facts, 85% retention, 20% interference — demonstrates state collision.',
      cfg: { dimension: 8, sequenceLength: 7, retention: 0.85, interference: 0.20, seed: 42 },
    },
    {
      id: 'low_capacity',
      label: 'LOW CAPACITY (D=4)',
      desc: 'D=4 state saturation with 5 facts — severe dimensional bottleneck.',
      cfg: { dimension: 4, sequenceLength: 5, retention: 0.90, interference: 0.10, seed: 42 },
    },
    {
      id: 'high_interference',
      label: 'HIGH INTERFERENCE',
      desc: 'D=8 with 45% crosstalk perturbation — vector drift induces misclassification.',
      cfg: { dimension: 8, sequenceLength: 6, retention: 0.90, interference: 0.45, seed: 42 },
    },
    {
      id: 'high_retention',
      label: 'HIGH CAPACITY (D=32)',
      desc: 'D=32 with 98% retention — orthogonal capacity preserves all associations.',
      cfg: { dimension: 32, sequenceLength: 10, retention: 0.98, interference: 0.05, seed: 42 },
    },
  ];

  const handleApplyPreset = (preset: typeof presets[0]) => {
    const nextCfg: InterferenceConfig = { ...config, ...preset.cfg };
    setConfig(nextCfg);
    setNotebookEntries((prev) => [
      {
        id: `entry-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'preset',
        title: `Applied Preset: ${preset.label}`,
        detail: preset.desc,
        tags: [preset.id, `D=${nextCfg.dimension}`],
      },
      ...prev,
    ]);
  };

  const handleReset = () => {
    setConfig({ ...DEFAULT_INTERFERENCE_CONFIG });
    setSelectedMatrixCell(null);
    setSelectedSweepCell(null);
    setNotebookEntries((prev) => [
      {
        id: `entry-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'preset',
        title: 'Full Lab Reset to Default',
        detail: 'Restored baseline parameters: D=8, Length=7, λ=0.85, Interference=20%, Seed=42.',
        tags: ['Reset', 'Default'],
      },
      ...prev,
    ]);
  };

  // Record manual observation to notebook
  const handleRecordNotebook = () => {
    setNotebookEntries((prev) => [
      {
        id: `entry-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: experimentResult.correct ? 'run' : 'failure',
        title: `Trial ${experimentId}: ${experimentResult.correct ? 'Correct' : 'Collision'}`,
        detail: `Target '${config.targetKey}' -> Model predicted '${experimentResult.prediction}' (Ground Truth: '${experimentResult.groundTruth}'). Retrieval Score: ${(experimentResult.retrievalScore * 100).toFixed(1)}%, Top-1 Margin: ${(experimentResult.top1Margin * 100).toFixed(1)}%.`,
        tags: [`D=${config.dimension}`, `L=${config.sequenceLength}`, experimentResult.correct ? 'Pass' : 'Collision'],
      },
      ...prev,
    ]);
  };

  // Detailed Dynamic Scientific Failure Explanation
  const failureExplanation = useMemo(() => {
    if (experimentResult.correct) {
      return null;
    }
    const target = `${config.targetKey} → ${experimentResult.groundTruth}`;
    const retrieved = experimentResult.prediction;
    const score = (experimentResult.retrievalScore * 100).toFixed(1);
    const margin = (experimentResult.top1Margin * 100).toFixed(1);
    const sim = experimentResult.stateSimilarityWithTarget !== undefined
      ? (experimentResult.stateSimilarityWithTarget * 100).toFixed(1)
      : 'N/A';

    return {
      target,
      retrieved,
      score,
      margin,
      sim,
      narrative: `In this educational model, the configured updates caused the retrieved representation to align more strongly with another stored value (${retrieved}) rather than the ground truth. Over ${config.sequenceLength} sequential writes in dimension D=${config.dimension} with retention λ=${Math.round(config.retention * 100)}% and ${Math.round(config.interference * 100)}% perturbation noise, vector superposition caused geometric crosstalk that flipped the ArgMax candidate classification.`,
    };
  }, [experimentResult, config]);

  // Derived current facts
  const currentFacts = useMemo(() => {
    return generateFacts(config.sequenceLength, config.seed, config.targetKey);
  }, [config.sequenceLength, config.seed, config.targetKey]);

  return (
    <section id="section-04" className="w-full scroll-mt-20 border-b border-[#252A35] bg-[#07080B] text-slate-100 py-14">
      <div id="section-04-limits" className="scroll-mt-24" />
      <div id="section-interference-matrix" className="scroll-mt-24" />
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <SectionHeader
          number="04"
          category="WHEN MEMORY COLLIDES"
          title="Interference, Capacity Limits & Forgetting"
          subtitle="Explore the fundamental trade-off: fixed-size representations eliminate token-by-token KV cache expansion, but packing continuous information inevitably creates interference."
          discovery="As more information is compressed into the same fixed state, representations overlap or decay. Observed in this educational toy model."
          theme="dark"
        />

        {/* Epistemic Evidence Classification & Experiment ID */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#252A35] pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <EvidenceStrip
              type="live"
              detail="Interactive vector projection & superposition simulation"
            />
            <EvidenceStrip
              type="published"
              detail={
                <span>
                  Information capacity scaling <InlineMath math="\mathcal{O}(D)" /> under linear superposition
                </span>
              }
            />
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-[#8F96A3] flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-[#22D3EE]" />
              EXPERIMENT ID:
            </span>
            <span className="bg-[#151922] px-2.5 py-1 rounded border border-[#252A35] text-[#22D3EE] font-bold">
              {experimentId}
            </span>
          </div>
        </div>

        {/* Preset Experiments Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-[#11141A] p-3 rounded-xl border border-[#252A35] text-xs">
          <div className="flex items-center gap-2 text-zinc-300 font-semibold">
            <Sparkles className="w-4 h-4 text-[#22D3EE]" />
            <span>QUICK PRESETS:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                className="px-3 py-1.5 rounded-lg border border-[#252A35] bg-[#151922] text-[#8F96A3] hover:text-white hover:border-[#22D3EE] transition-all font-mono text-xs"
                title={preset.desc}
              >
                {preset.label}
              </button>
            ))}
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-500/40 bg-rose-950/20 text-rose-300 hover:bg-rose-950/40 transition-all font-mono text-xs font-bold"
              title="Reset all parameters to default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET</span>
            </button>
          </div>
        </div>

        {/* Experiment Tab Selector */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#252A35] pb-3 text-xs font-sans">
          <button
            onClick={() => setActiveExperiment('pipeline')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
              activeExperiment === 'pipeline'
                ? 'border-cyan-400 bg-cyan-950/50 text-cyan-300 font-bold ring-1 ring-cyan-400'
                : 'border-[#252A35] bg-[#11141A] text-[#8F96A3] hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>0. Write & read pipeline</span>
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
            <span>1. When memory collides</span>
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
            <span>2. How much can the state hold?</span>
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
            <span>3. Can memory survive distraction?</span>
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
            <span>4. Decay & forgetting rate</span>
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
            <span>5. Interference 2D sweep map</span>
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
            <span>6. KV-cache vs recurrent A/B</span>
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
            <span>7. Memory surgery (counterfactual)</span>
          </button>
        </div>

        {/* EXPERIMENT 0: WRITE / READ PIPELINE INSPECTOR */}
        {activeExperiment === 'pipeline' && (
          <div className="space-y-4">
            <MemoryWriteRead
              dimension={config.dimension}
              retention={config.retention}
              writeStrength={config.writeStrength}
            />
          </div>
        )}

        {/* EXPERIMENT 1: WHEN MEMORY COLLIDES (FULLY FUNCTIONAL SHARED LAB) */}
        {activeExperiment === 'collision' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Col (5 cols): Controls & Procedure */}
              <div className="lg:col-span-5 space-y-4 font-mono text-xs">
                <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-5 space-y-5">
                  <div className="flex items-center justify-between border-b border-[#252A35] pb-2">
                    <span className="font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-[#22D3EE]" />
                      COLLISION PROCEDURE
                    </span>
                    <SourceBadge type="toy" />
                  </div>

                  {/* 5-Step Scientific Procedure Box */}
                  <div className="rounded-lg bg-[#151922] p-3 text-xs text-[#8F96A3] space-y-1.5 border border-[#252A35]">
                    <div className="text-white font-semibold font-sans">EXPERIMENTAL PROTOCOL:</div>
                    <div className="space-y-0.5">
                      <div>1. Learn fact A ("{config.targetKey} → {experimentResult.groundTruth}").</div>
                      <div>2. Learn {config.sequenceLength - 1} unrelated country-capital pairs.</div>
                      <div>3. Query fact A ("{config.targetKey}") again.</div>
                      <div>4. Increase sequence length or interference.</div>
                      <div>5. Observe retrieval score and output flip.</div>
                    </div>
                  </div>

                  {/* Dimension selector: 4, 8, 16, 32 */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#8F96A3] flex items-center gap-1 font-sans">
                        State Dimension (<InlineMath math="D" />):
                      </span>
                      <span className="text-[#22D3EE] font-bold">D = {config.dimension}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[4, 8, 16, 32].map((d) => (
                        <button
                          key={d}
                          onClick={() => setConfig((prev) => ({ ...prev, dimension: d }))}
                          className={`py-2 rounded border text-center transition-all ${
                            config.dimension === d
                              ? 'border-[#22D3EE] bg-cyan-950/60 text-[#22D3EE] font-bold ring-1 ring-[#22D3EE]'
                              : 'border-[#252A35] bg-[#151922] text-[#8F96A3] hover:text-white'
                          }`}
                        >
                          D={d}
                        </button>
                      ))}
                    </div>
                    <span className="text-[11px] text-[#716F68] block">
                      Allocates a fixed <InlineMath math={`${config.dimension} \times ${config.dimension}`} /> outer-product state matrix.
                    </span>
                  </div>

                  {/* Sequence Length Slider */}
                  <ControlSlider
                    label="Sequence Length"
                    value={config.sequenceLength}
                    min={2}
                    max={14}
                    step={1}
                    unit=" facts"
                    onChange={(val) => setConfig((prev) => ({ ...prev, sequenceLength: val }))}
                    description="Total facts packed into state before testing Japan."
                    theme="dark"
                  />

                  {/* Retention Slider */}
                  <ControlSlider
                    label={
                      <span className="flex items-center gap-1">
                        <span>Retention</span>
                        <InlineMath math="(\lambda)" />
                      </span>
                    }
                    value={Math.round(config.retention * 100)}
                    min={20}
                    max={100}
                    step={5}
                    unit="%"
                    onChange={(val) => setConfig((prev) => ({ ...prev, retention: val / 100 }))}
                    description="Memory-state retention per update (M = λM + ηkv^T)."
                    theme="dark"
                  />

                  {/* Interference Perturbation Slider */}
                  <ControlSlider
                    label="Interference Perturbation"
                    value={Math.round(config.interference * 100)}
                    min={0}
                    max={60}
                    step={5}
                    unit="%"
                    onChange={(val) => setConfig((prev) => ({ ...prev, interference: val / 100 }))}
                    description="Controlled perturbation applied to stored representations."
                    theme="dark"
                  />

                  {/* Reproducible Seed Control */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#252A35]">
                    <span className="text-[#8F96A3] font-sans text-xs">Deterministic Seed:</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={config.seed}
                        onChange={(e) => setConfig((prev) => ({ ...prev, seed: Number(e.target.value) || 42 }))}
                        className="w-20 bg-[#151922] border border-[#252A35] rounded px-2 py-1 text-center text-[#22D3EE] font-mono text-xs focus:outline-hidden focus:border-[#22D3EE]"
                      />
                      <button
                        onClick={() => setConfig((prev) => ({ ...prev, seed: prev.seed + 1 }))}
                        className="px-2 py-1 rounded bg-[#151922] border border-[#252A35] text-[#8F96A3] hover:text-white text-xs"
                        title="Increment seed"
                      >
                        +1
                      </button>
                    </div>
                  </div>

                  {/* Metadata Stats Strip */}
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#252A35] text-xs text-center">
                    <div className="bg-[#151922] p-1.5 rounded border border-[#252A35]">
                      <span className="text-[#8F96A3] block text-[10px]">CAPACITY</span>
                      <strong className="text-white">D={config.dimension}</strong>
                    </div>
                    <div className="bg-[#151922] p-1.5 rounded border border-[#252A35]">
                      <span className="text-[#8F96A3] block text-[10px]">RETENTION</span>
                      <strong className="text-white">{Math.round(config.retention * 100)}%</strong>
                    </div>
                    <div className="bg-[#151922] p-1.5 rounded border border-[#252A35]">
                      <span className="text-[#8F96A3] block text-[10px]">PERTURB</span>
                      <strong className="text-white">{Math.round(config.interference * 100)}%</strong>
                    </div>
                    <div className="bg-[#151922] p-1.5 rounded border border-[#252A35]">
                      <span className="text-[#8F96A3] block text-[10px]">STATUS</span>
                      <strong className={experimentResult.correct ? 'text-emerald-400' : 'text-rose-400'}>
                        {experimentResult.correct ? 'CORRECT' : 'COLLISION'}
                      </strong>
                    </div>
                  </div>

                  {/* Record Observation to Notebook Button */}
                  <button
                    onClick={handleRecordNotebook}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-[#252A35] bg-[#151922] hover:bg-[#1A202C] text-cyan-300 font-sans text-xs transition-all"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Record Current Trial in Lab Notebook</span>
                  </button>
                </div>

                {/* Automatic Failure Explanation Card */}
                {failureExplanation && (
                  <div className="rounded-xl border border-rose-500/50 bg-rose-950/30 p-4 space-y-3 font-sans">
                    <div className="flex items-center gap-2 text-rose-300 font-bold text-xs font-mono">
                      <AlertOctagon className="w-4 h-4" />
                      <span>FAILURE EXPLANATION</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#07080B]/50 p-2.5 rounded border border-rose-900/40">
                      <div>
                        <span className="text-[#8F96A3] block text-[10px]">TARGET:</span>
                        <span className="text-white font-semibold">{failureExplanation.target}</span>
                      </div>
                      <div>
                        <span className="text-[#8F96A3] block text-[10px]">RETRIEVED:</span>
                        <span className="text-rose-400 font-semibold">{failureExplanation.retrieved}</span>
                      </div>
                      <div>
                        <span className="text-[#8F96A3] block text-[10px]" title="Cosine similarity between retrieved vector and candidate.">RETRIEVAL SCORE:</span>
                        <span className="text-[#22D3EE] font-semibold">{failureExplanation.score}%</span>
                      </div>
                      <div>
                        <span className="text-[#8F96A3] block text-[10px]" title="Difference between highest and second-highest candidate score.">TOP-1 MARGIN:</span>
                        <span className="text-amber-300 font-semibold">{failureExplanation.margin}%</span>
                      </div>
                    </div>

                    <p className="text-xs text-rose-200/90 leading-relaxed font-sans">
                      {failureExplanation.narrative}
                    </p>
                    <span className="text-[11px] text-rose-400 font-mono block">
                      Observed in this educational toy model.
                    </span>
                  </div>
                )}
              </div>

              {/* Right Col (7 cols): Result & Live Curve */}
              <div className="lg:col-span-7 space-y-5">
                {/* Truth Comparison Card */}
                <TruthModelComparison
                  truth={experimentResult.groundTruth}
                  prediction={experimentResult.prediction}
                  confidence={experimentResult.retrievalScore}
                />

                {/* Live Curve: Sequence Length -> Retrieval Score */}
                <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-5 space-y-4 font-mono text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#252A35] pb-2">
                    <span className="font-semibold text-white uppercase tracking-wider flex items-center gap-1.5 font-sans">
                      <TrendingDown className="w-4 h-4 text-[#22D3EE]" />
                      LIVE CURVE: RETRIEVAL SCORE BY SEQUENCE LENGTH
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">Target: "{config.targetKey}"</span>
                  </div>

                  <p className="text-xs text-[#8F96A3] font-sans">
                    Each row runs the deterministic engine with <InlineMath math={`D = ${config.dimension}`} />, retention <InlineMath math={`\\lambda = ${config.retention}`} />, and perturbation <InlineMath math={`${Math.round(config.interference * 100)}\\%`} /> across different fact load lengths.
                  </p>

                  {/* Graph Bars */}
                  <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                    {liveCurveData.map((pt) => {
                      const isSelected = pt.length === config.sequenceLength;
                      const scorePct = Math.round(pt.score * 100);

                      return (
                        <div
                          key={pt.length}
                          onClick={() => setConfig((prev) => ({ ...prev, sequenceLength: pt.length }))}
                          className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#22D3EE] bg-cyan-950/40 ring-1 ring-[#22D3EE]'
                              : 'border-[#252A35] bg-[#151922] hover:bg-[#1A202C]'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-semibold text-white">
                              Length = {pt.length} facts{' '}
                              {isSelected && <span className="text-[#22D3EE] text-[11px] font-bold">(Current)</span>}
                            </span>
                            <span className="flex items-center gap-2">
                              <span className={pt.correct ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
                                → {pt.prediction}
                              </span>
                              <span className="text-zinc-400" title="Cosine similarity between retrieved vector and candidate.">
                                ({scorePct}%)
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                  pt.correct ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                                }`}
                              >
                                {pt.correct ? 'CORRECT' : 'COLLISION'}
                              </span>
                            </span>
                          </div>

                          {/* Retrieval Score Bar */}
                          <div className="w-full bg-[#07080B] h-1.5 rounded-full overflow-hidden border border-[#252A35]">
                            <div
                              className={`h-full transition-all ${
                                pt.correct ? 'bg-emerald-400' : 'bg-rose-400'
                              }`}
                              style={{ width: `${Math.max(5, Math.min(100, scorePct))}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Educational Model Principle */}
                  <div className="p-3 rounded-lg bg-[#07080B] border border-[#252A35] text-xs text-[#8F96A3] space-y-1 font-sans">
                    <span className="text-white font-semibold block font-mono">EDUCATIONAL MODEL PRINCIPLE:</span>
                    <p>
                      A fixed-size state matrix (<InlineMath math="D \times D" />) has a finite capacity <InlineMath math="\mathcal{O}(D)" />. As more facts are packed via outer-product superposition, early facts either decay or overlap geometrically, creating crosstalk that eventually flips the nearest-neighbor retrieval.
                    </p>
                    <span className="text-cyan-400 italic text-[11px]">Observed in this educational toy model.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* REAL MATRIX & STATE INSPECTOR */}
            <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-5 space-y-5 font-mono text-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#252A35] pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#22D3EE]" />
                  <span className="font-bold text-white uppercase tracking-wider text-sm font-sans">
                    ACTUAL RECORDED MATRIX STATE (<InlineMath math={`M \\in \\mathbb{R}^{${config.dimension} \\times ${config.dimension}}`} />)
                  </span>
                </div>
                <div className="text-xs text-[#8F96A3]">
                  Hover/Click cell to inspect coordinate values & updates
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Matrix Heatmap (7 cols) */}
                <div className="lg:col-span-7 space-y-2">
                  <div className="overflow-x-auto p-3 bg-[#07080B] rounded-lg border border-[#252A35]">
                    <div
                      className="grid gap-1 min-w-[280px]"
                      style={{
                        gridTemplateColumns: `repeat(${config.dimension}, minmax(0, 1fr))`,
                      }}
                    >
                      {experimentResult.matrix.map((row, rIdx) =>
                        row.map((val, cIdx) => {
                          const isHovered =
                            selectedMatrixCell?.r === rIdx && selectedMatrixCell?.c === cIdx;
                          const absVal = Math.min(1, Math.abs(val) / 1.5);
                          const isPos = val >= 0;

                          return (
                            <button
                              key={`${rIdx}-${cIdx}`}
                              onMouseEnter={() => setSelectedMatrixCell({ r: rIdx, c: cIdx, val })}
                              onClick={() => setSelectedMatrixCell({ r: rIdx, c: cIdx, val })}
                              className={`aspect-square rounded-xs text-[9px] flex items-center justify-center transition-all ${
                                isHovered ? 'ring-2 ring-cyan-300 z-10' : ''
                              } ${
                                isPos
                                  ? 'text-cyan-200'
                                  : 'text-amber-200'
                              }`}
                              style={{
                                backgroundColor: isPos
                                  ? `rgba(34, 211, 238, ${Math.max(0.08, absVal * 0.85)})`
                                  : `rgba(244, 63, 94, ${Math.max(0.08, absVal * 0.85)})`,
                              }}
                              title={`M[${rIdx},${cIdx}] = ${val.toFixed(4)}`}
                            >
                              {config.dimension <= 8 ? val.toFixed(1) : ''}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-[#8F96A3]">
                    <span>Row = Key Vector Space (<InlineMath math="k_i" />)</span>
                    <span>Col = Value Vector Space (<InlineMath math="v_j" />)</span>
                  </div>
                </div>

                {/* Cell Inspector & State Summary (5 cols) */}
                <div className="lg:col-span-5 space-y-3 font-sans text-xs">
                  <div className="bg-[#151922] p-4 rounded-lg border border-[#252A35] space-y-2">
                    <span className="text-[#8F96A3] font-mono text-[11px] uppercase block">
                      COORDINATE INSPECTOR
                    </span>
                    {selectedMatrixCell ? (
                      <div className="space-y-1 font-mono">
                        <div className="text-white text-sm font-bold">
                          M[{selectedMatrixCell.r}, {selectedMatrixCell.c}] = {selectedMatrixCell.val.toFixed(6)}
                        </div>
                        <div className="text-xs text-[#8F96A3]">
                          Polarity: {selectedMatrixCell.val >= 0 ? 'Excitatory (Positive)' : 'Inhibitory (Negative)'}
                        </div>
                        <div className="text-xs text-[#8F96A3]">
                          Step History: {experimentResult.history.length} writes recorded
                        </div>
                      </div>
                    ) : (
                      <div className="text-[#8F96A3] italic text-xs">
                        Hover or tap any matrix cell on the left to inspect its exact float value.
                      </div>
                    )}
                  </div>

                  {/* State Statistics */}
                  <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                    <div className="bg-[#151922] p-2.5 rounded border border-[#252A35]">
                      <span className="text-[#8F96A3] block text-[10px]">TOTAL FACTS PACKED:</span>
                      <strong className="text-white">{config.sequenceLength} facts</strong>
                    </div>
                    <div className="bg-[#151922] p-2.5 rounded border border-[#252A35]">
                      <span className="text-[#8F96A3] block text-[10px]">FROBENIUS MATRIX NORM:</span>
                      <strong className="text-cyan-300">
                        {Math.sqrt(
                          experimentResult.matrix.reduce((acc, row) => acc + row.reduce((s, v) => s + v * v, 0), 0)
                        ).toFixed(3)}
                      </strong>
                    </div>
                    <div className="bg-[#151922] p-2.5 rounded border border-[#252A35]">
                      <span className="text-[#8F96A3] block text-[10px]">TOP CANDIDATE:</span>
                      <strong className="text-white">{experimentResult.prediction}</strong>
                    </div>
                    <div className="bg-[#151922] p-2.5 rounded border border-[#252A35]">
                      <span className="text-[#8F96A3] block text-[10px]">TOP-1 MARGIN:</span>
                      <strong className="text-amber-300">{(experimentResult.top1Margin * 100).toFixed(1)}%</strong>
                    </div>
                  </div>

                  {/* Fact Sequence Stored */}
                  <div className="bg-[#151922] p-3 rounded border border-[#252A35] space-y-1.5">
                    <span className="text-[#8F96A3] font-mono text-[10px] uppercase block">
                      STORED FACTS IN CHRONOLOGICAL SEQUENCE:
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                      {currentFacts.map((f, idx) => (
                        <span
                          key={f.key}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                            f.key === config.targetKey
                              ? 'bg-cyan-950 border-cyan-400 text-cyan-300 font-bold'
                              : 'bg-[#11141A] border-[#252A35] text-zinc-300'
                          }`}
                        >
                          #{idx + 1} {f.key} → {f.value}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* EXPERIMENT NOTEBOOK CONTAINER */}
            <div className="pt-2">
              <ExperimentNotebook
                entries={notebookEntries}
                onClear={() => setNotebookEntries([])}
              />
            </div>
          </div>
        )}

        {/* EXPERIMENT 2: HOW MUCH CAN THE STATE HOLD? */}
        {activeExperiment === 'capacity' && (
          <div className="space-y-6">
            <CapacityExperiment />
          </div>
        )}

        {/* EXPERIMENT 3: CAN MEMORY SURVIVE DISTRACTION? */}
        {activeExperiment === 'distraction' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#252A35] pb-2">
                <span className="font-semibold text-white uppercase tracking-wider font-mono text-xs flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4 text-amber-400" />
                  DISTRACTION & INTERVENING FACT OVERWRITING
                </span>
                <SourceBadge type="toy" />
              </div>
              <p className="text-xs text-[#8F96A3] font-sans">
                Observe what happens when <InlineMath math="N" /> distractor facts are written between the ingestion of fact A ("France → Paris") and its final retrieval.
              </p>
              <MemoryDecayExperiment />
            </div>
          </div>
        )}

        {/* EXPERIMENT 4: DECAY & FORGETTING FACTOR */}
        {activeExperiment === 'decay' && <MemoryDecayExperiment />}

        {/* EXPERIMENT 5: INTERFERENCE 2D PHASE BOUNDARY */}
        {activeExperiment === 'sweep' && <InterferenceMap />}

        {/* EXPERIMENT 6: TRANSFORMER KV CACHE VS RECURRENT A/B COMPARISON */}
        {activeExperiment === 'ab_compare' && <MemoryABComparison />}

        {/* EXPERIMENT 7: MEMORY SURGERY (TRUE COUNTERFACTUAL EXPERIMENT) */}
        {activeExperiment === 'surgery' && <MemorySurgery />}

        {/* Scientific Evidence & Honesty Panel */}
        <div className="pt-6">
          <ScientificHonestyPanel />
        </div>
      </div>
    </section>
  );
};

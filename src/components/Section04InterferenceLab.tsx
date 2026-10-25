import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
  Play,
  Keyboard,
  Zap,
  BookOpen,
  Activity,
  Info,
  Maximize2,
  Hash,
  History,
} from 'lucide-react';
import { ExperimentHistorySidebar, ExperimentHistoryRecord } from './ExperimentHistorySidebar';
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
  setActiveExperimentConfig,
  getActiveExperimentConfig,
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

export interface Section04InterferenceLabProps {
  initialConfig?: Partial<InterferenceConfig> | null;
}

export const Section04InterferenceLab: React.FC<Section04InterferenceLabProps> = ({ initialConfig }) => {
  const [activeExperiment, setActiveExperiment] = useState<
    'pipeline' | 'collision' | 'capacity' | 'distraction' | 'decay' | 'sweep' | 'ab_compare' | 'surgery'
  >('collision');

  // ==================================================
  // 1. ONE SHARED EXPERIMENT STATE (Source of Truth)
  // ==================================================
  const [config, setConfig] = useState<InterferenceConfig>(() => {
    const active = getActiveExperimentConfig();
    return {
      ...DEFAULT_INTERFERENCE_CONFIG,
      ...active,
      ...(initialConfig || {}),
    };
  });

  // Re-synchronize if initialConfig is updated externally (e.g. on Retry Last Operation)
  useEffect(() => {
    if (initialConfig) {
      setConfig((prev) => ({
        ...prev,
        ...initialConfig,
      }));
    }
  }, [initialConfig]);

  // Persistent Experiment History Sidebar state
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Listen for revert events from ExperimentHistorySidebar
  useEffect(() => {
    const handleRevertEvent = (e: any) => {
      if (e.detail?.config) {
        setConfig((prev) => ({
          ...prev,
          ...e.detail.config,
        }));
      }
    };
    window.addEventListener('interference_config_reverted', handleRevertEvent);
    return () => window.removeEventListener('interference_config_reverted', handleRevertEvent);
  }, []);

  // Keep global diagnostic state tracker synchronized with current experiment config
  useEffect(() => {
    setActiveExperimentConfig(config);
  }, [config]);

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
      label: 'Baseline (collision)',
      desc: 'D=8, 7 facts, 85% retention, 20% interference — demonstrates state collision.',
      cfg: { dimension: 8, sequenceLength: 7, retention: 0.85, interference: 0.20, seed: 42 },
    },
    {
      id: 'low_capacity',
      label: 'Low capacity (D=4)',
      desc: 'D=4 state saturation with 5 facts — severe dimensional bottleneck.',
      cfg: { dimension: 4, sequenceLength: 5, retention: 0.90, interference: 0.10, seed: 42 },
    },
    {
      id: 'high_interference',
      label: 'High interference',
      desc: 'D=8 with 45% crosstalk perturbation — vector drift induces misclassification.',
      cfg: { dimension: 8, sequenceLength: 6, retention: 0.90, interference: 0.45, seed: 42 },
    },
    {
      id: 'high_retention',
      label: 'High capacity (D=32)',
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

  // Action Toast for keyboard shortcuts & quick feedback
  const [lastActionToast, setLastActionToast] = useState<{ message: string; timestamp: number } | null>(null);

  // Auto-dismiss feedback pill after 2.5 seconds
  useEffect(() => {
    if (!lastActionToast) return;
    const timer = setTimeout(() => {
      setLastActionToast(null);
    }, 2500);
    return () => clearTimeout(timer);
  }, [lastActionToast]);

  const handleReset = useCallback(() => {
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
    setLastActionToast({
      message: 'Reset lab to default configuration (D=8, L=7, λ=85%) [Shortcut: R]',
      timestamp: Date.now(),
    });
  }, []);

  // Re-run the current experiment, re-evaluating computation and logging observation to notebook
  const handleRerun = useCallback(() => {
    // 1. Force state re-evaluation
    setConfig((prev) => ({ ...prev }));

    // 2. Compute observation and log trial into lab notebook
    setNotebookEntries((prev) => [
      {
        id: `entry-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: experimentResult.correct ? 'run' : 'failure',
        title: `Re-run ${experimentId}: ${experimentResult.correct ? 'Verified Retrieval' : 'Collision Observed'}`,
        detail: `Executed configuration: D=${config.dimension}, L=${config.sequenceLength}, λ=${Math.round(config.retention * 100)}%, Interference=${Math.round(config.interference * 100)}%. Score: ${(experimentResult.retrievalScore * 100).toFixed(1)}%, Top-1 Margin: ${(experimentResult.top1Margin * 100).toFixed(1)}%.`,
        tags: [`D=${config.dimension}`, `L=${config.sequenceLength}`, 'Re-run'],
      },
      ...prev,
    ]);

    setLastActionToast({
      message: `Re-ran experiment ${experimentId} [Shortcut: ↵ Enter]`,
      timestamp: Date.now(),
    });
  }, [config, experimentId, experimentResult]);

  // Global keyboard shortcuts: 'R' to reset, 'Enter' to re-run
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not intercept keystrokes when typing inside inputs, textareas, or dropdowns
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      // 'R' or 'r': Reset the lab
      if ((e.key === 'r' || e.key === 'R') && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        handleReset();
      }

      // 'Enter': Re-run the current experiment
      else if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        handleRerun();
      }

      // '1', '2', '3', '4': Quick dimension selection
      else if (
        (e.key === '1' || e.key === '2' || e.key === '3' || e.key === '4') &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        const dimMap: Record<string, number> = { '1': 4, '2': 8, '3': 16, '4': 32 };
        const newDim = dimMap[e.key];
        if (newDim) {
          e.preventDefault();
          setConfig((prev) => ({ ...prev, dimension: newDim }));
          setLastActionToast({
            message: `Switched Dimension to D=${newDim} [Shortcut: ${e.key}]`,
            timestamp: Date.now(),
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleReset, handleRerun]);

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
    <section id="section-04" className="w-full scroll-mt-20 border-b border-[var(--border)] bg-[var(--page-bg)] text-[var(--text-primary)] py-12">
      <div id="section-04-limits" className="scroll-mt-24" />
      <div id="section-interference-matrix" className="scroll-mt-24" />
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <SectionHeader
          number="04"
          category="When memory collides"
          title="Interference, Capacity Limits & Forgetting"
          subtitle="Explore the fundamental trade-off: fixed-size representations eliminate token-by-token KV cache expansion, but packing continuous information inevitably creates interference."
          discovery="As more information is compressed into the same fixed state, representations overlap or decay. Observed in this educational toy model."
          theme="light"
        />

        {/* Epistemic Evidence Classification & Experiment ID */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6DF] pb-4">
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

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#5F625F] flex items-center gap-1 font-medium">
              <Hash className="w-3.5 h-3.5 text-[#31566E]" />
              Experiment ID:
            </span>
            <span className="bg-[#F7F5EF] px-2.5 py-1 rounded border border-[#D8DCD8] text-[#31566E] font-mono font-semibold">
              {experimentId}
            </span>
            <button
              type="button"
              onClick={() => setIsHistoryOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FFFFFF] hover:bg-[#F7F5EF] text-[#31566E] border border-[#D8DCD8] font-medium transition cursor-pointer shadow-2xs"
              title="Open persistent experiment history panel (last 10 runs)"
            >
              <History className="w-3.5 h-3.5 text-[#31566E]" />
              <span>Experiment History</span>
            </button>
          </div>
        </div>

        {/* Preset Experiments Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-[#F7F5EF] p-3 rounded-xl border border-[#D8DCD8] text-xs">
          <div className="flex items-center gap-2 text-[#252525] font-semibold">
            <Sparkles className="w-4 h-4 text-[#8C5D17]" />
            <span>Quick presets:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                className="px-3 py-1.5 rounded-lg border border-[#D8DCD8] bg-[#FFFFFF] text-[#5F625F] hover:text-[#252525] hover:border-[#31566E] transition-all text-xs cursor-pointer shadow-2xs"
                title={preset.desc}
              >
                {preset.label}
              </button>
            ))}
            <button
              onClick={handleRerun}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#BCE2C9] bg-[#DCEFE2] text-[#245B38] hover:bg-[#CDE8D5] transition-all text-xs font-semibold cursor-pointer"
              title="Re-run the current experiment and log observation to notebook (Enter)"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Re-run</span>
              <kbd className="text-[10px] px-1.5 py-0.2 rounded bg-[#FFFFFF] border border-[#BCE2C9] text-[#245B38] font-mono">↵</kbd>
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#D8DCD8] bg-[#FFFFFF] text-[#5F625F] hover:text-[#252525] hover:bg-[#F1F2F0] transition-all text-xs cursor-pointer"
              title="Reset all parameters to default baseline (R)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
              <kbd className="text-[10px] px-1.5 py-0.2 rounded bg-[#F7F5EF] border border-[#D8DCD8] text-[#5F625F] font-mono">R</kbd>
            </button>
          </div>
        </div>

        {/* Global Keyboard Shortcuts Help Strip & Action Notification */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FFFFFF] px-3.5 py-2 rounded-xl border border-[#D8DCD8] text-[11px] shadow-2xs">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[#5F625F]">
            <span className="flex items-center gap-1.5 text-[#252525] font-semibold">
              <Keyboard className="w-3.5 h-3.5 text-[#31566E]" />
              <span>Shortcuts:</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-[#F7F5EF] border border-[#D8DCD8] text-[#252525] font-mono font-semibold">R</kbd>
              <span>Reset lab</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-[#F7F5EF] border border-[#D8DCD8] text-[#252525] font-mono font-semibold">↵ Enter</kbd>
              <span>Re-run trial</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-[#F7F5EF] border border-[#D8DCD8] text-[#5F625F] font-mono">1-4</kbd>
              <span>Dimension (D=4/8/16/32)</span>
            </span>
          </div>

          {lastActionToast && (
            <div className="flex items-center gap-2 text-[#245B38] bg-[#DCEFE2] border border-[#BCE2C9] px-2.5 py-1 rounded-md animate-in fade-in duration-150 ml-auto">
              <Zap className="w-3 h-3 text-[#247A4B]" />
              <span className="font-sans font-medium text-xs">{lastActionToast.message}</span>
            </div>
          )}
        </div>

        {/* Experiment Tab Selector */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#EAE6DF] pb-3 text-xs font-sans">
          {[
            { id: 'pipeline', label: '0. Write & read pipeline', icon: Database },
            { id: 'collision', label: '1. When memory collides', icon: TrendingDown },
            { id: 'capacity', label: '2. Capacity limits', icon: BarChart2 },
            { id: 'distraction', label: '3. Distraction resilience', icon: AlertOctagon },
            { id: 'decay', label: '4. Decay & forgetting rate', icon: Clock },
            { id: 'sweep', label: '5. Interference 2D sweep', icon: Grid },
            { id: 'ab_compare', label: '6. KV-cache vs recurrent A/B', icon: ArrowLeftRight },
            { id: 'surgery', label: '7. Memory surgery', icon: Scissors },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeExperiment === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveExperiment(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border transition-all cursor-pointer ${
                  isActive
                    ? 'border-[#B8D7ED] bg-[#E7F2FA] text-[#31566E] font-semibold shadow-2xs'
                    : 'border-[#D8DCD8] bg-[#FFFFFF] text-[#5F625F] hover:text-[#252525] hover:bg-[#F7F5EF]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
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
              <div className="lg:col-span-5 space-y-4 text-xs">
                <div className="rounded-xl border border-[#D8DCD8] bg-[#FFFFFF] p-5 space-y-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-2">
                    <span className="font-semibold text-[#252525] flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-[#31566E]" />
                      Collision procedure
                    </span>
                    <SourceBadge type="toy" />
                  </div>

                  {/* 5-Step Scientific Procedure Box */}
                  <div className="rounded-lg bg-[#F7F5EF] p-3 text-xs text-[#5F625F] space-y-1.5 border border-[#EAE6DF]">
                    <div className="text-[#252525] font-semibold font-sans">Experimental protocol:</div>
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
                      <span className="text-[#5F625F] flex items-center gap-1 font-sans">
                        State dimension (<InlineMath math="D" />):
                      </span>
                      <span className="font-mono text-[#31566E] font-bold">D = {config.dimension}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 font-mono">
                      {[4, 8, 16, 32].map((d) => (
                        <button
                          key={d}
                          onClick={() => setConfig((prev) => ({ ...prev, dimension: d }))}
                          className={`py-2 rounded-lg border text-center transition-all cursor-pointer ${
                            config.dimension === d
                              ? 'border-[#B8D7ED] bg-[#E7F2FA] text-[#31566E] font-bold'
                              : 'border-[#D8DCD8] bg-[#FFFFFF] text-[#5F625F] hover:text-[#252525]'
                          }`}
                        >
                          D={d}
                        </button>
                      ))}
                    </div>
                    <span className="text-[11px] text-[#5F625F] block">
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
                    theme="light"
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
                    theme="light"
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
                    theme="light"
                  />

                  {/* Reproducible Seed Control */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#EAE6DF]">
                    <span className="text-[#5F625F] font-sans text-xs">Deterministic seed:</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={config.seed}
                        onChange={(e) => setConfig((prev) => ({ ...prev, seed: Number(e.target.value) || 42 }))}
                        className="w-20 bg-[#F7F5EF] border border-[#D8DCD8] rounded-md px-2 py-1 text-center text-[#31566E] font-mono text-xs focus:outline-hidden focus:border-[#31566E]"
                      />
                      <button
                        onClick={() => setConfig((prev) => ({ ...prev, seed: prev.seed + 1 }))}
                        className="px-2 py-1 rounded-md bg-[#FFFFFF] border border-[#D8DCD8] text-[#5F625F] hover:text-[#252525] text-xs cursor-pointer"
                        title="Increment seed"
                      >
                        +1
                      </button>
                    </div>
                  </div>

                  {/* Metadata Stats Strip */}
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#EAE6DF] text-xs text-center font-mono">
                    <div className="bg-[#F7F5EF] p-1.5 rounded-lg border border-[#EAE6DF]">
                      <span className="text-[#5F625F] block text-[10px]">CAPACITY</span>
                      <strong className="text-[#252525]">D={config.dimension}</strong>
                    </div>
                    <div className="bg-[#F7F5EF] p-1.5 rounded-lg border border-[#EAE6DF]">
                      <span className="text-[#5F625F] block text-[10px]">RETENTION</span>
                      <strong className="text-[#252525]">{Math.round(config.retention * 100)}%</strong>
                    </div>
                    <div className="bg-[#F7F5EF] p-1.5 rounded-lg border border-[#EAE6DF]">
                      <span className="text-[#5F625F] block text-[10px]">PERTURB</span>
                      <strong className="text-[#252525]">{Math.round(config.interference * 100)}%</strong>
                    </div>
                    <div className="bg-[#F7F5EF] p-1.5 rounded-lg border border-[#EAE6DF]">
                      <span className="text-[#5F625F] block text-[10px]">STATUS</span>
                      <strong className={experimentResult.correct ? 'text-[#247A4B]' : 'text-[#B64235]'}>
                        {experimentResult.correct ? 'CORRECT' : 'COLLISION'}
                      </strong>
                    </div>
                  </div>

                  {/* Action Buttons: Re-run & Reset */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={handleRerun}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[#BCE2C9] bg-[#DCEFE2] hover:bg-[#CDE8D5] text-[#245B38] font-sans text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                      title="Re-run the current experiment and log observation to notebook (Enter)"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Re-run trial</span>
                      <kbd className="text-[10px] px-1.5 py-0.2 rounded bg-[#FFFFFF] border border-[#BCE2C9] text-[#245B38] font-mono">↵</kbd>
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[#D8DCD8] bg-[#FFFFFF] hover:bg-[#F7F5EF] text-[#5F625F] font-sans text-xs font-semibold transition-all cursor-pointer"
                      title="Reset lab to default baseline parameters (R)"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset lab</span>
                      <kbd className="text-[10px] px-1.5 py-0.2 rounded bg-[#F7F5EF] border border-[#D8DCD8] text-[#5F625F] font-mono">R</kbd>
                    </button>
                  </div>

                  {/* Record Observation to Notebook Button */}
                  <button
                    onClick={handleRecordNotebook}
                    className="w-full flex items-center justify-center gap-2 py-1.5 rounded-lg border border-[#D8DCD8] bg-[#FFFFFF] hover:bg-[#F7F5EF] text-[#5F625F] hover:text-[#252525] font-sans text-xs transition-all cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#31566E]" />
                    <span>Log observation to notebook</span>
                  </button>
                </div>

                {/* Automatic Failure Explanation Card */}
                {failureExplanation && (
                  <div className="rounded-xl border border-[#F2CAD2] bg-[#F9E9ED] p-4 space-y-3 font-sans text-xs">
                    <div className="flex items-center gap-2 text-[#B64235] font-bold">
                      <AlertOctagon className="w-4 h-4" />
                      <span>Interference explanation</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 font-mono bg-[#FFFFFF] p-2.5 rounded-lg border border-[#F2CAD2]">
                      <div>
                        <span className="text-[#5F625F] block text-[10px]">TARGET:</span>
                        <span className="text-[#252525] font-semibold">{failureExplanation.target}</span>
                      </div>
                      <div>
                        <span className="text-[#5F625F] block text-[10px]">RETRIEVED:</span>
                        <span className="text-[#B64235] font-semibold">{failureExplanation.retrieved}</span>
                      </div>
                      <div>
                        <span className="text-[#5F625F] block text-[10px]" title="Cosine similarity between retrieved vector and candidate.">RETRIEVAL SCORE:</span>
                        <span className="text-[#31566E] font-semibold">{failureExplanation.score}%</span>
                      </div>
                      <div>
                        <span className="text-[#5F625F] block text-[10px]" title="Difference between highest and second-highest candidate score.">TOP-1 MARGIN:</span>
                        <span className="text-[#8C5D17] font-semibold">{failureExplanation.margin}%</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#5F625F] leading-relaxed font-sans">
                      {failureExplanation.narrative}
                    </p>
                    <span className="text-[11px] text-[#5F625F] italic block">
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
                <div className="rounded-xl border border-[#D8DCD8] bg-[#FFFFFF] p-5 space-y-4 text-xs shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EAE6DF] pb-2">
                    <span className="font-semibold text-[#252525] flex items-center gap-1.5 font-sans">
                      <TrendingDown className="w-4 h-4 text-[#31566E]" />
                      Live curve: retrieval score by sequence length
                    </span>
                    <span className="text-xs text-[#5F625F] font-mono">Target: "{config.targetKey}"</span>
                  </div>

                  <p className="text-xs text-[#5F625F] font-sans">
                    Each row runs the deterministic engine with <InlineMath math={`D = ${config.dimension}`} />, retention <InlineMath math={`\\lambda = ${config.retention}`} />, and perturbation <InlineMath math={`${Math.round(config.interference * 100)}\\%`} /> across different fact load lengths.
                  </p>

                  {/* Graph Bars */}
                  <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1 font-mono">
                    {liveCurveData.map((pt) => {
                      const isSelected = pt.length === config.sequenceLength;
                      const scorePct = Math.round(pt.score * 100);

                      return (
                        <div
                          key={pt.length}
                          onClick={() => setConfig((prev) => ({ ...prev, sequenceLength: pt.length }))}
                          className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#B8D7ED] bg-[#E7F2FA]'
                              : 'border-[#D8DCD8] bg-[#F7F5EF] hover:bg-[#F1F2F0]'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-semibold text-[#252525]">
                              Length = {pt.length} facts{' '}
                              {isSelected && <span className="text-[#31566E] text-[11px] font-bold font-sans">(Current)</span>}
                            </span>
                            <span className="flex items-center gap-2">
                              <span className={pt.correct ? 'text-[#247A4B] font-medium' : 'text-[#B64235] font-medium'}>
                                → {pt.prediction}
                              </span>
                              <span className="text-[#5F625F]" title="Cosine similarity between retrieved vector and candidate.">
                                ({scorePct}%)
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded font-sans font-semibold ${
                                  pt.correct ? 'bg-[#DCEFE2] text-[#247A4B]' : 'bg-[#F9E9ED] text-[#B64235]'
                                }`}
                              >
                                {pt.correct ? 'Correct' : 'Collision'}
                              </span>
                            </span>
                          </div>

                          {/* Retrieval Score Bar */}
                          <div className="w-full bg-[#EAE6DF] h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                pt.correct ? 'bg-[#247A4B]' : 'bg-[#B64235]'
                              }`}
                              style={{ width: `${Math.max(5, Math.min(100, scorePct))}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Educational Model Principle */}
                  <div className="p-3 rounded-lg bg-[#F7F5EF] border border-[#EAE6DF] text-xs text-[#5F625F] space-y-1 font-sans">
                    <span className="text-[#252525] font-semibold block">Educational model principle:</span>
                    <p>
                      A fixed-size state matrix (<InlineMath math="D \times D" />) has a finite capacity <InlineMath math="\mathcal{O}(D)" />. As more facts are packed via outer-product superposition, early facts either decay or overlap geometrically, creating crosstalk that eventually flips the nearest-neighbor retrieval.
                    </p>
                    <span className="text-[#31566E] italic text-[11px]">Observed in this educational toy model.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* REAL MATRIX & STATE INSPECTOR */}
            <div className="rounded-xl border border-[#D8DCD8] bg-[#FFFFFF] p-5 space-y-5 text-xs shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6DF] pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#31566E]" />
                  <span className="font-bold text-[#252525] text-sm font-sans">
                    Actual recorded matrix state (<InlineMath math={`M \\in \\mathbb{R}^{${config.dimension} \\times ${config.dimension}}`} />)
                  </span>
                </div>
                <div className="text-xs text-[#5F625F]">
                  Hover/Click cell to inspect coordinate values & updates
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Matrix Heatmap (7 cols) */}
                <div className="lg:col-span-7 space-y-2">
                  <div className="overflow-x-auto p-3 bg-[#F7F5EF] rounded-lg border border-[#D8DCD8]">
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
                              className={`aspect-square rounded-xs text-[9px] font-mono flex items-center justify-center transition-all ${
                                isHovered ? 'ring-2 ring-[#31566E] z-10' : ''
                              } ${
                                isPos
                                  ? 'text-[#245B38]'
                                  : 'text-[#B64235]'
                              }`}
                              style={{
                                backgroundColor: isPos
                                  ? `rgba(220, 239, 226, ${Math.max(0.2, absVal * 0.95)})`
                                  : `rgba(249, 233, 237, ${Math.max(0.2, absVal * 0.95)})`,
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
                  <div className="flex justify-between items-center text-[11px] text-[#5F625F]">
                    <span>Row = Key Vector Space (<InlineMath math="k_i" />)</span>
                    <span>Col = Value Vector Space (<InlineMath math="v_j" />)</span>
                  </div>
                </div>

                {/* Cell Inspector & State Summary (5 cols) */}
                <div className="lg:col-span-5 space-y-3 font-sans text-xs">
                  <div className="bg-[#F7F5EF] p-4 rounded-lg border border-[#D8DCD8] space-y-2">
                    <span className="text-[#5F625F] font-mono text-[11px] uppercase block">
                      COORDINATE INSPECTOR
                    </span>
                    {selectedMatrixCell ? (
                      <div className="space-y-1 font-mono">
                        <div className="text-[#252525] text-sm font-bold">
                          M[{selectedMatrixCell.r}, {selectedMatrixCell.c}] = {selectedMatrixCell.val.toFixed(6)}
                        </div>
                        <div className="text-xs text-[#5F625F]">
                          Polarity: {selectedMatrixCell.val >= 0 ? 'Excitatory (Positive)' : 'Inhibitory (Negative)'}
                        </div>
                        <div className="text-xs text-[#5F625F]">
                          Step History: {experimentResult.history.length} writes recorded
                        </div>
                      </div>
                    ) : (
                      <div className="text-[#5F625F] italic text-xs">
                        Hover or tap any matrix cell on the left to inspect its exact float value.
                      </div>
                    )}
                  </div>

                  {/* State Statistics */}
                  <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                    <div className="bg-[#FFFFFF] p-2.5 rounded-lg border border-[#D8DCD8]">
                      <span className="text-[#5F625F] block text-[10px]">TOTAL FACTS PACKED:</span>
                      <strong className="text-[#252525]">{config.sequenceLength} facts</strong>
                    </div>
                    <div className="bg-[#FFFFFF] p-2.5 rounded-lg border border-[#D8DCD8]">
                      <span className="text-[#5F625F] block text-[10px]">FROBENIUS MATRIX NORM:</span>
                      <strong className="text-[#31566E]">
                        {Math.sqrt(
                          experimentResult.matrix.reduce((acc, row) => acc + row.reduce((s, v) => s + v * v, 0), 0)
                        ).toFixed(3)}
                      </strong>
                    </div>
                    <div className="bg-[#FFFFFF] p-2.5 rounded-lg border border-[#D8DCD8]">
                      <span className="text-[#5F625F] block text-[10px]">TOP CANDIDATE:</span>
                      <strong className="text-[#252525]">{experimentResult.prediction}</strong>
                    </div>
                    <div className="bg-[#FFFFFF] p-2.5 rounded-lg border border-[#D8DCD8]">
                      <span className="text-[#5F625F] block text-[10px]">TOP-1 MARGIN:</span>
                      <strong className="text-[#8C5D17]">{(experimentResult.top1Margin * 100).toFixed(1)}%</strong>
                    </div>
                  </div>

                  {/* Fact Sequence Stored */}
                  <div className="bg-[#FFFFFF] p-3 rounded-lg border border-[#D8DCD8] space-y-1.5">
                    <span className="text-[#5F625F] font-mono text-[10px] uppercase block">
                      STORED FACTS IN CHRONOLOGICAL SEQUENCE:
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                      {currentFacts.map((f, idx) => (
                        <span
                          key={f.key}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                            f.key === config.targetKey
                              ? 'bg-[#E7F2FA] border-[#B8D7ED] text-[#31566E] font-bold'
                              : 'bg-[#F7F5EF] border-[#D8DCD8] text-[#252525]'
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
            <div className="rounded-xl border border-[#D8DCD8] bg-[#FFFFFF] p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-2">
                <span className="font-semibold text-[#252525] text-xs flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4 text-[#8C5D17]" />
                  Distraction & intervening fact overwriting
                </span>
                <SourceBadge type="toy" />
              </div>
              <p className="text-xs text-[#5F625F] font-sans">
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

        {/* Persistent Experiment History Panel (Last 10 Runs) */}
        <ExperimentHistorySidebar
          isOpen={isHistoryOpen}
          onToggle={() => setIsHistoryOpen((v) => !v)}
          currentConfig={config}
          currentPrediction={experimentResult.prediction}
          currentTruth={experimentResult.groundTruth}
          currentScore={experimentResult.retrievalScore}
          currentMargin={experimentResult.top1Margin}
          currentStatus={experimentResult.correct ? 'Correct' : 'Interference'}
          currentMatrixNorm={Math.sqrt(experimentResult.state.reduce((s, v) => s + v * v, 0))}
          onRevert={(rec) => {
            setConfig({ ...rec.config });
          }}
        />
      </div>
    </section>
  );
};

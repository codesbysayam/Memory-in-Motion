import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  AlertOctagon,
  BarChart2,
  TrendingDown,
  Layers,
  Sliders,
  Database,
  Clock,
  Grid,
  ArrowLeftRight,
  Scissors,
  RotateCcw,
  Play,
  Keyboard,
  Zap,
  BookOpen,
  Hash,
  History,
  Compass,
} from 'lucide-react';
import {
  InterferenceLabTutorial,
  INTERFERENCE_TUTORIAL_STEPS,
  TutorialStepSpec,
} from './InterferenceLabTutorial';
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

  // Step-by-step control knob onboarding tutorial state
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem('mm_interference_tutorial_dismissed') !== 'true';
    } catch {
      return true;
    }
  });
  const [tutorialStepIndex, setTutorialStepIndex] = useState<number>(0);

  const activeTutorialKnob = isTutorialOpen
    ? INTERFERENCE_TUTORIAL_STEPS[tutorialStepIndex]?.id
    : null;

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
      <div className="research-container space-y-8">
        <SectionHeader
          number="04"
          category="When memory collides"
          title="Interference, Capacity Limits & Forgetting"
          subtitle="Explore the fundamental trade-off: fixed-size representations eliminate token-by-token KV cache expansion, but packing continuous information inevitably creates interference."
          discovery="As more information is compressed into the same fixed state, representations overlap or decay. Observed in this educational toy model."
        />

        {/* Epistemic Evidence Classification & Experiment ID */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
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

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[var(--text-secondary)] flex items-center gap-1 font-medium">
              <Hash className="w-3.5 h-3.5 text-[var(--accent-blue-text)]" />
              Experiment ID:
            </span>
            <span className="text-[var(--mm-signal)] font-mono font-semibold tabular-nums">
              {experimentId}
            </span>
            <button
              type="button"
              onClick={() => {
                setActiveExperiment('collision');
                setTutorialStepIndex(0);
                setIsTutorialOpen((v) => !v);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border font-medium transition cursor-pointer ${
                isTutorialOpen
                  ? 'bg-[var(--mm-signal-soft)] text-[var(--mm-signal)] border-[var(--mm-signal)]'
                  : 'bg-[var(--surface)] hover:bg-[var(--surface-soft)] text-[var(--text-primary)] border-[var(--border)]'
              }`}
              title="Step-by-step onboarding walkthrough for the 5 lab control knobs"
            >
              <Compass className="w-3.5 h-3.5 text-[var(--mm-signal)]" />
              <span>{isTutorialOpen ? 'Hide knob guide' : 'Knob walkthrough (5 steps)'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsHistoryOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--surface)] hover:bg-[var(--surface-soft)] text-[var(--accent-blue-text)] border border-[var(--border)] font-medium transition cursor-pointer"
              title="Open persistent experiment history panel (last 10 runs)"
            >
              <History className="w-3.5 h-3.5 text-[var(--accent-blue-text)]" />
              <span>Experiment history</span>
            </button>
          </div>
        </div>

        {/* Step-by-step Onboarding Tutorial for Control Knobs */}
        <InterferenceLabTutorial
          isOpen={isTutorialOpen}
          currentStepIndex={tutorialStepIndex}
          config={config}
          onStepChange={(idx) => {
            setActiveExperiment('collision');
            setTutorialStepIndex(idx);
          }}
          onApplyExample={(patch: Partial<InterferenceConfig>, stepSpec: TutorialStepSpec) => {
            setActiveExperiment('collision');
            const nextCfg: InterferenceConfig = { ...config, ...patch };
            setConfig(nextCfg);
            setNotebookEntries((prev) => [
              {
                id: `entry-tut-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString(),
                type: 'preset',
                title: `Tutorial Example (${stepSpec.knobName})`,
                detail: `${stepSpec.exampleLabel} applied: D=${nextCfg.dimension}, L=${nextCfg.sequenceLength}, λ=${Math.round(nextCfg.retention * 100)}%, σ=${Math.round(nextCfg.interference * 100)}%.`,
                tags: ['Walkthrough', stepSpec.id],
              },
              ...prev,
            ]);
            setLastActionToast({
              message: `Applied tutorial example: ${stepSpec.exampleLabel}`,
              timestamp: Date.now(),
            });
          }}
          onClose={() => {
            setIsTutorialOpen(false);
            try {
              localStorage.setItem('mm_interference_tutorial_dismissed', 'true');
            } catch {
              // ignore storage restriction
            }
          }}
          onComplete={() => {
            setIsTutorialOpen(false);
            try {
              localStorage.setItem('mm_interference_tutorial_dismissed', 'true');
            } catch {
              // ignore storage restriction
            }
            setLastActionToast({
              message: 'Completed 5-step Interference Lab control knob walkthrough',
              timestamp: Date.now(),
            });
          }}
        />
      </div>

      {/* High-Contrast Dark Experiment Theatre for Break Lab */}
      <div className="essay-night-band border-y border-[var(--mm-rule)] py-8 sm:py-10">
        <div className="research-container space-y-6">
        {/* Preset Experiments Strip (Hairline) */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-y border-[var(--mm-rule)] text-xs">
          <span className="font-mono text-[var(--text-muted)]">Quick presets:</span>
          <div className="flex flex-wrap items-center gap-2">
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="btn-secondary text-xs py-1 px-2.5 min-h-[30px]"
                title={preset.desc}
              >
                {preset.label}
              </button>
            ))}
            <button
              type="button"
              onClick={handleRerun}
              className="flex items-center gap-1.5 px-3 py-1 rounded border border-[var(--color-success-border)] bg-[var(--accent-green)] text-[var(--accent-green-text)] hover:opacity-90 transition-all text-xs font-semibold cursor-pointer min-h-[30px]"
              title="Re-run the current experiment and log observation to notebook (Enter)"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Re-run</span>
              <kbd className="text-[10px] px-1 rounded bg-[var(--surface)] border border-[var(--color-success-border)] font-mono">↵</kbd>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="btn-secondary text-xs py-1 px-2.5 min-h-[30px]"
              title="Reset all parameters to default baseline (R)"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
              <kbd className="text-[10px] px-1 rounded bg-[var(--surface-soft)] border border-[var(--mm-rule)] font-mono">R</kbd>
            </button>
          </div>
        </div>

        {/* Quiet Shortcut Hint & Action Feedback */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-[var(--text-muted)]">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <span className="inline-flex items-center gap-1.5 text-[var(--text-secondary)]">
              <Keyboard className="w-3.5 h-3.5 text-[var(--mm-signal)]" />
              <span>Lab keys:</span>
            </span>
            <span><kbd className="px-1 py-0.5 rounded border border-[var(--mm-rule)] bg-[var(--surface)] text-[var(--text-primary)]">R</kbd> reset</span>
            <span><kbd className="px-1 py-0.5 rounded border border-[var(--mm-rule)] bg-[var(--surface)] text-[var(--text-primary)]">↵</kbd> re-run</span>
            <span><kbd className="px-1 py-0.5 rounded border border-[var(--mm-rule)] bg-[var(--surface)] text-[var(--text-primary)]">1-4</kbd> D∈&#123;4,8,16,32&#125;</span>
          </div>

          {lastActionToast && (
            <div className="flex items-center gap-1.5 text-[var(--mm-teal)] font-sans font-medium text-xs ml-auto">
              <Zap className="w-3 h-3" />
              <span>{lastActionToast.message}</span>
            </div>
          )}
        </div>

        {/* Hairline Experiment Tab Selector */}
        <div className="flex flex-wrap items-center gap-5 border-b border-[var(--mm-rule)] text-xs font-sans">
          {[
            { id: 'pipeline', label: '0. Write & read', icon: Database },
            { id: 'collision', label: '1. When memory collides', icon: TrendingDown },
            { id: 'capacity', label: '2. Capacity limits', icon: BarChart2 },
            { id: 'distraction', label: '3. Distraction', icon: AlertOctagon },
            { id: 'decay', label: '4. Decay rate', icon: Clock },
            { id: 'sweep', label: '5. 2D sweep', icon: Grid },
            { id: 'ab_compare', label: '6. KV vs recurrent', icon: ArrowLeftRight },
            { id: 'surgery', label: '7. Memory surgery', icon: Scissors },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeExperiment === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveExperiment(tab.id as any)}
                className={`flex items-center gap-1.5 pb-3 -mb-px border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-[var(--mm-signal)] text-[var(--text-primary)] font-semibold'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[var(--mm-signal)]' : ''}`} />
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
                <div className="essay-figure-stage p-5 space-y-5">
                  <div className="flex items-center justify-between border-b border-[var(--mm-rule)] pb-2.5">
                    <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-[var(--accent-blue-text)]" />
                      Collision procedure
                    </span>
                    <SourceBadge type="toy" />
                  </div>

                  {/* 5-Step Scientific Procedure (Hairline) */}
                  <div className="border-y border-[var(--mm-rule)] py-3 text-xs text-[var(--text-secondary)] space-y-1.5">
                    <div className="text-[var(--text-primary)] font-semibold font-sans">Experimental protocol:</div>
                    <div className="space-y-0.5">
                      <div>1. Learn fact A ("{config.targetKey} → {experimentResult.groundTruth}").</div>
                      <div>2. Learn {config.sequenceLength - 1} unrelated country-capital pairs.</div>
                      <div>3. Query fact A ("{config.targetKey}") again.</div>
                      <div>4. Increase sequence length or interference.</div>
                      <div>5. Observe retrieval score and output flip.</div>
                    </div>
                  </div>

                  {/* Dimension selector: 4, 8, 16, 32 */}
                  <div
                    data-tutorial-knob="dimension"
                    className={`space-y-1.5 transition-all rounded-md ${
                      activeTutorialKnob === 'dimension'
                        ? 'ring-2 ring-[var(--mm-signal)] bg-[var(--mm-signal-soft)]/30 p-2.5 -mx-2.5'
                        : ''
                    }`}
                  >
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--text-secondary)] flex items-center gap-1 font-sans">
                        State dimension (<InlineMath math="D" />):
                      </span>
                      <span className="font-mono text-[var(--accent-blue-text)] font-bold tabular-nums">D = {config.dimension}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 font-mono">
                      {[4, 8, 16, 32].map((d) => (
                        <button
                          key={d}
                          onClick={() => setConfig((prev) => ({ ...prev, dimension: d }))}
                          className={`py-2 rounded-md border text-center transition-all cursor-pointer tabular-nums ${
                            config.dimension === d
                              ? 'border-[var(--accent-blue-text)] bg-[var(--accent-blue)] text-[var(--accent-blue-text)] font-bold'
                              : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          D={d}
                        </button>
                      ))}
                    </div>
                    <span className="text-[11px] text-[var(--text-secondary)] block">
                      Allocates a fixed <InlineMath math={`${config.dimension} \\times ${config.dimension}`} /> outer-product state matrix.
                    </span>
                  </div>

                  {/* Sequence Length Slider */}
                  <div
                    data-tutorial-knob="sequenceLength"
                    className={`transition-all rounded-md ${
                      activeTutorialKnob === 'sequenceLength'
                        ? 'ring-2 ring-[var(--mm-signal)] bg-[var(--mm-signal-soft)]/30 p-2.5 -mx-2.5'
                        : ''
                    }`}
                  >
                    <ControlSlider
                      id="lab-sequence-length"
                      label="Sequence Length"
                      value={config.sequenceLength}
                      min={2}
                      max={14}
                      step={1}
                      unit=" facts"
                      onChange={(val) => setConfig((prev) => ({ ...prev, sequenceLength: val }))}
                      description="Total facts packed into state before testing Japan."
                    />
                  </div>

                  {/* Retention Slider */}
                  <div
                    data-tutorial-knob="retention"
                    className={`transition-all rounded-md ${
                      activeTutorialKnob === 'retention'
                        ? 'ring-2 ring-[var(--mm-signal)] bg-[var(--mm-signal-soft)]/30 p-2.5 -mx-2.5'
                        : ''
                    }`}
                  >
                    <ControlSlider
                      id="lab-retention"
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
                    />
                  </div>

                  {/* Interference Perturbation Slider */}
                  <div
                    data-tutorial-knob="interference"
                    className={`transition-all rounded-md ${
                      activeTutorialKnob === 'interference'
                        ? 'ring-2 ring-[var(--mm-signal)] bg-[var(--mm-signal-soft)]/30 p-2.5 -mx-2.5'
                        : ''
                    }`}
                  >
                    <ControlSlider
                      id="lab-interference"
                      label="Interference Perturbation"
                      value={Math.round(config.interference * 100)}
                      min={0}
                      max={60}
                      step={5}
                      unit="%"
                      onChange={(val) => setConfig((prev) => ({ ...prev, interference: val / 100 }))}
                      description="Controlled perturbation applied to stored representations."
                    />
                  </div>

                  {/* Reproducible Seed + Action Controls */}
                  <div
                    data-tutorial-knob="seedActions"
                    className={`space-y-3 pt-2 border-t border-[var(--border)] transition-all rounded-md ${
                      activeTutorialKnob === 'seedActions'
                        ? 'ring-2 ring-[var(--mm-signal)] bg-[var(--mm-signal-soft)]/30 p-2.5 -mx-2.5'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-secondary)] font-sans text-xs">Deterministic seed:</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={config.seed}
                          onChange={(e) => setConfig((prev) => ({ ...prev, seed: Number(e.target.value) || 42 }))}
                          className="w-20 bg-[var(--surface-soft)] border border-[var(--border)] rounded-md px-2 py-1 text-center text-[var(--accent-blue-text)] font-mono text-xs tabular-nums focus:outline-hidden focus:border-[var(--accent-blue-text)]"
                        />
                        <button
                          onClick={() => setConfig((prev) => ({ ...prev, seed: prev.seed + 1 }))}
                          className="px-2 py-1 rounded-md bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs cursor-pointer"
                          title="Increment seed"
                        >
                          +1
                        </button>
                      </div>
                    </div>

                    {/* Metadata Stats Strip (Hairline Divided) */}
                    <div className="grid grid-cols-4 border-y border-[var(--mm-rule)] divide-x divide-[var(--mm-rule)] text-xs text-center font-mono tabular-nums py-2">
                      <div className="px-2">
                        <span className="text-[var(--text-muted)] block text-[10px]">CAPACITY</span>
                        <strong className="text-[var(--text-primary)]">D={config.dimension}</strong>
                      </div>
                      <div className="px-2">
                        <span className="text-[var(--text-muted)] block text-[10px]">RETENTION</span>
                        <strong className="text-[var(--text-primary)]">{Math.round(config.retention * 100)}%</strong>
                      </div>
                      <div className="px-2">
                        <span className="text-[var(--text-muted)] block text-[10px]">PERTURB</span>
                        <strong className="text-[var(--text-primary)]">{Math.round(config.interference * 100)}%</strong>
                      </div>
                      <div className="px-2">
                        <span className="text-[var(--text-muted)] block text-[10px]">STATUS</span>
                        <strong className={experimentResult.correct ? 'text-[var(--mm-teal)]' : 'text-[var(--mm-coral)]'}>
                          {experimentResult.correct ? 'CLEAN' : 'COLLISION'}
                        </strong>
                      </div>
                    </div>

                    {/* Action Buttons: Re-run & Reset */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={handleRerun}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-md border border-[var(--color-success-border)] bg-[var(--accent-green)] hover:opacity-90 text-[var(--accent-green-text)] font-sans text-xs font-semibold transition-all cursor-pointer"
                        title="Re-run the current experiment and log observation to notebook (Enter)"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Re-run trial</span>
                        <kbd className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--surface)] border border-[var(--color-success-border)] text-[var(--accent-green-text)] font-mono">↵</kbd>
                      </button>
                      <button
                        onClick={handleReset}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-md border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-soft)] text-[var(--text-secondary)] font-sans text-xs font-semibold transition-all cursor-pointer"
                        title="Reset lab to default baseline parameters (R)"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset lab</span>
                        <kbd className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--surface-soft)] border border-[var(--border)] text-[var(--text-secondary)] font-mono">R</kbd>
                      </button>
                    </div>

                    {/* Record Observation to Notebook Button */}
                    <button
                      onClick={handleRecordNotebook}
                      className="w-full flex items-center justify-center gap-2 py-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-soft)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-sans text-xs transition-all cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[var(--accent-blue-text)]" />
                      <span>Log observation to notebook</span>
                    </button>
                  </div>
                </div>

                {/* Automatic Failure Explanation (Hairline Strip) */}
                {failureExplanation && (
                  <div className="border-t-2 border-[var(--color-danger)] bg-[var(--accent-pink)]/40 p-4 space-y-3 font-sans text-xs">
                    <div className="flex items-center gap-2 text-[var(--accent-pink-text)] font-bold">
                      <AlertOctagon className="w-4 h-4" />
                      <span>Interference explanation</span>
                    </div>

                    <div className="grid grid-cols-2 border-y border-[var(--color-danger-border)] divide-x divide-y divide-[var(--color-danger-border)] font-mono tabular-nums">
                      <div className="p-2">
                        <span className="text-[var(--text-muted)] block text-[10px]">TARGET:</span>
                        <span className="text-[var(--text-primary)] font-semibold">{failureExplanation.target}</span>
                      </div>
                      <div className="p-2">
                        <span className="text-[var(--text-muted)] block text-[10px]">RETRIEVED:</span>
                        <span className="text-[var(--accent-pink-text)] font-semibold">{failureExplanation.retrieved}</span>
                      </div>
                      <div className="p-2">
                        <span className="text-[var(--text-muted)] block text-[10px]" title="Cosine similarity between retrieved vector and candidate.">RETRIEVAL SCORE:</span>
                        <span className="text-[var(--accent-blue-text)] font-semibold">{failureExplanation.score}%</span>
                      </div>
                      <div className="p-2">
                        <span className="text-[var(--text-muted)] block text-[10px]" title="Difference between highest and second-highest candidate score.">TOP-1 MARGIN:</span>
                        <span className="text-[var(--accent-yellow-text)] font-semibold">{failureExplanation.margin}%</span>
                      </div>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
                      {failureExplanation.narrative}
                    </p>
                    <span className="text-[11px] text-[var(--text-muted)] italic block">
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
                <figure className="essay-figure-stage p-5 space-y-4 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--mm-rule)] pb-2.5">
                    <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5 font-sans">
                      <TrendingDown className="w-4 h-4 text-[var(--accent-blue-text)]" />
                      Live curve: retrieval score by sequence length
                    </span>
                    <span className="text-xs text-[var(--text-secondary)] font-mono">Target: "{config.targetKey}"</span>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] font-sans">
                    Each row runs the deterministic engine with <InlineMath math={`D = ${config.dimension}`} />, retention <InlineMath math={`\\lambda = ${config.retention}`} />, and perturbation <InlineMath math={`${Math.round(config.interference * 100)}\\%`} /> across different fact load lengths.
                  </p>

                  {/* Hairline Graph Rows */}
                  <div className="divide-y divide-[var(--mm-rule)] border-y border-[var(--mm-rule)] max-h-[380px] overflow-y-auto font-mono tabular-nums">
                    {liveCurveData.map((pt) => {
                      const isSelected = pt.length === config.sequenceLength;
                      const scorePct = Math.round(pt.score * 100);

                      return (
                        <button
                          key={pt.length}
                          type="button"
                          onClick={() => setConfig((prev) => ({ ...prev, sequenceLength: pt.length }))}
                          className={`w-full text-left py-2.5 px-3 cursor-pointer transition-colors block ${
                            isSelected
                              ? 'bg-[var(--accent-blue)]/60'
                              : 'hover:bg-[var(--surface-soft)]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
                            <span className="font-semibold text-[var(--text-primary)]">
                              Length = {pt.length} facts{' '}
                              {isSelected && <span className="text-[var(--mm-signal)] text-[11px] font-bold font-sans">(Current)</span>}
                            </span>
                            <span className="flex items-center gap-2.5">
                              <span className={pt.correct ? 'text-[var(--accent-green-text)] font-medium' : 'text-[var(--accent-pink-text)] font-medium'}>
                                → {pt.prediction}
                              </span>
                              <span className="text-[var(--text-secondary)]" title="Cosine similarity between retrieved vector and candidate.">
                                ({scorePct}%)
                              </span>
                              <span
                                className={`text-[11px] font-sans font-semibold ${
                                  pt.correct ? 'text-[var(--accent-green-text)]' : 'text-[var(--accent-pink-text)]'
                                }`}
                              >
                                {pt.correct ? '● Correct' : '▲ Collision'}
                              </span>
                            </span>
                          </div>

                          {/* Retrieval Score Bar */}
                          <div className="w-full bg-[var(--mm-rule)] h-1 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                pt.correct ? 'bg-[var(--color-success)]' : 'bg-[var(--color-danger)]'
                              }`}
                              style={{ width: `${Math.max(5, Math.min(100, scorePct))}%` }}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Educational Model Principle */}
                  <div className="pt-1 text-xs text-[var(--text-secondary)] space-y-1 font-sans">
                    <span className="text-[var(--text-primary)] font-semibold block">Educational model principle:</span>
                    <p>
                      A fixed-size state matrix (<InlineMath math="D \times D" />) has a finite capacity <InlineMath math="\mathcal{O}(D)" />. As more facts are packed via outer-product superposition, early facts either decay or overlap geometrically, creating crosstalk that eventually flips the nearest-neighbor retrieval.
                    </p>
                    <span className="text-[var(--mm-signal)] italic text-[11px]">Observed in this educational toy model.</span>
                  </div>
                </figure>
              </div>
            </div>

            {/* REAL MATRIX & STATE INSPECTOR */}
            <figure className="essay-figure-stage p-5 space-y-5 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--mm-rule)] pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[var(--accent-blue-text)]" />
                  <span className="font-sans font-semibold text-[var(--text-primary)] text-sm">
                    Actual recorded matrix state (<InlineMath math={`M \\in \\mathbb{R}^{${config.dimension} \\times ${config.dimension}}`} />)
                  </span>
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  Hover or click cell to inspect coordinate values &amp; updates
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Matrix Heatmap (7 cols) */}
                <div className="lg:col-span-7 space-y-2">
                  <div className="overflow-x-auto p-3 bg-[var(--color-matrix-bg)] rounded-lg border border-[var(--color-matrix-border)]">
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
                              className={`aspect-square rounded-xs text-[9px] font-mono tabular-nums flex items-center justify-center transition-all text-[var(--color-matrix-ink)] ${
                                isHovered ? 'ring-2 ring-[var(--color-matrix-ink)] z-10' : ''
                              }`}
                              style={{
                                backgroundColor: isPos
                                  ? `rgba(76, 154, 255, ${Math.max(0.18, absVal * 0.9)})`
                                  : `rgba(229, 98, 90, ${Math.max(0.18, absVal * 0.9)})`,
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
                  <div className="flex justify-between items-center text-[11px] text-[var(--text-secondary)]">
                    <span>Row = Key vector space (<InlineMath math="k_i" />)</span>
                    <span>Col = Value vector space (<InlineMath math="v_j" />)</span>
                  </div>
                </div>

                {/* Cell Inspector & State Summary (5 cols - Hairline) */}
                <div className="lg:col-span-5 space-y-4 font-sans text-xs">
                  <div className="border-b border-[var(--mm-rule)] pb-3 space-y-1.5">
                    <span className="text-[var(--text-muted)] font-mono text-[11px] uppercase tracking-wider block">
                      Coordinate inspector
                    </span>
                    {selectedMatrixCell ? (
                      <div className="space-y-1 font-mono tabular-nums">
                        <div className="text-[var(--text-primary)] text-sm font-bold">
                          M[{selectedMatrixCell.r}, {selectedMatrixCell.c}] = {selectedMatrixCell.val.toFixed(6)}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)]">
                          Polarity: {selectedMatrixCell.val >= 0 ? 'Excitatory (Positive)' : 'Inhibitory (Negative)'}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)]">
                          Step history: {experimentResult.history.length} writes recorded
                        </div>
                      </div>
                    ) : (
                      <div className="text-[var(--text-secondary)] italic text-xs">
                        Hover or tap any matrix cell on the left to inspect its exact float value.
                      </div>
                    )}
                  </div>

                  {/* State Statistics (Hairline 2x2) */}
                  <div className="grid grid-cols-2 border-y border-[var(--mm-rule)] divide-x divide-y divide-[var(--mm-rule)] font-mono text-xs tabular-nums">
                    <div className="p-2.5">
                      <span className="text-[var(--text-muted)] block text-[10px]">TOTAL FACTS PACKED:</span>
                      <strong className="text-[var(--text-primary)]">{config.sequenceLength} facts</strong>
                    </div>
                    <div className="p-2.5">
                      <span className="text-[var(--text-muted)] block text-[10px]">FROBENIUS MATRIX NORM:</span>
                      <strong className="text-[var(--accent-blue-text)]">
                        {Math.sqrt(
                          experimentResult.matrix.reduce((acc, row) => acc + row.reduce((s, v) => s + v * v, 0), 0)
                        ).toFixed(3)}
                      </strong>
                    </div>
                    <div className="p-2.5">
                      <span className="text-[var(--text-muted)] block text-[10px]">TOP CANDIDATE:</span>
                      <strong className="text-[var(--text-primary)]">{experimentResult.prediction}</strong>
                    </div>
                    <div className="p-2.5">
                      <span className="text-[var(--text-muted)] block text-[10px]">TOP-1 MARGIN:</span>
                      <strong className="text-[var(--accent-yellow-text)]">{(experimentResult.top1Margin * 100).toFixed(1)}%</strong>
                    </div>
                  </div>

                  {/* Fact Sequence Stored */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[var(--text-muted)] font-mono text-[10px] uppercase tracking-wider block">
                      Stored facts in chronological sequence
                    </span>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 max-h-20 overflow-y-auto font-mono text-[11px] tabular-nums">
                      {currentFacts.map((f, idx) => (
                        <span
                          key={f.key}
                          className={
                            f.key === config.targetKey
                              ? 'text-[var(--mm-signal)] font-bold underline decoration-[var(--mm-signal)]/40 underline-offset-4'
                              : 'text-[var(--text-secondary)]'
                          }
                        >
                          #{idx + 1} {f.key} → {f.value}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </figure>

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
            <div className="essay-figure-stage p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--mm-rule)] pb-2.5">
                <span className="font-semibold text-[var(--text-primary)] text-xs flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4 text-[var(--accent-yellow-text)]" />
                  Distraction &amp; intervening fact overwriting
                </span>
                <SourceBadge type="toy" />
              </div>
              <p className="text-xs text-[var(--text-secondary)] font-sans">
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
        </div>
      </div>

      <div className="research-container space-y-6 pt-8">
        {/* Scientific Evidence & Honesty Panel */}
        <div className="pt-2">
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

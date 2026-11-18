import React, { useState, useMemo, useEffect } from 'react';
import {
  RotateCcw,
  Sliders,
  Search,
  Copy,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  TrendingUp,
} from 'lucide-react';
import { CANONICAL_FACTS, Fact, vector } from '../models/associativeMemory';
import { runMemoryExperiment } from '../models/experimentEngine';
import { useExperiment } from '../context/ExperimentContext';
import { InlineMath, BlockMath, FormattedMathText } from './ui/MathView';
import { GlossaryTerm } from './GlossaryTerm';
import { SectionHeader } from './ui/SectionHeader';
import { SourceBadge } from './ui/SourceBadge';
import { MemoryInspector } from './MemoryInspector';
import { ControlSlider } from './ui/ControlSlider';
import { StateDiff } from './StateDiff';
import { StateInspector } from './StateInspector';
import { MemoryTension } from './MemoryTension';
import { MemoryLens } from './MemoryLens';
import { ExperimentNotebook, NotebookEntry } from './ExperimentNotebook';
import { MemoryWriteRead } from './MemoryWriteRead';
import { RepresentationInspector } from './RepresentationInspector';
import { StatePersistenceExperiment } from './StatePersistenceExperiment';
import { MemoryOverwriteExperiment } from './MemoryOverwriteExperiment';
import { ContextOrderExperiment } from './ContextOrderExperiment';

interface RunSnapshot {
  dimension: number;
  factsCount: number;
  retention: number;
  interference: number;
  confidence: number;
  correct: boolean;
  prediction: string;
}

export const Section03RecurrentMemory: React.FC = () => {
  // Global Experiment Configuration (Single Source of Truth)
  const { config, updateConfig } = useExperiment();

  const memoryDim = config.dimension;
  const retentionPct = Math.round(config.retention * 100);
  const writeStrength = config.writeStrength;
  const interferencePct = Math.round(config.interference * 100);
  const distractorCount = config.distractors;

  // Local Sequence & Probe Navigation State
  const [sequenceLength, setSequenceLength] = useState<number>(5);
  const [selectedQuery, setSelectedQuery] = useState<string>('Japan');
  const [activeStep, setActiveStep] = useState<number>(5);

  // Controlled Mode: One Variable at a Time
  const [isControlledMode, setIsControlledMode] = useState<boolean>(false);
  const [baselineConfig, setBaselineConfig] = useState<{
    memoryDim: number;
    sequenceLength: number;
    retentionPct: number;
    writeStrength: number;
    interferencePct: number;
    distractorCount: number;
    selectedQuery: string;
  } | null>(null);
  const [controlledWarning, setControlledWarning] = useState<string | null>(null);

  // Compare Before / After state tracking
  const [prevSnapshot, setPrevSnapshot] = useState<RunSnapshot | null>(null);

  // Copy and Share feedback
  const [copiedConfig, setCopiedConfig] = useState<boolean>(false);
  const [copiedResult, setCopiedResult] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  // Mechanistic Workbench Sub-module Tab
  const [workbenchTab, setWorkbenchTab] = useState<'pipeline' | 'persistence' | 'order' | 'overwrite' | 'representations'>('pipeline');

  // Progressive Disclosure: Active Instrument View (Audit Item 7)
  const [activeInstrumentView, setActiveInstrumentView] = useState<'matrix' | 'analyze' | 'configure'>('matrix');

  // Compact Parameter Sidebar: Collapsible secondary conditions (Audit Item 16)
  const [showSecondaryParams, setShowSecondaryParams] = useState<boolean>(false);

  // Experiment Notebook Logs
  const [notebookEntries, setNotebookEntries] = useState<NotebookEntry[]>([
    {
      id: 'init-01',
      timestamp: '12:00',
      type: 'run',
      title: 'Baseline experiment initiated',
      detail: 'D=16, 5 facts, λ=0.95, query Japan → Tokyo (High confidence)',
    },
  ]);

  const addNotebookEntry = (entry: Omit<NotebookEntry, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setNotebookEntries((prev) => [
      {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: timeStr,
        ...entry,
      },
      ...prev.slice(0, 24), // keep up to 25 latest
    ]);
  };

  // Parse URL query params on page load for reproducible shareable experiment state
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search) {
      try {
        const params = new URLSearchParams(window.location.search);
        const updates: Partial<typeof config> = {};
        const d = parseInt(params.get('dim') || '', 10);
        if ([4, 8, 16, 32].includes(d)) updates.dimension = d;
        const seq = parseInt(params.get('facts') || '', 10);
        if (seq >= 1 && seq <= 15) setSequenceLength(seq);
        const ret = parseInt(params.get('retention') || '', 10);
        if (ret >= 10 && ret <= 100) updates.retention = ret / 100;
        const interf = parseInt(params.get('interference') || '', 10);
        if (interf >= 0 && interf <= 60) updates.interference = interf / 100;
        const dist = parseInt(params.get('distractors') || '', 10);
        if (dist >= 0 && dist <= 15) updates.distractors = dist;
        const q = params.get('query');
        if (q) setSelectedQuery(q);

        if (Object.keys(updates).length > 0) {
          updateConfig(updates);
        }
      } catch (err) {
        console.warn('Could not parse experiment URL params', err);
      }
    }
  }, [updateConfig]);

  // Generate sequence of facts including distractors
  const activeFacts = useMemo(() => {
    const core = CANONICAL_FACTS.slice(0, Math.min(sequenceLength, 5));
    const extended = CANONICAL_FACTS.slice(5, sequenceLength);

    const distractors: Fact[] = Array.from({ length: distractorCount }, (_, i) => ({
      key: `Item_${i + 1}`,
      value: `Code_${((i * 37 + 13) % 90) + 10}`,
      category: 'Distractor',
    }));

    const combined = [...core, ...extended, ...distractors];

    if (!combined.some((f) => f.key === selectedQuery)) {
      combined.push({
        key: selectedQuery,
        value: CANONICAL_FACTS.find((f) => f.key === selectedQuery)?.value ?? 'Value',
        category: 'Custom',
      });
    }

    return combined;
  }, [sequenceLength, distractorCount, selectedQuery]);

  // Keep activeStep clamped within activeFacts range
  useEffect(() => {
    if (activeStep > activeFacts.length) {
      setActiveStep(activeFacts.length);
    }
  }, [activeFacts.length, activeStep]);

  // Adjust effective retention based on interference
  const effectiveRetention = useMemo(() => {
    const raw = config.retention;
    const interferenceLoss = config.interference * 0.4;
    return Math.max(0.1, Number((raw - interferenceLoss).toFixed(3)));
  }, [config.retention, config.interference]);

  // Run deterministic associative memory experiment
  const experimentResult = useMemo(() => {
    return runMemoryExperiment(
      activeFacts,
      selectedQuery,
      config.dimension,
      effectiveRetention,
      config.writeStrength
    );
  }, [activeFacts, selectedQuery, config.dimension, effectiveRetention, config.writeStrength]);

  const groundTruth = activeFacts.find((f) => f.key === selectedQuery)?.value ?? 'UNKNOWN';

  // Snapshot tracking for before/after comparison
  const currentSnapshot: RunSnapshot = useMemo(() => ({
    dimension: config.dimension,
    factsCount: activeFacts.length,
    retention: retentionPct,
    interference: interferencePct,
    confidence: Number((experimentResult.confidence * 100).toFixed(1)),
    correct: experimentResult.correct,
    prediction: experimentResult.prediction,
  }), [config.dimension, activeFacts.length, retentionPct, interferencePct, experimentResult]);

  // Controlled Mode Logic: check which variables changed
  const controlledDeltas = useMemo(() => {
    if (!isControlledMode || !baselineConfig) return null;

    const changed: { name: string; base: string | number; curr: string | number }[] = [];
    if (baselineConfig.memoryDim !== memoryDim) {
      changed.push({ name: 'Dimension', base: baselineConfig.memoryDim, curr: memoryDim });
    }
    if (baselineConfig.sequenceLength !== sequenceLength) {
      changed.push({ name: 'Sequence Length', base: baselineConfig.sequenceLength, curr: sequenceLength });
    }
    if (baselineConfig.retentionPct !== retentionPct) {
      changed.push({ name: 'Retention', base: `${baselineConfig.retentionPct}%`, curr: `${retentionPct}%` });
    }
    if (baselineConfig.interferencePct !== interferencePct) {
      changed.push({ name: 'Interference', base: `${baselineConfig.interferencePct}%`, curr: `${interferencePct}%` });
    }
    if (baselineConfig.distractorCount !== distractorCount) {
      changed.push({ name: 'Distractors', base: baselineConfig.distractorCount, curr: distractorCount });
    }
    if (baselineConfig.selectedQuery !== selectedQuery) {
      changed.push({ name: 'Query Target', base: baselineConfig.selectedQuery, curr: selectedQuery });
    }

    return changed;
  }, [
    isControlledMode,
    baselineConfig,
    memoryDim,
    sequenceLength,
    retentionPct,
    interferencePct,
    distractorCount,
    selectedQuery,
  ]);

  // Controlled Mode activation
  const toggleControlledMode = () => {
    if (!isControlledMode) {
      setBaselineConfig({
        memoryDim,
        sequenceLength,
        retentionPct,
        writeStrength,
        interferencePct,
        distractorCount,
        selectedQuery,
      });
      setIsControlledMode(true);
      setControlledWarning(null);
      addNotebookEntry({
        type: 'preset',
        title: 'Controlled Mode Activated',
        detail: `Baseline frozen at D=${memoryDim}, Seq=${sequenceLength}, λ=${retentionPct}%`,
      });
    } else {
      setIsControlledMode(false);
      setBaselineConfig(null);
      setControlledWarning(null);
    }
  };

  const resetBaseline = () => {
    if (baselineConfig) {
      updateConfig({
        dimension: baselineConfig.memoryDim,
        retention: baselineConfig.retentionPct / 100,
        writeStrength: baselineConfig.writeStrength,
        interference: baselineConfig.interferencePct / 100,
        distractors: baselineConfig.distractorCount,
      });
      setSequenceLength(baselineConfig.sequenceLength);
      setSelectedQuery(baselineConfig.selectedQuery);
      setControlledWarning(null);
      addNotebookEntry({
        type: 'preset',
        title: 'Baseline Reset',
        detail: 'Restored original controlled variables.',
      });
    }
  };

  // Compute the true mathematical state vector: v_j = sum_i q_i * M_ij for StateDiff & StateInspector
  const qVec = useMemo(() => vector(selectedQuery, config.dimension), [selectedQuery, config.dimension]);

  const { prevStateVector, currStateVector, currentInputDesc, stateVectorNorm } = useMemo(() => {
    const hist = experimentResult.history;
    const step = Math.min(activeStep, hist.length);
    const d = config.dimension;

    const currMat = step > 0 && hist[step - 1] ? hist[step - 1] : Array.from({ length: d }, () => Array(d).fill(0));
    const prevMat = step > 1 && hist[step - 2] ? hist[step - 2] : Array.from({ length: d }, () => Array(d).fill(0));

    // True mathematical vector-matrix multiplication: v_hat = q^T * M
    const currVec = Array(d).fill(0);
    const prevVec = Array(d).fill(0);
    for (let j = 0; j < d; j++) {
      for (let i = 0; i < d; i++) {
        currVec[j] += (qVec[i] || 0) * (currMat[i]?.[j] || 0);
        prevVec[j] += (qVec[i] || 0) * (prevMat[i]?.[j] || 0);
      }
    }

    const normVal = Math.sqrt(currVec.reduce((sum, val) => sum + val * val, 0));
    const factAtStep = activeFacts[step - 1];
    const desc = factAtStep ? `${factAtStep.key} → ${factAtStep.value}` : 'Initial state M_0 = 0';

    return {
      prevStateVector: prevVec,
      currStateVector: currVec,
      currentInputDesc: desc,
      stateVectorNorm: normVal,
    };
  }, [experimentResult.history, activeStep, config.dimension, qVec, activeFacts]);

  // Log parameter updates on commit
  const handleParamCommit = (paramName: string, fromVal: string | number, toVal: string | number) => {
    setPrevSnapshot(currentSnapshot);

    // If controlled mode has already changed 1 variable and another is changed
    if (isControlledMode && controlledDeltas && controlledDeltas.length >= 1) {
      const alreadyChanged = controlledDeltas.some((d) => d.name === paramName);
      if (!alreadyChanged) {
        setControlledWarning(
          'CONTROLLED MODE: CHANGE ONE VARIABLE AT A TIME. Causal attribution is weaker when multiple variables vary simultaneously.'
        );
      }
    }

    addNotebookEntry({
      type: 'parameter',
      title: `Changed ${paramName}`,
      detail: `${fromVal} → ${toVal}`,
    });
  };

  // Copy Config
  const handleCopyConfig = () => {
    const config = {
      dimension: memoryDim,
      sequenceLength,
      retention: Number((retentionPct / 100).toFixed(2)),
      interference: Number((interferencePct / 100).toFixed(2)),
      distractors: distractorCount,
      query: selectedQuery,
      writeStrength,
      seed: 42,
    };
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
    addNotebookEntry({
      type: 'preset',
      title: 'Exported Experiment Config',
      detail: `JSON configuration copied to clipboard`,
    });
  };

  // Copy Result
  const handleCopyResult = () => {
    const payload = {
      configuration: {
        dimension: memoryDim,
        retention: effectiveRetention,
        distractors: distractorCount,
        interference: interferencePct / 100,
      },
      query: selectedQuery,
      groundTruth,
      prediction: experimentResult.prediction,
      confidence: Number(experimentResult.confidence.toFixed(4)),
      correct: experimentResult.correct,
      timestamp: new Date().toISOString(),
      experimentId: `EXP-${memoryDim}-${retentionPct}-${distractorCount}`,
    };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedResult(true);
    setTimeout(() => setCopiedResult(false), 2000);
    addNotebookEntry({
      type: 'run',
      title: 'Exported Experiment Result',
      detail: `Query ${selectedQuery} -> ${experimentResult.prediction} (${experimentResult.correct ? 'CORRECT' : 'FAILED'})`,
    });
  };

  // Share Experiment URL
  const handleShareExperiment = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('dim', memoryDim.toString());
    url.searchParams.set('facts', sequenceLength.toString());
    url.searchParams.set('retention', retentionPct.toString());
    url.searchParams.set('interference', interferencePct.toString());
    url.searchParams.set('distractors', distractorCount.toString());
    url.searchParams.set('query', selectedQuery);
    navigator.clipboard.writeText(url.toString());
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  // Track outcome changes
  useEffect(() => {
    if (!experimentResult.correct) {
      addNotebookEntry({
        type: 'failure',
        title: `Retrieval failure observed`,
        detail: `Query "${selectedQuery}" returned "${experimentResult.prediction}" instead of "${groundTruth}" (conf: ${(experimentResult.confidence * 100).toFixed(0)}%)`,
      });
    }
  }, [experimentResult.correct, experimentResult.prediction, selectedQuery, groundTruth]);

  return (
    <section id="section-03" className="scroll-mt-20 border-b border-[var(--border)] bg-[var(--page-bg)] py-16 text-[var(--text-primary)]">
      <div id="section-hebbian-plasticity" className="scroll-mt-24" />
      <div className="w-full space-y-8">
        <SectionHeader
          number="03"
          category="THE FACT-LEARNING LABORATORY"
          title="Sequential Fast-Weight Ingestion & Readout"
          subtitle={
            <span>
              Feed facts into an educational <GlossaryTerm term="associative-memory">associative matrix</GlossaryTerm> via <GlossaryTerm term="Hebbian plasticity">Hebbian updates</GlossaryTerm> <InlineMath math="M_{t+1} = \lambda M_t + \eta k_t v_t^\top" />.
              Query the state via <InlineMath math="\hat{v} = q^\top M" /> and decode predictions via cosine similarity against candidate values.
            </span>
          }
          discovery={
            <span>
              A <GlossaryTerm term="recurrent state">fixed-size recurrent state</GlossaryTerm> superimposes all past updates into <GlossaryTerm term="catastrophic-interference">coordinate superpositions</GlossaryTerm>. Changing <GlossaryTerm term="retention">retention</GlossaryTerm> <InlineMath math="\lambda" />, dimension <InlineMath math="d" />, or distractors immediately shifts retrieval scores <InlineMath math="s_1" /> and margins <InlineMath math="\Delta s" />.
            </span>
          }
        />

        {/* Global Memory Lens Strip */}
        <MemoryLens currentFocus="state" />

        {/* 3. MEMORY AT A GLANCE (Unified hairline telemetry band) */}
        <div className="essay-figure-stage">
          <div className="px-4 sm:px-6 py-3 border-b border-[var(--mm-rule)] text-xs font-mono flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-[var(--text-primary)] font-medium">
              <span>Computed state telemetry</span>
              <span className="text-[var(--mm-signal)]">(<InlineMath math={`\\hat{v} \\in \\mathbb{R}^{${config.dimension}}`} />)</span>
            </span>
            <span className="text-[var(--mm-teal)]">Live deterministic readout</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-[var(--mm-rule)] tabular-nums">
            <div className="p-4 flex flex-col justify-between">
              <span className="text-[var(--text-muted)] text-xs font-mono">Dimension (d)</span>
              <span className="text-2xl font-medium font-mono text-[var(--text-primary)] mt-1">{config.dimension}D</span>
              <span className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
                <InlineMath math={`\\mathbb{R}^{${config.dimension} \\times ${config.dimension}}`} />
              </span>
            </div>

            <div className="p-4 flex flex-col justify-between">
              <span className="text-[var(--text-muted)] text-xs font-mono">Facts stored</span>
              <span className="text-2xl font-medium font-mono text-[var(--mm-signal)] mt-1">{activeFacts.length}</span>
              <span className="text-xs text-[var(--text-muted)] mt-0.5">{distractorCount} distractors</span>
            </div>

            <div className="p-4 flex flex-col justify-between" title="Euclidean norm of retrieved representation vector ||v_hat||">
              <span className="text-[var(--text-muted)] text-xs font-mono">Norm (<InlineMath math="\|\hat{v}\|" />)</span>
              <span className="text-2xl font-medium font-mono text-[var(--text-primary)] mt-1">{stateVectorNorm.toFixed(3)}</span>
              <span className="text-xs text-[var(--text-muted)] mt-0.5">Retrieved energy</span>
            </div>

            <div className="p-4 flex flex-col justify-between" title="Normalized cosine similarity between retrieved state vector and candidate value vector">
              <span className="text-[var(--text-muted)] text-xs font-mono">Score (<InlineMath math="s_1" />)</span>
              <span className={`text-2xl font-medium font-mono mt-1 ${experimentResult.correct ? 'text-[var(--mm-teal)]' : 'text-[var(--mm-coral)]'}`}>
                {experimentResult.retrievalScore.toFixed(3)}
              </span>
              <span className="text-xs text-[var(--text-muted)] font-mono mt-0.5"><InlineMath math="\cos(\hat{v}, v_c)" /></span>
            </div>

            <div className="p-4 flex flex-col justify-between" title="Margin between top candidate score and runner-up: Δs = s_1 - s_2">
              <span className="text-[var(--text-muted)] text-xs font-mono">Margin (<InlineMath math="\Delta s" />)</span>
              <span className={`text-2xl font-medium font-mono mt-1 ${experimentResult.top1Margin > 0.05 ? 'text-[var(--mm-teal)]' : 'text-[var(--mm-coral)]'}`}>
                {experimentResult.top1Margin.toFixed(3)}
              </span>
              <span className="text-xs text-[var(--text-muted)] font-mono mt-0.5"><InlineMath math="s_1 - s_2" /></span>
            </div>

            <div className="p-4 flex flex-col justify-between">
              <span className="text-[var(--text-muted)] text-xs font-mono">Prediction</span>
              <span className={`text-lg font-semibold font-mono mt-1 truncate ${experimentResult.correct ? 'text-[var(--mm-teal)]' : 'text-[var(--mm-coral)]'}`}>
                {experimentResult.prediction}
              </span>
              <span className="text-xs text-[var(--text-muted)] mt-0.5 truncate">Target: {groundTruth}</span>
            </div>
          </div>
        </div>

        {/* 12-Column Control Deck & Experiment Flow with Progressive Disclosure */}
        <div className="experiment-layout">
          {/* Left Column: Compact Sticky Control Sidebar */}
          <div className="experiment-sidebar space-y-4 text-xs">
            <div className="essay-figure-stage p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--mm-rule)] pb-3">
                <h3 className="font-semibold text-sm text-[var(--text-primary)] flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[var(--accent-blue-text)]" />
                  <span>Experiment parameters</span>
                </h3>
                <SourceBadge type="toy" />
              </div>

              {/* Memory Dimension Picker */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs tabular-nums">
                  <span className="text-[var(--text-muted)] font-semibold flex items-center gap-1">
                    <span>Memory dimension</span>
                    <InlineMath math="(d)" />:
                  </span>
                  <span className="text-[var(--accent-blue-text)] font-mono font-bold">{config.dimension}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[4, 8, 16, 32].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        handleParamCommit('Dimension', config.dimension, d);
                        updateConfig({ dimension: d });
                      }}
                      className={`dimension-delta ${config.dimension === d ? 'active' : ''}`}
                    >
                      d={d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sequence Length Slider */}
              <ControlSlider
                label="Sequence length"
                value={sequenceLength}
                min={1}
                max={15}
                step={1}
                unit=" facts"
                onChange={(v) => {
                  handleParamCommit('Sequence Length', sequenceLength, v);
                  setSequenceLength(v);
                }}
                description="Number of sequential knowledge facts ingested."
              />

              {/* Retention Slider */}
              <ControlSlider
                label={<span className="flex items-center gap-1"><span>Retention</span> <InlineMath math="(\lambda)" /></span>}
                value={retentionPct}
                min={10}
                max={100}
                step={5}
                unit="%"
                onChange={(v) => {
                  handleParamCommit('Retention', `${retentionPct}%`, `${v}%`);
                  updateConfig({ retention: v / 100 });
                }}
                description={<FormattedMathText text="Fraction of prior state preserved at each step: $M_t = \lambda M_{t-1}$." />}
              />

              {/* Target Query Selection */}
              <div className="space-y-1.5 pt-2 border-t border-[var(--border)]">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-muted)] flex items-center gap-1 font-semibold">
                    <Search className="w-3.5 h-3.5 text-[var(--accent-blue-text)]" />
                    <span>Probe key query</span>
                    <InlineMath math="(q)" />:
                  </span>
                  <span className="text-[var(--text-primary)] font-bold">{selectedQuery}</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {CANONICAL_FACTS.slice(0, 6).map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => {
                        handleParamCommit('Query', selectedQuery, f.key);
                        setSelectedQuery(f.key);
                      }}
                      className={`py-1.5 px-1.5 rounded-lg border truncate text-center cursor-pointer transition ${
                        selectedQuery === f.key
                          ? 'border-[var(--color-accent)] bg-[var(--accent-blue)] text-[var(--accent-blue-text)] font-bold'
                          : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)]'
                      }`}
                    >
                      {f.key}
                    </button>
                  ))}
                </div>
              </div>

              {/* Collapsible Secondary Conditions Button */}
              <button
                type="button"
                onClick={() => setShowSecondaryParams(!showSecondaryParams)}
                className="btn btn-secondary w-full text-xs py-2 mt-1 flex items-center justify-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5 text-[var(--accent-blue-text)]" />
                <span>{showSecondaryParams ? 'Hide secondary conditions' : 'Change conditions'}</span>
              </button>

              {/* Secondary Parameters */}
              {showSecondaryParams && (
                <div className="space-y-3.5 pt-3 border-t border-[var(--border)]">
                  {/* Controlled Mode Toggle */}
                  <div className="pt-3 border-t border-[var(--mm-rule)] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[var(--text-primary)] text-xs flex items-center gap-1.5">
                        {isControlledMode ? <Lock className="w-3.5 h-3.5 text-[var(--accent-blue-text)]" /> : <Unlock className="w-3.5 h-3.5 text-[var(--text-muted)]" />}
                        Controlled mode
                      </span>
                      <button
                        type="button"
                        onClick={toggleControlledMode}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition border cursor-pointer ${
                          isControlledMode
                            ? 'bg-[var(--accent-blue)] text-[var(--accent-blue-text)] border-[var(--color-accent)]'
                            : 'bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--mm-rule)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {isControlledMode ? 'Active ✓' : 'Enable'}
                      </button>
                    </div>

                    {isControlledMode && (
                      <div className="text-xs space-y-2 pt-2 text-[var(--text-secondary)] border-t border-[var(--mm-rule)]">
                        <div className="flex items-center justify-between">
                          <span>Baseline frozen:</span>
                          <button
                            type="button"
                            onClick={resetBaseline}
                            className="text-[var(--accent-blue-text)] hover:underline text-xs flex items-center gap-1 cursor-pointer font-semibold"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                            Reset
                          </button>
                        </div>

                        {controlledDeltas && controlledDeltas.length > 0 && (
                          <div className="divide-y divide-[var(--mm-rule)] border-y border-[var(--mm-rule)] py-1 tabular-nums">
                            {controlledDeltas.map((d, i) => (
                              <div key={i} className="flex justify-between py-1 text-[var(--text-secondary)]">
                                <span className="text-[var(--accent-blue-text)] font-semibold">{d.name}:</span>
                                <span>{d.base} → <strong className="text-[var(--text-primary)]">{d.curr}</strong></span>
                              </div>
                            ))}
                          </div>
                        )}

                        {controlledWarning && (
                          <div className="py-1.5 px-2.5 rounded-md bg-[var(--accent-yellow)] text-[var(--accent-yellow-text)] text-xs leading-tight flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-[var(--accent-yellow-text)] shrink-0 mt-0.5" />
                            <span>{controlledWarning}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Write Strength */}
                  <ControlSlider
                    label={<span className="flex items-center gap-1"><span>Write strength</span> <InlineMath math="(\eta)" /></span>}
                    value={Math.round(writeStrength * 100)}
                    min={10}
                    max={100}
                    step={5}
                    unit="%"
                    onChange={(val) => {
                      const ws = val / 100;
                      handleParamCommit('Write Strength', writeStrength, ws);
                      updateConfig({ writeStrength: ws });
                    }}
                    description={<FormattedMathText text="Magnitude of outer-product update injected: $\eta k_t v_t^\top$." />}
                  />

                  {/* Interference */}
                  <ControlSlider
                    label={<span className="flex items-center gap-1"><span>Interference</span> <InlineMath math="(\sigma)" /></span>}
                    value={interferencePct}
                    min={0}
                    max={60}
                    step={5}
                    unit="%"
                    onChange={(v) => {
                      handleParamCommit('Interference', `${interferencePct}%`, `${v}%`);
                      updateConfig({ interference: v / 100 });
                    }}
                    description="Perturbation noise added to state coordinates."
                  />

                  {/* Distractor Count */}
                  <ControlSlider
                    label="Distractor facts"
                    value={distractorCount}
                    min={0}
                    max={15}
                    step={1}
                    unit=" items"
                    onChange={(v) => {
                      handleParamCommit('Distractors', distractorCount, v);
                      updateConfig({ distractors: v });
                    }}
                    description="Irrelevant variable bindings loaded into memory."
                  />

                  {/* Copy Config & Copy Result Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border)]">
                    <button
                      type="button"
                      onClick={handleCopyConfig}
                      className="btn btn-secondary text-xs py-1.5 px-2 flex items-center justify-center gap-1.5"
                      title="Copy deterministic experiment configuration JSON"
                    >
                      <Copy className="w-3.5 h-3.5 text-[var(--accent-blue-text)]" />
                      <span>{copiedConfig ? 'Copied ✓' : 'Copy config'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyResult}
                      className="btn btn-secondary text-xs py-1.5 px-2 flex items-center justify-center gap-1.5"
                      title="Copy full experiment outcome payload"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-green-text)]" />
                      <span>{copiedResult ? 'Copied ✓' : 'Copy result'}</span>
                    </button>
                  </div>

                  {/* Share Experiment Button */}
                  <button
                    type="button"
                    onClick={handleShareExperiment}
                    className="btn btn-blue w-full text-xs py-2 flex items-center justify-center gap-1.5"
                    title="Copy shareable URL with parameters"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{copiedShare ? 'URL copied to clipboard ✓' : 'Share experiment URL'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Compare Before / After (Compact Hairline Figure) */}
            {prevSnapshot && (
              <div className="essay-figure-stage p-4 text-xs space-y-3 tabular-nums">
                <div className="flex items-center justify-between border-b border-[var(--mm-rule)] pb-2">
                  <h4 className="font-semibold text-xs text-[var(--text-primary)] flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-[var(--accent-blue-text)]" />
                    <span>Compare before / after</span>
                  </h4>
                  <span className="text-[var(--text-muted)] text-xs font-mono">Live delta</span>
                </div>

                <div className="grid grid-cols-2 divide-x divide-[var(--mm-rule)] border-b border-[var(--mm-rule)] pb-3 text-xs">
                  <div className="pr-3 space-y-1">
                    <span className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider block">Before</span>
                    <div>Dim: <strong className="text-[var(--text-primary)] font-mono">{prevSnapshot.dimension}</strong></div>
                    <div>Score: <strong className="text-[var(--text-primary)] font-mono">{prevSnapshot.confidence}%</strong></div>
                    <div>State: <strong className={prevSnapshot.correct ? 'text-[var(--accent-green-text)]' : 'text-[var(--accent-pink-text)]'}>
                      {prevSnapshot.correct ? 'Match' : 'Miss'}
                    </strong></div>
                  </div>

                  <div className="pl-3 space-y-1">
                    <span className="text-xs text-[var(--mm-signal)] font-mono uppercase tracking-wider block">After</span>
                    <div>Dim: <strong className="text-[var(--text-primary)] font-mono">{currentSnapshot.dimension}</strong></div>
                    <div>Score: <strong className="text-[var(--text-primary)] font-mono">{currentSnapshot.confidence}%</strong></div>
                    <div>State: <strong className={currentSnapshot.correct ? 'text-[var(--accent-green-text)]' : 'text-[var(--accent-pink-text)]'}>
                      {currentSnapshot.correct ? 'Match' : 'Miss'}
                    </strong></div>
                  </div>
                </div>

                <div className="text-xs space-y-0.5">
                  <span className="text-[var(--text-muted)] font-semibold block">What changed?</span>
                  <div className="text-[var(--text-primary)] font-semibold font-mono">
                    {currentSnapshot.confidence - prevSnapshot.confidence >= 0 ? '+' : ''}
                    {(currentSnapshot.confidence - prevSnapshot.confidence).toFixed(1)} pp retrieval score
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    {currentSnapshot.correct !== prevSnapshot.correct
                      ? currentSnapshot.correct
                        ? 'Recovery observed: retrieved correct candidate.'
                        : 'Failure triggered: competing representation caused miss.'
                      : 'Retrieval accuracy status maintained.'}
                  </div>
                </div>
              </div>
            )}

            {/* Experiment Notebook */}
            <ExperimentNotebook
              entries={notebookEntries}
              onClear={() => setNotebookEntries([])}
            />
          </div>

          {/* Right Column: Progressive Disclosure Workspace */}
          <div className="space-y-6">
            {/* Hairline Underline Instrument Switcher */}
            <div className="flex items-center justify-between flex-wrap gap-3 border-b border-[var(--mm-rule)]">
              <div className="flex items-center gap-5">
                <button
                  type="button"
                  onClick={() => setActiveInstrumentView('matrix')}
                  className={`pb-2.5 -mb-px border-b-2 text-xs font-sans font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    activeInstrumentView === 'matrix'
                      ? 'border-[var(--mm-signal)] text-[var(--text-primary)] font-semibold'
                      : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Inspect matrix
                </button>
                <button
                  type="button"
                  onClick={() => setActiveInstrumentView('analyze')}
                  className={`pb-2.5 -mb-px border-b-2 text-xs font-sans font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    activeInstrumentView === 'analyze'
                      ? 'border-[var(--mm-signal)] text-[var(--text-primary)] font-semibold'
                      : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Analyze state
                </button>
                <button
                  type="button"
                  onClick={() => setActiveInstrumentView('configure')}
                  className={`pb-2.5 -mb-px border-b-2 text-xs font-sans font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    activeInstrumentView === 'configure'
                      ? 'border-[var(--mm-signal)] text-[var(--text-primary)] font-semibold'
                      : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Configure
                </button>
              </div>
              <div className="text-xs text-[var(--text-muted)] font-sans pb-2.5 hidden sm:block">
                View: <strong className="text-[var(--text-primary)]">{activeInstrumentView === 'matrix' ? 'Matrix & ingestion timeline' : activeInstrumentView === 'analyze' ? 'State vectors & dimension deltas' : 'Experiment conditions & notebook'}</strong>
              </div>
            </div>

            {/* VIEW 1: INSPECT MATRIX */}
            {activeInstrumentView === 'matrix' && (
              <div className="space-y-6">
                <MemoryInspector
                  facts={activeFacts}
                  queryKey={selectedQuery}
                  dim={memoryDim}
                  retention={effectiveRetention}
                  writeStrength={writeStrength}
                  step={activeStep}
                  onStepChange={setActiveStep}
                />

                <MemoryTension
                  dimension={memoryDim}
                  retention={effectiveRetention}
                  sequenceLength={activeFacts.length}
                  interference={interferencePct / 100}
                />
              </div>
            )}

            {/* VIEW 2: ANALYZE STATE */}
            {activeInstrumentView === 'analyze' && (
              <div className="space-y-6">
                <StateDiff
                  prevState={prevStateVector}
                  currState={currStateVector}
                  stepIndex={activeStep}
                  inputDescription={currentInputDesc}
                />

                <StateInspector
                  history={experimentResult.history}
                  currentState={currStateVector}
                  dimension={memoryDim}
                  currentStep={activeStep}
                />
              </div>
            )}

            {/* VIEW 3: CONFIGURE */}
            {activeInstrumentView === 'configure' && (
              <div className="space-y-6">
                <figure className="essay-figure-stage p-5 sm:p-6 space-y-5">
                  <div className="space-y-1">
                    <h3 className="text-base font-serif font-medium text-[var(--text-primary)]">Experiment parameters &amp; conditions</h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      Adjust variables in the sticky sidebar or review the snapshot logs below. You can test retention factor, write strength, and noise interference under strictly controlled conditions.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[var(--mm-rule)] border-y border-[var(--mm-rule)] tabular-nums">
                    <div className="py-4 sm:pr-5">
                      <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] block">Active matrix configuration</span>
                      <div className="mt-2.5 space-y-1.5 text-xs">
                        <div>Dimension: <strong className="font-mono">{config.dimension}D</strong></div>
                        <div>Sequence length: <strong className="font-mono">{sequenceLength} facts</strong></div>
                        <div>Retention: <strong className="font-mono">{retentionPct}%</strong></div>
                        <div>Write strength: <strong className="font-mono">{Math.round(writeStrength * 100)}%</strong></div>
                        <div>Interference noise: <strong className="font-mono">{interferencePct}%</strong></div>
                      </div>
                    </div>
                    <div className="py-4 sm:pl-5">
                      <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] block">Retrieval status</span>
                      <div className="mt-2.5 space-y-1.5 text-xs">
                        <div>Target query: <strong className="font-mono">{selectedQuery}</strong></div>
                        <div>Target ground truth: <strong className="font-mono">{groundTruth}</strong></div>
                        <div>Model prediction: <strong className={`font-mono ${experimentResult.correct ? 'text-[var(--accent-green-text)]' : 'text-[var(--accent-pink-text)]'}`}>{experimentResult.prediction}</strong></div>
                        <div>Retrieval score: <strong className="font-mono">{experimentResult.retrievalScore.toFixed(3)}</strong></div>
                        <div>Top-1 margin: <strong className="font-mono">{experimentResult.top1Margin.toFixed(3)}</strong></div>
                      </div>
                    </div>
                  </div>
                </figure>
              </div>
            )}

            {/* MECHANISTIC WORKBENCH SUITE */}
            <div id="section-context-order" className="essay-figure-stage p-5 sm:p-6 space-y-5 scroll-mt-24">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--mm-rule)] pb-3">
                <div>
                  <h3 className="text-base font-serif font-medium text-[var(--text-primary)] block">
                    Mechanistic inspector &amp; experimental suite
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] font-sans mt-0.5">
                    Step inside the internal algebra: intermediate vectors, state persistence, ordering sensitivity, and overwrite mechanics.
                  </p>
                </div>

                <span className="text-xs font-mono text-[var(--mm-signal)]">
                  Deterministic toy computation
                </span>
              </div>

              {/* Workbench Hairline Tab Navigation */}
              <div className="flex flex-wrap gap-4 text-xs border-b border-[var(--mm-rule)]">
                {[
                  { id: 'pipeline', label: 'Write / Read Pipeline' },
                  { id: 'persistence', label: 'State Persistence' },
                  { id: 'order', label: 'Context Ordering' },
                  { id: 'overwrite', label: 'Memory Overwrite' },
                  { id: 'representations', label: 'Latent Vectors' },
                ].map((tab) => {
                  const active = workbenchTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setWorkbenchTab(tab.id as any)}
                      className={`pb-2.5 -mb-px text-xs font-sans font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                        active
                          ? 'border-[var(--mm-signal)] text-[var(--text-primary)] font-semibold'
                          : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Active Tab Component */}
              <div className="pt-2">
                {workbenchTab === 'pipeline' && (
                  <MemoryWriteRead
                    initialFact={activeFacts[0] || CANONICAL_FACTS[0]}
                    dimension={memoryDim}
                    retention={effectiveRetention}
                    writeStrength={writeStrength}
                  />
                )}

                {workbenchTab === 'persistence' && (
                  <StatePersistenceExperiment />
                )}

                {workbenchTab === 'order' && (
                  <ContextOrderExperiment />
                )}

                {workbenchTab === 'overwrite' && (
                  <MemoryOverwriteExperiment />
                )}

                {workbenchTab === 'representations' && (
                  <RepresentationInspector
                    currentKey={selectedQuery}
                    currentValue={groundTruth}
                    queryKey={selectedQuery}
                    dimension={memoryDim}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

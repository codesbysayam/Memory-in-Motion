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
    <section id="section-03" className="scroll-mt-20 border-b border-[#E5E0D8] bg-[#FBF9F5] py-16 text-[#151515]">
      <div id="section-hebbian-plasticity" className="scroll-mt-24" />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 space-y-8">
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

        {/* 3. MEMORY AT A GLANCE (Real-time computed metrics) */}
        <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-5 shadow-xs">
          <div className="text-xs text-[#70736F] mb-3 font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[#252525]">
              <span>Memory at a glance: actual computed state</span>
              <span className="text-[#31566E] font-mono">(<InlineMath math={`\\hat{v} \\in \\mathbb{R}^{${config.dimension}}`} />)</span>
            </span>
            <span className="text-[#245B38] font-mono text-xs">
              Real-time recomputation
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* DIMENSION */}
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] flex flex-col justify-between">
              <span className="text-[#70736F] text-xs font-semibold">
                Dimension (<InlineMath math="d" />)
              </span>
              <span className="text-2xl font-bold font-mono text-[#252525] mt-1">{config.dimension}D</span>
              <span className="text-xs text-[#70736F] font-mono mt-0.5">
                <InlineMath math={`\\mathbb{R}^{${config.dimension} \\times ${config.dimension}}`} />
              </span>
            </div>

            {/* FACTS STORED */}
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] flex flex-col justify-between">
              <span className="text-[#70736F] text-xs font-semibold">Facts stored</span>
              <span className="text-2xl font-bold font-mono text-[#31566E] mt-1">{activeFacts.length}</span>
              <span className="text-xs text-[#70736F] mt-0.5">{distractorCount} distractors</span>
            </div>

            {/* STATE VECTOR NORM */}
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] flex flex-col justify-between" title="Euclidean norm of retrieved representation vector ||v_hat||">
              <span className="text-[#70736F] text-xs font-semibold">
                Norm (<InlineMath math="\|\hat{v}\|" />)
              </span>
              <span className="text-2xl font-bold font-mono text-[#4F514E] mt-1">
                {stateVectorNorm.toFixed(3)}
              </span>
              <span className="text-xs text-[#70736F] mt-0.5">Retrieved energy</span>
            </div>

            {/* RETRIEVAL SCORE */}
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] flex flex-col justify-between" title="Normalized cosine similarity between retrieved state vector and candidate value vector">
              <span className="text-[#70736F] text-xs font-semibold">
                Score (<InlineMath math="s_1" />)
              </span>
              <span className={`text-2xl font-bold font-mono mt-1 ${experimentResult.correct ? 'text-[#245B38]' : 'text-[#8A352E]'}`}>
                {experimentResult.retrievalScore.toFixed(3)}
              </span>
              <span className="text-xs text-[#70736F] font-mono mt-0.5">
                <InlineMath math="s_1 = \cos(\hat{v}, v_c)" />
              </span>
            </div>

            {/* TOP-1 MARGIN */}
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] flex flex-col justify-between" title="Margin between top candidate score and runner-up: Δs = s_1 - s_2">
              <span className="text-[#70736F] text-xs font-semibold">
                Margin (<InlineMath math="\Delta s" />)
              </span>
              <span className={`text-2xl font-bold font-mono mt-1 ${experimentResult.top1Margin > 0.05 ? 'text-[#245B38]' : 'text-[#8A352E]'}`}>
                {experimentResult.top1Margin.toFixed(3)}
              </span>
              <span className="text-xs text-[#70736F] font-mono mt-0.5">
                <InlineMath math="\Delta s = s_1 - s_2" />
              </span>
            </div>

            {/* PREDICTION STATUS */}
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] flex flex-col justify-between">
              <span className="text-[#70736F] text-xs font-semibold">Prediction</span>
              <span className={`text-lg font-bold font-mono mt-1 truncate ${experimentResult.correct ? 'text-[#245B38]' : 'text-[#8A352E]'}`}>
                {experimentResult.prediction}
              </span>
              <span className="text-xs text-[#70736F] mt-0.5 truncate">
                Target: {groundTruth}
              </span>
            </div>
          </div>
        </div>

        {/* 12-Column Control Deck & Experiment Flow with Progressive Disclosure (Issues 7 & 16) */}
        <div className="experiment-layout">
          {/* Left Column: Compact Sticky Control Sidebar */}
          <div className="experiment-sidebar space-y-4 text-xs">
            <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-4 sm:p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#D9DCD8] pb-3">
                <h3 className="font-semibold text-sm text-[#252525] flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#31566E]" />
                  <span>Experiment parameters</span>
                </h3>
                <SourceBadge type="toy" />
              </div>

              {/* Memory Dimension Picker */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#70736F] font-semibold flex items-center gap-1">
                    <span>Memory dimension</span>
                    <InlineMath math="(d)" />:
                  </span>
                  <span className="text-[#31566E] font-mono font-bold">{config.dimension}</span>
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
              <div className="space-y-1.5 pt-2 border-t border-[#EAE6DF]">
                <div className="flex justify-between text-xs">
                  <span className="text-[#70736F] flex items-center gap-1 font-semibold">
                    <Search className="w-3.5 h-3.5 text-[#31566E]" />
                    <span>Probe key query</span>
                    <InlineMath math="(q)" />:
                  </span>
                  <span className="text-[#252525] font-bold">{selectedQuery}</span>
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
                          ? 'border-[#31566E] bg-[#EBF1F5] text-[#31566E] font-bold'
                          : 'border-[#D9DCD8] bg-[#FFFFFF] text-[#70736F] hover:text-[#252525] hover:bg-[#F7F5EF]'
                      }`}
                    >
                      {f.key}
                    </button>
                  ))}
                </div>
              </div>

              {/* Collapsible Secondary Conditions Button (Audit Item 16) */}
              <button
                type="button"
                onClick={() => setShowSecondaryParams(!showSecondaryParams)}
                className="btn btn-secondary w-full text-xs py-2 mt-1 flex items-center justify-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5 text-[#31566E]" />
                <span>{showSecondaryParams ? 'Hide secondary conditions' : 'Change conditions'}</span>
              </button>

              {/* Secondary Parameters (Collapsible to prevent dead whitespace) */}
              {showSecondaryParams && (
                <div className="space-y-3.5 pt-3 border-t border-[#EAE6DF]">
                  {/* Controlled Mode Toggle */}
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#252525] text-xs flex items-center gap-1.5">
                        {isControlledMode ? <Lock className="w-3.5 h-3.5 text-[#31566E]" /> : <Unlock className="w-3.5 h-3.5 text-[#70736F]" />}
                        Controlled mode
                      </span>
                      <button
                        type="button"
                        onClick={toggleControlledMode}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border cursor-pointer ${
                          isControlledMode
                            ? 'bg-[#EBF1F5] text-[#31566E] border-[#A8BAC7]'
                            : 'bg-[#FFFFFF] text-[#70736F] border-[#D9DCD8] hover:text-[#252525]'
                        }`}
                      >
                        {isControlledMode ? 'Active ✓' : 'Enable'}
                      </button>
                    </div>

                    {isControlledMode && (
                      <div className="text-xs space-y-1.5 pt-1 text-[#70736F] border-t border-[#EAE6DF]">
                        <div className="flex items-center justify-between">
                          <span>Baseline frozen:</span>
                          <button
                            type="button"
                            onClick={resetBaseline}
                            className="text-[#31566E] hover:underline text-xs flex items-center gap-1 cursor-pointer font-semibold"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                            Reset
                          </button>
                        </div>

                        {controlledDeltas && controlledDeltas.length > 0 && (
                          <div className="p-2 rounded-lg bg-[#FFFFFF] border border-[#EAE6DF] space-y-1">
                            {controlledDeltas.map((d, i) => (
                              <div key={i} className="flex justify-between text-[#4F514E]">
                                <span className="text-[#31566E] font-semibold">{d.name}:</span>
                                <span>{d.base} → <strong className="text-[#252525]">{d.curr}</strong></span>
                              </div>
                            ))}
                          </div>
                        )}

                        {controlledWarning && (
                          <div className="p-2 rounded-lg bg-[#FDF8EE] border border-[#F5E2C4] text-[#A46622] text-xs leading-tight flex items-start gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-[#A46622] shrink-0 mt-0.5" />
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
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#EAE6DF]">
                    <button
                      type="button"
                      onClick={handleCopyConfig}
                      className="btn btn-secondary text-xs py-1.5 px-2 flex items-center justify-center gap-1.5"
                      title="Copy deterministic experiment configuration JSON"
                    >
                      <Copy className="w-3.5 h-3.5 text-[#31566E]" />
                      <span>{copiedConfig ? 'Copied ✓' : 'Copy config'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyResult}
                      className="btn btn-secondary text-xs py-1.5 px-2 flex items-center justify-center gap-1.5"
                      title="Copy full experiment outcome payload"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#245B38]" />
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

            {/* Compare Before / After (Compact Card) */}
            {prevSnapshot && (
              <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-4 text-xs space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-2">
                  <h4 className="font-semibold text-xs text-[#252525] flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-[#31566E]" />
                    <span>Compare before / after</span>
                  </h4>
                  <span className="text-[#70736F] text-xs font-mono">Live delta</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="p-2 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-1">
                    <span className="text-xs text-[#70736F] font-semibold block">Before</span>
                    <div>Dim: <strong className="text-[#252525] font-mono">{prevSnapshot.dimension}</strong></div>
                    <div>Score: <strong className="text-[#252525] font-mono">{prevSnapshot.confidence}%</strong></div>
                    <div>State: <strong className={prevSnapshot.correct ? 'text-[#245B38]' : 'text-[#8A352E]'}>
                      {prevSnapshot.correct ? 'Match' : 'Miss'}
                    </strong></div>
                  </div>

                  <div className="p-2 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-1">
                    <span className="text-xs text-[#31566E] font-semibold block">After</span>
                    <div>Dim: <strong className="text-[#252525] font-mono">{currentSnapshot.dimension}</strong></div>
                    <div>Score: <strong className="text-[#252525] font-mono">{currentSnapshot.confidence}%</strong></div>
                    <div>State: <strong className={currentSnapshot.correct ? 'text-[#245B38]' : 'text-[#8A352E]'}>
                      {currentSnapshot.correct ? 'Match' : 'Miss'}
                    </strong></div>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs space-y-0.5">
                  <span className="text-[#70736F] font-semibold block">What changed?</span>
                  <div className="text-[#252525] font-semibold font-mono">
                    {currentSnapshot.confidence - prevSnapshot.confidence >= 0 ? '+' : ''}
                    {(currentSnapshot.confidence - prevSnapshot.confidence).toFixed(1)} pp retrieval score
                  </div>
                  <div className="text-xs text-[#70736F]">
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

          {/* Right Column: Progressive Disclosure Workspace (Audit Item 7) */}
          <div className="space-y-6">
            {/* Progressive Disclosure Segmented Switcher */}
            <div className="flex items-center justify-between flex-wrap gap-2 p-1.5 bg-[#F0F1EF] border border-[#D9DCD8] rounded-xl">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveInstrumentView('matrix')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeInstrumentView === 'matrix'
                      ? 'bg-[#FFFFFF] text-[#252525] shadow-xs border border-[#D9DCD8]'
                      : 'text-[#4F514E] hover:text-[#252525] hover:bg-[#FFFFFF]/50'
                  }`}
                >
                  Inspect Matrix
                </button>
                <button
                  type="button"
                  onClick={() => setActiveInstrumentView('analyze')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeInstrumentView === 'analyze'
                      ? 'bg-[#FFFFFF] text-[#252525] shadow-xs border border-[#D9DCD8]'
                      : 'text-[#4F514E] hover:text-[#252525] hover:bg-[#FFFFFF]/50'
                  }`}
                >
                  Analyze State
                </button>
                <button
                  type="button"
                  onClick={() => setActiveInstrumentView('configure')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeInstrumentView === 'configure'
                      ? 'bg-[#FFFFFF] text-[#252525] shadow-xs border border-[#D9DCD8]'
                      : 'text-[#4F514E] hover:text-[#252525] hover:bg-[#FFFFFF]/50'
                  }`}
                >
                  Configure
                </button>
              </div>
              <div className="text-xs text-[#70736F] font-sans pr-2 hidden sm:block">
                View: <strong className="text-[#252525]">{activeInstrumentView === 'matrix' ? 'Matrix & Ingestion Timeline' : activeInstrumentView === 'analyze' ? 'State Vectors & Dimension Deltas' : 'Experiment Conditions & Notebook'}</strong>
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
                <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-6 space-y-4 shadow-xs">
                  <h3 className="text-base font-semibold text-[#252525]">Experiment Parameters & Conditions</h3>
                  <p className="text-sm text-[#4F514E]">
                    Adjust variables in the sticky sidebar or review the snapshot logs below. You can test retention factor, write strength, and noise interference under strictly controlled conditions.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF]">
                      <span className="text-xs font-semibold text-[#70736F] block">Active Matrix Configuration</span>
                      <div className="mt-2 space-y-1 text-xs">
                        <div>Dimension: <strong className="font-mono">{config.dimension}D</strong></div>
                        <div>Sequence Length: <strong className="font-mono">{sequenceLength} facts</strong></div>
                        <div>Retention: <strong className="font-mono">{retentionPct}%</strong></div>
                        <div>Write Strength: <strong className="font-mono">{Math.round(writeStrength * 100)}%</strong></div>
                        <div>Interference Noise: <strong className="font-mono">{interferencePct}%</strong></div>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF]">
                      <span className="text-xs font-semibold text-[#70736F] block">Retrieval Status</span>
                      <div className="mt-2 space-y-1 text-xs">
                        <div>Target Query: <strong className="font-mono">{selectedQuery}</strong></div>
                        <div>Target Ground Truth: <strong className="font-mono">{groundTruth}</strong></div>
                        <div>Model Prediction: <strong className={`font-mono ${experimentResult.correct ? 'text-[#245B38]' : 'text-[#8A352E]'}`}>{experimentResult.prediction}</strong></div>
                        <div>Retrieval Score: <strong className="font-mono">{experimentResult.retrievalScore.toFixed(3)}</strong></div>
                        <div>Top-1 Margin: <strong className="font-mono">{experimentResult.top1Margin.toFixed(3)}</strong></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MECHANISTIC WORKBENCH SUITE */}
            <div id="section-context-order" className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-5 sm:p-6 space-y-5 shadow-xs scroll-mt-24">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EAE6DF] pb-3">
                <div>
                  <h3 className="text-sm font-semibold text-[#252525] block">
                    Mechanistic inspector and experimental suite
                  </h3>
                  <p className="text-xs text-[#70736F] font-sans mt-0.5">
                    Step inside the internal algebra: inspect intermediate vectors, state persistence, ordering sensitivity, and overwrite mechanics.
                  </p>
                </div>

                <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-[#EDF7F7] border border-[#CFE8E8] text-[#31566E] font-semibold">
                  Deterministic suite
                </span>
              </div>

              {/* Workbench Tab Navigation */}
              <div className="flex flex-wrap gap-1.5 text-xs border-b border-[#EAE6DF] pb-3">
                {[
                  { id: 'pipeline', label: 'Write / Read Pipeline' },
                  { id: 'persistence', label: 'State Persistence' },
                  { id: 'order', label: 'Context Ordering' },
                  { id: 'overwrite', label: 'Memory Overwrite' },
                  { id: 'representations', label: 'Latent Vectors' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setWorkbenchTab(tab.id as any)}
                    className={`btn text-xs py-1.5 px-3 min-h-[34px] ${
                      workbenchTab === tab.id
                        ? 'btn-blue font-semibold shadow-xs'
                        : 'btn-secondary'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
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

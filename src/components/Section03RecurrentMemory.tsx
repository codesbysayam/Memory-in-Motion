import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  StepForward,
  StepBack,
  RotateCcw,
  Plus,
  Layers,
  HelpCircle,
  Sliders,
  Database,
  Search,
  Copy,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { CANONICAL_FACTS, Fact } from '../models/associativeMemory';
import { runMemoryExperiment, MemoryExperimentResult } from '../models/experimentEngine';
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
  // Fact Learning Laboratory Parameters
  const [memoryDim, setMemoryDim] = useState<number>(16);
  const [sequenceLength, setSequenceLength] = useState<number>(5);
  const [retentionPct, setRetentionPct] = useState<number>(95);
  const [writeStrength, setWriteStrength] = useState<number>(0.8);
  const [interferencePct, setInterferencePct] = useState<number>(10);
  const [distractorCount, setDistractorCount] = useState<number>(0);
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
        const d = parseInt(params.get('dim') || '', 10);
        if ([4, 8, 16, 32].includes(d)) setMemoryDim(d);
        const seq = parseInt(params.get('facts') || '', 10);
        if (seq >= 1 && seq <= 15) setSequenceLength(seq);
        const ret = parseInt(params.get('retention') || '', 10);
        if (ret >= 10 && ret <= 100) setRetentionPct(ret);
        const interf = parseInt(params.get('interference') || '', 10);
        if (interf >= 0 && interf <= 60) setInterferencePct(interf);
        const q = params.get('query');
        if (q) setSelectedQuery(q);
      } catch (err) {
        console.warn('Could not parse experiment URL params', err);
      }
    }
  }, []);

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

  // Adjust effective retention based on interference
  const effectiveRetention = useMemo(() => {
    const raw = retentionPct / 100;
    const interferenceLoss = (interferencePct / 100) * 0.4;
    return Math.max(0.1, Number((raw - interferenceLoss).toFixed(3)));
  }, [retentionPct, interferencePct]);

  // Run deterministic experiment
  const experimentResult = useMemo(() => {
    return runMemoryExperiment(
      activeFacts,
      selectedQuery,
      memoryDim,
      effectiveRetention,
      writeStrength
    );
  }, [activeFacts, selectedQuery, memoryDim, effectiveRetention, writeStrength]);

  const groundTruth = activeFacts.find((f) => f.key === selectedQuery)?.value ?? 'UNKNOWN';

  // Snapshot tracking for before/after comparison
  const currentSnapshot: RunSnapshot = useMemo(() => ({
    dimension: memoryDim,
    factsCount: activeFacts.length,
    retention: retentionPct,
    interference: interferencePct,
    confidence: Number((experimentResult.confidence * 100).toFixed(1)),
    correct: experimentResult.correct,
    prediction: experimentResult.prediction,
  }), [memoryDim, activeFacts.length, retentionPct, interferencePct, experimentResult]);

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
      setMemoryDim(baselineConfig.memoryDim);
      setSequenceLength(baselineConfig.sequenceLength);
      setRetentionPct(baselineConfig.retentionPct);
      setWriteStrength(baselineConfig.writeStrength);
      setInterferencePct(baselineConfig.interferencePct);
      setDistractorCount(baselineConfig.distractorCount);
      setSelectedQuery(baselineConfig.selectedQuery);
      setControlledWarning(null);
      addNotebookEntry({
        type: 'preset',
        title: 'Baseline Reset',
        detail: 'Restored original controlled variables.',
      });
    }
  };

  // Derive states for StateDiff and StateInspector
  const { prevStateVector, currStateVector, currentInputDesc } = useMemo(() => {
    const hist = experimentResult.history;
    const step = Math.min(activeStep, hist.length);
    const currMat = step > 0 && hist[step - 1] ? hist[step - 1] : Array.from({ length: memoryDim }, () => Array(memoryDim).fill(0));
    const prevMat = step > 1 && hist[step - 2] ? hist[step - 2] : Array.from({ length: memoryDim }, () => Array(memoryDim).fill(0));

    const currSlice = currMat.map((row, idx) => row[idx % memoryDim] ?? 0);
    const prevSlice = prevMat.map((row, idx) => row[idx % memoryDim] ?? 0);

    const factAtStep = activeFacts[step - 1];
    const desc = factAtStep ? `${factAtStep.key} → ${factAtStep.value}` : 'Initial state';

    return { prevStateVector: prevSlice, currStateVector: currSlice, currentInputDesc: desc };
  }, [experimentResult.history, activeStep, memoryDim, activeFacts]);

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
    <section id="section-03" className="scroll-mt-20 border-b border-[#252A35] bg-[#07080B] py-14">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 space-y-8">
        <SectionHeader
          number="03"
          category="THE FACT-LEARNING LABORATORY"
          title="Sequential Fast-Weight Ingestion & Readout"
          subtitle="Feed facts into an educational associative matrix M_(t+1) = λM_t + η k_t v_t^T. Query the state and decode predictions via cosine similarity against candidate values."
          discovery="A fixed-size state superimposes all past updates into coordinate superpositions. Changing retention, dimension, or distractors immediately shifts retrieval scores and margins."
        />

        {/* Global Memory Lens Strip */}
        <MemoryLens currentFocus="state" />

        {/* 3. MEMORY AT A GLANCE (Computed real metrics, no invented labels) */}
        <div className="rounded-2xl border border-[#252A35] bg-[#0D111A] p-4">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2.5 font-bold flex items-center justify-between">
            <span>MEMORY AT A GLANCE · ACTUAL COMPUTED STATE</span>
            <span className="text-cyan-400 font-normal">DETERMINISTIC EVALUATION</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="p-3 rounded-xl bg-[#121724] border border-[#20283A] flex flex-col justify-between">
              <span className="text-[#8F96A3] text-xs">DIMENSION</span>
              <span className="text-xl font-bold text-white mt-1">{memoryDim}</span>
              <span className="text-[10px] text-slate-500 mt-0.5">Vector coordinates</span>
            </div>

            <div className="p-3 rounded-xl bg-[#121724] border border-[#20283A] flex flex-col justify-between">
              <span className="text-[#8F96A3] text-xs">FACTS STORED</span>
              <span className="text-xl font-bold text-[#22D3EE] mt-1">{activeFacts.length}</span>
              <span className="text-[10px] text-slate-500 mt-0.5">{distractorCount} distractors</span>
            </div>

            <div className="p-3 rounded-xl bg-[#121724] border border-[#20283A] flex flex-col justify-between" title="This score is based on representation similarity and is not a calibrated probability.">
              <span className="text-[#8F96A3] text-xs">RETRIEVAL SCORE</span>
              <span className={`text-xl font-bold mt-1 ${experimentResult.correct ? 'text-emerald-400' : 'text-rose-400'}`}>
                {(experimentResult.confidence * 100).toFixed(0)}%
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">
                {experimentResult.correct ? 'Decoded accurately' : 'Corrupted / Miss'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#121724] border border-[#20283A] flex flex-col justify-between">
              <span className="text-[#8F96A3] text-xs">INTERFERENCE PARAMETER</span>
              <span className="text-xl font-bold text-amber-400 mt-1">{interferencePct}%</span>
              <span className="text-[10px] text-slate-500 mt-0.5">Perturbation noise</span>
            </div>
          </div>
        </div>

        {/* 12-Column Control Deck & Experiment Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (4 cols): Control Deck */}
          <div className="lg:col-span-4 space-y-4 font-mono text-xs">
            <div className="rounded-xl border border-[#252A35] bg-[#11141A] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#252A35] pb-2">
                <span className="font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#22D3EE]" />
                  EXPERIMENT PARAMETERS
                </span>
                <SourceBadge type="toy" />
              </div>

              {/* 6. Controlled Mode (One Variable At A Time) Toggle */}
              <div className="p-2.5 rounded-lg bg-[#0A0E17] border border-[#222A3C] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 text-[11px] flex items-center gap-1.5">
                    {isControlledMode ? <Lock className="w-3 h-3 text-cyan-400" /> : <Unlock className="w-3 h-3 text-slate-500" />}
                    CONTROLLED MODE
                  </span>
                  <button
                    onClick={toggleControlledMode}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition border ${
                      isControlledMode
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-700/60 hover:bg-cyan-900/60'
                        : 'bg-[#141A28] text-slate-400 border-[#252A35] hover:text-white'
                    }`}
                  >
                    {isControlledMode ? 'ACTIVE ✓' : 'ENABLE'}
                  </button>
                </div>

                {isControlledMode && (
                  <div className="text-[10px] space-y-1.5 pt-1 text-slate-400 border-t border-[#1C2538]">
                    <div className="flex items-center justify-between">
                      <span>Baseline frozen. Test one variable:</span>
                      <button
                        onClick={resetBaseline}
                        className="text-cyan-400 hover:underline text-[10px] flex items-center gap-1"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        RESET BASELINE
                      </button>
                    </div>

                    {controlledDeltas && controlledDeltas.length > 0 && (
                      <div className="p-1.5 rounded bg-[#121927] border border-[#232F46] space-y-1">
                        {controlledDeltas.map((d, i) => (
                          <div key={i} className="flex justify-between text-slate-300">
                            <span className="text-cyan-300 font-semibold">{d.name}:</span>
                            <span>{d.base} → <strong className="text-white">{d.curr}</strong></span>
                          </div>
                        ))}
                      </div>
                    )}

                    {controlledWarning && (
                      <div className="p-1.5 rounded bg-amber-950/40 border border-amber-700/60 text-amber-200 text-[10px] leading-tight flex items-start gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{controlledWarning}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Memory Dimension Picker */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#8F96A3]">Memory Dimension (D):</span>
                  <span className="text-[#22D3EE] font-bold">{memoryDim}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[4, 8, 16, 32].map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        handleParamCommit('Dimension', memoryDim, d);
                        setMemoryDim(d);
                      }}
                      className={`py-1.5 rounded border text-center transition-all ${
                        memoryDim === d
                          ? 'border-[#22D3EE] bg-cyan-950/60 text-[#22D3EE] font-bold ring-1 ring-[#22D3EE]'
                          : 'border-[#252A35] bg-[#151922] text-[#8F96A3] hover:text-white'
                      }`}
                    >
                      D={d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sequence Length Slider */}
              <ControlSlider
                label="Sequence Length"
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
                label="Retention (λ)"
                value={retentionPct}
                min={10}
                max={100}
                step={5}
                unit="%"
                onChange={(v) => {
                  handleParamCommit('Retention', `${retentionPct}%`, `${v}%`);
                  setRetentionPct(v);
                }}
                description="Fraction of prior state preserved at each step."
              />

              {/* Write Strength */}
              <ControlSlider
                label="Write Strength (η)"
                value={Math.round(writeStrength * 100)}
                min={10}
                max={100}
                step={5}
                unit="%"
                onChange={(val) => {
                  const ws = val / 100;
                  handleParamCommit('Write Strength', writeStrength, ws);
                  setWriteStrength(ws);
                }}
                description="Magnitude of outer-product update injected."
              />

              {/* Interference */}
              <ControlSlider
                label="Interference"
                value={interferencePct}
                min={0}
                max={60}
                step={5}
                unit="%"
                onChange={(v) => {
                  handleParamCommit('Interference', `${interferencePct}%`, `${v}%`);
                  setInterferencePct(v);
                }}
                description="Perturbation noise added to state coordinates."
              />

              {/* Distractor Count */}
              <ControlSlider
                label="Distractor Facts"
                value={distractorCount}
                min={0}
                max={15}
                step={1}
                unit=" items"
                onChange={(v) => {
                  handleParamCommit('Distractors', distractorCount, v);
                  setDistractorCount(v);
                }}
                description="Irrelevant variable bindings loaded into memory."
              />

              {/* Target Query Selection */}
              <div className="space-y-1.5 pt-2 border-t border-[#252A35]">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#8F96A3] flex items-center gap-1">
                    <Search className="w-3 h-3 text-violet-400" />
                    Probe Key Query (q):
                  </span>
                  <span className="text-white font-bold">{selectedQuery}</span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-[11px]">
                  {CANONICAL_FACTS.slice(0, 6).map((f) => (
                    <button
                      key={f.key}
                      onClick={() => {
                        handleParamCommit('Query', selectedQuery, f.key);
                        setSelectedQuery(f.key);
                      }}
                      className={`py-1 px-1.5 rounded border truncate text-center ${
                        selectedQuery === f.key
                          ? 'border-violet-500 bg-violet-950/60 text-violet-200 font-bold'
                          : 'border-[#252A35] bg-[#151922] text-[#8F96A3] hover:text-white'
                      }`}
                    >
                      {f.key}
                    </button>
                  ))}
                </div>
              </div>

              {/* 8. COPY CONFIG & COPY RESULT Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#252A35]">
                <button
                  onClick={handleCopyConfig}
                  className="py-1.5 px-2 rounded-lg bg-[#141A26] hover:bg-[#1B2335] text-slate-300 hover:text-white border border-[#252A35] text-[10px] font-mono flex items-center justify-center gap-1.5 transition"
                  title="Copy deterministic experiment configuration JSON"
                >
                  <Copy className="w-3 h-3 text-cyan-400" />
                  <span>{copiedConfig ? 'COPIED ✓' : 'COPY CONFIG'}</span>
                </button>

                <button
                  onClick={handleCopyResult}
                  className="py-1.5 px-2 rounded-lg bg-[#141A26] hover:bg-[#1B2335] text-slate-300 hover:text-white border border-[#252A35] text-[10px] font-mono flex items-center justify-center gap-1.5 transition"
                  title="Copy full experiment outcome payload"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>{copiedResult ? 'COPIED ✓' : 'COPY RESULT'}</span>
                </button>
              </div>

              {/* 9. SHARE EXPERIMENT (URL Reproduction) */}
              <button
                onClick={handleShareExperiment}
                className="w-full py-1.5 px-2 rounded-lg bg-gradient-to-r from-cyan-950/50 to-blue-950/50 hover:from-cyan-900/60 hover:to-blue-900/60 text-cyan-200 border border-cyan-800/50 text-[10px] font-mono flex items-center justify-center gap-1.5 transition"
                title="Copy shareable URL with parameters"
              >
                <Share2 className="w-3 h-3 text-cyan-400" />
                <span>{copiedShare ? 'URL COPIED TO CLIPBOARD ✓' : 'SHARE EXPERIMENT (URL)'}</span>
              </button>
            </div>

            {/* 5. COMPARE BEFORE / AFTER (Dynamically Calculated) */}
            {prevSnapshot && (
              <div className="rounded-xl border border-[#252A35] bg-[#0F131D] p-4 text-xs font-mono space-y-3">
                <div className="flex items-center justify-between border-b border-[#1E2536] pb-2 text-[10px]">
                  <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-cyan-400" />
                    COMPARE BEFORE / AFTER
                  </span>
                  <span className="text-slate-500">LIVE DELTA</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div className="p-2 rounded-lg bg-[#141824] border border-[#202738] space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block">BEFORE</span>
                    <div>Dim: <strong className="text-slate-200">{prevSnapshot.dimension}</strong></div>
                    <div>Score: <strong className="text-slate-200">{prevSnapshot.confidence}%</strong></div>
                    <div>State: <strong className={prevSnapshot.correct ? 'text-emerald-400' : 'text-rose-400'}>
                      {prevSnapshot.correct ? 'Match' : 'Miss'}
                    </strong></div>
                  </div>

                  <div className="p-2 rounded-lg bg-[#141824] border border-[#202738] space-y-1">
                    <span className="text-[10px] text-cyan-400 font-bold block">AFTER</span>
                    <div>Dim: <strong className="text-white">{currentSnapshot.dimension}</strong></div>
                    <div>Score: <strong className="text-white">{currentSnapshot.confidence}%</strong></div>
                    <div>State: <strong className={currentSnapshot.correct ? 'text-emerald-400' : 'text-rose-400'}>
                      {currentSnapshot.correct ? 'Match' : 'Miss'}
                    </strong></div>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-[#0A0D15] border border-[#1A2234] text-[10px] space-y-0.5">
                  <span className="text-slate-400 font-bold block uppercase">WHAT CHANGED?</span>
                  <div className="text-slate-300">
                    {currentSnapshot.confidence - prevSnapshot.confidence >= 0 ? '+' : ''}
                    {(currentSnapshot.confidence - prevSnapshot.confidence).toFixed(1)} pp retrieval score
                  </div>
                  <div className="text-[9px] text-slate-500 font-sans">
                    Note: Retrieval score indicates representation similarity in this toy model, not a calibrated probability.
                  </div>
                  <div className="text-slate-400">
                    {currentSnapshot.correct !== prevSnapshot.correct
                      ? currentSnapshot.correct
                        ? 'Recovery observed: retrieved correct candidate.'
                        : 'Failure triggered: competing representation caused miss.'
                      : 'Retrieval accuracy status maintained.'}
                  </div>
                </div>
              </div>
            )}

            {/* 7. EXPERIMENT NOTEBOOK */}
            <ExperimentNotebook
              entries={notebookEntries}
              onClear={() => setNotebookEntries([])}
            />
          </div>

          {/* Right Column (8 cols): Interactive Memory Inspector */}
          <div className="lg:col-span-8 space-y-6">
            <MemoryInspector
              facts={activeFacts}
              queryKey={selectedQuery}
              dim={memoryDim}
              retention={effectiveRetention}
              writeStrength={writeStrength}
              onStepChange={setActiveStep}
            />

            {/* Real-time State Difference Inspector */}
            <StateDiff
              prevState={prevStateVector}
              currState={currStateVector}
              stepIndex={activeStep}
              inputDescription={currentInputDesc}
            />

            {/* State Inspector Heatmap & Transparent Mathematical Telemetry */}
            <StateInspector
              history={experimentResult.history}
              currentState={currStateVector}
              dimension={memoryDim}
              currentStep={activeStep}
            />

            {/* 1. THE MEMORY TENSION VISUAL (Conceptual Design Pressure) */}
            <MemoryTension
              dimension={memoryDim}
              retention={effectiveRetention}
              sequenceLength={activeFacts.length}
              interference={interferencePct / 100}
            />

            {/* MECHANISTIC WORKBENCH SUITE */}
            <div className="rounded-2xl border border-[#252A35] bg-[#0A0E18] p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E2536] pb-3">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold block">
                    MECHANISTIC INSPECTOR & EXPERIMENTAL SUITE
                  </span>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Step inside the internal algebra: inspect intermediate vectors, state persistence, ordering sensitivity, and overwrite mechanics.
                  </p>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-slate-400">
                  DETERMINISTIC SUITE
                </span>
              </div>

              {/* Workbench Tab Navigation */}
              <div className="flex flex-wrap gap-1.5 font-mono text-xs border-b border-[#1A2234] pb-2">
                {[
                  { id: 'pipeline', label: 'Write / Read Pipeline' },
                  { id: 'persistence', label: 'State Persistence' },
                  { id: 'order', label: 'Context Ordering' },
                  { id: 'overwrite', label: 'Memory Overwrite' },
                  { id: 'representations', label: 'Latent Vectors' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setWorkbenchTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg border transition ${
                      workbenchTab === tab.id
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-200 font-bold'
                        : 'bg-[#121826] border-[#222E46] text-slate-400 hover:text-white'
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
                    selectedFact={activeFacts[0] || CANONICAL_FACTS[0]}
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
                    keyVector={experimentResult.history[0]?.stateVector.slice(0, 16) || []}
                    valueVector={experimentResult.history[1]?.stateVector.slice(0, 16) || []}
                    queryVector={experimentResult.history[0]?.stateVector.slice(0, 16) || []}
                    keyLabel={selectedQuery}
                    valueLabel={groundTruth}
                    queryLabel={selectedQuery}
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

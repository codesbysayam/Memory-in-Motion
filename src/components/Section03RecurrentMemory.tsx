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
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#716F68] mb-3 font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span>MEMORY AT A GLANCE · ACTUAL COMPUTED STATE</span>
              <span className="text-[#6842C2]">(<InlineMath math={`\\hat{v} \\in \\mathbb{R}^{${config.dimension}}`} />)</span>
            </span>
            <span className="text-[#167C80] font-semibold">
              REAL-TIME RECOMPUTATION
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
            {/* DIMENSION */}
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] flex flex-col justify-between">
              <span className="text-[#716F68] text-xs font-bold uppercase tracking-wider">
                DIMENSION (<InlineMath math="d" />)
              </span>
              <span className="text-2xl font-bold text-[#151515] mt-1">{config.dimension}D</span>
              <span className="text-[10px] text-[#716F68] mt-0.5">
                <InlineMath math={`\\mathbb{R}^{${config.dimension} \\times ${config.dimension}}`} />
              </span>
            </div>

            {/* FACTS STORED */}
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] flex flex-col justify-between">
              <span className="text-[#716F68] text-xs font-bold uppercase tracking-wider">FACTS STORED</span>
              <span className="text-2xl font-bold text-[#167C80] mt-1">{activeFacts.length}</span>
              <span className="text-[10px] text-[#716F68] mt-0.5">{distractorCount} distractors</span>
            </div>

            {/* STATE VECTOR NORM */}
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] flex flex-col justify-between" title="Euclidean norm of retrieved representation vector ||v_hat||">
              <span className="text-[#716F68] text-xs font-bold uppercase tracking-wider">
                NORM (<InlineMath math="\|\hat{v}\|" />)
              </span>
              <span className="text-2xl font-bold text-[#6842C2] mt-1">
                {stateVectorNorm.toFixed(3)}
              </span>
              <span className="text-[10px] text-[#716F68] mt-0.5">Retrieved energy</span>
            </div>

            {/* RETRIEVAL SCORE */}
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] flex flex-col justify-between" title="Normalized cosine similarity between retrieved state vector and candidate value vector">
              <span className="text-[#716F68] text-xs font-bold uppercase tracking-wider">
                SCORE (<InlineMath math="s_1" />)
              </span>
              <span className={`text-2xl font-bold mt-1 ${experimentResult.correct ? 'text-[#247A4B]' : 'text-[#B64235]'}`}>
                {experimentResult.retrievalScore.toFixed(3)}
              </span>
              <span className="text-[10px] text-[#716F68] mt-0.5">
                <InlineMath math="s_1 = \cos(\hat{v}, v_c)" />
              </span>
            </div>

            {/* TOP-1 MARGIN */}
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] flex flex-col justify-between" title="Margin between top candidate score and runner-up: Δs = s_1 - s_2">
              <span className="text-[#716F68] text-xs font-bold uppercase tracking-wider">
                MARGIN (<InlineMath math="\Delta s" />)
              </span>
              <span className={`text-2xl font-bold mt-1 ${experimentResult.top1Margin > 0.05 ? 'text-[#247A4B]' : 'text-[#B64235]'}`}>
                {experimentResult.top1Margin.toFixed(3)}
              </span>
              <span className="text-[10px] text-[#716F68] mt-0.5">
                <InlineMath math="\Delta s = s_1 - s_2" />
              </span>
            </div>

            {/* PREDICTION STATUS */}
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] flex flex-col justify-between">
              <span className="text-[#716F68] text-xs font-bold uppercase tracking-wider">PREDICTION</span>
              <span className={`text-lg font-bold mt-1 truncate ${experimentResult.correct ? 'text-[#247A4B]' : 'text-[#B64235]'}`}>
                {experimentResult.prediction}
              </span>
              <span className="text-[10px] text-[#716F68] mt-0.5 truncate">
                Target: {groundTruth}
              </span>
            </div>
          </div>
        </div>

        {/* 12-Column Control Deck & Experiment Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (4 cols): Control Deck */}
          <div className="lg:col-span-4 space-y-4 font-mono text-xs">
            <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-5 sm:p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-3">
                <span className="font-semibold text-[#151515] uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#167C80]" />
                  EXPERIMENT PARAMETERS
                </span>
                <SourceBadge type="toy" />
              </div>

              {/* 6. Controlled Mode (One Variable At A Time) Toggle */}
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#151515] text-[11px] flex items-center gap-1.5">
                    {isControlledMode ? <Lock className="w-3.5 h-3.5 text-[#6842C2]" /> : <Unlock className="w-3.5 h-3.5 text-[#716F68]" />}
                    CONTROLLED MODE
                  </span>
                  <button
                    onClick={toggleControlledMode}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition border cursor-pointer ${
                      isControlledMode
                        ? 'bg-[#F3EFFF] text-[#6842C2] border-[#E2D8FA]'
                        : 'bg-[#FFFFFF] text-[#716F68] border-[#E5E0D8] hover:text-[#151515]'
                    }`}
                  >
                    {isControlledMode ? 'ACTIVE ✓' : 'ENABLE'}
                  </button>
                </div>

                {isControlledMode && (
                  <div className="text-[10px] space-y-1.5 pt-1 text-[#716F68] border-t border-[#EAE6DF]">
                    <div className="flex items-center justify-between">
                      <span>Baseline frozen. Test one variable:</span>
                      <button
                        onClick={resetBaseline}
                        className="text-[#6842C2] hover:underline text-[10px] flex items-center gap-1 cursor-pointer font-bold"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        RESET BASELINE
                      </button>
                    </div>

                    {controlledDeltas && controlledDeltas.length > 0 && (
                      <div className="p-2 rounded-lg bg-[#FFFFFF] border border-[#EAE6DF] space-y-1">
                        {controlledDeltas.map((d, i) => (
                          <div key={i} className="flex justify-between text-[#52504A]">
                            <span className="text-[#6842C2] font-semibold">{d.name}:</span>
                            <span>{d.base} → <strong className="text-[#151515]">{d.curr}</strong></span>
                          </div>
                        ))}
                      </div>
                    )}

                    {controlledWarning && (
                      <div className="p-2 rounded-lg bg-[#FDF8EE] border border-[#F5E2C4] text-[#A46622] text-[10px] leading-tight flex items-start gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#A46622] shrink-0 mt-0.5" />
                        <span>{controlledWarning}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Memory Dimension Picker */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#716F68] font-bold flex items-center gap-1">
                    <span>Memory Dimension</span>
                    <InlineMath math="(d)" />:
                  </span>
                  <span className="text-[#167C80] font-bold">{config.dimension}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[4, 8, 16, 32].map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        handleParamCommit('Dimension', config.dimension, d);
                        updateConfig({ dimension: d });
                      }}
                      className={`py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                        config.dimension === d
                          ? 'border-[#6842C2] bg-[#F3EFFF] text-[#6842C2] font-bold shadow-xs'
                          : 'border-[#E5E0D8] bg-[#FFFFFF] text-[#716F68] hover:text-[#151515]'
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

              {/* Write Strength */}
              <ControlSlider
                label={<span className="flex items-center gap-1"><span>Write Strength</span> <InlineMath math="(\eta)" /></span>}
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
                label="Distractor Facts"
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

              {/* Target Query Selection */}
              <div className="space-y-1.5 pt-2 border-t border-[#EAE6DF]">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#716F68] flex items-center gap-1 font-bold">
                    <Search className="w-3 h-3 text-[#6842C2]" />
                    <span>Probe Key Query</span>
                    <InlineMath math="(q)" />:
                  </span>
                  <span className="text-[#151515] font-bold">{selectedQuery}</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                  {CANONICAL_FACTS.slice(0, 6).map((f) => (
                    <button
                      key={f.key}
                      onClick={() => {
                        handleParamCommit('Query', selectedQuery, f.key);
                        setSelectedQuery(f.key);
                      }}
                      className={`py-1.5 px-1.5 rounded-lg border truncate text-center cursor-pointer ${
                        selectedQuery === f.key
                          ? 'border-[#6842C2] bg-[#F3EFFF] text-[#6842C2] font-bold'
                          : 'border-[#E5E0D8] bg-[#FFFFFF] text-[#716F68] hover:text-[#151515]'
                      }`}
                    >
                      {f.key}
                    </button>
                  ))}
                </div>
              </div>

              {/* 8. COPY CONFIG & COPY RESULT Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#EAE6DF]">
                <button
                  onClick={handleCopyConfig}
                  className="py-2 px-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F3EFFF] text-[#52504A] hover:text-[#6842C2] border border-[#E5E0D8] text-[10px] font-mono flex items-center justify-center gap-1.5 transition cursor-pointer"
                  title="Copy deterministic experiment configuration JSON"
                >
                  <Copy className="w-3 h-3 text-[#167C80]" />
                  <span>{copiedConfig ? 'COPIED ✓' : 'COPY CONFIG'}</span>
                </button>

                <button
                  onClick={handleCopyResult}
                  className="py-2 px-2 rounded-xl bg-[#FAF8F5] hover:bg-[#EDF8F2] text-[#52504A] hover:text-[#247A4B] border border-[#E5E0D8] text-[10px] font-mono flex items-center justify-center gap-1.5 transition cursor-pointer"
                  title="Copy full experiment outcome payload"
                >
                  <CheckCircle2 className="w-3 h-3 text-[#247A4B]" />
                  <span>{copiedResult ? 'COPIED ✓' : 'COPY RESULT'}</span>
                </button>
              </div>

              {/* 9. SHARE EXPERIMENT (URL Reproduction) */}
              <button
                onClick={handleShareExperiment}
                className="w-full py-2 px-2 rounded-xl bg-[#F3EFFF] hover:bg-[#ECE5FC] text-[#6842C2] border border-[#E2D8FA] text-[10px] font-mono flex items-center justify-center gap-1.5 transition cursor-pointer font-bold"
                title="Copy shareable URL with parameters"
              >
                <Share2 className="w-3 h-3 text-[#6842C2]" />
                <span>{copiedShare ? 'URL COPIED TO CLIPBOARD ✓' : 'SHARE EXPERIMENT (URL)'}</span>
              </button>
            </div>

            {/* 5. COMPARE BEFORE / AFTER (Dynamically Calculated) */}
            {prevSnapshot && (
              <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-4 text-xs font-mono space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-2 text-[10px]">
                  <span className="font-bold text-[#151515] uppercase tracking-wider flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-[#167C80]" />
                    COMPARE BEFORE / AFTER
                  </span>
                  <span className="text-[#716F68]">LIVE DELTA</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-1">
                    <span className="text-[10px] text-[#716F68] font-bold block">BEFORE</span>
                    <div>Dim: <strong className="text-[#151515]">{prevSnapshot.dimension}</strong></div>
                    <div>Score: <strong className="text-[#151515]">{prevSnapshot.confidence}%</strong></div>
                    <div>State: <strong className={prevSnapshot.correct ? 'text-[#247A4B]' : 'text-[#B64235]'}>
                      {prevSnapshot.correct ? 'Match' : 'Miss'}
                    </strong></div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-1">
                    <span className="text-[10px] text-[#167C80] font-bold block">AFTER</span>
                    <div>Dim: <strong className="text-[#151515]">{currentSnapshot.dimension}</strong></div>
                    <div>Score: <strong className="text-[#151515]">{currentSnapshot.confidence}%</strong></div>
                    <div>State: <strong className={currentSnapshot.correct ? 'text-[#247A4B]' : 'text-[#B64235]'}>
                      {currentSnapshot.correct ? 'Match' : 'Miss'}
                    </strong></div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-[10px] space-y-0.5">
                  <span className="text-[#716F68] font-bold block uppercase">WHAT CHANGED?</span>
                  <div className="text-[#151515] font-semibold">
                    {currentSnapshot.confidence - prevSnapshot.confidence >= 0 ? '+' : ''}
                    {(currentSnapshot.confidence - prevSnapshot.confidence).toFixed(1)} pp retrieval score
                  </div>
                  <div className="text-[9px] text-[#716F68] font-sans">
                    Note: Retrieval score indicates representation similarity in this toy model, not a calibrated probability.
                  </div>
                  <div className="text-[#52504A]">
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
              step={activeStep}
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
            <div id="section-context-order" className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-5 sm:p-6 space-y-5 shadow-xs scroll-mt-24">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EAE6DF] pb-3">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#167C80] font-bold block">
                    MECHANISTIC INSPECTOR & EXPERIMENTAL SUITE
                  </span>
                  <p className="text-xs text-[#716F68] font-sans mt-0.5">
                    Step inside the internal algebra: inspect intermediate vectors, state persistence, ordering sensitivity, and overwrite mechanics.
                  </p>
                </div>

                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-[#EDF7F7] border border-[#CFE8E8] text-[#167C80] font-bold">
                  DETERMINISTIC SUITE
                </span>
              </div>

              {/* Workbench Tab Navigation */}
              <div className="flex flex-wrap gap-1.5 font-mono text-xs border-b border-[#EAE6DF] pb-3">
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
                    className={`px-3.5 py-1.5 rounded-xl border transition cursor-pointer ${
                      workbenchTab === tab.id
                        ? 'bg-[#F3EFFF] border-[#6842C2] text-[#6842C2] font-bold shadow-xs'
                        : 'bg-[#FAF8F5] border-[#E5E0D8] text-[#716F68] hover:text-[#151515]'
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

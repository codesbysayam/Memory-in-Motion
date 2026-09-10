import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Plus,
  Trash2,
  Play,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Clock,
  ArrowDown,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { Fact, createAssociativeMemory, vector, norm, dot } from '../models/associativeMemory';

interface LandingDemoProps {
  onExploreClick?: () => void;
  onStartJudgeMode?: () => void;
}

const CANONICAL_DISTRACTORS: Fact[] = [
  { key: 'France', value: 'Paris' },
  { key: 'Brazil', value: 'Brasília' },
  { key: 'Egypt', value: 'Cairo' },
  { key: 'Germany', value: 'Berlin' },
  { key: 'Kenya', value: 'Nairobi' },
  { key: 'Canada', value: 'Ottawa' },
  { key: 'India', value: 'New Delhi' },
  { key: 'Australia', value: 'Canberra' },
  { key: 'Argentina', value: 'Buenos Aires' },
];

export const LandingDemo: React.FC<LandingDemoProps> = ({
  onExploreClick,
  onStartJudgeMode,
}) => {
  // Primary facts in stream
  const [facts, setFacts] = useState<Fact[]>([
    { key: 'Japan', value: 'Tokyo' },
  ]);

  // Selected probe target
  const [probeKey, setProbeKey] = useState<string>('Japan');
  const [customKey, setCustomKey] = useState<string>('');
  const [customValue, setCustomValue] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);

  // Stepping & execution state
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(1);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Secondary conditions (collapsed by default)
  const [showConditions, setShowConditions] = useState<boolean>(false);
  const [dim, setDim] = useState<number>(12);
  const [retention, setRetention] = useState<number>(0.95);
  const [writeStrength, setWriteStrength] = useState<number>(0.8);
  const [interferenceNoise, setInterferenceNoise] = useState<number>(0.0);
  const [latentSteps, setLatentSteps] = useState<number>(1);
  const [seed, setSeed] = useState<number>(42);

  // Auto-run stepper when isRunning is true
  useEffect(() => {
    if (!isRunning) return;
    if (currentStepIndex >= facts.length) {
      setIsRunning(false);
      return;
    }
    const timer = setTimeout(() => {
      setCurrentStepIndex((prev) => Math.min(prev + 1, facts.length));
    }, 450);
    return () => clearTimeout(timer);
  }, [isRunning, currentStepIndex, facts.length]);

  // Execute deterministic associative memory model up to currentStepIndex
  const activeFacts = useMemo(() => {
    return facts.slice(0, currentStepIndex);
  }, [facts, currentStepIndex]);

  const memoryModel = useMemo(() => {
    // Incorporate seed and interference noise into write strength and vector space
    const effectiveRetention = Math.max(0.1, Math.min(1.0, retention));
    const effectiveWrite = Math.max(0.1, Math.min(2.0, writeStrength * (1 - interferenceNoise * 0.4)));
    const model = createAssociativeMemory(facts, dim, effectiveRetention, effectiveWrite);

    for (const fact of activeFacts) {
      model.writeFact(fact);
    }
    return model;
  }, [facts, activeFacts, dim, retention, writeStrength, interferenceNoise, seed]);

  // Query probe computation
  const queryResult = useMemo(() => {
    return memoryModel.query(probeKey);
  }, [memoryModel, probeKey]);

  // Ground truth lookup for probe target
  const groundTruth = useMemo(() => {
    const match = facts.find(
      (f) => f.key.trim().toLowerCase() === probeKey.trim().toLowerCase()
    );
    return match ? match.value : 'UNKNOWN';
  }, [facts, probeKey]);

  // Is retrieval correct?
  const isCorrect =
    queryResult.prediction !== 'UNKNOWN' &&
    groundTruth !== 'UNKNOWN' &&
    queryResult.prediction.trim().toLowerCase() === groundTruth.trim().toLowerCase();

  const isInterference =
    groundTruth !== 'UNKNOWN' &&
    !isCorrect &&
    queryResult.prediction !== 'UNKNOWN';

  // Available distractor count
  const remainingDistractors = useMemo(() => {
    const existingKeys = new Set(facts.map((f) => f.key));
    return CANONICAL_DISTRACTORS.filter((d) => !existingKeys.has(d.key));
  }, [facts]);

  // Primary User Actions
  const handleAddDistractor = () => {
    if (remainingDistractors.length === 0) return;
    const nextFact = remainingDistractors[0];
    const newFacts = [...facts, nextFact];
    setFacts(newFacts);
    setCurrentStepIndex(newFacts.length);
  };

  const handleAddCustomFact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customKey.trim() || !customValue.trim()) return;
    const newFact: Fact = { key: customKey.trim(), value: customValue.trim() };
    const newFacts = [...facts, newFact];
    setFacts(newFacts);
    setCurrentStepIndex(newFacts.length);
    setCustomKey('');
    setCustomValue('');
    setShowCustomInput(false);
  };

  const handleRemoveFact = (indexToRemove: number) => {
    if (facts.length <= 1) return; // Keep at least one fact
    const removedKey = facts[indexToRemove].key;
    const newFacts = facts.filter((_, idx) => idx !== indexToRemove);
    setFacts(newFacts);
    setCurrentStepIndex((prev) => Math.min(prev, newFacts.length));
    if (probeKey === removedKey && newFacts.length > 0) {
      setProbeKey(newFacts[0].key);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setFacts([{ key: 'Japan', value: 'Tokyo' }]);
    setProbeKey('Japan');
    setCurrentStepIndex(1);
    memoryModel.reset();
  };

  const handleRunAll = () => {
    setIsRunning(false);
    setCurrentStepIndex(facts.length);
  };

  const handleStepForward = () => {
    setIsRunning(false);
    if (currentStepIndex < facts.length) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleAddDistractor();
    }
  };

  const stateMatrix = memoryModel.getState();

  // Matrix Frobenius norm
  const matrixNorm = useMemo(() => {
    let sum = 0;
    for (let r = 0; r < stateMatrix.length; r++) {
      for (let c = 0; c < (stateMatrix[r]?.length || 0); c++) {
        const val = stateMatrix[r][c] || 0;
        sum += val * val;
      }
    }
    return Math.sqrt(sum);
  }, [stateMatrix]);

  return (
    <section
      id="landing-hero"
      className="border-b border-[#D8D3C9] bg-[#F5F2EA] text-[#1C1B19] pt-10 pb-16 relative overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10 space-y-8">
        {/* Top Research Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-[#6842C2] bg-[#F3EFFF] px-3 py-1 rounded-full border border-[#E2D8FA] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#6842C2]" />
              STAGE 01 · FOUNDATIONAL EXPERIMENT
            </span>
            <span className="text-[11px] font-mono text-[#6B665E] hidden sm:inline">
              Associative Fast-Weight Recurrence
            </span>
          </div>

          <div className="flex items-center gap-3">
            {onStartJudgeMode && (
              <button
                onClick={onStartJudgeMode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D8D3C9] bg-[#FFFFFF] hover:bg-[#F8F6F1] text-[#1C1B19] font-sans text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-[#6842C2]" />
                <span>60s Guided Test</span>
              </button>
            )}
            <div className="font-mono text-[11px] text-[#6B665E] bg-[#FFFFFF] border border-[#D8D3C9] px-2.5 py-1 rounded-md">
              M ∈ ℝ^{dim}×{dim}
            </div>
          </div>
        </div>

        {/* Framing Question & Editorial Statement */}
        <div className="max-w-3xl space-y-3">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#1C1B19] tracking-tight leading-[1.1]">
            Can a fixed-size state remember what matters?
          </h1>
          <p className="text-base sm:text-lg text-[#403D38] font-sans leading-relaxed">
            A recurrent system can carry information forward without storing every previous token.
            But compression creates a trade-off: when new information competes for limited state, retrieval can interfere.
          </p>
        </div>

        {/* THE HERO SCIENTIFIC INSTRUMENT */}
        <div className="rounded-2xl border border-[#D8D3C9] bg-[#FFFFFF] shadow-sm overflow-hidden">
          {/* Instrument Header Bar */}
          <div className="px-5 sm:px-7 py-4 border-b border-[#D8D3C9] bg-[#FAF8F3] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#287C7C] animate-pulse" />
              <h2 className="font-serif font-bold text-base sm:text-lg text-[#1C1B19]">
                Live Recurrent Memory Instrument
              </h2>
              <span className="font-mono text-xs text-[#6B665E] hidden md:inline">
                · M_(t+1) = λM_t + η k_t v_t^T
              </span>
            </div>

            {/* Primary Action Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddDistractor}
                disabled={remainingDistractors.length === 0}
                className="px-3.5 py-1.5 rounded-lg bg-[#6842C2] hover:bg-[#5835AC] text-white font-sans text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Fact</span>
              </button>

              <button
                onClick={handleStepForward}
                className="px-3 py-1.5 rounded-lg border border-[#D8D3C9] bg-[#FFFFFF] hover:bg-[#F5F2EA] text-[#1C1B19] font-sans text-xs font-medium transition-colors cursor-pointer"
                title="Step forward one fact write"
              >
                Step
              </button>

              <button
                onClick={handleRunAll}
                className="px-3 py-1.5 rounded-lg border border-[#D8D3C9] bg-[#FFFFFF] hover:bg-[#F5F2EA] text-[#1C1B19] font-sans text-xs font-medium transition-colors cursor-pointer"
                title="Run all writes into memory"
              >
                Run
              </button>

              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg border border-[#D8D3C9] bg-[#FFFFFF] hover:bg-[#F5F2EA] text-[#6B665E] hover:text-[#1C1B19] transition-colors cursor-pointer"
                title="Reset memory instrument to initial state"
                aria-label="Reset memory"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 3-Column Instrument Grid: INPUT STREAM | CURRENT STATE | QUERY & RESULT */}
          <div className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* COLUMN 1: INPUT STREAM (4 Cols) */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-[#6B665E] font-semibold">
                  Input Stream ({activeFacts.length}/{facts.length} Written)
                </span>
                <button
                  onClick={() => setShowCustomInput(!showCustomInput)}
                  className="text-xs font-sans font-medium text-[#6842C2] hover:underline cursor-pointer"
                >
                  {showCustomInput ? 'Cancel' : '+ Custom Fact'}
                </button>
              </div>

              {/* Custom fact input form */}
              {showCustomInput && (
                <form
                  onSubmit={handleAddCustomFact}
                  className="p-3 rounded-xl bg-[#FAF8F3] border border-[#D8D3C9] space-y-2 text-xs font-sans"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Key (e.g. Spain)"
                      value={customKey}
                      onChange={(e) => setCustomKey(e.target.value)}
                      className="px-2.5 py-1.5 rounded-md border border-[#D8D3C9] bg-white text-[#1C1B19] font-mono text-xs focus:outline-none focus:border-[#6842C2]"
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g. Madrid)"
                      value={customValue}
                      onChange={(e) => setCustomValue(e.target.value)}
                      className="px-2.5 py-1.5 rounded-md border border-[#D8D3C9] bg-white text-[#1C1B19] font-mono text-xs focus:outline-none focus:border-[#6842C2]"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!customKey.trim() || !customValue.trim()}
                      className="px-3 py-1 rounded-md bg-[#6842C2] text-white font-semibold disabled:opacity-40"
                    >
                      Insert into Stream
                    </button>
                  </div>
                </form>
              )}

              {/* Facts List */}
              <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
                {facts.map((fact, idx) => {
                  const isWritten = idx < currentStepIndex;
                  const isTarget = fact.key === probeKey;

                  return (
                    <div
                      key={`${fact.key}-${idx}`}
                      className={`p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs ${
                        isTarget
                          ? 'border-[#6842C2] bg-[#F3EFFF] text-[#1C1B19]'
                          : isWritten
                          ? 'border-[#D8D3C9] bg-[#FFFFFF] text-[#1C1B19]'
                          : 'border-[#E5E0D8] bg-[#FAF8F3] text-[#9E9A92] opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span
                          className={`w-5 h-5 rounded-full font-mono text-[10px] flex items-center justify-center font-bold ${
                            isWritten
                              ? 'bg-[#EFEBE0] text-[#1C1B19]'
                              : 'bg-transparent text-[#9E9A92] border border-[#D8D3C9]'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div className="truncate">
                          <span className="font-semibold text-[#1C1B19]">{fact.key}</span>
                          <span className="text-[#9E9A92] mx-1.5">→</span>
                          <span className={isTarget ? 'font-bold text-[#6842C2]' : 'text-[#403D38]'}>
                            {fact.value}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {isTarget ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#6842C2] text-white">
                            PROBE
                          </span>
                        ) : (
                          <button
                            onClick={() => setProbeKey(fact.key)}
                            className="px-2 py-0.5 rounded text-[10px] font-sans font-medium text-[#6842C2] hover:bg-[#EAE2FB] border border-[#E2D8FA] transition-colors cursor-pointer"
                            title={`Set ${fact.key} as probe target`}
                          >
                            Probe
                          </button>
                        )}
                        {facts.length > 1 && (
                          <button
                            onClick={() => handleRemoveFact(idx)}
                            className="p-1 rounded text-[#9E9A92] hover:text-[#B64235] transition-colors cursor-pointer"
                            title="Remove fact"
                            aria-label={`Remove fact ${fact.key}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Distractor Suggestion Bar */}
              {remainingDistractors.length > 0 && (
                <div className="pt-1">
                  <button
                    onClick={handleAddDistractor}
                    className="w-full py-2 px-3 rounded-xl border border-dashed border-[#D8D3C9] hover:border-[#6842C2] bg-[#FAF8F3] hover:bg-[#F3EFFF] text-[#6B665E] hover:text-[#6842C2] font-sans text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Distractor: {remainingDistractors[0].key} → {remainingDistractors[0].value}</span>
                  </button>
                </div>
              )}
            </div>

            {/* COLUMN 2: CURRENT STATE M (4 Cols) */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-[#6B665E] font-semibold">
                  Current State M (t = {currentStepIndex})
                </span>
                <span className="font-mono text-xs text-[#6B665E]">
                  ||M||_F = <strong>{matrixNorm.toFixed(2)}</strong>
                </span>
              </div>

              {/* Matrix Heatmap View */}
              <div className="p-3.5 rounded-xl border border-[#292D33] bg-[#0D0F12] text-[#F5F3EE] space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#9E9A92]">
                  <span>{dim}×{dim} STATE MATRIX</span>
                  <span>λ = {retention.toFixed(2)}</span>
                </div>

                {/* State Grid */}
                <div
                  className="grid gap-1 overflow-hidden"
                  style={{
                    gridTemplateColumns: `repeat(${dim}, minmax(0, 1fr))`,
                  }}
                >
                  {stateMatrix.map((row, rIdx) =>
                    row.map((val, cIdx) => {
                      const isPos = val >= 0;
                      const abs = Math.min(Math.abs(val) * 1.4, 1);
                      const bg = isPos
                        ? `rgba(104, 66, 194, ${Math.max(0.12, abs)})`
                        : `rgba(40, 124, 124, ${Math.max(0.12, abs)})`;

                      return (
                        <div
                          key={`${rIdx}-${cIdx}`}
                          style={{ backgroundColor: bg }}
                          title={`M[${rIdx},${cIdx}] = ${val.toFixed(3)}`}
                          className="aspect-square rounded-[2px] transition-colors duration-150 border border-white/5"
                        />
                      );
                    })
                  )}
                </div>

                {/* Color Legend */}
                <div className="flex items-center justify-between text-[10px] font-mono text-[#9E9A92] pt-1 border-t border-[#292D33]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-[#6842C2]" />
                    <span>Positive association</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-[#287C7C]" />
                    <span>Negative interference</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-[#6B665E] font-sans leading-relaxed">
                Each fact update applies an outer-product update $\Delta M = \eta k v^T$ decayed by retention rate $\lambda$. As more facts accumulate, vectors superpose in finite dimensions.
              </p>
            </div>

            {/* COLUMN 3: QUERY & RESULT (4 Cols) */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-[#6B665E] font-semibold">
                  Query & Model Output
                </span>
                <span className="text-xs font-sans text-[#6B665E]">
                  Target: <strong className="text-[#1C1B19]">{probeKey}</strong>
                </span>
              </div>

              {/* Retrieval Card */}
              <div className="p-4 rounded-xl border border-[#D8D3C9] bg-[#FAF8F3] space-y-3.5">
                {/* Probe selector */}
                <div className="space-y-1">
                  <label className="text-[11px] font-sans font-medium text-[#6B665E] block">
                    Active Probe Key:
                  </label>
                  <div className="flex gap-1.5">
                    <select
                      value={probeKey}
                      onChange={(e) => setProbeKey(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-[#D8D3C9] bg-[#FFFFFF] text-[#1C1B19] font-sans text-xs font-semibold focus:outline-none focus:border-[#6842C2] cursor-pointer"
                    >
                      {facts.map((f) => (
                        <option key={f.key} value={f.key}>
                          {f.key} (Target: {f.value})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Ground Truth vs Computed Output */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#D8D3C9] space-y-0.5">
                    <div className="text-[10px] font-mono text-[#6B665E] uppercase">
                      Ground Truth
                    </div>
                    <div className="font-serif font-bold text-sm text-[#1C1B19]">
                      {groundTruth}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#D8D3C9] space-y-0.5">
                    <div className="text-[10px] font-mono text-[#6B665E] uppercase">
                      Model Output
                    </div>
                    <div
                      className={`font-serif font-bold text-sm ${
                        isCorrect ? 'text-[#247A4B]' : 'text-[#B64235]'
                      }`}
                    >
                      {queryResult.prediction}
                    </div>
                  </div>
                </div>

                {/* Empirical Metrics */}
                <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#D8D3C9] space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[#6B665E]">
                      <span>Retrieval score:</span>
                      <span
                        title="This score is computed from representation cosine similarity. It is not a calibrated probability."
                        className="cursor-help"
                      >
                        <HelpCircle className="w-3 h-3 text-[#9E9A92]" />
                      </span>
                    </div>
                    <strong className="text-[#1C1B19]">
                      {queryResult.retrievalScore.toFixed(3)}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[#6B665E]">
                      <span>Top-1 margin:</span>
                      <span
                        title="Difference between best candidate score and second-best candidate score."
                        className="cursor-help"
                      >
                        <HelpCircle className="w-3 h-3 text-[#9E9A92]" />
                      </span>
                    </div>
                    <strong className="text-[#1C1B19]">
                      {queryResult.top1Margin.toFixed(3)}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#E5E0D8]">
                    <span className="text-[#6B665E]">Empirical Status:</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 ${
                        isCorrect
                          ? 'bg-[#EAF5EF] text-[#247A4B] border border-[#CDEEDB]'
                          : isInterference
                          ? 'bg-[#FDEDEC] text-[#B64235] border border-[#FADBD8]'
                          : 'bg-[#FAF8F3] text-[#6B665E] border border-[#D8D3C9]'
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-[#247A4B]" />
                          <span>Correct</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3 text-[#B64235]" />
                          <span>Interference</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Candidate breakdown table */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono text-[#6B665E] uppercase tracking-wider">
                    Candidate Readouts (Top Candidates)
                  </div>
                  <div className="space-y-1 text-xs font-mono">
                    {queryResult.candidates.slice(0, 3).map((cand, cIdx) => (
                      <div
                        key={cand.value}
                        className="flex items-center justify-between py-1 px-2 rounded bg-white border border-[#E5E0D8]"
                      >
                        <span className="truncate">
                          <span className="text-[#9E9A92] mr-1.5">{cIdx + 1}.</span>
                          <span
                            className={
                              cand.value === groundTruth
                                ? 'font-bold text-[#247A4B]'
                                : 'text-[#403D38]'
                            }
                          >
                            {cand.value}
                          </span>
                        </span>
                        <span className="text-[#6B665E] shrink-0 font-semibold">
                          {cand.score.toFixed(3)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECONDARY CONTROLS (COLLAPSED UNDER "Change the conditions") */}
          <div className="border-t border-[#D8D3C9] bg-[#FAF8F3]">
            <button
              onClick={() => setShowConditions(!showConditions)}
              className="w-full px-5 sm:px-7 py-3 flex items-center justify-between text-xs font-sans font-semibold text-[#1C1B19] hover:bg-[#F3EFFF] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#6842C2]" />
                <span>Change the conditions</span>
                <span className="text-[#6B665E] font-normal text-[11px]">
                  (Dimension, retention rate, write strength, interference noise, steps)
                </span>
              </div>
              <div className="flex items-center gap-1 text-[#6842C2]">
                <span className="text-xs">{showConditions ? 'Hide' : 'Configure'}</span>
                {showConditions ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </button>

            {showConditions && (
              <div className="p-5 sm:p-7 border-t border-[#D8D3C9] bg-[#FFFFFF] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-200 text-xs font-sans">
                {/* Dimension */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono">
                    <label className="font-semibold text-[#1C1B19]">Dimension (d):</label>
                    <span className="text-[#6842C2] font-bold">{dim}D</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="32"
                    step="4"
                    value={dim}
                    onChange={(e) => setDim(Number(e.target.value))}
                    className="w-full accent-[#6842C2] cursor-pointer"
                  />
                  <p className="text-[11px] text-[#6B665E]">
                    State capacity bound $\sim O(d)$. Smaller dimension induces interference faster.
                  </p>
                </div>

                {/* Retention Rate (lambda) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono">
                    <label className="font-semibold text-[#1C1B19]">Retention (λ):</label>
                    <span className="text-[#6842C2] font-bold">{(retention * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.0"
                    step="0.01"
                    value={retention}
                    onChange={(e) => setRetention(Number(e.target.value))}
                    className="w-full accent-[#6842C2] cursor-pointer"
                  />
                  <p className="text-[11px] text-[#6B665E]">
                    Decay factor applied at each timestep: $M_t = \lambda M_{`{t-1}`}$.
                  </p>
                </div>

                {/* Write Strength (eta) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono">
                    <label className="font-semibold text-[#1C1B19]">Write Strength (η):</label>
                    <span className="text-[#6842C2] font-bold">{writeStrength.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1.5"
                    step="0.05"
                    value={writeStrength}
                    onChange={(e) => setWriteStrength(Number(e.target.value))}
                    className="w-full accent-[#6842C2] cursor-pointer"
                  />
                  <p className="text-[11px] text-[#6B665E]">
                    Learning rate scaling magnitude of new rank-1 updates.
                  </p>
                </div>

                {/* Interference Noise */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono">
                    <label className="font-semibold text-[#1C1B19]">Interference Noise:</label>
                    <span className="text-[#6842C2] font-bold">{(interferenceNoise * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="0.8"
                    step="0.05"
                    value={interferenceNoise}
                    onChange={(e) => setInterferenceNoise(Number(e.target.value))}
                    className="w-full accent-[#6842C2] cursor-pointer"
                  />
                  <p className="text-[11px] text-[#6B665E]">
                    Injected cross-talk noise into key representations.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Anchor to Continue Down to Detailed Sections */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#D8D3C9]">
          <div className="text-xs sm:text-sm text-[#6B665E] font-sans">
            Next: Observe what happens when sequence length exceeds dimension capacity.
          </div>

          <button
            onClick={() => {
              if (onExploreClick) {
                onExploreClick();
              } else {
                const el = document.getElementById('section-01');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1C1B19] hover:bg-[#33302B] text-white font-sans text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <span>Explore the Mechanism</span>
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};

import React, { useState, useMemo } from 'react';
import {
  ArrowRight,
  Database,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Play,
  SkipForward,
  RotateCcw,
  Sparkles,
  Layers,
  Award,
} from 'lucide-react';
import { Fact, CANONICAL_FACTS, createAssociativeMemory, vector, cosine } from '../models/associativeMemory';
import { MatrixDiff } from './MatrixDiff';

interface MemoryWriteReadProps {
  initialFact?: Fact;
  dimension?: number;
  retention?: number;
  writeStrength?: number;
}

export const MemoryWriteRead: React.FC<MemoryWriteReadProps> = ({
  initialFact = { key: 'Japan', value: 'Tokyo', category: 'Asia' },
  dimension = 16,
  retention = 0.95,
  writeStrength = 0.8,
}) => {
  // Fact selection
  const [selectedFact, setSelectedFact] = useState<Fact>(initialFact);
  const [queryInput, setQueryInput] = useState<string>('Japan');

  // Interactive Stage:
  // 0: INPUT (Key, Value selected)
  // 1: ENCODE (Numerical vectors generated)
  // 2: WRITE (Outer product M_(t+1) = λM_t + η k v^T)
  // 3: MEMORY STATE (Current M inspected)
  // 4: QUERY (Query string & query vector q)
  // 5: READ (Retrieved vector \hat{v} = q^T M)
  // 6: RETRIEVAL (Candidate cosine scores & Top-1 margin)
  const [stage, setStage] = useState<number>(0);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>('Tokyo');

  const STAGES = [
    { num: 0, label: 'INPUT', desc: 'Human-readable key-value pair' },
    { num: 1, label: 'ENCODE', desc: 'Convert text to deterministic vectors' },
    { num: 2, label: 'WRITE', desc: 'Associative outer-product matrix update' },
    { num: 3, label: 'MEMORY STATE', desc: 'Superimposed matrix state' },
    { num: 4, label: 'QUERY', desc: 'Probe query vector' },
    { num: 5, label: 'READ', desc: 'Vector-matrix multiplication q^T M' },
    { num: 6, label: 'RETRIEVAL', desc: 'Candidate similarity decoding' },
  ];

  // Run the actual deterministic associative memory
  const {
    matrixBefore,
    matrixAfter,
    keyVec,
    valVec,
    queryVec,
    retrievedVec,
    candidates,
    topCandidate,
    secondCandidate,
    top1Margin,
    prediction,
  } = useMemo(() => {
    // 1. Create fresh memory and seed with 2 prior facts so "before" isn't all zeros
    const priorFacts: Fact[] = [
      { key: 'France', value: 'Paris', category: 'Europe' },
      { key: 'Brazil', value: 'Brasília', category: 'South America' },
    ];
    const memory = createAssociativeMemory(
      [...priorFacts, selectedFact, ...CANONICAL_FACTS.slice(3, 8)],
      dimension,
      retention,
      writeStrength
    );

    // Ingest prior facts
    priorFacts.forEach((f) => memory.writeFact(f));
    const matBefore = memory.getMatrix();

    // Now write the selected fact
    memory.writeFact(selectedFact);
    const matAfter = memory.getMatrix();

    // Vectors
    const kVec = vector(selectedFact.key, dimension);
    const vVec = vector(selectedFact.value, dimension);
    const qVec = vector(queryInput, dimension);

    // Query result
    const qRes = memory.query(queryInput);

    // Margin calculations
    const sorted = [...qRes.candidates].sort((a, b) => b.score - a.score);
    const top = sorted[0];
    const second = sorted[1];
    const margin = top && second ? Math.max(0, top.score - second.score) : top ? top.score : 0;

    return {
      matrixBefore: matBefore,
      matrixAfter: matAfter,
      keyVec: kVec,
      valVec: vVec,
      queryVec: qVec,
      retrievedVec: qRes.vector,
      candidates: sorted.slice(0, 5),
      topCandidate: top,
      secondCandidate: second,
      top1Margin: margin,
      prediction: qRes.prediction,
    };
  }, [selectedFact, queryInput, dimension, retention, writeStrength]);

  const nextStage = () => setStage((prev) => Math.min(6, prev + 1));
  const prevStage = () => setStage((prev) => Math.max(0, prev - 1));
  const resetStage = () => setStage(0);

  return (
    <div className="rounded-2xl border border-[#252A35] bg-[#0A0D16] p-5 sm:p-6 text-slate-100 space-y-6 font-mono">
      {/* Header & Epistemic Credentials */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2536] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Mechanistic Memory Inspector: Write / Read Pipeline
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Follow the complete deterministic computation: Input → Encode → Write → State → Query → Read → Retrieval.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-bold">
            LIVE TOY COMPUTATION
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-slate-400">
            D={dimension}
          </span>
        </div>
      </div>

      {/* 7-Step Pipeline Stepper Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-bold uppercase">
            COMPUTATIONAL PIPELINE ({stage + 1}/7): <strong className="text-cyan-400">{STAGES[stage].label}</strong>
          </span>
          <span className="text-[11px] text-slate-500">{STAGES[stage].desc}</span>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {STAGES.map((s) => (
            <button
              key={s.num}
              onClick={() => setStage(s.num)}
              className={`py-2 px-1 text-center rounded-lg border text-[10px] font-bold transition-all ${
                stage === s.num
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-200 shadow-md ring-1 ring-cyan-400'
                  : stage > s.num
                  ? 'bg-[#121826] border-[#222E46] text-slate-300 hover:text-white'
                  : 'bg-[#0A0D15] border-[#182030] text-slate-600 hover:text-slate-400'
              }`}
            >
              <div className="hidden sm:block text-[9px] text-slate-500 mb-0.5">STEP {s.num + 1}</div>
              <div className="truncate">{s.label}</div>
            </button>
          ))}
        </div>

        {/* Stepper Controls */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={prevStage}
              disabled={stage === 0}
              className="px-3 py-1.5 rounded-lg bg-[#141A28] border border-[#232E44] text-xs font-bold text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              ← PREVIOUS STEP
            </button>
            <button
              onClick={nextStage}
              disabled={stage === 6}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm"
            >
              NEXT STEP →
            </button>
          </div>

          <button
            onClick={resetStage}
            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>RESET PIPELINE</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage Display */}
      <div className="rounded-xl border border-[#222B3D] bg-[#0E131F] p-5 space-y-4">
        {/* STAGE 0: INPUT */}
        {stage === 0 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#1E2638] pb-2">
              <span className="text-xs font-bold text-cyan-400 uppercase">
                STEP 1: HUMAN-READABLE INPUT
              </span>
              <span className="text-[11px] text-slate-400">Select key-value pair to write into memory</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#121826] border border-[#202A3E] space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  SELECTED FACT (KEY → VALUE)
                </span>
                <div className="text-base font-bold text-white flex items-center gap-2">
                  <span className="text-amber-300">{selectedFact.key}</span>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                  <span className="text-cyan-300">{selectedFact.value}</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Human readers understand the semantic association between &ldquo;{selectedFact.key}&rdquo; and &ldquo;{selectedFact.value}&rdquo;. The computational model does not.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#121826] border border-[#202A3E] space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  CHOOSE A SAMPLE FACT
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {CANONICAL_FACTS.slice(0, 4).map((f) => (
                    <button
                      key={f.key}
                      onClick={() => {
                        setSelectedFact(f);
                        setQueryInput(f.key);
                      }}
                      className={`py-1.5 px-2 rounded text-[11px] border text-left truncate transition ${
                        selectedFact.key === f.key
                          ? 'bg-cyan-950 border-cyan-500 text-cyan-200 font-bold'
                          : 'bg-[#151C2C] border-[#222E46] text-slate-400 hover:text-white'
                      }`}
                    >
                      {f.key} → {f.value}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#080B14] border border-[#182132] text-xs text-slate-300 font-sans">
              <strong>What happens next:</strong> In Step 2, both strings are converted into deterministic numerical coordinate vectors in ℝ^{dimension}.
            </div>
          </div>
        )}

        {/* STAGE 1: ENCODE */}
        {stage === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#1E2638] pb-2">
              <span className="text-xs font-bold text-cyan-400 uppercase">
                STEP 2: ENCODE TEXT TO LATENT VECTORS
              </span>
              <span className="text-[11px] text-slate-400">Deterministic representation mapping</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#121826] border border-[#202A3E] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-amber-300">KEY VECTOR: k = &ldquo;{selectedFact.key}&rdquo;</span>
                  <span className="text-[10px] text-slate-500">dim={dimension}</span>
                </div>
                <div className="p-2 bg-[#070912] rounded border border-[#1A2234] text-[10px] text-slate-300 overflow-x-auto">
                  [{keyVec.slice(0, 8).map((x) => x.toFixed(2)).join(', ')} ... ]
                </div>
                <span className="text-[10px] text-slate-400 font-sans block">
                  Used as the associative addressing key for outer-product write and query retrieval.
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#121826] border border-[#202A3E] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-cyan-300">VALUE VECTOR: v = &ldquo;{selectedFact.value}&rdquo;</span>
                  <span className="text-[10px] text-slate-500">dim={dimension}</span>
                </div>
                <div className="p-2 bg-[#070912] rounded border border-[#1A2234] text-[10px] text-slate-300 overflow-x-auto">
                  [{valVec.slice(0, 8).map((x) => x.toFixed(2)).join(', ')} ... ]
                </div>
                <span className="text-[10px] text-slate-400 font-sans block">
                  The target numerical pattern to be etched into the memory state matrix.
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#080B14] border border-[#182132] text-xs text-slate-300 font-sans">
              <strong>Core Rule:</strong> The educational model does not manipulate text directly. It converts each item into a deterministic numerical representation.
            </div>
          </div>
        )}

        {/* STAGE 2: WRITE */}
        {stage === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#1E2638] pb-2">
              <span className="text-xs font-bold text-cyan-400 uppercase">
                STEP 3: WRITE UPDATE (M_(t+1) = λM_t + η k v^T)
              </span>
              <span className="text-[11px] text-slate-400">Associative outer-product addition</span>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              <strong>Write changes the internal memory representation.</strong> The outer product $k v^T$ constructs a {dimension}×{dimension} matrix binding key coordinates to value coordinates, weighted by write strength $\eta={writeStrength}$ and decayed by retention $\lambda={retention}$.
            </p>

            {/* Matrix Diff Inspector */}
            <MatrixDiff matrixBefore={matrixBefore} matrixAfter={matrixAfter} dimension={dimension} />
          </div>
        )}

        {/* STAGE 3: MEMORY STATE */}
        {stage === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#1E2638] pb-2">
              <span className="text-xs font-bold text-cyan-400 uppercase">
                STEP 4: CURRENT MEMORY STATE INSPECTION
              </span>
              <span className="text-[11px] text-slate-400">Full {dimension}×{dimension} associative matrix</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-8">
                <div
                  className="grid gap-[2px] p-3 bg-[#06080F] rounded-xl border border-[#1C2538]"
                  style={{ gridTemplateColumns: `repeat(${Math.min(16, dimension)}, minmax(0, 1fr))` }}
                >
                  {Array.from({ length: Math.min(16, dimension) }).map((_, r) =>
                    Array.from({ length: Math.min(16, dimension) }).map((_, c) => {
                      const val = matrixAfter[r]?.[c] ?? 0;
                      return (
                        <div
                          key={`st-${r}-${c}`}
                          className="aspect-square rounded-[1px]"
                          style={{
                            backgroundColor:
                              val >= 0
                                ? `rgba(34, 211, 238, ${Math.max(0.1, Math.min(1, Math.abs(val)))})`
                                : `rgba(244, 63, 94, ${Math.max(0.1, Math.min(1, Math.abs(val)))})`,
                          }}
                          title={`M[${r}][${c}] = ${val.toFixed(4)}`}
                        />
                      );
                    })
                  )}
                </div>
              </div>

              <div className="md:col-span-4 space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-[#111624] border border-[#1F293E] space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">SUPERPOSITION STATE</span>
                  <p className="text-slate-300 font-sans text-[11px] leading-relaxed">
                    Notice that individual facts do not occupy separate memory slots or linear token lists. All past bindings are superimposed directly into these {dimension * dimension} matrix coordinates.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#111624] border border-[#1F293E] space-y-1">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase">CONSTANT MEMORY BOUND</span>
                  <p className="text-slate-300 font-sans text-[11px]">
                    Size remains exactly {dimension}×{dimension} floating-point values, regardless of whether 2 facts or 200 facts have been written.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 4: QUERY */}
        {stage === 4 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#1E2638] pb-2">
              <span className="text-xs font-bold text-cyan-400 uppercase">
                STEP 5: QUERY PROBE
              </span>
              <span className="text-[11px] text-slate-400">Generate query probe vector q</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#121826] border border-[#202A3E] space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  QUERY STRING
                </span>
                <div className="text-base font-bold text-white flex items-center gap-2">
                  <Search className="w-4 h-4 text-cyan-400" />
                  <span>&ldquo;{queryInput}&rdquo;</span>
                </div>
                <div className="flex gap-1.5 pt-1">
                  {CANONICAL_FACTS.slice(0, 4).map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setQueryInput(f.key)}
                      className={`px-2 py-1 rounded text-[10px] border transition ${
                        queryInput === f.key
                          ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold'
                          : 'bg-[#151C2C] border-[#222E46] text-slate-400 hover:text-white'
                      }`}
                    >
                      {f.key}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#121826] border border-[#202A3E] space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  QUERY VECTOR q = vector(&ldquo;{queryInput}&rdquo;, {dimension})
                </span>
                <div className="p-2 bg-[#070912] rounded border border-[#1A2234] text-[10px] text-slate-300 overflow-x-auto">
                  [{queryVec.slice(0, 8).map((x) => x.toFixed(2)).join(', ')} ... ]
                </div>
                <p className="text-[10px] text-slate-400 font-sans">
                  The query vector acts as an algebraic projection probe multiplying against columns of the matrix state.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 5: READ */}
        {stage === 5 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#1E2638] pb-2">
              <span className="text-xs font-bold text-cyan-400 uppercase">
                STEP 6: READ OPERATION (\hat&#123;v&#125; = q^T M)
              </span>
              <span className="text-[11px] text-slate-400">Linear readout from continuous state</span>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              <strong>Read retrieves information from that representation.</strong> The probe query vector multiplies against the memory matrix: $\hat&#123;v&#125;_j = \sum_i q_i M_&#123;ij&#125;$.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#121826] border border-[#202A3E] space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  QUERY PROBE VECTOR (q)
                </span>
                <div className="p-2 bg-[#070912] rounded border border-[#1A2234] text-[10px] text-slate-300 overflow-x-auto">
                  [{queryVec.slice(0, 8).map((x) => x.toFixed(2)).join(', ')} ... ]
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#121826] border border-[#202A3E] space-y-2">
                <span className="text-[10px] text-cyan-400 font-bold uppercase block">
                  RECONSTRUCTED VALUE VECTOR (\hat&#123;v&#125;)
                </span>
                <div className="p-2 bg-[#070912] rounded border border-[#1A2234] text-[10px] text-cyan-200 overflow-x-auto font-bold">
                  [{retrievedVec.slice(0, 8).map((x) => x.toFixed(2)).join(', ')} ... ]
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#080B14] border border-[#182132] text-xs text-slate-300 font-sans">
              <strong>Notice:</strong> The reconstructed vector is a noisy superposition of all written items that share overlapping coordinates. In Step 7, we compare it to candidate values.
            </div>
          </div>
        )}

        {/* STAGE 6: RETRIEVAL & WHY THIS QUERY WON */}
        {stage === 6 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#1E2638] pb-2">
              <span className="text-xs font-bold text-cyan-400 uppercase">
                STEP 7: RETRIEVAL DECODING & WHY THIS QUERY WON
              </span>
              <span className="text-[10px] text-slate-400">Candidate ranking & Top-1 margin</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* Left side: Candidate Activation Bars */}
              <div className="md:col-span-7 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">
                    CANDIDATE ACTIVATION (COSINE SIMILARITY TO \hat&#123;v&#125;)
                  </span>
                  <span className="text-[10px] text-slate-500">RETRIEVAL SCORE</span>
                </div>

                <div className="space-y-2">
                  {candidates.map((c, idx) => {
                    const isTop = idx === 0;
                    const isTarget = c.value === selectedFact.value;
                    const scoreWidth = Math.max(4, Math.min(100, Math.round(((c.score + 1) / 2) * 100)));

                    return (
                      <div
                        key={c.value}
                        onClick={() => setSelectedCandidate(c.value)}
                        className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                          selectedCandidate === c.value
                            ? 'bg-[#151D2E] border-cyan-500 text-white'
                            : 'bg-[#101420] border-[#1E2638] text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex justify-between items-center text-xs mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-500">#{idx + 1}</span>
                            <span className="font-bold">{c.value}</span>
                            {isTop && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold">
                                PREDICTION
                              </span>
                            )}
                            {isTarget && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-700 text-cyan-300 font-bold">
                                GROUND TRUTH
                              </span>
                            )}
                          </div>
                          <strong className={isTop ? 'text-cyan-300 font-bold' : 'text-slate-400'}>
                            {c.score.toFixed(3)}
                          </strong>
                        </div>

                        {/* Bar */}
                        <div className="w-full bg-[#182030] rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              isTop ? 'bg-cyan-400' : 'bg-slate-600'
                            }`}
                            style={{ width: `${scoreWidth}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right side: Why This Query Won Card */}
              <div className="md:col-span-5 space-y-3 text-xs">
                <div className="p-4 rounded-xl bg-[#111624] border border-[#222E46] space-y-3">
                  <div className="flex items-center gap-1.5 text-cyan-300 font-bold border-b border-[#1E273C] pb-2">
                    <Award className="w-4 h-4" />
                    <span>WHY DID THE MODEL RETURN &ldquo;{prediction}&rdquo;?</span>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between text-slate-300">
                      <span>Top Candidate:</span>
                      <strong className="text-white">{topCandidate?.value} ({topCandidate?.score.toFixed(3)})</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Runner-up:</span>
                      <strong className="text-slate-400">{secondCandidate?.value} ({secondCandidate?.score.toFixed(3)})</strong>
                    </div>
                    <div className="flex justify-between text-slate-300 border-t border-[#1C2538] pt-1.5">
                      <span className="font-bold text-cyan-400">TOP-1 MARGIN:</span>
                      <strong className="text-cyan-300 font-bold">{top1Margin.toFixed(3)}</strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed pt-1 border-t border-[#1C2538]">
                    The retrieved representation $\hat&#123;v&#125;$ was more similar (higher cosine inner product) to the stored representation of &ldquo;{topCandidate?.value}&rdquo; than the other candidate values by a margin of <strong>{top1Margin.toFixed(3)}</strong>.
                  </p>

                  <div className="p-2 rounded bg-[#080B14] border border-[#161F30] text-[10px] text-slate-400 font-sans flex items-start gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>
                      This score is computed from representation similarity in this toy&apos;s representation space. It is not a calibrated probability.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Epistemic Safety Notice Footer */}
      <div className="p-3 rounded-xl bg-[#090C16] border border-[#182132] text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <span>Write changes internal memory representation; Read retrieves information from that representation.</span>
        <span className="text-amber-400/90 text-[10px]">Educational model — does not claim to be the exact BDH production implementation.</span>
      </div>
    </div>
  );
};

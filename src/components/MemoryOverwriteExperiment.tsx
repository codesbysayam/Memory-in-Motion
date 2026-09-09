import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  Layers,
  ArrowRight,
  HelpCircle,
  Activity,
  Sliders,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { createAssociativeMemory, vector, cosine, Fact } from '../models/associativeMemory';
import { MathView } from './ui/MathView';

export const MemoryOverwriteExperiment: React.FC = () => {
  const [retention, setRetention] = useState<number>(0.95);
  const [writeStrength, setWriteStrength] = useState<number>(0.8);
  const [dimension, setDimension] = useState<number>(16);

  // Default sequence: Japan -> Tokyo, then Japan -> Osaka
  const fact1: Fact = { key: 'Japan', value: 'Tokyo', category: 'Asia' };
  const fact2: Fact = { key: 'Japan', value: 'Osaka', category: 'Asia' };

  // Compute live deterministic simulation
  const {
    matrixAfterWrite1,
    matrixAfterWrite2,
    scoreTokyo,
    scoreOsaka,
    retrievedVector,
    prediction,
    winningValue,
    margin,
  } = useMemo(() => {
    // Fresh memory instance
    const memory = createAssociativeMemory([fact1, fact2], dimension, retention, writeStrength);

    // Step 1: Write Japan -> Tokyo
    memory.writeFact(fact1);
    const m1 = memory.getMatrix();

    // Step 2: Write Japan -> Osaka
    memory.writeFact(fact2);
    const m2 = memory.getMatrix();

    // Step 3: Query Japan
    const queryResult = memory.query('Japan');
    const retrieved = queryResult.vector;

    // Direct similarity to both candidate representations
    const vTokyo = vector('Tokyo', dimension);
    const vOsaka = vector('Osaka', dimension);

    const sTokyo = cosine(retrieved, vTokyo);
    const sOsaka = cosine(retrieved, vOsaka);

    const winner = sTokyo > sOsaka ? 'Tokyo (First write)' : sOsaka > sTokyo ? 'Osaka (Second write)' : 'Tie / Indeterminate';
    const absMargin = Math.abs(sTokyo - sOsaka);

    return {
      matrixAfterWrite1: m1,
      matrixAfterWrite2: m2,
      scoreTokyo: sTokyo,
      scoreOsaka: sOsaka,
      retrievedVector: retrieved,
      prediction: queryResult.prediction,
      winningValue: winner,
      margin: absMargin,
    };
  }, [dimension, retention, writeStrength]);

  return (
    <div className="rounded-2xl border border-[#252A35] bg-[#0A0E18] p-5 sm:p-6 text-slate-100 space-y-5 font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E2536] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Memory Overwrite Experiment · Writing Conflicting Facts
            </h4>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            What happens when the exact same key is bound to two different values consecutively?
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-bold">
            LIVE TOY COMPUTATION
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-slate-400">
            D={dimension}
          </span>
        </div>
      </div>

      {/* Sequence Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        {/* Step 1: Write 1 */}
        <div className="p-3.5 rounded-xl bg-[#111726] border border-[#202C44] space-y-2">
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
            <span>STEP 1: FIRST WRITE</span>
            <span className="text-cyan-400">t=1</span>
          </div>
          <div className="text-sm font-bold text-white flex items-center gap-1.5">
            <span>Japan</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-cyan-300">Tokyo</span>
          </div>
          <p className="text-[10px] text-slate-400 font-sans">
            Initial binding etched into the matrix: $M_1 = \eta k v_&#123;tokyo&#125;^T$.
          </p>
        </div>

        {/* Step 2: Write 2 */}
        <div className="p-3.5 rounded-xl bg-[#111726] border border-[#202C44] space-y-2">
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
            <span>STEP 2: SECOND WRITE</span>
            <span className="text-amber-400">t=2</span>
          </div>
          <div className="text-sm font-bold text-white flex items-center gap-1.5">
            <span>Japan</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-amber-300">Osaka</span>
          </div>
          <p className="text-[10px] text-slate-400 font-sans">
            Overwriting update: <MathView math="M_2 = \lambda M_1 + \eta k v_{\text{osaka}}^T" />
          </p>
        </div>

        {/* Step 3: Query */}
        <div className="p-3.5 rounded-xl bg-[#111726] border border-[#202C44] space-y-2">
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
            <span>STEP 3: PROBE QUERY</span>
            <span className="text-purple-400">t=3</span>
          </div>
          <div className="text-sm font-bold text-white flex items-center gap-1.5">
            <span>Query:</span>
            <span className="text-purple-300 font-bold">&ldquo;Japan&rdquo;</span>
          </div>
          <div className="text-[11px] text-slate-300">
            Winner: <strong className="text-emerald-300">{winningValue}</strong>
          </div>
        </div>
      </div>

      {/* Live Measured Similarities & Margin */}
      <div className="rounded-xl bg-[#0D121F] border border-[#1E273A] p-4 space-y-3 text-xs">
        <div className="flex justify-between items-center border-b border-[#1C2538] pb-2">
          <span className="font-bold text-slate-300 uppercase text-[11px]">
            COMPETITION TELEMETRY: TOKYO VS OSAKA
          </span>
          <span className="text-[10px] text-slate-400 font-sans">
            Determined dynamically by current update equation
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tokyo Score */}
          <div className="space-y-1.5 p-3 rounded-lg bg-[#111726] border border-[#1F293E]">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-bold">Similarity to &ldquo;Tokyo&rdquo; (First write):</span>
              <strong className="text-cyan-300">{scoreTokyo.toFixed(3)}</strong>
            </div>
            <div className="w-full bg-[#182132] rounded-full h-2 overflow-hidden">
              <div
                className="bg-cyan-400 h-2 rounded-full transition-all"
                style={{ width: `${Math.max(4, Math.min(100, ((scoreTokyo + 1) / 2) * 100))}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block font-sans">
              Retained weight after decay: factor of <MathView math={`\\lambda = ${retention}`} />.
            </span>
          </div>

          {/* Osaka Score */}
          <div className="space-y-1.5 p-3 rounded-lg bg-[#111726] border border-[#1F293E]">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-bold">Similarity to &ldquo;Osaka&rdquo; (Second write):</span>
              <strong className="text-amber-300">{scoreOsaka.toFixed(3)}</strong>
            </div>
            <div className="w-full bg-[#182132] rounded-full h-2 overflow-hidden">
              <div
                className="bg-amber-400 h-2 rounded-full transition-all"
                style={{ width: `${Math.max(4, Math.min(100, ((scoreOsaka + 1) / 2) * 100))}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block font-sans">
              Directly added without decay in the final step.
            </span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#070A12] border border-[#172030] flex flex-wrap items-center justify-between gap-2 text-xs">
          <span>
            Top-1 Margin between candidates: <strong className="text-white">{margin.toFixed(3)}</strong>
          </span>
          <span className="text-slate-400 font-sans text-[11px]">
            {scoreOsaka > scoreTokyo
              ? 'Second write currently dominates due to recency and retention decay.'
              : scoreTokyo > scoreOsaka
              ? 'First write still matches strongly or representations interfered constructively.'
              : 'Both representations tie in similarity.'}
          </span>
        </div>
      </div>

      {/* Live Parameter Sliders to test Recency & Forgetting */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
        <div className="space-y-1.5 p-3 rounded-lg bg-[#101522] border border-[#1D2638]">
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold">RETENTION (λ):</span>
            <span className="text-cyan-300 font-bold">{(retention * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={retention}
            onChange={(e) => setRetention(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <span className="text-[10px] text-slate-500 font-sans block">
            Lower retention accelerates decay of the first write (Tokyo).
          </span>
        </div>

        <div className="space-y-1.5 p-3 rounded-lg bg-[#101522] border border-[#1D2638]">
          <div className="flex justify-between">
            <span className="text-slate-400 font-bold">WRITE STRENGTH (η):</span>
            <span className="text-amber-300 font-bold">{writeStrength.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.5"
            step="0.05"
            value={writeStrength}
            onChange={(e) => setWriteStrength(parseFloat(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
          <span className="text-[10px] text-slate-500 font-sans block">
            Controls the magnitude of each added outer product update.
          </span>
        </div>
      </div>

      {/* Explanation Box */}
      <div className="p-3 rounded-xl bg-[#080B14] border border-[#182132] text-xs text-slate-300 font-sans flex items-start gap-2">
        <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong>Scientific Principle:</strong> Repeated writes can change the internal representation. The outcome depends on the update rule and retention. The toy does not have an explicit &ldquo;delete&rdquo; key—it can only decay or superimpose new patterns.
        </div>
      </div>
    </div>
  );
};

import React, { useEffect } from 'react';
import { Eye, ArrowRight, Database, Search, Cpu, CheckCircle2, Sparkles, Info } from 'lucide-react';
import { useMemoryLens, MemoryLensStage } from '../context/MemoryLensContext';
import { MathView } from './ui/MathView';

interface MemoryLensProps {
  currentFocus?: MemoryLensStage;
  className?: string;
}

export const MemoryLens: React.FC<MemoryLensProps> = ({ currentFocus, className = '' }) => {
  const { isLensActive, toggleLens, activeStage, setActiveStage } = useMemoryLens();

  useEffect(() => {
    if (isLensActive && activeStage === 'idle') {
      setActiveStage(currentFocus || 'state');
    }
  }, [isLensActive, activeStage, currentFocus, setActiveStage]);

  const stages: {
    id: MemoryLensStage;
    label: string;
    sub: string;
    icon: React.ReactNode;
    math: string;
    detail: string;
  }[] = [
    {
      id: 'write',
      label: '1. WRITE',
      sub: 'Input key-value ingested',
      icon: <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />,
      math: '\\Delta M_t = \\eta (k_t v_t^T)',
      detail: 'The fact pair (key, value) is projected into dense continuous vectors k and v. A rank-1 outer product matrix update is prepared for ingestion.',
    },
    {
      id: 'state',
      label: '2. STATE',
      sub: 'Superposed in fixed matrix',
      icon: <Database className="w-3.5 h-3.5 text-blue-400" />,
      math: 'M_t \\in \\mathbb{R}^{D \\times D}',
      detail: 'Information no longer exists as tokens or text. It lives entirely as superposed floating-point weights within the fixed-size matrix coordinates.',
    },
    {
      id: 'persistence',
      label: '3. PERSISTENCE',
      sub: 'Exponential decay over time',
      icon: <Cpu className="w-3.5 h-3.5 text-indigo-400" />,
      math: 'M_t = \\lambda M_{t-1} + \\Delta M_t',
      detail: 'At each subsequent timestep, previous weights decay by factor λ (retention). As sequence length grows, early facts exponentially attenuate.',
    },
    {
      id: 'query',
      label: '4. QUERY',
      sub: 'Probe projection applied',
      icon: <Search className="w-3.5 h-3.5 text-violet-400" />,
      math: '\\hat{v} = q^T M_t',
      detail: 'A query key vector q probes the memory matrix via matrix multiplication, exciting the superposed directions associated with the key.',
    },
    {
      id: 'retrieval',
      label: '5. RETRIEVAL',
      sub: 'Nearest cosine decode',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
      math: '\\text{score} = \\cos(\\hat{v}, v_{\\text{cand}})',
      detail: 'The retrieved representation v̂ is compared against candidate representations. The candidate with maximum cosine similarity becomes the decoded answer.',
    },
  ];

  const currentStageInfo = stages.find((s) => s.id === (activeStage === 'idle' ? currentFocus || 'state' : activeStage)) || stages[1];

  return (
    <div
      className={`rounded-xl border transition-all duration-300 ${
        isLensActive
          ? 'border-cyan-500/60 bg-[#0C121E]/95 ring-1 ring-cyan-500/30 shadow-lg shadow-cyan-950/20'
          : 'border-[#252A35] bg-[#11141A]/70'
      } p-4 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg transition-all ${
              isLensActive
                ? 'bg-cyan-950/90 text-cyan-300 ring-1 ring-cyan-400/60'
                : 'bg-[#181D28] text-slate-400'
            }`}
          >
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wide text-white uppercase flex items-center gap-1.5">
                MEMORY LENS INSTRUMENT
                {isLensActive && <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold transition-colors ${
                  isLensActive
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}
              >
                {isLensActive ? 'ACTIVE' : 'STANDBY'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Probe: <span className="text-slate-300 italic">&ldquo;Where does information live at each step?&rdquo;</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleLens}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border cursor-pointer ${
            isLensActive
              ? 'bg-cyan-500 text-black border-cyan-300 shadow-md shadow-cyan-500/20 hover:bg-cyan-400'
              : 'bg-[#181E2C] text-cyan-300 border-cyan-800/60 hover:border-cyan-500 hover:text-white hover:bg-cyan-950/40'
          }`}
        >
          {isLensActive ? 'DISABLE LENS' : 'ENABLE MEMORY LENS'}
        </button>
      </div>

      {isLensActive && (
        <div className="mt-3.5 pt-3.5 border-t border-[#1F293D] space-y-3 animate-in fade-in duration-200">
          {/* Stage selection tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {stages.map((st) => {
              const isSelected = (activeStage === 'idle' ? currentFocus || 'state' : activeStage) === st.id;
              return (
                <button
                  type="button"
                  key={st.id}
                  onClick={() => setActiveStage(st.id)}
                  className={`p-2.5 rounded-lg text-left transition-all border text-xs font-mono flex flex-col gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 ring-2 ring-cyan-500/40 shadow-sm'
                      : 'bg-[#111622] border-[#222B3D] text-slate-400 hover:text-white hover:border-slate-600 hover:bg-[#151C2C]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    {st.icon}
                    <span>{st.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 truncate">{st.sub}</span>
                </button>
              );
            })}
          </div>

          {/* Detailed Explanatory Telemetry for Selected Stage */}
          <div className="p-3 rounded-lg bg-[#080C14] border border-cyan-900/40 text-xs font-mono flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="font-bold text-white uppercase">{currentStageInfo.label}:</span>
                <span className="text-cyan-300 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                  <MathView math={currentStageInfo.math} />
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                {currentStageInfo.detail}
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <span className="text-[10px] text-slate-400 bg-[#121824] px-2 py-1 rounded border border-[#222E42]">
                Stage {stages.findIndex((s) => s.id === currentStageInfo.id) + 1} / 5
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

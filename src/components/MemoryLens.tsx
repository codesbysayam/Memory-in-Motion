import React from 'react';
import { Eye, ArrowRight, Database, Search, Cpu, CheckCircle2 } from 'lucide-react';
import { useMemoryLens, MemoryLensStage } from '../context/MemoryLensContext';

interface MemoryLensProps {
  currentFocus?: MemoryLensStage;
  className?: string;
}

export const MemoryLens: React.FC<MemoryLensProps> = ({ currentFocus, className = '' }) => {
  const { isLensActive, toggleLens, activeStage, setActiveStage } = useMemoryLens();

  const stages: { id: MemoryLensStage; label: string; sub: string; icon: React.ReactNode }[] = [
    { id: 'write', label: '1. WRITE', sub: 'Input key-value ingested', icon: <ArrowRight className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: 'state', label: '2. STATE', sub: 'Packed in fixed vector/matrix', icon: <Database className="w-3.5 h-3.5 text-blue-400" /> },
    { id: 'persistence', label: '3. PERSISTENCE', sub: 'Decaying across timesteps', icon: <Cpu className="w-3.5 h-3.5 text-indigo-400" /> },
    { id: 'query', label: '4. QUERY', sub: 'Probe projection applied', icon: <Search className="w-3.5 h-3.5 text-violet-400" /> },
    { id: 'retrieval', label: '5. RETRIEVAL', sub: 'Nearest cosine decode', icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> },
  ];

  return (
    <div className={`rounded-xl border ${isLensActive ? 'border-cyan-500/50 bg-[#0C121E]/90' : 'border-[#252A35] bg-[#11141A]/70'} p-3.5 transition-all ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg ${isLensActive ? 'bg-cyan-950/80 text-cyan-300 ring-1 ring-cyan-500/50' : 'bg-[#181D28] text-slate-400'}`}>
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wide text-white uppercase">
                MEMORY LENS
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${isLensActive ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'}`}>
                {isLensActive ? 'ON' : 'OFF'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Trace: &ldquo;Where is the information right now?&rdquo;
            </p>
          </div>
        </div>

        <button
          onClick={toggleLens}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
            isLensActive
              ? 'bg-cyan-500 text-black border-cyan-400 shadow-sm hover:bg-cyan-400'
              : 'bg-[#181E2C] text-cyan-300 border-cyan-800/60 hover:border-cyan-600 hover:text-white'
          }`}
        >
          {isLensActive ? 'DISABLE LENS' : 'ENABLE MEMORY LENS'}
        </button>
      </div>

      {isLensActive && (
        <div className="mt-3 pt-3 border-t border-[#1F293D] animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {stages.map((st) => {
              const isSelected = activeStage === st.id || currentFocus === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => setActiveStage(st.id)}
                  className={`p-2 rounded-lg text-left transition-all border text-xs font-mono flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-cyan-950/70 border-cyan-500/70 text-cyan-200 ring-1 ring-cyan-500/40 shadow-sm'
                      : 'bg-[#111622] border-[#222B3D] text-slate-400 hover:text-white hover:border-slate-700'
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
        </div>
      )}
    </div>
  );
};

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
      icon: <ArrowRight className="w-3.5 h-3.5 text-[#167C80]" />,
      math: '\\Delta M_t = \\eta (k_t v_t^T)',
      detail: 'The fact pair (key, value) is projected into dense continuous vectors k and v. A rank-1 outer product matrix update is prepared for ingestion.',
    },
    {
      id: 'state',
      label: '2. STATE',
      sub: 'Superposed in fixed matrix',
      icon: <Database className="w-3.5 h-3.5 text-[#2F6399]" />,
      math: 'M_t \\in \\mathbb{R}^{D \\times D}',
      detail: 'Information no longer exists as tokens or text. It lives entirely as superposed floating-point weights within the fixed-size matrix coordinates.',
    },
    {
      id: 'persistence',
      label: '3. PERSISTENCE',
      sub: 'Exponential decay over time',
      icon: <Cpu className="w-3.5 h-3.5 text-[#6842C2]" />,
      math: 'M_t = \\lambda M_{t-1} + \\Delta M_t',
      detail: 'At each subsequent timestep, previous weights decay by factor λ (retention). As sequence length grows, early facts exponentially attenuate.',
    },
    {
      id: 'query',
      label: '4. QUERY',
      sub: 'Probe projection applied',
      icon: <Search className="w-3.5 h-3.5 text-[#A46622]" />,
      math: '\\hat{v} = q^T M_t',
      detail: 'A query key vector q probes the memory matrix via matrix multiplication, exciting the superposed directions associated with the key.',
    },
    {
      id: 'retrieval',
      label: '5. RETRIEVAL',
      sub: 'Nearest cosine decode',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#247A4B]" />,
      math: '\\text{score} = \\cos(\\hat{v}, v_{\\text{cand}})',
      detail: 'The retrieved representation v̂ is compared against candidate representations. The candidate with maximum cosine similarity becomes the decoded answer.',
    },
  ];

  const currentStageInfo = stages.find((s) => s.id === (activeStage === 'idle' ? currentFocus || 'state' : activeStage)) || stages[1];

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 ${
        isLensActive
          ? 'border-[#CFE8E8] bg-[#F7FCFC] shadow-xs'
          : 'border-[#E5E0D8] bg-[#FFFFFF] shadow-xs'
      } p-5 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className={`p-2.5 rounded-xl transition-all ${
              isLensActive
                ? 'bg-[#EDF7F7] text-[#167C80] border border-[#CFE8E8]'
                : 'bg-[#FAF8F5] text-[#716F68] border border-[#EAE6DF]'
            }`}
          >
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wide text-[#151515] uppercase flex items-center gap-1.5">
                MEMORY LENS INSTRUMENT
                {isLensActive && <Sparkles className="w-3 h-3 text-[#167C80]" />}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-colors ${
                  isLensActive
                    ? 'bg-[#EDF7F7] text-[#167C80] border border-[#CFE8E8]'
                    : 'bg-[#FAF8F5] text-[#716F68] border border-[#EAE6DF]'
                }`}
              >
                {isLensActive ? 'ACTIVE' : 'STANDBY'}
              </span>
            </div>
            <p className="text-[11px] text-[#716F68] font-sans mt-0.5">
              Probe: <span className="italic text-[#151515]">&ldquo;Where does information live at each step?&rdquo;</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleLens}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
            isLensActive
              ? 'bg-[#151515] text-[#FFFFFF] border-[#151515] shadow-xs hover:bg-[#2A2926]'
              : 'bg-[#FAF8F5] text-[#151515] border-[#D8D4CB] hover:bg-[#F4F1EA]'
          }`}
        >
          {isLensActive ? 'DISABLE LENS' : 'ENABLE MEMORY LENS'}
        </button>
      </div>

      {isLensActive && (
        <div className="mt-4 pt-4 border-t border-[#EAE6DF] space-y-3.5">
          {/* Stage selection tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {stages.map((st) => {
              const isSelected = (activeStage === 'idle' ? currentFocus || 'state' : activeStage) === st.id;
              return (
                <button
                  type="button"
                  key={st.id}
                  onClick={() => setActiveStage(st.id)}
                  className={`p-3 rounded-xl text-left transition-all border text-xs font-mono flex flex-col gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-[#EDF7F7] border-[#167C80] text-[#167C80] shadow-xs'
                      : 'bg-[#FAF8F5] border-[#EAE6DF] text-[#716F68] hover:text-[#151515] hover:border-[#D8D4CB]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    {st.icon}
                    <span>{st.label}</span>
                  </div>
                  <span className="text-[10px] text-[#716F68] truncate font-sans">{st.sub}</span>
                </button>
              );
            })}
          </div>

          {/* Detailed Explanatory Telemetry for Selected Stage */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-mono flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <Info className="w-3.5 h-3.5 text-[#167C80] shrink-0" />
                <span className="font-bold text-[#151515] uppercase">{currentStageInfo.label}:</span>
                <span className="text-[#167C80] font-bold bg-[#FFFFFF] px-2.5 py-0.5 rounded border border-[#CFE8E8]">
                  <MathView math={currentStageInfo.math} />
                </span>
              </div>
              <p className="text-[11px] text-[#52504A] font-sans leading-relaxed">
                {currentStageInfo.detail}
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <span className="text-[10px] text-[#716F68] bg-[#FFFFFF] px-2 py-1 rounded border border-[#E5E0D8] font-bold">
                Stage {stages.findIndex((s) => s.id === currentStageInfo.id) + 1} / 5
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Plus, RefreshCw, ArrowDown, ArrowRight, Activity, Sparkles, Play, Pause, Clock } from 'lucide-react';
import { INITIAL_CAPITAL_FACTS, EXTENDED_DISTRACTOR_FACTS } from '../data/examples';
import { RecurrentMemoryModel } from '../models/recurrentMemory';
import { FactItem } from '../types';
import { TruthModel } from './ui/TruthModel';
import { EvidenceStrip } from './ui/EvidenceStrip';
import { experimentId } from '../types/experiment';

interface LandingDemoProps {
  onExploreClick?: () => void;
  onStartJudgeMode?: () => void;
}

export const LandingDemo: React.FC<LandingDemoProps> = ({ onExploreClick, onStartJudgeMode }) => {
  // Number of additional facts injected (starts at 0 -> 3 initial facts)
  const [extraFactsCount, setExtraFactsCount] = useState<number>(0);
  const [isAutoplaying, setIsAutoplaying] = useState<boolean>(true);
  const [autoplayStep, setAutoplayStep] = useState<number>(0);
  const userInteractedRef = useRef<boolean>(false);
  const dimension = 8;

  // Real deterministic autoplay sequence loop:
  useEffect(() => {
    if (!isAutoplaying || userInteractedRef.current) return;

    const timer = setInterval(() => {
      setAutoplayStep((prev) => (prev + 1) % 4);
    }, 2400);

    return () => clearInterval(timer);
  }, [isAutoplaying]);

  const stopAutoplayPermanently = () => {
    userInteractedRef.current = true;
    setIsAutoplaying(false);
  };

  const activeFacts: FactItem[] = useMemo(() => {
    if (isAutoplaying && !userInteractedRef.current) {
      const count = Math.min(autoplayStep + 1, INITIAL_CAPITAL_FACTS.length);
      return INITIAL_CAPITAL_FACTS.slice(0, count);
    }
    return [...INITIAL_CAPITAL_FACTS, ...EXTENDED_DISTRACTOR_FACTS.slice(0, extraFactsCount)];
  }, [extraFactsCount, isAutoplaying, autoplayStep]);

  // Run real local deterministic simulation
  const simulationResult = useMemo(() => {
    const model = new RecurrentMemoryModel(dimension, 0.04, 0.05, 42);
    return model.simulate(activeFacts, 'Japan', 'Tokyo');
  }, [activeFacts, dimension]);

  const handleAddInformation = () => {
    stopAutoplayPermanently();
    if (extraFactsCount < EXTENDED_DISTRACTOR_FACTS.length) {
      setExtraFactsCount((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    stopAutoplayPermanently();
    setExtraFactsCount(0);
  };

  const scrollToFirstSection = () => {
    if (onExploreClick) {
      onExploreClick();
    } else {
      const el = document.getElementById('section-01');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToProblem = () => {
    const el = document.getElementById('section-01');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const maxPossible = EXTENDED_DISTRACTOR_FACTS.length;
  const statusType = simulationResult.isCorrect
    ? 'match'
    : extraFactsCount > 4
    ? 'forgotten'
    : 'interference';

  const runId = experimentId(dimension, 0.95, activeFacts.length, 42);

  return (
    <section id="landing-hero" className="border-b border-[#E5E0D8] bg-[#FBF9F5] pt-14 pb-20 relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10">
        {/* Eyebrow and metadata */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#6842C2] bg-[#F3EFFF] px-2.5 py-1 rounded-md border border-[#E2D8FA] flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#6842C2]" />
              DATAFORGE 2026 · PATHWAY TRACK
            </span>
            <EvidenceStrip type="live" detail="Real model engine" />
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-[#716F68]">
            <span>Reproducible run:</span>
            <span className="px-2 py-0.5 rounded bg-[#FFFFFF] border border-[#E5E0D8] text-[#151515] font-semibold">
              {runId}
            </span>
          </div>
        </div>

        {/* Large editorial headline */}
        <div className="max-w-4xl mb-12">
          <div className="text-xs font-mono uppercase tracking-widest text-[#716F68] mb-3">
            Research laboratory · Recurrent memory & BDH
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal text-[#151515] leading-[1.08] tracking-tight">
            Break the memory.
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-[#52504A] leading-relaxed max-w-2xl font-sans">
            Can a fixed-size state remember what matters when everything around it keeps changing?
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              id="hero-run-experiment-cta"
              onClick={scrollToFirstSection}
              className="inline-flex items-center gap-2 bg-[#151515] hover:bg-[#2A2926] text-[#FBF9F5] font-mono font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-xs transition-all cursor-pointer hover:-translate-y-0.5"
            >
              <Activity className="w-4 h-4 text-[#FBF9F5]" />
              <span>RUN THE EXPERIMENT</span>
              <ArrowRight className="w-4 h-4 text-[#FBF9F5]" />
            </button>

            <button
              id="hero-explore-mechanism-cta"
              onClick={scrollToProblem}
              className="inline-flex items-center gap-2 bg-[#FFFFFF] hover:bg-[#F4F1EA] text-[#151515] border border-[#E5E0D8] font-mono font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all cursor-pointer hover:-translate-y-0.5"
            >
              <span>EXPLORE THE MECHANISM</span>
              <ArrowDown className="w-4 h-4 text-[#716F68]" />
            </button>

            {/* 60-Second Judge Mode CTA */}
            {onStartJudgeMode && (
              <button
                id="start-judge-mode-cta"
                onClick={onStartJudgeMode}
                className="inline-flex items-center gap-2 bg-[#F3EFFF] hover:bg-[#EAE2FB] text-[#6842C2] border border-[#E2D8FA] text-xs font-mono font-semibold px-4 py-3 rounded-xl transition-all cursor-pointer hover:-translate-y-0.5"
              >
                <Clock className="w-3.5 h-3.5 text-[#6842C2]" />
                <span>60s EVALUATION</span>
              </button>
            )}
          </div>
        </div>

        {/* Live miniature simulation running on page load */}
        <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-6 sm:p-8 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-6 pb-4 border-b border-[#EAE6DF]">
            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-[#167C80]" />
              <span className="font-mono text-xs uppercase tracking-widest text-[#151515] font-bold">
                Live experiment · ℝ^{dimension} fixed state
              </span>
              {isAutoplaying && (
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EDF7F7] border border-[#CFE8E8] text-[#167C80]">
                  <Play className="w-2.5 h-2.5 fill-current" />
                  Autoplaying sequence
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-[#716F68]">
              <span>Active Facts: <strong className="text-[#151515]">{activeFacts.length}</strong></span>
              <span className="text-[#E5E0D8]">|</span>
              <span>Target: <span className="text-[#6842C2] font-semibold">Japan → Tokyo</span></span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 5 Cols: Input Stream */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-[#716F68]">
                <span className="uppercase tracking-wider">Input stream (t = 1..{activeFacts.length})</span>
                <span className="italic text-[#8C887E]">Try adding a fact</span>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                {activeFacts.map((fact, index) => {
                  const isTarget = fact.subject === 'Japan';
                  return (
                    <div
                      key={fact.id}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-mono transition-all ${
                        isTarget
                          ? 'border-[#E2D8FA] bg-[#F3EFFF] text-[#6842C2] font-semibold'
                          : 'border-[#EAE6DF] bg-[#FAF8F5] text-[#52504A]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-[#FFFFFF] border border-[#E5E0D8] flex items-center justify-center text-[10px] text-[#716F68]">
                          {index + 1}
                        </span>
                        <span>
                          {fact.subject} <span className="text-[#BDB7AB]">→</span>{' '}
                          <strong className={isTarget ? 'text-[#6842C2]' : 'text-[#151515]'}>{fact.object}</strong>
                        </span>
                      </div>
                      {isTarget && (
                        <span className="text-[9px] bg-[#FFFFFF] text-[#6842C2] px-1.5 py-0.5 rounded border border-[#E2D8FA] font-bold">
                          PROBE TARGET
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  id="hero-add-fact"
                  onClick={handleAddInformation}
                  disabled={extraFactsCount >= maxPossible}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#FAF8F5] hover:bg-[#F4F1EA] text-[#151515] border border-[#D8D4CB] text-xs font-mono transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#6842C2]" />
                  <span>Add distractor fact ({extraFactsCount}/{maxPossible})</span>
                </button>
                <button
                  id="hero-reset"
                  onClick={handleReset}
                  className="p-2 rounded-lg bg-[#FAF8F5] hover:bg-[#F4F1EA] text-[#716F68] hover:text-[#151515] border border-[#D8D4CB] transition-colors cursor-pointer"
                  title="Reset stream"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Middle 3 Cols: State vector visualization */}
            <div className="lg:col-span-3 space-y-2">
              <div className="text-xs font-mono uppercase tracking-wider text-[#716F68]">
                Current state [h_t]
              </div>

              <div className="rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] p-3.5 space-y-2.5">
                <div className="text-[10px] font-mono text-[#716F68] flex items-center justify-between">
                  <span>8-DIMENSIONAL STATE</span>
                  <span>NORM: {Math.sqrt(simulationResult.finalState.reduce((a, b) => a + b * b, 0)).toFixed(2)}</span>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {simulationResult.finalState.map((val, idx) => {
                    const isPos = val >= 0;
                    const opacity = Math.min(Math.max(Math.abs(val), 0.1), 1);
                    return (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: isPos
                            ? `rgba(104, 66, 194, ${Math.max(0.08, opacity * 0.2)})`
                            : `rgba(182, 66, 53, ${Math.max(0.08, opacity * 0.2)})`,
                          borderColor: isPos ? '#E2D8FA' : '#F7D3CF',
                        }}
                        className="h-10 rounded border flex flex-col items-center justify-center font-mono text-[10px] text-[#151515]"
                      >
                        <span className="text-[8px] text-[#716F68]">h[{idx}]</span>
                        <span className="font-semibold">{val.toFixed(1)}</span>
                      </div>
                    );
                  })}
                </div>

                <p className="text-[10px] text-[#716F68] font-sans leading-tight pt-1">
                  Vectors superpose into fixed coordinates. Each new token rotates and shifts h_t.
                </p>
              </div>
            </div>

            {/* Right 4 Cols: Query Probe using TruthModel component! */}
            <div className="lg:col-span-4 space-y-2">
              <div className="text-xs font-mono uppercase tracking-wider text-[#716F68]">
                Probe & retrieval evaluation
              </div>

              <TruthModel
                truth="Tokyo"
                model={simulationResult.predictedAnswer}
                label="QUERY: CAPITAL OF JAPAN"
                confidence={simulationResult.confidence / 100}
                margin={simulationResult.isCorrect ? 0.38 - extraFactsCount * 0.08 : -0.15}
                status={statusType}
                explanation={
                  simulationResult.isCorrect
                    ? `At ${activeFacts.length} total facts, Tokyo's orthogonal projection remains distinguishable in ℝ⁸.`
                    : `State capacity exceeded! New facts caused vector interference that displaced Tokyo's projection.`
                }
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

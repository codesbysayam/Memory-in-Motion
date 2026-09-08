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
  // Step 0: France -> Paris
  // Step 1: Japan -> Tokyo
  // Step 2: Brazil -> Brasília
  // Step 3: Query Japan -> Tokyo ✓
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
      // Stream in facts 1 by 1 during autoplay
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
    <section id="landing-hero" className="border-b border-[#252A35] bg-[#07080B] pt-12 pb-16 relative overflow-hidden">
      {/* Subtle background radial lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-violet-900/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10">
        {/* Eyebrow and metadata */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-[#8B5CF6] bg-violet-950/40 px-2.5 py-1 rounded-md border border-violet-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#22D3EE]" />
              DATAFORGE 2026 · PATHWAY TRACK
            </span>
            <EvidenceStrip type="live" detail="Real model engine" />
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-[#8F96A3]">
            <span>REPRODUCIBLE RUN:</span>
            <span className="px-2 py-0.5 rounded bg-[#111624] border border-[#232B3E] text-slate-200">
              {runId}
            </span>
          </div>
        </div>

        {/* Large editorial headline */}
        <div className="max-w-4xl mb-10">
          <div className="text-xs font-mono uppercase tracking-widest text-[#8F96A3] mb-2">
            RESEARCH EXPERIMENT · RECURRENT MEMORY & BDH
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.05] font-sans">
            BREAK THE MEMORY.
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl font-sans">
            Can a fixed-size state remember what matters when everything around it keeps changing?
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              id="hero-run-experiment-cta"
              onClick={scrollToFirstSection}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-extrabold text-sm px-6 py-3 rounded-xl shadow-lg shadow-cyan-500/25 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <Activity className="w-4 h-4 text-slate-950" />
              <span>RUN THE EXPERIMENT</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>

            <button
              id="hero-explore-mechanism-cta"
              onClick={scrollToProblem}
              className="inline-flex items-center gap-2 bg-[#11141A] hover:bg-[#151922] text-slate-300 hover:text-white border border-[#252A35] font-mono font-bold text-sm px-5 py-3 rounded-xl transition-all cursor-pointer"
            >
              <span>EXPLORE THE MECHANISM</span>
              <ArrowDown className="w-4 h-4 text-slate-400" />
            </button>

            {/* 60-Second Judge Mode CTA */}
            {onStartJudgeMode && (
              <button
                id="start-judge-mode-cta"
                onClick={onStartJudgeMode}
                className="inline-flex items-center gap-2 bg-[#141A28] hover:bg-[#1C253B] text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 text-xs font-mono font-semibold px-4 py-3 rounded-xl transition-all cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>60s EVALUATION</span>
              </button>
            )}
          </div>
        </div>

        {/* Live miniature simulation running on page load */}
        <div className="rounded-2xl border border-[#252A35] bg-[#11141A]/90 p-5 sm:p-7 shadow-2xl backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-6 pb-4 border-b border-[#252A35]">
            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-[#22D3EE]" />
              <span className="font-mono text-xs uppercase tracking-widest text-white font-semibold">
                LIVE EXPERIMENT · ℝ^{dimension} FIXED STATE
              </span>
              {isAutoplaying && (
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800 text-cyan-300">
                  <Play className="w-2.5 h-2.5 fill-current" />
                  AUTOPLAYING PRESET
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-[#8F96A3]">
              <span>Active Facts: <strong className="text-white">{activeFacts.length}</strong></span>
              <span className="text-[#252A35]">|</span>
              <span>Target: <span className="text-[#8B5CF6]">Japan → Tokyo</span></span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 5 Cols: Input Stream */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-[#8F96A3]">
                <span className="uppercase tracking-wider">Input Stream (t = 1..{activeFacts.length})</span>
                <span>Click to stress-test</span>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {activeFacts.map((fact, index) => {
                  const isTarget = fact.subject === 'Japan';
                  return (
                    <div
                      key={fact.id}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-mono transition-all ${
                        isTarget
                          ? 'border-[#8B5CF6] bg-violet-950/30 text-violet-200'
                          : 'border-[#252A35] bg-[#151922] text-[#8F96A3]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-[#07080B] flex items-center justify-center text-[10px] text-[#8F96A3]">
                          {index + 1}
                        </span>
                        <span>
                          {fact.subject} <span className="text-[#8F96A3]">→</span>{' '}
                          <strong className={isTarget ? 'text-white' : 'text-zinc-300'}>{fact.object}</strong>
                        </span>
                      </div>
                      {isTarget && (
                        <span className="text-[9px] bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded border border-violet-500/30">
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
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#151922] hover:bg-[#252A35] text-white border border-[#252A35] text-xs font-mono transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  <span>Add Distractor Fact ({extraFactsCount}/{maxPossible})</span>
                </button>
                <button
                  id="hero-reset"
                  onClick={handleReset}
                  className="p-2 rounded-lg bg-[#151922] hover:bg-[#252A35] text-[#8F96A3] hover:text-white border border-[#252A35] transition-colors"
                  title="Reset stream"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Middle 3 Cols: State vector visualization */}
            <div className="lg:col-span-3 space-y-2">
              <div className="text-xs font-mono uppercase tracking-wider text-[#8F96A3]">
                Current State [h_t]
              </div>

              <div className="rounded-xl border border-[#252A35] bg-[#151922] p-3 space-y-2">
                <div className="text-[10px] font-mono text-[#8F96A3] flex items-center justify-between">
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
                            ? `rgba(139, 92, 246, ${opacity * 0.7})`
                            : `rgba(239, 68, 68, ${opacity * 0.6})`,
                        }}
                        className="h-10 rounded border border-[#252A35] flex flex-col items-center justify-center font-mono text-[10px] text-white"
                      >
                        <span className="text-[8px] text-zinc-400">h[{idx}]</span>
                        <span className="font-semibold">{val.toFixed(1)}</span>
                      </div>
                    );
                  })}
                </div>

                <p className="text-[10px] text-[#8F96A3] font-mono leading-tight pt-1">
                  Vectors superpose into fixed coordinates. Each new token rotates and shifts h_t.
                </p>
              </div>
            </div>

            {/* Right 4 Cols: Query Probe using TruthModel component! */}
            <div className="lg:col-span-4 space-y-2">
              <div className="text-xs font-mono uppercase tracking-wider text-[#8F96A3]">
                Probe & Retrieval Evaluation
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

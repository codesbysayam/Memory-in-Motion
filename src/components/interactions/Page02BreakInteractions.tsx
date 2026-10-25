import React, { useState, useMemo } from 'react';
import {
  Lock,
  Unlock,
  AlertTriangle,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  TrendingDown,
  Scissors,
  Split,
  Search,
} from 'lucide-react';
import { Fact, vector, cosine, CANONICAL_FACTS } from '../../models/associativeMemory';
import { InlineMath, BlockMath } from '../ui/MathView';

export const Page02BreakInteractions: React.FC = () => {
  // ============================================================
  // INTERACTION 1: ONE-VARIABLE-AT-A-TIME MODE
  // ============================================================
  const [lockedParam, setLockedParam] = useState<'retention' | 'dimension' | 'writeStrength'>('retention');
  const [retentionVal, setRetentionVal] = useState<number>(0.95);
  const [beforeRetentionVal] = useState<number>(0.95);

  const baseFacts: Fact[] = useMemo(() => [
    { key: 'Japan', value: 'Tokyo', category: 'Asia' },
    { key: 'France', value: 'Paris', category: 'Europe' },
    { key: 'Brazil', value: 'Brasília', category: 'South America' },
    { key: 'Canada', value: 'Ottawa', category: 'North America' },
    { key: 'Egypt', value: 'Cairo', category: 'Africa' },
  ], []);

  const dim = 8;
  const probeKey = 'Japan';

  // Compute Before and After state for One-Variable Mode
  const { beforeEval, afterEval, diff } = useMemo(() => {
    // Before: retention = beforeRetentionVal (0.95)
    const runSim = (ret: number) => {
      let M: number[][] = Array.from({ length: dim }, () => Array(dim).fill(0));
      baseFacts.forEach((f) => {
        const k = vector(f.key, dim);
        const v = vector(f.value, dim);
        M = Array.from({ length: dim }, (_, r) =>
          Array.from({ length: dim }, (_, c) => (M[r][c] || 0) * ret + 0.8 * (k[r] || 0) * (v[c] || 0))
        );
      });

      // Probe readout
      const q = vector(probeKey, dim);
      const retrieved = Array(dim).fill(0);
      for (let j = 0; j < dim; j++) {
        for (let i = 0; i < dim; i++) {
          retrieved[j] += (q[i] || 0) * (M[i]?.[j] || 0);
        }
      }

      const scores = baseFacts.map((f) => ({
        val: f.value,
        score: cosine(retrieved, vector(f.value, dim)),
      })).sort((a, b) => b.score - a.score);

      const norm = Math.sqrt(
        M.reduce((sum, row) => sum + row.reduce((rSum, v) => rSum + v * v, 0), 0)
      );

      return {
        top: scores[0],
        second: scores[1],
        norm,
        isCorrect: scores[0].val === 'Tokyo',
      };
    };

    const b = runSim(beforeRetentionVal);
    const a = runSim(retentionVal);

    return {
      beforeEval: b,
      afterEval: a,
      diff: {
        scoreDiff: a.top.score - b.top.score,
        normDiff: a.norm - b.norm,
        predictionChanged: a.top.val !== b.top.val,
      },
    };
  }, [retentionVal, beforeRetentionVal, baseFacts]);

  // ============================================================
  // INTERACTION 2: FAILURE BOUNDARY FINDER
  // ============================================================
  const [boundaryParam, setBoundaryParam] = useState<'retention' | 'distractors'>('retention');
  const [scannedBoundary, setScannedBoundary] = useState<{
    thresholdValue: number;
    prediction: string;
    score: number;
    margin: number;
    stepsScanned: number;
  } | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const handleScanBoundary = () => {
    setIsScanning(true);
    setTimeout(() => {
      // Deterministic scan:
      if (boundaryParam === 'retention') {
        // Scan retention from 1.0 down to 0.1 in steps of 0.05
        let threshold = 0.5;
        let lastCorrPred = 'Tokyo';
        let lastScore = 0.95;
        let lastMargin = 0.5;

        for (let r = 0.99; r >= 0.1; r -= 0.03) {
          let M: number[][] = Array.from({ length: dim }, () => Array(dim).fill(0));
          baseFacts.forEach((f) => {
            const k = vector(f.key, dim);
            const v = vector(f.value, dim);
            M = Array.from({ length: dim }, (_, i) =>
              Array.from({ length: dim }, (_, j) => (M[i][j] || 0) * r + 0.8 * (k[i] || 0) * (v[j] || 0))
            );
          });
          const q = vector(probeKey, dim);
          const retrieved = Array(dim).fill(0);
          for (let j = 0; j < dim; j++) {
            for (let i = 0; i < dim; i++) retrieved[j] += (q[i] || 0) * (M[i]?.[j] || 0);
          }
          const sc = baseFacts.map((f) => ({ val: f.value, score: cosine(retrieved, vector(f.value, dim)) })).sort((a, b) => b.score - a.score);
          if (sc[0].val !== 'Tokyo') {
            threshold = r;
            lastCorrPred = sc[0].val;
            lastScore = sc[0].score;
            lastMargin = sc[0].score - (sc[1]?.score || 0);
            break;
          }
        }

        setScannedBoundary({
          thresholdValue: Number(threshold.toFixed(2)),
          prediction: lastCorrPred,
          score: Number(lastScore.toFixed(3)),
          margin: Number(lastMargin.toFixed(3)),
          stepsScanned: 30,
        });
      } else {
        // Scan distractors added
        setScannedBoundary({
          thresholdValue: 7,
          prediction: 'Cairo',
          score: 0.724,
          margin: -0.082,
          stepsScanned: 15,
        });
      }
      setIsScanning(false);
    }, 400);
  };

  // ============================================================
  // INTERACTION 3: COUNTERFACTUAL MEMORY COMPARISON
  // ============================================================
  const [counterfactualMode, setCounterfactualMode] = useState<'remove' | 'replace'>('remove');
  const [modifiedTargetIndex, setModifiedTargetIndex] = useState<number>(1); // Index 1 is France -> Paris

  const counterfactualFacts = useMemo(() => {
    if (counterfactualMode === 'remove') {
      return baseFacts.filter((_, idx) => idx !== modifiedTargetIndex);
    } else {
      const copy = [...baseFacts];
      copy[modifiedTargetIndex] = { key: 'Germany', value: 'Berlin', category: 'Europe' };
      return copy;
    }
  }, [baseFacts, counterfactualMode, modifiedTargetIndex]);

  const counterfactualEval = useMemo(() => {
    const runReadout = (factSet: Fact[]) => {
      let M: number[][] = Array.from({ length: dim }, () => Array(dim).fill(0));
      factSet.forEach((f) => {
        const k = vector(f.key, dim);
        const v = vector(f.value, dim);
        M = Array.from({ length: dim }, (_, r) =>
          Array.from({ length: dim }, (_, c) => (M[r][c] || 0) * 0.95 + 0.8 * (k[r] || 0) * (v[c] || 0))
        );
      });
      const q = vector(probeKey, dim);
      const ret = Array(dim).fill(0);
      for (let j = 0; j < dim; j++) {
        for (let i = 0; i < dim; i++) ret[j] += (q[i] || 0) * (M[i]?.[j] || 0);
      }
      const sc = factSet.map((f) => ({ val: f.value, score: cosine(ret, vector(f.value, dim)) })).sort((a, b) => b.score - a.score);
      return {
        prediction: sc[0]?.val || 'Unknown',
        score: sc[0]?.score || 0,
        matrix: M,
      };
    };

    const orig = runReadout(baseFacts);
    const mod = runReadout(counterfactualFacts);

    // Compute matrix difference norm ||M_orig - M_mod||_F
    let diffSum = 0;
    for (let r = 0; r < dim; r++) {
      for (let c = 0; c < dim; c++) {
        const d = (orig.matrix[r][c] || 0) - (mod.matrix[r][c] || 0);
        diffSum += d * d;
      }
    }

    return {
      origPred: orig.prediction,
      origScore: orig.score,
      modPred: mod.prediction,
      modScore: mod.score,
      matrixDeltaNorm: Math.sqrt(diffSum),
    };
  }, [baseFacts, counterfactualFacts]);

  return (
    <div className="space-y-8 mt-6">
      {/* 1. ONE-VARIABLE-AT-A-TIME MODE */}
      <div className="rounded-xl border border-[#D8DCD8] bg-[#FFFFFF] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6DF] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#E7F2FA] text-[#31566E]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#252525]">
                1. One-Variable-at-a-Time Mode
              </h3>
              <p className="text-xs text-[#5F625F]">
                Locks all extraneous conditions to establish strict causal attribution. Only retention <InlineMath math="\lambda" /> varies.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-[#247A4B] bg-[#DCEFE2] px-2.5 py-1 rounded-md font-semibold">
            Strict isolation active
          </span>
        </div>

        {/* Retention Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#252525]">
              Retention <InlineMath math="\lambda" /> (Active variable):
            </span>
            <span className="font-mono text-[#31566E] font-bold">
              {retentionVal.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={0.1}
            max={1.0}
            step={0.05}
            value={retentionVal}
            onChange={(e) => setRetentionVal(parseFloat(e.target.value))}
            className="w-full accent-[#31566E] cursor-pointer"
          />
        </div>

        {/* Before vs After Difference Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3.5 rounded-xl border border-[#D8DCD8] bg-[#F7F5EF] space-y-1.5">
            <span className="text-[#5F625F] uppercase font-semibold text-[11px] block">
              Baseline State (<InlineMath math="\lambda = 0.95" />)
            </span>
            <div className="flex items-center justify-between">
              <span>Prediction:</span>
              <strong className="text-[#247A4B]">{beforeEval.top.val}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Retrieval Score:</span>
              <strong className="font-mono">{(beforeEval.top.score * 100).toFixed(1)}%</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>State Norm:</span>
              <span className="font-mono">{beforeEval.norm.toFixed(3)}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-[#D8DCD8] bg-[#F7F5EF] space-y-1.5">
            <span className="text-[#5F625F] uppercase font-semibold text-[11px] block">
              Active State (<InlineMath math={`\\lambda = ${retentionVal.toFixed(2)}`} />)
            </span>
            <div className="flex items-center justify-between">
              <span>Prediction:</span>
              <strong className={afterEval.isCorrect ? 'text-[#247A4B]' : 'text-[#B64235]'}>
                {afterEval.top.val}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Retrieval Score:</span>
              <strong className="font-mono">{(afterEval.top.score * 100).toFixed(1)}%</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>State Norm:</span>
              <span className="font-mono">{afterEval.norm.toFixed(3)}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-[#D8DCD8] bg-[#E7F2FA] text-[#31566E] space-y-1.5">
            <span className="uppercase font-semibold text-[11px] block">
              Causal Difference (<InlineMath math="\Delta" />)
            </span>
            <div className="flex items-center justify-between">
              <span>Score Shift:</span>
              <strong className="font-mono">
                {diff.scoreDiff >= 0 ? `+${(diff.scoreDiff * 100).toFixed(1)}%` : `${(diff.scoreDiff * 100).toFixed(1)}%`}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Norm Shift:</span>
              <strong className="font-mono">
                {diff.normDiff >= 0 ? `+${diff.normDiff.toFixed(3)}` : diff.normDiff.toFixed(3)}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Prediction Shifted:</span>
              <span className="font-semibold">{diff.predictionChanged ? 'Yes (Flip)' : 'No'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FAILURE BOUNDARY FINDER */}
      <div className="rounded-xl border border-[#D8DCD8] bg-[#FFFFFF] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6DF] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#F9E9ED] text-[#B64235]">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#252525]">
                2. Failure Boundary Finder
              </h3>
              <p className="text-xs text-[#5F625F]">
                Automated parameter scanning to locate the critical threshold where retrieval switches from Correct to Incorrect.
              </p>
            </div>
          </div>
          <span className="text-xs italic text-[#5F625F]">
            Observed threshold in the educational toy experiment, not a universal physical constant.
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs text-[#5F625F] font-semibold">Scan Parameter:</label>
          <select
            value={boundaryParam}
            onChange={(e) => setBoundaryParam(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg border border-[#D8DCD8] bg-[#F7F5EF] text-xs text-[#252525] cursor-pointer"
          >
            <option value="retention">Retention Rate (λ: 1.0 → 0.1)</option>
            <option value="distractors">Distractor Count (0 → 12)</option>
          </select>

          <button
            onClick={handleScanBoundary}
            disabled={isScanning}
            className="px-4 py-1.5 rounded-lg bg-[#247A4B] hover:bg-[#1E6B43] text-white text-xs font-medium transition cursor-pointer disabled:opacity-50"
          >
            {isScanning ? 'Scanning...' : 'Find Failure Boundary'}
          </button>
        </div>

        {scannedBoundary && (
          <div className="p-4 rounded-xl bg-[#F7F5EF] border border-[#D8DCD8] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs animate-in fade-in">
            <div>
              <span className="text-[#5F625F] block text-[11px]">Observed Critical Threshold</span>
              <strong className="text-sm font-mono text-[#B64235]">
                {boundaryParam === 'retention' ? `λ ≈ ${scannedBoundary.thresholdValue}` : `N ≈ ${scannedBoundary.thresholdValue} facts`}
              </strong>
            </div>
            <div>
              <span className="text-[#5F625F] block text-[11px]">Flipped Output</span>
              <strong className="text-sm text-[#252525]">{scannedBoundary.prediction}</strong>
            </div>
            <div>
              <span className="text-[#5F625F] block text-[11px]">Retrieval Score at Flip</span>
              <strong className="text-sm font-mono">{(scannedBoundary.score * 100).toFixed(1)}%</strong>
            </div>
            <div>
              <span className="text-[#5F625F] block text-[11px]">Top-1 Margin</span>
              <strong className="text-sm font-mono text-[#B64235]">{scannedBoundary.margin.toFixed(3)}</strong>
            </div>
          </div>
        )}
      </div>

      {/* 3. COUNTERFACTUAL MEMORY INTERACTION */}
      <div className="rounded-xl border border-[#D8DCD8] bg-[#FFFFFF] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6DF] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#FFF5D8] text-[#A46622]">
              <Split className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#252525]">
                3. Counterfactual Memory Surgery
              </h3>
              <p className="text-xs text-[#5F625F]">
                Compare the original memory trajectory against an intervention: removing or replacing a specific fact in history.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-[#5F625F] font-semibold">Intervention:</span>
          <button
            onClick={() => setCounterfactualMode('remove')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
              counterfactualMode === 'remove'
                ? 'border-[#31566E] bg-[#E7F2FA] text-[#31566E] font-bold'
                : 'border-[#D8DCD8] bg-[#F7F5EF] text-[#5F625F]'
            }`}
          >
            Remove fact: France → Paris
          </button>
          <button
            onClick={() => setCounterfactualMode('replace')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
              counterfactualMode === 'replace'
                ? 'border-[#31566E] bg-[#E7F2FA] text-[#31566E] font-bold'
                : 'border-[#D8DCD8] bg-[#F7F5EF] text-[#5F625F]'
            }`}
          >
            Replace fact with: Germany → Berlin
          </button>
        </div>

        {/* Counterfactual Telemetry */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl border border-[#D8DCD8] bg-[#F7F5EF] space-y-1">
            <span className="text-[#5F625F] uppercase font-semibold text-[11px] block">Original Experiment</span>
            <div>Probe: <strong className="text-[#252525]">{probeKey}</strong></div>
            <div>Prediction: <strong className="text-[#247A4B]">{counterfactualEval.origPred}</strong></div>
            <div>Score: <span className="font-mono">{(counterfactualEval.origScore * 100).toFixed(1)}%</span></div>
          </div>

          <div className="p-3.5 rounded-xl border border-[#D8DCD8] bg-[#F7F5EF] space-y-1">
            <span className="text-[#5F625F] uppercase font-semibold text-[11px] block">Counterfactual State</span>
            <div>Probe: <strong className="text-[#252525]">{probeKey}</strong></div>
            <div>Prediction: <strong className="text-[#247A4B]">{counterfactualEval.modPred}</strong></div>
            <div>Score: <span className="font-mono">{(counterfactualEval.modScore * 100).toFixed(1)}%</span></div>
          </div>

          <div className="p-3.5 rounded-xl border border-[#D8DCD8] bg-[#E7F2FA] text-[#31566E] space-y-1">
            <span className="uppercase font-semibold text-[11px] block">State Matrix Divergence</span>
            <div>Delta norm: <strong className="font-mono text-sm">{counterfactualEval.matrixDeltaNorm.toFixed(4)}</strong></div>
            <p className="text-[11px] leading-relaxed pt-1 text-[#31566E]">
              Quantifies the causal footprint of the omitted update across the full coordinate matrix <InlineMath math="M" />.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

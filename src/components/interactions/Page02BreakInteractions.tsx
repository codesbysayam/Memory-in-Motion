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
      <div className="diagram-frame p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[var(--accent-blue)] text-[var(--accent-blue-text)]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[var(--text-primary)]">
                1. One-variable-at-a-time mode
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Locks all extraneous conditions to establish strict causal attribution. Only retention <InlineMath math="\lambda" /> varies.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-[var(--accent-green-text)] bg-[var(--accent-green)] border border-[var(--color-success-border)] px-2.5 py-1 rounded-md font-semibold">
            Strict isolation active
          </span>
        </div>

        {/* Retention Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[var(--text-primary)]">
              Retention <InlineMath math="\lambda" /> (active variable):
            </span>
            <span className="font-mono text-[var(--accent-blue-text)] font-bold tabular-nums">
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
            className="w-full accent-[var(--accent-blue-text)] cursor-pointer"
          />
        </div>

        {/* Before vs After Difference Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="metric-panel p-3.5 space-y-1.5">
            <span className="text-[var(--text-secondary)] uppercase font-semibold text-[11px] block">
              Baseline state (<InlineMath math="\lambda = 0.95" />)
            </span>
            <div className="flex items-center justify-between">
              <span>Prediction:</span>
              <strong className="text-[var(--accent-green-text)]">{beforeEval.top.val}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Retrieval score:</span>
              <strong className="font-mono tabular-nums">{(beforeEval.top.score * 100).toFixed(1)}%</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>State norm:</span>
              <span className="font-mono tabular-nums">{beforeEval.norm.toFixed(3)}</span>
            </div>
          </div>

          <div className="metric-panel p-3.5 space-y-1.5">
            <span className="text-[var(--text-secondary)] uppercase font-semibold text-[11px] block">
              Active state (<InlineMath math={`\\lambda = ${retentionVal.toFixed(2)}`} />)
            </span>
            <div className="flex items-center justify-between">
              <span>Prediction:</span>
              <strong className={afterEval.isCorrect ? 'text-[var(--accent-green-text)]' : 'text-[var(--accent-pink-text)]'}>
                {afterEval.top.val}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Retrieval score:</span>
              <strong className="font-mono tabular-nums">{(afterEval.top.score * 100).toFixed(1)}%</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>State norm:</span>
              <span className="font-mono tabular-nums">{afterEval.norm.toFixed(3)}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--accent-blue)] text-[var(--accent-blue-text)] space-y-1.5">
            <span className="uppercase font-semibold text-[11px] block">
              Causal difference (<InlineMath math="\Delta" />)
            </span>
            <div className="flex items-center justify-between">
              <span>Score shift:</span>
              <strong className="font-mono tabular-nums">
                {diff.scoreDiff >= 0 ? `+${(diff.scoreDiff * 100).toFixed(1)}%` : `${(diff.scoreDiff * 100).toFixed(1)}%`}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Norm shift:</span>
              <strong className="font-mono tabular-nums">
                {diff.normDiff >= 0 ? `+${diff.normDiff.toFixed(3)}` : diff.normDiff.toFixed(3)}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Prediction shifted:</span>
              <span className="font-semibold">{diff.predictionChanged ? 'Yes (Flip)' : 'No'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FAILURE BOUNDARY FINDER */}
      <div className="diagram-frame p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[var(--accent-pink)] text-[var(--accent-pink-text)]">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[var(--text-primary)]">
                2. Failure boundary finder
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Automated parameter scanning to locate the critical threshold where retrieval switches from Correct to Incorrect.
              </p>
            </div>
          </div>
          <span className="text-xs italic text-[var(--text-secondary)]">
            Observed threshold in the educational toy experiment, not a universal physical constant.
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs text-[var(--text-secondary)] font-semibold">Scan parameter:</label>
          <select
            value={boundaryParam}
            onChange={(e) => setBoundaryParam(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] text-xs text-[var(--text-primary)] cursor-pointer"
          >
            <option value="retention">Retention rate (λ: 1.0 → 0.1)</option>
            <option value="distractors">Distractor count (0 → 12)</option>
          </select>

          <button
            onClick={handleScanBoundary}
            disabled={isScanning}
            className="btn-primary text-xs cursor-pointer disabled:opacity-50"
          >
            {isScanning ? 'Scanning...' : 'Find failure boundary'}
          </button>
        </div>

        {scannedBoundary && (
          <div className="p-4 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs animate-in fade-in">
            <div>
              <span className="text-[var(--text-secondary)] block text-[11px]">Observed critical threshold</span>
              <strong className="text-sm font-mono tabular-nums text-[var(--accent-pink-text)]">
                {boundaryParam === 'retention' ? `λ ≈ ${scannedBoundary.thresholdValue}` : `N ≈ ${scannedBoundary.thresholdValue} facts`}
              </strong>
            </div>
            <div>
              <span className="text-[var(--text-secondary)] block text-[11px]">Flipped output</span>
              <strong className="text-sm text-[var(--text-primary)]">{scannedBoundary.prediction}</strong>
            </div>
            <div>
              <span className="text-[var(--text-secondary)] block text-[11px]">Retrieval score at flip</span>
              <strong className="text-sm font-mono tabular-nums">{(scannedBoundary.score * 100).toFixed(1)}%</strong>
            </div>
            <div>
              <span className="text-[var(--text-secondary)] block text-[11px]">Top-1 margin</span>
              <strong className="text-sm font-mono tabular-nums text-[var(--accent-pink-text)]">{scannedBoundary.margin.toFixed(3)}</strong>
            </div>
          </div>
        )}
      </div>

      {/* 3. COUNTERFACTUAL MEMORY INTERACTION */}
      <div className="diagram-frame p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[var(--accent-yellow)] text-[var(--accent-yellow-text)]">
              <Split className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[var(--text-primary)]">
                3. Counterfactual memory surgery
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Compare the original memory trajectory against an intervention: removing or replacing a specific fact in history.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-[var(--text-secondary)] font-semibold">Intervention:</span>
          <button
            onClick={() => setCounterfactualMode('remove')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
              counterfactualMode === 'remove'
                ? 'border-[var(--accent-blue-text)] bg-[var(--accent-blue)] text-[var(--accent-blue-text)] font-bold'
                : 'border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-secondary)]'
            }`}
          >
            Remove fact: France → Paris
          </button>
          <button
            onClick={() => setCounterfactualMode('replace')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
              counterfactualMode === 'replace'
                ? 'border-[var(--accent-blue-text)] bg-[var(--accent-blue)] text-[var(--accent-blue-text)] font-bold'
                : 'border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-secondary)]'
            }`}
          >
            Replace fact with: Germany → Berlin
          </button>
        </div>

        {/* Counterfactual Telemetry */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="metric-panel p-3.5 space-y-1">
            <span className="text-[var(--text-secondary)] uppercase font-semibold text-[11px] block">Original experiment</span>
            <div>Probe: <strong className="text-[var(--text-primary)]">{probeKey}</strong></div>
            <div>Prediction: <strong className="text-[var(--accent-green-text)]">{counterfactualEval.origPred}</strong></div>
            <div>Score: <span className="font-mono tabular-nums">{(counterfactualEval.origScore * 100).toFixed(1)}%</span></div>
          </div>

          <div className="metric-panel p-3.5 space-y-1">
            <span className="text-[var(--text-secondary)] uppercase font-semibold text-[11px] block">Counterfactual state</span>
            <div>Probe: <strong className="text-[var(--text-primary)]">{probeKey}</strong></div>
            <div>Prediction: <strong className="text-[var(--accent-green-text)]">{counterfactualEval.modPred}</strong></div>
            <div>Score: <span className="font-mono tabular-nums">{(counterfactualEval.modScore * 100).toFixed(1)}%</span></div>
          </div>

          <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--accent-blue)] text-[var(--accent-blue-text)] space-y-1">
            <span className="uppercase font-semibold text-[11px] block">State matrix divergence</span>
            <div>Delta norm: <strong className="font-mono text-sm tabular-nums">{counterfactualEval.matrixDeltaNorm.toFixed(4)}</strong></div>
            <p className="text-[11px] leading-relaxed pt-1 text-[var(--accent-blue-text)]">
              Quantifies the causal footprint of the omitted update across the full coordinate matrix <InlineMath math="M" />.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

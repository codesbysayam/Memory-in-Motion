import React, { useState, useMemo } from 'react';
import {
  Filter,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { vector, cosine, CANONICAL_FACTS } from '../../models/associativeMemory';

export interface SweepTrialResult {
  id: string;
  dim: number;
  factsCount: number;
  retention: number;
  probe: string;
  prediction: string;
  groundTruth: string;
  retrievalScore: number;
  top1Margin: number;
  norm: number;
  isCorrect: boolean;
}

export const Page04MeasureInteractions: React.FC = () => {
  // 1. Sweep Builder State
  const [xAxisParam, setXAxisParam] = useState<'dim' | 'factsCount' | 'retention'>('factsCount');
  const [yAxisMetric, setYAxisMetric] = useState<'retrievalScore' | 'top1Margin' | 'norm'>('retrievalScore');
  const [fixedDim, setFixedDim] = useState<number>(16);
  const [fixedRetention, setFixedRetention] = useState<number>(0.95);

  const [isRunningSweep, setIsRunningSweep] = useState<boolean>(false);
  const [sweepProgress, setSweepProgress] = useState<number>(100);

  // Generate real deterministic sweep dataset
  const sweepResults: SweepTrialResult[] = useMemo(() => {
    const trials: SweepTrialResult[] = [];
    const seqLengths = [2, 4, 6, 8, 10, 12, 14, 16];
    const probe = 'Japan';
    const truth = 'Tokyo';

    seqLengths.forEach((n, idx) => {
      const activeFacts = CANONICAL_FACTS.slice(0, n);
      let M: number[][] = Array.from({ length: fixedDim }, () => Array(fixedDim).fill(0));

      activeFacts.forEach((f) => {
        const k = vector(f.key, fixedDim);
        const v = vector(f.value, fixedDim);
        M = Array.from({ length: fixedDim }, (_, r) =>
          Array.from(
            { length: fixedDim },
            (_, c) => (M[r][c] || 0) * fixedRetention + 0.8 * (k[r] || 0) * (v[c] || 0)
          )
        );
      });

      const q = vector(probe, fixedDim);
      const retrieved = Array(fixedDim).fill(0);
      let sumSq = 0;
      for (let j = 0; j < fixedDim; j++) {
        for (let i = 0; i < fixedDim; i++) {
          retrieved[j] += (q[i] || 0) * (M[i]?.[j] || 0);
          sumSq += M[i][j] * M[i][j];
        }
      }

      const scores = activeFacts
        .map((f) => ({ val: f.value, score: cosine(retrieved, vector(f.value, fixedDim)) }))
        .sort((a, b) => b.score - a.score);

      const top = scores[0] || { val: 'Unknown', score: 0 };
      const second = scores[1] || { val: 'Unknown', score: 0 };
      const isCorr = top.val.toLowerCase() === truth.toLowerCase();

      trials.push({
        id: `SWP-D${fixedDim}-N${n}-R${Math.round(fixedRetention * 100)}`,
        dim: fixedDim,
        factsCount: n,
        retention: fixedRetention,
        probe,
        prediction: top.val,
        groundTruth: truth,
        retrievalScore: Number(top.score.toFixed(4)),
        top1Margin: Number((top.score - second.score).toFixed(4)),
        norm: Number(Math.sqrt(sumSq).toFixed(4)),
        isCorrect: isCorr,
      });
    });

    return trials;
  }, [fixedDim, fixedRetention]);

  // 2. Result Filter State
  const [filterType, setFilterType] = useState<
    'all' | 'correct' | 'incorrect' | 'high_score' | 'low_score' | 'pos_margin' | 'neg_margin'
  >('all');

  const filteredResults = useMemo(() => {
    return sweepResults.filter((t) => {
      if (filterType === 'correct') return t.isCorrect;
      if (filterType === 'incorrect') return !t.isCorrect;
      if (filterType === 'high_score') return t.retrievalScore >= 0.8;
      if (filterType === 'low_score') return t.retrievalScore < 0.8;
      if (filterType === 'pos_margin') return t.top1Margin > 0;
      if (filterType === 'neg_margin') return t.top1Margin <= 0;
      return true;
    });
  }, [sweepResults, filterType]);

  // 3. Compare Runs State
  const [selectedRunA, setSelectedRunA] = useState<string>(sweepResults[1]?.id || '');
  const [selectedRunB, setSelectedRunB] = useState<string>(sweepResults[5]?.id || '');

  const runA = sweepResults.find((r) => r.id === selectedRunA) || sweepResults[0];
  const runB = sweepResults.find((r) => r.id === selectedRunB) || sweepResults[1] || sweepResults[0];

  const runComparison = useMemo(() => {
    if (!runA || !runB) return null;
    return {
      dimDiff: runB.dim - runA.dim,
      seqDiff: runB.factsCount - runA.factsCount,
      scoreDiff: runB.retrievalScore - runA.retrievalScore,
      marginDiff: runB.top1Margin - runA.top1Margin,
      normDiff: runB.norm - runA.norm,
      predictionChanged: runB.prediction !== runA.prediction,
    };
  }, [runA, runB]);

  // 4. Download Dataset (JSON / CSV)
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sweepResults, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `parameter-sweep-dataset-${fixedDim}d.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleExportCSV = () => {
    const headers = ['id', 'dim', 'factsCount', 'retention', 'probe', 'prediction', 'groundTruth', 'retrievalScore', 'top1Margin', 'norm', 'isCorrect'];
    const rows = sweepResults.map((r) =>
      [r.id, r.dim, r.factsCount, r.retention, r.probe, r.prediction, r.groundTruth, r.retrievalScore, r.top1Margin, r.norm, r.isCorrect].join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const a = document.createElement('a');
    a.href = encodeURI(csvContent);
    a.download = `parameter-sweep-dataset-${fixedDim}d.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleRunSweep = () => {
    setIsRunningSweep(true);
    setSweepProgress(10);
    const timer = setInterval(() => {
      setSweepProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsRunningSweep(false);
          return 100;
        }
        return prev + 30;
      });
    }, 150);
  };

  return (
    <div className="space-y-8 mt-8">
      {/* 1. PARAMETER SWEEP BUILDER */}
      <div className="essay-figure-stage p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[var(--mm-rule)] pb-4">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--mm-signal)] font-semibold block mb-1">
              04.1 · Parameter sweep builder
            </span>
            <h3 className="font-serif text-lg sm:text-xl font-normal text-[var(--mm-ink)]">
              Build and export a reproducible sweep dataset
            </h3>
            <p className="text-xs text-[var(--mm-muted)] mt-1">
              Fix hyperparameters and inspect how sequence length N affects probe accuracy, score margin, and matrix norm.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRunSweep}
            disabled={isRunningSweep}
            className="btn-primary text-xs tabular-nums"
          >
            {isRunningSweep ? `Running trials (${sweepProgress}%)` : 'Run sweep grid'}
          </button>
        </div>

        {/* Sweep Axis Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-[var(--text-secondary)] block font-semibold mb-1">X-Axis variable:</label>
            <select
              value={xAxisParam}
              onChange={(e) => setXAxisParam(e.target.value as any)}
              className="w-full p-2 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-primary)] cursor-pointer"
            >
              <option value="factsCount">Sequence Length (N facts)</option>
              <option value="dim">Dimension (D dimensions)</option>
              <option value="retention">Retention (λ rate)</option>
            </select>
          </div>

          <div>
            <label className="text-[var(--text-secondary)] block font-semibold mb-1">Y-Axis metric:</label>
            <select
              value={yAxisMetric}
              onChange={(e) => setYAxisMetric(e.target.value as any)}
              className="w-full p-2 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-primary)] cursor-pointer"
            >
              <option value="retrievalScore">Retrieval Score (Cosine similarity)</option>
              <option value="top1Margin">Top-1 Margin (Δs)</option>
              <option value="norm">Matrix Energy (||M||_F)</option>
            </select>
          </div>

          <div>
            <label className="text-[var(--text-secondary)] block font-semibold mb-1">Fixed dimension (D):</label>
            <select
              value={fixedDim}
              onChange={(e) => setFixedDim(parseInt(e.target.value, 10))}
              className="w-full p-2 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-primary)] cursor-pointer tabular-nums"
            >
              <option value="8">D = 8</option>
              <option value="16">D = 16</option>
              <option value="32">D = 32</option>
            </select>
          </div>

          <div>
            <label className="text-[var(--text-secondary)] block font-semibold mb-1">Fixed retention (λ):</label>
            <select
              value={fixedRetention}
              onChange={(e) => setFixedRetention(parseFloat(e.target.value))}
              className="w-full p-2 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-primary)] cursor-pointer tabular-nums"
            >
              <option value="0.95">λ = 0.95</option>
              <option value="0.80">λ = 0.80</option>
              <option value="0.60">λ = 0.60</option>
            </select>
          </div>
        </div>

        {/* 2. RESULT FILTER & TABLE */}
        <div className="pt-2 border-t border-[var(--border)] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-[var(--text-secondary)] flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Filter trials:
              </span>
              {(['all', 'correct', 'incorrect', 'high_score', 'low_score', 'pos_margin', 'neg_margin'] as const).map((ft) => (
                <button
                  key={ft}
                  type="button"
                  onClick={() => setFilterType(ft)}
                  className={`px-2.5 py-1 rounded-md border transition cursor-pointer text-[11px] ${
                    filterType === ft
                      ? 'bg-[var(--accent-blue)] border-[var(--color-accent)] text-[var(--accent-blue-text)] font-bold'
                      : 'bg-[var(--surface-soft)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {ft.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* 4. DOWNLOAD DATASET */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleExportCSV}
                className="btn-secondary text-xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                type="button"
                onClick={handleExportJSON}
                className="btn-secondary text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="research-table-wrap">
            <table className="research-table text-left text-xs tabular-nums">
              <thead>
                <tr>
                  <th>Experiment ID</th>
                  <th>Facts (N)</th>
                  <th>Dim (D)</th>
                  <th>Retention (λ)</th>
                  <th>Prediction</th>
                  <th>Retrieval Score</th>
                  <th>Top-1 Margin</th>
                  <th>Norm ||M||</th>
                  <th>Outcome</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((t) => (
                  <tr key={t.id} className="hover:bg-[var(--surface-soft)] transition">
                    <td className="font-mono font-bold text-[var(--text-primary)]">{t.id}</td>
                    <td className="font-mono">{t.factsCount}</td>
                    <td className="font-mono">{t.dim}</td>
                    <td className="font-mono">{t.retention.toFixed(2)}</td>
                    <td className="text-[var(--text-primary)]">{t.prediction}</td>
                    <td className="font-mono">{(t.retrievalScore * 100).toFixed(1)}%</td>
                    <td className="font-mono text-[var(--accent-blue-text)]">{t.top1Margin.toFixed(3)}</td>
                    <td className="font-mono">{t.norm.toFixed(3)}</td>
                    <td>
                      <span
                        className={`font-mono text-xs font-medium ${
                          t.isCorrect ? 'text-[var(--accent-green-text)]' : 'text-[var(--mm-coral)]'
                        }`}
                      >
                        {t.isCorrect ? '● Correct' : '▲ Interference'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. COMPARE RUNS */}
      <div className="essay-figure-stage p-5 sm:p-6 space-y-4">
        <div className="border-b border-[var(--mm-rule)] pb-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--mm-amber)] font-semibold block mb-1">
            04.2 · Differential comparison
          </span>
          <h3 className="font-serif text-lg sm:text-xl font-normal text-[var(--mm-ink)]">
            Compare any two deterministic runs
          </h3>
          <p className="text-xs text-[var(--mm-muted)] mt-1">
            Inspect score shifts, prediction divergence, and margin deltas across two fact counts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-[var(--mm-muted)] block font-semibold mb-1">Run A:</label>
            <select
              value={selectedRunA}
              onChange={(e) => setSelectedRunA(e.target.value)}
              className="w-full p-2 rounded-md border border-[var(--mm-rule)] bg-[var(--mm-paper-bright)] text-[var(--mm-ink)] cursor-pointer tabular-nums"
            >
              {sweepResults.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id} ({r.factsCount} facts — {r.prediction})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[var(--mm-muted)] block font-semibold mb-1">Run B:</label>
            <select
              value={selectedRunB}
              onChange={(e) => setSelectedRunB(e.target.value)}
              className="w-full p-2 rounded-md border border-[var(--mm-rule)] bg-[var(--mm-paper-bright)] text-[var(--mm-ink)] cursor-pointer tabular-nums"
            >
              {sweepResults.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id} ({r.factsCount} facts — {r.prediction})
                </option>
              ))}
            </select>
          </div>
        </div>

        {runComparison && (
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--mm-rule)] border border-[var(--mm-rule)] bg-[var(--mm-paper-bright)] rounded-md text-xs tabular-nums">
            <div className="p-3.5">
              <span className="text-[var(--mm-muted)] block text-[11px]">Sequence delta (ΔN)</span>
              <strong className="text-sm font-mono text-[var(--mm-ink)] mt-0.5 block">
                {runComparison.seqDiff >= 0 ? `+${runComparison.seqDiff}` : runComparison.seqDiff} facts
              </strong>
            </div>
            <div className="p-3.5">
              <span className="text-[var(--mm-muted)] block text-[11px]">Score delta</span>
              <strong className="text-sm font-mono text-[var(--mm-signal)] mt-0.5 block">
                {runComparison.scoreDiff >= 0
                  ? `+${(runComparison.scoreDiff * 100).toFixed(1)}%`
                  : `${(runComparison.scoreDiff * 100).toFixed(1)}%`}
              </strong>
            </div>
            <div className="p-3.5">
              <span className="text-[var(--mm-muted)] block text-[11px]">Margin shift</span>
              <strong className="text-sm font-mono text-[var(--mm-ink)] mt-0.5 block">
                {runComparison.marginDiff >= 0
                  ? `+${runComparison.marginDiff.toFixed(3)}`
                  : runComparison.marginDiff.toFixed(3)}
              </strong>
            </div>
            <div className="p-3.5">
              <span className="text-[var(--mm-muted)] block text-[11px]">Output divergence</span>
              <strong className={`text-sm mt-0.5 block ${runComparison.predictionChanged ? 'text-[var(--mm-coral)]' : 'text-[var(--accent-green-text)]'}`}>
                {runComparison.predictionChanged ? 'Diverged' : 'Identical'}
              </strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

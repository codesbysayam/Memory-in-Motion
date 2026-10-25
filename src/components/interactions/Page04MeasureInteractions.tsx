import React, { useState, useMemo } from 'react';
import {
  BarChart2,
  Sliders,
  Filter,
  ArrowRight,
  Download,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { Fact, vector, cosine, CANONICAL_FACTS } from '../../models/associativeMemory';
import { InlineMath, BlockMath } from '../ui/MathView';

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
    <div className="space-y-8 mt-6">
      {/* 1. PARAMETER SWEEP BUILDER */}
      <div className="rounded-xl border border-[#D8DCD8] bg-[#FFFFFF] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6DF] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#E7F2FA] text-[#31566E]">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#252525]">
                1. Empirical Parameter Sweep Builder
              </h3>
              <p className="text-xs text-[#5F625F]">
                Configure sweep axes, fix background hyperparameters, and execute deterministic trials to map empirical capacity bounds.
              </p>
            </div>
          </div>

          <button
            onClick={handleRunSweep}
            disabled={isRunningSweep}
            className="px-4 py-2 rounded-lg bg-[#247A4B] hover:bg-[#1E6B43] text-white text-xs font-medium transition cursor-pointer disabled:opacity-50"
          >
            {isRunningSweep ? `Running Trials (${sweepProgress}%)` : 'Run Sweep Grid'}
          </button>
        </div>

        {/* Sweep Axis Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-[#5F625F] block font-semibold mb-1">X-Axis Variable:</label>
            <select
              value={xAxisParam}
              onChange={(e) => setXAxisParam(e.target.value as any)}
              className="w-full p-2 rounded-lg border border-[#D8DCD8] bg-[#F7F5EF] text-[#252525] cursor-pointer"
            >
              <option value="factsCount">Sequence Length (N facts)</option>
              <option value="dim">Dimension (D dimensions)</option>
              <option value="retention">Retention (λ rate)</option>
            </select>
          </div>

          <div>
            <label className="text-[#5F625F] block font-semibold mb-1">Y-Axis Metric:</label>
            <select
              value={yAxisMetric}
              onChange={(e) => setYAxisMetric(e.target.value as any)}
              className="w-full p-2 rounded-lg border border-[#D8DCD8] bg-[#F7F5EF] text-[#252525] cursor-pointer"
            >
              <option value="retrievalScore">Retrieval Score (Cosine similarity)</option>
              <option value="top1Margin">Top-1 Margin (Δs)</option>
              <option value="norm">Matrix Energy (||M||_F)</option>
            </select>
          </div>

          <div>
            <label className="text-[#5F625F] block font-semibold mb-1">Fixed Dimension (D):</label>
            <select
              value={fixedDim}
              onChange={(e) => setFixedDim(parseInt(e.target.value, 10))}
              className="w-full p-2 rounded-lg border border-[#D8DCD8] bg-[#F7F5EF] text-[#252525] cursor-pointer"
            >
              <option value="8">D = 8</option>
              <option value="16">D = 16</option>
              <option value="32">D = 32</option>
            </select>
          </div>

          <div>
            <label className="text-[#5F625F] block font-semibold mb-1">Fixed Retention (λ):</label>
            <select
              value={fixedRetention}
              onChange={(e) => setFixedRetention(parseFloat(e.target.value))}
              className="w-full p-2 rounded-lg border border-[#D8DCD8] bg-[#F7F5EF] text-[#252525] cursor-pointer"
            >
              <option value="0.95">λ = 0.95</option>
              <option value="0.80">λ = 0.80</option>
              <option value="0.60">λ = 0.60</option>
            </select>
          </div>
        </div>

        {/* 2. RESULT FILTER & TABLE */}
        <div className="pt-2 border-t border-[#EAE6DF] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-[#5F625F] flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Filter Trials:
              </span>
              {(['all', 'correct', 'incorrect', 'high_score', 'low_score', 'pos_margin', 'neg_margin'] as const).map((ft) => (
                <button
                  key={ft}
                  onClick={() => setFilterType(ft)}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer text-[11px] ${
                    filterType === ft
                      ? 'bg-[#31566E] text-white font-bold'
                      : 'bg-[#F7F5EF] text-[#5F625F] hover:text-[#252525]'
                  }`}
                >
                  {ft.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* 4. DOWNLOAD DATASET */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F7F5EF] text-[#252525] border border-[#D8DCD8] text-xs font-medium transition cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={handleExportJSON}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F7F5EF] text-[#252525] border border-[#D8DCD8] text-xs font-medium transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-[#D8DCD8] rounded-xl overflow-hidden">
              <thead className="bg-[#F7F5EF] text-[#5F625F] border-b border-[#D8DCD8]">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Experiment ID</th>
                  <th className="py-2.5 px-3 font-semibold">Facts (N)</th>
                  <th className="py-2.5 px-3 font-semibold">Dim (D)</th>
                  <th className="py-2.5 px-3 font-semibold">Retention (λ)</th>
                  <th className="py-2.5 px-3 font-semibold">Prediction</th>
                  <th className="py-2.5 px-3 font-semibold">Retrieval Score</th>
                  <th className="py-2.5 px-3 font-semibold">Top-1 Margin</th>
                  <th className="py-2.5 px-3 font-semibold">Norm ||M||</th>
                  <th className="py-2.5 px-3 font-semibold">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE6DF]">
                {filteredResults.map((t) => (
                  <tr key={t.id} className="hover:bg-[#F7F5EF]/60 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#252525]">{t.id}</td>
                    <td className="py-2.5 px-3 font-mono">{t.factsCount}</td>
                    <td className="py-2.5 px-3 font-mono">{t.dim}</td>
                    <td className="py-2.5 px-3 font-mono">{t.retention.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-[#252525]">{t.prediction}</td>
                    <td className="py-2.5 px-3 font-mono">{(t.retrievalScore * 100).toFixed(1)}%</td>
                    <td className="py-2.5 px-3 font-mono text-[#31566E]">{t.top1Margin.toFixed(3)}</td>
                    <td className="py-2.5 px-3 font-mono">{t.norm.toFixed(3)}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                          t.isCorrect ? 'bg-[#DCEFE2] text-[#247A4B]' : 'bg-[#F9E9ED] text-[#B64235]'
                        }`}
                      >
                        {t.isCorrect ? <CheckCircle2 className="w-3 h-3" /> : <AlertOctagon className="w-3 h-3" />}
                        {t.isCorrect ? 'Correct' : 'Interference'}
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
      <div className="rounded-xl border border-[#D8DCD8] bg-[#FFFFFF] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#EAE6DF] pb-3">
          <div className="p-1.5 rounded-lg bg-[#FFF5D8] text-[#A46622]">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-[#252525]">
              3. Differential Run Comparison
            </h3>
            <p className="text-xs text-[#5F625F]">
              Select two experiment runs to inspect coordinate shifts, prediction divergence, and margin deltas.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-[#5F625F] block font-semibold mb-1">Run A:</label>
            <select
              value={selectedRunA}
              onChange={(e) => setSelectedRunA(e.target.value)}
              className="w-full p-2 rounded-lg border border-[#D8DCD8] bg-[#F7F5EF] text-[#252525] cursor-pointer"
            >
              {sweepResults.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id} ({r.factsCount} facts - {r.prediction})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[#5F625F] block font-semibold mb-1">Run B:</label>
            <select
              value={selectedRunB}
              onChange={(e) => setSelectedRunB(e.target.value)}
              className="w-full p-2 rounded-lg border border-[#D8DCD8] bg-[#F7F5EF] text-[#252525] cursor-pointer"
            >
              {sweepResults.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id} ({r.factsCount} facts - {r.prediction})
                </option>
              ))}
            </select>
          </div>
        </div>

        {runComparison && (
          <div className="p-4 rounded-xl bg-[#F7F5EF] border border-[#D8DCD8] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[#5F625F] block text-[11px]">Sequence Length Delta (ΔN)</span>
              <strong className="text-sm font-mono text-[#252525]">
                {runComparison.seqDiff >= 0 ? `+${runComparison.seqDiff}` : runComparison.seqDiff} facts
              </strong>
            </div>
            <div>
              <span className="text-[#5F625F] block text-[11px]">Retrieval Score Delta</span>
              <strong className="text-sm font-mono text-[#31566E]">
                {runComparison.scoreDiff >= 0
                  ? `+${(runComparison.scoreDiff * 100).toFixed(1)}%`
                  : `${(runComparison.scoreDiff * 100).toFixed(1)}%`}
              </strong>
            </div>
            <div>
              <span className="text-[#5F625F] block text-[11px]">Top-1 Margin Shift</span>
              <strong className="text-sm font-mono">
                {runComparison.marginDiff >= 0
                  ? `+${runComparison.marginDiff.toFixed(3)}`
                  : runComparison.marginDiff.toFixed(3)}
              </strong>
            </div>
            <div>
              <span className="text-[#5F625F] block text-[11px]">Prediction Divergence</span>
              <strong className={`text-sm ${runComparison.predictionChanged ? 'text-[#B64235]' : 'text-[#247A4B]'}`}>
                {runComparison.predictionChanged ? 'Output Diverged' : 'Identical Output'}
              </strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

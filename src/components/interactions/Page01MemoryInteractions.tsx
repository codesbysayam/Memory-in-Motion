import React, { useState, useMemo } from 'react';
import {
  Clock,
  Search,
  RotateCcw,
  Download,
  Trash2,
  Play,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  Sliders,
  Filter,
} from 'lucide-react';
import { Fact, vector, cosine } from '../../models/associativeMemory';
import { InlineMath, BlockMath } from '../ui/MathView';

interface ProbeRecord {
  id: string;
  query: string;
  prediction: string;
  groundTruth: string;
  retrievalScore: number;
  top1Margin: number;
  isCorrect: boolean;
  timestamp: string;
}

export const Page01MemoryInteractions: React.FC = () => {
  // Fact Priority Interaction
  const [facts, setFacts] = useState<
    Array<Fact & { priority: 'important' | 'normal' | 'distractor' }>
  >([
    { key: 'Japan', value: 'Tokyo', category: 'Asia', priority: 'important' },
    { key: 'France', value: 'Paris', category: 'Europe', priority: 'normal' },
    { key: 'Brazil', value: 'Brasília', category: 'South America', priority: 'normal' },
    { key: 'Canada', value: 'Ottawa', category: 'North America', priority: 'distractor' },
    { key: 'Egypt', value: 'Cairo', category: 'Africa', priority: 'distractor' },
  ]);

  const dim = 8;
  const retention = 0.95;

  // Compute associative matrix sequence with priority weights
  // Important facts get eta = 1.2, Normal = 0.8, Distractor = 0.4
  const timelineStates = useMemo(() => {
    let M: number[][] = Array.from({ length: dim }, () => Array(dim).fill(0));
    const states: Array<{
      step: number;
      fact: (typeof facts)[0];
      matrix: number[][];
      norm: number;
    }> = [];

    // Step 0 initial
    states.push({
      step: 0,
      fact: { key: 'Init', value: 'State', category: 'None', priority: 'normal' },
      matrix: M.map((row) => [...row]),
      norm: 0,
    });

    facts.forEach((fact, idx) => {
      const eta =
        fact.priority === 'important' ? 1.2 : fact.priority === 'distractor' ? 0.4 : 0.8;
      const k = vector(fact.key, dim);
      const v = vector(fact.value, dim);

      const nextM = Array.from({ length: dim }, (_, r) =>
        Array.from(
          { length: dim },
          (_, c) => (M[r][c] || 0) * retention + eta * (k[r] || 0) * (v[c] || 0)
        )
      );

      let sumSq = 0;
      for (let r = 0; r < dim; r++) {
        for (let c = 0; c < dim; c++) {
          sumSq += nextM[r][c] * nextM[r][c];
        }
      }

      M = nextM;
      states.push({
        step: idx + 1,
        fact,
        matrix: M.map((row) => [...row]),
        norm: Math.sqrt(sumSq),
      });
    });

    return states;
  }, [facts]);

  // Active timestep selected in timeline
  const [selectedTimestep, setSelectedTimestep] = useState<number>(timelineStates.length - 1);
  const activeTimelineState =
    timelineStates[Math.min(selectedTimestep, timelineStates.length - 1)] || timelineStates[0];

  // Probe History State
  const [probeQuery, setProbeQuery] = useState<string>('Japan');
  const [probeHistory, setProbeHistory] = useState<ProbeRecord[]>([
    {
      id: 'p-1',
      query: 'Japan',
      prediction: 'Tokyo',
      groundTruth: 'Tokyo',
      retrievalScore: 0.962,
      top1Margin: 0.584,
      isCorrect: true,
      timestamp: '12:01:14',
    },
  ]);

  // Execute a probe against active matrix
  const handleExecuteProbe = (queryKey?: string) => {
    const qKey = queryKey || probeQuery;
    const currentM = activeTimelineState.matrix;
    const q = vector(qKey, dim);

    // Readout: v_hat = q^T M
    const retrieved = Array(dim).fill(0);
    for (let j = 0; j < dim; j++) {
      for (let i = 0; i < dim; i++) {
        retrieved[j] += (q[i] || 0) * (currentM[i]?.[j] || 0);
      }
    }

    // Evaluate against candidate facts
    const candidates = facts.map((f) => ({
      val: f.value,
      score: cosine(retrieved, vector(f.value, dim)),
    }));
    candidates.sort((a, b) => b.score - a.score);

    const top = candidates[0] || { val: 'Unknown', score: 0 };
    const second = candidates[1] || { val: 'Unknown', score: 0 };
    const matchedFact = facts.find((f) => f.key.toLowerCase() === qKey.toLowerCase());
    const truth = matchedFact ? matchedFact.value : 'Unknown';
    const isCorr = top.val.toLowerCase() === truth.toLowerCase();

    const newRecord: ProbeRecord = {
      id: `p-${Date.now()}`,
      query: qKey,
      prediction: top.val,
      groundTruth: truth,
      retrievalScore: top.score,
      top1Margin: top.score - second.score,
      isCorrect: isCorr,
      timestamp: new Date().toLocaleTimeString(),
    };

    setProbeHistory((prev) => [newRecord, ...prev].slice(0, 15));
  };

  const handlePriorityChange = (
    index: number,
    priority: 'important' | 'normal' | 'distractor'
  ) => {
    setFacts((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], priority };
      return next;
    });
  };

  const handleExportProbeHistory = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(probeHistory, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `probe-history-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="space-y-8 mt-6 tabular-nums">
      {/* 1. MEMORY TIMELINE INTERACTION */}
      <div className="diagram-frame p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[var(--accent-blue)] text-[var(--accent-blue-text)]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[var(--text-primary)]">
                1. Sequential memory timeline
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Click any timestep <InlineMath math="t_i" /> to inspect the exact matrix coordinates and Frobenius norm at that point in time.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-[var(--text-secondary)]">
            Selected: <strong className="text-[var(--accent-blue-text)]">t = {activeTimelineState.step}</strong>
          </span>
        </div>

        {/* Timestep scrubber buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1">
          {timelineStates.map((st) => (
            <button
              type="button"
              key={st.step}
              onClick={() => setSelectedTimestep(st.step)}
              className={`px-3 py-2 rounded-lg border text-xs font-mono transition cursor-pointer shrink-0 flex flex-col items-center gap-0.5 ${
                selectedTimestep === st.step
                  ? 'border-[var(--color-accent)] bg-[var(--accent-blue)] text-[var(--accent-blue-text)] font-bold shadow-xs'
                  : 'border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--color-border-strong)]'
              }`}
            >
              <span>t_{st.step}</span>
              <span className="text-[10px] font-sans font-normal truncate max-w-[80px]">
                {st.step === 0 ? 'M_0' : st.fact.key}
              </span>
            </button>
          ))}
        </div>

        {/* State Display at Timestep */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="metric-panel space-y-2 text-xs">
            <span className="font-semibold text-[var(--text-muted)] block text-xs">
              Step details
            </span>
            <div>
              <span className="text-[var(--text-muted)]">Ingested: </span>
              <strong className="text-[var(--text-primary)]">
                {activeTimelineState.step === 0
                  ? 'Zero state M_0'
                  : `${activeTimelineState.fact.key} → ${activeTimelineState.fact.value}`}
              </strong>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">State norm ||M||_F: </span>
              <strong className="font-mono text-[var(--accent-blue-text)]">
                {activeTimelineState.norm.toFixed(4)}
              </strong>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">Matrix dimensions: </span>
              <span className="font-mono text-[var(--text-primary)]">
                <InlineMath math={`M \\in \\mathbb{R}^{${dim} \\times ${dim}}`} />
              </span>
            </div>
          </div>

          <div className="md:col-span-2 bg-[var(--color-matrix-bg)] p-4 rounded-xl border border-[var(--color-matrix-border)] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[var(--color-matrix-ink)] text-xs">
                Matrix coordinates at t = {activeTimelineState.step}
              </span>
              <span className="text-[11px] text-[var(--color-matrix-muted)]">
                Displaying 8×8 coordinate heat values
              </span>
            </div>

            {/* Matrix scroll container */}
            <div className="matrix-scroll overflow-x-auto py-1">
              <div
                className="grid gap-1 min-w-[260px]"
                style={{ gridTemplateColumns: `repeat(${dim}, minmax(0, 1fr))` }}
              >
                {activeTimelineState.matrix.map((row, r) =>
                  row.map((val, c) => {
                    const abs = Math.min(1, Math.abs(val));
                    const isPos = val >= 0;
                    return (
                      <div
                        key={`${r}-${c}`}
                        title={`M[${r},${c}] = ${val.toFixed(4)}`}
                        className="h-6 rounded text-[10px] font-mono flex items-center justify-center transition-colors select-none text-[var(--color-matrix-ink)]"
                        style={{
                          backgroundColor: isPos
                            ? `rgba(76, 154, 255, ${abs * 0.78 + 0.14})`
                            : `rgba(229, 98, 90, ${abs * 0.78 + 0.14})`,
                        }}
                      >
                        {val.toFixed(1)}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FACT PRIORITY INTERACTION */}
      <div className="diagram-frame p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[var(--accent-yellow)] text-[var(--accent-yellow-text)]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[var(--text-primary)]">
                2. Fact priority stream weights
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Adjust fact priority to alter the associative write weight <InlineMath math="\eta" />. Visibly observe how prioritizing or deprioritizing facts shifts retrieval.
              </p>
            </div>
          </div>
          <span className="text-xs text-[var(--text-muted)] italic">
            Note: &ldquo;Important&rdquo; is an experimental weight parameter, not semantic comprehension.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {facts.map((fact, idx) => (
            <div
              key={fact.key}
              className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-[var(--text-muted)]">#{idx + 1}</span>
                <span
                  className={`text-[11px] font-semibold px-1.5 py-0.5 rounded capitalize ${
                    fact.priority === 'important'
                      ? 'bg-[var(--accent-green)] text-[var(--accent-green-text)]'
                      : fact.priority === 'distractor'
                      ? 'bg-[var(--accent-pink)] text-[var(--accent-pink-text)]'
                      : 'bg-[var(--accent-blue)] text-[var(--accent-blue-text)]'
                  }`}
                >
                  {fact.priority}
                </span>
              </div>

              <div>
                <strong className="text-sm font-serif block text-[var(--text-primary)]">{fact.key}</strong>
                <span className="text-xs text-[var(--text-secondary)]">{fact.value}</span>
              </div>

              <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={() => handlePriorityChange(idx, 'important')}
                  className={`px-2 py-1 rounded text-[11px] cursor-pointer transition ${
                    fact.priority === 'important'
                      ? 'bg-[var(--color-success)] text-[var(--surface)] font-bold'
                      : 'hover:bg-[var(--border)] text-[var(--text-secondary)]'
                  }`}
                >
                  High
                </button>
                <button
                  type="button"
                  onClick={() => handlePriorityChange(idx, 'normal')}
                  className={`px-2 py-1 rounded text-[11px] cursor-pointer transition ${
                    fact.priority === 'normal'
                      ? 'bg-[var(--color-accent)] text-[var(--surface)] font-bold'
                      : 'hover:bg-[var(--border)] text-[var(--text-secondary)]'
                  }`}
                >
                  Norm
                </button>
                <button
                  type="button"
                  onClick={() => handlePriorityChange(idx, 'distractor')}
                  className={`px-2 py-1 rounded text-[11px] cursor-pointer transition ${
                    fact.priority === 'distractor'
                      ? 'bg-[var(--color-danger)] text-[var(--surface)] font-bold'
                      : 'hover:bg-[var(--border)] text-[var(--text-secondary)]'
                  }`}
                >
                  Low
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. PROBE HISTORY INTERACTION */}
      <div className="diagram-frame p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[var(--accent-green)] text-[var(--accent-green-text)]">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[var(--text-primary)]">
                3. Probe history &amp; replay
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Every query is evaluated against the current associative state and recorded with retrieval metrics.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportProbeHistory}
              className="btn-secondary text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
            <button
              type="button"
              onClick={() => setProbeHistory([])}
              className="btn-failure text-xs px-3 py-1.5 rounded-md border"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Quick Query Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[var(--text-muted)] font-semibold">Test probe:</span>
          {facts.map((f) => (
            <button
              type="button"
              key={f.key}
              onClick={() => {
                setProbeQuery(f.key);
                handleExecuteProbe(f.key);
              }}
              className="btn-secondary text-xs py-1 px-3"
            >
              {f.key}
            </button>
          ))}
        </div>

        {/* History Table / Cards */}
        <div className="research-table-wrap">
          <table className="research-table text-xs">
            <thead>
              <tr>
                <th>Query</th>
                <th>Prediction</th>
                <th>Ground truth</th>
                <th>Retrieval score</th>
                <th>Top-1 margin</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {probeHistory.map((rec) => (
                <tr key={rec.id}>
                  <td className="font-bold">{rec.query}</td>
                  <td>{rec.prediction}</td>
                  <td className="text-[var(--text-secondary)]">{rec.groundTruth}</td>
                  <td className="font-mono">{(rec.retrievalScore * 100).toFixed(1)}%</td>
                  <td className="font-mono text-[var(--accent-blue-text)]">
                    {rec.top1Margin > 0 ? `+${rec.top1Margin.toFixed(3)}` : rec.top1Margin.toFixed(3)}
                  </td>
                  <td>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                        rec.isCorrect
                          ? 'bg-[var(--accent-green)] text-[var(--accent-green-text)]'
                          : 'bg-[var(--accent-pink)] text-[var(--accent-pink-text)]'
                      }`}
                    >
                      {rec.isCorrect ? <CheckCircle2 className="w-3 h-3" /> : <AlertOctagon className="w-3 h-3" />}
                      {rec.isCorrect ? 'Correct' : 'Interference'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleExecuteProbe(rec.query)}
                      title="Replay probe"
                      className="btn-secondary py-1 px-2 text-[11px]"
                    >
                      Replay
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

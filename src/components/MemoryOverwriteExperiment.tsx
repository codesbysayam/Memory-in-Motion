import React, { useState, useMemo } from 'react';
import {
  Layers,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { createAssociativeMemory, vector, cosine, Fact } from '../models/associativeMemory';
import { MathView } from './ui/MathView';

export const MemoryOverwriteExperiment: React.FC = () => {
  const [retention, setRetention] = useState<number>(0.95);
  const [writeStrength, setWriteStrength] = useState<number>(0.8);
  const [dimension] = useState<number>(16);

  // Default sequence: Japan -> Tokyo, then Japan -> Osaka
  const fact1: Fact = { key: 'Japan', value: 'Tokyo', category: 'Asia' };
  const fact2: Fact = { key: 'Japan', value: 'Osaka', category: 'Asia' };

  // Compute live deterministic simulation
  const {
    scoreTokyo,
    scoreOsaka,
    winningValue,
    margin,
  } = useMemo(() => {
    // Fresh memory instance
    const memory = createAssociativeMemory([fact1, fact2], dimension, retention, writeStrength);

    // Step 1: Write Japan -> Tokyo
    memory.writeFact(fact1);

    // Step 2: Write Japan -> Osaka
    memory.writeFact(fact2);

    // Step 3: Query Japan
    const queryResult = memory.query('Japan');
    const retrieved = queryResult.vector;

    // Direct similarity to both candidate representations
    const vTokyo = vector('Tokyo', dimension);
    const vOsaka = vector('Osaka', dimension);

    const sTokyo = cosine(retrieved, vTokyo);
    const sOsaka = cosine(retrieved, vOsaka);

    const winner = sTokyo > sOsaka ? 'Tokyo (First write)' : sOsaka > sTokyo ? 'Osaka (Second write)' : 'Tie / Indeterminate';
    const absMargin = Math.abs(sTokyo - sOsaka);

    return {
      scoreTokyo: sTokyo,
      scoreOsaka: sOsaka,
      winningValue: winner,
      margin: absMargin,
    };
  }, [dimension, retention, writeStrength]);

  return (
    <div className="diagram-frame p-5 sm:p-6 text-[var(--text-primary)] space-y-5 font-mono tabular-nums">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--accent-yellow-text)]" />
            <h4 className="text-sm font-bold text-[var(--text-primary)]">
              Memory overwrite experiment · writing conflicting facts
            </h4>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-sans">
            What happens when the exact same key is bound to two different values consecutively?
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-0.5 rounded-md bg-[var(--accent-blue)] border border-[var(--border)] text-[var(--accent-blue-text)] font-semibold">
            Live computation
          </span>
          <span className="text-xs px-2 py-0.5 rounded-md bg-[var(--surface-soft)] border border-[var(--border)] text-[var(--text-muted)]">
            d={dimension}
          </span>
        </div>
      </div>

      {/* Sequence Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        {/* Step 1: Write 1 */}
        <div className="p-3.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-2">
          <div className="flex justify-between items-center text-[11px] text-[var(--text-muted)] font-semibold">
            <span>Step 1: First write</span>
            <span className="text-[var(--accent-blue-text)]">t=1</span>
          </div>
          <div className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
            <span>Japan</span>
            <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span className="text-[var(--accent-blue-text)]">Tokyo</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-sans">
            Initial binding etched into the matrix: <MathView math="M_1 = \eta k v_{\text{tokyo}}^T" />.
          </p>
        </div>

        {/* Step 2: Write 2 */}
        <div className="p-3.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-2">
          <div className="flex justify-between items-center text-[11px] text-[var(--text-muted)] font-semibold">
            <span>Step 2: Second write</span>
            <span className="text-[var(--accent-yellow-text)]">t=2</span>
          </div>
          <div className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
            <span>Japan</span>
            <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span className="text-[var(--accent-yellow-text)]">Osaka</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-sans">
            Overwriting update: <MathView math="M_2 = \lambda M_1 + \eta k v_{\text{osaka}}^T" />
          </p>
        </div>

        {/* Step 3: Query */}
        <div className="p-3.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-2">
          <div className="flex justify-between items-center text-[11px] text-[var(--text-muted)] font-semibold">
            <span>Step 3: Probe query</span>
            <span className="text-[var(--accent-blue-text)]">t=3</span>
          </div>
          <div className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
            <span>Query:</span>
            <span className="text-[var(--accent-blue-text)] font-bold">&ldquo;Japan&rdquo;</span>
          </div>
          <div className="text-xs text-[var(--text-secondary)]">
            Winner: <strong className="text-[var(--accent-green-text)]">{winningValue}</strong>
          </div>
        </div>
      </div>

      {/* Live Measured Similarities & Margin */}
      <div className="rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] p-4 space-y-3 text-xs">
        <div className="flex flex-wrap justify-between items-center gap-2 border-b border-[var(--border)] pb-2">
          <span className="font-semibold text-[var(--text-primary)] text-xs">
            Competition telemetry: Tokyo vs Osaka
          </span>
          <span className="text-xs text-[var(--text-muted)] font-sans">
            Determined dynamically by current update equation
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tokyo Score */}
          <div className="space-y-1.5 p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text-muted)] font-semibold">Similarity to &ldquo;Tokyo&rdquo; (First write):</span>
              <strong className="text-[var(--accent-blue-text)]">{scoreTokyo.toFixed(3)}</strong>
            </div>
            <div className="w-full bg-[var(--border)] rounded-sm h-2 overflow-hidden">
              <div
                className="bg-[var(--color-accent)] h-2 rounded-sm transition-all"
                style={{ width: `${Math.max(4, Math.min(100, ((scoreTokyo + 1) / 2) * 100))}%` }}
              />
            </div>
            <span className="text-xs text-[var(--text-muted)] block font-sans">
              Retained weight after decay: factor of <MathView math={`\\lambda = ${retention}`} />.
            </span>
          </div>

          {/* Osaka Score */}
          <div className="space-y-1.5 p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text-muted)] font-semibold">Similarity to &ldquo;Osaka&rdquo; (Second write):</span>
              <strong className="text-[var(--accent-yellow-text)]">{scoreOsaka.toFixed(3)}</strong>
            </div>
            <div className="w-full bg-[var(--border)] rounded-sm h-2 overflow-hidden">
              <div
                className="bg-[var(--color-warning)] h-2 rounded-sm transition-all"
                style={{ width: `${Math.max(4, Math.min(100, ((scoreOsaka + 1) / 2) * 100))}%` }}
              />
            </div>
            <span className="text-xs text-[var(--text-muted)] block font-sans">
              Directly added without decay in the final step.
            </span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-2 text-xs">
          <span>
            Top-1 margin between candidates: <strong className="text-[var(--text-primary)]">{margin.toFixed(3)}</strong>
          </span>
          <span className="text-[var(--text-secondary)] font-sans text-xs">
            {scoreOsaka > scoreTokyo
              ? 'Second write currently dominates due to recency and retention decay.'
              : scoreTokyo > scoreOsaka
              ? 'First write still matches strongly or representations interfered constructively.'
              : 'Both representations tie in similarity.'}
          </span>
        </div>
      </div>

      {/* Live Parameter Sliders to test Recency & Forgetting */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
        <div className="space-y-1.5 p-3.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)]">
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)] font-semibold">Retention (λ):</span>
            <span className="text-[var(--accent-blue-text)] font-bold">{(retention * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={retention}
            onChange={(e) => setRetention(parseFloat(e.target.value))}
            className="w-full accent-[var(--color-accent)] cursor-pointer"
          />
          <span className="text-xs text-[var(--text-muted)] font-sans block">
            Lower retention accelerates decay of the first write (Tokyo).
          </span>
        </div>

        <div className="space-y-1.5 p-3.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)]">
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)] font-semibold">Write strength (η):</span>
            <span className="text-[var(--accent-yellow-text)] font-bold">{writeStrength.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.5"
            step="0.05"
            value={writeStrength}
            onChange={(e) => setWriteStrength(parseFloat(e.target.value))}
            className="w-full accent-[var(--color-warning)] cursor-pointer"
          />
          <span className="text-xs text-[var(--text-muted)] font-sans block">
            Controls the magnitude of each added outer product update.
          </span>
        </div>
      </div>

      {/* Explanation Box */}
      <div className="research-callout text-xs text-[var(--text-secondary)] font-sans flex items-start gap-2">
        <HelpCircle className="w-4 h-4 text-[var(--accent-blue-text)] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[var(--text-primary)]">Scientific principle:</strong> Repeated writes can change the internal representation. The outcome depends on the update rule and retention. The toy does not have an explicit &ldquo;delete&rdquo; key—it can only decay or superimpose new patterns.
        </div>
      </div>
    </div>
  );
};

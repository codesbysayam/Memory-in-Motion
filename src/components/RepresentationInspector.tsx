import React, { useState, useMemo } from 'react';
import { Binary, Info } from 'lucide-react';
import { vector, norm } from '../models/associativeMemory';

interface RepresentationInspectorProps {
  currentKey?: string;
  currentValue?: string;
  queryKey?: string;
  dimension?: number;
}

export const RepresentationInspector: React.FC<RepresentationInspectorProps> = ({
  currentKey = 'Japan',
  currentValue = 'Tokyo',
  queryKey = 'Japan',
  dimension = 16,
}) => {
  const [activeTab, setActiveTab] = useState<'key' | 'value' | 'query'>('key');

  const activeText = useMemo(() => {
    switch (activeTab) {
      case 'key':
        return currentKey;
      case 'value':
        return currentValue;
      case 'query':
        return queryKey;
    }
  }, [activeTab, currentKey, currentValue, queryKey]);

  // Generate the actual deterministic numerical vector
  const vec = useMemo(() => {
    return vector(activeText, dimension);
  }, [activeText, dimension]);

  // Compute exact descriptive vector statistics
  const stats = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    let sum = 0;

    for (const x of vec) {
      if (x < min) min = x;
      if (x > max) max = x;
      sum += x;
    }

    const mean = vec.length > 0 ? sum / vec.length : 0;
    const l2 = norm(vec);

    return { min, max, mean, l2 };
  }, [vec]);

  return (
    <div className="diagram-frame p-5 text-[var(--text-primary)] space-y-4 font-mono tabular-nums">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-2">
          <Binary className="w-4 h-4 text-[var(--accent-blue-text)]" />
          <h4 className="text-xs font-bold text-[var(--text-primary)]">
            Representation inspector · what the model actually sees
          </h4>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-md bg-[var(--accent-blue)] border border-[var(--border)] text-[var(--accent-blue-text)] font-semibold">
          Latent representation
        </span>
      </div>

      {/* Human-Readable vs Encoded Latent Representation Split */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Human Input */}
        <div className="p-3.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-2">
          <span className="text-xs text-[var(--text-muted)] font-semibold block">
            Human-readable input
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[var(--text-muted)]">Key:</span>
            <strong className="text-[var(--text-primary)] bg-[var(--surface)] px-2 py-0.5 rounded border border-[var(--border)]">
              {currentKey}
            </strong>
            <span className="text-[var(--text-muted)]">→</span>
            <span className="text-[var(--text-muted)]">Value:</span>
            <strong className="text-[var(--accent-blue-text)] bg-[var(--surface)] px-2 py-0.5 rounded border border-[var(--border)]">
              {currentValue}
            </strong>
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-sans mt-1">
            The toy does not store the word &ldquo;{currentKey}&rdquo; literally. It converts each item into a deterministic numerical representation.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="p-3.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-2">
          <span className="text-xs text-[var(--text-muted)] font-semibold block">
            Select vector to inspect
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('key')}
              className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition border cursor-pointer truncate ${
                activeTab === 'key'
                  ? 'bg-[var(--accent-blue)] text-[var(--accent-blue-text)] border-[var(--color-accent)]'
                  : 'bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--text-primary)]'
              }`}
            >
              Key: {currentKey}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('value')}
              className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition border cursor-pointer truncate ${
                activeTab === 'value'
                  ? 'bg-[var(--accent-blue)] text-[var(--accent-blue-text)] border-[var(--color-accent)]'
                  : 'bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--text-primary)]'
              }`}
            >
              Value: {currentValue}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('query')}
              className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition border cursor-pointer truncate ${
                activeTab === 'query'
                  ? 'bg-[var(--accent-blue)] text-[var(--accent-blue-text)] border-[var(--color-accent)]'
                  : 'bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--text-primary)]'
              }`}
            >
              Query: {queryKey}
            </button>
          </div>
        </div>
      </div>

      {/* Latent Vector Coordinates Strip */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
          <span>
            Encoded vector for <strong className="text-[var(--accent-blue-text)]">&ldquo;{activeText}&rdquo;</strong> (d={dimension}):
          </span>
          <span className="text-xs text-[var(--text-muted)]">Range: [-1.0, +1.0]</span>
        </div>

        {/* Coordinate Cells */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 p-2.5 bg-[var(--surface-soft)] rounded-xl border border-[var(--border)] overflow-x-auto">
          {vec.map((v, i) => (
            <div
              key={i}
              className="flex flex-col items-center p-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-center"
              title={`Dimension [${i}]: ${v.toFixed(4)}`}
            >
              <span className="text-[11px] text-[var(--text-muted)]">d{i}</span>
              <span
                className={`text-xs font-bold ${
                  v >= 0 ? 'text-[var(--accent-blue-text)]' : 'text-[var(--accent-pink-text)]'
                }`}
              >
                {v.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Numerical Telemetry Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-xs">
        <div className="metric-panel">
          <span className="text-xs text-[var(--text-muted)] block font-semibold">Dimension</span>
          <strong className="text-[var(--text-primary)] text-xs">{dimension}</strong>
        </div>
        <div className="metric-panel">
          <span className="text-xs text-[var(--text-muted)] block font-semibold">Min value</span>
          <strong className="text-[var(--accent-pink-text)] text-xs">{stats.min.toFixed(3)}</strong>
        </div>
        <div className="metric-panel">
          <span className="text-xs text-[var(--text-muted)] block font-semibold">Max value</span>
          <strong className="text-[var(--accent-blue-text)] text-xs">{stats.max.toFixed(3)}</strong>
        </div>
        <div className="metric-panel">
          <span className="text-xs text-[var(--text-muted)] block font-semibold">Mean</span>
          <strong className="text-[var(--text-secondary)] text-xs">{stats.mean.toFixed(3)}</strong>
        </div>
        <div className="metric-panel">
          <span className="text-xs text-[var(--text-muted)] block font-semibold">L2 norm</span>
          <strong className="text-[var(--accent-green-text)] text-xs">{stats.l2.toFixed(3)}</strong>
        </div>
      </div>

      {/* Epistemic disclaimer note */}
      <div className="research-callout text-xs text-[var(--text-secondary)] font-sans flex items-start gap-2">
        <Info className="w-4 h-4 text-[var(--accent-blue-text)] shrink-0 mt-0.5" />
        <span>
          <strong className="text-[var(--text-primary)]">Scientific principle:</strong> The educational model does not manipulate the text directly. It converts each item into a deterministic numerical representation. These coordinates are abstract latent dimensions; they do not have predefined human or linguistic meanings.
        </span>
      </div>
    </div>
  );
};

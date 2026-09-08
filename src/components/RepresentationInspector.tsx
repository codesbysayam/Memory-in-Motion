import React, { useState, useMemo } from 'react';
import { Binary, Eye, Info, Check } from 'lucide-react';
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
    <div className="rounded-2xl border border-[#252A35] bg-[#0A0E18] p-5 text-slate-100 space-y-4 font-mono">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E2536] pb-3">
        <div className="flex items-center gap-2">
          <Binary className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Representation Inspector · What the Model Actually Sees
          </h4>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800 text-cyan-300 font-bold">
          LATENT REPRESENTATION
        </span>
      </div>

      {/* Human-Readable vs Encoded Latent Representation Split */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Human Input */}
        <div className="p-3 rounded-xl bg-[#101522] border border-[#1F283C] space-y-2">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">
            HUMAN-READABLE INPUT
          </span>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Key:</span>
            <strong className="text-white bg-[#161E30] px-2 py-0.5 rounded border border-[#222E46]">
              {currentKey}
            </strong>
            <span className="text-slate-400">→</span>
            <span className="text-slate-400">Value:</span>
            <strong className="text-cyan-300 bg-[#161E30] px-2 py-0.5 rounded border border-[#222E46]">
              {currentValue}
            </strong>
          </div>
          <p className="text-[10px] text-slate-400 font-sans mt-1">
            The toy does not store the word &ldquo;{currentKey}&rdquo; literally. It converts each item into a deterministic numerical representation.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="p-3 rounded-xl bg-[#101522] border border-[#1F283C] space-y-2">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">
            SELECT VECTOR TO INSPECT
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => setActiveTab('key')}
              className={`py-1 px-2 rounded text-[11px] font-bold transition border ${
                activeTab === 'key'
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-700 shadow-sm'
                  : 'bg-[#151C2C] text-slate-400 border-[#243048] hover:text-white'
              }`}
            >
              KEY: {currentKey}
            </button>
            <button
              onClick={() => setActiveTab('value')}
              className={`py-1 px-2 rounded text-[11px] font-bold transition border ${
                activeTab === 'value'
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-700 shadow-sm'
                  : 'bg-[#151C2C] text-slate-400 border-[#243048] hover:text-white'
              }`}
            >
              VALUE: {currentValue}
            </button>
            <button
              onClick={() => setActiveTab('query')}
              className={`py-1 px-2 rounded text-[11px] font-bold transition border ${
                activeTab === 'query'
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-700 shadow-sm'
                  : 'bg-[#151C2C] text-slate-400 border-[#243048] hover:text-white'
              }`}
            >
              QUERY: {queryKey}
            </button>
          </div>
        </div>
      </div>

      {/* Latent Vector Coordinates Strip */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-300">
          <span>
            Encoded Vector for <strong className="text-cyan-300">&ldquo;{activeText}&rdquo;</strong> (Dimension D={dimension}):
          </span>
          <span className="text-[10px] text-slate-500">Range: [-1.0, +1.0]</span>
        </div>

        {/* Coordinate Cells */}
        <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-16 gap-1 p-2 bg-[#06080F] rounded-lg border border-[#1C2538] overflow-x-auto">
          {vec.map((v, i) => (
            <div
              key={i}
              className="flex flex-col items-center p-1 rounded bg-[#0E131F] border border-[#192234] text-center"
              title={`Dimension [${i}]: ${v.toFixed(4)}`}
            >
              <span className="text-[8px] text-slate-500">d{i}</span>
              <span
                className={`text-[10px] font-bold ${
                  v >= 0 ? 'text-cyan-300' : 'text-rose-400'
                }`}
              >
                {v.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Numerical Telemetry Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-[11px]">
        <div className="p-2 rounded-lg bg-[#0E131F] border border-[#1C2436]">
          <span className="text-[9px] text-slate-500 block uppercase">DIMENSION</span>
          <strong className="text-white text-xs">{dimension}</strong>
        </div>
        <div className="p-2 rounded-lg bg-[#0E131F] border border-[#1C2436]">
          <span className="text-[9px] text-slate-500 block uppercase">MIN VALUE</span>
          <strong className="text-rose-400 text-xs">{stats.min.toFixed(3)}</strong>
        </div>
        <div className="p-2 rounded-lg bg-[#0E131F] border border-[#1C2436]">
          <span className="text-[9px] text-slate-500 block uppercase">MAX VALUE</span>
          <strong className="text-cyan-400 text-xs">{stats.max.toFixed(3)}</strong>
        </div>
        <div className="p-2 rounded-lg bg-[#0E131F] border border-[#1C2436]">
          <span className="text-[9px] text-slate-500 block uppercase">MEAN</span>
          <strong className="text-slate-300 text-xs">{stats.mean.toFixed(3)}</strong>
        </div>
        <div className="p-2 rounded-lg bg-[#0E131F] border border-[#1C2436]">
          <span className="text-[9px] text-slate-500 block uppercase">L2 NORM</span>
          <strong className="text-emerald-400 text-xs">{stats.l2.toFixed(3)}</strong>
        </div>
      </div>

      {/* Epistemic disclaimer note */}
      <div className="p-2.5 rounded-lg bg-[#080B14] border border-[#172032] text-[10px] text-slate-400 font-sans flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
        <span>
          <strong>Scientific Principle:</strong> The educational model does not manipulate the text directly. It converts each item into a deterministic numerical representation. These coordinates are abstract latent dimensions; they do not have predefined human or linguistic meanings.
        </span>
      </div>
    </div>
  );
};

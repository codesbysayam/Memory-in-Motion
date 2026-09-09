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
    <div className="rounded-2xl border border-[#E5E0D8] bg-[#FFFFFF] p-5 text-[#151515] space-y-4 font-mono shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EAE6DF] pb-3">
        <div className="flex items-center gap-2">
          <Binary className="w-4 h-4 text-[#167C80]" />
          <h4 className="text-xs font-bold text-[#151515] uppercase tracking-wider">
            Representation Inspector · What the Model Actually Sees
          </h4>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-[#EDF7F7] border border-[#CFE8E8] text-[#167C80] font-bold">
          LATENT REPRESENTATION
        </span>
      </div>

      {/* Human-Readable vs Encoded Latent Representation Split */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Human Input */}
        <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-2">
          <span className="text-[10px] text-[#716F68] uppercase font-bold block">
            HUMAN-READABLE INPUT
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[#716F68]">Key:</span>
            <strong className="text-[#151515] bg-[#FFFFFF] px-2 py-0.5 rounded border border-[#E5E0D8]">
              {currentKey}
            </strong>
            <span className="text-[#716F68]">→</span>
            <span className="text-[#716F68]">Value:</span>
            <strong className="text-[#167C80] bg-[#FFFFFF] px-2 py-0.5 rounded border border-[#E5E0D8]">
              {currentValue}
            </strong>
          </div>
          <p className="text-[10px] text-[#716F68] font-sans mt-1">
            The toy does not store the word &ldquo;{currentKey}&rdquo; literally. It converts each item into a deterministic numerical representation.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-2">
          <span className="text-[10px] text-[#716F68] uppercase font-bold block">
            SELECT VECTOR TO INSPECT
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => setActiveTab('key')}
              className={`py-1 px-2 rounded-lg text-[11px] font-bold transition border cursor-pointer ${
                activeTab === 'key'
                  ? 'bg-[#F3EFFF] text-[#6842C2] border-[#E2D8FA] shadow-xs'
                  : 'bg-[#FFFFFF] text-[#716F68] border-[#E5E0D8] hover:text-[#151515]'
              }`}
            >
              KEY: {currentKey}
            </button>
            <button
              onClick={() => setActiveTab('value')}
              className={`py-1 px-2 rounded-lg text-[11px] font-bold transition border cursor-pointer ${
                activeTab === 'value'
                  ? 'bg-[#F3EFFF] text-[#6842C2] border-[#E2D8FA] shadow-xs'
                  : 'bg-[#FFFFFF] text-[#716F68] border-[#E5E0D8] hover:text-[#151515]'
              }`}
            >
              VALUE: {currentValue}
            </button>
            <button
              onClick={() => setActiveTab('query')}
              className={`py-1 px-2 rounded-lg text-[11px] font-bold transition border cursor-pointer ${
                activeTab === 'query'
                  ? 'bg-[#F3EFFF] text-[#6842C2] border-[#E2D8FA] shadow-xs'
                  : 'bg-[#FFFFFF] text-[#716F68] border-[#E5E0D8] hover:text-[#151515]'
              }`}
            >
              QUERY: {queryKey}
            </button>
          </div>
        </div>
      </div>

      {/* Latent Vector Coordinates Strip */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] text-[#52504A]">
          <span>
            Encoded Vector for <strong className="text-[#167C80]">&ldquo;{activeText}&rdquo;</strong> (Dimension D={dimension}):
          </span>
          <span className="text-[10px] text-[#716F68]">Range: [-1.0, +1.0]</span>
        </div>

        {/* Coordinate Cells */}
        <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-16 gap-1 p-2 bg-[#FFFFFF] rounded-xl border border-[#E5E0D8] overflow-x-auto">
          {vec.map((v, i) => (
            <div
              key={i}
              className="flex flex-col items-center p-1 rounded-lg bg-[#FAF8F5] border border-[#EAE6DF] text-center"
              title={`Dimension [${i}]: ${v.toFixed(4)}`}
            >
              <span className="text-[8px] text-[#716F68]">d{i}</span>
              <span
                className={`text-[10px] font-bold ${
                  v >= 0 ? 'text-[#167C80]' : 'text-[#B64235]'
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
        <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF]">
          <span className="text-[9px] text-[#716F68] block uppercase font-bold">DIMENSION</span>
          <strong className="text-[#151515] text-xs">{dimension}</strong>
        </div>
        <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF]">
          <span className="text-[9px] text-[#716F68] block uppercase font-bold">MIN VALUE</span>
          <strong className="text-[#B64235] text-xs">{stats.min.toFixed(3)}</strong>
        </div>
        <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF]">
          <span className="text-[9px] text-[#716F68] block uppercase font-bold">MAX VALUE</span>
          <strong className="text-[#167C80] text-xs">{stats.max.toFixed(3)}</strong>
        </div>
        <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF]">
          <span className="text-[9px] text-[#716F68] block uppercase font-bold">MEAN</span>
          <strong className="text-[#52504A] text-xs">{stats.mean.toFixed(3)}</strong>
        </div>
        <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF]">
          <span className="text-[9px] text-[#716F68] block uppercase font-bold">L2 NORM</span>
          <strong className="text-[#247A4B] text-xs">{stats.l2.toFixed(3)}</strong>
        </div>
      </div>

      {/* Epistemic disclaimer note */}
      <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-[11px] text-[#52504A] font-sans flex items-start gap-2">
        <Info className="w-4 h-4 text-[#167C80] shrink-0 mt-0.5" />
        <span>
          <strong className="text-[#151515]">Scientific Principle:</strong> The educational model does not manipulate the text directly. It converts each item into a deterministic numerical representation. These coordinates are abstract latent dimensions; they do not have predefined human or linguistic meanings.
        </span>
      </div>
    </div>
  );
};

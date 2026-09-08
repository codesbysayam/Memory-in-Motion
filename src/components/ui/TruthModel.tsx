import React from 'react';

export interface TruthModelProps {
  truth: string;
  model: string;
  label?: string;
  confidence?: number;
  margin?: number;
  status?: 'match' | 'interference' | 'forgotten';
  explanation?: string;
  id?: string;
}

export function TruthModel({
  truth,
  model,
  label = "CAPITAL OF JAPAN",
  confidence,
  margin,
  status = "match",
  explanation,
  id
}: TruthModelProps) {
  const isMatch = status === 'match';
  const isInterference = status === 'interference';
  const isForgotten = status === 'forgotten';

  const statusColor = isMatch
    ? 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20'
    : isInterference
    ? 'text-amber-400 border-amber-500/30 bg-amber-950/20'
    : 'text-rose-400 border-rose-500/30 bg-rose-950/20';

  const statusBadge = isMatch ? (
    <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
      STATE MATCH
    </span>
  ) : isInterference ? (
    <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-300">
      INTERFERENCE
    </span>
  ) : (
    <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded border border-rose-500/30 bg-rose-500/10 text-rose-300">
      DECAYED / FORGOTTEN
    </span>
  );

  return (
    <div id={id} className="rounded-xl border border-[#252A35] bg-[#11141A] p-4 text-[#F4F5F7] space-y-3 shadow-sm">
      <div className="flex items-center justify-between text-xs tracking-wider text-[#8F96A3] uppercase font-mono">
        <span>{label}</span>
        {statusBadge}
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border border-[#252A35] bg-[#151922] p-3">
          <div className="text-[11px] uppercase tracking-wider text-[#8F96A3] font-mono mb-1">GROUND TRUTH</div>
          <div className="font-semibold text-white tracking-wide text-base">{truth}</div>
        </div>

        <div className={`rounded-lg border p-3 ${statusColor}`}>
          <div className="text-[11px] uppercase tracking-wider opacity-80 font-mono mb-1">MODEL PREDICTION</div>
          <div className="font-semibold tracking-wide text-base">{model}</div>
        </div>
      </div>

      {(confidence !== undefined || margin !== undefined) && (
        <div className="flex items-center justify-between text-xs font-mono text-[#8F96A3] pt-1 border-t border-[#252A35]/60">
          {confidence !== undefined && (
            <span>
              Cosine Sim: <span className="text-white font-semibold">{confidence.toFixed(3)}</span>
            </span>
          )}
          {margin !== undefined && (
            <span>
              Decision Margin: <span className={margin > 0.1 ? 'text-emerald-400' : 'text-amber-400'}>{margin > 0 ? `+${margin.toFixed(2)}` : margin.toFixed(2)}</span>
            </span>
          )}
        </div>
      )}

      {explanation && (
        <div className="text-xs text-[#8F96A3] leading-relaxed border-t border-[#252A35]/60 pt-2">
          {explanation}
        </div>
      )}
    </div>
  );
}

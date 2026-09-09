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
    ? 'text-[#247A4B] border-[#CDEEDB] bg-[#EDF8F2]'
    : isInterference
    ? 'text-[#A46622] border-[#F5E2C4] bg-[#FDF8EE]'
    : 'text-[#B64235] border-[#F7D3CF] bg-[#FDF2F0]';

  const statusBadge = isMatch ? (
    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-[#CDEEDB] bg-[#EDF8F2] text-[#247A4B]">
      STATE MATCH
    </span>
  ) : isInterference ? (
    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-[#F5E2C4] bg-[#FDF8EE] text-[#A46622]">
      INTERFERENCE
    </span>
  ) : (
    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-[#F7D3CF] bg-[#FDF2F0] text-[#B64235]">
      DECAYED / FORGOTTEN
    </span>
  );

  return (
    <div id={id} className="rounded-xl border border-[#E5E0D8] bg-[#FFFFFF] p-4 text-[#151515] space-y-3 shadow-xs">
      <div className="flex items-center justify-between text-xs tracking-wider text-[#716F68] uppercase font-mono">
        <span>{label}</span>
        {statusBadge}
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border border-[#E5E0D8] bg-[#FAF8F5] p-3">
          <div className="text-[10px] uppercase tracking-wider text-[#716F68] font-mono mb-1">GROUND TRUTH</div>
          <div className="font-serif font-bold text-[#151515] text-base">{truth}</div>
        </div>

        <div className={`rounded-lg border p-3 ${statusColor}`}>
          <div className="text-[10px] uppercase tracking-wider opacity-80 font-mono mb-1">MODEL PREDICTION</div>
          <div className="font-serif font-bold text-base">{model}</div>
        </div>
      </div>

      {(confidence !== undefined || margin !== undefined) && (
        <div className="flex items-center justify-between text-xs font-mono text-[#716F68] pt-2 border-t border-[#EAE6DF]">
          {confidence !== undefined && (
            <span>
              Cosine Sim: <strong className="text-[#151515]">{confidence.toFixed(3)}</strong>
            </span>
          )}
          {margin !== undefined && (
            <span>
              Decision Margin:{' '}
              <strong className={margin > 0.1 ? 'text-[#247A4B]' : 'text-[#A46622]'}>
                {margin > 0 ? `+${margin.toFixed(2)}` : margin.toFixed(2)}
              </strong>
            </span>
          )}
        </div>
      )}

      {explanation && (
        <div className="text-xs text-[#52504A] font-sans leading-relaxed border-t border-[#EAE6DF] pt-2">
          {explanation}
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { Cpu, ShieldCheck, Activity, Eye, Zap } from 'lucide-react';

interface HeaderProps {
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
  activeSection: string;
}

export const Header: React.FC<HeaderProps> = ({
  reducedMotion,
  onToggleReducedMotion,
  activeSection,
}) => {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-[#090a0f]/90 backdrop-blur-md">
      {/* Top technical ribbon */}
      <div className="border-b border-zinc-800/50 px-4 py-1.5 text-xs text-zinc-400">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-950/40 px-2.5 py-0.5 font-mono text-[11px] text-purple-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-400"></span>
              DataForge 2026 · Pathway Track
            </span>
            <span className="hidden text-zinc-500 sm:inline">|</span>
            <span className="hidden font-mono text-[11px] text-zinc-400 sm:inline">
              Pathway BDH Scientific Laboratory
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded border border-zinc-800 bg-zinc-900/60 px-2 py-0.5 font-mono text-[10px] text-emerald-400">
              100% IN-BROWSER DETERMINISTIC
            </span>
            <button
              id="reduced-motion-toggle"
              onClick={onToggleReducedMotion}
              className={`flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] transition-colors ${
                reducedMotion
                  ? 'border-purple-500/50 bg-purple-950/50 text-purple-300'
                  : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-zinc-200'
              }`}
              title="Toggle subtle computational animations"
            >
              <Eye className="h-3 w-3" />
              <span>{reducedMotion ? 'Reduced Motion: ON' : 'Motion: Enabled'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Title & Claim Bar */}
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded border border-purple-500/40 bg-purple-950/30 text-purple-400">
                <Cpu className="h-4 w-4" />
              </div>
              <h1 className="font-mono text-lg font-bold tracking-tight text-zinc-100 sm:text-xl">
                MEMORY IN MOTION
              </h1>
              <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] uppercase text-zinc-300">
                v1.2 Lab
              </span>
            </div>
            <p className="mt-0.5 text-xs text-zinc-400">
              An interactive laboratory for understanding recurrent memory and the Dragon Hatchling architecture.
            </p>
          </div>

          {/* Central Falsifiable Claim Pill */}
          <div className="flex max-w-xl items-start gap-2 rounded-lg border border-purple-900/50 bg-purple-950/20 p-2.5">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />
            <div className="text-[11px] leading-relaxed text-zinc-300">
              <strong className="font-mono uppercase text-purple-300">Central Falsifiable Claim: </strong>
              <span>
                "A fixed-size recurrent state can carry task-relevant information forward without growing a token-by-token memory, but compressing information into that state creates interference and forgetting."
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

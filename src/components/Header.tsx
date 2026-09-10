import React from 'react';
import { ShieldCheck, Eye } from 'lucide-react';
import { LogoMark } from './ui/LogoMark';

interface HeaderProps {
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
  activeSection: string;
}

export const Header: React.FC<HeaderProps> = ({
  reducedMotion,
  onToggleReducedMotion,
}) => {
  return (
    <header className="sticky top-0 z-50 border-b border-[#E5E0D8] bg-[#FBF9F5]/90 backdrop-blur-md">
      {/* Top technical ribbon */}
      <div className="border-b border-[#EAE6DF] px-4 py-1.5 text-xs text-[#716F68]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E2D8FA] bg-[#F3EFFF] px-2.5 py-0.5 font-mono text-[11px] text-[#6842C2] font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-[#6842C2]"></span>
              DataForge 2026 · Pathway Track
            </span>
            <span className="hidden text-[#D8D4CB] sm:inline">|</span>
            <span className="hidden font-mono text-[11px] text-[#716F68] sm:inline">
              Pathway BDH Scientific Laboratory
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-lg border border-[#CFE8E8] bg-[#EDF7F7] px-2 py-0.5 font-mono text-[10px] text-[#167C80] font-bold">
              100% IN-BROWSER DETERMINISTIC
            </span>
            <button
              id="reduced-motion-toggle"
              onClick={onToggleReducedMotion}
              className={`flex items-center gap-1 rounded-lg border px-2.5 py-0.5 text-[11px] font-mono transition-colors cursor-pointer ${
                reducedMotion
                  ? 'border-[#E2D8FA] bg-[#F3EFFF] text-[#6842C2] font-semibold'
                  : 'border-[#E5E0D8] bg-[#FFFFFF] text-[#716F68] hover:text-[#151515] hover:border-[#D8D4CB]'
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
              <LogoMark size={28} variant="purple" />
              <h1 className="font-serif text-lg font-bold tracking-tight text-[#151515] sm:text-xl">
                Memory in Motion
              </h1>
              <span className="rounded-md border border-[#EAE6DF] bg-[#FAF8F5] px-1.5 py-0.5 font-mono text-[10px] uppercase text-[#716F68]">
                v1.2 Lab
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#716F68] font-sans">
              An interactive laboratory for understanding recurrent memory and the Dragon Hatchling architecture.
            </p>
          </div>

          {/* Central Falsifiable Claim Pill */}
          <div className="flex max-w-xl items-start gap-2.5 rounded-xl border border-[#E2D8FA] bg-[#F3EFFF]/50 p-2.5 sm:p-3 shadow-xs">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#6842C2]" />
            <div className="text-[11px] leading-relaxed text-[#2A2926] font-sans">
              <strong className="font-mono uppercase text-[#6842C2] font-semibold">Central Falsifiable Claim: </strong>
              <span>
                &ldquo;A fixed-size recurrent state can carry task-relevant information forward without growing a token-by-token memory, but compressing information into that state creates interference and forgetting.&rdquo;
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

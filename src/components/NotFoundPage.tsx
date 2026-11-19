import React from 'react';
import { ArrowLeft, Compass } from 'lucide-react';

interface NotFoundPageProps {
  onReturnToMemory: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onReturnToMemory }) => {
  return (
    <div
      id="custom-404-page"
      className="min-h-[80vh] flex items-center justify-center p-6 bg-[var(--page-bg)] text-[var(--text-primary)] font-sans"
    >
      <div className="w-full max-w-md text-center space-y-6 p-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="w-14 h-14 rounded-xl bg-[var(--accent-blue)] border border-[var(--border)] flex items-center justify-center mx-auto text-[var(--color-accent-ink)]">
          <Compass className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <div className="font-mono text-xs font-medium text-[var(--color-accent-ink)]">
            Status 404 · Unmapped coordinate
          </div>
          <h1 className="text-5xl sm:text-6xl font-serif font-normal text-[var(--text-primary)] tracking-tight">
            404
          </h1>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] font-sans">
            This page is not part of the experiment.
          </p>
        </div>

        <p className="text-xs text-[var(--text-muted)] font-sans max-w-xs mx-auto leading-relaxed">
          The requested coordinate lies outside the 7 experimental stages and documentation specifications.
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={onReturnToMemory}
            className="w-full py-3 px-4 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--surface)] text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Memory</span>
          </button>
        </div>
      </div>
    </div>
  );
};

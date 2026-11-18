import React from 'react';

export interface DiagramFrameProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  controls?: React.ReactNode;
  caption?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  id?: string;
}

export const DiagramFrame: React.FC<DiagramFrameProps> = ({
  title,
  subtitle,
  badge,
  controls,
  caption,
  children,
  className = '',
  bodyClassName = 'p-5 sm:p-6',
  id,
}) => {
  return (
    <section id={id} className={`diagram-frame ${className}`}>
      <div className="px-5 py-4 border-b border-[var(--border)] bg-[var(--surface-soft)] flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 space-y-0.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="font-serif text-base sm:text-lg font-semibold text-[var(--text-primary)] leading-snug">
              {title}
            </h3>
            {badge}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm font-sans text-[var(--text-secondary)] leading-snug">
              {subtitle}
            </p>
          )}
        </div>
        {controls && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {controls}
          </div>
        )}
      </div>

      <div className={bodyClassName}>{children}</div>

      {caption && (
        <div className="px-5 py-3 border-t border-[var(--border)] bg-[var(--surface-soft)] text-xs font-sans text-[var(--text-secondary)] leading-relaxed">
          {caption}
        </div>
      )}
    </section>
  );
};

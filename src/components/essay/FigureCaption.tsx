import React from 'react';

export interface FigureLegendItem {
  label: string;
  color: string;
}

interface FigureCaptionProps {
  figureNumber?: string;
  figure?: string;
  number?: string;
  caption?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  note?: React.ReactNode;
  legend?: FigureLegendItem[];
  source?: string;
  className?: string;
}

export const FigureCaption: React.FC<FigureCaptionProps> = ({
  figureNumber,
  figure,
  number,
  caption,
  title,
  description,
  note,
  legend,
  source = 'Live deterministic toy computation (in-browser)',
  className = '',
}) => {
  const figLabel = figureNumber || figure || number;
  const mainCaption = caption || title;

  return (
    <figcaption
      className={`pt-3 mt-3 border-t border-[var(--mm-rule)] space-y-2 text-xs leading-relaxed ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div className="text-[var(--text-secondary)] font-sans max-w-3xl">
          {figLabel && (
            <span className="font-mono font-semibold text-[var(--text-primary)] mr-2 tabular-nums">
              {figLabel}
            </span>
          )}
          {mainCaption && <span className="font-medium text-[var(--text-primary)]">{mainCaption}</span>}
          {description && (
            <span className="text-[var(--text-secondary)] ml-1.5">{description}</span>
          )}
        </div>
        {source && (
          <span className="font-mono text-[11px] text-[var(--text-muted)] shrink-0 sm:text-right">
            {source}
          </span>
        )}
      </div>

      {(legend && legend.length > 0) || note ? (
        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-[var(--text-muted)]">
          {legend && legend.length > 0 && (
            <div className="flex flex-wrap items-center gap-4">
              {legend.map((item) => (
                <span key={item.label} className="inline-flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-xs shrink-0"
                    style={{ backgroundColor: item.color }}
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                </span>
              ))}
            </div>
          )}
          {note && <span className="font-sans italic text-[var(--text-muted)]">{note}</span>}
        </div>
      ) : null}
    </figcaption>
  );
};

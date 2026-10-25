import React from 'react';

interface ControlSliderProps {
  label: string | React.ReactNode;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  formatValue?: (val: number) => string;
  description?: string | React.ReactNode;
  hint?: string | React.ReactNode;
  onChange: (value: number) => void;
  id?: string;
  theme?: 'light' | 'dark';
}

export function ControlSlider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  formatValue,
  description,
  hint,
  onChange,
  id,
}: ControlSliderProps) {
  const textDesc = description || hint;
  const displayValue = formatValue ? formatValue(value) : `${value}${unit ? ` ${unit}` : ''}`;

  return (
    <div id={id} className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono uppercase tracking-wider font-medium text-[var(--text-secondary)]">
          {label}
        </span>
        <span className="font-mono font-semibold px-2 py-0.5 rounded border shadow-2xs text-[var(--text-primary)] bg-[var(--surface)] border-[var(--border)]">
          {displayValue}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[var(--accent-blue-text)] focus:outline-none bg-[var(--surface-soft)] border border-[var(--border)]"
      />

      {textDesc && (
        <div className="text-[11px] leading-relaxed font-sans text-[var(--text-muted)]">
          {textDesc}
        </div>
      )}
    </div>
  );
}

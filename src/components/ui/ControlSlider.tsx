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
    <div id={id} className="space-y-2">
      <div className="flex items-center justify-between gap-2 text-xs">
        <label
          htmlFor={id ? `${id}-input` : undefined}
          className="font-sans font-medium text-[var(--text-primary)]"
        >
          {label}
        </label>
        <span className="font-mono text-xs font-semibold tabular-nums text-[var(--accent-blue-text)]">
          {displayValue}
        </span>
      </div>

      <input
        id={id ? `${id}-input` : undefined}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)] bg-[var(--surface-soft)] border border-[var(--border)]"
      />

      {textDesc && (
        <div className="text-xs leading-relaxed font-sans text-[var(--text-muted)]">
          {textDesc}
        </div>
      )}
    </div>
  );
}

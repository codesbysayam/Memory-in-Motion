import React from 'react';

interface ControlSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  formatValue?: (val: number) => string;
  description?: string;
  hint?: string;
  onChange: (value: number) => void;
  id?: string;
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
  id
}: ControlSliderProps) {
  const textDesc = description || hint;
  const displayValue = formatValue ? formatValue(value) : `${value}${unit ? ` ${unit}` : ''}`;

  return (
    <div id={id} className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono uppercase tracking-wider text-[#716F68] font-medium">
          {label}
        </span>
        <span className="font-mono font-semibold text-[#151515] bg-[#FFFFFF] px-2 py-0.5 rounded border border-[#D8D4CB] shadow-xs">
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
        className="w-full h-1.5 bg-[#E5E0D8] rounded-lg appearance-none cursor-pointer accent-[#6842C2] focus:outline-none"
      />

      {textDesc && (
        <p className="text-[11px] text-[#716F68] leading-normal pt-0.5 font-sans">
          {textDesc}
        </p>
      )}
    </div>
  );
}

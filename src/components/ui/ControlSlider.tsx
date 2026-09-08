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
  onChange,
  id
}: ControlSliderProps) {
  const displayValue = formatValue ? formatValue(value) : `${value}${unit ? ` ${unit}` : ''}`;

  return (
    <div id={id} className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono uppercase tracking-wider text-[#8F96A3] font-medium">
          {label}
        </span>
        <span className="font-mono font-semibold text-white bg-[#151922] px-2 py-0.5 rounded border border-[#252A35]">
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
        className="w-full h-1.5 bg-[#252A35] rounded-lg appearance-none cursor-pointer accent-[#8B5CF6] focus:outline-none"
      />

      {description && (
        <p className="text-[11px] text-[#8F96A3] leading-normal pt-0.5">
          {description}
        </p>
      )}
    </div>
  );
}

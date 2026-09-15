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
  theme = 'light'
}: ControlSliderProps) {
  const textDesc = description || hint;
  const displayValue = formatValue ? formatValue(value) : `${value}${unit ? ` ${unit}` : ''}`;
  const isDark = theme === 'dark';

  return (
    <div id={id} className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className={`font-mono uppercase tracking-wider font-medium ${isDark ? 'text-slate-300' : 'text-[#716F68]'}`}>
          {label}
        </span>
        <span className={`font-mono font-semibold px-2 py-0.5 rounded border shadow-xs ${
          isDark
            ? 'text-white bg-[#151922] border-[#252A35]'
            : 'text-[#151515] bg-[#FFFFFF] border-[#D8D4CB]'
        }`}>
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
        className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#22D3EE] focus:outline-none ${
          isDark ? 'bg-[#252A35]' : 'bg-[#E5E0D8]'
        }`}
      />

      {textDesc && (
        <div className={`text-[11px] leading-normal pt-0.5 font-sans ${isDark ? 'text-slate-400' : 'text-[#716F68]'}`}>
          {textDesc}
        </div>
      )}
    </div>
  );
}


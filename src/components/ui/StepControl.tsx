import React from 'react';
import { SkipForward } from 'lucide-react';

interface StepControlProps {
  onStep: () => void;
  disabled?: boolean;
  label?: string;
  isRestart?: boolean;
  className?: string;
}

export const StepControl: React.FC<StepControlProps> = ({
  onStep,
  disabled = false,
  label = 'Step',
  isRestart = false,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onStep}
      disabled={disabled}
      className={`btn btn-secondary ${className}`}
      title={isRestart ? 'Restart from step 0' : 'Advance one simulation step'}
    >
      <SkipForward className="w-3.5 h-3.5 text-[#31566E]" />
      <span>{isRestart ? `${label} (Restart)` : label}</span>
    </button>
  );
};

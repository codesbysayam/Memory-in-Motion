import React from 'react';

interface LogoMarkProps {
  size?: number;
  className?: string;
  variant?: 'editorial' | 'monochrome' | 'soft-blue' | 'soft-green' | 'purple' | 'light';
}

/**
 * Memory in Motion — Canonical Vector Mark
 * Symbolizes:
 * - A continuous geometric recurrent flow forming an editorial "M"
 * - Recurrent feedback loop carrying state across timesteps
 * - Precision state node at the recurrence nexus
 */
export const LogoMark: React.FC<LogoMarkProps> = ({
  size = 32,
  className = '',
  variant = 'editorial',
}) => {
  let strokeColor = '#252525';
  let accentNodeColor = '#2B6282';
  let bgFill = '#F0F1EF';
  let borderColor = '#D9DCD8';

  if (variant === 'soft-blue') {
    strokeColor = '#21445B';
    accentNodeColor = '#2B6282';
    bgFill = '#E7F2FA';
    borderColor = '#CDE1F0';
  } else if (variant === 'soft-green') {
    strokeColor = '#24452E';
    accentNodeColor = '#24452E';
    bgFill = '#DCEFE2';
    borderColor = '#C5DDCB';
  } else if (variant === 'monochrome') {
    strokeColor = '#252525';
    accentNodeColor = '#252525';
    bgFill = '#F7F5EF';
    borderColor = '#D9DCD8';
  } else if (variant === 'light') {
    strokeColor = '#FFFFFF';
    accentNodeColor = '#CFE8D6';
    bgFill = '#252525';
    borderColor = '#3F423F';
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Memory in Motion Mark"
    >
      {/* Soft rounded substrate container */}
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="8"
        fill={bgFill}
        stroke={borderColor}
        strokeWidth="1"
      />

      {/* Recurrent M trajectory — continuous topological loop */}
      <path
        d="M 12 34 L 12 18 C 12 13.5 17.5 13.5 19.5 18 L 24 24.5 L 28.5 18 C 30.5 13.5 36 13.5 36 18 L 36 34"
        stroke={strokeColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Recurrent loop feedback trajectory connecting past and future state */}
      <path
        d="M 19.5 28 C 18 32.5 30 32.5 28.5 28"
        stroke={strokeColor}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeDasharray="2 2.5"
        strokeOpacity="0.75"
      />

      {/* Active State Node h_t at the nexus of the recurrence */}
      <circle
        cx="24"
        cy="24.5"
        r="2.25"
        fill={accentNodeColor}
      />
      <circle
        cx="24"
        cy="24.5"
        r="4.25"
        stroke={accentNodeColor}
        strokeWidth="1"
        strokeOpacity="0.35"
      />
    </svg>
  );
};

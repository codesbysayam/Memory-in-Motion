import React from 'react';

interface LogoMarkProps {
  size?: number;
  className?: string;
  variant?: 'purple' | 'monochrome' | 'light';
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
  variant = 'purple',
}) => {
  const strokeColor =
    variant === 'purple'
      ? '#6842C2'
      : variant === 'light'
      ? '#F5F3EE'
      : '#1C1B19';

  const accentNodeColor =
    variant === 'purple'
      ? '#287C7C'
      : variant === 'light'
      ? '#A29CF4'
      : '#1C1B19';

  const bgFill =
    variant === 'purple'
      ? '#F3EFFF'
      : variant === 'light'
      ? '#1A1D24'
      : '#F0ECE1';

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
        rx="10"
        fill={bgFill}
        stroke={strokeColor}
        strokeWidth="1.25"
        strokeOpacity={variant === 'purple' ? '0.2' : '0.4'}
      />

      {/* Recurrent M trajectory — continuous topological loop */}
      <path
        d="M 12 36 L 12 18 C 12 13 18 13 20 18 L 24 25 L 28 18 C 30 13 36 13 36 18 L 36 36"
        stroke={strokeColor}
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Recurrent loop feedback trajectory connecting past and future state */}
      <path
        d="M 20 28 C 18 33 30 33 28 28"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="2 3"
        strokeOpacity="0.7"
      />

      {/* Active State Node h_t at the nexus of the recurrence */}
      <circle
        cx="24"
        cy="25"
        r="2.5"
        fill={accentNodeColor}
      />
      <circle
        cx="24"
        cy="25"
        r="4.5"
        stroke={accentNodeColor}
        strokeWidth="1"
        strokeOpacity="0.4"
      />
    </svg>
  );
};

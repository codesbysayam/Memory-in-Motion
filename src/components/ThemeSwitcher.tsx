import React from 'react';
import { Sun, Monitor, Moon } from 'lucide-react';
import { useTheme, ThemeMode } from '../context/ThemeContext';

export interface ThemeSwitcherProps {
  className?: string;
  showLabels?: boolean;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  className = '',
  showLabels = false,
}) => {
  const { mode, setTheme } = useTheme();

  const options: {
    id: ThemeMode;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    tooltip: string;
  }[] = [
    {
      id: 'light',
      label: 'Light',
      icon: Sun,
      tooltip: 'Use the light theme',
    },
    {
      id: 'system',
      label: 'System',
      icon: Monitor,
      tooltip: 'Follow your device appearance',
    },
    {
      id: 'dark',
      label: 'Dark',
      icon: Moon,
      tooltip: 'Use the dark theme',
    },
  ];

  return (
    <div
      className={`theme-switcher ${className}`}
      role="group"
      aria-label="Theme selection"
    >
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = mode === option.id;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => setTheme(option.id)}
            className={`theme-option ${isActive ? 'active' : ''}`}
            title={option.tooltip}
            aria-label={option.tooltip}
            aria-pressed={isActive}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span className={showLabels ? 'inline text-xs' : 'hidden sm:inline text-xs'}>
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default ThemeSwitcher;

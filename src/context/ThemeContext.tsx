import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type ThemeMode = 'light' | 'system' | 'dark';

// Backwards-compatibility alias
export type Theme = ThemeMode;

export const THEME_KEY = 'memory-in-motion-theme';

export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  try {
    const value = localStorage.getItem(THEME_KEY) || localStorage.getItem('memory-theme');
    if (value === 'light' || value === 'dark' || value === 'system') {
      return value;
    }
  } catch (e) {
    console.warn('Could not read theme from localStorage', e);
  }
  return 'system';
}

export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export interface ThemeContextValue {
  mode: ThemeMode;
  theme: ThemeMode; // Alias for mode
  resolvedTheme: 'light' | 'dark';
  setTheme: (mode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(getStoredTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    const initial = getStoredTheme();
    return initial === 'system' ? getSystemTheme() : initial;
  });

  const applyTheme = useCallback((active: 'light' | 'dark') => {
    setResolvedTheme(active);
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = active;
      if (active === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
    }
  }, []);

  useEffect(() => {
    if (mode === 'system') {
      applyTheme(getSystemTheme());

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      applyTheme(mode);
    }
  }, [mode, applyTheme]);

  const setTheme = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(THEME_KEY, newMode);
      localStorage.setItem('memory-theme', newMode);
    } catch (e) {
      console.warn('Could not save theme to localStorage', e);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, theme: mode, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

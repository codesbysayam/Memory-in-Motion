import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { ExperimentConfig, DEFAULT_CONFIG } from '../types/experiment';
import { EXPERIMENT_PRESETS, findFailurePreset } from '../data/experimentPresets';

export type LabMode = 'guided' | 'sandbox';

interface ExperimentContextType {
  mode: LabMode;
  setMode: (m: LabMode) => void;
  config: ExperimentConfig;
  prevConfig: ExperimentConfig;
  setConfig: (configOrUpdater: ExperimentConfig | ((prev: ExperimentConfig) => ExperimentConfig)) => void;
  updateConfig: (partial: Partial<ExperimentConfig>) => void;
  activePresetKey: string | null;
  applyPreset: (key: string) => void;
  resetLab: () => void;
  showJudgeMode: boolean;
  setShowJudgeMode: (show: boolean) => void;
  triggerFailurePreset: () => void;
}

const ExperimentContext = createContext<ExperimentContextType | null>(null);

export const ExperimentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<LabMode>('guided');
  const [config, setConfigState] = useState<ExperimentConfig>(DEFAULT_CONFIG);
  const [prevConfig, setPrevConfig] = useState<ExperimentConfig>(DEFAULT_CONFIG);
  const [activePresetKey, setActivePresetKey] = useState<string | null>('clean');
  const [showJudgeMode, setShowJudgeMode] = useState<boolean>(false);

  const setConfig = useCallback(
    (configOrUpdater: ExperimentConfig | ((prev: ExperimentConfig) => ExperimentConfig)) => {
      setConfigState((current) => {
        const next = typeof configOrUpdater === 'function' ? configOrUpdater(current) : configOrUpdater;
        setPrevConfig(current);
        return next;
      });
    },
    []
  );

  const updateConfig = useCallback((partial: Partial<ExperimentConfig>) => {
    setConfigState((current) => {
      setPrevConfig(current);
      return { ...current, ...partial };
    });
  }, []);

  const applyPreset = useCallback((presetKey: string) => {
    const preset = EXPERIMENT_PRESETS[presetKey];
    if (preset) {
      setActivePresetKey(presetKey);
      setConfigState((current) => {
        setPrevConfig(current);
        return { ...preset.config };
      });
    }
  }, []);

  const resetLab = useCallback(() => {
    setPrevConfig(config);
    setConfigState(DEFAULT_CONFIG);
    setActivePresetKey('clean');
  }, [config]);

  const triggerFailurePreset = useCallback(() => {
    const failConfig = findFailurePreset('Japan', 'Tokyo');
    setPrevConfig(config);
    setConfigState(failConfig);
    setActivePresetKey('interfere');

    // Scroll to the main experiment section
    const el = document.getElementById('section-05') || document.getElementById('section-04');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [config]);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      config,
      prevConfig,
      setConfig,
      updateConfig,
      activePresetKey,
      applyPreset,
      resetLab,
      showJudgeMode,
      setShowJudgeMode,
      triggerFailurePreset,
    }),
    [
      mode,
      config,
      prevConfig,
      setConfig,
      updateConfig,
      activePresetKey,
      applyPreset,
      resetLab,
      showJudgeMode,
      triggerFailurePreset,
    ]
  );

  return <ExperimentContext.Provider value={value}>{children}</ExperimentContext.Provider>;
};

export function useExperiment() {
  const ctx = useContext(ExperimentContext);
  if (!ctx) {
    throw new Error('useExperiment must be used within an ExperimentProvider');
  }
  return ctx;
}

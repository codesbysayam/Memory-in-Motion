import React, { createContext, useContext, useState, useMemo } from 'react';

export type MemoryLensStage = 'idle' | 'write' | 'state' | 'persistence' | 'query' | 'retrieval' | 'prediction';

interface MemoryLensContextType {
  isLensActive: boolean;
  setIsLensActive: (active: boolean) => void;
  activeStage: MemoryLensStage;
  setActiveStage: (stage: MemoryLensStage) => void;
  toggleLens: () => void;
}

const MemoryLensContext = createContext<MemoryLensContextType>({
  isLensActive: false,
  setIsLensActive: () => {},
  activeStage: 'idle',
  setActiveStage: () => {},
  toggleLens: () => {},
});

export const MemoryLensProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLensActive, setIsLensActive] = useState<boolean>(false);
  const [activeStage, setActiveStage] = useState<MemoryLensStage>('idle');

  const toggleLens = () => {
    setIsLensActive((prev) => !prev);
  };

  const value = useMemo(
    () => ({
      isLensActive,
      setIsLensActive,
      activeStage,
      setActiveStage,
      toggleLens,
    }),
    [isLensActive, activeStage]
  );

  return <MemoryLensContext.Provider value={value}>{children}</MemoryLensContext.Provider>;
};

export function useMemoryLens() {
  return useContext(MemoryLensContext);
}

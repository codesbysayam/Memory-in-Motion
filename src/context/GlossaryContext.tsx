import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  GLOSSARY_TERMS,
  GlossaryTerm,
  GlossaryCategory,
  findGlossaryTerm,
} from '../data/glossaryData';

interface GlossaryContextType {
  isOpen: boolean;
  activeTerm: GlossaryTerm;
  openGlossary: (termIdOrQuery?: string) => void;
  closeGlossary: () => void;
  selectTerm: (termId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: GlossaryCategory | 'All';
  setSelectedCategory: (category: GlossaryCategory | 'All') => void;
}

const DEFAULT_TERM = GLOSSARY_TERMS['recurrent-state'];

const GlossaryContext = createContext<GlossaryContextType>({
  isOpen: false,
  activeTerm: DEFAULT_TERM,
  openGlossary: () => {},
  closeGlossary: () => {},
  selectTerm: () => {},
  searchQuery: '',
  setSearchQuery: () => {},
  selectedCategory: 'All',
  setSelectedCategory: () => {},
});

export const GlossaryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTermId, setActiveTermId] = useState<string>('recurrent-state');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<GlossaryCategory | 'All'>('All');

  const activeTerm = useMemo(() => {
    return GLOSSARY_TERMS[activeTermId] || DEFAULT_TERM;
  }, [activeTermId]);

  const selectTerm = useCallback((termId: string) => {
    if (GLOSSARY_TERMS[termId]) {
      setActiveTermId(termId);
    }
  }, []);

  const openGlossary = useCallback((termIdOrQuery?: string) => {
    if (termIdOrQuery) {
      const match = findGlossaryTerm(termIdOrQuery);
      if (match) {
        setActiveTermId(match.id);
      }
    }
    setIsOpen(true);
  }, []);

  const closeGlossary = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      activeTerm,
      openGlossary,
      closeGlossary,
      selectTerm,
      searchQuery,
      setSearchQuery,
      selectedCategory,
      setSelectedCategory,
    }),
    [
      isOpen,
      activeTerm,
      openGlossary,
      closeGlossary,
      selectTerm,
      searchQuery,
      selectedCategory,
    ]
  );

  return <GlossaryContext.Provider value={value}>{children}</GlossaryContext.Provider>;
};

export function useGlossary() {
  const context = useContext(GlossaryContext);
  if (!context) {
    throw new Error('useGlossary must be used within a GlossaryProvider');
  }
  return context;
}

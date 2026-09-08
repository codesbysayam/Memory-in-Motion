import { FactItem } from '../types';

export const INITIAL_CAPITAL_FACTS: FactItem[] = [
  { id: 'f1', subject: 'France', relation: 'capital is', object: 'Paris', category: 'European Nations' },
  { id: 'f2', subject: 'Japan', relation: 'capital is', object: 'Tokyo', category: 'Asian Nations' },
  { id: 'f3', subject: 'Brazil', relation: 'capital is', object: 'Brasília', category: 'South American Nations' },
];

export const EXTENDED_DISTRACTOR_FACTS: FactItem[] = [
  { id: 'f4', subject: 'Canada', relation: 'capital is', object: 'Ottawa', category: 'North American Nations' },
  { id: 'f5', subject: 'Egypt', relation: 'capital is', object: 'Cairo', category: 'African Nations' },
  { id: 'f6', subject: 'Germany', relation: 'capital is', object: 'Berlin', category: 'European Nations' },
  { id: 'f7', subject: 'Australia', relation: 'capital is', object: 'Canberra', category: 'Oceania Nations' },
  { id: 'f8', subject: 'India', relation: 'capital is', object: 'New Delhi', category: 'Asian Nations' },
  { id: 'f9', subject: 'Kenya', relation: 'capital is', object: 'Nairobi', category: 'African Nations' },
  { id: 'f10', subject: 'Italy', relation: 'capital is', object: 'Rome', category: 'European Nations' },
  { id: 'f11', subject: 'Argentina', relation: 'capital is', object: 'Buenos Aires', category: 'South American Nations' },
  { id: 'f12', subject: 'South Korea', relation: 'capital is', object: 'Seoul', category: 'Asian Nations' },
  { id: 'f13', subject: 'Norway', relation: 'capital is', object: 'Oslo', category: 'European Nations' },
  { id: 'f14', subject: 'Mexico', relation: 'capital is', object: 'Mexico City', category: 'North American Nations' },
  { id: 'f15', subject: 'Thailand', relation: 'capital is', object: 'Bangkok', category: 'Asian Nations' },
  { id: 'f16', subject: 'Morocco', relation: 'capital is', object: 'Rabat', category: 'African Nations' },
  { id: 'f17', subject: 'Sweden', relation: 'capital is', object: 'Stockholm', category: 'European Nations' },
  { id: 'f18', subject: 'Chile', relation: 'capital is', object: 'Santiago', category: 'South American Nations' },
];

export const VARIABLE_BINDING_PAIRS = [
  { key: 'A', value: 17 },
  { key: 'B', value: 42 },
  { key: 'C', value: 91 },
  { key: 'D', value: 23 },
  { key: 'E', value: 58 },
  { key: 'F', value: 77 },
  { key: 'G', value: 34 },
  { key: 'H', value: 89 },
  { key: 'I', value: 12 },
  { key: 'J', value: 65 },
  { key: 'K', value: 99 },
  { key: 'L', value: 40 },
];

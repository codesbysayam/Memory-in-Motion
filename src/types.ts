export type TechnicalClassification = 
  | 'LIVE TOY MODEL'
  | 'LIVE COMPUTATION'
  | 'PUBLISHED BDH RESULT'
  | 'ILLUSTRATIVE EXPLANATION'
  | 'PRECOMPUTED RESULT';

export interface FactItem {
  id: string;
  subject: string;
  relation: string;
  object: string;
  category?: string;
}

export interface RecurrentStepLog {
  step: number;
  fact: FactItem;
  stateVector: number[];
  norm: number;
  activeDimensions: number;
  predictionForTarget: {
    predicted: string;
    confidence: number;
    correct: boolean;
  };
}

export interface MemorySimulationResult {
  stepLogs: RecurrentStepLog[];
  finalState: number[];
  targetQuery: string;
  groundTruth: string;
  predictedAnswer: string;
  confidence: number;
  isCorrect: boolean;
  interferenceScore: number;
  totalFactsStored: number;
}

export interface ChallengeItem {
  key: string;
  value: number;
  isDistractor: boolean;
}

export interface BDHNeuron {
  id: number;
  name: string;
  x: number;
  y: number;
  activation: number;
  bias: number;
  layer: 'input' | 'latent' | 'output';
}

export interface BDHSynapse {
  source: number;
  target: number;
  weight: number;
  synapticTrace: number;
  delta: number;
}

export interface BDHState {
  neurons: BDHNeuron[];
  synapses: BDHSynapse[];
  recurrentStep: number;
  energy: number;
  sparsityRatio: number;
  prediction: string;
  confidence: number;
}

export interface ResearchPaper {
  title: string;
  authors: string;
  venue: string;
  year: number;
  url: string;
  conceptContribution: string;
  whyRelevant: string;
  evidenceType: 'Primary BDH Architecture' | 'Foundational Recurrent State' | 'Associative Synaptic Memory' | 'Theoretical Capacity';
  isVerified: boolean;
}

export interface ResearchEvidenceItem {
  id: string;
  category: 'PRIMARY RESEARCH' | 'OFFICIAL TECHNICAL MATERIAL' | 'PUBLISHED RESULT' | 'OUR TOY EXPERIMENT' | 'ILLUSTRATION';
  claim: string;
  description: string;
  sourceLabel: string;
  sourceUrl: string;
}

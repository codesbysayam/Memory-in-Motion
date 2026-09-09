export interface MilestoneItem {
  id: string;
  label: string;
  category: 'Interaction' | 'Analysis' | 'BDH' | 'Evaluation';
  description: string;
}

export const MILESTONES: MilestoneItem[] = [
  {
    id: 'open_hero',
    label: 'Launch In-Context Experiment',
    category: 'Interaction',
    description: 'Executed sequential fact ingestion and query readout.',
  },
  {
    id: 'adjust_params',
    label: 'Tune Recurrent Retention (λ)',
    category: 'Interaction',
    description: 'Modulated decay factor or memory dimension coordinates.',
  },
  {
    id: 'inspect_state_diff',
    label: 'Inspect State Difference Matrix',
    category: 'Analysis',
    description: 'Observed rank-1 outer-product coordinate updates ΔM_t.',
  },
  {
    id: 'induce_interference',
    label: 'Induce Representational Interference',
    category: 'Analysis',
    description: 'Superposed multiple conflicting facts into finite capacity D.',
  },
  {
    id: 'explore_surgery',
    label: 'Perform Memory Overwrite Test',
    category: 'Analysis',
    description: 'Verified recency bias and historical state attenuation.',
  },
  {
    id: 'explore_bdh',
    label: 'Examine BDH Synaptic Architecture',
    category: 'BDH',
    description: 'Analyzed decentralized plastic synapses vs. monolithic state matrices.',
  },
  {
    id: 'test_latent_dynamics',
    label: 'Run Latent In-Context Reasoning',
    category: 'BDH',
    description: 'Tested multi-step hidden relaxation without emitting tokens.',
  },
  {
    id: 'verify_knowledge',
    label: 'Complete Final Knowledge Assessment',
    category: 'Evaluation',
    description: 'Answered foundational mechanistic questions on recurrent state.',
  },
];

const STORAGE_KEY = 'memory_in_motion_progress';

export function getCompletedMilestones(): string[] {
  if (typeof window === 'undefined') return ['open_hero'];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      // Default to core experiment started
      const initial = ['open_hero', 'adjust_params'];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : ['open_hero'];
  } catch {
    return ['open_hero'];
  }
}

export function markMilestoneCompleted(id: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getCompletedMilestones();
    if (!current.includes(id)) {
      const updated = [...current, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('milestone_updated', { detail: { id, all: updated } }));
      return updated;
    }
    return current;
  } catch {
    return [];
  }
}

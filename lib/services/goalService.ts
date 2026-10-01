import { Goal } from '@/types';
import { SEED_GOALS } from '@/lib/data/seedData';

const GOALS_STORAGE_KEY = 'lifeos_goals_store';

function getLocalGoals(): Goal[] {
  if (typeof window === 'undefined') return SEED_GOALS;
  try {
    const raw = localStorage.getItem(GOALS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(SEED_GOALS));
      return SEED_GOALS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_GOALS;
  }
}

function saveLocalGoals(goals: Goal[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
    window.dispatchEvent(new Event('lifeos-goals-updated'));
  } catch (e) {
    console.error('Failed to save goals:', e);
  }
}

export const goalService = {
  async getGoals(): Promise<Goal[]> {
    return getLocalGoals();
  },

  async createGoal(input: {
    title: string;
    category: Goal['category'];
    target_value?: string;
    next_action?: string;
  }): Promise<Goal> {
    const newGoal: Goal = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `goal-${Date.now()}`,
      title: input.title,
      category: input.category,
      target_value: input.target_value || 'Complete milestone',
      current_value: 'In progress',
      progress_percentage: 10,
      next_action: input.next_action,
      status: 'in_progress',
    };

    const current = getLocalGoals();
    const updated = [newGoal, ...current];
    saveLocalGoals(updated);
    return newGoal;
  },

  async updateProgress(id: string, progress_percentage: number): Promise<void> {
    const current = getLocalGoals();
    const updated = current.map((g) =>
      g.id === id ? { ...g, progress_percentage: Math.min(100, Math.max(0, progress_percentage)) } : g
    );
    saveLocalGoals(updated);
  },
};

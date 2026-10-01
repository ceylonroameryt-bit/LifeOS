import { Habit, HabitType, SlipTrigger } from '@/types';
import { SEED_HABITS } from '@/lib/data/seedData';

const HABITS_STORAGE_KEY = 'lifeos_habits_store';

function getLocalHabits(): Habit[] {
  if (typeof window === 'undefined') return SEED_HABITS;
  try {
    const raw = localStorage.getItem(HABITS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(SEED_HABITS));
      return SEED_HABITS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_HABITS;
  }
}

function saveLocalHabits(habits: Habit[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
    window.dispatchEvent(new Event('lifeos-habits-updated'));
  } catch (e) {
    console.error('Failed to save habits:', e);
  }
}

export const habitService = {
  async getHabits(): Promise<Habit[]> {
    return getLocalHabits();
  },

  async createHabit(input: {
    name: string;
    type: HabitType;
    target?: string;
  }): Promise<Habit> {
    const newHabit: Habit = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `habit-${Date.now()}`,
      user_id: 'guest',
      name: input.name,
      type: input.type,
      target: input.target || (input.type === 'positive' ? '5 days / week' : 'Every day'),
      streak: 0,
      is_active: true,
      weekly_progress: input.type === 'positive' ? '0/5' : undefined,
      days_completed: input.type === 'positive' ? [false, false, false, false, false, false, false] : undefined,
    };

    const current = getLocalHabits();
    const updated = [newHabit, ...current];
    saveLocalHabits(updated);
    return newHabit;
  },

  async toggleDaySuccess(habitId: string, dayIndex: number): Promise<void> {
    const habits = getLocalHabits();
    const updated = habits.map((h) => {
      if (h.id !== habitId || h.type !== 'positive') return h;
      const days = [...(h.days_completed || [false, false, false, false, false, false, false])];
      days[dayIndex] = !days[dayIndex];
      const count = days.filter(Boolean).length;
      return {
        ...h,
        days_completed: days,
        weekly_progress: `${count}/5`,
        streak: days[dayIndex] ? h.streak + 1 : Math.max(0, h.streak - 1),
      };
    });
    saveLocalHabits(updated);
  },

  async recordResisted(habitId: string): Promise<void> {
    const habits = getLocalHabits();
    const updated = habits.map((h) => {
      if (h.id !== habitId) return h;
      return {
        ...h,
        streak: h.streak + 1,
      };
    });
    saveLocalHabits(updated);
  },

  async recordSlip(habitId: string, trigger: SlipTrigger, notes?: string): Promise<void> {
    const habits = getLocalHabits();
    const updated = habits.map((h) => {
      if (h.id !== habitId) return h;
      return {
        ...h,
        streak: 0,
        slip_count: (h.slip_count || 0) + 1,
        common_trigger: trigger,
      };
    });
    saveLocalHabits(updated);
  },
};
